var gamejs=require('gamejs');
var vectors=gamejs.utils.vectors;
var utils=require('./utils');
var combatracer=require('./combatracer');
var vec=utils.vec;
var arr=utils.arr;

var vectors = gamejs.utils.vectors;
var math = gamejs.utils.math;
radians=math.radians;
degrees=math.degrees;

var STEER_NONE=exports.STEER_NONE=0;
var STEER_RIGHT=exports.STEER_RIGHT=1;
var STEER_LEFT=exports.STEER_LEFT=2;

var ACC_NONE=exports.ACC_NONE=0;
var ACC_ACCELERATE=exports.ACC_ACCELERATE=1;
var ACC_BRAKE=exports.ACC_BRAKE=2;

var DIFFICULTY={1:{'FIRE_CHANCE':0.20,
                   'MAX_SPEED_BUFF':0,
                   'MAX_SPEED_DEBUFF':30},
             	2:{'FIRE_CHANCE':0.5,
                   'MAX_SPEED_BUFF':10,
                   'MAX_SPEED_DEBUFF':25},
                3:{'FIRE_CHANCE':0.6,
                   'MAX_SPEED_BUFF':20,
                   'MAX_SPEED_DEBUFF':10},
                4:{'FIRE_CHANCE':0.6,
                   'MAX_SPEED_BUFF':20,
                   'MAX_SPEED_DEBUFF':10}}

exports.AIController=function(car, world, scene){
    car.max_steer_angle = car.max_steer_angle*1.1;
    car.turn_msec=50;
    this.difficulty=DIFFICULTY[combatracer.game.player.singleplayer.difficulty];
    this.scene = scene;
    this.car = car;
    this.world = world;
    this.cur_wp = 1;
    this.ceasfire = false;
    this.ceasfire_cur_cooldown = 0;
    this.ceasfire_cooldown = 1000;
    
    this.stationary=0; //how many seconds is this car stationary?
    
    this.update=function(keys_down, ms){
        if(!this.car.alive)return;
         this.car.accelerate=ACC_ACCELERATE;
        var wp = this.world.ai_waypoints[this.cur_wp];
        var nwp = this.world.ai_waypoints[this.cur_wp < this.world.max_waypoint ? this.cur_wp + 1 : 1];

        var speed=this.car.get_speed_KMH();

        //cheats
        var player_pos = this.scene.player_car.get_race_position();
        var mypos = this.car.get_race_position();

        //if player is ahead, gradually increase speed to up to extra 10 km/h
        if(player_pos < mypos){
            if(car.mod_speed < this.difficulty.MAX_SPEED_BUFF){
                car.mod_speed += 5*(ms/1000);
            }
        }else if(player_pos > mypos){
            //if car is ahead, gradually decrease speed down to -25 km/h
            if(car.mod_speed > -this.difficulty.MAX_SPEED_DEBUFF){
                car.mod_speed -= 5 * (ms / 1000);
            }
        }

        //if car speed is below 6 km/h for 3 seconds, most likely it is stuck. teleport it to next waypoint
        if(speed < 6){
            if(this.car.alive){
                this.stationary += ms;
                if(this.stationary > 3000){
                    this.car.teleport([wp.x, wp.y]);
                    this.stationary=0;
                }
            }else {this.stationary=0;}
        }
        else this.stationary=0;

        var carpos = this.car.get_position();
        var lp = this.car.get_local_point([wp.x, wp.y]);
        var len=vectors.distance(carpos, [wp.x, wp.y]);
        var len2=vectors.distance(carpos, [nwp.x, nwp.y]);

        /*switch to next waypont if :
          1)closer than 5 meters to it
          2)it is behind the car, but closer than 35 meters
        */
        var angle = gamejs.utils.math.normaliseDegrees(degrees(vectors.angle([0, -1], lp)));

        if(len < 10 || (lp[1] > 0 && len < 35)){
            if(this.cur_wp < this.world.max_waypoint) this.cur_wp++;
            else this.cur_wp = 1;
            wp =this.world.ai_waypoints[this.cur_wp];
        }
        if(angle > 10){
            if(lp[0] > 0)this.car.steer=STEER_RIGHT;
            else this.car.steer = STEER_LEFT;
        } else this.car.steer = STEER_NONE;

        //is this bot shooting?
        if(this.ceasfire_cur_cooldown <= 0){
            this.ceasfire = Math.random() >this.difficulty.FIRE_CHANCE ? true : false;
            this.ceasfire_cur_cooldown = this.ceasfire_cooldown;
        }else{
            this.ceasfire_cur_cooldown-= ms;
        }
        
        //fire weapons if needed        
        (['front_weapon', 'util', 'rear_weapon']).forEach(function(wtype){
            if(this.car[wtype]) this.car['fire_'+wtype] = this.ceasfire ? false : this.car[wtype].AI();
        }, this);
    }

    return this;
}

exports.MultiplayerController=function(){
    this.bindings={accelerate:gamejs.event.K_UP, //up
                   brake:gamejs.event.K_DOWN,      //down
                   steer_left:gamejs.event.K_LEFT, //left
                   steer_right:gamejs.event.K_RIGHT, //right
                   fire_front_weapon:gamejs.event.K_x, //fire front weapon
                   fire_rear_weapon:gamejs.event.K_v,
                   fire_util:gamejs.event.K_c}; //fire rear weapon

    this.actions={'accelerate':ACC_NONE,
                  'steer':STEER_NONE,
                  'fire_front_weapon':false,
                  'fire_rear_weapon':false,
                  'fire_util':false};


    this.update=function(keys_down, ms){
        var changed=false;

        var accelerate, steer, fire_front_weapon, fire_rear_weapon, fire_util;

        if(keys_down[this.bindings.accelerate]){
            accelerate=ACC_ACCELERATE;
        }else if(keys_down[this.bindings.brake]){
            accelerate=ACC_BRAKE;
        }else{
            accelerate=ACC_NONE;
        }

        if(keys_down[this.bindings.steer_right]){
            steer=STEER_RIGHT;
        }else if(keys_down[this.bindings.steer_left]){
            steer=STEER_LEFT;
        }else{
            steer=STEER_NONE;
        }

        if(keys_down[this.bindings.fire_front_weapon]) fire_front_weapon=true;
        else fire_front_weapon=false;

        if(keys_down[this.bindings.fire_rear_weapon]) fire_rear_weapon=true;
        else fire_rear_weapon=false;
        
        if(keys_down[this.bindings.util]) fire_util=true;
        else fire_util=false;

        if(!(accelerate===this.actions.accelerate)){
            this.actions.accelerate=accelerate;
            changed=true;
        }
        if(!(steer===this.actions.steer)){
            this.actions.steer=steer;
            changed=true;
        }
        if(!(fire_front_weapon===this.actions.fire_front_weapon)){
            this.actions.fire_front_weapon=fire_front_weapon;
            changed=true;
        }
        if(!(fire_rear_weapon===this.actions.fire_rear_weapon)){
            this.actions.fire_rear_weapon=fire_rear_weapon;
            changed=true;
        }
        if(!(fire_util===this.actions.fire_util)){
            this.actions.fire_util=fire_util;
            changed=true;
        }
        return changed;

    };

    return this;

};

exports.PlayerCarController=function(car){
    this.car=car;
    this.bindings={accelerate:gamejs.event.K_UP, //up
                   brake:gamejs.event.K_DOWN,      //down
                   steer_left:gamejs.event.K_LEFT, //left
                   steer_right:gamejs.event.K_RIGHT, //right
                   fire_front_weapon:gamejs.event.K_x, //fire front weapon
                   fire_rear_weapon:gamejs.event.K_v,
                   fire_util:gamejs.event.K_c}; //fire rear weapon

    this.update=function(keys_down, ms){
        if(!this.car.alive)return;
        if(keys_down[this.bindings.accelerate]){
            this.car.accelerate=ACC_ACCELERATE;
        }else if(keys_down[this.bindings.brake]){
            this.car.accelerate=ACC_BRAKE;
        }else{
            this.car.accelerate=ACC_NONE;
        }

        if(keys_down[this.bindings.steer_right]){
            this.car.steer=STEER_RIGHT;
        }else if(keys_down[this.bindings.steer_left]){
            this.car.steer=STEER_LEFT;
        }else{
            this.car.steer=STEER_NONE;
        }

        if(keys_down[this.bindings.fire_front_weapon]) this.car.fire_front_weapon=true;
        else this.car.fire_front_weapon=false;

        if(keys_down[this.bindings.fire_rear_weapon]) this.car.fire_rear_weapon=true;
        else this.car.fire_rear_weapon=false;
        
        if(keys_down[this.bindings.fire_util]) this.car.fire_util=true;
        else this.car.fire_util=false;

    };

    return this;
};
