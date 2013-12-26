var audia = require('./audia');
var Audia = audia.Audia;
var object = require('./object');
var utils = require('./utils');
var gamejs = require('gamejs');
var _sounds = {};

if(audia.supported){ //define class based on condition. SUCK ON THAT STATIC LANGUAGES
    var Sound = exports.Sound = function(filename){
        this.cur = 0;
        this.audios = [];
        for(var i= 0; i< 8; i++){
            this.audios.push(new Audia(filename));
        }
    };
    
    Sound.prototype.play = function(loop){
        var audio = this.audios[this.cur++];
        if(this.cur == 8) this.cur = 0;
        audio.loop = loop ? true : false;
        audio.play();
    };
    
    Sound.prototype.stop = function(){
        this.audios.forEach(function(audio){
            audio.stop(); 
        });
    };
    
} else {
    var Sound = exports.Sound = function(filename){
        this.audio = new gamejs.mixer.Sound(filename);
    };
    
    Sound.prototype.play = function(loop){
        this.audio.play(loop ? true : false);
    };
    
    Sound.prototype.stop = function(){
        this.audio.stop();  
    };
}


var SoundObject = exports.SoundObject = function(pars){
       utils.process_parameters(pars, [ 'filename' , 
                                        ['loop', false],
                                        ['position', null]]);
       SoundObject.superConstructor.apply(this, [pars]);
};

gamejs.utils.objects.extend(SoundObject, object.Object);

exports.play = function(filename){
    _sounds[filename].play();
}

SoundObject.prototype.draw = function(renderer){
    var play = false;
    if(this.parameters.position){
        var screen_point = renderer.getScreenPoint(this.parameters.position);
        if(screen_point[0] > 0 && screen_point[0] < renderer.width 
           && screen_point[1] >0 && screen_point[1] < renderer.height){
               play = true;
           }
    } else{
        play = true;
    }
    if(play) _sounds[this.parameters.filename].play(this.parameters.loop);
    this.world.destroy(this);
};

var engine = require('../engine');

engine.register_class(SoundObject);

engine.initialize_sounds = exports.initialize = function(list_of_filenames){
    list_of_filenames.forEach(function(filename){
        _sounds[filename] = new Sound(filename); 
    });
};


