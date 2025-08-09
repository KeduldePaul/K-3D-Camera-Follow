import * as THREE from 'https://esm.sh/three@0.168.0';
import { GLTFLoader } from 'https://esm.sh/three@0.168.0/examples/jsm/loaders/GLTFLoader.js';
import {Coin} from './item.js';
import {Tree} from './game_object.js';
import {loadGLTFs} from './assets_manager.js';

export default class GameScene extends THREE.Scene {
  constructor(renderer, width, height) {
    super();
    this._loadCount = 0; 
    this._loadTotal = 0;
    
    this.renderer = renderer;
    this.background = new THREE.Color(0xfffffaa);
    
    const cam = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.01,
      10000
    );
    cam.position.set(10, 5, 10);
    cam.lookAt(0, 0, 0);
    this.cam = cam;
    
    //light
    this.directLight = new THREE.DirectionalLight(0xf4ebde, 2);
    this.directLight.position.set(-5, 5, -5);
    this.directLight.castShadow = true;
    // Shadow needed sometimes
    // Set up shadow properties for the light
    // light.shadow.mapSize.width = 512; // default
    // light.shadow.mapSize.height = 512; // default
    // light.shadow.camera.near = 0.5; // default
    // light.shadow.camera.far = 500; // default
    this.add(this.directLight);
    
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.add(this.ambientLight);
    
    //ground
    const groundMaterial = new THREE.MeshStandardMaterial({side: THREE.DoubleSide, color: 0xd8bb8f});
    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.x -= 100;
    this.ground.position.z -= 100;
    this.ground.receiveShadow = true;
    this.add(this.ground);
    
    // const grid = new THREE.GridHelper(200, 200);
    // this.add(grid);
    
    // Game items 
    this.coins = [];
    for (let i = 0; i < 25; i++) {
      this.coins.push(new Coin(this, this._randomOnMap(), 0,
      this._randomOnMap()));
    }
    
    // Game Objects
    this._addTrees();
    
    // UIs
    this._loadingBox = document.querySelector('#loading-box');
    this._loadingBar = document.querySelector('#loading');
  }
  
  _randomOnMap() {
    return Math.random() * 200 - 100;
  }
  
  _addTrees() {
    const parent = this;
    
    const treeCount = 50;
    this.trees = [];
    for (let i = 0; i < treeCount; i++) {
      this.trees.push(new Tree(
        this,
        this._randomOnMap(),
        0,
        this._randomOnMap(),
      ));
    }
    
    this._loadTotal += 10;
    loadGLTFs({
      'tree1': 'assets/models/low_poly_tree.glb',
    }, gltfs => {
      const model = gltfs['tree1'].scene;
      model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
        }
      });
      
      model.scale.multiplyScalar(4);
      
      this.trees.forEach((tree, i) => {
        tree.meshOffset.y = Math.random() + 1.5;
        model.rotation.y = Math.random() * Math.PI * 2;
        tree.setModel(model);
      });
    }, xhr => {
      const loads = xhr.count/xhr.total;
      this._loadCount += loads * 10;
      console.log(`Tree loading progress: ${loads * 100}%`)
    }, err => {
      console.error(err)
    });
  }
 
  addPlayer(player) {
    this.player = player;
    player.setScene(this);
    player.setCamera(this.cam);
  }
  
  setCanvas2d(cnv) {
    this.canvas2d = cnv;
  }
  
  update(dt, time) {
    this.player.update(dt);
    
    for (let i = this.coins.length - 1; i >= 0; i--){
      const coin = this.coins[i];
      coin.update(dt);
      
      if (this.player.boundingBox?.intersectsBox(coin.boundingBox)) {
        this.player.coin++;
        coin.take();
      }
      
      if (coin.removed) {
        this.coins.splice(i, 1);
      }
    }
    
    this.renderer.render(this, this.cam);
  }
  
  show2d(ctx, dt) {
    if (!this.canvas2d) {
      throw new Error('Canvas 2d not yet defined for the scene -> show2d(ctx, dt). Set &lt;your_game_scene&gt;.setCanvas2d(canvas2d) first!');
    }
    
    const {width, height} = this.canvas2d;
    
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.font = '64px Helvetica, Sans';
    ctx.textAlign = 'right';
    const coinText = `Coins × ${String(this.player.coin).padStart(3, '0')}`;
    ctx.fillText(coinText, width - 10, 60);
    ctx.strokeText(coinText, width - 10, 60);
    
    if (this._loadCount < this._loadTotal) {
      this._loadingBox.style.display = 'block';
      this._loadingBar.value = this._loadCount / this._loadTotal;
    } else {
      this._loadingBox.style.display = 'none';
    }
  }
}