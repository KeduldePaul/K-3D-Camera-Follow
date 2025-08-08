export default class Vec2 {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }
  
  add(v) {
    this.x += v.x;
    this.y += v.y;
  }
  
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
  }
  
  mult(s) {
    this.x *= s;
    this.y *= s;
  }
  
  div(s) {
    this.x /= s;
    this.y /= s;
  }
  
  magSq() {
    return this.x * this.x + this.y * this.y;
  }
  
  mag() {
    return Math.sqrt(this.magSq());
  }
  
  norm() {
    const mag = this.mag();
    this.x /= mag;
    this.y /= mag;
  }
  
  copy() {
    return new Vec2(this.x, this.y);
  }
  
  copyValue(v) {
    this.x = v.x;
    this.y = v.y;
  }
  
  angle() {
    return Math.atan2(this.y, this.x);
  }
  
  limit(mag) {
    if (this.magSq > mag * mag) {
      this.norm();
      this.mult(mag);
    }
  }
  
  set(x, y) {
    this.x = x;
    this.y = y;
  }
  
  static add(v1, v2) {
    return new Vec2(v1.x + v2.x, v1.y + v2.y);
  }
  
  static sub(v1, v2) {
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
  }
  
  static mult(v, mult) {
    return new Vec2(v.x * mult, v.y * mult); 
  }
  
  static div(v, div) {
    return new Vec2(v.x / div, v.y / div);
  }
  
  static fromAngle(theta, r) {
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    
    return new Vec2(x, y);
  }
  
  static magSq(v1, v2) {
    const a = v2.x - v1.x;
    const b = v2.y - v1.y;
    
    return a**2 + b**2;
  }
  
  static mag(v1, v2) {
    return Math.sqrt(Vec2.magSq(v1, v2));
  }
}