/**
 * @typedef {Object} Controlable
 * @property {function} touchDown - for function calling when the touch has been started
 * @property {function} touchMove - for function calling when the touch is being moved
 * @property {function} touchUp - for function calling when the touch has been released or canceled
 */

/**
 * @typedef {Object} Config
 * @property {number} scaleTo - scale for the canvas ratio/pixel density, set 1/window.deviceRatio if use device ratio
 */

/**
 * Canvas controlsetup for touch
 * @param {HTMLCanvasElement} target - canvas target
 * @param {Controlable} interf - functions that need to do for Touches
 * @param {Config} configurations - configurations
 */
export function controlSetup(target, interf, {scaleTo = 1} = {}) {
  
  const bounding = target.getBoundingClientRect();
  
  target.ontouchstart = e => {
    e.preventDefault();
    
    for (const t of e.touches) {
      const x = (t.clientX - bounding.left) / scaleTo;
      const y = (t.clientY - bounding.top) / scaleTo;
      
      interf.touchDown(t.identifier, x, y, t);
    }
  }
  
  target.ontouchmove = e => {
    e.preventDefault();
    for (const t of e.touches) {
      const x = (t.clientX - bounding.left) / scaleTo;
      const y = (t.clientY - bounding.top) / scaleTo;
      
      interf.touchMove(t.identifier, x, y, t);
    }
  }
  
  const touchout = e => {
    e.preventDefault();
    
    for (const t of e.changedTouches) {
      const x = (t.clientX - bounding.left) / scaleTo;
      const y = (t.clientY - bounding.top) / scaleTo;
      
      interf.touchUp(t.identifier, x, y, t);
    }
  }
  
  target.ontouchend = touchout;
  
  target.ontouchcancel = touchout;
  // e => {
  //   e.preventDefault();
  //   for (const t of e.targetTouches) {
  //     const x = t.clientX - bounding.left;
  //     const y = t.clientY - bounding.top;
  //     console.log(x, y);
  //     // touchUp(t.identifier, x, y, t);
  //   }
  // };
}
