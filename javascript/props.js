var gamejs=require('gamejs');
var utils=require('./utils');
var box2d=require('./box2d');
var vec=utils.vec;
var arr=utils.arr;
var vectors = gamejs.utils.vectors;
var math = gamejs.utils.math;

exports.rotarrays={};

var BoxProp = exports.BoxProp = function(pars){
    /*
     pars:
     filename
     size
     world
     position
     angle
    */
    //width, height, filename, world, position, angle
    this.size=pars.size;
    this.width=this.size[0];
    this.height=this.size[1];
    this.angle= pars.angle ? pars.angle: 0;
    this.world=pars.world;
    this.position = pars.position;
    this.filename=pars.filename;
    this.type='prop';

    this.getAngle=function(){
        return utils.degrees(this.body.GetAngle());
    };

    this.getState=function(){return null;};
    this.setState=function(state){};
    
    //initialize body
    var bdef=new box2d.b2BodyDef();
    bdef.position=vec(this.position);
    bdef.angle=math.radians(pars.angle);
    bdef.fixedRotation=true;
    this.body=this.world.CreateBody(bdef);
    this.body.SetUserData(this);
    
    //initialize shape
    var fixdef=new box2d.b2FixtureDef;
    fixdef.shape=new box2d.b2PolygonShape();
    fixdef.shape.SetAsBox(this.width/2, this.height/2);
    fixdef.restitution=0.4; //positively bouncy!
    this.body.CreateFixture(fixdef);

    this.getAngle=function(){
        return this.angle;
    };

    this.draw=null;
    return this;
};
