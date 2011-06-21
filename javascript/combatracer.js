var gamejs = require('gamejs');
var renderer = require('./renderer');
var utils = require('./utils');
var fonts = require('gamejs/font');
var levels=require('./levels');
var resources = require('./resources');
var weapons=require('./weapons');
var ui=require('./ui');
var uiscenes=require('./uiscenes');
var settings=require('./settings');
var gamescenes=require('./gamescenes');

exports.getPreloadList=function(){
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
    for(i=0;i<resources['static'].length;i++){
        retv[retv.length]='images/static/'+resources['static'][i];
    }
    for(i=0;i<resources.ui.length;i++){
        retv[retv.length]='images/ui/'+resources.ui[i];
    }

    return retv;
};

var Director=exports.Director= function Director (display) {
   var onAir = false;
   var activeScene = null;
   this.display=display;

   function tick(msDuration){
        tick_logic(msDuration);
        tick_render(msDuration);
   }

   function tick_logic(msDuration){
        if (!onAir) return;
        if (activeScene.handleEvent) {
            var evts=gamejs.event.get();
            var i;
            for(i=0;i<evts.length;i++){
               activeScene.handleEvent(evts[i]);
            }
        } else {
           // throw all events away
           gamejs.event.get();
        }
        if (activeScene.update) activeScene.update(msDuration);
   }

   function tick_render(msDuration){
        //console.log(display);
        if(activeScene.draw) activeScene.draw(display, msDuration);
   }




   this.start = function(scene) {
      onAir = true;
      this.replaceScene(scene);
      return;
   };

   this.replaceScene = function(scene) {
      activeScene = scene;
   };

   this.getScene = function() {
      return activeScene;
   };
   //gamejs.time.fpsCallback(tick_logic, this, logic_fps);
   gamejs.time.fpsCallback(tick, this, settings.get('RENDER_FPS'));
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
        gamejs.log('trying send');
        if(this.status=='open'){
            for(var i=0;i<this.messages.length;i++){
                var msg={'cmd':this.messages[i][0],
                         'uid':this.game.player.uid,
                         'payload':this.messages[i][1]};
                msg=JSON.stringify(msg);
                gamejs.log('sending ', msg);
                this.socket.send(msg);
              //  console.log('sent '+msg);
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
        this.socket = new WebSocket(settings.get('SERVER'));
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
        gamejs.debug('Received ', m);
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

exports.Game=function(){
    settings.init();
    this.director=null;
    this.cache=new renderer.ImageCache();
    this.socket=null;
    this.player={'alias':'',
                 'uid':null};

    this.communicator=null;
    this.acquainted=false; //receved a player id from server?

    this.getCommunicator=function(){
         if(!this.communicator)this.communicator=new Communicator(this);
         return this.communicator;
    };

    this.start=function(display){
       this.director=new Director(display);

      // this.playLevel(levels.levels['level1']);
       //this.director.start(this.level_scene);

       this.title_scene=new uiscenes.TitleScene(this, this.cache);
       this.director.start(this.title_scene, this.display);

    };

    this.showEndGameScene=function(position){
         this.director.replaceScene(new uiscenes.EndRaceScene(this, this.cache, position));
    };

    this.showTitle=function(){
       this.director.replaceScene(this.title_scene);
    };

    this.createLobby=function(){
         this.director.replaceScene(new uiscenes.CreateLobbyScene(this, this.cache));
    };

    this.showLobbyList=function(){
         this.director.replaceScene(new uiscenes.JoinLobbyScene(this, this.cache));
    };

    this.showGameOver=function(table){
        this.director.replaceScene(new uiscenes.GameOverScene(this, this.cache, table));
    };

    this.joinLobby=function(lobby_id){
        this.director.replaceScene(new uiscenes.LobbyScene(this, this.cache, lobby_id));
    };

    this.playAgainstBots=function(){
         this.director.replaceScene(new uiscenes.PlayAgainstBotsScene(this, this.cache));
    };

    this.playMultiplayer=function(level){
        this.level_scene=new gamescenes.MultiplayerLevelScene(this, level.data, this.cache);
        this.director.replaceScene(this.level_scene);
    };

    this.playLevel=function(level, car){
         this.level_scene=new gamescenes.SingleplayerLevelScene(this, level.data, this.cache, car);
         this.director.replaceScene(this.level_scene);
    };
};
