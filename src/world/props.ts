// Environment pieces: terrain, trees, buildings. Painterly, flat-shaded, low-poly.
// HARD RULE 1: no statues or carved figures of living beings anywhere in here.
// HARD RULE 7: no Quranic text is ever placed on any surface in the 3D world.
import * as THREE from 'three';
import { mat, glow, gildable } from '../core/engine';

export type HeightFn = (x: number, z: number) => number;

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

/** Ground mesh from a height function, with painterly vertex colours. */
export function terrain(size: number, seg: number, h: HeightFn, colorAt: (x: number, z: number, y: number, slope: number) => number, gilded = false, cx = 0, cz = 0): THREE.Mesh {
  const g = new THREE.PlaneGeometry(size, size, seg, seg);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + cx, z = pos.getZ(i) + cz;
    const y = h(x, z);
    pos.setXYZ(i, x, y, z);
    const slope = Math.abs(h(x + 1, z) - y) + Math.abs(h(x, z + 1) - y);
    c.set(colorAt(x, z, y, slope)).offsetHSL((vnoise(x * 0.3, z * 0.3) - 0.5) * 0.03, 0, (vnoise(x * 0.9 + 7, z * 0.9) - 0.5) * 0.09);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  if (gilded) gildable(m);
  return new THREE.Mesh(g, m);
}

export function slab(w: number, h: number, d: number, color: number, x: number, y: number, z: number, gilded = false): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, gilded));
  m.position.set(x, y, z);
  return m;
}

/** Many trees as two instanced meshes. kind: pine | broad | scrub */
export function forest(spots: { x: number; y: number; z: number; s: number }[], kind: 'pine' | 'broad' | 'scrub', leaf = 0x3f6b3a, gilded = false): THREE.Group {
  const g = new THREE.Group();
  if (!spots.length) return g;
  const trunkH = kind === 'scrub' ? 0.5 : kind === 'pine' ? 2.2 : 2.6;
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.17, trunkH, 5), mat(0x4a3626, gilded), spots.length);
  const crownGeo = kind === 'pine' ? new THREE.ConeGeometry(1.15, 3.6, 6) : kind === 'broad' ? new THREE.IcosahedronGeometry(1.7, 0) : new THREE.IcosahedronGeometry(0.8, 0);
  const cm = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
  if (gilded) gildable(cm);
  const crowns = new THREE.InstancedMesh(crownGeo, cm, spots.length);
  const d = new THREE.Object3D(), c = new THREE.Color();
  spots.forEach((s, i) => {
    d.rotation.set(0, i * 2.4, 0);
    d.scale.setScalar(s.s);
    d.position.set(s.x, s.y + (trunkH / 2) * s.s, s.z); d.updateMatrix(); trunks.setMatrixAt(i, d.matrix);
    const cy = kind === 'pine' ? trunkH + 1.3 : kind === 'broad' ? trunkH + 0.9 : trunkH + 0.2;
    d.position.set(s.x, s.y + cy * s.s, s.z); d.updateMatrix(); crowns.setMatrixAt(i, d.matrix);
    crowns.setColorAt(i, c.set(leaf).offsetHSL((Math.sin(i * 7.3) * 0.5) * 0.04, 0, Math.sin(i * 3.1) * 0.05));
  });
  trunks.frustumCulled = crowns.frustumCulled = false;
  g.add(trunks, crowns);
  return g;
}

export function campfire(): { group: THREE.Group; light: THREE.PointLight; update: (t: number) => void } {
  const group = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 5), mat(0x3a2414));
    log.rotation.set(Math.PI / 2, 0, i * 0.8); log.position.y = 0.07; group.add(log);
  }
  const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 5), glow(0xff9a3c, 1.1)); f1.position.y = 0.38;
  const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.42, 5), glow(0xffe08a, 1.2)); f2.position.y = 0.34;
  group.add(f1, f2);
  const light = new THREE.PointLight(0xff9a4a, 14, 16, 1.6); light.position.y = 0.9; group.add(light);
  const seed = Math.random() * 10;
  return { group, light, update: (t) => { const k = 0.85 + Math.sin(t * 11 + seed) * 0.08 + Math.sin(t * 23 + seed * 2) * 0.07; light.intensity = 14 * k; f1.scale.set(1, 0.9 + (k - 0.85) * 2, 1); f2.scale.y = 1.6 - k * 0.6; } };
}

export function lamp(color = 0xffc87a, intensity = 8, range = 12): THREE.Group {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), glow(color, 1.3));
  const l = new THREE.PointLight(color, intensity, range, 1.7);
  g.add(b, l);
  return g;
}

export function tent(color = 0xc9b990): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.ConeGeometry(1.7, 2.1, 4), mat(color));
  m.position.y = 1.05; m.rotation.y = Math.PI / 4;
  return m;
}

/**
 * A small stone mosque: hollow, with an open door, a low dome and a short minaret.
 * Never gilded. Its walls and floor carry no text. Local space: the door faces +z at z = 0.
 */
export function smallMosque(stone = 0xb9b2a2): THREE.Group {
  const g = new THREE.Group();
  const trim = 0xa39c8c;
  g.add(slab(6, 3.2, 0.3, stone, 0, 1.6, -4.85));
  g.add(slab(0.3, 3.2, 5, stone, -2.85, 1.6, -2.5), slab(0.3, 3.2, 5, stone, 2.85, 1.6, -2.5));
  g.add(slab(2.25, 3.2, 0.3, stone, -1.875, 1.6, -0.15), slab(2.25, 3.2, 0.3, stone, 1.875, 1.6, -0.15));
  g.add(slab(1.5, 0.9, 0.3, stone, 0, 2.75, -0.15));
  g.add(slab(6.4, 0.25, 5.4, trim, 0, 3.3, -2.5));
  g.add(slab(5.3, 0.04, 4.4, 0x6f2f2a, 0, 0.02, -2.5)); // a plain rug
  g.add(slab(1.2, 2.1, 0.1, 0x8f8878, 0, 1.05, -4.66)); // the mihrab niche
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xd9d4c6, false, true)); dome.position.set(0, 3.4, -2.5); g.add(dome);
  // short minaret with a few steps beside it
  const min = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 5.2, 8), mat(stone)); min.position.set(4.2, 2.6, -1.5); g.add(min);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.9, 8), mat(0xd9d4c6)); cap.position.set(4.2, 5.65, -1.5); g.add(cap);
  for (let i = 0; i < 4; i++) g.add(slab(1.2, 0.25, 0.5, trim, 4.2, 0.125 + i * 0.25, 1.4 - i * 0.5));
  g.add(slab(1.8, 0.16, 0.7, trim, 0, 0.08, 0.4)); // the step at the door
  // an old tap for wudu, beside the door
  g.add(slab(0.5, 0.7, 0.3, trim, -2.1, 0.35, 0.3));
  const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 5), mat(0x55585c)); tap.rotation.x = Math.PI / 2; tap.position.set(-2.1, 0.85, 0.2); g.add(tap);
  const inside = new THREE.PointLight(0xffd9a0, 7, 10, 1.5); inside.position.set(0, 2.2, -2.2); g.add(inside);
  return g;
}

/** The Faisal Mosque, far off: white tent-like shell and four slim minarets. It is never gilded. */
export function faisalMosque(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  const shell = new THREE.Mesh(new THREE.ConeGeometry(11, 9, 8), white); shell.position.y = 4.5; shell.rotation.y = Math.PI / 8; g.add(shell);
  for (const [x, z] of [[9, 9], [-9, 9], [9, -9], [-9, -9]]) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.6, 20, 4), white); m.position.set(x, 10, z); g.add(m);
  }
  g.scale.setScalar(scale);
  return g;
}

/** Nicholson's Obelisk (1868): plain tapered stone on a stepped base. */
export function obelisk(gilded = true): THREE.Group {
  const g = new THREE.Group();
  const stone = mat(0x9a958a, gilded);
  const base = new THREE.Mesh(new THREE.BoxGeometry(5, 2, 5), stone); base.position.y = 1;
  const base2 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2, 3.4), stone); base2.position.y = 3;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.5, 20, 4), stone); shaft.position.y = 14; shaft.rotation.y = Math.PI / 4;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(1.27, 2.2, 4), stone); tip.position.y = 25.1; tip.rotation.y = Math.PI / 4;
  g.add(base, base2, shaft, tip);
  return g;
}

/** A city seen from above: sector blocks, trees, a business district. Gildable. */
export function cityBelow(seed = 5): THREE.Group {
  const g = new THREE.Group();
  const r = rng(seed);
  const spots: { x: number; z: number; w: number; h: number; d: number; c: number }[] = [];
  for (let gx = -6; gx <= 6; gx++) for (let gz = 0; gz < 9; gz++) {
    const blue = gz >= 3 && gz <= 4 && Math.abs(gx) < 5; // Blue Area: the towers
    const n = blue ? 3 : 4;
    for (let i = 0; i < n; i++) {
      const h = blue ? 8 + r() * 16 : 1.5 + r() * 3;
      spots.push({ x: gx * 30 + (r() - 0.5) * 22, z: gz * 30 + (r() - 0.5) * 22, w: blue ? 5 + r() * 3 : 6 + r() * 7, h, d: blue ? 5 + r() * 3 : 6 + r() * 7, c: blue ? 0x9fb2bd : [0xd8d2c2, 0xc9c2b0, 0xe2ddd0][Math.floor(r() * 3)] });
    }
  }
  const bm = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
  gildable(bm);
  const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), bm, spots.length);
  const d = new THREE.Object3D(), c = new THREE.Color();
  spots.forEach((s, i) => { d.position.set(s.x, s.h / 2, s.z); d.scale.set(s.w, s.h, s.d); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); inst.setColorAt(i, c.set(s.c)); });
  inst.frustumCulled = false;
  g.add(inst);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(520, 360), mat(0x4f7a48, true)); ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.05, 120); g.add(ground);
  const trees: { x: number; y: number; z: number; s: number }[] = [];
  for (let i = 0; i < 260; i++) trees.push({ x: (r() - 0.5) * 400, y: 0, z: r() * 270 - 10, s: 1.6 + r() * 1.6 });
  g.add(forest(trees, 'broad', 0x3d6e3c, true));
  for (let gx = -6; gx <= 7; gx++) { const road = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 290), mat(0x6f716e, true)); road.rotation.x = -Math.PI / 2; road.position.set(gx * 30 - 15, 0.02, 125); g.add(road); }
  return g;
}

export function rocks(spots: { x: number; y: number; z: number; s: number }[], color = 0x7c7a72, gilded = false): THREE.InstancedMesh {
  const inst = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), mat(color, gilded), Math.max(1, spots.length));
  const d = new THREE.Object3D();
  spots.forEach((s, i) => { d.position.set(s.x, s.y + s.s * 0.3, s.z); d.rotation.set(i, i * 2, i * 3); d.scale.set(s.s, s.s * 0.7, s.s * 0.9); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); });
  inst.frustumCulled = false;
  return inst;
}
