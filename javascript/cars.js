var gamejs = require('gamejs');
var box2d = require('./box2d');
var utils = require('./utils');
var vectors = require('gamejs/utils/vectors');
var animation=require('./animation');

var STEER_NONE=exports.STEER_NONE=0;
var STEER_RIGHT=exports.STEER_RIGHT=1;
var STEER_LEFT=exports.STEER_LEFT=2;

var ACC_NONE=exports.ACC_NONE=0;
var ACC_ACCELERATE=exports.ACC_ACCELERATE=1;
var ACC_BRAKE=exports.ACC_BRAKE=2;



var Wheel = exports.Wheel = function(car, x, y, width, length, world, revolving, powered, filename){
    /*
    x, y - local coordinates of the wheel
    */
    this.x=x;
    this.y=y;
    this.position=[x, y];
    this.angle=0;
    this.car=car;
    this.length=length;
    this.width=width;
    this.revolving=revolving=revolving ? true : false;
    this.body=null;
    this.joint=null;
    this.k_velocity=null;
    this.world=world;
    this.alive=true;
    this.respawn_location=null;
    this.respawn_angle=0;
    this.powered=powered;
    this.filename=filename;

    var def=new box2d.b2BodyDef();
    def.position=this.car.body.GetWorldPoint(utils.listToVector(this.position));

    def.angle=this.car.body.GetAngle();
    this.body=this.world.CreateBody(def);
    this.body.SetMassFromShapes();
    this.body.SetUserData({'obj':this, 'type':'wheel'});
    this.type='wheel';
    var boxdef=new box2d.b2PolygonDef();
    boxdef.SetAsBox(this.width/2, this.length/2);
    boxdef.density=1;
    boxdef.isSensor=true;
    this.body.CreateShape(boxdef);
    this.body.SetMassFromShapes();
    this.linearDamping=0;

    if(revolving){
        var jointdef=new box2d.b2RevoluteJointDef();
        jointdef.Initialize(this.car.body, this.body, this.body.GetWorldCenter());
        jointdef.enableMotor=false;
        jointdef.maxMotorTorque=100;
    }else{
        var jointdef=new box2d.b2PrismaticJointDef();
        jointdef.Initialize(this.car.body, this.body, this.body.GetWorldCenter(), utils.listToVector([1, 0]));
        jointdef.enableLimit=true;
        jointdef.lowerTranslation=jointdef.upperTranslation=0;
    }
    this.joint=this.world.b2world.CreateJoint(jointdef);

    this.getLocalPosition=function(){
        return this.position;
    };

    this.resetAngle=function(){
        this.body.SetXForm(this.body.GetPosition(), this.car.body.GetAngle());
    };

    this.setAngle=function(angle){
        this.body.SetXForm(this.body.GetPosition(), this.car.body.GetAngle()+utils.radians(angle));
    };

    this.getWorldPosition=function(){
        return this.car.body.GetWorldPoint(utils.listToVector(this.position));
    };

    this.draw=function(renderer){
       renderer.drawCar(this.filename, this.car.body.GetWorldPoint(new box2d.b2Vec2(this.x, this.y)), utils.degrees(this.body.GetAngle()));
    };

    this.getLocalVelocity=function(){
        return this.car.body.GetLocalVector(this.car.body.GetLinearVelocityFromLocalPoint(utils.listToVector(this.position)));
    };

    this.getDirectionVector=function(){
        return utils.rotateVector( (this.getLocalVelocity().y>0) ? [0, 1]:[0, -1] , utils.degrees(this.body.GetAngle())) ;
    };

    this.getFrictionVector=function(){
        var want_vect=utils.rotateVector( (this.getLocalVelocity().y>0) ? [0, 1]:[0, -1] , utils.degrees(this.body.GetAngle()));
        return vectors.unit(vectors.substract(want_vect, velocity));
    };

    this.getSidewaysVector=function(){
        return utils.vectorToList(this.body.GetWorldVector(utils.listToVector([-1, 0])));
    };

    this.getKillVelocityVector=function(){
        var velocity=this.body.GetLinearVelocity();
        var sideways_axis=this.getDirectionVector();
        var dotprod=utils.vectorDotProduct(velocity, sideways_axis);

        return [sideways_axis[0]*dotprod, sideways_axis[1]*dotprod];
    };

    this.killSidewaysVelocity=function(){

        var kv=this.getKillVelocityVector();
        this.k_velocity=kv;
        this.body.SetLinearVelocity(utils.listToVector(kv));

    };

    this.die=function(){
        this.alive=false;
        this.body.SetLinearVelocity(new box2d.b2Vec2(0, 0));
        this.body.PutToSleep();
    };

    this.respawn=function(){
        this.alive=true;
        this.body.WakeUp();
    };

    this.teleport=function(position){
        //angle radians
        this.body.SetXForm(utils.listToVector(position),  this.body.GetAngle());
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
    weapon1           -first weapon
    weapon2           -second weapon
    health            -max health
    alias             -player alias

    */
    this.angle= pars.angle ? pars.angle: 0;
    this.world=pars.world;
    this.position = pars.position;
    this.width = pars.width;
    this.height = pars.height;
    this.filename=pars.filename;
    this.alias=pars.alias ? pars.alias : '';


    //STATE
    this.max_health=pars.health;
    //this.health=pars.health;
    this.health=pars.health;
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
    this.weapon1=pars.weapon1;
    this.weapon2=pars.weapon2;
    if(this.weapon1)this.weapon1.car=this;
    if(this.weapon2)this.weapon2.car=this;

    //ACTIONS
    this.fire_weapon1=false;
    this.fire_weapon2=false;
    this.accelerate=ACC_NONE;
    this.steer=STEER_NONE;

    //PHYSICAL
    this.max_steer_angle=pars.max_steer_angle;
    this.power=pars.power;
    this.max_speed=pars.max_speed;
    this.mod_speed=0;
    this.local_engine_pos=[0, -(pars.height/2)];

    //ANIM
    this.smoke_cd=0;


    var def=new box2d.b2BodyDef();
    def.position=utils.listToVector(this.position);
    def.angle=utils.radians(this.angle)+0.01;
    def.linearDamping=0.15;
    def.bullet=true;
    def.angularDamping=0.3;
    this.body=this.world.CreateBody(def);
    var shapedef=new box2d.b2PolygonDef();
    //shapedef.SetAsBox(this.width/2, this.height/2);
    var w=this.width/2;
    var h=this.height/2;
    shapedef.vertices=[new box2d.b2Vec2(w,h),
                       new box2d.b2Vec2(-w,h),
                       new box2d.b2Vec2(-w, -h),
                       new box2d.b2Vec2(0, -h-0.5),
                       new box2d.b2Vec2(w, -h)];
    shapedef.vertexCount=5;
    shapedef.density=1;
    shapedef.friction=0.3;
    shapedef.restitution=0.4;
    this.body.CreateShape(shapedef);
    this.body.SetMassFromShapes();
    this.type='car';
    this.body.SetUserData({'obj':this, 'type':'car'});
    this.wheels=[]
    var wheeldef, i;
    for(i=0;i<pars.wheels.length;i++){
        wheeldef=pars.wheels[i];
        this.wheels[this.wheels.length]=new Wheel(this, wheeldef.x, wheeldef.y, wheeldef.width, wheeldef.length, this.world, wheeldef.revolving, wheeldef.powered, wheeldef.filename);
    }






    this.crossFinishLine=function(){
        if(this.weapon1)this.weapon1.reload();
        if(this.weapon2)this.weapon2.reload();
    }

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
        for(i=0; i<this.world.objects['car'].length;i++){
            c=this.world.objects['car'][i];
            if(!(c===this)){
                if(this.lap>c.lap){
                    pos--;
                }else if(this.lap==c.lap && ((this.next_checkpoint_no>c.next_checkpoint_no) || (this.next_checkpoint_no==1 && c.next_checkpoint_no!=1))){
                    pos--;
                }else if((this.lap==c.lap)&&
                         (this.next_checkpoint_no==c.next_checkpoint_no) &&
                         (vectors.distance(utils.vectorToList(this.alive ? this.body.GetPosition() : this.respawn_location), this.world.checkpoints[this.next_checkpoint_no].center) <
                          vectors.distance(utils.vectorToList(c.alive ? c.body.GetPosition() : c.respawn_location), this.world.checkpoints[c.next_checkpoint_no].center)) ){
                    pos--;
                }
            }
        }
        return pos;
    };

    this.getPoweredWheels=function(){
        var retv=[];
        for(var i=0;i<this.wheels.length;i++){
            if(this.wheels[i].powered){
                retv[retv.length]=this.wheels[i];
            }
        }
        return retv;
    };

    this.getRevolvingWheels=function(){
        var retv=[];
        for(var i=0;i<this.wheels.length;i++){
            if(this.wheels[i].revolving){
                retv[retv.length]=this.wheels[i];
            }
        }
        return retv;
    };

    this.getDirectionVector=function(){
        return utils.rotateVector([0, -1], utils.degrees(this.front_left_wheel.body.GetAngle()));
    };

    this.getBackwardDirectionVector=function(){
        return utils.rotateVector([0, 1], utils.degrees(this.back_left_wheel.body.GetAngle()));
    };



    this.getWheels=function(){
        return this.wheels;
    };

    this.getState=function(){
        var state={'p':utils.vectorToList(this.body.GetPosition()),
                   'a':utils.degrees(this.body.GetAngle()),
                 //  'av':this.body.GetAngularVelocity(),
                   'lv':utils.vectorToList(this.body.GetLinearVelocity()),
                   'l':this.lap,
                   'nc':this.next_checkpoint_no,
                   'ac':this.active,
                   'h':this.health,
                   'al':this.alive,
                   'w':[],
                   'w1':this.weapon1? this.weapon1.getState() : 0,
                   'w2':this.weapon2? this.weapon2.getState() : 0};

        var i;
        for(i=0;i<this.wheels.length;i++){
            state.w[state.w.length]=utils.degrees(this.wheels[i].body.GetAngle());
        }
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
        this.body.SetXForm(utils.listToVector(state.p), utils.radians(state.a));
        this.body.SetLinearVelocity(utils.listToVector(state.lv));
      //  this.body.SetAngularVelocity(state.av);
        var wheel;
        for(var i=0;i<state.w.length;i++){
            wheel=this.wheels[i];
            wheel.teleport(this.body.GetWorldPoint(utils.listToVector(wheel.position)));
            wheel.body.SetXForm(wheel.body.GetPosition(), utils.radians(state.w[i]));
        }
        if(state.rl)this.respawn_location=state.rl;
        if(this.weapon1 && state.w1) this.weapon1.setState(state.w1);
        if(this.weapon2 && state.w2) this.weapon2.setState(state.w2);

    };

    this.getSpeedKMH=function(){
        var velocity=this.body.GetLinearVelocity();
        var len=utils.vectorLength(velocity);
        return (len/1000)*3600;
    };



    this.getAngle=function(){
        return utils.degrees(this.body.GetAngle());
    };

    this.getSpeed=function(){
        var speed_ms=this.body.GetLinearVelocity().Length();
        return (speed_ms/1000.0)*3600.0;
    };

    this.setSpeed=function(speed){
        var velocity=this.body.GetLinearVelocity();

        velocity=utils.normaliseVector(velocity);

        velocity={x:velocity[0]*((speed*1000.0)/3600.0),
                  y:velocity[1]*((speed*1000.0)/3600.0)};

        this.body.SetLinearVelocity(velocity);

    };


    this.draw=function(renderer){
        if(this.alive&&this.active){
            var wheels=this.getWheels();
            var i;
            for(i=0;i<wheels.length;i++){
                wheels[i].draw(renderer);
            }
            var bp=this.body.GetPosition()
            renderer.drawCar(this.filename, bp, this.getAngle());

            //only draw alias on multiplayer games
            if(this.alias && (this.world.mode==1)){
                renderer.drawText(this.alias, 'alias', renderer.getScreenPoint([bp.x-this.width, bp.y-this.height]));
            }
        }

    };

    this.teleport=function(position, angle){
        angle=angle ? utils.radians(angle) : this.body.GetAngle();
        this.body.SetXForm(utils.listToVector(position), angle);
        var wheel;
        for(var i=0; i<this.wheels.length;i++){
            wheel=this.wheels[i];
            wheel.teleport(this.body.GetWorldPoint(utils.listToVector(wheel.position)));
        }


    };

    this.die=function(){
        this.alive=false;
        this.deaths+=1;
        this.time_to_respawn=this.respawn_time;
        this.respawn_location=utils.vectorToList(this.body.GetPosition());
        this.world.event('create', {'type':'animation', 'obj_name':'explosion', 'pars':{'position':utils.vectorToList(this.body.GetPosition())}});
        this.respawn_angle=utils.degrees(this.body.GetAngle());
        this.teleport([0, 0]);

        this.body.SetLinearVelocity(new box2d.b2Vec2(0, 0));
        this.body.PutToSleep();

        var wheels=this.getWheels();
        for(var i=0;i<wheels.length;i++){
            wheels[i].die();
        }
    };

    this.respawn=function(){
        this.alive=true;


        var wheels=this.getWheels();
        for(var i=0;i<wheels.length;i++){
            wheels[i].respawn();
        }
        this.teleport(this.respawn_location, this.respawn_angle);
        this.body.WakeUp();
        this.health=this.max_health;

    };

    this.kill=function(car){
        this.kills+=1;
    };

    this.hit=function(damage, owner){
      // owner - car that hit this car
        this.hits[this.hits.length]=[damage, owner];
    };

    this.processHits=function(){
        var i;
        for(i=0;i<this.hits.length;i++){
            this.health-=this.hits[i][0];
            if(this.health<=0){
                this.die();
                if(this.hits[i][1])this.hits[i][1].kill(this);
                break;
            }
        };
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

        var speed=this.getSpeed();
       //this.checkTraction();


        var base_vect;
        if(acceleration==ACC_ACCELERATE) base_vect=[0, -1];
        else if(acceleration==ACC_BRAKE) base_vect=[0, 0.8];
        else base_vect=[0, 0];

        var vect_x=base_vect[0];
        var vect_y=base_vect[1];

        //for now, traction does not slip
        this.has_traction=true;
        var wheels=this.getWheels();
        var i, wheel;


        for(i=0;i<wheels.length;i++){
            wheels[i].killSidewaysVelocity();
        }


        //apply engine force to front wheels
        var fvect=[this.power*vect_x, this.power*vect_y];


        wheels=this.getPoweredWheels();
        for(i=0;i<wheels.length;i++){
           var position=wheels[i].body.GetWorldCenter();
           wheels[i].body.ApplyForce(wheels[i].body.GetWorldVector(utils.listToVector(fvect)), position );
        }


        //set steer
        var wheel_angle=this.max_steer_angle;
        var kmh=this.getSpeedKMH();
        if(kmh<100){
            wheel_angle=wheel_angle+ (40-wheel_angle)*(1-kmh/100);
        }

        if(steer==STEER_LEFT) wheel_angle= -1*wheel_angle;
        else if (steer==STEER_RIGHT) {}
        else wheel_angle=0;

        var wheels=this.getRevolvingWheels();
        for(i=0;i<wheels.length;i++){
            wheel=wheels[i];
            if(wheel_angle){
                wheel.setAngle(wheel_angle);
            }else{
                wheel.resetAngle();
            }
        }



        var local_velocity=this.body.GetLocalVector(this.body.GetLinearVelocity());
        //max speed is half when going backwards
        var max_speed=(local_velocity.y>0 ? 0.5*this.max_speed : this.max_speed)+this.mod_speed;

        //limit to max speed
        if(this.getSpeed()>max_speed){
               this.setSpeed(max_speed);
        }
        //if going very slow, stop - to prevend sliding

        else if( (this.getSpeed()<4) &&(acceleration==ACC_NONE)){
            this.setSpeed(0);
        }

        if(this.weapon1){
            this.weapon1.update(msDuration);
            if(this.fire_weapon1)this.weapon1.fire();
        }

        if(this.weapon2){
            this.weapon2.update(msDuration);
            if(this.fire_weapon2)this.weapon2.fire();
        }

        //spawn smoke if health <40
        if(this.health<=40){
            if(this.smoke_cd<=0){
                this.world.event('create', {'type':'animation',
                                            'obj_name':'smoke',
                                            'pars':{'position':utils.vectorToList(this.body.GetWorldPoint(new box2d.b2Vec2(0, -1.5)))}});
                this.smoke_cd=100;
            }else{
                this.smoke_cd-=msDuration;
            }
        }else this.smoke_cd=0;

    };

    return this;
};
