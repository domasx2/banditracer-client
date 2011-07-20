var box2d = require('./box2d');
var utils = require('./utils');
var vec=utils.vec;
var arr=utils.arr;

var car_descriptions=require('./car_descriptions');
var cars=require('./cars');
var particles = require('./particles');
var weapons=require('./weapons');
var animation=require('./animation');
var props=require('./props');
var settings=require('./settings');
var box2d=require('./box2d');
var gamejs=require('gamejs');
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
    
    this.b2world.SetContactListener(new ContactListener(this));
    
    this.next_event_no=1;
    this.events={};
    
    this.destroy=function(id){
        /*
        queues object to be destroyed.
        queue is needed, because physical objects cannot be destroyed during physics calculations.
        
        */
        this.destroy_queue[this.destroy_queue.length]=this.object_by_id[id];
    };
    
    this.destroyQueued=function(){
        this.destroy_queue.forEach(function(obj){
            utils.removeObjFromList(obj, this.objects[obj.type]);
            delete this.object_by_id[obj.id];
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
    
    this.handleEvent=function(type, descr){
        if(type=='create'){
            return this.create(descr)
        }else if(type=='destroy'){
            return this.destroy(descr)
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
            obj=new cars.Car(pars);
            if(descr.pars.weapon1)obj.weapon1=new weapons[descr.pars.weapon1]({'car':obj});
            if(descr.pars.weapon2)obj.weapon2=new weapons[descr.pars.weapon2]({'car':obj});
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
            var pars={'world':this};
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
            utils.copy(animation.animations[descr.obj_name], pars);
            obj=new animation.Animation(pars);
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
    var tile_scale=settings.get('TILE_SCALE');
    
    var dict=level.dict;
    
     //CAR POSITIONS
    var start_positions={};
    level.car_positions.forEach(function(pos){
       start_positions[pos.pos]={'x':pos.x/phys_scale, 'y':pos.y/phys_scale, 'angle':pos.angle}
    });
    
    //WAYPOINTS
    var ai_waypoints={};
    level.ai_waypoints.forEach(function(wp){
       pos=[wp.x/phys_scale, wp.y/phys_scale];
       ai_waypoints[wp.no]={'x':pos[0]+1.5, 'y':pos[1]+1.5}
    });
    
    //CHECKPOINTS
    var checkpoints={}, pt1, pt2;
    level.checkpoints.forEach(function(c){
        pt1=[c.pt1[0]/phys_scale, c.pt1[1]/phys_scale ];
        pt2=[c.pt2[0]/phys_scale, c.pt2[1]/phys_scale ];;
        checkpoints[c.no]={'pt1':pt1,
                            'pt2':pt2,
                            'width':pt2[0]-pt1[0],
                            'height':pt2[1]-pt1[1],
                            'center':[(pt1[0]+pt2[0])/2, (pt1[1]+pt2[1])/2]};
    });
    
    //BUILD WORLD
    var width=level.width_t*5;
    var height=level.height_t*5;
    var width_px=level.width_t*tile_scale;
    var height_px=level.height_t*tile_scale;   
    var world= new World(width, height, width_px, height_px, ai_waypoints, checkpoints, start_positions, mode);
    
    //BUILD PROPS
    var position, angle;
    level.props.forEach(function(prop){
         angle=math.normaliseDegrees(-prop.a);
         world.event('create', {'type':'prop', 'pars':{'filename':dict[prop.f+''],
                                                        'position':[((prop.x+prop.opx/2)/phys_scale), ((prop.y+prop.opx/2)/phys_scale)],
                                                        'angle':angle,
                                                        'size':prop.ws}});
    });
    return world;
}
