import Vec2 from './Vec2.js';

export default class KUI {
  loc = new Vec2();
  visible = true;
  _tid;
  
  constructor() {
    //no constr//
  }
  
  setLoc(x, y) {
    this.loc.x = x;
    this.loc.y = y;
  }
  
  onDown(id, x, y) {
    //also for method implementations//
    if (typeof this._tid !== 'undefined')
      return false;
    
    return true;
  }
  
  onMove(id, x, y) {
    //also for method implementations//
    if (id !== this._tid)
      return false;
    
    return true;
  }
  
  onUp(id, x, y) {
    //also for method implementations//
    if (id !== this._tid)
      return false;
      
    return true;
  }
  
  setTid(id) {
    this._tid = id;
  }
  
  unsetTid() {
    this._tid = undefined;
  }
  
  draw(ctx) {
    //method implementations only//
  }
}