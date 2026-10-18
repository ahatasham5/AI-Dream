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

test('শুরুর বাছাই: ৪ বা কম হলে সবাই; বেশি হলে বর্তমান থেকে ৪টা, গাছের ক্রমে', () => {
  const kids = 'abcdefg'.split('').map((x) => mk(x));
  const m = recsOf(mk('p', {}, kids));
  const list = C.groupOf(byName(m, 'p'));
  assert.equal(C.initialPick(list, 'zzz').length, C.MAX);
  assert.deepEqual(C.initialPick(list, 'zzz').map((r) => r.node.id), ['a', 'b', 'c', 'd']);
  assert.deepEqual(C.initialPick(list, 'e').map((r) => r.node.id), ['a', 'e', 'f', 'g'], 'e থেকে ঘুরে a; তবু গাছের ক্রমে');
  const small = C.groupOf(byName(recsOf(mk('p', {}, [mk('a'), mk('b'), mk('c')])), 'p'));
  assert.equal(C.initialPick(small, 'a').length, 3);
});

test('বৈধ নির্বাচন: ২..৪, একই parent, অনন্য, যোগ্য', () => {
  const m = recsOf(mk('r', {}, [mk('p', {}, 'abcde'.split('').map((x) => mk(x))), mk('q', {}, [mk('x'), mk('y')]), mk('s', {}, [mk('s1'), mk('s2', { kind: 'step' })])]));
  const g = (ids) => ids.map((i) => byName(m, i));
  assert.ok(C.validSelection(g(['a', 'b'])));
  assert.ok(C.validSelection(g(['a', 'b', 'c', 'd'])));
  assert.ok(!C.validSelection(g(['a'])), 'একটা নয়');
  assert.ok(!C.validSelection(g(['a', 'b', 'c', 'd', 'e'])), 'পাঁচটা নয়');
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
  assert.equal(by.when.same, true, 'দুজনেই "W"');
  assert.equal(by.why.same, true);
  assert.equal(by.cost.same, false, 'T1 ≠ T2');
  assert.equal(by.def.same, false, 'সংজ্ঞা আলাদা');
  assert.equal(by.formula.same, false, 'একজনের নেই = ফারাক');
  assert.deepEqual(by.formula.cells, ['f(x)=x', null]);
  assert.equal(by.formula.type, 'code');
  assert.equal(by.basis.cells[0], C.BASIS.paper);
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
    for (const p of g) assert.ok(!p.node.seq && p.node.kind !== 'step' && p.node.kind !== 'stepref', `অযোগ্য peer: ${p.node.id}`);
    const pick = C.initialPick(g, g[0].node.id);
    assert.ok(C.validSelection(pick), `অবৈধ শুরুর বাছাই: ${r.node.id}`);
    const rows = C.rows(pick);
    assert.ok(rows.length >= 1 && rows[0].key === 'def', `সংজ্ঞার সারি নেই: ${r.node.id}`);
    for (const row of rows) assert.equal(row.cells.length, pick.length);
  }
  assert.ok(parents > 150, `তুলনাযোগ্য parent খুব কম: ${parents}`);
});
