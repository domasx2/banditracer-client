var gamejs = require('gamejs');
var box2d = require('./box2d');
var utils = require('./utils');
var animation = require('./animation');
var vectors=gamejs.utils.vectors;

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

    var def=new box2d.b2BodyDef();
    def.position=utils.listToVector(this.position);
    def.angle=utils.radians(this.angle);
    def.linearDamping=0;
    def.angularDamping=0;
    def.bullet=true;
    this.body=this.car.world.CreateBody(def);
    var shapedef=new box2d.b2PolygonDef();
    shapedef.SetAsBox(this.width/2, this.height/2);
    shapedef.density=1;
    shapedef.friction=0.3;
    shapedef.restitution=1;

    this.type='projectile';
    this.body.CreateShape(shapedef);
    this.body.SetMassFromShapes();
    this.body.SetUserData({'obj':this, 'type':'projectile'});

    this.getState=function(){
        return {'p':utils.vectorToList(this.body.GetPosition()),
                'a':utils.degrees(this.body.GetAngle()),
                'lv':this.body.GetLinearVelocity()}
    };

    this.interpolate=function(s1, s2, q){
        return {'p':utils.interpolatePoints(s1.p, s2.p, q),
                'a':utils.interpolateInts(s1.a, s2.a, q),
                'lv':s1.lv};
    };

    this.setState=function(state){
        this.body.SetXForm(utils.listToVector(state.p), utils.radians(state.a));
        this.body.SetLinearVelocity(utils.listToVector(state.lv));
    };


    this.setSpeed=function(speed){
        /*var velocity=this.body.GetLinearVelocity();

        velocity=utils.normaliseVector(velocity);*/

        var velocity=this.car.body.GetWorldVector(new box2d.b2Vec2(0, -1));

        velocity={x:velocity.x* ((speed*1000.0)/3600.0),
                  y:velocity.y* ((speed*1000.0)/3600.0)};
        this.body.SetLinearVelocity(velocity);

        //this.body.ApplyImpulse(velocity, this.body.GetPosition())

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

    var def=new box2d.b2BodyDef();
    def.position=utils.listToVector(this.position);
    def.angle=0;
    def.linearDamping=0;
    def.angularDamping=0;
    this.body=this.car.world.CreateBody(def);
    var shapedef=new box2d.b2PolygonDef();
    shapedef.SetAsBox(this.width/2, this.height/2);
    shapedef.density=1;
    shapedef.friction=0.3;
    shapedef.restitution=1;
    shapedef.isSensor=true;
    this.body.CreateShape(shapedef);
    this.body.SetMassFromShapes();
    this.body.SetUserData({'obj':this, 'type':'mine'});

    this.getState=function(){
        return null;
    };

    this.setState=function(state){};

    this.impact=function(obj, cpoint, direction){
        if((obj.type=='car')){
            var i, c;
            for(i=0;i<this.car.world.objects['car'].length; i++){
                c=this.car.world.objects['car'][i];
                if((c==obj) || (vectors.distance(utils.vectorToList(this.position), utils.vectorToList(c.body.GetPosition()))<=8)){
                    c.hit(this.damage, this.car);
                    if(this.onimpact) this.onimpact();

                }
            }

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
        this.car.world.event('create', {'type':'animation', 'obj_name':'explosion', 'pars':{'position':utils.vectorToList(this.body.GetPosition())}});
    };

    this.draw=function(renderer, msDuration){
        renderer.drawCar('missile.png', utils.vectorToList(this.body.GetPosition()), utils.degrees(this.body.GetAngle()));
    };

     this.update=function(msDuration){
        this.tts-=msDuration;
        if(this.tts<0){
            this.car.world.event('create', {'type':'animation', 'obj_name':'smoke', 'pars':{'position':this.body.GetWorldPoint(utils.listToVector([0, 1.25]))}});
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
        this.car.world.event('create', {'type':'animation', 'obj_name':'small_explosion', 'pars':{'position':utils.vectorToList(this.body.GetPosition())}});
    };

    this.draw=function(renderer, msDuration){
        //var pos=this.body.GetWorldPoint(new box2d.b2Vec2(0, this.height/2));
        //console.log(pos.x+' '+pos.y);
      //  renderer.drawLine(this.color, this.body.GetWorldPoint(new box2d.b2Vec2(0, -(this.height/2))), this.body.GetWorldPoint(new box2d.b2Vec2(0, this.height/2)), 2);
        renderer.drawCar('bullet.png', utils.vectorToList(this.body.GetPosition()), utils.degrees(this.body.GetAngle()));
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
            var pos =utils.vectorToList(this.car.body.GetWorldPoint(new box2d.b2Vec2(this.ofst_x, -(this.car.height/2+0.81))));
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
            var pos =utils.vectorToList(this.car.body.GetWorldPoint(new box2d.b2Vec2(0, (this.car.height/2+3))));
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
            var pos =utils.vectorToList(this.car.body.GetWorldPoint(new box2d.b2Vec2(0, -(this.car.height/2+2))));
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
