// Function composition utilities

// Composed function will run provided filter (with same arguments as original) and only call the original function if the filter returns true.
Function.prototype.filter = function(filter) {
  var __original = this;
  return function() {
    if(filter.apply(this, arguments)) return __original.apply(this, arguments)
  }
}

Function.prototype.before = function(runBefore) {
  var __original = this;
  return function() {
    runBefore.apply(this, arguments)
    return __original.apply(this, arguments)
  }
}

Function.prototype.after = function(runAfter){
  var __original = this;
  return function() {
    var returning = __original.apply(this, arguments)
    runAfter.apply(this, arguments)
    return returning;
  }
  
}
// Reverse of methodize
Function.prototype.functionize = Function.prototype.functionize || function() {
  if (this._functionized) return this._functionized;
  var __method = this;
  return this._functionized = function() {
    var args = $A(arguments);
    return __method.apply(args.shift(), args);
  };
};



/*
Argument Re-mapping
  A handy-dandy system for creating a copy of a function with a different call-signature.

Examples:
  fn.argMap($3,$2,$1)
    Create's a new function, just like fn, but that can be passed it's arguments in reverse order!
  
  fn.argMap($3,$1, $4)
    ... or any other order, skipping some arguments completely!
  
  fn.argMap($1, "foo", $2, {answer:42})
    You can even bind arguments at any position, like in currying.
  
  fn.argMap($1.invoke("element"))
    Invoke a function on an argument before passing it on - handy for re-using funcitons as event handlers with little fuss!
  
  fn.argMap($1.invoke("element").pluck("tagName").invoke("toUpperCase"))
    You can also use pluck (passes the property directly instead of trying to invoke it as a function) and chain several plucks and invokes as needed.
  
  fn.argMap("blah", $iterator)
    This is identical to calling fn.argMap.curry("blah").curry (note lack of call-parens at the end!)
    It is very handy for re-using functions as iterators.
*/ 

var ArgumentPlaceholder = Class.create({
  initialize: function(index) { 
    this.index = index
  },
  mappedArg: function(args) {
    return args[this.index]
  },
  _extend: function(processor, processorArgs) {
    var copy = new this.constructor(this.index)
    var __mappedArg = this.mappedArg
    copy.mappedArg = function(args) {
      return processor.apply(this, [__mappedArg.call(this, args)].concat(processorArgs))
    }
    return copy;
  }
})
 
ArgumentProcessors = {
  invoke: function(argVal, method) {
    return argVal[method].apply(argVal, $A(arguments).slice(2))
  },
  pluck: function(argVal, property) {
    return argVal[property]
  }
}

for( m in ArgumentProcessors) {
  ArgumentPlaceholder.prototype[m] = function(processor) {
    return this._extend(processor, $A(arguments).slice(1));
  }.curry(ArgumentProcessors[m])
}

$R(1,9).each(function(index){
  window["$"+index] = new ArgumentPlaceholder(index - 1)
})

$iterator = new ArgumentPlaceholder
$iterator.withVal = function(value) {
  var copy = new ArgumentPlaceholder
  copy.mappedArg = function(){return value}
  return copy;
}

Function.prototype.argMap = function() {
  var __original = this; var __argPlaceholders = $A(arguments)
  var i =__argPlaceholders.indexOf($iterator)
  var iterator = function(placeholder) {
    return (placeholder.mappedArg && placeholder.mappedArg(this) ) || placeholder
  }
  var mappedFn = function() { 
    return __original.apply(this, __argPlaceholders.collect(iterator, arguments))
  }
  if(i>=0) {
    return function(itVal) {
      __argPlaceholders[i] = __argPlaceholders[i].withVal(itVal)
      return mappedFn;
    }
  } else {
    return mappedFn; 
  }
}


/*
Collection of elements - some of which may not yet exist.
*/

var SelectedElements = Class.create({
  initialize: function() {
    this.elements = [];
    this.selectors = [];
    $A(arguments).each(this._add,this);
  },
  _add: function(elementsOrSelector) {
    if( Object.isArray(elementsOrSelector))   elementsOrSelector.each(this._add, this);
    if( Object.isElement(elementsOrSelector)) this.elements.push(elementsOrSelector);
    if( Object.isString(elementsOrSelector))  this.selectors.push(elementsOrSelector)
  },
  observe: function(event) {
    var callbacks = $A(arguments).slice(1);
    // callbacks[0] = callbacks[0].before(this.initializer)
    callbacks.each(function(callback){
      this.elements.invoke("observe", event, callback)
      this.selectors.collect(Element.match.argMap($1.invoke('element'),$iterator), Element.match)  // -> filtering functions 
                    .collect(callback.filter, callback) // -> filtered callback functions
                    .each(document.observe.curry(event))
      
    },this)
    return this;

  },
  initWith: function(ev){
    var el = ev.element();
    console.log('init!',this, ev, el, arguments)
  }
})

function $S() {
  return (new SelectedElements($A(arguments)))
}