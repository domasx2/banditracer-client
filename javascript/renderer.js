var gamejs = require('gamejs');
var utils=require('./utils');
var resources=require('./resources');
var skin=require('./skin');
var settings=require('./settings');

var sprite2rotarray=exports.sprite2rotarray=function(surface, step){
    var retv={'orig':surface,
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
    this.tiles={};
    this.animations={};
    this.fonts={};
    this.ui={};
    this.alphabet='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.,:\/!?"|()';
    this['static']={};
    var i, f;

    //load tiles
    for(i=0;i<resources.tiles.length;i++){
      f=resources.tiles[i];
      this.tiles[f]=gamejs.image.load('images/tiles/'+f);
    }

    //load cars
    for(i=0;i<resources.cars.length;i++){
        f=resources.cars[i];
        this.cars[f]=sprite2rotarray(gamejs.image.load('images/cars/'+f), 2);
    };

    //cache props
    for(i=0;i<resources.props.length;i++){
        f=resources.props[i];
        this.props[f]=sprite2rotarray(gamejs.image.load('images/props/'+f), 5);
    };

    //cache animations
    for(i=0;i<resources.animations.length;i++){
        f=resources.animations[i];
        this.animations[f]=gamejs.image.load('images/animations/'+f);
    };

    //cache ui
    for(i=0;i<resources.ui.length;i++){
        f=resources.ui[i];
        this.ui[f]=gamejs.image.load('images/ui/'+f);
    };

    //cache static
    for(i=0;i<resources['static'].length;i++){
        f=resources['static'][i];
        this['static'][f]=gamejs.image.load('images/static/'+f);
    };


    //cache fonts
    var font, letter;
    for(font in resources.fonts){
        this.fonts[font]={};
        for(i=0;i<resources.fonts[font].length;i++){
            f=resources.fonts[font][i];
            letter=f.split('.')[0];
            this.fonts[font][letter]=gamejs.image.load('images/fonts/'+font+'/'+f);
        }

    };

    this.initFont=function(name, fontSettings, color){
        this.fonts[name]={};
        var font=new gamejs.font.Font(fontSettings);
        var c;
        for(var i=0;i<this.alphabet.length;i++){
            c=this.alphabet[i];
            this.fonts[name][c]=font.render(c, color)
        }

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
        if((angle % rotarray['step'])!=0) angle=utils.normaliseAngle(parseInt(angle/rotarray['step'])*rotarray['step']);
        return rotarray[angle];
    };

    //init fonts
    for(var font in skin.fonts){
        this.initFont(font, skin.fonts[font][0], skin.fonts[font][1]);
    }

    return this;
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
            var pos=this.follow_object.alive ? utils.vectorToList(this.follow_object.body.GetPosition()) : this.follow_object.respawn_location;
            this.offset_x=Math.min(Math.max(0, pos[0]*world.phys_scale-parseInt(this.width/2)), world.width_px-this.width);
            this.offset_y=Math.min(Math.max(0, pos[1]*world.phys_scale-parseInt(this.height/2)), world.height_px-this.height);
        }
        return false;
    };


    //world point 2 screen point
    this.getScreenPoint=function(world_point){
        world_point=utils.vectorToList(world_point);
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



    this.renderHUD=function(display, car, msDuration, max_laps, time_to_start, paused, delta, bfs){
        this.surface=display;
        this.drawText('FPS: ' + parseInt(1000/msDuration), 'hud', [10, 10]);
        var size=display.getSize();

        if(car){
            this.drawText('POS: '+car.getRacePosition()+ '/'+this.world.objects['car'].length, 'hud',[size[0]/2-140,  10]);
            //lap
            this.drawText('LAP: '+car.lap+'/'+max_laps, 'hud', [size[0]/2+20,  10]);
            //speed
            this.drawText('SPEED: '+parseInt(car.getSpeedKMH()), 'hud', [10, display.getSize()[1]-40]);
            //ammo
            this.drawText('AMMO: '+parseInt(car.weapon1.ammo), 'hud', [300, display.getSize()[1]-40]);
            //mines
            this.drawText('MINES: '+parseInt(car.weapon2.ammo), 'hud', [450, display.getSize()[1]-40]);
        }

        if(settings.get('DEBUG')){
            if(delta){
                 this.drawText('D: ' + Math.abs(delta), 'hud', [10, 80]);

            }

            if(bfs){
                this.drawText('BFS: ' +bfs, 'hud', [10, 140]);
            }
        }
        if(paused){
            this.drawText('PAUSED', 'hud', [size[0]/2-100, size[1]/2], 0.75);
        }else{
            if(time_to_start){
                if(time_to_start>3000){
                    this.drawText('WAITING FOR OTHERS', 'hud', [size[0]/2-150, size[1]/2]);
                }
                else if(time_to_start>2000){
                  this.drawText('GET READY 3...', 'hud', [size[0]/2-150, size[1]/2], 0.75);
                }else if(time_to_start>1000){
                  this.drawText('GET READY 2...', 'hud', [size[0]/2-150, size[1]/2], 0.75);
                }else if(time_to_start>0){
                  this.drawText('GET READY 1...', 'hud', [size[0]/2-150, size[1]/2], 0.75);
                }else if(time_to_start> -1000){
                  this.drawText('GO!!!', 'hud', [size[0]/2-150, size[1]/2], 0.75);
                }
            }
        }


    };


    return this;
}
gamejs.utils.objects.extend(RaceRenderer, Renderer);
