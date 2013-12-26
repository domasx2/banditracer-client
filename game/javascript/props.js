var gamejs=require('gamejs');
var utils=require('./utils');
var vec=utils.vec;
var arr=utils.arr;
var vectors = gamejs.utils.vectors;
var math = gamejs.utils.math;
var engine = require('./engine');

exports.rotarrays={};

var BoxProp = exports.BoxProp = function(parameters){
    /*
     pars:
     filename
     size
     world
     position
     angle
    */
    
    var par_list = ['filename'];
    
    engine.utils.process_parameters(parameters, par_list);
    
    this.filename = parameters.filename;
    
    parameters.fixed_rotation = true;
    parameters.body_type = engine.box2d.b2Body.b2_staticBody;
    BoxProp.superConstructor.apply(this, [parameters]);
    this.add_tag('prop');
};

gamejs.utils.objects.extend(BoxProp, engine.Entity);

engine.register_class(BoxProp);
