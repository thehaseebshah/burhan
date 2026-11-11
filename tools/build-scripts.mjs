// Converts the eight scripts in docs/Burhan-complete-docs.md (Part 3) into JSON.
// Output: src/data/scripts/<chapter>.json and src/data/scripts/manifest.json
// Lines are never edited: Urdu and English are copied exactly as written.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'docs/Burhan-complete-docs.md'), 'utf8').split('\n');
const outDir = join(root, 'src/data/scripts');
mkdirSync(outDir, { recursive: true });

const ARABIC = /[؀-ۿﭐ-﷿ﹰ-﻿]/;
const start = src.findIndex((l) => l.startsWith('# Part 3: Scripts'));
const end = src.findIndex((l) => l.startsWith('# Part 4: Beat sheet'));
const lines = src.slice(start + 1, end);

const stripItalic = (s) => s.trim().replace(/^\*+/, '').replace(/\*+$/, '').trim();
const isItalic = (s) => /^\*[^*].*\*$/.test(s.trim()) || /^\*".*"\*$/.test(s.trim());
const plain = (s) => s.replace(/\*\*/g, '').replace(/(^|[^*])\*([^*]+)\*/g, '$1$2').trim();
const pad = (n) => String(n).padStart(2, '0');

function hooksFor(speaker, direction, ur) {
  const h = [];
  const d = (direction || '').toLowerCase();
  const reg = /^(burhan|jadal|khitaba|sohbat)\b/.exec(d);
  if (reg) h.push('register:' + reg[1]);
  if (speaker === 'SOHBAT') h.push('register:sohbat');
  if (d.includes('locked')) h.push('locked');
  if (d.includes('tooltip')) h.push('tooltip');
  if (d.includes('video call')) h.push('via:video-call');
  else if (/^phone\b/.test(d)) h.push('via:phone');
  if (speaker === 'AMMI') h.push('voice-only');
  if (d.includes('echo')) h.push('echo');
  if (d.includes('over the speakers')) h.push('via:speakers');
  if (/\(english\)/i.test(speaker) || !ur) h.push('english-only');
  if (/recit|qur|89:27/.test(d)) h.push('recitation');
  return h;
}

function kindOf(title, where) {
  const t = (title + ' ' + (where || '')).toLowerCase();
  if (t.includes('(the gilding)') || t.includes('gilding')) return 'gilding';
  if (t.includes('vision')) return 'vision';
  return 'islamabad';
}

const chapters = [];
let ch = null;
let sc = null;
let mode = 'body'; // body | depths | notes
let field = null; // where | who | play (to absorb following bullets)
let depthKey = null;

function chapterIdFrom(title) {
  const m = /^Chapter (\d+): (.+)$/.exec(title);
  if (m) return { id: 'ch' + m[1], number: Number(m[1]), title: m[2].trim() };
  const p = /^Prologue: (.+)$/.exec(title);
  if (p) return { id: 'prologue', number: 0, title: p[1].trim() };
  return null;
}

let i = 0;
let lineCounter = 0;
let cardCounter = 0;
const nextLine = () => lines[i] ?? '';

while (i < lines.length) {
  const raw = lines[i];
  const line = raw.trimEnd();
  const t = line.trim();

  if (line.startsWith('## ')) {
    const info = chapterIdFrom(line.slice(3).trim());
    if (info) {
      ch = { ...info, summary: '', minutes: null, meta: {}, scenes: [], notes: [] };
      chapters.push(ch);
      sc = null;
      mode = 'head';
    }
    i++;
    continue;
  }
  if (!ch) { i++; continue; }

  if (line.startsWith('### ')) {
    const m = /^### Scene ([0-9]+[a-z]?): (.+)$/.exec(line);
    const key = m ? m[1] : String(ch.scenes.length + 1);
    const num = parseInt(key, 10);
    const suffix = key.replace(/^[0-9]+/, '');
    sc = {
      id: `${ch.id}.s${pad(num)}${suffix}`,
      key,
      title: m ? m[2].trim() : line.slice(4).trim(),
      where: '', who: '', play: '',
      kind: 'islamabad',
      optional: /optional/i.test(line),
      items: [],
      depths: { clear: [], deep: [], deepest: [] },
    };
    ch.scenes.push(sc);
    mode = 'body';
    field = null;
    lineCounter = 0;
    cardCounter = 0;
    i++;
    continue;
  }

  if (t === '---' || t === '') {
    if (t === '') field = null;
    i++;
    continue;
  }

  // Chapter header block (before the first scene)
  if (mode === 'head') {
    const min = /About (\d+) minutes/.exec(t);
    if (min) ch.minutes = Number(min[1]);
    const meta = /^- \*\*([^:]+):\*\*\s*(.+)$/.exec(t);
    if (meta) ch.meta[meta[1].toLowerCase()] = plain(meta[2]);
    i++;
    continue;
  }

  if (/^\*\*Notes for this script\*\*/.test(t)) { mode = 'notes'; i++; continue; }
  if (mode === 'notes') {
    ch.notes.push(plain(t.replace(/^-\s*/, '')));
    i++;
    continue;
  }
  if (!sc) { i++; continue; }

  if (/^\*\*Depths\*\*/.test(t)) { mode = 'depths'; depthKey = null; i++; continue; }
  if (mode === 'depths') {
    const m = /^- \*(Clear|Deep|Deepest):\*\s*(.*)$/.exec(t);
    if (m) {
      depthKey = m[1].toLowerCase();
      if (m[2]) sc.depths[depthKey].push(plain(m[2]));
    } else if (depthKey && t.startsWith('- ')) {
      sc.depths[depthKey].push(plain(t.slice(2)));
    }
    i++;
    continue;
  }

  // Where / Who / Play
  const f = /^\*\*(Where|Who|Play):\*\*\s*(.*)$/.exec(t);
  if (f) {
    field = f[1].toLowerCase();
    sc[field] = plain(f[2]);
    i++;
    continue;
  }
  if (field && t.startsWith('- ')) {
    sc[field] = (sc[field] + ' ' + plain(t.slice(2))).trim();
    i++;
    continue;
  }

  // Speaker line: **NAME** *(direction)*
  const sp = /^\*\*([^*]+)\*\*(?:\s+\*\(([^)]*)\)\*)?\s*$/.exec(t);
  if (sp && /^[A-Z0-9 .'’\-&()a-z]+$/.test(sp[1]) && sp[1].replace(/\([^)]*\)/g, '').trim() === sp[1].replace(/\([^)]*\)/g, '').trim().toUpperCase()) {
    const speakerRaw = sp[1].trim();
    const speaker = speakerRaw.replace(/\s*\([^)]*\)\s*/g, '').trim();
    const direction = sp[2] || '';
    const ur = [];
    const en = [];
    i++;
    while (i < lines.length && nextLine().trim() !== '') {
      const l = nextLine().trim();
      if (isItalic(l)) en.push(stripItalic(l).replace(/^"|"$/g, ''));
      else ur.push(l);
      i++;
    }
    lineCounter++;
    const id = `${sc.id}.l${pad(lineCounter)}`;
    sc.items.push({
      type: 'line', id, speaker, direction,
      ur: ur.join('\n'), en: en.join('\n'),
      audio: id,
      hooks: hooksFor(speakerRaw, direction, ur.join('')),
    });
    continue;
  }

  // Blockquote: Quranic verse or the words of the azan. Copied exactly, never altered,
  // flagged so the game never sends it to text-to-speech or places it in the 3D world.
  if (t.startsWith('>')) {
    const ar = [];
    const en = [];
    let ref = '';
    while (i < lines.length && nextLine().trim().startsWith('>')) {
      const l = nextLine().trim().replace(/^>\s?/, '');
      const m = /^(\*.*\*)\s*(?:\(([^)]+)\))?$/.exec(l);
      if (m) { en.push(stripItalic(m[1])); if (m[2]) ref = m[2]; }
      else if (l) ar.push(l);
      i++;
    }
    cardCounter++;
    const id = `${sc.id}.r${pad(cardCounter)}`;
    sc.items.push({ type: 'recitation', id, ur: ar.join('\n'), en: en.join('\n'), ref, audio: id, hooks: ['recitation'] });
    continue;
  }

  // Card: an Urdu/Arabic line followed by its italic English (title cards, text cards)
  if (ARABIC.test(t) && !t.startsWith('-') && !t.startsWith('**') && !/^[A-Za-z]/.test(t)) {
    const ur = [];
    const en = [];
    while (i < lines.length && nextLine().trim() !== '') {
      const l = nextLine().trim();
      if (isItalic(l)) en.push(stripItalic(l));
      else ur.push(l);
      i++;
    }
    cardCounter++;
    const id = `${sc.id}.c${pad(cardCounter)}`;
    sc.items.push({ type: 'card', id, ur: ur.join('\n'), en: en.join('\n'), audio: id, hooks: [] });
    continue;
  }

  // Titles, e.g. "Title: **بُرہان — BURHAN**"
  const title = /^Title:\s*(.+)$/.exec(t);
  if (title) {
    const bold = /^\*\*(.+?)\*\*\.?\s*(.*)$/.exec(title[1]);
    sc.items.push({ type: 'title', text: plain(bold ? bold[1] : title[1]), note: bold ? plain(bold[2]) : '' });
    i++;
    continue;
  }

  // Everything else is a stage direction (English, never spoken)
  sc.items.push({ type: 'direction', text: plain(t.replace(/^-\s*/, '')) });
  i++;
}

for (const c of chapters) {
  for (const s of c.scenes) s.kind = kindOf(s.title, s.where);
  writeFileSync(join(outDir, `${c.id}.json`), JSON.stringify(c, null, 1) + '\n');
}

const manifest = chapters.map((c) => ({
  id: c.id,
  number: c.number,
  title: c.title,
  minutes: c.minutes,
  meta: c.meta,
  scenes: c.scenes.map((s) => ({
    id: s.id, key: s.key, title: s.title, kind: s.kind, optional: s.optional,
    lines: s.items.filter((x) => x.type === 'line').length,
  })),
}));
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');

const total = chapters.reduce((n, c) => n + c.scenes.reduce((m, s) => m + s.items.filter((x) => x.type === 'line').length, 0), 0);
console.log(`scripts: ${chapters.length} chapters, ${chapters.reduce((n, c) => n + c.scenes.length, 0)} scenes, ${total} spoken lines`);
