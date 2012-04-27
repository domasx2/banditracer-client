var box2d = require('./box2d');
var game = require('./game');
var sound = require('./sound');

var gamejs = require('gamejs');
var vectors = gamejs.utils.vectors;

var math = gamejs.utils.math;
var radians=math.radians;
var degrees=math.degrees;

var utils = require('./utils');
var arr = utils.arr;
var vec = utils.vec;


var ContactListener = function(world) {
    this.world = world;
    this.BeginContact = function(cpoint) {
        var body1 = cpoint.GetFixtureA().GetBody();
        var body2 = cpoint.GetFixtureB().GetBody();
        var obj1 = body1.GetUserData();
        var obj2 = body2.GetUserData();
        if(obj1 && obj2) {
            var manifold = new box2d.b2WorldManifold();
            cpoint.GetWorldManifold(manifold);
            var normal = arr(manifold.m_normal);
            world._register_impact(obj1, obj2, cpoint, normal);
            world._register_impact(obj2, obj1, cpoint, vectors.rotate(normal, radians(180)));
        }
    };

    this.EndContact = function() {
    };
    this.PreSolve = function() {
    };
    this.PostSolve = function() {
    };
    return this;
};



var World = exports.World = function(parameters){
    this._next_object_id = 0;
    this._next_event_id = 0;
    
    this._events = {};
    this._impacts = [];
    this.objects = {};
    this.objects_by_tag= {};
    
 
    var parlist = [['gravity', [0, 0]]];


    utils.process_parameters(parameters, parlist);
    
    this.parameters = parameters;
    
    this.b2world=new box2d.b2World(vec(parameters.gravity), false);
    this.b2world.SetContactListener(new ContactListener(this));
};

World.prototype._register_impact = function(obj1, obj2, cpoint, normal){
    this._impacts.push([obj1, obj2, cpoint, normal]);
};

World.prototype._process_impacts = function(){
    while(this._impacts.length){
        var d = this._impacts.pop();
        d[0].impact(d[1], d[2], d[3]);
    };
    
    this._impacts = [];
};


World.prototype._register_event = function(event_type, parameters){
    var event = {
                    'type':event_type,
                    'data':parameters,
                    'id':this._next_event_id++
    };
    
   // this._events[event.id] = event;
    
    //TODO: multiplayerify
    return this._process_event(event);
    
};

World.prototype._create_body = function(def){
    return this.b2world.CreateBody(def);
};

World.prototype._destroy_body = function(body){
    this.b2world.DestroyBody(body);
};

World.prototype._process_event = function(event) {
    if(event.type == 'create') {
        var pars = utils.copy(event.data, {});
        pars.world = this;
        pars.id = this._next_object_id++;
        for(var key in pars) {
            if((pars[key] + '').search('_o_') == 0) {
                var id = parseInt(pars[key].replace('_o_', ''));
                pars[key] = this.get_object(id);
            }
        }
        var fn = game.get_class_by_id(pars.class_id);
        var obj = new fn(pars);
        for(var tag in obj._tags) {
            if(!this.objects_by_tag[tag]) {
                this.objects_by_tag[tag] = [];
            }
            this.objects_by_tag[tag].push(obj);
        }
        obj.on_create();
        return obj;
    } else {
        this._destroy(this.get_object(event.data));
    }
};

World.prototype.get_object = function(id){
    var retv = this.objects[id];
    if(! retv) throw 'Uh oh. Unknown object id= '+id;
    return retv;
};

World.prototype.get_objects_by_tag = function(tag){
    if(this.objects_by_tag[tag]) return this.objects_by_tag[tag];
    return [];
};

World.prototype._destroy = function(obj){
    obj.die();
    delete this.objects[obj.id];
    
    //remove impacts for this object
    var n_impacts = [];
    this._impacts.forEach(function(impact){
        if(!(impact[0].id == obj.id || impact[1].id == obj.id )){
            n_impacts.push(impact);
        }
    });
    this._impacts = n_impacts;
    
    if(obj.body) this._destroy_body(obj.body);
    for(var tag in obj._tags){
        for(var i = 0; i < this.objects_by_tag[tag].length; i++) {
            if(this.objects_by_tag[tag][i].id == obj.id) {
                this.objects_by_tag[tag].splice(i, 1);
                break;
            }
        }
    }
};

World.prototype.create = function(fn, parameters){
    parameters.class_id = game.get_id_by_class(fn);
    for (var key in parameters){
        if(parameters[key] && parameters[key].AM_OBJECT){
            parameters[key] = '_o_' + parameters[key].id;
        }
    }
    return this._register_event('create', parameters);
};

World.prototype.destroy = function(entity){
    this._register_event('destroy', entity.id);
};

World.prototype.update = function(msDuration){
    this._process_impacts();
    for(var id in this.objects){
        this.objects[id].update(msDuration);
    }
};

World.prototype.draw = function(renderer){
    for(var id in this.objects){
        var obj = this.objects[id];
        obj.draw(renderer);
    }
};

World.prototype.play_sound = function(filename, position){
    this.create(sound.SoundObject, {'filename':filename, 'position':position});
};
