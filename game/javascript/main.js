var gamejs = require('gamejs');
var combatracer=require('./combatracer');
var settings=require('./settings');
var skin=require('./skin');
var levels=require('./levels');
var engine=require('./engine');

gamejs.display.setCaption("Bandit Racer");
var img;

function main(){
   var canvas = document.createElement('canvas');
   canvas.width = img.naturalWidth || img.width;
   canvas.height = img.naturalHeight || img.height;
   var context = canvas.getContext('2d');
   context.drawImage(img, 0, 0);
   img.getSize = function() { return [img.naturalWidth, img.naturalHeight]; };
   var loading_img = new gamejs.Surface(img.getSize());
   loading_img._canvas = canvas;
   
   var progfn;
   var canvas=null;
   var display=null;
   //var font=new gamejs.font.Font(skin.fonts.loading[0]);
   var loading_img_size=loading_img.getSize();
   
   function loadTick(){
      var display_size=display.getSize()
      gamejs.draw.rect(display, '#FFF', new gamejs.Rect([0, 0], display_size));
      var loading_pt=[display_size[0]/2-loading_img_size[0]/2, display_size[1]/2-loading_img_size[1]/2-100];
      display.blit(loading_img, loading_pt);
      if(progfn){
         var progress=progfn();
         progress=Math.min(Math.max(progress-0.5, 0)*2, 1);
         gamejs.draw.rect(display, 'black', new gamejs.Rect([loading_pt[0]-100, loading_pt[1]+260], [loading_img_size[0]+200, 40]), 2);
         gamejs.draw.rect(display, 'black', new gamejs.Rect([loading_pt[0]-100, loading_pt[1]+260], [(loading_img_size[0]+200)*progress, 40]), 0);
      }
   };
   
   settings.init();
   display=gamejs.display.setMode([settings.get('SCREEN_WIDTH'), settings.get('SCREEN_HEIGHT')]);
   gamejs.onTick(loadTick, this);
   gamejs.preload(combatracer.get_preload_list());
   levels.init();
   progfn = gamejs.ready(function(){   
      var game=new combatracer.init();
      game.start(display);
   });
};

//load logo first
var loadlogo=exports.loadlogo=function(){
   img = new Image();
   img.addEventListener('load', main, true);
   img.src =(window.$g && $g.resourceBaseHref || '.')+'/images/ui/logo.png';
}
//load logo
loadlogo();