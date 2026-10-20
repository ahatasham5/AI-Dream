/* বাছাই-যুক্তি (DOM-মুক্ত): "আমার পথ"-এর সব নিয়ম এখানে, যাতে Node-এ test করা যায়।
 * records: গাছের ক্রমে সব node-record  { node, parent, children, depth, order }
 * byId:    id → record
 * নিয়ম:
 *   ১. বাছা যায় kind = option | tool।
 *   ২. কিছু বাছলে তার বাছাইযোগ্য সব পূর্বপুরুষও বাছা হয় (বন্ধ-ওপরমুখী)।
 *   ৩. decision.pick = 'one' হলে ভাই-বোনের একটা বাছলে বাকিরা (সন্তানসহ) বাদ।
 *   ৪. কিছু বাদ দিলে তার নিচের সব বাছাইও বাদ।
 */
const AtlasEngine = (function () {
  'use strict';
  const SELECTABLE = new Set(['option', 'tool']);
  const GENERIC = new Set(['গঠন ও হিসাব', 'ধরন', 'সাধারণ গঠন', 'প্রচলিত অতিরিক্ত অংশ', 'প্রয়োজন অনুযায়ী সহায়ক অংশ', 'বিন্যাস অনুযায়ী']);
  const short = (name) => name.replace(/^[০-৯0-9]+\.\s*/, '').split(' — ')[0];

  function create(records, byId) {
    const selected = new Set();   // জীবন্ত Set: কখনো নতুন করে বসানো হয় না, শুধু বদলানো হয়

    const ancestors = (r) => { const out = []; for (let x = r; x; x = x.parent) if (SELECTABLE.has(x.node.kind)) out.push(x); return out; };
    function removeWithDesc(id) {
      const r = byId.get(id); if (!r) return;
      (function rec(x) { selected.delete(x.node.id); x.children.forEach(rec); })(r);
    }
    function enforceOne(x) {
      const p = x.parent;
      if (p && p.node.kind === 'decision' && p.node.pick === 'one') for (const sib of p.children) if (sib !== x && selected.has(sib.node.id)) removeWithDesc(sib.node.id);
    }
    /** @returns {{ok:boolean, on:boolean, record:object|null}} on = এখন বাছা অবস্থায় */
    function toggle(id) {
      const r = byId.get(id);
      if (!r || !SELECTABLE.has(r.node.kind)) return { ok: false, on: false, record: null };
      if (selected.has(id)) { removeWithDesc(id); return { ok: true, on: false, record: r }; }
      for (const x of ancestors(r).reverse()) { enforceOne(x); selected.add(x.node.id); }
      return { ok: true, on: true, record: r };
    }
    function setFrom(ids) {
      selected.clear();
      for (const id of ids) {
        const r = byId.get(id);
        if (r && SELECTABLE.has(r.node.kind)) for (const x of ancestors(r).reverse()) { enforceOne(x); selected.add(x.node.id); }
      }
    }
    const clear = () => selected.clear();
    const stepOf = (r) => { for (let x = r.parent; x; x = x.parent) if (x.node.kind === 'step') return x; return null; };
    const pathNames = (r, stop) => { const out = []; for (let x = r; x && x !== stop && (stop || x.depth > 1); x = x.parent) if (!GENERIC.has(x.node.name)) out.unshift(short(x.node.name)); return out; };
    const ordered = () => [...selected].map((id) => byId.get(id)).sort((a, b) => a.order - b.order);
    const activeMode = () => { for (const id of selected) { const r = byId.get(id); if (r && r.node.steps) return r; } return null; };
    /** স্বাধীন বাছাই: বাছা node, যার নিচে আর কিছু বাছা নেই। নিচের কিছু বাছলে ওপরের বিকল্প নিজে থেকে বাছা হয়
     *  (যেমন checkpoint বাছলে তার model-ধরনও), তাই ওপরেরটা আলাদা সিদ্ধান্ত নয়; সংখ্যা এভাবেই গোনা হয়। */
    function choiceIds() {
      const implied = new Set();
      for (const id of selected) for (let a = (byId.get(id) || {}).parent; a; a = a.parent) implied.add(a.node.id);
      return new Set([...selected].filter((id) => !implied.has(id)));
    }
    const choices = () => { const c = choiceIds(); return ordered().filter((r) => c.has(r.node.id)); };
    function stepStat(sid) {
      const r = byId.get(sid); let n = 0;
      if (!r) return 0;
      const c = choiceIds();
      (function rec(x) { if (c.has(x.node.id) && SELECTABLE.has(x.node.kind) && !x.node.steps) n++; x.children.forEach(rec); })(r);
      return n;
    }
    const needOf = (n) => (n.need === 'optional' ? 'optional' : 'required');
    /** সক্রিয় অথচ কিছু-না-বাছা decision (আবশ্যক ও ঐচ্ছিক দুটোই)।
     *  সক্রিয় = তার ধাপ steps-এ আছে, নয়তো তার বাছাইযোগ্য পূর্বপুরুষ বাছা। steps না দিলে বাছা node-গুলোর ধাপ। */
    function unfilled(steps) {
      const act = steps || new Set(ordered().map((r) => stepOf(r)).filter(Boolean));
      const out = [];
      for (const r of records) {
        if (r.node.kind !== 'decision') continue;
        let a = r.parent;
        while (a && a.node.kind !== 'step' && !SELECTABLE.has(a.node.kind)) a = a.parent;   // info/decision পেরিয়ে
        if (!a) continue;
        const active = a.node.kind === 'step' ? act.has(a) : selected.has(a.node.id);
        if (active && !r.children.some((c) => selected.has(c.node.id))) out.push(r);
      }
      return out;
    }
    const filled = (r) => r.children.some((c) => selected.has(c.node.id));
    /** বাকি আবশ্যক সিদ্ধান্ত। একই group-এর যেকোনো একটা পূরণ হলে পুরো group পূর্ণ; অপূর্ণ group-এ একটাই দেখায়।
     *  steps (ধাপ-record-এর Set) না দিলে শুধু যেসব ধাপে কিছু বাছা আছে। */
    function pending(steps) {
      const out = [], seenGroup = new Set();
      for (const r of unfilled(steps)) {
        if (needOf(r.node) !== 'required') continue;
        const g = r.node.group;
        if (g) {
          if (seenGroup.has(g) || records.some((x) => x.node.group === g && filled(x))) continue;
          seenGroup.add(g);
        }
        out.push(r);
      }
      return out;
    }
    /** চাইলে ঠিক করার মতো ঐচ্ছিক সিদ্ধান্ত (এখনো অবাছা)। */
    const optionalOpen = (steps) => unfilled(steps).filter((r) => needOf(r.node) === 'optional');
    /** বাছা পথের-ধরনের (মোডের) সব ধাপ, কিছু বাছা না থাকলেও: গাইডের জন্য। মোড না বাছলে null। */
    const modeSteps = () => { const m = activeMode(); return m ? new Set(m.node.steps.map((sid) => byId.get(sid)).filter(Boolean)) : null; };
    /** মোডের সব ধাপ জুড়ে বাকি আবশ্যক সিদ্ধান্ত, গাছের ক্রমে। শর্তসাপেক্ষ সিদ্ধান্ত (যেমন LoRA বাছলে তার সেটিং) তার parent বাছার পরই আসে, তাই সংখ্যা বাড়তে পারে। */
    const remaining = () => { const st = modeSteps(); return st ? pending(st) : []; };
    /** মোডের সব ধাপ জুড়ে এখনো অবাছা ঐচ্ছিক সিদ্ধান্ত। */
    const optionalRemaining = () => { const st = modeSteps(); return st ? optionalOpen(st) : []; };
    /** ধাপ-id → সেই ধাপে বাকি আবশ্যক সিদ্ধান্তের সংখ্যা (শুধু >০)। */
    function remainingByStep() {
      const out = new Map();
      for (const r of remaining()) { const st = stepOf(r); if (st) out.set(st.node.id, (out.get(st.node.id) || 0) + 1); }
      return out;
    }
    /** from (record বা null)-এর পরের প্রথম বাকি আবশ্যক সিদ্ধান্ত; শেষ ছাড়িয়ে গেলে প্রথমটায় ফেরে। কিছু না থাকলে null। */
    function nextRequired(from) {
      const list = remaining();
      if (!list.length) return null;
      return (from && list.find((r) => r.order > from.order)) || list[0];
    }
    /** না বাছলে যে বিকল্প ধরা হয় (data-র defaultOption), নইলে null। */
    const defaultOf = (r) => (r.node.defaultOption && r.children.find((c) => c.node.id === r.node.defaultOption)) || null;
    /** ধাপ ধরে বাছাই। onlyChoices হলে শুধু স্বাধীন বাছাই (ওপরের নিজে-আসা বিকল্প বাদ); নইলে সব বাছা node। */
    function groups(onlyChoices) {
      const g = new Map();
      for (const r of onlyChoices ? choices() : ordered()) { const st = stepOf(r); const key = st ? st.node.id : '_'; if (!g.has(key)) g.set(key, { step: st, items: [] }); g.get(key).items.push(r); }
      return [...g.values()];
    }
    function toolLine(n) {
      if (n.kind !== 'tool' || !n.tool) return '';
      const t = n.tool;
      return `${t.repo} · licence: ${t.license}${t.archived ? ' · ⚠ archived' : ''}`;
    }
    /** বাছার বিরোধ ও নির্ভরতা (data/rules.json)। বিশুদ্ধ: শুধু কোন id বাছা তা দেখে।
     *  @returns {{rule:string, kind:string, text:string, src:string, nodes:string[]}[]} */
    function issues(rules) {
      const out = [];
      const has = (id) => selected.has(id);
      for (const r of (rules && rules.rules) || []) {
        if (!r.if.every(has)) continue;
        if (r.kind === 'requires') {
          if (r.anyOf.some(has)) continue;
          out.push({ rule: r.id, kind: r.kind, text: r.text, src: r.src, nodes: r.if.slice() });
        } else {
          const hit = (r.with || []).filter(has);
          if (!hit.length) continue;
          out.push({ rule: r.id, kind: r.kind, text: r.text, src: r.src, nodes: r.if.concat(hit) });
        }
      }
      return out;
    }
    function markdown(dateStr, rules) {
      const md = activeMode();
      const lines = ['# আমার পথ' + (md ? ': ' + short(md.node.name) : ''), '', `> ML Learning Atlas থেকে · ${dateStr} · ${choiceIds().size}টা বাছাই`, ''];
      const iss = issues(rules);
      if (iss.length) { lines.push('## সতর্কতা ও বিরোধ'); for (const i of iss) lines.push(`- ${i.kind === 'conflict' ? '✗' : i.kind === 'requires' ? '!' : '⚠'} ${i.text} (${i.src})`); lines.push(''); }
      for (const g of groups(true)) {
        lines.push('## ' + (g.step ? g.step.node.name : 'পথের ধরন'));
        for (const r of g.items) {
          lines.push('- ' + pathNames(r, g.step).join(' › ') + (r.node.kind === 'tool' ? ' (tool)' : ''));
          const tl = toolLine(r.node); if (tl) lines.push('  - ' + tl);
          if (r.node.when) lines.push('  - কখন: ' + r.node.when);
          if (r.node.why) lines.push('  - কেন: ' + r.node.why);
          if (r.node.tradeoff) lines.push('  - দাম/সীমা: ' + r.node.tradeoff);
        }
        lines.push('');
      }
      return lines.join('\n');
    }
    const plain = (dateStr, rules) => markdown(dateStr, rules).replace(/^#+ /gm, '').replace(/^> /gm, '');
    function json(createdIso) {
      const ch = choiceIds();
      return JSON.stringify({
        version: 1, source: 'ML Learning Atlas', created: createdIso,
        mode: (activeMode() || {}).node ? activeMode().node.id : null,
        items: ordered().map((r) => {
          const st = stepOf(r), n = r.node;
          return { id: n.id, name: n.name, kind: n.kind, choice: ch.has(n.id), step: st ? { id: st.node.id, name: st.node.name } : null, path: pathNames(r, st),
            tool: n.kind === 'tool' && n.tool ? { repo: n.tool.repo, license: n.tool.license, archived: !!n.tool.archived } : undefined };
        })
      }, null, 2);
    }
    /** বাছা পথ থেকে framework-নিরপেক্ষ pseudo-code। spec = data/pseudo.json।
     *  বিকল্পের লেখা তার সিদ্ধান্তের slot-এ বসে; অবাছা slot দেখায় ‹? …› চিহ্নে। */
    function pseudo(spec, rules) {
      const mode = activeMode();
      if (!mode) return spec.noMode.join('\n');
      const tmpl = spec.templates[mode.node.id];
      if (!tmpl) return '# এই মোডের pseudo-code ছাঁচ নেই';
      const baseId = (id, table) => (!(id in table) && id.endsWith('-sc') && (id.slice(0, -3) in table) ? id.slice(0, -3) : id);
      const vals = {};
      const push = (slot, v) => { (vals[slot] = vals[slot] || []).push(...(Array.isArray(v) ? v : [v])); };
      // না-বাছা ঐচ্ছিক decision-এর defaultOption বাছার মতোই বসে, ‹সাধারণ মান› চিহ্নসহ। মোডের সব ধাপ সক্রিয় ধরা হয়।
      const defaults = unfilled(new Set(mode.node.steps.map((sid) => byId.get(sid)).filter(Boolean)))
        .filter((r) => needOf(r.node) === 'optional').map(defaultOf).filter(Boolean);
      const entries = ordered().map((r) => ({ r, def: false })).concat(defaults.map((r) => ({ r, def: true })));
      for (const { r, def } of entries) {
        const p = r.parent;
        if (!p || p.node.kind !== 'decision') continue;
        const mark = def ? ' ‹সাধারণ মান›' : '';
        const info = spec.slots[baseId(p.node.id, spec.slots)];
        const o = spec.options[baseId(r.node.id, spec.options)];
        if (o && typeof o === 'object' && !Array.isArray(o)) { for (const k of Object.keys(o)) push(k, o[k]); }   // (বহু-slot বিকল্পে default-চিহ্ন বসে না; এমন default রাখা হয়নি)
        else if (info) {
          // বিকল্পের ঠিক নিচে বাছা tool (যেমন CER/WER → jiwer) তার লেখার সঙ্গে জোড়া লাগে
          const tl = r.children.filter((c) => c.node.kind === 'tool' && selected.has(c.node.id)).map((c) => short(c.node.name));
          const suffix = (tl.length ? `   [tool: ${tl.join(', ')}]` : '') + mark;
          const base = o !== undefined ? o : short(r.node.name);
          if (Array.isArray(base)) push(info.slot, suffix ? base.slice(0, -1).concat(base[base.length - 1] + suffix) : base);
          else push(info.slot, base + suffix);
        }
      }
      const joinOf = (slot) => (spec.join && spec.join[slot]) || ', ';
      const out = [];
      for (const raw of tmpl) {
        let line = raw;
        const m = line.match(/^(\s*)([?!])(\w+)\s(.*)$/);
        if (m) {
          const has = !!vals[m[3]];
          if ((m[2] === '?') !== has) continue;
          line = m[1] + m[4];
        }
        const only = line.match(/^(\s*)\{\{(\w+)\}\}\s*$/);
        if (only && vals[only[2]] && vals[only[2]].length > 1 && !(spec.join && spec.join[only[2]])) {
          for (const t of vals[only[2]]) out.push(only[1] + t);
          continue;
        }
        out.push(line.replace(/\{\{(\w+)\}\}/g, (_, s) => (vals[s] ? vals[s].join(joinOf(s)) : `‹? ${(spec.labels && spec.labels[s]) || s}›`)));
      }
      const iss = issues(rules);
      if (iss.length) {
        const note = ['# সতর্কতা ও বিরোধ (বাছাইয়ে মিলছে না):'].concat(iss.map((i) => `#   ${i.kind === 'conflict' ? '✗' : i.kind === 'requires' ? '!' : '⚠'} ${i.text}`));
        const at = out.indexOf('');
        out.splice(at < 0 ? out.length : at, 0, ...note);
      }
      return out.join('\n');
    }
    const link = (base) => base.split('#')[0] + '#plan=' + [...selected].join(',');
    return { set: selected, has: (id) => selected.has(id), size: () => selected.size, count: () => choiceIds().size, choiceIds, choices, ids: () => [...selected], toggle, setFrom, clear, removeWithDesc,
      ancestors, stepOf, pathNames, ordered, activeMode, stepStat, pending, optionalOpen, modeSteps, remaining, optionalRemaining, remainingByStep, nextRequired, defaultOf, groups, toolLine, markdown, plain, json, link, pseudo, issues };
  }

  /** DOM ছাড়া গাছ থেকে records/byId বানায় (test-এর জন্য)। app.js নিজের record বানায়, একই আকারে। */
  function fromTree(root) {
    const records = [], byId = new Map();
    (function rec(node, parent, depth) {
      const r = { node, parent, children: [], depth, order: records.length };
      records.push(r); byId.set(node.id, r);
      if (parent) parent.children.push(r);
      (node.children || []).forEach((c) => rec(c, r, depth + 1));
    })(root, null, 0);
    return { records, byId };
  }
  return { create, fromTree, SELECTABLE, GENERIC, short };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = AtlasEngine;
