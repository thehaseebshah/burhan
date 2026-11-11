// People and animals, built from simple shapes.
// HARD RULE 1: nobody has facial features. No eyes, no nose, no mouth, anywhere in this file.
//  - believers: a smooth, mirror-like face that polishes as the heart polishes;
//  - people inside the Gilding: a screen for a face;
//  - animals: featureless too (pending switch, default).
import * as THREE from 'three';
import { mat, gildable } from '../core/engine';

const geoCache = new Map<string, THREE.BufferGeometry>();
function geo(key: string, make: () => THREE.BufferGeometry): THREE.BufferGeometry {
  let g = geoCache.get(key);
  if (!g) { g = make(); g.userData.shared = true; geoCache.set(key, g); }
  return g;
}
const cyl = (rt: number, rb: number, h: number, seg = 7) => geo(`c${rt}|${rb}|${h}|${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg));
const box = (w: number, h: number, d: number) => geo(`b${w}|${h}|${d}`, () => new THREE.BoxGeometry(w, h, d));
const sph = (r: number, a = 12, b = 9) => geo(`s${r}|${a}|${b}`, () => new THREE.SphereGeometry(r, a, b));

export type HeadKind = 'dull' | 'mirror' | 'screen';
export type Pose = 'stand' | 'ride' | 'sit' | 'sitGround' | 'kneel' | 'sujood' | 'down' | 'guard' | 'dua' | 'hold' | 'bow';
export type Prop = 'spear' | 'cane' | 'broom' | 'musket' | 'stick' | 'waterskin' | 'trophy' | 'phone' | 'none';

export interface FigureOpts {
  scale?: number;
  top: number;
  bottom?: number;
  /** long robe instead of legs */
  robe?: boolean;
  head?: HeadKind;
  clarity?: number;
  headgear?: 'turban' | 'cap' | 'furcap' | 'none';
  gearColor?: number;
  screenColor?: number;
  prop?: Prop;
  /** takes part in the Gilding */
  gild?: boolean;
  /** pending switch: draw as a flat dark silhouette */
  silhouette?: boolean;
  lataif?: boolean;
}

interface PoseVals { hy: number; bx: number; la: number; ra: number; az: number; ll: number; rl: number; fall: number }
const POSES: Record<Pose, PoseVals> = {
  stand: { hy: 0, bx: 0, la: 0, ra: 0, az: 0.06, ll: 0, rl: 0, fall: 0 },
  ride: { hy: -0.42, bx: 0.1, la: -0.9, ra: -0.45, az: 0.1, ll: -0.75, rl: -0.75, fall: 0 },
  sit: { hy: -0.42, bx: 0.08, la: -0.5, ra: -0.5, az: 0.05, ll: -1.45, rl: -1.45, fall: 0 },
  sitGround: { hy: -0.74, bx: 0.1, la: -0.55, ra: -0.55, az: 0.1, ll: -1.5, rl: -1.5, fall: 0 },
  kneel: { hy: -0.72, bx: 0.05, la: -0.25, ra: -0.25, az: 0.05, ll: 1.5, rl: 1.5, fall: 0 },
  sujood: { hy: -0.5, bx: 1.85, la: -2.7, ra: -2.7, az: 0.25, ll: 1.45, rl: 1.45, fall: 0 },
  down: { hy: -0.15, bx: 0, la: -0.4, ra: 0.5, az: 0.5, ll: 0.1, rl: -0.2, fall: 1 },
  guard: { hy: -0.06, bx: 0.12, la: -1.9, ra: -1.7, az: -0.35, ll: 0, rl: 0, fall: 0 },
  dua: { hy: -0.72, bx: 0.12, la: -1.25, ra: -1.25, az: -0.08, ll: 1.5, rl: 1.5, fall: 0 },
  hold: { hy: 0, bx: 0.05, la: -0.2, ra: -1.2, az: 0.02, ll: 0, rl: 0, fall: 0 },
  bow: { hy: -0.72, bx: 1.5, la: -2.4, ra: -2.4, az: 0.2, ll: 1.5, rl: 1.5, fall: 0 },
};

const SIL = new THREE.MeshBasicMaterial({ color: 0x14100c });
const RUST = new THREE.Color(0x6a5a4e), POLISH = new THREE.Color(0xf4f6f8), HELD = new THREE.Color(0xfff1cc);

export class Figure {
  root = new THREE.Group();
  hips = new THREE.Group();
  body = new THREE.Group();
  armL = new THREE.Group();
  armR = new THREE.Group();
  legL = new THREE.Group();
  legR = new THREE.Group();
  head: THREE.Mesh;
  hand = new THREE.Group();
  screen: THREE.Mesh | null = null;
  lataif: THREE.Mesh[] = [];
  private headMat: THREE.Material;
  private cur: PoseVals = { ...POSES.stand };
  pose: Pose = 'stand';
  /** set by movers: metres per second, drives the walk cycle */
  speed = 0;
  private phase = Math.random() * 6;
  private swingT = 0;
  private swingDur = 0.4;
  private haltT = 0;
  private shakeT = 0;
  private flinchT = 0;
  private nodT = 0;
  private sweepOn = false;
  readonly H: number;
  clarity = 0;
  private propMesh: THREE.Object3D | null = null;

  constructor(public opts: FigureOpts) {
    const s = opts.scale ?? 1;
    this.H = 0.88;
    this.root.scale.setScalar(s);
    this.root.rotation.order = 'YXZ';
    const g = !!opts.gild;
    const sil = !!opts.silhouette;
    const m = (c: number, smooth = false) => (sil ? SIL : mat(c, g, smooth));
    const bottom = opts.bottom ?? opts.top;

    this.hips.position.y = this.H;
    this.root.add(this.hips);
    this.hips.add(this.body, this.legL, this.legR);

    const torso = new THREE.Mesh(cyl(0.17, 0.25, 0.64), m(opts.top));
    torso.position.y = 0.32;
    this.body.add(torso);
    if (opts.robe) {
      const skirt = new THREE.Mesh(cyl(0.25, 0.36, this.H - 0.04), m(bottom));
      skirt.position.y = -(this.H - 0.04) / 2;
      this.hips.add(skirt);
      this.legL.visible = this.legR.visible = false;
    }
    for (const [leg, x] of [[this.legL, 0.11], [this.legR, -0.11]] as const) {
      leg.position.set(x, 0, 0);
      const lm = new THREE.Mesh(cyl(0.085, 0.07, this.H, 6), m(bottom));
      lm.position.y = -this.H / 2;
      leg.add(lm);
    }
    for (const [arm, x] of [[this.armL, 0.25], [this.armR, -0.25]] as const) {
      arm.position.set(x, 0.58, 0);
      const am = new THREE.Mesh(cyl(0.058, 0.05, 0.56, 6), m(opts.top));
      am.position.y = -0.28;
      arm.add(am);
      this.body.add(arm);
    }
    this.hand.position.y = -0.56;
    this.armR.add(this.hand);

    // The face: a smooth sphere. Nothing is ever drawn on it.
    const kind = opts.head ?? 'dull';
    if (sil) this.headMat = SIL;
    else if (kind === 'mirror') this.headMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1, roughness: 0.6, envMapIntensity: 1.4 });
    else this.headMat = mat(kind === 'screen' ? 0x3a3d42 : 0xa9a69f, g && kind === 'screen', true);
    this.head = new THREE.Mesh(sph(0.165), this.headMat);
    this.head.position.y = 0.84;
    this.body.add(this.head);
    if (kind === 'mirror' && !sil) this.setClarity(opts.clarity ?? 0.1);
    if (kind === 'screen' && !sil) {
      this.screen = new THREE.Mesh(box(0.27, 0.23, 0.03), new THREE.MeshBasicMaterial({ color: opts.screenColor ?? 0x9fd8ff }));
      this.screen.position.set(0, 0.84, 0.155);
      this.body.add(this.screen);
    }
    const gc = opts.gearColor ?? 0xe8e2d2;
    if (opts.headgear === 'turban') {
      const t = new THREE.Mesh(sph(0.19, 8, 5), m(gc)); t.scale.set(1.08, 0.62, 1.08); t.position.y = 0.95; this.body.add(t);
    } else if (opts.headgear === 'cap') {
      const t = new THREE.Mesh(cyl(0.15, 0.165, 0.09, 9), m(gc)); t.position.y = 0.975; this.body.add(t);
    } else if (opts.headgear === 'furcap') {
      const t = new THREE.Mesh(cyl(0.13, 0.17, 0.17, 8), m(gc)); t.position.y = 1.0; this.body.add(t);
    }
    if (opts.lataif && !sil) {
      // qalb (left, low), ruh (right, low), sirr (left, high), khafi (right, high), akhfa (centre)
      const spots: [number, number][] = [[0.09, 0.38], [-0.09, 0.38], [0.09, 0.5], [-0.09, 0.5], [0, 0.44]];
      for (const [x, y] of spots) {
        const l = new THREE.Mesh(sph(0.028, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff4d6, fog: false }));
        l.position.set(x, y, 0.2);
        l.visible = false;
        this.body.add(l);
        this.lataif.push(l);
      }
    }
    if (opts.prop && opts.prop !== 'none') this.setProp(opts.prop);
  }

  setProp(p: Prop) {
    if (this.propMesh) { this.propMesh.removeFromParent(); this.propMesh = null; }
    const sil = !!this.opts.silhouette;
    const m = (c: number) => (sil ? SIL : mat(c));
    let o: THREE.Object3D | null = null;
    if (p === 'spear') { const g = new THREE.Group(); const s = new THREE.Mesh(cyl(0.018, 0.018, 2.3, 5), m(0x6b4a2a)); const tip = new THREE.Mesh(geo('tip', () => new THREE.ConeGeometry(0.045, 0.24, 5)), m(0xb9bcc0)); tip.position.y = 1.27; g.add(s, tip); g.rotation.x = Math.PI / 2 - 0.25; g.position.z = 0.35; o = g; }
    else if (p === 'musket') { const s = new THREE.Mesh(box(0.05, 0.07, 1.4), m(0x4a3520)); s.position.z = 0.45; o = s; }
    else if (p === 'stick') { const s = new THREE.Mesh(cyl(0.022, 0.022, 0.9, 5), m(0x5a4028)); s.rotation.x = Math.PI / 2 - 0.5; s.position.z = 0.3; o = s; }
    else if (p === 'cane') { const s = new THREE.Mesh(cyl(0.016, 0.016, 0.86, 5), m(0x3a2616)); s.position.set(0, -0.3, 0.06); o = s; }
    else if (p === 'broom') { const g = new THREE.Group(); const s = new THREE.Mesh(cyl(0.016, 0.016, 1.25, 5), m(0x8a6a3a)); const b = new THREE.Mesh(cyl(0.03, 0.12, 0.3, 6), m(0xb99a5a)); b.position.y = -0.74; g.add(s, b); g.position.set(0, -0.25, 0.1); g.rotation.x = 0.35; o = g; }
    else if (p === 'waterskin') { const s = new THREE.Mesh(sph(0.2, 7, 5), m(0x6a4a34)); s.scale.set(0.8, 1.3, 0.7); this.body.add(s); s.position.set(0, 0.34, -0.25); this.propMesh = s; return; }
    else if (p === 'trophy') { o = makeTrophy(); o.position.y = -0.05; }
    else if (p === 'phone') { const s = new THREE.Mesh(box(0.07, 0.13, 0.012), new THREE.MeshBasicMaterial({ color: 0xcfe6ff })); s.position.set(0, -0.02, 0.05); s.rotation.x = -0.9; o = s; }
    if (o) { this.hand.add(o); this.propMesh = o; }
  }

  /** Heart-mirror: 0 = rust, 1 = polish. The face holds light as it clears. */
  setClarity(c: number) {
    this.clarity = THREE.MathUtils.clamp(c, 0, 1);
    const hm = this.headMat as THREE.MeshStandardMaterial;
    if (!hm.isMeshStandardMaterial) return;
    hm.color.copy(RUST).lerp(POLISH, Math.pow(this.clarity, 0.8));
    hm.roughness = THREE.MathUtils.lerp(0.78, 0.06, this.clarity);
    hm.emissive.copy(HELD).multiplyScalar(this.clarity * 0.22);
    // A rusted face holds no light; a polished one does.
    hm.envMapIntensity = 0.2 + this.clarity * 1.3;
  }
  setScreen(color: number) { if (this.screen) (this.screen.material as THREE.MeshBasicMaterial).color.set(color); }
  setLataif(lit: boolean[]) { this.lataif.forEach((l, i) => { l.visible = !!lit[i]; }); }

  setPose(p: Pose, instant = false) { this.pose = p; if (instant) this.cur = { ...POSES[p] }; }
  swing(dur = 0.4) { this.swingT = dur; this.swingDur = dur; }
  /** The arm goes up and stops. Used when the controls refuse to strike. */
  halt() { this.haltT = 1.1; this.swingT = 0; }
  shake(t = 3) { this.shakeT = t; }
  flinch() { this.flinchT = 0.3; }
  nod() { this.nodT = 0.7; }
  sweep(on: boolean) { this.sweepOn = on; }
  get busy() { return this.swingT > 0 || this.haltT > 0; }

  update(dt: number) {
    const t = POSES[this.pose], c = this.cur, k = 1 - Math.exp(-dt * 7);
    (Object.keys(c) as (keyof PoseVals)[]).forEach((key) => { c[key] += (t[key] - c[key]) * k; });
    const moving = this.speed > 0.15 && this.pose !== 'down';
    if (moving) this.phase += dt * (3.2 + this.speed * 1.5);
    const amp = moving ? Math.min(0.75, 0.25 + this.speed * 0.11) : 0;
    const sw = Math.sin(this.phase) * amp;
    this.hips.position.y = this.H + c.hy + (moving ? Math.abs(Math.cos(this.phase)) * 0.03 : 0);
    this.body.rotation.x = c.bx + (moving ? 0.06 + this.speed * 0.012 : 0) - (this.flinchT > 0 ? 0.35 : 0);
    this.legL.rotation.x = c.ll + sw; this.legR.rotation.x = c.rl - sw;
    let la = c.la - sw * 0.8, ra = c.ra + sw * 0.8;
    if (this.swingT > 0) {
      this.swingT -= dt;
      const p = 1 - this.swingT / this.swingDur; // 0..1
      ra = p < 0.4 ? THREE.MathUtils.lerp(c.ra, -2.6, p / 0.4) : THREE.MathUtils.lerp(-2.6, -0.5, (p - 0.4) / 0.6);
    }
    if (this.haltT > 0) {
      this.haltT -= dt;
      const p = 1 - this.haltT / 1.1;
      ra = p < 0.18 ? THREE.MathUtils.lerp(c.ra, -2.3, p / 0.18) : p < 0.7 ? -2.3 + Math.sin(p * 60) * 0.03 : THREE.MathUtils.lerp(-2.3, c.ra, (p - 0.7) / 0.3);
    }
    if (this.sweepOn) { const s = Math.sin(performance.now() / 380); ra = -0.75 + s * 0.3; la = -0.6 + s * 0.2; this.body.rotation.x += 0.22; this.body.rotation.y = s * 0.2; } else this.body.rotation.y *= 0.9;
    if (this.shakeT > 0) { this.shakeT -= dt; this.body.rotation.x += 0.45 + Math.sin(performance.now() / 70) * 0.025; this.body.position.y = Math.sin(performance.now() / 60) * 0.008; }
    if (this.flinchT > 0) this.flinchT -= dt;
    if (this.nodT > 0) { this.nodT -= dt; this.head.position.z = Math.sin((1 - this.nodT / 0.7) * Math.PI) * 0.05; this.body.rotation.x += Math.sin((1 - this.nodT / 0.7) * Math.PI) * 0.14; }
    this.armL.rotation.x = la; this.armR.rotation.x = ra;
    this.armL.rotation.z = c.az; this.armR.rotation.z = -c.az;
    const splay = this.pose === 'ride' ? 0.4 : this.pose === 'sitGround' ? 0.5 : 0;
    this.legL.rotation.z = splay; this.legR.rotation.z = -splay;
    this.root.rotation.x = -c.fall * 1.45;
    if (this.screen) this.screen.visible = true;
  }
}

/** The Professor Hadi Trophy: a brass cup. Only the name on its plate matters. */
export function makeTrophy(): THREE.Group {
  const g = new THREE.Group();
  const brass = mat(0xb58b3c);
  const base = new THREE.Mesh(box(0.14, 0.05, 0.14), mat(0x3a2a1a)); base.position.y = 0.025;
  const stem = new THREE.Mesh(cyl(0.02, 0.035, 0.12, 6), brass); stem.position.y = 0.11;
  const cup = new THREE.Mesh(cyl(0.085, 0.03, 0.16, 8), brass); cup.position.y = 0.25;
  g.add(base, stem, cup);
  return g;
}

/** A horse with no features: no eyes, no nostrils, no mouth. */
export class Horse {
  root = new THREE.Group();
  seat = new THREE.Group();
  private legs: THREE.Group[] = [];
  private bodyG = new THREE.Group();
  private phase = Math.random() * 6;
  speed = 0;
  constructor(color = 0x6b4a32, gilded = false) {
    const m = mat(color, gilded), dark = mat(0x2a1d14, gilded);
    const body = new THREE.Mesh(box(0.56, 0.62, 1.7), m); body.position.y = 1.18;
    const neck = new THREE.Mesh(box(0.3, 0.8, 0.36), m); neck.position.set(0, 1.62, 0.82); neck.rotation.x = 0.55;
    const head = new THREE.Mesh(box(0.25, 0.3, 0.6), m); head.position.set(0, 1.95, 1.22); head.rotation.x = 0.5;
    const mane = new THREE.Mesh(box(0.08, 0.7, 0.2), dark); mane.position.set(0, 1.72, 0.66); mane.rotation.x = 0.55;
    const tail = new THREE.Mesh(box(0.1, 0.7, 0.1), dark); tail.position.set(0, 1.05, -0.92); tail.rotation.x = -0.35;
    this.bodyG.add(body, neck, head, mane, tail);
    for (const [x, z] of [[0.2, 0.65], [-0.2, 0.65], [0.2, -0.65], [-0.2, -0.65]]) {
      const l = new THREE.Group(); l.position.set(x, 0.92, z);
      const lm = new THREE.Mesh(cyl(0.07, 0.055, 0.92, 5), m); lm.position.y = -0.46; l.add(lm);
      this.legs.push(l); this.bodyG.add(l);
    }
    this.seat.position.set(0, 1.5 - 0.88 + 0.42, -0.05);
    this.bodyG.add(this.seat);
    this.root.add(this.bodyG);
  }
  update(dt: number) {
    const moving = this.speed > 0.2;
    if (moving) this.phase += dt * (4 + this.speed * 1.1);
    const a = moving ? Math.min(0.8, 0.3 + this.speed * 0.06) : 0;
    this.legs[0].rotation.x = Math.sin(this.phase) * a;
    this.legs[1].rotation.x = Math.sin(this.phase + 1.2) * a;
    this.legs[2].rotation.x = Math.sin(this.phase + 3.1) * a;
    this.legs[3].rotation.x = Math.sin(this.phase + 4.3) * a;
    this.bodyG.position.y = moving ? Math.abs(Math.sin(this.phase)) * 0.07 : 0;
    this.bodyG.rotation.x = moving ? Math.sin(this.phase * 2) * 0.02 : 0;
  }
}

/** A crowd as instanced meshes: bodies, smooth heads, and (in the Gilding) screens for faces. */
export function makeCrowd(spots: { x: number; y: number; z: number; yaw: number; seated?: boolean }[], o: { colors: number[]; screens?: boolean; gild?: boolean; screenColors?: number[] }): THREE.Group {
  const g = new THREE.Group();
  const n = spots.length;
  const bodyM = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
  if (o.gild) gildable(bodyM);
  const bodies = new THREE.InstancedMesh(geo('crowdbody', () => new THREE.CylinderGeometry(0.17, 0.27, 1.0, 6)), bodyM, n);
  const heads = new THREE.InstancedMesh(sph(0.165, 8, 6), mat(o.screens ? 0x3a3d42 : 0xa9a69f, !!o.gild, true), n);
  const screens = o.screens ? new THREE.InstancedMesh(box(0.27, 0.23, 0.03), new THREE.MeshBasicMaterial({ color: 0xffffff }), n) : null;
  const d = new THREE.Object3D(), c = new THREE.Color();
  spots.forEach((s, i) => {
    const h = s.seated ? 0.62 : 1.22;
    d.rotation.set(0, s.yaw, 0);
    d.scale.set(1, s.seated ? 0.62 : 1.22, 1);
    d.position.set(s.x, s.y + h / 2, s.z); d.updateMatrix(); bodies.setMatrixAt(i, d.matrix);
    bodies.setColorAt(i, c.set(o.colors[i % o.colors.length]).offsetHSL(0, 0, (Math.sin(i * 12.9898) * 0.5) * 0.08));
    d.scale.set(1, 1, 1);
    d.position.set(s.x, s.y + h + 0.2, s.z); d.updateMatrix(); heads.setMatrixAt(i, d.matrix);
    if (screens) {
      d.position.set(s.x + Math.sin(s.yaw) * 0.155, s.y + h + 0.2, s.z + Math.cos(s.yaw) * 0.155); d.updateMatrix(); screens.setMatrixAt(i, d.matrix);
      const sc = o.screenColors ?? [0x9fd8ff, 0xffc7e8, 0xd6ffd0, 0xfff0b0];
      screens.setColorAt(i, c.set(sc[i % sc.length]));
    }
  });
  bodies.frustumCulled = heads.frustumCulled = false;
  g.add(bodies, heads);
  if (screens) { screens.frustumCulled = false; g.add(screens); }
  return g;
}
