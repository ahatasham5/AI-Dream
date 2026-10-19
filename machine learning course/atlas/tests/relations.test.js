// সম্পর্ক-যুক্তির test। চালানো: node --test atlas/tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const R = require('../src/js/relations.js');

const E = (from, to, type = 'needs') => ({ from, to, type, why: 'কারণ' });

test('path: পূর্বশর্ত আগে, পূর্বশর্তের পূর্বশর্তসহ, নিজে বাদ', () => {
  const r = R.create([E('c', 'b'), E('b', 'a')]);
  assert.deepEqual(r.path('c'), ['a', 'b']);
  assert.deepEqual(r.path('a'), []);
});

test('path: হীরা-আকার (দুই পথে একই পূর্বশর্ত) একবারই আসে, আর প্রতিটা পূর্বশর্তের আগে তার নিজের পূর্বশর্ত', () => {
  const r = R.create([E('d', 'b'), E('d', 'c'), E('b', 'a'), E('c', 'a')]);
  const p = r.path('d');
  assert.deepEqual([...p].sort(), ['a', 'b', 'c']);
  assert.equal(new Set(p).size, p.length);
  for (const x of ['b', 'c']) assert.ok(p.indexOf('a') < p.indexOf(x));
});

test('path: edges-এর লেখার ক্রম মানে (নির্ধারিত)', () => {
  const r = R.create([E('z', 'x'), E('z', 'y')]);
  assert.deepEqual(r.path('z'), ['x', 'y']);
  const r2 = R.create([E('z', 'y'), E('z', 'x')]);
  assert.deepEqual(r2.path('z'), ['y', 'x']);
});

test('usedBy ও needs উল্টো-সোজা মেলে', () => {
  const r = R.create([E('b', 'a'), E('c', 'a')]);
  assert.deepEqual(r.usedBy('a').map((x) => x.id), ['b', 'c']);
  assert.deepEqual(r.needs('b').map((x) => x.id), ['a']);
});

test('contrasts দুদিকেই কাজ করে, আর needs-এ মেশে না', () => {
  const r = R.create([E('a', 'b', 'contrasts'), E('c', 'a')]);
  assert.deepEqual(r.contrasts('a').map((x) => x.id), ['b']);
  assert.deepEqual(r.contrasts('b').map((x) => x.id), ['a']);
  assert.deepEqual(r.path('a'), []);
});

test('cycle: চক্র ধরে, নেই হলে null; চক্র থাকলেও path অসীম ঘোরে না', () => {
  assert.equal(R.create([E('a', 'b'), E('b', 'c')]).cycle(), null);
  const bad = R.create([E('a', 'b'), E('b', 'c'), E('c', 'a')]);
  const c = bad.cycle();
  assert.ok(c && c[0] === c[c.length - 1] && c.length === 4, JSON.stringify(c));
  assert.ok(bad.path('a').length <= 2);
});

test('অজানা id-তে ফাঁকা ফল, ভাঙে না', () => {
  const r = R.create([]);
  assert.deepEqual(r.path('x'), []); assert.deepEqual(r.needs('x'), []); assert.equal(r.hasAny('x'), false);
  assert.equal(R.create(undefined).cycle(), null);
});

// আসল data: এই test-ই সম্পর্কের data ভুল হলে ধরে
const dataFile = path.join(__dirname, '..', 'data', 'relations.json');
test('আসল data: চক্র নেই, আর প্রতিটা পথের প্রতিটা ধাপের আগে তার সব সরাসরি পূর্বশর্ত আসে', { skip: !fs.existsSync(dataFile) }, () => {
  const edges = JSON.parse(fs.readFileSync(dataFile, 'utf8')).edges;
  const r = R.create(edges);
  assert.equal(r.cycle(), null);
  const ids = new Set(edges.flatMap((e) => [e.from, e.to]));
  for (const id of ids) {
    const order = r.path(id).concat(id);
    assert.equal(new Set(order).size, order.length, id + ': একই node দুবার');
    order.forEach((x, i) => { for (const n of r.needs(x)) assert.ok(order.indexOf(n.id) >= 0 && order.indexOf(n.id) < i, `${id}: ${x}-এর আগে ${n.id} নেই`); });
  }
});
