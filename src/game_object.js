import * as THREE from 'https://esm.sh/three@0.168.0';
import { GLTFLoader } from 'https://esm.sh/three@0.168.0/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'https://esm.sh/three@0.168.0/examples/jsm/utils/SkeletonUtils.js';


export class GameObject {
  constructor(scene, x, y, z, options) {
    this.loc = new THREE.Vector3(x, y, z);
    this.meshOffset = new THREE.Vector3();
    // added sometimes
    // this.indestructible = options?.indestructible || true;
    // this.hp = options?.hp ?? Infinity;
    
    this._scene = scene;
    
    this._loaded = false;
    this._loadingProgressFn = (loaded, total) => {};
    this._loadingFinishedFn = () => {};
    this._loadingErrorFn    = (err) => {};
    
    this._mixer;
    this._lastAction;
    this._activeAction;
    this._anims = {};
  }
  
  setModel(model, clone = true) {
    this._model = clone ? SkeletonUtils.clone(model) : model;
    this._model.position.copy(this.loc);
    this._model.position.add(this.meshOffset);
    this._scene.add(this._model);
  }
  
  setAnimations(animations) {
    this._animations = animations;
  }
  
  _setAnim(name, clip) {
    this._anims[name] = clip;
  }
  
  _setAnimationAction(action) {
    if (!(action instanceof THREE.AnimationAction)) {
      throw new Error(`Action must be not ${typeof action}, but THREE.AnimationAction / animation clip`);
    }
    if (action !== this._activeAction) {
      this._lastAction = this._activeAction;
      this._activeAction = action; 
      
      // this._activeAction.setLoop(THREE.LoopRepeat);
      this._activeAction.reset();
      this._activeAction.play();
      this._activeAction.crossFadeFrom(this._lastAction, 0.5, false);
    }
  }
  
  isLoaded() {
    return this._loaded;
  }
  
  onLoading(progressFn) {
    this._loadingProgressFn = progressFn;
  }
  
  onLoaded(loadedFn) {
    this._loadingFinishedFn = loadedFn;
  }
  
  onLoadingError(errorFn) {
    this._loadingErrorFn = errorFn;
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