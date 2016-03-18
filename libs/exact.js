/**
 * @overview  ExactJS - A JavaScript Library for Building Web Application. Hard dependent on jQuery 2+, ECMAScript 5+, HTML5.
 * @copyright Copyright 2015 Chen Junyong. All rights reserved.
 * @license   Licensed under MIT license
 * @version   0.0.2
 */

/**
 * @global
 * @namespace
 * @requires jQuery(>=2.0.0)
 */
var Exact = Exact || { version:"0.0.2" };

/*var exact = exact || { version:"0.0.2",

  base: {},

  core: {

    bindings: {},

    commands: {},

    controls: {},

    models: {}

  },

  global: {}

};*/



( function () {
  /**
   * sniff, 嗅探jQuery
   */
  var jQuery = window.jQuery || null;

  if ( jQuery ) {

    Exact.Skin = jQuery;

    Exact.proxy = jQuery.proxy;

  } else if ( jQuick ) {
    Exact.Skin = jQuick;
  } else {

    console.error( "There is no valid Skin. Exact won't work!" );

  }

} )();
//##############################################################################
// src/util/IdUtil.js
//##############################################################################
(function() {
  'use strict';
  /**
   * 提供全局唯一id,TODO: 合并到ObjectUtil?
   */
  var ids = {};

  Exact.IdUtil = {
    autoIncreaseId: function(prefix) {
      if (!prefix) { prefix = '(unknown)'; }//(anonymous function)
      if (!(prefix in ids)) { ids[prefix] = 0; }
      return prefix + (ids[prefix]++);
    }
  };
})();

//##############################################################################
// src/util/ObjectUtil.js
//##############################################################################
(function() {
  'use strict';
  /**
   * Provide some methods to define and find property.
   */

  var TILDE = '~';

  Exact.ObjectUtil = {
    keys: Object.keys,
    create: Object.create,
    defineProp: Object.defineProperty,
    getDescriptor: Object.getOwnPropertyDescriptor,

    /**
     * 将源对象上的属性赋给目标
     *
     * @param {Object|Function} target
     * @returns {Object|Function}
     */
    assign: /*Object.assign || */function(target/*,..sources*/) {
      if (typeof target !== "object" && typeof target !== "function") {
        throw new TypeError("target must be object or function");
      }

      var source, prop, i, len = arguments.length;

      for (i = 1; i < len; ++i) {
        source = arguments[i];
        if (!source) { continue; }
        for (prop in source) {
          if (source.hasOwnProperty(prop)) {
            this.defineProp(target, prop, this.getDescriptor(source, prop));
          }
        }
      }

      return target;
    },

    /*addProps: function(prototype, props) { // TODO: 如果只定义了get或set，应当继承set或get
      //prototype['_props'] = Exact.ObjectUtil.assign({}, prototype['_props'], props);
      var key, descriptor;

      for (key in props) {

        if (props.hasOwnProperty(key)) {

          descriptor = this.getDescriptor(props, key);

          this.defineProp(prototype, key, props[key], descriptor);

        }

      }

    },*/

    /**
     * 在原型上定义特性，可通知特性值的改变。注意，_attr被自动占用。
     */
    /*defineAttr: function (prototype, attr*//*, invisible*//*) {

      var _attr = '_' + attr;

      this.defineProp(prototype, attr, {

        get: function () {

          return this[_attr];

        },

        set: function (value) {

          if (this[_attr] === value) { // 忽略无意义的赋值

            return;

          }

          this[_attr] = value;
          //this.invalidate(attr, invisible);
          this.notify(attr*//*, { 'invisible': invisible }*//*);

        }

      });
      // TODO:如果不支持Object.defineProperty(IE8-)，怎么办？
    },*/

    /*defineAttr2: function (prototype, attr, invisible) {

     this.defineProp(prototype, attr, {

     get: function () {

     return this._attrs [attr];//

     },

     set: function (value) {

     if (this._attrs [attr] == value) {

     return;

     }

     this._attrs [attr] = value;
     //this.invalidate(attr, invisible);
     this.notify(attr, { 'invisible': invisible });

     }

     });
     // TODO:如果不支持Object.defineProperty(IE8-)，怎么办？
     },*/

    /*addAttrs: function (prototype, attrs, invisible) {
      //prototype['_attrs'] = Exact.ObjectUtil.assign({}, prototype['_attrs'], attrs);
      for (var key in attrs) {

        if (attrs.hasOwnProperty(key)) {

          prototype['_' + key] = attrs[key];

          this.defineAttr(prototype, key, false);

        }

      }

      //prototype['_attrs'] = Exact.ObjectUtil.assign({}, prototype['_attrs'], attrs);

    },*/
    /**
     * 在原型上继承已有部件信息，并添加新的部件信息。
     */
    addParts: function (prototype, parts) {
      // if(Array.isArray(parts)){parts={name0:selector0,...};}
      if (Array.isArray(parts)) {

        var names = parts, name;

        parts = {};

        for (var i = 0, len = names.length; i < len; ++i) {

          name = names[i];

          parts[name] ='[data-name="'+name+'"]';

        }

      }

      prototype['_parts'] = this.assign({}, prototype['_parts'], parts);

    },
    /**
     * 查找目标路径上的最终值
     * 
     * @param {string|Array} path 
     * @param {Object} target
     */
    final: function(path, target) {
      var chain, len, i;

      if (Array.isArray(path)) {
        chain = path;
      } else if (typeof path === 'string') {
        chain = path.split('.');
      } else {
        return undefined;
      }

      if (arguments.length === 1) { target = window; } //@todo global

      for (i = 0, len = chain.length; i < len; ++i) {
        target = target[chain[i]];
        if (target === undefined) { break; }
      }
      //if (typeof ClassRef !== 'function') { return null; }
      return target;
    },
    /**
     * 查找或生成命名空间
     * 
     * @param {string|Array} path
     */
    namespace: function(path) {
      var i, len, chain, name, space = window; // @todo global

      if (typeof path === 'string') {
        chain = path.split('.');
      } else if (Array.isArray(path)) {
        chain = path;
      } else {
        return null;
      }

      for (i = 0, len = chain.length; i < len; ++i) {
        name = chain[i];
        if (!space[name]) { space[name] = {}; }
        space = space[name];
      }

      return space;
    },

    /*add: function (propsName, prototype, props) {

      if (propsName === 'attrs') {

        this.addAttrs(prototype, props);

      } else if (propsName === 'props') {

        this.addAttrs(prototype, props);

      } else if (propsName === 'parts') {

        this.addParts(prototype, props);

      } else {

        prototype[propsName] = Exact.ObjectUtil.assign({}, prototype[propsName], props);

      }

    },*/

    /**
     * 解析target上属性值表达式。
     * @param {string} expression 首字母应为'~'(表示转义), 否则视为字面值
     * @param {Object} target
     */
    parse: function (expression, target) {
      if (typeof expression !== 'string') { 
        throw new TypeError('expression must be string');
      }

      var prop, char = expression.charAt(0);

      if (char === TILDE) {
        prop = this.final(expression.replace(TILDE, ''), target);
      } else {
        prop = expression;
      }

      return prop;
    }

  };

})();
//##############################################################################
// src/util/ActionUtil.js
//##############################################################################
(function () {
  'use strict';
  /**
   * 事件动作工具，可解析动作表达式，可批量注册事件处理函数。
   */

  var BRACKETS = '()';

  Exact.ActionUtil = {
    // 貌似多余
    add: function(actions, target) {
      for (var type in actions) {
        if (actions.hasOwnProperty(type)) {
          target.on(type, actions[type]);
        }
      }
    },
    /**
     * 解析动作表达式。
     * @param {string} expression 形如'onclick()'
     * @param {Object} target
     */
    parse: function(expression, target) {
      var idx = expression.indexOf(BRACKETS);

      if (idx !== expression.length - 2) { return null; }

      var chain = expression.replace(BRACKETS, '').split('.');

      for (var i = 0, len = chain.length; i < len - 1; ++i) {
        target = target[chain[i]];
        if (!target) { return null; }
      }

      var handler = chain[i];
      //return target[handler];
      return Exact.proxy(target, handler);
    }

  };

})();
//##############################################################################
// src/util/BindingUtil.js
//##############################################################################
(function() {
  'use strict';
  /**
   * 绑定工具，可解析绑定表达式，可建立和解除绑定。
   */

  var ONE_TIME = '+', ONE_WAY = '-', TWO_WAY = '=';

  Exact.BindingUtil = {
    /**
     * 向目标进行批量绑定。
     * @param {Object} bindings
     * @param {Exact.Component} target
     */
    add: function(bindings, target) {
      var binding;
      for (var prop in bindings) {
        if (bindings.hasOwnProperty(prop)) {
          binding = bindings[prop];
          this.bind(target, prop, binding.source, binding.path, binding.options);
        }
      }
    },
    
    /**
     * 解析绑定表达式。
     * @param {string} expression 首字母应为+/-/=
     * @param {Object} source
     * @returns {Object}
     */
    parse: function(expression, source) {
      var path, options, char = expression.charAt(0);

      if (char === ONE_WAY) {
        path = expression.replace(ONE_WAY, '');////expression.slice(1);
        options = { mode: 'one-way' }; // filter?
      } else if (char === TWO_WAY) {
        path = expression.replace(TWO_WAY, '');
        options = { mode: 'two-way' };
      } else if (char === ONE_TIME) {
        path = expression.replace(ONE_TIME, '');////expression.slice(1);
        options = { mode: 'one-time' };
      } else {
        return null;
      }
      // return new Binding(source, path, options);
      return { source: source, path: path, options: options };
    },

    /**
     * 根据传入参数的不同，建立绑定。
     * @param {Object} target
     * @param {string} prop
     * @param {Object} source
     * @param {string} path
     * @param {Object} options
     */
    bind: function(target, prop, source, path, options) {
      var argc = arguments.length, binding, len, chain, attr;

      if (argc >= 4) {
        chain = path.split('.');
        len = chain.length;

        if (len > 1) {
          source = Exact.ObjectUtil.final(chain.slice(0, len - 1), source);
        }

        if (!source) { return; }

        attr = chain[len - 1];
        // binding =new Binding(source, path, options); binding.to(target,prop); binding.from(source,path);
        binding = new Exact.Binding(target, prop, source, attr, options);
      } else if (argc === 1) {
        binding = arguments[0];
      } else { return; }

      this.observe(binding);

      if (binding.mode === 'two-way') {
        this.observe(binding, true);
      }
    },

    /**
     * 根据传入参数的不同，解除绑定。
     */
    unbind: function (binding, index) {
      var args = arguments, bindings, target, prop, source, attr, i;

      if (args[1] instanceof Exact.Component) {
        // unbind(target, source)，遍历查找，解除二者间所有的绑定
        target = args[0];
        source = args[1];

        for (attr in source._bindings) {
          if (!source._bindings.hasOwnProperty(attr)) { continue; }

          bindings = source._bindings[attr];

          if (!bindings || !bindings.length ) { continue; }

          for (i = bindings.length - 1; i >= 0; i --) {
            binding = bindings[i];
            if (binding.target === target) {
              this.unbind(binding, i);
            }
          }
        }
        return;
      } else if (args.length === 4) {
        // unbind(target, prop, source, attr)，解除二者间对应的一条绑定
        target = args[0];
        prop = args[1];
        source = args[2];
        attr = args[3];

        bindings = source._bindings[attr];

        if (bindings) {
          for (i = bindings.length - 1; i >= 0; i --) {
            binding = bindings[i];

            if (binding.target === target && binding.prop === prop) {
              this.unbind(binding, i);
            }
          }
        }
        return;
      }

      this.ignore(binding, index);

      if (binding.mode === 'two-way') {
        this.ignore(binding, -1, true);
      }
    },
    /**
     * 观察特性的变化或直接注册绑定。
     * @param {Exact.Binding} binding
     * @param {Boolean} reverse 是否反向观察
     */
    observe: function(binding, reverse) {
      var sender, attr;

      if (reverse) {
        sender = binding.target;
        attr = binding.prop;
      } else {
        sender = binding.source;
        attr = binding.attr;
      }

      binding.execute(attr, sender); // 先完成赋值，即便不可绑定

      if (!(sender instanceof  Exact.Component)) { return; }

      var bindings = sender._bindings[attr];

      if (bindings) {// @todo on('change:' + attr + '.binding', binding.execute, binding)
        bindings.push(binding);
      } else {
        bindings = sender._bindings[attr] = [binding];

        var event = binding.event,
            handler = function () {
              var i, bnd;

              for (i = bindings.length - 1; i >= 0; --i) {// @todo 顺序
                bnd = bindings[i];
                bnd.execute(attr, sender);

                if (bnd.mode === 'one-time') {
                  bindings.splice(i, 1);
                }
              }
            };

        if (!event || event === 'propertyChange') {
          sender.on('change:' + attr + '.binding', handler);
        } else {
          sender.on(event, handler);
        }
      }
    },

    /**
     * 忽视特性的变化或直接移除绑定。
     * @param {Exact.Binding} binding
     * @param {number} index binding所在位置
     * @param {boolean} reverse 是否反向忽视
     */
    ignore: function(binding, index, reverse) {
      var sender, attr;

      if (reverse) {
        sender = binding.target;
        attr = binding.prop;
      } else {
        sender = binding.source;
        attr = binding.attr;
      }

      if (!(sender instanceof  Exact.Component)) { return; }

      var bindings = sender._bindings[attr], len = bindings.length, i;

      if (len <= 0) { return; }

      i = (index >= 0) ? index : len - 1;// @todo

      for (; i >= 0; i--) {
        if (binding === bindings[i]) {
          bindings.splice(i, 1);
          break;
        }
      }

      if (bindings.length <= 0) { // 移除不必要的事件侦听
        sender.off('change:' + attr + '.binding');
        delete sender._bindings[attr];
      }
    }

  };

})();
//##############################################################################
// src/util/CommandUtil.js
//##############################################################################
(function () {
  'use strict';
//  var Command = Exact.Command,
//    Component = Exact.Component;
  /**
   * 命令工具，可解析命令表达式，可注册和移除命令。
   */

  Exact.CommandUtil = {
    /**
     * 向命令发射器批量注册命令。
     * @param {Object} commands
     * @param {Exact.Component} sender
     */
    add: function(commands, sender) {
      for (var cmd in commands) {
        if (commands.hasOwnProperty(cmd)) {
          this.listen(sender, cmd, commands[cmd]);
        }
      }
    },

    /**
     * 解析命令表达式。
     * @param {string} expression 末尾字母应为!
     * @param {Object} target
     */
    parse: function(expression, target) {
      var command, path, char = expression.charAt(expression.length -1);

      if (char !== '!') { return null; }

      path = expression.replace('!', '');
      command = Exact.ObjectUtil.final(path, target);

      if (command instanceof Exact.Command) { return command; }

      return null;
    },

    /**
     * 侦听命令信号或直接注册。
     * @param {Exact.Component} sender
     * @param {string} type 命令信号类型
     * @param {Exact.Command} command
     */
    listen: function(sender, type, command) {
      if (!(sender instanceof  Exact.Component)) { return; }

      var commands = sender._commands[type];

      if (commands) {
        commands.push(command);
      } else {
        commands = sender._commands[type] = [command];

        var handler = function (evt, note) {
          var i, len, command, context;
          for (i = 0, len = commands.length; i < len; i ++) {
            command = commands[i];
            context = command.context;
            if (context) {
              command.execute.call(context, note, sender);
            } else {
              command.execute(note, sender);
            }
          }
        };

        sender.on('signal:' + type + '.commands', handler);
      }
    },

    /**
     * 取消侦听或直接移除。
     * @param {Exact.Component} sender
     * @param {String|undefined} type 命令信号
     * @param {Exact.Command|undefined} command
     */
    deafen: function(sender, type, command) {
      if (!(sender instanceof  Exact.Component)) { return; }

      var argc = arguments.length;

      if (argc === 1) {
        for (type in sender._commands) {
          if ( sender._commands.hasOwnProperty(type)) {
            this.deafen(sender, type);
          }
        }
        return;
      }

      if (typeof type !== 'string') { return; }

      var commands = sender._commands[type];

      if (!commands/* || !commands.length*/) { return; }

      if (argc === 2) {
        commands.splice(0);
      } else {
        for (var i = commands.length -1; i >= 0; --i) {
          if (command === commands[i]) {
            commands.splice(i, 1);
          }
        }
      }

      if (commands.length <= 0) {
        sender.off('signal:' + type + '.commands');
        delete sender._commands[type];
      }
    }
  };
})();
//##############################################################################
// src/util/TickerUtil.js
//##############################################################################
(function () {
  'use strict';
  /**
   * 通过双缓冲机制，在浏览器重绘之前，完成有必要的刷新工作。
   */

  var index = 0, buffers = [[], []], flag = false; // 双缓冲机制

  Exact.TickerUtil = {
    push: function(control) {
      var buffer;
      if (control && typeof control.refresh ==='function') {
        buffer = buffers[index];
        buffer.push(control);
        if (!flag) {
          flag = true;
          requestAnimationFrame(tick/*, document.body*/);
        }
      }
    }
  };

  tick();

  function tick() {

    flag = false;
    //requestAnimationFrame(tick/*, document.body*/);
    var i, len, control, buffer = buffers[index];

    len = buffer.length;
    // 没有什么需要刷新的(Nothing to refresh)
    if (len <= 0) { return; }

    index = index ? 0 : 1;

    for (i = 0; i < len; ++i) {
      control = buffer[i];
      control.refresh();
    }

    if (Exact.options.showRefreshedControls) {
      var ids = [];
      for (i = 0; i < len; ++i) {
        control = buffer[i];
        ids.push(control.guid);
      }
      console.log('refresh the following controls:\n', ids);
    }

    buffer.splice(0);
  }
})();
//##############################################################################
// src/global/constants.js
//##############################################################################
(function() {

  'use strict';

})();
//##############################################################################
// src/global/variables.js
//##############################################################################
(function() {
  'use strict';
// 统计(Statistics)

  Exact.options = {

    showRefreshedControls: true

  };

})();
//##############################################################################
// src/global/functions.js
//##############################################################################
(function() {
  'use strict';
  // Exact.defineControl,Exact.defineComponent
  /**
   * 定义新类，为组件、控件类的定义添加了额外的支持。TODO: Exact.extendClass = function (Sub, Sup, protoProps, staticProps)
   * @method defineClass
   * @param {Object} protoProps
   * @param {Object} staticProps
   */
  Exact.defineClass = function (protoProps, staticProps) {
    var subClass, superClass, mixins;

    if ('extend' in protoProps) {
      superClass = protoProps.extend;
      if (typeof superClass !== 'function') {
        throw new TypeError('superClass must be a function');
      }
    } else {
      superClass = Object;
    }

    if (protoProps.hasOwnProperty('constructor')) {
      subClass = protoProps.constructor;
      if (typeof subClass !== 'function') {
        throw new TypeError('subClass must be a function');
      }
    } else {
      subClass = function() {
        superClass.apply(this, arguments);
      }
    }

    subClass.prototype = Object.create(superClass.prototype);

    if (protoProps) { Exact.ObjectUtil.assign(subClass.prototype, protoProps); }

    mixins = protoProps.mixins;
    if (Array.isArray(mixins)) {
      var assign = Exact.ObjectUtil.assign;
      assign.apply(Exact.ObjectUtil, [subClass.prototype].concat(mixins));
    }

    Object.defineProperty(subClass.prototype, 'constructor', {
      value: subClass, enumerable: false, writable: true, configurable: true
    });

    if (staticProps) { Exact.ObjectUtil.assign(subClass, superClass, staticProps); }

    return subClass;
  };
//  Exact.defineClass0 = function (ChildName, SuperName, protoProps, staticProps) {
//
//    var ObjUtil = Exact.ObjectUtil;
//
//    var chain = ChildName.split('.');
//
//    var namespace = ObjUtil.namespace(chain.slice(0,chain.length-1)), lastName = chain[chain.length-1];
//
//    var Child, Super = ObjUtil.findValue(SuperName);
//
//    if (protoProps.hasOwnProperty('constructor')) {
//
//      Child = protoProps.constructor;
//
//      delete protoProps.constructor;
//
//    } else {
//
//      Child = function(){ Super.apply(this, arguments); };//检查有无返回值
//
//    }
//
//    namespace[ lastName ] = Child;
//
//    ObjUtil.assign(Child, Super, staticProps);
//
//    var ChildPrototype = Child.prototype = ObjUtil.create(Super.prototype);
//    /*var Surrogate = function(){};
//     Surrogate.prototype = Super.prototype;
//     Child.prototype = new Surrogate;*/
//    ChildPrototype.constructor = Child;//defineProp()
//
//    /*ObjUtil.defineProp(ChildPrototype, 'constructor', {
//
//      value: Child,
//      writable: true,
//      enumerable:false,
//      configurable: true
//
//    });*/
//
//    //Object.defineProperty(Child.prototype,'constructor',{value:Child,enumerable:false})
//
//    ChildPrototype.TYPE = ChildName;
//
//    // 为组件、控件类的定义添加了额外的支持
//    if (protoProps) {
//
//      if (protoProps.attrs) {
//
//        ObjUtil.addAttrs(ChildPrototype, protoProps.attrs);
//
//        delete protoProps.attrs;
//
//      }
//
//      if (protoProps.props) {
//
//        ObjUtil.addProps(ChildPrototype, protoProps.props);
//
//        delete protoProps.props;
//
//      }
//
//      if (protoProps.parts) {
//
//        ObjUtil.addParts(ChildPrototype, protoProps.parts);
//
//        delete protoProps.parts;
//
//      }
//
//      ObjUtil.assign(ChildPrototype, protoProps);
//
//    }
//
//    return Child;
//
//  };

  /**
   * 类似于jQuery.proxy
   * @todo return func.bind(context);
   * @param {Object} context
   * @param {String|Function} fn
   * @returns {Function}
   */
  Exact.proxy = Exact.proxy || function(context, func) {
    if (typeof func === 'string') {
      func = context[ func ];
    }

    if (typeof func !== 'function') {
      return undefined;
    }

    return function() {
      return func.apply(context, arguments);
    };
  };

  // TODO: 判定函数，isFunction等

})();

Exact.Templates = {};


(function () {

  'use strict';
  /**
   * 事件API形如jQuery，作为Exact.Component的基类。
   * 此基类不应实例化，_agent在子类初始化时才被创建。
   * TODO:合并到Exact.Component,重新定义独立的EventAgent
   */
  /*exact.base.EventAgent =*/
  Exact.EventAgent = Exact.defineClass({

    constructor: function EventAgent() {

      this._agent = null;
      //Object.apply(this, arguments);

    },

    on: function (types, data, handler, /*INTERNAL*/ one) {

      if (typeof types === 'object') { // types can be a map of types/handlers

        for (var type in types) {

          if (types.hasOwnProperty(type)) {

            this.on(type, data, types[type], one);

          }

        }

        return this;

      }
      if(this._agent) {
        this._agent.on(types, data, handler, one);
      }

      return this;

    },

    one: function (types, data, handler) {

      return this.on(types, data, handler, 1);

    },

    off: function (types, handler) {
      if(this._agent) {
        this._agent.off(types, handler);
      }

      return this;

    },

    trigger: function (type, data) {
      if (this._agent) {
        this._agent.trigger(type, data);
      }
      return this;
    }

  });

  // TODO: 未完待续
  Exact.EventDispatcher = Exact.defineClass({
    constructor: function EventDispatcher() {
      this._events = null;
    },

    on: function (types, data, handler, /*INTERNAL*/ one) {
      var i, t, len, idx, type, namespace, events, listeners, listener, existed;
      if (typeof types === 'object') { // types can be a map of types/handlers
        for (type in types) {
          if (types.hasOwnProperty(type)) {
            this.on(type, data, types[type], one);
          }
        }
        return this;
      }

      if (this._events === undefined) {
        this._events = {};
      }

      types = types.trim().split(/\s+/);

      for (t = 0; t < types.length; t ++) {
        type = types[t];
        idx = type.indexOf('.');

        namespace = type.slice(idx);
        type = type.slice(0, idx - 1);

        events = this._events;

        if (events[type] === undefined) {
          events[type] = [];
        }

        listeners = events[type];

        for (i = 0, len = listeners.length; i < len; i ++) {
          listener = listeners[i];

          if (handler === listener.handler) {
            existed = true;
            break;
          }
        }

        if (!existed) {
          listener = {
            handler: handler,
            namespace: namespace
          };
          listeners.push(listener);
        }
      }

      //TODO: abstract function
          /*
          if(!raw_events[type] && this instanceof jQuick && check(type) && !namespcae){
            raw_events[type] = 1;
            this.el.addEventListener(type,function(evt){
              trigger(evt.type);
            });
          }

          */

      return this;
    },

    off: function (types, handler) {
      var i, t, idx, namespace, type, events, listeners, listener;

      if (typeof types === 'object') {
        for (type in types) {
          if (types.hasOwnProperty(type)) {
            this.off(type, types[type]);
          }
        }
        return;
      }

      events = this._events;

      if (!events) { return this; }

      types = types.trim().split(/\s+/);

      for (t = 0; t < types.length; t ++) {
        type = types[t];
        idx = type.indexOf('.');

        namespace = type.slice(idx);
        type = type.slice(0, idx - 1);

        if (type) {
          listeners = events[type];
          if (!listeners || !listeners.length) { continue; }
          for (i = listeners.length - 1; i >= 0; i--) {
            listener = listeners[i];
            if (handler === listener.handler) {
              listeners.splice(i, 1);
              break;
            }
          }
        } else {

        }
      }
      return this;
    },

    trigger: function (type, extras) {
      var i, t, idx, namespace, events, listeners, listener;
      
      events = this._events;
      if (!events) { return this; }

      listeners = events[type];
      if (!listeners) { return this; }

      for (i = listeners.length - 1; i >= 0; i--) {
        listener = listeners[i];
        //TODO: wrap raw event
        listener.handler.apply(listener.context, [{ type: type, timestamp: 0 }].concat(extras) );
      }
      return this;
    }
  });

})();
//##############################################################################
// src/base/Component.js
//##############################################################################
Exact.Component = (function () {
  'use strict';
  /**
   * Exact.Component可绑定特性，可发送命令，可含其他子组件，可处理职责和指导任务
   */
  var IdUtil = Exact.IdUtil;
  /*exact.base.Component =*/
  return Exact.defineClass({
    //TYPE: 'Exact.Component',
    constructor: function Component(paras) {
      paras = paras || {};
      //Exact.EventAgent.apply(this, arguments);
      this.guid = IdUtil.autoIncreaseId(this.constructor.name);
      this._bindings = {};
      this._commands = {};

      this.register();
      this.initialize(paras);
    },
    extend: Exact.EventAgent,
    //mixins: [Exact.EventBus],

//    /**
//     * 
//     * @returns {string}
//     * @constructor
//     */
//    get TYPE() {
//      return 'Exact.Component';
//    },

    /**
     * @method register
     * @abstract
     */
    register: function() {},

    /**
     * @method initialize
     */
    initialize: function() {
      this._agent = new Exact.Skin({});// TODO: this._evenEmitter = new Exact.EventEmitter();
    },

    /**
     * @todo 无意义
     * @param {string} attr
     * @returns {*}
     */
    get: function(attr) {
      return this[attr];
    },

    /**
     * 可单个或批量给特性或属性赋值。
     * @param {Object} props
     * @param {boolean} silent
     */
    set: function(props, silent/*, options*/) {
      var key, value;/*options = value || {};*/
//      if (typeof props === 'object') { // attr can be a map of key/value }
      for (key in props) {
        if (!props.hasOwnProperty(key)) { continue; }// @todo remove

        if (silent) {
          this[key] = props[key];
          continue;
        }

        value = props[key];

        if (value === this[key]) { continue; }

        this.invalidate(key, value);
        this[key] = value;
        this.notify(key);
      }

      return this;
    },

    /*has: function (attr) {

      return (attr in this.attrs);

    },*/

    invalidate: function(key, value) {},

    /**
     * 通知自身特性的改变。
     * @method notify
     * @param {string} attr
     * @param {*} note
     */
    notify: function (attr, note) {
      this.trigger('change:' + attr, note);
      //this.trigger('change:' + attr, attr);
      return this;
    },


    /**
     * 发送命令信号，触发绑定的命令。
     * @method send
     * @param {string} type 命令信号类型
     * @param {*} note Command::execute(note)
     */
    send: function (type, note) {
      this.trigger('signal:' + type, note);
      return this;
    },

    /**
     * 通过工具解析并处理一些职责。
     * @method handle
     * @param {Object} duty 含事件、绑定、命令和赋值的表达式
     * @param {Object} boss 自身或父组件
     */
    handle: function(duty, boss) {
      if (!duty) { return; }

      var key, expression, action, binding, command, para,
          actions = {}, bindings = {}, commands = {}, paras = {},
          ActUtil = Exact.ActionUtil, BndUtil = Exact.BindingUtil,
          CmdUtil = Exact.CommandUtil, ObjUtil = Exact.ObjectUtil;

      boss = boss || this;

      for (key in duty) {
        if (!duty.hasOwnProperty(key)) { continue; }

        expression = duty[key];
        //if(typeof expression !== 'string') { continue; }
        if (typeof expression === 'string') { // 有点麻烦，不太高效
          action = ActUtil.parse(expression, boss);
          if (action) {
            actions[key] = action;
            continue;
          }

          binding = BndUtil.parse(expression, boss);
          if (binding) {
            bindings[key] = binding;
            continue;
          }

          command = CmdUtil.parse(expression, boss);
          if (command) {
            commands[key] = command;
            continue;
          }

          para = ObjUtil.parse(expression, boss);
          paras[key] = para;
        } else {
          paras[key] = expression;
        }
      }

      this.set(paras);

      ActUtil.add(actions, this);
      BndUtil.add(bindings, this);
      CmdUtil.add(commands, this);

      return this;
    },

    /**
     * 指导子组件处理一些任务。
     * @method direct
     * @param {Object} tasks 各项任务，含事件、绑定、命令和赋值的表达式
     */
    direct: function(tasks) {
      var name, part, duty;

      for (name in tasks) {
        if (tasks.hasOwnProperty(name)) {
          part = this[name];
          duty = tasks[name];

          if (part instanceof Exact.Component) {
            part.handle(duty, this);
          } else if (part instanceof Exact.Skin) {
            this.listen(part, duty);
          }
        }
      }

      return this;
    },

    /**
     * @method release
     */
    release: function() {},

    toString: function() {
      //if (mode === 'debug') {
      return this;
      //}
    }
  });
})();
//##############################################################################
// src/core/bindings/Binding.js
//##############################################################################
Exact.Binding = (function () {
  'use strict';
  // TODO:完善设计
  // SimpleBinding, ObjectBinding...
  /*exact.core.bindings.Binding =*/
  return Exact.defineClass({
    /**
     * 特殊的Command，储存一些信息，当关心的特性改变时，触发定制的execute。
     * 
     * @class Binding
     * 
     * @param target
     * @param prop
     * @param source
     * @param attr
     * @param options
     * @constructor
     */
    constructor: function Binding(target, prop, source, attr, options) {
      this.target = target;
      this.prop = prop;
      this.source = source;
      this.attr = attr;

      options = options || {};
      
      this.mode = options.mode ||  'one-way';
      this.event = options.event;

      this.filter = options.filter || {
        $in: function (attr) { return attr; },
        $out: function (prop) { return prop; }
      };

      this._cache = {}; // 防止因filter生成新值而产生循环
    },

    /**
     * 执行set
     * 
     * @param {*} note
     * @param {Object} sender
     */
    execute: function(note, sender) {
      var source = this.source, attr = this.attr,
          target = this.target, prop = this.prop,
          filter = this.filter, cache = this._cache,
          value, paras;

      if (sender === source) {
        value = source[attr];

        if (cache.dst !== target[prop]) {
          cache.src = value;
          paras = {};
          paras[prop] = filter.$in(value);
          target.set(paras);
        }

        cache.dst = undefined;
      } else {
        value = target[prop];

        if (cache.src !== source[attr]) {
          cache.dst = value;
          paras = {};
          paras[attr] = filter.$out(value);
          source.set(paras);
        }

        cache.src = undefined;
      }
    }/*,

    build: function () {},

    clear: function () {}
    */
  });
})();
//##############################################################################
// src/core/commands/Command.js
//##############################################################################
Exact.Command = (function() {
  'use strict';
  //exact.core.commands.Command =
  return Exact.defineClass({
    //TYPE: 'Exact.Command'
    //_list: [],
    /**
     * 只含execute函数和context信息
     *
     * @constructor
     * @param {Function|String} execute 函数或context中的函数名
     * @param {Object} context 多数情况下即为Exact.Context的子类对象
     */
    constructor: function Command(execute, context) {
      //Exact.EventAgent.call(this);
      if (context && typeof execute === 'string') {
        this.execute = context[execute];
        this.context = context;
      } else {
        this.execute = execute;
        this.context = undefined;
      }

      /*this.executable = false;

       this.configs.executable = {

       change: false

       };*/
    }
  });
})();
//##############################################################################
// src/core/models/Context.js
//##############################################################################
Exact.Context = (function() {
  'use strict';
  /**
   * 数据模型, TODO: Store
   */

  /*exact.core.models.Context =*/
  return Exact.defineClass({
    constructor: function Context() {
      Exact.Component.apply(this, arguments);
    },
    extend: Exact.Component,
    //TYPE:'Exact.Context',
    /**
     * 逻辑开始的地方
     * @method initialize
     * @param {Object} paras 属性键/值对
     */
    initialize: function(paras) {
      this._agent = new Exact.Skin({}); // 重要!
      this.set(paras);
      this.ready();
    },

    /**
     * @method ready
     * @abstract
     */
    ready: function() {},

    /**
     * @method refresh
     * @abstract
     */
    refresh: function() {},

    /**
     * @method release
     */
    release: function() {
      this._bindings = null;
      this.trigger('release');
    }

  });

})();

Exact.Collection = (function () {
  'use strict';
  /**
   * 集合模型，用来管理一般的数组
   */

  /*exact.core.models.Collection =*/
  return Exact.defineClass({
    constructor: function Collection() {
      this.items = [];
      Exact.Context.apply(this, arguments);
    },
    extend: Exact.Context,

    _isUpdating: false,

    get length() {
      if (!this.items) { return -1; }
      return this.items.length;
    },
    /**
     * 返回第index个item
     * @param {number} index
     * @returns {*}
     */
    at: function(index) {
      return this.items[index];
    },
    /**
     * 返回item所在index
     * @todo lastIndexOf(item, start)
     * @param {*} item
     * @param {Object} options 向后或向前找
     * @returns {number}
     */
    indexOf: function(item, options) {
      var mode, start, index;

      options = options || {};
      mode = options.mode || 'first';

      if (mode === 'first') {
        start = options.start || 0;
        index = this.items.indexOf(item, start);
      } else if (mode === 'last'){
        start = options.start || this.length - 1;
        index = this.items.lastIndexOf(item, start);
      }

      return index;
    },

    sort: function (comparator) {
      var i, len = this.length, items = [].concat(this.items), indices = [];
      this.items.sort(comparator);

      for (i = 0; i < len; ++i) {
        indices[i] = this.indexOf(items[i]);
      }

      this.trigger('sort', indices);
      return this;
    },

    /**
     * @todo
     * @param {Function} comparator
     * @returns {*}
     */
    group: function (comparator) {

      return this;

    },

    /**
     * 返回指定范围内符合条件的所有索引
     * @example indices=collection.where(fn,{idx:5,cnt:5});
     * @param {Function} comparator
     * @param {Object} options
     * @returns {Array}
     */
    where: function (comparator, options/*:{idx:0, cnt:0, end:0}*/) {
      var i, len, idx, cnt, end, indices = [], items = this.items;

      if (typeof comparator === 'function') {
        len = items.length;

        options = options || {};
        idx = options['idx'] || 0;
        end = options['end'] || len;
        cnt = options['cnt'];

        if (idx < 0) { idx += len; }
        if (end < 0) { end += len; }

        if (!cnt) {
          for (i = idx; i < end; i++) {
            if (comparator (items[i], i, items)) {
              indices.push(i);
            }
          }
        } else if (cnt > 0) {
          for (i = idx; i < end; i++) {
            if (comparator (items[i], i, items)) {
              indices.push(i);
              if (indices.length >= cnt) { break; }
            }
          }
        }
      }

      return indices;
    },

    /**
     * 选中符合条件或处于指定位置的items
     * @example select('*');
     *          select([1,3,5]);
     *          select(function(item){return item.sex==='male'},{idx:5,cnt:5})...
     * @returns {Array}
     */
    select: function (/*'*'|indices:[]|comparator:(), options:{}*/) {

      var i, idx, cnt, end, len, item, comparator, options,
          records = [], indices = [], arg0 = arguments[0], items = this.items;

      if (arg0 === '*') {
        records = items; indices = '*';
      } else if (Array.isArray(arg0) && arg0.length > 0) {
        indices = arg0;
        for (i = 0, cnt = indices.length; i < cnt; ++i) {
          records.push(items[indices[i]]);
        }
      } else if (typeof arg0 === 'function') {
        comparator = arg0;
        len = items.length;

        options = arguments[1] || {};
        idx = options['idx'] || 0;
        end = options['end'] || len;
        cnt = options['cnt'];

        if (idx < 0) { idx += len; }
        if (end < 0) { end += len; }

        if (!cnt) {
          for (i = idx; i < end; ++i) {
            item = items[i];
            if(comparator(items[i], i, items)) {
              records.push(item); indices.push(i);
            }
          }
        } else if (cnt > 0) {
          for (i = idx; i < end; ++i) {
            item = items[i];
            if(comparator(items[i], i, items)) {
              records.push(item); indices.push(i);
              if(indices.length >= cnt) { break; }
            }
          }
        }
      }

      this.trigger('select', records, indices);
      return records;
    },

    /**
     * 更新符合条件或指定位置的item的属性
     * @example update({name:'Marvin'},[1,3,5]);
     *          update({sex:'male'},function(item){return item.name==='Marvin'});
     * @param {Object} attrs 需要更新的键/值
     * @returns {Exact.Collection}
     */
    update: function (attrs/*:{}, indices:[]|comparator:(), options:{}*/) {

      var arg1 = arguments[1], items = this.items, records = [], indices = [],
          i, len, idx, end,  item, key, comparator, options;

      if (typeof attrs === 'object') {
        this._isUpdating = true;

        if(typeof arg1 === 'function') {
          comparator = arg1;
          len = items.length;

          options = arguments[1] || {};
          idx = options['idx'] || 0;
          end = options['end'] || len;

          if (idx < 0) { idx += len; }
          if (end < 0) { end += len; }

          for (i = idx; i < end; ++i) {
            item = items[i];

            if(item && comparator(items[i], i, items)) {
              indices.push(i);

              if (item instanceof Exact.Component) {
                item.set(attrs);
              } else {
                for (key in attrs) { item[key] = attrs[key]; }
              }
            }
          }
        } else if (Array.isArray(arg1)){
          indices = arg1;

          for (i = 0, len = indices.length; i < len; ++i) {
            item = items[indices[i]];
            records.push(item);

            if (item instanceof Exact.Component) {
              item.set(attrs);
            } else if (item){
              for (key in attrs) { item[key] = attrs[key]; }
            }
          }
        }

        this._isUpdating = false;

        if (indices.length) {
          this.trigger('update', records, indices);
        }

      }

      //this.trigger('update', records, indices);
      return this;
    },

    /**
     * 在末尾或当前指定位置插入新的记录
     * @example insert([item3,item4]);
     *          insert([item3,item4],[1,2]);
     * @param {Array} records
     * @returns {Exact.Collection}
     */
    insert: function (records/*:[]<, indices:[]>*/) {
      var i, j, cnt, len, idx, item, backup, items = this.items,
          arg1 = arguments[1], indices = [], mask = [], combine = [];

      if (Array.isArray(records) && records.length > 0) {
        if (arg1 === undefined) { // 即在末尾插入新的记录
          cnt = records.length; len = items.length;

          for (i = cnt - 1; i >= 0; --i) { //[].splice.apply(items,args)
            item = records[i];
            items.splice(len, 0, item);
            indices.unshift(i + len);
            this.itemAdded(item, i + len);
          }
        } else if (Array.isArray(arg1) &&
          (records.length + arg1.length) > 1) { // 即在当前指定位置插入新的记录
          indices = arg1;
          len = records.length; cnt = indices.length;

          if (cnt === 1 && len > 1) {
            idx = indices[0];
            for (j = 1; j < len; ++j) { indices.push(idx); }
            cnt = indices.length;
          }

          if (len < cnt) { cnt = len; }

          backup = items.splice(0);
          combine = items;
          // 合并排序
          for (j = 0, len = backup.length ; j <= len; ++j) {
            for (i = 0; i < cnt; ++i) {
              idx = indices[i];

              if (mask[i]) { continue; }

              if (idx <= j) {
                mask[i] = 1; // added
                item = records[i];
                combine.push(item);
                this.itemAdded(item, combine.length - 1);
              } /*else { break; }*/ // 如果items和indices有序，可break
            }

            if (len > 0 && j < len) { combine.push(backup[j]); }
          }
        }
      }

      this.trigger('insert', records, indices);
      return this;
    },

    /**
     * 移除符合条件或处于指定位置的items
     * @example remove('*');
     *          remove([1,3,5]);
     *          remove([item1,item4],'item');
     *          remove([1,5,3],'item');
     *          remove(function(item){return item.name==='Marvin'},{idx:5});
     * @returns {Array}
     */
    remove: function (/*'*'|records:[]|indices:[]|comparator:(), options:{}*/) {

      var arg0 = arguments[0], items = this.items, mask = [], records = [], indices = [],
          i, j, idx, end, cnt, len, item, comparator, options;

      len = items.length;

      if (arg0 === '*') { // 移除所有items，即清空
        records = items.splice(0); indices = '*';
      } else if (Array.isArray(arg0) && arg0.length > 0) {
        var arg1 = arguments[1];

        if (arg1 === 'item') { // 移除指定的items
          records = arg0;
          cnt = records.length;
          // 先标记要移除的item
          for (i = 0; i < cnt; ++i) {
            for (j = 0; j < len; ++j) {
              if(items[j] === records[i]) {
                indices.push(j);
                mask[j] = 1; // to remove
              }
            }
          }
          // 然后,从后向前移除标记过的item
          for (j = len - 1; j >= 0; j --) {
            if (mask[j]) { items.splice(j, 1); }
          }
        } else { // 移除指定位置的items
          indices = arg0;
          cnt = indices.length;
          // 先标记要移除的item
          for (i = 0; i < cnt; ++i) {
            idx = indices[i];
            records.push(items[idx]);
            mask[idx] = 1; // to remove
          }
          // 然后,从后向前移除标记过的item
          for (i = len - 1; i >= 0; --i) {
            if (mask[i]) { items.splice(i, 1); }
          }
        }
      } else if (typeof arg0 === 'function') { // 移除指定范围内符合条件的items
        comparator = arg0;
        options = arguments[1] || {};
        idx = options['idx'] || 0;
        end = options['end'] || len;

        if (idx < 0) { idx += len; }
        if (end < 0) { end += len; }

        for (i = end - 1; i >= idx; --i) {
          item = items[i];
          if (comparator(items[i], i, items)) {
            records.unshift(item);
            indices.unshift(i);
            items.splice(i, 1);
          }
        }
      }

      this.trigger('remove', records, indices);
      return records;
    },

    // TODO:有问题
    itemAdded: function (item, index) {
      if (item instanceof Exact.Component) {
        var _this = this;
        item.on('release', function(){
          _this.remove([item], 'item');
        });
      }
    },

    itemRemoved: function (item, index) {}

  });

})();
//##############################################################################
// src/core/controls/Control.js
//##############################################################################
Exact.Control = (function () {
  'use strict';
  /**
   * 视图控件，具有生命周期，可注入Context和Skin，可含子控件或Skin子件。
   * TODO:可替换的Skin；特性连接微渲染器或adapter
   */

  /*exact.core.controls.Control =*/
  var ObjUtil = Exact.ObjectUtil, TickerUtil = Exact.TickerUtil;

  //var base = Exact.Component.prototype;

  return Exact.defineClass({
    //TYPE: 'Exact.Control',
    constructor: function Control(paras) {
      Exact.Component.apply(this, arguments);
    },
    extend: Exact.Component,
    
    get ctx() {
      return this._context;
    },

    get context() {
      return this._context;
    },

    set context(value) {
      if (this._context === value) { return; }

      if (this.initialized) {
        // TODO:部分清理
        this.release();
        console.log(this._agent);
        //Exact.BindingUtil.unbind(this, this.context);
      }

      this._context = value;

      if(this.initialized){
        // 恢复resume
        this.read();
        this.ready();
        this.refresh();
      }
    },
    

    //visible:true,

    register: function() {
      this._bindings = {};
      this._commands = {};

      //this._dirty = {};

      this.set({
        /**
         * 模板，可注入。未在构造函数注入$skin时，由模板生成$skin。
         * @type {string|Exact.Skin}
         */
        //template: '',
        /**
         * 皮肤，未在构造函数注入$skin时，由模板生成$skin。TODO:方法注入
         * @type {Exact.Skin|string} Skin对象，或选择器
         */
        $skin: null,
        /**
         * 部件，Exact.Control
         * @protected
         */
        //_parts: {},
        //
        //children: [],
        /**
         * 渲染器，Exact.Control子类或子类名。TODO:放这里真的好吗？或adapter(Android)
         * @type {string|Exact.Control}
         */
        //renderer: '',//或类引用
        // 状态
        //states: [['normal', 'disable']],//'selected hover'
        _stateCode:[],
        _stateCodeDelta:[],
        // 是否被选中
        selected: false,
        // 是否已初始化
        initialized: false,
        // 索引
        index: 0,
        /**
         * 需要渲染否，首次必刷新
         * @protected
         */
        _toRefresh: true,
        /**
         * 数据模型上下文。
         * @type {Object|Exact.Context}
         * @protected
         */
        _context: null//,
        /**
         * 脏标记，记录旧值
         * @protected
         */
        //_dirty: {}
      })
    },

    /**
     * 逻辑开始的地方。TODO:剥离$skin,context相关逻辑。
     * @param {Object} paras 属性键/值对
     */
    initialize: function(paras) {
      this.initSkin(paras.$skin, paras.template);
      if ('$skin' in paras) { delete paras.$skin; }
      if ('template' in paras) { delete paras.template; }
      //if(!this.declared) {
      this.set(paras);
      //}//this.setParas(paras, { ignore: { '$skin': 1, 'template': 1 } });

      // this.resume=function(){
      this.read();
      this.ready();
      this.refresh();//this.render();
      //}
      //return this;
      this.initialized = true;
    },

    /**
     * 初始化皮肤，未在构造函数注入$skin时，由模板生成$skin。
     * TODO:剥离部件初始逻辑,只初始化部件皮肤。
     * @param {string|Exact.Skin} $skin
     * @param {string|Exact.Skin} template
     */
    initSkin: function($skin, template) {
      //var this.declared = (!!this.$skin || !!$skin);
      if (template) { this.template = template ; }
      else { this.template || (this.template = Exact.Templates[this.TYPE]); }

      if ($skin) { this.$skin = $skin; }
      else { this.$skin || (this.$skin = (new Exact.Skin(this.template)).clone()); }

      if (typeof $skin === 'string') { this.$skin = (new Exact.Skin(this.$skin)); }

      this._agent = this.$skin; // Always like this

      this.initParts();
    },

    /**
     * 初始化部件。TODO:剥离部件初始逻辑,只初始化部件皮肤；要遍历扫描吗？
     */
    initParts: function() {
      var selector, name, type, $part, part, parts = this._parts;
      //this.children = [];
      for (name in parts) {
        if (!parts.hasOwnProperty(name)) { continue; }

        selector = parts[name];
        $part = this.$skin.find(selector);

        if ($part.length === 1) {
          type = $part.attr('data-type');
          var ClassRef = ObjUtil.final(type);

          if (ClassRef) { part = new ClassRef({ $skin: $part }); }
          else { part = $part; }

          this[name] = part;
          //this.children.push(part);
        }
      }
    },

    /**
     * 从皮肤中解读声明的配置信息。TODO:要遍历扫描吗？dom操作信息？
     */
    read: function() {
      var duty,name, part, parts = this._parts;

      for (name in parts) {
        if(parts.hasOwnProperty(name)) {
          part = this[name];
          //if(data-task){
          if (part instanceof Exact.Control) {
            // 将任务分配给子控件，作为其职责
            duty = part.$skin.attr('data-task');
            duty = JSON.parse(duty);

            part.handle(duty, this);
          } /*else if (part instanceof Exact.Skin) {
            // 只向Skin子件添加事件处理器
            duty = part.data('task');
            this.listen(part, duty);
          }*/
          //}esle{_initArguments(data-args),_initEvents(data-evts),_initBinds(data-bnds),_initCommands(data-cmds)}
          /*
           data-paras/data-props
           data-task/data-duty/data-init/data-cfgs='{
           'paras':{

           },
           'acts':{

           },
           'bnds':{

           },
           'cmds':{

           }
           }'
           */
        }
      }

      duty = this.$skin.attr('data-duty');
      duty = JSON.parse(duty);

      this.handle(duty, this);
      // TODO:还要解析初始状态码
      //this.readState();
    },

    /**
     * 初始化完毕，准备就绪。此处，可添加事件、绑定、命令等逻辑。
     */
    ready: function() {},

    /**
     * 刷新以完成渲染和清理。确有属性被污染时，由TickerUtil批量调用此方法。也可手动刷新。
     * TODO: refresh(force);添加自动渲染块。
     */
    refresh: function() {
      // Means if this.id in Exact.ControlsToRefresh
      if (!this._toRefresh) { return this; }
      //this.refreshState();
      this.render();
      this._dirty = {};
      this._toRefresh = false;

      return this;
    },

    /**
     * 渲染，手动。
     */
    render: function() {},

    /**
     * 释放。清理事件、绑定等，包括释放子控件。TODO:pause时不要完全清理，只清理部分内容。
     */
    release: function() {
      var name, part, parts = this._parts;// this.children;
      //console.log(this.guid,Object.keys(parts));
      for (name in parts) {
        if (parts.hasOwnProperty(name)) {
          part = this[name];
          if (part instanceof Exact.Control) {
            part.release();
          } else if (part instanceof Exact.Skin) {
            part.off();
          }
        }
      }

      Exact.BindingUtil.unbind(this, this.context);

      this.off();

      this._bindings = {};
      this._commands = {};

      this.trigger('release');
    },

    /**
     * 管理DOM的class。TODO:改良；transit?
     * @param {string} state
     * @param {number} group
     */
    go: function (state, group) {

      var i, j, cnt, len, states, groups = this.states, $skin = this.$skin;

      for (i = 0, cnt = groups.length; i < cnt; i ++) {

        if (group !== undefined) { i = group; } // 免得苦苦查找

        states = groups[i];

        len = states.length;

        if (group === undefined) {

          for(j = 0; j < len; j ++) {

            if (state === states[j]) { break; }

          }

          if (j >= len) { continue; }

        }

        //this._stateCodeDelta[i] = j - this._stateCode[i];

        //this.refreshState();
        // TODO:要不要延后？
        for (j = 0; j < len; j ++) {

          if ($skin.hasClass(states[j])) {

            $skin.removeClass(states[j]);

          }

        }

        $skin.addClass(state);

        //this.set('state', state);
        //this.invalidate('state');

        break;

      }

      return this;

    },

    readState: function () {

      var stateCode = this._stateCode = [],
        stateCodeDelta = this._stateCodeDelta = [];

      var i, j, cnt, len, states, groups = this.states, $skin = this.$skin;

      for (i = 0, cnt = groups.length; i < cnt; i ++) {

        states = groups[i];

        stateCode[i] = 0;

        stateCodeDelta[i] = 0;

        for (j = 0, len = states.length; j < len; j++) {

          if ($skin.hasClass(states[j])) {

            stateCode[i] = j;

            break;

          }

        }

      }

    },

    refreshState: function () { // TODO:延迟切换State，存在不良反应，blur,focus

      if (!this.isDirty('state')) { return; }

      var i, len, code, delta, states, $skin = this.$skin,
        stateCode = this._stateCode, stateCodeDelta = this._stateCodeDelta;

      for (i = 0, len = stateCode.length; i < len; i++) {

        delta = stateCodeDelta[i];

        if(delta) {

          states = this.states[i];

          code = stateCode[i];

          $skin.removeClass(states[code]);

          stateCode[i] += delta;

          code = stateCode[i];

          $skin.addClass(states[code]);

        }

      }

    },

    /**
     * 对于Skin子件，为其添加事件处理器。
     * @param {Exact.Skin} part
     * @param {Object} actions
     */
    listen: function (part, actions) {

      var action, handler, type;

      for (type in actions) {
        //console.log('listen', part, type);
        if(actions.hasOwnProperty(type)) {

          action = actions[type];

          if (typeof action === 'function') {

            handler = action;

          } else {

            handler = Exact.proxy(this, action);

          }
          //正则表达式
          //type = type.replace(' ', '.all ') + '.all';

          part.on(type , handler);

        }

      }

    },

    /**
     * 检查某个特性是否已脏。TODO:isDirty(attr,exactly),同一次循环内，多次赋值，最后确实脏了没有。
     * @param {string} key 特性名，也可为一般属性，只要invalidate(prop)
     * @returns {boolean}
     */
    isDirty: function (key) {
      if (arguments.length<1) { return (key in this._dirty); }
      else { return (Exact.ObjectUtil.keys(this._dirty).length > 0); }
    },

    /**
     * 标记attr为无效，投入_dirty，并送入TickerUtil待渲染缓冲
     * @param {string} key 特性名，也可为一般属性
     * @param {*} value 新值
     */
    invalidate: function(key, value) {
      if (!this._dirty) { this._dirty = {}; }
      this._dirty[key] = this[key];

      if (!this._toRefresh) {
        this._toRefresh = true;
        TickerUtil.push(this);//@todo push(cache-cmd)
      }
    }/*,

    fire: function (fn, key, value) { // attr, css, data, prop

      if (typeof fn !== 'string') { return this; }

      if (typeof key === 'object' || value) {

        this.$skin[fn](key, value);

        return this;

      }

      return this.$skin[fn](key);

    },
    // 不该这样
    attr: function (key, value) { return this.fire('attr', key, value); },

    css: function (key, value) { return this.fire('css', key, value); },

    data:function (key, value) { return this.fire('data', key, value);},

    prop: function (key, value) { return this.fire('prop', key, value); }*/

  });

})();

(function () {

  'use strict';
  /**
   * 集合控件，包含一组相似的子控件内容。TODO: children=_parts=[]? 尚未完善。
   */

  var ObjUtil = Exact.ObjectUtil;

  /*exact.core.controls.CollectionControl =*/
  Exact.CollectionControl = Exact.defineClass({

    //TYPE: 'Exact.CollectionControl',
    constructor: function CollectionControl(paras) {

      Exact.Control.apply(this, arguments);

      //this._parts = {}; // = []?

    }, extend: Exact.Control,

    wrapper: '<div></div>',// TODO: 多余?
    
    get length() { return this.items ? this.items.length : 0; },
    
    register: function() {
      Exact.Control.prototype.register.call(this);
      this.items = [];
      this.children = [];
      this.selectedIndex = -1;
    },

    read: function () {
      // TODO:在这里确定this.renderer，允许动态修改吗
      if(!this.isDirty('items')) { this.readItems(); }

    },
    // TODO:应该在initialize最后，侦听items上的事件，invalidate('items')或其他方式
    render: function () {
      if(this.isDirty('items')) { this.renderItems(); this.read();}
    },

    readItems: function () {
      var i, len, type, $item, item, items = [],
        renderer = this.$skin.data('renderer'),
        $items = this.$skin.children(),
        $wrapper = new Exact.Skin(this.wrapper);

     /* if ($items.length < 1 && $wrapper[0])  {

        $items = this.$skin.find($wrapper[0].tagName);

      } else if ($wrapper.length) {

        $items = $items.children();

      }*/

      len = $items.length;
      if (len < 1) { return; }

      var ClassRef = ObjUtil.final(renderer);

      if (ClassRef) {
        if (renderer) { this.renderer = renderer; }
        for (i = 0; i < len; ++i) {
          $item = $items.eq(i);
          item = new ClassRef({ $skin: $item });
          items.push(item.context);
        }
      } /*else { // TODO:也许该一样

       $item = $items.eq(0);

       type = $item.data('type');

       if (!type) {

       $item = $($item.html());

       type = $item.data('type');

       }

       ClassRef = Exact.findRef(type);

       if(ClassRef) {

       for (i = 0; i < len; ++i) {

       item = new ClassRef({ $skin: $item });

       items.push(item); // TODO:items不该存放控件，只应存放数据

       }

       } else { items = $items; }

       }*/

      this.items.insert(items);
      //console.log(this.items);
    },

    /**
     * 以最小的代价完成渲染。复用子控件，动态绑定items
     * TODO: 单纯添加删除时，可考虑成片插入移除。
     */
    renderItems: function () {
      var i, len, cnt, end, item, items, $item, $list, $wrapper, control, ClassRef,
        $items = [], renderer = this.renderer, children = this.children;

      $list = this.$skin.find('.items');

      if ($list.length < 1)  { $list = this.$skin; }

      items = this.items;

      len = items.length;
      cnt = this.children.length;
      end = cnt < len ? cnt : len; // 当前已有的子控件数目

      for (i = 0; i < end; ++i) {
        control = children[i];
        control.set({context: items.at(i)}); // 重新注入context
      }

      if (cnt > len) { // 发现有多余的子控件，安全移除
        for (i = cnt - 1; i >= len ; --i) {
          control = children.splice(i, 1)[0];
          control.release();
          control.$skin.remove();
        }
      } else if (cnt < len) { // 发现需要增加子控件，则实例化并注入context
        //console.log('renderItems end',this.renderer);
        if (renderer && (ClassRef = ObjUtil.final(renderer))) {
          //console.log('renderer',renderer,length);
          for (i = cnt; i < len; ++i) {
            item = items.at(i);
            control = new ClassRef({ context: item });
            $item = control.$skin;

            $items.push($item);
            children.push(control);
          }
        }

        len = $items.length;
        if (len < 1) { return; } // TODO: 多余

        //$temp = [];//$list.clone();

        //var fragment = document.createDocumentFragment();

        var $frag = new Exact.Skin(document.createDocumentFragment());

        if (this.wrapper) {
          $wrapper = (new Exact.Skin(this.wrapper)).addClass('item');
          for (i = 0; i < len; ++i) {
            //$temp.append($wrapper.clone().html($items[i]));
            //$temp.push($wrapper.clone().html($items[i]));
            //fragment.appendChild($wrapper.clone().html($items[i])[0]);
            $frag.append($wrapper.clone().html($items[i]));
          }
        } else {
          for (i = 0; i < len; ++i) {
            $item = $items[i];
            //$temp.append($item.addClass('item'));
            //$temp.push($item.addClass('item'));
            //fragment.appendChild($item.addClass('item')[0]);
            $frag.append($item.addClass('item'))
          }
        }

        //$list.append(fragment);
        $list.append($frag);
      }
    }/*,
    TODO: 不太好
    insert: function (children) {

      if(!this.children) { this.children = []; }

      for (var i = 0, len = children.length; i < len; ++i) {

        this.children.push(children[i]);

      }

    },

    remove: function () {

      if (arguments[0] === 'all') {

        var i, child, children = this.children;

        for (i = children.length - 1; i >= 0; i --) {

          child = children[i];

          if (child instanceof  Exact.Control) {

            child.release();

          }

        }

        children.splice(0);

      }

    }*/

  });

})();