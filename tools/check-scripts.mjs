// Checks the script JSON against the hard rules that can be checked by machine.
// Run after `npm run scripts`.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/data/scripts');
const doc = readFileSync(join(root, 'docs/Burhan-complete-docs.md'), 'utf8');
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
ok(manifest.length === 8, `expected 8 scripts (prologue + 7 chapters), found ${manifest.length}`);
let lines = 0;
for (const m of manifest) {
  const ch = JSON.parse(readFileSync(join(dir, `${m.id}.json`), 'utf8'));
  ok(ch.scenes.length > 0, `${m.id}: no scenes`);
  const ids = new Set();
  for (const s of ch.scenes) {
    ok(s.depths.clear.length && s.depths.deep.length && s.depths.deepest.length, `${s.id}: every scene ends with its three depths`);
    for (const it of s.items) {
      if (it.id) { ok(!ids.has(it.id), `${it.id}: duplicate id`); ids.add(it.id); }
      if (it.type === 'line') {
        lines++;
        ok(!!it.en, `${it.id}: no English subtitle`);
        ok(!!it.ur || it.hooks.includes('english-only'), `${it.id}: no Urdu line`);
      }
      // Every Urdu, Arabic and English string must be in the source document exactly as written.
      for (const text of [it.ur, it.en]) for (const part of (text ?? '').split('\n')) ok(!part || doc.includes(part), `${it.id}: text differs from the source document: ${part.slice(0, 40)}`);
      if (it.type === 'recitation') ok(it.hooks.includes('recitation'), `${it.id}: recitation must be flagged so it is never machine-voiced`);
    }
  }
}
// The organization's name is a pending question: it must not appear anywhere in the game.
const scan = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? scan(join(d, e.name)) : [join(d, e.name)]));
for (const f of [...scan(join(root, 'src')), join(root, 'index.html')]) ok(!/Al-Burhan/i.test(readFileSync(f, 'utf8')), `${f}: the organization's name must not appear in the game`);

if (fails.length) { console.error(fails.join('\n')); process.exit(1); }
console.log(`ok: ${manifest.length} scripts, ${manifest.reduce((n, m) => n + m.scenes.length, 0)} scenes, ${lines} spoken lines, all text matches the source document`);
