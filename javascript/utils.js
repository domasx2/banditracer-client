var gamejs=require('gamejs');
var math=gamejs.utils.math;
var box2d=require('./engine').box2d;
var buffs=require('./buffs');
var settings=require('./settings');
var vectors = gamejs.utils.vectors;
var renderer=require('./renderer');

exports.renderLevelBackground=function(level, render_props){
    var cache=renderer.cache;
    var width=level.size[0];
    var height=level.size[1];
    var background=new gamejs.Surface([width, height]);
    var x, y;
    var tile=cache.getTile(level.bgtile);
    var sz=tile.getSize();
    for(y=0;y<height;y=y+sz[1]){
        for(x=0;x<width;x=x+sz[0]){
                background.blit(tile, [x, y]);             
        }
    }
    
    //render decals into background
    var position, angle;
    level.decals.forEach(function(decal){
        angle=math.normaliseDegrees(decal.a);
        background.blit(cache.getDecalSprite(level.dict[decal['f']], angle), decal.p)
    }, this);

    if(render_props ||(render_props==undefined)){
        //RENDER PROPS INTO BACKGROUND
        level.props.forEach(function(prop){
            angle=math.normaliseDegrees(prop.a);
            background.blit(cache.getPropSprite(level.dict[prop['f']], angle), prop.p)
        }, this);
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

exports.resizeSurfaceToHeight=function(surface, height){
    var sz=surface.getSize();
    var q=sz[1]/height
    var new_sz=[parseInt(sz[0]/q), parseInt(sz[1]/q)];
    var s=new gamejs.Surface(new_sz[0], new_sz[1]);
    s.blit(surface, new gamejs.Rect([0, 0], s.getSize()), new gamejs.Rect([0, 0], surface.getSize()));
    return s;
};

exports.inArray=function(haystack, needle){
    for(var i=0;i<haystack.length;i++){
        if(haystack[i]==needle) return true;
    }
    return false;
};

exports.supports_html5_storage=function() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

exports.push = function(obj, obj_from, force_multiplier, debuff_duration){
    if(obj.has_tag('car') && debuff_duration)
        obj.world.create(buffs.SlipDebuff, {'duration':debuff_duration,
                                             'object':obj});
    var fvect = vectors.unit(vectors.substract(obj.get_position(), obj_from.get_position()));
    fvect = vectors.multiply(fvect, obj.get_mass()*force_multiplier);
    obj.apply_impulse(fvect, obj.get_position());
}
