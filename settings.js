var settings=exports.settings={SCREEN_WIDTH:1000,  //screen width in pixels
                                SCREEN_HEIGHT:700, //screen height in pixels
                                LOGIC_FPS:60,        //logic updates per second
                                RENDER_FPS:60,        //renders per second
                                TILE_SCALE:50,     //tile height/width in pixels
                                PHYS_SCALE:10,    //pixels in a meter
                                SERVER:'ws://82.135.230.59:8081/websocket'};     //game server
                                
exports.get=function(name){
    return settings[name];
};

exports.set=function(name, value){
    settings[name]=value;
};