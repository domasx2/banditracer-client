/*car:
 
    width             - width in meters
    height            - height in meters
    filenames          - sprite file name
    power             -engine power in newtons
    max_steer_angle   -max steering angle, degrees
    max_speed         -max speed, km/h
    wheels      -front wheel definitions: [[-1, -1.2], [1, -1.2]] 
    weapon1           -first weapon
    weapon2           -second weapon
    health            -max health
*/

/*
  wheel:
  x
  y
  revolving
  powered
*/

/*
 this.player_car=new cars.Car({'width':2,
                                    'height':4,
                                    'filename':'yellow_car.png',
                                    'world':this.world,
                                    'position':[car_positions[1].x+1, car_positions[1].y+2],
                                    'angle':car_positions[1].angle,
                                    'power':90,
                                    'max_steer_angle':20,
                                    'max_speed':150,
                                    'front_wheels':[[-1, -1.2], [1, -1.2]],
                                    'back_wheels':[[-1, 1.1], [1, 1.2]],
                                    'weapon1':new weapons.Machinegun({}),
                                    'weapon2':new weapons.MineLauncher({}),
                                    'health':100});
 
*/


exports.Bandit={'width':1.7,
                'height':3.5,
                'id':'Bandit',
                'name':'Bandit',
                'description':'Small but agile',
                'filenames':['bandit_yellow.png', 'bandit_green.png', 'bandit_blue.png', 'bandit_red.png'],
                'art_filename':'bandit_big.png',
                'power':105,
                'max_speed':110,
                'max_steer_angle':17,
                'health':80,
                
                'power_upgrade':6,
                'speed_upgrade':4,
                'armor_upgrade':20,
                'upgrade_price':600,
                
                'speed_stars':1,
                'acceleration_stars':4,
                'armor_stars':1,
                'handling_stars':4,
                
                'price':3000,
                
                'main_weapon':'Machinegun',
                'wheels':[{'x':-0.85, 'y':-1, 'width':0.4, 'length':0.8, 'revolving':true, 'powered':true, 'filename':'wheel.png'},
                          {'x':0.85, 'y':-1, 'width':0.4, 'length':0.8, 'revolving':true, 'powered':true, 'filename':'wheel.png'},
                          {'x':-0.85, 'y':1.1, 'width':0.4, 'length':0.8, 'revolving':false, 'powered':false, 'filename':'wheel.png'},
                          {'x':0.85, 'y':1.1, 'width':0.4, 'length':0.8, 'revolving':false, 'powered':false, 'filename':'wheel.png'}]
                };
                
exports.Sandbug={'id':'Sandbug',
                'width':1.8,
                'height':4,
                'name':'Sandbug',
                'description':'A basic, low budget car',
                'filenames':['sandbug_yellow.png', 'sandbug_green.png', 'sandbug_blue.png', 'sandbug_red.png'],
               'art_filename':'sandbug_big.png',
               'power':75,
               'max_steer_angle':15,
               'max_speed':100,
               'health':100,
               
               'power_upgrade':7,
               'speed_upgrade':4,
               'armor_upgrade':20,
               'upgrade_price':300,
               
               'speed_stars':1,
               'acceleration_stars':1,
               'armor_stars':2,
               'handling_stars':2,
               
               'price':1000,
               'wheels':[{'x':-0.9, 'y':-1.2, 'width':0.4, 'length':0.8, 'revolving':true, 'powered':true, 'filename':'wheel.png'},
                          {'x':0.9, 'y':-1.2, 'width':0.4, 'length':0.8, 'revolving':true, 'powered':true, 'filename':'wheel.png'},
                          {'x':-0.9, 'y':1.2, 'width':0.4, 'length':0.8, 'revolving':false, 'powered':false, 'filename':'wheel.png'},
                          {'x':0.9, 'y':1.2, 'width':0.4, 'length':0.8, 'revolving':false, 'powered':false, 'filename':'wheel.png'}]
                };
               
exports.Thunderbolt = {'width':2.1,
                       'height':4.5,
                       'id':'Thunderbolt',
                       'name':'Thunderbolt',
                       'description':'A powerful muscle car',
                       'filenames':['thunderbolt_yellow.png', 'thunderbolt_green.png', 'thunderbolt_blue.png', 'thunderbolt_red.png'],
                       'art_filename':'thunderbolt_big.png',
                       'power':140,
                       'max_steer_angle':13,
                       'max_speed':135,
                       'health':140,
                       
                       'power_upgrade':9,
                       'speed_upgrade':5,
                       'armor_upgrade':25,
                       'upgrade_price':1200,
                       
                       'speed_stars':4,
                       'acceleration_stars':4,
                       'armor_stars':3,
                       'handling_stars':1,
                       
                       'price':7000,
                       
                       'wheels':[{'x':-1, 'y':-1.4, 'width':0.4, 'length':0.8, 'revolving':true, 'powered':true, 'filename':'wheel.png'},
		                          {'x':1, 'y':-1.4, 'width':0.4, 'length':0.8, 'revolving':true, 'powered':true, 'filename':'wheel.png'},
		                          {'x':-1, 'y':1.4, 'width':0.4, 'length':0.8, 'revolving':false, 'powered':false, 'filename':'wheel.png'},
		                          {'x':1, 'y':1.4, 'width':0.4, 'length':0.8, 'revolving':false, 'powered':false, 'filename':'wheel.png'}]
                       
                       }  ;             
                
                
exports.Racer={'width':2,
                'id':'Racer',
                'name':'Racer',
                'description':'A well rounded racing car',
               'height':4,
               'filenames':['racer_yellow.png', 'racer_green.png', 'racer_blue.png', 'racer_red.png'],
               'art_filename':'racer_big.png',
                'power':90,
                'max_steer_angle':16,
                'max_speed':125,
                'health':100,
                
                'power_upgrade':7,
                'speed_upgrade':4,
                'armor_upgrade':20,
                'upgrade_price':600,
                
                'speed_stars':3,
                'acceleration_stars':2,
                'armor_stars':2,
                'handling_stars':3,
                
                'price':4500,
                
                'wheels':[{'x':-0.9, 'y':-1.2, 'width':0.4, 'length':0.8, 'revolving':true, 'powered':true, 'filename':'wheel.png'},
                          {'x':0.9, 'y':-1.2, 'width':0.4, 'length':0.8, 'revolving':true, 'powered':true, 'filename':'wheel.png'},
                          {'x':-0.9, 'y':1.2, 'width':0.4, 'length':0.8, 'revolving':false, 'powered':false, 'filename':'wheel.png'},
                          {'x':0.9, 'y':1.2, 'width':0.4, 'length':0.8, 'revolving':false, 'powered':false, 'filename':'wheel.png'}]
                
            };
            
exports.Hillbilly={'width':2.4,
                'height':5,
                'id':'Hillbilly',
                'name':'Hillbilly',
                'description':'Sturdy, lots of space in the back',
                'filenames':['samaritan_yellow.png', 'samaritan_green.png', 'samaritan_blue.png', 'samaritan_red.png'],
                'art_filename':'samaritan_big.png',
                'power':120,
                'max_steer_angle':16,
                'max_speed':115,
                'health':140,
                
                'power_upgrade':10,
                'speed_upgrade':4,
                'armor_upgrade':25,
                'upgrade_price':600,
                
                'speed_stars':2,
                'armor_stars':3,
                'acceleration_stars':1,
                'handling_stars':2,
                
                'price':4000,
                
                'wheels':[{'x':-1, 'y':-1.7, 'width':0.6, 'length':1.2, 'revolving':true, 'powered':true, 'filename':'big_wheel.png'},
                          {'x':1, 'y':-1.7, 'width':0.6, 'length':1.2, 'revolving':true, 'powered':true, 'filename':'big_wheel.png'},
                          {'x':-0.9, 'y':1.6, 'width':0.6, 'length':1.2, 'revolving':false, 'powered':false, 'filename':'big_wheel.png'},
                          {'x':0.9, 'y':1.6, 'width':0.6, 'length':1.2, 'revolving':false, 'powered':false, 'filename':'big_wheel.png'}]
                };
            
            
exports.Brawler={'width':3,
                'height':6,
                'id':'Brawler',
                'name':'Brawler',
                'description':'Heavily armored combat SUV',
                'filenames':['brawler_yellow.png', 'brawler_green.png', 'brawler_blue.png', 'brawler_red.png'],
                'art_filename':'brawler_big.png',
                'power':150,
                'max_steer_angle':16,
                'max_speed':120,
                'health':180,
                
                'power_upgrade':12,
                'speed_upgrade':4,
                'armor_upgrade':30,
                'upgrade_price':600,
                
                'speed_stars':3,
                'armor_stars':4,
                'acceleration_stars':1,
                'handling_stars':1,
                
                'price':6000,
                
                'main_weapon':'MissileLauncher',
                'wheels':[{'x':-1.25, 'y':-2, 'width':0.6, 'length':1.2, 'revolving':true, 'powered':true, 'filename':'big_wheel.png'},
                          {'x':1.25, 'y':-2, 'width':0.6, 'length':1.2, 'revolving':true, 'powered':true, 'filename':'big_wheel.png'},
                          {'x':-1.25, 'y':2.1, 'width':0.6, 'length':1.2, 'revolving':false, 'powered':false, 'filename':'big_wheel.png'},
                          {'x':1.25, 'y':2.1, 'width':0.6, 'length':1.2, 'revolving':false, 'powered':false, 'filename':'big_wheel.png'}]
                };