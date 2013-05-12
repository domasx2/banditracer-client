exports.world = require('./javascript/world');
exports.settings = require('./javascript/settings');
exports.car_descriptions = require('./javascript/car_descriptions');
exports.combatracer=require('./javascript/combatracer');
exports.cars=require('./javascript/cars');


var LEVELS_PATH = './levels/';
var levels = exports.levels = [];
var fs=require('fs');
  var dirName = __dirname +'/' + LEVELS_PATH;
  fs.readdirSync(dirName).forEach(function(fname) {
     var levelname=fname.split('.')[0];
     var content=fs.readFileSync(dirName+fname, 'utf-8');
     levels[levelname]=JSON.parse(content);
  });
