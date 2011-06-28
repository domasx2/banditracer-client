var gamejs=require('gamejs');
var utils=require('./utils');
var world=require('./world');
var renderer=require('./renderer');
var settings=require('./settings');
var controllers=require('./controllers');
var car_descriptions=require('./car_descriptions');

var LevelScene=exports.LevelScene=function(game, level, cache){
    this.game=game;
    this.level=level;
    this.cache=cache;
    this.started=false;
    this.paused=false;
    this.time_to_start=3000;
    this.controllers=[];
    this.keys_down={};
    this.started=false;


    this.max_laps=3;
    var i;
    //BUILD BACKGROUND FROM TILES
    var tiles=[];
    for(i=0;i<level.tiles.length;i++)tiles[tiles.length]=level.dict[level.tiles[i]+''];
    this.background=utils.renderBackgroundFromTiles(level.width_t, level.width_t, tiles,  this.cache);


    this.world=world.buildWorld(level,  world.MODE_STANDALONE);

    //RENDER PROPS INTO BACKGROUND
    var prop, position, prop2, angle;
    for(i=0;i<level.props.length;i++){
        prop=level.props[i];
        angle=utils.normaliseAngle(-prop.a);
        //render props into background
        this.background.blit(this.cache.getPropSprite(level.dict[prop['f']+''], angle), [prop.x, prop.y])

    }

    this.renderer=new renderer.RaceRenderer(settings.get('SCREEN_WIDTH'), settings.get('SCREEN_HEIGHT'), this.world, this.background, this.cache);



    this.handleEvent=function(event){
        if (event.type === gamejs.event.KEY_DOWN) {
            this.keys_down[event.key] = true;

            if(event.key===gamejs.event.K_SPACE){
               this.paused=(!this.paused);
            };

        } else if (event.type === gamejs.event.KEY_UP) {
            this.keys_down[event.key] = false;
        };
    };

    this.updateZoom=function(msDuration){
        //upd zoom
        if(this.keys_down[gamejs.event.K_p]) this.renderer.increaseZoom();
        else if(this.keys_down[gamejs.event.K_l]) this.renderer.decreaseZoom();
    };


};


var MultiplayerLevelScene=exports.MultiplayerLevelScene=function(game, level, cache){
    MultiplayerLevelScene.superConstructor.apply(this, [game, level, cache]);
    this.game=game;
    this.processed_events={};
    this.world.mode=world.MODE_CLIENT;
    this.last_event_no=0; //the last event that was processed
    this.last_known_event_no=0; //the last known event
    this.queued_updates=[];
    this.time_to_start=3000;
    this.player_car=null;
    this.upds_stacked=0;
    this.time=0;
    this.delta=0;
    this.deltas=[];
    this.delta_q=0;
    this.states={};
    this.queued_events={};
    this.extradelay=50;
    this.last_upd_time=0;
    this.carid=null;
    this.bfs=0;//bad frames;
    this.send_update=true; //send update to server?

    this.controllers[this.controllers.length]=this.controller=new controllers.MultiplayerController();

    this.setState=function(target_time){
        /*
        set state of object for target server time
        */

        //find the two nearest known states from both sides of target time
        var mint=0;
        var maxt=0;
        for(var t in this.states){
            if(t==target_time){
                mint=t;
                maxt=0;
                break;
            }
            if(t<target_time && t > mint)mint=t;
            else if(t>target_time && (t<maxt || maxt===0))maxt=t;
        }

        if(mint||maxt){
            var minst=this.states[mint];
            var maxst=maxt ? this.states[maxt] : null;
            var q=0;

            //if both states are known, calc difference coeficient
            if(mint&&maxt){
                q=(target_time-mint)/(maxt-mint);
            }

            //for each object in first state
            var state, obj;
            for(var objid in minst){
                obj=this.world.getObjectById(objid);
                if(obj){
                    //if second state is known and object is interpolatable, get interpolated state
                    if(maxst && maxst[objid] && obj.interpolate){
                        state=obj.interpolate(minst[objid], maxst[objid], q);
                        this.last_upd_time=target_time;
                    }
                    //else state is min state
                    else{
                        this.bfs++;
                        state=minst[objid];
                        this.last_upd_time=mint;
                       /* if(!(mint==target_time)){
                            var tarray=[];
                            var min=100000000000,max=0;
                            for(t in this.states){
                                min=Math.min(min, t);
                                max=Math.max(max, t);
                            }
                            console.log('old state... '+target_time+' '+(target_time-mint)+'('+min, max+')');
                        }*/
                    }
                    obj.setState(state);
                }
            }
        }else{
            console.log('no known state!');
        }
    };

    this.update=function(msDuration){
        this.time+=msDuration;
        this.handleWorldUpdate();
        this.paused=false;
        this.updateZoom(msDuration);

        if(this.time_to_start<0)this.started=true;

        var target_time=this.time+this.delta-10;
        //console.log(this.time+' '+target_time);
        this.processEvents(target_time);

        if( this.started){
            //set object state

            this.setState(target_time);

            if(target_time>this.last_upd_time){
                var d=target_time-this.last_upd_time
                this.world.b2world.Step(d/1000, 10, 8);
                //console.log('simulating for '+d+' '+this.last_upd_time+' '+target_time);
                this.last_upd_time=target_time;

            }


            //update controllers
            var i, c;
            for(i=0;i<this.controllers.length;i++){
               c=this.controllers[i].update(this.keys_down, msDuration);
               if(c)this.send_update=true;
            }
            //update world
            this.world.update(msDuration);

        }

        this.sendInfo();
     };

    //this.render_r_1= new gamejs.Rect([0, 0], [500, 400]);
    //this.render_r_2=new gamejs.Rect([0, 0], [1000, 800]);

    this.sendInfo=function(){
        //if(this.upds_stacked<5){
         if(this.send_update){
            this.game.getCommunicator().queueMessage('GAME_UPDATE', {'actions':this.controller.actions, 'eventno':this.last_known_event_no});
           // console.log('sent update');
            this.send_update=false;
        }
    };

    this.processEvents=function(target_time){
        while(this.queued_events[this.last_event_no+1]&&(this.queued_events[this.last_event_no+1].t<=target_time)){
            var event=this.queued_events[this.last_event_no+1];
            this.world.handleEvent(event.type, event.descr);
            this.last_event_no=event.no;
           // this.send_update=true;
            delete this.queued_events[event.no];

            if((!this.player_car) && this.carid){
                obj=this.world.getObjectById(this.carid);
                if(obj){
                    this.player_car=obj;
                    this.renderer.follow(obj);
                    this.game.getCommunicator().queueMessage('GAME_READY',{});
                }
            }
        }


    };

    this.handleWorldUpdate=function(){
        var update, states, t, i, k, event;
        for(i=0;i<this.queued_updates.length;i++){
            update=this.queued_updates[i];

            this.time_to_start=update.tts;
            for(k=0;k<update.events.length;k++){
                event=update.events[k];
                if(event.no>this.last_event_no && (!this.queued_events[event.no])){
                    event.t=update.t;
                    this.queued_events[event.no]=event;
                    this.last_known_event_no=event.no;

                }
            }

            this.carid=update.carid;


            //put this state in states array
            this.states[update.t]=update.states;

            //remove old states, taking care to leave at least one
            var tarray=[];
            for(t in this.states){
                tarray[tarray.length]=t;
            }
            for(k=0;k<tarray.length-1;k++){
                t=tarray[k];
                if(t < (this.time+this.delta-300)){
                    delete this.states[t];
                }
            }

            this.upds_stacked=0;


        }
        if(update){
            var delta=this.time-update.t;
            this.deltas.push(delta);
            dlen=this.deltas.length;
            this.delta_q+=delta;
            if(dlen>60){
                this.delta_q-=this.deltas.shift();
                dlen=60;
            }
            this.delta=parseInt(this.delta_q/dlen);
            //console.log(this.delta);
        }
        this.queued_updates=[];
    };

    this.draw=function(display, msDuration){
       //render world
       this.renderer.render(display);

       //render HUD
       this.renderer.renderHUD(display, this.player_car, msDuration, this.max_laps, this.time_to_start, this.paused, this.delta, this.bfs);
    };

    this.handleMessage=function(cmd, payload){
        if(cmd=='GAME_UPDATE'){
            this.queued_updates[this.queued_updates.length]=payload;
        }
        else if(cmd=='GAME_OVER'){
            this.game.showGameOver(payload.table);
        }
        else if(cmd=='CRITICAL_ERR'){
            this.returnToTitle();
            this.game.title_scene.alert(payload.text);
        }
    };
};
gamejs.utils.objects.extend(MultiplayerLevelScene, LevelScene);

var SingleplayerLevelScene=exports.SingleplayerLevelScene=function(game, level, cache, car){
    SingleplayerLevelScene.superConstructor.apply(this, [game, level, cache]);





    //PLAYER CAR
    var ct=car ? car : 'Racer';
    this.player_car=this.world.event('create', {'type':'car', 'obj_name':ct, 'pars':{'position':[this.world.start_positions[1].x+1, this.world.start_positions[1].y+2],
                                                                                               'angle':this.world.start_positions[1].angle,
                                                                                               'alias':this.game.title_scene.alias.getText(),
                                                                                               'weapon1':car_descriptions[ct].main_weapon,
                                                                                               'weapon2':'MineLauncher'}})

    if(!this.test_ai) this.controllers[this.controllers.length]=new controllers.PlayerCarController(this.player_car);
    else this.controllers[this.controllers.length]=new controllers.AIController(this.player_car, this.world, this);

    if(!this.test_ai){
    //BUILD AI CARS
     var cartypes=[];
     for(var k in car_descriptions){
        cartypes.push(k);
     }
     for(i=1;i<4;i++){
        if(this.world.start_positions[i+1]){
           var ct=cartypes[Math.floor(Math.random()*(cartypes.length))];
           var aicar=this.world.event('create', {'type':'car', 'obj_name':ct, 'pars':{'position':[this.world.start_positions[i+1].x+1, this.world.start_positions[i+1].y+2],
                                                                                               'angle':this.world.start_positions[i+1].angle,
                                                                                               'alias':'Bot '+i,
                                                                                               'weapon1':car_descriptions[ct].main_weapon,
                                                                                               'weapon2':'MineLauncher'}})

           this.controllers[this.controllers.length]=new controllers.AIController(aicar, this.world, this);
        }
     }
    }

   this.renderer.follow(this.player_car);




     this.update=function(msDuration){

        this.updateZoom(msDuration);

        if(this.time_to_start>-1000){
            this.time_to_start-=msDuration;
            if(this.time_to_start<0)this.started=true;
        }



        if(!this.paused && this.started){
            //update physics
            this.world.b2world.Step(msDuration/1000, 10, 8);

            //update controllers
            var i;
            for(i=0;i<this.controllers.length;i++){
               this.controllers[i].update(this.keys_down, msDuration);
            }
            //update world
            this.world.update(msDuration);
        }

        //if we reached max laps, end race
        if(this.player_car.lap > this.max_laps){
             var table=[], car;
             for(var i=0;i<this.world.objects['car'].length;i++){
                car=this.world.objects['car'][i];
                table.push({'place':String(car.getRacePosition()),
                           'id':String(i),
                           'player':car.alias,
                           'kills':String(car.kills),
                           'deaths':String(car.deaths)});
                table.sort(function(a, b){
                   if(a.place>b.place) return 1;
                   else if(a.place<b.place) return -1;
                   return 0;
                });
            }

            this.game.showGameOver(table);
        };
    };

  // this.render_r_1= new gamejs.Rect([0, 0], [500, 400]);
   //this.render_r_2=new gamejs.Rect([0, 0], [1000, 800]);

   this.draw=function(display, msDuration){
      //render world
      this.renderer.render(display);

      //render HUD
      this.renderer.renderHUD(display, this.player_car, msDuration, this.max_laps, this.time_to_start, this.paused);
   };
};
gamejs.utils.objects.extend(SingleplayerLevelScene, LevelScene);
