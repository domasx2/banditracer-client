$(function(){
var Site = Backbone.Router.extend({

  routes: {
    "":         "play",   
    "about":    "about",  
    "source":   "source"
  },

  view: function(view_id){
      $('.view').hide();
      $('#view-'+view_id).show();
      $('#menu li').removeClass('active');
      $('#menu #menu-'+view_id).addClass('active');
  },

  play: function() {
    this.view('play');
  },

  about: function() {
    this.view('about');
  },

  source: function() {
    this.view('source');
  }

});

var site = new Site();
Backbone.history.start();
});