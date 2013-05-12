var resources=require('./resources');
var gamejs=require('gamejs');

try{
	var compiled = require('./levels_compiled').levels;
}catch(e){
	var compiled = {};
}

exports.all = [];
exports.init=function(){
	if(!exports.all.length){
	    var lname='';
	    for(var i=0; i<resources.levels.length;i++){
	        lname=resources.levels[i];
	        var level;
	        if(compiled[lname]) level = compiled[lname];
	        else level = gamejs.http.load('/levels/'+lname+'.json');
	        level.id = lname;
	        exports[lname] = level;
	        exports.all.push(level);
	    }
	}
}
