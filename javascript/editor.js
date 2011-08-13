var GUI = require('./gamejs-gui');
var ui2 = require('./ui2');
var combatracer = require('./combatracer');
var settings=require('./settings');
var gamejs=require('gamejs');
var renderer=require('./renderer');
var resources=require('./resources');
var skin=require('./skin');

var EXAMPLE='{"size":[2100,1100],"title":"Example Raceway","bgtile":"sand.png","props":[{"p":[413,159],"f":1,"a":270},{"p":[687,158],"f":1,"a":270},{"p":[960,157],"f":1,"a":270},{"p":[310,259],"f":2,"a":240},{"p":[283,350],"f":2,"a":180},{"p":[282,442],"f":2,"a":180},{"p":[283,515],"f":2,"a":150},{"p":[360,579],"f":2,"a":105},{"p":[469,596],"f":2,"a":90},{"p":[561,596],"f":2,"a":90},{"p":[654,596],"f":2,"a":90},{"p":[706,561],"f":2,"a":15},{"p":[725,475],"f":2,"a":15},{"p":[768,388],"f":2,"a":225},{"p":[857,355],"f":2,"a":75},{"p":[957,261],"f":1,"a":270},{"p":[1232,352],"f":2,"a":90},{"p":[1321,351],"f":2,"a":90},{"p":[1310,276],"f":2,"a":330},{"p":[1238,278],"f":3,"a":0},{"p":[1272,278],"f":3,"a":0},{"p":[1307,282],"f":3,"a":0},{"p":[1608,587],"f":2,"a":270},{"p":[1704,586],"f":2,"a":270},{"p":[1577,628],"f":2,"a":150},{"p":[1669,686],"f":2,"a":90},{"p":[1729,626],"f":2,"a":45},{"p":[1802,618],"f":3,"a":0},{"p":[1103,-73],"f":1,"a":270},{"p":[832,-74],"f":1,"a":270},{"p":[562,-73],"f":1,"a":270},{"p":[1367,19],"f":2,"a":285},{"p":[1449,49],"f":2,"a":300},{"p":[1516,115],"f":2,"a":330},{"p":[1558,204],"f":2,"a":345},{"p":[1578,304],"f":2,"a":0},{"p":[1610,361],"f":2,"a":270},{"p":[1702,359],"f":2,"a":270},{"p":[1794,359],"f":2,"a":270},{"p":[1877,359],"f":2,"a":285},{"p":[1943,410],"f":2,"a":330},{"p":[1988,498],"f":2,"a":345},{"p":[2006,598],"f":2,"a":0},{"p":[1992,685],"f":2,"a":15},{"p":[1956,767],"f":2,"a":30},{"p":[1901,839],"f":2,"a":45},{"p":[1833,894],"f":2,"a":75},{"p":[1752,921],"f":2,"a":90},{"p":[1660,927],"f":2,"a":90},{"p":[1557,909],"f":2,"a":105},{"p":[1462,870],"f":2,"a":120},{"p":[1389,810],"f":2,"a":135},{"p":[1352,738],"f":2,"a":165},{"p":[1349,655],"f":2,"a":180},{"p":[1380,622],"f":3,"a":0},{"p":[1352,612],"f":3,"a":0},{"p":[1080,493],"f":1,"a":270},{"p":[988,585],"f":2,"a":90},{"p":[953,645],"f":2,"a":0},{"p":[913,717],"f":2,"a":30},{"p":[853,783],"f":2,"a":60},{"p":[781,826],"f":2,"a":90},{"p":[503,739],"f":1,"a":270},{"p":[410,828],"f":2,"a":90},{"p":[320,825],"f":2,"a":90},{"p":[219,802],"f":2,"a":105},{"p":[133,754],"f":2,"a":135},{"p":[75,689],"f":2,"a":150},{"p":[45,613],"f":2,"a":165},{"p":[-42,349],"f":1,"a":0},{"p":[48,257],"f":2,"a":180},{"p":[53,154],"f":2,"a":210},{"p":[106,74],"f":2,"a":225},{"p":[182,24],"f":2,"a":240},{"p":[289,21],"f":2,"a":270},{"p":[383,19],"f":2,"a":270},{"p":[472,18],"f":2,"a":270}],"decals":[{"p":[114,84],"f":4,"a":0},{"p":[426,36],"f":5,"a":0},{"p":[714,36],"f":5,"a":0},{"p":[1002,36],"f":5,"a":0},{"p":[1290,84],"f":4,"a":90},{"p":[1386,396],"f":6,"a":0},{"p":[1410,636],"f":4,"a":270},{"p":[1716,636],"f":4,"a":180},{"p":[1812,420],"f":7,"a":90},{"p":[1668,420],"f":8,"a":90},{"p":[1578,420],"f":8,"a":90},{"p":[1194,420],"f":9,"a":90},{"p":[1002,420],"f":9,"a":90},{"p":[786,420],"f":7,"a":0},{"p":[762,636],"f":7,"a":180},{"p":[474,612],"f":5,"a":0},{"p":[114,540],"f":4,"a":270},{"p":[114,402],"f":8,"a":180},{"p":[114,342],"f":8,"a":180},{"p":[378,660],"f":8,"a":270},{"p":[1446,372],"f":10,"a":90},{"p":[1524,372],"f":10,"a":90},{"p":[1614,450],"f":10,"a":180},{"p":[1614,540],"f":10,"a":180},{"p":[1062,90],"f":11,"a":90},{"p":[1062,168],"f":11,"a":90},{"p":[1014,102],"f":12,"a":90},{"p":[924,210],"f":12,"a":90},{"p":[822,102],"f":12,"a":90},{"p":[720,210],"f":12,"a":90},{"p":[600,102],"f":12,"a":90},{"p":[480,210],"f":12,"a":90}],"ai_waypoints":[{"p":[1362,212],"n":1},{"p":[1492,504],"n":2},{"p":[1559,750],"n":3},{"p":[928,554],"n":6},{"p":[1849,727],"n":4},{"p":[1814,544],"n":5},{"p":[1109,443],"n":6},{"p":[739,675],"n":7},{"p":[343,688],"n":8},{"p":[228,463],"n":9},{"p":[237,277],"n":10},{"p":[444,186],"n":11}],"checkpoints":[{"p":[1107,45],"n":1},{"p":[1377,648],"n":2},{"p":[1763,409],"n":3},{"p":[787,413],"n":4},{"p":[118,577],"n":5},{"p":[167,67],"n":6}],"start_positions":[{"p":[965,95],"n":1,"a":90},{"p":[872,203],"n":2,"a":90},{"p":[771,98],"n":3,"a":90},{"p":[668,206],"n":4,"a":90},{"p":[546,94],"n":5,"a":90},{"p":[426,202],"n":6,"a":90}],"dict":{"1":"9tires.png","2":"3tires.png","3":"tire.png","4":"dideliskampas.png","5":"ilgas.png","6":"kryzius.png","7":"lenktas.png","8":"trumpas.png","9":"paprastas.png","10":"arrow.png","11":"startbar.png","12":"white_bar.png"}}';
var LEFT_PANEL_WIDTH=200;
var BOT_PANEL_HEIGHT=150;
var CHECKPOINT_SIZE=[280, 280];
var MIN_DIMENSION=1000;
var DIMENSION_INCREMENT=100;
var LOAD_HELP_TEXT='To save, copy level code below and save it as a text file on your computer or however is convenient. To load, paste level code into textarea below and click "load".';

var instance_id=1;

function snap(pos){
    return [Math.floor(pos[0]/6)*6,
            Math.floor(pos[1]/6)*6];
};

var drawqueue=['decalinstance', 'propinstance', 'checkpointinstance', 'startpositioninstance', 'aiwaypointinstance'];

var getLevelTemplate=function(size){
    return {'size':size,
            'title':'New track',
            'bgtile':'sand.png',
            'props':[],
            'decals':[],
            'ai_waypoints':[],
            'checkpoints':[],
            'start_positions':[]};
            
};



function getLevelProblems(level){
    //validation, returns list of problems (strings), if list empty, level is ok
    var problems=[];
    if(level.start_positions.length<6){
        problems.push('All six starting positions must be placed.');
    }
    if(level.ai_waypoints.length<2){
        problems.push('At least two AI waypoints must be placed.');
    }
    if(level.checkpoints.length<2){
        problems.push('At least two checkpoints must be placed.');
    }
    if(!level.title){
        problems.push('Level must have a title.');
    }
    console.log(problems);
    return problems;
};

function structifyLevel(level){
    var retv=getLevelTemplate([2500, 2500]);
    retv.size=level.size;
    retv.bgtile=level.bgtile;
    retv.title=level.title;
    retv.dict={};
    var revdict={};
    var i=1;
    function trans(x){
        if(revdict[x]==undefined){
            revdict[x]=i;
            retv.dict[i]=x;
            i++;
        }
        return revdict[x];
    }
    level.props.forEach(function(prop){
       retv.props.push({'p':prop.position,
                       'f':trans(prop.original.filename),
                       'a':prop.angle});
    });
    
    level.decals.forEach(function(decal){
       retv.decals.push({'p':decal.position,
                       'f':trans(decal.original.filename),
                       'a':decal.angle});
    });
    
    level.ai_waypoints.forEach(function(wp){
        retv.ai_waypoints.push({'p':wp.position,
                               'n':wp.number});
    });
    
    level.checkpoints.forEach(function(cp){
        retv.checkpoints.push({'p':cp.position,
                              'n':cp.number});
    });
    
    level.start_positions.forEach(function(sp){
        retv.start_positions.push({'p':sp.position,
                              'n':sp.number,
                              'a':sp.angle});
    });
    return retv;
};

function stringifyLevel(level){
    return JSON.stringify(structifyLevel(level));
};



ToolViewSelectItem=exports.ToolViewSelectItem=function(pars){
    pars.size=[LEFT_PANEL_WIDTH, 22];
    this.what=pars.what;
    ToolViewSelectItem.superConstructor.apply(this, [pars]);
    this.label=new GUI.Label({'position':[0, 0],
                         'parent':this,
                         'font':ui2.getFont(skin.track_selector.item_font),
                         'text':pars.text});
    this.center(this.label);
    this.label.move([this.size[0]-this.label.size[0]-16, this.label.position[1]]);
    this.selected=false;
    this.on(GUI.EVT_MOUSE_DOWN, this.select, this);
};

gamejs.utils.objects.extend(ToolViewSelectItem, GUI.View);

ToolViewSelectItem.prototype.select=function(){
    this.selected=true;
    this.refresh();
    this.despatchEvent({'type':'select', 'what':this.what});
};

ToolViewSelectItem.prototype.deselect=function(){
    this.selected=false;
    this.refresh();
};

ToolViewSelectItem.prototype.paint=function(){
    this.surface.fill(this.selected ? skin.track_selector.front_color : this.hover ? skin.track_selector.item_hover_color : skin.track_selector.back_color);
};

var ToolView=exports.ToolView=function(pars){
    ToolView.superConstructor.apply(this, [pars]);
    this.scene=pars.scene;
    
    this.scw=new GUI.ScrollableView({'parent':this,
                                    'size':[this.size[0], this.size[1]-20],
                                    'position':[0, 0]});

    var scb=new GUI.HorizontalScrollbar({'parent':this,
                                        'size':[this.size[0], 20],
                                        'position':[0, this.size[1]-20]});
    this.scw.setHorizontalScrollbar(scb);
};
gamejs.utils.objects.extend(ToolView, GUI.View);

var DecalView=exports.DecalView=function(pars){
    DecalView.superConstructor.apply(this, [pars]);
    this.filename_to_decal={};
    resources.decals.forEach(function(filename){
        var tool=new Decal({'filename':filename,
                           'size':[100, 100],
                           'position':[0, 3],
                           'scene':this.scene,
                           'parent':this.scw});
        this.scene.tools.push(tool);
        this.filename_to_decal[filename]=tool;
        tool.on('select', this.scene.selectTool, this.scene);
    }, this);
    GUI.layout.horizontal(this.scw.children, 2, 2);
    this.scw.autoSetScrollableArea();
};

gamejs.utils.objects.extend(DecalView, ToolView);

//MARKER VIEW

var MarkerView=exports.MarkerView=function(pars){
    this.scene=pars.scene;
    MarkerView.superConstructor.apply(this, [pars]);
    var lbl1=new GUI.Label({'parent':this,
                           'font':ui2.getFont('16_33'),
                           'text':'AI Waypoints',
                           'position':[20, 2]});
    
    
    //ai waypoint
    this.ai_waypoint=new AIWaypoint({'parent':this,
                                     'position':[40, 45],
                                     'size':[40, 40],
                                     'scene':this.scene});
    this.scene.tools.push(this.ai_waypoint);
    this.ai_waypoint.on('select', this.scene.selectTool, this.scene);
    
    this.ai_waypoint_up=new ui2.IncrementButton({'direction':'up',
                                            'position':[100, 30],
                                            'size':[40, 30],
                                            'parent':this});
    
    this.ai_waypoint_up.onClick(function(){
        this.setNumber(this.number+1);
    }, this.ai_waypoint);
    
    this.ai_waypoint_down=new ui2.IncrementButton({'direction':'down',
                                                'position':[100, 70],
                                                'size':[40, 30],
                                                'parent':this});
    
    this.ai_waypoint_down.onClick(function(){
        this.setNumber(this.number-1);
    }, this.ai_waypoint);
    
    //checkpoint
    var lbl2=new GUI.Label({'parent':this,
                           'font':ui2.getFont('16_33'),
                           'text':'Checkpoints',
                           'position':[150, 2]});
    
    
    this.checkpoint=new Checkpoint({'parent':this,
                                     'position':[170, 45],
                                     'size':[170, 40],
                                     'scene':this.scene});
    this.scene.tools.push(this.checkpoint);
    this.checkpoint.on('select', this.scene.selectTool, this.scene);
    
    this.checkpoint_up=new ui2.IncrementButton({'direction':'up',
                                            'position':[230, 30],
                                            'size':[40, 30],
                                            'parent':this});
    
    this.checkpoint_up.onClick(function(){
        this.setNumber(this.number+1);
    }, this.checkpoint);
    
    this.checkpoint_down=new ui2.IncrementButton({'direction':'down',
                                                'position':[230, 70],
                                                'size':[40, 30],
                                                'parent':this});
    
    this.checkpoint_down.onClick(function(){
        this.setNumber(this.number-1);
    }, this.checkpoint);
    
    //start position
    var lbl3=new GUI.Label({'parent':this,
                           'font':ui2.getFont('16_33'),
                           'text':'Start Positions',
                           'position':[280, 2]});
    
    
    this.start_position=new StartPosition({'parent':this,
                                     'position':[300, 35],
                                     'size':[60, 60],
                                     'scene':this.scene});
    this.scene.tools.push(this.start_position);
    this.start_position.on('select', this.scene.selectTool, this.scene);
    
    this.start_position_up=new ui2.IncrementButton({'direction':'up',
                                            'position':[370, 30],
                                            'size':[40, 30],
                                            'parent':this});
    
    this.start_position_up.onClick(function(){
        this.setNumber(this.number+1);
    }, this.start_position);
    
    this.start_position_down=new ui2.IncrementButton({'direction':'down',
                                                'position':[370, 70],
                                                'size':[40, 30],
                                                'parent':this});
    
    this.start_position_down.onClick(function(){
        this.setNumber(this.number-1);
    }, this.start_position);
    
    
};

gamejs.utils.objects.extend(MarkerView, GUI.View)

//PROPERTIES VIEW
var PropertiesView=exports.PropertiesView=function(pars){
    PropertiesView.superConstructor.apply(this, [pars]);
    this.scene=pars.scene;
    var lbl=new GUI.Label({'parent':this,
                    'font':ui2.getFont('16_33'),
                    'text':'Title',
                    'position':[100, 2]});
    
    this.title=new GUI.TextInput({'parent':this,
                                 'font':ui2.getFont('16_33'),
                                 'text':this.scene.level.title,
                                 'position':[40, 50],
                                 'size':[180, 30]});
    
    this.title.on(GUI.EVT_CHANGE, this.titleChange, this);
    
    new GUI.Label({'parent':this,
                    'font':ui2.getFont('16_33'),
                    'text':'Width, PX',
                    'position':[280, 2]});
    
    this.widthlbl=new GUI.Label({'parent':this,
                                'font':ui2.getFont('16_33'),
                                'text':String(this.scene.level.size[0]),
                                'position':[280, 50]});
    
    this.width_up_btn=new ui2.IncrementButton({'parent':this,
                                          'position':[380, 20],
                                          'size':[40, 40],
                                          'direction':'up'});
    
    this.width_up_btn.onClick(function(){
        this.scene.level.size[0]=Math.max(MIN_DIMENSION, this.scene.level.size[0]+DIMENSION_INCREMENT);
        this.scene.resizeLevelView();
    }, this);
    
    this.width_down_btn=new ui2.IncrementButton({'parent':this,
                                          'position':[380, 70],
                                          'size':[40, 40],
                                          'direction':'down'});
    
    this.width_down_btn.onClick(function(){
        this.scene.level.size[0]=Math.max(MIN_DIMENSION, this.scene.level.size[0]-DIMENSION_INCREMENT);
        this.scene.resizeLevelView();
    }, this);
    
    
    new GUI.Label({'parent':this,
                    'font':ui2.getFont('16_33'),
                    'text':'Height, PX',
                    'position':[460, 2]});
    
    this.heightlbl=new GUI.Label({'parent':this,
                                'font':ui2.getFont('16_33'),
                                'text':String(this.scene.level.size[1]),
                                'position':[460, 50]});
    
    this.height_up_btn=new ui2.IncrementButton({'parent':this,
                                          'position':[560, 20],
                                          'size':[40, 40],
                                          'direction':'up'});
    
    this.height_up_btn.onClick(function(){
        this.scene.level.size[1]=Math.max(MIN_DIMENSION, this.scene.level.size[1]+DIMENSION_INCREMENT);
        this.scene.resizeLevelView();
    }, this);
    
    this.height_down_btn=new ui2.IncrementButton({'parent':this,
                                          'position':[560, 70],
                                          'size':[40, 40],
                                          'direction':'down'});
    this.height_down_btn.onClick(function(){
        this.scene.level.size[1]=Math.max(MIN_DIMENSION, this.scene.level.size[1]-DIMENSION_INCREMENT);
        this.scene.resizeLevelView();
    }, this);
    
}
gamejs.utils.objects.extend(PropertiesView, GUI.View)

PropertiesView.prototype.titleChange=function(event){
    this.scene.level.title=event.value;  
};

//PROP VIEW

var PropView=exports.PropView=function(pars){
    PropView.superConstructor.apply(this, [pars]);
    this.filename_to_prop={};
    resources.props.forEach(function(filename){
        var tool=new Prop({'filename':filename,
                           'size':[100, 100],
                           'position':[0, 3],
                           'scene':this.scene,
                           'parent':this.scw});
        this.scene.tools.push(tool);
        this.filename_to_prop[filename]=tool;
        tool.on('select', this.scene.selectTool, this.scene);
    }, this);
    GUI.layout.horizontal(this.scw.children, 2, 2);
    this.scw.autoSetScrollableArea();
};

gamejs.utils.objects.extend(PropView, ToolView);

//LAYER VIEW

var LayerView=exports.LayerView=function(pars){
    LayerView.superConstructor.apply(this, [pars]);
    
    new GUI.Label({'parent':this.scw,
                    'font':ui2.getFont('16_33'),
                    'text':'Decals',
                    'position':[10, 2]});
    
    new LayerOnOffBtn({'parent':this.scw,
                      'layer':'decals',
                      'scene':this.scene,
                      'position':[10, 50]});
    
    new GUI.Label({'parent':this.scw,
                    'font':ui2.getFont('16_33'),
                    'text':'Props',
                    'position':[160, 2]});
    
    new LayerOnOffBtn({'parent':this.scw,
                      'layer':'props',
                      'scene':this.scene,
                      'position':[160, 50]});
    
    new GUI.Label({'parent':this.scw,
                    'font':ui2.getFont('16_33'),
                    'text':'AI Waypoints',
                    'position':[320, 2]});
    
    new LayerOnOffBtn({'parent':this.scw,
                      'layer':'ai_waypoints',
                      'scene':this.scene,
                      'position':[320, 50]});
    
    new GUI.Label({'parent':this.scw,
                    'font':ui2.getFont('16_33'),
                    'text':'Checkpoints',
                    'position':[470, 2]});
    
    new LayerOnOffBtn({'parent':this.scw,
                      'layer':'checkpoints',
                      'scene':this.scene,
                      'position':[470, 50]});
    
    new GUI.Label({'parent':this.scw,
                    'font':ui2.getFont('16_33'),
                    'text':'Start pos.',
                    'position':[620, 2]});
    
    new LayerOnOffBtn({'parent':this.scw,
                      'layer':'start_positions',
                      'scene':this.scene,
                      'position':[620, 50]});
    
    
    
    this.scw.autoSetScrollableArea();
};

gamejs.utils.objects.extend(LayerView, ToolView);

//BGVIEW

var BgView=exports.BgView=function(pars){
    BgView.superConstructor.apply(this, [pars]);
    resources.tiles.forEach(function(filename){
        var tool=new BackgroundTile({'filename':filename,
                                    'size':[100, 100],
                                    'position':[0, 3],
                                    'scene':this.scene,
                                    'parent':this.scw});
    }, this);
    GUI.layout.horizontal(this.scw.children, 2, 2);
    this.scw.autoSetScrollableArea();
};

gamejs.utils.objects.extend(BgView, ToolView);


var Instance=exports.Instance=function(pars){
    Instance.superConstructor.apply(this, [pars]);
    this.instance_id=instance_id++;
    this.angle=pars.angle;
    this.original=pars.original;
    this.subtype='instance';
    this.selected=false;
    this.scene=pars.scene;
    this.on(GUI.EVT_MOUSE_DOWN, this.select, this);
    this.on('select', this.scene.selectInstance, this.scene);
};
gamejs.utils.objects.extend(Instance, GUI.View);

Instance.prototype.select=function(){
    if(!this.selected){
        if(!(this.scene.selected && this.scene.selected.subtype=='tool')){
            this.selected=true;
            this.despatchEvent({'type':'select', 'instance':this});
            this.refresh();
        }
    }
};

Instance.prototype.move=function(pos){
  if(this.selected) GUI.View.prototype.move.apply(this, [pos]);  
};

function removeInstance(instance, list){
    for(var i=0;i<list.length;i++){
        if(list[i].instance_id==instance.instance_id){
            list.splice(i, 1);
            return;
        }
    }
};

Instance.prototype.deselect=function(){
    this.selected=false;
    this.refresh();
};

Instance.prototype.paint=function(){
    this.surface.clear();
    var img=this.original.getCursorImage(this.angle);
    this.surface.blit(img, [(this.size[0]-img.getSize()[0])/2, (this.size[1]-img.getSize()[1])/2]);
    if(this.selected){
        gamejs.draw.rect(this.surface, '#0026FF', new gamejs.Rect([0, 0], this.surface.getSize()), 6);
    }
};

var CheckpointInstance=function(pars){
    CheckpointInstance.superConstructor.apply(this, [pars]);
    GUI.draggable(this);
    this.type='checkpointinstance';
    this.number=pars.number;
      this.on('select', function(){
        this.scene.marker_view.checkpoint.setNumber(this.number);
    }, this);  
};

gamejs.utils.objects.extend(CheckpointInstance, Instance);

CheckpointInstance.prototype.destroy=function(recalc){
    if(recalc===undefined)recalc=true;
    Instance.prototype.destroy.apply(this, []);
    if(recalc){
        removeInstance(this, this.scene.level.checkpoints);
        this.scene.level.checkpoints.forEach(function(cp){
            if(cp.number>this.number){
                cp.number--;
                cp.refresh();
            }
        }, this);
    }
};

CheckpointInstance.prototype.paint=function(){
    this.surface.clear();
    this.surface.blit(this.original.genHugeImage(this.number), [0, 0]);
    if(this.selected){
        gamejs.draw.rect(this.surface, '#0026FF', new gamejs.Rect([0, 0], this.surface.getSize()), 6);
    }
};

//START POSITION INSTANCE
var StartPositionInstance=function(pars){
    StartPositionInstance.superConstructor.apply(this, [pars]);
    GUI.draggable(this);
    this.type='startpositioninstance';
    this.number=pars.number;
      this.on('select', function(){
        this.scene.marker_view.start_position.setNumber(this.number);
    }, this);
    
};

gamejs.utils.objects.extend(StartPositionInstance, Instance);

StartPositionInstance.prototype.destroy=function(recalc){
    
    if(recalc===undefined)recalc=true;
    Instance.prototype.destroy.apply(this, []);
    if(recalc){
        removeInstance(this, this.scene.level.start_positions);
        this.scene.level.start_positions.forEach(function(sp){
            if(sp.number>this.number){
                sp.number--;
                sp.refresh();
            }
        }, this);
    }
};

StartPositionInstance.prototype.paint=function(){
    this.surface.clear();
    this.surface.blit(this.original.genImage(this.number, this.angle), [0, 0]);
    if(this.selected){
        gamejs.draw.rect(this.surface, '#0026FF', new gamejs.Rect([0, 0], this.surface.getSize()), 6);
    }
};

//AI WAYPOINT INSTANCE
var AIWaypointInstance=function(pars){
    AIWaypointInstance.superConstructor.apply(this, [pars]);
    GUI.draggable(this);
    this.type='aiwaypointinstance';
    this.number=pars.number;
      this.on('select', function(){
        this.scene.marker_view.ai_waypoint.setNumber(this.number);
    }, this);
    
};

gamejs.utils.objects.extend(AIWaypointInstance, Instance);

AIWaypointInstance.prototype.destroy=function(recalc){
    if(recalc===undefined)recalc=true;
    Instance.prototype.destroy.apply(this, []);
    if(recalc){
        removeInstance(this, this.scene.level.ai_waypoints);
        this.scene.level.ai_waypoints.forEach(function(wp){
            if(wp.number==this.number) recalc=false;
        }, this);
        if(recalc){
            this.scene.level.ai_waypoints.forEach(function(wp){
                if(wp.number>this.number){
                    wp.number--;
                    wp.refresh();
                }
            }, this);
        }
    }
};

AIWaypointInstance.prototype.paint=function(){
    this.surface.clear();
    this.surface.blit(this.original.genImage(this.number), [0, 0]);
    if(this.selected){
        gamejs.draw.rect(this.surface, '#0026FF', new gamejs.Rect([0, 0], this.surface.getSize()), 6);
    }
};

//DECAL INSTANCE

var DecalInstance=function(pars){
    DecalInstance.superConstructor.apply(this, [pars]);
    this.type='decalinstance';
};

gamejs.utils.objects.extend(DecalInstance, Instance);

DecalInstance.prototype.destroy=function(){
    Instance.prototype.destroy.apply(this, []);
    removeInstance(this, this.scene.level.decals);
};

DecalInstance.prototype.move=function(pos){
  Instance.prototype.move.apply(this, [snap(pos)]);  
};


var PropInstance=function(pars){
    PropInstance.superConstructor.apply(this, [pars]);
    GUI.draggable(this);
    this.type='propinstance';
};

gamejs.utils.objects.extend(PropInstance, Instance);

PropInstance.prototype.destroy=function(){
    Instance.prototype.destroy.apply(this, []);
    removeInstance(this, this.scene.level.props);
};

var BackgroundTile=function(pars){
    this.filename=pars.filename;
    pars.image=renderer.cache.getTile(pars.filename);
    BackgroundTile.superConstructor.apply(this, [pars]);
    this.scene=pars.scene;
    this.on(GUI.EVT_MOUSE_DOWN, this.select, this);
};
gamejs.utils.objects.extend(BackgroundTile, GUI.Image);

BackgroundTile.prototype.select=function(){
    this.scene.level.bgtile=this.filename;
    this.scene.level_view.refresh();
};

var Tool=exports.Tool=function(pars){
    Tool.superConstructor.apply(this, [pars]);
    this.selected=false;
    this.angle=0;
    this.rotate_angle=pars.rotate_angle;
    this.on(GUI.EVT_MOUSE_DOWN, this.select, this);
    this.subtype='tool';
    this.scene=pars.scene;
};

gamejs.utils.objects.extend(Tool, GUI.Image);

Tool.prototype.select=function(){
    this.selected=true;
    this.despatchEvent({'type':'select', 'tool':this});
    this.refresh();
};

Tool.prototype.rotateLeft=function(){
    this.angle-=this.rotate_angle;
    if(this.angle<0)this.angle+=360;
    this.refresh();
};

Tool.prototype.rotateRight=function(){
    this.angle+=this.rotate_angle;
    if(this.angle>=360)this.angle-=360;
    this.refresh();
};

Tool.prototype.deselect=function(){
    this.selected=false;
    this.refresh();
};

Tool.prototype.paint=function(){
    GUI.Image.prototype.paint.apply(this, []);
    if(this.selected){
        gamejs.draw.rect(this.surface, '#0026FF', new gamejs.Rect([0, 0], this.surface.getSize()), 6);
    }
};

//CHECKPOINT
var Checkpoint=exports.Checkpoint=function(pars){
    pars.image=this.genImage(1);
    pars.rotate_angle=0;
    pars.size=[40, 40];
    pars.rotate_angle=0;
    Checkpoint.superConstructor.apply(this, [pars]);
    this.number=1;
    this.type='checkpoint';
}

gamejs.utils.objects.extend(Checkpoint, Tool);


Checkpoint.prototype.genImage=function(number){
    var s=new gamejs.Surface([40, 40]);
    var font=ui2.getFont('editor_checkpoint');
    gamejs.draw.rect(s, 'RGBA(255, 86, 86, 0.2)', new gamejs.Rect([0, 0], s.getSize()));
    font.render(s, String(number), [12, 12]);
    gamejs.draw.rect(s, '#FF5656', new gamejs.Rect([0, 0], s.getSize()), 3);
    return s;
};

Checkpoint.prototype.genHugeImage=function(number){
    var s=new gamejs.Surface([280, 280]);
    var font=ui2.getFont('editor_checkpoint');
    gamejs.draw.rect(s, 'RGBA(255, 86, 86, 0.2)', new gamejs.Rect([0, 0], s.getSize()));
    font.render(s, String(number), [130, 130]);
    gamejs.draw.rect(s, '#FF5656', new gamejs.Rect([0, 0], s.getSize()), 3);
    return s;
};

Checkpoint.prototype.getCursorImage=function(){
    return this.genHugeImage(this.number); 
};

Checkpoint.prototype.setNumber=function(number){
    this.number=Math.max(1, number);
    this.setImage(this.genImage(this.number));
};

Checkpoint.prototype.place=function(position){
    var img=this.getCursorImage();
    var sz=CHECKPOINT_SIZE;
    
    var wp;
    //remove previous waypoints w. this number
    for(var i=0;i<this.scene.level.checkpoints.length;i++){
        wp=this.scene.level.checkpoints[i];
        if(wp.number==this.number){
            wp.destroy(false);
        }
    }
    var instance=new CheckpointInstance({'parent':this.scene.level_view,
                                        'size':sz,
                                        'scene':this.scene,
                                        'angle':0,
                                        'original':this,
                                        'number':this.number,
                                        'position':[position[0]-Math.ceil(sz[0]/2), position[1]-Math.ceil(sz[0]/2)]});
    this.scene.level.checkpoints.push(instance);
    this.setNumber(this.number+1);
    this.refresh();
};

//START POSITION
var StartPosition=exports.StartPosition=function(pars){
    pars.image=this.genImage(1);
    pars.rotate_angle=90;
    StartPosition.superConstructor.apply(this, [pars]);
    this.type='startposition';
    this.number=1;
}

gamejs.utils.objects.extend(StartPosition, Tool);

StartPosition.prototype.genImage=function(number, angle){
    var s=new gamejs.Surface([60, 60]);
    var font=ui2.getFont('editor_start_pos');
    
    
    //ptlist
    var w=s.getSize()[0];
    var h=s.getSize()[1];
    var ptlist=[[10, 10],
                [20, 0],
                [w-20, 0],
                [w-10, 10],
                [w-10, h],
                [10, h]];
                
    
    gamejs.draw.polygon(s, '#3AFF51', ptlist, 3);
    if(angle===undefined) angle=this.angle;
    s=gamejs.transform.rotate(s, angle);
    font.render(s, String(number), [20, 20]);
    return s;
};

StartPosition.prototype.getCursorImage=function(){
    return this.genImage(this.number); 
};

StartPosition.prototype.setNumber=function(number){
    this.number=Math.min(Math.max(1, number), 6);
    this.setImage(this.genImage(this.number));
};

StartPosition.prototype.place=function(position){
    var img=this.getCursorImage();
    var sz=this.size;
    
    var sp;
    //remove previous waypoints w. this number
    for(var i=0;i<this.scene.level.start_positions.length;i++){
        sp=this.scene.level.start_positions[i];
        if(sp.number==this.number){
            sp.destroy(false);
        }
    }

    var instance=new StartPositionInstance({'parent':this.scene.level_view,
                                        'size':sz,
                                        'scene':this.scene,
                                        'angle':this.angle,
                                        'original':this,
                                        'number':this.number,
                                        'position':[position[0]-Math.ceil(sz[0]/2), position[1]-Math.ceil(sz[0]/2)]});
    this.scene.level.start_positions.push(instance);
    this.setNumber(this.number+1);
    this.refresh();
};

//AI WAYPOINT

var AIWaypoint=exports.AIWaypoint=function(pars){
    pars.image=this.genImage(1);  
    pars.rotate_angle=0;
    AIWaypoint.superConstructor.apply(this, [pars]);
    GUI.draggable(this);
    this.type='aiwaypoint';
    this.number=1;
  
};

gamejs.utils.objects.extend(AIWaypoint, Tool);

AIWaypoint.prototype.genImage=function(number){
    var s=new gamejs.Surface([40, 40]);
    var font=ui2.getFont('editor_ai_wp');
    font.render(s, String(number), [12, 12]);
    gamejs.draw.rect(s, '#0094FF', new gamejs.Rect([0, 0], s.getSize()), 3);
    return s;
};

AIWaypoint.prototype.getCursorImage=function(){
    return this.genImage(this.number); 
};

AIWaypoint.prototype.setNumber=function(number){
    this.number=Math.max(1, number);
    this.setImage(this.genImage(this.number));
};

AIWaypoint.prototype.place=function(position){
    var img=this.getCursorImage();
    var sz=img.getSize();
    
    var wp;
    //remove previous waypoints w. this number
    for(var i=0;i<this.scene.level.ai_waypoints.length;i++){
        wp=this.scene.level.ai_waypoints[i];
        if(wp.number>=this.number){
            wp.number++;
        }
    }
    var instance=new AIWaypointInstance({'parent':this.scene.level_view,
                                        'size':sz,
                                        'scene':this.scene,
                                        'angle':0,
                                        'original':this,
                                        'number':this.number,
                                        'position':[position[0]-Math.ceil(sz[0]/2), position[1]-Math.ceil(sz[0]/2)]});
    this.scene.level.ai_waypoints.push(instance);
    this.setNumber(this.number+1);
    this.refresh();
};

//DECAL

var Decal=exports.Decal=function(pars){
    pars.image=renderer.cache.getDecalSprite(pars.filename, 0);
    pars.rotate_angle=90;
    Decal.superConstructor.apply(this, [pars]);
    this.type='decal';
    this.filename=pars.filename;
};

gamejs.utils.objects.extend(Decal, Tool);

Decal.prototype.getCursorImage=function(angle){
    if(angle==undefined)angle=this.angle;
    return renderer.cache.getDecalSprite(this.filename, angle);  
};

Decal.prototype.place=function(position){
    var img=this.getCursorImage();
    var sz=img.getSize();
    var instance=new DecalInstance({'parent':this.scene.level_view,
                               'size':sz,
                               'scene':this.scene,
                               'angle':this.angle,
                               'original':this,
                               'position':snap([position[0]-Math.ceil(sz[0]/2), position[1]-Math.ceil(sz[0]/2)])});
    this.scene.level.decals.push(instance);
};

//PROP

var Prop=exports.Prop=function(pars){
    pars.image=renderer.cache.getPropSprite(pars.filename, 0);
    pars.rotate_angle=5;
    Prop.superConstructor.apply(this, [pars]);
    this.type='prop';
    this.filename=pars.filename;
    this.scene=pars.scene;
};

gamejs.utils.objects.extend(Prop, Tool);

Prop.prototype.getCursorImage=function(angle){
    if(angle==undefined)angle=this.angle;
    return renderer.cache.getPropSprite(this.filename, angle);  
};

Prop.prototype.place=function(position){
    var img=this.getCursorImage(this.angle);
    var sz=img.getSize();
    var instance=new PropInstance({'parent':this.scene.level_view,
                               'size':sz,
                               'scene':this.scene,
                               'angle':this.angle,
                               'original':this,
                               'position':[position[0]-Math.ceil(sz[0]/2), position[1]-Math.ceil(sz[0]/2)]});
    this.scene.level.props.push(instance);
};

//LEVEL VIEW
var LevelView=exports.LevelView=function(pars){
    this.scene=pars.scene;
    LevelView.superConstructor.apply(this, [pars]);
    this.mpos=[0, 0];
    
    this.on(GUI.EVT_MOUSE_MOTION, function(event){
        this.mpos=event.pos;
        this.refresh();
    }, this);
};
gamejs.utils.objects.extend(LevelView, GUI.View);


LevelView.prototype.paint=function(){
    var tile=renderer.cache.getTile(this.scene.level.bgtile);
    var ts=tile.getSize();
    for(var x=0;x<this.size[0];x+=ts[0]){
        for(var y=0;y<this.size[1];y+=ts[1]){
            this.surface.blit(tile, [x, y]);
        }
    }
};

LevelView.prototype.post_paint=function(){
    if(this.hover && this.scene.selected && this.scene.selected.subtype=='tool' && this.scene.selected.getCursorImage){
        var img=this.scene.selected.getCursorImage();
        var sz=img.getSize();
        
        var pos=[parseInt(this.mpos[0]-sz[0]/2), parseInt(this.mpos[1]-sz[1]/2)];
        if(this.scene.selected.type=='decal'){
            pos=snap(pos);
        }
        this.surface.blit(img, pos);
    }
};

LevelView.prototype.draw=function(){
    var painted=false; //has something been repainted in this view?
    //does this view need repainting?
  
    this.children.forEach(function(child){
        //draw children if this view has been repainted or child has been repainted
        if(child.draw() || this._refresh){
            painted=true;
        }
    }, this);
    
    if(this._refresh || painted){
        this.paint();
        var type;
        for(var i=0;i<drawqueue.length;i++){
            type=drawqueue[i];
            this.children.forEach(function(child){
                if(child.type==type){
                    if(child.visible) this.blitChild(child);
                }
            }, this);
        }
        this.scene.minimap.image.blit(this.surface, new gamejs.Rect([0, 0], this.scene.minimap.image.getSize()),
                                      new gamejs.Rect([0, 0], this.surface.getSize()));
        this.scene.minimap.refresh();
        this.post_paint();
        
        this.despatchEvent({'type':GUI.EVT_PAINT, 'surface':this.surface});
        painted=true;
        this._refresh=false;
    }
    
    return painted;
};

var EditorScene=exports.EditorScene=function(){
    document.getElementById('gjs-canvas').oncontextmenu=new Function("return false");
    this.gui=new GUI.GUI(combatracer.game.display);
    this.gui.on(GUI.EVT_PAINT, function(){
        this.surface.clear();
    }, this.gui);
    
    this.alertdialog=new ui2.Dialog({'gui':this.gui,
                           'size':[600, 150]});

    
    this.tools=[];
    
    this.minimap=new GUI.Image({'position':[0, 0],
                               'size':[LEFT_PANEL_WIDTH, LEFT_PANEL_WIDTH],
                               'parent':this.gui,
                               'image':new gamejs.Surface([LEFT_PANEL_WIDTH, LEFT_PANEL_WIDTH])});
    
    this.saveloadbtn=new ui2.Button({'position':[0, 210],
                                    'size':[190, 50],
                                    'parent':this.gui,
                                    'text':'Save / Load',
                                    'lean':'left'});
    this.saveloadbtn.onClick(function(){
        this.textarea.value=stringifyLevel(this.level);
        $(this.dialogel).dialog('open');
    }, this);
    
    this.playdialog=new PlayDialog({'gui':this.gui,
                                   'scene':this});
    
    this.playbtn=new ui2.Button({'position':[0, 270],
                                    'size':[190, 50],
                                    'parent':this.gui,
                                    'text':'Play',
                                    'lean':'left'});
    
    this.playbtn.onClick(function(){this.show();}, this.playdialog);
    
    this.helpbtn=new ui2.Button({'position':[0, 330],
                                    'size':[190, 50],
                                    'parent':this.gui,
                                    'text':'Help',
                                    'lean':'left'});
    
    this.helpbtn.onClick(function(){
        window.open('http://www.banditracer.eu/index.php?page=track-editor-help');
    }, this);
    
    this.backbtn=new ui2.Button({'position':[0, 390],
                                    'size':[190, 50],
                                    'parent':this.gui,
                                    'text':'Back',
                                    'lean':'left'});
    
    this.backbtn.onClick(function(){
        combatracer.game.showTitle();
    }, this);
    
    
    
    this.dialog=new ui2.Dialog({'gui':this.gui,
                                'size':[450, 150]});
    
    this.scw=new GUI.ScrollableView({'parent':this.gui,
                                    'position':[LEFT_PANEL_WIDTH, 0],
                                    'size':[this.gui.size[0]-LEFT_PANEL_WIDTH-20, this.gui.size[1]-BOT_PANEL_HEIGHT-20]});
    
    this.hscrollbar=new GUI.HorizontalScrollbar({'parent':this.gui,
                                                'position':[LEFT_PANEL_WIDTH, this.gui.size[1]-BOT_PANEL_HEIGHT-20],
                                                'size':[this.gui.size[0]-LEFT_PANEL_WIDTH-20, 20]});
    this.scw.setHorizontalScrollbar(this.hscrollbar);
    
    this.vscrollbar=new GUI.VerticalScrollbar({'parent':this.gui,
                                              'position':[this.gui.size[0]-20, 0],
                                              'size':[20, this.gui.size[1]-BOT_PANEL_HEIGHT-20]});
    this.scw.setVerticalScrollbar(this.vscrollbar);
    
    this.level=getLevelTemplate([2500, 2500]);
    
    this.level_view=new LevelView({'parent':this.scw,
                                    'size':[20, 20],
                                    'scene':this,
                                    'position':[0, 0]});
    
    
    this.decal_view=new DecalView({'parent':this.gui,
                                 'scene':this,
                                 'position':[LEFT_PANEL_WIDTH, this.gui.size[1]-BOT_PANEL_HEIGHT],
                                 'size':[this.gui.size[0]-LEFT_PANEL_WIDTH, BOT_PANEL_HEIGHT]});
    
    this.prop_view=new PropView({'parent':this.gui,
                                 'scene':this,
                                 'position':[LEFT_PANEL_WIDTH, this.gui.size[1]-BOT_PANEL_HEIGHT],
                                 'size':[this.gui.size[0]-LEFT_PANEL_WIDTH, BOT_PANEL_HEIGHT]});
    this.prop_view.hide();
    
    this.marker_view=new MarkerView({'parent':this.gui,
                                 'scene':this,
                                 'position':[LEFT_PANEL_WIDTH, this.gui.size[1]-BOT_PANEL_HEIGHT],
                                 'size':[this.gui.size[0]-LEFT_PANEL_WIDTH, BOT_PANEL_HEIGHT]});
    this.marker_view.hide();
    
    this.bg_view=new BgView({'parent':this.gui,
                            'scene':this,
                            'position':[LEFT_PANEL_WIDTH, this.gui.size[1]-BOT_PANEL_HEIGHT],
                            'size':[this.gui.size[0]-LEFT_PANEL_WIDTH, BOT_PANEL_HEIGHT]});
    this.bg_view.hide();
    
    this.layer_view=new LayerView({'parent':this.gui,
                            'scene':this,
                            'position':[LEFT_PANEL_WIDTH, this.gui.size[1]-BOT_PANEL_HEIGHT],
                            'size':[this.gui.size[0]-LEFT_PANEL_WIDTH, BOT_PANEL_HEIGHT]});
    
    this.layer_view.hide();
    
    this.properties_view=new PropertiesView({'parent':this.gui,
                                            'scene':this,
                                            'position':[LEFT_PANEL_WIDTH, this.gui.size[1]-BOT_PANEL_HEIGHT],
                                            'size':[this.gui.size[0]-LEFT_PANEL_WIDTH, BOT_PANEL_HEIGHT]});
    this.properties_view.hide();
    
    this.select_decal_view=new ToolViewSelectItem({'parent':this.gui,
                                                  'what':'decalView',
                                                  'position':[0, this.gui.size[1]-BOT_PANEL_HEIGHT],
                                                  'text':'Decals'});
    this.select_decal_view.on('select', this.selectView, this);
    this.select_decal_view.selected=true;
    
    this.select_prop_view=new ToolViewSelectItem({'parent':this.gui,
                                                  'what':'propView',
                                                  'position':[0, this.gui.size[1]-BOT_PANEL_HEIGHT+22],
                                                  'text':'Props'});
    this.select_prop_view.on('select', this.selectView, this);
    
    this.select_marker_view=new ToolViewSelectItem({'parent':this.gui,
                                                  'what':'markerView',
                                                  'position':[0, this.gui.size[1]-BOT_PANEL_HEIGHT+22*2],
                                                  'text':'Markers'});
    this.select_marker_view.on('select', this.selectView, this);
    
    this.select_bg_view=new ToolViewSelectItem({'parent':this.gui,
                                               'what':'bgView',
                                               'position':[0, this.gui.size[1]-BOT_PANEL_HEIGHT+22*3],
                                               'text':'Background'});
    this.select_bg_view.on('select', this.selectView, this);
    
    this.select_properties_view=new ToolViewSelectItem({'parent':this.gui,
                                               'what':'propertiesView',
                                               'position':[0, this.gui.size[1]-BOT_PANEL_HEIGHT+22*4],
                                               'text':'Properties'});
    this.select_properties_view.on('select', this.selectView, this);
    
    this.select_layer_view=new ToolViewSelectItem({'parent':this.gui,
                                               'what':'layerView',
                                               'position':[0, this.gui.size[1]-BOT_PANEL_HEIGHT+22*5],
                                               'text':'Layers'});
    this.select_layer_view.on('select', this.selectView, this);
    
    
    this.gui.on(GUI.EVT_MOUSE_WHEEL, this.mouseWheel, this);
    this.level_view.on(GUI.EVT_MOUSE_DOWN, this.viewMouseDown, this);
    this.gui.on(GUI.EVT_MOUSE_DOWN, this.mouseDown, this);
    this.level_view.on(GUI.EVT_KEY_DOWN, this.keyDown, this);
    
    //init jquery dialog
    this.dialogel=document.getElementById('saveload_dialog');
    if(!this.dialogel){
        this.dialogel=document.createElement('div');
        this.dialogel.id='saveload_dialog';
        var p=document.createElement('p');
        p.innerHTML=LOAD_HELP_TEXT;
        this.dialogel.appendChild(p);
        this.textarea=document.createElement('textarea');
        this.textarea.style.width='400px';
        this.textarea.style.height='300px';
        this.dialogel.appendChild(this.textarea);
        document.body.appendChild(this.dialogel);
        $(this.dialogel).click(function(event){
            event.stopPropagation();
            // do something
          });  
    }
    $(this.dialogel).dialog({ autoOpen: false ,
                            title:'Save / Load',
                            width:460,
                       buttons: [
    {
        text: 'New',
        'click':function(){
            combatracer.game.editor_scene.loadLevel(getLevelTemplate([2500, 2500]));
            $(this).dialog("close");
        }
        
    },
    {
        text: "Load example",
        click: function() { combatracer.game.editor_scene.loadExample();
                            $(this).dialog("close");}
    },
    {
        text: "Load",
        click: function() { combatracer.game.editor_scene.load();
                            $(this).dialog("close");}
    },
    {
        text: "Close",
        click: function() { $(this).dialog("close"); }
    }]});
    
    $(this.dialogel).scene=this;
    
    this.loadLevel(this.level);

};

EditorScene.prototype.selectView=function(event){
    if(event.what=='decalView'){
        this.decal_view.show();
    }else{
        this.decal_view.hide();
        this.select_decal_view.deselect();
    }
    
    if(event.what=='propView'){
        this.prop_view.show();
    }else{
        this.prop_view.hide();
        this.select_prop_view.deselect();
    }
    
    if(event.what=='markerView'){
        this.marker_view.show();
    }else{
        this.marker_view.hide();
        this.select_marker_view.deselect();   
    }
    
    if(event.what=='bgView'){
        this.bg_view.show();
    }else{
        this.bg_view.hide();
        this.select_bg_view.deselect();
    }
    
    if(event.what=='propertiesView'){
        this.properties_view.show();
    }else{
        this.properties_view.hide();
        this.select_properties_view.deselect();
    }
    
    if(event.what=='layerView'){
        this.layer_view.show();
    }else{
        this.layer_view.hide();
        this.select_layer_view.deselect();
    }
    
    
};

EditorScene.prototype.mouseDown=function(event){
    if(event.button==2){
        this.deselectEverything();
        this.selected=null;
    }
};

EditorScene.prototype.destroyInstance=function(instance){
    instance.destroy();
    this.deselectEverything(this.instance);
    if(this.selected.subtype=='instance' && this.selected.instance_id==instance.instance_id) this.selected=null;
};

EditorScene.prototype.keyDown=function(event){
    if(this.selected && this.selected.subtype=='instance' && event.key==46){
        this.destroyInstance(this.selected);
    }
};

EditorScene.prototype.viewMouseDown=function(event){
    if(event.button==0){
        if(this.selected && this.selected.place){
            this.selected.place(event.pos);
        }
    }
};

EditorScene.prototype.selectTool=function(event){
    var tool=this.selected=event.tool;
    this.deselectEverything(tool);
};

EditorScene.prototype.deselectEverything=function(obj){
    this.tools.forEach(function(tool){
        if(!obj ||(!((tool.type==obj.type) && (tool.filename==obj.filename)))){
            tool.deselect();
        }
    }, this);
    
    this.level_view.children.forEach(function(instance){
        if(!obj || (!((instance.instance_id==obj.instance_id)))){
            instance.deselect();
        }
    }, this);
};

EditorScene.prototype.selectInstance=function(event){
    
    var instance=this.selected=event.instance;
    this.deselectEverything(instance);
    
};

EditorScene.prototype.mouseWheel=function(event){
    if(this.selected){
        if(event.delta<0){
            if(this.selected.rotateRight)for(var i=0;i<Math.abs(event.delta);i++) this.selected.rotateRight();
        }
        else if (event.delta>0){
            if(this.selected.rotateLeft)for(var i=0;i<Math.abs(event.delta);i++) this.selected.rotateLeft();
        }
    }
};

EditorScene.prototype.loadExample=function(){
  try{
    this.loadLevel(JSON.parse(EXAMPLE));
  }catch(e){
    alert('failed! '+e);
  }
};



EditorScene.prototype.load=function(){
  try{
    this.loadLevel(JSON.parse(this.textarea.value));
  }catch(e){
    alert('failed! '+e);
  }
};

EditorScene.prototype.resizeLevelView=function(){
    var size=this.level.size;
    var w=size[0], h=size[1];
    this.level_view.resize(size);
    this.scw.autoSetScrollableArea();
    this.properties_view.widthlbl.setText(String(w));
    this.properties_view.heightlbl.setText(String(h));
    var q=Math.max(w, h)/(LEFT_PANEL_WIDTH-2);
    var minimap_size=[parseInt(w/q), parseInt(h/q)];
    this.minimap.resize(minimap_size);
    this.minimap.image=new gamejs.Surface(minimap_size);
};

EditorScene.prototype.loadLevel=function(level){
    this.level=getLevelTemplate(level.size);
    this.level.bgtile=level.bgtile;
    this.level.title=level.title;
    this.properties_view.title.setText(level.title);
    this.resizeLevelView();
    this.level_view.children=[];
    
    var prop, decal, instance;
    level.decals.forEach(function(dip){
        decal=this.decal_view.filename_to_decal[level.dict[dip.f]];
        instance=new DecalInstance({'parent':this.level_view,
                               'size':decal.getCursorImage().getSize(),
                               'scene':this,
                               'angle':dip.a,
                               'original':decal,
                               'position':dip.p});
        this.level.decals.push(instance);
    }, this);
    
    level.props.forEach(function(pid){
        prop=this.prop_view.filename_to_prop[level.dict[pid.f]];
        instance=new PropInstance({'parent':this.level_view,
                               'size':prop.getCursorImage(pid.a).getSize(),
                               'scene':this,
                               'angle':pid.a,
                               'original':prop,
                               'position':pid.p});
        this.level.props.push(instance);
    }, this);
    
    
    
    var max_ai_n=1, max_cp_n=1, max_sp_n=1;
    
    level.ai_waypoints.forEach(function(aip){
        instance=new AIWaypointInstance({'parent':this.level_view,
                                        'size':this.marker_view.ai_waypoint.getCursorImage().getSize(),
                                        'scene':this,
                                        'angle':0,
                                        'number':aip.n,
                                        'original':this.marker_view.ai_waypoint,
                                        'position':aip.p});
        this.level.ai_waypoints.push(instance);
        max_ai_n=Math.max(max_ai_n, aip.n);
    }, this);
    this.marker_view.ai_waypoint.setNumber(max_ai_n+1);
    
    level.checkpoints.forEach(function(cp){
        
        instance = new CheckpointInstance({'parent':this.level_view,
                                        'size':CHECKPOINT_SIZE,
                                        'scene':this,
                                        'angle':0,
                                        'original':this.marker_view.checkpoint,
                                        'number':cp.n,
                                        'position':cp.p});
        this.level.checkpoints.push(instance);
        max_cp_n=Math.max(max_cp_n, cp.n);
    }, this);
    this.marker_view.checkpoint.setNumber(max_cp_n+1);
    
    level.start_positions.forEach(function(sp){
        instance=new StartPositionInstance({'parent':this.level_view,
                                       'size':this.marker_view.start_position.size,
                                       'scene':this,
                                       'angle':sp.a,
                                       'original':this.marker_view.start_position,
                                       'number':sp.n,
                                       'position':sp.p});
        this.level.start_positions.push(instance);
        max_sp_n=Math.max(max_sp_n, sp.n);
    }, this);
    this.marker_view.start_position.setNumber(max_sp_n+1);
    this.level_view.refresh();
};

EditorScene.prototype.alert=function(){
    this.dialog.show(text, button);
};

EditorScene.prototype.clearAlert=function(){
    this.dialog.close();
};

EditorScene.prototype.handleEvent=function(event){
    this.gui.despatchEvent(event);  
};

EditorScene.prototype.alert=function(text, button){
    this.alertdialog.show(text, button);
};
    
EditorScene.prototype.clearAlert=function(){
    this.alertdialog.close();
};
    

EditorScene.prototype.update=function(msDuration){
    if(this.ping){
        this.ms_to_ping-=msDuration;
        if(this.ms_to_ping<=0){
            this.game.getCommunicator().queueMessage('PING');
            this.ms_to_ping=10000;
        }
    }
    this.gui.update(msDuration);
};

EditorScene.prototype.draw=function(display){
    this.gui.draw();  
};

function LayerOnOffBtn(pars){
    pars.text='On';
    pars.size=[100, 40];
    LayerOnOffBtn.superConstructor.apply(this, [pars]);
    this.layer=pars.layer;
    this.scene=pars.scene;
    this.is_on=true;
    this.onClick(this.onclick, this);
};

gamejs.utils.objects.extend(LayerOnOffBtn, ui2.Button);

LayerOnOffBtn.prototype.onclick=function(){
    if(this.is_on){
        this.scene.level[this.layer].forEach(function(obj){
           obj.hide(); 
        });
        this.is_on=false;
        this.setText('Off');
    }
    else{
        this.scene.level[this.layer].forEach(function(obj){
           obj.show(); 
        });
        this.is_on=true;
        this.setText('On');
    }
};

function PlayDialog(pars){
    pars.size=[220, 300];
    PlayDialog.superConstructor.apply(this, [pars]);
    this.scene=pars.scene;
    
    this.playbtn=new ui2.Button({'parent':this,
                                'text':'Play',
                                'size':[180, 40],
                                'lean':'both',
                                'position':[20, 20]});
    
    this.playbtn.onClick(function(){
        this.close();
        var problems=getLevelProblems(this.scene.level);
        if(problems.length){
            this.scene.alert(problems[0]);
        }
        else combatracer.game.playLevel(structifyLevel(this.scene.level), false, false, 'editor');
    }, this);
    
    this.testaibtn=new ui2.Button({'parent':this,
                                'text':'Test AI',
                                'size':[180, 40],
                                'lean':'both',
                                'position':[20, 70]});
    
    this.testaibtn.onClick(function(){
        this.close();
        var problems=getLevelProblems(this.scene.level);
        if(problems.length){
            this.scene.alert(problems[0]);
        }
        else combatracer.game.playLevel(structifyLevel(this.scene.level), true, false, 'editor');
    }, this);
    
    this.cancelbtn=new ui2.Button({'parent':this,
                                'text':'Cancel',
                                'size':[180, 40],
                                'lean':'both',
                                'position':[20, 120]});
    
    this.cancelbtn.onClick(function(){
        this.close();
    }, this);
    
};

gamejs.utils.objects.extend(PlayDialog, GUI.Dialog);

