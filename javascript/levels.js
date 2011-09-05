var resources=require('resources');
var gamejs=require('gamejs');

exports.init=function(){
    var lname='';
    for(var i=0; i<resources.levels.length;i++){
        lname=resources.levels[i];
        exports[lname]=gamejs.http.load('./levels/'+lname+'.json');
        exports[lname].id=lname;
    }
}
