import * as THREE from 'https://esm.sh/three@0.168.0';
import { GLTFLoader } from 'https://esm.sh/three@0.168.0/examples/jsm/loaders/GLTFLoader.js';
import { GameObject } from './game_object.js';
import { PowerSphere } from './power_sphere.js';

export class NPC extends GameObject {
  constructor(scene, x, y, z, options = {}) {
    super(scene, x, y, z);
    
    // Why I use this? because my acode lsp linter screams if use {hp: 100, ...} = {} or let {hp: 100, ...} = options;
    this._immortal = options.immortal ?? false;
    this._hp    = options.hp    ?? 100;
    this._level = options.level ??   0;
    this._atk   = options.atk   ?? 100;
    this._def   = options.def   ??  50;
    
    this.vel = new THREE.Vector3();
    this.facing = new THREE.Vector3(0, 0, -1);
    this.originalMeshFacing = new THREE.Vector3(0, 0, -1);
  }
  
  _updateModel(dt, time) {
    this._model.position.copy(this.loc).add(this.meshOffset);
    
    const faceToQuat = new THREE.Quaternion();
    faceToQuat.setFromUnitVectors(this.originalMeshFacing, this.facing);
    this._model.quaternion.slerp(faceToQuat, 1.0 - Math.exp(-15 * dt));
  }
}

const STATE_LIST = {
  'attack': {
    name: 'attack',
    animation: 'attack'
  }, 'idle': {
    name: 'idle',
    animation: 'idle'
  }, 'run after': {
    name: 'run after',
    animation: 'run'
  }, 'wander': {
    name: 'wander',
    animation: 'none'
  }
};
  
export class RobotEnemy extends NPC {
  constructor(scene, x, y, z) {
    super(scene, x, y, z, {
      hp: 200,
      level: 4,
    });
    
    this._initPowerSphere();
    
    this._fsm = {
      states: [],
    };
    
    this.pushState(STATE_LIST['wander']);
    
    this._raycaster = new THREE.Raycaster();
    
    this.maxDistanceToAttack = 25;
    this.runningAfterDistance = 20;
    this._onFire = false;
    
    this._target = null;
    this._gotoSpot = new THREE.Vector3();
    this._briefWaitTime = 0;
    
    this._onWanderingDelay = false;
    this.delayTimer = 0;
    
    this._initWandering();
  }
  
  static loadModel(loadedFn, progressFn, errorFn) {
    const loader = new GLTFLoader();
    loader.load(
      'assets/models/Enemy_Large_Gun.gltf',
      gltf => {
        const model = gltf.scene;
        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
          }
        });
        
        loadedFn(model, gltf.animations);
      },
      xhr => {
        progressFn(xhr.loaded, xhr.total);
      },
      err => {
        errorFn(err);
      }
    );
  }
  
  finish3d() {
    this.originalMeshFacing.set(0, 0, 1);
    
    const animations = this._animations;
    console.log(animations);
    
    const mixer = new THREE.AnimationMixer(this._model);
    
    this._setAnim('attack', mixer.clipAction(animations[0]));
    this._setAnim('idle', mixer.clipAction(animations[3]));
    this._setAnim('run', mixer.clipAction(animations[5]));
    this._setAnim('walk', mixer.clipAction(animations[7]));
    
    this._activeAction = this._anims.attack;
    this._activeAction.play();
    
    this._mixer = mixer;
    
    this._loaded = true;
    console.log(this._activeAction)
  }
  
  _initPowerSphere() {
    this._powerSphere = new PowerSphere(this._scene, this.loc);
  }
  
  pushState(state) {
    this._fsm.states.push(state);
    if (state.animation !== 'none') {
      this._setAnimationAction(this._anims[state.animation]);
    }
  }
  
  popState() {
    const state = this._fsm.states.pop();
    if (state.animation !== 'none') {
      this._setAnimationAction(this._anims[state.animation]);
    }
    
    return state;
  }
  
  getState() {
    return this._fsm.states[this._fsm.states.length - 1];
  }
  
  closeTo(obj, dist) {
    return this.calcDistanceSq(obj) <= dist * dist;
  }
  
  fovTo(obj) {
    const toObjDir = new THREE.Vector3().copy(obj.loc).sub(this.loc).normalize();
    const dot = toObjDir.dot(this.facing);
    const cosHalfFovAngle = -0.532;
    
    if (dot > cosHalfFovAngle) {
      return true;
    }
    
    return false;
  }
  
  calcDistanceSq(obj) {
    return this.loc.distanceToSquared(obj.loc);
  }
  
  attack(obj) {
    // TODO: Change to attack mode
    if (this.getState().name !== 'attack') {
      this._target = obj;
      this._fireTimeStart = performance.now();
      this.pushState(STATE_LIST['attack']);
      this._powerSphere.activate();
    }
  }
  
  _attacking(dt, time) {
    if (this.calcDistanceSq(this._target) > this.maxDistanceToAttack**2) {
      this.popState();
      // this._target = null;
      this._powerSphere.deactivate();
      if (this.getState().name === 'wander') {
        this._initWandering();
        this._delayWandering();
      }
      return;
    }
    
    const targetDir = new THREE.Vector3().subVectors(this._target.loc, this.loc).normalize()
        
    if (this.calcDistanceSq(this._target) > this.runningAfterDistance**2) {
      this._setAnimationAction(this._anims['run']);
      this._runningAfter(targetDir, dt, time);
      return;
    }
    
    this._setAnimationAction(this._anims['attack']);
    
    const cos_HalfFovThreshold = 0.93;
    const dot = this.facing.dot(targetDir);
    if (dot < cos_HalfFovThreshold) {
      this.facing.copy(targetDir);
    }
   
    const normAnimationTime = this._anims['attack'].time / this._anims['attack'].getClip().duration;
    if (!this._onFire && normAnimationTime > 0.4) {
      this._fire();
      this._onFire = true;
    } else if (this._onFire && normAnimationTime < 0.2) {
      this._onFire = false;
    }
  }
  
  _fire() {
    const origin = new THREE.Vector3().copy(this.loc);
    origin.setY(this.loc.y + 0.5);
    const raycaster = new THREE.Raycaster(origin, this.facing.clone().normalize());
    
    if (raycaster.ray.intersectBox(this._target.boundingBox, new THREE.Vector3())) {
      let dmg = this._atk;
      dmg /= (1.0 + this._target.def);
      this._target.takeDamage(dmg, this.loc);
      
      console.log(this._target.hp);
    }
  }
  
  _runningAfter(targetDir, dt, time) {
    const speed = 2.5;
    const nv = new THREE.Vector3().copy(targetDir).multiplyScalar(speed);
    this.vel.copy(nv);
    // this.vel.clampLength(4);
    this.facing.copy(this.vel).normalize();
    this.loc.addScaledVector(this.vel, dt);
  }
  
  _delayWandering() {
    this.delayTimer = 1.0;
    this._onWanderingDelay = true;
    this._setAnimationAction(this._anims['idle']);
  }
  
  _initWandering() {
    this._gotoSpot.addVectors(this.loc, 
      new THREE.Vector3().setFromSphericalCoords(
      Math.random() * 20.0,
      Math.PI * 0.5,
      Math.random() * 6.283185307179586
      ));
    this._briefWaitTime = Math.random() * 10.0 + 5.0;
  }
  
  _wandering(dt, time) {
    if (this._onWanderingDelay) {
      this.delayTimer -= dt;
      if (this.delayTimer <= 0) {
        this._onWanderingDelay = false;
      }
      return;
    }
    
    if (this._briefWaitTime > 0 && this.loc.distanceToSquared(this._gotoSpot) <= 0.08) {
      this._setAnimationAction(this._anims['idle']);
      this._briefWaitTime -= dt;
      
      return;
    }
   
    if (this._briefWaitTime <= 0) {
      this._initWandering();
    }
    
    this._setAnimationAction(this._anims['walk']);
    
    this.vel.subVectors(this._gotoSpot, this.loc).setLength(1.45);
    
    this.loc.addScaledVector(this.vel, dt);
    
    this.facing.copy(this.vel).normalize();
  }
  
  update(dt, time) {
    if (!this._loaded) return;
    
    switch (this.getState().name) {
      case 'wander':
        this._wandering(dt, time);
        break;
      case 'attack':
        this._attacking(dt, time);
        break;
    }
    
    this._mixer.update(dt);
    this._updateModel(dt);
    
    this._powerSphere.loc.copy(this.loc);
    this._powerSphere.update(dt, time);
  }
}