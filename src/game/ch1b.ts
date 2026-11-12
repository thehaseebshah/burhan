// Chapter 1: The Forgetting, scenes 7-12. Script: src/data/scripts/ch1.json.
import * as THREE from 'three';
import { mat, K } from '../core/engine';
import { audio } from '../core/audio';
import { makeCrowd } from '../world/figures';
import type { Actor } from '../world/actors';
import { slab, lamp, forest, rng } from '../world/props';
import { BURHAN, type Ctx, type SceneFn, type TitleItem } from './director';
import { IQBAL, MUJADDID, SAIN, mosqueHill, caveInside } from './places';

const AZAN_CAPTION = "The Fajr azan, in Sain's old, cracked voice. (Placeholder: caption only until it is recorded.)";
const visionName = (ctx: Ctx) => ctx.scene.title.replace(/\s*\(vision\)\s*$/, '');

// ------------------------------------------------------------------ Scene 7: The stairs
const stairs: SceneFn = async (ctx) => {
  const { engine, hud } = ctx;
  engine.setSky(0x06070a, 0x0c0e12, 10, 40);
  engine.setLight(0x343840, 0x0c0c0e, 0.5, 0xffffff, 0.1);
  ctx.addAll(slab(12, 0.2, 5, 0x44474c, 0, -0.1, 0, false, K.tile), slab(12, 7, 0.2, 0x8a8d86, 0, 3.5, -1.1, false, K.plaster), slab(0.2, 7, 5, 0x8a8d86, -3, 3.5, 0, false, K.plaster));
  ctx.addAll(slab(1.3, 1.5, 0.08, 0x0c1420, -1.2, 2.6, -0.98, false, K.metal), slab(1.5, 0.08, 0.16, 0xcfc8ba, -1.2, 1.82, -0.95), slab(0.06, 1.5, 0.1, 0xcfc8ba, -1.2, 2.6, -0.96));
  for (let i = 0; i < 10; i++) ctx.add(slab(0.36, 0.2 * (i + 1), 2, 0x6a6d72, 1 + i * 0.36, 0.1 * (i + 1), 0));
  ctx.add(slab(0.06, 0.9, 3.8, 0x2e3034, 2.6, 1.9, 1.05)).rotation.z = 0; // a plain rail
  ctx.add(lamp(0xfff0d0, 7, 10), 0.6, 2.9, 0.4);
  const pl = ctx.setPlayer({ ...BURHAN, prop: 'phone' }, -0.6, 0.2, Math.PI / 2);
  pl.control = false; pl.fig.setPose('hold', true);
  audio.setAmbient({ noise: { freq: 220, gain: 0.03, wobble: 0.3 } });

  ctx.cam([-0.2, 1.7, 4.6], [0.2, 1.3, 0]);
  await ctx.fade('#000', 0, 1.8);
  hud.phone('Ammi', 'امی', 'CALL');
  await ctx.say('l01', 'l02');
  // A pause. This time it's true, and he doesn't know how to say the rest.
  await ctx.wait(2.8);
  await ctx.say('l03', 'l04');
  hud.phone(null);
  pl.fig.setProp('none');
  // He sits on the stairs and his shoulders shake.
  pl.floating = true;
  await ctx.tween(1.4, (k) => { pl.pos.set(-0.6 + k * 2.32, k * 0.2, 0.2); });
  pl.yaw = -Math.PI / 2;
  pl.fig.setPose('sit');
  ctx.cam([-1.4, 1.5, 3.4], [1.5, 1.1, 0.1], 7);
  await ctx.wait(1.2);
  pl.fig.shake(7);
  // For the first time his smooth face catches the stairwell light, faintly.
  ctx.mirror(0.36);
  await ctx.wait(7.5);
  await ctx.fade('#000', 1, 2.4);
};

// ------------------------------------------------------------------ Scene 8: The cave
const cave: SceneFn = async (ctx) => {
  const { engine, hud, input } = ctx;
  const place = mosqueHill(ctx, 'night');
  const sain = ctx.spawn(SAIN, -1.4, 2.2, 0.5);
  sain.fig.sweep(true);
  const pl = ctx.setPlayer(BURHAN, 13, 25, -2.6);
  pl.camYaw = 0.5; pl.snapCamera(engine.camera);
  audio.setAmbient({ noise: { freq: 360, gain: 0.04, wobble: 0.6 }, crickets: 0.6 });

  await ctx.fade('#000', 0, 2);
  await ctx.reach(sain.x, sain.z, 3.4, 'Go to the small mosque');
  // Sain is sweeping, as if he expected him.
  sain.fig.sweep(false); sain.faceTo(pl.x, pl.z);
  await ctx.say('l01');
  // They walk to the caves.
  hud.objective('Walk with Sain');
  const path: [number, number][] = [[-11, 5], [-24, 7.5], [place.cave.x + 3.4, place.cave.z + 0.8]];
  if (ctx.auto) { sain.place(path[2][0], path[2][1]); pl.place(path[2][0] + 2, path[2][1] + 1); }
  else for (const [wx, wz] of path) {
    while (sain.dist(wx, wz) > 0.6) {
      // He waits only when Burhan falls behind; if Burhan walks ahead, Sain keeps coming.
      if (pl.dist(wx, wz) - sain.dist(wx, wz) > 7.5) { if (sain.going) sain.stop(); sain.faceTo(pl.x, pl.z); }
      else if (!sain.going) void sain.goTo(wx, wz, 2.3, 0.5);
      await ctx.frame();
    }
  }
  sain.stop();
  await ctx.until(() => pl.dist(place.cave.x, place.cave.z) < 7);
  hud.objective(null);
  pl.control = false;
  sain.faceTo(pl.x, pl.z); pl.faceTo(sain.x, sain.z);
  ctx.cam([place.cave.x + 8.5, 2.1, place.cave.z + 4.5], [place.cave.x - 1, 1.5, place.cave.z], 2);
  await ctx.say('l02', 'l03', 'l04');
  void sain.goTo(-28, 10, 1.6);
  await ctx.go(pl, place.cave.x - 0.6, place.cave.z, 1.3);
  await ctx.fade('#000', 1, 2);

  // Khalwat. Inside it is dark and cool. Silence is a sound of its own.
  const inside = caveInside(ctx);
  pl.stop(); pl.floating = true;
  pl.pos.set(inside.cx, 0, 1.2); pl.yaw = Math.PI; pl.fig.setPose('sitGround', true);
  engine.setSky(0x020203, 0x020203, 5, 30);
  engine.setLight(0x24282e, 0x050505, 0.4, 0xffffff, 0);
  audio.setAmbient(null);
  ctx.cam([inside.cx + 1.7, 1.45, 5.4], [inside.cx - 0.2, 1.2, -6]);
  await ctx.fade('#000', 0, 2.6);

  // Hosh dar dam: awareness in every breath. Breathe in on Allah, out on Hu.
  hud.prompt(`${hud.key('remember', 'Breathe in on Allah: hold.  Breathe out on Hu: let go.')}`);
  const IN = 4, OUT = 4, NEED = 5;
  let good = 0, inward = true, t = 0, ok = 0, total = 0, glow = 0;
  audio.breath(true, IN);
  while (good < NEED) {
    const dt = await ctx.frame();
    if (ctx.auto) { good = NEED; break; }
    t += dt; total += dt;
    if (input.held('remember') === inward) ok += dt;
    const dur = inward ? IN : OUT, k = Math.min(1, t / dur);
    hud.ring(inward ? 0.3 + 0.7 * k : 1 - 0.7 * k, inward ? 'اللہ' : 'ہُو', inward ? 'breathe in' : 'breathe out');
    glow += (good / NEED * 0.45 - glow) * Math.min(1, dt);
    inside.glow(glow); inside.dark(good / NEED);
    if (t >= dur) {
      if (!inward) { if (ok / total > 0.7) { good++; if (good === 1) hud.prompt(null); } ok = 0; total = 0; }
      inward = !inward; t = 0;
      audio.breath(inward, inward ? IN : OUT);
    }
  }
  hud.ring(null); hud.prompt(null);
  ctx.state.pillars.heart = Math.max(ctx.state.pillars.heart, 0.4);
  ctx.mirror(0.42);
  // The dark deepens. The cave wall begins to glow. The Silsila opens.
  ctx.cam([inside.cx + 0.4, 1.35, 3.6], [inside.cx, 1.5, -6], 6);
  await ctx.tween(5, (k) => { inside.glow(0.45 + k * 0.55); inside.dark(1); });
  await ctx.fade('#fff3d6', 1, 3);
  await ctx.wait(0.8);
};

// ------------------------------------------------------------------ Scene 9: Sirhind, 1934
const sirhind: SceneFn = async (ctx) => {
  const { engine, hud, world } = ctx;
  hud.fade('#fff3d6', 1, 0);
  engine.setSky(0x0a0e1e, 0x2a2030, 16, 85);
  engine.setLight(0x4c4c6c, 0x1a120c, 0.6, 0xffb878, 0.35, [0.3, 1, 0.6]);
  world.ground = (x, z) => (Math.abs(x) < 6.6 ? THREE.MathUtils.clamp((-6.8 - z) / 1.4, 0, 1) * 0.6 : 0);
  world.bounds = { x0: -11, x1: 11, z0: -17, z1: 14 };
  // Mughal miniature colour: red sandstone, cream, lapis. The light is amber, never the Gilding's gold.
  ctx.add(slab(60, 0.2, 60, 0x9a7a5e, 0, -0.1, 0, false, K.tile));
  ctx.add(slab(13.2, 0.6, 13, 0xb5553c, 0, 0.3, -14.7));
  for (let i = 0; i < 3; i++) ctx.add(slab(13.2, 0.2, 0.47, 0xa94e36, 0, 0.1 + i * 0.2, -7.0 - i * 0.47));
  for (const [x, z] of [[-3, -11.5], [3, -11.5], [-3, -17.5], [3, -17.5]]) ctx.add(slab(0.5, 4, 0.5, 0xe9e0cc, x, 2.6, z));
  ctx.add(slab(7.4, 0.4, 7.4, 0xe9e0cc, 0, 4.8, -14.5));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3, 12, 7, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xf2ead8, false, true)); ctx.add(dome, 0, 5, -14.5);
  // The grave: a plain cenotaph under a green cloth. Nothing is written on it.
  ctx.addAll(slab(1.1, 0.5, 2.3, 0xefe8da, 0, 0.85, -14.5), slab(1.2, 0.06, 2.4, 0x2f6b4a, 0, 1.13, -14.5));
  world.rects.push({ x0: -0.9, x1: 0.9, z0: -16, z1: -13 });
  ctx.addAll(slab(0.5, 3, 34, 0xb5553c, -12, 1.5, -2), slab(0.5, 3, 34, 0xb5553c, 12, 1.5, -2), slab(24, 3, 0.5, 0xb5553c, 0, 1.5, -19));
  const lamps: THREE.PointLight[] = [];
  for (let z = 10; z >= -6; z -= 4) for (const x of [-2.6, 2.6]) { ctx.add(slab(0.12, 1.1, 0.12, 0x3a2616, x, 0.55, z)); const l = lamp(0xffa850, 5, 9); ctx.add(l, x, 1.25, z); lamps.push(l.children[1] as THREE.PointLight); }
  for (const x of [-1.6, 1.6]) { const l = lamp(0xffa850, 6, 9); ctx.add(l, x, 1.7, -12.4); lamps.push(l.children[1] as THREE.PointLight); }
  ctx.add(forest([{ x: -8, y: 0, z: 4, s: 1.3 }, { x: 8.5, y: 0, z: -2, s: 1.5 }, { x: -9, y: 0, z: -9, s: 1.2 }], 'broad', 0x2f4f3a));
  const iqbal = ctx.spawnRevered(IQBAL, 1.5, -12.3, Math.PI - 0.5);
  const spot = { x: 1.5, z: -12.3 };
  const pl = ctx.setPlayer(BURHAN, 0, 12, Math.PI);
  pl.camPitch = 0.22; pl.snapCamera(engine.camera);
  audio.setAmbient({ noise: { freq: 300, gain: 0.03, wobble: 0.5 }, crickets: 0.3 });

  await ctx.fade('#fff3d6', 0, 3.5);
  hud.soft(visionName(ctx));
  hud.objective('Walk to the grave');
  await ctx.say('l01');
  await ctx.reach(spot.x, spot.z + 2.5, 3.6);
  hud.objective(null);
  pl.control = false;
  // He turns, sensing someone.
  iqbal?.faceTo(pl.x, pl.z); pl.faceTo(spot.x, spot.z);
  ctx.cam([pl.x + 3.2, 2.3, pl.z + 2.6], [spot.x - 0.4, 1.9, spot.z], 2);
  await ctx.say('l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08');
  iqbal?.faceTo(spot.x - 20, spot.z + 4); // looking west, past Burhan
  await ctx.say('l09');
  iqbal?.faceTo(pl.x, pl.z);
  await ctx.say('l10');
  // He touches the edge of the grave, and the lamplight deepens.
  if (iqbal) { await ctx.go(iqbal, 1.25, -13.6, 1); iqbal.faceTo(0, -14.5); iqbal.fig.setPose('hold'); }
  hud.fade('#2a1206', 1, 4);
  await ctx.tween(4, (k) => lamps.forEach((l) => { l.intensity = 5 + k * 14; }));
};

// ------------------------------------------------------------------ Scene 10: The House of Debate
const debateHouse: SceneFn = async (ctx) => {
  const { engine, hud, world, input } = ctx;
  engine.setSky(0x1a1420, 0x4a2c28, 20, 70);
  engine.setLight(0x8a6a5a, 0x2a1810, 0.85, 0xffc890, 0.5, [0.2, 1, 0.5]);
  world.bounds = { x0: -14.5, x1: 14.5, z0: -9.4, z1: 15 };
  ctx.addAll(slab(40, 0.2, 40, 0xa8523a, 0, -0.1, 0, false, K.tile), slab(40, 0.4, 40, 0x7a3626, 0, 7.2, 0, false, K.brick));
  for (const rad of [4.6, 6.5, 8.4]) { const ring = new THREE.Mesh(new THREE.RingGeometry(rad - 0.75, rad + 0.75, 48).rotateX(-Math.PI / 2), mat([0x6a1f24, 0x1f3a5a, 0x2f5a44][Math.round(rad) % 3], false, true, K.cloth)); ctx.add(ring, 0, 0.012, 1.5); }
  for (let a = 0; a < 12; a++) { const x = Math.sin((a / 12) * 6.283) * 13.5, z = Math.cos((a / 12) * 6.283) * 13.5; if (Math.abs(x) > 2 || z < 0) { ctx.add(slab(0.9, 7, 0.9, 0xb5553c, x, 3.5, z)); world.circles.push({ x, z, r: 0.8 }); } }
  ctx.addAll(slab(40, 7, 0.5, 0x9a4630, 0, 3.5, -17), slab(0.5, 7, 40, 0x9a4630, -17, 3.5, 0), slab(0.5, 7, 40, 0x9a4630, 17, 3.5, 0));
  for (const [x, z] of [[-7, -6], [7, -6], [-8, 8], [8, 8], [0, 1]]) ctx.add(lamp(0xffb060, 9, 16), x, 5.6, z);
  // The raised seat. No carved figures, no emblems: only stone and a lapis canopy.
  ctx.addAll(slab(4.4, 1.2, 3.2, 0x8a3f2c, 0, 0.6, -12.5), slab(4.8, 0.2, 3.6, 0x2c4a7a, 0, 4.6, -12.5));
  for (const x of [-2.2, 2.2]) ctx.add(slab(0.25, 3.4, 0.25, 0x2c4a7a, x, 2.9, -11.1));
  world.rects.push({ x0: -2.6, x1: 2.6, z0: -15, z1: -10.6 });
  const emperor = ctx.spawn({ top: 0x7a1f2a, bottom: 0x7a1f2a, robe: true, head: 'dull', headgear: 'turban', gearColor: 0xc98a2b }, 0, -12.4, 0);
  emperor.floating = true; emperor.pos.y = 1.2; emperor.fig.setPose('sitGround', true);
  const herald = ctx.spawn({ top: 0x7d8086, bottom: 0x6d7076, robe: true, head: 'dull', headgear: 'turban', gearColor: 0x8d9096, prop: 'stick' }, 3.4, -9.8, 0);
  // Scholars of many faiths, seated in rings.
  const r = rng(113);
  const seats = [];
  for (const rad of [4.6, 6.5, 8.4]) {
    const n = Math.floor(rad * 3.1);
    for (let i = 0; i < n; i++) { const a = (i / n) * 6.283 + rad; if (Math.abs(Math.sin(a)) < 0.3) continue; const x = Math.sin(a) * rad, z = Math.cos(a) * rad + 1.5; seats.push({ x, y: 0, z, yaw: a + Math.PI, seated: true }); world.circles.push({ x, z, r: 0.42 }); }
  }
  ctx.add(makeCrowd(seats, { colors: [0xe8e2d2, 0xc98a2b, 0x7a1f2a, 0x2c4a7a, 0x3f6b4a, 0x5a5a5a, 0xd9c7a0] }));
  const courtiers: Actor[] = [];
  for (let i = 0; i < 5; i++) courtiers.push(ctx.spawn({ top: [0x2c4a7a, 0x3f6b4a, 0x7a1f2a, 0xc98a2b, 0x5a3a6a][i], bottom: 0xe8e2d2, robe: true, head: 'dull', headgear: 'turban', gearColor: 0xe8e2d2 }, -3 + i * 1.5, -8.2 + (r() - 0.5) * 0.5, Math.PI));
  const spot = { x: 1.6, z: 12.6 };
  const iqbal = ctx.spawnRevered(IQBAL, spot.x, spot.z, Math.PI);
  const pl = ctx.setPlayer(BURHAN, 0, 13.6, Math.PI);
  pl.control = false; pl.camPitch = 0.2;
  audio.setAmbient({ noise: { freq: 380, gain: 0.07, wobble: 0.7 } });

  // A hidden book: a page on the emperor's new religion, and on the prostration demanded at court.
  ctx.addAll(slab(0.6, 1, 0.5, 0x5a3a22, 11.5, 0.5, 6), slab(0.44, 0.06, 0.32, 0xe9dfc4, 11.5, 1.04, 6));
  world.circles.push({ x: 11.5, z: 6, r: 0.6 });
  let roam = false, reading = false;
  ctx.onUpdate(() => {
    if (!roam || reading) return;
    if (pl.dist(11.5, 6) < 2 && pl.dist(spot.x, spot.z) > 2.6) {
      hud.prompt(hud.key('interact', 'Read the page on the stand'));
      if (input.take('interact')) {
        reading = true; hud.prompt(null); ctx.state.flags.bookDinIlahi = true; pl.control = false;
        void hud.book('Hidden book', 'Din-i-Ilahi', "The emperor's new religion for all: a little taken from every faith, and the emperor at its centre. At this court, a prostration before the throne was demanded.").then(() => { reading = false; pl.control = true; });
      }
    }
  });

  ctx.cam([6, 2.6, 2], [1.5, 2.2, -11]);
  await ctx.fade('#000', 0, 2.2);
  hud.soft(visionName(ctx));
  ctx.cam([5, 2.4, -3.5], [2.2, 1.9, -10.5], 5);
  await ctx.say('l01');
  // Courtiers kneel and touch their foreheads to the floor before the throne.
  courtiers.forEach((c, i) => setTimeout(() => c.fig.setPose('bow'), i * 260));
  ctx.cam([-5, 2, -3], [0, 0.8, -9.5], 3);
  await ctx.wait(3.6);
  iqbal?.faceTo(pl.x, pl.z);
  ctx.cam([pl.x - 2.6, 1.9, pl.z - 3.4], [0.9, 1.5, 13], 1.5);
  await ctx.say('l02', 'l03');
  // The player can walk the hall.
  ctx.follow(0, 0.22);
  pl.control = true; roam = true;
  hud.objective('Walk the hall. Come back to Iqbal when you are ready.');
  await ctx.reach(0, 3, 9.5);
  await ctx.interact(spot, 'Go on', 2.4);
  roam = false;
  hud.objective(null);
  await ctx.until(() => !reading);
  await ctx.fade('#000', 1, 2);
};

// ------------------------------------------------------------------ Scene 11: Gwalior Fort, 1620
const gwalior: SceneFn = async (ctx) => {
  const { engine, hud, world } = ctx;
  engine.setSky(0x070a14, 0x1c1a22, 14, 75);
  engine.setLight(0x40465c, 0x14100c, 0.6, 0x9aa8d0, 0.3, [-0.3, 1, 0.3]);
  world.bounds = { x0: -11.5, x1: 11.5, z0: -11.5, z1: 12 };
  ctx.add(slab(32, 0.2, 32, 0x5a4f44, 0, -0.1, 0, false, K.tile));
  ctx.addAll(slab(28, 9, 1, 0x6a5a4a, 0, 4.5, -13.5), slab(1, 9, 28, 0x6a5a4a, -13.5, 4.5, 0), slab(1, 9, 28, 0x6a5a4a, 13.5, 4.5, 0), slab(11, 9, 1, 0x6a5a4a, -8.5, 4.5, 13.5), slab(11, 9, 1, 0x6a5a4a, 8.5, 4.5, 13.5), slab(6, 4, 1, 0x6a5a4a, 0, 7, 13.5));
  for (let x = -2.6; x <= 2.7; x += 0.65) ctx.add(slab(0.1, 5, 0.1, 0x1c1c1e, x, 2.5, 13.4)); // the barred gate
  for (const [x, z] of [[-11.5, -11.5], [11.5, -11.5], [-11.5, 10], [11.5, 10]]) { ctx.add(slab(0.14, 2.2, 0.14, 0x2a1c10, x, 1.1, z)); ctx.add(lamp(0xff9a50, 10, 16), x, 2.4, z); }
  ctx.add(lamp(0xffd9a8, 7, 10), 0, 2.6, -3.2);
  const centre = { x: 0, z: -4 };
  const mujaddid = ctx.spawnRevered(MUJADDID, centre.x, centre.z, 0);
  // A circle of prisoners he is teaching.
  const prisoners: Actor[] = [];
  for (let i = 0; i < 7; i++) {
    const a = -1.25 + (i / 6) * 2.5, x = centre.x + Math.sin(a) * 3.3, z = centre.z + Math.cos(a) * 3.3;
    const p = ctx.spawn({ top: [0x7a705f, 0x8a7a66, 0x6a6258][i % 3], bottom: 0x6a6258, head: 'mirror', clarity: 0.5 }, x, z, a + Math.PI);
    p.fig.setPose('sitGround', true); prisoners.push(p); world.circles.push({ x, z, r: 0.5 });
  }
  world.circles.push({ x: centre.x, z: centre.z, r: 0.6 });
  const iqbal = ctx.spawnRevered(IQBAL, 3.2, 9.4, Math.PI);
  const pl = ctx.setPlayer(BURHAN, 1.6, 10.4, Math.PI);
  pl.camPitch = 0.22; pl.snapCamera(engine.camera);
  audio.setAmbient({ noise: { freq: 260, gain: 0.03, wobble: 0.5 }, fire: 0.5 });

  await ctx.fade('#000', 0, 2.2);
  hud.soft(visionName(ctx));
  await ctx.reach(centre.x + 0.6, centre.z + 5.6, 2.6, 'Go to the circle');
  pl.control = false;
  if (iqbal) void iqbal.goTo(3.2, 2.2, 1.6);
  pl.faceTo(centre.x, centre.z);
  ctx.cam([pl.x + 3.4, 2.2, pl.z + 3], [centre.x, 1.5, centre.z], 2.2);
  await ctx.say('l01', 'l02', 'l03', 'l04');
  ctx.cam([centre.x - 3.2, 1.9, centre.z + 5.4], [centre.x, 1.6, centre.z], 5);
  await ctx.say('l05', 'l06');
  // A prisoner smiles, and others nod. (No faces: it is all in the shoulders.)
  prisoners.forEach((p, i) => setTimeout(() => p.fig.nod(), i * 220));
  await ctx.wait(2);
  // The Mujaddid turns back to his circle.
  if (mujaddid) mujaddid.faceTo(prisoners[2].x, prisoners[2].z);
  await ctx.wait(1);
  hud.fade('#000', 1, 9);
  await ctx.say('l07');
  await ctx.wait(2.5);
};

// ------------------------------------------------------------------ Scene 12: Fajr
const fajr: SceneFn = async (ctx) => {
  const { engine, hud } = ctx;
  const place = mosqueHill(ctx, 'dawn');
  const inside = caveInside(ctx);
  inside.glow(0.06);
  const sain = ctx.spawn({ ...SAIN, prop: 'none' }, 4.2, -3.8, Math.PI);
  sain.floating = true; sain.pos.set(4.2, 1.0, -3.8);
  const pl = ctx.setPlayer(BURHAN, 0, 0, Math.PI);
  pl.control = false; pl.floating = true;
  pl.pos.set(inside.cx, 0, 1.2); pl.fig.setPose('sitGround', true);
  engine.setSky(0x030405, 0x06080c, 5, 30);
  engine.setLight(0x30363e, 0x060606, 0.5, 0xffffff, 0);
  audio.setAmbient(null);

  // Burhan wakes in the cave to the Fajr azan.
  ctx.cam([inside.cx + 1.7, 1.45, 5.4], [inside.cx - 0.2, 1.2, -6]);
  await ctx.fade('#000', 0, 3);
  hud.caption(AZAN_CAPTION);
  await ctx.wait(4);
  pl.fig.setPose('stand');
  await ctx.wait(1.6);
  await ctx.fade('#000', 1, 1.6);
  pl.floating = false;
  pl.place(place.cave.x + 7, place.cave.z, Math.PI / 2); // clear of the rock, so the camera has room behind him
  engine.setSky(0x4a6090, 0xf0c8a0, 30, 220);
  engine.setLight(0xbfc8d8, 0x3a3428, 0.95, 0xffcf9a, 1.2, [0.9, 0.35, 0.3]);
  audio.setAmbient({ noise: { freq: 520, gain: 0.04, wobble: 0.6 } });
  ctx.follow(-Math.PI / 2, 0.24);
  pl.control = true;
  await ctx.fade('#000', 0, 2);
  // He comes out. Nothing asks him to walk in.
  const t0 = ctx.time;
  ctx.onUpdate(() => { if (pl.control && ctx.time - t0 > 30) hud.objective('The azan is coming from the small mosque.'); });
  await ctx.reach(place.door.x, place.door.z, 2.1);
  pl.control = false;
  hud.objective(null); hud.caption(null);

  // Fajr in jamaat behind Sain: two men in a small mosque. The camera stays distant, with no prompts.
  sain.floating = false; sain.place(0, -7.5, Math.PI);
  ctx.cam([-2.2, 1.5, 11], [0, 1.3, -5], 2.5);
  await ctx.go(pl, 0, -4.4, 1.3);
  await ctx.go(pl, 0.5, -6.1, 1.1);
  pl.yaw = Math.PI;
  await ctx.wait(4);
  await ctx.fade('#000', 1, 2.8);
  await ctx.wait(2.2);
  // After the salam, Sain turns to him. For a moment, on Burhan's smooth face, Sain sees his own reflection.
  sain.yaw = 0.2; sain.fig.setPose('kneel', true); pl.fig.setPose('kneel', true);
  ctx.mirror(0.5);
  ctx.cam([-1.5, 1.05, -8.1], [0.5, 0.85, -6.1]); // from beside Sain, toward Burhan's face
  await ctx.fade('#000', 0, 2.8);
  await ctx.wait(2);
  await ctx.say('l01');
  // The first latifa lights: qalb, the heart, at the left of his chest.
  ctx.state.lataif[0] = true;
  pl.fig.setLataif(ctx.state.lataif);
  ctx.state.pillars.heart = 0.5;
  ctx.cam([-0.75, 0.8, -7.6], [0.35, 1.2, -6.1], 3);
  await ctx.wait(3.2);
  const t = ctx.scene.items.find((i): i is TitleItem => i.type === 'title')!;
  const parts = t.text.replace(/\.$/, '').split('. ').map((p) => p.split(' — '));
  hud.title(parts.map((p) => p[0]).join('  ·  '), parts.map((p) => p[1]).join('  ·  '), 'Qalb, the heart: the first of the lataif.', true);
  hud.showTitle();
  audio.daf();
  await ctx.hold(9);
  await ctx.fade('#000', 1, 2.6);
  hud.clearTitle();
};

export const scenes: Record<string, SceneFn> = {
  'ch1.s07': stairs,
  'ch1.s08': cave,
  'ch1.s09': sirhind,
  'ch1.s10': debateHouse,
  'ch1.s11': gwalior,
  'ch1.s12': fajr,
};
