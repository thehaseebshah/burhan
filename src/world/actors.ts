// Movement, the third-person controller, and fighting.
// HARD RULE 6: the controls refuse to harm anyone who isn't fighting. That rule lives in
// Combat.playerAttack(): a strike aimed at a non-combatant never starts. No gore anywhere.
import * as THREE from 'three';
import type { Input } from '../core/input';
import { settings } from '../core/settings';
import { audio } from '../core/audio';
import { Figure, Horse } from './figures';
import type { HeightFn } from './props';

export interface Circle { x: number; z: number; r: number }
export interface Rect { x0: number; x1: number; z0: number; z1: number }

export class World {
  ground: HeightFn = () => 0;
  circles: Circle[] = [];
  rects: Rect[] = [];
  /** Playable area: the player is kept inside. */
  bounds: Rect = { x0: -60, x1: 60, z0: -60, z1: 60 };
  /** Optional: extra rule, e.g. stay on a trail. Returns a corrected position. */
  clamp: ((p: THREE.Vector3) => void) | null = null;

  resolve(p: THREE.Vector3, r: number) {
    for (const c of this.circles) {
      const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), min = c.r + r;
      if (d < min && d > 1e-4) { p.x = c.x + (dx / d) * min; p.z = c.z + (dz / d) * min; }
    }
    for (const b of this.rects) {
      if (p.x > b.x0 - r && p.x < b.x1 + r && p.z > b.z0 - r && p.z < b.z1 + r) {
        const l = p.x - (b.x0 - r), rr = b.x1 + r - p.x, n = p.z - (b.z0 - r), f = b.z1 + r - p.z;
        const m = Math.min(l, rr, n, f);
        if (m === l) p.x = b.x0 - r; else if (m === rr) p.x = b.x1 + r; else if (m === n) p.z = b.z0 - r; else p.z = b.z1 + r;
      }
    }
    p.x = THREE.MathUtils.clamp(p.x, this.bounds.x0, this.bounds.x1);
    p.z = THREE.MathUtils.clamp(p.z, this.bounds.z0, this.bounds.z1);
    this.clamp?.(p);
  }
}

const angDiff = (a: number, b: number) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };

export class Actor {
  pos: THREE.Vector3;
  yaw = 0;
  radius = 0.35;
  horse: Horse | null = null;
  /** when true the actor is not snapped to the ground (seated on a bus, on steps...) */
  floating = false;
  private dest: THREE.Vector3 | null = null;
  private destSpeed = 2;
  private arrive: (() => void) | null = null;
  private stopAt = 0.15;

  constructor(public fig: Figure, public world: World) {
    this.pos = fig.root.position;
  }
  get obj(): THREE.Object3D { return this.horse ? this.horse.root : this.fig.root; }

  place(x: number, z: number, yaw = this.yaw) {
    const p = this.horse ? this.horse.root.position : this.pos;
    p.set(x, this.floating ? p.y : this.world.ground(x, z), z);
    this.yaw = yaw;
    this.obj.rotation.y = yaw;
    return this;
  }
  get x() { return this.horse ? this.horse.root.position.x : this.pos.x; }
  get z() { return this.horse ? this.horse.root.position.z : this.pos.z; }
  get p(): THREE.Vector3 { return this.horse ? this.horse.root.position : this.pos; }

  mount(h: Horse) {
    h.root.position.copy(this.pos); h.root.rotation.y = this.yaw;
    this.fig.root.parent?.add(h.root);
    this.horse = h;
    h.seat.add(this.fig.root);
    this.fig.root.position.set(0, 0, 0); this.fig.root.rotation.set(0, 0, 0);
    this.fig.setPose('ride', true);
  }
  dismount() {
    const h = this.horse; if (!h) return;
    const parent = h.root.parent!;
    parent.add(this.fig.root);
    this.horse = null;
    this.fig.root.position.set(h.root.position.x + Math.cos(h.root.rotation.y) * 1.1, 0, h.root.position.z - Math.sin(h.root.rotation.y) * 1.1);
    this.pos.y = this.world.ground(this.pos.x, this.pos.z);
    this.fig.root.rotation.set(0, this.yaw, 0);
    this.fig.setPose('stand');
    h.speed = 0;
  }

  faceTo(x: number, z: number) { this.yaw = Math.atan2(x - this.x, z - this.z); this.obj.rotation.y = this.yaw; }
  dist(x: number, z: number) { return Math.hypot(this.x - x, this.z - z); }
  distTo(a: Actor) { return this.dist(a.x, a.z); }

  /** Walk in a straight line to a point. Resolves on arrival. */
  goTo(x: number, z: number, speed = 2, stopAt = 0.15): Promise<void> {
    this.arrive?.();
    this.dest = new THREE.Vector3(x, 0, z); this.destSpeed = speed; this.stopAt = stopAt;
    return new Promise((res) => { this.arrive = res; });
  }
  stop() { this.dest = null; const a = this.arrive; this.arrive = null; a?.(); this.setSpeed(0); }
  get going() { return !!this.dest; }

  setSpeed(v: number) { this.fig.speed = this.horse ? 0 : v; if (this.horse) this.horse.speed = v; }

  /** Move by a velocity for this frame, with collision and ground following. */
  step(vx: number, vz: number, dt: number, collide = true) {
    const p = this.p;
    p.x += vx * dt; p.z += vz * dt;
    if (collide) this.world.resolve(p, this.radius);
    if (!this.floating) p.y = this.world.ground(p.x, p.z);
  }

  update(dt: number) {
    if (this.dest) {
      const dx = this.dest.x - this.x, dz = this.dest.z - this.z, d = Math.hypot(dx, dz);
      if (d <= Math.max(this.stopAt, this.destSpeed * dt)) { this.stop(); }
      else {
        this.yaw += angDiff(this.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 9);
        this.step((dx / d) * this.destSpeed, (dz / d) * this.destSpeed, dt, false);
        this.setSpeed(this.destSpeed);
      }
    }
    this.obj.rotation.y = this.yaw;
    this.fig.update(dt);
    this.horse?.update(dt);
  }
}

export class Player extends Actor {
  camYaw = 0;
  camPitch = 0.28;
  camDist = 5.2;
  /** false during cinematics and dialogue that lock movement */
  control = true;
  /** false while a cinematic shot owns the camera */
  camFollow = true;
  walk = 2.5;
  run = 5.4;
  vel = new THREE.Vector3();
  moving = false;
  /** set by Combat: 0..1 multiplier */
  slow = 1;
  private camPos = new THREE.Vector3();
  private stepT = 0;
  private first = true;

  tick(dt: number, input: Input, camera: THREE.PerspectiveCamera) {
    this.camYaw -= input.lookX;
    this.camPitch = THREE.MathUtils.clamp(this.camPitch + input.lookY * (settings.invertY ? -1 : 1), -0.25, 1.15);
    let mx = 0, my = 0;
    if (this.control && !this.going) { mx = input.moveX; my = input.moveY; }
    const mounted = !!this.horse;
    const mag = Math.hypot(mx, my);
    const top = (mounted ? (input.held('run') ? 11 : 6) : input.held('run') ? this.run : this.walk) * this.slow;
    // camera-relative direction
    const sin = Math.sin(this.camYaw), cos = Math.cos(this.camYaw);
    const dx = mx * cos - my * sin, dz = -mx * sin - my * cos;
    const want = new THREE.Vector3(dx, 0, dz).multiplyScalar(top);
    // steep ground slows you: scrambling up a trail
    if (mag > 0.05 && !mounted) {
      const p = this.p, ahead = this.world.ground(p.x + dx * 0.6, p.z + dz * 0.6) - p.y;
      if (ahead > 0.25) want.multiplyScalar(THREE.MathUtils.clamp(1 - (ahead - 0.25) * 1.6, 0.35, 1));
    }
    const accel = mounted ? 3.2 : 14;
    this.vel.lerp(want, 1 - Math.exp(-dt * accel));
    const sp = this.vel.length();
    this.moving = sp > 0.2;
    if (!this.going) {
      if (this.moving) {
        this.yaw += angDiff(this.yaw, Math.atan2(this.vel.x, this.vel.z)) * Math.min(1, dt * (mounted ? 4 : 12));
        this.step(this.vel.x, this.vel.z, dt);
        this.stepT -= dt * sp;
        if (this.stepT <= 0) { this.stepT = mounted ? 2.2 : 1.7; if (mounted) audio.hoof(); else audio.step(); }
      }
      this.setSpeed(sp);
    }
    super.update(dt);
    if (this.camFollow) this.updateCamera(dt, camera);
  }

  snapCamera(camera: THREE.PerspectiveCamera) { this.first = true; this.updateCamera(0.016, camera); }

  private updateCamera(dt: number, camera: THREE.PerspectiveCamera) {
    const p = this.p, h = this.horse ? 2.4 : 1.5, d = this.horse ? this.camDist + 2 : this.camDist;
    const tx = p.x, ty = p.y + h, tz = p.z;
    const cp = Math.cos(this.camPitch);
    const want = new THREE.Vector3(tx + Math.sin(this.camYaw) * cp * d, ty + Math.sin(this.camPitch) * d, tz + Math.cos(this.camYaw) * cp * d);
    const g = this.world.ground(want.x, want.z) + 0.35;
    if (want.y < g) want.y = g;
    if (this.first) { this.camPos.copy(want); this.first = false; } else this.camPos.lerp(want, 1 - Math.exp(-dt * 9));
    camera.position.copy(this.camPos);
    camera.lookAt(tx, ty, tz);
  }
}

// ---------------------------------------------------------------- fighting

export type Team = 'ally' | 'enemy' | 'none';
type FState = 'idle' | 'windup' | 'recover' | 'stagger' | 'down' | 'gone';

export class Fighter extends Actor {
  team: Team = 'enemy';
  /** Non-combatants can never be struck. */
  combatant = true;
  poise = 3;
  damage = 1;
  reach = 1.7;
  moveSpeed = 2.6;
  windup = 0.6;
  state: FState = 'idle';
  t = 0;
  cool = 1 + Math.random();
  /** AI off: scripted movement only */
  passive = false;
  defeated = false;
  onDefeat: (() => void) | null = null;
}

export interface CombatRules {
  /** damage per player strike */
  damage: number;
  reach: number;
  /** hits the player can take before going down */
  poise: number;
  /** Act I Burhan: slow, untrained. Strikes are weak and grapples fail. */
  untrained?: boolean;
  /** the fight ends when the player goes down (a fight he is meant to lose) */
  loseOnDown?: boolean;
}

export class Combat {
  fighters: Fighter[] = [];
  active = true;
  rules: CombatRules = { damage: 1, reach: 1.8, poise: 4 };
  poise = 4;
  hitsTaken = 0;
  guarding = false;
  dodgeT = 0;
  private dodgeCool = 0;
  private dodgeDir = new THREE.Vector3();
  staggerT = 0;
  downT = 0;
  playerDown = false;
  private attackT = 0;
  private hitDone = true;
  private presses: number[] = [];
  /** The rule of anger: 0..1. Mashing attacks raises it; it darkens the screen and dims the mirror. */
  anger = 0;
  angerTriggered = false;
  controlledActs = 0;
  onRefuse: ((who: Fighter) => void) | null = null;
  onAnger: ((amount: number) => void) | null = null;
  onPlayerDown: (() => void) | null = null;
  private clock = 0;

  constructor(public player: Player) {}

  add(f: Fighter) { this.fighters.push(f); return f; }
  alive(team: Team) { return this.fighters.filter((f) => f.team === team && f.combatant && !f.defeated); }

  private inArc(from: Actor, to: Actor, reach: number, minDot = 0.25) {
    const dx = to.x - from.x, dz = to.z - from.z, d = Math.hypot(dx, dz);
    if (d > reach + to.radius) return false;
    if (d < 0.01) return true;
    return (dx / d) * Math.sin(from.yaw) + (dz / d) * Math.cos(from.yaw) > minDot;
  }

  private playerAttack() {
    const pl = this.player, reach = this.rules.reach * (pl.horse ? 1.35 : 1);
    // soft aim: turn toward the nearest person in front
    let near: Fighter | null = null, nd = 1e9;
    for (const f of this.fighters) {
      if (f.defeated || f.state === 'gone' || !(f.team === 'enemy' || !f.combatant)) continue;
      const d = f.distTo(pl);
      if (d < reach + 1.4 && d < nd && this.inArc(pl, f, reach + 1.4, -0.2)) { nd = d; near = f; }
    }
    // HARD RULE 6. If the one in front of the blow isn't fighting, the blow does not happen.
    if (near && !near.combatant) {
      pl.fig.halt();
      this.attackT = 1.1; this.hitDone = true;
      this.onRefuse?.(near);
      return;
    }
    if (near && !pl.horse) pl.faceTo(near.x, near.z);
    const dur = this.rules.untrained ? 0.62 : 0.4;
    pl.fig.swing(dur);
    this.attackT = dur; this.hitDone = false;
    audio.whoosh();
  }

  private applyPlayerHit() {
    const pl = this.player, reach = this.rules.reach * (pl.horse ? 1.35 : 1);
    for (const f of this.fighters) {
      if (f.defeated || !f.combatant || f.team !== 'enemy') continue; // non-combatants are never damaged
      if (!this.inArc(pl, f, reach, pl.horse ? -0.1 : 0.2)) continue;
      this.damage(f, this.rules.damage, pl);
    }
  }

  private damage(f: Fighter, amount: number, from: Actor) {
    f.poise -= amount;
    f.fig.flinch();
    f.state = 'stagger'; f.t = 0.45;
    const dx = f.x - from.x, dz = f.z - from.z, d = Math.hypot(dx, dz) || 1;
    f.step((dx / d) * 9, (dz / d) * 9, 0.06);
    audio.hit();
    if (f.poise <= 0) this.defeat(f);
  }

  /** Defeated fighters drop and are gone. Nothing is shown beyond that. */
  defeat(f: Fighter) {
    if (f.defeated) return;
    f.defeated = true; f.state = 'down'; f.t = 2.2;
    f.stop();
    f.fig.setPose('down');
    f.onDefeat?.();
  }

  /** Used by fights the player is meant to lose, and by the auto-player. */
  knockDown() {
    if (this.playerDown) return;
    this.poise = 0; this.playerDown = true; this.downT = this.rules.loseOnDown ? 1e9 : 2.2;
    this.player.fig.setPose('down'); this.player.stop();
    this.onPlayerDown?.();
  }

  private grapple() {
    const pl = this.player;
    if (pl.horse) return;
    let near: Fighter | null = null, nd = 1.5;
    for (const f of this.fighters) { if (f.defeated || f.team !== 'enemy' || !f.combatant) continue; const d = f.distTo(pl); if (d < nd) { nd = d; near = f; } }
    if (!near) return;
    pl.faceTo(near.x, near.z);
    pl.fig.swing(0.5);
    this.attackT = 0.6; this.hitDone = true;
    if (this.rules.untrained) {
      // He has never wrestled. He is shoved off.
      this.staggerT = 0.7; pl.fig.flinch(); audio.block();
      return;
    }
    // A throw: stronger on a staggered opponent, and it counts as fighting in control.
    this.controlledActs++;
    this.anger = Math.max(0, this.anger - 0.1);
    this.damage(near, near.state === 'stagger' ? 3 : 1.5, pl);
    if (!near.defeated) { near.state = 'stagger'; near.t = 1.4; near.fig.setPose('down'); setTimeout(() => { if (!near!.defeated) near!.fig.setPose('stand'); }, 1200); }
  }

  private target(f: Fighter): Actor | null {
    let best: Actor | null = null, bd = 1e9;
    const consider = (a: Actor, bias: number) => { const d = f.distTo(a) + bias; if (d < bd) { bd = d; best = a; } };
    if (f.team === 'enemy') { if (!this.playerDown) consider(this.player, -3); for (const o of this.fighters) if (o.team === 'ally' && !o.defeated && o.combatant) consider(o, 0); }
    else for (const o of this.fighters) if (o.team === 'enemy' && !o.defeated && o.combatant) consider(o, 0);
    return best;
  }

  private strike(f: Fighter, tgt: Actor) {
    if (!this.inArc(f, tgt, f.reach + 0.3, 0)) return;
    if (tgt === this.player) {
      if (this.dodgeT > 0 || this.playerDown) return;
      const pl = this.player;
      const facing = Math.sin(pl.yaw) * (f.x - pl.x) + Math.cos(pl.yaw) * (f.z - pl.z) > 0;
      if (this.guarding && facing) {
        audio.block(); f.state = 'stagger'; f.t = 0.5; f.fig.flinch();
        this.controlledActs++;
        this.anger = Math.max(0, this.anger - 0.08);
        return;
      }
      audio.hit(); pl.fig.flinch();
      this.poise -= f.damage; this.hitsTaken++; this.staggerT = 0.35;
      if (this.poise <= 0) {
        this.playerDown = true; this.downT = this.rules.loseOnDown ? 1e9 : 2.2;
        pl.fig.setPose('down'); pl.stop();
        this.onPlayerDown?.();
      }
    } else if (tgt instanceof Fighter) {
      this.damage(tgt, f.damage * 0.5, f);
    }
  }

  update(dt: number, input: Input) {
    this.clock += dt;
    const pl = this.player;
    if (this.anger > 0 && this.presses.length < 3) this.anger = Math.max(0, this.anger - dt * 0.05);
    this.presses = this.presses.filter((t) => this.clock - t < 1.6);

    // --- the player
    if (this.playerDown) {
      this.downT -= dt;
      if (this.downT <= 0) { this.playerDown = false; this.poise = this.rules.poise; pl.fig.setPose(pl.horse ? 'ride' : 'stand'); }
    }
    const busy = this.playerDown || this.staggerT > 0;
    if (this.staggerT > 0) this.staggerT -= dt;
    if (this.attackT > 0) {
      this.attackT -= dt;
      if (!this.hitDone && this.attackT < (this.rules.untrained ? 0.3 : 0.22)) { this.hitDone = true; this.applyPlayerHit(); }
    }
    if (this.dodgeCool > 0) this.dodgeCool -= dt;
    if (this.dodgeT > 0) { this.dodgeT -= dt; pl.step(this.dodgeDir.x * 9, this.dodgeDir.z * 9, dt); }
    this.guarding = false;
    // The rule of anger. Every press of attack is counted, whether or not a blow can start:
    // hammering the button is what dims the mirror.
    if (this.active && pl.control && input.pressed('attack')) {
      this.presses.push(this.clock);
      if (this.presses.length >= 4) {
        this.anger = Math.min(1, this.anger + 0.14);
        this.angerTriggered = true;
        this.onAnger?.(this.anger);
      }
    }
    if (this.active && !busy && pl.control) {
      if (input.held('guard') && this.attackT <= 0 && !pl.horse) this.guarding = true;
      if (input.pressed('attack') && this.attackT <= 0) this.playerAttack();
      else if (input.pressed('grapple') && this.attackT <= 0) this.grapple();
      else if (input.pressed('dodge') && this.dodgeCool <= 0 && !pl.horse) {
        this.dodgeT = 0.26; this.dodgeCool = 0.75;
        if (pl.moving) this.dodgeDir.copy(pl.vel).setY(0).normalize(); else this.dodgeDir.set(-Math.sin(pl.yaw), 0, -Math.cos(pl.yaw));
        audio.whoosh();
      }
    }
    if (!this.playerDown && !pl.horse) pl.fig.setPose(this.guarding ? 'guard' : 'stand');
    pl.slow = busy ? 0 : this.guarding ? 0.4 : this.attackT > 0 ? 0.35 : this.rules.untrained ? 0.8 : 1;

    // --- everyone else
    for (const f of this.fighters) {
      if (f.state === 'gone') continue;
      if (f.defeated) {
        f.t -= dt;
        if (f.t <= 0) { f.state = 'gone'; f.obj.visible = false; }
        f.update(dt);
        continue;
      }
      if (f.passive || !f.combatant || !this.active) { f.update(dt); continue; }
      const tgt = this.target(f);
      if (f.state === 'stagger') { f.t -= dt; f.setSpeed(0); if (f.t <= 0) f.state = 'idle'; }
      else if (!tgt) { f.setSpeed(0); }
      else if (f.state === 'windup') {
        f.t -= dt; f.setSpeed(0);
        if (f.t <= 0) { this.strike(f, tgt); f.state = 'recover'; f.t = 0.5; }
      } else if (f.state === 'recover') { f.t -= dt; if (f.t <= 0) { f.state = 'idle'; f.cool = 0.8 + Math.random() * 1.4; } }
      else {
        const d = f.distTo(tgt);
        f.faceTo(tgt.x, tgt.z);
        if (d > f.reach * 0.85) {
          const dx = tgt.x - f.x, dz = tgt.z - f.z;
          // keep a little apart from other fighters so they don't stack
          let sx = 0, sz = 0;
          for (const o of this.fighters) { if (o === f || o.defeated) continue; const ox = f.x - o.x, oz = f.z - o.z, od = Math.hypot(ox, oz); if (od < 1.1 && od > 0.01) { sx += ox / od; sz += oz / od; } }
          f.step((dx / d) * f.moveSpeed + sx * 1.5, (dz / d) * f.moveSpeed + sz * 1.5, dt);
          f.setSpeed(f.moveSpeed);
        } else {
          f.setSpeed(0);
          f.cool -= dt;
          if (f.cool <= 0) { f.state = 'windup'; f.t = f.windup; f.fig.swing(f.windup + 0.25); }
        }
      }
      f.update(dt);
    }
  }
}
