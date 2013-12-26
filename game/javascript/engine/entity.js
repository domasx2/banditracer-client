var log = require('./logging');
var box2d = require('./box2d');
var object = require('./object');
var utils = require('./utils');

var gamejs = require('gamejs');
var vectors = gamejs.utils.vectors;

var math = gamejs.utils.math;
var radians=math.radians;
var degrees=math.degrees;

var utils = require('./utils');
var arr = utils.arr;
var vec = utils.vec;

var Entity = exports.Entity = function(parameters){

    var par_list = [    
                        'position',
                        'size',
                        ['angle',           0],
                        ['max_health',      0],
                        ['fixed_rotation',  false],
                        ['density',         1],
                        ['restitution',     0.4],
                        ['friction',        0.3],
                        ['linear_damping',  0.15],
                        ['angular_damping', 0.3],
                        ['bullet',          false],
                        ['body_type',       box2d.b2Body.b2_dynamicBody],
                        ['sensor',          false],
                        ['alive',           true]
                   ];
               
    utils.process_parameters(parameters, par_list);
    
    Entity.superConstructor.apply(this, [parameters]);
    
    this.add_tag('entity');
    
    if(this.parameters.sensor) this.add_tag('sensor');
    else this.add_tag('solid');
    
    this.health = this.max_health = this.parameters.max_health;
    this.alive = this.parameters.alive;
    this.buffs = [];
    this._next_buff_id = 1;
    
    if(this.parameters.angle == undefined || this.parameters.angle == null) throw 'Invaldi angle';
    if(isNaN(this.parameters.position[0]) || isNaN(this.parameters.position[1])) throw 'Invalid position: '+this.parameters.position;
    
    this.initialize_body();
    
    gamejs.utils.objects.accessor(this, 'position', this.get_position, this.set_position);
    gamejs.utils.objects.accessor(this, 'angle',    this.get_angle,    this.set_angle); 
};

gamejs.utils.objects.extend(Entity, object.Object);

Entity.prototype.initialize_body = function() {
    var def = new box2d.b2BodyDef();
    def.type = this.parameters.body_type;
    def.position = vec(this.parameters.position);

    //QUIRK setting a rounded angle causes wobbling for a few moments
    // on this box2d version

    def.angle = radians(this.parameters.angle + 0.00001);
    def.linearDamping = this.parameters.linear_damping;
    def.angularDamping = this.parameters.angular_damping;
    def.bullet = this.parameters.bullet;
    def.fixedRotation = this.parameters.fixed_rotation;
    this.body = this.world._create_body(def);
    this.body.SetUserData(this);

    var fixdef = new box2d.b2FixtureDef();
    fixdef.density = this.parameters.density;
    fixdef.friction = this.parameters.friction;
    fixdef.isSensor = this.parameters.sensor;
    //friction when rubbing agaisnt other shapes
    fixdef.restitution = this.parameters.restitution;
    //amount of force feedback when hitting something. >0 makes the car bounce off, it's fun!
    fixdef.shape = this.initialize_shape();
    this.body.CreateFixture(fixdef);
};

Entity.prototype.initialize_shape = function (){
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(this.parameters.size[0] / 2, this.parameters.size[1] / 2);
    return shape;
};

Entity.prototype.get_position = function(){
    return arr(this.body.GetPosition());
};

Entity.prototype.set_position = function(position){
    this.body.SetPosition(vec(position));
};

Entity.prototype.get_angle = function(){
    return degrees(this.body.GetAngle());
};

Entity.prototype.set_angle = function(angle){
    this.body.SetAngle(radians(angle));
};

Entity.prototype.set_linear_velocity = function(velocity) {
    this.body.SetLinearVelocity(vec(velocity));
};

Entity.prototype.get_linear_velocity = function(local_point){
    if(local_point){
        return arr(this.body.GetLinearVelocityFromLocalPoint(vec(local_point)));
    } else {
        return  arr(this.body.GetLinearVelocity());
    }
};
/*
 * 
 *speed in kilometers per hour
 * 
 */
Entity.prototype.set_speed = function(speed){
    velocity = vectors.multiply(vectors.unit(this.get_direction_vector()), ((speed*1000.0)/3600.0));
    this.set_linear_velocity(velocity);
};

Entity.prototype.impact = function(object, cpoint, direction){
      
};

Entity.prototype.destroy = function(){
    this.world.destroy(this);
};

Entity.prototype.apply_damage = function(damage, player){
    this.health -= damage;
    if(this.health < 0){
        this.die();
    }
};

Entity.prototype.get_world_point = function(local_point){
    return arr(this.body.GetWorldPoint(vec(local_point)));
};

Entity.prototype.get_local_point = function(world_point){
    return arr(this.body.GetLocalPoint(vec(world_point)));
};

Entity.prototype.get_world_vector = function(local_vector){
    return arr(this.body.GetWorldVector(vec(local_vector)));
};

Entity.prototype.get_local_vector = function(world_vector){
    return arr(this.body.GetLocalVector(vec(world_vector)));
};

Entity.prototype.get_local_velocity = function(local_point){
    if(local_point == undefined) local_point = [0, 0];
    return arr(this.body.GetLinearVelocityFromLocalPoint(vec(local_point)));
};

Entity.prototype.get_mass = function(){
    return this.body.GetMass();
};

Entity.prototype.get_sideways_vector = function(){
    return this.get_world_vector([-1, 0]);
};

Entity.prototype.get_direction_vector = function(){
    return vectors.rotate( (this.get_local_vector(this.get_local_velocity())[1]>0) ? [0, 1]:[0, -1] , this.body.GetAngle()) ;
};

Entity.prototype.get_backward_direction_vector = function(){
    return vectors.rotate( (this.get_local_velocity()[1]>0) ? [0, -1]:[0, 1] , this.body.GetAngle()) ;
};

Entity.prototype.get_world_center = function(){
    return arr(this.body.GetWorldCenter());
};

Entity.prototype.apply_force = function(local_force_vector, local_position){
    this.body.ApplyForce(vec(this.get_world_vector(local_force_vector)), vec(this.get_world_point(local_position)));
};

Entity.prototype.apply_impulse = function(force_vector, position) {
    this.body.ApplyImpulse(vec(force_vector), vec(position));
};