#!/usr/bin/env node
/*
 * Cache busting for GearRound. Run after changing any site file:
 *
 *   node tools/stamp.mjs
 *
 * 1. Adds a content hash to the CSS and JS links in index.html
 *    (styles.css?v=1a2b3c4d), so browsers fetch the new file as soon as it changes.
 * 2. Uses the same URLs in the service worker's offline file list.
 * 3. Sets the service worker VERSION from a hash of every cached file, so
 *    installed apps get the "new version is ready" banner. No manual bumping.
 *
 * Safe to run any number of times; it only changes something when a file did.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(root, f));
const hash = (data) => createHash('sha256').update(data).digest('hex').slice(0, 8);

const ASSETS = ['styles.css', 'app.js'];
const stamps = Object.fromEntries(ASSETS.map((f) => [f, hash(read(f))]));
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Matches "styles.css" or "styles.css?v=<anything>" right before a closing quote
const assetRef = (f, prefix = '') => new RegExp('(["\'])' + escape(prefix + f) + '(\\?v=[^"\']*)?\\1', 'g');

function update(file, transform) {
  const before = read(file).toString();
  const after = transform(before);
  if (after !== before) writeFileSync(join(root, file), after);
  return after !== before;
}

// 1. index.html
const htmlChanged = update('index.html', (html) =>
  ASSETS.reduce((s, f) => s.replace(assetRef(f), `$1${f}?v=${stamps[f]}$1`), html)
);

// 2 + 3. sw.js
const swChanged = update('sw.js', (sw) => {
  sw = ASSETS.reduce((s, f) => s.replace(assetRef(f, './'), `$1./${f}?v=${stamps[f]}$1`), sw);
  const list = sw.match(/const SHELL = \[([\s\S]*?)\];/);
  if (!list) throw new Error('Could not find the SHELL list in sw.js');
  const files = [...list[1].matchAll(/'\.\/([^'?]+)(?:\?[^']*)?'/g)].map((m) => m[1]);
  const all = createHash('sha256');
  for (const f of files) all.update(f).update(read(f));
  return sw.replace(/const VERSION = '[^']*';/, `const VERSION = 'gearround-${all.digest('hex').slice(0, 10)}';`);
});

console.log(ASSETS.map((f) => `${f}?v=${stamps[f]}`).join('  '));
console.log(htmlChanged || swChanged ? 'Updated index.html / sw.js.' : 'Already up to date.');
