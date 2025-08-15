import * as THREE from 'https://esm.sh/three@0.168.0';
import {controlSetup} from './KUI/Touches.js';
import KUIManager from './KUI/KUIManager.js';
import Joystick from './KUI/Joystick.js';
import GameScene from './game.js';
import {Player} from './player.js';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '-99';
document.querySelector('div#main').appendChild(renderer.domElement);

const uiCanvas = document.createElement('canvas');
let uiPixelRatio = window.devicePixelRatio;
uiCanvas.id = 'main-game-ui';
uiCanvas.width = window.innerWidth * uiPixelRatio;
uiCanvas.height = window.innerHeight * uiPixelRatio;
uiCanvas.style.top = '0'; 
uiCanvas.style.left = '0'; 
uiCanvas.style.width = `${window.innerWidth}px`;
uiCanvas.style.height = `${window.innerHeight}px`;
uiCanvas.style.zIndex = `-1`;
document.querySelector('div#main').appendChild(uiCanvas);
const ctx = uiCanvas.getContext('2d');

controlSetup(uiCanvas, {
  touchDown,
  touchMove,
  touchUp,
},
{scaleTo: 1/window.devicePixelRatio}
);
const uis = new KUIManager();
const joystick = new Joystick({fixed: true});
joystick.setLocation(180, uiCanvas.height - 270);
joystick.setRadius(100);

uis.add(joystick);

const clock = new THREE.Clock();

const gameScene = new GameScene(renderer, window.innerWidth, window.innerHeight);
gameScene.setCanvas2d(uiCanvas);

const player = new Player(-5, -5);
player.setJoystick(joystick);
gameScene.addPlayer(player);

function touchDown(id, x, y, t) {
  uis.onDown(id, x, y, t);
}

function touchMove(id, x, y, t) {
  uis.onMove(id, x, y, t);
}

function touchUp(id, x, y, t) {
  uis.onUp(id, x, y, t);
}

function animate(time) {
  time = time * 0.001; //ms to s
  const dt = clock.getDelta();
  
  // ctx.fillStyle = '#82a2d7'
  ctx.clearRect(0, 0, uiCanvas.width, uiCanvas.height)
  uis.show(ctx);
  
  gameScene.update(dt, time);
  gameScene.show2d(ctx);
  requestAnimationFrame(animate);
}

window.onload = () => {
  animate(0);
};