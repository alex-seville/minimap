var should = chai.Should();

describe('minimap tests', function(){
  describe('when created with no params', function(){
    it('should return empty', function(){
      should.exist(miniMap(),"empty object returned");
    });
  });
   describe('when created with some params', function(){
    it('should bind', function(){
        var miniMapControl = miniMap({
            scrollBar: "#place-near",
            content: "#watched-content"
        });
        $("#sourceScroll").should.have.length(1);
    });
  });
});