var gamejs = require('gamejs');
var utils = require('./utils');
var sounds = require('./sounds');
var buffs = require('./buffs');
var vec=utils.vec;
var arr=utils.arr;
var weapon_descriptions=require('./weapon_descriptions');
var vectors = gamejs.utils.vectors;
var math = gamejs.utils.math;
var buffs = require('./buffs');
var engine = require('./engine');
var settings = require('./settings');
var box2d= engine.box2d;

radians=math.radians;
degrees=math.degrees;

var animation = require('./animation');

var fireAtNearbyTargets = function(){
    var i, c, len;
    var cars = this.world.get_objects_by_tag('car');
    for(i = 0; i < cars.length; i++){
        c = cars[i];
        if(c.id != this.car.id){
            len = vectors.distance(this.car.get_position(), c.get_position());
            if(len <= 10){
                return true;
            }
        }
    }
    return false;
};

var fireAtRearTargets = function(){
    var i, c, len, angle;
    var cars = this.world.get_objects_by_tag('car');
    for(i = 0; i < cars.length; i++){
        c = cars[i];
        if(c.id!=this.car.id){
            len = vectors.distance(this.car.get_position(), c.get_position());
            angle = degrees(vectors.angle([0, 1], this.car.get_local_point(c.get_position())));
            if(len < 20 && angle < 15){
                return true;
            }
        }
    }
    return false;
};

var fireAtFrontTargets = function(){
    var i, c, len, angle;
    var cars = this.world.get_objects_by_tag('car');
    for(i = 0; i < cars.length; i++){
        c = cars[i];
        if(c.id != this.car.id){
            len = vectors.distance(this.car.get_position(), c.get_position());
            angle = degrees(vectors.angle([0, -1], this.car.get_local_point(c.get_position())));
            if(len < 50 && angle < 15){
                return true;
            }
        }
    }
    return false;  
};

var Projectile = exports.Projectile = function(pars){
    /*
    pars:
    weapon   - weapon object
    position - [x, y]
    angle    - degrees
    width    - meters
    height   - meters
    damage   - damage, points
    */
   
    pars.fixed_rotation = true;
    pars.bullet = true;
    pars.linear_damping = 0;
    pars.angular_damping = 0;
    //pars.sensor = true;
    Projectile.superConstructor.apply(this, [pars]);
    this.weapon   = pars.weapon;
    this.speed    = pars.speed;
    this.damage   = pars.damage;
    this.position = pars.position;
    this.angle    = pars.angle;
    this.speed    = pars.speed;
    this.damage   = pars.damage;
    this.car      = pars.car;
    this.world    = this.car.world;
    this.add_tag('projectile');
    this.spent    = false;
    this.set_speed(this.speed);
};

gamejs.utils.objects.extend(Projectile, engine.Entity);


engine.register_class(Projectile);

Projectile.prototype.impact = function(obj, cpoint, direction) {
    if(obj.has_tag('solid') && (!this.spent)) {
        this.world.destroy(this);
        if(obj.has_tag('car')) {
            obj.apply_damage(this.damage, this.car);
            
        }
        if(this.onimpact)
            this.onimpact(obj);
        this.spent = true;
    }
};

Projectile.prototype.update = function(msDuration) {
    var pos = this.get_position();
    if((pos[0] < 0) || (pos[1] < 0) || (pos[0] > this.car.world.width) || (pos[1] > this.car.world.height)) {
        this.world.destroy(this);
    }
};


var Mine = exports.Mine = function(pars){
    /*
    pars:
    car   - car object
    position - [x, y]
    */
    pars.size = [2, 2];
    pars.sensor = true;
    pars.angle = 0;
    pars.fixed_rotation = true;
    Mine.superConstructor.apply(this, [pars]);
    this.car=pars.car;
    this.damage=pars.damage;
    this.add_tag('mine');
};

gamejs.utils.objects.extend(Mine, engine.Entity);

engine.register_class(Mine);

Mine.prototype.impact=function(obj, cpoint, direction){
        if((obj.has_tag('car'))){
            var i, c;
            this.world.get_objects_by_tag('car').forEach(function(c){
                if((c == obj) || (vectors.distance(this.position, c.get_position())<=8)){
                    c.apply_damage(this.damage, this.car);
                    utils.push(c, this, 15, 200);
                    if(this.onimpact) this.onimpact();
                }
            }, this);
            this.world.spawn_animation('explosion', this.position);
            this.world.play_sound('explosion.wav', this.position);
            this.world.destroy(this);
        }
    };

Mine.prototype.draw = function(renderer){
    renderer.drawStatic('mine.png', this.position);
};

var OilPuddle = exports.OilPuddle = function(pars){
    /*
    pars:
    car   - car object
    position - [x, y]
    */
    pars.size = [4.5, 3.5];
    pars.angle = 0;
    pars.sensor = true;
    pars.fixed_rotation = true;
    
    OilPuddle.superConstructor.apply(this, [pars]);   
    this.damage = pars.damage;
    this.car = this.parameters.car;
    this.drawn = false;
};

gamejs.utils.objects.extend(OilPuddle, engine.Entity);

engine.register_class(OilPuddle);

OilPuddle.prototype.impact = function(obj, cpoint, direction){
    if(obj.has_tag('car')){
        this.world.create(buffs.SlipDebuff, {'duration':weapon_descriptions.Oil.duration,
                                              'object':obj});
    }
};

OilPuddle.prototype.draw=function(renderer){
    if(!this.drawn){
        var sprite = renderer.cache.getStaticSprite('oil_spill.png');
        var sz = sprite.getSize();
        var phys_scale = settings.get('PHYS_SCALE');
        var pos= [this.position[0] * phys_scale, this.position[1] * phys_scale];
        renderer.background.blit(sprite, [pos[0]-sz[0]/2, pos[1]-sz[1]/2]);
        this.drawn=true;
    }
};


var Missile=exports.Missile=function(pars){
    /*
    pars:
    car   - car obj;
    position - [x, y]
    angle    - degrees
    */

    pars.size = [0.5, 2.5];
    pars.density = 0.3;
    this.tts=50;
    Missile.superConstructor.apply(this, [pars]);
    this.world.play_sound('missile_launch.wav', this.position);
};

gamejs.utils.objects.extend(Missile, Projectile);

engine.register_class(Missile);
    
Missile.prototype.onimpact = function(){
    var pos = this.get_position();
    this.world.spawn_animation('explosion',pos);
    this.world.play_sound('explosion.wav', pos);
};

Missile.prototype.draw = function(renderer){
    if(!this.spent) renderer.drawCar('missile.png', this.get_position(), this.get_angle());
};

Missile.prototype.update = function(msDuration){
    this.tts -= msDuration;
    if(this.tts<0){
        this.world.spawn_animation('smoke', this.get_world_point([0, 1.25]));
        this.tts = 50;
    }
};



var NapalmFlame = exports.NapalmFlame = function(pars) {
    
    //how often damage can be reapplied on the same flame
    pars.size = [4, 4];
    pars.sensor = true;
    pars.fixed_rotation = true;
    
    NapalmFlame.superConstructor.apply(this, [pars]);

    this.car = pars.car;
    this.life = 6000;
    this.damage = pars.damage;
    this.burn_cooldown = 200;
    this.burning = {};
    this.collapse = false;
    this.animation = new animation.Animation({
        'filename' : 'fire64.png',
        'duration' : 800,
        'repeat' : true
    });
    this.animation.resize(30, 64, 800);
};

gamejs.utils.objects.extend(NapalmFlame, engine.Entity);

engine.register_class(NapalmFlame);

NapalmFlame.prototype.impact = function(obj, cpoint, direction){
    if(obj.has_tag('car')){
        if(!this.burning[obj.id]){
        	obj.apply_damage(this.damage, this.car);
        	this.burning[obj.id] = this.burn_cooldown;
        }
    }
};
    
NapalmFlame.prototype.update = function(msDuration){
	for(var id in this.burning){
		this.burning[id] -= msDuration;
		if(this.burning[id] <0){
			delete this.burning[id];
		}
	}
	this.animation.update(msDuration);
	this.life -= msDuration;
	if(this.life <= 800 && (!this.collapse)){
		this.animation.resize(64, 30, 800);
		this.collapse=true;
	}
	
	if(this.life < 0) this.world.destroy(this);
};

NapalmFlame.prototype.draw = function(renderer){
    this.animation.draw(renderer, this.get_position());
};

var HomingMissile = exports.HomingMissile = function(pars){
    
    HomingMissile.superConstructor.apply(this, [pars]);
};

gamejs.utils.objects.extend(HomingMissile, Missile);

engine.register_class(HomingMissile);

HomingMissile.prototype.draw = function(renderer){
    if(!this.spent) renderer.drawCar('missile_homing.png', 
                                     this.get_position(),
                                     this.get_angle());
};
    
HomingMissile.prototype.update = function(msDuration){
    //spawn smoke
    this.tts -= msDuration;
    if(this.tts < 0 ){
        this.world.spawn_animation('smoke', this.get_world_point([0, 1.25]));
        this.tts = 50;
    }
    
    //drive the missile towards nearest front facing target
    var target = null;
    var target_distance = 1000000;
    this.world.objects_by_tag.car.forEach(function(car){
        var cpos = this.get_local_point(car.get_position());
        if(cpos[1]<0){
            var distance = gamejs.utils.vectors.distance(this.get_position(), car.get_position());
            if(target_distance > distance){
                target = car;
                target_distance = distance;
                
            }
        }
        return false;
    }, this);
    
    if(target){
        var cpos = this.get_local_point(target.get_position());
        var angle = gamejs.utils.math.radians(this.get_angle());
        if(cpos[0] < 0){
            angle += gamejs.utils.math.radians((-90 / 700) * msDuration);
        }else if(cpos[0] > 0){
            angle += gamejs.utils.math.radians((90 / 700) * msDuration);
        }
        this.set_angle(gamejs.utils.math.degrees(angle));
        
        this.set_speed(this.speed);
    }
    
};

var Bullet = exports.Bullet = function(pars){
    /*
    pars:
    car   - car obj
    position - [x, y]
    angle    - degrees
    */
    pars.size = [0.3, 0.8];
    pars.density = 0.1;
    Bullet.superConstructor.apply(this, [pars]);
    this.color = '#FFD800';
    this.world.play_sound('machinegun_shot.wav', this.position);
};

gamejs.utils.objects.extend(Bullet, Projectile);

engine.register_class(Bullet);

Bullet.prototype.onimpact = function(obj) {
    var pos = this.get_position();
    this.world.spawn_animation('small_explosion', pos);
    if(obj.has_tag('car')){
        this.world.play_sound('bullet_impact_metal.wav', pos);
    }else if(obj.has_tag('prop')){
        this.world.play_sound('bullet_impact_soft.wav', pos);
    }
};

Bullet.prototype.draw = function(renderer){
    if(!this.spent) renderer.drawCar('bullet.png', 
                                     this.get_position(), 
                                     this.get_angle());
};

var PlasmaProjectile = exports.PlasmaProjectile = function(pars){
    /*
    pars:
    car   - car obj
    position - [x, y]
    angle    - degrees
    */
    pars.size = [0.6, 2.5];
    pars.sensor = true;
    PlasmaProjectile.superConstructor.apply(this, [pars]);
};

gamejs.utils.objects.extend(PlasmaProjectile, Projectile);
engine.register_class(PlasmaProjectile);

PlasmaProjectile.prototype.impact = function(obj, cpoint, direction){
    if((obj.has_tag('car') || obj.has_tag('prop'))){
        if(obj.has_tag('car')){
            obj.apply_damage(this.damage, this.car);
        }
        if(this.onimpact) this.onimpact(obj);
    }
};

PlasmaProjectile.prototype.onimpact = function(obj){
    var pos = this.get_position();
    this.world.spawn_animation('small_explosion', pos);
};

PlasmaProjectile.prototype.draw = function(renderer){
    if(!this.spent) renderer.drawCar('plasma_projectile.png', 
                                      this.get_position(), 
                                      this.get_angle());
};

var Weapon = exports.Weapon = function(pars){
    pars = this.pars = utils.copy(pars, utils.copy(weapon_descriptions[pars.type], {}));
    Weapon.superConstructor.apply(this, [pars]);
    this.type = pars.type;
    this.add_tag('weapon');
    this.car = pars.car;
    this.car[pars.slot] = this;
    this.ammo_capacity = pars.ammo_capacity+(pars.ammo_upgrades*pars.ammo_upgrade);
    this.fire_rate = pars.fire_rate;
    this.cooldown = 0;
    this.ammo = 0;
    this.damage = pars.damage+(pars.damage_upgrades*pars.damage_upgrade);
    this.speed = pars.speed;
    this.projectile = pars.projectile;
};
gamejs.utils.objects.extend(Weapon, engine.Object);

engine.register_class(Weapon);

Weapon.prototype.update = function(msDuration) {
    if(this.cooldown > 0) this.cooldown -= msDuration;
};

Weapon.prototype.reload = function(){
    this.ammo = this.ammo_capacity;
};

Weapon.prototype._fire = function(){
    if(this.ammo && this.cooldown<=0){
        this.fire();
        this.ammo--;
        this.cooldown = this.fire_rate;
    }
};

Weapon.prototype.AI = function(){ return false; };
    
Weapon.prototype.fire = function(){
    var pos = this.get_fire_pos();
    this.world.create(exports[this.projectile], {'position':pos,
                                                 'damage':this.damage,
                                                 'weapon':this,
                                                 'speed':this.speed,
                                                 'angle':this.car.get_angle(),
                                                 'car':this.car});     
};
    
Weapon.prototype.get_fire_pos = function(){
    var retv = this.car.get_world_point([0, -(this.car.size[1]/2+3)]);
    return retv;
};


var RepairKit = exports.RepairKit = function(pars){
    RepairKit.superConstructor.apply(this, [pars]);
    this.add_tag('repairkit');
};

gamejs.utils.objects.extend(RepairKit, Weapon);

engine.register_class(RepairKit);
    
RepairKit.prototype.AI = function() {
    if(this.car.health <= this.car.max_health / 2){
        return true;
    }
    return false;
};
    
RepairKit.prototype._fire = function() {
    if(this.ammo&&(this.cooldown<=0) && (this.car.health<this.car.max_health)){
        this.fire();
        this.ammo--;
        this.cooldown = this.fire_rate;
    }
};
    
RepairKit.prototype.fire = function(){
    this.world.spawn_animation('heal', this.car.get_position(), this.car);
    this.world.play_sound('repair.wav', this.car.get_position());
    this.car.apply_damage(-this.damage, this.car);
};


var Machinegun=exports.Machinegun=function(pars){
    /*
    pars:
    car - car object this weapon belongs to
    */
    Machinegun.superConstructor.apply(this, [pars]);
    this.add_tag('machinegun');
    this.ofst_x = -0.5;
};

gamejs.utils.objects.extend(Machinegun, Weapon);

engine.register_class(Machinegun);

Machinegun.prototype.AI = fireAtFrontTargets;

Machinegun.prototype.get_fire_pos = function(){
    this.ofst_x *= -1;
    return this.car.get_world_point([this.ofst_x, -(this.car.parameters.size[1] / 2 + 0.9)]);
};

var PlasmaCannon = exports.PlasmaCannon = function(pars){

    PlasmaCannon.superConstructor.apply(this, [pars]);
    
    this.add_tag('plasmacannon');

    this.AI=fireAtFrontTargets;
};

gamejs.utils.objects.extend(PlasmaCannon, Weapon);

engine.register_class(PlasmaCannon);

PlasmaCannon.prototype.fire = function(){
    var pos = this.car.get_world_point([-0.6, -(this.car.parameters.size[1]/2+3)]);
    this.world.create(exports[this.projectile], {'position':pos,
                                                'damage':this.damage,
                                                'speed':this.speed,
                                                'weapon':this,
                                                'angle':this.car.get_angle(),
                                                'car':this.car});
    if(this.ammo){
        var pos = this.car.get_world_point([0.6, -(this.car.parameters.size[1]/2+3)]);
        this.world.create(exports[this.projectile], {'position':pos,
                                            'damage':this.damage,
                                            'speed':this.speed,
                                            'weapon':this,
                                            'angle':this.car.get_angle(),
                                            'car':this.car});
        this.ammo--;
    }
    this.world.play_sound('plasma_cannon.wav');
};

var NOS = exports.NOS = function(pars){
    NOS.superConstructor.apply(this, [pars]);
    this.duration = this.parameters.duration;
    this.add_tag('nos');
};

gamejs.utils.objects.extend(NOS, Weapon);

engine.register_class(NOS);
   
NOS.prototype.AI = function(){
    if(this.car.get_speed_KMH() > this.car.get_max_speed()-10){
        return true;
    }
    return false;
};

NOS.prototype.fire = function(){
    this.world.create(buffs.EngineBuff,{'duration':this.duration,
                                        'value':this.damage,
                                        'object':this.car});
};

var ShockwaveGenerator = exports.ShockwaveGenerator = function(pars){
    ShockwaveGenerator.superConstructor.apply(this, [pars]);
    this.add_tag('shockwave')
};

gamejs.utils.objects.extend(ShockwaveGenerator, Weapon);

engine.register_class(ShockwaveGenerator);

ShockwaveGenerator.prototype.AI = fireAtNearbyTargets;
    
ShockwaveGenerator.prototype.fire = function(){
    this.world.get_objects_by_tag('solid').forEach(function(obj){
        if(obj.id != this.car.id){
            var tp = this.car.get_position();
            var cp= obj.get_position();
            var d = vectors.distance(tp, cp);
            if(d <= 12){
                obj.apply_damage(this.damage, this.car);
                utils.push(obj, this.car, 40, 500);
            };
        }
    }, this);
    
    this.world.play_sound('shockwave.wav', this.car.get_position());
    this.world.spawn_animation('shockwave', this.car.get_position(), this.car);
    
};

var MineLauncher = exports.MineLauncher=function(pars){
    MineLauncher.superConstructor.apply(this, [pars]);
    this.add_tag('minelauncher');
};

gamejs.utils.objects.extend(MineLauncher, Weapon);

engine.register_class(MineLauncher);
    
MineLauncher.prototype.AI = fireAtRearTargets;
    
MineLauncher.prototype.get_fire_pos=function(){
    return this.car.get_world_point([0, (this.car.parameters.size[1] / 2 + 3)]);  
};

var MissileLauncher = exports.MissileLauncher = function(pars){
    MineLauncher.superConstructor.apply(this, [pars]);
    this.add_tag('missilelauncher');
};

gamejs.utils.objects.extend(MissileLauncher, Weapon);

engine.register_class(MissileLauncher);
   
MissileLauncher.prototype.AI = fireAtFrontTargets;
    
MissileLauncher.prototype.get_fire_pos=function(){
    return this.car.get_world_point([0, -(this.car.parameters.size[1] / 2 + 3)]);    
};

var Oil = exports.Oil = function(pars){
    Oil.superConstructor.apply(this, [pars]);
    this.add_tag('oil');
};

gamejs.utils.objects.extend(Oil, Weapon);

engine.register_class(Oil);
    
Oil.prototype.AI = fireAtRearTargets;

Oil.prototype.get_fire_pos = function(){
    return this.car.get_world_point([0, (this.car.parameters.size[1]/2+3)]);    
};

var Shield=exports.Shield=function(pars){
    Shield.superConstructor.apply(this, [pars]);
    this.duration = pars.duration;
    this.add_tag('shield');
};

gamejs.utils.objects.extend(Shield, Weapon);

engine.register_class(Shield);
    
Shield.prototype.AI = function(){
    if(this.car.health <= this.car.max_health/3){
        return true;
    }
    return false;
};
    
Shield.prototype._fire=function(){
    if(this.ammo && (this.cooldown <= 0)){
        this.fire();
        this.ammo--;
        this.cooldown = this.fire_rate;
    }
};
    
Shield.prototype.fire=function(){
    this.car.world.create(buffs.InvulnerabilityBuff, {'object':this.car});
};



var TankShell = exports.TankShell = function(pars){
    pars.size = [0.8, 1.5];
    TankShell.superConstructor.apply(this, [pars]);
	this.add_tag('tank_shell');
	this.world.play_sound('fire_cannon.wav', this.position);
};

gamejs.utils.objects.extend(TankShell, Projectile);

engine.register_class(TankShell);
	
TankShell.prototype.impact = function(obj, cpoint, direction){
    if((obj.has_tag('car') || obj.has_tag('prop')) && (!this.spent)){
        this.world.destroy(this);
        this.world.get_objects_by_tag('car').forEach(function(car){
            if(car.id != this.car.id){
                var tp = this.get_position();
                var cp = car.get_position();
                var d = vectors.distance(tp, cp);
                if(d <= 5){
                    car.apply_damage(this.damage, this.car);
                    this.world.create(buffs.SlipDebuff, {'duration':500,
                                                         'object':car});
                    var fvect = vectors.unit(vectors.subtract(cp, tp));
                    fvect=vectors.multiply(fvect, 200);
                    car.apply_impulse(fvect, car.get_position());
                };
            }
        }, this);
        
        this.spent = true;
        this.world.spawn_animation('explosion2', this.get_position());
        this.world.play_sound('explosion.wav', this.position);
    }
};

TankShell.prototype.draw = function(renderer){
    if(!this.spent) renderer.drawCar('cannon_shell.png',  this.get_position(), this.get_angle());
};

