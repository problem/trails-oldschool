controller("task_lists",
  autoBuildChild("task_list_form"),
  {
    newTaskList: function() {
      this.taskListForm().show();
    }
  }
)

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
    if(this.task_list) this.task_list.element().remove();
    var element = this.element();
    element.insert({after:transport.responseText})
    var highlight = element.next();
    if(!this.task_list) highlight = highlight.next();
    highlight.highlight();
    if(this.task_list) element.remove();
    else this.hide();
  }
})



// $S("#new_task_list").observe("click", action(task_list_form, "show"));
// $S(".new.task_list.form .submit a").observe("click", action(task_list_form, "hide"));
// $S(".edit.task_list.form .submit a").observe("click", action(task_list,"task_list_form", "hide"));


controller("task_list",
  autoBuildChild("task_form","task_list_form"),
  {
    newTask: function() {
      this.taskForm().show();
    },
    edit: function() {
      this.element().hide();
      this.task_list_form().show();
    },
    remove: function(){
      this.ajaxAction("remove",{method:"delete"});
    },
    afterRemove: function(name, transport) {
      var oldElement, element = this.element();
      element.previous().remove();
      do {
        oldElement = element;
        element = element.next();
        oldElement.remove();
      } while(!element.match(".total"))
      element.remove();
    }
  }
)


// $S(".new_task a").observe("click", action(task_list,"task_form", "show"))
// $S(".task_list .toolbar .edit").observe("click", action(task_list, "edit"))
// $S(".task_list .toolbar .delete").observe("click", action(task_list, "remove"))

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
      this.element().fade({afterFinish:function(animation){
        animation.element.remove();
      }});
    }
  }
)

// $S(".task .toolbar .edit").observe("click", action(task, "edit"))
// $S(".task .toolbar .delete").observe("click", action(task, "remove"))

controller("actions",
  ajaxActions("start", "stop", "complete", "reopen"),
  {
    afterComplete: function(transport) {
      var nexts = [this.task.element().next(".total"),this.task.element().next(".complete.task")].compact().pluck("rowIndex");
      var targetRowIndex = Math.min.apply(Math,nexts)-1;
      this.task.element().remove();
      var newRow = $("task_lists").insertRow(targetRowIndex);
      $(newRow).replace(transport.responseText);
    },
    afterReopen: function (transport) {
      var prevs = [this.task.element().previous(".task_list"), this.task.element().previous(".stopped.task")].compact().pluck("rowIndex");
      var targetRowIndex = Math.max.apply(Math, prevs)+1;
      this.task.element().remove();
      var newRow = $("task_lists").insertRow(targetRowIndex);
      $(newRow).replace(transport.responseText);
    },
    url: function() {
      return this.task.url()+"actions";
    },
    ajaxAction: function($super, name) {
      return $super(name, {parameters:{"log_entry[action]":name}});
    },
    afterAjaxAction: function(name, transport) {
      this.task.element().replace(transport.responseText);
    }

  }
)


// $S(".start_task").observe("click", action(task,"actions","start"))
// $S(".stop_task").observe("click", action(task,"actions","stop"))
// $S("input.stopped_task").observe("click", action(task,"actions","complete"))
// $S("input.complete_task").observe("click", action(task,"actions","reopen"))
//
// $S(".task.stopped *").observe("click", action(task,"actions","start"))
// $S(".task.active *").observe("click", action(task,"actions","stop"))




controller("task_form",{
  show: function() {
    console.log(this, this.elementID())
    $A(this.element().getElementsByTagName("INPUT")).invoke("enable");
    this.element().show();
  },
  hide: function() {
    $A(this.element().getElementsByTagName("INPUT")).invoke("disable");
    this.element().hide();
    if(this.task) this.task.element().show();
  },
  onSuccess: function(transport) {
    if(this.task) this.task.element().remove();
    var element = this.element();
    element.insert({after:transport.responseText})
    element.next().highlight();
    if(this.task) element.remove();
    else this.hide();
  },
  newElementID: function($super) {
    return this.task_list.elementID() + "_" + $super();
  },
})


// $S(".new.task.form .submit a").observe("click", action(task_list,"task_form", "hide"))
// $S(".edit.task.form .submit a").observe("click", action(task,"task_form", "hide"))



// $S(".task.new .submit input[type=submit]").observe("click", function(event){
//   var element = event.element();
//   element.form.responder = task_list(element.recordID()).task_form()
// })
//
// $S(".task.edit .submit input[type=submit]").observe("click", function(event){
//   var element = event.element();
//   element.form.responder = task(element.recordID()).task_form()
// })



// $S(".task_list.new .submit input[type=submit]").observe("click", function(event){
//   var element = event.element();
//   element.form.responder = task_list_form()
// })

// $S(".task_list.edit .submit input[type=submit]").observe("click", function(event){
//   var element = event.element();
//   element.form.responder = task_list(element.recordID()).task_list_form()
// })


var GlobalHandlers = {
  submit: function (event) {
    event.stop();
    var form = GlobalHandlers.formSource.up(".form");
    form.serialize = Form.serialize.methodize();
    form.method = form.readAttribute("method");
    var controller = form.controller();
    var options = {};
    ["Success", "Failure", "Complete", "Exception"].each(function(callbackName){
      if( controller["on"+callbackName] ) options["on"+callbackName] = controller["on"+callbackName].bind(controller);
    });
    Form.request(form, options);
  },
  action: function(event) {
    if((event.type == "click" && !event.isLeftClick()) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.keyCode < 32 ) return;
    event.stop();
    var element = event.element();
    var controller = element.controller();
    var commandName = element.className.match(/([^ ]+) command/)[1];
    controller[commandName.camelCase()](event);
  },
  prepForm: function(event) {
    GlobalHandlers.formSource = event.element();
  }
}


document.observe("dom:loaded", function(){
  var task_form = $("task_form");
  if(task_form) task_form.observe("submit", GlobalHandlers.submit)
});
$S("#task_form .command").observe("click", GlobalHandlers.action);
$S("#task_form .command").observe("keydown", GlobalHandlers.action);

$S("#task_form input").observe("click", GlobalHandlers.prepForm);
$S("#task_form input").observe("keydown", GlobalHandlers.prepForm);
