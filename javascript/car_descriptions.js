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

exports.Bandit={'width':1.6,
                'height':3.5,
                'name':'Bandit',
                'filenames':['bandit.png'],
                'power':100,
                'max_speed':135,
                'max_steer_angle':20,
                'health':80,
                'main_weapon':'Machinegun',
                'wheels':[{'x':-1, 'y':-1, 'width':0.4, 'length':0.8, 'revolving':true, 'powered':true, 'filename':'wheel.png'},
                          {'x':1, 'y':-1, 'width':0.4, 'length':0.8, 'revolving':true, 'powered':true, 'filename':'wheel.png'},
                          {'x':-1, 'y':1.1, 'width':0.4, 'length':0.8, 'revolving':false, 'powered':false, 'filename':'wheel.png'},
                          {'x':1, 'y':1.1, 'width':0.4, 'length':0.8, 'revolving':false, 'powered':false, 'filename':'wheel.png'}]
                };
exports.Racer={'width':2,
                'name':'Racer',
               'height':4,
               'filenames':['yellow_car.png', 'blue_car.png', 'green_car.png', 'pink_car.png'],
                'power':90,
                'max_steer_angle':18,
                'max_speed':145,
                'health':100,
                'main_weapon':'Machinegun',
                'wheels':[{'x':-1, 'y':-1.2, 'width':0.4, 'length':0.8, 'revolving':true, 'powered':true, 'filename':'wheel.png'},
                          {'x':1, 'y':-1.2, 'width':0.4, 'length':0.8, 'revolving':true, 'powered':true, 'filename':'wheel.png'},
                          {'x':-1, 'y':1.2, 'width':0.4, 'length':0.8, 'revolving':false, 'powered':false, 'filename':'wheel.png'},
                          {'x':1, 'y':1.2, 'width':0.4, 'length':0.8, 'revolving':false, 'powered':false, 'filename':'wheel.png'}]

            };
exports.Brawler={'width':3,
                'height':6,
                'name':'Brawler',
                'filenames':['brawler_yellow.png', 'brawler_green.png', 'brawler_blue.png', 'brawler_red.png'],
                'power':150,
                'max_steer_angle':17,
                'max_speed':140,
                'health':160,
                'main_weapon':'MissileLauncher',
                'wheels':[{'x':-1.25, 'y':-2, 'width':0.6, 'length':1.2, 'revolving':true, 'powered':true, 'filename':'big_wheel.png'},
                          {'x':1.25, 'y':-2, 'width':0.6, 'length':1.2, 'revolving':true, 'powered':true, 'filename':'big_wheel.png'},
                          {'x':-1.25, 'y':2.1, 'width':0.6, 'length':1.2, 'revolving':false, 'powered':false, 'filename':'big_wheel.png'},
                          {'x':1.25, 'y':2.1, 'width':0.6, 'length':1.2, 'revolving':false, 'powered':false, 'filename':'big_wheel.png'}]
                };
