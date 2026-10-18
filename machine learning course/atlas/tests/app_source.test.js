// app.js-এ engine-এর function সরাসরি (plan. ছাড়া) ডাকা হয়নি তো? এমন ভুলে build ও unit test পাস করে, শুধু browser-এ বোতাম ভাঙে
// (ঘটেছিল: পথ-তালিকার ✕ বোতামে `removeWithDesc is not defined`)। চালানো: node --test atlas/tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const E = require('../src/js/engine.js');

const app = fs.readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8');
const plan = E.create(...Object.values(E.fromTree({ id: 'r', name: 'r', children: [] })));

test('app.js engine-এর function সরাসরি ডাকে না, হয় plan.f(), নয়তো destructure করা বা নিজে ঘোষিত', () => {
  const destructured = (app.match(/const \{([^}]+)\}\s*=\s*plan\s*;/g) || []).join(' ');
  const own = (n) => new RegExp(`(function\\s+${n}\\b|(?:const|let|var)\\s+${n}\\b)`).test(app) || new RegExp(`\\b${n}\\b`).test(destructured);
  const bad = [];
  for (const key of Object.keys(plan)) {
    if (typeof plan[key] !== 'function' || own(key)) continue;
    const re = new RegExp(`(?<![.\\w$])${key}\\(`, 'g');
    for (const line of app.split('\n')) if (re.test(line)) bad.push(`${key}( : ${line.trim().slice(0, 90)}`);
  }
  assert.deepEqual(bad, [], 'engine-এর function সরাসরি ডাকা হয়েছে:\n' + bad.join('\n'));
});

test('পাহারাটা কাজ করে: পুরোনো ভুল ফিরিয়ে আনলে ধরে', () => {
  const broken = app.replace('plan.removeWithDesc(n.id)', 'removeWithDesc(n.id)');
  assert.notEqual(broken, app, 'পরীক্ষার জন্য বদলানোর জায়গা পাওয়া যায়নি');
  const destructured = (broken.match(/const \{([^}]+)\}\s*=\s*plan\s*;/g) || []).join(' ');
  const own = (n) => new RegExp(`(function\\s+${n}\\b|(?:const|let|var)\\s+${n}\\b)`).test(broken) || new RegExp(`\\b${n}\\b`).test(destructured);
  assert.ok(!own('removeWithDesc') && /(?<![.\w$])removeWithDesc\(/.test(broken));
});
