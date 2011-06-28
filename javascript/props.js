var gamejs=require('gamejs');
var utils=require('./utils')
var box2d=require('./box2d');


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

    this.getAngle=function(){
        return utils.degrees(this.body.GetAngle());
    };

    this.getState=function(){return null;};
    this.setState=function(state){};

    var bdef=new box2d.b2BodyDef();
    bdef.position=utils.listToVector(this.position);
    bdef.angle=utils.radians(pars.angle);
    bdef.fixedRotation=true;
    this.body=this.world.CreateBody(bdef);
    var sdef=new box2d.b2PolygonDef();
    sdef.SetAsBox(this.width/2, this.height/2);
    sdef.restitution=0.4;
    this.body.CreateShape(sdef);
    this.type='prop';
    this.body.SetUserData({'type':'prop', 'obj':this});



    this.getAngle=function(){
        return this.angle;
    };

    this.draw=null;
    return this;
};
/*
exports.buildProp=function(filename, world,cache, position, angle){
    var size=cache.props[filename].orig.getSize();
    var width=size[0]/world.phys_scale;
    var height=size[1]/world.phys_scale;
    var ofst=Math.max(width, height)/2
    return new BoxProp(width,
                                height,
                                rotarray,
                                world,
                                utils.listToVector([position[0]+ofst, position[1]+ofst]),//world editor lists top left corner pos, we need center
                                utils.normaliseAngle(-angle));//angles are reversed between editor and this. beats me.


};*/
