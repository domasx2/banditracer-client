var gamejs = require('gamejs');
var renderer = require('./renderer');
var utils = require('./utils');
var fonts = gamejs.font;
var levels=require('./levels');
var resources = require('./resources');
var weapons=require('./weapons');
var ui=require('./ui');
var uiscenes=require('./uiscenes');
var settings=require('./settings');
var gamescenes=require('./gamescenes');
var sounds=require('./sounds');
var editor=require('./editor');
var garage=require('./garage');
var engine = require('./engine');



var getDefCarDescr=exports.getDefCarDescr=function(car){
    return {'type':car ? car : 'Sandbug',
            'front_weapon':{'type':'Machinegun',
                            'ammo_upgrades':0,
                            'damage_upgrades':0},
            'util':null,
            'rear_weapon':{'type':'MineLauncher',
                            'ammo_upgrades':0,
                            'damage_upgrades':0},
            'acc_upgrades':0,
            'speed_upgrades':0,
            'armor_upgrades':0}
}

exports.image_filenames = [];
exports.sound_filenames = [];

exports.get_preload_list = function(){
    var retv=new Array();
    var i;
    for(i=0;i<resources.cars.length;i++){
        retv[retv.length]='images/cars/'+resources.cars[i];
    }
    for(i=0;i<resources.tiles.length;i++){
        retv[retv.length]='images/tiles/'+resources.tiles[i];
    }
    for(i=0;i<resources.props.length;i++){
        retv[retv.length]='images/props/'+resources.props[i];
    }
    for(i=0;i<resources.animations.length;i++){
        retv[retv.length]='images/animations/'+resources.animations[i];
    }
    for(i=0;i<resources['statics'].length;i++){
        retv[retv.length]='images/static/'+resources['statics'][i];
    }
    for(i=0;i<resources.ui.length;i++){
        retv[retv.length]='images/ui/'+resources.ui[i];
    }
    
    resources.decals.forEach(function(filename){
        retv.push('images/decals/'+filename); 
    });
    
    exports.image_filenames = retv;
    retv = new Array();
    
    if(settings.get('SOUND')){
        resources.sound_fx.forEach(function(filename){
           retv.push('sounds/fx/'+filename); 
        });
        
        //resources.sound_engine.forEach(function(filename){
         //  retv.push('sounds/engine/'+filename); 
        //});
        
        exports.sound_filenames = retv;
    }
    
    
    return exports.image_filenames.concat(exports.sound_filenames);
};

var Director=exports.Director= function Director (display) {
    var onAir = false;
    var activeScene = null;
    this.display=display;
    var last_t;
 
 
    function tick_logic(msDuration){
        if (activeScene && activeScene.update) activeScene.update(msDuration);
    }
 
    function tick_render(msDuration){
        if (activeScene && activeScene.draw) activeScene.draw(display, msDuration);
    }

  
    this.start = function(scene) {
       onAir = true;
       this.replaceScene(scene);
       return;
    };
 
    this.replaceScene = function(scene) {
        if(activeScene && activeScene.destroy) activeScene.destroy(); 
        activeScene = scene;
    };
 
    this.getScene = function() {
       return activeScene;
    };
    
    gamejs.onTick(function(msDuration){
        tick_logic(msDuration);
        tick_render(msDuration);
    });
    gamejs.onEvent(function(evt) {
        if(activeScene && activeScene.handleEvent) activeScene.handleEvent(evt);
    });
     
    
    return this;
};


var Communicator=exports.Communicator=function(game){
    this.game=game;
    this.socket;
    this.next_transaction_id=1;
    this.messages=[];
    this.status='closed';
    

    this.queueMessage=function(cmd, payload){
        /*
        message payload is returned as first argument,
        arg as second payload
        */
        this.messages[this.messages.length]=[cmd, payload ? payload : {}];
        this.send();
    };

    this.send=function(){
        if(this.status=='open'){
            for(var i=0;i<this.messages.length;i++){
                var msg={'cmd':this.messages[i][0],
                         'uid':this.game.player.uid,
                         'payload':this.messages[i][1]};
                msg=JSON.stringify(msg);
                //gamejs.log('sending ', msg);
                this.socket.send(msg);
               // console.log('sent '+msg);
            }
            this.messages=[];
        }else if (this.status=='closed'){
            this.connect();
        }else{
            throw new Error('unknown network status');
        }
    };

    this.connect=function(){
        gamejs.log('Connecting...');
        this.socket = new WebSocket(settings.get('SERVER'), 'banditracer');
        this.status='connecting';
        var self=this;
        this.socket.onopen = function() {self.onopen();};
        this.socket.onmessage = function(m) {self.onmessage(m);};
        this.socket.onclose = function() {self.onclose();};
        this.socket.onerror = function() {self.onerror();};
    };

    this.onopen=function(){
        gamejs.log('Connection established!');
        this.status='open';
        this.send();
    };

    this.onmessage=function(m){
       // console.log('recv '+m.data);
        m=JSON.parse(m.data);
        this.game.director.getScene().handleMessage(m.cmd, m.payload);
    };

    this.onclose=function(){
        this.status='closed';
        console.log(this.error ? 'socket closed on error ' : 'socket closed!');
        this.game.aquainted=false;
        this.game.showTitle();
        this.game.player.uid=null;
        this.game.title_scene.alert(this.error ? 'Socket error, connection closed.' : 'Server closed the connection!');
        this.error=false;
    };

    this.error=false;

    this.onerror=function(){
        this.socket.close();
        this.error=true;
    };
};

exports.init = function() {
    exports.game=new Game();
    return exports.game;
};

var Game = exports.Game = function(){
    this.director=null;
    this.cache=renderer.init();
    if(settings.get('SOUND')){
        engine.initialize_sounds(exports.sound_filenames);
        sounds.init();
    } 
    ui.init();
    this.socket=null;
    this.tried_loading=false;
    this.player={'alias':'Player',
                 'uid':null,
                 'singleplayer':{
                    'balance':settings.get('STARTING_BALANCE'),
                    'difficulty':2,
                    'car':getDefCarDescr(),
                    'league':settings.get('STARTING_LEAGUE'),
                    'completed':false,
                    'completed_tracks':[]
                    }
                };

    this.communicator=null;
    this.acquainted=false; //receved a player id from server?

    this.getCommunicator = function(){
         if(!this.communicator)this.communicator=new Communicator(this);
         return this.communicator;
    };

    this.start = function(display){
        this.display=display;
        this.director=new Director(display);
        this.title_scene=new uiscenes.TitleScene(this, this.cache);
        this.director.start(this.title_scene);
        //this.playLevel(levels.drycircuit, false, true);
    };

    this.showEndGameScene=function(position){
         this.director.replaceScene(new uiscenes.EndRaceScene(this, this.cache, position));
    };

    this.showTitle=function(){
       this.director.replaceScene(this.title_scene);
    };
    
    this.showCongratulations=function(){
        this.director.replaceScene(new uiscenes.CongratulationsScene());
    };

    this.createLobby=function(){
         this.director.replaceScene(new uiscenes.CreateLobbyScene(this, this.cache));
    };

    this.showLobbyList=function(){
         this.director.replaceScene(new uiscenes.JoinLobbyScene(this, this.cache));
    };
    
    this.returnTo=function(){
        if(this.return_to){
            if(this.return_to=='editor'){
                this.return_to='';
                this.showEditor();
                return;
            }
            else if(this.return_to=='singleplayer'){
                this.return_to='';
                this.singleplayer();
                return;
            }
        
        }
        this.showTitle();
        return;
    };

    this.showSPGameOver=function(table, win, scene){
        this.director.replaceScene(new uiscenes.SPGameOverScene(table, win, scene));
    };
    
    this.showEditor=function(){
        if(!this.editor_scene)this.editor_scene= new editor.EditorScene()
        this.director.replaceScene(this.editor_scene);  
    };

    this.joinLobby=function(lobby_id){
        this.director.replaceScene(new uiscenes.LobbyScene(this, this.cache, lobby_id));
    };
    
    this.singleplayer=function(){
         this.director.replaceScene(new uiscenes.SinglePlayerScene(this, this.cache));
    };
    
    this.showGarage=function(player_data){
        this.director.replaceScene(new garage.GarageScene(player_data));
    };
    
    this.showCarDealer=function(player_data){
        this.director.replaceScene(new garage.BuyCarScene(player_data));
    };
    
    //singleplayer garage
    this.showSPGarage=function(){
        this.director.replaceScene(new garage.GarageScene(this.player.singleplayer));
    };

    this.playMultiplayer=function(level){
        this.level_scene=new gamescenes.MultiplayerLevelScene(this, level, this.cache);
        this.director.replaceScene(this.level_scene);
    };

    this.playLevel=function(level, ai_test, return_to){
         this.level_scene=new gamescenes.SingleplayerLevelScene(level, ai_test);
         this.return_to=return_to;
         this.director.replaceScene(new uiscenes.ControlsSplash(this, this.cache, this.level_scene));
    };
    
    this.cacheCarSprites=function(level){
        this.cache.cacheCarSprite('wheel.png');
        this.cache.cacheCarSprite('big_wheel.png');
        level.controllers.forEach(function(controller){
            var car = controller.car;
            this.cache.cacheCarSprite(car.filename);
            ([car.front_weapon, car.rear_weapon, car.util]).forEach(function(weapon){
                if(weapon && weapon.pars.preload){
                    weapon.pars.preload.forEach(function(filename){
                        this.cache.cacheCarSprite(filename);
                    }, this);
                }
            }, this);
        }, this);
    };
    
    this.haveSave=function(){
        if(utils.supports_html5_storage()){
            if(localStorage.getItem('banditracer_save')) return true;
        }
        return false;
    };
    
    this.load=function(){
        if(utils.supports_html5_storage() && localStorage.getItem('banditracer_save')){
            var data = JSON.parse(localStorage.getItem('banditracer_save'));
            this.player.alias = data.alias;
            this.player.singleplayer = data.singleplayer;
            if(!this.player.singleplayer.difficulty)this.player.singleplayer.difficulty = 2;
            return true;
        }
        return false;
    };
    
    this.save=function(){
        if(utils.supports_html5_storage()){
            var data=JSON.stringify({'alias':this.player.alias,
                             'singleplayer':this.player.singleplayer});
            localStorage.setItem('banditracer_save', data);
            return true;
        }
        return false;
    };
};
