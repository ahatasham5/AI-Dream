// তুলনা-যুক্তির test। চালানো: node --test atlas/tests/compare.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const E = require('../src/js/engine.js');
const C = require('../src/js/compare.js');

const recsOf = (tree) => E.fromTree(JSON.parse(JSON.stringify(tree)));
const mk = (id, extra = {}, children) => Object.assign({ id, name: id, definition: 'সংজ্ঞা ' + id }, extra, children ? { children } : {});
const byName = (m, id) => m.byId.get(id);

test('যোগ্য ভাই: step, stepref আর seq-ওয়ালা বাদ', () => {
  const m = recsOf(mk('p', {}, [mk('a'), mk('b'), mk('c', { seq: '৩' }), mk('d', { kind: 'step' }), mk('e', { kind: 'stepref', goto: 'x' }), mk('f', { kind: 'option' })]));
  const peers = C.groupOf(byName(m, 'p')).map((r) => r.node.id);
  assert.deepEqual(peers, ['a', 'b', 'f']);
  assert.deepEqual(C.peersOf(byName(m, 'a')).map((r) => r.node.id), ['a', 'b', 'f']);
  assert.deepEqual(C.peersOf(byName(m, 'c')), [], 'seq-ওয়ালা নিজে তুলনা পায় না');
  assert.deepEqual(C.peersOf(byName(m, 'd')), []);
});

test('একটার বেশি যোগ্য ভাই না থাকলে তুলনা নেই; root-এর ভাই নেই', () => {
  const m = recsOf(mk('p', {}, [mk('a'), mk('b', { seq: '২' })]));
  assert.deepEqual(C.groupOf(byName(m, 'p')), []);
  assert.deepEqual(C.peersOf(byName(m, 'p')), [], 'root-এর parent নেই');
  assert.deepEqual(C.groupOf(null), []);
});

test('শুরুর বাছাই: max বা কম হলে সবাই; বেশি হলে বর্তমান থেকে ততটা, গাছের ক্রমে', () => {
  assert.equal(C.DEFAULT_MAX, 4);
  assert.equal(C.ABS_MAX, 8);
  const kids = 'abcdefg'.split('').map((x) => mk(x));
  const list = C.groupOf(byName(recsOf(mk('p', {}, kids)), 'p'));
  assert.deepEqual(C.initialPick(list, 'zzz').map((r) => r.node.id), ['a', 'b', 'c', 'd']);
  assert.deepEqual(C.initialPick(list, 'e').map((r) => r.node.id), ['a', 'e', 'f', 'g'], 'e থেকে ঘুরে a; তবু গাছের ক্রমে');
  assert.deepEqual(C.initialPick(list, 'zzz', 6).map((r) => r.node.id), 'abcdef'.split(''), 'ব্যবহারকারীর max মানা হয়');
  assert.equal(C.initialPick(list, 'a', 7).length, 7);
  const small = C.groupOf(byName(recsOf(mk('p', {}, [mk('a'), mk('b'), mk('c')])), 'p'));
  assert.equal(C.initialPick(small, 'a').length, 3);
});

test('toggle: ভরলে সবচেয়ে আগে বাছাটা সরে; বাছা id চাপলে বাদ; ২-এর নিচে নামে না', () => {
  let o = ['a', 'b', 'c', 'd'];
  let r = C.toggle(o, 'e', 4);
  assert.deepEqual(r.order, ['b', 'c', 'd', 'e']);
  assert.equal(r.dropped, 'a', 'সবচেয়ে পুরোনোটা');
  assert.equal(r.blocked, null);
  assert.deepEqual(o, ['a', 'b', 'c', 'd'], 'আগের তালিকা বদলায় না (pure)');
  r = C.toggle(['a', 'b'], 'c', 4);
  assert.deepEqual(r.order, ['a', 'b', 'c']);
  assert.equal(r.dropped, null, 'জায়গা থাকলে কিছু সরে না');
  r = C.toggle(['a', 'b', 'c'], 'b', 4);
  assert.deepEqual(r.order, ['a', 'c']);
  r = C.toggle(['a', 'b'], 'a', 4);
  assert.equal(r.blocked, 'min');
  assert.deepEqual(r.order, ['a', 'b']);
  r = C.toggle(['a', 'b', 'c'], 'd', 3);
  assert.deepEqual(r.order, ['b', 'c', 'd'], 'max ৩ হলে ৩-ই থাকে');
  assert.equal(r.dropped, 'a');
  // টানা বাছলে পুরোনো থেকেই সরে (FIFO)
  let cur = ['a', 'b', 'c', 'd'];
  const dropped = [];
  for (const id of ['e', 'f', 'g']) { const x = C.toggle(cur, id, 4); cur = x.order; dropped.push(x.dropped); }
  assert.deepEqual(dropped, ['a', 'b', 'c']);
  assert.deepEqual(cur, ['d', 'e', 'f', 'g']);
});

test('clampOrder: max কমালে সবচেয়ে নতুন max টা থাকে', () => {
  assert.deepEqual(C.clampOrder(['a', 'b', 'c', 'd'], 2), ['c', 'd']);
  assert.deepEqual(C.clampOrder(['a', 'b'], 4), ['a', 'b']);
  assert.notEqual(C.clampOrder(['a', 'b'], 4), undefined);
});

test('বৈধ নির্বাচন: ২..ABS_MAX, একই parent, অনন্য, যোগ্য', () => {
  const m = recsOf(mk('r', {}, [mk('p', {}, 'abcde'.split('').map((x) => mk(x))), mk('q', {}, [mk('x'), mk('y')]), mk('s', {}, [mk('s1'), mk('s2', { kind: 'step' })])]));
  const g = (ids) => ids.map((i) => byName(m, i));
  assert.ok(C.validSelection(g(['a', 'b'])));
  assert.ok(C.validSelection(g(['a', 'b', 'c', 'd'])));
  assert.ok(!C.validSelection(g(['a'])), 'একটা নয়');
  assert.ok(C.validSelection(g(['a', 'b', 'c', 'd', 'e'])), 'ব্যবহারকারী max বাড়ালে পাঁচটাও বৈধ');
  assert.ok(!C.validSelection(g(['a', 'x'])), 'ভিন্ন parent নয়');
  assert.ok(!C.validSelection([byName(m, 'a'), byName(m, 'a')]), 'দুবার একই নয়');
  assert.ok(!C.validSelection(g(['s1', 's2'])), 'step যোগ্য নয়');
  assert.ok(!C.validSelection(null));
});

test('সারি: সবার জন্য ফাঁকা সারি বাদ; same আর ফারাক ঠিক; ফাঁকা কলাম = ফারাক', () => {
  const m = recsOf(mk('p', {}, [
    mk('a', { when: 'W', why: 'একই', tradeoff: 'T1', mathDetail: { formula: 'f(x)=x', meaning: 'm', example: 'e' }, basis: 'paper' }),
    mk('b', { when: 'W', why: 'একই', tradeoff: 'T2' }),
  ]));
  const rows = C.rows(C.groupOf(byName(m, 'p')));
  const by = Object.fromEntries(rows.map((r) => [r.key, r]));
  assert.ok(by.def && by.when && by.why && by.cost);
  assert.ok(!by.basis, '"তথ্যের ভিত্তি" সারি নেই');
  assert.equal(by.when.same, true, 'দুজনেই "W"');
  assert.equal(by.why.same, true);
  assert.equal(by.cost.same, false, 'T1 ≠ T2');
  assert.equal(by.def.same, false, 'সংজ্ঞা আলাদা');
  assert.equal(by.formula.same, false, 'একজনের নেই = ফারাক');
  assert.deepEqual(by.formula.cells, ['f(x)=x', null]);
  assert.equal(by.formula.type, 'code');
  assert.ok(!by.licence && !by.repo && !by.scn, 'কারও না থাকলে সারিই নেই');
});

test('সারি: tool-এর তথ্য, ভেতরের গঠন (৮টার বেশি ছাঁটা), selection থেকে fallback', () => {
  const kids = Array.from({ length: 10 }, (_, i) => mk('k' + i));
  const m = recsOf(mk('p', {}, [
    mk('a', { kind: 'tool', tool: { repo: 'https://github.com/x/a', license: 'MIT', archived: false, pushed: '2026-01-01', supports: ['A', 'B'] } }),
    mk('b', { kind: 'tool', tool: { repo: 'https://github.com/x/b', license: 'Apache-2.0', archived: true } }),
    mk('c', { selection: { when: 'বাছার সময়', avoid: 'এড়ানোর সময়', problem: 'সমস্যা' } }, kids),
  ]));
  const by = Object.fromEntries(C.rows(C.groupOf(byName(m, 'p'))).map((r) => [r.key, r]));
  assert.match(by.state.cells[0], /সক্রিয়.*2026-01-01/);
  assert.match(by.state.cells[1], /archived/);
  assert.equal(by.state.cells[2], null);
  assert.deepEqual(by.supports.cells[0], ['A', 'B']);
  assert.equal(by.kids.cells[2].length, 9, '৮টা + "আরও"');
  assert.match(by.kids.cells[2][8], /আরও 2টা/);
  assert.equal(by.when.cells[2], 'বাছার সময়', 'selection.when থেকে');
  assert.equal(by.cost.cells[2], 'এড়ানোর সময়', 'selection.avoid থেকে');
  assert.equal(by.problem.cells[2], 'সমস্যা');
});

// build-করা আসল data-র ওপর: কোনো parent-এর তুলনা ভাঙে না, নিয়ম মানা হয়
const dist = path.join(__dirname, '..', 'dist', 'index.html');
test('আসল data: প্রতিটা তুলনাযোগ্য parent-এ সারি বানানো যায়', { skip: !fs.existsSync(dist) }, () => {
  const html = fs.readFileSync(dist, 'utf8');
  const raw = html.match(/<script id="map-data" type="application\/json">([\s\S]*?)<\/script>/)[1].replace(/<\\\//g, '</');
  const m = E.fromTree(JSON.parse(raw));
  let parents = 0;
  for (const r of m.records) {
    const g = C.groupOf(r);
    if (!g.length) continue;
    parents++;
    for (const p of g) {
      assert.ok(p.node.kind !== 'step' && p.node.kind !== 'stepref' && p.node.peer !== false, `অযোগ্য peer: ${p.node.id}`);
      assert.ok(!p.node.seq || r.node.compare === 'alternatives', `seq-ওয়ালা peer অথচ parent বিকল্প-তালিকা বলেনি: ${p.node.id}`);
    }
    const pick = C.initialPick(g, g[0].node.id);
    assert.equal(pick.length, Math.min(g.length, C.DEFAULT_MAX), `শুরুর সংখ্যা ভুল: ${r.node.id}`);
    assert.ok(C.validSelection(pick), `অবৈধ শুরুর বাছাই: ${r.node.id}`);
    const rows = C.rows(pick);
    assert.ok(rows.length >= 1 && rows[0].key === 'def', `সংজ্ঞার সারি নেই: ${r.node.id}`);
    for (const row of rows) assert.equal(row.cells.length, pick.length);
  }
  assert.ok(parents > 150, `তুলনাযোগ্য parent খুব কম: ${parents}`);
});

test('টীকা: "course" কখনো না; আসল সূত্র/সতর্কতা থাকলেই', () => {
  const m = recsOf(mk('p', {}, [mk('a', { basis: 'course' }), mk('b', { basis: 'paper' }), mk('c', { basis: 'experience' }), mk('d', { basis: 'tool-doc' }), mk('e')]));
  const n = C.notes(C.groupOf(byName(m, 'p')));
  assert.deepEqual(n.map((x) => x.id), ['b', 'c', 'd']);
  assert.equal(n[0].text, C.BASIS.paper);
  assert.ok(!n.some((x) => /কোর্সে আছে/.test(x.text)));
  assert.deepEqual(C.notes([byName(m, 'a'), byName(m, 'e')]), []);
});

// ---------- নম্বর-ওয়ালা বিকল্প: data বলে দেয় (compare / peer) ----------
test('compare:"alternatives" parent-এ নম্বর-ওয়ালা সন্তানও peer; peer:false বাদ; পতাকা ছাড়া আগের মতোই', () => {
  const m = recsOf(mk('p', { compare: 'alternatives' }, [mk('a', { seq: '১', peer: false }), mk('b', { seq: '২' }), mk('c', { seq: '৩' }), mk('d', { seq: '৪', kind: 'step' })]));
  const p = byName(m, 'p');
  assert.deepEqual(C.groupOf(p).map((r) => r.node.id), ['b', 'c'], 'peer:false ও step বাদ, বাকি নম্বর-ওয়ালারা peer');
  assert.deepEqual(C.peersOf(byName(m, 'a')), [], 'peer:false নিজে তুলনা পায় না');
  const plain = recsOf(mk('p', {}, [mk('a', { seq: '১' }), mk('b', { seq: '২' }), mk('c', { seq: '৩' })]));
  assert.deepEqual(C.groupOf(byName(plain, 'p')), [], 'পতাকা ছাড়া নম্বর-ওয়ালারা ক্রমিক, peer নয় (আগের নিয়ম)');
  const off = recsOf(mk('p', {}, [mk('a', { peer: false }), mk('b'), mk('c')]));
  assert.deepEqual(C.groupOf(byName(off, 'p')).map((r) => r.node.id), ['b', 'c'], 'seq ছাড়াও peer:false বাদ দেয়');
});

test('আসল data: বিকল্প-তালিকায় (Task, Architecture, Training…) তুলনা আছে; ক্রমিক অংশে (Model শেখা, Input, Output) নেই', () => {
  const map = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'map.json'), 'utf8'));
  const m = E.fromTree(JSON.parse(JSON.stringify(map)));
  const size = (id) => C.groupOf(m.byId.get(id)).length;
  assert.equal(size('task'), 5); assert.equal(size('setting'), 5); assert.equal(size('neural-network--architecture'), 7);
  assert.equal(size('training'), 3); assert.equal(size('transformer-efficiency'), 6);
  assert.equal(size('supervised-learning'), 3, 'Input, Target, Model শেখা বাদ; তিন ধরনের target বাকি');
  assert.equal(size('state-space-models'), 5, 'SSM: ভিত্তি ও HiPPO বাদ; S4, Mamba, Mamba-2, Vision Mamba, Hybrid বাকি');
  for (const id of ['ft-cycle', 'ft-input', 'ft-output', 'from-scratch-training', 'fine-tuning', 'evaluation', 'reinforcement-learning-rl', 'mode-finetune'])
    assert.equal(size(id), 0, id + ': ক্রমিক বা ধারণা-তালিকা, তুলনা থাকার কথা না');
  for (const r of m.records) if (r.node.compare) assert.ok(C.groupOf(r).length >= 2, r.node.id + ': compare পতাকা অথচ তুলনা নেই');
});
