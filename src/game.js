import * as THREE from 'https://esm.sh/three@0.168.0';
import {Coin} from './item.js';

export default class GameScene extends THREE.Scene {
  constructor(renderer, width, height) {
    super();
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
    this.add(this.directLight);
    
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.add(this.ambientLight);
    
    //ground
    const groundMaterial = new THREE.MeshStandardMaterial({side: THREE.DoubleSide, color: 0xd8bb8f});
    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    // this.add(this.ground);
    
    // Game items 
    this.coins = [];
    for (let i = 0; i < 25; i++) {
      this.coins.push(new Coin(this, Math.random() * 200 - 100, 0,
      Math.random() * 200 - 100));
    }
    
    const grid = new THREE.GridHelper(200, 200);
    this.add(grid);
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
    
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.font = '64px Helvetica, Sans';
    ctx.textAlign = 'right';
    const coinText = `Coins × ${String(this.player.coin).padStart(3, '0')}`;
    ctx.fillText(coinText, this.canvas2d.width - 10, 60);
    ctx.strokeText(coinText, this.canvas2d.width - 10, 60);
  }
}