// minimap scroller

(function(){

  

  //we start assuming that we will use fractionalScrolling
  var scrollMode = false;
  var HEIGHT = "height";
  var PX = "px";
  //We curry the scroll method because the factor and px variables
  //don't change often.
  function setupScrollAction(factor,px){
    return function(show,ss,watch){
      var st = watch.scrollTop;
      if (scrollMode){
        ss.scrollTop = st;
      }
      //$show.stop().css({"marginTop": (st*factor) + px} );
      show.style.marginTop = (st*factor) +px;
    };
  }

  //We curry the click method because the factor
  //don't change often.
  function setupClickAction(factor,show,watch,doScroll){
    return function(event,ss){
      event.preventDefault();
      var offset = ss.offsetParent.offsetTop;
      watch.scrollTop = (event.pageY-offset)/factor;
      doScroll(show,ss,watch);
    };
  }
  var miniMapDefault = {
    scrollBar: ".CodeMirror-scrollbar",
    keepScripts: false,
    miniMapCSS: {
      "width": "100px",
      "max-height":"300px",
      "opacity": "0.5",
      "position": "absolute",
      "right": "0",
      "top": "0",
      "cursor": "default",
      "color": "#000",
      "overflow":"hidden",
      "font-size": "4px",
      "line-height":"4px",
      "z-index": "9"
    },
    miniMapBarCSS: {
      "width": "100px",
      "height": "40px",
      "opacity": "0.5",
      "cursor": "default",
      "background-color":"#aaa",
      "position": "absolute",
      "right":"0",
      "top":"0",
      "z-index": "9"
    }
  };
  /**
   * @miniMap
   * @public
   *
   */
  function MiniMap (options){
    if (!options){
      return this;
    }
    this.options = miniMapDefault;
    this.options.scrollBar = options.scrollBar || this.options.scrollBar;
    this.options.keepScripts = options.keepScripts || this.options.keepScripts;
    this.options.content = options.content || this.options.content;
    this.initScrollBar();
    this.displayMiniMap();
    this.restOfSetup();
  }

  MiniMap.prototype = {
    initScrollBar: function() {
        //This will return the first match. = $watch
      this.scrollBar = document.querySelector(this.options.scrollBar);
    },
    displayMiniMap: function(){
      //create our control
      this.miniMap = document.createElement("div");
      for(var style in this.options.miniMapCSS){
        this.miniMap.style[style] = this.options.miniMapCSS[style];
      }

      this.miniMapBar = document.createElement("div");
      for(var barStyle in this.options.miniMapBarCSS){
        this.miniMapBar.style[barStyle] = this.options.miniMapBarCSS[barStyle];
      }
      //insert into DOM
      var scrollBarParent = this.scrollBar.parentNode;
      var scrollBarSibling = this.scrollBar.nextSibling;
      scrollBarParent.insertBefore(this.miniMap, scrollBarSibling);
      scrollBarParent.insertBefore(this.miniMapBar, scrollBarSibling);

      //We need to modify the style to match where it was placed in the DOM.
      var scrollBarStyles = window.getComputedStyle(this.scrollBar, null);
      if (!scrollBarStyles){
        scrollBarStyles = this.scrollBar.style;
      }
      this.miniMap.style.maxHeight = scrollBarStyles.height;

      //we take the scroll bar width and offset the minimap
      //this calculation works, but it's not an exact science
      var scrollBarWidth = (this.scrollBar.offsetWidth - unPx(scrollBarStyles.width))+"px";
      this.miniMap.style.right = scrollBarWidth;
      this.miniMapBar.style.right = scrollBarWidth;
    },
    /*
    var doScroll = null;
    var doClick = null;
    */
    mirrorContent: function(){
      var factor, max, avail;
      //we have to clone to new content because we need to
      //remove any elements that might distort the scrollHeight
      //of our source pane
      var newContentDOM = document.querySelector(content).cloneNode(true);
      
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

      scrollMode = this.miniMap.scrollHeight > ssHeight+1;
      
      max =this.scrollBar.scrollHeight - watchHeight;
      avail = ssHeight - showHeight;
      avail = avail > 0 ? avail : 0;
      factor = avail/max;
      //mmm...curry.
      doScroll = setupScrollAction(factor,PX);
      doClick = setupClickAction(factor,this.miniMapBar,this.scrollBar,doScroll);
    },
    restOfSetup: function(){
      content = this.options.content;
      //soon this can be removed

      this.mirrorContent();
      var mm = this;
      //when we scroll, do the current scroll function
      addEventHandler(mm.scrollBar,"scroll",function(){
        doScroll(mm.miniMapBar,mm.miniMap,mm.scrollBar);
      });

      addEventHandler(mm.miniMap,"mousedown",function(event){
        doClick(event,mm.miniMap);
      });

      var mouseMoveDocumentFcn = function(event){
           doClick(event,mm.miniMap);
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

  this.miniMap = MiniMap;
}).call(this);