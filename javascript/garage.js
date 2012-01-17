var gamejs = require('gamejs');
var ui=require('./ui');
var utils=require('./utils');
var levels=require('./levels');
var sounds=require('./sounds');
var car_descriptions=require('./car_descriptions');
var weapon_descriptions=require('./weapon_descriptions');
var GUI=require('./gamejs-gui');
var skin=require('./skin');
var combatracer=require('./combatracer');
var renderer=require('./renderer');

var EURO_SYMBOL='\u20AC';

var SLOT_TO_LABEL={'front_weapon':'Front weapon slot',
                    'util':'Utility slot',
                    'rear_weapon':'Rear weapon slot'};
                    
var UPGRADE_ACC='acc_upgrades';
var UPGRADE_SPEED='speed_upgrades';
var UPGRADE_ARMOR='armor_upgrades';
    
var UPGRADE_TYPE_TO_LABEL={};
UPGRADE_TYPE_TO_LABEL[UPGRADE_ACC]='Acceleration';
UPGRADE_TYPE_TO_LABEL[UPGRADE_SPEED]='Top Speed';
UPGRADE_TYPE_TO_LABEL[UPGRADE_ARMOR]='Armor';

var GarageScene=exports.GarageScene=function(player_data){
    GarageScene.superConstructor.apply(this, []);
    this.player_data=player_data;
    this.car_descr=car_descriptions[this.player_data.car.type];
    this.container.header_height=130;
    this.container.background_color=skin.garage.background_color;
    this.container.refresh();
    this.container.on(GUI.EVT_PAINT, this.paintBackground, this);
    this.container.on(GUI.EVT_AFTER_PAINT, this.afterPaint, this);
    this.selected_item=null;
    this.selected_slot=null;
    this.titlelbl=new GUI.Label({'parent':this.container,
                                'position':[210, 40],
                                'text':'Garage',
                                'font':ui.getFont('header_black')});
    
    this.backbtn=new ui.Button({'parent':this.container,
                               'size':[130, 50],
                               'position':[670, 530],
                               'font':ui.getFont(skin.garage.back_button.font),
                               'hover_font':ui.getFont(skin.garage.back_button.hover_font),
                               'fill':skin.garage.back_button.fill,
                               'hover_fill':skin.garage.back_button.hover_fill,
                               'text':'BACK',
                               'lean':'right'});
    
    this.buy_car_btn=new ui.Button({'parent':this.container,
                                   'size':[300, 50],
                                   'position':[350, 530],
                                   'font':ui.getFont('button2_hover'),
                                   'fill':'#006837',
                                   'hover_fill':'#00381C',
                                   'text':'BUY NEW CAR',
                                   'lean':'both'});
    
    this.buy_car_btn.onClick(function(){
        this.game.showCarDealer(this.player_data);
    }, this);
    
    this.balance_label=new GUI.Label({'parent':this.container,
                                     'font':ui.getFont(skin.garage.balance_font),
                                     'position':[8, 172],
                                     'text':'Balance '+this.player_data.balance+'\u20AC'})
    
    //car title
    new GUI.Label({'parent':this.container,
                  'position':[52, 234],
                  'font':ui.getFont(skin.garage.car_title_font),
                  'text':this.car_descr.name});

    
    this.weapon_info=new WeaponInfo({'parent':this.container,
                                    'scene':this,
                                    'position':[270, 160]});
    
    this.tuning=new Tuning({'parent':this.container,
                           'scene':this,
                           'position':[537, 160]});
    
    this.weapon_info.buy_s.button.onClick(this.buyItem, this);
    
    this.backbtn.onClick(function(){
        this.game.returnTo();
    }, this);
    
    this.shop=new Shop({'parent':this.container,
                       'scene':this,
                'position':[275,440]});
    
    this.shop.on('select', this.selectWeapon, this);
    
    
    this.slots={};
    this.slots['front_weapon']=new EquipmentSlot({'parent':this.container,
                                                    'position':[144, 295],
                                                    'scene':this,
                                                    'slot_type':'front_weapon'});
    
    this.slots['util']=new EquipmentSlot({'parent':this.container,
                                        'position':[80, 390],
                                        'scene':this,
                                        'slot_type':'util'});
    
    this.slots['rear_weapon']=new EquipmentSlot({'parent':this.container,
                                                    'position':[107, 505],
                                                    'scene':this,
                                                    'slot_type':'rear_weapon'});
    
    for(var t in this.slots){
        this.slots[t].on('select', this.selectSlot, this);
    }
    this.slots.front_weapon.select();
    
};
gamejs.utils.objects.extend(GarageScene, ui.UIScene);

GarageScene.prototype.selectSlot=function(event){
    this.shop.selectRow(event.item.slot_type);
    this.selected_slot=event.item;
    this.selected_item=event.item;
    this.weapon_info.setItem(event.item);
};

GarageScene.prototype.credit=function(amount){
    if((this.player_data.balance-amount) <0 ){
        this.alert('Insufficient funds!');
        return false;
    }
    
    this.player_data.balance-=amount;
    this.balance_label.setText('Balance '+this.player_data.balance+'\u20AC');
    return true;
};

GarageScene.prototype.buyItem=function(){
    if ((this.player_data.car[this.selected_slot.slot_type]) && (this.selected_item.weapon==this.player_data.car[this.selected_slot.slot_type].type)){
        this.alert('This weapon is already equipped!');
    }
    if(this.credit(this.selected_item.descr.price)){
        this.player_data.car[this.selected_slot.slot_type]={
            'type':this.selected_item.weapon,
            'ammo_upgrades':0,
            'damage_upgrades':0
        };
        this.selected_slot.deselect();
        this.selected_slot.select();
    }
};

GarageScene.prototype.deselectSlots=function(){
    for(var st in this.slots) this.slots[st].deselect();
};

GarageScene.prototype.deselectAll=function(){
    this.shop.deselectAll();
    this.deselectSlots();
};

GarageScene.prototype.selectWeapon=function(event){
    this.deselectSlots();
    var wt=event.item.weapon;
    for(var st in this.slots){
        if((this.player_data.car[this.slots[st].slot_type]) && (event.item.weapon==this.player_data.car[this.slots[st].slot_type].type)){
            event.item.deselect();
            this.slots[st].select();
            return;
        }
    }
    this.weapon_info.setItem(event.item);
    this.selected_item=event.item;
};

GarageScene.prototype.afterPaint=function(){
    //links to selected slot
    if(this.selected_slot){
        var ptlist=[];
        if(this.selected_slot.slot_type=='front_weapon'){
            ptlist=[[270, 290], [230, 290], [230, 315], [195, 315],
                    [195, 320], [230, 320], [230, 460], [270, 460], [270, 455],
                    [235, 455],                    
                    [235, 295], [270, 295]];
        }else if(this.selected_slot.slot_type=='util'){ //315 ->410 320->415
            ptlist=[[270, 290], [230, 290], [230, 410], [130, 410],
                    [130, 415], [230, 415], [230, 460], [270, 460], [270, 455],
                    [235, 455],                    
                    [235, 295], [270, 295]];
        }else if(this.selected_slot.slot_type=='rear_weapon'){//315 ->525 320->530
            ptlist=[[270, 290], [230, 290], [230, 525], [157, 525],
                    [157, 530], [235, 530], [235, 460],  [270, 460], [270, 455],
                    [235, 455],                    
                    [235, 295], [270, 295]];
        }
        if(ptlist){
            gamejs.draw.polygon(this.container.surface, skin.garage.slot_path, ptlist);
        }
    }
};

GarageScene.prototype.paintBackground=function(){
    //balance background
    var ptlist=[[0, 160], [250, 160], [240, 210], [0, 210]];
    gamejs.draw.polygon(this.container.surface, skin.garage.balance_background, ptlist);
    
    //car title background
    gamejs.draw.rect(this.container.surface, skin.garage.car_title_background, new gamejs.Rect([45, 230], [170, 30]));
    
    //car background
    gamejs.draw.rect(this.container.surface, skin.garage.car_background, new gamejs.Rect([45, 260], [170, 310]))
    
    //car image    
    var img=renderer.cache['static'][this.car_descr.art_filename];
    var sz=img.getSize();
    var size=[parseInt((290/sz[1]) * sz[0]), 290];
    this.container.surface.blit(img, [parseInt(45+(170-size[0])/2), 270]);

    //store background
    gamejs.draw.rect(this.container.surface, skin.garage.store_background, new gamejs.Rect([270, 435], [515, 60]));
    
    //store border
    gamejs.draw.rect(this.container.surface, skin.garage.store_border, new gamejs.Rect([273, 438], [509, 54]), 5);
    
    //link from car to tuning
    gamejs.draw.rect(this.container.surface, '#333333', new gamejs.Rect([215, 242], [322, 5]));
    
};

EquipmentSlot=exports.EquipmentSlot=function(pars){
    pars.size=[50, 50];
    EquipmentSlot.superConstructor.apply(this, [pars]);
    this.type='equipment_slot';
    this.slot_type=pars.slot_type;
    this.selected=false;
    this.scene=pars.scene;
    this.on(GUI.EVT_MOUSE_DOWN, this.select, this);
    this.on(GUI.EVT_MOUSE_DOWN, function(){sounds.play({'filename':'button_click.wav'})});
}
gamejs.utils.objects.extend(EquipmentSlot, GUI.View);

EquipmentSlot.prototype.select=function(){
    if(!this.selected){
        this.scene.deselectAll();
        this.selected=true;
        this.despatchEvent({'type':'select', 'item':this});
        this.refresh();
    }
};

EquipmentSlot.prototype.deselect=function(){
    if(this.selected){
        this.selected=false;
        this.refresh();
    }
};

EquipmentSlot.prototype.paint=function(){
    this.surface.clear();
    this.surface.fill(this.selected ? skin.garage.slot_bg_selected : skin.garage.slot_bg);
    gamejs.draw.rect(this.surface, skin.garage.slot_border, new gamejs.Rect([1, 1], [48, 48]), 2)
    
    if(this.scene.player_data.car[this.slot_type]){
        var img=renderer.cache['static'][weapon_descriptions[this.scene.player_data.car[this.slot_type].type].icon];
        var sz=img.getSize();
        this.surface.blit(img, [parseInt((50-sz[0])/2),parseInt((50-sz[1])/2) ]);
    }
}

var WhiteButton=function(pars){
    pars.fill=skin.garage.white_button.bg;
    pars.hover_fill=skin.garage.white_button.bg_hover;
    pars.font=ui.getFont(skin.garage.white_button.font);
    pars.hover_font=ui.getFont(skin.garage.white_button.hover_font);
    pars.lean='none';
    WhiteButton.superConstructor.apply(this, [pars]);  
};

gamejs.utils.objects.extend(WhiteButton, ui.Button);


var BlackButton=function(pars){
    pars.fill='#4D4D4D';
    pars.hover_fill='#F2F2F2';
    pars.font=ui.getFont(skin.garage.white_button.hover_font);
    pars.hover_font=ui.getFont(skin.garage.white_button.font);
    pars.lean='none';
    BlackButton.superConstructor.apply(this, [pars]);  
};

gamejs.utils.objects.extend(BlackButton, ui.Button);

var WeaponInfoBuySpace=function(pars){
    pars.size=[230, 45];
    WeaponInfoBuySpace.superConstructor.apply(this, [pars]);
    
    new GUI.Image({'parent':this,
                  'position':[10, 8],
                  'image':renderer.cache['static']['ico_ammo.png']});
    
    this.ammo_label=new GUI.Label({'position':[50, 14],
                             'parent':this,
                             'text':'0',
                             'font':ui.getFont(skin.garage.weapon_label_font)});
    
    this.damage_icon=new GUI.Image({'parent':this,
                  'position':[85, 8],
                  'image':renderer.cache['static']['ico_damage.png']});
    
    this.damage_label=new GUI.Label({'position':[125, 14],
                             'parent':this,
                             'text':'0',
                             'font':ui.getFont(skin.garage.weapon_label_font)});
    
    this.button=new WhiteButton({'position':[175, 5],
                                'parent':this,
                                'size':[50, 35],
                                'text':'BUY'});
    
    
};

gamejs.utils.objects.extend(WeaponInfoBuySpace, GUI.View);

WeaponInfoBuySpace.prototype.paint=function(){
    this.surface.fill('#CCCCCC');
};



var Tuning=function(pars){
    pars.size=[250, 240];
    Tuning.superConstructor.apply(this, [pars]);
    this.scene=pars.scene;
    
    this.label=new GUI.Label({'parent':this,
                            'font':ui.getFont('g_white_title'),
                            'position':[20, 10],
                            'text':'Tuning'});
    
    new TuningUpgradeSpace({'parent':this,
                           'position':[10,  45],
                           'upgrade_type':UPGRADE_ACC,
                           'scene':this.scene});
    
    new TuningUpgradeSpace({'parent':this,
                           'position':[10,  110],
                           'upgrade_type':UPGRADE_SPEED,
                           'scene':this.scene});
    
    new TuningUpgradeSpace({'parent':this,
                           'position':[10,  175],
                           'upgrade_type':UPGRADE_ARMOR,
                           'scene':this.scene});
};

gamejs.utils.objects.extend(Tuning, GUI.View);

Tuning.prototype.paint=function(){
    //tuning title background
    gamejs.draw.rect(this.surface, skin.garage.tuning_title_background, new gamejs.Rect([0, 0], [250, 40]));
    
    //tuning background
    gamejs.draw.rect(this.surface, skin.garage.tuning_background, new gamejs.Rect([0, 40], [250, 200]));
};

var WeaponInfo=function(pars){
    pars.size=[250, 240];
    WeaponInfo.superConstructor.apply(this, [pars]);
    this.label=new GUI.Label({'parent':this,
                            'font':ui.getFont(skin.garage.weapon_label_font),
                            'position':[20, 10],
                            'text':'I'});
    this.label.setText(' ');
    this.text=new GUI.Text({'parent':this,
                        'width':220,
                       'font':ui.getFont(skin.garage.weapon_info_text_font),
                       'position':[15, 45],
                       'text':'I'});
    this.scene=pars.scene;
    
    
    this.price_label=new GUI.Label({'position':[10, 10],
                             'parent':this,
                             'text':'? \u20AC',
                             'font':ui.getFont(skin.garage.weapon_label_font)});
    
    this.price_label.on(GUI.EVT_RESIZE, function(){
        this.price_label.move([this.getSize()[0]-this.price_label.getSize()[0]-10, this.price_label.getPosition()[1]]);
    }, this);
    
    this.buy_s=new WeaponInfoBuySpace({'parent':this,
                                      'visible':false,
                                      'position':[10, 185]});
    
    this.damage_upgrade=new UpgradeSpace({'parent':this,
                                         'visible':false,
                                         'scene':this.scene,
                                         'upgrade_type':'damage',
                                         'position':[10, 110]});
    
    this.ammo_upgrade=new UpgradeSpace({'parent':this,
                                         'visible':false,
                                         'scene':this.scene,
                                         'upgrade_type':'ammo',
                                         'position':[10, 165]})
};

gamejs.utils.objects.extend(WeaponInfo, GUI.View);

WeaponInfo.prototype.paint=function(){
    //weapon info title background
    gamejs.draw.rect(this.surface, skin.garage.weapon_info_title_background, new gamejs.Rect([0, 0], [250, 40]));
    
    //weapon info background
    gamejs.draw.rect(this.surface, skin.garage.weapon_info_background, new gamejs.Rect([0, 40], [250, 200]));
};

WeaponInfo.prototype.setItem=function(item){
    var descr=false;
    this.item=item;
    if(item.type=='shop_item'){
        descr=item.descr;
        this.buy_s.show();
        this.ammo_upgrade.hide();
        this.damage_upgrade.hide();
        this.price_label.show();
        this.price_label.setText(descr.price+' '+EURO_SYMBOL);
        this.buy_s.ammo_label.setText(String(descr.ammo_capacity));
        
        if(descr.damage_upgrade){
            this.buy_s.damage_label.show();
            this.buy_s.damage_icon.show();
            this.buy_s.damage_label.setText(String(descr.damage));
        }else{
            this.buy_s.damage_label.hide();
            this.buy_s.damage_icon.hide();
        }
    }
    else if(item.type=='equipment_slot'){
        this.buy_s.hide();       
        this.price_label.hide();
        if(this.scene.player_data.car[item.slot_type]){
            descr=weapon_descriptions[this.scene.player_data.car[item.slot_type].type];
            this.ammo_upgrade.show();
            this.ammo_upgrade.setDescr(this.scene.player_data.car[item.slot_type]);
            if(descr.damage_upgrade){
                this.damage_upgrade.show();
                this.damage_upgrade.setDescr(this.scene.player_data.car[item.slot_type]);
            }else{
                this.damage_upgrade.hide();
            }
        }else{
            this.ammo_upgrade.hide();
            this.damage_upgrade.hide();
            this.label.setText(SLOT_TO_LABEL[item.slot_type]);
            this.text.setText('This slot is empty. Buy something from the shop below to fill it!');
        }
    }
    
    if(descr){
        this.label.setText(descr.name);
        this.text.setText(descr.description);
    }
};

var Shop=exports.Shop=function(pars){
    this.rows={};
    this.items=[];
    pars.size=[510, 50];
    this.scene=pars.scene;
    Shop.superConstructor.apply(this, [pars]);
    
    var row=new ShopItemRow({'parent':this,
                            'size':this.getSize(),
                            'position':[0, 0],
                            'type':'front_weapon',
                            'visible':false});
    this.rows['front_weapon']=row;
    
    row=new ShopItemRow({'parent':this,
                        'size':this.getSize(),
                        'position':[0, 0],
                        'type':'util',
                        'visible':false});
    this.rows['util']=row;
    
    row=new ShopItemRow({'parent':this,
                        'size':this.getSize(),
                        'position':[0, 0],
                        'type':'rear_weapon',
                        'visible':false});
    this.rows['rear_weapon']=row;
    
    var descr, item;
    for(var weapon in weapon_descriptions){
        descr=weapon_descriptions[weapon];
        row=this.rows[descr.type];
        if(row.children.length){
            new ShopItemSep({'parent':row});
        }
        item=new ShopItem({'parent':row,
                            'weapon':weapon,
                            'descr':descr});
        item.on('select', this.selectItem, this);
        this.items.push(item);  
    }
    
    for(var type in this.rows){
        GUI.layout.horizontal(this.rows[type].children);
    }
    
};
gamejs.utils.objects.extend(Shop, GUI.View);



Shop.prototype.deselectAll=function(){
    this.items.forEach(function(item){
        item.deselect();
    });
};

Shop.prototype.selectItem=function(event){
    this.despatchEvent(event);  
};

Shop.prototype.selectRow=function(type){
    for(var t in this.rows){
        if(t==type){
            this.rows[t].show();
        }
        else{
            this.rows[t].hide();
        }
    }
};

var ShopItemSep=exports.ShopItemSep=function(pars){
    pars.size=[5, 50];
    ShopItemSep.superConstructor.apply(this, [pars]);
};

gamejs.utils.objects.extend(ShopItemSep, GUI.View);

ShopItemSep.prototype.paint=function(){
    this.surface.clear();
    gamejs.draw.rect(this.surface, skin.garage.store_border, new gamejs.Rect([0, 8], [5, 34]));
};

var ShopItemRow=exports.ShopItemRow=function(pars){
    this.type=pars.type;
    ShopItemRow.superConstructor.apply(this, [pars]);   
};
gamejs.utils.objects.extend(ShopItemRow, GUI.View);
/**
 *
 *descr - weapon description
 */
var ShopItem=exports.ShopItem=function(pars){
    this.descr=pars.descr;
    this.weapon=pars.weapon;
    pars.size=[50, 50];
    ShopItem.superConstructor.apply(this, [pars]);
    this.type='shop_item';
    this.img=renderer.cache['static'][this.descr.icon];
    this.selected=false;
    this.on(GUI.EVT_MOUSE_DOWN, this.select, this);
    this.on(GUI.EVT_MOUSE_DOWN, function(){sounds.play({'filename':'button_click.wav'});});
};
gamejs.utils.objects.extend(ShopItem, GUI.View);

ShopItem.prototype.select=function(){
    if(!this.selected){
        this.parent.parent.scene.deselectAll();
        this.selected=true;
        this.despatchEvent({'type':'select', 'item':this});
        this.refresh();
    }
};

ShopItem.prototype.paint=function(){
    GUI.View.prototype.paint.apply(this, []);
    if(this.selected) this.surface.fill(skin.garage.selected_shop_item_bg);
    var sz=this.img.getSize();
    this.surface.blit(this.img, [parseInt((50-sz[0])/2), parseInt((50-sz[1])/2)]);
};

ShopItem.prototype.deselect=function(){
    if(this.selected){
        this.selected=false;
        this.refresh();
    }
};

var TuningUpgradeSpace=function(pars){
    pars.size=[230, 60];
    this.scene=pars.scene;
    this.upgrade_type=pars.upgrade_type;
    this.descr=car_descriptions[this.scene.player_data.car.type];
    TuningUpgradeSpace.superConstructor.apply(this, [pars]);
   
    new GUI.Label({'parent':this,
                  'position':[20, 0],
                  'parent':this,
                  'font':ui.getFont('g_white_title'),
                  'text':UPGRADE_TYPE_TO_LABEL[this.upgrade_type]});
    
    this.stars=new ui.Stars({'position':[2, 25],
                            'parent':this,
                            'stars':this.getValue()});
    
    this.price_label=new GUI.Label({'position':[0, 29],
                               'parent':this,
                               'text':this.descr.upgrade_price+EURO_SYMBOL,
                               'font':ui.getFont('g_white_title'),
                               'visible':this.getValue()<5});
    
    this.button=new BlackButton({'position':[135, 20],
                                'parent':this,
                                'size':[90, 35],
                                'text':'UPGRADE',
                                'visible':this.getValue()<5});
    
    
    
    this.button.onClick(this.buy, this);
    
    this.price_label.on(GUI.EVT_RESIZE, function(){
        this.price_label.move([this.getSize()[0]-this.button.getSize()[0]-this.price_label.getSize()[0]-10, this.price_label.getPosition()[1]]);
    }, this);
    this.price_label.resize(this.price_label.getSize());
    
};

gamejs.utils.objects.extend(TuningUpgradeSpace, GUI.View);

TuningUpgradeSpace.prototype.getValue=function(){
    return this.scene.player_data.car[this.upgrade_type];
};


TuningUpgradeSpace.prototype.buy=function(){
    if(this.getValue()>=5){
        this.scene.alert('Upgrade maxed out!');
        return;
    }
    
    if(this.scene.credit(this.descr.upgrade_price)){
        this.scene.player_data.car[this.upgrade_type]++;
        this.stars.setStars(this.getValue());
        if(this.getValue()>=5){
            this.price_label.hide();
            this.button.hide();
        }
    }
};

TuningUpgradeSpace.prototype.paint=function(){
    this.surface.clear();
    gamejs.draw.rect(this.surface, '#333333', new gamejs.Rect([0, 15], [this.getSize()[0], this.getSize()[1]-15]));
};

var UpgradeSpace=function(pars){
    pars.size=[230, 60];
    this.upgrade_type=pars.upgrade_type;
    this.descr=null;
    this.weapon_descr=null;
    this.scene=pars.scene;
    UpgradeSpace.superConstructor.apply(this, [pars]);
    
    new GUI.Image({'parent':this,
                  'position':[5, 23],
                  'image':renderer.cache['static']['ico_'+this.upgrade_type+'.png']});
    
    this.stars=new ui.Stars({'position':[40, 0],
                            'parent':this,
                            'stars':0})
    
    this.label=new GUI.Label({'position':[35, 29],
                             'parent':this,
                             'text':'0',
                             'font':ui.getFont(skin.garage.weapon_label_font)});
    
    this.price_label=new GUI.Label({'position':[0, 29],
                               'parent':this,
                               'text':'0 '+EURO_SYMBOL,
                               'font':ui.getFont(skin.garage.weapon_label_font)})
    
    
    
    this.button=new WhiteButton({'position':[135, 20],
                                'parent':this,
                                'size':[90, 35],
                                'text':'UPGRADE'});
    
    
    
    this.button.onClick(this.buy, this);
    
    this.price_label.on(GUI.EVT_RESIZE, function(){
        this.price_label.move([this.getSize()[0]-this.button.getSize()[0]-this.price_label.getSize()[0]-10, this.price_label.getPosition()[1]]);
    }, this);
};


gamejs.utils.objects.extend(UpgradeSpace, GUI.View);

UpgradeSpace.prototype.setDescr=function(descr){
    this.descr=descr;
    if(descr){
        this.weapon_descr=weapon_descriptions[this.descr.type];
        var upgrades=this.descr[this.upgrade_type+'_upgrades'];
        this.stars.setStars(upgrades);
        this.label.setText(String(this.getCurValue()));
        this.price_label.setText(this.weapon_descr[this.upgrade_type+'_upgrade_price']+EURO_SYMBOL);
        if(upgrades<5){
            this.button.show();
            this.price_label.show();
        } else {
            this.button.hide();
            this.price_label.hide();
        }
    }
};

UpgradeSpace.prototype.buy=function(){
    if(this.descr[this.upgrade_type+'_upgrades']>=5) return;
    if(this.scene.credit(this.weapon_descr[this.upgrade_type+'_upgrade_price'])){
        this.descr[this.upgrade_type+'_upgrades']++;
        this.setDescr(this.descr);
    }
};  

UpgradeSpace.prototype.getCurValue=function(){
  return (this.upgrade_type=='damage' ? this.weapon_descr.damage : this.weapon_descr.ammo_capacity)+(this.descr[this.upgrade_type+'_upgrades']* this.weapon_descr[this.upgrade_type+'_upgrade'])};


UpgradeSpace.prototype.paint=function(){
    this.surface.clear();
    gamejs.draw.rect(this.surface, '#CCCCCC', new gamejs.Rect([0, 15], [this.getSize()[0], this.getSize()[1]-15]));
};


var BuyCarScene=exports.BuyCarScene=function(player_data){
    BuyCarScene.superConstructor.apply(this, []);
    this.player_data=player_data;
    this.container.header_height=130;
    this.container.background_color=skin.garage.background_color;
    this.container.on(GUI.EVT_PAINT, this.paint, this);
    this.container.refresh();
    
    this.titlelbl=new GUI.Label({'parent':this.container,
                                'position':[210, 40],
                                'text':'Car Deal',
                                'font':ui.getFont('header_black')});
    
    this.backbtn=new ui.Button({'parent':this.container,
                               'size':[130, 50],
                               'position':[0, 540],
                               'font':ui.getFont(skin.garage.back_button.font),
                               'hover_font':ui.getFont(skin.garage.back_button.hover_font),
                               'fill':skin.garage.back_button.fill,
                               'hover_fill':skin.garage.back_button.hover_fill,
                               'text':'BACK',
                               'lean':'left'});
    
    this.backbtn.onClick(function(){
        this.game.showGarage(this.player_data);
    }, this);
    
    
    this.car_list=new CarList({'position':[25, 160],
                              'parent':this.container,
                              'scene':this});
    
    this.carinfo=new CarInfo({'position':[800-350, 160],
                             'parent':this.container,
                             'scene':this});
    
    this.balance_label=new GUI.Label({'parent':this.container,
                                     'font':ui.getFont(skin.garage.balance_font),
                                     'position':[260, 550],
                                     'text':'Balance '+this.player_data.balance+'\u20AC'});
    
    this.buy_car_btn=new ui.Button({'parent':this.container,
                                   'size':[100, 50],
                                   'position':[700, 540],
                                   'font':ui.getFont('button2_hover'),
                                   'fill':'#006837',
                                   'hover_fill':'#00381C',
                                   'text':'BUY',
                                   'lean':'right',
                                   'visible':false});
    
    this.buy_car_btn.onClick(this.buy, this);
};

gamejs.utils.objects.extend(BuyCarScene, ui.UIScene);

BuyCarScene.prototype.paint=function(){
    gamejs.draw.rect(this.container.surface, '#B3B3B3',
                     new gamejs.Rect([250, 540], [300, 50]));
};

BuyCarScene.prototype.buy=function(){
    if(this.carinfo.descr){
        if(this.credit(this.carinfo.descr.price)){
            this.player_data.car.type=this.carinfo.descr.id;
            this.player_data.car.acc_upgrades=0;
            this.player_data.car.speed_upgrades=0;
            this.player_data.car.armor_upgrades=0;
            this.game.showGarage(this.player_data);
        }
    };
};

BuyCarScene.prototype.credit=function(amount){
    if((this.player_data.balance-amount) <0 ){
        this.alert('Insufficient funds!');
        return false;
    }
    
    this.player_data.balance-=amount;
    this.balance_label.setText('Balance '+this.player_data.balance+'\u20AC');
    return true;
};

var CarListSep=function(pars){
    CarListSep.superConstructor.apply(this, [pars]);
};
gamejs.utils.objects.extend(CarListSep, GUI.View);

CarListSep.prototype.paint=function(){
    this.surface.fill('#CCCCCC');
};

var CarListItem=function(pars){
    this.descr=pars.descr;
    CarListItem.superConstructor.apply(this, [pars]);
    var w=this.getSize()[0];
    var h=this.getSize()[1];
    
    var img=renderer.cache.getCarSprite(this.descr.filenames[0], 0);
    new GUI.Image({'parent':this,
                    'image':img,
                    'position':[5+parseInt(((50)-img.getSize()[0])/2), 5+parseInt(((h-10)-img.getSize()[1])/2)]});
              
    new GUI.Label({'parent':this,
                  'font':ui.getFont('16_33'),
                  'text':this.descr.name,
                  'position':[60, 5]});
    
    new GUI.Text({'parent':this,
                 'font':ui.getFont('13_grayish'),
                 'text':this.descr.description,
                 'width':w-h,
                 'position':[60, 28]});
    
    var lbl= new GUI.Label({'parent':this,
                  'font':ui.getFont('16_33'),
                  'text':this.descr.price+EURO_SYMBOL,
                  'position':[w-100, h-25]});
    
    lbl.move([this.getSize()[0]-lbl.getSize()[0]-10, lbl.getPosition()[1]]);
    
    this.on(GUI.EVT_MOUSE_DOWN, function(){
        sounds.play({'filename':'button_click.wav'});
        this.parent.parent.scene.carinfo.setDescr(this.descr);
    }, this);
    
};

gamejs.utils.objects.extend(CarListItem, GUI.View);

CarListItem.prototype.paint=function(){
    if(this.isHovered()){
        this.surface.fill('#E2E2E2');
    }else{
        this.surface.clear();
    }
};

var CarList=function(pars){
    pars.size=[330, 360];
    this.scene=pars.scene;
    CarList.superConstructor.apply(this, [pars]);
    
    this.scw=new GUI.ScrollableView({'parent':this,
                                    'position':[5, 5],
                                    'size':[this.getSize()[0]-25, this.getSize()[1]-10]});
    
    var scrollbar=new GUI.VerticalScrollbar({'parent':this,
                                            'position':[this.getSize()[0]-20, 5],
                                            'size':[20, this.getSize()[1]-10]});
    this.scw.setVerticalScrollbar(scrollbar);
    
    var descrs=[];
    for(var id in car_descriptions){
        descrs.push(car_descriptions[id]);
    }
    
    descrs.sort(function(a, b){
        return a.price-b.price;
    });
    
    descrs.forEach(function(descr){
        if(this.scw.children.length){
            new CarListSep({'parent':this.scw,
                           'position':[10, 0],
                           'size':[this.scw.getSize()[0]-20, 5]});
        }
        new CarListItem({'parent':this.scw,
                        'size':[this.scw.getSize()[0], 100],
                        'descr':descr});
    }, this);
    GUI.layout.vertical(this.scw.children);
    this.scw.autoSetScrollableArea();
};

gamejs.utils.objects.extend(CarList, GUI.View);

CarList.prototype.paint=function(){
    this.surface.clear();
    var h=this.getSize()[1];
    var w=this.getSize()[0];
    gamejs.draw.rect(this.surface, '#999999', new gamejs.Rect([0, 0], [w, 5]));
    gamejs.draw.rect(this.surface, '#999999', new gamejs.Rect([0, h-5], [w, 5]));
    
    gamejs.draw.rect(this.surface, '#999999', new gamejs.Rect([0, 5], [5, h-10]));
   // gamejs.draw.rect(this.surface, '#CCCCCC', new gamejs.Rect([w-20, 5], [20, h-10]));
    
    gamejs.draw.rect(this.surface, '#F2F2F2', new gamejs.Rect([5, 5], [w-5, h-10]));
};

var CarInfo=function(pars){
    pars.size=[330, 360];
    this.scene=pars.scene;
    this.descr=null;
    CarInfo.superConstructor.apply(this, [pars]);
    this.carimg=null;
    
    this.cartitle=new GUI.Label({'parent':this,
                                'position':[20, 178],
                                'text':'Car not selected',
                                'font':ui.getFont('alias')});
    
    this.cardescr=new GUI.Text({'parent':this,
                               'position':[20, 213],
                               'width':310,
                               'font':ui.getFont('16_33'),
                               'text':'Select a car!'});
    
    this.pricelabel=new GUI.Label({'parent':this,
                                  'position':[230, 178],
                                  'font':ui.getFont('alias'),
                                  'text':'0'+EURO_SYMBOL,
                                  'visible':false});
    
    this.acceleration_label=new GUI.Label({'parent':this,
                                 'position':[20, 240],
                                 'font':ui.getFont('16_33'),
                                 'text':'Acceleration:',
                                 'visible':false});
    
    this.acceleration_stars=new ui.Stars({'parent':this,
                                         'position':[135, 240],
                                         'stars':0,
                                        'visible':false});
    
    this.speed_label=new GUI.Label({'parent':this,
                                 'position':[20, 270],
                                 'font':ui.getFont('16_33'),
                                 'text':'Top Speed:',
                                 'visible':false});
    
    this.speed_stars=new ui.Stars({'parent':this,
                                         'position':[135, 270],
                                         'stars':0,
                                 'visible':false});
    
    this.armor_label=new GUI.Label({'parent':this,
                                 'position':[20, 300],
                                 'font':ui.getFont('16_33'),
                                 'text':'Armor:',
                                 'visible':false});
    
    this.armor_stars=new ui.Stars({'parent':this,
                                    'position':[135, 300],
                                    'stars':0,
                                 'visible':false});
    
    this.handling_label=new GUI.Label({'parent':this,
                                 'position':[20, 330],
                                 'font':ui.getFont('16_33'),
                                 'text':'Handling:',
                                 'visible':false});
    
    this.handling_stars=new ui.Stars({'parent':this,
                                    'position':[135, 330],
                                    'stars':0,
                                 'visible':false});
    
    
    
    
    this.pricelabel.on(GUI.EVT_RESIZE, function(){
        this.pricelabel.move([this.getSize()[0]-this.pricelabel.getSize()[0]-10, this.pricelabel.getPosition()[1]]);
    }, this);
};

gamejs.utils.objects.extend(CarInfo, GUI.View);


CarInfo.prototype.paint=function(){
    this.surface.fill('#B3B3B3');
    gamejs.draw.rect(this.surface, '#F5F5F5', new gamejs.Rect([0, 0], [this.getSize()[0], 180]));
    if(this.carimg){
        this.surface.blit(this.carimg, [20, 5]);
    }
    
    
};

CarInfo.prototype.setDescr=function(descr){
    this.descr=descr;
    this.carimg=gamejs.transform.rotate(renderer.cache['static'][this.descr.art_filename], 90);
    this.cartitle.setText(descr.name);
    this.cardescr.setText(descr.description);
    this.pricelabel.show();
    if(this.scene.player_data.car.type!=descr.id){
        this.pricelabel.setText(descr.price+EURO_SYMBOL);
        this.scene.buy_car_btn.show();
    }else{
        this.pricelabel.setText('OWNED');
        this.scene.buy_car_btn.hide();
    }
    this.acceleration_stars.setStars(descr.acceleration_stars);
    this.speed_stars.setStars(descr.speed_stars);
    this.armor_stars.setStars(descr.armor_stars);
    this.handling_stars.setStars(descr.handling_stars);
    
    this.acceleration_label.show();
    this.armor_label.show();
    this.speed_label.show();
    this.handling_label.show();
    this.acceleration_stars.show();
    this.speed_stars.show();
    this.armor_stars.show();
    this.handling_stars.show();
    
    
    
    this.refresh();
};