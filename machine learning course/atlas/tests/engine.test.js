// বাছাই-engine-এর test। চালানো: node --test atlas/tests/
// কোনো library লাগে না (Node ≥ 20-এর built-in test runner)।
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const E = require('../src/js/engine.js');

const map = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'map.json'), 'utf8'));
const fresh = () => { const m = E.fromTree(JSON.parse(JSON.stringify(map))); return { ...m, plan: E.create(m.records, m.byId) }; };

// ছোট, নির্ধারিত random (seed দিলে একই ক্রম)
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

function checkInvariants(m, tag) {
  const { plan, byId, records } = m;
  const sel = plan.set;
  for (const id of sel) {
    const r = byId.get(id);
    assert.ok(r, `${tag}: অজানা id বাছা: ${id}`);
    assert.ok(E.SELECTABLE.has(r.node.kind), `${tag}: বাছার অযোগ্য kind বাছা: ${id} (${r.node.kind})`);
    for (const a of plan.ancestors(r)) assert.ok(sel.has(a.node.id), `${tag}: পূর্বপুরুষ বাদ: ${id} → ${a.node.id}`);   // বন্ধ-ওপরমুখী
  }
  for (const r of records) {
    if (r.node.kind === 'decision' && r.node.pick === 'one') {
      const n = r.children.filter((c) => sel.has(c.node.id)).length;
      assert.ok(n <= 1, `${tag}: pick:one ভাঙা — ${r.node.id} এ ${n}টা বাছা`);
    }
  }
}

test('এলোমেলো ৩০,০০০ ক্লিকেও নিয়ম ভাঙে না (৫টা seed)', () => {
  for (const seed of [1, 7, 42, 2026, 99991]) {
    const m = fresh(), rnd = rng(seed);
    const pool = m.records.filter((r) => E.SELECTABLE.has(r.node.kind)).map((r) => r.node.id);
    assert.ok(pool.length > 100);
    for (let i = 0; i < 6000; i++) {
      m.plan.toggle(pool[Math.floor(rnd() * pool.length)]);
      if (i % 50 === 0) checkInvariants(m, `seed ${seed} ধাপ ${i}`);
      if (rnd() < 0.002) m.plan.clear();
    }
    checkInvariants(m, `seed ${seed} শেষ`);
  }
});

test('বাছলে চালু, আবার চাপলে বন্ধ — সাথে নিচের বাছাইও যায়', () => {
  const m = fresh();
  assert.equal(m.plan.toggle('opt-lora-all-linear').on, true);
  assert.ok(m.plan.has('lora-low-rank-update') && m.plan.has('parameter-efficient-fine-tuning-peft'), 'পূর্বপুরুষ নিজে বাছা হয়নি');
  m.plan.toggle('lora-low-rank-update');      // LoRA বাদ → তার config-ও যাবে
  assert.ok(!m.plan.has('opt-lora-all-linear'));
  assert.ok(m.plan.has('parameter-efficient-fine-tuning-peft'));
});

test('এক সিদ্ধান্তে একটাই: Full → LoRA → DoRA', () => {
  const m = fresh();
  m.plan.toggle('full-fine-tuning'); m.plan.toggle('lora-low-rank-update');
  assert.ok(!m.plan.has('full-fine-tuning'));
  m.plan.toggle('opt-lora-small'); m.plan.toggle('dora');
  assert.ok(!m.plan.has('lora-low-rank-update') && !m.plan.has('opt-lora-small'), 'LoRA ও তার config থেকে গেছে');
  assert.ok(m.plan.has('dora'));
  checkInvariants(m, 'DoRA');
});

test('many-সিদ্ধান্তে একাধিক থাকে (মাপকাঠি)', () => {
  const m = fresh();
  for (const id of ['opt-accuracy', 'opt-f1', 'opt-cer-wer']) m.plan.toggle(id);
  assert.equal(['opt-accuracy', 'opt-f1', 'opt-cer-wer'].filter((i) => m.plan.has(i)).length, 3);
});

test('দুই মোড একসঙ্গে থাকে না, বদলালে অন্য বাছাই অক্ষত', () => {
  const m = fresh();
  m.plan.toggle('opt-accuracy'); m.plan.toggle('mode-finetune');
  assert.equal(m.plan.activeMode().node.id, 'mode-finetune');
  m.plan.toggle('mode-scratch');
  assert.equal(m.plan.activeMode().node.id, 'mode-scratch');
  assert.ok(!m.plan.has('mode-finetune') && m.plan.has('opt-accuracy'));
});

test('setFrom — id-তালিকা থেকে একই বাছাই ফেরে (round trip), ভুল id বাদ', () => {
  const m = fresh(), rnd = rng(5);
  const pool = m.records.filter((r) => E.SELECTABLE.has(r.node.kind)).map((r) => r.node.id);
  for (let i = 0; i < 400; i++) m.plan.toggle(pool[Math.floor(rnd() * pool.length)]);
  const ids = m.plan.ids().sort();
  const m2 = fresh(); m2.plan.setFrom([...ids, 'bogus-id', 'plan-mode', 'ml']);
  assert.deepEqual(m2.plan.ids().sort(), ids);
  checkInvariants(m2, 'setFrom');
});

test('info, decision, step, stepref বাছা যায় না', () => {
  const m = fresh();
  for (const r of m.records) if (!E.SELECTABLE.has(r.node.kind)) assert.equal(m.plan.toggle(r.node.id).ok, false, r.node.id);
  assert.equal(m.plan.size(), 0);
});

test('export: markdown, json, লিংক ঠিক আকারে', () => {
  const m = fresh();
  for (const id of ['mode-scratch', 'opt-sc-ssm', 'tool-mamba', 'tool-vllm', 'tool-tgi']) m.plan.toggle(id);
  const md = m.plan.markdown('2026-01-01');
  assert.match(md, /^# আমার পথ: শূন্য থেকে Train করব/);
  assert.match(md, /## Architecture বাছা/);
  assert.match(md, /⚠ archived/, 'archived tool-এর সতর্কতা নেই');
  const js = JSON.parse(m.plan.json('2026-01-01T00:00:00Z'));
  assert.equal(js.items.length, m.plan.size());
  assert.equal(js.mode, 'mode-scratch');
  assert.ok(js.items.every((i) => i.id && i.name && i.kind));
  assert.equal(m.plan.link('http://x/y.html#abc').startsWith('http://x/y.html#plan='), true);
  assert.deepEqual(m.plan.link('http://x/#a').split('#plan=')[1].split(',').sort(), m.plan.ids().sort());
});

test('pending: সক্রিয় অথচ অবাছা সিদ্ধান্ত ঠিক ধরে', () => {
  const m = fresh();
  assert.equal(m.plan.pending().length, 0, 'কিছু না বাছলে বাকি-তালিকা খালি');
  m.plan.toggle('opt-accuracy');                       // ধাপ ১ সক্রিয়
  const names = m.plan.pending().map((r) => r.node.id);
  assert.ok(names.includes('goal-baseline'));
  assert.ok(!names.includes('goal-metric'), 'বাছা-হওয়া সিদ্ধান্ত বাকি দেখাচ্ছে');
  m.plan.toggle('opt-lora-small');                     // LoRA সক্রিয় → peft-which, lora-config বাছা; বাকি decision-গুলো?
  for (const r of m.plan.pending()) assert.ok(!r.children.some((c) => m.plan.has(c.node.id)));
});

test('গাছের গঠন: প্রতিটা mode-এর steps আসল step, stepStat গোনে', () => {
  const m = fresh();
  for (const mode of ['mode-finetune', 'mode-scratch']) {
    const steps = m.byId.get(mode).node.steps;
    assert.ok(steps.length >= 5);
    for (const sid of steps) assert.equal(m.byId.get(sid).node.kind, 'step', sid);
  }
  m.plan.toggle('mode-finetune'); m.plan.toggle('opt-accuracy'); m.plan.toggle('opt-f1');
  assert.equal(m.plan.stepStat('wf-goal'), 2);
  assert.equal(m.plan.stepStat('ft-output'), 0);
});
