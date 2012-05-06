var resources=require('./resources');
var gamejs=require('gamejs');

exports.all = [];
exports.init=function(){
    var lname='';
    for(var i=0; i<resources.levels.length;i++){
        lname=resources.levels[i];
        var level = gamejs.http.load((window.$g && $g.resourceBaseHref || '.')+'/levels/'+lname+'.json');
        level.id = lname;
        exports[lname] = level;
        exports.all.push(level);
    }
}
