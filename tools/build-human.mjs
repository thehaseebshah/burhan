// Builds the game's human body from the MakeHuman base mesh, rig and skin weights.
// Source: https://github.com/makehumancommunity/makehuman (assets released as CC0 1.0).
// Output: src/assets/human.json (a full-detail body and a low-detail one for crowds).
//
// What this does to the source body:
//  - HARD RULE 1: the face is removed. Every vertex of the head is projected onto a smooth
//    oval, so there are no eyes, no nose, no mouth and no ears: only a smooth face.
//  - the 163-bone rig is reduced to 19 bones;
//  - the body is dressed by region: the torso and arms become a top, the hips and legs
//    become trousers, the feet become shoes, the crown and back of the head become hair.
//    Cloth regions are smoothed and pushed out from the skin so they read as fabric.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cache = join(root, '.cache', 'makehuman');
const BASE = 'https://raw.githubusercontent.com/makehumancommunity/makehuman/master/makehuman/data/';
const FILES = { 'base.obj': '3dobjs/base.obj', 'default.mhskel': 'rigs/default.mhskel', 'default_weights.mhw': 'rigs/default_weights.mhw' };
mkdirSync(cache, { recursive: true });
for (const [name, path] of Object.entries(FILES)) {
  const f = join(cache, name);
  if (existsSync(f)) continue;
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`could not fetch ${path}: ${res.status}`);
  writeFileSync(f, Buffer.from(await res.arrayBuffer()));
  console.log('fetched', name);
}

// ---------------------------------------------------------------- read the source
const V = [], quads = [];
{
  let g = '';
  for (const l of readFileSync(join(cache, 'base.obj'), 'utf8').split('\n')) {
    if (l.startsWith('v ')) { const p = l.split(/\s+/); V.push([+p[1], +p[2], +p[3]]); }
    else if (l.startsWith('g ')) g = l.slice(2).trim();
    else if (l.startsWith('f ') && g === 'body') quads.push(l.split(/\s+/).slice(1).map((t) => parseInt(t) - 1));
  }
}
const skel = JSON.parse(readFileSync(join(cache, 'default.mhskel'), 'utf8'));
const W = JSON.parse(readFileSync(join(cache, 'default_weights.mhw'), 'utf8')).weights;
const N = Math.max(...quads.flat()) + 1;
const joint = (name) => { const ids = skel.joints[name], p = [0, 0, 0]; for (const i of ids) for (let k = 0; k < 3; k++) p[k] += V[i][k] / ids.length; return p; };
const headOf = (bone) => joint(skel.bones[bone].head);

// ---------------------------------------------------------------- the reduced rig
const BONES = ['hips', 'waist', 'chest', 'neck', 'head', 'clavL', 'upperarmL', 'forearmL', 'handL', 'clavR', 'upperarmR', 'forearmR', 'handR', 'thighL', 'shinL', 'footL', 'thighR', 'shinR', 'footR'];
const PARENT = { waist: 'hips', chest: 'waist', neck: 'chest', head: 'neck', clavL: 'chest', upperarmL: 'clavL', forearmL: 'upperarmL', handL: 'forearmL', clavR: 'chest', upperarmR: 'clavR', forearmR: 'upperarmR', handR: 'forearmR', thighL: 'hips', shinL: 'thighL', footL: 'shinL', thighR: 'hips', shinR: 'thighR', footR: 'shinR' };
function reduce(name) {
  for (let n = name; n; n = skel.bones[n].parent) {
    const side = n.endsWith('.L') ? 'L' : n.endsWith('.R') ? 'R' : '';
    if (n === 'root' || n.startsWith('pelvis')) return 'hips';
    if (/^spine0[345]$/.test(n)) return 'waist';
    if (/^spine0[12]$/.test(n) || n.startsWith('breast')) return 'chest';
    if (n.startsWith('neck')) return 'neck';
    if (n === 'head') return 'head';
    if (n.startsWith('clavicle') || n.startsWith('shoulder')) return 'clav' + side;
    if (n.startsWith('upperarm')) return 'upperarm' + side;
    if (n.startsWith('lowerarm')) return 'forearm' + side;
    if (n.startsWith('wrist')) return 'hand' + side;
    if (n.startsWith('upperleg')) return 'thigh' + side;
    if (n.startsWith('lowerleg')) return 'shin' + side;
    if (n.startsWith('foot')) return 'foot' + side;
  }
  return 'hips';
}
const mid = (a, b) => a.map((x, i) => (x + b[i]) / 2);
const HEAD = {
  hips: mid(headOf('upperleg01.L'), headOf('upperleg01.R')), waist: headOf('spine05'), chest: headOf('spine02'), neck: headOf('neck01'), head: headOf('head'),
};
for (const s of ['L', 'R']) {
  HEAD['clav' + s] = headOf('clavicle.' + s); HEAD['upperarm' + s] = headOf('upperarm01.' + s); HEAD['forearm' + s] = headOf('lowerarm01.' + s);
  HEAD['hand' + s] = headOf('wrist.' + s); HEAD['thigh' + s] = headOf('upperleg01.' + s); HEAD['shin' + s] = headOf('lowerleg01.' + s); HEAD['foot' + s] = headOf('foot.' + s);
  HEAD['tip' + s] = skel.bones['finger3-1.' + s] ? headOf('finger3-1.' + s) : joint(skel.bones['wrist.' + s].tail);
}

// weights, reduced to the 19 bones
const w = Array.from({ length: N }, () => new Float32Array(BONES.length));
const breast = new Float32Array(N);
for (const [bone, list] of Object.entries(W)) {
  if (!skel.bones[bone]) continue;
  const bi = BONES.indexOf(reduce(bone));
  for (const [i, x] of list) { if (i < N) { w[i][bi] += x; if (bone.startsWith('breast')) breast[i] += x; } }
}
for (let i = 0; i < N; i++) { let s = 0; for (const x of w[i]) s += x; if (s < 1e-5) { w[i][0] = 1; s = 1; } for (let b = 0; b < BONES.length; b++) w[i][b] /= s; }

// ---------------------------------------------------------------- to metres, feet on the ground, 1.76 tall
let minY = 1e9, maxY = -1e9;
for (let i = 0; i < N; i++) { minY = Math.min(minY, V[i][1]); maxY = Math.max(maxY, V[i][1]); }
const k = 1.76 / (maxY - minY);
const conv = (p) => [p[0] * k, (p[1] - minY) * k, p[2] * k];
const P = V.slice(0, N).map(conv);
for (const key of Object.keys(HEAD)) HEAD[key] = conv(HEAD[key]);

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]), norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
function normals(pos, faces) {
  const n = pos.map(() => [0, 0, 0]);
  for (const f of faces) { const c = cross(sub(pos[f[1]], pos[f[0]]), sub(pos[f[f.length - 1]], pos[f[0]])); for (const i of f) { n[i][0] += c[0]; n[i][1] += c[1]; n[i][2] += c[2]; } }
  return n.map(norm);
}
let Nrm = normals(P, quads);

// an even, unisex chest
for (let i = 0; i < N; i++) if (breast[i] > 0) P[i] = sub(P[i], mul(Nrm[i], 0.016 * Math.min(1, breast[i] * 1.6)));

// ---------------------------------------------------------------- the head becomes a smooth oval
const hi = BONES.indexOf('head');
let hc = [0, 0, 0], hn = 0, hmin = [1e9, 1e9, 1e9], hmax = [-1e9, -1e9, -1e9];
for (let i = 0; i < N; i++) if (w[i][hi] > 0.9) { hn++; for (let c = 0; c < 3; c++) { hc[c] += P[i][c]; hmin[c] = Math.min(hmin[c], P[i][c]); hmax[c] = Math.max(hmax[c], P[i][c]); } }
hc = [0, (hmin[1] + hmax[1]) / 2 + 0.006, (hmin[2] + hmax[2]) / 2 - 0.004];
const hr = [(hmax[0] - hmin[0]) / 2 * 0.86, (hmax[1] - hmin[1]) / 2 * 0.985, (hmax[2] - hmin[2]) / 2 * 0.95];
const oval = new Float32Array(N);
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
for (let i = 0; i < N; i++) {
  const wh = w[i][hi];
  if (wh < 0.35) continue;
  const d = [(P[i][0] - hc[0]) / hr[0], (P[i][1] - hc[1]) / hr[1], (P[i][2] - hc[2]) / hr[2]], l = len(d) || 1;
  const on = [hc[0] + (d[0] / l) * hr[0], hc[1] + (d[1] / l) * hr[1], hc[2] + (d[2] / l) * hr[2]];
  // fully oval wherever the head bone rules; easing into the modelled neck only where the neck takes over
  const t = ss(0.4, 0.8, wh);
  oval[i] = t;
  P[i] = add(mul(P[i], 1 - t), mul(on, t));
}

// ---------------------------------------------------------------- regions
const REG = ['skin', 'top', 'bottom', 'shoe', 'face', 'hair'];
const TOPB = ['waist', 'chest', 'clavL', 'clavR', 'upperarmL', 'upperarmR', 'forearmL', 'forearmR'], BOTB = ['hips', 'thighL', 'thighR', 'shinL', 'shinR'];
const regionOf = (f) => {
  const acc = new Float32Array(BONES.length);
  for (const i of f) for (let b = 0; b < BONES.length; b++) acc[b] += w[i][b];
  let best = 0; for (let b = 1; b < BONES.length; b++) if (acc[b] > acc[best]) best = b;
  const name = BONES[best];
  if (name === 'head') {
    const c = [0, 0, 0]; for (const i of f) for (let q = 0; q < 3; q++) c[q] += P[i][q] / f.length;
    const dy = (c[1] - hc[1]) / hr[1], dz = (c[2] - hc[2]) / hr[2];
    // hair: the crown, and the back of the head down to the nape. Never the face.
    return dy > 0.52 - Math.max(0, -dz) * 0.9 || dz < -0.42 ? 5 : 4;
  }
  if (name.startsWith('foot')) return 3;
  if (TOPB.includes(name)) return 1;
  if (BOTB.includes(name)) return 2;
  return 0;
};
const faceReg = quads.map(regionOf);
// the wrist belongs to the sleeve, the ankle to the trouser leg: nothing extra needed

// smooth the cloth so it reads as fabric, then push it off the skin
const OFF = [0, 0.017, 0.02, 0.007, 0, 0.008];
const vOff = new Float32Array(N), vCnt = new Float32Array(N), cloth = new Uint8Array(N);
quads.forEach((f, fi) => { for (const i of f) { vOff[i] += OFF[faceReg[fi]]; vCnt[i]++; if (faceReg[fi] === 1 || faceReg[fi] === 2) cloth[i] = 1; } });
const nb = Array.from({ length: N }, () => new Set());
for (const f of quads) for (let q = 0; q < f.length; q++) { nb[f[q]].add(f[(q + 1) % f.length]); nb[f[(q + 1) % f.length]].add(f[q]); }
for (let it = 0; it < 7; it++) {
  const next = P.map((p) => p.slice());
  for (let i = 0; i < N; i++) {
    if (!cloth[i] || !nb[i].size) continue;
    const a = [0, 0, 0]; for (const j of nb[i]) for (let c = 0; c < 3; c++) a[c] += P[j][c] / nb[i].size;
    for (let c = 0; c < 3; c++) next[i][c] = P[i][c] * 0.45 + a[c] * 0.55;
  }
  for (let i = 0; i < N; i++) P[i] = next[i];
}
Nrm = normals(P, quads);
for (let i = 0; i < N; i++) if (vCnt[i]) P[i] = add(P[i], mul(Nrm[i], vOff[i] / vCnt[i] + (cloth[i] ? 0.004 : 0)));
Nrm = normals(P, quads);

// On the oval, the normal is the oval's own: whatever was folded under the face leaves no trace.
for (let i = 0; i < N; i++) if (oval[i] > 0) {
  const n = norm([(P[i][0] - hc[0]) / (hr[0] * hr[0]), (P[i][1] - hc[1]) / (hr[1] * hr[1]), (P[i][2] - hc[2]) / (hr[2] * hr[2])]);
  Nrm[i] = norm(add(mul(Nrm[i], 1 - oval[i]), mul(n, oval[i])));
}

// ---------------------------------------------------------------- pack
const top4 = (wv) => { const idx = [...wv.keys()].sort((a, b) => wv[b] - wv[a]).slice(0, 4); let s = 0; for (const i of idx) s += wv[i]; return { idx, val: idx.map((i) => wv[i] / s) }; };
function pack(pos, nrm, wts, tris, triReg) {
  const order = tris.map((_, i) => i).sort((a, b) => triReg[a] - triReg[b]);
  const index = new Uint16Array(tris.length * 3), groups = [];
  order.forEach((ti, n) => { index.set(tris[ti], n * 3); const r = triReg[ti], g = groups[groups.length - 1]; if (g && g.region === REG[r]) g.count += 3; else groups.push({ region: REG[r], start: n * 3, count: 3 }); });
  const p = new Float32Array(pos.length * 3), nn = new Float32Array(pos.length * 3), si = new Uint8Array(pos.length * 4), sw = new Uint8Array(pos.length * 4);
  pos.forEach((v, i) => { p.set(v, i * 3); nn.set(nrm[i], i * 3); const t = top4(wts[i]); si.set(t.idx, i * 4); sw.set(t.val.map((x) => Math.round(x * 255)), i * 4); });
  const b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
  return { verts: pos.length, tris: tris.length, groups, position: b64(p), normal: b64(nn), skinIndex: b64(si), skinWeight: b64(sw), index: b64(index) };
}
const tris = [], triReg = [];
quads.forEach((f, fi) => { tris.push([f[0], f[1], f[2]], [f[0], f[2], f[3]]); triReg.push(faceReg[fi], faceReg[fi]); });
const full = pack(P, Nrm, w, tris, triReg);

// a low-detail body for crowds: vertices clustered on a coarse grid
const CELL = 0.034, cl = new Map(), cid = new Int32Array(N), cp = [], cw = [], cn = [];
for (let i = 0; i < N; i++) {
  const key = `${Math.round(P[i][0] / CELL)},${Math.round(P[i][1] / CELL)},${Math.round(P[i][2] / CELL)}`;
  let c = cl.get(key);
  if (c === undefined) { c = cp.length; cl.set(key, c); cp.push([0, 0, 0]); cw.push(new Float32Array(BONES.length)); cn.push(0); }
  cid[i] = c; cn[c]++;
  for (let q = 0; q < 3; q++) cp[c][q] += P[i][q];
  for (let b = 0; b < BONES.length; b++) cw[c][b] += w[i][b];
}
cp.forEach((p, c) => { for (let q = 0; q < 3; q++) p[q] /= cn[c]; for (let b = 0; b < BONES.length; b++) cw[c][b] /= cn[c]; });
const lt = [], lr = [], seen = new Set();
tris.forEach((t, i) => { const a = cid[t[0]], b = cid[t[1]], c = cid[t[2]]; if (a === b || b === c || a === c) return; const key = [a, b, c].sort().join(','); if (seen.has(key)) return; seen.add(key); lt.push([a, b, c]); lr.push(triReg[i]); });
const low = pack(cp, normals(cp, lt), cw, lt, lr);

// landmarks the game needs for clothes, lights and seats
const front = [];
for (let y = 0.85; y <= 1.5; y += 0.05) { let z = 0; for (let i = 0; i < N; i++) if (Math.abs(P[i][1] - y) < 0.03 && Math.abs(P[i][0]) < 0.09) z = Math.max(z, P[i][2]); front.push([+y.toFixed(2), +z.toFixed(4)]); }
let hipW = 0, hipF = 0, hipB = 0;
for (let i = 0; i < N; i++) if (Math.abs(P[i][1] - HEAD.hips[1]) < 0.05 && cloth[i]) { hipW = Math.max(hipW, Math.abs(P[i][0])); hipF = Math.max(hipF, P[i][2]); hipB = Math.min(hipB, P[i][2]); }
const r4 = (a) => a.map((x) => +x.toFixed(4));
const meta = {
  source: 'MakeHuman base mesh, default rig and weights (CC0 1.0). https://github.com/makehumancommunity/makehuman',
  bones: BONES.map((name) => ({ name, parent: PARENT[name] ?? null, head: r4(HEAD[name]) })),
  tips: { L: r4(HEAD.tipL), R: r4(HEAD.tipR) },
  headCenter: r4(hc), headRadius: r4(hr), chestFront: front, hips: { halfWidth: +hipW.toFixed(4), front: +hipF.toFixed(4), back: +hipB.toFixed(4) },
};
mkdirSync(join(root, 'src/assets'), { recursive: true });
writeFileSync(join(root, 'src/assets/human.json'), JSON.stringify({ meta, full, low }));
console.log(`human: ${full.verts} vertices, ${full.tris} triangles; crowd body: ${low.verts} vertices, ${low.tris} triangles`);
console.log('groups:', full.groups.map((g) => `${g.region}:${g.count / 3}`).join(' '), '| head radius', meta.headRadius.join(' '));
