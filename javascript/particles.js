var gamejs=require('gamejs');
var box2d=require('./box2d');
var utils=require('./utils');

/*
excessive amount of particles causes everything to go to hell, dont use.
*/
var Particle=exports.Particle=function(world, color, life, position,direction, speed){
    this.position=position;
    this.world=world;
    this.color=color;
    this.life=life;
    this.direction=direction;
    this.width=0.2;
    this.height=0.2;
    var def=new box2d.b2BodyDef();
    def.position=utils.listToVector(this.position);
    def.angle=0;
    def.linearDamping=0;
    def.angularDamping=0;

    this.body=this.world.CreateBody(def);

    var shapedef=new box2d.b2PolygonDef();
    shapedef.SetAsBox(this.width/2, this.height/2);
    shapedef.density=1;
    shapedef.friction=0.3;
    shapedef.restitution=1;

    this.type='particle';
    this.body.CreateShape(shapedef);
    this.body.SetMassFromShapes();
    this.body.SetUserData({'obj':this, 'type':'projectile'});
    this.world.addParticle(this);
    console.log('boo');
    this.update=function(msDuration){
        this.life-=msDuration;
        if(this.life<=0){
            this.world.destroy(this);
        }
    };

    this.draw=function(renderer){
        gamejs.draw.line(renderer, this.color, renderer.getScreenPoint(this.body.GetWorldPoint(new box2d.b2Vec2(0, -0.1))),
                                               renderer.getScreenPoint(this.body.GetWorldPoint(new box2d.b2Vec2(0, 0.1))), 2);

    };

    this.setSpeed=function(speed){
        var velocity={x:this.direction[0]* ((speed*1000.0)/3600.0),
                  y:this.direction[1]* ((speed*1000.0)/3600.0)};
        this.body.SetLinearVelocity(velocity);
    };
    this.setSpeed(speed);
    return this;
}

exports.burst=function(pars){
    /*
     pars:
     world
     position
     direction
     color
     count
     life
    */
    if(!pars.color)pars.color='#FF6A00';
    if(!pars.count)pars.count=10;
    if(!pars.life)pars.life=500;
    var i;
    var step=80/pars.count;
    for(i=0;i<pars.count;i++){

        new Particle(pars.world, pars.color, pars.life, pars.position, utils.rotateVector(pars.direction, -40+step*(i+1)), 100);
    }

};
