exports.Machinegun={'damage':5,
                    'type':'front_weapon',
                    'launcher':'Machinegun',
                    'projectile':'Bullet',
                    'speed':500,
                    'fire_rate':100,
                    'ammo_capacity':50,
                    'damage_upgrade':1,
                    'damage_upgrade_price':500,
                    'ammo_upgrade':10,
                    'ammo_upgrade_price':500,
                    'name':'Machineguns',
                    'icon':'icon_machinegun.png',
                    'price':700,
                    'description':'Your basic car accessory: two front mounted high caliber machineguns'};




exports.MissileLauncher={'damage':25,
                         'speed':400,
                         'type':'front_weapon',
                         'launcher':'MissileLauncher',
                         'projectile':'Missile',
                         'fire_rate':300,
                         'ammo_capacity':10,
                         'ammo_upgrade':2,
                         'ammo_upgrade_price':700,
                         'damage_upgrade':5,
                         'damage_upgrade_price':700,
                         'name':'Missiles',
                         'icon':'icon_missiles.png',
                         'price':1000,
                         'description':'Torpedo missiles with high yield warheads, for when you really don\'t like the guy in front of you'
                         };
                         
  


exports.RepairKit={'damage':30,
                    'type':'util',
                    'launcher':'RepairKit',
                    'projectile':null,
                    'fire_rate':500,
                    'ammo_capacity':2,
                    'ammo_upgrade':1,
                    'ammo_upgrade_price':500,
                    'damage_upgrade':10,
                    'damage_upgrade_price':700,
                    'name':'Repair Kit',
                    'icon':'icon_fix.png',
                    'price':1000,
                    'description':'Repair your car on the go with a automatic repair kit'                       
};

exports.NOS={'damage':15,
            'type':'util',
            'fire_rate':2000,
            'duration':2000,
            'ammo_capacity':2,
            'ammo_upgrade':1,
            'ammo_upgrade_price':1500,
            'damage_upgrade':4,
            'damage_upgrade_price':1000,
            'launcher':'NOS',
            'name':'Boost',
            'price':2000,
            'icon':'ico_nos.png',
            'description':'Increases top speed and acceleration for a shot time'};
                       


exports.Shockwave={'damage':10,
                    'type':'util',
                    'fire_rate':1500,
                    'ammo_capacity':3,
                    'ammo_upgrade':1,
                    'ammo_upgrade_price':1300,
                    'damage_upgrade':5,
                    'damage_upgrade_price':800,
                    'launcher':'ShockwaveGenerator',
                    'name':'Shockwave',
                    'price':1500,
                    'icon':'icon_sw.png',
                    'description':'Generates a shockwave that slams nearby cars away from your car'};
                         
                         
exports.HomingMissiles={'damage':18,
                        'speed':400,
                        'type':'front_weapon',
                        'launcher':'MissileLauncher',
                        'projectile':'HomingMissile',
                        'fire_rate':300,
                        'ammo_capacity':10,
                        'ammo_upgrade':2,
                        'ammo_upgrade_price':700,
                        'damage_upgrade':4,
                        'damage_upgrade_price':800,
                        'name':'Homing Missiles',
                        'price':1300,
                        'icon':'icon_missiles_homing.png',
                        'description':'Heat seeking missiles, a blind drivers favourite weapon'};
                         
                         


exports.MineLauncher={'damage':30,
                       'type':'rear_weapon',
                       'launcher':'MineLauncher',
                       'projectile':'Mine',
                       'fire_rate':500,
                       'ammo_capacity':4,
                       'ammo_upgrade':1,
                       'ammo_upgrade_price':600,
                       'damage_upgrade':8,
                       'damage_upgrade_price':500,
                       'name':'Mines',
                       'icon':'icon_mine.png',
                       'price':800,
                       'description':'Discourage tailgating with anti-vehicle mines'};

                 
exports.Oil={'damage':0,
             'type':'rear_weapon',
             'fire_rate':500,
             'duration':1000,
             'ammo_capacity':2,
             'ammo_upgrade':1,
             'ammo_upgrade_price':2000,
             'damage_upgrade':null,
             'damage_upgrade_price':null,
             'name':'Oil',
             'icon':'ico_oil.png',
             'price':2000,
             'launcher':'Oil',
             'projectile':'OilPuddle',
             'description':'Leave slippery puddles of finest grade oil'};

exports.Napalm={'damage':10,
		'type':'rear_weapon',
		'launcher':'MineLauncher',
		'projectile':'NapalmFlame',
		'fire_rate':80,
		'ammo_capacity':20,
		'ammo_upgrade':5,
		'ammo_upgrade_price':1000,
		'damage_upgrade':2,
		'damage_upgrade_price':1000,
		'name':'Napalm',
		'icon':'icon_flame.png',
		'price':2500,
		'description':'Burn your opponents to a crisp'
};
                       
                       
exports.PlasmaCannon={'damage':12,
                      'speed':500,
                      'type':'front_weapon',
                      'launcher':'PlasmaCannon',
                      'projectile':'PlasmaProjectile',
                      'fire_rate':200,
                      'ammo_capacity':24,
                      'damage_upgrade':3,
                      'damage_upgrade_price':1500,
                      'ammo_upgrade':6,
                      'ammo_upgrade_price':1500,
                      'name':'Plasma Cannon',
                      'icon':'icon_plasma.png',
                      'price':3000,
                      'description':'Fires super heated blobs of pure plasma that will burn through anything'
                      };