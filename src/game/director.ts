// The scene director: what each scene's script is written against.
// Scenes are plain async functions. Every wait goes through the Ctx, so a scene can be
// paused, restarted or left at any moment.
import * as THREE from 'three';
import type { Engine } from '../core/engine';
import { gild } from '../core/engine';
import type { Input, Action } from '../core/input';
import { audio } from '../core/audio';
import { settings, type GameState } from '../core/settings';
import type { Hud, Register, WheelOption } from '../ui/hud';
import { Figure, type FigureOpts } from '../world/figures';
import { Actor, Combat, Fighter, Player, World, type CombatRules } from '../world/actors';

export class SceneAbort extends Error { constructor() { super('scene left'); } }

export interface LineItem { type: 'line'; id: string; speaker: string; direction: string; ur: string; en: string; audio: string; hooks: string[] }
export interface CardItem { type: 'card'; id: string; ur: string; en: string; audio: string; hooks: string[] }
export interface RecitationItem { type: 'recitation'; id: string; ur: string; en: string; ref: string; audio: string; hooks: string[] }
export interface TitleItem { type: 'title'; text: string; note: string }
export interface DirectionItem { type: 'direction'; text: string }
export type Item = LineItem | CardItem | RecitationItem | TitleItem | DirectionItem;
export interface SceneData { id: string; key: string; title: string; where: string; who: string; play: string; kind: 'islamabad' | 'gilding' | 'vision'; optional: boolean; items: Item[]; depths: { clear: string[]; deep: string[]; deepest: string[] } }
export interface ChapterData { id: string; number: number; title: string; minutes: number | null; meta: Record<string, string>; scenes: SceneData[]; notes: string[] }
export type SceneFn = (ctx: Ctx) => Promise<void>;

export interface Services { engine: Engine; input: Input; hud: Hud; state: GameState; auto: boolean }

/** Burhan's look. His face is the state display: rust to polish. */
export const BURHAN: FigureOpts = { top: 0x2f4f5e, bottom: 0x26272d, head: 'mirror', lataif: true };

type Vec3 = [number, number, number];

export class Ctx {
  engine: Engine; input: Input; hud: Hud; state: GameState; auto: boolean;
  root: THREE.Group;
  world = new World();
  player!: Player;
  combat: Combat | null = null;
  actors: Actor[] = [];
  time = 0;
  aborted = false;
  private updates: ((dt: number, t: number) => void)[] = [];
  private waiters: { res: (dt: number) => void; rej: (e: Error) => void }[] = [];
  private camTween: { p0: THREE.Vector3; p1: THREE.Vector3; l0: THREE.Vector3; l1: THREE.Vector3; t: number; dur: number } | null = null;
  private camLook = new THREE.Vector3();
  private stuck = 0;

  constructor(s: Services, public chapter: ChapterData, public scene: SceneData) {
    this.engine = s.engine; this.input = s.input; this.hud = s.hud; this.state = s.state; this.auto = s.auto;
    this.root = s.engine.root;
  }

  // ------------------------------------------------------------ time
  check() { if (this.aborted) throw new SceneAbort(); }
  frame(): Promise<number> {
    this.check();
    return new Promise((res, rej) => this.waiters.push({ res, rej }));
  }
  async wait(seconds: number) {
    let t = this.auto ? seconds / 40 : seconds;
    while (t > 0) t -= await this.frame();
  }
  /** Wait until something is true. `cheat` is what the auto-player does instead of playing. */
  async until(pred: () => boolean, cheat?: () => void) {
    let n = 0;
    if (this.auto && cheat) { await this.frame(); cheat(); }
    while (!pred()) {
      await this.frame();
      if (this.auto && ++n > 1500) throw new Error(`auto-player stuck in ${this.scene.id}`);
    }
  }
  onUpdate(fn: (dt: number, t: number) => void) { this.updates.push(fn); }
  /** Run something over a duration, each frame, with eased progress 0..1. */
  async tween(seconds: number, fn: (k: number) => void) {
    const dur = this.auto ? seconds / 40 : seconds;
    let t = 0;
    while (t < dur) { t += await this.frame(); const k = Math.min(1, t / dur); fn(k * k * (3 - 2 * k)); }
    fn(1);
  }

  // ------------------------------------------------------------ script lines
  item<T extends Item = Item>(local: string): T {
    const id = local.includes('.') ? local : `${this.scene.id}.${local}`;
    const pool = local.includes('.') ? this.chapter.scenes.flatMap((sc) => sc.items) : this.scene.items;
    const it = pool.find((x) => 'id' in x && x.id === id);
    if (!it) throw new Error(`no script item ${id}`);
    return it as T;
  }
  /** Speak lines from the script, in order. Urdu and English subtitles appear together. */
  async say(...ids: string[]) {
    for (const id of ids) await this.sayLine(this.item<LineItem>(id));
  }
  async sayLine(l: LineItem, opts: { hold?: number; keep?: boolean; noSkip?: boolean } = {}) {
    const cls = [l.hooks.includes('echo') ? 'echo' : '', /^(NEUTRAL|FREEDOM|PLENTY|PROGRESS|COMFORT|THE ARTIST|THE HERO)$/.test(l.speaker) ? 'mask' : ''].join(' ').trim();
    this.hud.sub(l.speaker, l.ur, l.en, cls);
    if (!l.hooks.includes('recitation')) audio.speak(l.ur || l.en, l.ur ? 'ur' : 'en');
    const dur = opts.hold ?? Math.max(2.4, 1.3 + l.en.length * 0.058);
    if (opts.noSkip) await this.wait(dur); else await this.hold(dur);
    if (!opts.keep) this.hud.clearSub();
    await this.wait(0.18);
  }
  /** Hold for a duration; the player may move on sooner. */
  async hold(seconds: number) {
    if (this.auto) { await this.frame(); await this.frame(); return; }
    let t = 0;
    while (true) {
      t += await this.frame();
      if (t > 0.35 && !this.hud.wheelOpen && this.input.take('advance')) break;
      if (settings.autoAdvance && t >= seconds) break;
    }
    audio.hush();
  }
  async card(id: string, cls = '', hold?: number) {
    const c = this.item<CardItem>(id);
    this.hud.card(c.ur, c.en, cls); this.hud.showCard();
    audio.daf(true);
    await this.hold(hold ?? Math.max(3.5, 1.8 + c.en.length * 0.06));
    this.hud.clearCard();
    await this.wait(0.5);
  }

  // ------------------------------------------------------------ screen
  async fade(color: string, opacity: number, seconds: number) {
    const s = this.auto ? 0 : seconds;
    this.hud.fade(color, opacity, s);
    await this.wait(seconds);
  }
  label(text: string, x: number, y: number, z: number, cls = '', range = 60) { return this.hud.label(text, new THREE.Vector3(x, y, z), cls, range); }

  // ------------------------------------------------------------ camera
  /** A cinematic shot. Takes the camera from the player until follow() is called. */
  cam(pos: Vec3, look: Vec3, seconds = 0) {
    if (this.player) this.player.camFollow = false;
    const c = this.engine.camera;
    if (seconds <= 0 || this.auto) {
      c.position.set(...pos); this.camLook.set(...look); c.lookAt(this.camLook); this.camTween = null;
      return;
    }
    this.camTween = { p0: c.position.clone(), p1: new THREE.Vector3(...pos), l0: this.camLook.clone(), l1: new THREE.Vector3(...look), t: 0, dur: seconds };
  }
  follow(yaw?: number, pitch?: number) {
    this.camTween = null;
    if (yaw !== undefined) this.player.camYaw = yaw;
    if (pitch !== undefined) this.player.camPitch = pitch;
    this.player.camFollow = true;
    this.player.snapCamera(this.engine.camera);
  }

  // ------------------------------------------------------------ people
  /** Add an object to the scene. With coordinates, it is placed there; without, it keeps its own position. */
  add<T extends THREE.Object3D>(o: T, x?: number, y = 0, z = 0): T { if (x !== undefined) o.position.set(x, y, z); this.root.add(o); return o; }
  addAll(...objs: THREE.Object3D[]) { for (const o of objs) this.root.add(o); }
  spawn(opts: FigureOpts, x: number, z: number, yaw = 0): Actor {
    const a = new Actor(new Figure(opts), this.world);
    this.root.add(a.fig.root);
    a.place(x, z, yaw);
    this.actors.push(a);
    return a;
  }
  /** Historical awliya and scholars: drawn by the owner's pending switch. Returns null for voice-only. */
  spawnRevered(opts: FigureOpts, x: number, z: number, yaw = 0): Actor | null {
    if (settings.figureMode === 'voice-only') {
      // No figure at all: a warm light marks where the voice comes from.
      const l = new THREE.PointLight(0xffd9a0, 6, 8, 1.6);
      l.position.set(x, this.world.ground(x, z) + 1.5, z);
      this.root.add(l);
      return null;
    }
    return this.spawn({ ...opts, silhouette: settings.figureMode === 'silhouette' }, x, z, yaw);
  }
  spawnFighter(opts: FigureOpts, x: number, z: number, cfg: Partial<Fighter> = {}): Fighter {
    const f = new Fighter(new Figure(opts), this.world);
    Object.assign(f, cfg);
    this.root.add(f.fig.root);
    f.place(x, z, cfg.yaw ?? 0);
    this.combat?.add(f);
    return f;
  }
  setPlayer(opts: FigureOpts, x: number, z: number, yaw = 0): Player {
    const fig = new Figure(opts);
    const p = new Player(fig, this.world);
    this.root.add(fig.root);
    p.place(x, z, yaw);
    p.camYaw = yaw + Math.PI;
    this.player = p;
    if (opts.head === 'mirror') { fig.setClarity(this.state.mirror); fig.setLataif(this.state.lataif); }
    p.snapCamera(this.engine.camera);
    return p;
  }
  startCombat(rules: CombatRules): Combat {
    const c = new Combat(this.player);
    c.rules = rules; c.poise = rules.poise;
    c.onAnger = (a) => { this.hud.vignette(a); this.mirror(this.state.mirror - 0.012); };
    this.combat = c;
    return c;
  }
  endCombat() {
    if (!this.combat) return;
    this.combat.active = false;
    this.player.slow = 1;
    if (!this.player.horse && !this.combat.playerDown) this.player.fig.setPose('stand');
    this.combat = null;
  }
  /** Walk someone somewhere and wait for them. */
  async go(a: Actor, x: number, z: number, speed = 2, stopAt = 0.15) {
    if (this.auto) { a.place(x, z); return; }
    void a.goTo(x, z, speed, stopAt);
    await this.until(() => !a.going);
  }

  // ------------------------------------------------------------ the heart-mirror
  /** Set the heart-mirror's clarity. It shows only on Burhan's face. */
  mirror(v: number) {
    this.state.mirror = THREE.MathUtils.clamp(v, 0.02, 1);
  }

  // ------------------------------------------------------------ player tasks
  /** Wait for the player to come close and press Interact. */
  async interact(target: Actor | { x: number; z: number }, text: string, radius = 2.2) {
    const pos = () => ({ x: target.x, z: target.z });
    let done = false;
    while (!done) {
      const p = pos();
      if (this.auto) { this.player.place(p.x + 0.9, p.z + 0.9); done = true; break; }
      const near = this.player.dist(p.x, p.z) < radius;
      this.hud.prompt(near ? this.hud.key('interact', text) : null);
      if (near && this.input.take('interact')) done = true;
      else await this.frame();
    }
    this.hud.prompt(null);
    await this.frame();
  }
  /** Wait for the player to walk to a place. */
  async reach(x: number, z: number, radius = 2.5, objective?: string) {
    if (objective) this.hud.objective(objective);
    await this.until(() => this.player.dist(x, z) < radius, () => this.player.place(x, z));
    if (objective) this.hud.objective(null);
  }
  /** Wait for an action to be pressed. */
  async press(a: Action, promptText?: string) {
    if (promptText) this.hud.prompt(this.hud.key(a, promptText));
    await this.until(() => this.input.take(a), () => this.input.inject(a));
    this.hud.prompt(null);
  }
  /** The conversation wheel. Returns the register chosen. */
  async wheel(options: WheelOption[], message = ''): Promise<Register | null> {
    const had = this.player?.control;
    if (this.player) this.player.control = false;
    const pr = this.hud.wheel(options, message);
    if (this.auto) { await this.wait(0.5); this.hud.closeWheel(options.find((o) => o.state === 'live')?.register ?? null); }
    const r = await pr;
    this.check();
    if (this.player) this.player.control = had ?? true;
    this.input.wantLock = true;
    return r;
  }
  /** The wheel with nothing to choose. The player can only wait. */
  async wheelWait(options: WheelOption[], message: string, seconds: number) {
    void this.hud.wheel(options, message);
    await this.wait(seconds);
    this.hud.closeWheel(null);
  }

  // ------------------------------------------------------------ the frame
  update(dt: number) {
    this.time += dt;
    this.hud.tickWheel();
    if (this.hud.bookOpen && (this.input.take('advance') || this.input.take('interact'))) this.hud.closeBook();
    this.combat?.update(dt, this.input);
    if (this.player) {
      this.player.tick(dt, this.input, this.engine.camera);
      const f = this.player.fig;
      if (f.opts.head === 'mirror') {
        if (Math.abs(f.clarity - this.state.mirror) > 0.002) f.setClarity(f.clarity + (this.state.mirror - f.clarity) * Math.min(1, dt * 1.5));
        gild.uCenter.value.copy(this.player.p);
      }
    }
    for (const a of this.actors) a.update(dt);
    for (const u of this.updates) u(dt, this.time);
    if (this.camTween) {
      const c = this.camTween;
      c.t += dt;
      const k0 = Math.min(1, c.t / c.dur), k = k0 * k0 * (3 - 2 * k0);
      this.engine.camera.position.lerpVectors(c.p0, c.p1, k);
      this.camLook.lerpVectors(c.l0, c.l1, k);
      this.engine.camera.lookAt(this.camLook);
      if (k0 >= 1) this.camTween = null;
    }
    this.hud.updateLabels(this.engine.camera);
    const w = this.waiters; this.waiters = [];
    for (const x of w) x.res(dt);
  }

  /** Leave the scene now. Every pending wait rejects. */
  abort() {
    if (this.aborted) return;
    this.aborted = true;
    const w = this.waiters; this.waiters = [];
    const e = new SceneAbort();
    for (const x of w) x.rej(e);
  }
  dispose() {
    this.aborted = true;
    this.waiters = [];
    this.hud.reset();
    this.engine.clearRoot();
    audio.hush();
    audio.setNarrow(0);
    audio.restore();
  }
}
