var animatePoints = function() {
  var points = document.getElementsByClassName('point');

  function revealPoint(index){
    index.style.opacity = 1;
    index.style.transform = "scaleX(1) translateY(0)";
    index.style.msTransform = "scaleX(1) translateY(0)";
    index.style.WebkitTransform = "scaleX(1) translateY(0)";
  }

  for(var i=0; i<points.length; i++){
    revealPoint(points[i]);
  }

};

var animateHeroTitle = function() {
  var textNode = document.getElementById('turnUp');

  var revealText = function(){
    textNode.style.opacity = 1;
    textNode.style.transform = "scaleX(1) translateY(-50%)";
    textNode.style.msTransform = "scaleX(1) translateY(-50%)";
    textNode.style.WebkitTransform = "scaleX(1) translateY(-50%)";
  };
  revealText();
};