// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js?module';
// import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/loaders/GLTFLoader.js?module'; // ERROR!!!
import * as THREE from 'https://esm.sh/three@0.168.0';
import { GLTFLoader } from 'https://esm.sh/three@0.168.0/examples/jsm/loaders/GLTFLoader.js';

export class Player {
  constructor(x, y) {
    this.head = 1;
    this._verticalShift = /*this.head * 0.5*/ 0;
    this.loc = new THREE.Vector3(x, 0, y);
    this.vel = new THREE.Vector3();

    this.cameraFacing = new THREE.Vector3(-1, -1, 0);
    this.cameraFacing.normalize();
    this.playerFacing = this.vel.clone().normalize();
    
    this._loaded = false;
    
    this.coin = 0;
  }

  setJoystick(joystick) {
    this.joystick = joystick;
  }

  setCamera(cam) {
    this.cam = cam;
    this._initCameraSetup();
  }

  setScene(scene) {
    this.scene = scene;
    
    this._init3D();
    
    // this.scene.add(this.model);
  }

  isLoaded() {
    return this._loaded;
  }
  
  _init3D() {
    // const mater = new THREE.MeshStandardMaterial({ color: 0x9999ff });
    // this.model = new THREE.Mesh(new THREE.BoxGeometry(1, this.head, 1), mater);
    // this.model.position.set(this.loc.x, this.loc.y + this.head * 0.5, this.loc.z);
    
    // this.boundingBox = new THREE.Box3();
    // this.boundingBox.setFromObject(this.model);
    
    const model = new GLTFLoader();
    model.load('/assets/models/Soldier.glb',
      this._onGLTFLoaded.bind(this),
      (xhr) => {
        console.log('Player loading proggress.... '+(xhr.loaded/xhr.total * 100)+'%');
      },
      (err) => {
        console.error("Cannot load GLTF"+ err);
      }
    );
  }
  
  _onGLTFLoaded(gltf) {
		gltf.scene.traverse(object => {
		  if (object.isMesh) object.castShadow = true;
		});
    this.model = gltf.scene;
    this.model.position.set(this.loc.x, this.loc.y + this._verticalShift, this.loc.z);

    this.boundingBox = new THREE.Box3();
    this.boundingBox.setFromObject(this.model);

    this.scene.add(gltf.scene);
    
    const animations = gltf.animations;
    // console.log(animations);
    
    const mixer = new THREE.AnimationMixer(gltf.scene);
    
    this._idleAction = mixer.clipAction(animations[0]);
    this._runAction = mixer.clipAction(animations[1]);
    this._walkAction = mixer.clipAction(animations[3]);
    
    this._activeAction = this._idleAction;
    this._lastAction = this._idleAction;
    
    
    // this._activeAction.setEffectiveTimeScale(1);
    // this._activeAction.enabled = true;
    // this._activeAction.setEffectiveWeight(1);
    this._activeAction.play();
    
    this._mixer = mixer;
    this._loaded = true;
  }
  
  _setAction(action) {
    if (action != this._activeAction) {
      this._lastAction = this._activeAction;
      this._activeAction = action;
      
      // this._lastAction.stop();
      this._lastAction.fadeOut(0.25);
      this._activeAction.reset();
      this._activeAction.fadeIn(0.5);
      this._activeAction.play();
    }
  }
  
  _initCameraSetup() {
    this._cameraAnchorHeight = 1.25 + this.head;
    this.cameraAnchor = this.loc.clone();
    this.cameraAnchor.y += this._cameraAnchorHeight;

    this.headPosition = this.loc.clone();
    this.headPosition.y += this.head;

    this._updateCameraPosition();
  }

  _updateCameraPosition(dt) {
    this.cameraAnchor.copy(this.loc);
    this.cameraAnchor.y += this._cameraAnchorHeight;

    this.headPosition.copy(this.loc);
    this.headPosition.y += this.head;

    const constrainLength = 4;
    const camConstrain = new THREE.Vector3().subVectors(this.cam.position, this.cameraAnchor);
    camConstrain.setLength(constrainLength);
    
    const targetVector = this.cameraAnchor.clone().add(camConstrain);
    this.cam.position.copy(targetVector);
    
    this.cam.lookAt(this.headPosition);

    this.cameraFacing.copy(camConstrain);
    this.cameraFacing.multiplyScalar(-1);
    this.cameraFacing.normalize();
    
    const up = new THREE.Vector3(0, 1, 0);
    const left = new THREE.Vector3().crossVectors(up, this.cameraFacing).normalize();
    const rod = new THREE.Vector3().crossVectors(left, up).normalize();
    const angle = Math.acos(rod.dot(this.cameraFacing));
    const angleLimit = Math.PI * 0.125;
    
    // smooth angle constraining
    const correctionAngle = (angle - angleLimit) * Math.exp(-100.609 * dt);
    if (correctionAngle > 0) {
      let rotator = new THREE.Quaternion().setFromAxisAngle(left, -correctionAngle).normalize();
      this.cam.position.sub(this.cameraAnchor)
        .applyQuaternion(rotator)
        .add(this.cameraAnchor);
    }
  }

  _updateModel(dt) {
    this.model.position.set(this.loc.x, this.loc.y + this._verticalShift, this.loc.z);
    
    if (this.vel.length() > 0) {
      this.playerFacing.copy(this.vel).normalize();
    }
    
    const faceToQuaternion = new THREE.Quaternion();
    faceToQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), this.playerFacing);
    
    this.model.quaternion.slerp(faceToQuaternion, Math.exp(-90.6 * dt));
  }
  
  update(dt) {
    if (!this._loaded) return;
    
    const speed = 6;

    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(this.cameraFacing, up).normalize();
    const front = new THREE.Vector3().crossVectors(right, up).normalize();

    // V = [R0F] J, J ∈ ℝ3 -> (jx, 0, jz)
    // Notice about jz = s * joy.VY;
    const jx = speed * this.joystick?.vx || 0;
    const jz = speed * this.joystick?.vy || 0;

    this.vel.x = jx * right.x + jz * front.x;
    this.vel.z = jx * right.z + jz * front.z;

    this.loc.addScaledVector(this.vel, dt);
    
    const controlMagSq = (this.joystick?.vx || 0)**2 + (this.joystick?.vy || 0)**2;
    
    if (controlMagSq < 0.0001) {
      this._setAction(this._idleAction);
    } else if (controlMagSq < 0.125) {
      this._setAction(this._walkAction);
    } else {
      this._setAction(this._runAction);
    }
    
    this._mixer.update(dt);
    this._updateModel(dt);
    this._updateCameraPosition(dt);
    
    this.boundingBox.setFromObject(this.model);
  }
}