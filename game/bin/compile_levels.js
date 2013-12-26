var resources=require('../javascript/resources');
var fs=require('fs');
var path = require('path');

var levels = {}, lpath, lname;
for(var i=0; i<resources.levels.length;i++){
    lname=resources.levels[i];
    lpath = path.join(__dirname, '..', 'levels', lname+'.json');
    console.log('Reading '+lpath+'...')
    levels[lname] = JSON.parse(fs.readFileSync(lpath, 'utf-8'));
}
var outfile=path.join(__dirname, '..', 'javascript', 'levels_compiled.js');
console.log("Writing to "+outfile);
fs.writeFileSync(outfile, 'exports.levels='+JSON.stringify(levels)+';');
