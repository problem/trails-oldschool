var Task = Class.create({
  start: function() {
    this._sendAction("start");
  },
  afterStart: function(transport) {
    this.element().replace(transport.responseText);    
  },
  stop: function() {
    this._sendAction("stop");
  },
  afterStop: function(transport) {
    this.element().replace(transport.responseText);
  },
  complete: function() {
    this._sendAction("complete")
  },
  afterComplete: function(transport) {
    var nexts = [this.element().next(".total"),this.element().next(".complete.task")].compact().pluck("rowIndex");
    var targetRowIndex = Math.min.apply(Math,nexts)-1;
    this.element().remove();
    var newRow = $("task_lists").insertRow(targetRowIndex);
    $(newRow).replace(transport.responseText);
  },
  reopen: function() {
    this._sendAction("reopen")
  },
  afterReopen: function (transport) {
    var prevs = [this.element().previous(".task_list"), this.element().previous(".stopped.task")].compact().pluck("rowIndex");
    var targetRowIndex = Math.max.apply(Math, prevs)+1;
    this.element().remove();
    var newRow = $("task_lists").insertRow(targetRowIndex);
    $(newRow).replace(transport.responseText);
  },
  element: function() {
    return $("task_"+this.id);
  },
  _sendAction: function(action) {
    new Ajax.Request("/tasks/"+this.id+"/actions",{
      parameters:{"log_entry[action]":action},
      onSuccess:this["after"+action.capitalize()].bind(this)
    })
  }
  
});

Task.cache = {};

function task(id) {
  var newTask = Task.cache[id];
  if (!newTask) {
    newTask = new Task();
    newTask.id = id;
    Task.cache[id] = newTask; 
  }
  return newTask;
}

function action(constructor, method) {
  return function(event) {
    if (event.isLeftClick()) {
      event.stop();
      constructor(parseInt(event.element().id.match(/\d+/)[0]))[method]();
    }
  }
}

$S(".start_task").observe("click", action(task,"start"))
$S(".stop_task").observe("click", action(task,"stop"))
$S("input.stopped_task").observe("click", action(task,"complete"))
$S("input.complete_task").observe("click", action(task,"reopen"))