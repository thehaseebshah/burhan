// Placeholder sound, synthesised with WebAudio. Hard rules kept here:
// - no instruments: only noise, breath, impacts and a daf-like drum thump (percussion);
// - no recitation, azan or nasheed is ever synthesised: those wait for licensed recordings
//   and are shown as captions until then;
// - Quranic text is never sent to text-to-speech.
import { settings } from './settings';

export interface Ambient {
  /** broadband bed: wind, hall murmur, engine */
  noise?: { freq: number; q?: number; gain: number; wobble?: number };
  /** the Gilding's notification hum */
  hum?: number;
  crickets?: number;
  fire?: number;
}

class AudioSys {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private narrow!: BiquadFilterNode;
  private amb!: GainNode;
  private noiseBuf!: AudioBuffer;
  private ambNodes: AudioNode[] = [];
  private timers: number[] = [];

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') void this.ctx.resume(); return; }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = settings.volume;
    this.narrow = ctx.createBiquadFilter();
    this.narrow.type = 'lowpass';
    this.narrow.frequency.value = 20000;
    this.amb = ctx.createGain();
    this.amb.gain.value = 1;
    this.amb.connect(this.narrow);
    this.narrow.connect(this.master);
    this.master.connect(ctx.destination);
    const len = ctx.sampleRate * 2;
    this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.04 * w) / 1.04; d[i] = last * 6 + w * 0.15; }
  }

  setVolume(v: number) { if (this.ctx) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05); }

  /** "The sound narrows": 0 = open, 1 = muffled. */
  setNarrow(a: number) {
    if (!this.ctx) return;
    this.narrow.frequency.setTargetAtTime(20000 * Math.pow(0.02, a) + 200 * a, this.ctx.currentTime, 0.3);
  }

  private noise(): AudioBufferSourceNode {
    const s = this.ctx!.createBufferSource();
    s.buffer = this.noiseBuf; s.loop = true;
    return s;
  }

  setAmbient(a: Ambient | null) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const old = this.amb;
    old.gain.setTargetAtTime(0, t, 0.4);
    const oldNodes = this.ambNodes;
    setTimeout(() => { oldNodes.forEach((n) => { try { (n as AudioBufferSourceNode).stop?.(); } catch { /* */ } n.disconnect(); }); old.disconnect(); }, 2500);
    this.timers.forEach((id) => clearInterval(id));
    this.timers = [];
    this.ambNodes = [];
    this.amb = ctx.createGain();
    this.amb.gain.value = 0;
    this.amb.gain.setTargetAtTime(1, t, 0.8);
    this.amb.connect(this.narrow);
    if (!a) return;
    if (a.noise) {
      const s = this.noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'bandpass'; f.frequency.value = a.noise.freq; f.Q.value = a.noise.q ?? 0.6;
      g.gain.value = a.noise.gain;
      if (a.noise.wobble) {
        const l = ctx.createOscillator(), lg = ctx.createGain();
        l.frequency.value = 0.13; lg.gain.value = a.noise.gain * a.noise.wobble;
        l.connect(lg); lg.connect(g.gain); l.start(); this.ambNodes.push(l);
      }
      s.connect(f); f.connect(g); g.connect(this.amb); s.start();
      this.ambNodes.push(s);
    }
    if (a.hum) {
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 118; o2.type = 'sine'; o2.frequency.value = 119.3;
      g.gain.value = a.hum * 0.12;
      o.connect(g); o2.connect(g); g.connect(this.amb); o.start(); o2.start();
      this.ambNodes.push(o, o2);
      this.timers.push(window.setInterval(() => { if (Math.random() < 0.6) this.chime(0.25 * a.hum!); }, 900));
    }
    if (a.crickets) {
      const o = ctx.createOscillator(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 4300; g.gain.value = 0;
      l.type = 'square'; l.frequency.value = 17; lg.gain.value = a.crickets * 0.012;
      l.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(this.amb); o.start(); l.start();
      this.ambNodes.push(o, l);
    }
    if (a.fire) {
      const fire = a.fire;
      this.timers.push(window.setInterval(() => { if (Math.random() < 0.5) this.burst(1800 + Math.random() * 2500, 0.03, fire * 0.12, 4, this.amb); }, 110));
    }
  }

  private burst(freq: number, dur: number, gain: number, q = 1, dest?: AudioNode, type: BiquadFilterType = 'bandpass') {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const s = this.noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest ?? this.narrow);
    s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }

  private thump(f0: number, f1: number, dur: number, gain: number) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.narrow); o.start(t); o.stop(t + dur + 0.05);
  }

  /** A single daf-like drum stroke: skin thump plus a short rattle. */
  daf(soft = false) { this.thump(150, 62, 0.42, soft ? 0.35 : 0.7); this.burst(3200, 0.09, soft ? 0.05 : 0.12, 2); }
  hit() { this.thump(190, 70, 0.14, 0.5); this.burst(900, 0.08, 0.25, 1.2); }
  block() { this.burst(2400, 0.07, 0.3, 5); this.thump(320, 180, 0.06, 0.25); }
  whoosh() { this.burst(700, 0.2, 0.12, 0.8); }
  step() { this.burst(260, 0.05, 0.06, 1.5); }
  hoof() { this.thump(120, 60, 0.07, 0.28); }
  shot() { this.burst(1200, 0.5, 0.9, 0.4); this.thump(160, 40, 0.3, 0.8); }
  crack() { this.burst(3800, 0.25, 0.5, 3); this.burst(900, 0.5, 0.3, 1); }
  roar(dur = 2.5) { this.burst(700, dur, 0.35, 0.5); this.burst(1500, dur * 0.8, 0.2, 0.7); }
  flash() { this.burst(5200, 0.05, 0.12, 6); }
  water(dur = 4) { this.burst(2600, dur, 0.55, 0.7); this.burst(900, dur, 0.3, 0.9); }
  kettle(dur = 6) { this.burst(5200, dur, 0.05, 8); }
  breath(inward: boolean, dur = 3.5) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const s = this.noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'bandpass'; f.Q.value = 0.9;
    f.frequency.setValueAtTime(inward ? 500 : 900, t);
    f.frequency.linearRampToValueAtTime(inward ? 1100 : 380, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.16, t + dur * 0.5);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.narrow); s.start(t); s.stop(t + dur + 0.1);
  }
  chime(gain = 0.2) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = [1318, 1568, 1760, 2093][Math.floor(Math.random() * 4)];
    g.gain.setValueAtTime(gain * 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g); g.connect(this.amb); o.start(t); o.stop(t + 0.4);
  }

  /** "The sound cuts." */
  cut() {
    if (!this.ctx) return;
    this.setAmbient(null);
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setValueAtTime(0, this.ctx.currentTime);
  }
  restore() { if (this.ctx) this.master.gain.setTargetAtTime(settings.volume, this.ctx.currentTime, 0.6); }

  /** Optional placeholder voice. Never used for recitation. */
  speak(text: string, lang: 'ur' | 'en') {
    if (!settings.tts || !('speechSynthesis' in window) || !text) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'ur' ? 'ur-PK' : 'en-GB';
      u.rate = 0.95;
      u.volume = settings.volume;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch { /* placeholder voice is optional */ }
  }
  hush() { try { speechSynthesis?.cancel(); } catch { /* */ } }
}

export const audio = new AudioSys();
