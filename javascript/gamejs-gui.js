var gamejs = require('gamejs');
var draw=gamejs.draw;

var EVT_FOCUS = exports.EVT_FOCUS = 'focus';
var EVT_BLUR = exports.EVT_BLUR = 'blur';
var EVT_MOUSE_OVER = exports.EVT_MOUSE_OVER = 'mouse_over';
var EVT_MOUSE_OUT = exports.EVT_MOUSE_OUT = 'mouse_out';
var EVT_KEY_DOWN = exports.EVT_KEY_DOWN= gamejs.event.KEY_DOWN;
var EVT_KEY_UP = exports.EVT_KEY_UP = gamejs.event.KEY_UP;
var EVT_MOUSE_UP = exports.EVT_MOUSE_UP = gamejs.event.MOUSE_UP;
var EVT_MOUSE_DOWN = exports.EVT_MOUSE_DOWN = gamejs.event.MOUSE_DOWN;
var EVT_MOUSE_WHEEL = exports.EVT_MOUSE_WHEEL = gamejs.event.MOUSE_WHEEL;
var EVT_MOUSE_MOTION = exports.EVT_MOUSE_MOTION = gamejs.event.MOUSE_MOTION;
var EVT_BTN_CLICK = exports.EVT_BTN_CLICK = 'btn_click';
var EVT_CLOSE = exports.EVT_CLOSE = 'close';
var EVT_SCROLL = exports.EVT_SCROLL = 'scroll';
var EVT_DRAG = exports.EVT_DRAG = 'drag';
var EVT_MOVE = exports.EVT_MOVE = 'move';
var EVT_RESIZE = exports.EVT_RESIZE = 'resize';
var EVT_PAINT = exports.EVT_PAINT = 'paint';
var EVT_CHANGE = exports.EVT_CHANGE = 'change'; //input change for input elements
var DEFAULT_FONT_DESCR='14px Verdana';
var gamejs_ui_next_id=1;


/**********************************************
 *cloneEvent
 *
 * evt- event to clone
 * offset [x, y] - substract from events position.
 *
 *
 */
function cloneEvent(evt, offset){
    var new_evt={};
    for(key in evt){
        new_evt[key]=evt[key];
    }
    if(new_evt.pos && offset){
        new_evt.pos=[new_evt.pos[0]-offset[0], new_evt.pos[1]-offset[1]];
    }
    return new_evt; 
}

//returns pos of size2 if to be placed at the center of size1
function getCenterPos(size1, size2){
    return [Math.max(parseInt((size1[0]-size2[0])/2), 0),
            Math.max(parseInt((size1[1]-size2[1])/2), 0)];
}

//make a view draggable
var draggable=exports.draggable=function(view){
    view.grab_pos=null;
    view.on(EVT_MOUSE_DOWN, function(event){
        this.grab_pos=event.global_pos;
    }, view);
    view.getGUI().on(EVT_MOUSE_UP, function(event){
        this.grab_pos=null;
    }, view);
    
    view.getGUI().on(EVT_MOUSE_MOTION, function(event){
        if(this.grab_pos){
            var old_position=this.position;

            var new_position=[this.position[0]+event.pos[0]-this.grab_pos[0],
                              this.position[1]+event.pos[1]-this.grab_pos[1]];
            

            this.grab_pos=event.pos;
            this.move(new_position);
            this.despatchEvent({'type':EVT_DRAG,
                                'old_pos':old_position,
                                'new_pos':this.position});
        }
    }, view);
};

/*****************************************************
 *CachedFont
 *font cache where each letter is saved as an image. caching is lazy
 *
 *font: {String|Array} - either font description as string, or assoc array character:gamejs.Surface
 *color - color of the font, not required if image array is supplied. defaults to black.
 */
var CachedFont=exports.CachedFont=function(font, color){
    this.space_width=3;
    this.tab_width=12;
    this.chars={}; //character:surface;
    this.font=null;
    if((typeof font)=='string'){
        color = color ? color : '#000';
        this.color=color;
        this.font=new gamejs.font.Font(font);
        
    }else{
        this.chars=font;
        this.font=new gamejs.font.Font(DEFAULT_FONT_DESCR);
        this.color='#000';
    }
    //space width - 1/3 of m's width
    this.space_width=parseInt(Math.ceil(this.getCharSurface('m').getSize()[0]/3));
    this.tab_width=3*this.space_width;
};

CachedFont.prototype.getCharSurface=function(c){
    if(!this.chars[c]){
        var s=this.font.render(c, this.color);
        this.chars[c]=s;
    }
    return this.chars[c];
};

CachedFont.prototype.getTextSize=function(text){
    var w=0, h=0, c, l, sz;
    if(text){ 
        for(var i=0;i<text.length;i++){
            c=text[i];
            if(c==' ')w+=this.space_width;
            else if(c=='\t')w+=this.tab_width;
            else{
                l=this.getCharSurface(c);
                if(l){
                    sz=l.getSize();
                    w+=sz[0];
                    h=Math.max(sz[1], h);
                }
            }
        }
        if(!h) h=this.getCharSurface('m').getSize()[1];
        return [w, h];
    }else return [0, 0];
};

CachedFont.prototype.render=function(surface, text, position, space_width){
    ofst=position[0];
    var space_width=space_width? space_width : this.space_width;
    var i, c, s;
    for(i=0;i<text.length;i++){
        c=text[i];
        if(c==' ')ofst+=space_width;
        else if(c=='\t')ofst+=this.tab_width;
        else{
            s=this.getCharSurface(c);
            r1=[ofst, position[1]];
            surface.blit(s, r1);
            ofst+=s.getSize()[0];
        }
    }        
    
};


exports.DEFAULT_FONT=new CachedFont('12px Verdana', 'black');

/******************************************************
 *view
 *
 *contains other views, handles and despatches events
 *pars:
 *
 *parent - parent view
 *size  [x, y]
 *position [x, y]
 *surface - if provided, this surface is used instead of creating a new one
 *visible
 */
var View=exports.View=function(pars){
    this.type='view';
    this.id=gamejs_ui_next_id++;
    if(!pars.size) throw "View: size must be specified"
    this.size=pars.size;
    if(!pars.position) pars.position=[0, 0];
    this.position=[parseInt(pars.position[0]), parseInt(pars.position[1])];
    this.surface=pars.surface ? pars.surface : new gamejs.Surface(this.size);
    if(pars.parent===undefined) throw "Element's parent not given."
    this.parent=pars.parent;
    if(pars.visible===undefined){
        this.visible=true;
    }else{
        this.visible=pars.visible;
    }
    if(this.parent) this.parent.addChild(this);
    
    this.children=[];
    this._refresh=true;
    
    //is the mouse over this view?
    this.hover=false;
    
    //is this view focused?
    this.focus=false;
    
    //evenet type: [{'callback':x, 'scope':y, ...]
    this.listeners={};
    return this;
    
};

/**
 *remove child. this effectively destroys the child and its children
 *
 *child - View object or view id
 */
View.prototype.removeChild=function(child){
    if(typeof(child)!='number')child=child.id;
    for(var i=0;i<this.children.length;i++){
        if(this.children[i].id==child){
            child=this.children.splice(i, 1);
            this.refresh();
            return true;
        }
    }
    return false;
}

/**
 *calls parent's removeChild
 */
View.prototype.destroy=function(){
    if(this.parent)this.parent.removeChild(this);
}

View.prototype.getRect=function(){
    return new gamejs.Rect(this.position, this.size);  
};

//child views


View.prototype.addChild=function(child){
    this.children.push(child);
}

//redraw this view
View.prototype.draw=function(){
    if(!this.visible){
        if(this._refresh){
            this._refresh=false;
            return true;
        }
        return false;
    }
    
    var painted=false; //has something been repainted in this view?
    //does this view need repainting?
  
    this.children.forEach(function(child){
        //draw children if this view has been repainted or child has been repainted
        if(child.draw() || this._refresh){
            painted=true;
        }
    }, this);
    
    if(this._refresh || painted){
        this.paint();
        this.despatchEvent({'type':EVT_PAINT, 'surface':this.surface});
        this.children.forEach(function(child){
            if(child.visible) this.blitChild(child);
        }, this)
        painted=true;
        this._refresh=false;
    }
    
    return painted;
};

View.prototype.blitChild=function(child){
    this.surface.blit(child.surface, child.position);
};

//actual draw code, override
View.prototype.paint=function(){
    this.surface.clear();
};

View.prototype.update=function(msDuration){};

//update view state
View.prototype._update=function(msDuration){
    this.children.forEach(function(child){
        child._update(msDuration);        
    });
    this.update(msDuration);
};

View.prototype.on=function(event_type, callback, scope){
    if(!this.listeners[event_type])this.listeners[event_type]=[];
    this.listeners[event_type].push({'callback':callback, 'scope':scope});
};

View.prototype.despatchEventToChildren= function(event){
    this.children.forEach(function(child){child.despatchEvent(event);});
};

/**
 *move view to new position
 */
View.prototype.move=function(position){
    var old_position=this.position;
    this.position=position;
    this.parent.refresh();
    this.despatchEvent({'type':EVT_MOVE,
                       'old_pos':old_position,
                       'new_pos':position});
};

/**
 *move view, relative coordinates
 */
View.prototype.moveRelative=function(position){
    this.move([this.position[0]+position[0], this.position[1]+position[1]]);  
};  

/**
 *resize view
 */
View.prototype.resize=function(size){
    var old_size=this.size;
    this.size=size;
    this.surface=new gamejs.Surface([Math.max(size[0], 1), Math.max(size[1], 1)]);
    this.refresh();
    this.despatchEvent({'type':EVT_RESIZE,
                       'old_size':old_size,
                       'new_size':size});
};

View.prototype.refresh=function(){
    this._refresh=true;
};

View.prototype.show=function(){
    if(!this.visible){
        this.visible=true;
        this.refresh();
    }
};

View.prototype.hide=function(){
    if(this.visible){
        this.despatchEvent({'type':EVT_BLUR});
        this.despatchEvent({'type':EVT_MOUSE_OUT});
        this.visible=false;
        this.refresh();
    }
};

//despatch events to children, handle them if needed
View.prototype.despatchEvent=function(event){
    if(!this.visible) return;
    var inside=false; //event position inside this view
    
    if(event.type==EVT_BLUR){
        if(this.focus){
            this.focus=false;
            this.refresh();
            this.handleEvent(event);
        }
        this.despatchEventToChildren(event);
    }
    else if(event.type==EVT_MOUSE_OUT){
        if(this.hover){
            this.hover=false;
            this.refresh();
            this.handleEvent(event);
        }
        this.despatchEventToChildren(event);
    }
    else if(event.type==EVT_MOUSE_OVER){
        this.hover=true;
        this.refresh();
        this.handleEvent(event);
    }
    
    else if(event.type==EVT_FOCUS){
        this.focus=true;
        this.refresh();
        this.handleEvent(event);
    }
    
    else if(event.type==EVT_MOUSE_DOWN){
        if(!this.focus){
            this.despatchEvent({'type':EVT_FOCUS});
        }
        this.children.forEach(function(child){
            //click inside child: despatch
            if(child.getRect().collidePoint(event.pos)){
                child.despatchEvent(cloneEvent(event, child.position));
            }else{
                //not inside, but child is focused: blur
                if(child.focus) child.despatchEvent({'type':EVT_BLUR});
            }
        }, this);
        this.handleEvent(event);
    }
    
    else if(event.type==EVT_MOUSE_UP){
        this.children.forEach(function(child){
            //click inside child: despatch
            if(child.getRect().collidePoint(event.pos)){
                child.despatchEvent(cloneEvent(event, child.position));
            }
        }, this);
        this.handleEvent(event);
    }
    
    else if(event.type==EVT_MOUSE_MOTION){
        
        //mouse moved onto this view - hover
        this.children.forEach(function(child){
            //click inside child: despatch
            if(child.getRect().collidePoint(event.pos)){
                //inside, not hovering: hover
                if(!child.hover) child.despatchEvent(cloneEvent({'type':EVT_MOUSE_OVER, 'pos':event.pos}, child.position));
                child.despatchEvent(cloneEvent(event, child.position));
            }else{
                //not inside, but child is focused: blur
                if(child.hover) child.despatchEvent(cloneEvent({'type':EVT_MOUSE_OUT, 'pos':event.pos}, child.position));
            }
        }, this);
        this.handleEvent(event);
        
    }
    else if(event.type==EVT_KEY_UP || event.type==EVT_KEY_DOWN || event.type==EVT_KEY_UP){
        if(this.focus){     
            this.children.forEach(function(child){
                if(child.focus) child.despatchEvent(cloneEvent(event));
            });
            this.handleEvent(event);
        }
    //default
    }else{
        this.handleEvent(event);
    }

};

View.prototype.getGUI=function(){
    var parent=this.parent;
    while(parent!=null && parent.type!='gui'){
        parent=parent.parent;
    }
    return parent;
};

//center a child in this view
View.prototype.center=function(child){
    child.move(getCenterPos(this.size, child.size));   
};

//CAN ONLY BE CALLED BY DESPATCH EVENT!
View.prototype.handleEvent=function(event){
    if(this.listeners[event.type]){
        this.listeners[event.type].forEach(function(listener){
            if(listener.scope) listener.callback.apply(listener.scope, [event, this]);
            else listener.callback(event, this);
        });
    }
};

/********************************************
 *LABEL
 *pars:
 *parent
 *position
 *text
 *font - CachedFont instance, optional - uses exports.DEFAULT_FONT by default
 *
 *
 *size is set automatically.
 */

var Label=exports.Label=function(pars){
    this.font=pars.font;
    pars.size=[1, 1];
    Label.superConstructor.apply(this, [pars]);
    this.setText(pars.text);
    this.type='label'; 
};

gamejs.utils.objects.extend(Label, View);

Label.prototype.getFont=function(){
    return this.font ? this.font : exports.DEFAULT_FONT;
};

Label.prototype.setText=function(text){
    this.text=text ? text : ' ';
    this.size=this.getFont().getTextSize(text);
    this.resize(this.size);
};

Label.prototype.paint=function(){
    this.surface.clear();
    this.getFont().render(this.surface, this.text, [0, 0]);
};

/************************************************
 *BUTTON
 *
 *pars:
 *parent
 *position
 *size
 *image
 *image_down optional
 *image_hover optional
 *text
 *font - CachedFont instance
 */

var Button=exports.Button=function(pars){
    Button.superConstructor.apply(this, [pars]);
    this.type='button';
    this.image=null;
    this.label=null;
    this.image=pars.image;
    this.image_down=pars.image_down;
    this.image_hover=pars.image_hover;
    
    if(!this.image){
        this.image=new gamejs.Surface(this.size);
        this.image.fill('#FFF');
        gamejs.draw.rect(this.image, '#808080', new gamejs.Rect([0, 0], this.size), 1);
    }
    
    if(this.image_down==undefined){
        this.image_down=new gamejs.Surface(this.size);
        this.image_down.fill('#E0E0E0');
        gamejs.draw.rect(this.image_down, '#808080', new gamejs.Rect([0, 0], this.size), 1);
    }
    
    
    
    if(pars.text){     
        this.label=new Label({'parent':this,
                             'position':[0, 0],
                             'text':pars.text,
                             'font':pars.font});
        this.center(this.label);
    }
    
    this.pressed_down=false;
    this.on(EVT_MOUSE_DOWN, function(){
        if(!this.pressed_down){
            this.pressed_down=true;
            this.refresh();
        }
    }, this);
    
    this.on(EVT_MOUSE_UP, function(){
        if(this.pressed_down){
            this.pressed_down=false;
            this.despatchEvent({'type':EVT_BTN_CLICK});
            this.refresh();
        }
    }, this);
    
    this.on(EVT_MOUSE_OUT, function(){
        if(this.pressed_down){
            this.pressed_down=false;
            this.refresh();
        }
    }, this)
};

gamejs.utils.objects.extend(Button, View);

Button.prototype.onClick=function(callback, scope){
    this.on(EVT_BTN_CLICK, callback, scope);
};

Button.prototype.paint=function(){
    var img;
    if(this.pressed_down && this.image_down) img=this.image_down;
    else if(this.hover && this.image_hover) img=this.image_hover;
    else img=this.image;
    this.surface.blit(img, new gamejs.Rect([0, 0], this.surface.getSize()), new gamejs.Rect([0, 0], img.getSize()));
    
};

Button.prototype.setText=function(text){
    if(this.label){
        this.label.setText(text);
        this.center(this.label);
    }
};

/************************************************
 *IMAGE
 * pars:
 * parent
 * image - gamejs.Surface
 * position
 * size - defaults to image size, if other is set, image is resized
 */

var Image=exports.Image=function(pars){
    if(!pars.image) throw 'Image: parameter image is required';
    if(!pars.size) pars.size=pars.image.getSize();
    this.image=pars.image;
    Image.superConstructor.apply(this, [pars]);
    this.type='image';
    return this;
};

gamejs.utils.objects.extend(Image, View);

Image.prototype.setImage=function(image){
    this.image=image;
    this.refresh();
};

Image.prototype.resize=function(size){
    View.prototype.resize.apply(this, [size]);
    if((size[0]!=this.image.getSize()[0]) || (size[1]!=this.image.getSize()[1])){
        this.surface.blit(this.image, new gamejs.Rect([0, 0], size), new gamejs.Rect([0, 0], this.image.getSize()));
    }
    else{
        this.surface=this.image;
    }
};

Image.prototype.paint=function(){
    View.prototype.paint.apply(this, []);
    this.surface.blit(this.image, new gamejs.Rect([0, 0], this.surface.getSize()), new gamejs.Rect([0, 0], this.image.getSize()));  
};



/******************************************
 *


/*************************************************
 *FRAMEHEADER
 *pars:
 *parent
 *title
 *
 */
var FrameHeader=exports.FrameHeader=function(pars){
    if(!pars.parent) throw 'FrameHeader: parent parameter is required';
    this.height=20;
    pars.width=pars.parent.size[0];
    pars.size=[pars.width, this.height];
    pars.position=[0, 0];
    
    FrameHeader.superConstructor.apply(this, [pars]);
    draggable(this);
    
    if(pars.title){
        this.setTitle(pars.title);
    }
    
    if(pars.close_btn){
        var img;
        if(pars.close_icon){
            img=pars.close_icon;
        }
        else{
            img=new gamejs.Surface([20, 20]);
            gamejs.draw.line(img, '#000', [3, 3], [17, 17], 3);
            gamejs.draw.line(img, '#000', [3, 17], [17, 3], 3);
        }
      
        img=new Image({'parent':this,
                      'position':[this.size[0]-img.getSize()[0], 0],
                      'image':img});
        img.on(EVT_MOUSE_DOWN, function(){
            this.close();
            this.despatchEvent({'type':EVT_CLOSE});
        }, this.parent);
    }
    
    this.type='frameheader';       
};

gamejs.utils.objects.extend(FrameHeader, View);

FrameHeader.prototype.move=function(pos){
    this.parent.move([this.parent.position[0]+pos[0]-this.position[0],
                      this.parent.position[1]+pos[1]-this.position[1]]);
};

FrameHeader.prototype.setTitle=function(text){
    if(!this.title_label)this.title_label=new Label({'parent':this,
                                                    'position':[0, 0],
                                                    'text':text});
    else this.title_label.setText(text);
    var font=this.title_label.getFont();
    var size=font.getTextSize(text);
    this.title_label.move([font.space_width, Math.max(parseInt(this.height-size[1]))], 0);
    draggable(this);
};

FrameHeader.prototype.paint=function(){
    gamejs.draw.rect(this.surface, '#C0C0C0', new gamejs.Rect([0, 0], this.size));
};



/**************************************************************
 *FRAME
 *Root view, handles gamejs events and despatches them to children
 *
 *pars:
 *gui
 *position
 *size
 *header - {Bool} display header?
 *constrain - {Bool} constrain to visible area?
 *title  - {String} frame title, displayed only if header is on
 *close_btn {Bool} display cross for closing?
 *close_icon - surface to use as close frame icon
 ***************************************************************/
var Frame=exports.Frame=function(pars){
    if(!pars.gui) throw 'Frame: gui parameter is required';
    pars.parent=null;
    Frame.superConstructor.apply(this, [pars]);
    this.type='frame';
    this.visible=false;
    pars.gui.frames.push(this);
    this.parent=pars.gui;
    
    //header
    this.header=null;
    if(pars.header){
        this.header=new this.header_class({'parent':this,
                                        'close_btn':pars.close_btn,
                                        'close_icon':pars.close_icon,
                                        'title':pars.title});
    }
    
    //constrain
    this.constrain=pars.constrain;
    return this;
};
gamejs.utils.objects.extend(Frame, View);

Frame.prototype.header_class=FrameHeader;

Frame.prototype.refresh=function(){
    View.prototype.refresh.apply(this, []);
};

Frame.prototype.paint=function(){
    //fill
    gamejs.draw.rect(this.surface, '#FFF', new gamejs.Rect([0, 0], this.size));
    
    //draw border
    gamejs.draw.rect(this.surface, '#404040', new gamejs.Rect([0, 0], this.size), 1);
};

Frame.prototype.setTitle=function(text){
    if(this.header)this.header.setTitle(text);
}

Frame.prototype.show=function(){
    View.prototype.show.apply(this, []);
    this.parent.moveFrameToTop(this);
};

Frame.prototype.close=function(){
    View.prototype.hide.apply(this, []);
    this.despatchEvent({'type':EVT_CLOSE});
};

Frame.prototype.move=function(position){
    if(this.constrain){
        if(position[0]<0)position[0]=0;
        if(position[0]>this.parent.size[0]-this.size[0]) position[0]=this.parent.size[0]-this.size[0];
        if(position[1]<0)position[1]=0;
        if(position[1]>this.parent.size[1]-this.size[1]) position[1]=this.parent.size[1]-this.size[1];
    }
    View.prototype.move.apply(this, [position]);
};

/**
 *calls parent's removeChild
 */
Frame.prototype.destroy=function(){
    if(this.visible) this.close();
    if(this.parent) this.parent.removeFrame(this);
};

/**********************
 *DraggableView
 *
 *pars:
 *parent
 *size
 *position
 *image
 *min_x
 *max_x
 *min_y
 *max_y
 */

var DraggableView=exports.DraggableView=function(pars){
    DraggableView.superConstructor.apply(this, [pars]);
    draggable(this);
    this.min_x=pars.min_x;
    this.max_x=pars.max_x;
    this.min_y=pars.min_y;
    this.max_y=pars.max_y;
    this.type='draggableview';
};

gamejs.utils.objects.extend(DraggableView, View);

DraggableView.prototype.move=function(pos){
    var x=pos[0];
    if(this.min_x || (this.min_x==0)) x=Math.max(x, this.min_x);
    if(this.max_x || (this.max_x==0)) x=Math.min(x, this.max_x);
    
    var y=pos[1];
    if(this.min_y || (this.min_y==0)) y=Math.max(y, this.min_y);
    if(this.max_y || (this.max_y==0)) y=Math.min(y, this.max_y);
    
    View.prototype.move.apply(this, [[x, y]]);
};


/**********************
 *Scroller
 *
 *the draggable part of the scrollbar
 *
 *parent
 *size
 *position
 *min_x
 *max_x
 *min_y
 *max_y
 *image optional
 */
var Scroller=exports.Scroller=function(pars){
    Scroller.superConstructor.apply(this, [pars]);
    this.img=null;
    if(pars.image){
        this.img=new Image({'parent':this,
                    'position':[0, 0],
                    'size':this.size,
                    'image':pars.image});
    }
};
gamejs.utils.objects.extend(Scroller, DraggableView);

Scroller.prototype.resize=function(size){
    DraggableView.prototype.resize.apply(this,[size]);
    if(this.img)this.img.resize(size);

};

/***************************
 *Horizontal Scrollbar
 *pars:
 *parent
 *size
 *position
 *left_btn_image {gamejs.Surface}
 *scroller_image {gamejs.Surface}
 *right_btn_image {gamejs.Surface}
 */

var getLevelTemplate=function(){
    return {'bgtile':'sand.png',
            'decals':[],
            'props':[],
            'ai_waypoints':[],
            'checkpoints':[],
            'start_positions':[]};
};

var HorizontalScrollbar=exports.HorizontalScrollbar=function(pars){
    HorizontalScrollbar.superConstructor.apply(this, [pars]);
    this.type='horizontalscrollbar';
    var left_btn_image=pars.left_btn_image;
    if(!left_btn_image){
        left_btn_image=new gamejs.Surface([this.size[1], this.size[1]]);
        var pts=[[0, this.size[1]/2],
                 [this.size[1], 0],
                 [this.size[1], this.size[1]]];
        gamejs.draw.polygon(left_btn_image, '#C0C0C0', pts);
    }
    this.left_btn=new Button({'parent':this,
                            'position':[0, 0],
                            'size':[this.size[1], this.size[1]],
                            'image':left_btn_image});
    this.left_btn.onClick(this.scrollLeft, this);
    
    var right_btn_image=pars.right_btn_image;
    if(!right_btn_image){
        right_btn_image=new gamejs.Surface([this.size[1], this.size[1]]);
        var pts=[[0, 0],
                 [this.size[1], this.size[1]/2],
                 [0, this.size[1]]];
        gamejs.draw.polygon(right_btn_image, '#C0C0C0', pts);
    }
    this.right_btn=new Button({'parent':this,
                            'position':[this.size[0]-this.size[1], 0],
                            'size':[this.size[1], this.size[1]],
                            'image':right_btn_image});
    
    this.right_btn.onClick(this.scrollRight, this);

    //scroller track size
    this.sts=this.size[0]-this.right_btn.size[0]-this.left_btn.size[0];
    
    var scroller_image=pars.scroller_image;
    if(!scroller_image){
        scroller_image=new gamejs.Surface([this.size[1], this.size[1]]);
        var sz=scroller_image.getSize()
        gamejs.draw.rect(scroller_image, '#C0C0C0', new gamejs.Rect([0, 0],[sz[0], sz[1]]));
    }
    var size=[Math.max(parseInt((this.size[0]-2*this.size[1])/2),scroller_image.getSize()[0]), this.size[1]];
    this.scroller=new this.scroller_class({'parent':this,
                                            'position':[this.size[1], 0],
                                            'image':scroller_image,
                                            'size':size,
                                            'min_x':this.size[1],
                                            'max_x':this.size[0]-this.right_btn.size[0]-size[0],
                                            'min_y':0,
                                            'max_y':0});

    
    this.scroll_pos=0;
    this.max_scroll_pos=this.sts-this.scroller.size[0];
    
    this.scroller.on(EVT_DRAG, function(event){
        this.setScrollPX(event.new_pos[0]-this.size[1]);
    }, this);
};
gamejs.utils.objects.extend(HorizontalScrollbar, View);

HorizontalScrollbar.prototype.scroller_class=Scroller;

//sz between 0.1 and 1
HorizontalScrollbar.prototype.setScrollerSize=function(sz){
    sz=Math.min(Math.max(sz, 0.1), 1);
    this.scroller.resize([this.sts*sz, this.scroller.size[1]]);
   
    this.max_scroll_pos=this.sts-this.scroller.size[0];
    this.scroller.max_x=this.size[0]-this.left_btn.size[0]-this.scroller.size[0];
    this.refresh();
};

//pos - px
HorizontalScrollbar.prototype.setScrollPX=function(pos){
    this.scroller.move([pos+this.left_btn.size[0], 0]);
    var pos_x=this.scroller.position[0]-this.left_btn.size[0];
    this.scroll_pos=pos_x;
    var scroll=0;
    if(this.max_scroll_pos>0){
        scroll=pos_x/this.max_scroll_pos;
    }
    this.despatchEvent({'type':EVT_SCROLL,
                       'scroll_px':pos_x,
                       'scroll':scroll});
    this.refresh();
};

//pos betwween 0 and 1
HorizontalScrollbar.prototype.setScroll=function(pos){
    this.setScrollPX(parseInt(this.max_scroll_pos*pos));
};

HorizontalScrollbar.prototype.scrollLeft=function(){
    this.setScrollPX(Math.max(0, this.scroll_pos-this.max_scroll_pos*0.1));
};

HorizontalScrollbar.prototype.scrollRight=function(){
    this.setScrollPX(Math.min(this.max_scroll_pos, this.scroll_pos+this.max_scroll_pos*0.1));
};
HorizontalScrollbar.prototype.paint=function(){
    this.surface.clear();
};

/****************************
 *Vertical Scrollbar
 *pars:
 *parent
 *size
 *position
 *top_btn_image {gamejs.Surface}
 *scroller_image {gamejs.Surface}
 *bot_btn_image {gamejs.Surface}
 */

var VerticalScrollbar=exports.VerticalScrollbar=function(pars){
    VerticalScrollbar.superConstructor.apply(this, [pars]);
    this.type='verticalscrollbar';
    var top_btn_image=pars.top_btn_image;
    if(!top_btn_image){
        top_btn_image=new gamejs.Surface([this.size[0], this.size[0]]);
        var pts=[[this.size[0]/2, 0],
                 [0, this.size[0]],
                 [this.size[0], this.size[0]]];
        gamejs.draw.polygon(top_btn_image, '#C0C0C0', pts);
    }
    this.top_btn=new Button({'parent':this,
                            'position':[0, 0],
                            'size':[this.size[0], this.size[0]],
                            'image':top_btn_image});
    this.top_btn.onClick(this.scrollUp, this);
    
    var bot_btn_image=pars.bot_btn_image;
    if(!bot_btn_image){
        bot_btn_image=new gamejs.Surface([this.size[0], this.size[0]]);
        var pts=[[0, 0],
                 [this.size[0], 0],
                 [this.size[0]/2, this.size[0]]];
        gamejs.draw.polygon(bot_btn_image, '#C0C0C0', pts);
    }
    this.bot_btn=new Button({'parent':this,
                            'position':[0, this.size[1]-this.size[0]],
                            'size':[this.size[0], this.size[0]],
                            'image':bot_btn_image});
    
    this.bot_btn.onClick(this.scrollDown, this);

    //scroller track size
    this.sts=this.size[1]-this.bot_btn.size[1]-this.top_btn.size[1];
    
    var scroller_image=pars.scroller_image;
    if(!scroller_image){
        scroller_image=new gamejs.Surface([this.size[0], this.size[0]]);
        var sz=scroller_image.getSize()
        gamejs.draw.rect(scroller_image, '#C0C0C0', new gamejs.Rect([0, 0],[sz[0], sz[1]]));
    }
    var size=[this.size[0], Math.max(parseInt((this.size[1]-2*this.size[0])/2),scroller_image.getSize()[1])];
    this.scroller=new this.scroller_class({'parent':this,
                                            'position':[0, this.size[0]],
                                            'image':scroller_image,
                                            'size':size,
                                            'min_x':0,
                                            'max_x':0,
                                            'min_y':this.size[0],
                                            'max_y':this.size[1]-this.bot_btn.size[1]-size[1]});

    
    this.scroll_pos=0;
    this.max_scroll_pos=this.sts-this.scroller.size[1];
    
    this.scroller.on(EVT_DRAG, function(event){
        this.setScrollPX(event.new_pos[1]-this.size[0]);
    }, this);
};
gamejs.utils.objects.extend(VerticalScrollbar, View);

VerticalScrollbar.prototype.scroller_class=Scroller;

//sz between 0.1 and 1
VerticalScrollbar.prototype.setScrollerSize=function(sz){
    sz=Math.min(Math.max(sz, 0.1), 1);
    this.scroller.resize([this.scroller.size[0], this.sts*sz]);
   
    this.max_scroll_pos=this.sts-this.scroller.size[1];
    this.scroller.max_y=this.size[1]-this.bot_btn.size[1]-this.scroller.size[1];
    this.refresh();
};

//pos - px
VerticalScrollbar.prototype.setScrollPX=function(pos){
    this.scroller.move([0, pos+this.top_btn.size[1]]);
    var pos_y=this.scroller.position[1]-this.top_btn.size[1];
    this.scroll_pos=pos_y;
    var scroll=0;
    if(this.max_scroll_pos>0){
        scroll=pos_y/this.max_scroll_pos;
    }
    this.despatchEvent({'type':EVT_SCROLL,
                       'scroll_px':pos_y,
                       'scroll':scroll});
    this.refresh();
};

//pos betwween 0 and 1
VerticalScrollbar.prototype.setScroll=function(pos){
    this.setScrollPX(parseInt(this.max_scroll_pos*pos));
};

/*
VerticalScrollbar.prototype.refresh=function(){
    View.prototype.refresh.apply(this, []);
    this.parent.refresh();
};*/

VerticalScrollbar.prototype.scrollUp=function(){
    this.setScrollPX(Math.max(0, this.scroll_pos-this.max_scroll_pos*0.1));
};

VerticalScrollbar.prototype.scrollDown=function(){
    this.setScrollPX(Math.min(this.max_scroll_pos, this.scroll_pos+this.max_scroll_pos*0.1));
};
VerticalScrollbar.prototype.paint=function(){
    this.surface.clear();
};


/****************************************
 *ScrollableView
 *
 *scroll contents.
 *
 *pars:
 *parent
 *position
 *size
 */
var ScrollableView=exports.ScrollableView=function(pars){
    ScrollableView.superConstructor.apply(this, [pars]);
    this.type='scrollableview';
    this.scroll_x=0;
    this.scroll_y=0;
    this.max_scroll_x=0;
    this.max_scroll_y=0;
    this.scrollable_area=[0, 0];
    this.setScrollableArea(this.size);
    this.vertical_scrollbar=null;
    this.horizontal_scrollbar=null;
};
gamejs.utils.objects.extend(ScrollableView, View);

ScrollableView.prototype.setVerticalScrollbar=function(scrollbar){
    this.vertical_scrollbar=scrollbar;
    scrollbar.on(EVT_SCROLL, function(event){
        this.setScrollY(Math.ceil(event.scroll*this.max_scroll_y));
    }, this);
};

ScrollableView.prototype.setHorizontalScrollbar=function(scrollbar){
    this.horizontal_scrollbar=scrollbar;
    scrollbar.on(EVT_SCROLL, function(event){
        this.setScrollX(Math.ceil(event.scroll*this.max_scroll_x));
    }, this);
};

ScrollableView.prototype.setScrollableArea=function(area){
    this.scrollable_area=area;
    this.max_scroll_y=Math.max(area[1]-this.size[1], 0);
    this.max_scroll_x=Math.max(area[0]-this.size[0], 0);
    if(this.vertical_scrollbar){
        var sz=Math.max(Math.min(1, this.size[1]/area[1]), 0.1);
        this.vertical_scrollbar.setScrollerSize(sz);
    }
    if(this.horizontal_scrollbar){
        var sz=Math.max(Math.min(1, this.size[0]/area[0]), 0.1);
        this.horizontal_scrollbar.setScrollerSize(sz);
    }
};

ScrollableView.prototype.autoSetScrollableArea=function(){
    scrollable_area=[0, 0];
    this.children.forEach(function(child){
            scrollable_area[0]=Math.max(scrollable_area[0], child.position[0]+child.size[0]+20);
            scrollable_area[1]=Math.max(scrollable_area[1], child.position[1]+child.size[1]+20);
    }, this);
    this.setScrollableArea(scrollable_area);
};

//implement autosetscrollablearea?
ScrollableView.prototype.addChild=function(child){
    View.prototype.addChild.apply(this, [child]);
    this.refresh();    
};

//alter blit pos to account for scroll
ScrollableView.prototype.blitChild=function(child){
    this.surface.blit(child.surface, [child.position[0]-this.scroll_x, child.position[1]-this.scroll_y]);
};

//alter event pos to account for scroll
ScrollableView.prototype.despatchEvent=function(event){
    if(event.pos){
        event=cloneEvent(event);
        event.pos=[event.pos[0]+this.scroll_x, event.pos[1]+this.scroll_y];
    }
    View.prototype.despatchEvent.apply(this, [event]);
};

ScrollableView.prototype.paint=function(){
    this.surface.clear();
};

//increment horizontal scroll
ScrollableView.prototype.scrollX=function(x){
  this.setScrollX(this.scroll_x+x);
  this.refresh();
};

//increment vertical scroll
ScrollableView.prototype.scrollY=function(y){
    this.setScrollY(this.scroll_y+y);
    this.refresh();
};

//set horizontal scroll
ScrollableView.prototype.setScrollX=function(x){
    this.scroll_x=Math.min(Math.max(x, 0), this.max_scroll_x);
    this.refresh();
};

//set vertical scroll
ScrollableView.prototype.setScrollY=function(y){
    this.scroll_y=Math.min(Math.max(y, 0), this.max_scroll_y);
    this.refresh();
};


/******************************************
 *TEXTINPUT
 *input text
 *
 *pars:
 *parent
 *size
 *position
 *font -CachedFont
 *text
 *scw_size - inner text box size
 */
var TextInput=exports.TextInput=function(pars){
    TextInput.superConstructor.apply(this, [pars]);
    this.font=pars.font ? pars.font : exports.DEFAULT_FONT;
    this.text=pars.text ? pars.text : '';
    this.blip=false;
    this.pos=0;
    this.ms=500;
    
    this.scw=new ScrollableView({'parent':this,
                              'position':[0, 0],
                              'size':pars.scw_size || this.size});
    this.center(this.scw);
    this.label=new Label({'parent':this.scw,
                         'position':[0, 0],
                         'font':this.font,
                         'text':this.text});
    this.scw.center(this.label);
    this.label.move([3, this.label.position[1]]);
    
    this.bliplabel=new Label({'parent':this.scw,
                             'position':[0, 0],
                             'font':this.font,
                             'visible':false,
                             'text':'|'});
    
    this.on(EVT_KEY_DOWN, this.onKeyDown, this);
    this.on(EVT_FOCUS, this.blipon, this);
    this.on(EVT_BLUR, function(){
        this.blip=false;
    }, this);
    this.setPos(this.text.length);
};
gamejs.utils.objects.extend(TextInput, View);

TextInput.prototype.blipon=function(event){
    this.blip=true;
    this.ms=500;
    this.refresh();
};

TextInput.prototype.update=function(msDuration){
    if(this.focus){
        this.ms-=msDuration;
        if(this.ms<0){
            this.ms=500;
            this.blip=!this.blip;
        };
        if(this.blip){
            this.bliplabel.show();    
        }else{
            this.bliplabel.hide();
        }
    }else{
        this.bliplabel.hide();
    }
};

TextInput.prototype.paint=function(){
    this.surface.fill('#FFF');
    gamejs.draw.rect(this.surface, '#COCOCO', new gamejs.Rect([0, 0], this.size), 1);
};

TextInput.prototype.setText=function(text){
    this.setPos(this.text.length);
    this._setText(text);
};

TextInput.prototype.setPos=function(pos){
    this.pos=Math.min(Math.max(pos, 0), this.text.length);

    //calc offset for scorllable area
    var ofst=0;
   /* var origlen, tlen;
    tlen=origlen=this.font.getTextSize(this.text)[0];
    if(tlen>this.scw.size[0]){
        ofst=tlen-this.scw.size[0];
    }
    if(this.pos<this.text.length){
        tlen=this.font.getTextSize(this.text.substr(0, this.pos))[0];
        ofst=Math.min(tlen, ofst)+this.font.getTextSize('m')[0];
    }*/
    var ofst=0;
    var tlen=this.font.getTextSize(this.text.substr(0, this.pos))[0];
    ofst=Math.max(tlen-this.scw.size[0]+this.font.getTextSize('s')[0]);
    
    this.scw.setScrollX(ofst);
    this.bliplabel.move([Math.max(this.font.getTextSize(this.text.substr(0, this.pos))[0]+this.label.position[0]-2, 0), this.label.position[1]]);
           
};


TextInput.prototype._setText=function(text){
    this.text=text;
    this.label.setText(text);
    this.scw.autoSetScrollableArea();
    this.refresh();
    this.despatchEvent({'type':EVT_CHANGE,'value':text});
};

TextInput.prototype.onKeyDown=function(event){
    var charcode=event.key;
    if(charcode==13){
        //TODO
    }
    //BACKSPACE
    if(charcode==8){
        if(this.text){
            if(this.pos==this.text.length){
                this._setText(this.text.substr(0,this.text.length-1));
            }else {
                this._setText(this.text.substr(0, this.pos-1)+this.text.substr(this.pos, this.text.length));
            }
            this.blipon();
            this.setPos(this.pos-1);
        }
    }
    //WRITEABLE SYMBOLS, 0 to z or space
    if(((charcode>=48) && (charcode<=90))||(charcode==32)){
        var c=String.fromCharCode(charcode);
        if(event.shiftKey)c=c.toUpperCase();
        else c=c.toLowerCase();
        if(this.pos==this.text.length){
            this._setText(this.text+c);
        }else{
            this._setText(this.text.substr(0, this.pos)+c+this.text.substr(this.pos, this.text.length));
        }
        this.setPos(this.pos+1);
        this.blipon();
    }

    //LEFT
    if(charcode==37){
        this.setPos(this.pos-1);
        this.blipon();
    }
    //RIGHT
    if(charcode==39){
        this.setPos(this.pos+1);
        this.blipon();
    }
};

/******************************************
 *DIALOG
 *a dialog that pops out in the middle, disables everything else until closed
 *pars:
 *gui
 *size
 */

var Dialog=exports.Dialog=function(pars){
    pars.position=getCenterPos(pars.gui.size, pars.size);
    Dialog.superConstructor.apply(this, [pars]);
    
};

gamejs.utils.objects.extend(Dialog, Frame);

Dialog.prototype.show=function(){
    this.getGUI().lockFrame(this);
    Frame.prototype.show.apply(this, []);
};

Dialog.prototype.close=function(){
    this.getGUI().unlockFrame();
    Frame.prototype.close.apply(this, []);
};

/****
 *Text
 *
 *wrapped multi-line text
 *
 *pars:
 *position
 *width
 *font - CachedFont
 *text
 *justify {Bool} justify text? default aligned left
 */
var Text=exports.Text=function(pars){
    pars.size=[pars.width, 1];
    Text.superConstructor.apply(this, [pars]);
    this.width=pars.width;
    this.font=pars.font ? pars.font : exports.DEFAULT_FONT;
    this.setText(pars.text);
    this.justify=pars.justify;
};
gamejs.utils.objects.extend(Text, View);

Text.prototype.setText=function(text){
    //wow, is this a hacky mess! but i think it works
    
    this.text=text;
    this.lines=[];
    var nlines=text.split(/\r\n|\r|\n/);
    nlines.push(' ');
    var line, words;
    var i, ci, c, l;
    var word='';
    var height=0;
    var n_line_length=0;
    var n_line='';
    for(i=0;i<nlines.length;i++){
        line=nlines[i];
        line+=' ';
        for(ci=0;ci<line.length;ci++){
            c=line[ci];
            if(c==' ' || c=='\t'){
                if(word){
                    l=this.font.getTextSize(word)[0];
                    if((n_line_length+l>this.size[0]) && (!(n_line==''))){
                        this.lines.push({'t':n_line, 'e':false});
                        height+=this.font.getTextSize(n_line)[1];
                        n_line='';
                        n_line_length=0;
                        if(word[0]==' ' || word[0]=='\t'){
                            word=word.substr(1, word.length);
                        }
                    }
                    n_line+=word;
                    n_line_length+=l;
                    
                }
                word='';
                word+=c;
            }else{
                word+=c;
            }
        }
        if(n_line){
            this.lines.push({'t':n_line, 'e':true});
            height+=this.font.getTextSize(n_line)[1];
            n_line='';
            n_line_length=0;
        }
    }
    this.resize([this.width, height]);
    this.refresh();
};

Text.prototype.paint=function(){
    var pos=0;
    this.lines.forEach(function(line){
        var sz=this.font.getTextSize(line.t);
        var extra_w=0;
        if(this.justify && (!line.e)){
            var space_count=0;
            for(var i=0;i<line.t.length;i++){
                if(line.t[i]==' ') space_count++;
            }
            extra_w=Math.floor((this.size[0]-sz[0])/space_count);
        }
        this.font.render(this.surface, line.t, [0, pos], this.font.space_width+extra_w);
        pos+=sz[1];
    }, this);
}

/**
 *GUI
 *
 */
var GUI=exports.GUI=function(surface){
    GUI.superConstructor.apply(this, [{'position':[0, 0],
                                      'parent':null,
                                      'size':surface.getSize(),
                                      'surface':surface}]);
    this.type='gui';
    this.locked_frame=null;
    this.frames=[];
};

gamejs.utils.objects.extend(GUI, View);

GUI.prototype.draw=function(force_redraw){
    if(force_redraw)this.refresh();
    var painted=View.prototype.draw.apply(this, []);
    this.frames.forEach(function(frame){
        if(frame.visible && (frame.draw() || painted)){
            if(this.locked_frame && (this.locked_frame.id==frame.id)){
                this.refresh();
                this.blur_bg();
            }
            this.surface.blit(frame.surface, frame.position);
        }
    }, this);
};

GUI.prototype.paint=function(){
    //gamejs.draw.rect(this.surface, '#FFF', new gamejs.Rect([0, 0], this.size));
};

GUI.prototype.blur_bg=function(){
    gamejs.draw.rect(this.surface, 'rgba(192,192, 192, 0.5)', new gamejs.Rect([0, 0], this.size),0); 
};

/*****
 *frame - frame id or object
 *removes this frame, effectively destroying it
 */

GUI.prototype.removeFrame=function(frame){
    if(typeof(frame)!='number')frame=frame.id;
    for(var i=0;i<this.frames.length;i++){
        if(this.frames[i].id==frame){
            frame=this.frames.splice(i, 1);
            this.refresh();
            return true;
        }
    }
    return false;
};

GUI.prototype.moveFrameToTop=function(frame){   
    for(var i=0;i<this.frames.length;i++){
        var f=this.frames[i];
        if(f.id==frame.id){
            if(i==this.frames.length-1) return;
            this.despatchEvent({'type':EVT_BLUR});
            this.frames.splice(i, 1);
            this.frames.push(f);
            this.refresh();
            frame.despatchEvent({'type':EVT_FOCUS});
            break;
        }
    }
};
GUI.prototype.update=function(msDuration){
    this.children.forEach(function(child){
        child._update(msDuration);  
    });
    this.frames.forEach(function(frame){
        frame._update(msDuration);  
    });
    
};
GUI.prototype.lockFrame=function(frame){
    this.locked_frame=frame;
    this.refresh();
};

GUI.prototype.unlockFrame=function(){
    this.locked_frame=null;
    this.refresh();
};

GUI.prototype.despatchEvent=function(event){
    if(event.pos)event.global_pos=event.pos;
    
    var i, frame;
    //dispatching mouse events to frames: if event is dispatched to a frame, don't dispatch it anywhere else.
    if(event.type==EVT_MOUSE_DOWN || event.type==EVT_MOUSE_MOTION || event.type==EVT_MOUSE_UP){
        var frame;
        var hit=false;
        var clicked_on=null;
        var moused_on=null;
        var topframe=null;
        for(i=this.frames.length-1; i>=0;i--){
            frame=this.frames[i];
            
            //if frame is locked, dispatch events only to that frame
            if(this.locked_frame &&(this.locked_frame.id!=frame.id)) continue;
            
            if(frame.visible && frame.getRect().collidePoint(event.pos)){
                frame.despatchEvent(cloneEvent(event, frame.position));
                if(event.type==EVT_MOUSE_DOWN){
                    clicked_on=i;
                }
                else if(event.type==EVT_MOUSE_MOTION){
                    moused_on=i;
                }
                hit=true;
                //mouseout view if mouse is on a frame
                if(frame.focus)topframe=i;
                break;
            }else{
                //blur frame if focused but clicked somewhere else
                if((event.type==EVT_MOUSE_DOWN) && (frame.focus)){
                    frame.despatchEvent({'type':EVT_BLUR});
                }
            }
        }
        
        //blur everything else if clicked on a frame
        if(clicked_on!=null){
            View.prototype.despatchEvent.apply(this, [{'type':EVT_BLUR}]);
            for(i=0;i<this.frames.length;i++){
                if(i!=clicked_on) this.frames[i].despatchEvent({'type':EVT_BLUR});
            }
        }
         
        //mouseout everyhting else if clicked on a frame
        if(moused_on!=null){
            View.prototype.despatchEvent.apply(this, [{'type':EVT_MOUSE_OUT}]);
            for(i=0;i<this.frames.length;i++){
                if(i!=moused_on) this.frames[i].despatchEvent({'type':EVT_MOUSE_OUT});
            } 
        }
        
        if(!hit &&(!this.locked_frame)){
            View.prototype.despatchEvent.apply(this, [event]);
        }
        else{
            View.prototype.handleEvent.apply(this, [event]);
        }
        
        if(topframe!=null){
            this.moveFrameToTop(this.frames[topframe]);      
        }
        
    }else{
        if(event.type==EVT_BLUR || event.type==EVT_MOUSE_OUT || event.type==EVT_KEY_DOWN || event.type==EVT_KEY_UP){
            this.frames.forEach(function(frame){
                if(frame.visible &&(!this.locked_frame || (this.locked_frame.id==frame.id))){
                    frame.despatchEvent(cloneEvent(event, frame.position));
                }
            });  
        }
        
        if(!this.locked_frame) View.prototype.despatchEvent.apply(this, [event]);
        else View.prototype.handleEvent.apply(this, [event]);
    }
};

exports.layout={};

/********************
 *layout:vertical
 *objects - a list of gui objects (with the same parent)
 *y - starting y, default 0
 *space- space between objects, default 0
 *
 *arranges objects vertically.
 */
exports.layout.vertical=function(objects, y, space){
    y=y || 0;
    space = space || 0;
    objects.forEach(function(object){
        object.move([object.position[0], y]);
        y+=object.size[1]+space;
    });
    
};

/********************
 *layout:horizontal
 *objects - a list of gui objects (with the same parent)
 *x - starting x, default 0
 *space- space between objects, default 0
 *
 *arranges objects horizontally.
 */
exports.layout.horizontal=function(objects, x, space){
    x=x || 0;
    space = space || 0;
    objects.forEach(function(object){
        object.move([x, object.position[1]]);
        x+=object.size[0]+space;
    });
};

