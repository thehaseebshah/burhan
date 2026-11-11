// Everything the player reads is HTML over the canvas, never drawn in WebGL, so Urdu gets
// proper Nastaliq shaping (Noto Nastaliq Urdu, dir="rtl").
import * as THREE from 'three';
import type { Input } from '../core/input';
import { settings } from '../core/settings';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const show = (el: HTMLElement, on: boolean) => el.classList.toggle('hidden', !on);
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));

export type Register = 'burhan' | 'jadal' | 'khitaba' | 'sohbat';
export interface WheelOption { register: Register; state: 'live' | 'grey' | 'locked'; ur?: string; en?: string; tooltip?: string }
/** The four ways to speak. Urdu names are the registers' own names. */
export const REGISTERS: Record<Register, { ur: string; name: string; gloss: string }> = {
  burhan: { ur: 'بُرہان', name: 'Burhan', gloss: 'proof' },
  jadal: { ur: 'جدل', name: 'Jadal', gloss: 'debate' },
  khitaba: { ur: 'خطابہ', name: 'Khitaba', gloss: 'moving speech' },
  sohbat: { ur: 'صحبت', name: 'Sohbat', gloss: 'companionship' },
};

interface Label { el: HTMLElement; pos: THREE.Vector3; range: number }

export class Hud {
  private labels: Label[] = [];
  private v = new THREE.Vector3();
  private softTimer = 0;
  private wheelFocus: Register | null = null;
  private wheelOpts: WheelOption[] = [];
  private wheelDone: ((r: Register | null) => void) | null = null;
  private wheelMsg = '';
  private bookDone: (() => void) | null = null;

  constructor(private input: Input) {}

  // ---- subtitles: Urdu and English together
  sub(speaker: string, ur: string, en: string, cls = '') {
    const el = $('subs');
    el.className = cls;
    el.querySelector<HTMLElement>('.speaker')!.textContent = speaker;
    const u = el.querySelector<HTMLElement>('.ur')!, e = el.querySelector<HTMLElement>('.en')!;
    u.textContent = ur; e.textContent = en;
    show(u, settings.subsUr && !!ur);
    // English-only lines (the masks, the podcast) always show their English.
    show(e, (settings.subsEn || !ur) && !!en);
  }
  clearSub() { show($('subs'), false); }

  card(ur: string, en: string, cls = '') {
    const el = $('card');
    el.className = cls;
    el.querySelector<HTMLElement>('.ur')!.textContent = ur;
    el.querySelector<HTMLElement>('.en')!.textContent = en;
  }
  clearCard() { show($('card'), false); }

  title(ur: string, en: string, note = '', small = false) {
    const el = $('title');
    el.className = small ? 'small' : '';
    el.querySelector<HTMLElement>('.ur')!.textContent = ur;
    el.querySelector<HTMLElement>('.en')!.textContent = en;
    el.querySelector<HTMLElement>('.note')!.textContent = note;
  }
  clearTitle() { show($('title'), false); }

  /** Fade the whole view. Resolves after `dur` seconds of real time. */
  fade(color: string, opacity: number, dur: number) {
    const el = $('fade');
    el.style.transition = `opacity ${dur}s linear`;
    el.style.background = color;
    void el.offsetWidth;
    el.style.opacity = String(opacity);
  }

  prompt(html: string | null) { const el = $('prompt'); if (html === null) { show(el, false); return; } el.innerHTML = html; show(el, true); }
  key(a: Parameters<Input['glyph']>[0], text: string) { return `<kbd>${esc(this.input.glyph(a))}</kbd>${esc(text)}`; }
  objective(text: string | null) { const el = $('objective'); if (!text) { show(el, false); return; } el.textContent = text; show(el, true); }
  /** Sounds that are placeholders, or carried by caption only (azan, recitation). */
  caption(text: string | null) { const el = $('caption'); if (!text) { show(el, false); return; } el.textContent = text; show(el, true); }
  soft(text: string) {
    const el = $('soft');
    el.textContent = text; show(el, false); void el.offsetWidth; show(el, true);
    clearTimeout(this.softTimer);
    this.softTimer = window.setTimeout(() => show(el, false), 5000);
  }
  vignette(v: number) { $('vignette').style.opacity = String(Math.max(0, Math.min(1, v))); }

  // ---- labels anchored to the 3D world (banners, ID cards, plates)
  label(text: string, pos: THREE.Vector3, cls = '', range = 60): HTMLElement {
    const el = document.createElement('div');
    el.className = 'wlabel ' + cls;
    el.textContent = text;
    $('labels').appendChild(el);
    this.labels.push({ el, pos, range });
    return el;
  }
  updateLabels(camera: THREE.Camera) {
    const w = window.innerWidth, h = window.innerHeight;
    for (const l of this.labels) {
      if (l.el.classList.contains('falling')) continue;
      this.v.copy(l.pos).project(camera);
      const d = camera.position.distanceTo(l.pos);
      const vis = this.v.z < 1 && this.v.z > -1 && Math.abs(this.v.x) < 1.1 && Math.abs(this.v.y) < 1.1 && d < l.range;
      l.el.style.display = vis ? '' : 'none';
      if (vis) {
        const s = THREE.MathUtils.clamp(9 / d, 0.4, 1);
        l.el.style.transform = `translate(-50%, -50%) translate(${((this.v.x + 1) / 2) * w}px, ${((1 - this.v.y) / 2) * h}px) scale(${s.toFixed(3)})`;
      }
    }
  }
  /** "The banners fall." */
  dropLabel(el: HTMLElement) { el.classList.add('falling'); el.style.transform += ' translateY(60vh) rotate(24deg)'; }

  // ---- the ID card (the Forgetting drains its letters)
  idCard(letters: string[] | null, shown = 0, latin = '') {
    const el = $('idcard');
    if (!letters) { show(el, false); return; }
    if (!el.dataset.built || el.dataset.built !== letters.join('')) {
      el.innerHTML = `<div class="who">STUDENT ID</div><div class="name">${letters.map((l) => `<span>${esc(l)}</span>`).join('')}</div><div class="lat"></div>`;
      el.dataset.built = letters.join('');
    }
    el.querySelectorAll<HTMLElement>('.name span').forEach((s, i) => s.classList.toggle('gone', i >= shown));
    el.querySelector<HTMLElement>('.lat')!.textContent = latin;
    show(el, true);
  }

  // ---- the crowd meter (the debate)
  crowd(on: boolean, value = 0, moved = '') {
    const el = $('crowd');
    if (!on) { show(el, false); return; }
    if (!el.firstChild) el.innerHTML = '<div class="lbl">THE CROWD</div><div class="bar"><div class="fill"></div></div><div class="moved"></div>';
    show(el, true);
    void el.offsetWidth;
    el.querySelector<HTMLElement>('.fill')!.style.width = `${Math.round(value * 100)}%`;
    el.querySelector<HTMLElement>('.moved')!.textContent = moved;
  }

  // ---- the ring: zikr (hold to remember) and the breath
  ring(scale: number | null, word = '', sub = '') {
    const el = $('ring');
    if (scale === null) { show(el, false); return; }
    show(el, true);
    el.style.setProperty('--s', scale.toFixed(3));
    el.querySelector<HTMLElement>('.ring-word')!.textContent = word;
    el.querySelector<HTMLElement>('.ring-sub')!.textContent = sub;
  }

  // ---- a phone or video call. Women are voice only (pending switch): no figure, only a name.
  phone(who: string | null, ur = '', kind = 'CALL') {
    const el = $('phone');
    if (!who) { show(el, false); return; }
    el.innerHTML = `<div class="kind">${esc(kind)}</div><div class="avatar"></div><div class="who">${esc(who)}</div><div class="ur" dir="rtl" lang="ur">${esc(ur)}</div><div class="wave"></div>`;
    show(el, true);
  }

  // ---- kashf: the English mask cracks and the Urdu true name shows through
  async kashf(mask: string, trueName: string, subtitle: string, wait: (s: number) => Promise<void>, onCrack?: () => void) {
    const el = $('kashf');
    const shards = [
      'polygon(0 0, 46% 0, 38% 48%, 0 62%)', 'polygon(46% 0, 100% 0, 100% 38%, 61% 52%, 38% 48%)',
      'polygon(0 62%, 38% 48%, 52% 100%, 0 100%)', 'polygon(38% 48%, 61% 52%, 100% 38%, 100% 100%, 52% 100%)',
    ];
    el.className = '';
    el.innerHTML = `<div class="screen"><div class="true" dir="rtl" lang="ur">${esc(trueName)}</div>${shards.map((p) => `<div class="shard" style="clip-path:${p}">${esc(mask)}</div>`).join('')}
      <svg class="crack" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M46 0 L38 48 L0 62 M38 48 L52 100 M38 48 L61 52 L100 38" stroke="#111" stroke-width="0.8" fill="none" vector-effect="non-scaling-stroke"/></svg></div>
      <div class="subtitle">${esc(subtitle)}</div>`;
    await wait(1.4);
    el.classList.add('cracking');
    onCrack?.();
    await wait(1.1);
    const moves = ['translate(-40%, -70%) rotate(-18deg)', 'translate(45%, -60%) rotate(14deg)', 'translate(-50%, 80%) rotate(12deg)', 'translate(40%, 90%) rotate(-20deg)'];
    el.querySelectorAll<HTMLElement>('.shard').forEach((s, i) => { s.style.transform = moves[i]; });
    el.classList.add('open');
    await wait(5.2);
    show(el, false);
  }

  // ---- the conversation wheel: four registers, each live, greyed or locked
  wheel(options: WheelOption[], message = ''): Promise<Register | null> {
    this.wheelOpts = options; this.wheelMsg = message;
    const el = $('wheel');
    const anyLive = options.some((o) => o.state === 'live');
    el.innerHTML = `<div class="rim">${options.map((o) => {
      const r = REGISTERS[o.register];
      return `<div class="petal p-${o.register} ${o.state}" data-r="${o.register}"><div class="ur" dir="rtl" lang="ur">${r.ur}</div><div class="nm">${r.name}</div><div class="gl">${r.gloss}</div></div>`;
    }).join('')}<div class="hub"></div><div class="hint">${anyLive ? 'Choose how to speak: move to a register, then confirm' : ''}</div></div>`;
    el.querySelectorAll<HTMLElement>('.petal').forEach((p) => {
      const r = p.dataset.r as Register;
      p.addEventListener('mouseenter', () => this.focusWheel(r));
      p.addEventListener('click', () => { this.focusWheel(r); this.confirmWheel(); });
    });
    show(el, true);
    this.wheelFocus = null;
    this.focusWheel(null);
    this.input.releaseLock();
    return new Promise((res) => { this.wheelDone = res; });
  }
  get wheelOpen() { return !!this.wheelDone; }
  private focusWheel(r: Register | null) {
    this.wheelFocus = r;
    const el = $('wheel');
    el.querySelectorAll<HTMLElement>('.petal').forEach((p) => p.classList.toggle('focus', p.dataset.r === r));
    const hub = el.querySelector<HTMLElement>('.hub')!;
    const o = this.wheelOpts.find((x) => x.register === r);
    if (!o) hub.innerHTML = this.wheelMsg ? `<div class="msg">${esc(this.wheelMsg)}</div>` : '';
    else if (o.state === 'locked') hub.innerHTML = `<div class="en">${esc(o.tooltip ?? '')}</div>`;
    else if (o.state === 'grey') hub.innerHTML = `<div class="msg">${esc(this.wheelMsg)}</div>`;
    else hub.innerHTML = `<div class="ur" dir="rtl" lang="ur">${esc(o.ur ?? '')}</div><div class="en">${esc(o.en ?? '')}</div>`;
  }
  private confirmWheel() {
    const o = this.wheelOpts.find((x) => x.register === this.wheelFocus);
    if (!o || o.state !== 'live') return;
    this.closeWheel(o.register);
  }
  closeWheel(r: Register | null = null) {
    show($('wheel'), false);
    const d = this.wheelDone; this.wheelDone = null;
    d?.(r);
  }
  /** Keyboard and gamepad on the wheel. Called every frame while it is open. */
  tickWheel() {
    if (!this.wheelDone) return;
    const i = this.input;
    if (i.pressed('up')) this.focusWheel('burhan');
    else if (i.pressed('right')) this.focusWheel('jadal');
    else if (i.pressed('down')) this.focusWheel('khitaba');
    else if (i.pressed('left')) this.focusWheel('sohbat');
    if (i.take('advance') || i.take('interact')) this.confirmWheel();
  }

  // ---- a hidden book
  book(kicker: string, heading: string, body: string): Promise<void> {
    const el = $('book');
    el.innerHTML = `<div class="page"><h3>${esc(kicker)}</h3><h2>${esc(heading)}</h2><div>${body}</div><div class="close">${this.key('advance', 'Close the book')}</div></div>`;
    show(el, true);
    el.onclick = () => this.closeBook();
    return new Promise((res) => { this.bookDone = res; });
  }
  get bookOpen() { return !!this.bookDone; }
  closeBook() { show($('book'), false); const d = this.bookDone; this.bookDone = null; d?.(); }

  /** Clear everything a scene may have left on screen. */
  reset() {
    for (const l of this.labels) l.el.remove();
    this.labels = [];
    this.clearSub(); this.clearCard(); this.clearTitle();
    this.prompt(null); this.objective(null); this.caption(null);
    this.idCard(null); this.crowd(false); this.ring(null); this.phone(null);
    show($('kashf'), false); show($('soft'), false);
    if (this.wheelDone) this.closeWheel(null);
    if (this.bookDone) this.closeBook();
    this.vignette(0);
  }
  showSub() { show($('subs'), true); }
  showCard() { const el = $('card'); show(el, false); void el.offsetWidth; show(el, true); }
  showTitle() { const el = $('title'); show(el, false); void el.offsetWidth; show(el, true); }
}
