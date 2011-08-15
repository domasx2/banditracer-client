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


/**
 *@ignore
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

/**
 *@ignore
 */
function getCenterPos(size1, size2){
    return [Math.max(parseInt((size1[0]-size2[0])/2), 0),
            Math.max(parseInt((size1[1]-size2[1])/2), 0)];
}

/**
 *Make a view draggable within it's parent. Dragging generates EVT_DRAG
 *@function
 *@param {View} view view to make draggable.
 */
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

/**
 *implements lazy caching for individual letters
 *@class cached font
 *@constructor
 *
 *@param {String|Array} font either font description as string, or assoc array character:gamejs.Surface
 *@param {String} color a valid #RGB String, "#ffcc00"
 *
 *@property {Number} space_width space between lettersin pixels. Default 'm' width divided by 3
 *@property {Number} tab_width tab width in pixels. Default 3*space_width
 *@property {gamejs.font.Font} font font object used to render characters. Default 14px Verdana
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


/**
 *returns gamejs.Surface for a character. Caches this surface if it is not cached
 *
 *@function
 *@param {String} c single character
 *
 *@returns {gamejs.Surface} surface object with the character painted on. Not a copy, don't paint on it!
 */
CachedFont.prototype.getCharSurface=function(c){
    if(!this.chars[c]){
        var s=this.font.render(c, this.color);
        this.chars[c]=s;
    }
    return this.chars[c];
};

/**
 *get size text would occupy if it was rendered
 *@function
 *
 *@param {String} text
 *
 *@returns {Array} size, eg. [width, height]
 */
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

/**
 *render text on a surface
 *@function
 *
 *@param {gamejs.Surface} surface surface to render text on
 *@param {String} text text to render
 *@param {Array} position position to render the text at
 *@param {Number} space_width OPTIONAL, override space width
 */
CachedFont.prototype.render=function(surface, text, position, space_width){
    ofst=position[0];
    space_width=space_width? space_width : this.space_width;
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

/**
 *View
 *@class base gui object !CONSTRUCTOR PARAMETERS ARE PROVIDED IN A OBJECT LITERAL!
 *@constructor
 *
 *@param {View} parent parent element
 *@param {Array} size  array containing width & height of the element, eg. [width, height]
 *@param {Array} position position of the view relative to parent, eg. [x, y]. OPTIONAL, default [0, 0]
 *@param {gamejs.Surface} surface surface to render this view on, OPTIONAL
 *@param {Bool} visible is this view visible? default true
 *
 *@property {Array} size view size, [width, length]
 *@property {Array} position view position relative to parent, [x, y]
 *@property {gamejs.Surface} surface surface this view is rendered on
 *@property {View} parent parent view of this view
 *@property {Array} children array of this views children views
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
    this.is_hovered=false;
    
    //is this view focused?
    this.is_focused=false;
    
    //evenet type: [{'callback':x, 'scope':y, ...]
    this.listeners={};
    return this;
    
};

/*
 *get is focus state
 *@function
 *@returns {Bool} is this view focused?
 */
View.prototype.isFocused=function(){
    return this.is_focused;  
};

/**
 *get hover state
 *@function
 *@returns {Bool} is mouse hovering on this element?
 */
View.prototype.isHovered=function(){
    return this.is_hovered;  
};
/**
 *get view size
 *@function
 *@returns {Array} view size, [width, height]
 */
View.prototype.getSize=function(){
    return [this.size[0], this.size[1]];
};

/**
 *get view position within it's parent element
 *@function
 *@returns {Array} view position within it's parent element, [x, y]
 */
View.prototype.getPosition=function(){
    return [this.position[0], this.position[1]];
};

/**
 *get visible state
 *@function
 *@returns {Bool} is this view visible?
 */

View.prototype.isVisible=function(){
  return this.visible;
};

/**
 *detaches a child from this view
 *@function
 *@param {View|Number} child View or or child View id.
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
 *detaches view from it's parent, effectively destroying it
 *@function
 */
View.prototype.destroy=function(){
    if(this.parent)this.parent.removeChild(this);
}

/**
 *get position & size rect
 *@returns gamejs.Rect instance. Position is relative to parent
 */
View.prototype.getRect=function(){
    return new gamejs.Rect(this.position, this.size);  
};

/**
 *add child to this view
 *@param {View} child view to add as a child of this view
 */
View.prototype.addChild=function(child){
    this.children.push(child);
};

/**
 *if needed, paints this view, draws children and coposites them on this views surface
 *@function
 *@returns {Bool} has this view been repainted
 */
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
/**
 *blit child's surface on this view's surface
 *@function
 *@param {View} child child view to blit
 */
View.prototype.blitChild=function(child){
    this.surface.blit(child.surface, child.position);
};

/**
 *paint this view on it's surface. does not repaint/blit children! override this to implement custom drawing of the element itself. by default, only clears the surface
 *@function
 */
View.prototype.paint=function(){
    this.surface.clear();
};


/**
 *update view. does nothing by default
 *@function
 *@param {Number} miliseconds since last update
 */
View.prototype.update=function(msDuration){};

/**
 *recursively calls _update on this views children, then calls update for this view.
 *@ignore
 */
View.prototype._update=function(msDuration){
    this.children.forEach(function(child){
        child._update(msDuration);        
    });
    this.update(msDuration);
};

/**
 *register a callback for an event. When event is triggered, callback is called with event object as argument
 *@function
 *@param {Event ID} event event ID of the event to be registered on, eg gamejs-gui.EVT_BLUR, gamejs-gui.EVT_KEY_DOWN, etc.
 *@param {Function} callback function to call when event is triggered
 *@param {Object} scope - this object for the callback
 */
View.prototype.on=function(event_type, callback, scope){
    if(!this.listeners[event_type])this.listeners[event_type]=[];
    this.listeners[event_type].push({'callback':callback, 'scope':scope});
};

/**
 *despatches event to all children. internal
 *@ignore
 */
View.prototype.despatchEventToChildren= function(event){
    this.children.forEach(function(child){child.despatchEvent(event);});
};

/**
 *Move view relative to its parent. Generates EVT_MOVE event
 *@function
 *@param {Array} new position relative to parent element, eg. [x, y]
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
 *Move view relative to its position. Generates EVT_MOVE event
 *@function
 *@param {Array} delta coordinates relative to current position ,eg. [delta x, delta y]
 */
View.prototype.moveRelative=function(position){
    this.move([this.position[0]+position[0], this.position[1]+position[1]]);  
};  

/**
 *Resize this view. Generates EVT_RESIZE event
 *@function
 *@param {Array} new size, eg. [width, height]
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

/**
 *Redraw this view and its children.
 *@function
 */
View.prototype.refresh=function(){
    this._refresh=true;
};

/**
 *If this view is hidden, make it visible
 *@function
 */
View.prototype.show=function(){
    if(!this.visible){
        this.visible=true;
        this.refresh();
    }
};

/**
 *If this view is visible, hide it. This also blurs and mouse-outs the view, if applicable
 *@function
 */
View.prototype.hide=function(){
    if(this.visible){
        this.despatchEvent({'type':EVT_BLUR});
        this.despatchEvent({'type':EVT_MOUSE_OUT});
        this.visible=false;
        this.refresh();
    }
};

/**
 *Despatch event to this view. Event is despatched to children if applicable, then handled by this view.
 *@function
 *@param {Event} event event to despatch
 */
View.prototype.despatchEvent=function(event){
    if(!this.visible) return;
    var inside=false; //event position inside this view
    
    if(event.type==EVT_BLUR){
        if(this.is_focused){
            this.is_focused=false;
            this.refresh();
            this.handleEvent(event);
        }
        this.despatchEventToChildren(event);
    }
    else if(event.type==EVT_MOUSE_OUT){
        if(this.is_hovered){
            this.is_hovered=false;
            this.refresh();
            this.handleEvent(event);
        }
        this.despatchEventToChildren(event);
    }
    else if(event.type==EVT_MOUSE_OVER){
        this.is_hovered=true;
        this.refresh();
        this.handleEvent(event);
    }
    
    else if(event.type==EVT_FOCUS){
        this.is_focused=true;
        this.refresh();
        this.handleEvent(event);
    }
    
    else if(event.type==EVT_MOUSE_DOWN){
        if(!this.isFocused()){
            this.despatchEvent({'type':EVT_FOCUS});
        }
        this.children.forEach(function(child){
            //click inside child: despatch
            if(child.getRect().collidePoint(event.pos)){
                child.despatchEvent(cloneEvent(event, child.position));
            }else{
                //not inside, but child is focused: blur
                if(child.isFocused()) child.despatchEvent({'type':EVT_BLUR});
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
                if(!child.isHovered()) child.despatchEvent(cloneEvent({'type':EVT_MOUSE_OVER, 'pos':event.pos}, child.position));
                child.despatchEvent(cloneEvent(event, child.position));
            }else{
                //not inside, but child is focused: blur
                if(child.isHovered()) child.despatchEvent(cloneEvent({'type':EVT_MOUSE_OUT, 'pos':event.pos}, child.position));
            }
        }, this);
        this.handleEvent(event);
        
    }
    else if(event.type==EVT_KEY_UP || event.type==EVT_KEY_DOWN || event.type==EVT_KEY_UP){
        if(this.isFocused()){     
            this.children.forEach(function(child){
                if(child.isFocused()) child.despatchEvent(cloneEvent(event));
            });
            this.handleEvent(event);
        }
    //default
    }else{
        this.handleEvent(event);
    }

};

/**
 *returns GUI object at the base of this views branch
 *@function
 *@returns {GUI} GUI object at the base if this views branch
 */
View.prototype.getGUI=function(){
    var parent=this.parent;
    while(parent!=null && parent.type!='gui'){
        parent=parent.parent;
    }
    return parent;
};

/**
 *Center a child view within this view. Must be direct child
 *@function
 *@param {View} child child view
 */
View.prototype.center=function(child){
    child.move(getCenterPos(this.size, child.size));   
};

/**
 *execute any registered callbacks for this event. Should only be called by despatchEvent!
 *@ignore
 */
View.prototype.handleEvent=function(event){
    if(this.listeners[event.type]){
        this.listeners[event.type].forEach(function(listener){
            if(listener.scope) listener.callback.apply(listener.scope, [event, this]);
            else listener.callback(event, this);
        });
    }
};

/**
 *@class single-line text display !CONSTRUCTOR PARAMETERS ARE PROVIDED IN A OBJECT LITERAL!
 *@augments View
 *@constructor 
 *
 *@param {CachedFont} font font to draw text with. OPTIONAL, default gamejs-gui.DEFAULT_FONT
 *@param {String} text text to draw
 *@param {View} parent parent element
 *@param {Array} position position of the view relative to parent, eg. [x, y]. OPTIONAL, default [0, 0]
 *@param {gamejs.Surface} surface surface to render this view on, OPTIONAL
 *@param {Bool} visible is this view visible? OPTIONAL, EFAULT true
 *
 *resized automatically to house text.
 *
 *@property {CachedFont} font
 *@property {String} text

 */

var Label=exports.Label=function(pars){
    this.font=pars.font ? pars.font : exports.DEFAULT_FONT;
    pars.size=[1, 1];
    Label.superConstructor.apply(this, [pars]);
    if(!pars.text) throw "Label: label text must be provided!"
    this.setText(pars.text);
    this.type='label'; 
};

gamejs.utils.objects.extend(Label, View);

/**
 *set new text for this label. Resizes the view automatically.
 *@function
 *
 *@param {String} text new text
 */
Label.prototype.setText=function(text){
    this.text=text ? text : ' ';
    this.size=this.font.getTextSize(text);
    this.resize(this.size);
};

/***
 *paint implementation for label. clears surface and renders text
 *@function
 */
Label.prototype.paint=function(){
    this.surface.clear();
    this.font.render(this.surface, this.text, [0, 0]);
};

/**
 *@class button !CONSTRUCTOR PARAMETERS ARE PROVIDED IN A OBJECT LITERAL!
 *@augments View
 *
 *@param {gamejs.Surface} image button image, OPTIONAL
 *@param {gamejs.Surface} image_down button image when pressed down, OPTIONAL
 *@param {gamejs.Surface} image_hover button image when hovered on, OPTIONAL
 *@param {String} text text to display on button, OPTIONAL
 *@param {CachedFont} font to render text with, OPTIONAL
 *@param {View} parent parent element
 *@param {Array} size  array containing width & height of the element, eg. [width, height]
 *@param {Array} position position of the view relative to parent, eg. [x, y]. OPTIONAL, default [0, 0]
 *@param {gamejs.Surface} surface surface to render this view on, OPTIONAL
 *@param {Bool} visible is this view visible? default true
 *
 *@property {String} text
 *@property {CachedFont} font
 *@property {Label} label  Label obejct, created if text was provided.
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

/**
 *short hand for on(EVT_BTN_CLICK, callback, scope)
 *@function
 *
 *@param {Function} callback function to call when EVT_BTN_CLICK event is triggered
 *@param {Object} scope this object for callback, OPTIONAL
 */
Button.prototype.onClick=function(callback, scope){
    this.on(EVT_BTN_CLICK, callback, scope);
};

/**
 *default button paint implementation paints image, image_down or image_hover based on button sotate
 *@function
 */
Button.prototype.paint=function(){
    var img;
    if(this.pressed_down && this.image_down) img=this.image_down;
    else if(this.isHovered() && this.image_hover) img=this.image_hover;
    else img=this.image;
    this.surface.blit(img, new gamejs.Rect([0, 0], this.surface.getSize()), new gamejs.Rect([0, 0], img.getSize()));
    
};

/**
 *set button text
 *@function
 *@param {String} text
 */
Button.prototype.setText=function(text){
    if(this.label){
        this.label.setText(text);
        this.center(this.label);
    }
};

/**
 *@class image !CONSTRUCTOR PARAMETERS ARE PROVIDED IN A OBJECT LITERAL!
 *@augments View
 *
 *@param {gamejs.Surface} image to paint
 *@param {View} parent parent element
 *@param {Array} size  array containing width & height of the element, eg. [width, height]
 *@param {Array} position position of the view relative to parent, eg. [x, y]. OPTIONAL, default [0, 0]
 *@param {gamejs.Surface} surface surface to render this view on, OPTIONAL
 *@param {Bool} visible is this view visible? OPTIONAL, DEFAULT true
 *
 *@property {gamejs.Surface} image
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

/**
 *set new image
 *@function
 *@param {gamejs.Surface} image
 */
Image.prototype.setImage=function(image){
    this.image=image;
    this.refresh();
};

/**
 *default paint implementation for image. If Image object size!=provided image surface size, image is stretched.
 *@function
 */
Image.prototype.paint=function(){
    View.prototype.paint.apply(this, []);
    this.surface.blit(this.image, new gamejs.Rect([0, 0], this.surface.getSize()), new gamejs.Rect([0, 0], this.image.getSize()));  
};

/**
 *@class draggable frame header with a close button !CONSTRUCTOR PARAMETERS ARE PROVIDED IN A OBJECT LITERAL!
 *@augments View
 *
 *@param {Frame} parent frame object this header is applied to
 *@param {Number} height frame height, OPTIONAL, DEFAULT 20
 *@param {String} title frame title OPTIONAL
 *@param {CachedFont} title_font font for title OPTIONAL
 *@param {Bool} close_btn show close button? OPTIONAL, DEFAULT false
 *@param {gamejs.Surface} close_icon image to use for close button, OPTIONAL
 *@param {gamejs.Surface} close_btn close button image OPTIONAL
 *@param {gamejs.Surface} surface surface to render this view on, OPTIONAL
 *@param {Bool} visible is this view visible? OPTIONAL, DEFAULT true
 *
 *@property {CachedFont) title_font
 *@property {Number} height
 */
var FrameHeader=exports.FrameHeader=function(pars){
    if(!pars.parent) throw 'FrameHeader: parent parameter is required';
    this.height=pars.height || 20;
    pars.width=pars.parent.size[0];
    pars.size=[pars.width, this.height];
    pars.position=[0, 0];
    this.title_font=pars.title_font;
    
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
            img=new gamejs.Surface([this.height, this.height]);
            gamejs.draw.line(img, '#000', [3, 3], [this.height-3, this.height-3], 3);
            gamejs.draw.line(img, '#000', [3, this.height-3], [this.height-3, 3], 3);
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

/**
 *moving header moves parent frame too
 *@function
 *
 *@param {Array} pos position ot move header to
 */
FrameHeader.prototype.move=function(pos){
    this.parent.move([this.parent.position[0]+pos[0]-this.position[0],
                      this.parent.position[1]+pos[1]-this.position[1]]);
};

/**
 *set header title
 *@function
 *
 *@param {String} text new header title
 */
FrameHeader.prototype.setTitle=function(text){
    if(!this.title_label)this.title_label=new Label({'parent':this,
                                                    'position':[0, 0],
                                                    'font':this.title_font,
                                                    'text':text});
    else this.title_label.setText(text);
    var font=this.title_label.font;
    var size=font.getTextSize(text);
    this.title_label.move([font.space_width, Math.max(parseInt(this.height-size[1]))], 0);
    draggable(this);
};

/**
 *default paint implementation: gray background
 *@function
 */
FrameHeader.prototype.paint=function(){
    gamejs.draw.rect(this.surface, '#C0C0C0', new gamejs.Rect([0, 0], this.size));
};



/**
 *@class a overlay view with it's own space and hierarchy, a 'window' in OS talk. Hidden by default !CONSTRUCTOR PARAMETERS ARE PROVIDED IN A OBJECT LITERAL!
 *@augments View
 *
 *@param {GUI} parent parent GUI object
 *@param {Bool} constrain if true, frame cannot be moved out of visible area
 *@param {Array} size  array containing width & height of the element, eg. [width, height]
 *@param {Array} position position of the view relative to parent, eg. [x, y]. OPTIONAL, default [0, 0]
 *@param {gamejs.Surface} surface surface to render this view on, OPTIONAL
 *@param {Bool} visible is this view visible? OPTIONAL, DEFAULT true
 *
 *@property {Bool} constrain
 */
var Frame=exports.Frame=function(pars){
    if(!pars.parent) throw 'Frame: parent parameter is required';
    if(pars.parent.type!='gui') throw 'Frame: parent object must be instance of GUI';
    var gui=pars.parent;
    pars.parent=null;
    Frame.superConstructor.apply(this, [pars]);
    this.type='frame';
    this.visible=false;
    gui.frames.push(this);
    this.parent=gui;    
    //constrain
    this.constrain=pars.constrain;
    return this;
};
gamejs.utils.objects.extend(Frame, View);

/**
 *Default implementation, white fill and gray border.
 *@function
 */
Frame.prototype.paint=function(){
    //fill
    gamejs.draw.rect(this.surface, '#FFF', new gamejs.Rect([0, 0], this.size));
    
    //draw border
    gamejs.draw.rect(this.surface, '#404040', new gamejs.Rect([0, 0], this.size), 1);
};

/**
 *Show frame, move it to top of the screen
 *@function
 */
Frame.prototype.show=function(){
    View.prototype.show.apply(this, []);
    this.parent.moveFrameToTop(this);
};

/**
 *Close frame. You propably want to use this instead of hide()! generates EVT_CLOSE
 *@function
 */
Frame.prototype.close=function(){
    View.prototype.hide.apply(this, []);
    this.despatchEvent({'type':EVT_CLOSE});
};

/**
 *implements restricting frame to GUI bounds. generates EVT_MOVE
 *@function
 *@param {Array} position position to move frame to
 */

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
 *closes frame, then destroys it
 *@function
 */
Frame.prototype.destroy=function(){
    if(this.visible) this.close();
    if(this.parent) this.parent.removeFrame(this);
};

/**
 *@class draggable view: can be dragged within its parent by holding down left mouse btn
 *@augments View
 *
 *@param {Number} min_x minimum x coordinate view can be dragged to, OPTIONAL
 *@param {Number} max_x maximum x coordinate view can be dragged to, OPTIONAL
 *@param {Number} min_y minimum y coordinate view can be dragged to, OPTIONAL
 *@param {Number} max_y maximum y coordinate view can be dragged to, OPTIONAL
 *@param {View} parent parent element
 *@param {Array} size  array containing width & height of the element, eg. [width, height]
 *@param {Array} position position of the view relative to parent, eg. [x, y]. OPTIONAL, default [0, 0]
 *@param {gamejs.Surface} surface surface to render this view on, OPTIONAL
 *@param {Bool} visible is this view visible? default true
 *
 *@property {Number} min_x
 *@property {Number} max_x
 *@property {Number} min_y
 *@property {Number} max_y
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

/**
 *implements restricting to coordinates, if applicable
 *@function
 *@param {Array} pos new position
 */
DraggableView.prototype.move=function(pos){
    var x=pos[0];
    if(this.min_x || (this.min_x==0)) x=Math.max(x, this.min_x);
    if(this.max_x || (this.max_x==0)) x=Math.min(x, this.max_x);
    
    var y=pos[1];
    if(this.min_y || (this.min_y==0)) y=Math.max(y, this.min_y);
    if(this.max_y || (this.max_y==0)) y=Math.min(y, this.max_y);
    
    View.prototype.move.apply(this, [[x, y]]);
};


/**
 *@class draggable part of the scrollbar !CONSTRUCTOR PARAMETERS ARE PROVIDED IN A OBJECT LITERAL!
 *@augments DraggableView
 *
 *@param {View} parent parent element
 *@param {Array} size  array containing width & height of the element, eg. [width, height]
 *@param {gamejs.Surface} image iamge to use for the scroller, OPTIONAL
 *@param {Number} min_x minimum x coordinate view can be dragged to, OPTIONAL
 *@param {Number} max_x maximum x coordinate view can be dragged to, OPTIONAL
 *@param {Number} min_y minimum y coordinate view can be dragged to, OPTIONAL
 *@param {Number} max_y maximum y coordinate view can be dragged to, OPTIONAL
 *@param {Array} position position of the view relative to parent, eg. [x, y]. OPTIONAL, default [0, 0]
 *@param {gamejs.Surface} surface surface to render this view on, OPTIONAL
 *@param {Bool} visible is this view visible? OPTIONAL, DEFAULT true
 *
 *@property {Image} img Image object created if image parameter was provided
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

/**
 *resizes image along with scroller
 *@function 
 */
Scroller.prototype.resize=function(size){
    DraggableView.prototype.resize.apply(this,[size]);
    if(this.img)this.img.resize(size);

};

/**
 *@class !CONSTRUCTOR PARAMETERS ARE PROVIDED IN A OBJECT LITERAL!
 *@augments View
 *
 *@param {gamejs.Surface} left_btn_image image for left scrollbar button
 *@param {gamejs.Surface} scroller_image image for scroller
 *@param {gamejs.Surface} right_btn_image image for right scrollbar button
 *@param {View} parent parent element
 *@param {Array} size  array containing width & height of the element, eg. [width, height]
 *@param {Array} position position of the view relative to parent, eg. [x, y]. OPTIONAL, default [0, 0]
 *@param {gamejs.Surface} surface surface to render this view on, OPTIONAL
 *@param {Bool} visible is this view visible? OPTIONAL, DEFAULT true
 *
 *@property {Button} left_btn left scrollbar button
 *@property {Button} right_btn right scrollbar button
 *@property {Scroller} scroller
 *@property {Function} scroller_class scroller class used to create scroller #TODO find better way to implement customization
 */

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

/**
 *set relative scroller width
 *@function
 *@param {Number} sz relative scroller width, between 0.1 and 1, 
 */
HorizontalScrollbar.prototype.setScrollerSize=function(sz){
    sz=Math.min(Math.max(sz, 0.1), 1);
    this.scroller.resize([this.sts*sz, this.scroller.size[1]]);
   
    this.max_scroll_pos=this.sts-this.scroller.size[0];
    this.scroller.max_x=this.size[0]-this.left_btn.size[0]-this.scroller.size[0];
    this.refresh();
};

/**
 *set scroll amount, px
 *@function
 *@param {Number} pos scroll amount, px
 */
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

/**
 *set scroll amount, relative
 *@function
 *@param {Number} pos scroll amount, between 0 and 1
 */
HorizontalScrollbar.prototype.setScroll=function(pos){
    this.setScrollPX(parseInt(this.max_scroll_pos*pos));
};

/**
 *scroll left by 0.1 of max scrollable amount
 *@function
 */
HorizontalScrollbar.prototype.scrollLeft=function(){
    this.setScrollPX(Math.max(0, this.scroll_pos-this.max_scroll_pos*0.1));
};

/**
 *scroll right by 0.1 of max scrollable amount
 *@function
 */
HorizontalScrollbar.prototype.scrollRight=function(){
    this.setScrollPX(Math.min(this.max_scroll_pos, this.scroll_pos+this.max_scroll_pos*0.1));
};

/**
 *@class !CONSTRUCTOR PARAMETERS ARE PROVIDED IN A OBJECT LITERAL!
 *@augments View
 *
 *@param {gamejs.Surface} top_btn_image image for top scrollbar button
 *@param {gamejs.Surface} scroller_image image for scroller
 *@param {gamejs.Surface} bot_btn_image image for bottom scrollbar button
 *@param {View} parent parent element
 *@param {Array} size  array containing width & height of the element, eg. [width, height]
 *@param {Array} position position of the view relative to parent, eg. [x, y]. OPTIONAL, default [0, 0]
 *@param {gamejs.Surface} surface surface to render this view on, OPTIONAL
 *@param {Bool} visible is this view visible? OPTIONAL, DEFAULT true
 *
 *@property {Button} top_btn top scrollbar button
 *@property {Button} bot_btn bottom scrollbar button
 *@property {Scroller} scroller
 *@property {Function} scroller_class scroller class used to create scroller #TODO find better way to implement customization
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

/**
 *set relative scroller width
 *@function
 *@param {Number} sz relative scroller width, between 0.1 and 1, 
 */
VerticalScrollbar.prototype.setScrollerSize=function(sz){
    sz=Math.min(Math.max(sz, 0.1), 1);
    this.scroller.resize([this.scroller.size[0], this.sts*sz]);
   
    this.max_scroll_pos=this.sts-this.scroller.size[1];
    this.scroller.max_y=this.size[1]-this.bot_btn.size[1]-this.scroller.size[1];
    this.refresh();
};

/**
 *set scroll amount, px
 *@function
 *@param {Number} pos scroll amount, px
 */
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

/**
 *set scroll amount, relative
 *@function
 *@param {Number} pos scroll amount, between 0 and 1
 */
VerticalScrollbar.prototype.setScroll=function(pos){
    this.setScrollPX(parseInt(this.max_scroll_pos*pos));
};

/**
 *@function
 *scroll up by 0.1 of max scrollable amount
 */
VerticalScrollbar.prototype.scrollUp=function(){
    this.setScrollPX(Math.max(0, this.scroll_pos-this.max_scroll_pos*0.1));
};

/**
 *@function
 *scroll down by 0.1 of max scrollable amount
 */
VerticalScrollbar.prototype.scrollDown=function(){
    this.setScrollPX(Math.min(this.max_scroll_pos, this.scroll_pos+this.max_scroll_pos*0.1));
};

/**
 *@class view with scrollable content !CONSTRUCTOR PARAMETERS ARE PROVIDED IN A OBJECT LITERAL!
 *@augments View
 *
 *@param {View} parent parent element
 *@param {Array} size  array containing width & height of the element, eg. [width, height]
 *@param {Array} position position of the view relative to parent, eg. [x, y]. OPTIONAL, default [0, 0]
 *@param {gamejs.Surface} surface surface to render this view on, OPTIONAL
 *@param {Bool} visible is this view visible? OPTIONAL, DEFAULT true
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

/**
 *set vertical scrollbar for this view
 *@function
 *@param {VerticalScrollbar} scrollbar
 */
ScrollableView.prototype.setVerticalScrollbar=function(scrollbar){
    this.vertical_scrollbar=scrollbar;
    scrollbar.on(EVT_SCROLL, function(event){
        this.setScrollY(Math.ceil(event.scroll*this.max_scroll_y));
    }, this);
};

/**
 *set horizontal scrollbar for this view
 *@function
 *@param {HorizontalScrollbar} scrollbar
 */
ScrollableView.prototype.setHorizontalScrollbar=function(scrollbar){
    this.horizontal_scrollbar=scrollbar;
    scrollbar.on(EVT_SCROLL, function(event){
        this.setScrollX(Math.ceil(event.scroll*this.max_scroll_x));
    }, this);
};

/**
 *manually set size of scrollable area
 *@function
 *@param {Array} area scrollbale area, [width, height]
 */
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

/**
 *automatically set scrollable area based on children positions and sizes
 *@function
 */
ScrollableView.prototype.autoSetScrollableArea=function(){
    scrollable_area=[0, 0];
    this.children.forEach(function(child){
            scrollable_area[0]=Math.max(scrollable_area[0], child.position[0]+child.size[0]+20);
            scrollable_area[1]=Math.max(scrollable_area[1], child.position[1]+child.size[1]+20);
    }, this);
    this.setScrollableArea(scrollable_area);
};

/**
 *TODO: implement optional auto setting scrollable area when children are added
 *@function
 */
ScrollableView.prototype.addChild=function(child){
    View.prototype.addChild.apply(this, [child]);
    this.refresh();    
};

/**
 *implements child blitting adjusted to scroll state
 *@function
 */
ScrollableView.prototype.blitChild=function(child){
    this.surface.blit(child.surface, [child.position[0]-this.scroll_x, child.position[1]-this.scroll_y]);
};

/**
 *adjusts event position based on scroll state
 *@function
 */
ScrollableView.prototype.despatchEvent=function(event){
    if(event.pos){
        event=cloneEvent(event);
        event.pos=[event.pos[0]+this.scroll_x, event.pos[1]+this.scroll_y];
    }
    View.prototype.despatchEvent.apply(this, [event]);
};

/**
 *increment horizontal scroll
 *@function
 *@param {Number} x px to increment horizontal scroll by
 */
ScrollableView.prototype.scrollX=function(x){
  this.setScrollX(this.scroll_x+x);
  this.refresh();
};

/**
 *increment vertical scroll
 *@function
 *@param {Number} y px to increment vertical scroll by
 */
ScrollableView.prototype.scrollY=function(y){
    this.setScrollY(this.scroll_y+y);
    this.refresh();
};

/**
 *set horizontal scroll
 *@function
 *@param {Number} x horizontal scroll, px
 */
ScrollableView.prototype.setScrollX=function(x){
    this.scroll_x=Math.min(Math.max(x, 0), this.max_scroll_x);
    this.refresh();
};

/**
 *set vertical scroll
 *@function
 *@param {Number} y vertical scroll, px
 */
ScrollableView.prototype.setScrollY=function(y){
    this.scroll_y=Math.min(Math.max(y, 0), this.max_scroll_y);
    this.refresh();
};

/**
 *@class text input !CONSTRUCTOR PARAMETERS ARE PROVIDED IN A OBJECT LITERAL!
 *@augments View
 *
 *@param {CachedFont} font 
 *@param {String} text
 *@param {Array} scw_size actual text display size, [width, height].
 *@param {View} parent parent element
 *@param {Array} size  array containing width & height of the element, eg. [width, height]
 *@param {Array} position position of the view relative to parent, eg. [x, y]. OPTIONAL, default [0, 0]
 *@param {gamejs.Surface} surface surface to render this view on, OPTIONAL
 *@param {Bool} visible is this view visible? OPTIONAL, DEFAULT true
 *
 *@property {CachedFont} font
 *@property {String} text
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

/**
 *turn blip on
 *@ignore
 */
TextInput.prototype.blipon=function(event){
    this.blip=true;
    this.ms=500;
    this.refresh();
};

/**
 *implements blip updating
 *@function
 *@param {Number} msDuration
 */
TextInput.prototype.update=function(msDuration){
    if(this.isFocused()){
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

/**
 *default implementation: white fill, gray border
 *@function
 */
TextInput.prototype.paint=function(){
    this.surface.fill('#FFF');
    gamejs.draw.rect(this.surface, '#COCOCO', new gamejs.Rect([0, 0], this.size), 1);
};

/**
 *set input text. generates EVT_CHANGE
 *@function
 *@param {String} text
 */
TextInput.prototype.setText=function(text){
    this.setPos(this.text.length);
    this._setText(text);
};

/**
 *set blip position
 *@ignore
 */
TextInput.prototype.setPos=function(pos){
    this.pos=Math.min(Math.max(pos, 0), this.text.length);

    //calc offset for scorllable area
    var ofst=0;
    var ofst=0;
    var tlen=this.font.getTextSize(this.text.substr(0, this.pos))[0];
    ofst=Math.max(tlen-this.scw.size[0]+this.font.getTextSize('s')[0]);
    
    this.scw.setScrollX(ofst);
    this.bliplabel.move([Math.max(this.font.getTextSize(this.text.substr(0, this.pos))[0]+this.label.position[0]-2, 0), this.label.position[1]]);
           
};

/**
 *@ignore
 */
TextInput.prototype._setText=function(text){
    this.text=text;
    this.label.setText(text);
    this.scw.autoSetScrollableArea();
    this.refresh();
    this.despatchEvent({'type':EVT_CHANGE,'value':text});
};

/**
 *key down handler
 *@ignore
 */
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

/**
 *@class a centered dialog position at the top of the GUI. disables and grays out rest of the guy
 *@augments Frame
 *
 *@param {GUI} parent parent GUI object
 *@param {Bool} constrain if true, frame cannot be moved out of visible area
 *@param {Array} size  array containing width & height of the element, eg. [width, height]
 *@param {Array} position position of the view relative to parent, eg. [x, y]. OPTIONAL, default [0, 0]
 *@param {gamejs.Surface} surface surface to render this view on, OPTIONAL
 *@param {Bool} visible is this view visible? default true
 */

var Dialog=exports.Dialog=function(pars){
    pars.position=getCenterPos(pars.parent.size, pars.size);
    Dialog.superConstructor.apply(this, [pars]);
    
};

gamejs.utils.objects.extend(Dialog, Frame);

/**
 *lock GUI & show dialog
 *@function
 */
Dialog.prototype.show=function(){
    this.getGUI().lockFrame(this);
    Frame.prototype.show.apply(this, []);
};

/**
 *unlock gui & hide dialog
 *@function
 */
Dialog.prototype.close=function(){
    this.getGUI().unlockFrame();
    Frame.prototype.close.apply(this, []);
};

/**
 *@class multi-line, line-wrapped text dislay !CONSTRUCTOR PARAMETERS ARE PROVIDED IN A OBJECT LITERAL!
 *@augments View
 *
 *@param {CachedFont} font 
 *@param {String} text
 *@param {Bool} justify if true, text is justified. By default, it's left-aligned
 *@param {View} parent parent element
 *@param {Array} size  array containing width & height of the element, eg. [width, height]
 *@param {Array} position position of the view relative to parent, eg. [x, y]. OPTIONAL, default [0, 0]
 *@param {gamejs.Surface} surface surface to render this view on, OPTIONAL
 *@param {Bool} visible is this view visible? OPTIONAL, DEFAULT true
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

/**
 *set text
 *@function
 *@param {String} text
 */
Text.prototype.setText=function(text){
    //wow, is this a hacky mess!
    
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

/**
 *@function
 */
Text.prototype.paint=function(){
    View.prototype.paint.apply(this, []);
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
 *@class root GUI object. Handles gamejs events, frames
 *@augments View
 *
 *@param {gamejs.Surface} surface surface to render GUI on
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

/**
 *redraw GUI, if needed
 *@function
 *@param {Bool} force_redraw if true GUI is redrawn even if tehre are no internal changes
 */
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

/**
 *Does nothing! don't remove!
 *@function
 */
GUI.prototype.paint=function(){};

GUI.prototype.blur_bg=function(){
    gamejs.draw.rect(this.surface, 'rgba(192,192, 192, 0.5)', new gamejs.Rect([0, 0], this.size),0); 
};

/**
 *Remove a frame from GUI
 *@function
 *@param {Frame|Id} frame frame object or id of frame to remove
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

/**
 *Move a frame to the top
 *@function
 *@param {Frame} frame
 */
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

/**
 *Update GUI and its child objects
 *@function
 *@param {Number} msDuration miliseconds since last update
 */
GUI.prototype.update=function(msDuration){
    this.children.forEach(function(child){
        child._update(msDuration);  
    });
    this.frames.forEach(function(frame){
        frame._update(msDuration);  
    });
    
};

/**
 *@ignore
 */
GUI.prototype.lockFrame=function(frame){
    this.locked_frame=frame;
    this.refresh();
};

/**
 *@ignore
 */
GUI.prototype.unlockFrame=function(){
    this.locked_frame=null;
    this.refresh();
};

/**
 *despatch gamejs event
 *@function
 *@param {gamejs Event| GUI event} event event generated by gamejs, or a GUI event if needed.
 */
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
                if(frame.isFocused())topframe=i;
                break;
            }else{
                //blur frame if focused but clicked somewhere else
                if((event.type==EVT_MOUSE_DOWN) && (frame.isFocused())){
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

var layout=exports.layout={

/**
 *arranges obejcts vertically
 *@function
 *@name vertical
 *@lends layout
 *@param {Array} objects a list of gui objects (with the same parent)
 *@param {Number} y starting y coordinate, default 0
 *@param {Number} space space between objects px, default 0
 */
'vertical':function(objects, y, space){
        y=y || 0;
        space = space || 0;
        objects.forEach(function(object){
            object.move([object.position[0], y]);
            y+=object.size[1]+space;
        });
        
    },

/**
 *arranges obejcts horizontally
 *@function
 *@name horizontal
 *@lends layout
 *@param {Array} objects a list of gui objects (with the same parent)
 *@param {Number} x startingx coordinate, default 0
 *@param {Number} space space between objects px, default 0
 */
'horizontal':function(objects, x, space){
        x=x || 0;
        space = space || 0;
        objects.forEach(function(object){
            object.move([x, object.position[1]]);
            x+=object.size[0]+space;
        });
    }
};

