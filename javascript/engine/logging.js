var TYPE_WARNING = exports.TYPE_WARNING = 'warning';
var TYPE_ERROR = exports.TYPE_ERROR = 'error';

var Logger = exports.Logger = function (){
    
};

Logger.prototype.log = function (type, message){
    console.log(type, message);
}

exports.logger = new Logger();

exports.warning = function(message){
    exports.logger.log(TYPE_WARNING, message);
}

exports.error = function(message){
    exports.logger.log(TYPE_ERROR, message);
}
