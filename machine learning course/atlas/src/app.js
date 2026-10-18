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
let cmpReturn = null;        // node-dialog বন্ধ হলে তুলনায় ফেরার তথ্য { parent, ids }

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
    const kids = AtlasCompare.groupOf(r);
    if (kids.length) {
      const cb = el('button', 'cmpbtn', '⇄ তুলনা');
      cb.type = 'button'; cb.title = 'ভেতরের ' + kids.length.toLocaleString('bn-BD') + 'টা পাশাপাশি তুলনা করো';
      cb.setAttribute('aria-label', short(node.name) + '-এর ভেতরের ' + kids.length.toLocaleString('bn-BD') + 'টা তুলনা করো');
      cb.onclick = (e) => { e.stopPropagation(); openCompare(r); };
      row.insertBefore(cb, r.selBtn || null);
    }
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
  renderCmpEntry(r);
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
  if (cmpReturn) { const back = cmpReturn; cmpReturn = null; openCompare(byId.get(back.parent), back.ids); return; }
  if (location.hash && !location.hash.startsWith('#cmp=')) setHash('');   // তুলনা খোলার সময় এই event দেরিতে আসে; তার hash মুছো না
});
window.addEventListener('hashchange', () => {
  if (location.hash.startsWith('#cmp=')) { openCompareFromHash(); return; }
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
  themeBtn.textContent = t === 'dark' ? '☀' : '☾';
  themeBtn.title = t === 'dark' ? 'light theme' : 'dark theme';
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
const planMarkdown = () => plan.markdown(new Date().toISOString().slice(0, 10), cfg.rules);
const planPlain = () => plan.plain(new Date().toISOString().slice(0, 10), cfg.rules);
const planJSON = () => plan.json(new Date().toISOString());
const planLink = () => plan.link(location.href);
const planPseudo = () => plan.pseudo(cfg.pseudo, cfg.rules);
let clearArmed = false, planTab = 'path';
let prevIds = [], prevDismissed = false;   // আগের সেশনের পথ: নিজে বসে না, শুধু ফিরিয়ে আনার প্রস্তাব
const BASIS = AtlasCompare.BASIS;
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
  if (compact && prevIds.length && !prevDismissed) {
    const rs = el('div', 'restore');
    rs.append(el('span', '', 'আগের একটা পথ জমা আছে: ' + prevIds.length.toLocaleString('bn-BD') + 'টা বাছা। নিজে থেকে বসানো হয়নি।'));
    const back = el('button', 'btn sm', selected.size ? 'এটা দিয়ে বদলাও' : 'ফিরিয়ে আনো'); back.type = 'button';
    back.onclick = () => { setSelFrom(prevIds); forgetPrev(); saveSel(); refreshSel(); if (window.innerWidth > 900) openPlan(true); };
    const del = el('button', 'btn sm danger', 'মুছে ফেলো'); del.type = 'button'; del.onclick = () => { forgetPrev(); refreshSel(); };
    const x = el('button', 'btn ghost icon sm', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'এখন থাক'); x.onclick = () => { prevDismissed = true; refreshSel(); };
    rs.append(back, del, x);
    box.append(rs);
  }
  const row = el('div', 'sb-row');
  if (compact) row.append(el('span', 'sb-label', 'পথের ধরন'));
  const modes = el('div', 'modes');
  for (const id of ['mode-finetune', 'mode-scratch']) {
    const r = byId.get(id); if (!r) continue;
    const on = selected.has(id);
    const b = el('button', 'modebtn' + (on ? ' on' : ''), (on ? '✓ ' : '') + r.node.name);
    b.type = 'button'; b.setAttribute('aria-pressed', String(on));
    b.onclick = () => toggleSel(id);
    modes.append(b);
  }
  row.append(modes);
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
function forgetPrev() { prevIds = []; store('ml-atlas-prev', '[]'); }
function saveSel() { store('ml-atlas-plan', JSON.stringify([...selected])); }
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = el('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = msg; t.hidden = false;
  clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 1800);
}
function copyText(text) {
  const done = (ok) => toast(ok ? 'কপি হয়েছে ✓' : 'কপি হয়নি');
  const fallback = () => {
    const t = el('textarea'); t.value = text; t.style.cssText = 'position:fixed;left:-999px;top:0';
    document.body.append(t); t.select(); let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    t.remove(); done(ok);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), fallback); else fallback();
}
const COPY_FORMATS = [
  ['Pseudo-code', 'কোডের মতো রূপ', planPseudo],
  ['Markdown', 'নোট বা README-এর জন্য', planMarkdown],
  ['সাধারণ লেখা', 'chat বা email-এ', planPlain],
  ['JSON', 'অন্য tool-এর জন্য', planJSON],
  ['শেয়ার-link', 'এই পথ খুলবে', planLink],
];
function clearPlan() {
  if (!clearArmed) { clearArmed = true; refreshSel(); setTimeout(() => { if (clearArmed) { clearArmed = false; refreshSel(); } }, 5000); return; }
  clearArmed = false; selected.clear(); saveSel(); refreshSel();
}
// pseudo-code: মন্তব্য ম্লান, ধাপের শিরোনাম গাঢ়, না-বাছা ‹? …› হলুদ
function renderCode(pre, text) {
  const code = (str) => str.split(/(‹\?[^›]*›)/).forEach((part, i) => { if (part) pre.append(i % 2 ? el('span', 'pq', part) : part); });
  text.split('\n').forEach((ln, i) => {
    if (i) pre.append('\n');
    const m = /^(\s*)(#.*)$/.exec(ln);
    if (m) { pre.append(m[1], el('span', /^#\s*(ধাপ|=====)/.test(m[2]) ? 'ph' : 'pc', m[2])); return; }
    const k = ln.search(/\s#\s/);
    code(k < 0 ? ln : ln.slice(0, k));
    if (k >= 0) pre.append(el('span', 'pc', ln.slice(k)));
  });
}
function pendList(items) {
  const det = el('details', 'pend');
  det.append(el('summary', '', 'বাকি সিদ্ধান্ত (' + items.length.toLocaleString('bn-BD') + ')'));
  const list = el('div', 'pend-list');
  for (const r of items) { const b = el('button', 'pending', short(r.node.name)); b.type = 'button'; b.onclick = () => { reveal(r); setOpen(r, true); }; list.append(b); }
  det.append(list);
  return det;
}
function renderPlan() {
  const box = $('#plan');
  const old = box.querySelector('.plan-body'), scroll = old ? old.scrollTop : 0;
  box.replaceChildren();
  const iss = selected.size ? plan.issues(cfg.rules) : [];
  const top = el('div', 'plan-top');
  const head = el('div', 'plan-head');
  head.append(el('h2', '', 'আমার পথ'), el('span', 'plan-n', selected.size ? selected.size.toLocaleString('bn-BD') + 'টা বাছা' : ''));
  const close = el('button', 'btn ghost icon sm', '✕'); close.type = 'button'; close.setAttribute('aria-label', 'তালিকা বন্ধ করো'); close.onclick = () => openPlan(false);
  head.append(close);
  top.append(head);
  const body = el('div', 'plan-body');
  box.append(top, body);
  if (!selected.size) {
    const sb = el('div', 'plan-steps'); renderSteps(sb, false); body.append(sb);
    body.append(el('p', 'plan-empty', 'গাছে নামতে নামতে "বাছো" চাপো: ধাপ ধরে বিকল্প, তারপর tool। বাছাই এখানে জমবে, আর এখান থেকে কপি করা যাবে।'));
    return;
  }
  const mode = activeMode();
  if (mode) {
    const total = mode.node.steps.length, got = mode.node.steps.filter((sid) => stepStat(sid)).length;
    const meta = el('div', 'plan-meta'), bar = el('div', 'bar thin'), fill = el('i');
    fill.style.width = Math.round(got / total * 100) + '%'; bar.append(fill);
    meta.append(el('b', '', mode.node.name.split(' (')[0]), el('span', '', 'ধাপ ' + got.toLocaleString('bn-BD') + '/' + total.toLocaleString('bn-BD')), bar);
    top.append(meta);
  }
  const acts = el('div', 'plan-bar');
  const menu = el('details', 'menu');
  const sum = el('summary', 'btn primary', 'কপি ▾'); sum.setAttribute('aria-haspopup', 'menu');
  const pop = el('div', 'menu-pop'); pop.setAttribute('role', 'menu');
  for (const [label, hint, fn] of COPY_FORMATS) {
    const it = el('button', 'menu-item'); it.type = 'button'; it.setAttribute('role', 'menuitem');
    it.append(document.createTextNode(label), el('small', '', hint));
    it.onclick = () => { copyText(fn()); menu.open = false; };
    pop.append(it);
  }
  menu.append(sum, pop); acts.append(menu);
  top.append(acts);
  const tabs = el('div', 'tabs'); tabs.setAttribute('role', 'tablist');
  const addTab = (key, label, count, warn) => {
    const b = el('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(planTab === key));
    b.append(document.createTextNode(label));
    if (count) b.append(el('span', 'badge' + (warn ? ' warn' : ''), count.toLocaleString('bn-BD')));
    b.onclick = () => { planTab = key; renderPlan(); };
    tabs.append(b);
  };
  addTab('path', 'পথ', selected.size); addTab('code', 'Pseudo-code', 0); addTab('warn', 'সতর্কতা', iss.length, true);
  top.append(tabs);

  if (planTab === 'code') {
    const wrap = el('div', 'code-wrap'), pre = el('pre', 'pseudo-pre'); pre.tabIndex = 0;
    renderCode(pre, planPseudo()); wrap.append(pre); body.append(wrap);
  } else if (planTab === 'warn') {
    if (!iss.length) {
      const ok = el('div', 'plan-ok');
      ok.append(el('b', '', '✓ কোনো বিরোধ বা সতর্কতা নেই'),
        el('p', '', 'এই tab বাছা বিকল্পগুলোর মিল দেখে: দুটো একসাথে চলে না, বা একটার আগে আরেকটা দরকার। ' + (((cfg.rules || {}).rules || []).length).toLocaleString('bn-BD') + 'টা সূত্র-সহ নিয়মে যাচাই হয়; কিছু মিলে গেলে এখানে কারণসহ আসবে আর tab-এ সংখ্যা দেখাবে।'));
      body.append(ok);
    }
    for (const i of iss) {
      const card = el('div', 'issue ' + i.kind);
      card.append(el('span', 'ik', i.kind === 'conflict' ? '✗ বিরোধ' : i.kind === 'requires' ? '! দরকার' : '⚠ সতর্কতা'), el('p', '', i.text));
      const row = el('div', 'inodes');
      for (const id of i.nodes) { const r = byId.get(id); if (!r) continue; const b = el('button', 'pending', short(r.node.name)); b.type = 'button'; b.onclick = () => openNode(id, { reveal: true }); row.append(b); }
      row.append(el('span', 'isrc', i.src));
      card.append(row); body.append(card);
    }
  } else {
    const pendBy = new Map();
    for (const r of pendingDecisions()) { const st = stepOf(r), k = st ? st.node.id : '_'; if (!pendBy.has(k)) pendBy.set(k, []); pendBy.get(k).push(r); }
    for (const g of planGroups()) {
      const key = g.step ? g.step.node.id : '_';
      const sec = el('section', 'plan-step');
      const h = el('h3', '', ''); h.append(el('span', '', g.step ? g.step.node.name : 'পথের ধরন'), el('span', '', g.items.length.toLocaleString('bn-BD')));
      sec.append(h);
      for (const r of g.items) {
        const n = r.node, row = el('div', 'plan-item' + (n.tool && n.tool.archived ? ' warn' : ''));
        const bd = el('div', 'pi-body');
        const pn = pathNames(r, g.step);
        if (pn.length > 1) bd.append(el('div', 'pi-path', pn.slice(0, -1).join(' › ')));
        const nm = el('button', 'pi-name', pn[pn.length - 1]); nm.type = 'button'; nm.onclick = () => openNode(n.id, { reveal: true });
        bd.append(nm);
        if (n.kind === 'tool') bd.append(el('span', 'kchip tool', n.tool && n.tool.archived ? 'tool ⚠ archived' : 'tool'));
        const tl = toolLine(n); if (tl) bd.append(el('div', 'pi-meta', tl));
        row.append(bd);
        const x = el('button', 'pi-x', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'বাদ দাও: ' + n.name); x.onclick = () => { removeWithDesc(n.id); saveSel(); refreshSel(); };
        row.append(x);
        sec.append(row);
      }
      if (pendBy.has(key)) { sec.append(pendList(pendBy.get(key))); pendBy.delete(key); }
      body.append(sec);
    }
    for (const [, items] of pendBy) { const sec = el('section', 'plan-step'); sec.append(el('h3', '', 'অন্যান্য'), pendList(items)); body.append(sec); }
    const hf = orderedSel().filter((r) => r.node.kind === 'tool' && r.node.tool && r.node.tool.owner === 'huggingface' && r.node.tool.host === 'github');
    if (hf.length) body.append(el('p', 'plan-note', 'ইকোসিস্টেম-নির্ভরতা: এই পথের ' + hf.length.toLocaleString('bn-BD') + 'টা tool Hugging Face-এর (' + hf.map((r) => short(r.node.name)).join(', ') + ')। বদল চাইলে একই সিদ্ধান্তে অন্য বিকল্প দেখো।'));
  }
  const foot = el('div', 'plan-foot');
  const clr = el('button', 'btn sm danger' + (clearArmed ? ' armed' : ' ghost'), clearArmed ? 'সব ' + selected.size.toLocaleString('bn-BD') + 'টা মুছবে: নিশ্চিত?' : 'সব বাছাই মুছো'); clr.type = 'button';
  clr.onclick = clearPlan;
  foot.append(clr); box.append(foot);
  body.scrollTop = scroll;
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
{   // sticky topbar-এর উচ্চতা মেপে CSS-এ দেওয়া: panel আর স্ক্রলের লক্ষ্য যেন তার নিচে থাকে
  const bar = $('#topbar'), setBar = () => document.documentElement.style.setProperty('--bar', bar.offsetHeight + 'px');
  setBar();
  if (window.ResizeObserver) new ResizeObserver(setBar).observe(bar); else window.addEventListener('resize', setBar);
}
document.addEventListener('click', (e) => { document.querySelectorAll('details.menu[open]').forEach((d) => { if (!d.contains(e.target)) d.open = false; }); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('details.menu[open]').forEach((d) => { d.open = false; }); });
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
    const b = el('button', 'btn primary', on ? '✓ পথে আছে (বাদ দিতে চাপো)' : 'এটা আমার পথে বাছো');
    b.type = 'button'; b.onclick = () => toggleSel(node.id);
    wrap.append(b);
    if (node.basis && node.basis !== 'course' && BASIS[node.basis]) wrap.append(el('span', 'kchip basis ' + node.basis, BASIS[node.basis]));   // "কোর্সে আছে" পাঠকের কাজের তথ্য নয়
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
/* ---------- তুলনা: একই parent-এর ভাইদের পাশাপাশি ---------- */
const cmpDlg = $('#compare');
// order: বাছার সময়ক্রমে id (পুরোনো আগে; ভরলে সবচেয়ে আগেরটা সরে); sel: সেই record-গুলো গাছের ক্রমে; max: একসাথে কতটা
const cmp = { parent: null, peers: [], order: [], sel: [], max: AtlasCompare.DEFAULT_MAX };
const bn = (n) => n.toLocaleString('bn-BD');
const cmpHash = () => '#cmp=' + cmp.order.join(',');
function setCmpOrder(order) { cmp.order = order; cmp.sel = cmp.peers.filter((r) => order.includes(r.node.id)); }
function loadCmpMax() {
  const v = Number(store('ml-atlas-cmpmax'));
  return v >= AtlasCompare.MIN && v <= AtlasCompare.ABS_MAX ? v : AtlasCompare.DEFAULT_MAX;
}
// parentRec-এর ভেতরের ভাইদের তুলনা। pickIds (একাধিক, link থেকে) থাকলে ওগুলোই; একটা (dialog থেকে) বা অবৈধ হলে
// ওই node থেকে শুরু করে max টা, আর ওই node সবার শেষে বসে (ভরলে সবচেয়ে পরে সরে)
function openCompare(parentRec, pickIds) {
  const peers = AtlasCompare.groupOf(parentRec);
  if (!peers.length) return;
  cmpReturn = null;
  cmp.max = loadCmpMax();
  cmp.parent = parentRec; cmp.peers = peers;
  let order = [...new Set((pickIds || []).filter((id) => peers.some((r) => r.node.id === id)))];
  if (order.length >= AtlasCompare.MIN && order.length <= AtlasCompare.ABS_MAX) {
    cmp.max = Math.max(cmp.max, order.length);   // শেয়ার-link-এ যতগুলো আছে সবই দেখা যাক (এই সেশনের জন্য)
  } else {
    const cur = pickIds && pickIds[0];
    order = AtlasCompare.initialPick(peers, cur, cmp.max).map((r) => r.node.id);
    if (order.includes(cur)) order = order.filter((id) => id !== cur).concat(cur);
  }
  setCmpOrder(order);
  if (modal.open) modal.close();
  renderCompare();
  if (!cmpDlg.open) cmpDlg.showModal();
  setHash(cmpHash());
}
function openCompareFromHash() {
  const recs = location.hash.slice(5).split(',').filter(Boolean).map((id) => byId.get(resolveId(id))).filter(Boolean);
  if (recs.length && recs[0].parent) openCompare(recs[0].parent, recs.map((r) => r.node.id));
}
function renderCmpEntry(r) {
  const box = $('#cmp-entry');
  box.replaceChildren();
  const add = (label, fn) => { const b = el('button', 'btn sm', '⇄ ' + label); b.type = 'button'; b.onclick = fn; box.append(b); };
  const sib = AtlasCompare.peersOf(r);
  if (sib.length) add('ভাইদের সাথে তুলনা (' + bn(sib.length) + 'টা)', () => openCompare(r.parent, [r.node.id]));
  const kids = AtlasCompare.groupOf(r);
  if (kids.length) add('ভেতরের ' + bn(kids.length) + 'টা তুলনা করো', () => openCompare(r));
}
function cmpCell(type, v) {
  const td = el('td');
  if (v == null) { td.append(el('span', 'none', '—')); return td; }
  if (type === 'code') td.append(el('pre', 'cmp-code', v));
  else if (type === 'list') { const ul = el('ul', 'cmp-list'); for (const x of v) ul.append(el('li', '', x)); td.append(ul); }
  else if (type === 'link') { const a = el('a', '', v.replace(/^https:\/\//, '')); a.href = v; a.target = '_blank'; a.rel = 'noopener noreferrer'; td.append(a); }
  else td.append(el('p', 'cmp-text', v));
  return td;
}
function renderCompare() {
  const { parent, peers, sel } = cmp;
  const act = document.activeElement, keep = act && act.dataset ? act.dataset.cmpFocus : null;
  $('#cmp-title').textContent = short(parent.node.name) + ': পাশাপাশি তুলনা';
  $('#cmp-sub').textContent = bn(peers.length) + 'টা বিকল্পের মধ্যে ' + bn(sel.length) + 'টা পাশাপাশি দেখছ। কোনগুলো দেখবে তুমিই বাছো; ভরে গেলে নতুনটা চাপলে সবচেয়ে আগে বাছাটা সরে যায়।';
  const pick = $('#cmp-pick');
  pick.replaceChildren();
  for (const r of peers) {
    const on = sel.includes(r);
    const locked = on && sel.length <= AtlasCompare.MIN;
    const b = el('button', 'cmp-chip' + (on ? ' on' : ''), (on ? '✓ ' : '') + short(r.node.name));
    b.type = 'button'; b.dataset.cmpFocus = 'chip:' + r.node.id; b.setAttribute('aria-pressed', String(on));
    if (locked) b.setAttribute('aria-disabled', 'true');
    if (!on && sel.length >= cmp.max) { const oldest = byId.get(cmp.order[0]); if (oldest) b.title = 'ভরা আছে: চাপলে "' + short(oldest.node.name) + '" সরে যাবে'; }
    b.onclick = () => {
      const res = AtlasCompare.toggle(cmp.order, r.node.id, cmp.max);
      if (res.blocked) { toast('কমপক্ষে ' + bn(AtlasCompare.MIN) + 'টা লাগে'); return; }
      setCmpOrder(res.order);
      if (res.dropped) toast('"' + short(byId.get(res.dropped).node.name) + '" সরে গেল (একসাথে সর্বোচ্চ ' + bn(cmp.max) + 'টা)');
      renderCompare(); setHash(cmpHash());
    };
    pick.append(b);
  }
  // সর্বোচ্চ সংখ্যা: − ৪ +
  const mv = $('#cmp-max-val'); mv.textContent = bn(cmp.max);
  $('#cmp-max-dec').disabled = cmp.max <= AtlasCompare.MIN;
  $('#cmp-max-inc').disabled = cmp.max >= Math.min(AtlasCompare.ABS_MAX, peers.length);
  const rows = AtlasCompare.rows(sel);
  const diffOnly = $('#cmp-diff').checked;
  const shown = diffOnly ? rows.filter((x) => !x.same) : rows;
  $('#cmp-count').textContent = bn(shown.length) + 'টা সারি' + (diffOnly && rows.length > shown.length ? ' (' + bn(rows.length - shown.length) + 'টা একই বলে লুকানো)' : '');
  const body = $('#cmp-body');
  body.replaceChildren();
  const table = el('table', 'cmp-table');
  table.style.setProperty('--n', sel.length);
  table.style.setProperty('--w', (sel.length > 4 ? 230 : 270) + 'px');   // কলাম বেশি হলে সরু; অনুভূমিক স্ক্রলে প্রথম কলাম আটকে থাকে
  const cap = el('caption', 'sr-only', short(parent.node.name) + '-এর বিকল্পগুলোর তুলনা'); table.append(cap);
  const hr = el('tr');
  hr.append(Object.assign(el('th', 'corner'), { scope: 'col' }));
  for (const r of sel) {
    const th = el('th', 'col'); th.scope = 'col';
    const head = el('div', 'cmp-colhead');
    head.append(el('strong', '', short(r.node.name)));
    if (r.node.kind === 'tool') head.append(el('span', 'kchip tool', 'tool'));
    const acts = el('div', 'cmp-colacts');
    const open = el('button', 'btn sm ghost', 'খোলো'); open.type = 'button'; open.title = short(r.node.name) + '-এর পুরো পাতা';
    open.onclick = () => { cmpReturn = { parent: parent.node.id, ids: sel.map((x) => x.node.id) }; cmpDlg.close(); openNode(r.node.id); };
    acts.append(open);
    if (SELECTABLE.has(r.node.kind)) {
      const on = selected.has(r.node.id);
      const pb = el('button', 'btn sm' + (on ? ' primary' : ''), on ? '✓ পথে আছে' : 'পথে বাছো'); pb.type = 'button'; pb.setAttribute('aria-pressed', String(on));
      pb.dataset.cmpFocus = 'pick:' + r.node.id;
      pb.onclick = () => { toggleSel(r.node.id); renderCompare(); };
      acts.append(pb);
    }
    if (sel.length > AtlasCompare.MIN) {
      const x = el('button', 'btn sm ghost icon', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'তুলনা থেকে বাদ দাও: ' + short(r.node.name)); x.dataset.cmpFocus = 'drop:' + r.node.id;
      x.onclick = () => { setCmpOrder(cmp.order.filter((id) => id !== r.node.id)); renderCompare(); setHash(cmpHash()); };
      acts.append(x);
    }
    head.append(acts); th.append(head); hr.append(th);
  }
  table.append(Object.assign(el('thead'), {}));
  table.tHead.append(hr);
  const tb = el('tbody');
  let grp = null;
  for (const row of shown) {
    if (row.group !== grp) { grp = row.group; const g = el('tr', 'grp'); const gh = el('th', '', grp); gh.colSpan = sel.length + 1; g.append(gh); tb.append(g); }
    const tr = el('tr', row.same ? 'same' : 'diff');
    const rl = el('th', 'rl'); rl.scope = 'row'; rl.append(document.createTextNode(row.label));
    if (row.same) rl.append(el('span', 'same-tag', 'সব একই'));
    tr.append(rl);
    for (const v of row.cells) tr.append(cmpCell(row.type, v));
    tb.append(tr);
  }
  table.append(tb);
  if (!shown.length) body.append(el('p', 'cmp-empty', rows.length ? 'এই বিকল্পগুলো সব সারিতে হুবহু এক। "শুধু ফারাক"-এর টিক তুলে সব দেখো।' : 'এগুলোর পাশাপাশি রাখার মতো আর কোনো তথ্য এখনও নেই।'));
  else {
    body.append(table);
    const notes = AtlasCompare.notes(sel);
    if (notes.length) {
      const p = el('p', 'cmp-notes');
      p.append(el('strong', '', 'টীকা: '), document.createTextNode(notes.map((x) => x.name + ' — ' + x.text).join(' · ')));
      body.append(p);
    }
  }
  if (keep) { const t = [...cmpDlg.querySelectorAll('[data-cmp-focus]')].find((n) => n.dataset.cmpFocus === keep); if (t) t.focus(); }
}
$('#cmp-diff').onchange = () => renderCompare();
function setCmpMax(n) {
  cmp.max = Math.max(AtlasCompare.MIN, Math.min(AtlasCompare.ABS_MAX, n));
  store('ml-atlas-cmpmax', String(cmp.max));
  setCmpOrder(AtlasCompare.clampOrder(cmp.order, cmp.max));   // কমালে সবচেয়ে নতুন max টা থাকে
  renderCompare(); setHash(cmpHash());
}
$('#cmp-max-dec').onclick = () => setCmpMax(cmp.max - 1);
$('#cmp-max-inc').onclick = () => setCmpMax(cmp.max + 1);
$('#cmp-close').onclick = () => cmpDlg.close();
$('#cmp-link').onclick = () => copyText(location.href.split('#')[0] + cmpHash());
cmpDlg.addEventListener('click', (e) => { if (e.target === cmpDlg) cmpDlg.close(); });
cmpDlg.addEventListener('close', () => { if (location.hash.startsWith('#cmp=')) setHash(''); });

/* ---------- শুরু ---------- */
const ALIAS = cfg.aliases || {};
const resolveId = (id) => (byId.has(id) ? id : (ALIAS[id] && byId.has(ALIAS[id]) ? ALIAS[id] : id));
const root = build(data, tree, 0, []);
{
  let ids = [];
  const shared = location.hash.startsWith('#plan=');
  // আগের সেশনের বাছাই নিজে বসে না: আলাদা key-তে রেখে ওপরে "ফিরিয়ে আনো" বার দেখানো হয়
  try { const cur = JSON.parse(store('ml-atlas-plan') || '[]'); if (Array.isArray(cur) && cur.length) { store('ml-atlas-prev', JSON.stringify(cur)); store('ml-atlas-plan', '[]'); } } catch (e) { /* জমা ছাড়াই চলবে */ }
  try { const p = JSON.parse(store('ml-atlas-prev') || '[]'); if (Array.isArray(p)) prevIds = p.map(resolveId).filter((id) => byId.has(id)); } catch (e) { prevIds = []; }
  if (shared) ids = location.hash.slice(6).split(',').filter(Boolean).map(resolveId);
  setSelFrom(ids);
  refreshSel();
  if (shared && selected.size && window.innerWidth > 900) openPlan(true);
}
updateCount();
setView(location.hash === '#path' ? 'path' : (store('ml-atlas-view') === 'path' ? 'path' : 'tree'));
if (location.hash.startsWith('#cmp=')) openCompareFromHash();
else { const id = resolveId(decodeURIComponent(location.hash.slice(1))); if (id && byId.has(id)) openNode(id, { hash: false }); }
})();
