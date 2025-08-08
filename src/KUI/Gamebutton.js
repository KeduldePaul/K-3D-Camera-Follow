import KUI from './KUI.js';
import Vec2 from './Vec2.js';

export default class GameButton extends KUI {
  _tapped = false;
  #rad;
  
  constructor(name, x, y, rad) {
    super();
    this.name = name;
    this.setLoc(x, y);
    this.#rad = rad || 10;
    
    //this.onaction = fn;
  }
  
  get tapped() {
    return this._tapped;
  }
  
  onDown(id, x, y) {
    if (!super.onDown(id, x, y)) return;
    
    const d = new Vec2(x, y);
    d.sub(this.loc);
    
    if (d.magSq() < this.#rad ** 2) {
      this._tid = id;
      
      this._tapped = true;
    }
  }
  
  onUp(id, x, y) {
    if (!super.onUp(id, x, y)) return;
    
    this._tid = undefined;
    
    this._tapped = false;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.translate(this.loc.x, this.loc.y);
    
    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + (1 - 0.1) * this._tapped})`;
    ctx.strokeStyle = `#222222`;
    
    ctx.beginPath();
    ctx.ellipse(0, 0, this.#rad, this.#rad, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#22222';
    ctx.font = `${this.#rad * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.name, 0, 0);
    
    ctx.restore();
  }
}