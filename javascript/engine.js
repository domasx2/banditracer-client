exports.World = require('./engine/world').World;
exports.Object = require('./engine/object').Object;
exports.Entity = require('./engine/entity').Entity;
exports.utils = require('./engine/utils');
exports.box2d = require('./engine/box2d');
game = require('./engine/game');

exports.register_class = function(fn){
    game.register_class(fn);
};

exports.get_class_by_id = function(id){
    return game.get_class_by_id(id);
};

exports.get_id_by_class = function(fn){
    return game.get_id_by_class(fn);
};

