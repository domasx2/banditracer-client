var gamejs = require('gamejs');
var box2d = require('./box2d');
var utils = require('./utils');
var sounds = require('./sounds');
var buffs=require('./buffs');
var car_descriptions = require('./car_descriptions');
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
    /*
    x, y - local coordinates of the wheel
    */
    this.x=pars.x;
    this.y=pars.y;
    this.position=[pars.x, pars.y];
    this.angle=0;
    this.car=pars.car;
    this.length=pars.length;
    this.width=pars.width;
    this.revolving=revolving=pars.revolving;
    this.body=null;
    this.joint=null;
    this.k_velocity=null;
    this.world=this.car.world;
    this.alive=true;
    this.respawn_location=null;
    this.respawn_angle=0;
    this.powered=pars.powered;
    this.filename=pars.filename;
    this.type='wheel';
    this.prev_position=null;
    
    //initialize body
    var def=new box2d.b2BodyDef();
    def.type = box2d.b2Body.b2_dynamicBody;
    def.position=this.car.body.GetWorldPoint(vec([this.position[0], this.position[1]]));
    def.angle=this.car.body.GetAngle();
    this.body=this.world.CreateBody(def);
    this.body.SetUserData(this);
    
    //initialize shape
    var fixdef= new box2d.b2FixtureDef;
    fixdef.density=1;
    fixdef.isSensor=true; 
    fixdef.shape=new box2d.b2PolygonShape();
    fixdef.shape.SetAsBox(this.width/2, this.length/2);
    this.body.CreateFixture(fixdef);
    //create joint to connect wheel to body
    if(this.revolving){
        var jointdef=new box2d.b2RevoluteJointDef();
        jointdef.Initialize(this.car.body, this.body, this.body.GetWorldCenter());
        jointdef.enableMotor=false;
        jointdef.referenceAngle=0;
    }else{
        var jointdef=new box2d.b2PrismaticJointDef();
        jointdef.Initialize(this.car.body, this.body, this.body.GetWorldCenter(), vec([1, 0]));
        jointdef.enableLimit=true;
        jointdef.lowerTranslation=jointdef.upperTranslation=jointdef.referenceAngle=0;
    }
    this.world.b2world.CreateJoint(jointdef);
    
    this.getLocalPosition=function(){
        return this.position;
    };

    this.resetAngle=function(){
        this.body.SetAngle(this.car.body.GetAngle());
    };

    this.setAngle=function(angle){
        this.body.SetAngle(this.car.body.GetAngle()+radians(angle));
    };

    this.getWorldPosition=function(){
        return arr(this.car.body.GetWorldPoint(vec(this.position)));
    };

    this.draw=function(renderer){
       renderer.drawCar(this.filename, arr(this.car.body.GetWorldPoint(vec([this.x, this.y]))), degrees(this.body.GetAngle()));
       
       //if car has no grip, draw skidmarks
      // if(this.car.hasEffect(buffs.EFFECT_NO_GRIP)&&this.prev_position){
        if(gamejs.utils.vectors.angle(arr(this.body.GetLinearVelocity()), arr(this.body.GetWorldVector(vec([0, -1]))))>gamejs.utils.math.radians(20)){
            var ps=this.car.world.phys_scale;
            var pp=this.prev_position;
            var p=arr(this.body.GetPosition());
            var a1=[-this.width/2, 0];
            var a2=[this.width/2, 0];
            var angle=this.body.GetAngle();
            a1=gamejs.utils.vectors.rotate(a1, angle);
            a2=gamejs.utils.vectors.rotate(a2, angle);
            var points=[[(a1[0]+pp[0])*ps, (a1[1]+pp[1])*ps],
                        [(a1[0]+p[0])*ps, (a1[1]+p[1])*ps],
                        [(a2[0]+p[0])*ps, (a2[1]+p[1])*ps],
                        [(a2[0]+pp[0])*ps, (a2[1]+pp[1])*ps]];
            console.log(points);
            gamejs.draw.polygon(renderer.background, '#282828', points)
      };
       
       this.prev_position=arr(this.body.GetPosition());
    };

    this.getLocalVelocity=function(){
        return arr(this.car.body.GetLocalVector(this.car.body.GetLinearVelocityFromLocalPoint(vec(this.position))));
    };

    this.getDirectionVector=function(){
        return vectors.rotate( (this.getLocalVelocity()[1]>0) ? [0, 1]:[0, -1] , this.body.GetAngle()) ;
    };

    this.getSidewaysVector=function(){
        return arr(this.body.GetWorldVector(vec([-1, 0])));
    };

    this.getKillVelocityVector=function(){
        var velocity=arr(this.body.GetLinearVelocity());
        var sideways_axis=this.getDirectionVector();
        var dotprod=vectors.dot(velocity, sideways_axis);
        return vectors.multiply(sideways_axis, dotprod);
    };

    this.killSidewaysVelocity=function(){
        var kv=this.getKillVelocityVector();
        this.k_velocity=kv;
        this.body.SetLinearVelocity(vec(kv));
    };

    this.die=function(){
        this.alive=false;
        this.body.SetLinearVelocity(vec(0, 0));
    };

    this.respawn=function(){
        this.alive=true;
    };

    this.teleport=function(position){
        //angle radians
        this.body.SetPosition(vec(position));
    };
    
    this.getAngle=function(){
        return degrees(this.body.GetAngle());
    };
    
    this.getLocalAngle=function(){   
        var retv= math.normaliseDegrees(math.degrees(this.body.GetAngle()-this.car.body.GetAngle()));
        if(retv>180)retv-=360;
        return retv;
    };

    return this;
}

var Car = exports.Car = function(pars){
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
    this.angle= pars.angle ? pars.angle: 0;
    this.world=pars.world;
    this.position = pars.position;
    this.width = pars.width;
    this.height = pars.height;
    this.filename=pars.filename;
    this.alias=pars.alias ? pars.alias : '';
    this.type='car';
    this.car_type=pars.type;
    this.descr=car_descriptions[this.car_type];
    this.next_buff_id=1;
    this.buffs=[];

    //STATE
    this.max_health=pars.health+pars.armor_upgrades * this.descr.armor_upgrade;
    //this.health=pars.health;
    this.health=this.max_health;
    this.alive=true;
    this.active=true;
    this.next_checkpoint_no=1;
    this.lap=0;
    this.time_to_respawn=0;
    this.respawn_position=null;
    this.respawn_angle=0;
    this.respawn_time=2000;
    this.kills=0;
    this.deaths=0;
    this.hits=[];

    //WEAPONS
    this.front_weapon=pars.front_weapon;
    this.rear_weapon=pars.rear_weapon;
    this.util=pars.util;
    if(this.front_weapon)this.front_weapon.car=this;
    if(this.rear_weapon)this.rear_weapon.car=this;
    if(this.util)this.util.car=this;

    //ACTIONS
    this.fire_front_weapon=false;
    this.fire_rear_weapon=false;
    this.fire_util=false;
    this.accelerate=ACC_NONE;
    this.steer=STEER_NONE;

    //PHYSICAL
    this.max_steer_angle=pars.max_steer_angle;
    this.power=pars.power + pars.acc_upgrades * this.descr.power_upgrade;
    this.max_speed=pars.max_speed + pars.speed_upgrades * this.descr.speed_upgrade;
    this.turn_msec=pars.turn_msec ? pars.turn_msec : 200;//in how many miliseconds wheel angle is maxed out when turning
    this.mod_speed=0;
    this.local_engine_pos=[0, -(pars.height/2)];
    this.cur_wheel_angle=0;
    

    //ANIM
    this.smoke_cd=0;
    
    //initialize body
    var def=new box2d.b2BodyDef();
    def.type = box2d.b2Body.b2_dynamicBody;
    def.position=vec(pars.position[0], pars.position[1]);
    def.angle=radians(pars.angle+0.00001); 
    def.linearDamping=0.15;  //gradually reduces velocity, makes the car reduce speed slowly if neither accelerator nor brake is pressed
   // def.bullet=true; //dedicates more time to collision detection - car travelling at high speeds at low framerates otherwise might teleport through obstacles.
    def.angularDamping=0.3;
    this.body=this.world.CreateBody(def);
    this.body.SetUserData(this);
    
    //initialize shape
    var fixdef= new box2d.b2FixtureDef();
    fixdef.density = 1.0;
    fixdef.friction = 0.3; //friction when rubbing agaisnt other shapes
    fixdef.restitution = 0.4;  //amount of force feedback when hitting something. >0 makes the car bounce off, it's fun!
    fixdef.shape=new box2d.b2PolygonShape;
   // fixdef.shape.SetAsBox(pars.width/2, pars.length/2);
    var w=this.width/2;
    var h=this.height/2;
    fixdef.shape.SetAsArray([vec(w,h),
                            vec(-w,h),
                            vec(-w, -h),
                            vec(0, -h-0.5),
                            vec(w, -h)]);
    this.body.CreateFixture(fixdef);
    
    //initialize wheels
    this.wheels=[]
    var wheeldef, i;
    pars.wheels.forEach(function(wheeldef){
        wheeldef.car=this;
        this.wheels.push(new Wheel(wheeldef));
    }, this);
    
    this.impact=function(obj, cpoint, direction){
        if(obj.type=='car'){
            this.world.playSound('thud.wav', arr(this.body.GetPosition()));
        }
    };
    
    this.getLocalVelocity=function(){
        return arr(this.body.GetLocalVector(this.body.GetLinearVelocityFromLocalPoint(vec([0, 0]))));
    };

    this.crossFinishLine=function(){
        if(this.front_weapon)this.front_weapon.reload();
        if(this.rear_weapon)this.rear_weapon.reload();
        if(this.util)this.util.reload();
    };
    
    this.getPower=function(){
        var power=this.power;
        this.buffs.forEach(function(buff){
            if(buff.effect==buffs.EFFECT_ENGINE){          
                power+=buff.value;
            }
        }, this);
        
        if(this.hasEffect(buffs.EFFECT_NO_GRIP)){
            power=power*0.3;
        }
        
        return parseInt(power);
    };
    
    this.getMaxSpeed=function(){
        var max_speed=this.max_speed;
        this.buffs.forEach(function(buff){
            if(buff.effect==buffs.EFFECT_ENGINE){
                max_speed+=buff.value;
            }
        }, this);
        return parseInt(max_speed);
    };

    this.updateCheckpoint=function(){
          var cp=this.world.checkpoints[this.next_checkpoint_no];
          var pos=this.body.GetPosition();
          if(pos.x>=cp.pt1[0] && pos.x<=cp.pt2[0] && pos.y>=cp.pt1[1] && pos.y<=cp.pt2[1]){
              if(this.next_checkpoint_no==1){
                 this.lap++;
                 this.crossFinishLine();
              }

              if(this.next_checkpoint_no==this.world.max_checkpoint){
                 this.next_checkpoint_no=1;
              }
              else{
                 this.next_checkpoint_no++;
              }

          }
    };

    this.getRacePosition=function(){
        var pos=this.world.objects['car'].length;
        var i, c;
        //check each car in the race
        for(i=0; i<this.world.objects['car'].length;i++){
            c=this.world.objects['car'][i];
            if(!(c===this)){
                //if this cars lap is greater, it is ahead
                if(this.lap>c.lap){
                    pos--;
                //if this cars lap is equal, but checkpoint is greater, it is ahead
                }else if(this.lap==c.lap && ((this.next_checkpoint_no>c.next_checkpoint_no) || (this.next_checkpoint_no==1 && c.next_checkpoint_no!=1))){
                    pos--;
                //if this cars lap and checkpoint are equal, but distance to checkpoint is less, it is ahead
                }else if((this.lap==c.lap)&&
                         (this.next_checkpoint_no==c.next_checkpoint_no) &&
                         (vectors.distance(arr(this.alive ? this.body.GetPosition() : this.respawn_location), this.world.checkpoints[this.next_checkpoint_no].center) <
                          vectors.distance(arr(c.alive ? c.body.GetPosition() : c.respawn_location), this.world.checkpoints[c.next_checkpoint_no].center)) ){
                    pos--;
                }
            }
        }
        return pos;
    };

    this.getPoweredWheels=function(){
        var retv=[];
        this.wheels.forEach(function(wheel){
            if(wheel.powered) retv.push(wheel);
        });        
        return retv;
    };

    this.getRevolvingWheels=function(){
        var retv=[];
        this.wheels.forEach(function(wheel){
            if(wheel.revolving)retv.push(wheel);
        });
        return retv;
    };

    this.getDirectionVector=function(){
        return vectors.rotate([0, -1], this.front_left_wheel.body.GetAngle());
    };

    this.getBackwardDirectionVector=function(){
        return vectors.rotate([0, 1], this.back_left_wheel.body.GetAngle());
    };

    this.getState=function(){
        var state={'p':arr(this.body.GetPosition()),
                   'a':degrees(this.body.GetAngle()),
                 //  'av':this.body.GetAngularVelocity(),
                   'lv':arr(this.body.GetLinearVelocity()),
                   'l':this.lap,
                   'nc':this.next_checkpoint_no,
                   'ac':this.active,
                   'h':this.health,
                   'al':this.alive,
                   'w':[],
                   'wf':this.front_weapon ? this.front_weapon.getState() : 0,
                   'wr':this.rear_weapon? this.rear_weapon.getState() : 0,
                   'wu':this.util? this.util.getState():0};

        var i;
        this.wheels.forEach(function(wheel){
            state.w.push(degrees(wheel.body.GetAngle()));
        });
        if(!this.alive){
            state.rl=this.respawn_location;
        }
        return state;
    };

    this.interpolate=function(state1, state2, q){
        var w=[];
        for(var i=0;i<state1.w.length;i++){
            w[w.length]=utils.interpolateInts(state1.w[i], state2.w[i], q);
        }
        var state= {'p':utils.interpolatePoints(state1.p, state2.p, q),
                    'a':utils.interpolateInts(state1.a, state2.a, q),
                    'w':w};
        for(var k in state1){
            if(!state.hasOwnProperty(k))state[k]=state1[k];
        }
        return state;
    };

    this.setState=function(state){
        this.health=state.h;
        this.alive=state.al;
        this.lap=state.l;
        this.active=state.ac;
        this.next_checkpoint_no=state.nc;
        this.body.SetPositionAndAngle(vec(state.p), radians(state.a));
        this.body.SetLinearVelocity(vec(state.lv));
        var wheel;
        for(var i=0;i<this.wheels.length;i++){
            wheel=this.wheels[i];
            wheel.teleport(arr(this.body.GetWorldPoint(vec(wheel.position))));
            wheel.body.SetPositionAndAngle(wheel.body.GetPosition(), radians(state.w[i]));
        }
        if(state.rl)this.respawn_location=state.rl;
        if(this.front_weapon && state.wf) this.front_weapon.setState(state.wf);
        if(this.rear_weapon && state.wr) this.rear_weapon.setState(state.wr);
        if(this.util && state.wu) this.util.setState(wu);
    };
    
    this.hasEffect=function(effect){
        for(var i=0;i<this.buffs.length;i++){
            if(this.buffs[i].effect==effect){
                return true;
            }
        }
        return false;
    };
    
    this.clearBuffs=function(){
        this.buffs.forEach(function(buff){
            this.world.destroyObj(buff.id);
        }, this);
    };
    
    this.getSpeedKMH=function(){
        var velocity=arr(this.body.GetLinearVelocity());
        var len=vectors.len(velocity);
        return (len/1000)*3600;
    };

    this.getAngle=function(){
        return degrees(this.body.GetAngle());
    };
    
    this.setSpeed=function(speed){
        var velocity=arr(this.body.GetLinearVelocity());
        velocity=vec(vectors.multiply(vectors.unit(velocity), ((speed*1000.0)/3600.0)));
        this.body.SetLinearVelocity(velocity);
    };

    this.draw=function(renderer){
        if(this.alive&&this.active){
            this.wheels.forEach(function(wheel){
                wheel.draw(renderer);
            });
            var bp=arr(this.body.GetPosition())
            renderer.drawCar(this.filename, bp, this.getAngle());

            //only draw alias on multiplayer games
            if(this.alias && (this.world.mode==1)){
                renderer.drawText(this.alias, 'alias', renderer.getScreenPoint([bp[0]-this.width, bp[1]-this.height]));
            }
        }
    };

    this.teleport=function(position, angle){
        angle=angle ? radians(angle) : this.body.GetAngle();
        this.body.SetPositionAndAngle(vec(position), angle);
        this.wheels.forEach(function(wheel){
            wheel.teleport(arr(this.body.GetWorldPoint(vec(wheel.position))));
        }, this);
    };

    this.die=function(){
        this.alive=false;
        this.deaths+=1;
        this.time_to_respawn=this.respawn_time;
        this.respawn_location=arr(this.body.GetPosition());
        this.world.spawnAnimation('explosion', arr(this.body.GetPosition()));
        this.world.playSound('explosion.wav', arr(this.body.GetPosition()));
        this.respawn_angle=degrees(this.body.GetAngle());
        this.teleport([0, 0]);
        this.body.SetLinearVelocity(vec(0, 0));
        this.wheels.forEach(function(wheel){wheel.die();});
        this.clearBuffs();
    };

    this.respawn=function(){
        this.alive=true;
        this.wheels.forEach(function(wheel){wheel.respawn();});
        this.teleport(this.respawn_location, this.respawn_angle);
        this.health=this.max_health;

    };

    this.kill=function(car){
        this.kills+=1;
    };

    this.hit=function(damage, owner){
      // owner - car that hit this car
        this.hits.push({'damage':damage, 'owner':owner});
    };

    this.processHits=function(){
        this.hits.forEach(function(hit){
            if(this.alive){
                this.health=Math.min(this.health-hit.damage, this.max_health);
                if(this.health<=0){
                    this.die();
                    if(hit.owner)hit.owner.kill(this);
                }
            }
        }, this);
        this.hits=[];
    };

    this.update=function(msDuration){
        if(this.active){
            if(this.alive){
                this.processHits();
                if(this.alive) this.updateAlive(msDuration);
            }
            else{
                this.time_to_respawn-=msDuration;
                if(this.time_to_respawn<=0){
                    this.respawn();
                }
            }
        }
    };

    this.updateAlive=function(msDuration){
        this.updateCheckpoint();
        var steer=this.steer;
        var acceleration=this.accelerate;
        var speed=this.getSpeedKMH();
        var local_velocity=arr(this.body.GetLocalVector(this.body.GetLinearVelocity()));
        var max_speed=(local_velocity[1]>0 ? 0.5*this.max_speed : this.max_speed)+this.mod_speed;

        //kill sideways velocity
        if(!this.hasEffect(buffs.EFFECT_NO_GRIP)){
            this.wheels.forEach(function(wheel){wheel.killSidewaysVelocity();});
        }

        //SET STEER
        //need to calculate maximum allowed steer angle first
        var max_wheel_angle=this.max_steer_angle;
        //for speed < 100 it is increased, up to 40. This enables the car to make tighter turns at lower speeds
        if(speed<100){
            max_wheel_angle=max_wheel_angle+ (40-max_wheel_angle)*(1-speed/100);
        }      
   
        //TURN WHEELS
        var incr=(this.max_steer_angle/this.turn_msec) * msDuration
        var wheels=this.getRevolvingWheels();
        var angle;
        for(i=0;i<wheels.length;i++){
            wheel=wheels[i];
            if(steer==STEER_RIGHT){
                this.cur_wheel_angle=Math.min(Math.max(this.cur_wheel_angle, 0)+incr, max_wheel_angle)
                wheel.setAngle(this.cur_wheel_angle);
            }else if(steer==STEER_LEFT){
                this.cur_wheel_angle=Math.max(Math.min(this.cur_wheel_angle, 0)-incr, -max_wheel_angle)
                wheel.setAngle(this.cur_wheel_angle);
            }else{
                this.cur_wheel_angle=0;
                wheel.resetAngle();
            }        
        }
        
        //apply engine force
        var base_vect;
        if((acceleration==ACC_ACCELERATE) && (speed < this.getMaxSpeed())) base_vect=[0, -1];
        else if(acceleration==ACC_BRAKE){
            //braking, lotsa force
            if(this.getLocalVelocity()[1]<0) base_vect=[0, 1.2];
            //reversing, less force
            else base_vect=[0, 0.7];
        }
        else base_vect=[0, 0];
        var fvect=vectors.multiply(base_vect, this.getPower());
        this.getPoweredWheels().forEach(function(wheel){
           var position=wheel.body.GetWorldCenter();
           wheel.body.ApplyForce(wheel.body.GetWorldVector(vec(fvect)), position);
        });
        
        //if going very slow, stop - to prevend sliding
        if( (this.getSpeedKMH()<4) &&(acceleration==ACC_NONE)){
            this.setSpeed(0);
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
        if(this.health<=40){
            if(this.smoke_cd<=0){
                this.world.spawnAnimation('smoke', arr(this.body.GetWorldPoint(vec(0, -1.5))));
                this.smoke_cd=100;
            }else{
                this.smoke_cd-=msDuration;
            }
        }else this.smoke_cd=0;
    };

    return this;
};

exports.carEventFromDescription=function(position, angle, carpars, alias, engine_sound){
    var retv={'type':'car',
            'obj_name':carpars.type,
            'pars':{'position': position,
                    'angle':angle,
                  'alias':alias,
                  'handling_upgrades':carpars.handling_upgrades? carpars.handling_upgrades: 0,
                  'engine_sound':engine_sound,
                  'acc_upgrades':carpars.acc_upgrades,
                  'speed_upgrades':carpars.speed_upgrades,
                  'armor_upgrades':carpars.armor_upgrades,
                  'front_weapon':carpars.front_weapon,
                  'util':carpars.util,
                  'rear_weapon':carpars.rear_weapon}
    };
    return retv;
};
