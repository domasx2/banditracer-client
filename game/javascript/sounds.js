var gamejs = require('gamejs');
var resources = require('./resources');
var settings = require('./settings');
var engine = require('./engine');
var _sounds = {};
var _playing = 0;

function Engine() {
    this.audios={}
    this.playing=null;
    var s;

    this.play=function(pitch){
        if(this.playing!=pitch){
            for(var p=0;p<=5;p++){
                if(p!=pitch){
                    this.audios[p].stop();
                }else{       
                    this.audios[p].play();
                    this.playing=this.audios[p];
                }
            }    
        }
    };
    
    this.play_by_speed=function(speed, max_speed){
        if(speed < 5){
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
    
    for(var i = 0; i <= 5; i++){
        this.audios[i] = new engine.Sound('sounds/engine/loop_'+i+'.wav', true);
    }
}
exports.play = function(pars){
    if(settings.get('sound'))engine.play_sound('sounds/fx/'+pars.filename); 
};
exports.engine = null;

exports.init = function(){
    //exports.engine = new Engine();
};

