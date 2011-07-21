var gamejs = require('gamejs');
var box2d = require('./box2d');
var utils = require('./utils');
var vec=utils.vec;
var arr=utils.arr;

var vectors = gamejs.utils.vectors;
var math = gamejs.utils.math;
radians=math.radians;
degrees=math.degrees;

var animation = require('./animation');

var Projectile=exports.Projectile=function(pars){
    /*
    pars:
    weapon   - weapon object
    position - [x, y]
    angle    - degrees
    width    - meters
    height   - meters
    damage   - damage, points
    */
    this.weapon   = pars.weapon;
    this.position = pars.position;
    this.angle    = pars.angle;
    this.width    = pars.width;
    this.height   = pars.height;
    this.speed    = pars.speed;
    this.damage   = pars.damage;
    this.car      = pars.car;
    this.world=this.car.world;
    this.type='projectile';
    
    //initialize body
    var bdef=new box2d.b2BodyDef();
    bdef.position=vec(this.position);
    bdef.type = box2d.b2Body.b2_dynamicBody;
    bdef.angle=radians(this.angle);
    bdef.linearDamping=0;
    bdef.angularDamping=0;
    bdef.bullet=true;
    bdef.fixedRotation=true;
    this.body=this.world.CreateBody(bdef);
    this.body.SetUserData(this);
    
    //initialize shape
    var fixdef=new box2d.b2FixtureDef;
    fixdef.shape=new box2d.b2PolygonShape();
    fixdef.shape.SetAsBox(this.width/2, this.height/2);
    fixdef.restitution=1; //positively bouncy!
    fixdef.density=0.00001;
    fixdef.friction=0;
   // fixdef.isSensor=true;
    this.body.CreateFixture(fixdef);

    this.getState=function(){
        return {'p':arr(this.body.GetPosition()),
                'a':degrees(this.body.GetAngle()),
                'lv':arr(this.body.GetLinearVelocity())}
    };

    this.interpolate=function(s1, s2, q){
        return {'p':utils.interpolatePoints(s1.p, s2.p, q),
                'a':utils.interpolateInts(s1.a, s2.a, q),
                'lv':s1.lv};
    };

    this.setState=function(state){
        this.body.SetPositionAndAngle(vec(state.p), radians(state.a));
        this.body.SetLinearVelocity(vec(state.lv));
    };
    
    this.getSpeedKMH=function(){
        var velocity=arr(this.body.GetLinearVelocity());
        var len=vectors.len(velocity);
        return (len/1000)*3600;
    };

    this.setSpeed=function(speed){
        if(this.getSpeedKMH()<1) var velocity=arr(this.car.body.GetWorldVector(vec(0, -1)));
        else var velocity=arr(this.body.GetWorldVector(vec(0, -1))); //crude hax: with this version of box2d, some projectiles slow down (apparently due to collision with other bullets)
                                                                     //despite being sensor mode. Might be box2d bug. Could not find resolution in acceptable time, resetting speed every frame.
        velocity=vectors.multiply(velocity, ((speed*1000)/3600));
        this.body.SetLinearVelocity(vec(velocity));
    };

    this.impact=function(obj, cpoint, direction){
        if(obj.type=='car' || obj.type=='prop'){
            this.car.world.event('destroy', this.id);
            if(obj.type=='car'){
                obj.hit(this.damage, this.car);
            }
            if(this.onimpact) this.onimpact();
        }
    };

    this.setSpeed(this.speed);

    this.draw=function(renderer, msDuration){
        console.log('draw not implemented for projectile');
    };

    this.update=function(msDuration){
        this.setSpeed(this.speed);
    };

    return this;
}

var Mine=exports.Mine=function(pars){
    /*
    pars:
    car   - car object
    position - [x, y]
    */
    this.position=pars.position;
    this.car=pars.car;
    this.width=2;
    this.height=2;
    this.type='mine';
    this.damage=40;
    this.world=this.car.world;
    
    //initialize body
    var bdef=new box2d.b2BodyDef();
    bdef.position=vec(this.position);
    bdef.angle=0;
    bdef.fixedRotation=true;
    bdef.linearDamping=0;
    bdef.angularDamping=0;
    this.body=this.world.CreateBody(bdef);
    this.body.SetUserData(this);
    
    //initialize shape
    var fixdef=new box2d.b2FixtureDef;
    fixdef.shape=new box2d.b2PolygonShape();
    fixdef.shape.SetAsBox(this.width/2, this.height/2);
    fixdef.isSensor=true;    
    this.body.CreateFixture(fixdef);

    this.getState=function(){
        return null;
    };

    this.setState=function(state){};

    this.impact=function(obj, cpoint, direction){
        if((obj.type=='car')){
            var i, c;
            this.car.world.objects['car'].forEach(function(c){
                if((c==obj) || (vectors.distance(this.position, arr(c.body.GetPosition()))<=8)){
                    c.hit(this.damage, this.car);
                    if(this.onimpact) this.onimpact();
                }
            }, this);
            this.car.world.event('destroy', this.id);
            this.car.world.event('create', {'type':'animation', 'obj_name':'explosion', 'pars':{'position':this.position}});
        }
    };

    this.draw=function(renderer, msDuration){
        renderer.drawStatic('mine.png', this.position);
    };

    this.destroy=function(){
        this.car.world.event('destroy', this.id);
    };

    return this;
};

var Missile=exports.Missile=function(pars){
    /*
    pars:
    car   - car obj;
    position - [x, y]
    angle    - degrees
    */
    pars.speed=400;
    pars.width=0.5;
    pars.height=2.5;
    pars.damage=25;

    this.tts=50;
    Missile.superConstructor.apply(this, [pars]);

    this.destroy=function(){
        this.car.world.event('destroy', this.id);
    };

     this.onimpact=function(){
        this.car.world.event('create', {'type':'animation', 'obj_name':'explosion', 'pars':{'position':arr(this.body.GetPosition())}});
    };

    this.draw=function(renderer, msDuration){
        renderer.drawCar('missile.png', arr(this.body.GetPosition()), degrees(this.body.GetAngle()));
    };

    this.update=function(msDuration){
        this.setSpeed(this.speed);
        this.tts-=msDuration;
        if(this.tts<0){
            this.car.world.event('create', {'type':'animation', 'obj_name':'smoke', 'pars':{'position':arr(this.body.GetWorldPoint(vec([0, 1.25])))}});
            this.tts=50;
        }
    };

    return this;
}
gamejs.utils.objects.extend(Missile, Projectile);

var Bullet=exports.Bullet=function(pars){
    /*
    pars:
    car   - car obj
    position - [x, y]
    angle    - degrees
    */
    pars.speed=500;
    pars.width=0.3;
    pars.height=0.8;
    pars.damage=5;
    Bullet.superConstructor.apply(this, [pars]);
    this.color='#FFD800';


    this.onimpact=function(){
        this.car.world.event('create', {'type':'animation', 'obj_name':'small_explosion', 'pars':{'position':arr(this.body.GetPosition())}});
    };

    this.draw=function(renderer, msDuration){
        renderer.drawCar('bullet.png', arr(this.body.GetPosition()), degrees(this.body.GetAngle()));
    };

    this.destroy=function(){
        this.car.world.event('destroy', this.id);
    };
    return this;
};

gamejs.utils.objects.extend(Bullet, Projectile);

var Weapon=exports.Weapon=function(pars){
    /*
    pars:
    car - car object this weapon belongs to
    missile - missile obj function
    ammo_capacity - int, ammunition count
    fire_rate - ms, duration between firing
    */
    this.car=pars.car;
    this.ammo_capacity=pars.ammo_capacity;
    this.fire_rate=pars.fire_rate;
    this.cooldown=0;
    this.ammo=0;

    this.update=function(msDuration){
        if(this.cooldown>0)this.cooldown-=msDuration;
    };

    this.reload=function(){
        this.ammo=this.ammo_capacity;
    };

    this.getState=function(){
        return {'a':this.ammo}
    }

    this.setState=function(state){
        this.ammo=state.a;
    }

    return this;
};

var Machinegun=exports.Machinegun=function(pars){
    /*
    pars:
    car - car object this weapon belongs to
    */
    if(!pars)pars={'car':null};
    pars.ammo_capacity=50;
    pars.fire_rate=100;
    this.type='machinegun';

    Machinegun.superConstructor.apply(this, [pars]);
    this.ofst_x=-0.5;
    this.fire=function(){
        if(this.ammo&&this.cooldown<=0){
            var pos =arr(this.car.body.GetWorldPoint(vec(this.ofst_x, -(this.car.height/2+0.8))));
            this.car.world.event('create', {'type':'weapon', 'obj_name':'Bullet', 'pars':{'position':pos,
                                                                                          'angle':this.car.getAngle(),
                                                                                               'car':this.car.id}});
            this.ammo--;
            this.cooldown=this.fire_rate;
            this.ofst_x=this.ofst_x* -1;
        }
    };

    return this;
};

gamejs.utils.objects.extend(Machinegun, Weapon);

var MineLauncher=exports.MineLauncher=function(pars){
    /*
    pars:
    car - car object this weapon belongs to
    */
    if(!pars)pars={'car':null};
    pars.missile=Mine;
    pars.ammo_capacity=4;
    pars.fire_rate=500;
    this.type='minelauncher';

    MineLauncher.superConstructor.apply(this, [pars]);

    this.fire=function(){
        if(this.ammo&&this.cooldown<=0){
            var pos = arr(this.car.body.GetWorldPoint(new box2d.b2Vec2(0, (this.car.height/2+3))));
            this.car.world.event('create', {'type':'weapon', 'obj_name':'Mine', 'pars':{'position':pos,
                                                                                         'car':this.car.id}});
            this.ammo--;
            this.cooldown=this.fire_rate;
        }
    };
    return this;
};
gamejs.utils.objects.extend(MineLauncher, Weapon);

var MissileLauncher=exports.MissileLauncher=function(pars){
    if(!pars)pars={'car':null};
    pars.missile=Missile;
    pars.ammo_capacity=14;
    pars.fire_rate=300;
    this.type='missilelauncher';

    MineLauncher.superConstructor.apply(this, [pars]);

    this.fire=function(){
        if(this.ammo&&this.cooldown<=0){
            var pos = arr(this.car.body.GetWorldPoint(vec(0, -(this.car.height/2+2))));
            this.car.world.event('create', {'type':'weapon', 'obj_name':'Missile', 'pars':{'position':pos,
                                                                                         'angle':this.car.getAngle(),
                                                                                         'car':this.car.id}});
            this.ammo--;
            this.cooldown=this.fire_rate;
        }
    };

    return this;
};
gamejs.utils.objects.extend(MissileLauncher, Weapon);
