var settings=exports.settings={SCREEN_WIDTH:800,  //screen width in pixels
                                SCREEN_HEIGHT:600, //screen height in pixels
                                FPS:60,        //logic updates per second
                                PHYS_SCALE:10,    //pixels in a meter
                                STARTING_BALANCE:3000, //default 3000
                                STARTING_LEAGUE:0,
                                SERVER:'ws://localhost:8001',
                                DEBUG:false,
                                SOUND:false,
                                ENGINE_SOUND:false};     //game server

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
