var settings=exports.settings={SCREEN_WIDTH:800,  //screen width in pixels
                                SCREEN_HEIGHT:600, //screen height in pixels
                                LOGIC_FPS:60,        //logic updates per second
                                RENDER_FPS:60,        //renders per second
                                TILE_SCALE:50,     //tile height/width in pixels
                                PHYS_SCALE:10,    //pixels in a meter
                                SERVER:'ws://www.banditracer.eu:8000',
                                DEBUG:true};     //game server

exports.get=function(name){
    return settings[name];
};

exports.init=function(){
    for(var key in settings){
        if(window.hasOwnProperty(key)){
            settings[key]=window[key];
        }
    }
};

exports.set=function(name, value){
    settings[name]=value;
};
