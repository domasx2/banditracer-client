var gamejs = require('gamejs');
var combatracer=require('./combatracer');




gamejs.preload(combatracer.getPreloadList());
gamejs.display.setCaption("Bandit Racer");
gamejs.ready(function(){
   var game=new combatracer.Game();
   game.start();   
});