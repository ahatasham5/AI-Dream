// "একটা-একটা খোলা" ও পথ-চেনার যুক্তির test। চালানো: node --test atlas/tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const E = require('../src/js/engine.js');
const F = require('../src/js/focus.js');

const map = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'map.json'), 'utf8'));
const fresh = () => { const m = E.fromTree(JSON.parse(JSON.stringify(map))); return { ...m, plan: E.create(m.records, m.byId) }; };
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// ছোট হাতে-বানানো গাছ: root → A(a1, a2), B(b1(b1x)), L
const small = () => E.fromTree({ id: 'root', name: 'root', children: [
  { id: 'A', name: 'A', children: [{ id: 'a1', name: 'a1' }, { id: 'a2', name: 'a2' }] },
  { id: 'B', name: 'B', children: [{ id: 'b1', name: 'b1', children: [{ id: 'b1x', name: 'b1x' }] }, { id: 'b2', name: 'b2' }] },
  { id: 'L', name: 'L' },
] });

test('siblingsToClose: শুধু খোলা শাখা-ভাই; নিজে, পাতা আর বন্ধ ভাই নয়', () => {
  const m = small(), A = m.byId.get('A'), B = m.byId.get('B'), L = m.byId.get('L');
  const open = new Set(['A', 'L']);   // L পাতা: খোলা বলে ধরলেও শাখা নয়
  const isOpen = (r) => open.has(r.node.id);
  assert.deepEqual(F.siblingsToClose(B, isOpen).map((r) => r.node.id), ['A']);
  assert.deepEqual(F.siblingsToClose(A, isOpen).map((r) => r.node.id), []);
  assert.deepEqual(F.siblingsToClose(m.byId.get('root'), isOpen), []);
  assert.deepEqual(F.siblingsToClose(L, isOpen).map((r) => r.node.id), ['A']);
});

test('planReveal: পথের প্রতিটা স্তরের ভাই গোটে, পথ খোলে, কিছু দুবার নয়', () => {
  const m = small();
  const open = new Set(['root', 'A', 'B', 'b1']);
  const p = F.planReveal(m.byId.get('b1x'), (r) => open.has(r.node.id));
  assert.deepEqual(p.open.map((r) => r.node.id), ['root', 'B', 'b1']);
  assert.deepEqual(p.close.map((r) => r.node.id), ['A']);                 // B-র ভাই A খোলা ছিল
  const q = F.planReveal(m.byId.get('a2'), (r) => open.has(r.node.id));
  assert.deepEqual(q.close.map((r) => r.node.id), ['B']);
  assert.equal(new Set(q.close).size, q.close.length);
});

test('একটা-একটা খোলা: এলোমেলো ৫০০০ খোলায় পথের কোনো স্তরে দুটো ভাই একসাথে খোলা থাকে না', () => {
  for (const seed of [1, 2, 3]) {
    const m = fresh(), rand = rng(seed), open = new Set(m.records.filter((r) => r.depth === 0).map((r) => r.node.id));
    const branches = m.records.filter((r) => r.children.length);
    const isOpen = (r) => open.has(r.node.id);
    for (let i = 0; i < 5000; i++) {
      const r = branches[Math.floor(rand() * branches.length)];
      if (rand() < 0.2 && open.has(r.node.id)) { open.delete(r.node.id); continue; }   // হাতে গোটানো
      const p = F.planReveal(r, isOpen);                                                   // r-এ পৌঁছাতে
      for (const s of p.close) open.delete(s.node.id);
      for (const a of p.open) open.add(a.node.id);
      open.add(r.node.id);
      // r আর তার সব পূর্বপুরুষের ভাইদের মধ্যে কেউ খোলা নেই
      for (let x = r; x; x = x.parent) for (const s of F.siblingsToClose(x, isOpen)) assert.fail(`seed ${seed}: ${x.node.id}-এর ভাই ${s.node.id} খোলা`);
    }
  }
});

test('crumbs: মূল বাদ, গঠন-নাম বাদ, শেষে নিজে; ক্রম মূল থেকে নিচে', () => {
  const m = fresh();
  for (const r of m.records) {
    const cs = F.crumbs(r);
    if (r.depth === 0) { assert.deepEqual(cs, []); continue; }
    assert.equal(cs[cs.length - 1].id, r.node.id);
    for (const c of cs.slice(0, -1)) assert.ok(!F.GENERIC.has(c.rec.node.name), 'গঠন-নাম থেকে গেছে: ' + c.id);
    const depths = cs.map((c) => c.rec.depth);
    assert.deepEqual(depths, [...depths].sort((a, b) => a - b));
    for (const c of cs) assert.ok(c.name.length > 0 && !/^[০-৯0-9]+\.\s/.test(c.name), 'ক্রমিক নম্বর থেকে গেছে: ' + c.name);
  }
});

test('pickedCounts = pickedUnder: এলোমেলো বাছাইয়ে প্রতিটা শাখায় দুই হিসাব এক', () => {
  const m = fresh(), rand = rng(7);
  const sel = m.records.filter((r) => E.SELECTABLE.has(r.node.kind));
  for (let i = 0; i < 400; i++) m.plan.toggle(sel[Math.floor(rand() * sel.length)].node.id);
  assert.ok(m.plan.size() > 0);
  const counts = F.pickedCounts(m.records, m.byId, m.plan.choiceIds());
  for (const r of m.records) assert.equal(counts.get(r.node.id) || 0, F.pickedUnder(r, m.plan.choiceIds()), r.node.id);
  for (const id of counts.keys()) assert.ok(m.byId.get(id).children.length > 0, 'পাতায় সংখ্যা: ' + id);
});

test('গোটানো শাখার সংখ্যা: একটা checkpoint বাছলে ১ (ওপরের model-ধরন বাছা হলেও আলাদা নয়)', () => {
  const m = fresh();
  m.plan.toggle('tool-qwen25-vl');
  const counts = F.pickedCounts(m.records, m.byId, m.plan.choiceIds());
  assert.equal(counts.get('base-kind'), 1, 'কোন ধরনের model? decision');
  assert.equal(counts.get('ft-input'), 1);
  assert.equal(counts.get('opt-base-vlm'), 1, 'ধরনের নিজের ভেতরে checkpoint ১টা');
  m.plan.toggle('tool-vllm');                                   // আরেকটা, আলাদা শাখায়
  const c2 = F.pickedCounts(m.records, m.byId, m.plan.choiceIds());
  assert.equal(c2.get('ft-input'), 1, 'vllm অন্য ধাপের');
});
