import Vec2 from './Vec2.js';
import KUI from './KUI.js';

export default class Touchlook extends KUI {
  _pull;
  _zoneX1; _zoneY1;
  _zoneX2; _zoneY2;
  
  constructor() {
    super();
    this._pull = new Vec2();
    
    this._zoneX1 = 0;
    this._zoneY1 = 0;
    this._zoneX2 = Infinity;
    this._zoneY2 = Infinity;
  }
  
  _init() {
  }
  
  setZone(zx1, zy1, zx2, zy2) {
    this._zoneX1 = zx1;
    this._zoneY1 = zy1;
    this._zoneX2 = zx2;
    this._zoneY2 = zy2;
  }
  
  setEntity(ent) {
    if (typeof ent.onLookMove !== 'function') {
      throw new Error(ent.name + ' must have moveLook(xx, yy) interface!');
    }
    this.ent = ent;
  }
  
  onDown(id, x, y) {
    if (this.tid > -1) return false;
    if (
      !(x >= this._zoneX1 && x < this._zoneX2 &&
        y >= this._zoneY1 && y < this._zoneY2)
    ) return false;
    
    this.loc = new Vec2(x, y);
    this._pull = new Vec2(0, 0);
    
    this.tid = id;
    
    this.ent?.onLookStart(this.loc.x, this.loc.y);
    
    return true;
  }
  
  onMove(id, x, y) {
    if (this.tid !== id) return false;
    
    this._pull = Vec2.sub(new Vec2(x, y), this.loc);
    // this._pull.x = x;
    // this._pull.y = y;
    
    // const delta = Vec2.sub(this._pull, this.loc);
    // this.loc.copyValue(this._pull);
    
    this.ent?.onLookMove(this._pull.x, this._pull.y);
    
    return true;
  }
  
  onUp(id, x, y) {
    if (this.tid !== id) return false;
    
    this.ent?.onLookRelease(this._pull.x, this._pull.y);
    
    this.loc  = new Vec2();
    this._pull = new Vec2();
    
    this.tid = -1;
    
    return true;
  }
  
  get x() {
    return this._pull.x;
  }
  
  get y() {
    return this._pull.y;
  }
  
  get theta() {
    return this._pull.x * 0.1 / (2*Math.PI);
  }
  
  show(ctx) {
    if (this.loc.magSq() <= 0.01) return;
    ctx.fillStyle = '#8585859b';
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(this.loc.x, this.loc.y, 10, 10, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(this.loc.x + this._pull.x, this.loc.y + this._pull.y, 10, 10, 0, 0, 2 * Math.PI);
    ctx.stroke();
  }
}