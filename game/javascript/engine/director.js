var gamejs = require('gamejs');

var requestAnimationFrame=(function(fps){
    try{
        window;
    }catch(e){
        return;
    }
    //Check for each browser
    //@paul_irish function
    //Globalises this function to work on any browser as each browser has a different namespace for this
    return  window.requestAnimationFrame       ||  //Chromium 
            window.webkitRequestAnimationFrame ||  //Webkit
            window.mozRequestAnimationFrame    || //Mozilla Geko
            window.oRequestAnimationFrame      || //Opera Presto
            window.msRequestAnimationFrame     || //IE Trident?
            function(callback, element){ //Fallback function
                window.setTimeout(callback, 1000/fps);                
            }
     
})()


var Director = exports.Director = function(display, fps){
    this.on_air = false;
    this.scenes = [];
    this.display = display;
    this.last_t = null;
    this.fps = fps;
    this.tick(0);
};


Director.prototype.push = function(scene){
    this.scenes.push(scene);
};
    
Director.prototype.pop = function(){
    if(this.scenes.length){
        var scene = this.scenes.pop();
        if(scene.destroy) scene.destroy();
        return scene;
    }
    return null;
};

Director.prototype.replace = function(scene){
    this.pop();
    this.push(scene);
};
    
Director.prototype.get_active_scene = function(){
    if(this.scenes.length) return this.scenes[this.scenes.length-1];
    return null;        
}
    
Director.prototype.clear = function(){
    while(this.scenes.length) this.pop();
}
 
Director.prototype.tick= function(t){
    var t = t || (new Date()).getTime();
    var msDuration = t - this.last_t;
    this.last_t = t;
    var active_scene = this.get_active_scene();
    if(active_scene && this.on_air){
        this.tick_logic(msDuration);
        this.tick_render(msDuration);
    }
    
    var dir = this;
    function callback(t){
        dir.tick(t);   
    }
    
    requestAnimationFrame(callback, display._canvas);
}

Director.prototype.tick_logic = function(msDuration){
    var active_scene = this.get_active_scene();
    if (active_scene.handleEvent) {
        var evts = gamejs.event.get();
        var i;
        for(i = 0;i < evts.length;i++){
           active_scene.handleEvent(evts[i]);
        }
    } else {
       // throw all events away
       gamejs.event.get();
    }
    if (active_scene.update) active_scene.update(msDuration);
}
 
Director.prototype.tick_render = function(msDuration){
    var active_scene = this.get_active_scene();
    if(active_scene.draw) active_scene.draw(this.display, msDuration);
}
 
Director.prototype.start = function() {
   this.on_air = true;
};
