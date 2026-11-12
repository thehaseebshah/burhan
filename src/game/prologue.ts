// Prologue: Gogera, 1857. Script: src/data/scripts/prologue.json (never hard-coded here).
import * as THREE from 'three';
import { gild, mat, glow } from '../core/engine';
import { audio } from '../core/audio';
import { Figure, Horse, type FigureOpts } from '../world/figures';
import { Actor, Fighter } from '../world/actors';
import { terrain, forest, campfire, tent, slab, obelisk, cityBelow, faisalMosque, water, rocks, charpoy, car, rng, vnoise } from '../world/props';
import { K } from '../core/engine';
import { BURHAN, type SceneFn, type TitleItem, type LineItem } from './director';

const KHARAL: FigureOpts = { scale: 1.02, outfit: 'kameez', top: 0xe9e3d3, bottom: 0xd9d2c0, head: 'mirror', clarity: 0.85, headgear: 'turban', gearColor: 0xf4f0e4 };
const NOORA: FigureOpts = { scale: 0.82, outfit: 'kameez', top: 0x8a5f3c, bottom: 0xd9d2c0, head: 'mirror', clarity: 0.55, headgear: 'turban', gearColor: 0xb5553c };
const riderLook = (i: number): FigureOpts => ({ outfit: 'kameez', top: [0x6a6f5a, 0x7a5a48, 0x5a5f6a, 0x8a7a5a][i % 4], bottom: 0xd2cab6, head: 'mirror', clarity: 0.5, headgear: 'turban', gearColor: [0xe8e2d2, 0x9a4a3a, 0x3f6b5a][i % 3], prop: 'spear' });
const SEPOY: FigureOpts = { outfit: 'uniform', top: 0x9a2a22, bottom: 0x2a2a30, head: 'dull', headgear: 'cap', gearColor: 0x1e1e22, prop: 'musket' };
const OFFICER: FigureOpts = { scale: 1.04, outfit: 'uniform', top: 0x7a1f1f, bottom: 0xd9d4c0, head: 'dull', headgear: 'cap', gearColor: 0x14141a, prop: 'stick' };
const BHISHTI: FigureOpts = { scale: 0.95, top: 0xb9a98a, bottom: 0xb9a98a, head: 'dull', headgear: 'turban', gearColor: 0x8a7a5a, prop: 'waterskin' };

// ------------------------------------------------------------------ Scene 1
const camp: SceneFn = async (ctx) => {
  const { engine, hud, world } = ctx;
  engine.setSky(0x070c18, 0x1a2634, 14, 80);
  engine.setLight(0x5a70a0, 0x241e16, 1.0, 0x9fb4e0, 0.75, [-0.5, 1, 0.2]);
  const h = (x: number, z: number) => {
    const far = THREE.MathUtils.clamp((Math.hypot(x, z) - 14) / 20, 0, 1);
    return (vnoise(x * 0.09, z * 0.09) - 0.5) * 1.2 * far - (x > 26 ? Math.min(1.6, (x - 26) * 0.3) : 0);
  };
  world.ground = h;
  world.bounds = { x0: -24, x1: 23, z0: -24, z1: 24 };
  ctx.add(terrain(150, 40, h, (x) => (x > 25 ? 0x5a5644 : 0x3c4a30)));
  ctx.add(water(70, 170, 0x2b4660), 62, -0.85, 0);
  // the camp's things: rope beds, spears stood together, water pots
  ctx.add(charpoy(), -4.5, 0, 6).rotation.y = 0.5; ctx.add(charpoy(), 4.5, 0, -2.6).rotation.y = -0.9;
  world.circles.push({ x: -4.5, z: 6, r: 1.1 }, { x: 4.5, z: -2.6, r: 1.1 });
  for (const [sx, sz] of [[3.2, 3.6], [-7.5, -1.2]]) { for (let i = 0; i < 5; i++) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 2.4, 6), mat(0x6b4a2a, false, true, K.wood)); sp.position.set(sx + Math.cos(i * 1.26) * 0.1, 1.18, sz + Math.sin(i * 1.26) * 0.1); sp.rotation.set(Math.sin(i * 1.26) * 0.09, 0, -Math.cos(i * 1.26) * 0.09); ctx.add(sp); } world.circles.push({ x: sx, z: sz, r: 0.4 }); }
  for (const [px, pz] of [[2.6, -3.4], [3.1, -3.0], [-8.6, 8.4]]) { const pot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), mat(0x8a4a2e, false, true, K.sand)); pot.scale.y = 0.9; ctx.add(pot, px, 0.17, pz); }
  { const st = []; for (let i = 0; i < 26; i++) { const a = i * 2.4, d2 = 16 + (i % 7) * 4; st.push({ x: Math.cos(a) * d2, y: h(Math.cos(a) * d2, Math.sin(a) * d2), z: Math.sin(a) * d2, s: 0.25 + (i % 4) * 0.14 }); } ctx.add(rocks(st, 0x5a5850)); }
  const r = rng(11);
  const trees = [];
  for (let i = 0; i < 46; i++) { const a = r() * 6.28, d = 27 + r() * 28; const x = Math.cos(a) * d, z = Math.sin(a) * d; if (x < 24) trees.push({ x, y: h(x, z), z, s: 1 + r() * 0.8 }); }
  ctx.add(forest(trees, 'broad', 0x24402a));

  const fires = [[0, 0], [-10, 7], [9, -6]].map(([x, z]) => { const f = campfire(); ctx.add(f.group, x, 0, z); world.circles.push({ x, z, r: 0.7 }); return f; });
  ctx.onUpdate((_, t) => fires.forEach((f) => f.update(t)));
  for (const [x, z] of [[-6, -3], [6, 5], [-13, 2], [-9, 12], [13, -2], [11, -11], [-3, 10]]) { ctx.add(tent(), x, 0, z); world.circles.push({ x, z, r: 1.5 }); }
  // men by the fires, spears across their knees
  [[1.8, -1.6, -0.8], [-1.9, -0.9, 1.1], [-0.6, 2.2, 2.9], [-11.5, 6, 1.4], [-9, 8.6, 3.2], [10.6, -5, -1.2], [8, -7.6, 0.3]].forEach(([x, z, yaw], i) => {
    const a = ctx.spawn(riderLook(i), x, z, yaw); a.fig.setPose('sitGround', true); world.circles.push({ x, z, r: 0.5 });
  });
  // the horse line
  const horseAt = (x: number, z: number, c: number) => { const hz = new Horse(c); ctx.add(hz.root, x, 0, z); hz.root.rotation.y = Math.PI / 2; world.circles.push({ x, z, r: 1.05 }); return hz; };
  horseAt(-9, -13, 0x5a3f2a); horseAt(-6, -13, 0x3a2a20); horseAt(0, -13, 0x6b4a32);
  const mare = { x: -3, z: -13 };
  horseAt(mare.x, mare.z, 0x9a7a55);
  const rail = slab(13, 0.08, 0.08, 0x4a3626, -4.5, 1.0, -14.3, false, K.wood); ctx.add(rail);
  for (const px of [-10.8, -4.5, 1.8]) ctx.add(slab(0.1, 1.1, 0.1, 0x4a3626, px, 0.55, -14.3, false, K.wood));
  const fodder = { x: 6, z: -10 };
  const pile = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.9, 7), mat(0xa89858)); ctx.add(pile, fodder.x, 0.45, fodder.z);
  world.circles.push({ x: fodder.x, z: fodder.z, r: 0.9 });

  const kharal = ctx.spawn(KHARAL, 1.7, 1.3, 2.6);
  const pl = ctx.setPlayer(NOORA, 0.4, 4.6, Math.PI);
  pl.control = false;
  audio.setAmbient({ noise: { freq: 420, gain: 0.05, wobble: 0.6 }, crickets: 1, fire: 1 });

  await ctx.card('c01');
  await ctx.card('c02');
  ctx.cam([4.5, 2.2, 7.5], [1, 1.2, 1.5]);
  await ctx.fade('#000', 0, 2);
  kharal.faceTo(pl.x, pl.z);
  await ctx.say('l01');

  // Movement and interaction, taught by a chore.
  ctx.follow(Math.PI * 0.1, 0.3);
  pl.control = true;
  hud.soft('Move: W A S D  ·  Look: mouse or arrows  ·  Run: Shift');
  hud.objective('Brush the mare');
  await ctx.interact(mare, 'Brush the mare', 2.6);
  pl.control = false; pl.faceTo(mare.x, mare.z);
  for (let i = 0; i < 3; i++) { pl.fig.swing(0.7); audio.step(); await ctx.wait(0.8); }
  pl.control = true;
  hud.objective('Fetch fodder for her');
  await ctx.interact(fodder, 'Take an armful of fodder', 2.4);
  hud.objective('Feed the mare');
  await ctx.interact(mare, 'Feed the mare', 2.6);
  pl.control = false; pl.faceTo(mare.x, mare.z); pl.fig.setPose('hold');
  await ctx.wait(1.8);
  pl.fig.setPose('stand'); pl.control = true;
  await ctx.reach(kharal.x, kharal.z + 1.2, 2.6, 'Go back to the Sardar');

  pl.control = false;
  pl.faceTo(kharal.x, kharal.z); kharal.faceTo(pl.x, pl.z);
  ctx.cam([kharal.x + 3.4, 1.9, kharal.z + 3.6], [kharal.x - 0.3, 1.25, kharal.z + 0.4], 1.6);
  await ctx.say('l02', 'l03', 'l04', 'l05', 'l06');
  ctx.cam([kharal.x + 1.2, 1.7, kharal.z + 3.2], [kharal.x, 1.4, kharal.z], 2.5);
  await ctx.say('l07', 'l08', 'l09');
  await ctx.wait(1);
  await ctx.fade('#000', 1, 1.8);
};

// ------------------------------------------------------------------ Scene 2
const jungle: SceneFn = async (ctx) => {
  const { engine, hud, world } = ctx;
  engine.setSky(0x7f9fb8, 0xd9d0a8, 30, 150);
  engine.setLight(0xcfd8e0, 0x4a4a30, 1.05, 0xfff0d0, 1.6, [0.5, 1, 0.4]);
  const h = (x: number, z: number) => (vnoise(x * 0.06, z * 0.06) - 0.5) * 1.4 - (x > 36 ? Math.min(2, (x - 36) * 0.3) : 0);
  world.ground = h;
  world.bounds = { x0: -26, x1: 26, z0: -62, z1: 50 };
  ctx.add(terrain(220, 44, h, (x, z) => (x > 35 ? 0x8a8462 : vnoise(x * 0.2, z * 0.2) > 0.55 ? 0x6f7a44 : 0x5c6f3c)));
  ctx.add(water(80, 240, 0x3a6278), 78, -1.55, 0);
  const r = rng(23);
  { const st = []; for (let i = 0; i < 50; i++) { const x = (r() - 0.5) * 90, z = (r() - 0.5) * 180; st.push({ x, y: h(x, z), z, s: 0.2 + r() * 0.5 }); } ctx.add(rocks(st, 0x8a8674)); }
  const trees = [], scrub = [];
  for (let i = 0; i < 150; i++) {
    const x = (r() - 0.5) * 100, z = (r() - 0.5) * 190 - 5;
    const open = Math.abs(x) < 9 && z > -22; // the ride in
    if (open || x > 34) continue;
    trees.push({ x, y: h(x, z), z, s: 0.9 + r() * 0.9 });
    if (Math.abs(x) < 27 && z > -64 && z < 52) world.circles.push({ x, z, r: 0.45 });
  }
  for (let i = 0; i < 80; i++) { const x = (r() - 0.5) * 70, z = (r() - 0.5) * 150; scrub.push({ x, y: h(x, z), z, s: 0.6 + r() * 0.8 }); }
  ctx.add(forest(trees, 'broad', 0x3f6b3a));
  ctx.add(forest(scrub, 'scrub', 0x5a7a40));

  const pl = ctx.setPlayer({ ...NOORA, prop: 'spear' }, 0, 42, Math.PI);
  const mare = new Horse(0x9a7a55); ctx.root.add(mare.root);
  pl.mount(mare);
  pl.camYaw = 0; pl.snapCamera(engine.camera);
  const combat = ctx.startCombat({ damage: 1, reach: 1.9, poise: 5 });

  const kharal = ctx.spawn(KHARAL, -3.5, 38, Math.PI);
  const kh = new Horse(0x2e2620); ctx.root.add(kh.root); kharal.mount(kh);
  const allies: Fighter[] = [];
  [[4, 40], [-7, 43], [7, 45]].forEach(([x, z], i) => {
    const f = ctx.spawnFighter(riderLook(i), x, z, { team: 'ally', poise: 9, moveSpeed: 5.2, reach: 2.3, passive: true, yaw: Math.PI });
    const hz = new Horse([0x5a3f2a, 0x3a2a20, 0x6b4a32][i]); ctx.root.add(hz.root); f.mount(hz); allies.push(f);
  });
  const foes = (n: number, z0: number, officer = false): Fighter[] => {
    const out: Fighter[] = [];
    for (let i = 0; i < n; i++) {
      const lead = officer && i === 0;
      out.push(ctx.spawnFighter(lead ? OFFICER : SEPOY, (i - (n - 1) / 2) * 3.2 + (r() - 0.5), z0 - r() * 5, { poise: lead ? 3 : 2, windup: 0.75, moveSpeed: 2.5, passive: true }));
    }
    return out;
  };
  const wave1 = foes(5, -6, true);
  audio.setAmbient({ noise: { freq: 700, gain: 0.07, wobble: 0.5 } });

  await ctx.fade('#000', 0, 1.6);
  hud.soft('Ride: W A S D  ·  Gallop: Shift');
  void kharal.goTo(-6, 14, 6);
  allies.forEach((a, i) => void a.goTo([5, -9, 9][i], 12 + i * 2, 6.5));
  await ctx.reach(0, 12, 9, "Ride with the Sardar's men against the Company column");

  [...wave1, ...allies].forEach((f) => { f.passive = false; f.stop(); });
  world.bounds.z0 = -22; // the fight stays where the column is
  hud.objective('Break the column');
  hud.prompt(hud.key('attack', 'Strike'));
  const done = (w: Fighter[]) => w.every((f) => f.defeated);
  const rout = (w: Fighter[]) => () => w.forEach((f) => combat.defeat(f));
  await ctx.until(() => wave1.some((f) => f.defeated) || combat.hitsTaken > 1, rout(wave1));
  hud.prompt(null);
  await ctx.until(() => done(wave1), rout(wave1));

  // On foot, where the trees close in.
  allies.forEach((a) => { a.passive = true; a.setSpeed(0); });
  hud.objective('The trees ahead are too thick to ride');
  await ctx.press('interact', 'Dismount');
  pl.dismount();
  pl.snapCamera(engine.camera);
  world.bounds.z0 = -62;
  const wave2 = foes(5, pl.z - 17);
  wave2.forEach((f) => { f.passive = false; });
  hud.objective('Hold them off, on foot');
  hud.prompt(`${hud.key('guard', 'Guard (hold)')} &nbsp; ${hud.key('dodge', 'Dodge')} &nbsp; ${hud.key('grapple', 'Throw')}`);
  await ctx.until(() => wave2.some((f) => f.defeated) || combat.controlledActs > 0, () => combat.defeat(wave2[0]));
  hud.prompt(null);

  // The water-carrier. He is not a fighter, and the controls will not strike him.
  const fx = Math.sin(pl.yaw), fz = Math.cos(pl.yaw);
  const side = pl.x > 0 ? 1 : -1;
  const bh = ctx.spawnFighter(BHISHTI, pl.x + side * 17, pl.z + fz * 2, { team: 'none', combatant: false, passive: true, radius: 0.5 });
  let refused = false, passed = false;
  combat.onRefuse = () => { refused = true; ctx.state.flags.heldTheBlow = true; };
  const cross = { x: pl.x + fx * 1.6, z: pl.z + fz * 1.6 }, away = { x: pl.x - side * 22, z: pl.z + 3 };
  void bh.goTo(cross.x, cross.z, 4.4).then(() => bh.goTo(away.x, away.z, 4.6)).then(() => { passed = true; bh.obj.visible = false; });
  // He runs across the rider's path, in reach: there is time to do the wrong thing.
  await ctx.until(() => refused || passed, () => { refused = true; });
  await ctx.sayLine(ctx.item<LineItem>('l01'), { noSkip: true, hold: 2.6 });
  await ctx.until(() => done(wave2), rout(wave2));
  hud.objective(null);
  await ctx.wait(1.6);
  ctx.endCombat();
  await ctx.fade('#000', 1, 1.6);
};

// ------------------------------------------------------------------ Scene 3
const asr: SceneFn = async (ctx) => {
  const { engine, hud, world } = ctx;
  engine.setSky(0x8fa6b0, 0xf2d6a2, 26, 120);
  engine.setLight(0xe6d6c0, 0x4a4030, 0.95, 0xffc27a, 1.7, [-0.9, 0.5, 0.25]);
  const h = (x: number, z: number) => (vnoise(x * 0.07, z * 0.07) - 0.5) * THREE.MathUtils.clamp((Math.hypot(x, z) - 10) / 14, 0, 1) * 1.6;
  world.ground = h;
  world.bounds = { x0: -19, x1: 19, z0: -19, z1: 19 };
  ctx.add(terrain(140, 36, h, (x, z) => (Math.hypot(x, z) < 9 ? 0x7a7f4a : 0x5f733c)));
  const r = rng(31);
  const trees = [];
  for (let i = 0; i < 110; i++) { const a = r() * 6.28, d = 23 + r() * 34; trees.push({ x: Math.cos(a) * d, y: h(Math.cos(a) * d, Math.sin(a) * d), z: Math.sin(a) * d, s: 1 + r() }); }
  ctx.add(forest(trees, 'broad', 0x496f38));

  const kharal = ctx.spawn(KHARAL, 0, 0, 0.4);
  const kh = new Horse(0x2e2620); ctx.add(kh.root, -1.6, 0, -3.2); kh.root.rotation.y = 1;
  const pl = ctx.setPlayer({ ...NOORA, prop: 'spear' }, 2.4, 6.5, Math.PI);
  pl.control = false;
  const combat = ctx.startCombat({ damage: 1, reach: 1.9, poise: 5 });
  combat.active = false;
  // His men make a ring around him, facing out.
  const ring: Fighter[] = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    ring.push(ctx.spawnFighter(riderLook(i), Math.sin(a) * 9, Math.cos(a) * 9, { team: 'ally', poise: 9999, passive: true, yaw: a }));
  }
  const rider = ring[0];
  audio.setAmbient({ noise: { freq: 800, gain: 0.05, wobble: 0.6 } });

  ctx.cam([4.2, 1.8, 6.8], [0, 1.3, 0]);
  await ctx.fade('#000', 0, 1.6);
  await ctx.say('l01');
  void rider.goTo(2.2, 2.6, 3);
  await ctx.say('l02');
  kharal.faceTo(rider.x, rider.z);
  await ctx.say('l03');
  // He turns to pray. The camera keeps its distance; nothing here is a prompt.
  ring.forEach((f, i) => { const a = (i / 7) * Math.PI * 2 + 0.3; void f.goTo(Math.sin(a) * 4.2, Math.cos(a) * 4.2, 2.6).then(() => { f.yaw = a; }); });
  kharal.yaw = -Math.PI / 2;
  ctx.cam([3, 4.5, 15], [0, 1, 0], 3);
  await ctx.wait(3.4);

  ctx.follow(0.2, 0.34);
  pl.control = true; combat.active = true;
  hud.objective('Hold the line');
  const spawnWave = (n: number): Fighter[] => {
    const out: Fighter[] = [], base = r() * 6.28;
    for (let i = 0; i < n; i++) { const a = base + (i - n / 2) * 0.3; out.push(ctx.spawnFighter(SEPOY, Math.sin(a) * 18.5, Math.cos(a) * 18.5, { poise: 2, windup: 0.7, moveSpeed: 2.7 })); }
    return out;
  };
  for (const [i, n] of [3, 4, 4].entries()) {
    const w = spawnWave(n);
    await ctx.until(() => w.every((f) => f.defeated), () => w.forEach((f) => combat.defeat(f)));
    if (i === 1) kharal.fig.setPose('kneel');
    await ctx.wait(1.4);
  }

  // Sujood. A single shot from the trees, off-screen. Nothing is shown.
  hud.objective(null);
  pl.control = false;
  ctx.endCombat();
  ctx.cam([2, 3.4, 17], [0, 0.6, 0], 3.5);
  await ctx.wait(1.5);
  kharal.fig.setPose('sujood');
  await ctx.wait(4.2);
  audio.shot();
  await ctx.wait(0.16);
  audio.cut();
  await ctx.fade('#fff', 1, 2.6);
  await ctx.wait(1.4);
  await ctx.card('c01', 'on-white', 7);
  await ctx.card('c02', 'on-white', 7);
  await ctx.wait(0.8);
};

// ------------------------------------------------------------------ Scene 4
const pass: SceneFn = async (ctx) => {
  const { engine, hud } = ctx;
  hud.fade('#fff', 1, 0);
  engine.setSky(0x6f9fc8, 0xe9e2c8, 60, 420);
  engine.setLight(0xdfe8f0, 0x55583a, 1.1, 0xfff4dc, 1.7, [0.7, 0.9, 0.5]);
  const base = (z: number) => z * 0.05;
  const h = (x: number, z: number) => base(z) + (x > 4 ? Math.min(26, (x - 4) * 0.55) + vnoise(x * 0.08, z * 0.08) * 3 * Math.min(1, (x - 4) / 10) : x < -4 ? -Math.min(18, (-x - 4) * 0.45) : 0);
  // The whole hillside can take the gold: it is the first glimpse of the Gilding.
  ctx.add(terrain(380, 64, h, (x, _z, _y, slope) => (Math.abs(x) < 3.6 ? 0x5a5c5e : slope > 1.3 ? 0x7c7868 : 0x587a45), true));
  const r = rng(41);
  const pines = [];
  for (let i = 0; i < 170; i++) { const x = 8 + r() * 70, z = (r() - 0.5) * 340; if (Math.hypot(x - 24, z + 5) > 9) pines.push({ x, y: h(x, z), z, s: 1 + r() * 0.9 }); }
  for (let i = 0; i < 60; i++) { const x = -8 - r() * 50, z = (r() - 0.5) * 340; pines.push({ x, y: h(x, z), z, s: 1 + r() * 0.9 }); }
  ctx.add(forest(pines, 'pine', 0x2f5a3a, true));
  const ob = { x: 24, z: -5 };
  ctx.add(obelisk(true), ob.x, h(ob.x, ob.z) - 0.5, ob.z);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(14, 12, 8), glow(0xfff6dc, 1.4)); ctx.add(sun, 150, 118, 300);

  // The bus
  const bus = new THREE.Group();
  const body = 0x2f6f8a, cream = 0xd8d2c0;
  bus.add(slab(2.6, 0.2, 9, 0x3a3f45, 0, 0.6, 0), slab(2.6, 0.15, 9, cream, 0, 2.78, 0), slab(2.6, 2.1, 0.1, body, 0, 1.7, -4.5));
  for (const sx of [-1.3, 1.3]) {
    bus.add(slab(0.1, 1.0, 9, body, sx, 1.2, 0), slab(0.1, 0.3, 9, cream, sx, 2.56, 0));
    for (let z = -4.5; z <= 4.5; z += 1.5) bus.add(slab(0.1, 0.72, 0.12, cream, sx, 2.05, z));
  }
  for (const [x, z] of [[-1.25, -3], [1.25, -3], [-1.25, 3], [1.25, 3]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 10), mat(0x1c1c1e)); w.rotation.z = Math.PI / 2; w.position.set(x, 0.5, z); bus.add(w); }
  for (let z = -3; z <= 3.1; z += 1.2) for (const x of [-0.75, 0.75]) bus.add(slab(0.95, 0.45, 0.5, 0x6a4a3a, x, 0.93, z), slab(0.95, 0.55, 0.1, 0x5a4034, x, 1.4, z - 0.28));
  { const glassM = new THREE.MeshStandardMaterial({ color: 0x9fb4c0, metalness: 0.9, roughness: 0.05, transparent: true, opacity: 0.22 }); for (const sx of [-1.31, 1.31]) { const gl = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.72, 9), glassM); gl.position.set(sx, 2.05, 0); bus.add(gl); } }
  bus.add(slab(2.6, 2.1, 0.1, body, 0, 1.7, 4.5, false, K.metal), slab(2.2, 0.9, 0.04, 0x0c1014, 0, 2.05, 4.56, false, K.metal), slab(2.7, 0.25, 0.3, 0x1c1c1e, 0, 0.55, 4.6, false, K.metal), slab(2.7, 0.25, 0.3, 0x1c1c1e, 0, 0.55, -4.6, false, K.metal));
  ctx.root.add(bus);
  // other traffic on the pass
  const traffic = [0x8a8f96, 0xd8d4c8, 0x3a4a6a, 0x7a1f1f, 0xb9bcc0].map((c, i) => { const cr = car(c); ctx.root.add(cr); return { cr, z: -40 + i * 58, down: i % 2 === 0 }; });
  const seat = (o: FigureOpts, x: number, z: number, yaw = 0) => { const f = new Figure(o); f.root.position.set(x, 0.72, z); f.root.rotation.y = yaw; f.setPose('sit', true); bus.add(f.root); return f; };
  const burhan = seat({ ...BURHAN, clarity: ctx.state.mirror, prop: 'phone' }, 0.78, 0.55);
  burhan.setPose('sitHold', true); // the phone, in his hand
  const boy = seat({ scale: 0.62, top: 0xd9a23a, bottom: 0x3a4a6a, head: 'dull' }, -0.5, 0.75, 0.3);
  const father = seat({ top: 0xcfc8b8, bottom: 0xcfc8b8, head: 'dull', headgear: 'cap', gearColor: 0xf0ece0 }, -0.98, 0.55);
  const others = [seat({ top: 0x5a6a5a, head: 'dull' }, 0.78, -1.85), seat({ top: 0x7a5a4a, head: 'dull', headgear: 'cap' }, -0.78, -3.05), seat({ top: 0x4a4a5a, head: 'dull' }, 0.78, 3.0)];
  const figs = [burhan, boy, father, ...others];

  let z = -52;
  let inside = false;
  const lp = new THREE.Vector3(), ll = new THREE.Vector3(), cp = new THREE.Vector3(), cl = new THREE.Vector3();
  let lookWorld: THREE.Vector3 | null = null;
  let snap = true;
  const rig = (p: [number, number, number], l: [number, number, number] | THREE.Vector3, cut = false) => {
    lp.set(...p);
    if (l instanceof THREE.Vector3) lookWorld = l; else { lookWorld = null; ll.set(...l); }
    snap = snap || cut;
  };
  ctx.onUpdate((dt) => {
    z += dt * 4;
    for (const t of traffic) { t.z += dt * (t.down ? -11 : 7.5); if (t.z < -150) t.z += 330; if (t.z > 180) t.z -= 330; t.cr.position.set(t.down ? -1.9 : 1.75, base(t.z) + 0.02, t.z); t.cr.rotation.set(t.down ? 0.05 : -0.05, t.down ? Math.PI : 0, 0); if (!t.down && Math.abs(t.z - z) < 14) t.z = z + 14 + Math.random() * 40; }
    bus.position.set(0, base(z), z);
    bus.rotation.x = -0.05;
    figs.forEach((f) => f.update(dt));
    if (!inside) return;
    // The camera rides with the bus: ease in the bus's own space, so it never trails behind.
    const wantLook = lookWorld ? lookWorld.clone().sub(bus.position) : ll;
    if (snap) { cp.copy(lp); cl.copy(wantLook); snap = false; } else { cp.lerp(lp, 1 - Math.exp(-dt * 2.2)); cl.lerp(wantLook, 1 - Math.exp(-dt * 2.2)); }
    engine.camera.position.copy(bus.position).add(cp);
    engine.camera.lookAt(cl.clone().add(bus.position));
  });
  audio.setAmbient({ noise: { freq: 140, q: 0.8, gain: 0.22, wobble: 0.2 } });

  // The white fades into the glare of the sun.
  ctx.cam([-5.2, base(-66) + 1.5, -66], [16, 16, 10]);
  await ctx.fade('#fff', 0, 3.4);
  await ctx.wait(1.6);
  inside = true;
  rig([-0.85, 1.95, -1.7], [0.9, 1.5, 1.2], true);
  await ctx.wait(1.2);
  hud.caption('In his earbuds: an English podcast');
  await ctx.say('l01');
  hud.caption(null);

  // Nicholson's Obelisk catches the sun. For one second the whole hillside flashes gold.
  const obMid = new THREE.Vector3(ob.x, h(ob.x, ob.z) + 9, ob.z);
  z = ob.z - 40;
  rig([1.2, 2.0, 0.45], obMid, true); // out of his window
  await ctx.wait(2.2);
  audio.flash();
  await ctx.tween(0.12, (k) => { gild.uGild.value = k; });
  await ctx.wait(0.76);
  await ctx.tween(0.12, (k) => { gild.uGild.value = 1 - k; });
  gild.uGild.value = 0;
  await ctx.wait(1.2);
  rig([0.7, 1.7, 2.6], [-0.6, 1.25, 0.7], true);
  await ctx.say('l02');
  rig([-0.5, 1.7, 2.5], [0.78, 1.5, 0.55], true);
  await ctx.say('l03');
  audio.chime(0.9); await ctx.wait(0.5); audio.chime(0.9);
  hud.phone('Ammi', 'امی', 'INCOMING CALL');
  await ctx.wait(1.2);
  hud.phone('Ammi', 'امی', 'CALL');
  await ctx.say('l04', 'l05', 'l06');
  // He looks out of the window. A beat.
  rig([-0.15, 1.85, -0.7], [5, 2.0, 2.4], false);
  await ctx.wait(2.6);
  await ctx.say('l07');
  rig([-0.5, 1.7, 2.5], [0.78, 1.5, 0.55], false);
  await ctx.say('l08', 'l09');
  hud.phone(null);
  await ctx.wait(0.8);
  await ctx.fade('#fff', 1, 1.2);

  // The bus crests the pass. Islamabad opens below.
  inside = false;
  const X = 3000;
  engine.setSky(0x6f9fc8, 0xdfe6da, 90, 700);
  const hr = (_x: number, zz: number) => THREE.MathUtils.clamp(34 - Math.max(0, zz + 12) * 0.95, -0.3, 40) + vnoise(_x * 0.05, zz * 0.05) * 2.5;
  ctx.add(terrain(420, 40, hr, (_x, zz) => (zz < 26 ? 0x4f7446 : 0x56804c), false, X, 0));
  ctx.add(cityBelow(7), X, 0, 46);
  ctx.add(faisalMosque(2.6), X - 60, 0, 190);
  for (const [dx, dz, s] of [[-250, 150, 1.7], [-330, 230, 2.2], [240, 110, 1.6], [320, 220, 2.2]]) { const m = new THREE.Mesh(new THREE.ConeGeometry(70, 46, 7), mat(0x3f6a46)); m.scale.setScalar(s); ctx.add(m, X + dx, 16 * s, dz); }
  ctx.cam([X + 6, 36.5, -24], [X - 10, 30, 30]);
  await ctx.fade('#fff', 0, 2);
  ctx.cam([X - 4, 52, -16], [X - 30, 4, 150], 7);
  await ctx.wait(3.2);
  const t = ctx.scene.items.find((i): i is TitleItem => i.type === 'title')!;
  const [ur, en] = t.text.split(' — ');
  hud.title(ur, en); hud.showTitle();
  audio.daf();
  await ctx.hold(7);
  await ctx.fade('#000', 1, 2.2);
  hud.clearTitle();
};

export const scenes: Record<string, SceneFn> = {
  'prologue.s01': camp,
  'prologue.s02': jungle,
  'prologue.s03': asr,
  'prologue.s04': pass,
};
