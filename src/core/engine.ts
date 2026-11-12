// Renderer, frame loop, sky, light and shadow, post-processing, and the surface shader
// that gives every material its grain (brick, plaster, planks, cloth, ground...) and that
// carries the Gilding: the world-state blend between gold leaf and the true world.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { settings } from './settings';

/** Shared uniforms for every surface. */
export const gild = {
  /** 0 = the true world (clay and green), 1 = gold leaf over everything. */
  uGild: { value: 0 },
  /** Centre of the zikr dissolve (Burhan). */
  uCenter: { value: new THREE.Vector3() },
  /** Radius the gold has been peeled back to. 0 = no dissolve. */
  uRadius: { value: 0 },
  uTime: { value: 0 },
  /** 0 by day, 1 at night: lights the windows of far buildings. */
  uNight: { value: 0 },
};

/** Surface kinds. Each is a procedural pattern in world space: no texture files, no UVs. */
export const K = { plain: 0, plaster: 1, brick: 2, wood: 3, tile: 4, asphalt: 5, cloth: 6, ground: 7, bark: 8, rock: 9, metal: 10, facade: 11, sand: 12, skin: 13, water: 14 } as const;
/** Scatter density for grass and the like. Set by the quality tier. */
export const world = { density: 1 };
export type Kind = (typeof K)[keyof typeof K];

const PARS = /* glsl */ `
uniform float uGild; uniform vec3 uCenter; uniform float uRadius; uniform float uTime; uniform float uNight;
uniform float uKind; uniform float uGildable; uniform float uDetail;
varying vec3 vGWorld;
float gH = 0.0; float gRoughAdd = 0.0; float gGold = 0.0; float gEmis = 0.0;
float ghash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float gnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(ghash(i), ghash(i+vec2(1.,0.)), f.x), mix(ghash(i+vec2(0.,1.)), ghash(i+vec2(1.,1.)), f.x), f.y); }
float gfbm(vec2 p){ return (0.5*gnoise(p) + 0.25*gnoise(p*2.03+7.1) + 0.125*gnoise(p*4.01+3.3) + 0.0625*gnoise(p*8.1+1.7)) / 0.9375; }
vec3 gPerturb(vec3 pos, vec3 n, vec2 dH){
  vec3 sx = dFdx(pos), sy = dFdy(pos);
  vec3 r1 = cross(sy, n), r2 = cross(n, sx);
  float det = dot(sx, r1);
  vec3 grad = sign(det) * (dH.x * r1 + dH.y * r2);
  return normalize(abs(det) * n - grad);
}
`;

const COLOR = /* glsl */ `
{
  vec3 gfn = normalize(cross(dFdx(vGWorld), dFdy(vGWorld)));
  vec3 ga = abs(gfn);
  vec2 guv = (ga.y > ga.x && ga.y > ga.z) ? vGWorld.xz : (ga.x > ga.z ? vGWorld.zy : vGWorld.xy);
  float gdist = length(vViewPosition);
  float gnear = clamp(1.0 - gdist / 80.0, 0.0, 1.0);
  float gmid = gfbm(guv * 0.9);
  float gfine = gnoise(guv * 42.0);
  float galb = 0.93 + 0.14 * gmid;
  gH = gfine * 0.25;
  int gk = int(uKind + 0.5);
  if (gk == 1) { // plaster, concrete: blotches, and stains running down the walls
    galb = 0.84 + 0.26 * gmid + 0.05 * gfine;
    if (ga.y < 0.5) galb *= 0.9 + 0.13 * gnoise(vec2(guv.x * 1.7, guv.y * 0.22));
    gH = gmid * 0.4 + gfine * 0.3;
  } else if (gk == 2) { // brick and dressed stone
    vec2 b = guv * vec2(1.6, 3.2); b.x += 0.5 * floor(b.y);
    vec2 f = fract(b); vec2 id = floor(b);
    float m = smoothstep(0.0, 0.05, f.x) * smoothstep(1.0, 0.95, f.x) * smoothstep(0.0, 0.1, f.y) * smoothstep(1.0, 0.9, f.y);
    galb = mix(0.6, 0.84 + 0.3 * ghash(id), m) * (0.9 + 0.2 * gmid);
    gH = m * 0.9 + gfine * 0.15;
  } else if (gk == 3) { // planks
    float px = guv.x * 5.5; float pid = floor(px); float f = fract(px);
    float grain = gnoise(vec2(px * 9.0, guv.y * 1.1 + pid * 7.0));
    float gap = smoothstep(0.0, 0.05, f) * smoothstep(1.0, 0.95, f);
    galb = (0.76 + 0.3 * ghash(vec2(pid, 3.0))) * (0.82 + 0.3 * grain) * mix(0.5, 1.0, gap);
    gH = gap * 0.8 + grain * 0.25; gRoughAdd = -0.08;
  } else if (gk == 4) { // paving
    vec2 t = guv * 1.7; vec2 f = fract(t); vec2 id = floor(t);
    float m = smoothstep(0.0, 0.04, f.x) * smoothstep(1.0, 0.96, f.x) * smoothstep(0.0, 0.04, f.y) * smoothstep(1.0, 0.96, f.y);
    galb = mix(0.58, 0.86 + 0.22 * ghash(id), m) * (0.9 + 0.16 * gmid);
    gH = m * 0.7 + gfine * 0.12;
  } else if (gk == 5) { // asphalt
    float sp = gnoise(guv * 60.0);
    galb = 0.78 + 0.25 * sp + 0.16 * gmid;
    gH = sp * 0.5;
  } else if (gk == 6) { // cloth: weave up close, soft folds further off
    float wv = sin(guv.x * 620.0) * sin(guv.y * 620.0) * clamp(1.0 - max(fwidth(guv.x), fwidth(guv.y)) * 260.0, 0.0, 1.0);
    float fold = gnoise(guv * 7.0);
    galb = 0.88 + 0.14 * gmid + 0.06 * wv + 0.08 * fold;
    gH = wv * 0.12 + fold * 0.9;
  } else if (gk == 7) { // ground: grass that thins into bare earth
    float gpatch = gfbm(guv * 0.33 + 3.0);
    float blade = gnoise(guv * 75.0);
    float green = clamp((diffuseColor.g - max(diffuseColor.r, diffuseColor.b)) * 9.0, 0.0, 1.0);
    galb = 0.7 + 0.42 * gmid + 0.2 * blade;
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.3, 0.225, 0.14) * (0.8 + 0.5 * gfine), smoothstep(0.6, 0.82, gpatch) * 0.6 * green * uDetail);
    gH = blade * 0.6 + gmid * 0.6;
  } else if (gk == 8) { // bark
    float s = gnoise(vec2(guv.x * 26.0, guv.y * 2.5));
    galb = 0.66 + 0.55 * s; gH = s * 1.2;
  } else if (gk == 9) { // rock
    float r = abs(gfbm(guv * 1.8) * 2.0 - 1.0);
    galb = 0.7 + 0.42 * r + 0.1 * gfine; gH = r * 1.4 + gfine * 0.2;
  } else if (gk == 10) { // metal
    galb = 0.94 + 0.1 * gnoise(vec2(guv.x * 4.0, guv.y * 90.0));
    gH = gfine * 0.05;
  } else if (gk == 11) { // a building front: rows of windows
    if (ga.y < 0.5) {
      vec2 c = vec2(guv.x / 2.8, guv.y / 3.1); vec2 f = fract(c); vec2 id = floor(c);
      float win = step(0.2, f.x) * step(f.x, 0.8) * step(0.26, f.y) * step(f.y, 0.8);
      galb = mix(0.86 + 0.2 * gmid, 0.14, win);
      gRoughAdd = mix(0.0, -0.7, win);
      gEmis = win * step(0.7, ghash(id)) * uNight;
      gH = (1.0 - win) * 0.7 + gfine * 0.1;
    }
  } else if (gk == 12) { // sand, bare earth
    galb = 0.84 + 0.2 * gmid + 0.14 * gfine; gH = gmid * 0.5 + gfine * 0.45;
  } else if (gk == 13) { // skin
    galb = 0.96 + 0.06 * gmid; gH = gfine * 0.04;
  } else if (gk == 14) { // water: two layers of ripples crossing
    galb = 1.0;
    gH = (gnoise(guv * 1.3 + uTime * vec2(0.3, 0.2)) + 0.5 * gnoise(guv * 3.1 - uTime * vec2(0.2, 0.35)) + 0.25 * gnoise(guv * 7.0 + uTime * 0.5)) * 2.4;
  }
  diffuseColor.rgb *= mix(1.0, galb, uDetail);
  gH *= gnear * uDetail;

  // The Gilding: gold leaf over everything, peeled back around Burhan by remembrance.
  if (uGild > 0.001 && uGildable > 0.5) {
    float gd = distance(vGWorld.xz, uCenter.xz);
    float gn = gnoise(vGWorld.xz * 1.6 + vGWorld.y * 0.7);
    float gedge = uRadius + (gn - 0.5) * 2.4;
    float peel = uRadius > 0.001 ? smoothstep(gedge - 0.3, gedge + 0.3, gd) : 1.0;
    float gm = uGild * peel;
    // leaf laid in sheets: broad patches, faint seams, a slow sheen
    vec2 lf = fract(guv * 5.0);
    float seam = smoothstep(0.0, 0.03, lf.x) * smoothstep(0.0, 0.03, lf.y);
    float flake = gnoise(vGWorld.xz * 0.9 + vGWorld.y * 0.7);
    float sheen = 0.86 + 0.14 * sin(vGWorld.x * 0.31 + vGWorld.y * 0.47 + vGWorld.z * 0.27 + uTime * 1.4);
    vec3 leaf = vec3(0.92, 0.62, 0.15) * (0.7 + 0.3 * flake) * sheen * mix(0.8, 1.0, seam);
    diffuseColor.rgb = mix(diffuseColor.rgb, leaf, gm);
    gH = mix(gH, seam * 0.25 * gnear, gm);
    gGold = gm;
    float rim = uRadius > 0.001 ? uGild * (1.0 - abs(peel - 0.5) * 2.0) : 0.0;
    totalEmissiveRadiance += leaf * gm * 0.03 + vec3(1.0, 0.92, 0.65) * rim * 0.8;
  }
  totalEmissiveRadiance += vec3(1.0, 0.76, 0.42) * gEmis * 1.5;
}
`;

function guessKind(color: number): Kind {
  const hsl = { h: 0, s: 0, l: 0 };
  new THREE.Color(color).getHSL(hsl);
  if (hsl.s < 0.13) return K.plaster;
  if (hsl.h < 0.045 || hsl.h > 0.97) return K.brick;
  if (hsl.h < 0.13) return hsl.l < 0.42 ? K.wood : K.plaster;
  if (hsl.h < 0.47) return K.ground;
  return K.plaster;
}

/** Give a standard material its surface grain and (optionally) a part in the Gilding. */
export function surface<T extends THREE.Material>(mat: T, kind: Kind = K.plain, gilded = false, detail = 1): T {
  const own = { uKind: { value: kind }, uGildable: { value: gilded ? 1 : 0 }, uDetail: { value: detail } };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, gild, own);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vGWorld;')
      .replace('#include <project_vertex>', `#include <project_vertex>
        vec4 gw = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          gw = instanceMatrix * gw;
        #endif
        vGWorld = (modelMatrix * gw).xyz;`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + PARS)
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + COLOR)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = clamp(mix(roughnessFactor + gRoughAdd, 0.36 + 0.2 * gnoise(vGWorld.xz * 2.0), gGold), 0.04, 1.0);')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 0.85, gGold);')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\nnormal = gPerturb(-vViewPosition, normal, vec2(dFdx(gH), dFdy(gH)) * 0.016);');
  };
  mat.customProgramCacheKey = () => 'surface';
  return mat;
}
/** Kept for callers that only want the Gilding. */
export function gildable<T extends THREE.Material>(mat: T, kind: Kind = K.plain): T { return surface(mat, kind, true); }

const matCache = new Map<string, THREE.MeshStandardMaterial>();
const ROUGH: Record<number, number> = { [K.metal]: 0.35, [K.wood]: 0.7, [K.tile]: 0.75, [K.asphalt]: 0.9, [K.cloth]: 0.95, [K.ground]: 0.97, [K.bark]: 0.95, [K.rock]: 0.92, [K.skin]: 0.6, [K.facade]: 0.85 };
/**
 * A physically based material, cached by colour and surface. `g` = takes part in the
 * Gilding. With no `kind`, the surface is guessed from the colour.
 */
export function mat(color: number, g = false, _smooth = false, kind?: Kind): THREE.MeshStandardMaterial {
  const k = kind ?? guessKind(color);
  const key = `${color}|${g}|${k}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: ROUGH[k] ?? 0.88, metalness: k === K.metal ? 0.9 : 0 });
    surface(m, k, g);
    matCache.set(key, m);
  }
  return m;
}
export function glow(color: number, intensity = 1): THREE.MeshBasicMaterial {
  const c = new THREE.Color(color).multiplyScalar(intensity);
  return new THREE.MeshBasicMaterial({ color: c, fog: false, toneMapped: true });
}

const SKY_VERT = /* glsl */ `varying vec3 vDir; void main(){ vDir = position; vec4 p = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }`;
const SKY_FRAG = /* glsl */ `
varying vec3 vDir;
uniform vec3 uTop; uniform vec3 uBottom; uniform vec3 uSunDir; uniform vec3 uSunCol;
uniform float uSunI; uniform float uStars; uniform float uClouds; uniform float uSkyTime; uniform float uGild;
float h2(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h2(i), h2(i+vec2(1.,0.)), f.x), mix(h2(i+vec2(0.,1.)), h2(i+vec2(1.,1.)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * n2(p); p = p * 2.02 + 3.1; a *= 0.5; } return s; }
void main(){
  vec3 d = normalize(vDir);
  float t = clamp(d.y * 1.5 + 0.06, 0.0, 1.0);
  vec3 col = mix(uBottom, uTop, pow(t, 0.65));
  float sd = max(dot(d, uSunDir), 0.0);
  col += uSunCol * uSunI * (pow(sd, 1400.0) * 14.0 + pow(sd, 40.0) * 0.22 + pow(sd, 5.0) * 0.07);
  if (d.y > 0.0 && uClouds > 0.0) {
    vec2 p = d.xz / (d.y + 0.16) * 1.3 + uSkyTime * 0.006;
    float c = smoothstep(1.0 - uClouds, 1.25 - uClouds, fbm(p) + 0.15 * fbm(p * 3.0));
    float lit = 0.55 + 0.45 * fbm(p * 1.7 + uSunDir.xz * 0.4);
    vec3 cc = mix(uBottom * 0.9, mix(uTop, vec3(1.0), 0.75) * 1.05 + uSunCol * uSunI * 0.12 * sd, lit);
    col = mix(col, cc, c * smoothstep(0.0, 0.22, d.y) * 0.78);
  }
  if (uStars > 0.0) {
    vec3 q = d * 260.0; vec3 g = floor(q); vec3 f = fract(q) - 0.5;
    float s = h2(g.xy + g.z * 17.0);
    col += vec3(0.9, 0.95, 1.0) * step(0.9965, s) * smoothstep(0.3, 0.0, length(f)) * uStars * smoothstep(0.02, 0.35, d.y) * (0.6 + 1.6 * h2(g.yz));
  }
  col = mix(col, col * vec3(1.1, 0.92, 0.5) + vec3(0.05, 0.035, 0.0), uGild * 0.5);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const GRADE = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uVig: { value: 0.32 }, uGrain: { value: 0.035 } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uTime; uniform float uVig; uniform float uGrain; varying vec2 vUv;
    float h(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p + 19.19); return fract(p.x * p.y); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(l), c, 1.08);                                  // a little more colour
      c = mix(c, c * c * (3.0 - 2.0 * c), 0.22);                  // gentle contrast
      vec2 q = vUv - 0.5;
      c *= 1.0 - uVig * dot(q, q) * 1.9;                          // lens falloff
      c += (h(vUv * 900.0 + fract(uTime) * 61.0) - 0.5) * uGrain; // film grain
      gl_FragColor = vec4(c, 1.0);
    }`,
};

type Tier = 'low' | 'medium' | 'high';

export class Engine {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(52, 1, 0.12, 1400);
  /** Everything a scene builds goes under here and is cleared between scenes. */
  root = new THREE.Group();
  hemi = new THREE.HemisphereLight(0xffffff, 0x334422, 1);
  sun = new THREE.DirectionalLight(0xffffff, 1);
  private sunDir = new THREE.Vector3(0.4, 1, 0.3).normalize();
  private sky: THREE.Mesh;
  private skyMat: THREE.ShaderMaterial;
  private envScene = new THREE.Scene();
  private pmrem: THREE.PMREMGenerator;
  private envRT: THREE.WebGLRenderTarget | null = null;
  private envDirty = true;
  private composer: EffectComposer | null = null;
  private grade: ShaderPass | null = null;
  private bloom: UnrealBloomPass | null = null;
  tier: Tier = 'medium';
  time = 0;
  fps = 60;
  /** exposed for tests */
  gild = gild;
  /** grass and scatter density multiplier, read by the world builders */
  density = 1;
  private scale = 1;
  private slow = 0;
  private fast = 0;
  private last = performance.now();
  private markT = 0;
  private fwd = new THREE.Vector3();
  private noRender = new URLSearchParams(location.search).has('norender');
  onFrame: (dt: number) => void = () => {};

  constructor(public canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.add(this.root, this.hemi, this.sun, this.sun.target);
    this.scene.fog = new THREE.Fog(0x000000, 20, 200);
    this.sun.castShadow = true;
    const sc = this.sun.shadow.camera;
    sc.left = -42; sc.right = 42; sc.top = 42; sc.bottom = -42; sc.near = 1; sc.far = 260;
    this.sun.shadow.bias = -0.0004; this.sun.shadow.normalBias = 0.05;

    this.skyMat = new THREE.ShaderMaterial({
      vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: {
        uTop: { value: new THREE.Color() }, uBottom: { value: new THREE.Color() }, uSunDir: { value: this.sunDir.clone() }, uSunCol: { value: new THREE.Color(1, 1, 1) },
        uSunI: { value: 1 }, uStars: { value: 0 }, uClouds: { value: 0.5 }, uSkyTime: gild.uTime, uGild: gild.uGild,
      },
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 16), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false;
    this.scene.add(this.sky);
    const envSky = new THREE.Mesh(this.sky.geometry, this.skyMat);
    this.envScene.add(envSky);
    this.pmrem = new THREE.PMREMGenerator(this.renderer);

    const q = new URLSearchParams(location.search).get('q');
    if (q === 'low' || q === 'medium' || q === 'high') settings.quality = q;
    this.applyQuality();
    this.setSky(0x22303a, 0x566a6a, 30, 220);
    window.addEventListener('resize', () => this.resize());
  }

  /** Low: no post-processing, small shadows. Medium: bloom and grading. High: more samples, bigger shadows. */
  applyQuality() {
    const s = settings.quality;
    this.tier = s === 'auto' ? 'medium' : s;
    this.buildPost();
    const size = this.tier === 'low' ? 1024 : this.tier === 'medium' ? 2048 : 4096;
    if (this.sun.shadow.mapSize.x !== size) { this.sun.shadow.mapSize.set(size, size); this.sun.shadow.map?.dispose(); this.sun.shadow.map = null; }
    this.density = world.density = this.tier === 'low' ? 0.35 : this.tier === 'medium' ? 0.8 : 1.2;
    this.resize();
  }

  private buildPost() {
    this.composer?.dispose();
    this.composer = null; this.grade = null; this.bloom = null;
    if (this.tier === 'low') return;
    const w = window.innerWidth, h = window.innerHeight;
    const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: this.tier === 'high' ? 4 : 2 });
    const c = new EffectComposer(this.renderer, rt);
    c.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), 0.24, 0.65, 1.0);
    c.addPass(this.bloom);
    c.addPass(new OutputPass());
    this.grade = new ShaderPass(GRADE);
    c.addPass(this.grade);
    this.composer = c;
  }

  private maxScale() {
    const dpr = window.devicePixelRatio || 1;
    return this.tier === 'low' ? Math.min(dpr, 1) : Math.min(dpr, this.tier === 'high' ? 2 : 1.5);
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const pr = this.maxScale() * this.scale;
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h, false);
    this.composer?.setPixelRatio(pr);
    this.composer?.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Sky colours (zenith, horizon) and fog. Stars and clouds follow from how dark the sky is. */
  setSky(top: number, bottom: number, fogNear: number, fogFar: number, fogColor?: number) {
    const u = this.skyMat.uniforms;
    const hsl = { h: 0, s: 0, l: 0 };
    new THREE.Color(top).getHSL(hsl);
    // by day the zenith is a deeper blue than the first, flat-shaded pass used
    const zen = new THREE.Color(top); if (hsl.l > 0.3 && hsl.h > 0.45 && hsl.h < 0.72) zen.setHSL(hsl.h + 0.02, Math.min(1, hsl.s * 1.9 + 0.12), hsl.l * 0.82);
    (u.uTop.value as THREE.Color).copy(zen); (u.uBottom.value as THREE.Color).set(bottom);
    const dark = THREE.MathUtils.clamp(1 - hsl.l / 0.16, 0, 1);
    u.uStars.value = dark * 1.6;
    u.uClouds.value = 0.34 - dark * 0.12;
    gild.uNight.value = dark;
    const fog = this.scene.fog as THREE.Fog;
    // distances are in the scenes' own terms; a real atmosphere is thinner than the first pass assumed
    fog.color.set(fogColor ?? bottom); fog.near = fogNear * 1.6; fog.far = fogFar * 1.9;
    this.renderer.setClearColor(fog.color);
    this.envDirty = true;
  }

  setLight(sky: number, ground: number, hemiI: number, sunColor: number, sunI: number, dir: [number, number, number] = [0.4, 1, 0.3]) {
    this.hemi.color.set(sky); this.hemi.groundColor.set(ground); this.hemi.intensity = hemiI * 1.15;
    this.sun.color.set(sunColor); this.sun.intensity = sunI * 2.1;
    this.sunDir.set(...dir).normalize();
    const u = this.skyMat.uniforms;
    (u.uSunDir.value as THREE.Vector3).copy(this.sunDir);
    (u.uSunCol.value as THREE.Color).set(sunColor);
    u.uSunI.value = Math.min(1.6, sunI);
    this.sun.castShadow = sunI > 0.05;
    this.envDirty = true;
  }

  private refreshEnv() {
    this.envDirty = false;
    const old = this.envRT;
    this.envRT = this.pmrem.fromScene(this.envScene, 0.02);
    this.scene.environment = this.envRT.texture;
    this.scene.environmentIntensity = 0.75;
    old?.dispose();
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
    this.camera.fov = 52; this.camera.updateProjectionMatrix();
  }

  /** New meshes join the shadow pass. Glows, glass and the like opt out with userData.noShadow. */
  private markShadows() {
    this.root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || m.userData.sh) return;
      m.userData.sh = true;
      const mt = m.material as THREE.Material;
      const lit = !(mt as THREE.MeshBasicMaterial).isMeshBasicMaterial && !(mt as THREE.ShaderMaterial).isShaderMaterial && !(mt as THREE.PointsMaterial).isPointsMaterial;
      if (m.userData.noShadow || !lit || mt.transparent) return;
      m.castShadow = !m.userData.noCast;
      m.receiveShadow = true;
    });
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
      if (this.envDirty) this.refreshEnv();
      this.markT -= dt;
      if (this.markT <= 0) { this.markT = 0.4; this.markShadows(); }
      // The shadow box follows the view.
      this.camera.getWorldDirection(this.fwd);
      const t = this.sun.target.position.copy(this.camera.position).addScaledVector(this.fwd, 22);
      this.sun.position.copy(t).addScaledVector(this.sunDir, 120);
      this.sky.position.copy(this.camera.position);
      if (this.noRender) return; // the playthrough test runs the game's logic without drawing it
      if (this.composer) { if (this.grade) this.grade.uniforms.uTime.value = this.time; this.composer.render(dt); }
      else this.renderer.render(this.scene, this.camera);
    };
    requestAnimationFrame(loop);
  }

  /** Hold the frame rate by trading resolution first, then the post-processing tier. */
  private adapt(raw: number) {
    if (settings.quality !== 'auto' || document.hidden) return;
    if (raw > 1 / 48) { this.slow += raw; this.fast = 0; } else if (raw < 1 / 57) { this.fast += raw; this.slow = Math.max(0, this.slow - raw); }
    if (this.slow > 1.5) {
      this.slow = 0;
      if (this.scale > 0.65) { this.scale -= 0.1; this.resize(); }
      else if (this.tier !== 'low') { this.tier = 'low'; this.buildPost(); this.sun.shadow.mapSize.set(1024, 1024); this.sun.shadow.map?.dispose(); this.sun.shadow.map = null; this.scale = 0.85; this.resize(); }
    }
    if (this.fast > 12 && this.scale < 1) { this.scale = Math.min(1, this.scale + 0.1); this.fast = 0; this.resize(); }
  }
}
