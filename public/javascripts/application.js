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