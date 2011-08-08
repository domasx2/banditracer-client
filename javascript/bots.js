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
                                'dmg_upgrades':0},
                'util':null,
                'rear_weapon':null,
                'acc_upgrades':0,
                'speed_upgrades':0,
                'armor_upgrades':0};
    
    return retv;
};