import '@fontsource/noto-nastaliq-urdu/400.css';
import './styles.css';
import { Engine } from './core/engine';
import { Input } from './core/input';
import { audio } from './core/audio';
import { settings, newState, loadSlot, writeSlot, type GameState, type SaveData } from './core/settings';
import { Hud } from './ui/hud';
import { Menu, type MenuHost } from './ui/menu';
import { CHAPTERS, VEILS, manifest, chapterLabel } from './game/chapters';
import { Ctx, SceneAbort, type ChapterData } from './game/director';
import { stubScene } from './game/stub';

const params = new URLSearchParams(location.search);

class Game implements MenuHost {
  engine = new Engine(document.getElementById('stage') as HTMLCanvasElement);
  input = new Input(this.engine.canvas);
  hud = new Hud(this.input);
  menu = new Menu(this);
  state: GameState = newState();
  slot = 0;
  completed: string[] = [];
  ctx: Ctx | null = null;
  /** `?auto=1` plays every scene through without a player. Used by the playthrough test. */
  auto = params.has('auto');
  private run = 0;
  private current: { chapter: string; scene: string } | null = null;
  /** read by the playthrough test */
  log: string[] = [];
  status = 'menu';

  constructor() {
    this.engine.onFrame = (dt) => this.frame(dt);
    this.input.onLockLost = () => { if (this.ctx && !this.menu.paused && !this.hud.wheelOpen && !this.hud.bookOpen) this.pause(); };
    this.engine.start();
    const ch = params.get('chapter');
    if (ch && CHAPTERS[ch]) this.play(Number(params.get('slot') ?? 0), ch, params.get('scene') ?? undefined, true);
    else this.menu.main();
  }

  private frame(dt: number) {
    this.input.update();
    this.menu.tick(this.input);
    if (this.ctx && !this.menu.paused) {
      if (this.input.pressed('pause') && !this.hud.wheelOpen) { this.pause(); return; }
      this.ctx.update(dt);
    } else if (this.menu.paused && this.input.pressed('pause')) this.resume();
  }

  // ------------------------------------------------------------ menu host
  pause() { this.input.wantLock = false; this.input.releaseLock(); audio.hush(); this.menu.pause(); }
  resume() { this.menu.hide(); this.input.wantLock = true; }
  restartScene() { const c = this.current; if (c) { this.menu.hide(); void this.start(c.chapter, c.scene); } }
  quitToMenu() {
    this.run++;
    this.ctx?.abort();
    this.input.wantLock = false;
    this.status = 'menu';
    setTimeout(() => { this.hud.fade('#000', 0, 0); this.menu.main(); }, 30);
  }
  applySettings() { audio.setVolume(settings.volume); this.engine.resize(); }

  play(slot: number, chapter: string, scene?: string, fresh = false) {
    this.slot = slot;
    const save = fresh ? null : loadSlot(slot);
    this.state = save ? save.state : newState();
    this.completed = save ? save.completed : [];
    audio.init();
    void this.start(chapter, scene);
  }

  private save(chapter: string, scene: string) {
    const d: SaveData = { v: 1, updated: Date.now(), chapter, scene, completed: this.completed, state: this.state };
    writeSlot(this.slot, d);
  }

  /** Play from a scene to the end of its chapter, then on into the next chapter. */
  private async start(chapterId: string, sceneId?: string) {
    const my = ++this.run;
    this.ctx?.abort();
    await new Promise((r) => setTimeout(r, 20));
    if (my !== this.run) return;
    this.input.wantLock = true;
    this.hud.fade('#000', 1, 0);
    let chId: string | null = chapterId;
    let from = sceneId;
    try {
      while (chId) {
        const loader = CHAPTERS[chId];
        const [data, scenes] = await Promise.all([loader.data(), loader.scenes ? loader.scenes() : Promise.resolve(null)]);
        if (my !== this.run) return;
        let i = from ? Math.max(0, data.scenes.findIndex((s) => s.id === from)) : 0;
        if (i === 0) await this.chapterCard(data, my);
        for (; i < data.scenes.length; i++) {
          if (my !== this.run) return;
          const sc = data.scenes[i];
          this.current = { chapter: chId, scene: sc.id };
          this.save(chId, sc.id);
          this.status = sc.id;
          this.hud.fade('#000', 1, 0);
          const ctx = new Ctx({ engine: this.engine, input: this.input, hud: this.hud, state: this.state, auto: this.auto }, data, sc);
          this.ctx = ctx;
          const fn = scenes?.[sc.id] ?? stubScene;
          try { await fn(ctx); }
          finally { ctx.dispose(); if (this.ctx === ctx) this.ctx = null; }
          if (!this.completed.includes(sc.id)) this.completed.push(sc.id);
          this.log.push(sc.id);
        }
        const next: string | null = manifest[manifest.findIndex((c) => c.id === chId) + 1]?.id ?? null;
        if (next) this.save(next, manifest.find((c) => c.id === next)!.scenes[0].id);
        chId = next; from = undefined;
      }
      this.status = 'done';
      this.quitToMenu();
    } catch (e) {
      if (e instanceof SceneAbort) return;
      this.status = 'error: ' + (e as Error).message;
      console.error(e);
      this.hud.reset();
      this.hud.fade('#000', 0, 0);
      this.menu.main();
    }
  }

  /** Chapter titles show the veil and the station. */
  private async chapterCard(data: ChapterData, my: number) {
    if (this.auto) return;
    const m = manifest.find((c) => c.id === data.id)!;
    const v = VEILS[data.id];
    const unveiled = this.state.unveiled.includes(data.id);
    const en = v ? (unveiled ? v.en.toUpperCase() : `“${v.mask.toUpperCase()}”`) : data.title.toUpperCase();
    const note = v ? `${unveiled ? 'The veil' : 'The veil calls itself'}: ${unveiled ? v.en : v.mask}  ·  The station: ${v.station} (${v.gloss})` : '';
    this.hud.title(v && unveiled ? v.ur : '', `${chapterLabel(m).toUpperCase()}   ${en}`, note, true);
    this.hud.showTitle();
    audio.daf();
    await new Promise((r) => setTimeout(r, 4200));
    if (my === this.run) this.hud.clearTitle();
  }
}

const game = new Game();
(window as unknown as { game: Game }).game = game;
