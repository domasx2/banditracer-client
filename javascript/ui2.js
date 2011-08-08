var gamejs=require('gamejs');
var GUI=require('gamejs-gui');
var skin=require('skin');
var renderer=require('renderer');
var settings=require('settings');
var combatracer=require('combatracer');
var car_descriptions=require('car_descriptions');
var levels=require('levels');
var utils=require('utils');

exports.fonts={};

exports.init=function(){
    for(var font in skin.fonts){
        exports.fonts[font]=new GUI.CachedFont(skin.fonts[font][0], skin.fonts[font][1]);   
    }
};

var getFont=exports.getFont=function(font){
    return exports.fonts[font];
};

//SCENE CONTAINER
var SceneContainer=function(pars){
    this.background_color=pars.background_color || skin.ui_background;
    this.header_height=pars.header_height || 110;
    SceneContainer.superConstructor.apply(this, [pars]);
};

gamejs.utils.objects.extend(SceneContainer, GUI.View);

SceneContainer.prototype.paint=function(){
    gamejs.draw.rect(this.surface, skin.ui_header_background, new gamejs.Rect([0, 0], [this.surface.getSize()[0], this.header_height]));
    gamejs.draw.rect(this.surface, this.background_color, new gamejs.Rect([0, this.header_height], [this.surface.getSize()[0], this.surface.getSize()[1]-this.header_height]));
};



var UIScene=exports.UIScene=function(){
    var cache=this.cache=cache=renderer.cache;
    var game=this.game=combatracer.game;
    game.display.fill('#FFF');
    this.gui=new GUI.GUI(game.display);
    this.gui.on(GUI.EVT_PAINT,
                function(){
                    this.surface.clear();
                }, this.gui);
    this.container=new SceneContainer({'position':[0, 0],
                                        'size':[800, 600],
                                        'parent':this.gui});
    
    this.gui.center(this.container);

    //bandit racer label at the top
    this.br_title=new BRTitle({'position':[60, 11],
                              'parent':this.container});
    
    this.guncar=new GUI.Image({'position':[32, 110-44],
                              'parent':this.container,
                              'image':cache.getUIImage('guncar.png')});

    //if ping is set to true, this scene will ping the server every ms_to_ping miliseconds so as not to time out.
    this.ping=false;
    this.ms_to_ping=10000;

    this.dialog=new Dialog({'gui':this.gui,
                           'size':[450, 150]});

    this.alert=function(text, button){
        this.dialog.show(text, button);
    };
    
    this.clearAlert=function(){
        this.dialog.close();
    };
    
    this.handleEvent=function(event){
        this.gui.despatchEvent(event);  
    };

    this.returnToTitle=function(){
        this.game.showTitle();
    };
    this.handleMessageDefault=function(cmd, payload){
        if(cmd==='ERR'){
            this.alert(payload.text);
        }else if(cmd==='CRITICAL_ERR'){
            this.returnToTitle();
            this.game.title_scene.alert(payload.text);
        }else if(cmd==='HELLO' || cmd==='PONG'){

        }else{
            this.alert('Unknown server message:'+cmd);
        }

    };
    this.renderer=new renderer.UIRenderer(settings.get('SCREEN_WIDTH'), settings.get('SCREEN_HEIGHT'), this.cache);

  
    this.update=function(msDuration){
        if(this.ping){
            this.ms_to_ping-=msDuration;
            if(this.ms_to_ping<=0){
                this.game.getCommunicator().queueMessage('PING');
                this.ms_to_ping=10000;
            }
        }
        this.gui.update(msDuration);
    };
  
    this.draw=function(display){  
        this.gui.draw();
    };

  return this;
};

UIScene.prototype.handleMessage=function(cmd, payload){
    console.log('uiscene',cmd, payload);
    this.handleMessageDefault(cmd, payload);
};

var BRTitle=exports.BRTitle=function(pars){
    pars.text='Bandit Racer';
    pars.font=getFont('header_black');
    BRTitle.superConstructor.apply(this, [pars]);
};

gamejs.utils.objects.extend(BRTitle, GUI.Label);

BRTitle.prototype.paint=function(){
    var font1=getFont('header_brown');
    var font2=getFont('header_black');
    var ofst=0;
    font2.render(this.surface, 'B', [0, 0], null, -3);
    ofst+=font2.getTextSize('B')[0]-3;
    
    font1.render(this.surface, 'andit ', [ofst, 0], null, -3);
    ofst+=font1.getTextSize('andit ')[0]-3;
    
    font2.render(this.surface, 'R', [ofst, 0], null, -3);
    ofst+=font2.getTextSize('R')[0]-3;
    
    font1.render(this.surface, 'acer', [ofst, 0], null, -3);
};

var NameInput=exports.NameInput=function(pars){
    pars.size=[200, 40];
    pars.font=getFont('alias');
    pars.scw_size=[190, 40];
    NameInput.superConstructor.apply(this, [pars]);
};

gamejs.utils.objects.extend(NameInput, GUI.TextInput)

NameInput.prototype.paint=function(){
    this.surface.clear();
    gamejs.draw.polygon(this.surface, '#FFF', [[10, 0], [this.size[0], 0], [this.size[0]-10, this.size[1]], [0, this.size[1]]]);
};

var TitleButton=exports.TitleButton=function(pars){
    pars.font=pars.font || getFont(skin.title_button.font);
    TitleButton.superConstructor.apply(this, [pars]);
};

gamejs.utils.objects.extend(TitleButton, GUI.Button);

TitleButton.prototype.paint=function(){
    var color = this.hover ? skin.title_button.fill_hover : skin.title_button.fill;
    this.surface.clear();
    gamejs.draw.polygon(this.surface, color, [[40, 0], [this.size[0], 0], [this.size[0], this.size[1]], [0, this.size[1]]]);
};

var Button=exports.Button=function(pars){
    pars.font=pars.font || getFont(skin.button.font);
    this.fill=pars.fill || skin.button.fill;
    this.hover_fill = pars.hover_fill || skin.button.hover_fill;
    this.lean = pars.lean || 'right';
    Button.superConstructor.apply(this, [pars]);
};

gamejs.utils.objects.extend(Button, GUI.Button);

Button.prototype.paint=function(){
    var color = this.hover ? this.hover_fill : this.fill;
    this.surface.clear();
    if(this.lean=='right') gamejs.draw.polygon(this.surface, color, [[10, 0], [this.size[0], 0], [this.size[0], this.size[1]], [0, this.size[1]]]);
    else if(this.lean=='both') gamejs.draw.polygon(this.surface, color, [[10, 0], [this.size[0], 0], [this.size[0]-10, this.size[1]], [0, this.size[1]]]);
    else gamejs.draw.polygon(this.surface, color, [[0, 0], [this.size[0]-10, 0], [this.size[0], this.size[1]], [0, this.size[1]]]);
};

var Dialog=exports.Dialog = function(pars){
    Dialog.superConstructor.apply(this, [pars]);
    this.label=new GUI.Label({'position':[0, 0],
                             'parent':this,
                             'font':getFont(skin.dialog.font),
                             'text':'b'});
    
    this.btn= new Button({'position':[0, 0],
                         'size':[150, 50],
                         'parent':this,
                         'lean':'both',
                         'text':'Ok'});
    this.center(this.btn);
    this.btn.move([this.btn.position[0], this.btn.position[1]+30]);
    this.btn.onClick(function(){
        this.close();
    }, this);
};

gamejs.utils.objects.extend(Dialog, GUI.Dialog);

Dialog.prototype.show=function(text, button){
    if(button==undefined) button=true;
    this.label.setText(text);
    this.center(this.label);
    this.label.move([this.label.position[0], this.label.position[1]-30]);
    if(button){
        this.btn.show();
    }else this.btn.hide();
    GUI.Dialog.prototype.show.apply(this, []);
};

var GoToGarage=exports.GoToGarage=function(pars){
    pars.size=[210, 180];
    GoToGarage.superConstructor.apply(this, [pars]);

    this.img= new GUI.Image({'position':[0, 0],
                            'parent':this,
                            'image':renderer.cache.getUIImage('garage.png')});
    this.center(this.img);
    this.img.move([this.img.position[0], 7]);
    
    this.lbl=new GUI.Label({'position':[0, 0],
                          'parent':this,
                          'font':getFont(skin.garage_btn.font),
                          'text':'Garage'});
    this.center(this.lbl);
    this.lbl.move([this.lbl.position[0], this.size[1]-this.lbl.size[1]-17]);    
};

gamejs.utils.objects.extend(GoToGarage, GUI.View);

GoToGarage.prototype.paint=function(){
    this.surface.fill(skin.garage_btn.label_bg);
    gamejs.draw.rect(this.surface, this.hover ? skin.garage_btn.bg_color_hover : skin.garage_btn.bg_color, new gamejs.Rect([0, 0], [this.size[0], 126]));
};


var CarDisplay=exports.CarDisplay=function(pars){
    pars.size=[210, 65];
    CarDisplay.superConstructor.apply(this, [pars]);
    this.gameinfo=pars.gameinfo;
    
    new GUI.Label({'parent':this,
                  'position':[10, 6],
                  'font':getFont(skin.sp_car_display.font1),
                  'text':'Current Car:'});
    
    this.carlbl=new GUI.Label({'parent':this,
                              'position':[20, 17],
                              'font':getFont(skin.sp_car_display.font2),
                              'text':car_descriptions[this.gameinfo.car.type].name});
    
    this.upbtn=new IncrementButton({'parent':this,
                                   'position':[170, 10],
                                   'size':[30, 20],
                                   'direction':'up'});
    this.cararray=['Racer', 'Brawler', 'Bandit'];
    this.upbtn.onClick(function(){
        var idx=this.cararray.indexOf(this.gameinfo.car.type)+1;
        if(idx==3)idx=0;
        this.setCar(this.cararray[idx]);
    }, this);
    
    this.downbtn=new IncrementButton({'parent':this,
                                     'position':[170, 35],
                                     'size':[30, 20],
                                     'direction':'down'});
    this.setCar=function(car){
        this.gameinfo.car.type=car;
        this.carlbl.setText(car_descriptions[this.gameinfo.car.type].name);
        if(car=='Brawler') this.gameinfo.car.front_weapon.type='MissileLauncher';
        else this.gameinfo.car.front_weapon.type='Machinegun';
    };
    
    this.downbtn.onClick(function(){
        var idx=this.cararray.indexOf(this.gameinfo.car.type)-1;
        if(idx==-1)idx=2;
        this.setCar(this.cararray[idx]);
        
    }, this);
};
gamejs.utils.objects.extend(CarDisplay, GUI.View);

CarDisplay.prototype.paint=function(){
    gamejs.draw.polygon(this.surface, skin.sp_car_display.bg_color,
                        [[0, 0], [this.size[0], 0], [this.size[0], this.size[1]-20],
                         [this.size[0]-20, this.size[1]], [0, this.size[1]]]);
};

TrackSelectorItem=exports.TrackSelectorItem=function(pars){
    pars.size=[226, 22];
    this.track=pars.track;
    this.track_obj=levels[this.track];
    TrackSelectorItem.superConstructor.apply(this, [pars]);
    this.label=new GUI.Label({'position':[0, 0],
                         'parent':this,
                         'font':getFont(skin.track_selector.item_font),
                         'text':this.track_obj.title});
    this.center(this.label);
    this.label.move([this.size[0]-this.label.size[0]-16, this.label.position[1]]);
    this.selected=false;
    this.on(GUI.EVT_MOUSE_DOWN, this.select, this);
};

gamejs.utils.objects.extend(TrackSelectorItem, GUI.View);

TrackSelectorItem.prototype.select=function(){
    this.selected=true;
    this.refresh();
    this.despatchEvent({'type':'track_select', 'track':this.track});
};

TrackSelectorItem.prototype.deselect=function(){
    this.selected=false;
    this.refresh();
};

TrackSelectorItem.prototype.paint=function(){
    this.surface.fill(this.selected ? skin.track_selector.front_color : this.hover ? skin.track_selector.item_hover_color : skin.track_selector.back_color);
};

TrackSelector=exports.TrackSelector=function(pars){
    pars.size=[536, 320];
    TrackSelector.superConstructor.apply(this, [pars]);
    this.track=null;
    this.tbg1=new GUI.View({'position':[0, 0],
                           'size':[226, 261],
                           'parent':this});
    this.tbg1.on(GUI.EVT_PAINT, function(){
        gamejs.draw.polygon(this.surface, skin.track_selector.back_color,
                        [[0, 0], [this.size[0], 0], [this.size[0], this.size[1]],
                         [20, this.size[1]], [0, this.size[1]-20]]);
    }, this.tbg1);
    
    this.tbg2=new GUI.View({'position':[226, 0],
                           'size':[310, 320],
                           'parent':this});
    this.tbg2.on(GUI.EVT_PAINT, function(){
        this.surface.fill(skin.track_selector.front_color);
    }, this.tbg2);
    
    this.trackdisplay=new TrackDisplay({'parent':this.tbg2,
                                       'position':[0, 0]});
    
    var ti;
    for(var track in levels){
        if(levels[track].title){
            ti=new TrackSelectorItem({'parent':this.tbg1,
                                     'track':track,
                                     'position':[0, 0]});
            ti.on('track_select', this.select, this);
        }
    };
    GUI.layout.vertical(this.tbg1.children, 16);    
};

gamejs.utils.objects.extend(TrackSelector, GUI.View);

TrackSelector.prototype.select=function(event){
    this.track=event.track;
    this.tbg1.children.forEach(function(item){
        if(item.track!=this.track)item.deselect();
    }, this);
    this.trackdisplay.setTrack(this.track);
};

var TrackDisplay=exports.TrackDisplay=function(pars){
    this.track=null;
    this.img=null;
    this.lbl=null;
    pars.size=[310, 320];
    TrackDisplay.superConstructor.apply(this, [pars]);
    if(pars.track) this.setTrack(pars.track);
    this.lbl2=new GUI.Label({'parent':this,
                            'position':[0, 0],
                            'font':getFont(skin.trackdisplay.font),
                            'text':'Select a track!'});
    this.center(this.lbl2);
};

gamejs.utils.objects.extend(TrackDisplay, GUI.View);

TrackDisplay.prototype.setTrack=function(track){
    this.track=track;
    if(track){
        this.lbl2.hide();
        var st=utils.renderLevelBackground(levels[track], false);
        var sz=st.getSize();
        if(sz[0]>sz[1]){
            var q=sz[0]/280;
        }else{
            var q=sz[1]/280;
        }
        var new_sz=[parseInt(sz[0]/q), parseInt(sz[1]/q)];
        s=new gamejs.Surface(new_sz[0], new_sz[1]);
        s.blit(st, new gamejs.Rect([0, 0], new_sz), new gamejs.Rect([0, 0], st.getSize()));
        
        if(!this.img){
            this.img=new GUI.Image({'parent':this,
                                   'position':[15, 10],
                                   'image':s});
        }else{
            this.img.resize(s.getSize());
            this.img.setImage(s);
        }
        if(!this.lbl){
            this.lbl=new GUI.Label({'parent':this,
                                   'position':[0, 0],
                                   'text':levels[track].title,
                                   'font':getFont(skin.trackdisplay.font)});
        }else{
            this.lbl.setText(levels[track].title);
        }
        this.center(this.lbl);
        this.lbl.move([this.lbl.position[0], this.size[1]-this.lbl.size[1]-5]);
    }
};

/***
 *
 *pars:
     scene
     position
     columns  - list of column defs,
                column def is {'key':'item', 'label':'The Item', 'width':100}
     data - list of data: {id:row_id,
                           key:value,
                           key2:value,
                           ....}
    selectable - can rows be selected?*/

var Table=exports.Table=function(pars){
    Table.superConstructor.apply(this, [pars]);
    this.columns=pars.columns;
    this.data=pars.data;
    this.header=new GUI.View({'parent':this,
                             'size':[this.size[0], 30],
                             'position':[0, 0]});
    this.header.on(GUI.EVT_PAINT, function(){
        this.surface.fill(skin.table.header_fill);
    }, this.header);
    
    var ofst=0;
    this.columns.forEach(function(column){
        new GUI.Label({'parent':this.header,
                      'position':[ofst+20, 3],
                      'font':getFont(skin.table.header_font),
                      'text':column.label});
        ofst+=column.width;
    }, this);
    
    this.body=new GUI.View({'parent':this,
                             'size':[this.size[0], this.size[1]-30],
                             'position':[0, 30]});
    this.body.on(GUI.EVT_PAINT, function(){
        this.surface.fill(skin.table.body_fill);
    }, this.body);
    if(this.data) this.setData(this.data);
};

gamejs.utils.objects.extend(Table, GUI.View);

Table.prototype.setData=function(data){
    this.body.children=[];
    var row_ofst=0, col_ofst;
    data.forEach(function(row){
        col_ofst=0;
        var view=new GUI.View({'parent':this.body,
                              'size':[this.size[0], 30],
                              'position':[0, row_ofst]});
        this.columns.forEach(function(column){
            new GUI.Label({'parent':view,
                        'position':[col_ofst+20, 3],
                        'font':getFont(skin.table.header_font),
                        'text':String(row[column.key]),
                        'font':getFont(skin.table.data_font)});
            col_ofst+=column.width;
        }, this);
        row_ofst+=30;
    }, this);
};


var IncrementButton=exports.IncrementButton=function(pars){
    var image=new gamejs.Surface(pars.size);
    var image_hover=new gamejs.Surface(pars.size);
    if(pars.direction=='up'){
        var ptlist=[[parseInt(pars.size[0]/2), 0], pars.size, [0, pars.size[1]]];    
    }
    else if(pars.direction=='down'){
        var ptlist=[[0, 0], [pars.size[0], 0],[parseInt(pars.size[0]/2), pars.size[1]]];
    }
    else if(pars.direction=='left'){
        var ptlist=[[0, parseInt(pars.size[1]/2)], [pars.size[0], 0], pars.size];
    }else{
        var ptlist=[[0, 0], [pars.size[0], parseInt(pars.size[1]/2)], [0, pars.size[1]]];
    }
    
    gamejs.draw.polygon(image, skin.title_button.fill, ptlist);
    gamejs.draw.polygon(image_hover, skin.title_button.fill_hover, ptlist);
    
    pars.image=image;
    pars.image_hover=image_hover;
    pars.image_down=false;
    IncrementButton.superConstructor.apply(this, [pars]);
};
gamejs.utils.objects.extend(IncrementButton, GUI.Button);