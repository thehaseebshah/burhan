// The chapter registry. Each chapter's script and scenes load lazily, on first play.
import type { ChapterData, SceneFn } from './director';
import manifestJson from '../data/scripts/manifest.json';

export interface ManifestScene { id: string; key: string; title: string; kind: string; optional: boolean; lines: number }
export interface ManifestChapter { id: string; number: number; title: string; minutes: number | null; meta: Record<string, string>; scenes: ManifestScene[] }
export const manifest = manifestJson as unknown as ManifestChapter[];

/**
 * The seven veils (and the Gilding itself). Masks speak English; the truth speaks Urdu.
 * A chapter shows its veil's mask name until the player has unveiled it by kashf.
 */
export const VEILS: Record<string, { mask: string; ur: string; en: string; stationUr: string; station: string; gloss: string }> = {
  ch1: { mask: 'Neutral', ur: 'بھول', en: 'The Forgetting', stationUr: 'توبہ', station: 'Tawbah', gloss: 'return' },
  ch2: { mask: 'Freedom', ur: 'گراوٹ', en: 'Freefall', stationUr: 'ورع', station: "Wara'", gloss: 'restraint' },
  ch3: { mask: 'Plenty', ur: 'بھوک', en: 'The Hunger', stationUr: 'زہد', station: 'Zuhd', gloss: 'renunciation' },
  ch4: { mask: 'Progress', ur: 'اترائی', en: 'The Slow Descent', stationUr: 'فقر', station: 'Faqr', gloss: 'need of Allah' },
  ch5: { mask: 'Comfort', ur: 'جھاگ', en: 'Foam', stationUr: 'صبر', station: 'Sabr', gloss: 'endurance' },
  ch6: { mask: 'The Artist', ur: 'چہرہ ساز', en: 'The Facemaker', stationUr: 'توکل', station: 'Tawakkul', gloss: 'trust' },
  ch7: { mask: 'The Hero', ur: 'میں', en: 'I', stationUr: 'رضا', station: 'Rida', gloss: 'contentment' },
};

interface Loader { data: () => Promise<ChapterData>; scenes?: () => Promise<Record<string, SceneFn>> }
const json = (p: Promise<{ default: unknown }>) => p.then((m) => m.default as ChapterData);

/** Chapters with `scenes` are built. The rest play as placeholders from their scripts. */
export const CHAPTERS: Record<string, Loader> = {
  prologue: { data: () => json(import('../data/scripts/prologue.json')), scenes: () => import('./prologue').then((m) => m.scenes) },
  ch1: { data: () => json(import('../data/scripts/ch1.json')), scenes: () => Promise.all([import('./ch1a'), import('./ch1b')]).then(([a, b]) => ({ ...a.scenes, ...b.scenes })) },
  ch2: { data: () => json(import('../data/scripts/ch2.json')) },
  ch3: { data: () => json(import('../data/scripts/ch3.json')) },
  ch4: { data: () => json(import('../data/scripts/ch4.json')) },
  ch5: { data: () => json(import('../data/scripts/ch5.json')) },
  ch6: { data: () => json(import('../data/scripts/ch6.json')) },
  ch7: { data: () => json(import('../data/scripts/ch7.json')) },
};
export const isBuilt = (id: string) => !!CHAPTERS[id]?.scenes;
export const chapterLabel = (c: ManifestChapter) => (c.number === 0 ? 'Prologue' : `Chapter ${c.number}`);
