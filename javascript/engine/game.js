

exports._next_class_id = 1;

exports._registered_classes = {};

exports.register_class = function(fn){
    exports._registered_classes[exports._next_class_id++] = fn;
};

exports.get_class_by_id = function(id){
    if(id in exports._registered_classes){
        return exports._registered_classes[id];
    }else{
        throw 'Unknown class for id: '% id;
    }
};

exports.get_id_by_class = function(fn){
    for(var id in exports._registered_classes){
        if(fn === exports._registered_classes[id]) return id;
    }
    throw 'No id for class!'
};
