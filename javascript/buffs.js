var gamejs=require('gamejs');

var EFFECT_NO_GRIP=exports.EFFECT_NO_GRIP='no_grip';

var Buff=exports.Buff=function(pars){
    this.age=0;
    this.duration=pars.duration ? pars.duration : null;
    this.effect=pars.effect;
    this.value=pars.value;
    this.car=pars.car;
    this.id=this.car.next_buff_id++;
    this.car.buffs[this.id]=this;
};

Buff.prototype._update=function(msDuration){
    this.age+=msDuration;
    if(this.age<this.duration){
        if(this.update)this.update(msDuration);
    }else{
        this.destroy();
        delete this.car.buffs[this.id];
    }
};


Buff.prototype.update=function(msDuration){
    
};

Buff.prototype.destroy=function(){
    
};

var SlipDebuff=exports.SlipDebuff=function(car, duration){
    pars={'car':car,
          'duration':duration,
          'effect':EFFECT_NO_GRIP};
    SlipDebuff.superConstructor.apply(this, [pars]);
};

gamejs.utils.objects.extend(SlipDebuff, Buff);