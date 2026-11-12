// Chapter 1: The Forgetting, scenes 1-6. Script: src/data/scripts/ch1.json.
import * as THREE from 'three';
import { gild, mat, K } from '../core/engine';
import { audio } from '../core/audio';
import { makeCrowd, makeTrophy, type FigureOpts } from '../world/figures';
import type { Actor } from '../world/actors';
import { terrain, forest, slab, lamp, smallMosque, cityBelow, faisalMosque, building, road, streetLamp, car, rocks, rng, vnoise } from '../world/props';
import { REGISTERS, type WheelOption, type Register } from '../ui/hud';
import { BURHAN, type Ctx, type SceneFn, type LineItem } from './director';
import { AZAD, BILAL, DEALER, FARAZ, MODERATOR, REHAN, SAIN, mosqueHill } from './places';

const LOCKED_SOHBAT = 'ch1.s01.l07';

// ------------------------------------------------------------------ Scene 1: The final
const theFinal: SceneFn = async (ctx) => {
  const { engine, hud, world } = ctx;
  engine.setSky(0x050608, 0x0b0d12, 22, 80);
  engine.setLight(0x4a5262, 0x16161c, 0.9, 0xffffff, 0.25);
  world.ground = (_x, z) => (z < -3.5 ? 1 : 0);
  ctx.add(slab(44, 0.2, 50, 0x1c1d22, 0, -0.1, 8));
  ctx.add(slab(20, 1, 8, 0x4a3524, 0, 0.5, -7.5, false, K.wood));
  for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) ctx.add(slab(1.3, 11, 0.5, 0x5a1418, sx * (10.6 + i * 1.15), 5.5, -9.2 + (i % 2) * 0.35, false, K.cloth));
  ctx.add(slab(22, 0.25, 0.25, 0x1a1a1e, 0, 9.2, -4.5, false, K.metal));
  for (let i = -4; i <= 4; i++) { const can = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.45, 10), mat(0x101012, false, true, K.metal)); can.rotation.x = 0.7; ctx.add(can, i * 2.2, 8.85, -4.4); const lens = new THREE.Mesh(new THREE.CircleGeometry(0.15, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2d8).multiplyScalar(4) })); lens.rotation.x = Math.PI / 2 + 0.7; ctx.add(lens, i * 2.2, 8.66, -4.56); }
  ctx.addAll(slab(44, 14, 0.4, 0x15161b, 0, 7, -11.6), slab(0.4, 14, 50, 0x15161b, -22, 7, 8), slab(0.4, 14, 50, 0x15161b, 22, 7, 8));
  ctx.add(slab(13, 3.2, 0.2, 0x1d2a44, 0, 5.4, -11.3));
  ctx.label('SURAT presents: The National Debate Final', 0, 5.4, -11.1, 'banner', 80);
  ctx.addAll(slab(0.8, 1.1, 0.6, 0x2a2f3a, -4.5, 1.55, -6.3), slab(0.8, 1.1, 0.6, 0x2a2f3a, 4.5, 1.55, -6.3), slab(2.2, 0.9, 0.7, 0x2a2f3a, 0, 1.45, -8));
  const key = new THREE.PointLight(0xfff2d8, 260, 30, 1.5); ctx.add(key, 0, 7.5, -3);
  const fill = new THREE.PointLight(0xa8c0ff, 90, 46, 1.4); ctx.add(fill, 0, 9, 12);
  const spots = [];
  for (let row = 0; row < 10; row++) {
    ctx.add(slab(27, 0.35, 1.6, 0x202127, 0, row * 0.35 - 0.175, 3 + row * 1.6));
    for (let x = -12.5; x <= 12.5; x += 1.02) spots.push({ x: x + (row % 2) * 0.4, y: row * 0.35, z: 3 + row * 1.6, yaw: Math.PI, seated: true });
  }
  ctx.add(makeCrowd(spots, { colors: [0x4a5568, 0x6a5a4a, 0x35506a, 0x705040, 0x4f5f4a, 0x3a3a48] }));
  { // a seat under every one of them
    const seatG = new THREE.BoxGeometry(0.5, 0.08, 0.48).translate(0, 0.46, 0.05), backG = new THREE.BoxGeometry(0.5, 0.62, 0.07).translate(0, 0.78, -0.2);
    const sm = mat(0x5a1c20, false, true, K.cloth);
    for (const gm of [seatG, backG]) { const inst = new THREE.InstancedMesh(gm, sm, spots.length); const d = new THREE.Object3D(); spots.forEach((sp, i) => { d.position.set(sp.x, sp.y, sp.z); d.rotation.y = Math.PI; d.updateMatrix(); inst.setMatrixAt(i, d.matrix); }); inst.frustumCulled = false; ctx.add(inst); }
  }
  for (const x of [-8, 8]) { ctx.addAll(slab(0.5, 0.4, 0.8, 0x0e0e10, x, 1.6, 0.5), slab(0.08, 1.4, 0.08, 0x0e0e10, x, 0.7, 0.5)); }

  const moderator = ctx.spawn(MODERATOR, 0, -8.7, 0);
  const rehan = ctx.spawn(REHAN, -4.5, -7, 0);
  const pl = ctx.setPlayer(BURHAN, 4.5, -7, 0);
  pl.control = false;
  const faraz = ctx.spawn({ ...FARAZ, prop: 'trophy' }, 13, -7, -Math.PI / 2);
  audio.setAmbient({ noise: { freq: 420, gain: 0.09, wobble: 0.7 } });

  ctx.cam([0, 5, 13], [0, 2.2, -7]);
  await ctx.fade('#000', 0, 2);
  ctx.cam([0, 3.4, 5], [0, 2.3, -7.5], 6);
  await ctx.wait(1.5);
  ctx.cam([1.6, 2.7, -4.2], [0, 2.5, -8.7], 2.5);
  await ctx.say('l01', 'l02');
  ctx.cam([-2.6, 2.7, -3.4], [-4.5, 2.5, -7], 1.6);
  await ctx.say('l03');

  // The wheel opens: Burhan, Jadal and Khitaba are live. Sohbat sits locked.
  ctx.cam([2.6, 2.75, -3.6], [4.5, 2.55, -7], 1.4);
  hud.crowd(true, 0.18, '');
  const opt = (id: string, register: Register): WheelOption => { const l = ctx.item<LineItem>(id); return { register, state: 'live', ur: l.ur, en: l.en }; };
  const lines: Record<string, string> = { burhan: 'l04', jadal: 'l05', khitaba: 'l06' };
  const choice = (await ctx.wheel([opt('l04', 'burhan'), opt('l05', 'jadal'), opt('l06', 'khitaba'), { register: 'sohbat', state: 'locked', tooltip: ctx.item<LineItem>(LOCKED_SOHBAT).en }])) ?? 'burhan';
  ctx.state.flags.debateRegister = choice;
  await ctx.say(lines[choice]);
  // The crowd roars at whichever line was picked, and the meter shows which register moved them.
  audio.roar(3.5);
  hud.crowd(true, 0.94, `Moved by ${REGISTERS[choice].name}: ${REGISTERS[choice].gloss}`);
  ctx.cam([0, 4.4, 1.5], [0, 1.6, 12], 2);
  await ctx.wait(3.6);
  hud.crowd(false);
  ctx.cam([1.6, 2.7, -4.2], [0, 2.5, -8.7], 1.2);
  await ctx.say('l08');
  audio.roar(2.5);
  ctx.cam([1.5, 2.6, -2.6], [4.2, 2.4, -7], 2);
  await ctx.go(faraz, 5.9, -6.9, 2.4);
  faraz.faceTo(pl.x, pl.z); pl.faceTo(faraz.x, faraz.z);
  await ctx.say('l09');
  faraz.fig.setProp('none'); pl.fig.setProp('trophy'); pl.fig.setPose('hold');
  pl.faceTo(pl.x, 10);
  // Cameras flash. Slow and soft: never a strobe.
  for (let i = 0; i < 5; i++) { audio.flash(); hud.fade('#fff', 0.3, 0); await ctx.wait(0.07); hud.fade('#fff', 0, 0.25); await ctx.wait(0.45 + (i % 2) * 0.25); }
  // Close on Burhan. His face is dull, like unpolished steel.
  ctx.cam([4.9, 2.62, -5.5], [4.5, 2.66, -7], 3);
  await ctx.wait(5.5);
  await ctx.fade('#000', 1, 2);
};

// ------------------------------------------------------------------ Scene 2: Backstage
const backstage: SceneFn = async (ctx) => {
  const { engine, hud, world } = ctx;
  engine.setSky(0x08090c, 0x101216, 14, 50);
  engine.setLight(0x4a5058, 0x16161a, 0.7, 0xffffff, 0.15);
  world.bounds = { x0: -10.6, x1: 10.6, z0: -1.5, z1: 1.5 };
  ctx.addAll(slab(24, 0.2, 4.4, 0x3a3c40, 0, -0.1, 0), slab(24, 3.4, 0.2, 0x56595e, 0, 1.7, -2.1), slab(24, 0.2, 4.4, 0x2a2b2e, 0, 3.4, 0));
  ctx.addAll(slab(0.2, 3.4, 4.4, 0x56595e, 12, 1.7, 0), slab(0.2, 3.4, 4.4, 0x56595e, -12, 1.7, 0), slab(0.15, 2.3, 1.3, 0x1c1d20, -11.85, 1.15, 0));
  for (const x of [-7, 0, 7]) { ctx.add(lamp(0xdfe8ff, 9, 12), x, 3.1, 0); }
  for (const x of [-5, 3, 8]) ctx.add(slab(1.2, 1.6, 0.5, 0x2e3440, x, 0.8, -1.7));
  ctx.label('STAGE DOOR', -11.6, 2.6, 0, 'plate', 30);
  const pl = ctx.setPlayer({ ...BURHAN, prop: 'trophy' }, 0, 0.2, Math.PI / 2);
  pl.control = false; pl.camDist = 3.4; pl.camPitch = 0.16;
  const azad = ctx.spawn(AZAD, 11, 0.3, -Math.PI / 2);
  audio.setAmbient({ noise: { freq: 300, gain: 0.04, wobble: 0.4 } });

  ctx.cam([2.6, 1.7, 1.7], [0, 1.45, 0.1]);
  await ctx.fade('#000', 0, 1.2);
  hud.phone('Abba', 'ابو', 'VIDEO CALL');
  await ctx.say('l01', 'l02');
  hud.phone(null);
  // Azad bursts in and grabs him in a hug.
  ctx.cam([-2.8, 1.7, 1.7], [0.6, 1.4, 0.1], 0.8);
  await ctx.go(azad, 0.75, 0.25, 6);
  azad.fig.setPose('guard'); pl.faceTo(azad.x, azad.z);
  await ctx.wait(0.9);
  azad.fig.setPose('stand');
  await ctx.say('l03');
  pl.fig.flinch(); await ctx.wait(0.35); pl.fig.flinch(); // the only laugh he gets tonight
  await ctx.wait(0.8);
  await ctx.say('l04');
  void azad.goTo(11, 0.3, 4);
  pl.control = true;
  ctx.follow(Math.PI / 2, 0.16);
  await ctx.reach(-10, 0, 1.5, 'Leave by the stage door');
  await ctx.fade('#000', 1, 1.2);
};

// ------------------------------------------------------------------ Scene 3: The trail
const TRAIL: [number, number][] = [[0, -1], [4, -14], [-3, -28], [5, -42], [0, -56]];
function nearestOnTrail(x: number, z: number): { x: number; z: number; d: number } {
  let best = { x: 0, z: 0, d: 1e9 };
  for (let i = 0; i < TRAIL.length - 1; i++) {
    const [ax, az] = TRAIL[i], [bx, bz] = TRAIL[i + 1];
    const t = THREE.MathUtils.clamp(((x - ax) * (bx - ax) + (z - az) * (bz - az)) / ((bx - ax) ** 2 + (bz - az) ** 2), 0, 1);
    const px = ax + (bx - ax) * t, pz = az + (bz - az) * t, d = Math.hypot(x - px, z - pz);
    if (d < best.d) best = { x: px, z: pz, d };
  }
  return best;
}

const trail: SceneFn = async (ctx) => {
  const { engine, hud, world } = ctx;
  engine.setSky(0x04060c, 0x0c121c, 9, 62);
  engine.setLight(0x2c364c, 0x0a0a08, 0.55, 0x8090b0, 0.28, [-0.3, 1, 0.4]);
  const h = (x: number, z: number) => {
    const d = z > 0 ? 99 : nearestOnTrail(x, z).d;
    return Math.max(0, -z) * 0.24 + (vnoise(x * 0.12, z * 0.12) - 0.5) * 2.2 * THREE.MathUtils.clamp((d - 2) / 6, 0, 1) * (z < 0 ? 1 : 0);
  };
  world.ground = h;
  world.bounds = { x0: -14, x1: 14, z0: -60, z1: 7 };
  world.clamp = (p) => { if (p.z > 0) return; const n = nearestOnTrail(p.x, p.z); if (n.d > 4.5) { p.x = n.x + ((p.x - n.x) / n.d) * 4.5; p.z = n.z + ((p.z - n.z) / n.d) * 4.5; } };
  ctx.add(terrain(150, 56, h, (x, z) => (z > 1.6 ? 0x2a2b2e : nearestOnTrail(x, z).d < 1.5 ? 0x6a5a44 : 0x2f4a30), false, 0, -30));
  const r = rng(71);
  const pines = [];
  for (let i = 0; i < 150; i++) { const x = (r() - 0.5) * 90, z = -r() * 95 + 2; if (nearestOnTrail(x, z).d > 3.2 && z < -1) pines.push({ x, y: h(x, z), z, s: 1 + r() * 0.9 }); }
  ctx.add(forest(pines, 'pine', 0x1f3d2a));
  // Margalla Road, a street lamp, and the low wall at the trailhead
  ctx.add(road(120, 7), 0, 0.0, 5.6);
  for (const lx of [-34, -6, 22, 50]) { const sl = streetLamp(6.2); sl.rotation.y = -Math.PI / 2; ctx.add(sl, lx, 0, 1.6); }
  ctx.add(car(0x6a6f76), -7.5, 0.06, 3.4).rotation.y = Math.PI / 2; ctx.add(car(0xc9c4b8), 9, 0.06, 3.5).rotation.y = Math.PI / 2;
  world.rects.push({ x0: -9.8, x1: -5.2, z0: 2.5, z1: 4.3 }, { x0: 6.7, x1: 11.3, z0: 2.6, z1: 4.4 });
  const passing = [0, 1, 2].map((i) => { const cr = car([0x8a8f96, 0x2a3a5a, 0x7a1f1f][i], true); ctx.root.add(cr); return { cr, x: -70 + i * 55, dir: i % 2 ? -1 : 1 }; });
  ctx.onUpdate((dt) => { for (const p of passing) { p.x += p.dir * dt * 13; if (p.x > 90) p.x = -90; if (p.x < -90) p.x = 90; p.cr.position.set(p.x, 0.06, p.dir > 0 ? 7.4 : 5.2); p.cr.rotation.y = p.dir > 0 ? Math.PI / 2 : -Math.PI / 2; } });
  { const st = []; for (let i = 0; i < 60; i++) { const x = (r() - 0.5) * 30, z = -r() * 62; const n = nearestOnTrail(x, z); if (n.d > 1.9 && n.d < 7) st.push({ x, y: h(x, z), z, s: 0.2 + r() * 0.5 }); } ctx.add(rocks(st, 0x5a584f)); }
  ctx.add(slab(4, 0.46, 0.5, 0x7a756a, 0.6, 0.23, 0.9, false, K.brick));
  world.rects.push({ x0: -1.4, x1: 2.6, z0: 0.65, z1: 1.15 });
  for (let i = 0; i < 7; i++) ctx.add(lamp(0xffd9a0, 1.2, 6), 26 + i * 4 + r() * 3, 1.5 + r() * 3, 14 + r() * 16); // Saidpur's lights
  const trophy = makeTrophy(); ctx.add(trophy, 1.15, 0.46, 0.9);

  const pl = ctx.setPlayer(BURHAN, 0.2, 1.3, 0);
  pl.control = false; pl.fig.setPose('sit', true);
  const bilal = ctx.spawn(BILAL, 10, 3.6, -Math.PI / 2);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), mat(0xc8e04a)); ctx.root.add(ball);
  let bouncing = true;
  ctx.onUpdate((_, t) => { ball.visible = bouncing; if (bouncing) ball.position.set(bilal.x + Math.sin(bilal.yaw) * 0.35 - 0.15, h(bilal.x, bilal.z) + 0.06 + Math.abs(Math.sin(t * 5.2)) * 0.75, bilal.z + Math.cos(bilal.yaw) * 0.35); });
  const combat = ctx.startCombat({ damage: 0.5, reach: 1.5, poise: 3, untrained: true, loseOnDown: true });
  combat.active = false;
  const end = { x: TRAIL[4][0], z: TRAIL[4][1] };
  const d1 = ctx.spawnFighter(DEALER, end.x - 1.4, end.z - 2.2, { poise: 9999, windup: 0.5, moveSpeed: 3, passive: true, yaw: 0.3 });
  const d2 = ctx.spawnFighter({ ...DEALER, top: 0x2f2a26 }, end.x + 1.5, end.z - 2.6, { poise: 9999, windup: 0.55, moveSpeed: 3, passive: true, yaw: -0.3 });
  const lighter = new THREE.PointLight(0xffa040, 2.5, 7, 1.5); ctx.add(lighter, end.x, h(end.x, end.z - 2.4) + 1.2, end.z - 2.4);
  ctx.onUpdate((_, t) => { lighter.intensity = 2 + Math.sin(t * 17) * 0.7 + Math.sin(t * 31) * 0.4; });
  const torch = new THREE.SpotLight(0xdfe8ff, 0, 26, 0.55, 0.6, 1.2); ctx.root.add(torch, torch.target);
  ctx.onUpdate(() => { const p = pl.p, fx = Math.sin(pl.yaw), fz = Math.cos(pl.yaw); torch.position.set(p.x + fx * 0.3, p.y + 1.3, p.z + fz * 0.3); torch.target.position.set(p.x + fx * 8, p.y + 1.0 + fz * -0.0, p.z + fz * 8); });
  audio.setAmbient({ noise: { freq: 380, gain: 0.05, wobble: 0.6 }, crickets: 1 });

  ctx.cam([4.2, 1.5, 4.6], [0.6, 1.0, 1.0]);
  await ctx.fade('#000', 0, 1.8);
  await ctx.go(bilal, 2.6, 2.7, 1.9);
  bilal.faceTo(pl.x, pl.z);
  await ctx.say('l01', 'l02', 'l03');
  // He snatches the trophy and runs up the trail.
  bouncing = false;
  await ctx.go(bilal, 1.5, 1.5, 5);
  trophy.visible = false; bilal.fig.setProp('trophy');
  void bilal.goTo(TRAIL[0][0], TRAIL[0][1] - 4, 6);
  await ctx.wait(0.5);
  pl.fig.setPose('stand'); pl.place(0.2, 0.1, Math.PI);
  torch.intensity = 70;
  ctx.follow(0, 0.3);
  pl.control = true;
  hud.objective('Chase him up the trail');
  hud.soft('Run: hold Shift');
  if (ctx.auto) { bilal.place(end.x, end.z + 0.5); pl.place(end.x, end.z + 5); }
  else {
    for (const [wx, wz] of TRAIL.slice(1)) {
      while (bilal.dist(wx, wz) > 0.7) {
        // He stays just ahead: waits (looking back) if Burhan falls far behind, sprints if he gets close.
        const lead = pl.z - bilal.z;
        if (lead > 15) { if (bilal.going) bilal.stop(); bilal.faceTo(pl.x, pl.z); }
        else if (!bilal.going) void bilal.goTo(wx, wz, lead < 6 ? 6.4 : 5.2, 0.6);
        await ctx.frame();
      }
    }
    bilal.stop();
  }
  await ctx.until(() => pl.dist(end.x, end.z) < 7);
  hud.objective(null);
  pl.control = false;
  bilal.place(end.x + 0.2, end.z - 0.6); bilal.faceTo(d1.x, d1.z);
  ctx.cam([end.x + 4.5, h(end.x, end.z) + 2, end.z + 3], [end.x, h(end.x, end.z) + 1.2, end.z - 1.6], 1.5);
  await ctx.say('l04', 'l05');
  bilal.fig.setProp('none'); d1.fig.setProp('trophy');
  await ctx.go(pl, end.x + 0.6, end.z + 2.4, 2.2);
  pl.faceTo(d1.x, d1.z);
  await ctx.say('l06', 'l07');

  // The first fight. He is slow and untrained, and he is meant to lose.
  void bilal.goTo(end.x + 4, end.z - 1, 3);
  ctx.follow(0.2, 0.32);
  pl.control = true; combat.active = true;
  d1.passive = d2.passive = false;
  hud.prompt(`${hud.key('attack', 'Strike')} &nbsp; ${hud.key('guard', 'Guard')} &nbsp; ${hud.key('dodge', 'Dodge')} &nbsp; ${hud.key('grapple', 'Grapple')}`);
  const t0 = ctx.time;
  ctx.onUpdate(() => { if (combat.active && ctx.time - t0 > 32) { d1.windup = d2.windup = 0.3; d1.damage = d2.damage = 3; } });
  await ctx.until(() => combat.playerDown, () => combat.knockDown());
  hud.prompt(null);
  combat.active = false; pl.control = false;
  d1.setSpeed(0); d2.setSpeed(0);
  ctx.cam([pl.x + 3, pl.p.y + 1.4, pl.z + 3.4], [pl.x, pl.p.y + 0.4, pl.z], 1.2);
  bilal.faceTo(d1.x, d1.z);
  await ctx.say('l08');
  // The dealers shrug and walk off into the dark with the trophy.
  void d1.goTo(end.x - 9, end.z - 16, 1.7); void d2.goTo(end.x - 7, end.z - 18, 1.7);
  bilal.faceTo(pl.x, pl.z);
  await ctx.wait(2.6);
  void bilal.goTo(end.x - 8, end.z - 17, 5);
  await ctx.wait(1.6);
  if (combat.angerTriggered) {
    // The rule of anger: mashing attacks dimmed the mirror.
    ctx.state.flags.angerDimmed = true;
    hud.soft('Anger dimmed the mirror.');
    await ctx.wait(4.8);
  }
  hud.vignette(0);
  await ctx.wait(1.2);
  await ctx.fade('#000', 1, 2);
};

// ------------------------------------------------------------------ Scene 4: The sweeper
const sweeper: SceneFn = async (ctx) => {
  const { engine, hud } = ctx;
  mosqueHill(ctx, 'night');
  const trophy = makeTrophy(); ctx.add(trophy, 0.6, 0.16, -3.55);
  for (let i = 0; i < 9; i++) { const f = new THREE.Mesh(new THREE.CircleGeometry(0.07, 6), new THREE.MeshBasicMaterial({ color: 0x4f4b42 })); f.rotation.x = -Math.PI / 2; f.scale.set(1, 1.7, 1); ctx.add(f, 1.2 + i * 0.62, 0.035, -2.9 + i * 0.45 + (i % 2) * 0.16); }
  const sain = ctx.spawn(SAIN, -1.6, 1.4, 0.6);
  sain.fig.sweep(true);
  const pl = ctx.setPlayer(BURHAN, 24, 30, -2.4);
  pl.camYaw = 0.7;
  pl.snapCamera(engine.camera);
  audio.setAmbient({ noise: { freq: 360, gain: 0.04, wobble: 0.6 }, crickets: 0.7 });

  await ctx.fade('#000', 0, 2);
  await ctx.reach(0, 3, 6.5, 'Follow the lamp');
  pl.control = false;
  ctx.cam([-5.5, 1.9, 6.5], [-0.5, 1.2, 0], 2);
  await ctx.go(pl, 1.2, 3.4, 1.8);
  pl.faceTo(sain.x, sain.z);
  await ctx.say('l01');
  // Sain picks up the trophy and reads the plate. He laughs softly, to himself.
  sain.fig.sweep(false);
  await ctx.go(sain, 0.5, -2.7, 1.5);
  trophy.visible = false; sain.fig.setProp('trophy'); sain.fig.setPose('hold');
  sain.faceTo(pl.x, pl.z);
  ctx.cam([2.4, 1.6, -0.6], [0.5, 1.25, -2.7], 1.5);
  await ctx.wait(1.6);
  const plate = ctx.label('PROFESSOR HADI TROPHY', 0.5, 1.75, -2.7, 'plate', 20);
  await ctx.wait(2.6);
  sain.fig.flinch();
  await ctx.wait(1.4);
  plate.remove();
  await ctx.say('l02');
  await ctx.go(pl, 1.5, -1.6, 1.6);
  pl.faceTo(sain.x, sain.z);
  await ctx.say('l03');
  sain.fig.setProp('none'); sain.fig.setPose('stand'); pl.fig.setProp('trophy');
  // He pours tea from a dented kettle into two cups.
  ctx.cam([8.6, 1.9, 7], [5.6, 1, 3], 2.5);
  await ctx.go(sain, 5.0, 3.75, 1.5);
  audio.kettle(2.5);
  await ctx.say('l04');
  await ctx.go(pl, 6.3, 3.75, 1.6);
  sain.place(5.0, 3.72, 0); pl.place(6.3, 3.72, 0);
  sain.fig.setPose('sit'); pl.fig.setPose('sit'); pl.fig.setProp('none');
  ctx.add(makeTrophy(), 7.2, 0, 3.9);
  await ctx.wait(1.2);
  await ctx.say('l05', 'l06', 'l07', 'l08');
  ctx.cam([7.4, 1.5, 6.4], [5.5, 1.1, 3.6], 4);
  await ctx.say('l09');
  // The wheel opens. Every register is greyed out; Sohbat is still locked. The player can only wait.
  audio.kettle(13);
  const grey = (register: Register): WheelOption => ({ register, state: 'grey' });
  await ctx.wheelWait([grey('burhan'), grey('jadal'), grey('khitaba'), { register: 'sohbat', state: 'locked', tooltip: ctx.item<LineItem>(LOCKED_SOHBAT).en }], 'No proof answers this.', 13);
  await ctx.wait(1.5);
  sain.fig.setPose('stand');
  await ctx.say('l10');
  // Sain climbs the few steps of the small minaret and gives the Fajr azan.
  ctx.cam([-6.5, 2.4, 8.5], [1.5, 2, -3.5], 4);
  await ctx.go(sain, 4.2, -2.3, 1.4);
  sain.floating = true;
  await ctx.tween(2.4, (k) => { sain.pos.set(4.2, k * 1.0, -2.3 - k * 1.5); });
  sain.yaw = Math.PI;
  engine.setSky(0x0d1424, 0x3a3f52, 14, 110);
  hud.caption('The Fajr azan, in an old, cracked voice. (Placeholder: caption only until it is recorded.)');
  pl.fig.setPose('stand');
  // Burhan stands at the mosque door, then turns and walks down the hill.
  await ctx.go(pl, 0, -2.6, 1.5);
  pl.faceTo(0, -8);
  await ctx.wait(5);
  void pl.goTo(16, 34, 1.5);
  await ctx.wait(6);
  hud.caption(null);
  await ctx.fade('#000', 1, 2.4);
};

// ------------------------------------------------------------------ Scene 5: The first flicker
const flicker: SceneFn = async (ctx) => {
  const { engine, hud, world } = ctx;
  engine.setSky(0x6a7fa0, 0xf2cfa8, 60, 560, 0xdcc6b0);
  engine.setLight(0xc8cfdc, 0x4a4234, 1.0, 0xffd2a0, 1.3, [0.8, 0.4, 0.5]);
  const h = (x: number, z: number) => THREE.MathUtils.clamp((20 - z) * 0.3, -14, 30) + (vnoise(x * 0.07, z * 0.07) - 0.5) * 2.6 * THREE.MathUtils.clamp((Math.abs(x) - 2) / 8, 0, 1);
  world.ground = h;
  world.bounds = { x0: -7, x1: 7, z0: -52, z1: 34 };
  ctx.add(terrain(240, 48, h, (x, z) => (Math.abs(x) < 1.6 && z < 66 ? 0x8a7a5e : z > 64 ? 0x4f7a48 : 0x4f7042)));
  const r = rng(83);
  const pines = [];
  for (let i = 0; i < 120; i++) { const x = (r() - 0.5) * 200, z = -r() * 110 + 50; if (Math.abs(x) > 5) pines.push({ x, y: h(x, z), z, s: 1 + r() }); }
  ctx.add(forest(pines, 'pine', 0x2f5a3a));
  ctx.add(cityBelow(9), 0, -14, 84);
  ctx.add(faisalMosque(1.7), -84, -14, 132); // stays white: the gold cannot coat a house of Allah
  for (const [dx, dz, s] of [[-200, -40, 1.8], [220, -60, 2.1], [-260, 80, 1.6]]) { const m = new THREE.Mesh(new THREE.ConeGeometry(70, 46, 7), mat(0x3f6a46)); m.scale.setScalar(s); ctx.add(m, dx, 10, dz); }
  const pl = ctx.setPlayer(BURHAN, 0, -44, 0);
  pl.camPitch = 0.2;
  pl.snapCamera(engine.camera);
  audio.setAmbient({ noise: { freq: 520, gain: 0.05, wobble: 0.6 } });
  hud.caption('Distant azans, far below. (Placeholder: caption only.)');
  await ctx.fade('#000', 0, 2.4);
  await ctx.until(() => pl.z > -22, () => pl.place(0, -20));
  hud.caption(null);
  // For one second the whole city flickers gold. Only the Faisal Mosque stays white.
  audio.flash(); audio.chime(1); audio.chime(1);
  await ctx.tween(0.14, (k) => { gild.uGild.value = k; });
  await ctx.wait(0.72);
  await ctx.tween(0.14, (k) => { gild.uGild.value = 1 - k; });
  gild.uGild.value = 0;
  ctx.state.flags.sawFlicker = true;
  await ctx.wait(1.5);
  hud.caption('The azans fade. A koel calls.');
  await ctx.until(() => pl.z > 14, () => pl.place(0, 16));
  hud.caption(null);
  await ctx.fade('#000', 1, 2);
};

// ------------------------------------------------------------------ Scene 6: The Neutral Square
const NAMES = ['HAMZA', 'USMAN', 'DANIYAL', 'SAAD', 'TAIMUR', 'ZAIN', 'FAHAD', 'OMAR'];
const LETTERS = ['ب', 'ر', 'ہ', 'ا', 'ن'];

const square: SceneFn = async (ctx) => {
  const { engine, hud, world, input } = ctx;
  engine.setSky(0x9a7a2a, 0xf0d58a, 30, 170, 0xd9b964);
  engine.setLight(0xfff0c8, 0x6a5a3a, 0.8, 0xfff2cc, 0.9, [0.45, 0.8, 0.5]);
  const podium = { x: 0, z: -12 };
  world.ground = (x, z) => (Math.abs(x - podium.x) < 1.6 && Math.abs(z - podium.z) < 1.3 ? 1 : 0);
  world.bounds = { x0: -19, x1: 19.4, z0: -17, z1: 19 };
  // Under the gold: clay and grass. The ground itself is gildable.
  ctx.add(terrain(120, 40, () => 0, (x, z) => (Math.abs(x) < 2.2 || Math.abs(z) < 2.2 ? 0x9a7250 : vnoise(x * 0.3, z * 0.3) > 0.5 ? 0x5f8a4a : 0x6f9552), true));
  [[46, 12.4, 8, 0, -24], [8, 9.3, 30, -26, -2], [8, 12.4, 16, 28, -12], [30, 9.3, 8, -6, 26]].forEach(([w, hh, d, x, z], i) => ctx.add(building(w, hh, d, [0xb9a98c, 0xc2b49a, 0xa89c88, 0xb9a98c][i], true, i + 1), x, 0, z));
  ctx.add(slab(4.4, 0.06, 40, 0xa89a84, 0, 0.0, 0, true, K.tile)); ctx.add(slab(40, 0.06, 4.4, 0xa89a84, 0, 0.0, 0, true, K.tile));
  for (const [bx, bz] of [[-3.4, 6], [3.4, -5], [-3.4, -7], [7, 3.2], [-9, -3.2]]) { ctx.add(slab(1.8, 0.08, 0.5, 0x6a4a2a, bx, 0.46, bz, true, K.wood)); ctx.add(slab(1.7, 0.42, 0.08, 0x3a3c40, bx, 0.22, bz, true, K.metal)); world.rects.push({ x0: bx - 0.95, x1: bx + 0.95, z0: bz - 0.3, z1: bz + 0.3 }); }
  for (const [lx, lz] of [[-2.8, -2.8], [2.8, 2.8], [-2.8, 12], [2.8, -9]]) { ctx.add(slab(0.1, 3.4, 0.1, 0x2a2c30, lx, 1.7, lz, true, K.metal)); const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), mat(0xe8e4d8, true, true, K.plain)); ctx.add(head, lx, 3.5, lz); }
  ctx.add(slab(3.2, 1, 2.6, 0x7a5a3a, podium.x, 0.5, podium.z, true, K.wood));
  ctx.add(slab(0.7, 1.15, 0.5, 0x4a3524, podium.x, 1.58, podium.z + 0.9, true, K.wood));
  world.rects.push({ x0: podium.x - 1.9, x1: podium.x + 1.9, z0: podium.z - 1.6, z1: podium.z + 1.6 });
  for (const x of [-6, 6]) ctx.add(slab(0.8, 2.4, 0.8, 0x2a2a2e, x, 1.2, -14, true));
  const banners = [ctx.label('NEUTRAL GROUND', 0, 6.4, -19.6, 'neutral', 90), ctx.label('ALL VIEWS WELCOME (KEEP FAITH PRIVATE)', 0, 4.9, -19.6, 'neutral', 90)];
  const r = rng(97);
  const trees = [];
  for (let i = 0; i < 14; i++) { const x = (r() - 0.5) * 34, z = (r() - 0.5) * 30; if (Math.abs(x) > 4 && Math.abs(z) > 4 && !(x > 12 && z > 2)) { trees.push({ x, y: 0, z, s: 0.9 + r() * 0.5 }); world.circles.push({ x, z, r: 0.5 }); } }
  ctx.add(forest(trees, 'broad', 0x4f8a48, true));
  // The old mosque at the quad's edge: not gilded, its doors open and empty.
  const mosque = smallMosque(0xc2bba9); mosque.rotation.y = -Math.PI / 2; ctx.add(mosque, 21, 0, 9);
  world.rects.push({ x0: 20.4, x1: 27, z0: 5.6, z1: 14 });
  const door = { x: 19.3, z: 9 };
  // Students with screens for faces, scrolling through their own faces.
  const spots = [];
  for (let i = 0; i < 46; i++) { const x = (r() - 0.5) * 34, z = (r() - 0.5) * 30; if (Math.hypot(x - 18, z - 9) > 5 && Math.hypot(x, z - 12) > 4 && !(x > 1 && z > 0 && z < 12)) spots.push({ x, y: 0, z, yaw: r() * 6.28 }); }
  ctx.add(makeCrowd(spots, { colors: [0x5a6a8a, 0x8a5a6a, 0x5a8a7a, 0x8a7a5a, 0x6a5a8a], screens: true, gild: true }));
  spots.forEach((s) => world.circles.push({ x: s.x, z: s.z, r: 0.35 }));
  const student = (i: number, x: number, z: number): Actor => ctx.spawn({ top: [0x5a6a8a, 0x8a5a6a, 0x5a8a7a, 0x6a5a8a][i % 4], bottom: 0x2a2c34, head: 'screen', screenColor: [0x9fd8ff, 0xffc7e8, 0xd6ffd0, 0xfff0b0][i % 4], gild: true, prop: 'phone' } as FigureOpts, x, z, r() * 6.28);
  const walkers = NAMES.map((_, i) => student(i, (r() - 0.5) * 26, (r() - 0.5) * 22));
  const tagPos = walkers.map(() => new THREE.Vector3());
  const tags = walkers.map((w, i) => ({ el: hud.label(NAMES[i], tagPos[i], 'idtag', 16), w, name: NAMES[i].split('') }));
  let drainT = 2;
  ctx.onUpdate((dt) => {
    walkers.forEach((w, i) => {
      tagPos[i].set(w.x, 1.12, w.z);
      if (!w.going && Math.random() < dt * 0.25) void w.goTo(THREE.MathUtils.clamp(w.x + (Math.random() - 0.5) * 12, -16, 16), THREE.MathUtils.clamp(w.z + (Math.random() - 0.5) * 12, -9, 16), 1.1);
    });
    // The ID cards on everyone's lanyards lose their letters as you watch.
    drainT -= dt;
    if (drainT <= 0) { drainT = 0.9; const t = tags[Math.floor(Math.random() * tags.length)]; const left = t.name.map((c, i) => (c !== ' ' ? i : -1)).filter((i) => i >= 0); if (left.length) { t.name[left[Math.floor(Math.random() * left.length)]] = ' '; t.el.textContent = t.name.join(''); } }
  });
  const studentA = student(0, 12.5, 4.5), studentB = student(1, 13.4, 5.6);
  const neutral = ctx.spawn({ ...MODERATOR, head: 'screen', screenColor: 0x9a9da3 }, podium.x, podium.z, 0);
  const azad = ctx.spawn({ ...AZAD, head: 'screen', screenColor: 0xffb070, gild: true }, -9, 12, 1);
  const pl = ctx.setPlayer(BURHAN, 0, 15, Math.PI);
  pl.camPitch = 0.26;
  pl.snapCamera(engine.camera);
  gild.uGild.value = 1; gild.uRadius.value = 0;
  audio.setAmbient({ hum: 1, noise: { freq: 900, gain: 0.03, wobble: 0.5 } });

  // A hidden book on the library's shelf.
  ctx.addAll(slab(2.4, 1.5, 0.5, 0x6a4a2a, -21.6, 0.75, -4, true), slab(0.26, 0.34, 0.08, 0x7a2a2a, -21.3, 1.68, -4));
  world.bounds.x0 = -20.6;
  let roam = true, reading = false;
  ctx.onUpdate(() => {
    if (!roam || reading || hud.wheelOpen) return;
    if (pl.dist(-20.6, -4) < 2.2) {
      hud.prompt(hud.key('interact', 'Read the book on the shelf'));
      if (input.take('interact')) {
        reading = true; hud.prompt(null); ctx.state.flags.bookPenalCode = true; pl.control = false;
        void hud.book('Hidden book', 'The Pakistan Penal Code, 1860', "Drafted by Macaulay's law commission, and still the base of the country's criminal law.").then(() => { reading = false; pl.control = true; });
      }
    } else if (!reading) hud.prompt(null);
  });

  hud.idCard(LETTERS, 5, 'BURHAN');
  await ctx.fade('#000', 0, 2);
  hud.objective('Walk the quad');
  await ctx.say('l01');
  await ctx.reach(11, 6, 5);
  hud.objective(null);
  studentA.stop(); studentB.stop();
  studentA.faceTo(door.x + 2, door.z); studentB.faceTo(studentA.x, studentA.z);
  studentA.fig.setPose('hold');
  await ctx.say('l02', 'l03');
  studentA.fig.setPose('stand');
  // Azad walks up.
  roam = false; hud.prompt(null);
  await ctx.until(() => !reading);
  azad.place(pl.x - 6, pl.z + 5);
  await ctx.go(azad, pl.x - 1.3, pl.z + 0.8, 2.6);
  azad.faceTo(pl.x, pl.z); pl.faceTo(azad.x, azad.z);
  pl.control = false;
  await ctx.say('l04', 'l05');
  // He can't say it. The letters of his name drain off his own ID card. The camera tilts; the sound narrows.
  let tilt = 0;
  ctx.onUpdate(() => { if (tilt) engine.camera.rotateZ(tilt); });
  audio.setNarrow(0.85);
  for (let n = 4; n >= 0; n--) { hud.idCard(LETTERS, n, n > 2 ? 'BUR' : ''); await ctx.tween(0.8, (k) => { tilt = ((4 - n + k) / 5) * 0.2; }); }
  ctx.mirror(0.06);
  await ctx.say('l06');
  await ctx.wait(0.8);
  await ctx.say('l07'); // faint, from the prologue: his mother's dua

  // Zikr: hold to remember. The gold flakes off the ground around him; his name returns, letter by letter.
  hud.prompt(hud.key('remember', 'Zikr — hold to remember'));
  const whisper = ctx.item<LineItem>('l08');
  let prog = 0, shown = 0, breathT = 0, spoke = false;
  gild.uRadius.value = 0.6;
  while (prog < 1) {
    const dt = await ctx.frame();
    const held = ctx.auto || input.held('remember');
    if (held) {
      prog = Math.min(1, prog + (dt / 9) * (ctx.auto ? 25 : 1));
      if (!spoke) { spoke = true; hud.sub(whisper.speaker, whisper.ur, whisper.en); hud.prompt(null); }
      breathT -= dt; if (breathT <= 0) { audio.breath(true, 1.7); breathT = 1.9; }
    } else prog = Math.max(shown / 5, prog - dt * 0.05);
    gild.uRadius.value = 0.6 + prog * 30;
    hud.ring(0.35 + prog * 0.65 + (held ? Math.sin(ctx.time * 3.3) * 0.04 : 0), 'اللہ', held ? '' : 'hold to remember');
    const n = Math.floor(prog * 5 + 0.0001);
    if (n > shown) { shown = n; hud.idCard(LETTERS, shown, ''); audio.daf(true); }
    tilt = 0.2 * (1 - prog);
    audio.setNarrow(0.85 * (1 - prog));
    ctx.mirror(0.06 + prog * 0.16);
  }
  tilt = 0; audio.setNarrow(0);
  hud.ring(null); hud.prompt(null); hud.clearSub();
  ctx.state.pillars.heart = Math.max(ctx.state.pillars.heart, 0.15);
  await ctx.wait(0.8);
  hud.idCard(['بُرہان'], 1, 'BURHAN');
  await ctx.say('l09');

  // Kashf. Neutral's grey screen cracks. Under the English mask, one Urdu word shows through.
  hud.idCard(null);
  ctx.cam([podium.x + 2.4, 2.9, podium.z + 6.5], [podium.x, 2.7, podium.z], 2);
  await ctx.wait(2);
  await hud.kashf('NEUTRAL', 'بھول', 'THE FORGETTING', (s) => ctx.wait(s), () => { audio.crack(); neutral.fig.setScreen(0x3a3b3e); });
  ctx.check();
  if (!ctx.state.unveiled.includes('ch1')) ctx.state.unveiled.push('ch1');
  await ctx.say('l10');
  // He breaks into grey dust that blows across the quad. The banners fall. The mosque door stands open.
  neutral.fig.root.visible = false;
  const N = 260, dustGeo = new THREE.BufferGeometry(), dp = new Float32Array(N * 3), dv: number[] = [];
  for (let i = 0; i < N; i++) { dp[i * 3] = podium.x + (Math.random() - 0.5) * 0.6; dp[i * 3 + 1] = 1 + Math.random() * 1.9; dp[i * 3 + 2] = podium.z + (Math.random() - 0.5) * 0.5; dv.push(2 + Math.random() * 5, (Math.random() - 0.4) * 1.2, 1 + Math.random() * 3); }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dustMat = new THREE.PointsMaterial({ color: 0x8d9096, size: 0.09, transparent: true, opacity: 1 });
  ctx.root.add(new THREE.Points(dustGeo, dustMat));
  ctx.onUpdate((dt) => { if (dustMat.opacity <= 0) return; for (let i = 0; i < N; i++) { dp[i * 3] += dv[i * 3] * dt; dp[i * 3 + 1] += dv[i * 3 + 1] * dt; dp[i * 3 + 2] += dv[i * 3 + 2] * dt; } dustGeo.attributes.position.needsUpdate = true; dustMat.opacity = Math.max(0, dustMat.opacity - dt * 0.22); });
  audio.whoosh();
  audio.setAmbient({ noise: { freq: 600, gain: 0.04, wobble: 0.6 } });
  banners.forEach((b, i) => setTimeout(() => hud.dropLabel(b), 500 + i * 600));
  await ctx.tween(5, (k) => { gild.uRadius.value = 30.6 + k * 90; });
  gild.uGild.value = 0;
  engine.setSky(0x7f9fb8, 0xdfe6d6, 30, 170);

  // The player only chooses to walk in. No prompt asks for it.
  ctx.follow(-Math.PI / 2, 0.24);
  pl.control = true; roam = true;
  const waitT = ctx.time;
  ctx.onUpdate(() => { if (roam && pl.control && ctx.time - waitT > 28) hud.objective('The mosque door stands open.'); });
  await ctx.reach(door.x, door.z, 1.9);
  roam = false; pl.control = false; hud.prompt(null); hud.objective(null);
  await ctx.until(() => !reading);

  // Wudu at the old tap, then Zuhr, alone. The camera stays distant. Nothing here is played.
  // The quad between the camera and the door empties.
  for (const w of [...walkers, studentA, studentB, azad]) { w.stop(); w.place(-6 - Math.random() * 9, -6 + Math.random() * 20); }
  ctx.cam([4.5, 1.5, 3.2], [21, 1.5, 9], 2.5);
  await ctx.go(pl, 20.0, 7.0, 1.4);
  pl.faceTo(20.0, 5); pl.fig.setPose('hold');
  audio.water(7.5);
  await ctx.wait(7.8);
  pl.fig.setPose('stand');
  await ctx.go(pl, 20.2, 9, 1.3);
  await ctx.go(pl, 23.3, 9, 1.2);
  pl.yaw = Math.PI / 2;
  await ctx.wait(3.5);
  await ctx.fade('#000', 1, 2.6);
  await ctx.wait(2);
  pl.fig.setPose('dua', true);
  ctx.cam([8, 1.4, 6.6], [23, 1.1, 9]);
  await ctx.fade('#000', 0, 2.6);
  // After the salam he raises his hands. There is no wheel, only his voice.
  await ctx.wait(1);
  await ctx.say('l11');
  ctx.mirror(0.3);
  ctx.state.pillars.heart = 0.3;
  await ctx.wait(1.2);
  hud.title('توبہ', 'TAWBAH', '(return)', true); hud.showTitle();
  audio.daf(true);
  await ctx.hold(6);
  await ctx.fade('#000', 1, 2.2);
  hud.clearTitle();
};

export const scenes: Record<string, SceneFn> = {
  'ch1.s01': theFinal,
  'ch1.s02': backstage,
  'ch1.s03': trail,
  'ch1.s04': sweeper,
  'ch1.s05': flicker,
  'ch1.s06': square,
};
