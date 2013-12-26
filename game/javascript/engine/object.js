var log = require('./logging');
var utils = require('./utils');

/*Base class for in game entities
 * 
 */

var Object = exports.Object = function(parameters){
    var parlist = ['world'];
    this.parameters = utils.process_parameters(parameters, parlist);
    
    this.id = this.parameters.id;
    this.world = this.parameters.world;
    this.world.objects[this.id] = this;
    this._tags = {};
};

Object.prototype.AM_OBJECT = true; //HAHAH IM A DUMBASS. srsly, dont know better way.


Object.prototype.add_tag = function(tag){
    this._tags[tag] = true;
};

Object.prototype.has_tag = function(tag){
    return this._tags[tag] ? true : false;
};

Object.prototype.update = function(ms_duration){
    
};

Object.prototype.draw = function(renderer){
    
};

Object.prototype.on_create = function(){

};

Object.prototype.destroy = function(){
    
};

Object.prototype.die = function(){
    
};


