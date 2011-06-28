var gamejs=require('gamejs');
var renderer=require('./renderer');
var levels=require('./levels');
var utils=require('./utils');
var skin=require('./skin');
var settings=require('./settings');
var car_descriptions=require('./car_descriptions');
var resources=require('./resources');

var UIElement=exports.UIElement=function(pars){
    /*
    pars:
    scene
    position
    size
    enabled

    */
    this.scene=pars.scene;
    this.position=pars.position;
    this.size=pars.size? pars.size : [0, 0];
    this.hover=false;
    this.focus=false;
    this.events=[];
    this.enabled=(pars.enabled===true || pars.enabled===false) ? pars.enabled : true;

    this.enable=function(){
        this.enabled=true;
    };
    this.disable=function(){
         this.enabled=false;
    };

    this.queueEvent=function(type, data){
        this.events[this.events.length]=[type, data];
    };


    this.getEvents=function(){
        var evts=this.events;
        this.events=[];
        return evts;
    };

    this.update=function(){
        this.events=[];
    };

    this.drawBorder=function(renderer, color, width){
        renderer.drawRect(color, this.position, this.size, width ? width: 1);
    };

    this.fill=function(renderer, color){
        renderer.drawRect(color, [this.position[0]+1, this.position[1]+1], [this.size[0]-2, this.size[1]-2], 0);
    };

    this.scene.addObject(this);
    return this;
};

var Image=exports.Image=function(pars){
  /*
  pars:
  scene
  position
  filename
  */
   pars.size=[0, 0];
   this.filename=pars.filename;
   Image.superConstructor.apply(this, [pars]);
   this.update=null;
   this.draw=function(renderer){
        if(this.filename) renderer.drawUIImage(this.filename, this.position);
   }
};

gamejs.utils.objects.extend(Image, UIElement);

var Table=exports.Table=function(pars){

    /*pars:
     scene
     position
     rows     - max rows to display in a page
     columns  - list of column defs,
                column def is {'key':'item', 'label':'The Item', 'width':100}
     data - list of data: {id:row_id,
                           key:value,
                           key2:value,
                           ....}
    selectable - can rows be selected?

    TODO !! paging
    */
    pars.size=[0, 0];
    Table.superConstructor.apply(this, [pars]);
    this.scene=pars.scene;
    this.position=pars.position;
    this.columns=pars.columns;
    this.rows=pars.rows;
    this.column2def={};
    this.row_height=30;
    this.selectable=pars.selectable ? true : false;
    for(var i=0;i<this.columns.length;i++){
        this.column2def[this.columns[i].key]=this.columns[i];
    }
    this.size=[0, 0];
    this.data=pars.data? pars.data : [];
    this.hover_row_id=null;
    this.selected_row_id=null;
    this.no_data_text= pars.no_data_text ? pars.no_data_text : 'No data.';

    this.setData=function(data){
        this.data=data;
        this.calcSize();
        this.hover_row_id=null;
        this.selected_row_id=null;
        this.scene.refresh=true;
    };

    this.calcSize=function(){
        var width=0;
        var height=0;
        var col;
        for(var i=0;i<this.columns.length;i++){
            col=this.columns[i];
            width+=col.width;
        }
        height=(this.rows+1)*this.row_height;
        this.size=[width, height];
    };

    this.getRowIdByPos=function(pos){
        //pos - LOCAL position of the table! returns row id this pos is no on or null.
        if (pos[1]>this.row_height){
            var i=parseInt((pos[1]-this.row_height)/30);
            if(this.data.length && (i<this.data.length) && i>=0){
                return this.data[i].id;
            }
        }
        return null;
    };

    this.update=function(){
        var evts=this.getEvents();
        var evt, pos;
        for(var i=0;i<evts.length;i++){
            evt=evts[i];
            if(evt[0]=='mousemotion'){
                this.hover_row_id=this.getRowIdByPos(evt[1]);
                this.scene.refresh=true;
            }
            else if(evt[0]=='click'){
                this.selected_row_id=this.getRowIdByPos(evt[1]);
                this.scene.refresh=true;
            }
            else if(evt[0]=='mouseout'){
                this.hover_row_id=null;
                this.scene.refresh=true;
            }
        }
    };

    this.draw=function(renderer){
        var col;
        var x=this.position[0];
        var y=this.position[1];
        var i, row;

        renderer.drawRect(skin.table.header_fill, [x, y], [this.size[0], this.row_height], 0);

        //draw labels
        for(i=0;i<this.columns.length;i++){
            col=this.columns[i];
            renderer.drawText(col.label, skin.table.header_font, [x+2, y+12]);
            x+=col.width;
        }
        y+=this.row_height;
        //draw rows
        if(this.data.length){
            for(i=0;i<this.data.length;i++){
                row=this.data[i];
                x=this.position[0];


                if(this.hover_row_id==row.id && this.selectable) renderer.drawRect(skin.table.hover_fill, [x, y], [this.size[0], this.row_height], 0);

                if(this.selected_row_id==row.id && this.selectable) renderer.drawRect(skin.table.selected_fill, [x, y], [this.size[0], this.row_height], 0);

                renderer.drawLine(skin.table.row_line, [x, y], [this.size[0]+x, y], 1);
                for(var k=0;k<this.columns.length;k++){
                    col=this.columns[k];
                    if(row[col.key]==undefined)console.log('undefined:'+col.key+' for id '+row.id);
                    renderer.drawText(row[col.key], skin.table.data_font, [x+2, y+12]);
                    x+=col.width;
                }
                y+=this.row_height;
            }
        }else{
            //if no rows, draw default text
            renderer.drawText(this.no_data_text, skin.table.data_font, [this.position[0]+this.size[0]/2-renderer.cache.getTextSize(this.no_data_text, skin.table.header_font)[0]/2, y+(this.rows*this.row_height/2)-15]);
        }

        this.drawBorder(renderer, skin.table.border, 1);

    };

    this.scene.addObject(this);
    this.calcSize();
    return this;

};

gamejs.utils.objects.extend(Table, UIElement);

var TrackInfoDisplay=exports.TrackInfoDisplay=function(pars){
    /*
    pars:

    scene
    position
    track - optional
    */
    TrackInfoDisplay.superConstructor.apply(this, [pars]);
    this.track=pars.track ?  pars.track : null;
    this.trackimg=null;

    this.update=function(){this.getEvents();};

    this.draw=function(renderer){
        if(this.track){
            //track is set, draw label and thumbnail
            renderer.surface.blit(this.trackimg, this.position);
            renderer.drawText(levels[this.track].name, skin.trackinfodisplay.header_font, [this.position[0], this.position[1]+this.trackimg.getSize()[1]+10])

        }
        else{
            //track not sent, say so and draw thumbnail outline
            renderer.drawRect(skin.trackinfodisplay.outline_color, this.position, [200, 200], 1);
            renderer.drawText('Track not selected', skin.trackinfodisplay.header_font, [this.position[0], this.position[1]+210]);
            renderer.drawText('?', skin.trackinfodisplay.header_font, [this.position[0]+90,this.position[1]+90 ]);
        }
    };

    this.setTrack=function(track){
        this.track=track;
        if(track){
            var level=levels[track];
            var tiles=[];
            for(var i=0;i<level.tiles.length;i++){
                tiles[i]=level.dict[level.tiles[i]+''];
            }
            var img=utils.renderBackgroundFromTiles(level.width_t, level.height_t, tiles,  this.scene.game.cache);
            var sz=img.getSize();
            if(sz[0]>sz[1]){
                var q=sz[0]/200;
            }else{
                var q=sz[1]/200;
            }
            var new_sz=[parseInt(sz[0]/q), parseInt(sz[1]/q)];
            this.trackimg=new gamejs.Surface(new_sz[0], new_sz[1]);
            this.trackimg.blit(img, new gamejs.Rect([0, 0], new_sz), new gamejs.Rect([0, 0], img.getSize()));
        }else  this.trackimg=null;
        this.scene.refresh=true;
    };



};
gamejs.utils.objects.extend(TrackInfoDisplay, UIElement);



var CarSelector=exports.CarSelector=function(pars){
    /*
     pars:
     scene
     position
     options - [{'label':x, 'valye':y}, ...]
     onselect
     scope
    */
    this.scene=pars.scene;
    this.position=pars.position;
    this.selected=null;
    this.size=[0, 0];
    var p=0;
    this.btns={};
    this.onselect=pars.onselect;
    this.scope=pars.scope;

    this.queueEvent=function(){};
    this.update=function(){this.events=[]};
    this.draw=function(renderer){};

    this.options=[];
    var cd;
    for(var key in car_descriptions){
        cd=car_descriptions[key];
        if(cd && cd.name){
            this.options.push({'label':cd.name, 'value':key});
        }
    }
    this.selected=null;
    this.scene.addObject(this);


    this.select=function(btn, value){
        this.selected=value;
        for(v in this.btns){
            this.btns[v].selected=value===v ? true : false;
        }
        if(this.onselect){
            if(this.scope){
                this.scope._onselect=this.onselect;
                this.scope._onselect(value);
            }else{
                this.onselect(value);
            }
        }
        this.img.filename=(value+'_descr.png').toLowerCase();
        this.scene.refresh=true;
    };

    var opt;
    for(var i=0;i<this.options.length;i++){
        opt=this.options[i]
        this.btns[opt.value]=new Button({'scene':this.scene,
                                        'position':[this.position[0], this.position[1]+p],
                                        'text':opt.label,
                                        'onclick':this.select,
                                        'scope':this,
                                        'arg':opt.value});
        p+=32;
    }

    this.img=new Image({'scene':this.scene,
                       'position':[this.position[0], this.position[1]+p],
                       'filename':''});
    return this;
};

var LevelSelector=exports.LevelSelector=function(pars){
    /*
    pars:

    scene
    position

    */
    this.scene=pars.scene;
    this.position=pars.position;
    this.selected=null;
    this.size=[0, 0];
    var p=0;
    this.btns=[];


    var level;

    this.queueEvent=function(){};
    this.update=function(){this.events=[]};
    this.draw=function(renderer){

    };

    this.select=function(btn, levelkey){
        for(var lk in this.btns){
            this.btns[lk].selected = levelkey==lk ? true : false;
        }
        this.trackdisplay.setTrack(levelkey);
        this.selected=levelkey;
        this.scene.refresh=true;
    };
    p=40;

    new Label({'scene':this.scene,
              'position':this.position,
              'text':'Select a track'});

    this.trackdisplay= new TrackInfoDisplay({'scene':this.scene,
                                             'position':[this.position[0]+210, this.position[1]+40]});

    var levelkey, i;
    for(i=0;i<resources.levels.length;i++){
        levelkey=resources.levels[i];
        level=levels[levelkey];
        this.btns[levelkey]=new Button({'scene':this.scene,
                                        'position':[this.position[0], this.position[1]+p],
                                        'text':level.name,
                                        'size':[200, 25],
                                        'onclick':this.select,
                                        'scope':this,
                                        'arg':levelkey});
        p+=32;
    }

    this.scene.addObject(this);
    return this;
};





var TextBox=exports.TextBox=function(pars){
    /*
    pars:
    scene
    position
    size
    text
    font
    onchange
    scope
    */
    pars.size=pars.size ? pars.size: [150, 25];
    TextBox.superConstructor.apply(this, [pars]);
    this.text=pars.text ? pars.text : '';
    this.font=pars.font ? pars.font : skin.textbox.font;
    this.blip=false; //show cursor?
    this.ms=500;     // time till cursor is shown/hidden
    this.upper=false;
    this.tbsize=[this.size[0]-8, this.size[1]]; //text display box size
    this.tbposition=[this.position[0]+4, this.position[1]-2]; //text display box position
    this.onchange=pars.onchange
    this.pos=this.text.length;

    this.blipon=function(){
        this.blip=true;
        this.ms=500;
        this.scene.refresh=true;
    };


    this.setText=function(text){
        this.text=text;
        this.pos=this.text.length;
        this.scene.refresh=true;
    };

    this._setText=function(text){
        this.text=text;
        this.scene.refresh=true;
    };

    this.getText=function(){
        return this.text;
    };

    this.update=function(msDuration){
        var evts=this.getEvents();
        if(this.focus){
            this.ms-=msDuration;
            if(this.ms<0){
                this.blip= !this.blip;
                this.ms=500;
                this.scene.refresh=true;
            };

            var evt, charcode;
            for(var i=0;i<evts.length;i++){
                evt=evts[i];
                if(evt[0]=='focus'){
                    this.blipon();
                }
                if(evt[0]=='keydown'){
                    charcode=evt[1];
                    //SHIFT
                    if(charcode==16){
                        this.upper=true;
                    }
                    //ENTER
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
                            this.pos--;
                        }
                    }
                    //WRITEABLE SYMBOLS, 0 to z or space
                    if(((charcode>=48) && (charcode<=90))||(charcode==32 )){
                        var c=String.fromCharCode(charcode);
                        if(this.upper)c=c.toUpperCase();
                        else c=c.toLowerCase();
                        if(this.pos==this.text.length){
                            this._setText(this.text+c);
                        }else{
                            this._setText(this.text.substr(0, this.pos)+c+this.text.substr(this.pos, this.text.length));
                        }
                        this.pos++;
                        this.blipon();
                    }

                    //LEFT
                    if(charcode==37){
                        this.pos=Math.max(0, this.pos-1);
                        this.blipon();
                    }
                    //RIGHT
                    if(charcode==39){
                        this.pos=Math.min(this.text.length, this.pos+1);
                        this.blipon();
                    }
                }
                else if(evt[0]=='keyup'){
                    charcode=evt[1];
                    //SHIFT release
                    if(charcode==16){
                        this.upper=false;
                    }
                }
            };

        }else{
            this.blip=false;
            this.upper=false;
        }
       // console.log(this.pos);

    };

    this.draw=function(renderer){
        renderer.drawRect(skin.textbox.background, this.position, this.size, 0);
        this.drawBorder(renderer, skin.textbox.border, 1);
        var ofst=0;
        var origlen, tlen;
        tlen=origlen=renderer.textLength(this.text, this.font);


        if(tlen>this.tbsize[0]){
            ofst=tlen-this.tbsize[0];
        }
        if(this.pos<this.text.length){
            tlen=renderer.textLength(this.text.substr(0, this.pos), this.font);
            ofst=Math.min(tlen, ofst);
        }

        if(this.text){
            //console.log(ofst)
            var s=new gamejs.Surface(origlen, this.tbsize[1]);
            renderer.drawText(this.text, this.font, [0, 10], 1, s);

            //renderer.surface.blit(s, [0, 0]);
           // renderer.surface.blit(s, new gamejs.Rect([0, 0], this.size), new gamejs.Rect([ofst, 0], [Math.min(this.size[0], tlen-ofst), this.size[1]] ));
            renderer.surface.blit(s, new gamejs.Rect(this.tbposition,[Math.min(origlen-ofst, this.tbsize[0]), this.tbsize[1]]) , new gamejs.Rect([ofst, 0], [Math.min(origlen-ofst, this.tbsize[0]), this.tbsize[1]]));

        }
        if(this.blip){
            renderer.drawText('|', this.font, [this.tbposition[0]+tlen-ofst-1, this.tbposition[1]+10]);
        }

    };
    return this;
};

gamejs.utils.objects.extend(TextBox, UIElement);

var Label=exports.Label=function(pars){
    /*
     pars:

     scene
     position
     size
     text
     font
    */
    Label.superConstructor.apply(this, [pars]);
    this.text=pars.text;
    this.font=pars.font ? pars.font : skin.label.font;

    this.draw=function(renderer){
        renderer.drawText(this.text, this.font, this.position);
    };


    this.setText=function(text){
        this.text=text;
    };

    return this;
};


gamejs.utils.objects.extend(Label, UIElement);

var Button=exports.Button=function(pars){
    /*
     pars:
     scene
     position
     text
     onclick
     arg  --optional, second argument of callback
     font -- optional, default 'default'
     scope --optional, default is scene

    */
    pars.size= [200, 30];
    Button.superConstructor.apply(this, [pars]);
    this.text=pars.text;
    this.onclick=pars.onclick;
    this.arg=pars.arg;
    this.font=pars.font ? pars.font : skin.button.font;
    this.selected=false;
    this.scope=pars.scope;

    this.draw=function(renderer){

        /*this.drawBorder(renderer, skin.button.border, 2);
        if(this.selected) this.fill(renderer, skin.button.selected_fill);
        else if(this.hover) this.fill(renderer, skin.button.hover_fill);
        else this.fill(renderer, skin.button.fill);*/
        if(this.selected)renderer.drawUIImage('button_selected.png', this.position);
        else if(this.hover)renderer.drawUIImage('button_hover.png', this.position);
        else renderer.drawUIImage('button.png', this.position);

        var sz=renderer.cache.getTextSize(this.text, this.font);

        renderer.drawText(this.text, this.font, [this.position[0]+8, this.position[1]+(this.size[1]-sz[1])/2+8 ]);
        // FF6A00
    };

    this.update=function(msDuration){
        var evts=this.getEvents();
        if(evts){
            for(var i=0;i<evts.length;i++){
                if(evts[i][0]=='click'){
                    var scope=this.scope ? this.scope : this.scene;
                    scope._onclick=this.onclick;
                    scope._onclick(this, this.arg);
                }
                if(evts[i][0]=='focus' || evts[i][0]=='blur' || evts[i][0]=='mouseover' || evts[i][0]=='mouseout'){
                    this.scene.refresh=true;
                }
            }
        }
    };

    return this;
};

gamejs.utils.objects.extend(Button, UIElement);

var UIScene=exports.UIScene=function(game, cache){
    this.cache=cache;
    this.game=game;
    //interactable objects
    this.objects=[];

    //disabled objects
    this._objects=[];

    //element that is being focused
    this.focused_element;

    //is alert box being displayed?
    this.alerted=false;


    //if ping is set to true, this scene will ping the server every ms_to_ping miliseconds so as not to time out.
    this.ping=false;
    this.ms_to_ping=10000;

    //if set to true, will redraw screen and set to false
    this.refresh=true;

    this.alert=function(text, button){
        if(!this.alerted){
            this._objects=this.objects;
            this.alerted=true;
        }
        this.objects=[];
        if(!(button===false)){
            new Button({'scene':this,
                        'position':[this.renderer.width/2-100,
                                    this.renderer.height/2-16+20-50],
                        'text':' Ok',
                        'onclick':this.clearAlert});
        }

        new Label({'scene':this,
                 'position':[this.renderer.width/2-this.cache.getTextSize(text, skin.label.font)[0]/2,
                            this.renderer.height/2-32-50],
                'text':text});
      };

    this.clearAlert=function(){
        this.alerted=false;
        this.objects=this._objects;
    };

    this.addObject=function(obj){
        this.objects[this.objects.length]=obj;
        this.refresh=true;
    };

    this.returnToTitle=function(){
        this.game.showTitle();
    };
    this.handleMessageDefault=function(cmd, payload){
        if(cmd==='ERR'){
            this.alert(payload.text);
        }else if(cmd==='CRITICAL_ERR'){
            this.returnToTitle();
            this.game.title_scene.alert(payload.text);
        }else if(cmd==='HELLO' || cmd==='PONG'){

        }else{
            this.alert('Unknown server message:'+cmd);
        }

    };
    this.renderer=new renderer.UIRenderer(settings.get('SCREEN_WIDTH'), settings.get('SCREEN_HEIGHT'), this.cache);

    this.handleEvent=function(event){
    var i;

    if(event.type==gamejs.event.MOUSE_MOTION){
        var pos=event.pos;
        var obj;
        for(var i=0; i<this.objects.length;i++){
          obj=this.objects[i];
          if( (pos[0]>=obj.position[0]) && (pos[0]<=(obj.position[0]+obj.size[0]))
               &&(pos[1]>=obj.position[1]) && (pos[1]<=(obj.position[1]+obj.size[1]))){
            if(!obj.hover){
                obj.hover=true;
                obj.queueEvent('mouseover');
            }
            else{
                obj.queueEvent('mousemotion', [event.pos[0]-obj.position[0], event.pos[1]-obj.position[1]]);
            }
          }else{
            if(obj.hover){
                obj.hover=false;
                obj.queueEvent('mouseout');
            }
          };
        };

    }else if(event.type==gamejs.event.MOUSE_DOWN){
        var obj, obj2;
        var found=false;
        for(var i=0; i<this.objects.length;i++){
            obj=this.objects[i];
            if(obj.hover){
                //if mouse is on this element, click and focus
                obj.queueEvent('click', [event.pos[0]-obj.position[0], event.pos[1]-obj.position[1]]);
                obj.queueEvent('focus');
                obj.focus=true;
                this.focused_element=obj;
                //blur any other focused element
                for(var k=0;k<this.objects.length;k++){
                    obj2=this.objects[k];
                    if(obj2!=obj){
                        if(obj2.focus){
                            obj2.focus=false;
                            obj2.queueEvent('blur');
                        }
                    }
                }
                found=true;
                break;
            }
        }
        //if did not click on anything, blur any focused element
        if(!found){
            for(var k=0;k<this.objects.length;k++){
                obj=this.objects[k];
                if(obj.focus){
                    obj.focus=false;
                    this.focused_element=null;
                    obj.queueEvent('blur');
                }
            }
        }


    //on key press send key to focused element
    }else if(event.type==gamejs.event.KEY_DOWN){
        if(this.focused_element){
            this.focused_element.queueEvent('keydown', event.key);
        }
    }else if(event.type==gamejs.event.KEY_UP){
        if(this.focused_element){
            this.focused_element.queueEvent('keyup', event.key);
        }
    }

    //flush events for disabled objects. not pretty, cant be bothered to make pretty :/
    for(var i=0; i<this.objects.length;i++) if(this.objects[i].enabled===false) this.objects[i].getEvents();
  };

  this.handleMessage=function(cmd, payload){
        this.handleMessageDefault(cmd, payload);
  };

  this.update=function(msDuration){
        if(this.ping){
            this.ms_to_ping-=msDuration;
            if(this.ms_to_ping<=0){
                this.game.getCommunicator().queueMessage('PING');
                this.ms_to_ping=10000;
            }
        }
        var i;
        for(i=0;i<this.objects.length;i++){
            if(this.objects[i].update && (!(this.objects[i].enabled===false))) this.objects[i].update(msDuration);
        };
  };

  this.draw=function(display){
        if(!this.refresh)return;
        this.renderer.setSurface(display);
        this.renderer.fillBackground(skin.ui_background);

        var objects=this.alerted ? this._objects : this.objects;
        for(var i=0;i<objects.length;i++){
            if(objects[i].draw && (!(objects[i].enabled===false))) objects[i].draw(this.renderer);
        };

        if(this.alerted){
            var w=500;
            var h=100;
            var x=this.renderer.width/2 - w/2
            var y=this.renderer.height/2 - h/2-50;

            //border
            this.renderer.drawRect(skin.alert_box_border, [x, y], [w, h], 1);

            //fill
            this.renderer.drawRect(skin.alert_box_background, [x+1, y+1], [w-2, h-2], 0);


            for(var i=0;i<this.objects.length;i++){
                if(this.objects[i].draw) this.objects[i].draw(this.renderer);
            };
        }
        this.refresh=false;

  };

  return this;

};
