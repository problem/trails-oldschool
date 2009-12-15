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
//gitTest

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
	  this.task_form().show();
      this.element().hide();
	  this.getSlider().setValue(0, 0);
	  this.getSlider().setValue(0, 1);
    },
    remove: function(){
      var response = confirm("Are you sure you want to delete task?");
      if(response) {
        this.ajaxAction("remove",{method:"delete"});
        console.log("Task removed!");
      } else {
        console.log("removing canceled.");
      }
    },
    afterRemove: function(name, transport) {
	  ///remove whole container instead of single task element
      //this.element().fadeDelete();
	  var tContainer = this.taskContainer();
	  var tList = this.taskList();
	  tContainer.fade({afterFinish: function(){
	  	tContainer.remove();
		tList.checkIfTotalNeeded();
	  }});
	  
    },
	initSlider: function(){
		this.slider = new Control.Slider( $('track_'+this.id).select(".slider_handle"), 'track_'+this.id, {
	  	range: $R(-60,60),
		sliderValue: [0.03,0.03],
		myId: this.id,
		onSlide: function(values){
			
			var hours = values[0];
			var mins = Math.floor(values[1]);
			if (hours) {
				hours /= 10;
			}
			var diffTime = $("diffTime_"+this.myId);
			var diffTimeInput = $("diffTime_input_"+this.myId);
			total = Math.floor(hours)*60  + mins; 
			
			diffTime.innerHTML = formattedTime(total);
			diffTimeInput.value=total;
		}
	  });
	},
	getSlider: function(){
		return this.slider;
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
	  this.task.initSlider();
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
	  this.task.initSlider();
    }
  }
)


// Show/hide task_list
Event.observe(window, 'load', function() {
  $$("th.title").each(function(element) {element.insert(" <small>-</small>")});
});

$S('th.title').observe('click', function(event) {
  var currentTh = $(Event.element(event));
  trTitleId = currentTh.up().identify();
  currentList = $(trTitleId).next(2);
  currentTotal = currentTh.up().next('.total');
  currentTitleTr = currentTh.up();
  currentEarnings = currentTotal.down('.earnings').innerHTML;
  currentDuration = currentTotal.down('.duration').innerHTML;
  newTaskLink = currentTitleTr.down(('.new_task')).innerHTML;
  addTotalTo = currentTitleTr.down(('.new_task'));
  currentList.toggle();
  if(currentList.visible()) {
      $(currentTh).down().update("-");
      addTotalTo.down('span').remove();
      currentTotal.show();
  } else {
      $(currentTh).down().update("+");
      addTotalTo.update('<span>' + currentEarnings + ' ' + currentDuration + '</span> ' + newTaskLink);
      currentTotal.hide();
  }
});


$S(".task").observe("foo:bar",function(evt){
	//alert(strip_id(  evt.element()));
	}  );

// Need to improve this simple functions
$S(".start_task").observe("click", function(){
    document.title = "*Trails";
});

$S(".stop_task").observe("click", function(){
    document.title = "Trails";
});

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
	  this.task_list_form().show();
	  this.element().hide();
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
    },
	earnings: function(){
		return $("task_list_earnings_" + this.id);  
	},
	duration: function(){
		return $("task_list_duration_" + this.id);  
	},
	numTasks: function(){
		return this.listContainer().childNodes.length;
	},
	hideTotal: function(){
		this.total().hide();
	},
	showTotal: function(){
		this.total().show();
	},
	total: function(){
		return $("total_" + this.id); 
	},
	checkIfTotalNeeded: function(){
		var n = this.numTasks();
		if(n < 2){
			this.hideTotal();
		}else{
			this.showTotal();
		}
	}
  }
)


$S(".new_task a").observe("click", action(task_list,"task_form", "show"))
$S(".task_list .toolbar .edit").observe("click", action(task_list, "edit"))
$S(".task_list .toolbar .delete").observe("click", action(task_list, "remove"))


controller("task_form",{
  show: function() {
  	hideTaskForms();
    $A(this.element().getElementsByTagName("INPUT")).invoke("enable");
    this.element().show();
	
	//focus on title input when form appears
	var title_input = this.element().down(".task_title").down("input");
	if(!this.task){
		//if this is not an existing task, reset input value.
		title_input.value=""; 
		var slider_row = this.element().down(".slider_row");
		slider_row.display = "none";
	}
	title_input.focus();
	title_input.select();
  },
  hide: function() {
  	var elem = this.element();
    $A(elem.getElementsByTagName("INPUT")).invoke("disable");
    elem.hide();
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
	  this.task.initSlider();
	}else{
	  //insert newly created task
	  var listContainer = this.task_list.listContainer();
	  listContainer.insert({top:transport.responseText});
      var newTask = listContainer.firstChild;
	  newTask.highlight();
	  
	  
	  
	  //the content of the list has changed so we need to re-init
	  initDragAndDrop();
	  this.task_list.checkIfTotalNeeded();
	}
    if (this.task) {
		//no need to remove anymore. the content is just updated
	}
	else {
		//get new task id
		var newTaskId = strip_id(newTask);
		task(newTaskId).initSlider();
		  
		//hide new_task_form
		this.hide();
	}
  },
  element: function() {
    if (this.task_list)
      return $("task_list_"+this.task_list.id+"_task_new");
    if (this.task)
      return $("edit_task_"+ this.task.id);
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
  	hideTaskForms();
    $A(this.element().getElementsByTagName("INPUT")).invoke("enable");
    this.element().show();
	var titleInput = this.element().down(".title").down("input");
	titleInput.value = "";
	titleInput.focus();
	titleInput.select();
  },
  hide: function() {
    $A(this.element().getElementsByTagName("INPUT")).invoke("disable");
    this.element().hide();
    if(this.task_list){
		this.task_list.element().show();
	} 
  },
  onSuccess: function(transport) {
  	//call back method on update for Tasks_Lists
	//also handles task_list creation
    if(this.task_list) this.task_list.element().remove();
    var element = this.element();
	
    element.insert({after:transport.responseText})
    var tList = element.next(".task_list");
	tList.highlight();
	
	//get newly created TaskList's Id
	var newId = strip_id(tList);
	
    if (this.task_list) 
		element.remove();
	else {
		this.hide();
		//new task list needs to be DnD enabled
		initDragAndDrop();
		//new list needs to hide total
		task_list(newId).checkIfTotalNeeded();
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
}

function debug(string){
	$("debugger").innerHTML += string + "\n";
}

document.observe("dom:loaded", function(){
 
	$("task_form").observe("submit", mainFormSubmitHandler);
	initDragAndDrop();
	initSliders();
	setInterval ( "updateACtiveTasks()", 10000 );
	
	//Initialize clockTicking
	$showTick = false;
	setInterval ( "clockTick()", 500 );
	
	//check if totals need to be shown for each list
	toggleTotals();
})


function initSliders(){
	
	//get slider tracks' ids
	$slider_track_elements = $$(".slider_track");
	$slider_track_elements.each(function(s) {
	  id = strip_id(s);
	  if (id != "") {
	  	currentTask = task(id);
	  	currentTask.initSlider();
	  }
	});
}

function formattedTime(t){
	var res = "";
	if(total<0){
		res ="-";
	}else{
		res = "+";
	}
	var mins = Math.abs(t%60);
	if(mins <10){
		mins = "0"+mins;
	}
	res += Math.floor(Math.abs(t/60)) + ":" + mins;
	return res;
}

function toggleTotals(){
	$sortable_containers =  $$(".list_container");
	$sortable_containers.each(function(s) {
		var l = task_list(strip_id(s));
		l.checkIfTotalNeeded()
	});
}

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
		Sortable.create(s, { tag: 'li', dropOnEmpty: true, handle: "taskhandle", constraint: false, onUpdate: updateTasksOrder , containment: $sortable_containers_ids });
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
	var jsonTaskLists = json.tasklists.evalJSON();
	var jsonTasks = json.tasks.evalJSON();
	//update tasks
	for(var i=0; i<jsonTasks.length;i++){
		var id = jsonTasks[i].id;
		var t = task(id);
		t.earnings().update(jsonTasks[i].task_earnings);
		t.duration().update(jsonTasks[i].task_duration);
		t.durationBar().replace(jsonTasks[i].task_duration_bar);
		t.durationBar().highlight();
	}
	//update taskLists
	for(var i=0; i<jsonTaskLists.length;i++){
		var id = jsonTaskLists[i].id;
		var l = task_list(id);
		l.earnings().update(jsonTaskLists[i].task_list_earnings);
		l.duration().update(jsonTaskLists[i].task_list_duration);
	}
	
	//update grand total
	$("grand_total_earnings").update(json.total_earnings);
	$("grand_total_duration").update(json.total_duration);
}

//this method called every 1000ms to show/hide clock colons.
function clockTick(){
	var c;
	var showColon = toggleTick();
	$active_tasks =  $$(".active");
	$active_tasks.each(function(taskElem) {
	  t = task(strip_id(taskElem));
	  c = t.duration().down(".colon");
	  if (c != null) {
	  	if(showColon)
			c.addClassName("colonTick");
		else
			c.removeClassName("colonTick");
	  }
	});
}

function toggleTick(){
	if($showTick)
		$showTick = false;
	else
		$showTick = true;
	return $showTick;
}

function hideTaskForms(){
	//lists (task_form + task_list_form)
	$lists =  $$(".list_container");
	$lists.each(function(s) {
		var tl = task_list(strip_id(s));
		tl.task_form().hide();
		tl.task_list_form().hide();
	});
	
  
  
  //tasks (task_form)
  $tasks = $$(".task_container");
  $tasks.each(function(s) {
		var t = task(strip_id(s));
		t.task_form().hide();
	});
  //task_list_Create
  var taskListCreator = $("task_list_new");
  taskListCreator.hide();
  $A(taskListCreator.getElementsByTagName("INPUT")).invoke("disable");
}


if(Prototype.Browser.Gecko)
  $S("input").observe("keypress", function(event){
    if(event.keyCode == Event.KEY_RETURN)
      //TODO: fire click ??
      mainFormSubmitHandler.call(event.element().form,event)
  })

