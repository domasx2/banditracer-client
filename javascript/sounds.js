var gamejs = require('gamejs');
var resources = require('./resources');
var settings = require('./settings');
var engine = require('./engine');
var _sounds = {};
var _playing = 0;

function Engine() {
    this.audios={}
    this.playing=null;
    this.t=0;
    var s;

    this.play=function(pitch){
        if(this.playing!=pitch){
            for(var p=0;p<=5;p++){
                if(p!=pitch){
                    this.audios[p].stop();
                }else{       
                    this.audios[p].play();
                    this.t=this.audios[p].getLength();
                    this.playing=this.audios[p];
                }
            }
            
        }
    };
    
    this.play_by_speed=function(speed, max_speed){
        if(speed<5){
            this.play(0) //idle
        }
        else{
            this.play(Math.min(parseInt(Math.ceil((speed*10)/(max_speed*2))), 5));   
        }
    };
    
    this.stop=function(){
        return;
        for(var p in this.audios){
            this.audios[p].stop();
        }
        this.playing=null;
    };
    
    this.update=function(msDuration){
        if(!(this.playing===null)){
            if(this.t<=0){
                this.playing.play()
            }
            else{
                this.t-=msDuration;
            }
        }
    };
    
    for(var i = 0; i <= 5; i++){
        this.audios[i] = new gamejs.mixer.Sound('sounds/engine/loop_'+i+'.wav');
    }
}

exports.engine = null;

var play = exports.play=function(pars, renderer){
    /*
    pars:
    
    filename,
    position - world coordinates, optional. if provided, will not play unless position is within camera view.
    */
    if(!settings.get('SOUND')) return;

    if(pars.position && renderer){
        var lpos=renderer.getScreenPoint(pars.position);
        if((lpos[0]>=0) && (lpos[1]>=0) && (lpos[0]<=renderer.width) && (lpos[1]<=renderer.height)){
            _sounds[pars.filename].play();
        }
    }
    //no position, just play
    else{
        _sounds[pars.filename].play();
    }
};

exports.init = function(){
    resources.sound_fx.forEach(function(filename){
        _sounds[filename] = new gamejs.mixer.Sound('sounds/fx/'+filename);
    });
    exports.engine = new Engine();
};

var Sound = exports.Sound = function(pars){
       Sound.superConstructor.apply(this, [pars]);
};

gamejs.utils.objects.extend(Sound, engine.Object);

engine.register_class(Sound);

Sound.prototype.draw = function(renderer){
    play(this.parameters, renderer);
    this.world.destroy(this);
};



