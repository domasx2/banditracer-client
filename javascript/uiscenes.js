var gamejs = require('gamejs');
var ui=require('./ui');
var utils=require('./utils');
var levels=require('./levels');
var car_descriptions=require('./car_descriptions');
var GUI=require('./gamejs-gui');
var skin=require('./skin');
var combatracer=require('./combatracer');
var renderer=require('./renderer');
var leagues=require('./leagues');
var sounds=require('./sounds');

var EURO_SYMBOL='\u20AC';
/*
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
gamejs.utils.objects.extend(LobbyScene, ui.UIScene);*/


var CongratulationsScene=exports.CongratulationsScene=function(){
    CongratulationsScene.superConstructor.apply(this, []);
    
    this.titlelbl=new GUI.Label({'parent':this.container,
                                'position':[210, 40],
                                'text':'Congratulations',
                                'font':ui.getFont('header_black')});
    
    this.label=new GUI.Label({'parent':this.container,
                                'position':[30, 120],
                                'text':'You won the game!',
                                'font':ui.getFont('header')});
    
    this.text=new GUI.Text({'parent':this.container,
                            'position':[30, 180],
                            'font':ui.getFont('16_33'),
                            'width':500,
                            'text':'There are no more leagues yet, which means you win!\nCheck back soon for more cars, weapons and tracks. Follow BanditRacer on twitter!'});

}

gamejs.utils.objects.extend(CongratulationsScene, ui.UIScene);

var SPGameOverScene=exports.SPGameOverScene=function(table, place, scene){
    SPGameOverScene.superConstructor.apply(this, []);
    var win=place==1;
    this.titlelbl=new GUI.Label({'parent':this.container,
                                'position':[210, 40],
                                'text':'Race Over',
                                'font':ui.getFont('header_black')});
    
    this.label=new GUI.Label({'parent':this.container,
                                'position':[30, 120],
                                'text':win ? 'You win! Well done.' : 'You lose! Better luck next time.',
                                'font':ui.getFont('header')});
    
    var columns=[{'key':'place', 'label':'Place', 'width':80},
              {'key':'player', 'label':'Player', 'width':200},
              {'key':'kills', 'label':'Kills', 'width':80},
              {'key':'deaths', 'label':'Deaths', 'width':80}];
    
    new ui.Table({'parent':this.container,
                  'size':[460, 300],
                  'position':[30, 200],
                  'columns':columns,
                  'data':table});
    

    
        
    var league=leagues[combatracer.game.player.singleplayer.league];
    
    
    //REWARD
    if(!(combatracer.game.return_to=='editor')){
        var reward = 0;
        
        new GUI.Label({'position':[510, 200],
                  'parent':this.container,
                  'font':ui.getFont('button2'),
                  'text':'Reward'});
        
        if(place>0&&place<4) reward=league['reward_'+place];
        
    
        if(place>0){
            var l;
            if(place==1)l='1st place:';
            else if(place==2)l='2nd place:';
            else if(place==3)l='3d place:';
            else{
                l='4th place:';
            }
            new GUI.Label({'position':[510, 240],
                          'font':ui.getFont('alias'),
                          'parent':this.container,
                          'text':l});
            
            var lbl= new GUI.Label({'position':[510, 240],
                          'font':ui.getFont('alias'),
                          'parent':this.container,
                          'text':String(reward)+EURO_SYMBOL});
            lbl.rightAlign(730);
        }
        
        new GUI.Label({'position':[510, 270],
                     'font':ui.getFont('alias'),
                     'parent':this.container,
                     'text':'Kills:'});
        
        lbl= new GUI.Label({'position':[510, 270],
                      'font':ui.getFont('alias'),
                      'parent':this.container,
                      'text':String(scene.player_car.kills*100)+EURO_SYMBOL});
        lbl.rightAlign(730);
        
        var total=reward+scene.player_car.kills*100;
        new GUI.Label({'position':[510, 300],
                     'font':ui.getFont('alias'),
                     'parent':this.container,
                     'text':'TOTAL:'});
        
        lbl= new GUI.Label({'position':[510, 300],
                      'font':ui.getFont('alias'),
                      'parent':this.container,
                      'text':String(total)+EURO_SYMBOL});
        lbl.rightAlign(730);
    
        combatracer.game.player.singleplayer.balance+=total;
    }
    
    
    //dirty hax, show congratulate scene if no more tracks/leagues remain
    this.update=function(ms){
        new ui.UIScene().update.apply(this, [ms]);
        if(this.congratulate)this.game.showCongratulations();
    };
    
    //HANDLE WIN
    if(win){
        combatracer.game.player.singleplayer.completed_tracks.push(scene.level.id);
    
        if(combatracer.game.player.singleplayer.completed_tracks.length>=league.tracks.length){
            if(leagues[combatracer.game.player.singleplayer.league+1]){
                combatracer.game.player.singleplayer.league++;
                combatracer.game.player.singleplayer.completed_tracks = [];
                this.alert('You have advanced to '+leagues[combatracer.game.player.singleplayer.league].name+'!');
            }else{
                this.alert('You win the tournament! Hell difficulty unlocked.')
                combatracer.game.player.singleplayer.league = 0;
                combatracer.game.player.singleplayer.completed_tracks = [];
                combatracer.game.player.singleplayer.completed = true;
            }
        }
    }
    
    //SAVE GAME
    if(!(combatracer.game.return_to=='editor')){
        if(combatracer.game.save()){
            new GUI.Text({'position':[30, 510],
                  'font':ui.getFont('13_green'),
                  'parent':this.container,
                  'width':460,
                  'text':'Game saved to HTML5 storage. You will be able to load it next time you play Bandit Racer on this browser.'});
        }
    }  
    
    
    var btn=new ui.Button({'parent':this.container,
                   'position':[800-150, 500],
                   'size':[150, 50],
                   'lean':'right',
                   'text':'Continue...'});
    btn.onClick(function(){
        this.game.returnTo();
    }, this);
    
    

};

gamejs.utils.objects.extend(SPGameOverScene, ui.UIScene);

/*
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
*/

var CreateLobbyScene = exports.CreateLobbyScene = function(){
    CreateLobbyScene.superConstructor.apply(this, []);
    
    
    new GUI.Label({'parent':this.container,
                    'position':[210, 40],
                    'text':'Create Lobby',
                    'font':ui.getFont('header_black')});
                                
    new GUI.Label({'parent':this.container,
                   'position':[20, 150],
                   'text':'Title',
                   'font':ui.getFont('alias')
                });
                
    this.title = new GUI.TextInput({'parent':this.container,
                                   'position':[20, 190],
                                   'size':[200, 34],
                                   'text':'some game',
                                   'font':ui.getFont('alias')});
                                   
    new GUI.Label({'parent':this.container,
                   'position':[20, 250],
                   'text':'Budget',
                   'font':ui.getFont('alias')
                });
                
    this.title = new GUI.TextInput({'parent':this.container,
                                   'position':[20, 290],
                                   'size':[200, 34],
                                   'text':'10000',
                                   'font':ui.getFont('alias')});
                                                              
    this.track_selector=new ui.TrackSelector({'position':[254, 160],
                                              'parent':this.container,
                                              'tracks':levels.all,
                                              'label':'Tracks'});
                                              
                                              
    this.backbtn=new ui.Button({'size':[130, 50],
                                'parent':this.container,
                                'position':[0, 520],
                                'lean':'left',
                                'text':'BACK'});
    this.backbtn.onClick(this.back, this);
    
    this.racebtn=new ui.Button({'size':[130, 50],
                                'parent':this.container,
                                'position':[this.container.size[0]-130, 520],
                                'lean':'right',
                                'text':'CREATE'});
    this.racebtn.onClick(this.create, this);              
    
};

gamejs.utils.objects.extend(CreateLobbyScene, ui.UIScene);

CreateLobbyScene.prototype.back = function(){
    this.game.showLobbyList();  
};

CreateLobbyScene.prototype.create = function(){
    
};

var JoinLobbyScene=exports.JoinLobbyScene=function(){
    JoinLobbyScene.superConstructor.apply(this, []);
    
    
    
    this.titlelbl=new GUI.Label({'parent':this.container,
                                'position':[210, 40],
                                'text':'Multiplayer',
                                'font':ui.getFont('header_black')});
    
    var columns=[{'key':'title', 'label':'Title', 'width':150},
                 {'key':'track', 'label':'Track', 'width':150},
                 {'key':'players', 'label':'Players', 'width':150}]
    this.table=new ui.Table({'parent':this.container,
                             'size':[450, 350],
                             'position':[300, 150],
                             'columns':columns,
                             'data':[]});
    
    this.create_btn=new ui.Button({'parent':this.container,
                                  'size':[200, 50],
                                  'lean':'left',
                                  'position':[0, 150],
                                  'text':'Create Lobby'});
    
    this.refresh_btn=new ui.Button({'parent':this.container,
                                    'size':[200, 50],
                                    'lean':'left',
                                    'position':[0, 210],
                                    'text':'Refresh'});
    
    this.back_btn=new ui.Button({'parent':this.container,
                                    'size':[200, 50],
                                    'lean':'left',
                                    'position':[0, 520],
                                    'text':'Back'});
    this.back_btn.onClick(this.returnToTitle, this);
    
    this.join_btn=new ui.Button({'parent':this.container,
                                'size':[200, 50],
                                'lean':'right',
                                'position':[this.container.size[0]-200, 520],
                                'text':'Join'});
                                
    this.handleMessage=function(cmd, payload){
        if(cmd=='LOBBY_LIST'){
            var data=payload.lobbies;
            var row;
            for(var i=0;i<data.length;i++){
                row = data[i];
                row.track=levels[row.track].title;
                row.players = row.playercount;
            }
            this.table.setData(data, 'No lobbies found.');
        }else if(cmd == "JOIN_LOBBY_OK"){
            this.game.joinLobby(payload.lobby_id);
        }else{
            this.handleMessageDefault(cmd, payload);
        }

    };
    
    this.refresh_btn.onClick(function(){
        this.game.getCommunicator().queueMessage('LIST_LOBBIES', {});
    }, this);
    
    this.create_btn.onClick(function(){
        this.game.createLobby();
    }, this);
    
    this.game.getCommunicator().queueMessage('LIST_LOBBIES', {});
};
gamejs.utils.objects.extend(JoinLobbyScene, ui.UIScene);

/*
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
gamejs.utils.objects.extend(CreateLobbyScene, ui.UIScene);*/

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
                  'font':ui.getFont('alias_label'),
                  'text':'name:'});
    
    //name input
    this.nameinput=new ui.NameInput({'position':[178, 129],
                                     'size':[200, 40],
                                     'text':this.game.player.alias,
                                     'parent':this.container});
    
    this.nameinput.on(GUI.EVT_CHANGE, function(event){
        this.game.player.alias=event.value; 
    }, this);
    
    this.btn_single=new ui.TitleButton({'position':[440, 210],
                                        'size':[360, 65],
                                        'text':'Single player',
                                        'parent':this.container});
    
    this.btn_single.onClick(this.singleplayer, this);
    
   /* this.btn_multi=new ui.TitleButton({'position':[440, 300],
                                        'size':[360, 65],
                                        'text':'Multiplayer',
                                        'parent':this.container});
    
    this.btn_multi.onClick(this.joinLobby, this);*/
    
    this.btn_editor=new ui.TitleButton({'position':[440, 300],
                                        'size':[360, 65],
                                        'text':'Track Editor',
                                        'parent':this.container});
    
    this.btn_editor.onClick(this.editTrack, this);
    
    if(!this.game.tried_loading){
        if(this.game.haveSave()){
            this.yes_no_dialog=new ui.YesNoDialog({'parent':this.gui,
                                     'size':[550, 150],
                                     'text':'Saved game found. Do you want to load?'});
            this.yes_no_dialog.yes.onClick(function(){
                this.yes_no_dialog.close();
                if(this.game.load())this.nameinput.setText(combatracer.game.player.alias);
            }, this);
            
            this.yes_no_dialog.no.onClick(function(){
                this.yes_no_dialog.close();
            }, this);
            this.yes_no_dialog.show();
        }
        this.game.tried_loading=true;
    }
};

gamejs.utils.objects.extend(TitleScene, ui.UIScene);

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



var SinglePlayerScene=exports.SinglePlayerScene=function(){
    SinglePlayerScene.superConstructor.apply(this, []);
    
    this.container.header_height=130;
    this.container.background_color=skin.single_player_scene.background_color;
    this.container.refresh();
    
    this.titlelbl=new GUI.Label({'parent':this.container,
                                'position':[210, 40],
                                'text':'Single Player',
                                'font':ui.getFont('header_black')});
    
    this.backbtn=new ui.Button({'size':[130, 50],
                                'parent':this.container,
                                'position':[0, 520],
                                'lean':'left',
                                'fill':skin.sp_button.fill,
                                'font':ui.getFont(skin.sp_button.font),
                                'hover_fill':skin.sp_button.fill_hover,
                                'text':'BACK'});
    this.backbtn.onClick(this.back, this);
    
    this.racebtn=new ui.Button({'size':[130, 50],
                                'parent':this.container,
                                'position':[this.container.size[0]-130, 520],
                                'lean':'right',
                                'fill':skin.sp_button.fill,
                                'font':ui.getFont(skin.sp_button.font),
                                'hover_fill':skin.sp_button.fill_hover,
                                'text':'RACE!'});
    this.racebtn.onClick(this.race, this);
    
    this.gotogarage=new ui.GoToGarage({'position':[14, 160],
                                       'parent':this.container});
    this.gotogarage.on(GUI.EVT_MOUSE_DOWN, function(){
        this.game.return_to='singleplayer';
        sounds.play({'filename':'button_click.wav'});
        this.game.showSPGarage();
    }, this);
    
    this.car_display=new ui.CarDisplay({'position':[14, 356],
                                        'gameinfo':combatracer.game.player.singleplayer,
                                          'parent':this.container});
    
    var tracks = [];
    
    leagues[combatracer.game.player.singleplayer.league].tracks.forEach(function(track){
        if(levels[track].title && (!utils.inArray(combatracer.game.player.singleplayer.completed_tracks, track))){
            tracks.push(levels[track]);
        }
    });

    this.track_selector=new ui.TrackSelector({'position':[254, 160],
                                              'parent':this.container,
                                              'tracks':tracks,
                                              'label':leagues[combatracer.game.player.singleplayer.league].name});
    
    this.diff_selector=new ui.DifficultySelect({'position':[14, 431],
                                               'parent':this.container,
                                               'size':[210, 65]});
    
};
gamejs.utils.objects.extend(SinglePlayerScene, ui.UIScene);

SinglePlayerScene.prototype.back=function(){
    this.game.showTitle();
};

SinglePlayerScene.prototype.race=function(){
    if(!this.track_selector.track){
        this.alert('You must select a track first!', true); 
    }else{
        this.game.playLevel(levels[this.track_selector.track], false, 'singleplayer');
    }
};

var LoadingScene=exports.LoadingScene=function(game, cache, next_scene){
    LoadingScene.superConstructor.apply(this, [game, cache]);
    this.container.destroy();
    var lbl=new GUI.Label({'position':[0, 0],
                     'parent':this.gui,
                      'text':'Loading, please wait...',
                      'font':ui.getFont('25_66')});
    this.gui.center(lbl);
    this.next_scene=next_scene;
};

gamejs.utils.objects.extend(LoadingScene, ui.UIScene);

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
    var y=img.getPosition()[1]-120;
    x=img.getPosition()[0];
    img.move([x, y]);
    x-=60;
    y+=img.getSize()[1]+10;
    
    new ui.KeyExplanation({'position':[x, y],
                          'key':'x',
                          'parent':this.gui,
                          'text':'Fire front weapon'});
    y+=62;
    
    new ui.KeyExplanation({'position':[x, y],
                          'key':'c',
                          'parent':this.gui,
                          'text':'Use utility'});
    y+=62;
    
    new ui.KeyExplanation({'position':[x, y],
                          'key':'v',
                          'parent':this.gui,
                          'text':'Fire rear weapon'});
    y+=62;
    
    new ui.KeyExplanation({'position':[x, y],
                          'key':'ESC',
                          'parent':this.gui,
                          'text':'Menu'});
    y+=62;
    
    
    
   this.lbl=new GUI.Label({'position':[x-30, y],
                            'parent':this.gui,
                            'text':'Loading. Please wait...',
                            'font':ui.getFont('25_66')});
   this.loaded=false;
   this.first=false;
   
   this.update=function(msDuration){
        ui.UIScene().update.apply(this, [msDuration]);
        if(!this.first){
            this.first=true;
        }else{
            if(!this.loaded){
                this.game.cacheCarSprites(this.next_scene);
                this.lbl.setText('Press any key or click to continue...');
                this.gui.despatchEvent({'type':GUI.EVT_FOCUS});
                this.gui.on(GUI.EVT_MOUSE_DOWN, this.next, this);
                this.gui.on(GUI.EVT_KEY_DOWN, this.next, this);
                this.loaded=true;
            }
        }
   }
};

gamejs.utils.objects.extend(ControlsSplash, ui.UIScene);


ControlsSplash.prototype.next=function(){
    this.game.director.replaceScene(this.next_scene);  
};

