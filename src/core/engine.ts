// Renderer, frame loop, sky and light, and the Gilding world-state shader.
import * as THREE from 'three';
import { settings } from './settings';

/** Shared uniforms for every gildable material. */
export const gild = {
  /** 0 = the true world (clay and green), 1 = gold leaf over everything. */
  uGild: { value: 0 },
  /** Centre of the zikr dissolve (Burhan). */
  uCenter: { value: new THREE.Vector3() },
  /** Radius the gold has been peeled back to. 0 = no dissolve. */
  uRadius: { value: 0 },
  uTime: { value: 0 },
};

const GILD_PARS = /* glsl */ `
uniform float uGild; uniform vec3 uCenter; uniform float uRadius; uniform float uTime;
varying vec3 vGWorld;
float ghash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float gnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(ghash(i), ghash(i+vec2(1.,0.)), f.x), mix(ghash(i+vec2(0.,1.)), ghash(i+vec2(1.,1.)), f.x), f.y); }
`;
const GILD_FRAG = /* glsl */ `
if (uGild > 0.001) {
  float gd = distance(vGWorld.xz, uCenter.xz);
  float gn = gnoise(vGWorld.xz * 1.6 + vGWorld.y * 0.7);
  float gedge = uRadius + (gn - 0.5) * 2.4;
  float peel = uRadius > 0.001 ? smoothstep(gedge - 0.3, gedge + 0.3, gd) : 1.0;
  float gm = uGild * peel;
  // broad leaf patches and a slow sheen: low frequencies only, so nothing shimmers into stripes far away
  float flake = gnoise(vGWorld.xz * 0.9 + vGWorld.y * 0.7);
  float sheen = 0.84 + 0.16 * sin(vGWorld.x * 0.31 + vGWorld.y * 0.47 + vGWorld.z * 0.27 + uTime * 1.4);
  vec3 leaf = vec3(1.0, 0.74, 0.2) * (0.72 + 0.28 * flake) * sheen;
  diffuseColor.rgb = mix(diffuseColor.rgb, leaf, gm);
  float rim = uRadius > 0.001 ? uGild * (1.0 - abs(peel - 0.5) * 2.0) : 0.0;
  totalEmissiveRadiance += leaf * gm * 0.38 + vec3(1.0, 0.92, 0.65) * rim * 0.7;
}
`;

/** Make a material take part in the Gilding. Mosques are never passed through this. */
export function gildable<T extends THREE.Material>(mat: T): T {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, gild);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vGWorld;')
      .replace('#include <project_vertex>', `#include <project_vertex>
        vec4 gw = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          gw = instanceMatrix * gw;
        #endif
        vGWorld = (modelMatrix * gw).xyz;`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + GILD_PARS)
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + GILD_FRAG);
  };
  mat.customProgramCacheKey = () => 'gild';
  return mat;
}

const matCache = new Map<string, THREE.MeshLambertMaterial>();
/** Flat-shaded painterly material, cached by colour. `g` = takes part in the Gilding. */
export function mat(color: number, g = false, smooth = false): THREE.MeshLambertMaterial {
  const key = `${color}|${g}|${smooth}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshLambertMaterial({ color, flatShading: !smooth });
    if (g) gildable(m);
    matCache.set(key, m);
  }
  return m;
}
export function glow(color: number, intensity = 1): THREE.MeshBasicMaterial {
  const c = new THREE.Color(color).multiplyScalar(intensity);
  return new THREE.MeshBasicMaterial({ color: c, fog: false });
}

export class Engine {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, 1, 0.1, 900);
  /** Everything a scene builds goes under here and is cleared between scenes. */
  root = new THREE.Group();
  hemi = new THREE.HemisphereLight(0xffffff, 0x334422, 1);
  sun = new THREE.DirectionalLight(0xffffff, 1);
  envMap: THREE.Texture;
  private sky: THREE.Mesh;
  private skyColors = { top: new THREE.Color(), bottom: new THREE.Color() };
  time = 0;
  fps = 60;
  /** exposed for tests */
  gild = gild;
  private scale = 1;
  private slow = 0;
  private fast = 0;
  private last = performance.now();
  onFrame: (dt: number) => void = () => {};

  constructor(public canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene.add(this.root, this.hemi, this.sun);
    this.scene.fog = new THREE.Fog(0x000000, 20, 200);

    const skyGeo = new THREE.SphereGeometry(700, 16, 10);
    skyGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(skyGeo.attributes.position.count * 3), 3));
    this.sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    this.sky.renderOrder = -1;
    this.scene.add(this.sky);

    // A tiny environment so mirror-faces have something to hold.
    const pm = new THREE.PMREMGenerator(this.renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x30363a);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff6e0 }));
    bulb.position.set(4, 9, 6); envScene.add(bulb);
    const bulb2 = new THREE.Mesh(new THREE.SphereGeometry(5, 8, 6), new THREE.MeshBasicMaterial({ color: 0x8fb4c8 }));
    bulb2.position.set(-9, 4, -7); envScene.add(bulb2);
    const floor = new THREE.Mesh(new THREE.SphereGeometry(40, 8, 6, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45), new THREE.MeshBasicMaterial({ color: 0x3a3226, side: THREE.BackSide }));
    envScene.add(floor);
    this.envMap = pm.fromScene(envScene, 0.04).texture;
    pm.dispose();

    this.setSky(0x22303a, 0x566a6a, 30, 220);
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  private maxScale() {
    const dpr = window.devicePixelRatio || 1;
    return settings.quality === 'low' ? Math.min(dpr, 1) * 0.75 : Math.min(dpr, settings.quality === 'high' ? 2 : 1.5);
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.scale = Math.min(this.scale, 1);
    this.renderer.setPixelRatio(this.maxScale() * this.scale);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setSky(top: number, bottom: number, fogNear: number, fogFar: number, fogColor?: number) {
    this.skyColors.top.set(top); this.skyColors.bottom.set(bottom);
    const pos = this.sky.geometry.attributes.position, col = this.sky.geometry.attributes.color as THREE.BufferAttribute;
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const t = THREE.MathUtils.clamp(pos.getY(i) / 700 * 1.6 + 0.08, 0, 1);
      c.copy(this.skyColors.bottom).lerp(this.skyColors.top, Math.pow(t, 0.7));
      col.setXYZ(i, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
    const fog = this.scene.fog as THREE.Fog;
    fog.color.set(fogColor ?? bottom); fog.near = fogNear; fog.far = fogFar;
    this.renderer.setClearColor(fog.color);
  }

  setLight(sky: number, ground: number, hemiI: number, sunColor: number, sunI: number, dir: [number, number, number] = [0.4, 1, 0.3]) {
    this.hemi.color.set(sky); this.hemi.groundColor.set(ground); this.hemi.intensity = hemiI;
    this.sun.color.set(sunColor); this.sun.intensity = sunI; this.sun.position.set(...dir);
  }

  clearRoot() {
    const dispose = (o: THREE.Object3D) => {
      const m = o as THREE.Mesh;
      if (m.geometry && !m.geometry.userData.shared) m.geometry.dispose();
    };
    this.root.traverse(dispose);
    this.root.clear();
    gild.uGild.value = 0; gild.uRadius.value = 0;
    this.camera.rotation.z = 0;
    this.camera.fov = 55; this.camera.updateProjectionMatrix();
  }

  start() {
    const loop = () => {
      requestAnimationFrame(loop);
      const now = performance.now();
      const raw = (now - this.last) / 1000;
      this.last = now;
      const dt = Math.min(raw, 0.05);
      this.time += dt;
      gild.uTime.value = this.time;
      this.fps += (1 / Math.max(raw, 0.001) - this.fps) * 0.05;
      this.adapt(raw);
      this.onFrame(dt);
      this.sky.position.copy(this.camera.position);
      this.renderer.render(this.scene, this.camera);
    };
    requestAnimationFrame(loop);
  }

  /** Hold 60 fps on integrated graphics by trading resolution, never frame rate. */
  private adapt(raw: number) {
    if (settings.quality !== 'auto' || document.hidden) return;
    if (raw > 1 / 50) { this.slow += raw; this.fast = 0; } else if (raw < 1 / 58) { this.fast += raw; this.slow = Math.max(0, this.slow - raw); }
    if (this.slow > 1.5 && this.scale > 0.55) { this.scale -= 0.1; this.slow = 0; this.renderer.setPixelRatio(this.maxScale() * this.scale); }
    if (this.fast > 12 && this.scale < 1) { this.scale = Math.min(1, this.scale + 0.1); this.fast = 0; this.renderer.setPixelRatio(this.maxScale() * this.scale); }
  }
}
