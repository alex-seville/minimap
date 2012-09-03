var should = chai.Should();

function loremIpsum(lineBreaks){
    var br = lineBreaks ? "<br><Br>" : "";
    return "<span class=\"top\">Lorem</span> ipsum dolor sit amet, consectetur " + br +
        "adipiscing elit. Vestibulum commodo imperdiet " + br +
        "euismod, metus dui blandit nisl, vitae elementum lectus " + br +
        "magna quis ante. <span class=\"middle\">Vestibulum</span> tempus tellus id tellus " + br +
        "vestibulum elementum. Sed vulputate nibh in quam consequat " + br +
        "nulla non eros ultrices ac elementum justo blandit. Sed a nisl quis " + br +
        "velit auctor viverra. Nulla non neque lectus, <span class=\"bottom\">quis</span> fermentum mi.";
}

var $watched = $("#watched-content");

describe('minimap tests', function(){
    
    beforeEach(function(){
        $watched.css("height","50px");
        $watched.html(loremIpsum());        
    });

    afterEach(function(){
        $watched.off("scroll");        
    });

    describe('when created with no params', function(){
        it('should return empty', function(){
          should.exist(miniMap(),"empty object returned");
        });
    });
    describe('when created with some params', function(){
        it('should create the control', function(){
            //setup
            var expected = {
                height: "100px"
            };
            $watched.css("height",expected.height);
            //done setup
            var selector = "#"+$watched[0].id;
            var miniMapControl = miniMap({
                scrollBar: selector,
                content: selector
            });

            var $ss = $("#sourceScroll"),
                $si = $("#scrollIndicator");
            $ss.should.have.length(1);
            $si.should.have.length(1);
            $ss.html().should.equal(loremIpsum());
            $ss.css("max-height").should.equal(expected.height);
            $._data($watched[0], "events").should.have.property("scroll");
            miniMapControl.should.be.a('function');       
        });
        it('should not update until data changed function called', function(){
            var selector = "#"+$watched[0].id;
            var miniMapControl = miniMap({
                scrollBar: selector,
                content: selector
            });
            var expected = loremIpsum();
            
            var $ss = $("#sourceScroll"),
                $si = $("#scrollIndicator");
            //change content
            var result = "new content";
            $watched.html(result);
            $ss.html().should.equal(expected);
            miniMapControl();
            $ss.html().should.equal(result);
        });
        it('should change the scroll indicator position when scrolled', function(){
            var selector = "#"+$watched[0].id;
            var miniMapControl = miniMap({
                scrollBar: selector,
                content: selector
            });
            var $ss = $("#sourceScroll"),
                $si = $("#scrollIndicator");
            var expected = $si.css("marginTop");

            if ($ss.height() < $si.height()){
                //scroll down
                $watched.scrollTop(50);
                $watched.scrollTop().should.be.equal(50);
                $watched.trigger("scroll");
                $si.css("marginTop").should.be.equal(expected);
                //then change content to run the rest of the test
                $watched.html(loremIpsum(true));
                miniMapControl();
            }
            
            //scroll down
            $watched.scrollTop(100);
            $watched.scrollTop().should.be.equal(100);
            $watched.trigger("scroll");
            $si.css("marginTop").should.not.be.equal(expected);

        });
    });
});