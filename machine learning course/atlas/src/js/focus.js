/* গাছে "একটা-একটা খোলা" ও পথ-চেনার যুক্তি (DOM-মুক্ত)। Node-এ test করা যায়।
 * records: engine-এর মতোই  { node, parent, children, depth }
 * নিয়ম:
 *   ১. accordion: একটা শাখা খুললে তার ভাইদের মধ্যে যেগুলো খোলা, সেগুলো গোটানো হয়। ভাইয়ের ভেতরের খোলা-বন্ধ অবস্থা ও বাছাই অক্ষত থাকে।
 *   ২. কোনো node-এ পৌঁছাতে (খোঁজা, "বাকি সিদ্ধান্ত", "ধাপে যাও") পথের প্রতিটা স্তরে একই নিয়ম: পথের ভাইরা গোটে, পথ খোলে।
 *   ৩. পথ (breadcrumb) = গাছের মূল থেকে ওই node পর্যন্ত, শুধু গঠনের জন্য বসানো নামগুলো ("গঠন ও হিসাব" ইত্যাদি) বাদে।
 *   ৪. গোটানো শাখার ভেতরে কয়টা বাছা আছে তা গোনা হয়, যাতে গুটোলেও বাছাই লুকিয়ে না যায়।
 *      গোনা হয় স্বাধীন বাছাই (engine.choiceIds): checkpoint বাছলে তার model-ধরনও নিজে বাছা হয়, কিন্তু তা আলাদা সিদ্ধান্ত নয়।
 */
const AtlasFocus = (function () {
  'use strict';
  const GENERIC = new Set(['গঠন ও হিসাব', 'ধরন', 'সাধারণ গঠন', 'প্রচলিত অতিরিক্ত অংশ', 'প্রয়োজন অনুযায়ী সহায়ক অংশ', 'বিন্যাস অনুযায়ী']);
  const short = (name) => name.replace(/^[০-৯0-9]+\.\s*/, '').split(' — ')[0];
  const isBranch = (r) => r.children.length > 0;

  /** r-এর ভাইদের মধ্যে যেগুলো এখন খোলা (isOpen(rec) → bool), সেগুলো। r নিজে নয়। */
  function siblingsToClose(r, isOpen) {
    if (!r.parent) return [];
    return r.parent.children.filter((s) => s !== r && isBranch(s) && isOpen(s));
  }

  /** r-এ পৌঁছানোর পথের প্রতিটা স্তরের জন্য: কোনগুলো গোটাতে হবে আর কোনগুলো খুলতে হবে।
   *  @returns {{close: object[], open: object[]}} open = মূল থেকে r-এর parent পর্যন্ত (ক্রমে) */
  function planReveal(r, isOpen) {
    const chain = [];
    for (let a = r.parent; a; a = a.parent) chain.unshift(a);
    const close = [];
    for (const x of chain.concat([r])) for (const s of siblingsToClose(x, isOpen)) if (!close.includes(s)) close.push(s);
    return { close, open: chain };
  }

  /** মূল থেকে r পর্যন্ত breadcrumb: [{id, name, rec}] (মূল বাদ; গঠন-নাম বাদ; r নিজে সবসময় থাকে)। */
  function crumbs(r) {
    const out = [];
    for (let x = r; x && x.depth > 0; x = x.parent) {
      if (x === r || !GENERIC.has(x.node.name)) out.unshift({ id: x.node.id, name: short(x.node.name), rec: x });
    }
    return out;
  }

  /** r-এর নিচে (নিজে বাদে) picked-এর সংখ্যা। picked = Set(id): সাধারণত plan.choiceIds()। */
  function pickedUnder(r, picked) {
    let n = 0;
    (function rec(x) { for (const c of x.children) { if (picked.has(c.node.id)) n++; rec(c); } })(r);
    return n;
  }

  /** সব record-এর জন্য একবারে (দ্রুত): id → নিচের বাছার সংখ্যা। শুধু যাদের >০। */
  function pickedCounts(records, byId, picked) {
    const counts = new Map();
    for (const id of picked) {
      const r = byId.get(id);
      for (let a = r && r.parent; a; a = a.parent) counts.set(a.node.id, (counts.get(a.node.id) || 0) + 1);
    }
    return counts;
  }

  return { GENERIC, siblingsToClose, planReveal, crumbs, pickedUnder, pickedCounts };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = AtlasFocus;
