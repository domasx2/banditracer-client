var gamejs=require('gamejs');
var box2d=require('./box2d');
var settings=require('./settings');
var vectors = gamejs.utils.vectors;

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

var vec=exports.vec=function(){
    if(!(arguments.length && arguments[0].hasOwnProperty('x'))){
        if(arguments.length==1) return new box2d.b2Vec2(arguments[0][0], arguments[0][1]);
        else if(arguments.length==2) return new box2d.b2Vec2(arguments[0], arguments[1]);
        else throw "kablooie"
    }else return arguments[0];
};

var vectorToList=exports.vectorToList=exports.arr=function(vect){
    if(vect.hasOwnProperty('x')) return [vect.x, vect.y];
    return vect;
};

exports.removeObjFromList=function(val, list){
    for(var i=0; i<list.length; i++) {
        if(list[i] == val) {
            list.splice(i, 1);
            break;
        }
    }
};
