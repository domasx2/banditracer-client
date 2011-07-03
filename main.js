exports.world = require('./javascript/world');
exports.settings = require('./javascript/settings');
exports.car_descriptions = require('./javascript/car_descriptions');

// expose level data
var IS_RINGO = false;
try {
   require('ringo/engine');
   IS_RINGO = true;
} catch (e) {}

var LEVELS_PATH = './levels/';
var levels = exports.levels = [];
var fs=require('fs');
if (IS_RINGO) {
    var repo = getRepository(LEVELS_PATH);
    repo.getResources().forEach(function(resource) {
        // (sim) i hope this regex also work on linux to split on backslash
        var levelname = resource.getPath().split(/[\/\\]/).slice(-1)[0].split('.')[0];
        levels[levelname]=JSON.parse(resource.content);
    });
} else {
    var dirName = __dirname +'/' + LEVELS_PATH;
    fs.readdirSync(dirName).forEach(function(fname) {
       var levelname=fname.split('.')[0];
       var content=fs.readFileSync(dirName+fname, 'utf-8');
       levels[levelname]=JSON.parse(content);
    });
};
