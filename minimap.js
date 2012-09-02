// minimap scroller

(function(){
  //This is the HTML and css we use for our control.
  var sourceHTML = "<div id='sourceScroll'></div>";
  var indicatorHTML = "<div id='scrollIndicator'></div>";
  var sourceCSS = {
      "width": "100px",
      "max-height":"300px",
      "opacity": "0.5",
      "background-color":"#aaa",
      "position": "absolute",
      "right": "0",
      "top": "0",
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
    "background-color":"#fff",
    "position": "absolute",
    "right":"0",
    "top":"0",
    "z-index": "9"
  };
  //we start assuming that we will use fractionalScrolling
  var scrollMode = false;
  var HEIGHT = "height";
  var PX = "px";
  //We curry the scoll method because the factor and px variables
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

  /**
   * @miniMap
   * @public
   *
   */
  this.miniMap = function(options){
    var $watch = $(options.scrollBar);
    //create our control
    var $ss = $(sourceHTML).css(sourceCSS);
    var $show = $(indicatorHTML).css(indicatorCSS);
    //insert into DOM
    $watch.after($show);
    $watch.after($ss);
    //We need to modify the style to match where it was placed in the DOM.
    $ss.css("max-height",$watch.css(HEIGHT)+PX);
    $ss.css("right",$watch.css("width"));
    $show.css("right",$watch.css("width"));

    var doScroll = null;
    
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
      $ss.html(newContent);
      //check if we should be fractionally scrolling (false),
      // or normal scrolling (true)
      var ssHeight = $ss.height();
      scrollMode = $ss.get(0).scrollHeight > ssHeight+1;
      
      max =$watch[0].scrollHeight - $watch.height();
      avail = ssHeight - $show.height();
      factor = avail/max;
      //mmm...curry.
      doScroll = setupScrollAction(factor,PX);
    }

    matchSource();
    //when we scroll, do the current scroll function
    $watch.scroll(function(){
      doScroll($show,$ss,$watch);
    });

    return matchSource;
  };
}).call(this);