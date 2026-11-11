// Keyboard, mouse and gamepad, folded into one set of actions.
export type Action =
  | 'interact' | 'attack' | 'guard' | 'dodge' | 'grapple' | 'remember' | 'advance' | 'pause' | 'run'
  | 'up' | 'down' | 'left' | 'right';

const KEYS: Record<Action, string[]> = {
  interact: ['KeyE'],
  attack: ['KeyJ'],
  guard: ['KeyK'],
  dodge: ['Space'],
  grapple: ['KeyG'],
  remember: ['KeyR'],
  advance: ['Enter', 'Space'],
  pause: ['Escape', 'KeyP'],
  run: ['ShiftLeft', 'ShiftRight'],
  up: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
};
// Standard gamepad mapping
const PAD: Partial<Record<Action, number[]>> = {
  interact: [0], advance: [0], dodge: [1], attack: [2], grapple: [3], guard: [4], remember: [5, 7],
  pause: [9], run: [6, 10], up: [12], down: [13], left: [14], right: [15],
};
const GLYPH_KEY: Partial<Record<Action, string>> = {
  interact: 'E', attack: 'J / Click', guard: 'K / Right-click', dodge: 'Space', grapple: 'G', remember: 'R', advance: 'Enter', pause: 'Esc', run: 'Shift',
};
const GLYPH_PAD: Partial<Record<Action, string>> = {
  interact: 'A', attack: 'X', guard: 'LB', dodge: 'B', grapple: 'Y', remember: 'RB', advance: 'A', pause: 'Start', run: 'LT',
};

export class Input {
  private keys = new Set<string>();
  /** keys pressed since the last frame, so a quick tap between frames is never lost */
  private tapped = new Set<string>();
  private mouse = new Set<number>();
  private padDown = new Set<number>();
  private now = new Set<Action>();
  private prev = new Set<Action>();
  private queued = new Set<Action>();
  moveX = 0;
  moveY = 0;
  lookX = 0;
  lookY = 0;
  private mdx = 0;
  private mdy = 0;
  usingPad = false;
  locked = false;
  /** Set true while the game wants the mouse captured (gameplay, not menus). */
  wantLock = false;
  onLockLost: (() => void) | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Tab') return;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      if (!e.repeat) { this.keys.add(e.code); this.tapped.add(e.code); }
      this.usingPad = false;
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => { this.keys.clear(); this.mouse.clear(); });
    canvas.addEventListener('mousedown', (e) => {
      this.usingPad = false;
      if (this.wantLock && !this.locked) { canvas.requestPointerLock?.()?.catch?.(() => {}); this.queued.add('advance'); return; }
      this.mouse.add(e.button);
      if (e.button === 0) this.queued.add('advance');
    });
    window.addEventListener('mouseup', (e) => this.mouse.delete(e.button));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('mousemove', (e) => {
      if (this.locked) { this.mdx += e.movementX; this.mdy += e.movementY; }
    });
    document.addEventListener('pointerlockchange', () => {
      const was = this.locked;
      this.locked = document.pointerLockElement === canvas;
      if (was && !this.locked && this.wantLock) this.onLockLost?.();
    });
  }

  releaseLock() { if (this.locked) document.exitPointerLock?.(); }

  private rawHeld(a: Action): boolean {
    for (const k of KEYS[a]) if (this.keys.has(k) || this.tapped.has(k)) return true;
    const p = PAD[a];
    if (p) for (const b of p) if (this.padDown.has(b)) return true;
    if (this.locked) {
      if (a === 'attack' && this.mouse.has(0)) return true;
      if (a === 'guard' && this.mouse.has(2)) return true;
    }
    return false;
  }

  /** Call once per frame before game logic. */
  update() {
    this.padDown.clear();
    let px = 0, py = 0, lx = 0, ly = 0;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of pads) {
      if (!gp) continue;
      gp.buttons.forEach((b, i) => { if (b.pressed || b.value > 0.5) this.padDown.add(i); });
      const dz = (v: number) => (Math.abs(v) < 0.18 ? 0 : v);
      px += dz(gp.axes[0] ?? 0); py += dz(gp.axes[1] ?? 0);
      lx += dz(gp.axes[2] ?? 0); ly += dz(gp.axes[3] ?? 0);
      if (this.padDown.size || px || py || lx || ly) this.usingPad = true;
    }
    this.prev = this.now;
    this.now = new Set<Action>();
    (Object.keys(KEYS) as Action[]).forEach((a) => { if (this.rawHeld(a)) this.now.add(a); });
    for (const a of this.queued) this.now.add(a);
    this.queued = new Set();
    this.tapped.clear();

    let mx = (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0) + px;
    let my = (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0) - py;
    if (this.padDown.has(15)) mx += 1;
    if (this.padDown.has(14)) mx -= 1;
    if (this.padDown.has(12)) my += 1;
    if (this.padDown.has(13)) my -= 1;
    const len = Math.hypot(mx, my);
    if (len > 1) { mx /= len; my /= len; }
    this.moveX = mx; this.moveY = my;
    const kx = (this.keys.has('ArrowRight') ? 1 : 0) - (this.keys.has('ArrowLeft') ? 1 : 0);
    const ky = (this.keys.has('ArrowDown') ? 1 : 0) - (this.keys.has('ArrowUp') ? 1 : 0);
    this.lookX = this.mdx * 0.0024 + (kx + lx) * 0.035;
    this.lookY = this.mdy * 0.0024 + (ky + ly) * 0.025;
    this.mdx = 0; this.mdy = 0;
  }

  held(a: Action) { return this.now.has(a); }
  pressed(a: Action) { return this.now.has(a) && !this.prev.has(a); }
  /** Consume a press so later readers in the same frame don't see it. */
  take(a: Action) { if (this.pressed(a)) { this.prev.add(a); return true; } return false; }
  glyph(a: Action) { return (this.usingPad ? GLYPH_PAD[a] : GLYPH_KEY[a]) ?? a; }
  /** For tests and the auto-player. */
  inject(a: Action) { this.queued.add(a); }
}
