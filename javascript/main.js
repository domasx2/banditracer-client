var gamejs = require('gamejs');
var combatracer=require('./combatracer');
var settings=require('./settings');
var skin=require('./skin');



gamejs.display.setCaption("Bandit Racer");
var progfn;
var canvas=null;
var display=null;
var font=new gamejs.font.Font(skin.fonts.loading[0]);
var loading_img=font.render('Loading...', skin.fonts.loading[1]);
var loading_img_size=loading_img.getSize();

function loadTick(){
   var display_size=display.getSize()
   gamejs.draw.rect(display, skin.ui_background, new gamejs.Rect([0, 0], display_size));
   var loading_pt=[display_size[0]/2-loading_img_size[0]/2, display_size[1]/2-loading_img_size[1]/2-100];
   display.blit(loading_img, loading_pt);
   if(progfn){
      var progress=progfn();
      progress=Math.max(progress-0.5, 0)*2;
      gamejs.draw.rect(display, 'black', new gamejs.Rect([loading_pt[0]-100, loading_pt[1]+50], [loading_img_size[0]+200, 40]), 2);
      gamejs.draw.rect(display, 'black', new gamejs.Rect([loading_pt[0]-100, loading_pt[1]+50], [(loading_img_size[0]+200)*progress, 40]), 0);
   }

};


display=gamejs.display.setMode([settings.get('SCREEN_WIDTH'), settings.get('SCREEN_HEIGHT')]);
gamejs.time.fpsCallback(loadTick, this, 50);
gamejs.preload(combatracer.getPreloadList());
progfn=gamejs.ready(function(){
   var game=new combatracer.Game();
   gamejs.time.deleteCallback(loadTick, 50);
   game.start(display);
});
