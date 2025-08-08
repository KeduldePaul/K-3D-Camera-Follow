import KUI from './KUI.js';
import Vec2 from './Vec2.js';

export default class Joystick extends KUI {
  #radius = 50;
  #headloc = new Vec2();
  #value = new Vec2();
  
  x1 = 0;
  y1 = 0;
  x2 = Infinity;
  y2 = Infinity;
  
  /**
   * Joystick setup configuration 
   * @typedef {Object} JoystickSetup
   * @property {Boolean} fixed - Set fixed or loose/detached joystick.
   */
   
  /**
   * Main constructor of JS Joystick.
   * 
   * @extends KUI.Joystick
   * 
   * @param {JoystickSetup} [setup={}] - setup for joystick.
   * 
   * @example
   * // Creating a fixed Joystick
   * const joystick = new Joystick({fixed: true});
   * 
   * //if fixed, set a location 
   * joystick.setLocation(60, gameHeight - 60);
   * //set boundary for joystick 
   * setBoundary(0, 0, gameWidth / 2, height)
   * ...
   * // When the settings changed as loose joystick.setLoose();
   * 
   */
  constructor(setup = {}) {
    super();
    
    const {
      fixed = false,
    } = setup;
    
    this.fixed = fixed;
  }
  
  setLocation(x, y) {
    this.loc.x = x;
    this.loc.y = y;
  }
  
  setRadius(rad) {
    this.#radius = rad;
  }
  
  setBoundary(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
  
  #insideBoundary(x, y) {
    return (x - this.x1) * (x - this.x2) < 0
           && (y - this.y1) * (y - this.y2) < 0;
  }
  
  setFixed() {
    return this.fixed = true;
  }
  
  setLoose() {
    return this.fixed = false;
  }
  
  get tid() {
    return this._tid;
  }
  
  get vx() {
    return this.#value.x;
  }
  
  get vy() {
    return this.#value.y;
  }
  
  get magnitude() {
    return Math.sqrt(this.vx ** 2 + this.vy ** 2);
  }
  
  onDown(id, x, y) {
    if (typeof this._tid !== 'undefined') return;
    
    let d = new Vec2();
    
    if (this.fixed === false) {
      this.loc.x = x;
      this.loc.y = y;
    }
    
    d.x = x - this.loc.x;
    d.y = y - this.loc.y;
    
    //check point-round collision
    if (d.magSq() > this.#radius * this.#radius || !this.#insideBoundary(x, y))
      return;
    
    this._tid = id;
    
    this.#value = Vec2.div(d, this.#radius);
    this.#headloc = d;
  }
  
  onMove(id, x, y) {
    if (this._tid !== id) return;
    
    let delta = Vec2.sub(new Vec2(x, y), this.loc);
    
    if (delta.magSq() > this.#radius**2) {
      delta.norm();
      delta.mult(this.#radius);
    }
    
    this.#value = Vec2.div(delta, this.#radius)
    this.#headloc = delta;
  }
  
  onUp(id, x, y) {
    if (this._tid !== id) return;
    this._tid = undefined;
    
    this.#value = new Vec2();
    this.#headloc = new Vec2();
  }
  
  draw(ctx) {
    if (this.fixed === false && typeof this._tid === 'undefined') return;
    
    const {x, y} = this.loc;
    
    ctx.fillStyle = '#ffffff'+(typeof this._tid === 'undefined' ? '11' : '55');
    ctx.strokeStyle = '#444444';
    
    ctx.beginPath();
    ctx.ellipse(x, y, this.#radius, this.#radius, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#cccccd'+(typeof this._tid === 'undefined' ? '11' : 'ff');
    ctx.strokeStyle = '#222222';
    ctx.beginPath();
    const headRad = this.#radius * 0.2;
    ctx.ellipse(x + this.#headloc.x, y + this.#headloc.y, headRad, headRad, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }
}