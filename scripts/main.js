Modernizr.load([
  {
    test: Modernizr.placeholder,
    nope: 'scripts/placeholders.min.js'
  },{
    test: Modernizr.touch,
    yep: 'scripts/fastclick.min.js',
    complete: function(){
      if(Modernizr.touch)
        FastClick.attach(document.body);
    }
  }
]);

$(function() {

});