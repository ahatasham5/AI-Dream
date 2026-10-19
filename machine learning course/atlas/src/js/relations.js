/* সম্পর্ক-যুক্তি (DOM-মুক্ত): node-এর মধ্যে "আগে লাগে" আর "তুলনা করো", আর তা থেকে পড়ার ক্রম। Node-এ test করা যায়।
 * edges: [{ from, to, type: 'needs' | 'contrasts', why }]
 *   needs:     from-কে বুঝতে আগে to লাগে (to হলো from-এর পূর্বশর্ত)।
 *   contrasts: দুটো পাশাপাশি রেখে তুলনা করার মতো; দুদিকেই কাজ করে।
 * পড়ার ক্রম path(id): id-র সব পূর্বশর্ত (পূর্বশর্তের পূর্বশর্তসহ), পূর্বশর্ত আগে। একই node দুবার নয়।
 * ক্রম নির্ধারিত: edges-এর লেখার ক্রমে যে পূর্বশর্ত আগে লেখা, সে আগে আসে। চক্র থাকলে path ফাঁকা নয়, cycle() তা বলে। */
const AtlasRelations = (function () {
  'use strict';
  const TYPES = { needs: 'আগে লাগে', contrasts: 'তুলনা করো' };

  function create(edges) {
    const needs = new Map();      // from -> [{ id, why }]
    const usedBy = new Map();     // to   -> [{ id, why }]
    const contrasts = new Map();  // id   -> [{ id, why }]
    const push = (m, k, v) => { if (!m.has(k)) m.set(k, []); m.get(k).push(v); };
    for (const e of edges || []) {
      if (e.type === 'needs') { push(needs, e.from, { id: e.to, why: e.why || '', basis: e.basis }); push(usedBy, e.to, { id: e.from, why: e.why || '', basis: e.basis }); }
      else if (e.type === 'contrasts') { push(contrasts, e.from, { id: e.to, why: e.why || '', basis: e.basis }); push(contrasts, e.to, { id: e.from, why: e.why || '', basis: e.basis }); }
    }
    const get = (m, id) => (m.get(id) || []).slice();

    /** চক্র থাকলে সেই চক্রের id-তালিকা (শুরু ও শেষ একই), নইলে null */
    function cycle() {
      const state = new Map();   // 1 = চলছে, 2 = শেষ
      const stack = [];
      const visit = (id) => {
        if (state.get(id) === 2) return null;
        if (state.get(id) === 1) return stack.slice(stack.indexOf(id)).concat(id);
        state.set(id, 1); stack.push(id);
        for (const n of get(needs, id)) { const c = visit(n.id); if (c) return c; }
        stack.pop(); state.set(id, 2);
        return null;
      };
      for (const id of needs.keys()) { const c = visit(id); if (c) return c; }
      return null;
    }

    /** id বুঝতে যা যা আগে পড়তে হবে, পড়ার ক্রমে (id নিজে বাদ) */
    function path(id) {
      const out = [], seen = new Set([id]);
      const visit = (x) => {
        for (const n of get(needs, x)) {
          if (seen.has(n.id)) continue;
          seen.add(n.id);
          visit(n.id);
          out.push(n.id);
        }
      };
      visit(id);
      return out;
    }

    return {
      needs: (id) => get(needs, id), usedBy: (id) => get(usedBy, id), contrasts: (id) => get(contrasts, id),
      path, cycle, hasAny: (id) => needs.has(id) || usedBy.has(id) || contrasts.has(id),
    };
  }
  return { TYPES, create };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = AtlasRelations;
