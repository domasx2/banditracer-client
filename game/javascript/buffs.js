var gamejs = require('gamejs');
var animation = require('./animation');
var utils = require('./utils');
var engine = require('./engine');
var vec=utils.vec;
var arr=utils.arr;

var EFFECT_NO_GRIP = exports.EFFECT_NO_GRIP = 'no_grip';
var EFFECT_ENGINE = exports.EFFECT_ENGINE = 'engine';
var EFFECT_INVULNERABLE = exports.EFFECT_INVULNERABLE = 'invulnerable';

var Buff = exports.Buff=function(pars){
    Buff.superConstructor.apply(this, [pars]);
    this.age = 0;
    this.duration = pars.duration ? pars.duration : null;
    this.effect = pars.effect;
    this.value = pars.value;
    this.object = pars.object;
    this.object.buffs.push(this);
};

gamejs.utils.objects.extend(Buff, engine.Object);

Buff.prototype.update = function(msDuration){
    this.age += msDuration;
    if(this.age > this.duration){
        this.world.destroy(this);
    }
};

Buff.prototype.die = function(){
    for(var i=0; i < this.object.buffs.length; i++) {
        if(this.object.buffs[i].id == this.id) {
            this.object.buffs.splice(i, 1);
            break;
        }
    }
};

Buff.prototype.process_hit = function(damage, owner){
	//return false to not register hit
	return true;
};

var EngineBuff = exports.EngineBuff=function(pars){
    pars.effect = EFFECT_ENGINE;
    EngineBuff.superConstructor.apply(this, [pars]);
};
gamejs.utils.objects.extend(EngineBuff, Buff);
engine.register_class(EngineBuff);

var SlipDebuff = exports.SlipDebuff=function(pars){
    pars.effect = EFFECT_NO_GRIP;
    SlipDebuff.superConstructor.apply(this, [pars]);
};

gamejs.utils.objects.extend(SlipDebuff, Buff);
engine.register_class(SlipDebuff);

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
engine.register_class(InvulnerabilityBuff);

InvulnerabilityBuff.prototype.update = function(msDuration){
	this.animation.update(msDuration);
};

InvulnerabilityBuff.prototype.process_hit = function(damage, owner){
	this.hits_left--;
	if(this.hits_left == 0){
		this.world.destroy(this);
	}
	return false;
};

InvulnerabilityBuff.prototype.draw = function(renderer){
	this.animation.draw(renderer, this.object.get_position());
};
