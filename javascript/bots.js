var names=exports.names=['Bob', 'The Dominator', 'Desert Penguin', 'Smiley'];
var car_descriptions=require('./car_descriptions');
exports.generateBotCarDescr=function(){
    var cartypes=[];
    for(var key in car_descriptions) cartypes.push(key);
    var ct=cartypes[Math.floor(Math.random()*(cartypes.length))];
    var weapons=['Machinegun', 'MissileLauncher'];
    var wp=weapons[Math.floor(Math.random()*(weapons.length))];
    var retv={'type':ct,
                'front_weapon':{'type':wp,
                                'ammo_upgrades':0,
                                'damage_upgrades':0},
                'util':null,
                'rear_weapon':null,
                'acc_upgrades':0,
                'speed_upgrades':0,
                'armor_upgrades':0};
    
    return retv;
};

//LEAGUE 1

exports.CatLady={'type':'Sandbug',
                    'name':'Cat Lady',
                    'front_weapon':{'type':'Machinegun',
                                    'ammo_upgrades':0,
                                    'damage_upgrades':0},
                    'util':null,
                    'rear_weapon':{'type':'MineLauncher',
                                    'ammo_upgrades':0,
                                    'damage_upgrades':0},
                    'acc_upgrades':0,
                    'speed_upgrades':0,
                    'armor_upgrades':0};
                    
                    
exports.Bob={'type':'Hillbilly',
                    'name':'Bob',
                    'front_weapon':{'type':'MissileLauncher',
                                    'ammo_upgrades':1,
                                    'damage_upgrades':1},
                    'util':null,
                    'rear_weapon':null,
                    'acc_upgrades':2,
                    'speed_upgrades':0,
                    'armor_upgrades':0};
                    
                    
exports.Dominator={'type':'Sandbug',
                      'name':'The Dominator',
                      'front_weapon':{'type':'Machinegun',
                                    'ammo_upgrades':3,
                                    'damage_upgrades':0},
                    'util':null,
                    'rear_weapon':null,
                    'acc_upgrades':0,
                    'speed_upgrades':0,
                    'armor_upgrades':2};
                    
//LEAGUE 2             
exports.HotShot={'type':'Racer',
                    'name':'HotShot',
                    'front_weapon':{'type':'Machinegun',
                                    'ammo_upgrades':5,
                                    'damage_upgrades':3},
                    'util':{'type':'Shockwave',
                                    'ammo_upgrades':0,
                                    'damage_upgrades':0},
                    'rear_weapon':null,
                    'acc_upgrades':0,
                    'speed_upgrades':0,
                    'armor_upgrades':0};
                    
                    
exports.TheDude={'type':'Hillbilly',
                    'name':'The Dude',
                    'front_weapon':{'type':'HomingMissiles',
                                    'ammo_upgrades':1,
                                    'damage_upgrades':1},
                    'util':null,
                    'rear_weapon':{'type':'Oil',
                                    'ammo_upgrades':1,
                                    'damage_upgrades':1},
                    'acc_upgrades':2,
                    'speed_upgrades':2,
                    'armor_upgrades':0};
                    
                    
exports.Ratman={'type':'Bandit',
                      'name':'Ratman',
                      'front_weapon':{'type':'PlasmaCannon',
                                    'ammo_upgrades':2,
                                    'damage_upgrades':0},
                    'util':{'type':'RepairKit',
                                    'ammo_upgrades':2,
                                    'damage_upgrades':0},
                    'rear_weapon':null,
                    'acc_upgrades':0,
                    'speed_upgrades':2,
                    'armor_upgrades':2};
                    

//league three

exports.Bulldog = {'type':'Brawler',
				   'name':'Brawler',
				   'front_weapon':{'type':'MissileLauncher',
				   				   'ammo_upgrades':4,
				   				   'damage_upgrades':3},
				   'util':{'type':'NOS',
				   		   'ammo_upgrades':1,
				   		   'damage_upgrades':0},
				   	'rear_weapon':{'type':'Oil',
                                    'ammo_upgrades':1,
                                    'damage_upgrades':1},
				   	'acc_upgrades':2,
				   	'speed_upgrades':1,
				   	'armor_upgrades':2};
				   	
exports.JC={'type':'Bandit',
              'name':'JC',
              'front_weapon':{'type':'Machinegun',
                                'ammo_upgrades':2,
                                'damage_upgrades':3},
	           'util':{'type':'Shield',
	                    'ammo_upgrades':0,
	                    'damage_upgrades':0},
	           'rear_weapon':{'type':'Napalm',
	                          'ammo_upgrades':2,
	                          'damage_upgrades':1},
	           'acc_upgrades':0,
	           'speed_upgrades':3,
	           'armor_upgrades':1};
	           
exports.PainKid={'type':'Racer',
	                'name':'Pain Kid',
	                'front_weapon':{'type':'Machinegun',
	                                'ammo_upgrades':5,
	                                'damage_upgrades':3},
	                'util':{'type':'Shockwave',
	                                'ammo_upgrades':1,
	                                'damage_upgrades':0},
	                'rear_weapon':{'type':'MineLauncher',
	                                'ammo_upgrades':2,
	                                'damage_upgrades':4},
	                'acc_upgrades':0,
	                'speed_upgrades':2,
	                'armor_upgrades':2};
                    	           
                    
				   	
				
