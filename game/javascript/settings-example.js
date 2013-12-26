var settings=exports.settings={SCREEN_WIDTH:800,  //screen width in pixels
                                SCREEN_HEIGHT:600, //screen height in pixels
                                FPS:60,        //logic updates per second
                                PHYS_SCALE:10,    //pixels in a meter
                                STARTING_BALANCE:100000, //default 3000
                                MAX_INDIVIDUAL_SOUND_CHANNELS:4,
                                MAX_GLOBAL_SOUND_CHANNELS:8,
                                STARTING_LEAGUE:0,
                                SERVER:'ws://www.banditracer.eu:8000',
                                DEBUG:true,
                                SOUND:true};     //game server

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
