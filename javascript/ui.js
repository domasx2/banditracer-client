var gamejs=require('gamejs');
var GUI=require('./gamejs-gui');
var skin=require('./skin');
var renderer=require('./renderer');
var settings=require('./settings');
var combatracer=require('./combatracer');
var car_descriptions=require('./car_descriptions');
var weapon_descriptions=require('./weapon_descriptions');
var levels=require('./levels');
var utils=require('./utils');
var sounds=require('./sounds');
var leagues=require('./leagues');

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
    this.surface.clear();
    gamejs.draw.rect(this.surface, skin.ui_header_background, new gamejs.Rect([0, 0], [this.surface.getSize()[0], this.header_height]));
    gamejs.draw.rect(this.surface, this.background_color, new gamejs.Rect([0, this.header_height], [this.surface.getSize()[0], this.surface.getSize()[1]-this.header_height]));
};



var UIScene=exports.UIScene=function(){
    var cache=this.cache=cache=renderer.cache;
    var game=this.game=combatracer.game;
   // game.display.fill('#FFF');
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

    this.dialog=new Dialog({'parent':this.gui,
                           'size':[600, 150]});

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
    this.onClick(function(){
        sounds.play({'filename':'button_click.wav'});
    });
};

gamejs.utils.objects.extend(TitleButton, GUI.Button);

TitleButton.prototype.paint=function(){
    var color = this.isHovered() ? skin.title_button.fill_hover : skin.title_button.fill;
    this.surface.clear();
    gamejs.draw.polygon(this.surface, color, [[40, 0], [this.size[0], 0], [this.size[0], this.size[1]], [0, this.size[1]]]);
};

var Button=exports.Button=function(pars){
    this.font=pars.font=pars.font || getFont(skin.button.font);
    this.hover_font=pars.hover_font;
    this.fill=pars.fill || skin.button.fill;
    this.hover_fill = pars.hover_fill || skin.button.hover_fill;
    this.lean = pars.lean || 'right';
    Button.superConstructor.apply(this, [pars]);
    this.onClick(function(){
        sounds.play({'filename':'button_click.wav'});
    });
};

gamejs.utils.objects.extend(Button, GUI.Button);

Button.prototype.paint=function(){
    if(this.label && this.isHovered() && this.hover_font){
        this.label.font=this.hover_font;
    }else{
        this.label.font=this.font;
    }
    this.label.refresh();
    var color = this.isHovered() ? this.hover_fill : this.fill;
    this.surface.clear();
    if(this.lean=='right') gamejs.draw.polygon(this.surface, color, [[10, 0], [this.size[0], 0], [this.size[0], this.size[1]], [0, this.size[1]]]);
    else if(this.lean=='both') gamejs.draw.polygon(this.surface, color, [[10, 0], [this.size[0], 0], [this.size[0]-10, this.size[1]], [0, this.size[1]]]);
    else if(this.lean=='none') gamejs.draw.rect(this.surface, color, new gamejs.Rect([0,0], this.getSize()));
    else gamejs.draw.polygon(this.surface, color, [[0, 0], [this.size[0]-10, 0], [this.size[0], this.size[1]], [0, this.size[1]]]);
};

var YesNoDialog=exports.YesNoDialog=function(pars){
    YesNoDialog.superConstructor.apply(this, [pars]);
    this.label=new GUI.Label({'position':[0, 0],
                             'parent':this,
                             'font':getFont(skin.dialog.font),
                             'text':pars.text || 'b'});
    
    this.yes= new Button({'position':[0, 0],
                         'size':[150, 50],
                         'parent':this,
                         'lean':'both',
                         'text':'Yes'});
    this.no=new Button({'position':[0, 0],
                         'size':[150, 50],
                         'parent':this,
                         'lean':'both',
                         'text':'No'});
    
    this.center(this.yes);
    this.center(this.no);
    this.center(this.label);
    this.label.move([this.label.getPosition()[0], this.label.getPosition()[1]-30]);
    this.yes.move([this.yes.position[0]-80, this.yes.position[1]+30]);
    this.no.move([this.no.position[0]+80, this.no.position[1]+30]);
    this.yes.onClick(function(){
        this.close();
    }, this);
    this.no.onClick(function(){
        this.close();
    }, this);
}
gamejs.utils.objects.extend(YesNoDialog, GUI.Dialog);

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
    gamejs.draw.rect(this.surface, this.isHovered() ? skin.garage_btn.bg_color_hover : skin.garage_btn.bg_color, new gamejs.Rect([0, 0], [this.size[0], 126]));
};

var DifficultySelect=exports.DifficultySelect=function(pars){
    DifficultySelect.superConstructor.apply(this, [pars]);
    
    this.difficulties=['Easy', 'Medium', 'Hard'];
    
    if (combatracer.game.player.singleplayer.completed) 
    	this.difficulties.push('Hell');
    
    new GUI.Label({'parent':this,
                  'position':[10, 6],
                  'font':getFont(skin.sp_car_display.font1),
                  'text':'Difficulty:'});
    
    this.difflbl=new GUI.Label({'parent':this,
                                'position':[27, 17],
                                'font':getFont(skin.sp_car_display.font2),
                                 'text':this.difficulties[combatracer.game.player.singleplayer.difficulty-1]});
    
    this.left=new IncrementButton({'parent':this,
                                   'position':[5, 28],
                                   'size':[16, 25],
                                   'direction':'left'});
    
    this.left.onClick(function(){
        combatracer.game.player.singleplayer.difficulty--;
        if(combatracer.game.player.singleplayer.difficulty==0) combatracer.game.player.singleplayer.difficulty = this.difficulties.length;
        this.difflbl.setText(this.difficulties[combatracer.game.player.singleplayer.difficulty-1]);
    }, this);
    
    this.right=new IncrementButton({'parent':this,
                                   'position':[210-20-5, 28],
                                   'size':[16, 25],
                                   'direction':'right'});
    
    this.right.onClick(function(){
        combatracer.game.player.singleplayer.difficulty++;
        if(combatracer.game.player.singleplayer.difficulty == this.difficulties.length+1) combatracer.game.player.singleplayer.difficulty=1;
        this.difflbl.setText(this.difficulties[combatracer.game.player.singleplayer.difficulty-1]);
    }, this);
    
};
gamejs.utils.objects.extend(DifficultySelect, GUI.View);

DifficultySelect.prototype.paint=function(){
    gamejs.draw.polygon(this.surface, skin.sp_car_display.bg_color,
                        [[0, 0], [this.size[0]-20, 0], [this.size[0], 20],
                         [this.size[0], this.size[1]], [0, this.size[1]]]);
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
                              'position':[16, 17],
                              'font':getFont(skin.sp_car_display.font2),
                              'text':car_descriptions[this.gameinfo.car.type].name});
    
};
gamejs.utils.objects.extend(CarDisplay, GUI.View);

CarDisplay.prototype.paint=function(){
    gamejs.draw.polygon(this.surface, skin.sp_car_display.bg_color,
                        [[0, 0], [this.size[0], 0], [this.size[0], this.size[1]-20],
                         [this.size[0]-20, this.size[1]], [0, this.size[1]]]);
};

TrackSelectorItem=exports.TrackSelectorItem=function(pars){
    pars.size=[pars.parent.size[0], 22];
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
    sounds.play({'filename':'button_click.wav'});
    this.despatchEvent({'type':'track_select', 'track':this.track});
};

TrackSelectorItem.prototype.deselect=function(){
    this.selected=false;
    this.refresh();
};

TrackSelectorItem.prototype.paint=function(){
    this.surface.fill(this.selected ? skin.track_selector.front_color : this.isHovered() ? skin.track_selector.item_hover_color : skin.track_selector.back_color);
};

TrackSelector=exports.TrackSelector=function(pars){
    pars.size=[536, 320];
    TrackSelector.superConstructor.apply(this, [pars]);
    this.track=null;
    
    if(pars.tracks.length <= 7){
        this.tbg1=new GUI.View({'position':[0, 30],
                               'size':[226, 231],
                               'parent':this});
    } else {
        this.tbg1 = new GUI.ScrollableView({'position':[0, 30],
                                           'size':[206, 201],
                                           'parent':this});
        var scrollbar=new GUI.VerticalScrollbar({'parent':this,
                                                'position':[this.tbg1.getSize()[0], 35],
                                                'size':[20, this.tbg1.getSize()[1]-10]});
        this.tbg1.setVerticalScrollbar(scrollbar);
    }
                           
                           
                           
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
    
    new GUI.Label({'parent':this,
                  'position':[10, 0],
                  'font':getFont('alias'),
                  'text':pars.label});
    
    pars.tracks.forEach(function(track){
        ti=new TrackSelectorItem({'parent':this.tbg1,
                                 'track':track.id,
                                 'position':[0, 0]});
        ti.on('track_select', this.select, this);
    }, this);
    
    GUI.layout.vertical(this.tbg1.children, 5);    
    
    if(this.tbg1.autoSetScrollableArea){
        this.tbg1.autoSetScrollableArea();
    }
    
};

gamejs.utils.objects.extend(TrackSelector, GUI.View);

TrackSelector.prototype.select=function(event){
    this.track=event.track;
    this.tbg1.children.forEach(function(item){
        if(item.deselect && (item.track!=this.track))item.deselect();
    }, this);
    this.trackdisplay.setTrack(this.track);
};

var TrackDisplay=exports.TrackDisplay=function(pars){
    this.track=null;
    this.img=null;
    this.lbl=null;
    pars.size=[316, 320];
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

Table.prototype.setData=function(data, empty_label){
    this.body.children=[];
    var row_ofst=0, col_ofst;
    if (data.length){
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
    } else if(empty_label){
        new GUI.Label({'parent':this.body,
                        'position':[20, 3],
                        'font':getFont(skin.table.header_font),
                        'text':String(empty_label),
                        'font':getFont(skin.table.data_font)});
    }
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
    this.onClick(function(){
        sounds.play({'filename':'button_click.wav'});
    });
};
gamejs.utils.objects.extend(IncrementButton, GUI.Button);


var Stars=exports.Stars=function(pars){
    pars.image=renderer.cache['static'][pars.stars+'stars.png'];
    Stars.superConstructor.apply(this, [pars]);
};
gamejs.utils.objects.extend(Stars, GUI.Image);

Stars.prototype.setStars=function(stars){
    var img=renderer.cache['static'][stars+'stars.png'];
    this.resize(img.getSize())
    this.setImage(img);
};

var KeyExplanation=exports.KeyExplanation=function(pars){
    pars.size=[400, 52];
    KeyExplanation.superConstructor.apply(this, [pars]);
    var font=getFont('25_66');
    this.key=pars.key;
    this.text=pars.text;
    var bt_w= 60;
    if(this.key.length>1) bt_w=font.getTextSize(this.key)[0]+50;
    this.btn=new GUI.Button({'size':[bt_w, this.getSize()[1]],
                            'position':[0, 0],
                            'font':font,
                            'parent':this,
                            'image':renderer.cache.getUIImage('key_bg.png'),
                            'text':this.key});
    this.btn.label.move([this.btn.label.getPosition()[0], this.btn.label.getPosition()[1]-7]);
    
    this.lbl=new GUI.Label({'position':[0, 0],
                           'parent':this,
                           'font':font,
                           'text':this.text});
    
    this.center(this.lbl);
    this.lbl.move([bt_w+30, this.lbl.getPosition()[1]]);
};

gamejs.utils.objects.extend(KeyExplanation, GUI.View);