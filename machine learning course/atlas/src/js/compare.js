/* তুলনা-যুক্তি (DOM-মুক্ত): একই parent-এর ভাই-শাখাগুলোর পাশাপাশি তুলনা। Node-এ test করা যায়।
 * records: engine-এর মতোই  { node, parent, children, order }
 * নিয়ম:
 *   ১. তুলনার যোগ্য ভাই (peer) = step নয়, stepref নয়, আর seq (ক্রমিক নম্বর) নেই।
 *      নম্বর-ওয়ালারা ক্রমিক অংশ, বিকল্প নয়; তাদের পাশাপাশি রাখা অর্থহীন।
 *   ২. একটা parent-এ কমপক্ষে ২টা peer থাকলে তবেই তুলনা দেওয়া হয়।
 *   ৩. কমপক্ষে ২টা; একসাথে সর্বোচ্চ max টা (শুরুর মান DEFAULT_MAX = ৪, ব্যবহারকারী ২..ABS_MAX = ৮ করতে পারে)।
 *      কোনগুলো হবে ব্যবহারকারী বাছে; ভরে গেলে নতুন বাছলে সবচেয়ে আগে বাছাটা সরে যায় (toggle)।
 *      তুলনা শুধু একই parent-এর ভেতরে।
 *   ৪. সারি node-এর যা আছে তা থেকেই তৈরি; সবার জন্য ফাঁকা সারি বাদ।
 *   ৫. "তথ্যের ভিত্তি" সারি নেই। "কোর্সে আছে" পাঠকের কাজের তথ্য নয়; শুধু আসল সূত্র/সতর্কতা শেষে টীকা (notes)।
 */
const AtlasCompare = (function () {
  'use strict';
  const DEFAULT_MAX = 4;
  const ABS_MAX = 8;
  const MIN = 2;
  const BASIS = { course: 'কোর্সে আছে', paper: 'paper থেকে মেলানো', experience: 'অভিজ্ঞতা-ভিত্তিক, নিয়ম নয়', 'tool-doc': 'tool-এর docs বা README থেকে' };
  const KIDS_SHOWN = 8;

  const isPeer = (r) => r.node.kind !== 'step' && r.node.kind !== 'stepref' && !r.node.seq;
  function groupOf(parentRec) {
    const kids = parentRec && parentRec.children ? parentRec.children.filter(isPeer) : [];
    return kids.length >= MIN ? kids : [];
  }
  // rec নিজে ও তার ভাইরা (নিজেসহ); যোগ্য না হলে []
  const peersOf = (rec) => (rec && rec.parent && isPeer(rec) ? groupOf(rec.parent) : []);

  // max-এর বেশি ভাই থাকলে বর্তমান node থেকে শুরু করে max টা (গাছের ক্রমে), নইলে সবাই
  function initialPick(list, currentId, max = DEFAULT_MAX) {
    if (list.length <= max) return list.slice();
    const i = Math.max(0, list.findIndex((r) => r.node.id === currentId));
    const take = new Set();
    for (let k = 0; k < max; k++) take.add(list[(i + k) % list.length]);
    return list.filter((r) => take.has(r));
  }
  // নির্বাচন বৈধ কি: ২..ABS_MAX, সবাই এক parent-এর peer, কেউ দুবার নয়
  function validSelection(recs) {
    if (!recs || recs.length < MIN || recs.length > ABS_MAX) return false;
    const p = recs[0].parent;
    if (!p) return false;
    const peers = groupOf(p);
    return recs.every((r) => r.parent === p && peers.includes(r)) && new Set(recs).size === recs.length;
  }

  /* বাছা-বদল (pure)। order: বাছার সময়ক্রমে id (পুরোনো আগে)। id বাছা থাকলে বাদ, নইলে যোগ।
   * ভরে গেলে (order.length > max) সবচেয়ে আগে বাছাটা সরে যায়, তাই ব্যবহারকারীকে আগে হাতে বাদ দিতে হয় না।
   * কমপক্ষে MIN টা থাকতেই হয়: তার নিচে নামানো যায় না (blocked: 'min')।
   * ফেরত: { order (নতুন তালিকা), dropped (সরে যাওয়া id | null), blocked ('min' | null) } */
  function toggle(order, id, max) {
    if (order.includes(id)) {
      if (order.length <= MIN) return { order: order.slice(), dropped: null, blocked: 'min' };
      return { order: order.filter((x) => x !== id), dropped: null, blocked: null };
    }
    const next = order.concat(id);
    const dropped = next.length > max ? next.shift() : null;
    return { order: next, dropped, blocked: null };
  }
  // max কমালে সবচেয়ে নতুন max টা থাকে
  const clampOrder = (order, max) => (order.length > max ? order.slice(order.length - max) : order.slice());

  const short = (name) => name.replace(/^[০-৯0-9]+\.\s*/, '').split(' — ')[0];
  const s = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
  const l = (v) => (Array.isArray(v) && v.length ? v.map(String) : null);

  // [গোষ্ঠী, key, লেবেল, ধরন(text|code|list|link|tag), (node, rec) => মান | null]
  const SPEC = [
    ['আসল কথা', 'def', 'সংজ্ঞা', 'text', (n) => s(n.definition)],
    ['আসল কথা', 'problem', 'কোন সমস্যা মেটায়', 'text', (n) => s(n.story && n.story.problem) || s(n.selection && n.selection.problem)],
    ['আসল কথা', 'idea', 'মূল ধারণা', 'text', (n) => s(n.story && n.story.idea)],
    ['বাছার কারণ', 'when', 'কখন বাছবে', 'text', (n) => s(n.when) || s(n.selection && n.selection.when)],
    ['বাছার কারণ', 'why', 'কেন বাছবে', 'text', (n) => s(n.why)],
    ['বাছার কারণ', 'cost', 'দাম / কখন এড়াবে', 'text', (n) => s(n.tradeoff) || s(n.selection && n.selection.avoid)],
    ['বাছার কারণ', 'vs', 'কিসের সঙ্গে তুলনা করবে', 'text', (n) => s(n.selection && n.selection.compare)],
    ['হিসাব', 'formula', 'সূত্র', 'code', (n) => s(n.mathDetail && n.mathDetail.formula)],
    ['হিসাব', 'meaning', 'চিহ্নের অর্থ', 'text', (n) => s(n.mathDetail && n.mathDetail.meaning)],
    ['হিসাব', 'example', 'ছোট হিসাব', 'text', (n) => s(n.mathDetail && n.mathDetail.example)],
    ['কীভাবে কাজ করে', 'train', 'কীভাবে শেখে', 'text', (n) => s(n.trainingDetail)],
    ['কীভাবে কাজ করে', 'usage', 'কোথায় কাজে লাগে', 'text', (n) => s(n.usageDetail && n.usageDetail.text)],
    ['কীভাবে কাজ করে', 'purpose', 'কোন প্রয়োজন মেটায়', 'text', (n) => s(n.settingPurpose)],
    ['tool-এর তথ্য', 'licence', 'licence', 'text', (n) => s(n.tool && n.tool.license)],
    ['tool-এর তথ্য', 'state', 'অবস্থা', 'text', (n) => (n.tool ? (n.tool.archived ? '⚠ archived: আর আপডেট নেই' : 'সক্রিয়' + (n.tool.pushed ? ' (শেষ push: ' + n.tool.pushed + ')' : '')) : null)],
    ['tool-এর তথ্য', 'supports', 'যা চলে', 'list', (n) => l(n.tool && n.tool.supports)],
    ['tool-এর তথ্য', 'repo', 'repo', 'link', (n) => s(n.tool && n.tool.repo)],
    ['গঠন', 'kids', 'ভেতরে কী আছে', 'list', (n, r) => {
      const names = (r && r.children ? r.children : []).map((c) => short(c.node.name));
      if (!names.length) return null;
      return names.length > KIDS_SHOWN ? names.slice(0, KIDS_SHOWN).concat('… আরও ' + (names.length - KIDS_SHOWN) + 'টা') : names;
    }],
    ['বাস্তবে', 'scn', 'বাস্তবে কী হয়', 'text', (n) => s(n.practice && n.practice.scenario)],
    ['বাস্তবে', 'typical', 'সাধারণত', 'list', (n) => l(n.practice && n.practice.typical)],
    ['বাস্তবে', 'pitfalls', 'সাধারণ ভুল', 'list', (n) => l(n.practice && n.practice.pitfalls)],
  ];

  /* তুলনার সারি। recs: নির্বাচিত record-এর তালিকা (ক্রম = কলামের ক্রম)।
   * প্রতিটা সারি { group, key, label, type, cells[recs-এর সমান], same }।
   * same = সব কলামে মান আছে আর সব হুবহু এক। কোনো কলামে না থাকলে "ফারাক" ধরা হয়। */
  function rows(recs) {
    const out = [];
    for (const [group, key, label, type, get] of SPEC) {
      const cells = recs.map((r) => get(r.node, r));
      if (cells.every((c) => c == null)) continue;
      const first = JSON.stringify(cells[0]);
      const same = cells.every((c) => c != null && JSON.stringify(c) === first);
      out.push({ group, key, label, type, cells, same });
    }
    return out;
  }

  /* টেবিলের শেষের টীকা: শুধু যেগুলোর আসল সূত্র বা সতর্কতা আছে (paper, tool-docs, "অভিজ্ঞতা-ভিত্তিক")।
   * "course" (কোর্সে আছে) এখানে আসে না: ওটা পাঠকের কাজের তথ্য নয়। */
  function notes(recs) {
    const out = [];
    for (const r of recs) {
      const b = r.node.basis;
      if (b && b !== 'course' && BASIS[b]) out.push({ id: r.node.id, name: short(r.node.name), text: BASIS[b] });
    }
    return out;
  }

  return { DEFAULT_MAX, ABS_MAX, MIN, BASIS, isPeer, groupOf, peersOf, initialPick, validSelection, toggle, clampOrder, rows, notes };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = AtlasCompare;
