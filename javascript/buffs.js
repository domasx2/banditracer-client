var gamejs=require('gamejs');

var EFFECT_NO_GRIP=exports.EFFECT_NO_GRIP='no_grip';
var EFFECT_ENGINE=exports.EFFECT_ENGINE='engine';

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


Buff.prototype.destroy=function(){
    for(var i=0; i<this.car.buffs.length; i++) {
        if(this.car.buffs[i].id == this.id) {
            this.car.buffs.splice(i, 1);
            break;
        }
    }
};

var EngineBuff=exports.EngineBuff=function(pars){
    pars.effect=EFFECT_ENGINE;
    EngineBuff.superConstructor.apply(this, [pars]);
};
gamejs.utils.objects.extend(EngineBuff, Buff);

var SlipDebuff=exports.SlipDebuff=function(pars){
    pars.effect=EFFECT_NO_GRIP;
    SlipDebuff.superConstructor.apply(this, [pars]);
};

gamejs.utils.objects.extend(SlipDebuff, Buff);