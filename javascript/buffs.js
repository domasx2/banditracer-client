var gamejs = require('gamejs');
var animation = require('animation');
var utils = require('./utils');
var vec=utils.vec;
var arr=utils.arr;

var EFFECT_NO_GRIP = exports.EFFECT_NO_GRIP = 'no_grip';
var EFFECT_ENGINE = exports.EFFECT_ENGINE = 'engine';
var EFFECT_INVULNERABLE = exports.EFFECT_INVULNERABLE = 'invulnerable';

var Buff=exports.Buff=function(pars){
    this.age=0;
    this.duration=pars.duration ? pars.duration : null;
    this.effect=pars.effect;
    this.value=pars.value;
    this.car=pars.car;
    this.car.buffs.push(this);
};

Buff.prototype.update=function(msDuration){
    this.age+=msDuration;
    if(this.age>this.duration){
        this.car.world.destroyObj(this.id);
    }
};

Buff.prototype.draw = function(display){
	
};


Buff.prototype.destroy=function(){
    for(var i=0; i<this.car.buffs.length; i++) {
        if(this.car.buffs[i].id == this.id) {
            this.car.buffs.splice(i, 1);
            break;
        }
    }
};


Buff.prototype.process_hit = function(hit_data){
	//return false to not register hit
	return true;
};

var EngineBuff = exports.EngineBuff=function(pars){
    pars.effect = EFFECT_ENGINE;
    EngineBuff.superConstructor.apply(this, [pars]);
};
gamejs.utils.objects.extend(EngineBuff, Buff);

var SlipDebuff = exports.SlipDebuff=function(pars){
    pars.effect = EFFECT_NO_GRIP;
    SlipDebuff.superConstructor.apply(this, [pars]);
};

gamejs.utils.objects.extend(SlipDebuff, Buff);

var InvulnerabilityBuff = exports.InvulnerabilityBuff = function(pars){
	pars.effect = EFFECT_INVULNERABLE;
	pars.duration=1;
	this.hits_left = 3;
	InvulnerabilityBuff.superConstructor.apply(this, [pars]);
	this.animation = new animation.Animation({'filename':'forcefield.png',
											  'duration':1000,
											  'repeat':true});
};

gamejs.utils.objects.extend(InvulnerabilityBuff, Buff);

InvulnerabilityBuff.prototype.update = function(msDuration){
	this.animation.update(msDuration);
};

InvulnerabilityBuff.prototype.process_hit = function(hit_data){
	this.hits_left--;
	if(this.hits_left == 0){
		this.car.world.destroyObj(this.id);	
	}
	return false;
};

InvulnerabilityBuff.prototype.draw = function(renderer){
	this.animation.draw(renderer, arr(this.car.body.GetPosition()));
};
