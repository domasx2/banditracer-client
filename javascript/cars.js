var gamejs = require('gamejs');
var utils = require('./utils');
var sounds = require('./sounds');
var buffs=require('./buffs');
var car_descriptions = require('./car_descriptions');
var combatracer=require('./combatracer');
var weapons = require('./weapons');
var weapon_descriptions = require('./weapon_descriptions');
var engine = require('./engine');
var settings = require('./settings');
var box2d = engine.box2d;
var vec=utils.vec;
var arr=utils.arr;

var vectors = gamejs.utils.vectors;
var math = gamejs.utils.math;
radians=math.radians;
degrees=math.degrees;

var animation=require('./animation');

var STEER_NONE=exports.STEER_NONE=0;
var STEER_RIGHT=exports.STEER_RIGHT=1;
var STEER_LEFT=exports.STEER_LEFT=2;

var ACC_NONE=exports.ACC_NONE=0;
var ACC_ACCELERATE=exports.ACC_ACCELERATE=1;
var ACC_BRAKE=exports.ACC_BRAKE=2;

var Wheel = exports.Wheel = function(pars){
    this.car = pars.car;
    this.local_position = pars.position;
    
    var par_list = [    
                        ['revolving', false],
                        ['powered', false]
                   ];
               
    engine.utils.process_parameters(pars, par_list);
    
    pars.position = this.car.get_world_point(this.local_position);
    pars.angle = this.car.get_angle();
    pars.sensor = true;
    Wheel.superConstructor.apply(this, [pars]);
    this.prev_position = this.position;
    this.add_tag('wheel');
    
    //create joint to connect wheel to body
    if(this.parameters.revolving){
        var jointdef = new box2d.b2RevoluteJointDef();
        jointdef.Initialize(this.car.body, this.body, this.body.GetWorldCenter());
        jointdef.enableMotor = false;
        jointdef.referenceAngle = 0;
    }else{
        var jointdef = new box2d.b2PrismaticJointDef();
        jointdef.Initialize(this.car.body, this.body, this.body.GetWorldCenter(), vec([1, 0]));
        jointdef.enableLimit = true;
        jointdef.lowerTranslation = jointdef.upperTranslation = jointdef.referenceAngle=0;
    }
    this.world.b2world.CreateJoint(jointdef);
};

gamejs.utils.objects.extend(Wheel, engine.Entity);


Wheel.prototype.reset_angle = function() {
    this.set_angle(this.car.get_angle());
};

Wheel.prototype.set_relative_angle = function(angle) {
    this.set_angle(this.car.get_angle()+angle);
};

Wheel.prototype.get_world_position=function() {
    return this.car.get_world_point(this.local_position);
};

Wheel.prototype.draw = function(renderer) {
    renderer.drawCar(this.parameters.filename, 
                    this.car.get_world_point(this.local_position), 
                    this.get_angle());
    if(this.alive){
        if(this.prev_position && 
          (gamejs.utils.vectors.angle(this.get_linear_velocity(), 
                                      this.get_world_vector([0, -1])) > gamejs.utils.math.radians(20))){
            var ps = settings.get('PHYS_SCALE');
            var pp = this.prev_position;
            var  p= this.position;
            var a1 = [-this.parameters.size[0] / 2, 0];
            var a2 = [this.parameters.size[0] / 2, 0];
            var angle = radians(this.get_angle());
            a1 = gamejs.utils.vectors.rotate(a1, angle);
            a2 = gamejs.utils.vectors.rotate(a2, angle);
            var points=[[(a1[0]+pp[0])*ps, (a1[1]+pp[1])*ps],
                        [(a1[0]+p[0])*ps, (a1[1]+p[1])*ps],
                        [(a2[0]+p[0])*ps, (a2[1]+p[1])*ps],
                        [(a2[0]+pp[0])*ps, (a2[1]+pp[1])*ps]];
            gamejs.draw.polygon(renderer.background, '#282828', points)
        };
       
        this.prev_position = this.position;
   }
};

Wheel.prototype.get_local_velocity = function(){
    return this.get_local_vector(this.car.get_linear_velocity(this.local_position));
};

Wheel.prototype.get_kill_velocity_vector = function(){
    var velocity = this.get_linear_velocity();
    var sideways_axis = this.get_direction_vector();
    var dotprod = vectors.dot(velocity, sideways_axis);
    return vectors.multiply(sideways_axis, dotprod);
};

Wheel.prototype.kill_sideways_velocity = function(){
    var kv = this.get_kill_velocity_vector();
    this.k_velocity = kv;
    this.set_linear_velocity(kv);
};

Wheel.prototype.die = function(){
    this.alive = false;
    this.set_linear_velocity([0, 0]);
    this.prev_position = null;
};

Wheel.prototype.get_local_angle=function(){   
    var retv= math.normaliseDegrees(this.get_angle()-this.car.get_angle());
    if(retv > 180) retv -= 360;
    return retv;
};

Wheel.prototype.respawn = function(){
    this.alive = true;
};


var Car = exports.Car = function(parameters){
    /*
    pars is object with keys:

    width             - width in meters
    height            - height in meters
    filename          - sprite file name
    world             - world object
    position          -[x, y]  position in world
    angle             -start angle in degrees
    power             -engine power in newtons
    max_steer_angle   -max steering angle, degrees
    max_speed         -max speed, km/h
    wheels            -wheel definitins: {'x', 'y', 'rotart', 'powered'}
    front_weapon           -first weapon
    rear_weapon           -second weapon
    util
    health            -max health
    alias             -player alias
    car_type
    speed_upgrades
    armor_upgrades
    acc_upgrades

    */
    this.descr = car_descriptions[parameters.car_type];
   
    parameters.size = [this.descr.width, this.descr.height];
   
    var par_list = [    
                        ['filename',        ''],
                        'car_type',
                        ['mod_speed',       0],
                        ['engine_sound',    false],
                        ['turn_msec',       200],
                        ['front_weapon',    null],
                        ['rear_weapon',     null],
                        ['util',            null],
                        ['alias',           ''],
                        ['speed_upgrades',  0],
                        ['armor_upgrades',  0],
                        ['acc_upgrades',    0]
                   ];
               
    engine.utils.process_parameters(parameters, par_list);
    
    this.health = this.max_health =  parameters.max_health = this.descr.health + parameters.armor_upgrades * this.descr.armor_upgrade;
    this.max_speed = this.descr.max_speed + parameters.speed_upgrades * this.descr.speed_upgrade;
    
    Car.superConstructor.apply(this, [parameters]);
    
    var carpos = this.world.get_objects_by_tag('car').length;
    this.filename = this.descr.filenames[carpos % this.descr.filenames.length];

    this.add_tag('car');
    this.active = true;
    
    this.alias = this.parameters.alias;
    this.next_checkpoint_no = 1;
    this.lap = 0;
    this.time_to_respawn = 0;
    this.respawn_location = this.position;
    this.respawn_angle = 0;
    this.respawn_time = 2000;
    this.kills = 0;
    this.deaths = 0;

    //WEAPONS
    this.front_weapon = null;
    this.rear_weapon = null;
    this.util = null;
    
    if(this.parameters.front_weapon){
        var pars = utils.copy(this.parameters.front_weapon, {});
        pars.car = this;
        pars.slot = 'front_weapon';
        pars.world = this.world;
        this.world.create(weapons[weapon_descriptions[pars.type].launcher], pars);
    }
    if(this.parameters.rear_weapon){
        var pars = utils.copy(this.parameters.rear_weapon, {});
        pars.car = this;
        pars.world = this.world;
        pars.slot = 'rear_weapon';
        this.world.create(weapons[weapon_descriptions[pars.type].launcher], pars);
    }
    if(this.parameters.util) {
        var pars = utils.copy(this.parameters.util, {});
        pars.car = this;
        pars.world = this.world;
        pars.slot = 'util';
        this.world.create(weapons[weapon_descriptions[pars.type].launcher], pars);
    }

    //ACTIONS
    this.fire_front_weapon = false;
    this.fire_rear_weapon = false;
    this.fire_util = false;
    this.accelerate = ACC_NONE;
    this.steer = STEER_NONE;

    //PHYSICAL
    this.max_steer_angle = this.descr.max_steer_angle;
    this.power = this.descr.power + this.parameters.acc_upgrades * this.descr.power_upgrade;
    this.max_speed = this.descr.max_speed + this.parameters.speed_upgrades * this.descr.speed_upgrade;
    this.turn_msec = this.parameters.turn_msec;
    this.local_engine_pos = [0, -(this.parameters.height/2)];
    this.cur_wheel_angle = 0;
    this.mod_speed = this.parameters.mod_speed;
    

    //ANIM
    this.smoke_cd = 0;
    
    //initialize wheels
    this.wheels=[]
    var wheeldef, i;
    this.descr.wheels.forEach(function(wheeldef){
        wheeldef = utils.copy(wheeldef, {});
        wheeldef.position = [wheeldef.x, wheeldef.y];
        wheeldef.size = [wheeldef.width, wheeldef.length];
        wheeldef.car = this;
        wheeldef.world = this.world;
        this.wheels.push( new Wheel(wheeldef) );
    }, this);
};   

gamejs.utils.objects.extend(Car, engine.Entity);

engine.register_class(Car);

Car.prototype.impact = function(obj, cpoint, direction){
    if(obj.has_tag('car')){
        this.world.play_sound('thud.wav', this.get_position());
    }
};

Car.prototype.cross_finish_line = function(){
    if(this.front_weapon) this.front_weapon.reload();
    if(this.rear_weapon) this.rear_weapon.reload();
    if(this.util) this.util.reload();
};
    
Car.prototype.get_power = function(){
    var power = this.power;
    this.buffs.forEach(function(buff){
        if(buff.effect == buffs.EFFECT_ENGINE){          
            power += buff.value;
        }
    }, this);
    return parseInt(power);
};

Car.prototype.get_max_speed = function(){
    var max_speed=this.max_speed;
    this.buffs.forEach(function(buff){
        if(buff.effect == buffs.EFFECT_ENGINE){
            max_speed += buff.value;
        }
    }, this);
    return parseInt(max_speed + this.mod_speed);
};

Car.prototype.update_checkpoint = function(){
      var cp = this.world.checkpoints[this.next_checkpoint_no];
      var pos = this.get_position();
      if(pos[0] >= cp.pt1[0] && pos[0] <= cp.pt2[0] && pos[1] >= cp.pt1[1] && pos[1] <= cp.pt2[1]){
          if(this.next_checkpoint_no == 1){
             this.lap++;
             this.cross_finish_line();
          }
    
          if(this.next_checkpoint_no == this.world.max_checkpoint){
             this.next_checkpoint_no = 1;
          }
          else{
             this.next_checkpoint_no++;
          }
    
      }
};

Car.prototype.get_race_position = function(){
        var pos = this.world.objects_by_tag['car'].length;
        var i, c;
        //check each car in the race
        for(i = 0; i < this.world.objects_by_tag['car'].length; i++){
            c = this.world.objects_by_tag['car'][i];
            if(!(c === this)){
                //if this cars lap is greater, it is ahead
                if( this.lap > c.lap ){
                    pos--;
                //if this cars lap is equal, but checkpoint is greater, it is ahead
                }else if(this.lap == c.lap && ((this.next_checkpoint_no > c.next_checkpoint_no) || (this.next_checkpoint_no == 1 && c.next_checkpoint_no != 1))){
                    pos--;
                //if this cars lap and checkpoint are equal, but distance to checkpoint is less, it is ahead
                }else if((this.lap == c.lap)&&
                         (this.next_checkpoint_no==c.next_checkpoint_no) &&
                         (vectors.distance(this.alive ? this.get_position() : this.respawn_location, this.world.checkpoints[this.next_checkpoint_no].center) <
                          vectors.distance(c.alive ? c.get_position() : c.respawn_location, this.world.checkpoints[c.next_checkpoint_no].center)) ){
                    pos--;
                }
            }
        }
        return pos;
};

Car.prototype.get_powered_wheels = function(){
    var retv=[];
    this.wheels.forEach(function(wheel){
        if(wheel.parameters.powered) retv.push(wheel);
    });        
    return retv;
};

Car.prototype.get_revolving_wheels = function(){
    var retv = [];
    this.wheels.forEach(function(wheel){
        if(wheel.parameters.revolving) retv.push(wheel);
    });
    return retv;
};

Car.prototype.get_speed_KMH = function(){
    var velocity = this.get_linear_velocity();
    var len=vectors.len(velocity);
    return (len/1000)*3600;
};

Car.prototype.draw = function(renderer){
    if(this.alive && this.active){
        this.wheels.forEach(function(wheel){
            wheel.draw(renderer);
        });
        var bp = this.get_position();
        renderer.drawCar(this.filename, bp, this.get_angle());

        //only draw alias on multiplayer games
        //if(this.alias){
        //    renderer.drawText(this.alias, 'alias', renderer.getScreenPoint([bp[0]-this.width, bp[1]-this.height]));
        //}
    }
};

Car.prototype.teleport=function(position, angle){
    angle= angle ? angle : this.get_angle();
    this.set_position(position);
    this.set_angle(angle);
    this.wheels.forEach(function(wheel){
        wheel.set_position(this.get_world_point(wheel.local_position));
    }, this);
};

Car.prototype.die=function(){
    this.alive = false;
    this.deaths += 1;
    this.time_to_respawn = this.respawn_time;
    this.respawn_location = this.get_position();
    this.world.spawn_animation('explosion', this.get_position());
    this.world.play_sound('explosion.wav', this.get_position());
    this.respawn_angle = this.get_angle();
    this.teleport([0, 0]);
    this.set_linear_velocity([0, 0]);
    this.wheels.forEach(function(wheel){ wheel.die();});
    this.clear_buffs();
};

Car.prototype.respawn = function(){
    this.alive = true;
    this.wheels.forEach(function(wheel){wheel.respawn();});
    this.teleport(this.respawn_location, this.respawn_angle);
    this.health = this.max_health;
};

Car.prototype.kill=function(car){
    this.kills += 1;
};

Car.prototype.apply_damage = function(damage, owner){
	for(var i=0; i< this.buffs.length; i++){
        if(!this.buffs[i].process_hit(damage, owner)) return;
    }
    
    if(this.alive){
        this.health = Math.min(this.health-damage, this.max_health);
        if(this.health <= 0){
            this.die();
            if(owner) owner.kill(this);
        }
    }
};

Car.prototype.update=function(msDuration){
    if(this.active){
        if(this.alive){
            if(this.alive) this.update_alive(msDuration);
        }
        else{
            this.time_to_respawn-=msDuration;
            if(this.time_to_respawn<=0){
                this.respawn();
            }
        }
    }
};

Car.prototype.update_alive = function(msDuration){
    this.update_checkpoint();
    var steer = this.steer;
    var acceleration = this.accelerate;
    var speed = this.get_speed_KMH();
    var local_velocity = this.get_local_vector(this.get_linear_velocity());
    var max_speed = this.get_max_speed();
    
    //go slower backwards
    max_speed = (local_velocity[1] > 0 ? 0.5 * max_speed : max_speed);

    //kill sideways velocity
    if(!this.has_effect(buffs.EFFECT_NO_GRIP)){
        this.wheels.forEach(function(wheel){wheel.kill_sideways_velocity();});
    }

    //SET STEER
    //need to calculate maximum allowed steer angle first
    var max_wheel_angle = this.max_steer_angle;
    //for speed < 100 it is increased, up to 40. This enables the car to make tighter turns at lower speeds
        if(speed<100){
            max_wheel_angle = max_wheel_angle+ (40-max_wheel_angle) * (1 - speed / 100);
        }      
   

    //TURN WHEELS
    var incr = (this.max_steer_angle / this.turn_msec) * msDuration
    var wheels = this.get_revolving_wheels();
    var angle;
    for( i = 0; i < wheels.length; i++) {
        wheel = wheels[i];
        if(steer == STEER_RIGHT) {
            this.cur_wheel_angle = Math.min(Math.max(this.cur_wheel_angle, 0) + incr, max_wheel_angle)
            wheel.set_relative_angle(this.cur_wheel_angle);
        } else if(steer == STEER_LEFT) {
            this.cur_wheel_angle = Math.max(Math.min(this.cur_wheel_angle, 0) - incr, -max_wheel_angle)
            wheel.set_relative_angle(this.cur_wheel_angle);
        } else {
            this.cur_wheel_angle = 0;
            wheel.reset_angle();
        }
    }

    //apply engine force
    var base_vect;
    if((acceleration == ACC_ACCELERATE) && (speed < max_speed)) base_vect = [0, -1];
    else if(acceleration == ACC_BRAKE){
        //braking, lotsa force
        if(this.get_local_velocity()[1] < 0) base_vect = [0, 1.2];
        //reversing, less force
        else base_vect = [0, 0.7];
    }
    else base_vect = [0, 0];
    var fvect = vectors.multiply(base_vect, this.get_power());

    this.get_powered_wheels().forEach(function(wheel){
       wheel.apply_force(fvect, [0, 0]);
    }, this);
    
    //if going very slow, stop - to prevend sliding
    if( (this.get_speed_KMH() < 4) && (acceleration == ACC_NONE)){
        this.set_speed(0);
    }

    //fire weapons
    if(this.front_weapon){
        this.front_weapon.update(msDuration);
        if(this.fire_front_weapon)this.front_weapon._fire();
    }

    if(this.rear_weapon){
        this.rear_weapon.update(msDuration);
        if(this.fire_rear_weapon)this.rear_weapon._fire();
    }
    
    if(this.util){
        this.util.update(msDuration);
        if(this.fire_util)this.util._fire();
    }

    //spawn smoke if health <40
    if(this.health <= 40){
        if(this.smoke_cd <= 0){
            this.world.spawn_animation('smoke', this.get_world_point([0, -1.5]));
            this.smoke_cd = 100;
        }else{
            this.smoke_cd -= msDuration;
        }
    }else this.smoke_cd = 0;
};

Car.prototype.initialize_shape = function(){
    // make the front of the car pointy, so it slides of walls
    var shape = new box2d.b2PolygonShape();
    var w=this.descr.width / 2;
    var h=this.descr.height / 2;
    shape.SetAsArray([vec(w,h),
                    vec(-w,h),
                    vec(-w, -h),
                    vec(0, -h-0.5),
                    vec(w, -h)]);
    return shape;
};

Car.prototype.get_buff = function(effect){
    for(var i = 0; i < this.buffs.length; i++){
        if(this.buffs[i].effect == effect){
            return this.buffs[i];
        }
    }
    return null;
};
    
Car.prototype.has_effect = function(effect){
    for(var i=0; i<this.buffs.length; i++){
        if(this.buffs[i].effect == effect){
            return true;
        }
    }
    return false;
};
    
Car.prototype.clear_buffs = function(){
    this.buffs.forEach(function(buff){
        this.world.destroy(buff);
    }, this);
};

exports.get_car_parameters=function(position, angle, carpars, alias, engine_sound){
  
    var retv = {
        'car_type' : carpars.type,
        'position' : position,
        'angle' : angle,
        'alias' : alias,
        'handling_upgrades' : carpars.handling_upgrades ? carpars.handling_upgrades : 0,
        'engine_sound' : engine_sound,
        'acc_upgrades' : carpars.acc_upgrades,
        'speed_upgrades' : carpars.speed_upgrades,
        'armor_upgrades' : carpars.armor_upgrades,
        'front_weapon' : carpars.front_weapon ? utils.copy(carpars.front_weapon, {}) : null,
        'util' : carpars.util ? utils.copy(carpars.util, {}) : null,
        'rear_weapon' : carpars.rear_weapon ? utils.copy(carpars.rear_weapon, {}) : null
    };

    return retv;
};
