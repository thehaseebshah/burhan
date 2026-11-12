// Plays the whole game with the auto-player (?auto=1) in headless Chromium and fails on
// any page error. Needs a production build (npm run build) and the `playwright` package.
// Usage: node tools/playthrough.mjs [chapterId]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff' };
export const serve = () => new Promise((res) => {
  const s = createServer(async (req, rsp) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    try { const b = await readFile(join(dist, p === '/' ? 'index.html' : p)); rsp.writeHead(200, { 'content-type': types[extname(p)] ?? 'text/html' }); rsp.end(b); }
    catch { rsp.writeHead(404); rsp.end(); }
  }).listen(0, () => res({ url: `http://localhost:${s.address().port}/`, close: () => s.close() }));
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const start = process.argv[2] ?? 'prologue';
  const srv = await serve();
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(`${srv.url}?auto=1&q=low&norender=1&chapter=${start}`);
  const t0 = Date.now();
  let status = '', seen = 0;
  while (Date.now() - t0 < 480000) {
    await page.waitForTimeout(400);
    const s = await page.evaluate(() => (window.game ? { status: window.game.status, log: window.game.log } : { status: 'boot', log: [] }));
    if (s.log.length > seen) { for (const id of s.log.slice(seen)) console.log('  played', id); seen = s.log.length; }
    status = s.status;
    if (status === 'done' || (status === 'menu' && seen > 0) || status.startsWith('error') || errors.length) break;
  }
  await browser.close(); srv.close();
  if (errors.length || (status !== 'done' && status !== 'menu')) { console.error(`FAILED at ${status}\n` + errors.join('\n')); process.exit(1); }
  console.log(`ok: ${seen} scenes played through without error`);
}
