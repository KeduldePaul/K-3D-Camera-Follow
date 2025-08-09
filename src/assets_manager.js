import * as THREE from 'https://esm.sh/three@0.168.0';
import { GLTFLoader } from 'https://esm.sh/three@0.168.0/examples/jsm/loaders/GLTFLoader.js';

const assets = {};

export function loadGLTFs(models, loaded, progress, error) {
  
  const loader = new GLTFLoader();

  const progs = {
    modelKey: '',
    count: 0,
    total: Object.keys(models).length,
  }
  
  let promises = [];
  // new Promise((resolve, reject) => {
  for (const [key, path] of Object.entries(models)) {
    promises.push(new Promise((resolve, reject) => {
      loader.load(
        path,
        gltf => {
          assets[key] = gltf;
          progs.modelKey = key;
          progs.count++;
          progress(progs);
          resolve([key, gltf]);
        },
        undefined,
        err => {
          console.error(`Error loading ${path}:`, err);
          reject(err);
        }
      );
    }));
  }
  // })
  //
  
  Promise.all(promises)
  .then(res => {
    const assets = Object.fromEntries(res);
    loaded(assets)
  })
  .catch(rej => error(rej));
}