// minimap scroller

(function(){

  var miniMapHTML = "<div id='sourceScroll'></div><div id='scrollIndicator'></div>";
  var miniMapCSS = "             \
    #sourceScroll {              \
        width: 100px;            \
        max-height:300px;        \
        opacity: 0.5;            \
        background-color:#aaa;   \
        position: absolute;      \
        right: 0;                \
        top: 0;                  \
        color: #000;             \
        overflow:hidden;         \
        font-size: 4px;          \
        line-height:4px;         \
        z-index: 9;              \
    }                            \
                                 \
    #scrollIndicator {           \
      width: 100px;              \
      height: 40px;              \
      opacity: 0.5;              \
      background-color:#fff;     \
      position: absolute;        \
      right:0;                   \
      top:0;                     \
      z-index: 9;                \
    }";

    var scrollMode = false;
    var HEIGHT = "height";
    var PX = "px";
    var getHeightValue = function($obj){
      return parseInt($obj.css(HEIGHT).replace(PX,""),10);
    };
    function newStyle(str){
      var pa= document.getElementsByTagName('head')[0] ;
      var el= document.createElement('style');
      el.type= 'text/css';
      el.media= 'screen';
      if(el.styleSheet) el.styleSheet.cssText= str;// IE method
      else el.appendChild(document.createTextNode(str));// others
      pa.appendChild(el);
      return el;
    }
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
* @param {function} compiledTemplate - a compiled template function (the parent template)
* @param {object} renderObj - the Object you are passing into the template
* @param {function} fetchTemplate - callback to fetch the partial view template
*
*/
  this.miniMap = function(options){
    var $watch = $(options.scrollBar);
    $watch.after(miniMapHTML);
    newStyle(miniMapCSS);
    var $show = $("#scrollIndicator");
    var $ss = $("#sourceScroll");
    
    $ss.css("max-height",$watch.css(HEIGHT)+PX);
    $ss.css("overflow","none");

    $ss.css("right",$watch.css("width"));
    $show.css("right",$watch.css("width"));

    var doScroll = null;
    
    function matchSource(){
      var newContent = $(options.content).html();
      console.log("change: "+newContent);
      $ss.html(newContent);
      scrollMode = $ss.get(0).scrollHeight > $ss.height();
      var max =$watch[0].scrollHeight - getHeightValue($watch);
      var avail = getHeightValue($ss) - getHeightValue($show);
      var factor = avail/max;
      doScroll = setupScrollAction(factor,PX);
    }

    matchSource();

    

    $watch.scroll(function(){
      doScroll($show,$ss,$watch);
    });

    return matchSource;
  };
}).call(this);