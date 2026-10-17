(function () {
'use strict';
const $ = (s) => document.querySelector(s);
const data = JSON.parse($('#map-data').textContent);
const cfg = JSON.parse($('#map-config').textContent);
const tree = $('#tree'), modal = $('#definition'), search = $('#search'), empty = $('#empty');
const BASE_TITLE = document.title;

const records = [];          // সব node, গাছের ক্রমে
const byId = new Map();      // id → record
const byName = new Map();    // নাম → [record] (একই নাম একাধিক জায়গায় থাকতে পারে)
let seq = 0;

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
// "৪. Training — Model কীভাবে শেখে?" → "Training"
const short = (name) => name.replace(/^[০-৯0-9]+\.\s*/, '').split(' — ')[0];
// শুধু গঠনের জন্য বসানো নামগুলো (যেমন "গঠন ও হিসাব") পথের লেখায় বাদ; ওতে কোথায় আছে বোঝা যায় না
const GENERIC = new Set(['গঠন ও হিসাব', 'ধরন', 'সাধারণ গঠন', 'প্রচলিত অতিরিক্ত অংশ', 'প্রয়োজন অনুযায়ী সহায়ক অংশ', 'বিন্যাস অনুযায়ী']);
const trailText = (r, n) => r.trail.filter((a) => a.depth > 0 && !GENERIC.has(a.node.name)).slice(-n).map((a) => short(a.node.name)).join(' › ');

/* ---------- গাছ বানানো ---------- */
function setOpen(r, open) {
  if (!r.list) return;
  r.list.hidden = !open;
  r.toggle.textContent = open ? '−' : '+';
  r.toggle.setAttribute('aria-expanded', String(open));
  r.toggle.setAttribute('aria-label', r.node.name + (open ? ' — শাখা বন্ধ করো' : ' — শাখা খোলো'));
}

function build(node, parent, depth, trail) {
  const li = el('li', 'level-' + depth);
  li.dataset.id = node.id;
  const row = el('div', 'row');
  li.append(row);
  const branch = !!(node.children && node.children.length);
  const indicator = el(branch ? 'button' : 'span', branch ? 'toggle' : 'dot', branch ? '+' : '·');
  if (!branch) indicator.setAttribute('aria-hidden', 'true');
  row.append(indicator);

  const button = el('button', 'term');
  if (node.seq) button.append(el('span', 'seq', node.seq));
  button.append(document.createTextNode(node.name));
  button.setAttribute('aria-haspopup', 'dialog');
  row.append(button);

  const r = { node, li, depth, toggle: indicator, list: null, children: [], trail, parent: trail[trail.length - 1] || null, term: button };
  r.order = records.length;
  records.push(r);
  byId.set(node.id, r);
  if (!byName.has(node.name)) byName.set(node.name, []);
  byName.get(node.name).push(r);
  button.onclick = () => openNode(node.id, { reveal: false });
  decorateKind(r, row, button);

  if (r.parent) {
    const where = el('span', 'where', trailText(r, 2) || short(r.parent.node.name));
    where.setAttribute('aria-hidden', 'true');
    button.append(where);   // search চলার সময় দেখা যায়: কোন শাখার নাম
  }
  if (branch) {
    const count = el('span', 'count', String(node.children.length));
    count.setAttribute('aria-hidden', 'true');
    button.append(count);
    const ul = el('ul');
    ul.id = 'branch-' + seq++;
    r.list = ul;
    indicator.setAttribute('aria-controls', ul.id);
    li.append(ul);
    r.children = node.children.map((n) => build(n, ul, depth + 1, [...trail, r]));
    indicator.onclick = () => setOpen(r, r.list.hidden);
    setOpen(r, depth === 0);
  }
  parent.append(li);
  return r;
}

/* ---------- dialog-এর ভেতরের অংশ ---------- */
function section(title, build_) {
  const sec = el('section', 'profile-section');
  if (title) sec.append(el('h3', '', title));
  build_(sec);
  return sec;
}
function textSection(box, title, text, cls) {
  const sec = el('section', 'profile-section' + (cls ? ' ' + cls : ''));
  sec.append(el('h3', '', title), el('p', '', text));
  box.append(sec);
}
function extLink(parent, source) {
  const a = el('a', '', source.title);
  a.href = source.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
  parent.append(a);
}

function renderMathDetail(node, box) {
  if (!node.mathDetail) return;
  box.append(Object.assign(el('pre', 'math-formula'), { textContent: node.mathDetail.formula }));
  for (const [key, title] of [['meaning', 'চিহ্নগুলোর অর্থ'], ['example', 'ছোট হিসাব']]) textSection(box, title, node.mathDetail[key]);
}
function renderSettingPurpose(node, box) { if (node.settingPurpose) textSection(box, 'কোন প্রয়োজন মেটায়', node.settingPurpose); }
function renderTraining(node, box) { if (node.trainingDetail) textSection(box, 'কীভাবে শেখে', node.trainingDetail); }
function renderUsage(node, box) {
  if (!node.usageDetail) return;
  const sec = el('section', 'profile-section');
  sec.append(el('h3', '', 'কোথায় কাজে লাগে'), el('p', '', node.usageDetail.text));
  for (const s of node.usageDetail.sources || []) extLink(sec, s);
  box.append(sec);
}
function renderSelection(node, box) {
  if (!node.selection) return;
  for (const [key, title] of [['problem', 'কোন সমস্যা সমাধান করে?'], ['when', 'কখন বেছে নেবে'], ['avoid', 'কখন অন্য পথ ভাববে'], ['compare', 'কিসের সঙ্গে তুলনা করবে'], ['example', 'নিজের কাজের সঙ্গে মিলিয়ে দেখো']])
    textSection(box, title, node.selection[key], 'choice-guide');
  box.append(el('p', 'source-note', 'এটি ব্যবহারিক shortlist তৈরির নির্দেশনা; নিজের validation data, ভুলের খরচ, latency ও compute দিয়ে সিদ্ধান্ত যাচাই করো।'));
}
function renderInsight(node, box) {
  const ins = node.insight;
  if (!ins) return;
  for (const [key, title] of [['fact', 'একটু ভেবে দেখো'], ['history', 'ইতিহাসের ছোট গল্প']]) if (ins[key]) textSection(box, title, ins[key]);
  if (ins.sources && ins.sources.length) {
    const d = el('details');
    d.append(el('summary', '', 'ইতিহাসের সূত্র'));
    for (const s of ins.sources) extLink(d, s);
    box.append(d);
  }
}
/* ---------- গল্প, "কোনটা কখন", ইতিহাস ---------- */
function jumpButton(x) {
  if (!x.id) return el('span', 'pick plain', x.label);
  const b = el('button', 'pick', x.label);
  b.type = 'button';
  b.onclick = () => openNode(x.id);
  return b;
}
function renderStory(node, box) {
  box.replaceChildren();
  const s = node.story, h = node.history;
  if (!s && !(h && h.length)) return;
  const sec = el('section', 'profile-section story');
  sec.append(el('h3', '', 'গল্প: কেন এটা দরকার হলো'));
  if (s) {
    const steps = el('div', 'steps');
    const step = (n, label) => {
      const row = el('div', 'step');
      row.append(el('span', 'n', n));
      const body = el('div', 'body');
      body.append(el('div', 'lbl', label));
      row.append(body);
      steps.append(row);
      return body;
    };
    step('১', 'সমস্যা').append(el('p', '', s.problem));
    step('২', 'ধারণা').append(el('p', '', s.idea));
    if (s.next && s.next.length) {
      const body = step('৩', 'তারপর কী দরকার হলো');
      const list = el('div', 'nexts');
      for (const x of s.next) {
        const row = el('div', 'next');
        row.append(el('span', 'why', x.why + ' →'), jumpButton(x));
        list.append(row);
      }
      body.append(list);
    }
    sec.append(steps);
  }
  if (h && h.length) {
    const hs = el('div', 'history');
    hs.append(el('div', 'lbl', 'ইতিহাসে (সূত্র মিলিয়ে নেওয়া)'));
    for (const it of h) {
      const row = el('div', 'hrow');
      row.append(el('span', 'y', it.y), el('span', 't', it.t));
      const a = el('a', 'src', it.s);
      a.href = it.u; a.target = '_blank'; a.rel = 'noopener noreferrer';
      row.append(a);
      hs.append(row);
    }
    sec.append(hs);
  }
  box.append(sec);
}
function renderChoose(node, box) {
  box.replaceChildren();
  if (!node.choose || !node.choose.length) return;
  const sec = el('section', 'profile-section');
  sec.append(el('h3', '', 'কোন ক্ষেত্রে কোনটা বেছে নেবে'));
  const list = el('div', 'choices');
  for (const c of node.choose) {
    const row = el('div', 'choice');
    row.append(el('div', 'when', 'যদি ' + c.when), el('div', 'arrow', '→'), jumpButton(c));
    if (c.why) row.append(el('div', 'why', c.why));
    list.append(row);
  }
  sec.append(list);
  box.append(sec);
}
function renderPractice(node, box) {
  box.replaceChildren();
  const pr = node.practice;
  if (!pr) return;
  const sec = el('section', 'profile-section practice');
  sec.append(el('h3', '', 'বাস্তবে কী হয়'));
  if (pr.scenario) sec.append(el('p', 'scn', pr.scenario));
  if (pr.facts && pr.facts.length) {
    const b = el('div', 'pblock');
    b.append(el('div', 'lbl', '✓ সূত্রে মেলানো তথ্য'));
    for (const f of pr.facts) {
      const row = el('div', 'fact');
      row.append(el('span', 't', f.t));
      const a = el('a', 'src', f.s);
      a.href = f.u; a.target = '_blank'; a.rel = 'noopener noreferrer';
      row.append(a);
      b.append(row);
    }
    sec.append(b);
  }
  const list = (title, items, cls) => {
    if (!items || !items.length) return;
    const b = el('div', 'pblock ' + cls);
    b.append(el('div', 'lbl', title));
    const ul = el('ul');
    for (const t of items) ul.append(el('li', '', t));
    b.append(ul);
    sec.append(b);
  };
  list('সাধারণত — অভিজ্ঞতা-ভিত্তিক, নিয়ম নয়', pr.typical, 'exp');
  list('সাধারণ ভুল', pr.pitfalls, 'pit');
  if (pr.outside) sec.append(el('p', 'outside', 'কোর্সের বাইরের জ্ঞান: ' + pr.outside));
  box.append(sec);
}
function renderCore(node, box) { renderTraining(node, box); renderSettingPurpose(node, box); renderMathDetail(node, box); }
function renderMore(node, box) {
  const inner = el('div');
  renderSelection(node, inner); renderUsage(node, inner); renderInsight(node, inner); renderProfileExtra(node, inner);
  if (!inner.childNodes.length) return;
  const d = el('details', 'more');
  d.append(el('summary', '', 'আরও জানতে: বিস্তারিত নির্দেশনা, উৎস, অন্য কোণ'));
  d.append(inner);
  box.append(d);
}
function renderProfileExtra(node, box) {
  const p = node.profile;
  if (!p) return;
  const multi = (title, paras) => {
    const sec = el('section', 'profile-section');
    sec.append(el('h3', '', title));
    for (const v of paras) sec.append(el('p', '', v));
    box.append(sec);
  };
  multi('সমস্যা থেকে ধারণার জন্ম', p.story || [p.why]);
  multi('ইতিহাসের সময়রেখা', [p.history]);
  multi('পরে কোথায় কাজে লাগল', [p.uses]);
  multi('নির্দিষ্ট model বা কাজের উদাহরণ', [p.status]);
  if (p.role) multi('এখানে model, নাকি তার technique?', [p.role]);
  const d = el('details');
  d.append(el('summary', '', 'সূত্র ও যাচাইয়ের তথ্য'));
  d.append(el('p', 'source-note', 'যাচাই: ১৭ অক্টোবর ২০২৬। এখানে নির্দিষ্ট নথিভুক্ত উদাহরণ দেওয়া হয়েছে—বিশ্বের সর্বশেষ ব্যবহার বা জনপ্রিয়তার ranking নয়। ইতিহাস বাস্তব ঘটনার ভিত্তিতে; ব্যাখ্যার উদাহরণকে আবিষ্কারের ঘটনা বলা হয়নি।'));
  for (const s of p.sources || []) extLink(d, s);
  box.append(d);
}

function renderLessons(node, box) {
  box.replaceChildren();
  if (!node.lessons || !node.lessons.length) return;
  const sec = el('section', 'profile-section');
  sec.append(el('h3', '', 'কোর্সে কোথায় পড়বে'));
  const ul = el('ul', 'lesson-list');
  for (const l of node.lessons) {
    const li = el('li');
    const useLink = cfg.lessonLinks && l.h;
    const item = el(useLink ? 'a' : 'span', 'lesson');
    if (useLink) { item.href = l.h; item.target = '_blank'; item.rel = 'noopener noreferrer'; }
    item.append(el('span', 'k', l.k), el('span', '', l.t));
    li.append(item);
    ul.append(li);
  }
  sec.append(ul);
  box.append(sec);
}

function chipSection(title, items) {   // items: [{label, sub, id}]
  const sec = el('section', 'profile-section');
  sec.append(el('h3', '', title));
  const wrap = el('div', 'chips');
  for (const it of items) {
    const b = el('button', '', it.label);
    b.type = 'button';
    if (it.sub) b.append(el('span', 'at', it.sub));
    b.onclick = () => openNode(it.id);
    wrap.append(b);
  }
  sec.append(wrap);
  return sec;
}
function renderRelated(r, box) {
  box.replaceChildren();
  if (r.children.length) box.append(chipSection('ভেতরের অংশ', r.children.map((c) => ({ label: c.node.name, id: c.node.id }))));
  const same = (byName.get(r.node.name) || []).filter((x) => x !== r);
  if (same.length)
    box.append(chipSection(`এই নামটি আরও ${same.length} জায়গায় আছে`, same.map((x) => ({ label: trailText(x, 3) || short(x.node.name), id: x.node.id }))));
}

function renderCrumb(r) {
  const nav = $('#crumb');
  nav.replaceChildren();
  r.trail.forEach((a, i) => {
    if (i) nav.append(el('span', 'sep', '/'));
    const b = el('button', '', a.depth === 0 ? a.node.name : short(a.node.name));
    b.type = 'button';
    b.onclick = () => openNode(a.node.id);
    nav.append(b);
  });
  if (r.trail.length) nav.append(el('span', 'sep', '/'));
  nav.append(el('span', '', short(r.node.name)));
}

/* ---------- খোলা, hash, নেভিগেশন ---------- */
function clearSearch() {
  search.value = '';
  document.body.classList.remove('searching');
  empty.hidden = true;
  filter(root, '');
}
function reveal(r) {
  if (search.value) clearSearch();
  for (let a = r.parent; a; a = a.parent) { a.li.hidden = false; setOpen(a, true); }
  r.li.hidden = false;
  r.li.scrollIntoView({ block: 'center' });
  r.li.classList.remove('pulse'); void r.li.offsetWidth; r.li.classList.add('pulse');
}
function openNode(id, opts) {
  const o = Object.assign({ reveal: true, hash: true }, opts);
  const r = byId.get(id);
  if (!r) return;
  if (o.reveal) reveal(r);
  const title = $('#def-title');
  title.replaceChildren();
  if (r.node.seq && r.parent) {
    const total = r.parent.node.children.length;
    const chip = el('span', 'seq big', 'ধাপ ' + r.node.seq + ' / ' + total.toLocaleString('bn-BD'));
    chip.title = short(r.parent.node.name) + '-এর ' + total.toLocaleString('bn-BD') + ' ধাপের মধ্যে';
    title.append(chip, document.createTextNode(' '));
  }
  title.append(document.createTextNode(r.node.name));
  $('#def-text').textContent = r.node.definition || 'এই শাখার বিষয়গুলো খুলে দেখো।';
  renderCrumb(r);
  renderPathBar(id);
  modal.dataset.nodeId = id;
  renderPick(r.node, $('#pick'));
  renderStory(r.node, $('#story'));
  renderChoose(r.node, $('#choose'));
  renderPractice(r.node, $('#practice'));
  const core = $('#core');
  core.replaceChildren();
  renderCore(r.node, core);
  renderLessons(r.node, $('#lessons'));
  renderRelated(r, $('#related'));
  const more = $('#more');
  more.replaceChildren();
  renderMore(r.node, more);
  if (!modal.open) modal.showModal();
  modal.scrollTop = 0;
  document.title = short(r.node.name) + ' · ' + BASE_TITLE;
  if (o.hash) setHash('#' + id);
}
// sandbox-করা পাতায় (iframe, data: URL) history বদলানো নিষেধ হতে পারে; তখনও পাতা চলবে
function setHash(h) {
  try { history.replaceState(null, '', h || location.href.split('#')[0]); } catch (e) { /* link শেয়ার ছাড়া বাকি সব চলে */ }
}
modal.addEventListener('close', () => {
  document.title = BASE_TITLE;
  renderPath();
  if (location.hash) setHash('');
});
window.addEventListener('hashchange', () => {
  if (location.hash.startsWith('#plan=')) { setSelFrom(location.hash.slice(6).split(',').filter(Boolean).map(resolveId)); saveSel(); refreshSel(); openPlan(true); return; }
  const id = resolveId(decodeURIComponent(location.hash.slice(1)));
  if (id && byId.has(id)) openNode(id, { hash: false });
  else if (!id && modal.open) modal.close();
});

/* ---------- search ও খোলা/গোটানো ---------- */
function filter(r, q, parentMatch) {
  const match = r.node.name.toLocaleLowerCase().includes(q);
  let childMatch = false;
  for (const c of r.children) if (filter(c, q, parentMatch || match)) childMatch = true;
  const visible = !q || parentMatch || match || childMatch;
  r.li.hidden = !visible;
  if (q) setOpen(r, visible); else setOpen(r, r.depth === 0);
  return visible;
}
search.addEventListener('input', () => {
  const q = search.value.trim().toLocaleLowerCase();
  document.body.classList.toggle('searching', !!q);
  empty.hidden = filter(root, q, false);
});
for (const [id, open] of [['expand', true], ['collapse', false]])
  document.getElementById(id).onclick = () => {
    clearSearch();
    records.forEach((r) => { r.li.hidden = false; setOpen(r, open || r.depth === 0); });
  };
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && !modal.open && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) { e.preventDefault(); search.focus(); }
});

/* ---------- শাখায় লাফানো ---------- */
function buildJump(rootRec) {
  const nav = $('#jump');
  for (const c of rootRec.children) {
    const b = el('button', '', c.node.name.split(' — ')[0]);
    b.type = 'button';
    b.title = c.node.name;
    b.onclick = () => {
      clearSearch();
      setOpen(c, true);
      c.li.scrollIntoView({ block: 'start' });
      c.term.focus();
    };
    nav.append(b);
  }
}

/* ---------- dialog-এর বোতাম ---------- */
$('#close').onclick = () => modal.close();
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    const b = modal.getBoundingClientRect();
    if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) modal.close();
  }
});
$('#copy').onclick = async (e) => {
  const btn = e.currentTarget, old = btn.textContent;
  try { await navigator.clipboard.writeText(location.href); btn.textContent = 'কপি হয়েছে'; }
  catch { btn.textContent = 'কপি হয়নি'; }
  setTimeout(() => (btn.textContent = old), 1600);
};

/* ---------- লেখার আকার ও theme (localStorage না চললেও পাতা চলে) ---------- */
function store(key, val) { try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; } }
let readingSize = 19;
{ const saved = Number(store('ml-reading-size')); if (saved >= 17 && saved <= 25) readingSize = saved; }
function applyReadingSize() {
  document.documentElement.style.setProperty('--reading-size', readingSize + 'px');
  $('#font-size').textContent = readingSize + 'px';
  $('#font-smaller').disabled = readingSize <= 17;
  $('#font-larger').disabled = readingSize >= 25;
  store('ml-reading-size', String(readingSize));
}
$('#font-smaller').onclick = () => { readingSize = Math.max(17, readingSize - 1); applyReadingSize(); };
$('#font-larger').onclick = () => { readingSize = Math.min(25, readingSize + 1); applyReadingSize(); };
applyReadingSize();

const themeBtn = $('#theme');
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  themeBtn.textContent = t === 'dark' ? '☀ light' : '☾ dark';
  themeBtn.setAttribute('aria-label', t === 'dark' ? 'light theme-এ যাও' : 'dark theme-এ যাও');
  const meta = document.querySelector('meta[name=theme-color]');
  if (meta) meta.content = t === 'dark' ? '#151a17' : '#fbfcf7';
}
applyTheme(store('ml-atlas-theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'));
themeBtn.onclick = () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  store('ml-atlas-theme', next);
};


/* ---------- গল্পের পথ ও "শেষ করেছি" টিক (শুধু এই browser-এ জমা থাকে) ---------- */
const chapters = cfg.path || [];
const flat = chapters.flatMap((c) => c.steps);
const stepNo = new Map(flat.map((id, i) => [id, i]));
let done = new Set();
try { const saved = JSON.parse(store('ml-atlas-done') || '[]'); if (Array.isArray(saved)) done = new Set(saved.filter((id) => stepNo.has(id))); } catch (e) { /* টিক ছাড়াই চলবে */ }
function saveDone() { store('ml-atlas-done', JSON.stringify([...done])); }
function toggleDone(id, on) {
  if (on) done.add(id); else done.delete(id);
  saveDone(); renderPath(); updateCount();
}
function updateCount() { const c = $('#path-count'); if (c) c.textContent = flat.length ? `${done.size}/${flat.length}` : ''; }
function renderPathBar(id) {
  const box = $('#pathbar');
  box.replaceChildren();
  box.className = '';
  if (!stepNo.has(id)) return;
  const i = stepNo.get(id);
  box.className = 'pathbar';
  const prev = el('button', '', '← আগের'), next = el('button', '', 'পরের →'), tick = el('button', done.has(id) ? 'on' : '', done.has(id) ? '✓ শেষ করেছি' : 'শেষ করেছি');
  for (const b of [prev, next, tick]) b.type = 'button';
  prev.disabled = i === 0; next.disabled = i === flat.length - 1;
  prev.onclick = () => openNode(flat[i - 1], { reveal: false });
  next.onclick = () => openNode(flat[i + 1], { reveal: false });
  tick.onclick = () => { toggleDone(id, !done.has(id)); renderPathBar(id); };
  tick.setAttribute('aria-pressed', done.has(id));
  box.append(el('span', 'pos', `গল্পের পথ · ধাপ ${i + 1} / ${flat.length}`), prev, tick, next);
}
let resetArmed = false;
function renderPath() {
  const box = $('#pathview');
  if (!chapters.length) return;
  box.replaceChildren();
  const head = el('div', 'path-head');
  head.append(el('p', '', 'এক ধারণা থেকে পরেরটায় ধাপে ধাপে হাঁটো। প্রতিটা ধাপে "সমস্যা → ধারণা → তারপর কী" আছে। শেষ হলে টিক দাও; টিক শুধু এই browser-এ থাকে।'));
  if (done.size) {
    const reset = el('button', 'reset', resetArmed ? 'টিক সব মুছবে (' + done.size + 'টা) — নিশ্চিত?' : 'টিক মুছে নতুন করে শুরু');
    reset.type = 'button';
    if (resetArmed) reset.classList.add('warn');
    reset.onclick = () => {
      if (!resetArmed) { resetArmed = true; renderPath(); setTimeout(() => { if (resetArmed) { resetArmed = false; renderPath(); } }, 5000); return; }
      resetArmed = false; done.clear(); saveDone(); renderPath(); updateCount();
    };
    head.append(reset);
  }
  box.append(head);
  const pr = el('div', 'progress');
  const bar = el('div', 'bar'), fill = el('i');
  fill.style.width = (flat.length ? Math.round(done.size / flat.length * 100) : 0) + '%';
  bar.append(fill);
  bar.setAttribute('role', 'progressbar'); bar.setAttribute('aria-valuemin', 0); bar.setAttribute('aria-valuemax', flat.length); bar.setAttribute('aria-valuenow', done.size);
  pr.append(el('span', '', `শেষ করেছি ${done.size} / ${flat.length}`), bar);
  box.append(pr);
  let n = 0;
  for (const ch of chapters) {
    const sec = el('section', 'chapter');
    sec.append(el('h3', '', ch.title));
    if (ch.intro) sec.append(el('p', 'intro', ch.intro));
    for (const id of ch.steps) {
      n++;
      const r = byId.get(id);
      if (!r) continue;
      const card = el('div', 'pstep' + (done.has(id) ? ' done' : ''));
      card.append(el('span', 'num', done.has(id) ? '✓' : String(n)));
      const open = el('button', 'open');
      open.type = 'button';
      open.append(el('div', 'ttl', short(r.node.name)));
      if (r.node.story) open.append(el('div', 'sub', r.node.story.problem));
      open.onclick = () => openNode(id, { reveal: false });
      card.append(open);
      const lab = el('label', 'tick'), cb = el('input');
      cb.type = 'checkbox'; cb.checked = done.has(id);
      cb.onchange = () => toggleDone(id, cb.checked);
      lab.append(cb, document.createTextNode('শেষ করেছি'));
      card.append(lab);
      sec.append(card);
    }
    box.append(sec);
  }
}
function setView(v) {
  const path = v === 'path' && chapters.length > 0;
  document.body.classList.toggle('path-mode', path);
  $('#pathview').hidden = !path;
  $('#view-tree').setAttribute('aria-selected', String(!path));
  $('#view-path').setAttribute('aria-selected', String(path));
  store('ml-atlas-view', path ? 'path' : 'tree');
  if (path) renderPath();
}
$('#view-tree').onclick = () => setView('tree');
$('#view-path').onclick = () => setView('path');
if (!chapters.length) $('#view-path').hidden = true;


/* ---------- আমার পথ: বাছাই, ডান পাশের তালিকা, কপি ---------- */
const plan = AtlasEngine.create(records, byId);   // বাছাই-যুক্তি: src/js/engine.js
const SELECTABLE = AtlasEngine.SELECTABLE;
const selected = plan.set;
const { stepOf, pathNames, activeMode, stepStat, toolLine } = plan;
const orderedSel = plan.ordered, pendingDecisions = plan.pending, planGroups = plan.groups;
const planMarkdown = () => plan.markdown(new Date().toISOString().slice(0, 10));
const planPlain = () => plan.plain(new Date().toISOString().slice(0, 10));
const planJSON = () => plan.json(new Date().toISOString());
const planLink = () => plan.link(location.href);
const BASIS = { course: 'কোর্সে আছে', paper: 'paper থেকে মেলানো', experience: 'অভিজ্ঞতা-ভিত্তিক, নিয়ম নয়', 'tool-doc': 'tool-এর docs বা README থেকে' };
function decorateKind(r, row, button) {
  const n = r.node;
  if (!n.kind) return;
  if (n.kind === 'decision') {
    button.append(el('span', 'kchip ' + (n.pick === 'one' ? 'one' : 'many'), n.pick === 'one' ? 'একটা বাছো' : 'একাধিক বাছতে পারো'));
  }
  if (n.kind === 'tool') {
    button.append(el('span', 'kchip tool', n.tool && n.tool.archived ? 'tool ⚠ archived' : 'tool'));
  }
  if (n.kind === 'info' && r.trail.some((a) => a.node.kind === 'step')) button.append(el('span', 'kchip info', 'ব্যাখ্যা'));
  if (n.kind === 'stepref') {
    const g = el('button', 'selbtn go', 'ধাপে যাও →');
    g.type = 'button';
    g.onclick = (e) => { e.stopPropagation(); gotoStep(n.goto); };
    row.append(g);
  }
  if (n.steps) button.append(el('span', 'kchip mode', 'পথের ধরন'));
  if (SELECTABLE.has(n.kind)) {
    const b = el('button', 'selbtn', 'বাছো');
    b.type = 'button'; b.setAttribute('aria-label', 'বাছো: ' + n.name);
    b.onclick = (e) => { e.stopPropagation(); toggleSel(n.id); };
    row.append(b);
    r.selBtn = b;
  }
}
function gotoStep(sid) {
  const r = byId.get(sid);
  if (!r) return;
  if (search.value) clearSearch();
  setBranchOpen(r);
  r.li.scrollIntoView({ block: 'start' });
  r.li.classList.remove('pulse'); void r.li.offsetWidth; r.li.classList.add('pulse');
}
function setBranchOpen(r) {
  for (let a = r.parent; a; a = a.parent) { a.li.hidden = false; setOpen(a, true); }
  r.li.hidden = false; setOpen(r, true);
}
function renderSteps(box, compact) {
  const mode = activeMode();
  box.replaceChildren();
  const row = el('div', 'modes');
  for (const id of ['mode-finetune', 'mode-scratch']) {
    const r = byId.get(id); if (!r) continue;
    const on = selected.has(id);
    const b = el('button', 'modebtn' + (on ? ' on' : ''), (on ? '✓ ' : '') + r.node.name);
    b.type = 'button'; b.setAttribute('aria-pressed', String(on));
    b.onclick = () => toggleSel(id);
    row.append(b);
  }
  box.append(row);
  if (!mode) { if (!compact) box.append(el('p', 'plan-empty', 'আগে বাছো: Fine-tune করবে, না শূন্য থেকে Train? তারপর ধাপগুলো এখানে আসবে।')); return; }
  const lst = el('div', 'stepchips');
  mode.node.steps.forEach((sid, i) => {
    const r = byId.get(sid), c = stepStat(sid);
    const b = el('button', 'stepchip' + (c ? ' done' : ''));
    b.type = 'button'; b.title = r.node.name;
    b.append(el('span', 'sn', (c ? '✓' : String(i + 1).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]))), document.createTextNode(short(r.node.name.replace(/^[০-৯]+\.\s*/, ''))));
    if (c) b.append(el('span', 'sc', c.toLocaleString('bn-BD')));
    b.onclick = () => gotoStep(sid);
    lst.append(b);
  });
  box.append(lst);
}
function toggleSel(id) {
  const res = plan.toggle(id);
  if (!res.ok) return;
  if (res.on) {
    const r = res.record;
    if (r.children.length) setOpen(r, true);
    if (window.innerWidth > 900) openPlan(true);   // ছোট পর্দায় তালিকা গাছ ঢেকে দেয়, তাই নিজে খোলে না
    if (r.node.steps) { const first = r.node.steps.find((sid) => !stepStat(sid)); if (first) setTimeout(() => gotoStep(first), 50); }
  }
  saveSel(); refreshSel();
}
function setSelFrom(ids) { plan.setFrom(ids); }
function saveSel() { store('ml-atlas-plan', JSON.stringify([...selected])); }
function copyText(text, btn) {
  const old = btn.textContent;
  const done = (ok) => { btn.textContent = ok ? 'কপি হয়েছে ✓' : 'কপি হয়নি'; setTimeout(() => (btn.textContent = old), 1600); };
  const fallback = () => {
    const t = el('textarea'); t.value = text; t.style.cssText = 'position:fixed;left:-999px;top:0';
    document.body.append(t); t.select(); let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    t.remove(); done(ok);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), fallback); else fallback();
}
let clearArmed = false;
function renderPlan() {
  const box = $('#plan');
  box.replaceChildren();
  const head = el('div', 'plan-head');
  head.append(el('h2', '', 'আমার পথ'), el('span', 'plan-n', selected.size + 'টা বাছা'));
  const close = el('button', 'plan-close', '✕'); close.type = 'button'; close.setAttribute('aria-label', 'তালিকা বন্ধ করো'); close.onclick = () => openPlan(false);
  head.append(close);
  box.append(head);
  const sb = el('div', 'plan-steps'); renderSteps(sb, false); box.append(sb);
  if (!selected.size) {
    box.append(el('p', 'plan-empty', 'গাছে নামতে নামতে "বাছো" চাপো: ধাপ ধরে বিকল্প, তারপর tool। বাছাই এখানে জমবে, আর এখান থেকে কপি করা যাবে।'));
    return;
  }
  const acts = el('div', 'plan-acts');
  const mk = (label, fn) => { const b = el('button', 'control', label); b.type = 'button'; b.onclick = () => copyText(fn(), b); acts.append(b); };
  mk('Markdown কপি', planMarkdown); mk('JSON কপি', planJSON); mk('লেখা কপি', planPlain); mk('লিংক কপি', planLink);
  box.append(acts);
  for (const g of planGroups()) {
    const sec = el('section', 'plan-step');
    sec.append(el('h3', '', g.step ? g.step.node.name : 'পথের ধরন'));
    for (const r of g.items) {
      const n = r.node, row = el('div', 'plan-item' + (n.tool && n.tool.archived ? ' warn' : ''));
      const body = el('div', 'pi-body');
      const pn = pathNames(r, g.step);
      if (pn.length > 1) body.append(el('div', 'pi-path', pn.slice(0, -1).join(' › ')));
      const nm = el('button', 'pi-name', pn[pn.length - 1]); nm.type = 'button'; nm.onclick = () => openNode(n.id, { reveal: true });
      body.append(nm);
      if (n.kind === 'tool') body.append(el('span', 'kchip tool', n.tool && n.tool.archived ? 'tool ⚠ archived' : 'tool'));
      const tl = toolLine(n); if (tl) body.append(el('div', 'pi-meta', tl));
      row.append(body);
      const x = el('button', 'pi-x', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'বাদ দাও: ' + n.name); x.onclick = () => { removeWithDesc(n.id); saveSel(); refreshSel(); };
      row.append(x);
      sec.append(row);
    }
    box.append(sec);
  }
  const hf = orderedSel().filter((r) => r.node.kind === 'tool' && r.node.tool && r.node.tool.owner === 'huggingface' && r.node.tool.host === 'github');
  if (hf.length) box.append(el('p', 'plan-note', 'ইকোসিস্টেম-নির্ভরতা: এই পথের ' + hf.length.toLocaleString('bn-BD') + 'টা tool Hugging Face-এর (' + hf.map((r) => short(r.node.name)).join(', ') + ')। বদল চাইলে একই সিদ্ধান্তে অন্য বিকল্প দেখো।'));
  const pend = pendingDecisions();
  if (pend.length) {
    const sec = el('section', 'plan-pending');
    sec.append(el('h3', '', 'এখনও বাছা হয়নি (' + pend.length + ')'));
    for (const r of pend.slice(0, 12)) { const b = el('button', 'pending', short(r.node.name)); b.type = 'button'; b.onclick = () => { reveal(r); setOpen(r, true); }; sec.append(b); }
    box.append(sec);
  }
  const clr = el('button', 'reset' + (clearArmed ? ' warn' : ''), clearArmed ? 'সব ' + selected.size + 'টা মুছবে: নিশ্চিত?' : 'সব বাছাই মুছো'); clr.type = 'button';
  clr.onclick = () => {
    if (!clearArmed) { clearArmed = true; renderPlan(); setTimeout(() => { if (clearArmed) { clearArmed = false; renderPlan(); } }, 5000); return; }
    clearArmed = false; selected.clear(); saveSel(); refreshSel();
  };
  box.append(clr);
}
function refreshSel() {
  for (const r of records) if (r.selBtn) {
    const on = selected.has(r.node.id);
    r.selBtn.textContent = on ? '✓ বাছা' : 'বাছো';
    r.selBtn.setAttribute('aria-pressed', String(on));
    r.li.classList.toggle('picked', on);
  }
  $('#plan-count').textContent = selected.size.toLocaleString('bn-BD');
  renderSteps($('#startbar'), true);
  renderPlan();
  if (modal.open && modal.dataset.nodeId) renderPick(byId.get(modal.dataset.nodeId).node, $('#pick'));
}
function openPlan(open) {
  document.body.classList.toggle('plan-open', open);
  $('#plan').hidden = !open;
  $('#plan-toggle').setAttribute('aria-expanded', String(open));
}
$('#plan-toggle').onclick = () => openPlan($('#plan').hidden);
function inPlanTree(r) { return r.trail.some((a) => a.node.kind === 'step') || r.node.kind === 'step'; }
function renderPick(node, box) {
  box.replaceChildren();
  if (!node.kind || node.kind === 'step' || node.kind === 'stepref') return;
  const r = byId.get(node.id);
  const wrap = el('div', 'pickbox');
  if (node.kind === 'info') {
    if (r && inPlanTree(r)) {
      let a = r.parent;
      while (a && !SELECTABLE.has(a.node.kind) && a.node.kind !== 'decision') a = a.parent;
      const where = a && SELECTABLE.has(a.node.kind) ? `"${short(a.node.name)}" বাছলে এটা নিজে থেকেই তার অংশ হয়ে আসে` : 'এটা ব্যাখ্যা, সিদ্ধান্ত নয়';
      const note = el('div', 'infonote');
      note.append(el('span', 'kchip info', 'ব্যাখ্যা'), el('span', '', ' বাছার বিষয় নয়: ' + where + '; আলাদা করে বাছার কিছু নেই। সিদ্ধান্তগুলো ওপরের ও নিচের "বাছো" বোতামওয়ালা node-এ।'));
      wrap.append(note); box.append(wrap);
    }
    return;
  }
  if (node.kind === 'decision') {
    wrap.append(el('span', 'kchip ' + (node.pick === 'one' ? 'one' : 'many'), node.pick === 'one' ? 'এখানে একটা বাছো' : 'এখানে একাধিক বাছতে পারো'));
  } else {
    const on = selected.has(node.id);
    const b = el('button', 'control strong', on ? '✓ পথে আছে (বাদ দিতে চাপো)' : 'এটা আমার পথে বাছো');
    b.type = 'button'; b.onclick = () => toggleSel(node.id);
    wrap.append(b);
    if (node.basis && BASIS[node.basis]) wrap.append(el('span', 'kchip basis ' + node.basis, BASIS[node.basis]));
    if (node.docs) { const a = el('a', 'src', 'docs'); a.href = node.docs; a.target = '_blank'; a.rel = 'noopener noreferrer'; wrap.append(a); }
    const guide = el('div', 'guide');
    const row = (cls, label, text) => { if (!text) return; const d = el('div', 'grow ' + cls); d.append(el('span', 'gk', label), el('span', 'gv', text)); guide.append(d); };
    row('when', 'কখন বাছবে', node.when);
    row('why', 'কেন বাছবে', node.why);
    row('cost', 'দাম / কখন এড়াবে', node.tradeoff);
    if (node.how && node.how.length) {
      const d = el('div', 'grow how'); d.append(el('span', 'gk', 'কীভাবে চালু করবে'));
      const v = el('span', 'gv');
      for (const h of node.how) { const a = el('a', 'src', h.t); a.href = h.u; a.target = '_blank'; a.rel = 'noopener noreferrer'; v.append(a, el('br')); }
      d.append(v); guide.append(d);
    }
    if (guide.childNodes.length) wrap.append(guide);
  }
  if (node.kind === 'tool' && node.tool) {
    const t = node.tool, info = el('div', 'toolinfo');
    info.append(el('div', 'lbl', t.archived ? '⚠ tool-এর তথ্য (archived)' : 'tool-এর তথ্য'));
    const row = (k, v) => { const d = el('div', 'trow'); d.append(el('span', 'k', k), v instanceof Node ? v : el('span', 'v', v)); info.append(d); };
    const link = (u, text) => { const a = el('a', 'src', text || u); a.href = u; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; };
    row('repo / উৎস', link(t.repo));
    if (t.owner) row('মালিক', t.owner + (t.owner === 'huggingface' && t.host === 'github' ? ' (Hugging Face ইকোসিস্টেম)' : ''));
    if (t.docs) row('docs', link(t.docs));
    row('licence', t.license);
    row('অবস্থা', t.archived ? 'archived: আর আপডেট নেই, নতুন কাজে এড়াও' : 'সক্রিয় (শেষ push: ' + t.pushed + ')');
    if (t.supports) row('যা চলে', t.supports.join(', '));
    if (t.note) row('সতর্কতা', t.note);
    row('যাচাই', t.src + ', ' + t.checked);
    wrap.append(info);
  }
  box.append(wrap);
}
/* ---------- শুরু ---------- */
const ALIAS = cfg.aliases || {};
const resolveId = (id) => (byId.has(id) ? id : (ALIAS[id] && byId.has(ALIAS[id]) ? ALIAS[id] : id));
const root = build(data, tree, 0, []);
buildJump(root);
{
  let ids = [];
  if (location.hash.startsWith('#plan=')) ids = location.hash.slice(6).split(',').filter(Boolean).map(resolveId);
  else { try { const a = JSON.parse(store('ml-atlas-plan') || '[]'); if (Array.isArray(a)) ids = a.map(resolveId); } catch (e) { ids = []; } }
  setSelFrom(ids);
  refreshSel();
  if (selected.size && window.innerWidth > 900) openPlan(true);
}
updateCount();
setView(location.hash === '#path' ? 'path' : (store('ml-atlas-view') === 'path' ? 'path' : 'tree'));
{ const id = resolveId(decodeURIComponent(location.hash.slice(1))); if (id && byId.has(id)) openNode(id, { hash: false }); }
})();
