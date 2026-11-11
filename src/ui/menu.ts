// Main menu, save slots, chapter select, settings and the pause screen.
import { settings, saveSettings, loadSlot, clearSlot, lastSlot, SLOTS } from '../core/settings';
import { manifest, chapterLabel, isBuilt, VEILS } from '../game/chapters';
import { audio } from '../core/audio';
import type { Input } from '../core/input';

const $ = (id: string) => document.getElementById(id)!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export interface MenuHost {
  /** start or continue in a slot, at a chapter and scene */
  play(slot: number, chapter: string, scene?: string, fresh?: boolean): void;
  resume(): void;
  restartScene(): void;
  quitToMenu(): void;
  applySettings(): void;
}

function sceneName(id: string) {
  for (const c of manifest) for (const s of c.scenes) if (s.id === id) return `${chapterLabel(c)} · ${s.title}`;
  return id;
}

export class Menu {
  private slot = Math.max(0, lastSlot());
  open = false;
  paused = false;
  constructor(private host: MenuHost) {
    $('menu').addEventListener('click', (e) => this.click(e));
    $('pause').addEventListener('click', (e) => this.click(e));
    for (const id of ['menu', 'pause']) $(id).addEventListener('change', (e) => this.change(e));
  }

  private click(e: Event) {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!b || b.hasAttribute('disabled')) return;
    audio.init();
    const [act, a, c] = b.dataset.act!.split(':');
    if (act === 'main') this.main();
    else if (act === 'continue') { const s = loadSlot(this.slot); if (s) this.go(this.slot, s.chapter, s.scene); }
    else if (act === 'slots') this.slots();
    else if (act === 'new') this.go(Number(a), 'prologue', undefined, true);
    else if (act === 'load') { const s = loadSlot(Number(a)); if (s) this.go(Number(a), s.chapter, s.scene); }
    else if (act === 'erase') { clearSlot(Number(a)); this.slots(); }
    else if (act === 'chapters') this.chapters();
    else if (act === 'scene') this.go(this.slot, a, c);
    else if (act === 'settings') this.settings(a === 'pause');
    else if (act === 'controls') this.controls(a === 'pause');
    else if (act === 'resume') this.host.resume();
    else if (act === 'restart') this.host.restartScene();
    else if (act === 'quit') this.host.quitToMenu();
    else if (act === 'pauseback') this.pause();
  }
  private change(e: Event) {
    const t = e.target as HTMLInputElement | HTMLSelectElement;
    const k = t.dataset.set as keyof typeof settings | undefined;
    if (!k) return;
    const cur = settings[k];
    const v = typeof cur === 'boolean' ? t.value === 'true' : typeof cur === 'number' ? Number(t.value) : t.value;
    (settings as unknown as Record<string, unknown>)[k] = v;
    saveSettings();
    this.host.applySettings();
  }
  private go(slot: number, chapter: string, scene?: string, fresh = false) {
    this.slot = slot;
    this.hide();
    this.host.play(slot, chapter, scene, fresh);
  }

  /** Gamepad on the menus: up and down move between buttons, A presses one. */
  tick(input: Input) {
    if (!(this.open || this.paused) || !input.usingPad) return;
    const el = $(this.paused ? 'pause' : 'menu');
    const btns = [...el.querySelectorAll<HTMLElement>('.btn:not([disabled]), summary')].filter((b) => b.offsetParent !== null);
    if (!btns.length) return;
    const i = btns.indexOf(document.activeElement as HTMLElement);
    if (input.pressed('down')) btns[(i + 1) % btns.length].focus();
    else if (input.pressed('up')) btns[(i - 1 + btns.length) % btns.length].focus();
    else if (input.pressed('interact') && i >= 0) btns[i].click();
  }

  hide() { $('menu').classList.add('hidden'); $('pause').classList.add('hidden'); this.open = false; this.paused = false; }
  private render(html: string, pause = false) {
    const el = $(pause ? 'pause' : 'menu');
    el.innerHTML = `<div class="panel">${html}</div>`;
    el.classList.remove('hidden');
    $(pause ? 'menu' : 'pause').classList.add('hidden');
    this.open = !pause; this.paused = pause;
    el.querySelector<HTMLElement>('.btn:not([disabled])')?.focus();
  }

  main() {
    const last = lastSlot();
    if (last >= 0) this.slot = last;
    const s = last >= 0 ? loadSlot(last) : null;
    this.render(`
      <h1 dir="rtl" lang="ur">بُرہان</h1><div class="latin">BURHAN</div>
      ${s ? `<button class="btn" data-act="continue">Continue<span class="sub">Slot ${last + 1} · ${esc(sceneName(s.scene))}</span></button>` : ''}
      <button class="btn" data-act="slots">${s ? 'New game / load' : 'New game'}</button>
      <button class="btn" data-act="chapters">Chapters</button>
      <button class="btn" data-act="settings">Settings</button>
      <button class="btn" data-act="controls">Controls</button>
      <div class="note">Vertical slice: the prologue and chapter 1 are playable. Chapters 2 to 7 are placeholders read from their scripts.<br>Voices are Urdu with English subtitles. Voice, recitation and final art are placeholders.</div>`);
  }

  slots() {
    let h = '<h2>Save slots</h2>';
    for (let i = 0; i < SLOTS; i++) {
      const s = loadSlot(i);
      h += s
        ? `<button class="btn" data-act="load:${i}">Slot ${i + 1}: continue<span class="sub">${esc(sceneName(s.scene))} · ${new Date(s.updated).toLocaleString()}</span></button>
           <div><button class="btn small" data-act="new:${i}">Start again in slot ${i + 1}</button><button class="btn small" data-act="erase:${i}">Erase</button></div>`
        : `<button class="btn" data-act="new:${i}">Slot ${i + 1}: new game<span class="sub">Empty</span></button>`;
    }
    this.render(h + '<button class="btn small" data-act="main">Back</button>');
  }

  chapters() {
    const save = loadSlot(this.slot);
    const unveiled = save?.state.unveiled ?? [];
    let h = `<h2>Chapters</h2><div class="note" style="margin:-8px 0 14px">Playing in slot ${this.slot + 1}</div>`;
    for (const c of manifest) {
      const v = VEILS[c.id];
      // A veil keeps its mask name until the player has unveiled it.
      const name = !v ? c.title : unveiled.includes(c.id) ? `${v.en} · ${v.station}` : `calls itself “${v.mask}” · ${v.station}`;
      h += `<details class="chapter"${c.number <= 1 ? ' open' : ''}><summary>${chapterLabel(c)}: ${esc(name)}<span>${c.minutes ?? '?'} min${isBuilt(c.id) ? '' : ' · <b class="tag">placeholder</b>'}</span></summary><div class="scenes">`;
      for (const s of c.scenes) h += `<button class="btn small" data-act="scene:${c.id}:${s.id}">${esc(s.key)}. ${esc(s.title)}${save?.completed.includes(s.id) ? ' ✓' : ''}</button>`;
      h += '</div></details>';
    }
    this.render(h + '<button class="btn small" data-act="main">Back</button>');
  }

  private sel(key: keyof typeof settings, opts: [string, string][]) {
    return `<select data-set="${key}">${opts.map(([v, l]) => `<option value="${v}"${String(settings[key]) === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
  }
  settings(pause = false) {
    const onoff: [string, string][] = [['true', 'On'], ['false', 'Off']];
    this.render(`<h2>Settings</h2><div class="rows">
      <div class="row"><div>Urdu subtitles</div>${this.sel('subsUr', onoff)}</div>
      <div class="row"><div>English subtitles</div>${this.sel('subsEn', onoff)}</div>
      <div class="row"><div>Lines move on by themselves<small>Off: every line waits for you</small></div>${this.sel('autoAdvance', onoff)}</div>
      <div class="row"><div>Placeholder voice (text-to-speech)<small>Uses your browser's voice if it has one for Urdu. Never used for recitation.</small></div>${this.sel('tts', onoff)}</div>
      <div class="row"><div>Volume</div><input type="range" min="0" max="1" step="0.05" value="${settings.volume}" data-set="volume"></div>
      <div class="row"><div>Graphics<small>Auto holds 60 fps by lowering resolution</small></div>${this.sel('quality', [['auto', 'Auto'], ['low', 'Low'], ['high', 'High']])}</div>
      <div class="row"><div>Invert camera Y</div>${this.sel('invertY', onoff)}</div>
    </div>
    <h2 style="margin-top:26px">Pending with the ulama</h2>
    <div class="note" style="margin:-8px 0 10px">These are switches, not decisions. They wait on the owner.</div>
    <div class="rows">
      <div class="row"><div>Historical awliya and scholars appear as<small>Iqbal, the Mujaddid, and later guides</small></div>${this.sel('figureMode', [['figure', 'Featureless figure'], ['silhouette', 'Silhouette'], ['voice-only', 'Voice only']])}</div>
      <div class="row"><div>Animals</div>${this.sel('animals', [['featureless', 'Featureless']])}</div>
      <div class="row"><div>Women appear as</div>${this.sel('women', [['voice-only', 'Voice only'], ['off-screen', 'Off screen']])}</div>
      <div class="row"><div>Azan in the vision of Madinah<small>Chapter 7, not built yet</small></div>${this.sel('madinahAzan', onoff)}</div>
    </div>
    <button class="btn small" data-act="${pause ? 'pauseback' : 'main'}">Back</button>`, pause);
  }

  controls(pause = false) {
    this.render(`<h2>Controls</h2><div class="controls">
      <div><b>Move</b> W A S D · left stick</div><div><b>Camera</b> mouse · arrows · right stick</div>
      <div><b>Run</b> Shift · LT</div><div><b>Interact</b> E · A</div>
      <div><b>Strike</b> J or click · X</div><div><b>Guard</b> K or right-click · LB</div>
      <div><b>Dodge</b> Space · B</div><div><b>Grapple</b> G · Y</div>
      <div><b>Remember (zikr), breath</b> hold R · RB</div><div><b>Next line</b> Enter or click · A</div>
      <div><b>Pause</b> Esc or P · Start</div><div><b>Wheel</b> W A S D or mouse</div>
    </div><div class="note">Click the game once to capture the mouse.</div>
    <button class="btn small" data-act="${pause ? 'pauseback' : 'main'}">Back</button>`, pause);
  }

  pause() {
    this.render(`<h2>Paused</h2>
      <button class="btn" data-act="resume">Resume</button>
      <button class="btn" data-act="restart">Restart this scene</button>
      <button class="btn" data-act="settings:pause">Settings</button>
      <button class="btn" data-act="controls:pause">Controls</button>
      <button class="btn" data-act="quit">Save and quit to menu</button>`, true);
  }
}
