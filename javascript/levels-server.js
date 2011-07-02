// expose level data
var IS_RINGO = false;
try {
   require('ringo/engine');
   IS_RINGO = true;
} catch (e) {}

var LEVELS_PATH = '../levels/';
var levels = exports.levels = [];
var fs=require('fs');
if (IS_RINGO) {
    fs.list(module.resolve(LEVELS_PATH)).forEach(function(fname) {
        var levelname=fname.split('.')[0];
        var content=fs.read(fs.join(module.resolve(LEVELS_PATH), fname), 'r');
        levels[levelname]=JSON.parse(content);
    });
} else {
    var dirName = __dirname +'/' + LEVELS_PATH;
    fs.readdirSync(dirName).forEach(function(fname) {
       var levelname=fname.split('.')[0];
       var content=fs.readFileSync(dirName+fname, 'utf-8');
       levels[levelname]=JSON.parse(content);
    });
};
