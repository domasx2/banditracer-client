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

exports.Bandit={};
exports.Racer={'width':2,
               'height':4,
               'filename':'yellow_car.png',
                'power':90,
                'max_steer_angle':20,
                'max_speed':150,
                'health':100,
                'wheels':[{'x':-1, 'y':-1.2, 'revolving':true, 'powered':true},
                          {'x':1, 'y':-1.2, 'revolving':true, 'powered':true},
                          {'x':-1, 'y':1.2, 'revolving':false, 'powered':false},
                          {'x':1, 'y':1.2, 'revolving':false, 'powered':false}]
                
            };
exports.Hick={};