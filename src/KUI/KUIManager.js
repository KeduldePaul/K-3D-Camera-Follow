import KUI from './KUI.js';

export default class KUIManager {
  _uis;
  
  constructor() {
    this._uis = [];
  }
  
  add(ui) {
    // if (!(ui instanceof KUI)) throw new Error('UI must be KUI');
    
    this._uis.push(ui);
  }
  
  onDown(id, x, y, t) {
    this._uis.forEach(ui => ui.onDown(id, x, y, t));
  }
  
  onMove(id, x, y, t) {
    this._uis.forEach(ui => ui.onMove(id, x, y, t));
  }
  
  onUp(id, x, y, t) {
    this._uis.forEach(ui => ui.onUp(id, x, y, t));
  }
  
  show(ctx) {
    this._uis.forEach(ui => ui.draw(ctx ));
  }
}