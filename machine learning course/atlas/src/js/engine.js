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
    function stepStat(sid) {
      const r = byId.get(sid); let n = 0;
      if (!r) return 0;
      (function rec(x) { if (selected.has(x.node.id) && SELECTABLE.has(x.node.kind) && !x.node.steps) n++; x.children.forEach(rec); })(r);
      return n;
    }
    function pending() {
      const steps = new Set(ordered().map((r) => stepOf(r)).filter(Boolean));
      const out = [];
      for (const r of records) {
        if (r.node.kind !== 'decision') continue;
        let a = r.parent;
        while (a && a.node.kind !== 'step' && !SELECTABLE.has(a.node.kind)) a = a.parent;   // info/decision পেরিয়ে
        if (!a) continue;
        const active = a.node.kind === 'step' ? steps.has(a) : selected.has(a.node.id);
        if (active && !r.children.some((c) => selected.has(c.node.id))) out.push(r);
      }
      return out;
    }
    function groups() {
      const g = new Map();
      for (const r of ordered()) { const st = stepOf(r); const key = st ? st.node.id : '_'; if (!g.has(key)) g.set(key, { step: st, items: [] }); g.get(key).items.push(r); }
      return [...g.values()];
    }
    function toolLine(n) {
      if (n.kind !== 'tool' || !n.tool) return '';
      const t = n.tool;
      return `${t.repo} · licence: ${t.license}${t.archived ? ' · ⚠ archived' : ''}`;
    }
    function markdown(dateStr) {
      const md = activeMode();
      const lines = ['# আমার পথ' + (md ? ': ' + short(md.node.name) : ''), '', `> ML Learning Atlas থেকে · ${dateStr} · ${selected.size}টা বাছাই`, ''];
      for (const g of groups()) {
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
    const plain = (dateStr) => markdown(dateStr).replace(/^#+ /gm, '').replace(/^> /gm, '');
    function json(createdIso) {
      return JSON.stringify({
        version: 1, source: 'ML Learning Atlas', created: createdIso,
        mode: (activeMode() || {}).node ? activeMode().node.id : null,
        items: ordered().map((r) => {
          const st = stepOf(r), n = r.node;
          return { id: n.id, name: n.name, kind: n.kind, step: st ? { id: st.node.id, name: st.node.name } : null, path: pathNames(r, st),
            tool: n.kind === 'tool' && n.tool ? { repo: n.tool.repo, license: n.tool.license, archived: !!n.tool.archived } : undefined };
        })
      }, null, 2);
    }
    /** বাছা পথ থেকে framework-নিরপেক্ষ pseudo-code। spec = data/pseudo.json।
     *  বিকল্পের লেখা তার সিদ্ধান্তের slot-এ বসে; অবাছা slot দেখায় ‹? …› চিহ্নে। */
    function pseudo(spec) {
      const mode = activeMode();
      if (!mode) return spec.noMode.join('\n');
      const tmpl = spec.templates[mode.node.id];
      if (!tmpl) return '# এই মোডের pseudo-code ছাঁচ নেই';
      const baseId = (id, table) => (!(id in table) && id.endsWith('-sc') && (id.slice(0, -3) in table) ? id.slice(0, -3) : id);
      const vals = {};
      const push = (slot, v) => { (vals[slot] = vals[slot] || []).push(...(Array.isArray(v) ? v : [v])); };
      for (const r of ordered()) {
        const p = r.parent;
        if (!p || p.node.kind !== 'decision') continue;
        const info = spec.slots[baseId(p.node.id, spec.slots)];
        const o = spec.options[baseId(r.node.id, spec.options)];
        if (o && typeof o === 'object' && !Array.isArray(o)) { for (const k of Object.keys(o)) push(k, o[k]); }
        else if (info) push(info.slot, o !== undefined ? o : short(r.node.name));
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
      return out.join('\n');
    }
    const link = (base) => base.split('#')[0] + '#plan=' + [...selected].join(',');
    return { set: selected, has: (id) => selected.has(id), size: () => selected.size, ids: () => [...selected], toggle, setFrom, clear, removeWithDesc,
      ancestors, stepOf, pathNames, ordered, activeMode, stepStat, pending, groups, toolLine, markdown, plain, json, link, pseudo };
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
