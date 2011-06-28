var utils=require('./utils');
var gamejs=require('gamejs');

var Animation=exports.Animation=function(pars){
    /*
    pars:
    filename
    position
    duration
    world
    */
    this.position=utils.vectorToList(pars.position);
    this.filename=pars.filename;
    this.world=pars.world;
    this.age=0;
    this.duration=pars.duration;
    this.type='animation';

    this.getState=function(){return null;};
    this.interpolate=function(){};
    this.setState=function(){};

    this.update=function(msDuration){
        this.age+=msDuration;
        if(this.age>this.duration){
           this.world.event('destroy', this.id);
        }
    };

    this.draw=function(renderer){
        var frames=renderer.cache.getAnimationFrameCount(this.filename);
        renderer.drawAnimation(this.filename, this.position, Math.min(parseInt(this.age/(this.duration/frames)), frames-1));
    };

    return this;
}

exports.animations={'small_explosion':{'filename':'explosion_small.png',
                                        'duration':500},
                    'smoke':{'filename':'smoke.png',
                            'duration':300},
                    'explosion':{'filename':'explosion.png',
                                 'duration':1000}};
