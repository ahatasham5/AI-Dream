/* পড়ে-শোনানোর যুক্তি (DOM-মুক্ত): কোন অংশ পড়া হবে, লেখা পরিষ্কার করা, বাংলা voice বাছা, লেখা ছোট টুকরোয় ভাঙা,
 * আর আগে-বানানো audio-ফাইলের নাম (key)। Node-এ test করা যায়; atlas/tools/segments.js এই ফাইলই ব্যবহার করে,
 * তাই পাতা আর audio-pack বানানোর script একই লেখা, একই key পায়: কোথাও নকল যুক্তি নেই।
 * key = লেখার (পরিষ্কার-করা-নয়, হুবহু) UTF-8 bytes-এর ওপর দুটো ভিন্ন seed-এর FNV-1a (৩২ বিট), ১৬ hex অক্ষর। */
const AtlasReader = (function () {
  'use strict';

  // শুধু বলার জন্য: চিহ্ন বাংলায় পড়ার মতো শব্দ। key এর ওপর নির্ভর করে না।
  const SAY = [['→', ', '], ['⇒', ', '], ['×', ' গুণ '], ['÷', ' ভাগ '], ['−', ' বিয়োগ '], ['≈', ' প্রায় '], ['≥', ' বড় বা সমান '],
    ['≤', ' ছোট বা সমান '], ['‖', ' '], ['²', ' বর্গ '], ['%', ' শতাংশ'], [' = ', ' সমান '], [' + ', ' যোগ ']];
  function clean(text) {
    let t = String(text || '').replace(/[`*_#]/g, ' ');
    for (const [a, b] of SAY) t = t.split(a).join(b);
    return t.replace(/\s+/g, ' ').replace(/\s+,/g, ',').trim();   // 'A → B' হয় 'A, B'
  }

  function fnv(bytes, seed) {
    let h = seed >>> 0;
    for (let i = 0; i < bytes.length; i++) { h ^= bytes[i]; h = Math.imul(h, 16777619) >>> 0; }
    return h.toString(16).padStart(8, '0');
  }
  function key(text) {
    const bytes = new TextEncoder().encode(String(text));
    return fnv(bytes, 0x811c9dc5) + fnv(bytes, 0x9747b28c);
  }

  /** node থেকে পড়ার অংশ, পড়ার ক্রমে। withStory = false হলে শুধু সংজ্ঞা। */
  function segments(node, withStory) {
    const out = [];
    const add = (id, label, text) => { const t = (text || '').trim(); if (t) out.push({ id, label, text: t, key: key(t), speech: clean(t) }); };
    add('def', 'সংজ্ঞা', node.definition);
    if (withStory !== false) {
      const s = node.story;
      if (s) { add('problem', 'সমস্যা', s.problem); add('idea', 'ধারণা', s.idea); }
      add('fact', 'একটু ভেবে দেখো', node.insight && node.insight.fact);
    }
    return out;
  }

  /** বাংলা voice: bn-BD আগে, তারপর bn-IN, তারপর অন্য bn-*; নেই হলে null (ইংরেজি voice-এ বাংলা পড়ানো হয় না) */
  function bengaliVoice(voices) {
    const list = (voices || []).filter((v) => /^bn([-_]|$)/i.test(v.lang || ''));
    const rank = (v) => (/^bn[-_]bd$/i.test(v.lang) ? 0 : /^bn[-_]in$/i.test(v.lang) ? 1 : 2);
    return list.slice().sort((a, b) => rank(a) - rank(b))[0] || null;
  }

  /** লম্বা লেখা বাক্যের সীমানায় ভেঙে max অক্ষরের মধ্যে টুকরো (কিছু engine লম্বা বাক্যে মাঝপথে থেমে যায়) */
  function chunks(text, max) {
    const lim = max || 200;
    const sentences = String(text).split(/(?<=[।.?!])\s+/).filter(Boolean);
    const out = [];
    let cur = '';
    const flush = () => { if (cur) { out.push(cur); cur = ''; } };
    for (const s of sentences) {
      if (s.length > lim) {                      // একটা বাক্যই বেশি লম্বা: শব্দের সীমানায় কাটা
        flush();
        let part = '';
        for (const w of s.split(' ')) { if ((part + ' ' + w).trim().length > lim) { out.push(part); part = w; } else part = (part + ' ' + w).trim(); }
        if (part) out.push(part);
      } else if ((cur + ' ' + s).trim().length > lim) { flush(); cur = s; }
      else cur = (cur + ' ' + s).trim();
    }
    flush();
    return out;
  }

  return { clean, key, segments, bengaliVoice, chunks, SAY };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = AtlasReader;
