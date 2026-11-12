// People and animals: jointed bodies with shoulders, elbows, hips, knees and ankles,
// dressed in cloth, with hands, shoes, hair and headgear.
// HARD RULE 1: nobody has facial features. No eyes, no nose, no mouth, anywhere in this file.
//  - believers: a smooth, mirror-like face that polishes as the heart polishes;
//  - others: a face like unpolished steel;
//  - people inside the Gilding: a screen for a face;
//  - animals: no eyes, nostrils or mouth either (pending switch, default).
import * as THREE from 'three';
import { mat, surface, K, type Kind } from '../core/engine';

const geoCache = new Map<string, THREE.BufferGeometry>();
function geo(key: string, make: () => THREE.BufferGeometry): THREE.BufferGeometry {
  let g = geoCache.get(key);
  if (!g) { g = make(); g.userData.shared = true; geoCache.set(key, g); }
  return g;
}
/** A tapered, round-ended limb hanging from the origin down to -len. */
function limbGeo(len: number, r0: number, r1: number, seg = 12): THREE.BufferGeometry {
  return geo(`l${len}|${r0}|${r1}|${seg}`, () => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 5; i++) { const a = (i / 5) * Math.PI / 2; pts.push(new THREE.Vector2(Math.sin(a) * r0, Math.cos(a) * r0)); }
    for (let i = 0; i <= 5; i++) { const a = (i / 5) * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r1, -len - Math.sin(a) * r1)); }
    return new THREE.LatheGeometry(pts, seg);
  });
}
/** A turned profile (y, radius pairs), squashed front to back: torsos, tunics, skirts. */
function turned(key: string, prof: [number, number][], depth = 0.66, seg = 18): THREE.BufferGeometry {
  return geo(key, () => {
    // points must climb, or the surface faces inward
    const up = prof[0][0] <= prof[prof.length - 1][0] ? prof : [...prof].reverse();
    const g = new THREE.LatheGeometry(up.map(([y, r]) => new THREE.Vector2(r, y)), seg);
    g.scale(1, 1, depth);
    g.computeVertexNormals();
    return g;
  });
}
const ball = (r: number, a = 18, b = 14) => geo(`s${r}|${a}|${b}`, () => new THREE.SphereGeometry(r, a, b));
const box = (w: number, h: number, d: number) => geo(`b${w}|${h}|${d}`, () => new THREE.BoxGeometry(w, h, d));
const cyl = (rt: number, rb: number, h: number, seg = 12) => geo(`c${rt}|${rb}|${h}|${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg));

export type HeadKind = 'dull' | 'mirror' | 'screen';
export type Pose = 'stand' | 'ride' | 'sit' | 'sitHold' | 'sitGround' | 'kneel' | 'sujood' | 'down' | 'guard' | 'dua' | 'hold' | 'bow';
export type Prop = 'spear' | 'cane' | 'broom' | 'musket' | 'stick' | 'waterskin' | 'trophy' | 'phone' | 'none';
export type Outfit = 'kameez' | 'western' | 'coat' | 'robe' | 'uniform';

export interface FigureOpts {
  scale?: number;
  top: number;
  bottom?: number;
  /** long robe to the ankles */
  robe?: boolean;
  outfit?: Outfit;
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
  skin?: number;
  hair?: number;
  shoes?: number;
}

// ---------------------------------------------------------------- the human body
// A modelled, skinned human (see tools/build-human.mjs): one continuous body with hands and
// fingers, dressed by region. Its face has been smoothed to an oval: no eyes, nose or mouth.
interface Packed { verts: number; tris: number; groups: { region: string; start: number; count: number }[]; position: string; normal: string; skinIndex: string; skinWeight: string; index: string }
interface HumanMeta { bones: { name: string; parent: string | null; head: number[] }[]; tips: { L: number[]; R: number[] }; headCenter: number[]; headRadius: number[]; chestFront: number[][]; hips: { halfWidth: number; front: number; back: number } }
const REGIONS = ['skin', 'top', 'bottom', 'shoe', 'face', 'hair'];
const B = { hips: 0, waist: 1, chest: 2, neck: 3, head: 4, clavL: 5, upperarmL: 6, forearmL: 7, handL: 8, clavR: 9, upperarmR: 10, forearmR: 11, handR: 12, thighL: 13, shinL: 14, footL: 15, thighR: 16, shinR: 17, footR: 18 } as const;
interface Human {
  meta: HumanMeta; full: THREE.BufferGeometry; low: { pos: Float32Array; si: Uint8Array; sw: Uint8Array; index: Uint16Array; groups: Packed['groups'] };
  heads: THREE.Vector3[]; parent: number[]; inverses: THREE.Matrix4[];
  /** per bone: undo the parent's straightening, and straighten this one (limbs hang straight down at rest) */
  pre: THREE.Quaternion[]; post: THREE.Quaternion[];
  hc: THREE.Vector3; hr: THREE.Vector3; hipY: number;
}
let HUMAN: Human;
const bytes = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** Load the body once, before any scene builds a person. */
export async function loadHuman(): Promise<void> {
  if (HUMAN) return;
  const data = (await import('../assets/human.json')).default as unknown as { meta: HumanMeta; full: Packed; low: Packed };
  const f = data.full, meta = data.meta;
  const full = new THREE.BufferGeometry();
  full.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bytes(f.position).buffer), 3));
  full.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(bytes(f.normal).buffer), 3));
  full.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(Array.from(bytes(f.skinIndex)), 4));
  full.setAttribute('skinWeight', new THREE.BufferAttribute(bytes(f.skinWeight), 4, true));
  full.setIndex(new THREE.BufferAttribute(new Uint16Array(bytes(f.index).buffer), 1));
  for (const g of f.groups) full.addGroup(g.start, g.count, REGIONS.indexOf(g.region));
  full.userData.shared = true;
  full.computeBoundingSphere();
  const l = data.low;
  const heads = meta.bones.map((b) => new THREE.Vector3(...b.head));
  const names = meta.bones.map((b) => b.name);
  const parent = meta.bones.map((b) => (b.parent ? names.indexOf(b.parent) : -1));
  const down = new THREE.Vector3(0, -1, 0), I = new THREE.Quaternion();
  const child: Record<number, THREE.Vector3> = {
    [B.upperarmL]: heads[B.forearmL], [B.forearmL]: heads[B.handL], [B.handL]: new THREE.Vector3(...meta.tips.L),
    [B.upperarmR]: heads[B.forearmR], [B.forearmR]: heads[B.handR], [B.handR]: new THREE.Vector3(...meta.tips.R),
    [B.thighL]: heads[B.shinL], [B.shinL]: heads[B.footL], [B.thighR]: heads[B.shinR], [B.shinR]: heads[B.footR],
  };
  const post = heads.map((h, i) => (child[i] ? new THREE.Quaternion().setFromUnitVectors(child[i].clone().sub(h).normalize(), down) : I.clone()));
  const pre = parent.map((p) => (p >= 0 ? post[p].clone().invert() : I.clone()));
  HUMAN = {
    meta, full, heads, parent, pre, post,
    low: { pos: new Float32Array(bytes(l.position).buffer), si: bytes(l.skinIndex), sw: bytes(l.skinWeight), index: new Uint16Array(bytes(l.index).buffer), groups: l.groups },
    inverses: heads.map((h) => new THREE.Matrix4().makeTranslation(-h.x, -h.y, -h.z)),
    hc: new THREE.Vector3(...meta.headCenter), hr: new THREE.Vector3(...meta.headRadius), hipY: heads[B.hips].y,
  };
}
/** How far forward the chest stands at a given height. */
function chestZ(y: number): number {
  const c = HUMAN.meta.chestFront;
  for (let i = 0; i < c.length - 1; i++) if (y <= c[i + 1][0]) { const t = (y - c[i][0]) / (c[i + 1][0] - c[i][0]); return c[i][1] + (c[i + 1][1] - c[i][1]) * Math.max(0, t); }
  return c[c.length - 1][1];
}

interface PoseVals {
  hy: number; bx: number; fall: number;
  /** shoulders, elbows, arm spread */
  la: number; ra: number; le: number; re: number; az: number;
  /** thighs, knees, leg spread */
  ll: number; rl: number; lk: number; rk: number; lz: number;
}
const P = (o: Partial<PoseVals>): PoseVals => ({ hy: 0, bx: 0, fall: 0, la: 0.02, ra: 0.02, le: -0.2, re: -0.2, az: 0.14, ll: 0, rl: 0, lk: 0.03, rk: 0.03, lz: 0.03, ...o });
const POSES: Record<Pose, PoseVals> = {
  stand: P({}),
  ride: P({ hy: -0.3, bx: 0.08, la: -0.55, ra: -0.5, le: -0.95, re: -0.9, az: 0.12, ll: -1.0, rl: -1.0, lk: 1.15, rk: 1.15, lz: 0.5 }),
  sit: P({ hy: -0.44, bx: 0.05, la: -0.42, ra: -0.42, le: -1.0, re: -1.0, az: 0.1, ll: -1.5, rl: -1.5, lk: 1.52, rk: 1.52, lz: 0.09 }),
  sitHold: P({ hy: -0.44, bx: 0.12, la: -0.42, ra: -0.7, le: -1.0, re: -1.55, az: 0.1, ll: -1.5, rl: -1.5, lk: 1.52, rk: 1.52, lz: 0.09 }),
  sitGround: P({ hy: -0.79, bx: 0.12, la: -0.55, ra: -0.55, le: -0.75, re: -0.75, az: 0.24, ll: -1.42, rl: -1.42, lk: 2.3, rk: 2.3, lz: 0.72 }),
  kneel: P({ hy: -0.7, bx: 0.04, la: -0.45, ra: -0.45, le: -0.6, re: -0.6, az: 0.1, ll: -1.25, rl: -1.25, lk: 2.72, rk: 2.72, lz: 0.07 }),
  sujood: P({ hy: -0.445, bx: 1.9, la: -2.3, ra: -2.3, le: -1.15, re: -1.15, az: 0.3, ll: -0.36, rl: -0.36, lk: 1.86, rk: 1.86, lz: 0.09 }),
  bow: P({ hy: -0.445, bx: 1.85, la: -2.45, ra: -2.45, le: -0.75, re: -0.75, az: 0.36, ll: -0.36, rl: -0.36, lk: 1.86, rk: 1.86, lz: 0.11 }),
  down: P({ hy: -0.12, fall: 1, la: -0.5, ra: 0.5, le: -0.5, re: -0.9, az: 0.6, ll: 0.1, rl: -0.3, lk: 0.2, rk: 0.7, lz: 0.16 }),
  guard: P({ hy: -0.07, bx: 0.14, la: -1.25, ra: -1.1, le: -1.75, re: -1.6, az: 0.02, ll: -0.25, rl: 0.2, lk: 0.35, rk: 0.25, lz: 0.1 }),
  dua: P({ hy: -0.7, bx: 0.1, la: -0.95, ra: -0.95, le: -1.4, re: -1.4, az: 0.08, ll: -1.25, rl: -1.25, lk: 2.72, rk: 2.72, lz: 0.07 }),
  hold: P({ bx: 0.03, ra: -0.5, re: -1.25 }),
};

/** The 19 bones, and how a pose turns them. Shared by people and by the baked crowd bodies. */
class Rig {
  bones: THREE.Bone[];
  private e = new THREE.Euler();
  private q = new THREE.Quaternion();
  constructor() {
    const H = HUMAN;
    this.bones = H.heads.map((_, i) => { const b = new THREE.Bone(); b.name = H.meta.bones[i].name; return b; });
    this.bones.forEach((b, i) => { const p = H.parent[i]; if (p >= 0) { this.bones[p].add(b); b.position.copy(H.heads[i]).sub(H.heads[p]); } else b.position.copy(H.heads[i]); });
  }
  turn(i: number, x: number, y = 0, z = 0) {
    this.q.setFromEuler(this.e.set(x, y, z, 'XYZ'));
    this.bones[i].quaternion.copy(HUMAN.pre[i]).multiply(this.q).multiply(HUMAN.post[i]);
  }
  /** v: the pose. Extras: twist of the spine, tilt of the head, hip sway. */
  apply(v: PoseVals, by = 0, headX = 0, hipYaw = 0, hipRoll = 0, flat = true) {
    this.bones[B.hips].position.y = HUMAN.hipY + v.hy;
    this.turn(B.hips, 0, hipYaw, hipRoll);
    this.turn(B.waist, v.bx * 0.45, by * 0.4 - hipYaw * 0.6, -hipRoll);
    this.turn(B.chest, v.bx * 0.55, by * 0.6);
    this.turn(B.neck, headX * 0.4 - v.bx * 0.12);
    this.turn(B.head, headX * 0.6 - v.bx * 0.1);
    this.turn(B.clavL, 0); this.turn(B.clavR, 0);
    this.turn(B.upperarmL, v.la, 0, v.az); this.turn(B.upperarmR, v.ra, 0, -v.az);
    this.turn(B.forearmL, v.le); this.turn(B.forearmR, v.re);
    this.turn(B.handL, -0.1); this.turn(B.handR, -0.1);
    this.turn(B.thighL, v.ll, 0, v.lz); this.turn(B.thighR, v.rl, 0, -v.lz);
    this.turn(B.shinL, v.lk); this.turn(B.shinR, v.rk);
    this.turn(B.footL, flat ? -(v.ll + v.lk) * 0.9 : 0.6); this.turn(B.footR, flat ? -(v.rl + v.rk) * 0.9 : 0.6);
  }
}

const SIL = new THREE.MeshBasicMaterial({ color: 0x100d0a });
const RUST = new THREE.Color(0x5f5148), POLISH = new THREE.Color(0xf4f6f8), HELD = new THREE.Color(0xfff1cc);
const SKINS = [0xb98058, 0xa87148, 0xc48f66, 0x966540];
const HAIRS = [0x15110e, 0x1d1712, 0x2a211a, 0x0f0d0c];

export class Figure {
  root = new THREE.Group();
  /** model-space anchors riding on the hips, chest, head and right hand */
  hips = new THREE.Group();
  body = new THREE.Group();
  hand = new THREE.Group();
  head: THREE.Mesh;
  screen: THREE.Mesh | null = null;
  lataif: THREE.Mesh[] = [];
  private headG = new THREE.Group();
  private rig = new Rig();
  private skirt: THREE.Mesh | null = null;
  private headMat: THREE.Material;
  private cur: PoseVals = { ...POSES.stand };
  private v: PoseVals = { ...POSES.stand };
  pose: Pose = 'stand';
  /** set by movers: metres per second, drives the walk cycle */
  speed = 0;
  private phase = Math.random() * 6;
  private idle = Math.random() * 6;
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
    const Hm = HUMAN, s = opts.scale ?? 1;
    this.H = Hm.hipY;
    this.root.scale.setScalar(s);
    this.root.rotation.order = 'YXZ';
    const g = !!opts.gild, sil = !!opts.silhouette;
    const seed = (opts.top * 7 + (opts.bottom ?? 0) * 3 + Math.round(s * 100)) % 4;
    const cloth = (c: number) => (sil ? SIL : mat(c, g, true, K.cloth));
    const skin = sil ? SIL : mat(opts.skin ?? SKINS[seed], g, true, K.skin);
    const bottom = opts.bottom ?? opts.top;
    const outfit: Outfit = opts.outfit ?? (opts.robe ? 'robe' : bottom === opts.top ? 'kameez' : 'western');
    const loose = outfit === 'kameez' || outfit === 'robe';
    const mk = (geom: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geom, m); o.position.set(x, y, z); parent.add(o); return o; };

    // the face: a smooth oval. Nothing is ever drawn on it.
    const kind = opts.head ?? 'dull';
    if (sil) this.headMat = SIL;
    else if (kind === 'mirror') this.headMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1, roughness: 0.6 });
    else if (kind === 'screen') this.headMat = mat(0x2a2c30, g, true, K.plain);
    else this.headMat = geoMat('dullface', () => new THREE.MeshStandardMaterial({ color: 0x9a9995, metalness: 0.75, roughness: 0.62 }));
    const gear = opts.headgear ?? 'none';
    const hairM = sil ? SIL : mat(opts.hair ?? HAIRS[seed], g, true, K.bark);
    const shoeM = sil ? SIL : mat(opts.shoes ?? (loose ? 0x4a3524 : 0x1b1b1e), g, true, K.plain);
    // one continuous skinned body: skin, top, bottom, shoes, face, hair
    const body = new THREE.SkinnedMesh(Hm.full, [skin, cloth(opts.top), cloth(bottom), shoeM, this.headMat, hairM]);
    this.root.add(this.rig.bones[B.hips]);
    this.root.add(body);
    body.bind(new THREE.Skeleton(this.rig.bones, Hm.inverses), new THREE.Matrix4());
    body.frustumCulled = false;

    // anchors in model space
    const anchor = (grp: THREE.Group, bone: number) => { grp.position.copy(Hm.heads[bone]).negate(); this.rig.bones[bone].add(grp); return grp; };
    anchor(this.hips, B.hips); anchor(this.body, B.chest);
    const headA = anchor(new THREE.Group(), B.head);
    this.headG.position.copy(Hm.hc); headA.add(this.headG);
    this.hand.position.copy(new THREE.Vector3(...Hm.meta.tips.R)).sub(Hm.heads[B.handR]).multiplyScalar(0.8);
    this.hand.quaternion.copy(Hm.post[B.handR]).invert();
    this.rig.bones[B.handR].add(this.hand);

    // inside the oval, a second one: the face is closed everywhere
    this.head = mk(ball(1, 24, 18), this.headMat, this.headG);
    this.head.scale.set(Hm.hr.x * 0.985, Hm.hr.y * 0.985, Hm.hr.z * 0.985);
    if (kind === 'mirror' && !sil) this.setClarity(opts.clarity ?? 0.1);
    const R = Hm.hr, gc = opts.gearColor ?? 0xe8e2d2;
    if (gear === 'turban') {
      for (let i = 0; i < 4; i++) { const t = mk(geo(`wrap${i}`, () => new THREE.TorusGeometry(0.092 - i * 0.01, 0.04, 10, 24)), cloth(gc), this.headG, 0, R.y * 0.42 + i * 0.03, -0.008); t.rotation.set(Math.PI / 2 + (i - 1.5) * 0.13, 0, i * 0.5); t.scale.set(1, 1.18, 1); }
      mk(ball(0.08, 16, 10), cloth(gc), this.headG, 0, R.y * 0.42 + 0.115, -0.01).scale.y = 0.55;
      mk(box(0.07, 0.24, 0.014), cloth(gc), this.headG, 0.04, -0.06, -R.z - 0.012).rotation.z = 0.1; // the loose end, down the back
    } else if (gear === 'cap') {
      mk(cyl(0.083, 0.088, 0.07, 20), cloth(gc), this.headG, 0, R.y * 0.72, -0.004).scale.z = 1.2;
      mk(ball(0.083, 18, 8), cloth(gc), this.headG, 0, R.y * 0.72 + 0.034, -0.004).scale.set(1, 0.2, 1.2);
    } else if (gear === 'furcap') {
      const f = mk(turned('karakul', [[0, 0.088], [0.05, 0.094], [0.13, 0.08], [0.165, 0.045], [0.17, 0.0]], 1.25), sil ? SIL : mat(gc, g, true, K.bark), this.headG, 0, R.y * 0.5, -0.004);
      f.scale.x = 0.92;
    }
    if (kind === 'screen' && !sil) {
      this.screen = mk(box(0.15, 0.2, 0.014), new THREE.MeshBasicMaterial({ color: opts.screenColor ?? 0x9fd8ff }), this.headG, 0, 0, R.z + 0.012);
      mk(box(0.165, 0.215, 0.012), mat(0x0c0d0f, false, true, K.metal), this.headG, 0, 0, R.z + 0.004);
    }

    // loose cloth below the waist: the kameez hem, a coat's skirts, or a robe
    const hem = outfit === 'robe' ? 0.84 : outfit === 'kameez' ? 0.52 : outfit === 'coat' ? 0.4 : outfit === 'uniform' ? 0.16 : 0;
    if (hem > 0) {
      const w0 = Hm.meta.hips.halfWidth + 0.012, flare = w0 + (outfit === 'robe' ? 0.09 : 0.035);
      this.skirt = mk(turned(`skirt${hem}|${flare}`, [[0.13, w0 - 0.035], [0.02, w0], [-hem * 0.5, (w0 + flare) / 2], [-hem, flare], [-hem - 0.012, flare - 0.025]], 0.78), cloth(outfit === 'robe' ? bottom : opts.top), this.hips, 0, Hm.hipY, 0.02);
    }
    if (outfit === 'uniform' && !sil) mk(cyl(0.172, 0.176, 0.04, 20), mat(outfit === 'uniform' ? 0xe8e2d2 : 0x1c1714, g, true, K.plain), this.hips, 0, Hm.hipY + 0.11, 0.022).scale.z = 0.72;
    if (outfit === 'uniform' && !sil) for (const r of [0.62, -0.62]) { const b = mk(box(0.045, 0.6, 0.012), mat(0xe8e2d2, g, true, K.cloth), this.body, 0, 1.25, chestZ(1.25) + 0.012); b.rotation.z = r; }
    if (outfit === 'coat' && !sil) {
      // a shirt front and a tie under the coat
      const sh = mk(box(0.085, 0.2, 0.01), mat(0xe8e6e0, g, true, K.cloth), this.body, 0, 1.36, chestZ(1.36) + 0.004); sh.rotation.x = -0.32;
      mk(box(0.03, 0.18, 0.012), mat(0x3a1418, g, true, K.cloth), this.body, 0, 1.355, chestZ(1.355) + 0.01).rotation.x = -0.32;
    }

    if (opts.lataif && !sil) {
      // qalb (left, low), ruh (right, low), sirr (left, high), khafi (right, high), akhfa (centre)
      const spots: [number, number][] = [[0.07, 1.25], [-0.07, 1.25], [0.07, 1.35], [-0.07, 1.35], [0, 1.3]];
      for (const [x, y] of spots) {
        const l = mk(ball(0.018, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff1cc).multiplyScalar(3), fog: false }), this.body, x, y, chestZ(y) + 0.006);
        l.visible = false;
        this.lataif.push(l);
      }
    }
    if (opts.prop && opts.prop !== 'none') this.setProp(opts.prop);
    this.update(0);
  }

  setProp(p: Prop) {
    if (this.propMesh) { this.propMesh.removeFromParent(); this.propMesh = null; }
    const sil = !!this.opts.silhouette;
    const m = (c: number, k: Kind = K.wood) => (sil ? SIL : mat(c, false, true, k));
    let o: THREE.Object3D | null = null;
    if (p === 'spear') {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(cyl(0.016, 0.018, 2.3, 8), m(0x6b4a2a)));
      const tip = new THREE.Mesh(geo('tip', () => new THREE.ConeGeometry(0.036, 0.3, 4)), m(0xc9ccd0, K.metal)); tip.position.y = 1.3; tip.scale.z = 0.35; g.add(tip);
      g.rotation.x = Math.PI / 2 - 0.2; g.position.z = 0.3; o = g;
    } else if (p === 'musket') {
      const g = new THREE.Group();
      const stock = new THREE.Mesh(box(0.045, 0.085, 0.5), m(0x4a3018)); stock.position.z = -0.1;
      const barrel = new THREE.Mesh(cyl(0.014, 0.016, 1.05, 8), m(0x2a2c30, K.metal)); barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.03, 0.62);
      const wood = new THREE.Mesh(box(0.035, 0.04, 0.8), m(0x4a3018)); wood.position.set(0, 0.0, 0.5);
      const blade = new THREE.Mesh(cyl(0.004, 0.012, 0.36, 4), m(0xc9ccd0, K.metal)); blade.rotation.x = Math.PI / 2; blade.position.set(0, 0.03, 1.32);
      g.add(stock, barrel, wood, blade); g.position.z = 0.08; o = g;
    } else if (p === 'stick') { const s = new THREE.Mesh(cyl(0.02, 0.022, 0.95, 8), m(0x4a3520)); s.rotation.x = Math.PI / 2 - 0.5; s.position.z = 0.32; o = s; }
    else if (p === 'cane') { const g = new THREE.Group(); const s = new THREE.Mesh(cyl(0.012, 0.014, 0.88, 8), m(0x2e1c10)); s.position.y = -0.4; const h = new THREE.Mesh(geo('crook', () => new THREE.TorusGeometry(0.035, 0.012, 6, 10, Math.PI)), m(0x2e1c10)); h.position.set(0, 0.04, -0.035); h.rotation.y = Math.PI / 2; g.add(s, h); g.position.set(0, 0.0, 0.03); o = g; }
    else if (p === 'broom') {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(cyl(0.013, 0.015, 1.3, 8), m(0x8a6a3a)));
      const head = new THREE.Mesh(geo('bristle', () => new THREE.ConeGeometry(0.16, 0.42, 12, 1, true)), m(0xb99a5a, K.bark)); head.position.y = -0.82; head.scale.z = 0.45; g.add(head);
      g.position.set(0, -0.22, 0.1); g.rotation.x = 0.38; o = g;
    } else if (p === 'waterskin') { // the mashk, slung across the back
      const s = new THREE.Mesh(ball(0.2, 14, 10), m(0x5a3e2a, K.plain)); s.scale.set(0.85, 1.35, 0.7); s.rotation.z = 0.5; s.position.set(0.02, 1.22, -0.26);
      const strap = new THREE.Mesh(box(0.04, 0.6, 0.012), m(0x3a2616, K.plain)); strap.position.set(0, 1.26, chestZ(1.26) + 0.012); strap.rotation.z = 0.6;
      const g = new THREE.Group(); g.add(s, strap); this.body.add(g); this.propMesh = g; return;
    } else if (p === 'trophy') { o = makeTrophy(); o.position.y = -0.06; }
    else if (p === 'phone') {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(box(0.072, 0.15, 0.009), m(0x0c0d0f, K.metal)));
      const scr = new THREE.Mesh(box(0.064, 0.138, 0.003), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xcfe6ff).multiplyScalar(1.4) })); scr.position.z = 0.006; g.add(scr);
      g.position.set(0, 0.02, 0.04); g.rotation.x = -1.0; o = g;
    }
    if (o) { this.hand.add(o); this.propMesh = o; }
  }

  /** Heart-mirror: 0 = rust, 1 = polish. The face holds light as it clears. */
  setClarity(c: number) {
    this.clarity = THREE.MathUtils.clamp(c, 0, 1);
    const hm = this.headMat as THREE.MeshStandardMaterial;
    if (!hm.isMeshStandardMaterial || this.opts.head !== 'mirror') return;
    hm.color.copy(RUST).lerp(POLISH, Math.pow(this.clarity, 0.8));
    hm.roughness = THREE.MathUtils.lerp(0.8, 0.05, this.clarity);
    hm.emissive.copy(HELD).multiplyScalar(this.clarity * 0.16);
    // A rusted face holds no light; a polished one does.
    hm.envMapIntensity = 0.25 + this.clarity * 1.6;
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
    const t = POSES[this.pose], c = this.cur, v = this.v, k = 1 - Math.exp(-dt * 7);
    (Object.keys(c) as (keyof PoseVals)[]).forEach((key) => { c[key] += (t[key] - c[key]) * k; v[key] = c[key]; });
    const upright = this.pose === 'stand' || this.pose === 'hold' || this.pose === 'guard';
    const moving = this.speed > 0.15 && upright;
    const run = THREE.MathUtils.clamp((this.speed - 2.6) / 2.6, 0, 1);
    if (moving) this.phase += dt * (3.3 + this.speed * 1.35);
    this.idle += dt;
    const sn = Math.sin(this.phase), cs = Math.cos(this.phase);
    const amp = moving ? Math.min(0.95, 0.3 + this.speed * 0.115) : 0;
    const breath = Math.sin(this.idle * 1.5) * 0.012;
    let by = 0, headX = 0, hipYaw = 0, hipRoll = Math.sin(this.idle * 0.6) * 0.008;
    if (moving) {
      // the thigh swings; the knee folds as the leg comes through; arms answer the legs
      v.ll += -sn * amp; v.rl += sn * amp;
      v.lk += Math.max(0, cs) * amp * (1.25 + run * 0.7) + 0.08;
      v.rk += Math.max(0, -cs) * amp * (1.25 + run * 0.7) + 0.08;
      v.hy += -Math.abs(sn) * 0.035 * (1 + run) + 0.02;
      v.bx += 0.05 + run * 0.16;
      by = -sn * 0.12; hipYaw = sn * 0.08; hipRoll = cs * 0.03;
      v.la += sn * amp * 0.75; v.ra += -sn * amp * 0.75;
      v.le += -(0.2 + run * 0.95) - Math.max(0, sn) * 0.3;
      v.re += -(0.2 + run * 0.95) - Math.max(0, -sn) * 0.3;
    }
    v.bx += breath;
    if (this.swingT > 0) {
      this.swingT -= dt;
      const p = 1 - this.swingT / this.swingDur;
      if (p < 0.4) { const q = p / 0.4; v.ra = THREE.MathUtils.lerp(c.ra, -2.9, q); v.re = -0.9 * q; by += 0.35 * q; }
      else { const q = (p - 0.4) / 0.6; v.ra = THREE.MathUtils.lerp(-2.9, -0.5, q); v.re = THREE.MathUtils.lerp(-0.9, -0.2, q); by += 0.35 - 0.8 * Math.sin(q * Math.PI * 0.5); v.bx += 0.18 * Math.sin(q * Math.PI); }
    }
    if (this.haltT > 0) {
      this.haltT -= dt;
      const p = 1 - this.haltT / 1.1;
      v.ra = p < 0.18 ? THREE.MathUtils.lerp(c.ra, -2.5, p / 0.18) : p < 0.7 ? -2.5 + Math.sin(p * 60) * 0.03 : THREE.MathUtils.lerp(-2.5, c.ra, (p - 0.7) / 0.3);
      v.re = -0.8;
    }
    if (this.sweepOn) { const s = Math.sin(this.idle * 2.6); v.ra = -0.7 + s * 0.28; v.la = -0.85 + s * 0.2; v.re = -0.55; v.le = -0.9; v.bx += 0.26; by += s * 0.2; }
    if (this.shakeT > 0) { this.shakeT -= dt; v.bx += 0.5 + Math.sin(this.idle * 14) * 0.02; v.la = -0.9; v.ra = -0.9; v.le = -1.9; v.re = -1.9; headX = 0.5; }
    else headX = this.nodT > 0 ? Math.sin((1 - this.nodT / 0.7) * Math.PI) * 0.4 : (this.pose === 'sujood' || this.pose === 'bow' ? -0.5 : this.pose === 'sitHold' ? 0.3 : 0);
    if (this.flinchT > 0) { this.flinchT -= dt; v.bx -= 0.32; }
    if (this.nodT > 0) this.nodT -= dt;
    const flat = upright || this.pose === 'sit' || this.pose === 'sitHold' || this.pose === 'ride';
    this.rig.apply(v, by, headX, hipYaw, hipRoll, flat);
    // cloth below the waist follows the thighs
    if (this.skirt) {
      this.skirt.rotation.x = ((v.ll + v.rl) / 2) * 0.92;
      this.skirt.scale.z = 1 + Math.min(0.5, Math.abs(v.ll - v.rl) * 0.3);
      this.skirt.scale.y = this.pose === 'kneel' || this.pose === 'dua' || this.pose === 'sujood' || this.pose === 'bow' || this.pose === 'sitGround' ? 0.6 : 1;
    }
    this.root.rotation.x = -c.fall * 1.5;
  }
}

const sharedMats = new Map<string, THREE.Material>();
function geoMat<T extends THREE.Material>(key: string, make: () => T): T {
  let m = sharedMats.get(key) as T | undefined;
  if (!m) { m = make(); sharedMats.set(key, m); }
  return m;
}

/** The Professor Hadi Trophy: a brass cup on a wooden base. Only the name on its plate matters. */
export function makeTrophy(): THREE.Group {
  const g = new THREE.Group();
  const brass = geoMat('brass', () => surface(new THREE.MeshStandardMaterial({ color: 0xb8893a, metalness: 1, roughness: 0.32 }), K.metal));
  const base = new THREE.Mesh(box(0.13, 0.05, 0.13), mat(0x2e1f14, false, true, K.wood)); base.position.y = 0.025;
  const cup = new THREE.Mesh(geo('cup', () => new THREE.LatheGeometry([[0.045, 0], [0.05, 0.012], [0.016, 0.03], [0.012, 0.1], [0.03, 0.125], [0.062, 0.17], [0.078, 0.24], [0.082, 0.29], [0.074, 0.29], [0.07, 0.245], [0.0, 0.2]].map(([r, y]) => new THREE.Vector2(r, y)), 20)), brass);
  cup.position.y = 0.05;
  for (const sx of [1, -1]) { const h = new THREE.Mesh(geo('cuphandle', () => new THREE.TorusGeometry(0.035, 0.007, 6, 12, Math.PI)), brass); h.position.set(sx * 0.078, 0.27, 0); h.rotation.z = -sx * Math.PI / 2; g.add(h); }
  g.add(base, cup);
  return g;
}

/** A horse. No eyes, no nostrils, no mouth. */
export class Horse {
  root = new THREE.Group();
  seat = new THREE.Group();
  private legs: { hip: THREE.Group; knee: THREE.Group; front: boolean }[] = [];
  private bodyG = new THREE.Group();
  private neck = new THREE.Group();
  private tail = new THREE.Group();
  private phase = Math.random() * 6;
  speed = 0;
  constructor(color = 0x6b4a32, gilded = false) {
    const m = mat(color, gilded, true, K.skin), dark = mat(0x1c140f, gilded, true, K.bark), hoof = mat(0x1a1714, gilded, true, K.plain);
    const mk = (geom: THREE.BufferGeometry, mm: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geom, mm); o.position.set(x, y, z); parent.add(o); return o; };
    const barrel = mk(geo('barrel', () => { const g = new THREE.CapsuleGeometry(0.31, 0.95, 8, 16); g.rotateX(Math.PI / 2); return g; }), m, this.bodyG, 0, 1.2, 0);
    barrel.scale.set(0.92, 1.05, 1);
    mk(ball(0.33, 16, 12), m, this.bodyG, 0, 1.24, 0.55).scale.set(0.9, 1.08, 0.95);  // chest
    mk(ball(0.34, 16, 12), m, this.bodyG, 0, 1.25, -0.52).scale.set(0.94, 1.02, 0.95); // quarters
    this.neck.position.set(0, 1.42, 0.68); this.neck.rotation.x = 0.72;
    this.bodyG.add(this.neck);
    mk(limbGeo(0.72, 0.2, 0.12), m, this.neck).rotation.x = Math.PI;
    const head = new THREE.Group(); head.position.set(0, 0.74, 0); head.rotation.x = 1.25; this.neck.add(head);
    mk(limbGeo(0.5, 0.125, 0.07), m, head).rotation.x = Math.PI; // a long plain head
    for (const x of [0.07, -0.07]) { const ear = mk(geo('ear', () => new THREE.ConeGeometry(0.035, 0.13, 6)), m, head, x, -0.04, -0.11); ear.rotation.x = -1.1; }
    const mane = mk(box(0.05, 0.72, 0.13), dark, this.neck, 0, 0.36, -0.17);
    mane.userData.noCast = true;
    this.tail.position.set(0, 1.42, -0.86); this.tail.rotation.x = -0.5;
    mk(limbGeo(0.85, 0.06, 0.03), dark, this.tail);
    this.bodyG.add(this.tail);
    for (const [x, z, front] of [[0.17, 0.52, true], [-0.17, 0.52, true], [0.18, -0.52, false], [-0.18, -0.52, false]] as const) {
      const hip = new THREE.Group(); hip.position.set(x, 1.0, z); this.bodyG.add(hip);
      mk(limbGeo(0.5, front ? 0.1 : 0.13, 0.055), m, hip);
      const knee = new THREE.Group(); knee.position.y = -0.5; hip.add(knee);
      mk(limbGeo(0.42, 0.05, 0.036), m, knee);
      mk(cyl(0.05, 0.06, 0.085, 10), hoof, knee, 0, -0.455, 0.008);
      this.legs.push({ hip, knee, front });
    }
    // saddle cloth and saddle
    const clothM = mat(0x7a2a22, gilded, true, K.cloth);
    const blanket = mk(geo('blanket', () => { const g = new THREE.CylinderGeometry(0.335, 0.335, 0.7, 16, 1, true, -1.25, 2.5); g.rotateX(Math.PI / 2); g.rotateZ(Math.PI); return g; }), clothM, this.bodyG, 0, 1.2, -0.02);
    blanket.scale.set(0.93, 1.06, 1); (blanket.material as THREE.Material).side = THREE.DoubleSide;
    mk(ball(0.2, 12, 8), mat(0x3a2616, gilded, true, K.wood), this.bodyG, 0, 1.51, -0.03).scale.set(0.95, 0.3, 1.5);
    this.seat.position.set(0, 1.56 - (0.914 - 0.3), -0.03);
    this.bodyG.add(this.seat);
    this.root.add(this.bodyG);
  }
  update(dt: number) {
    const moving = this.speed > 0.2;
    if (moving) this.phase += dt * (3.6 + this.speed * 1.05);
    const a = moving ? Math.min(0.85, 0.28 + this.speed * 0.06) : 0;
    const offs = this.speed > 7 ? [0, 0.5, 2.6, 3.1] : [0, 3.14, 4.7, 1.57];
    this.legs.forEach((l, i) => {
      const ph = this.phase + offs[i];
      l.hip.rotation.x = -Math.sin(ph) * a;
      l.knee.rotation.x = (l.front ? 1 : -0.6) * Math.max(0, Math.cos(ph)) * a * 1.5 + (l.front ? 0 : 0.12);
    });
    this.bodyG.position.y = moving ? Math.abs(Math.sin(this.phase)) * 0.06 : 0;
    this.bodyG.rotation.x = moving ? Math.sin(this.phase * 2) * 0.025 : 0;
    this.neck.rotation.x = 0.72 + (moving ? Math.sin(this.phase * 2 + 0.5) * 0.07 : Math.sin(performance.now() / 1700) * 0.03);
    this.tail.rotation.x = -0.5 - (moving ? 0.25 + Math.sin(this.phase) * 0.12 : 0);
    this.tail.rotation.z = Math.sin(performance.now() / 600 + this.phase) * 0.12;
  }
}

/** A low-detail copy of the human body, posed once and frozen: what crowds are made of. */
const baked = new Map<string, { cloth: THREE.BufferGeometry; rest: THREE.BufferGeometry; head: THREE.Vector3 }>();
function bakeCrowd(pose: Pose) {
  let out = baked.get(pose);
  if (out) return out;
  const rig = new Rig();
  rig.apply({ ...POSES[pose] });
  rig.bones[B.hips].updateMatrixWorld(true);
  const mats = rig.bones.map((b, i) => b.matrixWorld.clone().multiply(HUMAN.inverses[i]));
  const L = HUMAN.low, n = L.pos.length / 3, pos = new Float32Array(n * 3), col = new Float32Array(n * 3).fill(-1);
  const v = new THREE.Vector3(), acc = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    acc.set(0, 0, 0);
    for (let j = 0; j < 4; j++) { const w = L.sw[i * 4 + j] / 255; if (w > 0) acc.addScaledVector(v.set(L.pos[i * 3], L.pos[i * 3 + 1], L.pos[i * 3 + 2]).applyMatrix4(mats[L.si[i * 4 + j]]), w); }
    pos[i * 3] = acc.x; pos[i * 3 + 1] = acc.y; pos[i * 3 + 2] = acc.z;
  }
  // cloth is white (tinted per person); skin, face and hair keep their own colours
  const TINT: Record<string, [number, number, number]> = { top: [1, 1, 1], bottom: [0.5, 0.5, 0.56], shoe: [0.1, 0.09, 0.08], skin: [0.46, 0.29, 0.18], face: [0.58, 0.58, 0.56], hair: [0.025, 0.02, 0.016] };
  const idx: Record<'cloth' | 'rest', number[]> = { cloth: [], rest: [] };
  for (const g of L.groups) {
    const which = g.region === 'top' || g.region === 'bottom' || g.region === 'shoe' ? 'cloth' : 'rest';
    for (let t = g.start; t < g.start + g.count; t++) { const vi = L.index[t]; idx[which].push(vi); if (col[vi * 3] < 0) col.set(TINT[g.region], vi * 3); }
  }
  const make = (ix: number[]) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(ix); g.computeVertexNormals(); g.userData.shared = true; return g; };
  out = { cloth: make(idx.cloth), rest: make(idx.rest), head: HUMAN.hc.clone().applyMatrix4(rig.bones[B.head].matrixWorld.clone().multiply(HUMAN.inverses[B.head])) };
  baked.set(pose, out);
  return out;
}

/** A crowd as instanced meshes: clothed bodies, smooth faces, and (in the Gilding) screens for faces. */
export function makeCrowd(spots: { x: number; y: number; z: number; yaw: number; seated?: boolean }[], o: { colors: number[]; screens?: boolean; gild?: boolean; screenColors?: number[] }): THREE.Group {
  const g = new THREE.Group();
  const groups = [spots.filter((s) => s.seated), spots.filter((s) => !s.seated)];
  const d = new THREE.Object3D(), c = new THREE.Color();
  groups.forEach((list, gi) => {
    if (!list.length) return;
    const n = list.length, bk = bakeCrowd(gi === 0 ? 'sit' : 'stand');
    const bodies = new THREE.InstancedMesh(bk.cloth, surface(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }), K.cloth, !!o.gild), n);
    const heads = new THREE.InstancedMesh(bk.rest, surface(new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.25, roughness: 0.6 }), K.plain, !!o.gild), n);
    const screens = o.screens ? new THREE.InstancedMesh(box(0.15, 0.2, 0.014), new THREE.MeshBasicMaterial({ color: 0xffffff }), n) : null;
    list.forEach((s, i) => {
      const sc = 0.94 + ((i * 37) % 13) / 100;
      d.rotation.set(0, s.yaw, 0); d.scale.setScalar(sc);
      d.position.set(s.x, s.y, s.z); d.updateMatrix(); bodies.setMatrixAt(i, d.matrix); heads.setMatrixAt(i, d.matrix);
      bodies.setColorAt(i, c.set(o.colors[(i * 7) % o.colors.length]).offsetHSL(0, 0, Math.sin(i * 12.9898) * 0.04));
      if (screens) {
        const f = (bk.head.z + HUMAN.hr.z + 0.012) * sc;
        d.position.set(s.x + Math.sin(s.yaw) * f, s.y + bk.head.y * sc, s.z + Math.cos(s.yaw) * f); d.updateMatrix(); screens.setMatrixAt(i, d.matrix);
        const cols = o.screenColors ?? [0x9fd8ff, 0xffc7e8, 0xd6ffd0, 0xfff0b0];
        screens.setColorAt(i, c.set(cols[i % cols.length]));
      }
    });
    bodies.frustumCulled = heads.frustumCulled = false;
    g.add(bodies, heads);
    if (screens) { screens.frustumCulled = false; g.add(screens); }
  });
  return g;
}
