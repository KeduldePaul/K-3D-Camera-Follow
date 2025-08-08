import * as THREE from 'https://esm.sh/three@0.168.0';

export class Item {
  constructor(scene, x, y, z) {
    this.loc = new THREE.Vector3(x, y, z);
    this.scene = scene;
  }
  
  _init3d() {
    // pass
    this.objectMesh = null;
  }
  
  _updateMesh() {
    const {x, y, z} = this.loc;
    this.objectMesh?.position.set(x, y, z);
  }
  
  getMesh() {
    return this.objectMesh;
  }
  update(dt, time) {
    // pass //
  } 
}

export class Coin extends Item {
  constructor(scene, x, y, z) {
    super(scene, x, y, z);
    this._radius = 0.6;
    this._tube = 0.25 * this._radius;
    this.loc.y += this._radius;
    this.action = 'idle'; // just spin
    this._removed = false;
    
    this._init3d();
  }
  
  _init3d() {
    const gold = new THREE.MeshBasicMaterial({
      color: 0xc48a06,
      // alphaHash: true, // alpha noise
      transparent: true,
      opacity: 1,
    });
    this.objectMesh = new THREE.Mesh(new THREE.TorusGeometry(this._radius,
    this._tube), gold);
    
    this.scene.add(this.objectMesh);
    
    this.boundingBox = new THREE.Box3();
    this.boundingBox.setFromObject(this.objectMesh);
  }
  
  _disposeCoin() {
    this.scene.remove(this.objectMesh);

    // frees up GPU
    this.objectMesh.geometry.dispose();
    this.objectMesh.material.dispose();
    
    this._removed = true;
  }
  
  _onTakenAnimationUpdate(dt) {
    const duration = 0.6;
    const yVel = 3;
    
    this.loc.y += yVel * dt;
    this.objectMesh.rotation.y += 12 * dt;
    this.objectMesh.material.opacity -= dt / duration;
    
    if (this.loc.y >= yVel * duration) {
      this._disposeCoin();
    }
  }
  
  take() {
    this.action = 'taken';
    this.boundingBox.makeEmpty();
  }
  
  get removed() {
    return this._removed;
  }
  
  update(dt) {
    switch (this.action) {
      case 'idle':
        this.objectMesh.rotation.y += (2.5 * dt);
        this.boundingBox?.setFromObject(this.objectMesh);
        break;
      case 'taken':
        this._onTakenAnimationUpdate(dt);
        break;
    }
    
    super._updateMesh();
  }
}