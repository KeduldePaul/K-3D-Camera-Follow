import * as THREE from 'https://esm.sh/three@0.168.0';
import { GLTFLoader } from 'https://esm.sh/three@0.168.0/examples/jsm/loaders/GLTFLoader.js';

export class GameObject {
  constructor(scene, x, y, z, options) {
    this.loc = new THREE.Vector3(x, y, z);
    this.meshOffset = new THREE.Vector3();
    // added sometimes
    // this.indestuctible = options?.indestructible || true;
    // this.hp = options?.hp ?? Infinity;
    
    this._scene = scene;
  }
  
  setModel(model) {
    this._model = model.clone();
    this._model.position.copy(this.loc);
    this._model.position.add(this.meshOffset);
    this._scene.add(this._model);
  }
  
  _init3d() {
    // pass //
  }
}

export class Tree extends GameObject {
  constructor(scene, x, y, z) {
    super(scene, x, y, z);
  }
}