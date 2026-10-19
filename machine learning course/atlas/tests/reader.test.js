// পড়ে-শোনানোর যুক্তির test। চালানো: node --test atlas/tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../src/js/reader.js');

test('key: Python-এ আলাদাভাবে হিসাব-করা মানের সাথে হুবহু মেলে (audio-pack আর পাতা একই নাম পায়)', () => {
  assert.equal(R.key('abc'), '1a47e90bacf442a4');
  assert.equal(R.key('টেস্ট'), '2078052f40631e94');
  assert.equal(R.key('Softmax — probability বের করে।'), '25ec9d1cd3dc0991');
  assert.equal(R.key(''), '811c9dc59747b28c');
});

test('key: ১৬ hex অক্ষর; একটা অক্ষর বদলালে বদলায়', () => {
  assert.match(R.key('x'), /^[0-9a-f]{16}$/);
  assert.notEqual(R.key('একটা লেখা'), R.key('একটা লেখা।'));
});

test('clean: চিহ্ন বাংলায় বলার শব্দ হয়, ফাঁকা ঠিক থাকে, key-র লেখা বদলায় না', () => {
  assert.equal(R.clean('৩ × ৪ = ১২'), '৩ গুণ ৪ সমান ১২');
  assert.equal(R.clean('A → B'), 'A, B');
  assert.equal(R.clean('  `code`   লেখা  '), 'code লেখা');
  assert.equal(R.clean(null), '');
});

test('segments: সংজ্ঞা, গল্প (সমস্যা, ধারণা), ভাবনা; খালি অংশ বাদ; withStory=false হলে শুধু সংজ্ঞা', () => {
  const n = { definition: 'সংজ্ঞা লেখা।', story: { problem: 'সমস্যা।', idea: 'ধারণা।', next: [{ to: 'x' }] }, insight: { fact: 'ভাবনা।' } };
  assert.deepEqual(R.segments(n).map((s) => s.id), ['def', 'problem', 'idea', 'fact']);
  assert.deepEqual(R.segments(n, false).map((s) => s.id), ['def']);
  assert.deepEqual(R.segments({ definition: ' ' }).length, 0);
  const s0 = R.segments(n)[0];
  assert.equal(s0.key, R.key('সংজ্ঞা লেখা।'));     // key হুবহু লেখার, speech পরিষ্কার-করা
});

test('segments: key পরিষ্কার-করা লেখার নয়, মূল লেখার (চিহ্ন বদলানোর নিয়ম বদলালে পুরোনো audio অকেজো হয় না)', () => {
  const s = R.segments({ definition: '৩ × ৪ = ১২ হয়।' })[0];
  assert.equal(s.key, R.key('৩ × ৪ = ১২ হয়।'));
  assert.equal(s.speech, '৩ গুণ ৪ সমান ১২ হয়।');
});

test('bengaliVoice: bn-BD আগে, তারপর bn-IN, তারপর অন্য bn; বাংলা না থাকলে null', () => {
  const v = (lang, name) => ({ lang, name });
  assert.equal(R.bengaliVoice([v('en-US', 'a'), v('bn-IN', 'in'), v('bn-BD', 'bd')]).name, 'bd');
  assert.equal(R.bengaliVoice([v('bn-IN', 'in'), v('bn', 'plain')]).name, 'in');
  assert.equal(R.bengaliVoice([v('bn', 'plain')]).name, 'plain');
  assert.equal(R.bengaliVoice([v('en-US', 'a'), v('hi-IN', 'h')]), null);
  assert.equal(R.bengaliVoice([]), null);
  assert.equal(R.bengaliVoice(undefined), null);
  assert.equal(R.bengaliVoice([v('bn_BD', 'underscore')]).name, 'underscore');
});

test('chunks: বাক্যের সীমানায় ভাঙে, সীমা মানে, কিছু হারায় না', () => {
  const text = 'প্রথম বাক্য এখানে। দ্বিতীয় বাক্য আরেকটু লম্বা এখানে। তৃতীয় বাক্য। চতুর্থ বাক্য শেষে।';
  const c = R.chunks(text, 40);
  assert.ok(c.length > 1);
  assert.ok(c.every((x) => x.length <= 40), JSON.stringify(c));
  assert.equal(c.join(' ').replace(/\s+/g, ' '), text);
  assert.deepEqual(R.chunks('ছোট।', 40), ['ছোট।']);
  assert.deepEqual(R.chunks('', 40), []);
});

test('chunks: একটাই অতি-লম্বা বাক্য শব্দের সীমানায় কাটে, শব্দ ভাঙে না', () => {
  const long = Array.from({ length: 30 }, (_, i) => 'শব্দ' + i).join(' ');
  const c = R.chunks(long, 50);
  assert.ok(c.length > 1 && c.every((x) => x.length <= 50));
  assert.equal(c.join(' '), long);
});
