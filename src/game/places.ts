// Places and people that return across chapter 1.
import * as THREE from 'three';
import { mat } from '../core/engine';
import type { FigureOpts } from '../world/figures';
import { terrain, forest, smallMosque, lamp, slab, rocks, charpoy, rng, vnoise } from '../world/props';
import { surface, K } from '../core/engine';
import type { Ctx } from './director';

export const SAIN: FigureOpts = { scale: 0.97, top: 0x8c9186, bottom: 0x8c9186, head: 'mirror', clarity: 0.78, headgear: 'cap', gearColor: 0xe8e4d8, prop: 'broom' };
export const BILAL: FigureOpts = { scale: 0.8, top: 0xa8432f, bottom: 0x2f3440, head: 'mirror', clarity: 0.4 };
export const AZAD: FigureOpts = { top: 0xd9822b, bottom: 0x2b3a55, head: 'dull' };
export const FARAZ: FigureOpts = { scale: 1.03, top: 0x18181c, bottom: 0x18181c, head: 'dull', outfit: 'coat' };
export const MODERATOR: FigureOpts = { top: 0x7d8086, bottom: 0x6d7076, head: 'dull', outfit: 'coat' };
export const REHAN: FigureOpts = { top: 0x3a4a6a, bottom: 0x24262c, head: 'dull', outfit: 'coat' };
export const DEALER: FigureOpts = { scale: 1.06, top: 0x24262a, bottom: 0x1c1d20, head: 'dull', outfit: 'western' };
// Historical guides. How they appear is a pending switch: see spawnRevered().
export const IQBAL: FigureOpts = { top: 0x34343a, bottom: 0x2c2c30, outfit: 'coat', head: 'mirror', clarity: 0.82, headgear: 'furcap', gearColor: 0x2a2420, prop: 'cane' };
export const MUJADDID: FigureOpts = { top: 0xf2efe6, bottom: 0xf2efe6, robe: true, head: 'mirror', clarity: 0.96, headgear: 'turban', gearColor: 0xffffff };

/** The small stone mosque in the Margalla foothills, with the Shah Allah Ditta caves to the west. */
export function mosqueHill(ctx: Ctx, time: 'night' | 'dawn') {
  const { engine, world } = ctx;
  if (time === 'night') {
    engine.setSky(0x05080f, 0x121a26, 12, 95);
    engine.setLight(0x46587c, 0x14120e, 0.95, 0x9fb3d8, 0.6, [-0.4, 1, 0.5]);
  } else {
    engine.setSky(0x4a6090, 0xf0c8a0, 30, 220);
    engine.setLight(0xbfc8d8, 0x3a3428, 0.95, 0xffcf9a, 1.2, [0.9, 0.35, 0.3]);
  }
  const h = (x: number, z: number) => {
    const far = THREE.MathUtils.clamp((Math.hypot(x, z - 1) - 11) / 16, 0, 1);
    const cliff = x < -41 ? Math.min(16, (-41 - x) * 2.2) : 0;
    return (vnoise(x * 0.06, z * 0.06) - 0.5) * 3 * far + cliff;
  };
  world.ground = h;
  world.bounds = { x0: -40.5, x1: 36, z0: -24, z1: 38 };
  const night = time === 'night';
  ctx.add(terrain(190, 44, h, (x, z, _y, slope) => (x < -41 || slope > 2 ? (night ? 0x4a4640 : 0x7d766a) : Math.abs(x) < 7.4 && z > -10 && z < 9.4 ? 0x8a8478 : night ? 0x2c3c2c : 0x54703f)));
  ctx.add(slab(14, 0.1, 13, 0x9a9588, 0, -0.03, 2.5, false, K.tile));
  // a low wall around the courtyard, open toward the path
  for (const [w, d, x, z] of [[0.35, 13, -7.1, 2.5], [0.35, 13, 7.1, 2.5], [5, 0.35, -4.6, 9.1], [5, 0.35, 4.6, 9.1]]) { ctx.add(slab(w, 0.7, d, 0xa39c8c, x, 0.35, z, false, K.brick)); world.rects.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 }); }
  ctx.add(smallMosque(), 0, 0, -4);
  world.rects.push({ x0: -3.2, x1: 3.2, z0: -9.2, z1: -3.9 }, { x0: 3.5, x1: 4.9, z0: -4.4, z1: -2.2 });
  world.circles.push({ x: 4.2, z: -5.5, r: 0.95 });
  ctx.add(lamp(0xffc87a, night ? 9 : 2, 20), 1.9, 2.6, -3.35);
  ctx.add(slab(0.03, 0.04, 0.5, 0x1a1612, 1.9, 2.78, -3.6, false, K.metal));
  // a bench, a dented kettle and two cups
  ctx.add(charpoy(2.6, 0.9, 0.45), 5.6, 0, 3);
  const scatter = [];
  for (let i = 0; i < 40; i++) { const x = (Math.sin(i * 12.9) * 0.5) * 120, z = (Math.cos(i * 7.7) * 0.5) * 100; if (Math.hypot(x, z - 1) > 13 && x > -39) scatter.push({ x, y: h(x, z), z, s: 0.3 + (i % 5) * 0.16 }); }
  ctx.add(rocks(scatter, night ? 0x5a5650 : 0x8a8478));
  const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.26, 7), mat(0x55585c)); ctx.add(kettle, 5.6, 0.58, 3);
  for (const dx of [-0.35, 0.35]) { const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.08, 6), mat(0xd8d2c2)); ctx.add(cup, 5.6 + dx, 0.49, 3.1); }
  world.rects.push({ x0: 4.3, x1: 6.9, z0: 2.55, z1: 3.45 });
  const r = rng(61);
  type Spot = { x: number; y: number; z: number; s: number };
  const pines: Spot[] = [], broad: Spot[] = [];
  for (let i = 0; i < 90; i++) { const x = (r() - 0.5) * 150, z = (r() - 0.5) * 130; if (Math.hypot(x, z - 1) < 15 || x < -39) continue; (i % 4 ? pines : broad).push({ x, y: h(x, z), z, s: 0.9 + r() }); if (x > -40 && x < 36 && z > -24 && z < 38) world.circles.push({ x, z, r: 0.45 }); }
  ctx.add(forest(pines, 'pine', night ? 0x1c3526 : 0x2f5a3a));
  ctx.add(forest(broad, 'broad', night ? 0x1f3a24 : 0x3f6b3a));
  // the cave mouth, with old roots gripping the rock
  const cave = { x: -39.2, z: 6 };
  const mouth = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, 0.5, 9, 1, false, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x020202 }));
  mouth.rotation.z = Math.PI / 2;
  ctx.add(mouth, -41.1, 0, cave.z);
  const stones = [];
  for (let i = 0; i < 16; i++) stones.push({ x: -41.4 - r() * 1.5, y: r() * 5, z: cave.z + (r() - 0.5) * 9, s: 0.9 + r() * 1.3 });
  ctx.add(rocks(stones, night ? 0x4a4640 : 0x7d766a));
  for (let i = 0; i < 6; i++) { const root = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 4 + r() * 2, 5), mat(0x4a3626)); root.rotation.set(0, 0, 0.25 + r() * 0.3); ctx.add(root, -41.2 - i * 0.05, 2.6, cave.z - 3 + i * 1.2); }
  const glowIn = lamp(0xffb46a, 5, 12); ctx.add(glowIn, -40.4, 1.3, cave.z);
  return { cave, door: { x: 0, z: -3.1 }, bench: { x: 5.6, z: 3 }, h };
}

/** Inside the cave: dark, cool, a wall that can begin to glow. Built far from everything else. */
export function caveInside(ctx: Ctx, cx = 600) {
  const rock = surface(new THREE.MeshStandardMaterial({ color: 0x4a423a, roughness: 0.95, side: THREE.BackSide }), K.rock);
  const dg = new THREE.IcosahedronGeometry(6.5, 4);
  { const p = dg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + (vnoise(x * 0.9 + 2, z * 0.9 + y) - 0.5) * 0.22 + (vnoise(x * 2.7, y * 2.7 + z * 2) - 0.5) * 0.08; p.setXYZ(i, x * k, y * k, z * k); } dg.computeVertexNormals(); }
  const dome = new THREE.Mesh(dg, rock); dome.userData.noShadow = true; dome.scale.set(1, 0.62, 1.3);
  ctx.add(dome, cx, 0.6, 0);
  ctx.add(slab(14, 0.2, 18, 0x3a332c, cx, -0.1, 0, false, K.rock));
  const wallMat = new THREE.MeshBasicMaterial({ color: 0x000000, fog: false });
  const wall = new THREE.Mesh(new THREE.CircleGeometry(2.6, 20), wallMat); ctx.add(wall, cx, 1.7, -6.9);
  const light = new THREE.PointLight(0xffe2b8, 0.6, 14, 1.4); ctx.add(light, cx, 1.8, -5.4);
  const dim = new THREE.PointLight(0x6a7a9a, 2.2, 12, 1.6); ctx.add(dim, cx, 2.2, 4);
  return {
    cx,
    /** 0 = dark stone, 1 = the wall is light */
    glow(v: number) { wallMat.color.setRGB(1.0 * v, 0.93 * v, 0.78 * v); light.intensity = 0.6 + v * 16; },
    dark(v: number) { dim.intensity = 2.2 * (1 - v); },
  };
}
