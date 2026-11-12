// The world's pieces: ground with grass, trees with leaves, rock, water, buildings,
// the mosque, vehicles and street furniture. Everything is generated here; no asset files.
// HARD RULE 1: no statues or carved figures of living beings anywhere in here.
// HARD RULE 7: no Quranic text is ever placed on any surface in the 3D world.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mat, glow, surface, gild, world, K, type Kind } from '../core/engine';

export type HeightFn = (x: number, z: number) => number;
export interface Spot { x: number; y: number; z: number; s: number }

/** Deterministic pseudo-random, so scenes look the same every run. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
export function vnoise(x: number, z: number): number {
  const h = (a: number, b: number) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  return (h(xi, zi) * (1 - u) + h(xi + 1, zi) * u) * (1 - v) + (h(xi, zi + 1) * (1 - u) + h(xi + 1, zi + 1) * u) * v;
}
const paint = (g: THREE.BufferGeometry, col: THREE.Color | number, shade = 1) => {
  const c = col instanceof THREE.Color ? col : new THREE.Color(col), n = g.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r * shade; a[i * 3 + 1] = c.g * shade; a[i * 3 + 2] = c.b * shade; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return g;
};

// ------------------------------------------------------------------ ground and grass
let grassGeo: THREE.BufferGeometry | null = null;
function tuft(): THREE.BufferGeometry {
  if (grassGeo) return grassGeo;
  const pos: number[] = [], col: number[] = [], nor: number[] = [];
  const r = rng(5);
  for (let b = 0; b < 7; b++) {
    const a = r() * 6.28, lean = 0.04 + r() * 0.1, h = 0.07 + r() * 0.13, w = 0.008 + r() * 0.008;
    const ox = (r() - 0.5) * 0.3, oz = (r() - 0.5) * 0.3, dx = Math.cos(a), dz = Math.sin(a);
    const px = -dz * w, pz = dx * w;
    // base left, base right, mid (bent), tip
    const B0 = [ox - px, 0, oz - pz], B1 = [ox + px, 0, oz + pz], M0 = [ox - px * 0.6 + dx * lean * 0.4, h * 0.55, oz - pz * 0.6 + dz * lean * 0.4], M1 = [ox + px * 0.6 + dx * lean * 0.4, h * 0.55, oz + pz * 0.6 + dz * lean * 0.4], T = [ox + dx * lean, h, oz + dz * lean];
    for (const v of [B0, B1, M1, B0, M1, M0, M0, M1, T]) { pos.push(...v); const k = 0.5 + (v[1] / h) * 0.6; col.push(k * 0.95, k, k * 0.8); nor.push(0, 1, 0); }
  }
  grassGeo = new THREE.BufferGeometry();
  grassGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  grassGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  grassGeo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  grassGeo.userData.shared = true;
  return grassGeo;
}
/** A blade material that sways in the wind and takes the Gilding like everything else. */
function swaying(m: THREE.MeshStandardMaterial, gilded: boolean, amount: number): THREE.MeshStandardMaterial {
  surface(m, K.plain, gilded, 0);
  const base = m.onBeforeCompile;
  m.onBeforeCompile = (shader, renderer) => {
    base.call(m, shader, renderer);
    shader.vertexShader = shader.vertexShader
      .replace('varying vec3 vGWorld;', 'varying vec3 vGWorld;\nuniform float uTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float gph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.29;
          float gbend = position.y * position.y * ${amount.toFixed(3)};
          transformed.x += (sin(uTime * 1.6 + gph) + 0.4 * sin(uTime * 3.7 + gph * 2.3)) * gbend;
          transformed.z += cos(uTime * 1.3 + gph * 1.7) * gbend * 0.7;
        #endif`);
  };
  m.customProgramCacheKey = () => 'sway' + amount;
  return m;
}

/**
 * Ground from a height function. Where the ground is green, grass grows on it.
 * `colorAt` gives the base colour; the surface shader adds bare earth, grain and relief.
 */
export function terrain(size: number, seg: number, h: HeightFn, colorAt: (x: number, z: number, y: number, slope: number) => number, gilded = false, cx = 0, cz = 0): THREE.Group {
  const out = new THREE.Group();
  const n = Math.min(160, Math.max(48, Math.round(seg * 2.2)));
  const g = new THREE.PlaneGeometry(size, size, n, n);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + cx, z = pos.getZ(i) + cz;
    const y = h(x, z);
    pos.setXYZ(i, x, y, z);
    const slope = Math.abs(h(x + 1, z) - y) + Math.abs(h(x, z + 1) - y);
    c.set(colorAt(x, z, y, slope)).offsetHSL((vnoise(x * 0.11, z * 0.11) - 0.5) * 0.035, 0, (vnoise(x * 0.4 + 7, z * 0.4) - 0.5) * 0.07);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  const ground = new THREE.Mesh(g, surface(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96 }), K.ground, gilded));
  ground.userData.noCast = true;
  out.add(ground);

  // grass, wherever the ground colour is green enough
  const span = Math.min(size, 150), want = Math.round(Math.min(30000, span * span * 2.2) * world.density);
  const spots: number[] = [];
  const r = rng(Math.round(size * 13 + cx * 7 + cz * 3 + 1));
  const gc = new THREE.Color(), cols: number[] = [];
  for (let i = 0; i < want; i++) {
    // denser toward the middle, where the player is
    const rad = Math.pow(r(), 0.85) * span * 0.5, a = r() * 6.283;
    const x = cx + Math.cos(a) * rad, z = cz + Math.sin(a) * rad, y = h(x, z);
    const slope = Math.abs(h(x + 1, z) - y) + Math.abs(h(x, z + 1) - y);
    gc.set(colorAt(x, z, y, slope));
    if (gc.g < Math.max(gc.r, gc.b) * 1.08 || slope > 1.6) continue;
    if (vnoise(x * 0.33 + 3, z * 0.33 + 3) > 0.74) continue; // bare patches
    spots.push(x, y, z);
    cols.push(gc.r * 1.25 + 0.01, gc.g * 1.3 + 0.015, gc.b * 1.15);
  }
  if (spots.length) {
    const cnt = spots.length / 3;
    const gm = swaying(new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.85 }), gilded, 0.55);
    const inst = new THREE.InstancedMesh(tuft(), gm, cnt);
    const d = new THREE.Object3D();
    for (let i = 0; i < cnt; i++) {
      d.position.set(spots[i * 3], spots[i * 3 + 1] - 0.02, spots[i * 3 + 2]);
      d.rotation.y = r() * 6.28;
      const s = 0.7 + r() * 0.6; d.scale.set(s, s * (0.7 + r() * 0.6), s);
      d.updateMatrix(); inst.setMatrixAt(i, d.matrix);
      inst.setColorAt(i, gc.setRGB(cols[i * 3], cols[i * 3 + 1], cols[i * 3 + 2]));
    }
    inst.frustumCulled = false; inst.userData.noCast = true;
    out.add(inst);
  }
  return out;
}

export function slab(w: number, h: number, d: number, color: number, x: number, y: number, z: number, gilded = false, kind?: Kind): THREE.Mesh {
  let k = kind;
  if (k === undefined && w * h * d > 5 && Math.min(w, h, d) > 0.18) { const hsl = { h: 0, s: 0, l: 0 }; new THREE.Color(color).getHSL(hsl); if (hsl.s >= 0.13 && hsl.h >= 0.045 && hsl.h < 0.13) k = Math.min(w, d) < 1.2 || h > 2.5 ? K.brick : K.plaster; }
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, gilded, false, k));
  m.position.set(x, y, z);
  return m;
}

/** Still or slow water: reflects the sky, ripples crossing. */
export function water(w: number, d: number, color = 0x2b4660): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d, 1, 1).rotateX(-Math.PI / 2), surface(new THREE.MeshStandardMaterial({ color, roughness: 0.07, metalness: 0.35, envMapIntensity: 1.8 }), K.water));
  m.userData.noCast = true;
  return m;
}

// ------------------------------------------------------------------ trees
const leafTex = new Map<string, THREE.Texture>();
function leaves(kind: 'broad' | 'pine'): THREE.Texture {
  let t = leafTex.get(kind);
  if (t) return t;
  const cv = document.createElement('canvas'); cv.width = cv.height = 512; 
  const x = cv.getContext('2d')!;
  x.scale(2, 2);
  const r = rng(kind === 'pine' ? 3 : 9);
  if (kind === 'broad') {
    for (let i = 0; i < 420; i++) {
      const px = 128 + (r() - 0.5) * 210, py = 128 + (r() - 0.5) * 210;
      if (Math.hypot(px - 128, py - 128) > 118) continue;
      const v = 150 + Math.floor(r() * 105);
      x.fillStyle = `rgb(${v - 30},${v},${v - 60})`;
      x.beginPath(); x.ellipse(px, py, 5 + r() * 5, 2.2 + r() * 2.6, r() * 3.14, 0, 6.283); x.fill();
    }
  } else {
    // a pine bough: needles off a central twig
    for (let i = 0; i < 520; i++) {
      const u = r(), py = 14 + u * 228, side = r() < 0.5 ? -1 : 1, len = (1 - u * 0.75) * (40 + r() * 70);
      const v = 130 + Math.floor(r() * 125);
      x.strokeStyle = `rgb(${v - 40},${v},${v - 50})`; x.lineWidth = 2.2;
      x.beginPath(); x.moveTo(128, py); x.lineTo(128 + side * len, py + 16 + r() * 22); x.stroke();
    }
  }
  t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.generateMipmaps = true;
  leafTex.set(kind, t);
  return t;
}
function card(out: THREE.BufferGeometry[], cx: number, cy: number, cz: number, size: number, rx: number, ry: number, rz: number, center: THREE.Vector3, shade: number) {
  const q = new THREE.PlaneGeometry(size, size);
  q.rotateZ(rz); q.rotateX(rx); q.rotateY(ry); q.translate(cx, cy, cz);
  // normals fan out from the crown's centre, so the tree shades as one soft mass
  const p = q.attributes.position, nrm = q.attributes.normal, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.set(p.getX(i), p.getY(i), p.getZ(i)).sub(center).normalize(); v.y = v.y * 0.7 + 0.45; v.normalize(); nrm.setXYZ(i, v.x, v.y, v.z); }
  paint(q, 0xffffff, shade);
  out.push(q.toNonIndexed());
}
const treeCache = new Map<string, { trunk: THREE.BufferGeometry; crown: THREE.BufferGeometry }>();
function treeGeo(kind: 'pine' | 'broad' | 'scrub', variant: number) {
  const key = kind + variant;
  let t = treeCache.get(key);
  if (t) return t;
  const r = rng(variant * 31 + kind.length * 7 + 1);
  const wood: THREE.BufferGeometry[] = [], cards: THREE.BufferGeometry[] = [];
  const stick = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, r0: number, r1: number) => {
    const a = new THREE.Vector3(x0, y0, z0), b = new THREE.Vector3(x1, y1, z1), len = a.distanceTo(b);
    const c = new THREE.CylinderGeometry(r1, r0, len, 7, 1);
    c.translate(0, len / 2, 0);
    c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()));
    c.translate(x0, y0, z0);
    wood.push(c.toNonIndexed());
  };
  if (kind === 'pine') {
    const H = 7.5 + r() * 2;
    stick(0, 0, 0, (r() - 0.5) * 0.25, H, (r() - 0.5) * 0.25, 0.2, 0.03);
    const mid = new THREE.Vector3(0, H * 0.55, 0);
    for (let tier = 0; tier < 9; tier++) {
      const y = 1.7 + (tier / 9) * (H - 1.9), rad = (1 - tier / 10.5) * 2.1, nb = 7;
      for (let i = 0; i < nb; i++) {
        const a = (i / nb) * 6.283 + tier * 0.9 + r() * 0.3;
        card(cards, Math.sin(a) * rad * 0.52, y - rad * 0.14, Math.cos(a) * rad * 0.52, rad * 1.25, -Math.PI / 2 + 0.42, a, 0, mid, 0.62 + (tier / 9) * 0.38 + r() * 0.08);
      }
    }
    card(cards, 0, H - 0.2, 0, 1.0, 0, r() * 3, 0, mid, 1.05);
  } else if (kind === 'broad') {
    const H = 3.2 + r() * 1.1;
    stick(0, 0, 0, (r() - 0.5) * 0.5, H, (r() - 0.5) * 0.5, 0.26, 0.15);
    const blobs: THREE.Vector3[] = [];
    for (let b = 0; b < 5; b++) {
      const a = (b / 5) * 6.283 + r(), reach = 1.5 + r() * 1.2, top = H + 1.1 + r() * 1.5;
      stick(0, H - 0.3, 0, Math.sin(a) * reach, top, Math.cos(a) * reach, 0.12, 0.04);
      blobs.push(new THREE.Vector3(Math.sin(a) * reach, top + 0.2, Math.cos(a) * reach));
    }
    blobs.push(new THREE.Vector3(0, H + 2.6, 0), new THREE.Vector3((r() - 0.5) * 1.5, H + 1.6, (r() - 0.5) * 1.5));
    const mid = new THREE.Vector3(0, H + 1.6, 0);
    for (const b of blobs) for (let i = 0; i < 12; i++) {
      const ox = (r() - 0.5) * 2.1, oy = (r() - 0.5) * 1.5, oz = (r() - 0.5) * 2.1;
      card(cards, b.x + ox, b.y + oy, b.z + oz, 1.5 + r() * 0.9, (r() - 0.5) * 2.4, r() * 6.28, r() * 6.28, mid, 0.6 + ((b.y + oy - H) / 3.4) * 0.42 + r() * 0.1);
    }
  } else {
    const mid = new THREE.Vector3(0, 0.35, 0);
    for (let i = 0; i < 4; i++) stick(0, 0, 0, (r() - 0.5) * 0.8, 0.5 + r() * 0.4, (r() - 0.5) * 0.8, 0.03, 0.012);
    for (let i = 0; i < 12; i++) card(cards, (r() - 0.5) * 0.9, 0.3 + r() * 0.55, (r() - 0.5) * 0.9, 0.75 + r() * 0.4, (r() - 0.5) * 2, r() * 6.28, r() * 6.28, mid, 0.7 + r() * 0.35);
  }
  const trunk = mergeGeometries(wood)!; trunk.computeVertexNormals();
  const crown = mergeGeometries(cards)!;
  trunk.userData.shared = crown.userData.shared = true;
  t = { trunk, crown };
  treeCache.set(key, t);
  return t;
}

/** Many trees as instanced meshes. kind: pine | broad | scrub. Each spot's `s` is its size. */
export function forest(spots: Spot[], kind: 'pine' | 'broad' | 'scrub', leaf = 0x3f6b3a, gilded = false): THREE.Group {
  const g = new THREE.Group();
  if (!spots.length) return g;
  const VAR = 3;
  const crownMat = swaying(new THREE.MeshStandardMaterial({ map: leaves(kind === 'pine' ? 'pine' : 'broad'), alphaTest: 0.42, side: THREE.DoubleSide, vertexColors: true, roughness: 0.82 }), gilded, kind === 'scrub' ? 0.25 : 0.0035);
  // the old proportions: pines were about 4.4 tall at s = 1, broad trees about 4.6
  const base = kind === 'pine' ? 0.6 : kind === 'broad' ? 0.78 : 1;
  const d = new THREE.Object3D(), c = new THREE.Color();
  for (let v = 0; v < VAR; v++) {
    const list = spots.filter((_, i) => i % VAR === v);
    if (!list.length) continue;
    const tg = treeGeo(kind, v);
    const trunks = new THREE.InstancedMesh(tg.trunk, mat(kind === 'pine' ? 0x3d2b20 : 0x4a3a2a, gilded, true, K.bark), list.length);
    const crowns = new THREE.InstancedMesh(tg.crown, crownMat, list.length);
    list.forEach((s, i) => {
      const k = i * 7.31 + v * 2.1;
      d.position.set(s.x, s.y - 0.05, s.z); d.rotation.set(0, k * 2.4, 0);
      const sc = s.s * base; d.scale.set(sc, sc * (0.9 + (Math.sin(k) * 0.5 + 0.5) * 0.25), sc);
      d.updateMatrix(); trunks.setMatrixAt(i, d.matrix); crowns.setMatrixAt(i, d.matrix);
      crowns.setColorAt(i, c.set(leaf).multiplyScalar(1.7).offsetHSL(Math.sin(k * 1.7) * 0.025, 0, Math.sin(k * 3.1) * 0.05));
    });
    trunks.frustumCulled = crowns.frustumCulled = false;
    g.add(trunks, crowns);
  }
  return g;
}

export function rocks(spots: Spot[], color = 0x7c7a72, gilded = false): THREE.InstancedMesh {
  const geom = new THREE.IcosahedronGeometry(1, 2);
  const p = geom.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 0.72 + vnoise(x * 1.7 + 3, y * 1.7 + z * 2.1) * 0.5 + vnoise(x * 4 + 1, z * 4 + y * 3) * 0.14;
    p.setXYZ(i, x * k, y * k * 0.78, z * k);
  }
  geom.computeVertexNormals();
  const inst = new THREE.InstancedMesh(geom, mat(color, gilded, true, K.rock), Math.max(1, spots.length));
  const d = new THREE.Object3D();
  spots.forEach((s, i) => { d.position.set(s.x, s.y + s.s * 0.25, s.z); d.rotation.set(i * 1.3, i * 2.1, i * 0.7); d.scale.set(s.s, s.s * 0.8, s.s * 0.95); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); });
  inst.frustumCulled = false;
  return inst;
}

// ------------------------------------------------------------------ fire, light, camp
export function campfire(): { group: THREE.Group; light: THREE.PointLight; update: (t: number) => void } {
  const group = new THREE.Group();
  const stones: Spot[] = [];
  for (let i = 0; i < 9; i++) stones.push({ x: Math.cos(i * 0.7) * 0.46, y: -0.04, z: Math.sin(i * 0.7) * 0.46, s: 0.11 + (i % 3) * 0.02 });
  group.add(rocks(stones, 0x4a4640));
  for (let i = 0; i < 5; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.72, 7), mat(0x1c120c, false, true, K.bark));
    log.rotation.set(Math.PI / 2 - 0.45, i * 1.26, 0); log.position.set(Math.sin(i * 1.26) * 0.16, 0.17, Math.cos(i * 1.26) * 0.16); group.add(log);
  }
  const flames: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.1 + (i % 2) * 0.07, 0.42 + i * 0.09, 6), glow(i < 2 ? 0xfff0a0 : 0xff7a22, i < 2 ? 2.6 : 1.9));
    f.position.set(Math.sin(i * 2.2) * 0.08, 0.32 + i * 0.03, Math.cos(i * 2.2) * 0.08);
    (f.material as THREE.MeshBasicMaterial).transparent = true; (f.material as THREE.MeshBasicMaterial).opacity = 0.85; (f.material as THREE.MeshBasicMaterial).depthWrite = false;
    group.add(f); flames.push(f);
  }
  const N = 26, eg = new THREE.BufferGeometry(), ep = new Float32Array(N * 3);
  eg.setAttribute('position', new THREE.BufferAttribute(ep, 3));
  const embers = new THREE.Points(eg, new THREE.PointsMaterial({ color: new THREE.Color(0xffa040).multiplyScalar(3), size: 0.035, transparent: true, depthWrite: false }));
  embers.frustumCulled = false; group.add(embers);
  const light = new THREE.PointLight(0xff8a3a, 22, 20, 1.7); light.position.y = 0.8; group.add(light);
  const seed = Math.random() * 10;
  return {
    group, light,
    update: (t) => {
      const k = 0.85 + Math.sin(t * 11 + seed) * 0.08 + Math.sin(t * 23 + seed * 2) * 0.07;
      light.intensity = 22 * k;
      flames.forEach((f, i) => { f.scale.set(1 + Math.sin(t * 9 + i * 2) * 0.18, 0.85 + Math.sin(t * 13 + i * 1.7 + seed) * 0.28, 1); f.rotation.y = t * (1 + i * 0.3); });
      for (let i = 0; i < N; i++) { const life = (t * 0.5 + i / N + seed) % 1; ep[i * 3] = Math.sin(i * 12.9 + life * 3) * 0.22 * (0.4 + life); ep[i * 3 + 1] = 0.3 + life * 2.6; ep[i * 3 + 2] = Math.cos(i * 7.7 + life * 2) * 0.22 * (0.4 + life); }
      eg.attributes.position.needsUpdate = true;
    },
  };
}

/** A lantern: a small cage around a flame, and the light it gives. */
export function lamp(color = 0xffc87a, intensity = 8, range = 12): THREE.Group {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), glow(color, 2.6));
  const l = new THREE.PointLight(color, intensity * 1.1, range * 1.3, 1.6);
  g.add(b, l); // (children[1] is the light: scenes rely on that)
  const metal = mat(0x1a1612, false, true, K.metal);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.08, 8), metal); cap.position.y = 0.12;
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.03, 8), metal); foot.position.y = -0.11;
  g.add(cap, foot);
  for (let i = 0; i < 4; i++) { const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 4), metal); bar.position.set(Math.cos(i * 1.57) * 0.08, 0, Math.sin(i * 1.57) * 0.08); g.add(bar); }
  g.traverse((o) => { o.userData.noShadow = true; });
  return g;
}

/** A ridge tent: canvas over a pole, pegged with ropes. */
export function tent(color = 0xc9b990): THREE.Group {
  const g = new THREE.Group();
  const shape = new THREE.Shape(); shape.moveTo(-1.5, 0); shape.lineTo(0, 1.9); shape.lineTo(1.5, 0); shape.lineTo(-1.5, 0);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 3, bevelEnabled: false }).translate(0, 0, -1.5), mat(color, false, true, K.cloth));
  g.add(body);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.3), new THREE.MeshBasicMaterial({ color: 0x0a0806 })); door.position.set(0, 0.65, 1.505); door.userData.noShadow = true; g.add(door);
  const wood = mat(0x5a4028, false, true, K.wood);
  for (const z of [-1.55, 1.55]) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 2.1, 6), wood); pole.position.set(0, 1.05, z); g.add(pole); }
  for (const [x, z] of [[-2.1, -1.5], [2.1, -1.5], [-2.1, 1.5], [2.1, 1.5]]) {
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.5, 4), mat(0xb9a98a, false, true, K.cloth));
    rope.position.set(x * 0.75, 0.55, z); rope.rotation.z = (x > 0 ? 1 : -1) * 0.95; g.add(rope);
    const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.012, 0.25, 5), wood); peg.position.set(x, 0.08, z); g.add(peg);
  }
  g.rotation.y = Math.PI / 4;
  return g;
}

/** A charpoy: wooden frame, turned legs, woven rope top. */
export function charpoy(w = 2.4, d = 0.95, h = 0.45): THREE.Group {
  const g = new THREE.Group();
  const wood = mat(0x5a3d24, false, true, K.wood);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.028, h + 0.06, 8), wood); leg.position.set(x * (w / 2 - 0.04), (h + 0.06) / 2, z * (d / 2 - 0.04)); g.add(leg); }
  for (const z of [-1, 1]) { const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, w, 8), wood); rail.rotation.z = Math.PI / 2; rail.position.set(0, h, z * (d / 2 - 0.04)); g.add(rail); }
  for (const x of [-1, 1]) { const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, d, 8), wood); rail.rotation.x = Math.PI / 2; rail.position.set(x * (w / 2 - 0.04), h, 0); g.add(rail); }
  const top = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, 0.02, d - 0.1), mat(0xc2ae84, false, true, K.cloth)); top.position.y = h - 0.005; g.add(top);
  return g;
}

// ------------------------------------------------------------------ buildings
/** A modern block: storeys of windows, a plinth, a parapet, and what collects on a roof. */
export function building(w: number, h: number, d: number, color: number, gilded = false, seed = 1): THREE.Group {
  const g = new THREE.Group(), r = rng(seed * 97 + 5);
  g.add(slab(w, h, d, color, 0, h / 2, 0, gilded, K.facade));
  g.add(slab(w + 0.3, 0.7, d + 0.3, 0x6a6660, 0, 0.35, 0, gilded, K.plaster));
  g.add(slab(w + 0.4, 0.35, d + 0.4, 0xcfc8ba, 0, h + 0.17, 0, gilded, K.plaster));
  for (let y = 3.1; y < h - 1; y += 3.1) g.add(slab(w + 0.16, 0.14, d + 0.16, 0xcfc8ba, 0, y + 0.55, 0, gilded, K.plaster)); // sill bands
  for (let i = 0; i < 3; i++) g.add(slab(1 + r() * 1.4, 0.8 + r() * 0.8, 1 + r() * 1.2, i ? 0x8f9296 : 0x2a2a2e, (r() - 0.5) * (w - 3), h + 0.75, (r() - 0.5) * (d - 3), gilded, i ? K.metal : K.plaster));
  return g;
}

/**
 * A small stone mosque: hollow, with an open door, a low dome and a short minaret.
 * Never gilded. Its walls and floor carry no text. Local space: the door faces +z at z = 0.
 */
export function smallMosque(stone = 0xb9b2a2): THREE.Group {
  const g = new THREE.Group();
  const trim = 0xa39c8c, white = 0xdedacd;
  const S = (w: number, h: number, d: number, c: number, x: number, y: number, z: number, k: Kind = K.plaster) => { const m = slab(w, h, d, c, x, y, z, false, k); g.add(m); return m; };
  S(6.6, 0.18, 5.9, trim, 0, 0.0, -2.5, K.tile); // plinth
  S(6, 3.2, 0.3, stone, 0, 1.6, -4.85, K.brick);
  S(0.3, 3.2, 5, stone, -2.85, 1.6, -2.5, K.brick); S(0.3, 3.2, 5, stone, 2.85, 1.6, -2.5, K.brick);
  S(2.25, 3.2, 0.3, stone, -1.875, 1.6, -0.15, K.brick); S(2.25, 3.2, 0.3, stone, 1.875, 1.6, -0.15, K.brick);
  S(1.5, 0.9, 0.3, stone, 0, 2.75, -0.15, K.brick);
  // a pointed arch over the door, and its frame
  const arch = new THREE.Shape(); arch.moveTo(-0.75, 0); arch.lineTo(-0.75, 0.05); arch.quadraticCurveTo(-0.7, 0.75, 0, 1.0); arch.quadraticCurveTo(0.7, 0.75, 0.75, 0.05); arch.lineTo(0.75, 0); arch.lineTo(0.93, 0); arch.lineTo(0.93, 0.1); arch.quadraticCurveTo(0.86, 0.95, 0, 1.24); arch.quadraticCurveTo(-0.86, 0.95, -0.93, 0.1); arch.lineTo(-0.93, 0); arch.lineTo(-0.75, 0);
  const archM = new THREE.Mesh(new THREE.ExtrudeGeometry(arch, { depth: 0.12, bevelEnabled: false }), mat(white, false, true, K.plaster)); archM.position.set(0, 1.42, -0.02); g.add(archM);
  for (const x of [-0.84, 0.84]) S(0.18, 1.45, 0.14, white, x, 0.72, 0.05);
  // carved wooden doors, standing open
  for (const sx of [-1, 1]) { const leaf = S(0.72, 2.2, 0.06, 0x4a3018, sx * 0.98, 1.2, 0.36, K.wood); leaf.rotation.y = sx * 1.25; }
  // cornice, parapet with small merlons, dome on a drum
  S(6.5, 0.22, 5.5, trim, 0, 3.31, -2.5);
  for (let i = 0; i < 13; i++) { S(0.3, 0.3, 0.14, white, -3 + i * 0.5, 3.57, 0.14); S(0.3, 0.3, 0.14, white, -3 + i * 0.5, 3.57, -5.14); }
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.6, 0.5, 20), mat(white, false, true, K.plaster)); drum.position.set(0, 3.67, -2.5); g.add(drum);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.5, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat(white, false, true, K.plaster)); dome.position.set(0, 3.9, -2.5); dome.scale.y = 1.12; g.add(dome);
  const brass = mat(0xb8893a, false, true, K.metal);
  const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 0.6, 8), brass); fin.position.set(0, 5.85, -2.5); g.add(fin);
  for (const [y, rr] of [[5.72, 0.09], [5.92, 0.065], [6.08, 0.045]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(rr, 10, 8), brass); b.position.set(0, y, -2.5); g.add(b); }
  // inside: a plain rug, the mihrab niche
  S(5.3, 0.03, 4.4, 0x6f2f2a, 0, 0.105, -2.5, K.cloth);
  S(5.5, 0.012, 4.6, 0xb9a98a, 0, 0.096, -2.5, K.cloth);
  S(1.2, 2.1, 0.1, 0x8f8878, 0, 1.15, -4.66); S(1.5, 0.12, 0.16, white, 0, 2.26, -4.64);
  // small windows in the side walls
  for (const x of [-2.86, 2.86]) for (const z of [-1.5, -3.5]) { S(0.34, 0.9, 0.5, 0x100e0c, x, 2.0, z); S(0.4, 0.08, 0.7, white, x, 1.5, z); }
  // the short minaret: eight-sided shaft, a balcony, a pointed cap; steps beside it
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.68, 5.0, 8), mat(stone, false, true, K.brick)); shaft.position.set(4.2, 2.5, -1.5); g.add(shaft);
  const balc = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.6, 0.28, 8), mat(white, false, true, K.plaster)); balc.position.set(4.2, 4.6, -1.5); g.add(balc);
  for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), mat(white, false, true, K.plaster)); p.position.set(4.2 + Math.cos(i * 0.785) * 0.8, 5.0, -1.5 + Math.sin(i * 0.785) * 0.8); g.add(p); }
  const lant = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, 1.0, 8), mat(stone, false, true, K.brick)); lant.position.set(4.2, 5.2, -1.5); g.add(lant);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.56, 1.0, 8), mat(white, false, true, K.plaster)); cap.position.set(4.2, 6.2, -1.5); g.add(cap);
  for (let i = 0; i < 4; i++) S(1.2, 0.25, 0.5, trim, 4.2, 0.125 + i * 0.25, 1.4 - i * 0.5, K.tile);
  S(1.9, 0.16, 0.8, trim, 0, 0.08, 0.45, K.tile); // the step at the door
  // an old tap for wudu, beside the door, over a stone trough
  S(0.6, 0.75, 0.32, trim, -2.1, 0.375, 0.3, K.brick);
  S(0.7, 0.14, 0.5, 0x6a6660, -2.1, 0.07, 0.62, K.rock);
  const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.26, 8), mat(0x8a7a4a, false, true, K.metal)); tap.rotation.x = Math.PI / 2; tap.position.set(-2.1, 0.62, 0.55); g.add(tap);
  const inside = new THREE.PointLight(0xffd9a0, 10, 11, 1.5); inside.position.set(0, 2.3, -2.2); g.add(inside);
  return g;
}

/** The Faisal Mosque, far off: white tent-like shell and four slim minarets. It is never gilded. */
export function faisalMosque(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const white = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(1.15), fog: false });
  const shell = new THREE.Mesh(new THREE.ConeGeometry(11, 9, 8), white); shell.position.y = 5.2; shell.rotation.y = Math.PI / 8; g.add(shell);
  const base = new THREE.Mesh(new THREE.BoxGeometry(22, 1.4, 22), white); base.position.y = 0.7; g.add(base);
  for (const [x, z] of [[10, 10], [-10, 10], [10, -10], [-10, -10]]) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.62, 20, 4), white); m.position.set(x, 10, z); g.add(m);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.34, 3, 4), white); tip.position.set(x, 21.5, z); g.add(tip);
  }
  g.scale.setScalar(scale);
  return g;
}

/** Nicholson's Obelisk (1868): plain tapered stone on a stepped base. */
export function obelisk(gilded = true): THREE.Group {
  const g = new THREE.Group();
  const stone = mat(0x9a958a, gilded, false, K.brick);
  for (const [w, y] of [[7, 0.5], [5.6, 1.5], [4.2, 2.6]]) { const st = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, w), stone); st.position.y = y; g.add(st); }
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3, 3.2), stone); plinth.position.y = 4.6; g.add(plinth);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.5, 20, 4), stone); shaft.position.y = 16; shaft.rotation.y = Math.PI / 4; g.add(shaft);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(1.27, 2.2, 4), stone); tip.position.y = 27.1; tip.rotation.y = Math.PI / 4; g.add(tip);
  return g;
}

/** A city seen from above: sector blocks, trees, roads, a business district. Gildable. */
export function cityBelow(seed = 5): THREE.Group {
  const g = new THREE.Group();
  const r = rng(seed);
  const spots: { x: number; z: number; w: number; h: number; d: number; c: number }[] = [];
  for (let gx = -7; gx <= 7; gx++) for (let gz = 0; gz < 10; gz++) {
    const blue = gz >= 3 && gz <= 4 && Math.abs(gx) < 5; // Blue Area: the towers
    const n = blue ? 4 : 9;
    for (let i = 0; i < n; i++) {
      const h = blue ? 14 + r() * 34 : 3 + r() * 6;
      spots.push({ x: gx * 30 + (r() - 0.5) * 24, z: gz * 30 + (r() - 0.5) * 24, w: blue ? 6 + r() * 4 : 5 + r() * 6, h, d: blue ? 6 + r() * 4 : 5 + r() * 6, c: blue ? [0x9fb2bd, 0xb8c2c6, 0x8fa0aa][i % 3] : [0xd8d2c2, 0xc9c2b0, 0xe2ddd0, 0xbfb4a0][Math.floor(r() * 4)] });
    }
  }
  const bm = surface(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }), K.facade, true);
  const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), bm, spots.length);
  const d = new THREE.Object3D(), c = new THREE.Color();
  spots.forEach((s, i) => { d.position.set(s.x, s.h / 2, s.z); d.rotation.y = 0; d.scale.set(s.w, s.h, s.d); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); inst.setColorAt(i, c.set(s.c)); });
  inst.frustumCulled = false;
  g.add(inst);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 480), mat(0x4f7a48, true, false, K.ground)); ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.05, 150); g.add(ground);
  const trees: Spot[] = [];
  for (let i = 0; i < 520; i++) trees.push({ x: (r() - 0.5) * 460, y: 0, z: r() * 310 - 12, s: 1.6 + r() * 1.8 });
  g.add(forest(trees, 'broad', 0x3d6e3c, true));
  for (let gx = -7; gx <= 8; gx++) { const road = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 320), mat(0x55575a, true, false, K.asphalt)); road.rotation.x = -Math.PI / 2; road.position.set(gx * 30 - 15, 0.03, 140); g.add(road); }
  for (let gz = 0; gz <= 10; gz++) { const road = new THREE.Mesh(new THREE.PlaneGeometry(460, 3.4), mat(0x55575a, true, false, K.asphalt)); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.035, gz * 30 - 15); g.add(road); }
  return g;
}

// ------------------------------------------------------------------ roads and vehicles
/** A street lamp: pole, arm, lit head, and its pool of light. */
export function streetLamp(height = 6, color = 0xffc27a, intensity = 46): THREE.Group {
  const g = new THREE.Group(), metal = mat(0x3a3d42, false, true, K.metal);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, height, 8), metal); pole.position.y = height / 2;
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.5, 6), metal); arm.rotation.z = Math.PI / 2 - 0.2; arm.position.set(0.72, height + 0.1, 0);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.22), metal); head.position.set(1.4, height + 0.2, 0);
  const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.16), glow(color, 3)); bulb.position.set(1.4, height + 0.14, 0); bulb.userData.noShadow = true;
  const l = new THREE.SpotLight(color, intensity * 3, 26, 1.05, 0.7, 1.4); l.position.set(1.4, height + 0.1, 0); l.target.position.set(1.6, 0, 0);
  g.add(pole, arm, head, bulb, l, l.target);
  return g;
}

/** A plain saloon car. No badge, no make. */
export function car(color = 0x8a8f96, lights = false): THREE.Group {
  const g = new THREE.Group();
  const paintM = new THREE.MeshStandardMaterial({ color, metalness: 0.55, roughness: 0.3 });
  const side = new THREE.Shape();
  side.moveTo(-2.1, 0.32); side.lineTo(-2.14, 0.7); side.quadraticCurveTo(-2.1, 0.92, -1.5, 0.98); side.lineTo(-1.0, 1.02);
  side.quadraticCurveTo(-0.7, 1.42, -0.25, 1.44); side.lineTo(0.75, 1.42); side.quadraticCurveTo(1.25, 1.34, 1.5, 0.98);
  side.quadraticCurveTo(2.12, 0.9, 2.16, 0.62); side.lineTo(2.12, 0.32); side.lineTo(-2.1, 0.32);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(side, { depth: 1.62, bevelEnabled: true, bevelSize: 0.07, bevelThickness: 0.07, bevelSegments: 3, curveSegments: 10 }).translate(0, 0, -0.81).rotateY(Math.PI / 2), paintM);
  g.add(body);
  const glassM = new THREE.MeshStandardMaterial({ color: 0x0c1014, metalness: 0.9, roughness: 0.08 });
  const cab = new THREE.Shape(); cab.moveTo(-0.92, 1.03); cab.quadraticCurveTo(-0.66, 1.38, -0.24, 1.4); cab.lineTo(0.72, 1.38); cab.quadraticCurveTo(1.16, 1.3, 1.38, 1.03); cab.lineTo(-0.92, 1.03);
  const glass = new THREE.Mesh(new THREE.ExtrudeGeometry(cab, { depth: 1.8, bevelEnabled: false }).translate(0, 0, -0.9).rotateY(Math.PI / 2), glassM);
  g.add(glass);
  const tyre = mat(0x111113, false, true, K.plain), hub = mat(0xb9bcc0, false, true, K.metal);
  for (const [x, z] of [[-0.86, -1.32], [0.86, -1.32], [-0.86, 1.36], [0.86, 1.36]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 18), tyre); w.rotation.z = Math.PI / 2; w.position.set(x, 0.33, z); g.add(w);
    const hc = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.25, 12), hub); hc.rotation.z = Math.PI / 2; hc.position.set(x, 0.33, z); g.add(hc);
  }
  for (const x of [-0.6, 0.6]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.06), lights ? glow(0xfff3d8, 2) : mat(0xd9dde0, false, true, K.metal)); hl.position.set(x, 0.74, 2.18); hl.userData.noShadow = true; g.add(hl);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.06), lights ? glow(0xff2a1a, 3) : mat(0x6a1410, false, true, K.plain)); tl.position.set(x, 0.78, -2.16); tl.userData.noShadow = true; g.add(tl);
  }
  if (lights) { const beam = new THREE.SpotLight(0xfff0d0, 70, 34, 0.5, 0.6, 1.3); beam.position.set(0, 0.8, 2.2); beam.target.position.set(0, 0, 16); g.add(beam, beam.target); }
  return g;
}

/** A length of road: asphalt, a dashed centre line, kerbs. Runs along x. */
export function road(length: number, width = 7): THREE.Group {
  const g = new THREE.Group();
  g.add(slab(length, 0.12, width, 0x2e3033, 0, 0, 0, false, K.asphalt));
  const line = glow(0xd8d4c4, 0.55);
  const n = Math.floor(length / 5), dash = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 0.01, 0.13), line, n), d = new THREE.Object3D();
  for (let i = 0; i < n; i++) { d.position.set(-length / 2 + 2.5 + i * 5, 0.066, 0); d.updateMatrix(); dash.setMatrixAt(i, d.matrix); }
  dash.userData.noShadow = true; g.add(dash);
  for (const z of [-1, 1]) g.add(slab(length, 0.22, 0.3, 0x8f8c84, 0, 0.05, z * (width / 2 + 0.15), false, K.plaster));
  return g;
}
void gild;
