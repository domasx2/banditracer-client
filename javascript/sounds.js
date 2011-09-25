var gamejs=require('gamejs');
var resources=require('./resources');
var settings=require('./settings');
var _channels={};
var _queue=[];
var _playing=0;

function Channels(filename, count){
    this.audios=[];
    this.next=0;
    var s;
    for(var i=0;i<count;i++){
        s=new gamejs.mixer.Sound('sounds/fx/'+filename);
        s.setVolume(0.2);
        s.audio.addEventListener('ended', function(){
            if(_playing>0)_playing--;
        }, true);
        this.audios.push(s);
    }
    
    this.play=function(){
        if(_playing<settings.get('MAX_GLOBAL_SOUND_CHANNELS')){
            var a;
            this.audios[this.next].play();
            _playing++;
            this.next++;
            if(this.next==this.audios.length) this.next=0;
        }
    }
    return this;
}

function Engine(){
    this.audios={}
    this.playing=null;
    this.t=0;
    this.second_launched=false;
    this.third_launched=false;
    var s;
    /*for(var i=0;i<=5;i++){
        s=new gamejs.mixer.Sound('sounds/engine/loop_'+i+'.wav');
        s.setVolume(0.15);
        this.audios[i]=s;
    }   */
    
    this.play=function(pitch){
        return; //temporarily 
        if(this.playing!=pitch){
            for(var p=0;p<=5;p++){
                if(p!=pitch){
                    this.audios[p].stop();
                    this.audios[p].seek(0);
                }else{       
                    this.audios[p].play();
                    this.t=300;
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
            this.audios[p].seek(0);
        }
        this.playing=null;
    };
    
    this.update=function(msDuration){
        if(!(this.playing===null)){
            if(this.t<=0){
                this.playing.seek(0);
                this.t=300;
            }
            else{
                this.t-=msDuration;
            }
        }
    };
}

exports.engine=null;

exports.play=function(pars, renderer){
    /*
    pars:
    
    filename,
    position - world coordinates, optional. if provided, will not play unless position is within camera view.
    */
    if(!settings.get('SOUND')) return;
    
    if(pars.position && renderer){
        var lpos=renderer.getScreenPoint(pars.position);
        if((lpos[0]>=0) && (lpos[1]>=0) && (lpos[0]<=renderer.width) && (lpos[1]<=renderer.height)){
            _channels[pars.filename].play();
        }
    }
    //no position, just play
    else{
        _channels[pars.filename].play();
    }
};

exports.init=function(){
    resources.sound_fx.forEach(function(filename){
        _channels[filename]=new Channels(filename, settings.get('MAX_INDIVIDUAL_SOUND_CHANNELS'));
    });
    exports.engine=new Engine();
};

