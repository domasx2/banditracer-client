var gamejs=require('gamejs');
var vectors=require('gamejs/utils/vectors');
var utils=require('./utils');

var STEER_NONE=exports.STEER_NONE=0;
var STEER_RIGHT=exports.STEER_RIGHT=1;
var STEER_LEFT=exports.STEER_LEFT=2;

var ACC_NONE=exports.ACC_NONE=0;
var ACC_ACCELERATE=exports.ACC_ACCELERATE=1;
var ACC_BRAKE=exports.ACC_BRAKE=2;


exports.AIController=function(car, world, scene){
    this.scene=scene;
    this.car=car;
    this.world=world;
    this.cur_wp=1;
    this.stationary=0; //how many seconds is this car stationary?

    this.update=function(keys_down, ms){
        if(!this.car.alive)return;
         this.car.accelerate=ACC_ACCELERATE;
        var wp=this.world.ai_waypoints[this.cur_wp];
        var nwp=this.world.ai_waypoints[this.cur_wp<this.world.max_waypoint ? this.cur_wp+1 : 1];

        var speed=this.car.getSpeedKMH();

        //cheats
        var player_pos=this.scene.player_car.getRacePosition();
        var mypos=this.car.getRacePosition();

        //if player is ahead, gradually increase speed to up to extra 20 km/h
        if(player_pos<mypos){
            if(car.mod_speed<30){
                car.mod_speed+=5*(ms/1000);
            }
        }else if(player_pos>mypos){
            //if car is ahead, gradually decrease speed down to -10 km/h
            if(car.mod_speed > -10){
                car.mod_speed-=5*(ms/1000);
            }
        }

        //if car speed is below 6 km/h for 3 seconds, most likely it is stuck. teleport it to next waypoint
        if(speed<6){
            if(this.car.alive){
                this.stationary+=ms;
                if(this.stationary>3000){
                    this.car.teleport([wp.x, wp.y]);
                    this.stationary=0;
                }
            }else {this.stationary=0;}

        }
        else this.stationary=0;



        var carpos=utils.vectorToList(this.car.body.GetPosition());
        var lp=this.car.body.GetLocalPoint({'x':wp.x, 'y':wp.y});
        var len=vectors.distance(carpos, [wp.x, wp.y]);
        var len2=vectors.distance(carpos, [nwp.x, nwp.y]);




        /*switch to next waypont if :
          1)closer than 5 meters to it
          2)it is behind the car, but closer than 35 meters
        */
        var angle=utils.angleBetweenVectors([0, -1], lp);
        if(len<5 || (lp.y>0 && len <35)){
            if(this.cur_wp<this.world.max_waypoint)this.cur_wp++;
            else this.cur_wp=1;
            wp=this.world.ai_waypoints[this.cur_wp];
        }
        if(angle>10){
            if(lp.x>0)this.car.steer=STEER_RIGHT;
            else this.car.steer=STEER_LEFT;
        }else this.car.steer=STEER_NONE;


        //try and fire machinegun if something is in front
        if(this.car.weapon1 && ( this.car.weapon1.type=='machinegun' || this.car.weapon1.type=='missilelauncher')){
            this.car.fire_weapon1=false;
            var i, c;
            for(i=0;i<this.world.objects['car'].length;i++){
                c=this.world.objects['car'][i];
                if(c!=this.car){
                    len=vectors.distance(utils.vectorToList(this.car.body.GetPosition()), utils.vectorToList(c.body.GetPosition()));
                    angle=utils.angleBetweenVectors([0, -1], this.car.body.GetLocalPoint(c.body.GetPosition()));
                    if(len<50 && angle<15){
                        this.car.fire_weapon1=true;
                        break;
                    }

                }
            }
        }

    }

    return this;
}

exports.MultiplayerController=function(){
    this.bindings={accelerate:38, //up
                   brake:40,      //down
                   steer_left:37, //left
                   steer_right:39, //right
                   fire_weapon1:gamejs.event.K_x, //fire weapon 1
                   fire_weapon2:gamejs.event.K_c}; //fire weapkn 2

    this.actions={'accelerate':ACC_NONE,
                  'steer':STEER_NONE,
                  'fire_weapon1':false,
                  'fire_weapon2':false};


    this.update=function(keys_down, ms){
        var changed=false;

        var accelerate, steer, fire_weapon1, fire_weapon2;

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

        if(keys_down[this.bindings.fire_weapon1]) fire_weapon1=true;
        else fire_weapon1=false;

        if(keys_down[this.bindings.fire_weapon2]) fire_weapon2=true;
        else fire_weapon2=false;

        if(!(accelerate===this.actions.accelerate)){
            this.actions.accelerate=accelerate;
            changed=true;
        }
        if(!(steer===this.actions.steer)){
            this.actions.steer=steer;
            changed=true;
        }
        if(!(fire_weapon1===this.actions.fire_weapon1)){
            this.actions.fire_weapon1=fire_weapon1;
            changed=true;
        }
        if(!(fire_weapon2===this.actions.fire_weapon2)){
            this.actions.fire_weapon2=fire_weapon2;
            changed=true;
        }
        return changed;

    };

    return this;

};

exports.PlayerCarController=function(car){
    this.car=car;
    this.bindings={accelerate:38, //up
                   brake:40,      //down
                   steer_left:37, //left
                   steer_right:39, //right
                   fire_weapon1:gamejs.event.K_x, //fire weapon 1
                   fire_weapon2:gamejs.event.K_c}; //fire weapkn 2

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

        if(keys_down[this.bindings.fire_weapon1]) this.car.fire_weapon1=true;
        else this.car.fire_weapon1=false;

        if(keys_down[this.bindings.fire_weapon2]) this.car.fire_weapon2=true;
        else this.car.fire_weapon2=false;

    };

    return this;
};
