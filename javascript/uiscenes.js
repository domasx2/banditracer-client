var gamejs = require('gamejs');
var ui=require('./ui');
var utils=require('./utils');
var levels=require('./levels');
var car_descriptions=require('./car_descriptions');

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
            this.game.playMultiplayer(levels.levels[payload.track]);
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

var GameOverScene=exports.GameOverScene=function(game, cache, table){
    GameOverScene.superConstructor.apply(this, [game, cache]);

    new ui.Label({'scene':this,
                 'position':[10, 10],
                 'text':'Race over',
                 'font':'header'});


    new ui.Button({'scene':this,
                  'position':[10, 410],
                  'text':'Continue',
                  'onclick':this.returnToTitle});

    var columns=[{'key':'place', 'label':'Place', 'width':80},
                 {'key':'player', 'label':'Player', 'width':200},
                 {'key':'kills', 'label':'Kills', 'width':80},
                 {'key':'deaths', 'label':'Deaths', 'width':80}];

    this.p_table=new ui.Table({'scene':this,
                                  'position':[10, 70],
                                  'rows':10,
                                  'columns':columns});

    this.p_table.setData(table);

};
gamejs.utils.objects.extend(GameOverScene, ui.UIScene);

var JoinLobbyScene=exports.JoinLobbyScene=function(game, cache){
    JoinLobbyScene.superConstructor.apply(this, [game, cache]);

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
                row.track=levels.levels[row.track].data.name;
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
gamejs.utils.objects.extend(JoinLobbyScene, ui.UIScene);


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

    this.loadLevel=function(btn, pars){
        this.game.playLevel(pars[0]);
    };

    this.createLobby=function(){
        var alias=this.alias.getText();
        if(!alias) this.alert('You must enter your nickname first!');
        else{
            this.game.player.alias=alias;
            this.alert('Connecting. Please wait...', false);
            this.game.getCommunicator().queueMessage('HI',{'alias':alias});
            this.waiting_for='createLobby';

        }
    };

    this.handleMessage=function(cmd, payload){
        if(cmd=='HELLO'){
            this.game.player.uid=payload.uid;
            this.game.acquainted=true;
            this.clearAlert();
            if(this.waiting_for=='createLobby'){
                this.game.createLobby();
            }else{
                this.game.showLobbyList();
            }
        }else{
            this.handleMessageDefault(cmd, payload);
        }
    };


    this.joinLobby=function(){
        var alias=this.alias.getText();
        if(!alias) this.alert('You must enter your nickname first!');
        else{
            this.game.player.alias=alias;
            this.alert('Connecting. Please wait...', false);
            this.game.getCommunicator().queueMessage('HI',{'alias':alias});
            this.waiting_for='joinLobby';
        }
    };

    this.playAgainstBots=function(){
        this.game.playAgainstBots();
    };



    //labels and buttons

    new ui.Image({'filename':'title3.png',
                 'position':[10, 10],
                 'scene':this});

    new ui.Image({'filename':'controls.png',
                 'position':[300, 300],
                 'scene':this});

    new ui.Image({'filename':'guncar.png',
                 'position':[280, 130],
                 'scene':this});

    new ui.Label({'scene':this,
                 'position':[20, 90],
                 'text':'Single player'});

    new ui.Button({'scene':this,
                  'position':[20, 130],
                  'text':'Play a single race',
                  'onclick':this.playAgainstBots});



    new ui.Label({'scene':this,
                 'position':[20, 190],
                 'text':'Multiplayer'});



    new ui.Button({'scene':this,
                  'position':[20, 230],
                  'text':'Create lobby',
                  'onclick':this.createLobby});

    new ui.Button({'scene':this,
                  'position':[20,270],
                  'text':'Join a lobby',
                  'onclick':this.joinLobby});

    new ui.Label({'scene':this,
                 'position':[20, 320],
                 'text':'Nickname:'})

    this.alias=new ui.TextBox({'scene':this,
                                'text':'Guest',
                                'position':[20, 350],
                                'size':[150, 25]});

    return this;
};

gamejs.utils.objects.extend(TitleScene, ui.UIScene);



var PlayAgainstBotsScene=exports.PlayAgainstBotsScene=function(game, cache){
    PlayAgainstBotsScene.superConstructor.apply(this, [game, cache]);

    this.play=function(){
        if(!this.selector.selected){
            this.alert('You must select a track first!');
        }
        else if(!this.car_selector.selected){
            this.alert('You must select a car first!');
        }else{
            this.game.playLevel(levels.levels[this.selector.selected], this.car_selector.selected);
        }
    };

    new ui.Label({'scene':this,
                 'position':[10, 10],
                 'text':'Play against bots',
                 'font':'header'});

    new ui.Button({'scene':this,
                  'position':[10, 400],
                  'text':'Back ',
                  'onclick':this.returnToTitle});

    new ui.Button({'scene':this,
                  'position':[220, 400],
                  'text':'Play',
                  'onclick':this.play});

    this.selector=new ui.LevelSelector({'scene':this,
                         'position':[10, 90]});



    new ui.Label({'scene':this,
                 'position':[430, 90],
                 'text':'Select a car'});

    this.car_selector=new ui.CarSelector({'scene':this,
                                    'position':[430, 130]});


    return this;

};
gamejs.utils.objects.extend(PlayAgainstBotsScene, ui.UIScene);

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
