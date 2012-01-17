var box2d = require('./box2d');
var utils = require('./utils');
var vec=utils.vec;
var arr=utils.arr;
var weapon_descriptions=require('./weapon_descriptions');
var combatracer=require('./combatracer');
var car_descriptions=require('./car_descriptions');
var cars=require('./cars');
var particles = require('./particles');
var weapons=require('./weapons');
var animation=require('./animation');
var props=require('./props');
var settings=require('./settings');
var box2d=require('./box2d');
var gamejs=require('gamejs');
var sounds=require('./sounds');
var renderer=require('./renderer');
var buffs=require('./buffs');
var vectors = gamejs.utils.vectors;
var math = gamejs.utils.math;
radians=math.radians;
degrees=math.degrees;


var ContactListener=exports.ContactListener=function(world){
    this.world=world;
    this.BeginContact=function(cpoint){
        var body1=cpoint.GetFixtureA().GetBody();
        var body2=cpoint.GetFixtureB().GetBody();
        var obj1=body1.GetUserData();
        var obj2=body2.GetUserData();
        if(obj1&&obj2){
            var manifold=new box2d.b2WorldManifold();
            cpoint.GetWorldManifold(manifold);
            var normal=arr(manifold.m_normal);
            if(obj1.impact) obj1.impact(obj2, cpoint, normal);
            if(obj2.impact) obj2.impact(obj1, cpoint, vectors.rotate(normal, radians(180)));
        }       
    };
    
    this.EndContact=function(){};
    this.PreSolve=function(){}; 
    this.PostSolve=function(){};
    return this;   
}

var MODE_CLIENT=exports.MODE_CLIENT=1;
var MODE_SERVER=exports.MODE_SERVER=2;
var MODE_STANDALONE=exports.MODE_STANDALONE=3;
var UPDATE_AS_CLIENT={'animation':true}; //update these object types even when running client mode

var World=exports.World=function(width, height, width_px, height_px, ai_waypoints, checkpoints, start_positions, mode){
    this.next_object_id=1;
    this.mode=mode ? mode : MODE_STANDALONE;
    this.start_positions=start_positions;
    this.background=null;
    this.background_zoom=null;
    this.phys_scale=settings.get('PHYS_SCALE');
    this.width_px=width_px;
    this.height_px=height_px;
    this.width=width;
    this.height=height;
    this.size=[this.width, this.height];
    this.b2world=new box2d.b2World(vec(0, 0), false);
    this.ai_waypoints=ai_waypoints
    this.max_waypoint=0;
    for(var no in ai_waypoints) this.max_waypoint=Math.max(this.max_waypoint, no);
    
    this.checkpoints=checkpoints;
    this.max_checkpoint=0;
    for(var no in checkpoints) this.max_checkpoint=Math.max(this.max_checkpoint, no);
    
    this.pending_particle_bursts=[];
    
    this.objects={};
    this.object_by_id={};
    this.destroy_queue=[];
    this.sound_queue=[];
    
    this.b2world.SetContactListener(new ContactListener(this));
    
    this.next_event_no=1;
    this.events={};
    
    this.destroy=function(id){
        /*
        queues object to be destroyed.
        queue is needed, because physical objects cannot be destroyed during physics calculations.
        
        */
        this.destroy_queue.push(this.object_by_id[id]);
    };
    
    this.destroyQueued=function(){
        this.destroy_queue.forEach(function(obj){
            utils.removeObjFromList(obj, this.objects[obj.type]);
            delete this.object_by_id[obj.id];
            if(obj.destroy)obj.destroy();
            if(obj.body)this.b2world.DestroyBody(obj.body);
        }, this);
        this.destroy_queue=[];
    };
    
    this.addObject=function(obj){
        //use event
        obj.id=this.next_object_id++;
        if(!this.objects[obj.type])this.objects[obj.type]=[obj];
        else this.objects[obj.type][this.objects[obj.type].length]=obj;
        this.object_by_id[obj.id]=obj;
    };
    
    this.recordEvent=function(type, descr){
        if(type=='create' && descr.type=='prop')return;
        var no=this.next_event_no++
        var evt={'type':type,
                'no':no,
                'descr':descr};
        this.events[no]=evt;
    };
    
    this.event=function(type, descr){
        /*
         type: 'create' / 'destroy'
        
        use this to create/destroy objects
        */
        if(this.mode==MODE_SERVER){
            this.recordEvent(type, descr);
        }
        if((this.mode==MODE_STANDALONE) || (this.mode==MODE_SERVER)){
            var retv= this.handleEvent(type, descr);
            return retv;
        }
        return null;
    };
    
    this.destroyObj=function(id){
        this.event('destroy', id);
    };
    
    this.spawnAnimation=function(animation, position, follow_obj){
        var pars={'position':position};
        if(follow_obj) pars['follow_obj']=follow_obj.id;
        this.event('create', {'type':'animation', 'obj_name':animation, 'pars':pars});  
    };
    
    this.createBuff=function(buff, car, pars){
        pars.car=car.id;
        this.event('create', {'type':'buff', 'obj_name':buff, 'pars':pars});
    };
    
    this.playSound=function(sound, position){
        this.event('create', {'type':'sound', 'obj_name':sound, 'pars':{'position':position}});
    };
    
    this.handleEvent=function(type, descr){
        if(type=='create'){
            return this.create(descr);
        }else if(type=='destroy'){
            return this.destroy(descr);
        }
        return null;
    };
  
    this.create=function(descr){
        /*
         use event.
         
         descr:
         {obj_type,  -- car, prop, weapon, animation
         obj_name,  
         pars}
        */
        
        var obj=null;
        var type=descr.type;
        if(type=='car'){
            /*
            pars:
            weapon1
            weapon2
            position
            angle
            */
            var carpars=car_descriptions[descr.obj_name];
            var pars={'world':this};
            utils.copy(descr.pars, pars);
            utils.copy(carpars, pars);
            delete pars['filenames'];
            var alt=this.objects['car'] ? this.objects['car'].length : 0;
            if(alt>=carpars.filenames.length){
                pars['filename']=carpars.filenames[0];
            }
            else{
                pars['filename']=carpars.filenames[alt];
            }
            pars.type=descr.obj_name;
            obj=new cars.Car(pars);
            
            for(var weapon_type in {'front_weapon':1, 'rear_weapon':1, 'util':1}){
                if(descr.pars[weapon_type]){
                    pars={'car':obj,
                          'weapon_id':descr.pars[weapon_type].type};
                    utils.copy(descr.pars[weapon_type], pars);
                    utils.copy(weapon_descriptions[pars.type], pars);
                    obj[weapon_type]=new weapons[pars.launcher](pars);
                }
            }

        }else if(type=='prop'){
            /*
            pars:
            filename
            position
            angle
            size
            */
            var pars={'world':this};
            pars=utils.copy(descr.pars, pars);
            obj=new props.BoxProp(pars);
        }
        else if(type=='weapon'){
            /*
            pars:
            position
            angle
            car   - car id!
            */
            var pars={'world':this,
                      'weapon_id':descr.obj_name};
            utils.copy(descr.pars, pars);
            var car=this.getObjectById(descr.pars.car);
            if(car){
                pars.car=car;
                obj=new weapons[descr.obj_name](pars);
            }else{
                console.log('CAR NOT FOUND:'+descr.pars.car);
            }
        }
        else if(type=='animation'){
            /*
            pars:
            position
            */
            var pars={'world':this,
                      'position':descr.pars.position};
            if(descr.pars.follow_obj)pars.follow_obj=this.getObjectById(descr.pars.follow_obj);
            utils.copy(animation.animations[descr.obj_name], pars);
            obj=new animation.Animation(pars);
        }
        else if(type=='sound'){
            if(settings.get('SOUND')){
                this.sound_queue.push({'filename':descr.obj_name,
                                       'position':descr.pars.position});
            }
        }
        else if(type=='buff'){
            var pars={};
            utils.copy(descr.pars, pars);
            pars.car=this.getObjectById(descr.pars.car)
            obj=new buffs[descr.obj_name](pars);
        }
        
        if(obj) this.addObject(obj);
        
        return obj;
    };
   
    this.getObjectById=function(id){
        return this.object_by_id[id];  
    };
    
    this.updList=function(msDuration, list){
        var i;
        for(i=0;i<list.length;i++){
            if(list[i].update){
                list[i].update(msDuration);
            }
        }  
    };
    
    this.drawList=function(renderer, list){
        list.forEach(function(obj){
            if(obj.draw) obj.draw(renderer);
        });
    };
       
    this.update=function(msDuration){
        var type;
        for(type in this.objects){
            if ((this.mode!=MODE_CLIENT)||(UPDATE_AS_CLIENT[type]))
            this.updList(msDuration, this.objects[type]);
        }       
        this.destroyQueued();
    };
    
    this.draw=function(renderer, msDuration){
        var type;
        for(type in this.objects){
            this.drawList(renderer, this.objects[type]);
        }
        this.sound_queue.forEach(function(pars){
            sounds.play(pars, renderer); 
        });
        this.sound_queue=[];
    };
    
    this.CreateBody=function(definition){
        return this.b2world.CreateBody(definition);
    };
    
    this.addParticleBurst=function(pars){
        this.pending_particle_bursts[this.pending_particle_bursts.length]=pars;
    };
    
    /*this.burstParticles=function(){
        var i;
        for(i=0;i<this.pending_particle_bursts.length;i++){
            particles.burst(this.pending_particle_bursts[i]);
        }
        this.pending_particle_bursts=[];
    };*/
    
    return this;

}

exports.buildWorld=function(level, mode){
    //level - data property of level module
    
    var phys_scale=settings.get('PHYS_SCALE');
    
    var dict=level.dict;
    
     //CAR POSITIONS
    var start_positions={};
    level.start_positions.forEach(function(pos){
        start_positions[pos.n]={'x':(pos.p[0]+30)/phys_scale, 'y':(pos.p[1]+30)/phys_scale, 'angle':pos.a}
    });
    
    //WAYPOINTS
    var ai_waypoints={};
    level.ai_waypoints.forEach(function(wp){
        ai_waypoints[wp.n]={'x':(wp.p[0]+20)/phys_scale, 'y':(wp.p[1]+20)/phys_scale};
    });
    
    //CHECKPOINTS
    var checkpoints={}, pt1, pt2;
    level.checkpoints.forEach(function(c){
        pt1=[c.p[0]/phys_scale, c.p[1]/phys_scale];
        pt2=[(c.p[0]+280)/phys_scale, (c.p[1]+280)/phys_scale];;
        checkpoints[c.n]={'pt1':pt1,
                            'pt2':pt2,
                            'width':pt2[0]-pt1[0],
                            'height':pt2[1]-pt1[1],
                            'center':[(pt1[0]+pt2[0])/2, (pt1[1]+pt2[1])/2]};
    });
    
    //BUILD WORLD
    var width_px=level.size[0];
    var height_px=level.size[1];
    var width=level.width/phys_scale;
    var height=level.height/phys_scale;
       
    var world= new World(width, height, width_px, height_px, ai_waypoints, checkpoints, start_positions, mode);
    
    //BUILD PROPS
    var position, angle, s, sz, sz2, ws;
    level.props.forEach(function(prop){
         angle=math.normaliseDegrees(prop.a);
         s=renderer.cache.getPropSprite(dict[prop.f], angle);
         sz=s.getSize();
         s=renderer.cache.props[dict[prop.f]].orig;
         sz2=s.getSize();
         ws=[sz2[0]/phys_scale, sz2[1]/phys_scale];
         world.event('create', {'type':'prop', 'pars':{'filename':dict[prop.f],
                                                        'position':[((prop.p[0]+sz[0]/2)/phys_scale), ((prop.p[1]+sz[1]/2)/phys_scale)],
                                                        'angle':angle,
                                                        'size':ws}});
    });
    return world;
}
