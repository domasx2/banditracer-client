var utils=require('./utils');
var gamejs=require('gamejs');

var Animation=exports.Animation=function(pars){
    /*
    pars:
    filename
    position
    duration
    world
    repeat
    */
    this.position=utils.arr(pars.position);
    this.filename=pars.filename;
    this.world=pars.world;
    this.age=0;
    this.duration=pars.duration;
    this.type='animation';
    this.follow_obj=pars.follow_obj;
    this.expand_from=pars.expand_from;
    this.expand_to=pars.expand_to;
    this.repeat=pars.repeat ? true : false;
    this.getState=function(){return null;};
    this.interpolate=function(){};
    this.setState=function(){};

    this.update=function(msDuration){
        this.age+=msDuration;
        if(this.age>this.duration){
           if(!this.repeat){
        	   this.world.destroyObj(this.id);
           }else{
        	   this.age=0;
        	   this.expand_from=0;
        	   this.expand_to=0;
           }
        }
    };

    this.draw=function(renderer){
        var frames=renderer.cache.getAnimationFrameCount(this.filename);
        var sz=null;
        if(this.expand_from && this.expand_to){
            sz=this.expand_from+parseInt((this.expand_to-this.expand_from)*(this.age/this.duration));
        }    
        var position = this.follow_obj ? utils.arr(this.follow_obj.body.GetPosition()) : this.position;
        renderer.drawAnimation(this.filename, position, Math.min(parseInt(this.age/(this.duration/frames)), frames-1), sz);
    };
    return this;
};

exports.animations={'small_explosion':{'filename':'explosion_small.png',
                                        'duration':500},
                    'smoke':{'filename':'smoke.png',
                            'duration':300},
                    'explosion':{'filename':'explosion.png',
                                 'duration':1000},
                    'shockwave':{'filename':'sw.png',
                                'duration':200,
                                'expand_from':40,
                                'expand_to':200},
                    'heal':{'filename':'heal.png',
                            'duration':500},
                    'fire':{'filename':'fire64.png',
                    		'duration':500}
                    };
