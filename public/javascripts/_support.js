// Support libs particular to trails

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
  }
});

String.prototype.TitleCase = function() {
  return ("-"+this.dasherize()).camelize();
}
String.prototype.camelCase = function() {
  return this.dasherize().camelize();
}

Controllers = {}
/* Defineds an element controller. e.g.
      controller('task', {methods}, {more methods}, ...)
   creates the class Task, and the find-or-create-by-id-constructor task(id)

   - When using the constructor, instances will have their IDs already set.
   - All instances also have a property .className (in this case "task") which can be used for reflection.
   - {methods} works the same as Class.create(), only exception being that you can add as many as you'd like
   - all controllers will inherit from the class Controller
*/
function controller(className, method_hashes_) {
  var constantName = className.TitleCase();
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
// You can pass severeral +_method_+s to specify a call chain path from the constructor.
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

// e.g. ajaxActions(foo), generates .foo(opts) and .afterFoo(opts)
// which initially defer to .ajaxAction('foo',opts) and .afterAjaxAction('foo', opts)
// respectively
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

// e.g. autoBuildChild('location')
// Builds a method .location() that will return a new Location() object
// the first time it's called, and then cache it for subsequent calls (it will be cached)
// Can generate any number of child names.
//
// Arguments can also be a pair where the first value is the attribute name and the second
// value is a class that can't be inferred from the attrib name.
// e.g. autoBuildChild("location", ["employee",Person])
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
    methods[childAttribName.camelCase()] = function() {
      var cachedName = "_"+childAttribName;
      childAttribClass = childAttribClass || window[childAttribName.TitleCase()];
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
