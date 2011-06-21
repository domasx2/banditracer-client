
/*
rotates a sprite and returns array angle:sprite
for each angle.

step is angles to rotate by
*/

var gamejs=require('gamejs');
var settings=require('./settings');
var vectors = require('gamejs/utils/vectors');


exports.renderBackgroundFromTiles=function(width, height, tiles, cache){
    var tile_scale=settings.get('TILE_SCALE');

    var background=new gamejs.Surface([width*tile_scale, height*tile_scale]);
    var x, y, tile, img;
    for(y=height-1;y>=0;y--){
        for(x=width-1;x>=0;x--){
                tile=tiles[y*width+x];
                if(tile){
                    img=cache.getTile(tiles[y*width+x]);
                    background.blit(img, [x*tile_scale, y*tile_scale]);
                }
            }
    }
    return background;
};

exports.interpolatePoints=function(pt1, pt2, q){
    return [pt1[0]+(pt2[0]>pt1[0]? 1 : -1)*Math.abs(pt2[0]-pt1[0])*q,
            pt1[1]+(pt2[1]>pt1[1]? 1 : -1)*Math.abs(pt2[1]-pt1[1])*q];

};

exports.interpolateInts=function(a1, a2, q){

    return a1+(a2>a1? 1: -1)*Math.abs(a2-a1)*q;
};

var copy=exports.copy=function(src, dest){
    for(var attr in src) dest[attr]=src[attr];
    return dest;
};

var normaliseAngle=exports.normaliseAngle=function(angle){
    while(angle>359)angle-=360;
    while(angle<0)angle+=360;
    return angle;
};

var degrees=exports.degrees=function(radians) {
    var pi = Math.PI;
    return (radians)*(180/pi);
};

var radians=exports.radians=function(degrees) {
    var pi = Math.PI;
    return (degrees)*(pi/180);
};

var listToVector=exports.listToVector=function(list){
    if(!list.hasOwnProperty('x')){
        return {x:list[0], y:list[1]};
    }else return list;
};

var vectorToList=exports.vectorToList=function(vect){
    if(vect.hasOwnProperty('x')) return [vect.x, vect.y];
    return vect;
};

exports.rotateVector=function(vect, angle){
    vect=vectorToList(vect);
    if(angle>0){
        angle=radians(angle);
        return [vect[0]* Math.cos(angle)-vect[1]*Math.sin(angle),
                vect[0]* Math.sin(angle)+vect[1]*Math.cos(angle)];
    }else if(angle < 0){
        angle=radians(-angle);
        return [vect[0]*Math.cos(angle)+vect[1]*Math.sin(angle),
                -1*vect[0]*Math.sin(angle)+vect[1]*Math.cos(angle)];
    }
    else{
        return vect;
    }
};

exports.vectorDotProduct=function(vect1, vect2){
    vect1=vectorToList(vect1);
    vect2=vectorToList(vect2);
    return vect1[0]*vect2[0]+vect1[1]*vect2[1];
};

var vectorLength=exports.vectorLength=function(vect){
    vect=vectorToList(vect);
    return Math.sqrt(vect[0]*vect[0]+vect[1]*vect[1]);
};

var normaliseVector=exports.normaliseVector=function(vect){
    vect=vectorToList(vect);
    var len=vectorLength(vect);
    if(len>0) return [vect[0]/len, vect[1]/len];
    return [0, 0];
};

exports.angleBetweenVectors=function(vect1, vect2){
    vect1=vectors.unit(vectorToList(vect1));
    vect2=vectors.unit(vectorToList(vect2));

    var len1=vectorLength(vect1);
    var len2=vectorLength(vect2);
    if(len1&&len2){
        var cosan=(vect1[0]*vect2[0]+vect1[1]*vect2[1])/(len1*len2);
    }else return 0;

    try{
        return degrees(Math.acos(cosan));
    }catch(e){
        console.log(e);
        return 180;
    }
};

exports.removeObjFromList=function(val, list){
    for(var i=0; i<list.length; i++) {
        if(list[i] == val) {
            list.splice(i, 1);
            break;
        }
    }
};
