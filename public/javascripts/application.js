//===== [ DISABLE TEXT SELECT ] =====
if(/MSIE/.test(navigator.userAgent)) {
  document.onselectstart = function(event) {
    if(!/input|textarea/i.test(Event.element(event).tagName))
      return false;
  };
  } else { // assume DOM
  document.onmousedown = function(event) {
    if(!/input|textarea/i.test(Event.element(event).tagName))
      return false;
  };
}
//===== [ /DISABLE ] =====


Element.addMethods({
  recordID: function(element) {
    do {
      element = element.parentNode;
    } while(!element.id && !element.href)
    
    
    if(element.id) {
      var match = element.id.match(/\d+/);
      if(!match) return "new";
      return  parseInt(match[0]);
    }
    
    if(element.href) return  parseInt(element.href.match(/\d+/).last());
  },
  fadeDelete: function(element) { //fades element, then deletes it
  	element.fade({afterFinish:function(){
		element.remove();
	}});
  }
});

/* Defineds an element controller. e.g. 
      controller('task', {methods}, {more methods}, ...) 
   creates the class Task, and the find-or-create-by-id-constructor task(id)
   
   - When using the constructor, instances will have their IDs already set.
   - All instances also have a property .className (in this case "task") which can be used for reflection.
   - {methods} works the same as Class.create(), only exception being that you can add as many as you'd like
   - all controllers will inherit from the class Controller
*/
function controller(className, method_hashes_) {
  var constantName = ("-"+className.dasherize()).camelize();
  var klass = window[constantName] = Class.create(Controller)
  klass.prototype.className = className;
  klass.cache = {};
  window[className] = function(id) {
    var instance = klass.cache[id];
    if (!instance) {
      instance = new klass();
      instance.id = id;
      klass.cache[id] = instance;
    }
    return instance;
  }
  
  $A(arguments).slice(1).each(function(methods){
    klass.addMethods(methods);
  })
}

// Hook up as an event observer.
// Only fires on left clicks.
// Will stop the event and delegate it to the +constructor+'s +_event_handler_+
// (already instantiated with the apropriate record ID set)
// You can pass severeral +_method_+s to specify a call chain path from the constructor
function action(constructor, _methods_, _event_handler_) {
  var methods = $A(arguments).slice(1);
  var eventHandlerName = methods.pop();
  return function(event) {
    if (event.stopped) return;
    if (event.isLeftClick()) {
      event.stop();
      var callObj = constructor(event.element().recordID())
      methods.each(function(method){
        if (Object.isFunction(callObj[method]) ){
          callObj = callObj[method]();
        } else {
          callObj = callObj[method];
        }
      })
      callObj[eventHandlerName](event);
    }
  }
}

// Method gen macros

function ajaxActions(_actions_) {
  var methods = {}
  $A(arguments).each(function(methodName){
    methods[methodName] = function(options) {
      return this.ajaxAction(methodName, options);
    }
    methods["after"+methodName.capitalize()] = function(transport) {
      return this.afterAjaxAction(methodName, transport);
    }
  })
  return methods;
}


function autoBuildChild(_names_) {
  var methods = {}
  $A(arguments).each(function(childAttrib){
    var childAttribName, childAttribClass;
    if(Object.isArray(childAttrib)) {
      childAttribName = childAttrib[0];
      childAttribClass = childAttrib[1];
    } else {
      childAttribName = childAttrib;
    }
    methods[childAttribName] = function() {
      var cachedName = "_"+childAttribName;
      childAttribClass = childAttribClass || window[("-"+childAttribName.dasherize()).camelize()];
      if(!this[cachedName]) {
        this[cachedName] = new childAttribClass();
        this[cachedName][this.className] = this;
      }
      return this[cachedName]
    }
  })
  return methods;
}



var Controller = Class.create({
  element: function() {
    return $(this.className+"_"+this.id);
  },
  baseURL: function() {
    return "/" + this.className + "s/"
  },
  url: function() {
    return this.baseURL() + this.id + "/"
  },
  ajaxAction: function(name, options){
    var ajaxOptions = {
      onSuccess:this["after"+name.capitalize()].bind(this)
    }
    if(options) Object.extend(ajaxOptions, options);
    return new Ajax.Request(this.url(),ajaxOptions);
  },
  afterAjaxAction: function(name, transport){
    this.element().replace(transport.responseText);
  }
})


controller("task",
  autoBuildChild("actions", "task_form"),
  {
    edit: function() {
      this.element().hide();
      this.task_form().show();
    },
    remove: function(){
      this.ajaxAction("remove",{method:"delete"});
    },
    afterRemove: function(name, transport) {
      this.element().fadeDelete();
    },
    taskContainer: function(){
  	  //LI task_container
	  return $("task_container_" + this.id);
    },
	taskList: function(){
		var elem = this.element().up(".list_container");
		return task_list(strip_id(elem));
	},
	durationBar: function(){
		return this.element().down(".duration_bar");
	},
	earnings: function(){
		return this.element().down(".earnings");
	},
	duration: function(){
		return this.element().down(".duration");
	}
  }
)

function strip_id(element){
	//some_element_12 => 12
	var full_id = element.id;
	var idx = full_id.lastIndexOf("_");
	return full_id.substring(idx+1);
}

$S(".task .toolbar .edit").observe("click", action(task, "edit"))
$S(".task .toolbar .delete").observe("click", action(task, "remove"))

controller("actions", 
  ajaxActions("start", "stop", "complete", "reopen"),
  {
    afterComplete: function(transport) {
	  /*
      //apparently, this piece of code tries to insert the closed task at the proper index. 
	  //for the sake of simplicity, I think it is better to just 
	  //append it to the bottom of the list and let the user move it around.
	  var nexts = [this.task.element().next(".total"),this.task.element().next(".complete.task")].compact().pluck("rowIndex");
      var targetRowIndex = Math.min.apply(Math,nexts)-1;
      this.task.element().remove();
      var newRow = $("task_lists").insertRow(targetRowIndex);
      $(newRow).replace(transport.responseText);
	  */
	  var task_list = this.task.taskList()
	  var listContainer = task_list.listContainer();
	  this.task.taskContainer().remove();
	  listContainer.insert({bottom: transport.responseText});
	  this.task.taskContainer().highlight();
    },
    afterReopen: function (transport) {
	  /*
	  //apparently, this piece of code tries to insert the reopened task at the proper index. 
	  //for the sake of simplicity, I think it is better to just 
	  //insert it at the top of the list and let the user move it around.
      
	  var prevs = [this.task.element().previous(".task_list"), this.task.element().previous(".stopped.task")].compact().pluck("rowIndex");
      var targetRowIndex = Math.max.apply(Math, prevs)+1;
      this.task.element().remove();
      var newRow = $("task_lists").insertRow(targetRowIndex);
      $(newRow).replace(transport.responseText);
      */
	  var task_list = this.task.taskList()
	  var listContainer = task_list.listContainer();
	  this.task.taskContainer().remove();
	  listContainer.insert({top: transport.responseText});
	  this.task.taskContainer().highlight();
	  //when a task is reOpened, it should be allowed to start moving again
	  initDragAndDrop();
    },
    url: function() {
      return this.task.url()+"actions";
    },
    ajaxAction: function($super, name) {
      return $super(name, {parameters:{"log_entry[action]":name}});
    },
    afterAjaxAction: function(name, transport) {
	  //call back for all actions (start, stop ...)
      this.task.taskContainer().update(transport.responseText);
	  //start 
    }
  }
)


$S(".start_task").observe("click", action(task,"actions","start"))
$S(".stop_task").observe("click", action(task,"actions","stop"))
$S("input.stopped_task").observe("click", action(task,"actions","complete"))
$S("input.complete_task").observe("click", action(task,"actions","reopen"))

//$S(".task.stopped *").observe("click", action(task,"actions","start"))
//$S(".task.active *").observe("click", action(task,"actions","stop"))


controller("task_list",
  autoBuildChild("task_form","task_list_form"),
  {
    setTaskSequence: function(seq){
	  var options = {
	  	method: "put",
		onSuccess:this["afterSetTaskSequence"].bind(this),
	  	parameters: { tasks: seq.toString() }
	  };
	  new Ajax.Request(this.url() + "setsequence", options);
	},
	listContainer: function(){
	  return $("task_list_container_" + this.id); 
	},
	edit: function() {
      this.element().hide();
      this.task_list_form().show();
    },
    remove: function(){
      this.ajaxAction("remove",{method:"delete"});
    },
    afterRemove: function(name, transport) {
		//remy: replaced remove() with fadeDelete() for consistency
      var oldElement, element = this.element();
	  //remove row spacer
      element.previous().fadeDelete();
      do {
        oldElement = element;
        element = element.next();
        oldElement.fadeDelete();
      } while(!element.match(".blank_list_footer"))
      element.fadeDelete();
    },
	afterSetTaskSequence: function(transport) {
		//update list earnings and duration after task_reordering
	  eval(transport.responseText);
    }
  }
)


$S(".new_task a").observe("click", action(task_list,"task_form", "show"))
$S(".task_list .toolbar .edit").observe("click", action(task_list, "edit"))
$S(".task_list .toolbar .delete").observe("click", action(task_list, "remove"))

controller("task_form",{
  show: function() {
    $A(this.element().getElementsByTagName("INPUT")).invoke("enable");
    this.element().show();
  },
  hide: function() {
    $A(this.element().getElementsByTagName("INPUT")).invoke("disable");
    this.element().hide();
    if(this.task) this.task.element().show();
  },
  onSuccess: function(transport) {
  	//call back method on update for Tasks
    var element = this.element();
	
	if(this.task){
	  //update existing task
	  var taskContainer = this.task.taskContainer();
	  taskContainer.update(transport.responseText);
	  taskContainer.highlight();
	}else{
	  //insert newly created task
	  var listContainer = this.task_list.listContainer();
	  listContainer.insert({top:transport.responseText});
      listContainer.firstChild.highlight();
	  initDragAndDrop();
	}
    if (this.task) {
		//no need to remove anymore. the content is just updated
	}
	else {
		//hide new_task_form
		this.hide();
	}
  },
  element: function() {
    if (this.task_list)
      return $("task_list_"+this.task_list.id+"_task_new");
    if (this.task)
      return $("edit_task_"+ this.task.id)
  }
})


$S(".new.task.form .submit a").observe("click", action(task_list,"task_form", "hide"))
$S(".edit.task.form .submit a").observe("click", action(task,"task_form", "hide"))



$S(".task.new .submit input[type=submit]").observe("click", function(event){
  var element = event.element();
  element.form.responder = task_list(element.recordID()).task_form()
})

$S(".task.edit .submit input[type=submit]").observe("click", function(event){
  var element = event.element();
  element.form.responder = task(element.recordID()).task_form()
})

controller("task_list_form",{
  show: function() {
    $A(this.element().getElementsByTagName("INPUT")).invoke("enable");
    this.element().show();
  },
  hide: function() {
    $A(this.element().getElementsByTagName("INPUT")).invoke("disable");
    this.element().hide();
    if(this.task_list) this.task_list.element().show();
  },
  onSuccess: function(transport) {
  	//call back method on update for Tasks_Lists
	//also handles task_list creation
    if(this.task_list) this.task_list.element().remove();
    var element = this.element();
    element.insert({after:transport.responseText})
    element.next(".task_list").highlight();
    if (this.task_list) 
		element.remove();
	else {
		this.hide();
		//new task list needs to e DnD enabled
		initDragAndDrop();
	}
  },
  element: function() {
    if (this.task_list)
      return $("edit_task_list_"+this.task_list.id);
    else
      return $("task_list_new");
  }
})



$S("#new_task_list").observe("click", action(task_list_form, "show"));
$S(".new.task_list.form .submit a").observe("click", action(task_list_form, "hide"));
$S(".edit.task_list.form .submit a").observe("click", action(task_list,"task_list_form", "hide"));


$S(".task_list.new .submit input[type=submit]").observe("click", function(event){
  var element = event.element();
  element.form.responder = task_list_form()
})

$S(".task_list.edit .submit input[type=submit]").observe("click", function(event){
  var element = event.element();
  element.form.responder = task_list(element.recordID()).task_list_form()
})



// HTML5

$S("input[type=submit][action]").observe("click", function(event){
  var element = event.element();
  element.form.overrideAction = element.readAttribute("action");
})

$S("input[type=submit][method]").observe("click", function(event){
  var element = event.element();
  element.form.overrideMthod = element.readAttribute("method");
})

function mainFormSubmitHandler(event) {
	
  event.stop();
  var options = {};
  // Setup before request
  if(this.overrideAction) {
    var defaultAction = this.action;
    this.action = this.overrideAction;
  }
  if(this.overrideMthod) {
    var defaultMethod = this.method;
    this.method = this.overrideMthod;
  }
  if(this.responder) {
    if(this.responder.onSuccess) options.onSuccess = this.responder.onSuccess.bind(this.responder)
  }
  
  
  // Perform request!
  this.request(options);

  // Clean up
  if(this.overrideAction) {
    this.action = defaultAction;
  }
  if(this.overrideMthod) {
    this.method = defaultMethod;
  }
  this.responder = null;
    
}

function updateTasksOrder(container){
	var task_list_id = container.identify().replace(/task_list_container_/gi, '');
	var tl = task_list(task_list_id);
	var seq = Sortable.sequence(container.identify());
	tl.setTaskSequence(seq);
	
	debug(task_list_id + " = > " +Sortable.sequence(container.identify()) + "\n");

}
function debug(string){
	$("debugger").innerHTML += string + "\n";
}

document.observe("dom:loaded", function(){
 
	$("task_form").observe("submit", mainFormSubmitHandler);
	initDragAndDrop();
	setInterval ( "updateACtiveTasks()", 10000 )
	setInterval ( "clockTick()", 500 )
	
})

function initDragAndDrop(){
	//This code will eventually need to be changed.
	//on some operations, only single lists need to be re-initialized
	
	//===== [ SORTABLES ] =====
	//get sortable_containers element by className
	$sortable_containers =  $$(".list_container");
	
	//get sortable_containers' ids
	$sortable_containers_ids = $sortable_containers.pluck("id");
	
	//make each container Sortable
	$sortable_containers_ids.each(function(s) {
		Sortable.create(s, { tag: 'li', dropOnEmpty: true, constraint: false, onUpdate: updateTasksOrder , containment: $sortable_containers_ids });
	});
}
function updateACtiveTasks(){
	if($$(".active").length<=0)
		return;
	 var options = {
	  	method: "put",
		onSuccess:this["updateACtiveTasks_callback"].bind(this)
	  };
	  new Ajax.Request("/task_lists/refreshactivetasks", options);
}

function updateACtiveTasks_callback(transport){
	
	//read json response
	var json = transport.responseText.evalJSON();
	for(var i=0; i<json.length;i++){
		var id = json[i].id;
		var t = task(id);
		t.earnings().update(json[i].task_earnings);
		t.duration().update(json[i].task_duration);
		t.durationBar().replace(json[i].task_duration_bar);
		t.durationBar().highlight();
	}
}

function clockTick(){
	var c;
	$active_tasks =  $$(".active");
	$active_tasks.each(function(taskElem) {
	  t = task(strip_id(taskElem));
	  c = null;
	  c = t.duration().down(".colon");
	  if(c!=null)
	    c.toggleClassName("colonTick");
	});
}



if(Prototype.Browser.Gecko)
  $S("input").observe("keypress", function(event){
    if(event.keyCode == Event.KEY_RETURN)
      //TODO: fire click ??
      mainFormSubmitHandler.call(event.element().form,event)
  })

