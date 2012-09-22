// minimap scroller

(function(){
  /**
   * @miniMap
   * @public
   *
   */
  function MiniMap (options){
    //we start assuming that we will use fractionalScrolling
    this.scrollNormally = false;
    this.options = extend({},this.miniMapDefaults);
    extend(this.options,options);
    //get the scroll element we watch
    this.initScrollBar();
    //create and display the minimap
    this._displayMiniMap();
    //match the content we're watching and create event functions
    //based on the content
    this.mirrorContent();
    //register all the events
    this._registerEvents();
  }

  MiniMap.prototype = {
    initScrollBar: function() {
        //This will return the first match for the scrollBar selector
      this.scrollBar = document.querySelector(this.options.scrollBar);
    },
    miniMapDefaults: {
      scrollBar: ".CodeMirror-scrollbar",
      content: ".CodeMirror-lines",
      keepScripts: false,
      miniMapStyles: {
        //these styles can be overriden
        //in the constructor
        "width": "100px",
        "opacity": "0.5",
        "right": "0",
        "top": "0",
        "color": "#000",
        "fontSize": "4px",
        "lineHeight":"4px",
        "zIndex": "9",
        //these styles shouldn't need to be changed
        "cursor": "default",
        "position": "absolute",
        "overflow":"hidden"
      },
      miniMapBarStyles: {
        //these styles can be overriden
        //in the constructor
        "width": "100px",
        "height": "40px",
        "opacity": "0.5",
        "backgroundColor":"#aaa",
        "right":"0",
        "top":"0",
        "zIndex": "9",
        //these styles shouldn't need to be changed
        "position": "absolute",
        "cursor": "default"
      }
    },
    _displayMiniMap: function(){
      //create the div to display the minimap
      this.miniMap = document.createElement("div");
      for(var style in this.options.miniMapStyles){
        this.miniMap.style[style] = this.options.miniMapStyles[style];
      }
      //create the minimap highlight bar
      this.miniMapBar = document.createElement("div");
      for(var barStyle in this.options.miniMapBarStyles){
        this.miniMapBar.style[barStyle] = this.options.miniMapBarStyles[barStyle];
      }
      //insert into DOM
      var scrollBarParent = this.scrollBar.parentNode;
      var scrollBarSibling = this.scrollBar.nextSibling;
      scrollBarParent.insertBefore(this.miniMap, scrollBarSibling);
      scrollBarParent.insertBefore(this.miniMapBar, scrollBarSibling);

      //We need to modify the style to match where it was placed in the DOM.
      //namely the height.
      var scrollBarStyles = window.getComputedStyle(this.scrollBar, null);
      if (!scrollBarStyles){
        scrollBarStyles = this.scrollBar.style;
      }
      this.miniMap.style.maxHeight = scrollBarStyles.height;

      //we take the scroll bar width and offset the minimap
      //this calculation works, but it's not an exact science
      //Does not work in FF
      var scrollBarWidth = (this.scrollBar.offsetWidth - unPx(scrollBarStyles.width))+"px";
      this.miniMap.style.right = scrollBarWidth;
      this.miniMapBar.style.right = scrollBarWidth;
    },
    mirrorContent: function(){
      var factor, max, avail;
      //we have to clone to new content because we need to
      //remove any elements that might distort the scrollHeight
      //of our source pane
      var newContentDOM = document.querySelector(this.options.content).cloneNode(true);
      
      //Here we null-ify any top or bottom settings
      removeStyle(newContentDOM,"top");
      removeStyle(newContentDOM,"bottom");

      //then we take the new html
      var newContent = newContentDOM.innerHTML;

      //we escape or discard any script tags because we don't want to deal with them
      if (this.keepScripts){
        newContent = newContent.replace(/<script/g,"&lt;script").replace(/\\script/g,"&lt;script");
      }else{
        var indx = newContent.indexOf("<script");
        var part1="",
        end = "";

        while(indx >= 0){
          part1 = newContent.slice(0,indx);
          end = newContent.indexOf("</script>",indx);
          newContent = part1 + (end > 0 ? newContent.slice(end) : "");
          indx = newContent.indexOf("<script");
        }
      }
      this.miniMap.innerHTML = newContent;
      //check if we should be fractionally scrolling (false),
      // or normal scrolling (true)
      var ssHeight = unPx(window.getComputedStyle(this.miniMap, null).height);
      var showHeight = unPx(window.getComputedStyle(this.miniMapBar, null).height);
      var watchHeight = unPx(window.getComputedStyle(this.scrollBar, null).height);

      this.scrollNormally = this.miniMap.scrollHeight > ssHeight+1;
      
      max =this.scrollBar.scrollHeight - watchHeight;
      avail = ssHeight - showHeight;
      avail = avail > 0 ? avail : 0;
      factor = avail/max;
      //mmm...curry.
      this._doScroll = this._setupScrollAction(factor);
      this._doClick = this._setupClickAction(factor,this.miniMapBar,this.scrollBar,this._doScroll);
    },
    _registerEvents: function(){
      var mm = this;
      //when we scroll, do the current scroll function
      addEventHandler(mm.scrollBar,"scroll",function(){
        mm._doScroll(mm.miniMapBar,mm.miniMap,mm.scrollBar);
      });

      addEventHandler(mm.miniMap,"mousedown",function(event){
        mm._doClick(event,mm.miniMap);
      });

      var mouseMoveDocumentFcn = function(event){
           mm._doClick(event,mm.miniMap);
      };
      var mouseUpDocumentFcn = function(event){
          event.preventDefault();
          removeEventHandler(document.body,"mousemove",mouseMoveDocumentFcn);
          removeEventHandler(document.body,"mouseup",mouseUpDocumentFcn);
      };
      var mouseDownMiniMapBarFcn = function(event){
        event.preventDefault();
        addEventHandler(document.body,"mouseup",mouseUpDocumentFcn);
        addEventHandler(document.body,"mousemove",mouseMoveDocumentFcn);
      };
      
      addEventHandler(mm.miniMapBar,"mousedown",mouseDownMiniMapBarFcn);
    },
    _setupScrollAction: function (factor){
      //We curry the scroll method because the factor
      //don't change often.
      return function(show,ss,watch){
        var st = watch.scrollTop;
        if (this.scrollNormally){
          ss.scrollTop = st;
        }
        show.style.marginTop = (st*factor) +"px";
      };
    },
    _setupClickAction: function (factor,show,watch,doScroll){
      //We curry the click method because the factor
      //don't change often.
      return function(event,ss){
        event.preventDefault();
        var offset = ss.offsetParent.offsetTop;
        watch.scrollTop = (event.pageY-offset)/factor;
        this._doScroll(show,ss,watch);
      };
    }
  };

  //Helper functions

  //cross browser event handling
  //http://www.javascripter.net/faq/addeventlistenerattachevent.htm
  function addEventHandler(elem,eventType,handler) {
   if (elem.addEventListener)
       elem.addEventListener (eventType,handler,false);
   else if (elem.attachEvent)
       elem.attachEvent ('on'+eventType,handler);
  }

  function removeEventHandler(elem,eventType,handler) {
   if (elem.removeEventListener)
       elem.removeEventListener (eventType,handler,false);
   else if (elem.detachEvent)
       elem.detachEvent ('on'+eventType,handler);
  }

  function removeStyle(elem,style){
    if(elem.children.length > 0){
      for (var i = 0; i < elem.children.length; i++)
        removeStyle(elem.children[i],style);
    }
    elem.style.removeProperty(style);
  }

  function unPx(pixelValue){
    return parseFloat(pixelValue.replace("px"),"");
  }

  function extend(into,from) {
      if (null === into || "object" !== typeof into) throw Error("destination of extend must exist.");
      if (null === from || "object" !== typeof from) return from;
      for (var attr in from) {
          if (from.hasOwnProperty(attr)) into[attr] = from[attr];
      }
      return into;
  }

  this.miniMap = MiniMap;
}).call(this);