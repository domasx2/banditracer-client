var gamejs = require('gamejs');
var ui=require('./ui');
var ui2=require('./ui2');
var utils=require('./utils');
var levels=require('./levels');
var car_descriptions=require('./car_descriptions');
var GUI=require('./gamejs-gui');
var skin=require('./skin');
var combatracer=require('./combatracer');

var LobbyScene=exports.LobbyScene=function(game, cache, lobby_id){
    LobbyScene.superConstructor.apply(this, [game, cache]);
    this.lobby_id=lobby_id;
    this.ping=true;

    this.kick=function(){
        if(!this.playertable.selected_row_id){
            this.alert('Select a player first!');
            return;
        }
        this.game.getCommunicator().queueMessage('KICK', {'player_id':this.playertable.selected_row_id, 'lobby_id':this.lobby_id});
    };

    this.leave=function(){
        this.game.getCommunicator().queueMessage('LEAVE_LOBBY');
    };

    this.refresh_lobby=function(){
        this.game.getCommunicator().queueMessage('GET_LOBBY_INFO');
    };

    this.start=function(){
        this.game.getCommunicator().queueMessage('START_GAME');
    };

    this.selectCar=function(){
          this.game.getCommunicator().queueMessage('SELECT_CAR', {'car':this.car_selector.selected});
    };

    this.handleMessage=function(cmd, payload){
        if(cmd=='LOBBY_INFO'){
            this.playertable.setData(payload.players);
            if(payload.is_leader){
                this.kickbtn.enable();
                this.startbtn.enable();
                this.playertable.selectable=true;
            }else{
                this.kickbtn.disable();
                this.startbtn.disable();
                this.playertable.selectable=false;
            }
            this.trackdisplay.setTrack(payload.track);
        }
        else if(cmd=='LEFT_LOBBY'){
            this.game.showTitle();
            if(payload.text)this.game.title_scene.alert(payload.text);
        }else if(cmd=='START_GAME'){
            this.game.playMultiplayer(levels[payload.track]);
        }else{
            this.handleMessageDefault(cmd, payload);
        }
    };

    this.header=new ui.Label({'scene':this,
                                'position':[10, 10],
                                'text':'Lobby',
                                'font':'header'});

    var columns=[{'key':'player', 'label':'Player', 'width':200},
                 {'key':'car',    'label':'Car',     'width':120}];

    this.playertable=new ui.Table({'scene':this,
                                 'position':[10, 70],
                                 'rows':6,
                                 'columns':columns})

    this.kickbtn=new ui.Button({'scene':this,
                               'position':[10, 7*30+70+5],
                               'text':'Kick',
                               'enabled':false,
                               'onclick':this.kick});

    this.leavebtn=new ui.Button({'scene':this,
                                'position':[10, 400],
                                'text':'Leave',
                                'onclick':this.leave});

    this.startbtn=new ui.Button({'scene':this,
                                'position':[220, 400],
                                'text':'Start game',
                                'enabled':false,
                                'onclick':this.start});

    new ui.Label({'scene':this,
                 'position':[590, 30],
                 'text':'Select a car'});

    this.car_selector=new ui.CarSelector({'scene':this,
                                    'position':[590, 70],
                                    'onselect':this.selectCar,
                                    'scope':this});

    this.car_selector.select(null, 'Racer');



    this.trackdisplay=new ui.TrackInfoDisplay({'scene':this,
                                               'position':[340, 70]});

    this.refresh_lobby();
    return this;

};
gamejs.utils.objects.extend(LobbyScene, ui.UIScene);

var GameOverScene=exports.GameOverScene=function(table, win){
    GameOverScene.superConstructor.apply(this, []);
    
    this.titlelbl=new GUI.Label({'parent':this.container,
                                'position':[210, 40],
                                'text':'Race Over',
                                'font':ui2.getFont('header_black')});
    
    this.label=new GUI.Label({'parent':this.container,
                                'position':[30, 120],
                                'text':win ? 'You win! Well done.' : 'You lose! Ha-ha.',
                                'font':ui2.getFont('header')});
    var columns=[{'key':'place', 'label':'Place', 'width':80},
              {'key':'player', 'label':'Player', 'width':200},
              {'key':'kills', 'label':'Kills', 'width':80},
              {'key':'deaths', 'label':'Deaths', 'width':80}];
    
    new ui2.Table({'parent':this.container,
                  'size':[460, 300],
                  'position':[30, 200],
                  'columns':columns,
                  'data':table});
    
    var btn=new ui2.Button({'parent':this.container,
                   'position':[800-150, 500],
                   'size':[150, 50],
                   'lean':'right',
                   'text':'Continue...'});
    btn.onClick(function(){
        this.game.returnTo();
    }, this);

};

gamejs.utils.objects.extend(GameOverScene, ui2.UIScene);


var JoinLobbyScene2=exports.JoinLobbyScene2=function(game, cache){
    JoinLobbyScene2.superConstructor.apply(this, [game, cache]);

    this.refresh_lobbies=function(){
        this.lobby_table.setData([]);
        this.lobby_table.no_data_text='Loading, please wait...';
        this.game.getCommunicator().queueMessage('LIST_LOBBIES', {});
    };


    this.join=function(){
        if(!this.lobby_table.selected_row_id){
            this.alert('You must select a lobby first!');
        }else{
            this.game.getCommunicator().queueMessage('JOIN_LOBBY', {'lobby_id':this.lobby_table.selected_row_id});
        }
    };

    this.handleMessage=function(cmd, payload){
        if(cmd=='LOBBY_LIST'){
            var data=payload.lobbies;
            var row;
            for(var i=0;i<data.length;i++){
                row=data[i];
                row.track=levels[row.track].title;
                row.players=row.playercount;
            }
            this.lobby_table.setData(data);
            this.lobby_table.no_data_text='No lobbies found.';
        }else if(cmd=="JOIN_LOBBY_OK"){
            this.game.joinLobby(payload.lobby_id);
        }else{
            this.handleMessageDefault(cmd, payload);
        }

    };

    new ui.Label({'scene':this,
                 'position':[10, 10],
                 'text':'Join lobby',
                 'font':'header'});

    new ui.Button({'scene':this,
                  'position':[10, 410],
                  'text':'Back',
                  'onclick':this.returnToTitle});

    new ui.Button({'scene':this,
                  'position':[220, 410],
                  'text':'Refresh',
                  'onclick':this.refresh_lobbies});

    new ui.Button({'scene':this,
                  'position':[430, 410],
                  'text':'Join',
                  'onclick':this.join});

    var columns=[{'key':'title', 'label':'Title', 'width':220},
                 {'key':'track', 'label':'Track', 'width':200},
                 {'key':'players', 'label':'Players', 'width':200}];

    this.lobby_table=new ui.Table({'scene':this,
                                  'position':[10, 70],
                                  'rows':10,
                                  'selectable':true,
                                  'columns':columns});

    this.refresh_lobbies();


};
gamejs.utils.objects.extend(JoinLobbyScene2, ui.UIScene);

var JoinLobbyScene=exports.JoinLobbyScene=function(){
    JoinLobbyScene.superConstructor.apply(this, []);
    
    this.titlelbl=new GUI.Label({'parent':this.container,
                                'position':[210, 40],
                                'text':'Multiplayer',
                                'font':ui2.getFont('header_black')});
    
    var columns=[{'key':'title', 'label':'Title', 'width':150},
                 {'key':'track', 'label':'Track', 'width':150},
                 {'key':'players', 'label':'Players', 'width':150}]
    this.table=new ui2.Table({'parent':this.container,
                             'size':[450, 350],
                             'position':[300, 150],
                             'columns':columns,
                             'data':[]});
    
    this.create_btn=new ui2.Button({'parent':this.container,
                                  'size':[200, 50],
                                  'lean':'left',
                                  'position':[0, 150],
                                  'text':'Create Lobby'});
    
    this.refresh_btn=new ui2.Button({'parent':this.container,
                                    'size':[200, 50],
                                    'lean':'left',
                                    'position':[0, 210],
                                    'text':'Refresh'});
    
    this.back_btn=new ui2.Button({'parent':this.container,
                                    'size':[200, 50],
                                    'lean':'left',
                                    'position':[0, 520],
                                    'text':'Back'});
    this.back_btn.onClick(this.returnToTitle, this);
    
    this.join_btn=new ui2.Button({'parent':this.container,
                                'size':[200, 50],
                                'lean':'right',
                                'position':[this.container.size[0]-200, 520],
                                'text':'Join'});
};
gamejs.utils.objects.extend(JoinLobbyScene, ui2.UIScene);


var CreateLobbyScene=exports.CreateLobbyScene=function(game, cache){
    CreateLobbyScene.superConstructor.apply(this, [game, cache]);

    this.create=function(){
        if(!this.title.getText().length){
            this.alert('Lobby title is required!');
            return;
        }
        if(!this.selector.selected){
            this.alert('You must select a track!');
            return;
        }
        else{
            this.alert('Please wait...', false);
            this.game.getCommunicator().queueMessage('CREATE_LOBBY', {'title':this.title.getText(), 'track':this.selector.selected});

        }
    };

    this.handleMessage=function(cmd, payload){
        if(cmd=='CREATE_LOBBY_OK'){
            this.game.joinLobby(payload.lobby_id);
        }else{
            this.handleMessageDefault(cmd, payload);
        }

    };

    new ui.Label({'scene':this,
                 'position':[10, 10],
                 'text':'Create lobby',
                 'font':'header'});

    new ui.Button({'scene':this,
                  'position':[10, 400],
                  'text':'Back',
                  'onclick':this.returnToTitle});

    new ui.Button({'scene':this,
                  'position':[220, 400],
                  'text':'Create',
                  'onclick':this.create});


    new ui.Label({'scene':this,
                 'position':[10, 90],
                 'text':'Lobby title'});

    this.title=ui.TextBox({'scene':this,
                'position':[10, 130],
                'size':[220, 25],
                'text':'Some lobby'});

    this.selector=new ui.LevelSelector({'scene':this,
                         'position':[250, 90]});
};
gamejs.utils.objects.extend(CreateLobbyScene, ui.UIScene);

var TitleScene=exports.TitleScene=function(game, cache){
    TitleScene.superConstructor.apply(this, [game, cache]);
    
    //paint background under text box
    this.container.on(GUI.EVT_PAINT, function(){
        gamejs.draw.polygon(this.surface, skin.alias_background, [[0, 110], [420, 110], [390, 180], [0, 180]]);
    }, this.container);
    
    //logo
    new GUI.Image({'position':[40, 260],
                  'parent':this.container,
                  'image':this.cache.getUIImage('logo.png')});
    
    //name: label
    new GUI.Label({'position':[50, 115],
                  'parent':this.container,
                  'font':ui2.getFont('alias_label'),
                  'text':'name:'});
    
    //name input
    this.nameinput=new ui2.NameInput({'position':[178, 129],
                                     'size':[200, 40],
                                     'text':'Guest',
                                     'parent':this.container});
    
    this.nameinput.on(GUI.EVT_CHANGE, function(event){
        this.game.player.alias=event.value; 
    }, this);
    
    this.btn_single=new ui2.TitleButton({'position':[440, 210],
                                        'size':[360, 65],
                                        'text':'Single player',
                                        'parent':this.container});
    
    this.btn_single.onClick(this.singleplayer, this);
    
    this.btn_multi=new ui2.TitleButton({'position':[440, 300],
                                        'size':[360, 65],
                                        'text':'Multiplayer',
                                        'parent':this.container});
    
    this.btn_multi.onClick(this.joinLobby, this);
    
    this.btn_editor=new ui2.TitleButton({'position':[440, 390],
                                        'size':[360, 65],
                                        'text':'Track Editor',
                                        'parent':this.container});
    
    this.btn_editor.onClick(this.editTrack, this);
    

    
};

gamejs.utils.objects.extend(TitleScene, ui2.UIScene);

TitleScene.prototype.editTrack=function(){
    this.game.showEditor();
};

TitleScene.prototype.handleMessage=function(cmd, payload){
    if(cmd=='HELLO'){
        this.game.player.uid=payload.uid;
        this.game.acquainted=true;
        this.clearAlert();
        this.game.showLobbyList();     
    }else{
        this.handleMessageDefault(cmd, payload);
    }
};

TitleScene.prototype.joinLobby=function(){
        this.alert('Temporarily out of order!');
        return;
        var alias=this.game.player.alias;
        if(!alias) this.alert('You must enter your name first!');
        else{
            this.alert('Connecting. Please wait...', false);
            this.game.getCommunicator().queueMessage('HI',{'alias':alias});
        }
    };

TitleScene.prototype.singleplayer=function(){
    this.game.singleplayer();
};

var SinglePlayerScene=exports.SinglePlayerScene=function(game, cache){
    SinglePlayerScene.superConstructor.apply(this, [game, cache]);
    
    this.container.header_height=130;
    this.container.background_color=skin.single_player_scene.background_color;
    this.container.refresh();
    
    this.titlelbl=new GUI.Label({'parent':this.container,
                                'position':[210, 40],
                                'text':'Single Player',
                                'font':ui2.getFont('header_black')});
    
    this.backbtn=new ui2.Button({'size':[130, 50],
                                'parent':this.container,
                                'position':[0, 520],
                                'lean':'left',
                                'fill':skin.sp_button.fill,
                                'font':ui2.getFont(skin.sp_button.font),
                                'hover_fill':skin.sp_button.fill_hover,
                                'text':'BACK'});
    this.backbtn.onClick(this.back, this);
    
    this.racebtn=new ui2.Button({'size':[130, 50],
                                'parent':this.container,
                                'position':[this.container.size[0]-130, 520],
                                'lean':'right',
                                'fill':skin.sp_button.fill,
                                'font':ui2.getFont(skin.sp_button.font),
                                'hover_fill':skin.sp_button.fill_hover,
                                'text':'RACE!'});
    this.racebtn.onClick(this.race, this);
    
    this.gotogarage=new ui2.GoToGarage({'position':[14, 160],
                                       'parent':this.container});
    this.gotogarage.on(GUI.EVT_MOUSE_DOWN, function(){
        this.alert('Coming soon!', true);
    }, this);
    
    this.car_display=new ui2.CarDisplay({'position':[14, 356],
                                        'gameinfo':combatracer.game.player.singleplayer,
                                          'parent':this.container});
    
    this.track_selector=new ui2.TrackSelector({'position':[254, 160],
                                            'parent':this.container});
};
gamejs.utils.objects.extend(SinglePlayerScene, ui2.UIScene);

SinglePlayerScene.prototype.back=function(){
    this.game.showTitle();
};

SinglePlayerScene.prototype.race=function(){
    if(!this.track_selector.track){
        this.alert('You must select a track first!', true); 
    }else{
        this.game.playLevel(levels[this.track_selector.track], false, true, 'singleplayer');
    }
};

var ControlsSplash=exports.ControlsSplash=function(game, cache, next_scene){
    ControlsSplash.superConstructor.apply(this, [game, cache]);
    this.container.destroy();
    this.next_scene=next_scene;
    this.gui.on(GUI.EVT_PAINT, function(){
        this.surface.fill(skin.ui_background);
    }, this.gui);
    
    var img=new GUI.Image({'position':[0, 0],
                  'image':cache.getUIImage('controls.png'),
                  'parent':this.gui});
    this.gui.center(img);
    img.move([img.position[0], img.position[1]-50]);
    
    var lbl=new GUI.Label({'position':[0, 0],
                          'parent':this.gui,
                      'text':'Press any key or click to continue...',
                      'font':ui2.getFont('header')});
    this.gui.center(lbl);
    lbl.move([lbl.position[0], img.position[1]+img.size[1]+30]);
    this.gui.despatchEvent({'type':GUI.EVT_FOCUS});
    this.gui.on(GUI.EVT_MOUSE_DOWN, this.next, this);
    this.gui.on(GUI.EVT_KEY_DOWN, this.next, this);
};

gamejs.utils.objects.extend(ControlsSplash, ui2.UIScene);

ControlsSplash.prototype.next=function(){
    this.game.director.replaceScene(this.next_scene);  
};

var EndRaceScene=exports.EndRaceScene=function(game, cache, pos){
    EndRaceScene.superConstructor.apply(this, [game, cache]);

    if(pos==1){
        new ui.Label({'scene':this,
                     'position':[game.director.width/2-90, 100],
                     'text':'You Win'});
    }else{
        new ui.Label({'scene':this,
                     'position':[game.director.width/2-90, 100],
                     'text':'You Lose'});
    }

    this.showTitle=function(){
        this.game.showTitle();
    };

    new ui.Button({'scene':this,
                  'position':[game.director.width/2-90, 200],
                  'size':[200, 32],
                  'text':'Continue',
                  'onclick':this.showTitle});


};
gamejs.utils.objects.extend(EndRaceScene, ui.UIScene);
