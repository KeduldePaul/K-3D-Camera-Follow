import * as THREE from 'https://esm.sh/three@0.168.0';

const vertex = `
uniform float uFade;

out vec3 pos;
out vec3 objPos;
out vec3 norm;

void main() {
  objPos = position;
  vec4 pos4 = vec4(position * uFade, 1.0);
  vec4 viewPos = modelViewMatrix * pos4;
  pos = viewPos.xyz;
  
  norm = normalMatrix * normal;
  
  gl_Position = projectionMatrix * viewPos;
}
`;

const fragment = `
in vec3 pos;
in vec3 objPos;
in vec3 norm;

uniform float uTime;

out vec4 fragColor;

float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

vec3 hash3(vec3 p) {
    return fract(sin(vec3(
        dot(p, vec3(127.1, 311.7, 74.7)),
        dot(p, vec3(269.5, 183.3, 246.1)),
        dot(p, vec3(113.5, 271.9, 124.6))
    )) * 43758.5453);
}

float worley(vec3 pos) {
  pos /= 2.0;
  vec3 p = floor(pos);
  vec3 f = fract(pos);
  
  float dist = 1.0;
  for (int z = -1; z <= 1; z++) {
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec3 nb = vec3(float(x), float(y), float(z));
        vec3 pt = hash3(nb + p);
        pt = 0.5 + 0.5*sin(uTime + 6.2831*pt);
        vec3 delta = nb + pt - f;
        dist = min(dist, length(delta));
      }
    }
  }
  
  return dist;
}

float cheapPseudoWorley(vec3 pos) {
  vec3 p = floor(pos);
  vec3 f = fract(pos);
  
  float dist = 1.0;
  for (int i = -1; i <= 1; i++) {
    vec3 pt = vec3(
      hash(p + float(i) + 0.1),
      hash(p + float(i) + 2.3),
      hash(p + float(i) + 5.7)
    );
    
    pt = 0.5 + 0.5 * sin(uTime + 6.2931*pt);
    vec3 delta = pt - f;
    dist = min(dist, length(delta));
  }
  
  return dist;
}

void main() {
  vec3 color = vec3(0.0);
  
  color += worley(objPos) * vec3(0.75, 0.0, 0.87);
  
  float tgVisb = 1.0 - dot(normalize(-pos), normalize(norm));
  float alpha = tgVisb; //pow(tgVisb, 2.0);
  
  fragColor = vec4(color, alpha);
}
`;

function easeIn(t) {
  return t * t;
}

function easeOut(t) {
  return t * (2 - t);
}

function easeInOut(t) {
  return t < 0.5
    ? 2 * t * t
    : -1 + (4 - 2 * t) * t;
}

function easeInBack(t, s = 1.70158) {
  return t * t * ((s + 1) * t - s);
}

function easeOutBack(t, s = 1.70158) {
  t = t - 1;
  return t * t * ((s + 1) * t + s) + 1;
}
    
export class PowerSphere {
  // notice: use e static so don't need to recompile over and over again
  static sphereMaterial = new THREE.ShaderMaterial({
    transparent: true,
    glslVersion: THREE.GLSL3,
    // blending: THREE.AlphaBlending,
    uniforms : {
      uTime : {value: 0},
      uFade : {value: 0},
    },
    vertexShader: vertex,
    fragmentShader: fragment,
  });
  
  constructor(scene, x, y, z) {
    this.loc = new THREE.Vector3(x ?? 0, y ?? 0, z ?? 0);
    if (x instanceof THREE.Vector3) {
      this.loc.copy(x);
    }
    
    this._meshOffset = new THREE.Vector3(0, 0.5, 0);
    
    this._fade = 0;
    this._timeStart = 0;
    this._duration = 0;
    this._animationStatus = 'none';
    this.isFadedOut = false;
    
    this._scene = scene;
    
    this._init3d();
  }
  
  _init3d() {
    this._sphereMater = PowerSphere.sphereMaterial.clone();
    this._sphereMater.uniforms = THREE.UniformsUtils.clone(PowerSphere.sphereMaterial.uniforms);

    this._sphereMater.uniforms.uFade.value = this._fade;
    
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(2), this._sphereMater);
    
    this._model = sphere;
    this._scene.add(sphere);
    
  }
  
  destruct() {
    this._scene.remove(sphere);
    sphere.geometry.dispose();
    sphere.material.dispose();
  }
  
  activate() {
    this._timeStart = performance.now() * 0.001;
    this._duration = 0.5;
    this._animationStatus = 'fadein';
    this.isFadedOut = false;
  }
  
  deactivate() {
    this._timeStart = performance.now() * 0.001;
    this._duration = 0.5;
    this._animationStatus = 'fadeout';
  }
  
  _updateFadein(time) {
    const normalizedTime = (time - this._timeStart) / this._duration;
    if (normalizedTime >= 1.0) {
      this._animationStatus = 'none';
      return;
    }
    
    this._fade = easeOut(normalizedTime);
  }
  
  _updateFadeout(time) {
    const normalizedTime = (time - this._timeStart) / this._duration;
    
    if (normalizedTime >= 1.0) {
      this._animationStatus = 'none';
      this.isFadedOut = true;
      return;
    }
    
    this._fade = 1.0 - easeIn(normalizedTime);
  }
  
  update(dt, time) {
    switch (this._animationStatus) {
      case 'fadein':
        this._updateFadein(time);
        break;
      case 'fadeout':
        this._updateFadeout(time);
        break;
      default:
        // pass //
        break;
    }
    
    this._sphereMater.uniforms.uTime.value = time;
    this._sphereMater.uniforms.uFade.value = this._fade;
    this._model.position.copy(this.loc).add(this._meshOffset);
  }
}