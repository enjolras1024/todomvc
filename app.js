/**
 * Created by Chen Junyong on 2015/2/22.
 */
'use strict';
var ENTER_KEY = 13;
var ESC_KEY = 27;

var Enj = {};

var $ = jQuick;//jQuery;//;

(function(){

  Enj.TodoItem = Exact.defineClass({
    /*attrs:{
      title:"",
      completed:false,
      visible:true
    },*/
    constructor: function TodoItem() {
      this.set({
        title: "",
        completed: false,
        visible: true
      });
      Exact.Context.apply(this, arguments);
    },
    extend: Exact.Context,
    ready:function() {
      this.destroyCmd = new Exact.Command("destroy", this);
    },
    destroy: function(note, sender) {
      this.release();
    }
  });
})();

(function() {
  var base = Exact.Collection.prototype;

  var comparator=function(item){ return item.completed; };

  Enj.TodoItems = Exact.defineClass({
    constructor: function TodoItems() {
      Exact.Collection.apply(this, arguments);
    },
    extend: Exact.Collection,
    get completedCount() {
      //this._count=this.select(comparator).length;
      return this.select(comparator).length;
    },
    clearCompleted:function() {
      this.remove(comparator);
    },
    onChange:function() {
      this.trigger("countChange");
    },
    itemAdded:function(item, index) {
      base.itemAdded.call(this,item,index);
      if( item instanceof Exact.Component ) {
        item.on( "change:completed", $.proxy(this,"onChange"));
      }
    }
  });
})();

(function(){

  var base = Exact.Control.prototype;
  Enj.TodoRenderer = Exact.defineClass({
    /*constructor: function TodoRenderer() {
      Exact.Control.apply(this, arguments);
    },*/
    extend: Exact.Control,
    //destroyCmd:null,
    template: (new $('#item-template')).html(),//$('#item-template').html(),
    states: [
      ["normal","editing"],
      ["active","completed"]
    ],

    _parts: {
      $toggle:'[data-name="$toggle"]',
      $title:'[data-name="$title"]',
      $destroy:'[data-name="$destroy"]',
      $edit:'[data-name="$edit"]'
    },//["$toggle","$title","$destroy","$edit"],// TODO:自动查找data-name
    //parts:["$toggle","$title",...] $("[data-name='']")
    register: function() {
      base.register.call(this);
      this.set({
        title:"",
        completed:false,
        visible:true
      });
    },
    ready: function() {
      base.ready.call(this);

      this.handle({
        destroyCmd: "ctx.destroyCmd!",
        visible: "-ctx.visible",
         completed: "=ctx.completed",
         title: "=ctx.title"
      }).direct({
        $title:{
          dblclick: "editing"
        },
        $toggle:{
          click: "toggle"
        },
        $destroy:{
          click: "destroy"
        },
        $edit:{
          blur: "onBlur",
          keypress: "onEnter",
          keydown: "onEsc"
        }
      });

      //this.on( "change:completed",function(){console.log("completed");});
     //console.log(this._agent);
      //this.trigger('change:completed');
    },
    editing: function() {
      this.go("editing");
      this.$edit.val(this.title).focus();
    },
    toggle: function() {
      //console.log(this.completed);
      this.set({completed:!this.completed});
      //console.log(this.completed);

    },
    destroy: function() {

      //this.send(this.destroyCmd);
      this.send("destroyCmd");

      this.release();
    },
    onBlur: function(evt) {
      this.go("normal");

      var title = this.$edit.val().trim();
      if (title) {
        this.set({title:title});
      } else {
        this.destroy();
      }
    },
    onEnter: function(evt) {
      if (evt.which === ENTER_KEY) {
        this.onBlur();
      }
    },
    onEsc: function(evt) {
      if (evt.which===ESC_KEY) {
        this.go("normal");
        this.$edit.val(this.title);
      }
    },
    render: function() {
      //console.log('render',this.isDirty("title"));
      if (this.isDirty("visible")) { this.renderVisible(); }
      if (this.isDirty("title")) { this.renderTitle();}
      if (this.isDirty("completed")) { this.renderCompleted(); }
      //console.log("rr");
    },
    renderVisible: function() {
      if (this.visible) {
        //this.$skin.show();
        this.$skin.css({display: 'block'});
      } else {
        //this.$skin.hide();
        this.$skin.css({display: 'none'});
      }
    },
    renderTitle: function() {
      this.$title.text(this.title);
    },
    renderCompleted: function() {
      this.$toggle.prop({checked: this.completed});

      var state = this.completed ? "completed":"active";

      this.go(state);
    }
  });
})();

(function() {
  Enj.TodoAdder = Exact.defineClass({
    constructor: function TodoAdder() {
      this.title = "";
      Exact.Control.apply(this, arguments);
    },
    extend: Exact.Control,
    ready: function() {
      this.handle({
        keyup:"onKeyPress()"
      });
    },
    render: function() {
      this.$skin.val(this.title);
      return this;
    },
    onKeyPress: function(evt) {
      var title=this.$skin.val().trim();
      if (evt.which === ENTER_KEY && title) {
        this.set({title:title}).set({title:''});
      }
    }
  });
})();

(function() {
  Enj.StatsBar = Exact.defineClass({
    constructor: function StatsBar() {
      this.set({
        remainingCount: 0,
        completedCount: 0,
        filter: "all"
      });
      Exact.Control.apply(this, arguments);
    },
    extend: Exact.Control,
    //TYPE:"Enj.StatsBar",
    template: new $('#stats-template').html(),//$('#stats-template').html(),

    _parts:{
      $label: "#todo-count",
      $filters: "#filters",
      $button: "#clear-completed"
    },
    ready: function() {

      var _this = this;
      var $btns = this.$filters.findAll("a");
      $btns.forEach(function ($btn) {
        $btn.on("click", function(evt) {
          //var $btn=new $(evt.target);//$(evt.target);
          $btns.forEach( function( $b ) {
            $b.removeClass("selected");
          });

          $btn.addClass("selected");
          _this.set({filter:$btn.text().toLowerCase()});

        })
      });
      /*var $btns=this.$filters.find("a");
      $btns.on("click",function(evt){
        var $btn=new $(evt.target);//$(evt.target);
        $btns.removeClass("selected");
        $btn.addClass("selected");
        _this.set("filter",$btn.text().toLowerCase());

      });*/
      this.direct({
        $button: {
          click: function(evt) { _this.trigger("clear");}
        }
      });

      //this.$button.hide();
      this.$button.css({display: 'none'});

    },
    render: function() {

      if (this.isDirty("remainingCount")) { this.renderRemainingCount(); }
      if (this.isDirty("completedCount")) { this.renderCompletedCount(); }

      if (this.remainingCount === 0 && this.completedCount === 0) {
        this.$skin.css({display: 'none'});
      }else{
        this.$skin.css({display: 'block'});
      }

      return this;
    },
    renderRemainingCount: function() {

      var content = "<strong>" + this.remainingCount + "</strong>";

      if (this.remainingCount > 1) {
        content += " items left";
      }else{
        content += " item left";
      }

      this.$label.html(content);

    },
    renderCompletedCount: function() {

      var count = this.completedCount;

      if (count > 0) {
        var content = "Clear completed(" + this.completedCount + ")";
        this.$button.html(content);
        //this.$button.show();
        this.$button.css({display: 'block'});
      } else {
        //this.$button.hide();
        this.$button.css({display: 'none'});
      }

    }
  });
})();

(function() {
  var base = Exact.CollectionControl.prototype;
  Enj.TodoList = Exact.defineClass({
    //TYPE:"Enj.TodoList",
    extend: Exact.CollectionControl,
    wrapper: "",
    renderer: "Enj.TodoRenderer",
    render: function() {
      base.render.call(this);
      if (this.items && this.length > 0) { this.$skin.css({display: 'block'}); }
      else { this.$skin.css({display: 'none'}); }
    }
  });
})();

var items;

(function() {//(import)var Control = Exact.Control, TodoItem = Enj.TodoItem;
  Enj.App = Exact.defineClass({
    //TYPE:"Enj.App",
    constructor: function App() {
      this.set({allChecked:false});
      Exact.Control.apply(this, arguments);
    }, extend: Exact.Control,
    _parts: {
      input: "#new-todo",
      stats: "#footer",
      todos: "#todo-list",
      $checkBox: "#toggle-all"
    },
    ready: function() {
      this.items = new Enj.TodoItems();

      this.todos.set({items: this.items});

      this.direct({
        input: {
          "change:title": "add()"
        },
        stats: {
          clear: "clear()",
          "change:filter": "filter()"/*,
          completedCount:"-items.completedCount"*/
        },
        $checkBox: {
          click: "toggleAll"//click:"toggleAll()"
        },
        items: {
          //"insert remove countChange":"update()"
          "insert": "update()",
          "remove": "update()",
          "countChange": "update()"
        }
      });//.filter();

      //this.$checkBox.hide();
      this.$checkBox.css({display: 'none'});
    },
    add: function() {
      this.$checkBox.prop({checked: false});

      var title = this.input.title;
      if (title) {
        var todo = new Enj.TodoItem({title:title});
        this.items.insert([todo]);
        /*setTimeout(function(){
         todo.set({completed:true});
         },3000);*/
      }
    },
    filter: function() {
      var flag = this.stats.filter,
        items = this.items,
        item, i,len, visible;

      if (flag === "all") {
        items.update({"visible":true}, function () { return true; });
      } else {
        for(i = 0, len = items.length; i < len; i++) {
          item = items.at(i);
          visible = item.completed ? (flag === 'completed') : (flag === 'active');
          item.set({visible: visible});
        }
      }
    },
    clear: function() {
      this.items.clearCompleted();
    },
    toggleAll: function() {
      var checked = this.$checkBox.prop("checked");
      this.items.update({completed:checked}, function() {return true;});
    },
    update: function(evt) {
      var count = this.items.completedCount;
      var remain = this.items.length-count;

      this.stats.set({
        completedCount: count,
        remainingCount: remain
      });

      this.set({allChecked: !remain});

      if (this.stats.filter !== "all") {
        this.filter();//问题
      }
      //console.log(evt);
      if (evt.type !== "countChange") {
        this.todos.invalidate("items");
      }

      if (this.items.length) {
        //this.$checkBox.show();
        this.$checkBox.css({display: 'block'});
      } else {
        //this.$checkBox.hide();
        this.$checkBox.css({display: 'none'});
      }
    },
    render: function() {
      //base.render.call(this);
      this.$checkBox.prop({checked: this.allChecked});
    }
  });
})();

var app = new Enj.App({$skin: new $('#todoapp')/*$("#todoapp")*/});
