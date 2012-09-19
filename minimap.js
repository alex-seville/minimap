// minimap scroller

(function(){
  //This is the HTML and css we use for our control.
  var sourceHTML = "<div id='sourceScroll'></div>";
  var indicatorHTML = "<div id='scrollIndicator'></div>";
  var sourceCSS = {
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
  };

  var indicatorCSS = {
    "width": "100px",
    "height": "40px",
    "opacity": "0.5",
    "cursor": "default",
    "background-color":"#aaa",
    "position": "absolute",
    "right":"0",
    "top":"0",
    "z-index": "9"
  };
  //we start assuming that we will use fractionalScrolling
  var scrollMode = false;
  var HEIGHT = "height";
  var PX = "px";
  //We curry the scroll method because the factor and px variables
  //don't change often.
  function setupScrollAction(factor,px){
    return function($show,$ss,$watch){
      var st = $watch.scrollTop();
      if (scrollMode){
        $ss.scrollTop(st);
      }
      $show.stop().css({"marginTop": (st*factor) + px} );
    };
  }

  //We curry the click method because the factor
  //don't change often.
  function setupClickAction(factor,$show,$watch,doScroll){
    return function(event,$ss){
      event.preventDefault();
      var offset = $ss[0].offsetParent.offsetTop;
      $watch.scrollTop((event.pageY-offset)/factor);
      doScroll($show,$ss,$watch);
    };
  }

  /**
   * @miniMap
   * @public
   *
   */
  this.miniMap = function(options){
    if (!options){
      return this;
    }
    var keepScripts = typeof options.keepScripts === 'undefined' ? true : options.keepScripts;
    var $watch = $(options.scrollBar);
    //create our control
    var $ss = $(sourceHTML).css($.extend({},sourceCSS,options.sourceCSS || {}));
    var $show = $(indicatorHTML).css($.extend({},indicatorCSS,options.indicatorCSS || {}));
    //insert into DOM
    $watch.after($show);
    $watch.after($ss);
    //We need to modify the style to match where it was placed in the DOM.
    var $watchHeight = $watch.css(HEIGHT);
    $ss.css("max-height",$watchHeight);
    //we take the scroll bar width and offset the minimap
    var $watchWidth = $watch.css("width");
    $ss.css("right",$watchWidth);
    $show.css("right",$watchWidth);

    var doScroll = null;
    var doClick = null;
    
    function matchSource(){
      var factor, max, avail;
      //we have to clone to new content because we need to
      //remove any elements that might distort the scrollHeight
      //of our source pane
      var newContentDOM = $(options.content).clone();
      //Here we null-ify any top or bottom settings
      newContentDOM.find("[style*='top']").css("top","");
      newContentDOM.find("[style*='bottom']").css("bottom","");
      //then we take the new html
      var newContent = newContentDOM.html();
      //we escape or discard any script tags because we don't want to deal with them
      if (keepScripts){
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
      
      $ss.html(newContent);
      //check if we should be fractionally scrolling (false),
      // or normal scrolling (true)
      var ssHeight = $ss.height();
      scrollMode = $ss.get(0).scrollHeight > ssHeight+1;
      
      max =$watch[0].scrollHeight - $watch.height();
      avail = ssHeight - $show.height();
      avail = avail > 0 ? avail : 0;
      factor = avail/max;
      //mmm...curry.
      doScroll = setupScrollAction(factor,PX);
      doClick = setupClickAction(factor,$show,$watch,doScroll);
    }

    matchSource();
    //when we scroll, do the current scroll function
    $watch.scroll(function(){
      doScroll($show,$ss,$watch);
    });

    $ss.mousedown(function(event){
      doClick(event,$ss);
    });

    $show.mousedown(function(event){
      event.preventDefault();
      $("body").on("mouseup.miniMap",function(event){
        event.preventDefault();
        $("body").off("mousemove.miniMap");
        $("body").off("mouseup.miniMap");
      });
      $("body").on("mousemove.miniMap",function(event){
         doClick(event,$ss);
      });
    });

    return matchSource;
  };
}).call(this);