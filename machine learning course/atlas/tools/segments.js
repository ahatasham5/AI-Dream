#!/usr/bin/env node
// পাতার data থেকে পড়ার সব অংশ বের করে (key, label, মূল লেখা, বলার লেখা)। পাতা আর audio-pack একই যুক্তি (src/js/reader.js)
// থেকে একই key পায়, তাই এখানে কোনো নকল যুক্তি নেই। ব্যবহার: node atlas/tools/segments.js atlas/dist/index.html
const fs = require('fs');
const path = require('path');
const R = require('../src/js/reader.js');

const file = process.argv[2];
if (!file) { console.error('ব্যবহার: node atlas/tools/segments.js <build-করা html>'); process.exit(2); }
const html = fs.readFileSync(path.resolve(file), 'utf8');
const m = html.match(/<script id="map-data" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) { console.error('এই html-এ map-data নেই: ' + file); process.exit(2); }
const root = JSON.parse(m[1]);

const seen = new Map();
(function walk(n) {
  for (const s of R.segments(n, true)) if (!seen.has(s.key)) seen.set(s.key, { key: s.key, label: s.label, text: s.text, speech: s.speech });
  for (const c of n.children || []) walk(c);
})(root);
process.stdout.write(JSON.stringify([...seen.values()]));
