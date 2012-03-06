var box2d = require('./box2d');

var vec = exports.vec = function(){
    if(!(arguments.length && arguments[0].hasOwnProperty('x'))){
        if(arguments.length==1) return new box2d.b2Vec2(arguments[0][0], arguments[0][1]);
        else if(arguments.length==2) return new box2d.b2Vec2(arguments[0], arguments[1]);
        else throw "kablooie"
    }else return arguments[0];
};

var arr = exports.arr = function(vect){
    if(vect.hasOwnProperty('x')) return [vect.x, vect.y];
    return vect;
};

exports.process_parameters = function(parameters, parameter_list){
    parameter_list.forEach(function(parameter){
        var name, default_value = undefined;
        if(parameter instanceof Array){
            name = parameter[0];
            if(parameter.length > 1){
                default_value = parameter[1];
            }
        } else {
            name = parameter;
        }
        
        if(!(name in parameters)){
            if(default_value != undefined){
                parameters[name] = default_value;
            } else {
                throw 'Missing parameter: '+name;   
            }
        }
    });
    return parameters;
};

var copy = exports.copy = function(src, dest){
    for(var attr in src) dest[attr] = src[attr];
    return dest;
};