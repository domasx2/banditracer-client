var utils = require('./utils');
var vec=utils.vec;
var arr=utils.arr;
var weapon_descriptions=require('./weapon_descriptions');
var combatracer=require('./combatracer');
var car_descriptions=require('./car_descriptions');
var cars=require('./cars');
var weapons=require('./weapons');
var animation=require('./animation');
var props=require('./props');
var settings=require('./settings');
var gamejs=require('gamejs');
var sounds=require('./sounds');
var renderer=require('./renderer');
var buffs=require('./buffs');
var vectors = gamejs.utils.vectors;
var math = gamejs.utils.math;
var engine = require('./engine');

radians=math.radians;
degrees=math.degrees;



var MODE_CLIENT = exports.MODE_CLIENT = 1;
var MODE_SERVER = exports.MODE_SERVER = 2;
var MODE_STANDALONE = exports.MODE_STANDALONE = 3;

var World = exports.World = function(parameters){
    
    var par_list = ['width',
                    'height',
                    'ai_waypoints',
                    'checkpoints',
                    'start_positions',
                    'mode'];
    
    engine.utils.process_parameters(parameters, par_list);
    this.parameters = parameters;
    
    World.superConstructor.apply(this, [parameters]);
    
    this.width = parameters.width;
    this.height = parameters.height;
    this.size = [this.width, this.height];
    this.ai_waypoints = parameters.ai_waypoints;
    this.checkpoints = parameters.checkpoints;
    this.start_positions = parameters.start_positions;
    this.mode = parameters.mode;
    
    this.max_waypoint=0;
    for(var no in this.ai_waypoints) this.max_waypoint=Math.max(this.max_waypoint, no);
    
    this.max_checkpoint=0;
    for(var no in this.checkpoints) this.max_checkpoint=Math.max(this.max_checkpoint, no);
};

gamejs.utils.objects.extend(World, engine.World);

World.prototype.spawn_animation = function(anim_name, position, follow_obj){
    this.create(animation.AnimationObject, utils.copy(animation.animations[anim_name], {'position':position,
                                                                                        'follow_obj':follow_obj}));
};

World.prototype.play_sound = function(filename, position){
    if(settings.get('sound')) engine.World.prototype.play_sound.apply(this, ['sounds/fx/'+filename, position]);
};

exports.build_world = function(level, mode) {
    //level - data property of level module

    var phys_scale = settings.get('PHYS_SCALE');

    var dict = level.dict;

    //CAR POSITIONS
    var start_positions = {};
    level.start_positions.forEach(function(pos) {
        start_positions[pos.n] = {
            'x' : (pos.p[0] + 30) / phys_scale,
            'y' : (pos.p[1] + 30) / phys_scale,
            'angle' : pos.a
        }
    });
    //WAYPOINTS
    var ai_waypoints = {};
    level.ai_waypoints.forEach(function(wp) {
        ai_waypoints[wp.n] = {
            'x' : (wp.p[0] + 20) / phys_scale,
            'y' : (wp.p[1] + 20) / phys_scale
        };
    });
    //CHECKPOINTS
    var checkpoints = {}, pt1, pt2;
    level.checkpoints.forEach(function(c) {
        pt1 = [c.p[0] / phys_scale, c.p[1] / phys_scale];
        pt2 = [(c.p[0] + 280) / phys_scale, (c.p[1] + 280) / phys_scale];
        ;
        checkpoints[c.n] = {
            'pt1' : pt1,
            'pt2' : pt2,
            'width' : pt2[0] - pt1[0],
            'height' : pt2[1] - pt1[1],
            'center' : [(pt1[0] + pt2[0]) / 2, (pt1[1] + pt2[1]) / 2]
        };
    });
    //BUILD WORLD

    var width = level.size[0] / phys_scale;
    var height = level.size[1] / phys_scale;

    var world = new World({
        'width' : width,
        'height' : height,
        'ai_waypoints' : ai_waypoints,
        'checkpoints' : checkpoints,
        'start_positions' : start_positions,
        'mode' : mode
    });

    //BUILD PROPS
    var position, angle, s, sz, sz2, ws;
    level.props.forEach(function(prop) {
        angle = math.normaliseDegrees(prop.a);
        s = renderer.cache.getPropSprite(dict[prop.f], angle);
        sz = s.getSize();
        s = renderer.cache.props[dict[prop.f]].orig;
        sz2 = s.getSize();
        ws = [sz2[0] / phys_scale, sz2[1] / phys_scale];
        world.create(props.BoxProp, {
            'filename' : dict[prop.f],
            'position' : [((prop.p[0] + sz[0] / 2) / phys_scale), ((prop.p[1] + sz[1] / 2) / phys_scale)],
            'angle' : angle,
            'size' : ws
        });
    });
    return world;
}

