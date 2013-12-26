var utils = require('./utils');
var gamejs = require('gamejs');
var engine = require('./engine');

var Animation=exports.Animation=function(pars){
    /*
    pars:
    filename, duration, repeat

    */
    this.filename=pars.filename;
    this.age=0;
    this.duration=pars.duration;
    this.type='animation';
 
    this.finished=false;
    this.repeat=pars.repeat ? true : false;
    
    this.resize_from=0;
    this.resize_to=0;
    this.resize_age=0;
    this.resize_duration=0;
    
    this.onFinish = function(){};
    
    this.restart = function(){
        this.age = 0;
    };
    
    this.resize = function(from, to, duration){
    	this.resize_from = from;
    	this.resize_to = to;
    	this.resize_duration = duration;
    	this.resize_age = 0;
    };

    this.update = function(msDuration) {
        this.age += msDuration;
        if(this.resize_age < this.resize_duration)
            this.resize_age += msDuration;
        if(this.age > this.duration) {
            this.onFinish();
            if(this.repeat) {
                this.restart();
            } else {
                this.finished = true;
            }
        }
    };



    this.draw = function(renderer, position){
        var frames = renderer.cache.getAnimationFrameCount(this.filename);
        var sz = null;
        if(this.resize_age < this.resize_duration){
            sz = this.resize_from+parseInt((this.resize_to - this.resize_from) * (this.resize_age / this.resize_duration));
        }    
        renderer.drawAnimation(this.filename, position, Math.min(parseInt(this.age / (this.duration / frames)), frames - 1), sz);
    };
    return this;
};

var AnimationObject = exports.AnimationObject = function(pars){
    AnimationObject.superConstructor.apply(this, [pars]);
    this.add_tag('animation_object');
    this.anim = new Animation(pars);
    this.position = pars.position;
    this.world = pars.world;
    this.duration = pars.duration;

    this.follow_obj = pars.follow_obj;
    if(pars.resize){
    	this.anim.resize(pars.resize.from, pars.resize.to, pars.resize.duration);
    }
};

gamejs.utils.objects.extend(AnimationObject, engine.Object);

engine.register_class(AnimationObject);

AnimationObject.prototype.update = function(msDuration){
    this.anim.update(msDuration);
    if(this.anim.finished){
        this.world.destroy(this);
    }
};

AnimationObject.prototype.draw = function(renderer){
    var position = this.follow_obj ? this.follow_obj.get_position() : this.position;
    this.anim.draw(renderer, position);
};

exports.animations={'small_explosion':{'filename':'explosion_small.png',
                                        'duration':500},
                    'smoke':{'filename':'smoke.png',
                            'duration':300},
                    'explosion':{'filename':'explosion.png',
                                 'duration':1000},
                    'explosion2':{'filename':'explosion2.png',
                    			  'duration':1000},
                    'shockwave':{'filename':'sw.png',
                                'duration':200,
                                'resize':{'from':40, 
                                		  'to':200, 
                                		  'duration':200}},
                    'heal':{'filename':'heal.png',
                            'duration':500},
                    'fire':{'filename':'fire64.png',
                    		'duration':500},
                    'shield':{'filename':'forcefield.png',
                    		'duration':2000}
                    };
