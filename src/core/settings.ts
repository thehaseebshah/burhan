// Settings, the owner's pending switches, and save slots (localStorage).

/**
 * PENDING SWITCHES. These wait on the owner's ulama. They are built as switches and
 * must not be decided in code. Defaults follow the build brief.
 */
export interface PendingSwitches {
  /** How historical awliya and scholars appear (Iqbal, the Mujaddid, Rumi, Ghazali...). */
  figureMode: 'figure' | 'silhouette' | 'voice-only';
  /** Animals. Only the featureless form is built. */
  animals: 'featureless';
  /** How women appear. Only voice-only is built (Ammi is voice only in the scripts). */
  women: 'voice-only' | 'off-screen';
  /** The azan heard in the vision of Madinah (chapter 7). */
  madinahAzan: boolean;
}

export interface Settings extends PendingSwitches {
  subsUr: boolean;
  subsEn: boolean;
  tts: boolean;
  autoAdvance: boolean;
  volume: number;
  quality: 'auto' | 'low' | 'medium' | 'high';
  invertY: boolean;
}

const DEFAULTS: Settings = {
  figureMode: 'figure',
  animals: 'featureless',
  women: 'voice-only',
  madinahAzan: true,
  subsUr: true,
  subsEn: true,
  tts: false,
  autoAdvance: true,
  volume: 0.8,
  quality: 'auto',
  invertY: false,
};

const SKEY = 'burhan.settings.v1';
const store = {
  get(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* private mode: play without saving */ } },
  del(k: string) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

export const settings: Settings = { ...DEFAULTS, ...safeParse(store.get(SKEY)) };
export function saveSettings() { store.set(SKEY, JSON.stringify(settings)); }

function safeParse(s: string | null): Record<string, unknown> {
  if (!s) return {};
  try { const v = JSON.parse(s); return v && typeof v === 'object' ? v : {}; } catch { return {}; }
}

/** The heart's state. There are no health or XP bars: this is shown on Burhan's face. */
export interface GameState {
  /** Heart-mirror clarity, 0 (rust) to 1 (polish). */
  mirror: number;
  /** qalb, ruh, sirr, khafi, akhfa */
  lataif: boolean[];
  /** The four pillars: heart, mind, tongue, hands. Act I Burhan has only a tongue and a mind. */
  pillars: { heart: number; mind: number; tongue: number; hands: number };
  flags: Record<string, string | number | boolean>;
  /** True names the player has unveiled, by chapter id. */
  unveiled: string[];
}

export function newState(): GameState {
  return {
    mirror: 0.1,
    lataif: [false, false, false, false, false],
    pillars: { heart: 0, mind: 0.6, tongue: 0.7, hands: 0 },
    flags: {},
    unveiled: [],
  };
}

export interface SaveData {
  v: 1;
  updated: number;
  chapter: string;
  scene: string;
  completed: string[];
  state: GameState;
}

export const SLOTS = 3;
const slotKey = (n: number) => `burhan.save.v1.slot${n}`;

export function loadSlot(n: number): SaveData | null {
  const d = safeParse(store.get(slotKey(n))) as Partial<SaveData>;
  if (d.v !== 1 || !d.chapter || !d.scene || !d.state) return null;
  return { ...(d as SaveData), state: { ...newState(), ...d.state }, completed: d.completed ?? [] };
}
export function writeSlot(n: number, d: SaveData) { store.set(slotKey(n), JSON.stringify(d)); }
export function clearSlot(n: number) { store.del(slotKey(n)); }
export function lastSlot(): number {
  let best = -1, t = 0;
  for (let i = 0; i < SLOTS; i++) { const s = loadSlot(i); if (s && s.updated > t) { t = s.updated; best = i; } }
  return best;
}
