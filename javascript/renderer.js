var gamejs = require('gamejs');
var utils=require('./utils');
var vec=utils.vec;
var arr=utils.arr;

var vectors = gamejs.utils.vectors;
var math = gamejs.utils.math;
radians=math.radians;
degrees=math.degrees;

var resources=require('./resources');
var skin=require('./skin');
var settings=require('./settings');

//hax gamejs to render font properly with a very hax fix
gamejs.font.Font.prototype.size=function(text){
    var metrics = this.sampleSurface.context.measureText(text);
    return [metrics.width*3, this.fontHeight];    
};

gamejs.font.Font.prototype.render = function(text, color) {
    var dims = this.size(text);
    var surface = new gamejs.Surface(dims);
    var ctx = surface.context;
    ctx.save();
    ctx.font = this.sampleSurface.context.font;
    ctx.textBaseline = this.sampleSurface.context.textBaseline;
    ctx.textAlign = this.sampleSurface.context.textAlign;
    ctx.fillStyle = ctx.strokeStyle = color || "#000000";
    ctx.fillText(text, dims[0]/2, surface.rect.height, surface.rect.width);
    ctx.restore();
    
    //scans the surface left to right and right to left to find where hte letter begins and then trims it.

    
    var s=0, e=dims[0], i;
    var arr=new gamejs.surfacearray.SurfaceArray(surface);
    
    //left to right
    var found=false;
    for(s=0;s<arr.getSize()[0];s++){
        for(i=0;i<arr.getSize()[1];i++){
            if(arr.get(s, i)[3]!=0){
                found=true;
                break;
            }
        }
        if(found)break;
    }
    
    //right to left
    found=false;
    for(e=arr.getSize()[0]-1;e>=0;e--){
        for(i=0;i<arr.getSize()[1];i++){
            if(arr.get(e, i)[3]!=0){
                found=true;
                break;
            }
        }
        if(found) break;
    }
    var h=Math.floor(dims[1]);
    var newsurface=new gamejs.Surface([e-s, h]);
    newsurface.blit(surface, new gamejs.Rect([0, 0], newsurface.getSize()),
                             new gamejs.Rect([s, 0], [e-s, h]));
    return newsurface;
    
    
};

var sprite2rotarray=exports.sprite2rotarray=function(surface, step){
    var retv={'orig':surface,
              0:surface,
              'step':step};
    var orig_size=surface.getSize();
    var timg;
    if(orig_size[0]!=orig_size[1]){
        var s=Math.max(orig_size[0], orig_size[1]);
        timg=new gamejs.Surface(s, s)
        timg.blit(surface, [(s-orig_size[0])/2, (s-orig_size[1])/2]);
        retv[0]=timg;
    }else{
        timg=surface;
        retv[0]=surface;
    }
    for(var angle=step;angle<360;angle+=step){
        retv[angle]=gamejs.transform.rotate(timg, angle);
    }
    return retv;
};

var ImageCache=exports.ImageCache = function(){
    this.cars={};
    this.props={};
    this.decals={};
    this.tiles={};
    this.animations={};
    this.fonts={};
    this.ui={};
    this.alphabet='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.,:\/!?"|()';
    this['static']={};
    
    //load tiles    
    resources.tiles.forEach(function(f){
      this.tiles[f]=gamejs.image.load('images/tiles/'+f);
    }, this);
    
    //load cars
    resources.cars.forEach(function(f){
        this.cars[f]=sprite2rotarray(gamejs.image.load('images/cars/'+f), 2);
    }, this);
    
    //cache props
    resources.props.forEach(function(f){
        this.props[f]=sprite2rotarray(gamejs.image.load('images/props/'+f), 5);
    }, this);
    
    //cache decals
    resources.decals.forEach(function(f){
        this.decals[f]=sprite2rotarray(gamejs.image.load('images/decals/'+f), 90);
    }, this);
    
    //cache animations
    resources.animations.forEach(function(f){
        this.animations[f]=gamejs.image.load('images/animations/'+f);
    }, this);
    
    //cache ui
    resources.ui.forEach(function(f){
        this.ui[f]=gamejs.image.load('images/ui/'+f);
    }, this);
    
    //cache static
    resources['statics'].forEach(function(f){
        this['static'][f]=gamejs.image.load('images/static/'+f);
    }, this); 
    
/*    //cache fonts
    var font='hud', letter;
    
    this.fonts[font]={};
    resources.fonts[font].forEach(function(f){
        letter=f.split('.')[0];
        this.fonts[font][letter]=gamejs.image.load('images/fonts/'+font+'/'+f);
    }, this);      */     
    
    
    this.initFont=function(name, fontSettings, color){
        this.fonts[name]={};
        var font=new gamejs.font.Font(fontSettings);
        
        var c;
        for(var i=0;i<this.alphabet.length;i++){
            c=this.alphabet[i];
            this.fonts[name][c]=font.render(c, color);
        }
        
    };
    
    this.getDecalSprite=function(filename, angle){
        return this.getSpriteFromRotarray(this.decals[filename], angle);
    };
    
    this.getPropSprite=function(filename, angle){
        return this.getSpriteFromRotarray(this.props[filename], angle);
    };
    
    this.getCarSprite=function(filename, angle){
        return this.getSpriteFromRotarray(this.cars[filename], angle);  
    };
    
    this.getTile=function(filename){
        return this.tiles[filename];
    };
    
   
    this.getLetter=function(font, letter){
        return this.fonts[font][letter];  
    };
    
    this.getTextSize=function(text, font){
        var w=0, h=0, c, l, sz;
        if(text){ 
            for(var i=0;i<text.length;i++){
                c=text[i];
                if(c==' ')w+=8;
                else{
                    l=this.getLetter(font, c);
                    if(l){
                        sz=l.getSize();
                        w+=sz[0];
                        h=sz[1];
                    }
                }
            }
            return [w, h];
        }else return [0, 0];
    };
    
    this.getAnimationFrameCount=function(filename){
        var sz= this.animations[filename].getSize();
        return sz[0]/sz[1];
    };
    
    this.getAnimationSheet=function(filename){
        return this.animations[filename];    
    };
    
    this.getUIImage=function(filename){
        return this.ui[filename];  
    };
    this.getStaticSprite=function(filename){
        return this['static'][filename];
    };
    
    this.getSpriteFromRotarray=function(rotarray, angle){
        if((angle % rotarray['step'])!=0) angle=math.normaliseDegrees(parseInt(angle/rotarray['step'])*rotarray['step']);
        return rotarray[angle];
    };
    
    //init fonts
    this.initFont('hud', skin.fonts['hud'][0], skin.fonts['hud'][1]);
    

    return this;
};

exports.cache=null;

exports.init=function(){
    exports.cache=new ImageCache();
    return exports.cache;
};


var Renderer=exports.Renderer=function(width, height, cache){
    
    this.width=width;
    this.height=height;
    this.cache=cache;
    this.surface=null;
    
    this.textLength=function(text, font){
        var c;
        var len=0;
        for(var i=0;i<text.length;i++){
            c=text[i];
            if(c==' '){
                len+=8;
            }else{
                s=this.cache.getLetter(font, c);
                len+=s.getSize()[0];
            }
        }
        return len;
    };
    
    this.fillBackground=function(color){
        gamejs.draw.rect(this.surface, color, new gamejs.Rect([0, 0], this.surface.getSize()));
    };
    
    this.drawRect=function(color, pos, size, w){
        w = (w || w===0) ? w : 1;
        gamejs.draw.rect(this.surface, color, new gamejs.Rect(pos, size), w);
    };
    
    this.drawLine=function(color, pos1, pos2, w){
        w = (w || w===0) ? w : 1;
        gamejs.draw.line(this.surface, color, pos1, pos2, w);
    }
    
    this.drawText=function(text, font, position, zoom, draw_on){
        /*
        font - font name
        position - position in SCREEN COORDINATES !!
        */
        ofst=position[0];
        zoom = zoom  ? zoom: 1;
        var i, c, s;
        for(i=0;i<text.length;i++){
            c=text[i];
            if(c==' ')ofst+=8/zoom;
            else{
                s=this.cache.getLetter(font, c);
                if(zoom==1){
                    r1=[ofst, position[1]-10];
                }
                else{
                    size=s.getSize();
                    r1=new gamejs.Rect([ofst, position[1]], [parseInt(size[0]/zoom), parseInt(size[1]/zoom)]);
                
                }
                (draw_on ? draw_on: this.surface).blit(s, r1);
                ofst+=s.getSize()[0]/zoom;
            }
        }        
    };
    return this;  
};

var UIRenderer=exports.UIRenderer=function(width, height, cache){
    UIRenderer.superConstructor.apply(this, [width, height, cache]);
    this.cache=cache;
    this.surface=null;
    
    this.setSurface=function(surface){
        this.surface=surface;
    };
    
    this.drawUIImage=function(filename, pos){
        this.surface.blit(this.cache.getUIImage(filename), pos);
    };
    
};

gamejs.utils.objects.extend(UIRenderer, Renderer);

var RaceRenderer = exports.RaceRenderer = function(width, height, world, background, cache, follow_object){
    RaceRenderer.superConstructor.apply(this, [width, height, cache]);
    this.display_width=width;
    this.display_height=height;
    this.world = world;
    this.size=[this.width, this.height];
    this.follow_object=follow_object;
    this.offset_x = 0;
    this.offset_y = 0;
    this.background=background;
    this.surface=null;
    this.st=new gamejs.Surface(this.display_width*2, this.display_height*2);
    this.display=null;
    this.zoom=1;
    this.r1=new gamejs.Rect([0, 0], [this.display_width, this.display_height]);
    this.r2=new gamejs.Rect([0, 0], [this.width, this.height]);
    
    this.follow=function(obj){
        this.follow_object=obj;  
    };
    
    //update camera offset
    this.updateOffset=function(){
        if(this.follow_object){
            var pos=this.follow_object.alive ? arr(this.follow_object.body.GetPosition()) : this.follow_object.respawn_location;
            this.offset_x=Math.min(Math.max(0, pos[0]*world.phys_scale-parseInt(this.width/2)), world.width_px-this.width);
            this.offset_y=Math.min(Math.max(0, pos[1]*world.phys_scale-parseInt(this.height/2)), world.height_px-this.height);
        }
        return false;
    };
       
    //world point 2 screen point
    this.getScreenPoint=function(world_point){
        world_point=arr(world_point);
        return [world_point[0]*this.world.phys_scale-this.offset_x, world_point[1]*this.world.phys_scale-this.offset_y];
    };
    
    this.drawBackground=function(){
      //  this.blit(this.background, [0, 0], new gamejs.Rect(-this.offset_x, -this.offset_y, this.width, this.height));
      this.surface.blit(this.background, new gamejs.Rect([0, 0], [this.width, this.height]), new gamejs.Rect([this.offset_x, this.offset_y], [this.width, this.height]));
    };
    
    //zoom
    this.setZoom=function(zoom){
        var new_width=parseInt(this.display_width/zoom);
        var new_height=parseInt(this.display_height/zoom);
        if((new_width<=this.world.width_px) && (new_height<=this.world.height_px)){
            this.zoom=zoom;
            this.width=parseInt(this.display_width/zoom);
            this.height=parseInt(this.display_height/zoom);
            this.r2=new gamejs.Rect([0, 0], [this.width, this.height]);
            this.st=new gamejs.Surface(this.width, this.height);
        }
        
    };
    
    this.increaseZoom=function(){
        if(this.zoom<1)this.setZoom(this.zoom+0.01);
    };
    
    this.decreaseZoom=function(){
        if(this.zoom>0.5)this.setZoom(this.zoom-0.01);
    };
    
    //render
    this.render=function(display){
        if(this.zoom==1)this.surface=display;
        else this.surface=this.st;
        this.updateOffset();
        this.drawBackground();
        this.world.draw(this);
        if(this.zoom!=1){
            display.blit(this.surface, this.r1, this.r2);
        }
    };
    
    //DRAW FUNCTIONS
    
    this.drawLine=function(color, pt1, pt2, width){
        /*
         pt1, pt2 - points in world coordinates
         width - width in pixels
        */
        gamejs.draw.line(this.surface, color, this.getScreenPoint(pt1),
                                               this.getScreenPoint(pt2), 2);
    };
    
    this.drawProp=function(filename, pos, angle){
        /*
        pos - position in world coordinates
        angle - angle, degrees
        */
        var sprite=this.cache.getPropSprite(filename, angle ? angle : 0)
        var ofst=sprite.getSize()[0]/2;
        pos=this.getScreenPoint(pos);
        this.surface.blit(sprite, [pos[0]-ofst, pos[1]-ofst]);  
    };
    
    this.drawDecal=function(filename, pos, angle){
        /*
        pos - position in world coordinates
        angle - angle, degrees
        */
        var sprite=this.cache.getDecalSprite(filename, angle ? angle : 0)
        var ofst=sprite.getSize()[0]/2;
        pos=this.getScreenPoint(pos);
        this.surface.blit(sprite, [pos[0]-ofst, pos[1]-ofst]);  
    };
    
    this.drawCar=function(filename, pos, angle){
        /*
        pos - position in world coordinates
        angle - angle, degrees
        */
        var sprite=this.cache.getCarSprite(filename, angle ? angle : 0)
        var ofst=sprite.getSize()[0]/2;
        pos=this.getScreenPoint(pos);
        this.surface.blit(sprite, [pos[0]-ofst, pos[1]-ofst]);

    };
    
    this.drawStatic=function(filename, pos){
        var sprite=this.cache.getStaticSprite(filename);
        var sz=sprite.getSize();
        pos=this.getScreenPoint(pos);
        this.surface.blit(sprite, [pos[0]-sz[0]/2, pos[1]-sz[1]/2]);
    };
    
    this.drawAnimation=function(filename, pos, frame){
        /*
        pos - position in world coordinates
        frame - frame number (starts with 0 ) 
        */
        var sheet=this.cache.getAnimationSheet(filename)
        var w=sheet.getSize()[1];
        pos=this.getScreenPoint(pos);
        this.surface.blit(sheet, new gamejs.Rect([pos[0]-w/2, pos[1]-w/2], [w, w]), new gamejs.Rect([frame*w, 0], [w, w]))
    };
    
    this.renderHUD=function(display,  pars){
        /*
         pars:
         car - car to render hud for
         max_laps - max laps of the track
         time_to_start - time till game start
         paused - is game paused?
         delta - perceived difference between server and client time
         bfs - bad frames. number of frames where nearest further state was unknown and had to simulate world to make up for it
         message - a message to display onscreen
        */

        this.surface=display;
        this.drawText('FPS: ' + parseInt(1000/pars.msDuration), 'hud', [10, 10]);
        var size=display.getSize();
        
        var car=pars.car;
        if(car){        
            this.drawText('POS: '+car.getRacePosition()+ '/'+this.world.objects['car'].length, 'hud',[size[0]/2-140,  10]);
            //lap
            this.drawText('LAP: '+car.lap+'/'+pars.max_laps, 'hud', [size[0]/2+20,  10]);
            //speed
            this.drawText('SPEED: '+parseInt(car.getSpeedKMH()), 'hud', [10, display.getSize()[1]-40]);
            //ammo
            
            if(car.front_weapon) this.drawText('AMMO: '+parseInt(car.front_weapon.ammo), 'hud', [250, display.getSize()[1]-40]);
            //mines
            if(car.rear_weapon) this.drawText('MINES: '+parseInt(car.rear_weapon.ammo), 'hud', [450, display.getSize()[1]-40]);
        }
        
        if(settings.get('DEBUG')){
            if(pars.delta){
                 this.drawText('D: ' + Math.abs(pars.delta), 'hud', [10, 80]);          
            }
            if(pars.bfs){
                this.drawText('BFS: ' +pars.bfs, 'hud', [10, 140]);
            }
        }
        if(pars.paused){
            this.drawText('PAUSED', 'hud', [size[0]/2-100, size[1]/2], 0.75);
        }else if(pars.message){
            this.drawText(pars.message, 'hud', [size[0]/2-100, size[1]/2], 0.75);
        }else{
            var tts=pars.time_to_start;
            if(tts){
                if(tts>3000){
                    this.drawText('WAITING FOR OTHERS', 'hud', [size[0]/2-150, size[1]/2]);
                }
                else if(tts>2000){
                  this.drawText('GET READY 3...', 'hud', [size[0]/2-150, size[1]/2], 0.75);
                }else if(tts>1000){
                  this.drawText('GET READY 2...', 'hud', [size[0]/2-150, size[1]/2], 0.75);
                }else if(tts>0){
                  this.drawText('GET READY 1...', 'hud', [size[0]/2-150, size[1]/2], 0.75);
                }else if(tts> -1000){
                  this.drawText('GO!!!', 'hud', [size[0]/2-150, size[1]/2], 0.75);
                }
            }
        }   
    };  
    
    return this;
}
gamejs.utils.objects.extend(RaceRenderer, Renderer);
