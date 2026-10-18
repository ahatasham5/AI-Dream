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

// ---------- pseudo-code ----------
const spec = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pseudo.json'), 'utf8'));

/** মোডের সব সিদ্ধান্তে (ভেতরের সিদ্ধান্তসহ) প্রথম বিকল্প বাছে, যতক্ষণ না আর কিছু বাকি থাকে। */
function fillAll(m, modeId) {
  m.plan.toggle(modeId);
  const steps = new Set(m.byId.get(modeId).node.steps);
  for (let round = 0; round < 12; round++) {
    let changed = false;
    for (const r of m.records) {
      if (r.node.kind !== 'decision') continue;
      let inStep = false; for (let x = r.parent; x; x = x.parent) if (steps.has(x.node.id)) inStep = true;
      if (!inStep) continue;
      const anc = []; for (let x = r.parent; x; x = x.parent) if (E.SELECTABLE.has(x.node.kind)) anc.push(x);
      if (!anc.every((a) => m.plan.has(a.node.id))) continue;
      if (!r.children.some((c) => m.plan.has(c.node.id))) { m.plan.toggle(r.children[0].node.id); changed = true; }
    }
    if (!changed) break;
  }
}

test('pseudo: মোড না বাছলে নির্দেশ-লেখা, ছাঁচের চিহ্ন নয়', () => {
  const m = fresh();
  const t = m.plan.pseudo(spec);
  assert.match(t, /পথের ধরন বাছোনি/);
  assert.ok(!t.includes('{{'));
});

test('pseudo: শুধু মোড বাছলে অবাছা সিদ্ধান্ত ‹? …› চিহ্নে, কোনো {{ }} বাকি নেই', () => {
  const m = fresh(); m.plan.toggle('mode-finetune');
  const t = m.plan.pseudo(spec);
  assert.ok(t.includes('‹?'), 'অবাছা চিহ্ন নেই');
  assert.ok(!t.includes('{{') && !t.includes('}}'), 'ছাঁচ-চিহ্ন থেকে গেছে');
  assert.match(t, /^# ===== আমার পথ: Fine-tune/);
});

for (const mode of ['mode-finetune', 'mode-scratch']) {
  test(`pseudo: ${mode} — সব সিদ্ধান্ত বাছলে কোনো অবাছা চিহ্ন বা ছাঁচ-চিহ্ন থাকে না`, () => {
    const m = fresh(); fillAll(m, mode);
    const t = m.plan.pseudo(spec);
    const left = t.split('\n').filter((l) => l.includes('‹?') && !l.startsWith('#'));
    assert.deepEqual(left, [], 'অবাছা থেকে গেছে:\n' + left.join('\n'));
    assert.ok(!t.includes('{{'));
    assert.equal(t, m.plan.pseudo(spec), 'একই বাছাইয়ে ফল আলাদা');
    checkInvariants(m, mode);
  });
}

test('pseudo: বাছার ফল লেখায় বসে (LoRA সূত্র, memory, accumulation শাখা)', () => {
  const m = fresh();
  for (const id of ['mode-finetune', 'lora-low-rank-update', 'opt-grad-accum', 'opt-amp']) m.plan.toggle(id);
  const t = m.plan.pseudo(spec);
  assert.match(t, /\(alpha\/r\) · B · A/);
  assert.match(t, /accumulation_steps = N/);
  assert.match(t, /if micro_step % N == 0/);
  assert.match(t, /mixed_precision_context\(\)/);
  assert.ok(!/^\s*optimizer\.step.*\n.*optimizer\.step/m.test(t), 'step দুবার');
  const m2 = fresh(); m2.plan.toggle('mode-finetune');   // accumulation ছাড়া: সরাসরি step
  assert.match(m2.plan.pseudo(spec), /\n\s+optimizer\.step\(trainable only\)/);
  assert.ok(!m2.plan.pseudo(spec).includes('micro_step %'));
});

test('pseudo: সংকেত বদলালে loss বদলায়; SFT-র mask-নোট শুধু SFT-তে', () => {
  const m = fresh();
  m.plan.toggle('mode-finetune'); m.plan.toggle('preference-optimization');
  assert.match(m.plan.pseudo(spec), /preference_loss\(/);
  assert.ok(!m.plan.pseudo(spec).includes('loss_mask:'));
  m.plan.toggle('opt-loss-answer');       // SFT-র ভেতরের বিকল্প → SFT নিজে বাছা, preference বাদ
  assert.match(m.plan.pseudo(spec), /cross_entropy\(next_token_prediction, target tokens\)/);
  assert.match(m.plan.pseudo(spec), /loss_mask: only answer tokens/);
});

test('pseudo: শূন্য-থেকের নকল (-sc) সিদ্ধান্তের লেখাও বসে', () => {
  const m = fresh();
  for (const id of ['mode-scratch', 'opt-adamw-sc', 'opt-amp-sc', 'opt-accuracy-sc']) m.plan.toggle(id);
  const t = m.plan.pseudo(spec);
  assert.match(t, /optimizer = AdamW/);
  assert.match(t, /metrics = accuracy/);
  assert.match(t, /precision = mixed/);
});

// ---------- আবশ্যক / ঐচ্ছিক / default ----------
test('need: বাকি-তালিকায় শুধু আবশ্যক; ঐচ্ছিক আলাদা তালিকায়', () => {
  const m = fresh();
  m.plan.toggle('mode-finetune'); m.plan.toggle('opt-accuracy');          // ধাপ ১ সক্রিয়
  m.plan.toggle('supervised-fine-tuning-sft'); m.plan.toggle('opt-amp');    // ধাপ ২ ও ৩ সক্রিয়
  const req = m.plan.pending().map((r) => r.node.id), opt = m.plan.optionalOpen().map((r) => r.node.id);
  assert.ok(req.includes('goal-baseline') && req.includes('base-kind'), 'আবশ্যক বাকি ধরা পড়েনি');
  assert.ok(!req.includes('hp-optimizer') && !req.includes('run-track'), 'ঐচ্ছিক বাকি-তালিকায়');
  assert.ok(opt.includes('hp-optimizer') && opt.includes('run-track') && opt.includes('sft-loss-where'));
  for (const id of req) assert.equal(m.byId.get(id).node.need, 'required', id);
  for (const id of opt) assert.equal(m.byId.get(id).node.need, 'optional', id);
  assert.equal(new Set([...req, ...opt]).size, req.length + opt.length, 'একই decision দুই তালিকায়');
});

test('need: একই group-এর যেকোনো একটা পূর্ণ হলে পুরো group পূর্ণ, অপূর্ণ থাকলে একটাই দেখায়', () => {
  const m = fresh(); m.plan.toggle('mode-finetune'); m.plan.toggle('opt-accuracy'); m.plan.toggle('supervised-fine-tuning-sft');
  const ids = () => m.plan.pending().map((r) => r.node.id).filter((i) => i === 'run-highlevel' || i === 'run-compose');
  // তার ধাপ (ft-cycle) তখনই সক্রিয় যখন সেখানে কিছু বাছা
  m.plan.toggle('opt-amp');
  assert.equal(ids().length, 1, 'group অপূর্ণ: ঠিক একটা দেখানোর কথা, পেয়েছি ' + ids());
  m.plan.toggle('tool-trl');
  assert.deepEqual(ids(), [], 'compose পূর্ণ হলে highlevel-ও বাকি দেখাচ্ছে');
  m.plan.toggle('tool-trl'); m.plan.toggle('tool-unsloth');
  assert.deepEqual(ids(), [], 'highlevel পূর্ণ হলে compose বাকি দেখাচ্ছে');
});

test('default: না-বাছা ঐচ্ছিক decision-এর ডিফল্ট pseudo-code-এ ‹সাধারণ মান› চিহ্নে বসে', () => {
  const m = fresh(); m.plan.toggle('mode-finetune');
  const t = m.plan.pseudo(spec);
  assert.match(t, /optimizer = AdamW\(decoupled weight decay\) ‹সাধারণ মান›/);
  assert.match(t, /stop_rule = stop when validation loss rises.* ‹সাধারণ মান›/);
  assert.match(t, /parallel = single device ‹সাধারণ মান›/);
  assert.ok(!/optimizer = ‹\?/.test(t) && !/parallel = ‹\?/.test(t), 'ডিফল্ট থাকতেও অবাছা চিহ্ন');
  assert.ok(/metrics\s+= ‹\?/.test(t), 'আবশ্যক অবাছা থাকলে ‹?› চিহ্ন থাকার কথা');
});

test('default: নিজে বাছলে ডিফল্ট-চিহ্ন যায়; SFT-র ডিফল্ট শুধু SFT বাছলে', () => {
  const m = fresh(); m.plan.toggle('mode-finetune');
  assert.ok(!m.plan.pseudo(spec).includes('loss_mask:'), 'SFT ছাড়া mask-নোট');
  m.plan.toggle('supervised-fine-tuning-sft');
  assert.match(m.plan.pseudo(spec), /loss_mask: only answer tokens.* ‹সাধারণ মান›/);
  m.plan.toggle('opt-loss-all');
  const t = m.plan.pseudo(spec);
  assert.match(t, /loss_mask: no mask: every token counts\n/);
  assert.ok(!/loss_mask:.*‹সাধারণ মান›/.test(t), 'নিজে বাছার পরও ডিফল্ট-চিহ্ন');
  assert.ok(!t.includes('loss_mask: only answer'), 'ডিফল্ট আর বাছা দুটোই বসেছে');
  m.plan.toggle('opt-adam');
  assert.match(m.plan.pseudo(spec), /optimizer = Adam\n/);
  assert.ok(!/optimizer = .*‹সাধারণ মান›/.test(m.plan.pseudo(spec)));
});

test('default: -sc পথেও ডিফল্ট বসে, আর ঐচ্ছিক-অবাছা ছাঁচ-লাইন বাদ যায় (engine, iterate)', () => {
  const m = fresh(); m.plan.toggle('mode-scratch');
  const t = m.plan.pseudo(spec);
  assert.match(t, /optimizer = AdamW.* ‹সাধারণ মান›/);
  assert.match(t, /data = load\(your_dataset\)/);
  assert.ok(!t.includes('serve_with'), 'অবাছা ঐচ্ছিক engine-এর লাইন থাকার কথা না');
  m.plan.toggle('tool-vllm-sc');
  assert.match(m.plan.pseudo(spec), /serve_with vLLM/);
  const f = fresh(); f.plan.toggle('mode-finetune');
  assert.ok(!f.plan.pseudo(spec).includes('ভুল থেকে নতুন data'), 'অবাছা ঐচ্ছিক iterate ফাঁকা চিহ্ন হয়ে এসেছে');
});

test('default: প্রতিটা defaultOption ঐচ্ছিক, একটা-বাছার decision-এর নিজের বিকল্প', () => {
  const m = fresh(); let n = 0;
  for (const r of m.records) {
    if (!r.node.defaultOption) continue; n++;
    assert.equal(r.node.need, 'optional', r.node.id); assert.equal(r.node.pick, 'one', r.node.id);
    assert.ok(m.plan.defaultOf(r), 'defaultOption এই decision-এর সন্তান নয়: ' + r.node.id);
  }
  assert.ok(n >= 8);
});

// ---------- বিরোধ ও নির্ভরতা ----------
const rules = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'rules.json'), 'utf8'));
const issueIds = (m) => m.plan.issues(rules).map((i) => i.rule);

test('rules: কিছু না বাছলে কোনো সতর্কতা নেই', () => { assert.deepEqual(issueIds(fresh()), []); });

test('rules: merge + merge-হয়-না adapter = বিরোধ; আলাদা adapter বাছলে মিটে যায়', () => {
  const m = fresh();
  m.plan.toggle('opt-deploy-merge'); m.plan.toggle('adapter-layer');
  const i = m.plan.issues(rules).find((x) => x.rule === 'merge-vs-nonmergeable');
  assert.ok(i && i.kind === 'conflict');
  assert.ok(i.nodes.includes('opt-deploy-merge') && i.nodes.includes('adapter-layer'));
  m.plan.toggle('opt-deploy-adapter');           // pick:one → merge বাদ
  assert.ok(!issueIds(m).includes('merge-vs-nonmergeable'));
});

test('rules: QLoRA + merge = সতর্কতা (দ্বিতীয় rounding)', () => {
  const m = fresh(); m.plan.toggle('qlora'); m.plan.toggle('opt-deploy-merge');
  assert.ok(issueIds(m).includes('merge-on-quantized'));
  const m2 = fresh(); m2.plan.toggle('lora-low-rank-update'); m2.plan.toggle('opt-deploy-merge');
  assert.ok(!issueIds(m2).includes('merge-on-quantized'), 'সাধারণ LoRA-তে এই সতর্কতা নয়');
});

test('rules: সংকেত ও data-ছাঁচের মিল (SFT, CPT, preference)', () => {
  const m = fresh(); m.plan.toggle('preference-optimization');
  assert.ok(issueIds(m).includes('pref-needs-pairs'));
  m.plan.toggle('opt-fmt-pref'); assert.ok(!issueIds(m).includes('pref-needs-pairs'));
  const a = fresh(); a.plan.toggle('supervised-fine-tuning-sft'); assert.ok(issueIds(a).includes('sft-needs-pairs'));
  a.plan.toggle('opt-fmt-chat'); assert.ok(!issueIds(a).includes('sft-needs-pairs'));
  const c = fresh(); c.plan.toggle('continued-pretraining'); assert.ok(issueIds(c).includes('cpt-needs-text'));
  c.plan.toggle('opt-fmt-text'); assert.ok(!issueIds(c).includes('cpt-needs-text'));
  const t = fresh(); t.plan.toggle('opt-fmt-text'); assert.ok(issueIds(t).includes('raw-text-needs-cpt'));
});

test('rules: learning rate ও পদ্ধতির অমিল, GGUF ও engine', () => {
  const m = fresh(); m.plan.toggle('full-fine-tuning'); m.plan.toggle('opt-lr-lora');
  assert.ok(issueIds(m).includes('lora-lr-on-full'));
  const n = fresh(); n.plan.toggle('lora-low-rank-update'); n.plan.toggle('opt-lr-full');
  assert.ok(issueIds(n).includes('full-lr-on-peft'));
  const g = fresh(); g.plan.toggle('opt-gguf'); assert.ok(issueIds(g).includes('gguf-needs-llamacpp'));
  g.plan.toggle('tool-ollama'); assert.ok(!issueIds(g).includes('gguf-needs-llamacpp'));
});

test('rules: সতর্কতা pseudo-code ও markdown-এ আসে, না থাকলে আসে না', () => {
  const m = fresh();
  for (const id of ['mode-finetune', 'opt-deploy-merge', 'soft-prompt-prefix']) m.plan.toggle(id);
  assert.match(m.plan.pseudo(spec, rules), /# সতর্কতা ও বিরোধ/);
  assert.match(m.plan.markdown('2026-01-01', rules), /## সতর্কতা ও বিরোধ/);
  const clean = fresh(); clean.plan.toggle('mode-finetune');
  assert.ok(!clean.plan.pseudo(spec, rules).includes('সতর্কতা ও বিরোধ'));
});

test('rules: এলোমেলো ক্লিকে সতর্কতা শুধু বাছা node নিয়ে, আর কখনো ভাঙে না', () => {
  const m = fresh(), rnd = rng(77);
  const pool = m.records.filter((r) => E.SELECTABLE.has(r.node.kind)).map((r) => r.node.id);
  for (let i = 0; i < 4000; i++) {
    m.plan.toggle(pool[Math.floor(rnd() * pool.length)]);
    if (i % 40 === 0) for (const x of m.plan.issues(rules)) for (const id of x.nodes) assert.ok(m.plan.has(id), `${x.rule}: ${id} বাছা নয়`);
  }
});

test('pseudo: বিকল্পের ঠিক নিচের tool (CER/WER → jiwer, merge → PEFT) লেখায় আসে', () => {
  const m = fresh();
  for (const id of ['mode-finetune', 'opt-cer-wer', 'tool-jiwer', 'opt-deploy-merge', 'tool-peft-merge', 'opt-paged', 'tool-bnb-optim']) m.plan.toggle(id);
  const t = m.plan.pseudo(spec, rules);
  assert.match(t, /CER\/WER[^\n]*\[tool: jiwer\]/);
  assert.match(t, /merge:[^\n]*\[tool: PEFT merge_and_unload\]/);
  assert.match(t, /optimizer = paged[^\n]*\[tool: bitsandbytes \(8-bit optimizer\)\]/);
  const m2 = fresh(); for (const id of ['mode-finetune', 'opt-cer-wer']) m2.plan.toggle(id);
  assert.ok(!m2.plan.pseudo(spec, rules).includes('[tool:'), 'tool না বাছলে [tool:] আসে না');
});
