# Multi-LoRA Adapter Routing Architecture

<a id="index"></a>

## Index

<!-- tutorial-index:start -->
- [সংক্ষিপ্ত পরিচিতি](#section-1)
- [Core Concept](#section-2)
  - [Base Model কী?](#section-3)
  - [LoRA Adapter কী?](#section-4)
- [কেন Multi-LoRA Adapter Routing ব্যবহার করা হয়?](#section-5)
- [Architecture](#section-6)
- [গুরুত্বপূর্ণ ব্যাখ্যা](#section-7)
- [কখন Adapter আলাদা রাখা ভালো?](#section-8)
- [কখন LoRA Merge করা ভালো?](#section-9)
- [কখন Distillation ব্যবহার করা হয়?](#section-10)
- [Project Structure](#section-11)
- [Installation](#section-12)
  - [1. Virtual environment তৈরি করুন](#section-13)
  - [2. Dependencies install করুন](#section-14)
- [requirements.txt](#section-15)
- [.env.example](#section-16)
- [Adapter Registry](#section-17)
- [Simple Router / Classifier](#section-18)
- [Model Server](#section-19)
- [FastAPI App](#section-20)
- [Locally Run করা](#section-21)
- [API Test](#section-22)
  - [Bangla request](#section-23)
  - [Quran request](#section-24)
  - [Medical request](#section-25)
- [Dockerfile](#section-26)
- [Docker Image Build করা](#section-27)
- [Docker Container Run করা](#section-28)
- [Adapter Folder Example](#section-29)
- [কীভাবে আলাদা LoRA Adapter train করা উচিত?](#section-30)
- [Production Notes](#section-31)
  - [1. Adapter Versioning](#section-32)
  - [2. Adapter Status](#section-33)
  - [3. Router Improvement](#section-34)
  - [4. Safety](#section-35)
  - [5. Monitoring](#section-36)
  - [6. Fallback Adapter](#section-37)
  - [7. কখন Adapter Merge করবেন?](#section-38)
  - [8. কখন Distillation করবেন?](#section-39)
- [Summary](#section-40)
<!-- tutorial-index:end -->

---

<a id="section-1"></a>

## সংক্ষিপ্ত পরিচিতি

> 🎯 **এই section-এ বুঝব:** এই পুরো project আসলে কী বানায়, আর "এক base model + অনেক ছোট adapter + একজন রিসেপশনিস্ট (router)" — এই মূল ধারণাটা এক নজরে কেমন দেখতে।

### 🏥 আগে একটা গল্প

ভাবো একটা বড় হাসপাতাল। ভেতরে একজনই দারুণ **সাধারণ-শিক্ষিত ডাক্তার** আছেন — সব বিষয়ে মোটামুটি জানেন (এইটাই base model)। কিন্তু রোগী আসে নানা রকম: কেউ বাংলা চিঠি লিখতে চায়, কেউ কুরআন শিখতে চায়, কেউ জ্বরের চিকিৎসা চায়।

তুমি তো প্রতিটা বিষয়ের জন্য আলাদা আলাদা পুরো ডাক্তার ভাড়া করবে না! বদলে ওই একই ডাক্তারকে কয়েকটা **বিশেষ চশমা** দিয়ে দিলে — কুরআন-চশমা, মেডিকেল-চশমা, বাংলা-চশমা। যে বিষয়ে দরকার সেই চশমাটা পরালেই তিনি ওই বিষয়ে expert হয়ে যান (এইগুলোই LoRA adapter)।

আর দরজায় বসানো আছে একজন **রিসেপশনিস্ট** — রোগীর কথা শুনে ঠিক করে কোন চশমাটা পরাতে হবে (এইটাই router/classifier)। এই তিনটা জিনিস মিলেই পুরো architecture।

### কেন এভাবে?

কারণ প্রতিটা কাজের জন্য আলাদা পুরো model বানানো মানে প্রতিবার নতুন করে একজন সম্পূর্ণ ডাক্তার তৈরি করা — বিশাল খরচ, বিশাল জায়গা। এক ব্যক্তি + কয়েকটা ছোট চশমা অনেক সস্তা ও নমনীয়।

এই repository একটি **PEFT-based Multi-LoRA Adapter Routing** architecture-এর sample implementation।

মূল ধারণা:

```text
একটি Base Model
+
একাধিক LoRA Adapter
+
Router / Classifier
=
Domain অনুযায়ী dynamic model behavior
```

এই architecture-এ base model একবার load হয়। এরপর user input-এর topic/domain অনুযায়ী system সঠিক LoRA adapter select করে response generate করে।

উদাহরণ:

```text
Base Model
 ├── Bangla LoRA
 ├── Quran/Arabic LoRA
 └── Medical LoRA
```

User question যদি general বাংলা হয়, তাহলে Bangla LoRA ব্যবহার হবে।  
User question যদি Quran/Arabic learning নিয়ে হয়, তাহলে Quran LoRA ব্যবহার হবে।  
User question যদি medical topic নিয়ে হয়, তাহলে Medical LoRA ব্যবহার হবে।

> 🧠 **মনে রাখার ট্রিক:** এক ডাক্তার, অনেক চশমা, একজন রিসেপশনিস্ট। "Base + Adapter + Router" — এই তিন শব্দ মনে রাখলেই পুরো গল্প মনে পড়বে।

> ✅ **নিজেকে যাচাই করো:** এই system-এ base model কতবার memory-তে load হয়?
> <details><summary>উত্তর দেখো</summary>
> মাত্র একবার। ওই একই base model-এর উপর দরকারমতো আলাদা আলাদা LoRA adapter (চশমা) পরানো হয় — প্রতিবার নতুন ডাক্তার আনা হয় না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-2"></a>

## Core Concept

> 🎯 **এই section-এ বুঝব:** পুরো architecture-এর দুটো সবচেয়ে মৌলিক ইট — **Base Model** আর **LoRA Adapter** — আসলে কী, তা আলাদা করে বুঝব।

### 🧱 ছোট্ট কথা

বড় কিছু বোঝার আগে তার ছোট ইটগুলো চেনা দরকার। ঘর বানানোর আগে যেমন ইট আর সিমেন্ট চিনতে হয়, এখানেও আগে চিনব "base model" (মূল কাঠামো) আর "LoRA adapter" (ওপরে বসানো ছোট বিশেষত্ব)। নিচের দুটো subsection ঠিক এই কাজটাই করবে।

> 🧠 **মনে রাখার ট্রিক:** Base = কাঠামো, Adapter = ওপরে বসানো চশমা। পরের দুই page-এ এই দুটোই একটা একটা করে খুলে দেখব।

> ✅ **নিজেকে যাচাই করো:** "Core Concept" মানে এখানে কী শিখব?
> <details><summary>উত্তর দেখো</summary>
> দুটো মূল জিনিস — base model কী, আর LoRA adapter কী। বাকি সব এই দুটোর ওপর দাঁড়িয়ে আছে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

<a id="section-3"></a>

### Base Model কী?

> 🎯 **এই section-এ বুঝব:** base model বলতে ঠিক কী বোঝায়, আর কেন একে "সাধারণ-শিক্ষিত" বলা যায়।

### 🎓 আগে একটা গল্প

ভাবো একজন মানুষ স্কুল-কলেজ শেষ করেছে। সে পড়তে পারে, লিখতে পারে, যুক্তি সাজাতে পারে, একটু-আধটু সব বিষয়ই জানে — কিন্তু কোনো একটা বিষয়ে গভীর বিশেষজ্ঞ নয়। এই সাধারণ-শিক্ষিত মানুষটাই **base model**।

Qwen, Mistral, Llama — এগুলো সেই "সাধারণ-শিক্ষিত ব্যক্তি"। ভাষা বোঝা, বাক্য বানানো, reasoning — এই সাধারণ ক্ষমতাগুলো তাদের ভেতরে আগে থেকেই আছে।

### কেন এটা গুরুত্বপূর্ণ?

কারণ এই সাধারণ জ্ঞানটা তৈরি করতেই সবচেয়ে বেশি সময়, ডেটা আর টাকা লাগে। একবার তৈরি হয়ে গেলে আমরা সেটা বারবার ব্যবহার করি — শুধু ওপরে ছোট বিশেষত্ব (adapter) যোগ করি।

Base model হলো মূল pretrained language model। যেমন:

```text
Qwen/Qwen2.5-1.5B-Instruct
Mistral-7B
Llama
Gemma
Phi
```

Base model-এর ভিতরে আগে থেকেই language understanding, text generation ability, reasoning pattern, grammar, knowledge representation ইত্যাদি থাকে।

> 🧠 **মনে রাখার ট্রিক:** Base model = সাধারণ-শিক্ষিত মানুষ। সব বিষয়ে মোটামুটি, কোনো বিষয়ে গভীর নয় — গভীরত্বটা পরে চশমা (adapter) এনে দেয়।

> ✅ **নিজেকে যাচাই করো:** base model কি নিজে থেকেই মেডিকেল expert?
> <details><summary>উত্তর দেখো</summary>
> না। সে সাধারণ-শিক্ষিত — মেডিকেল প্রশ্নের মোটামুটি উত্তর দিতে পারে, কিন্তু গভীর expertise-এর জন্য মেডিকেল-চশমা (medical LoRA) পরাতে হয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-4"></a>

### LoRA Adapter কী?

> 🎯 **এই section-এ বুঝব:** LoRA adapter জিনিসটা কী, কেন এটা পুরো model নয়, আর `W + ΔW` এই সহজ অঙ্কটা কী বলছে।

### 👓 আগে একটা গল্প

আমাদের সাধারণ-শিক্ষিত মানুষটাকে মেডিকেল expert বানাতে হবে। দুটো উপায়:

১. তাকে আবার নতুন করে ১৮ বছর পড়াও (= full fine-tuning, পুরো মানুষ নতুন করে গড়া — খরচ বিশাল)।

২. তাকে একটা **মেডিকেল-চশমা** পরিয়ে দাও, যেটা শুধু মেডিকেল অংশটুকু ঠিকঠাক করে দেয় (= LoRA adapter, ছোট্ট একটা add-on)।

LoRA দ্বিতীয় পথটা নেয়। মূল মানুষটা (base weight `W`) অপরিবর্তিত থাকে; শুধু একটা ছোট "পরিবর্তন" (`ΔW`) শেখানো হয়। চশমা পরালে কার্যকর দৃষ্টি হয় `W + ΔW`।

### কেন এটা এত সস্তা?

চশমা পুরো মানুষের চেয়ে হাজার গুণ ছোট। তাই মেডিকেল LoRA file হয়তো কয়েক MB, অথচ পুরো model কয়েক GB। কম train করতে হয়, কম জায়গা লাগে, দ্রুত বানানো যায় — এটাই LoRA-র জাদু।

LoRA adapter হলো base model-এর উপর ছোট learned weight adjustment।

Full fine-tuning করলে base model-এর অনেক weight update হয়। কিন্তু LoRA-তে base model সাধারণত fixed থাকে, আর কিছু ছোট trainable matrix শেখে।

Mathematically:

```text
Base weight = W
LoRA learned change = ΔW

Effective weight = W + ΔW
```

যদি Bangla LoRA active থাকে:

```text
Effective model = Base Model + Bangla LoRA
```

যদি Quran LoRA active থাকে:

```text
Effective model = Base Model + Quran LoRA
```

যদি Medical LoRA active থাকে:

```text
Effective model = Base Model + Medical LoRA
```

LoRA adapter নিজে full model না। এটা base model-এর উপর ছোট domain-specific tuning।

> 🧠 **মনে রাখার ট্রিক:** LoRA = চশমা, model নয়। `W + ΔW` মানে "মূল মানুষ + ছোট চশমা"। চশমা খুলে নিলে আবার সেই সাধারণ মানুষ।

> ✅ **নিজেকে যাচাই করো:** একটা LoRA adapter file কি একা চালানো যায়?
> <details><summary>উত্তর দেখো</summary>
> না। চশমা একা চোখ নয় — তার নিচে একটা মানুষ (base model) লাগবেই। adapter সবসময় base model-এর উপর বসেই কাজ করে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-5"></a>

## কেন Multi-LoRA Adapter Routing ব্যবহার করা হয়?

> 🎯 **এই section-এ বুঝব:** কেন লোকে আলাদা আলাদা পুরো model না বানিয়ে এই "এক base + অনেক adapter" পথটা বেছে নেয়।

### 💰 আগে একটা গল্প

ভাবো তোমার একটা কোম্পানি আছে যেখানে ৬ ধরনের কাজ হয় — বাংলা সহায়তা, কুরআন শেখানো, মেডিকেল তথ্য ইত্যাদি। প্রতিটার জন্য আলাদা পুরো model মানে ৬ জন আলাদা সম্পূর্ণ কর্মচারী রাখা — প্রত্যেকের আলাদা বেতন, আলাদা জায়গা।

বদলে তুমি একজন দক্ষ কর্মচারী (base model) রাখলে আর তাকে ৬টা চশমা দিলে। যখন যেটা দরকার সেই চশমা পরিয়ে দাও। জায়গা আর খরচ — দুটোই নাটকীয়ভাবে কমে যায়।

### কেন storage/cost বাঁচে?

বড় base model হয়তো কয়েক GB, প্রতিটা adapter মাত্র কয়েক MB। ১টা base + ৬টা ছোট adapter জমা রাখা vs ৬টা আলাদা বড় model জমা রাখা — পার্থক্য বিশাল। তাই এই approach-কে বলা হয় **storage-efficient**।

এই architecture useful যখন একই base model দিয়ে বিভিন্ন domain/task handle করতে হয়।

Example use cases:

```text
General Bangla Assistant
Quran Learning Assistant
Arabic Vocabulary Assistant
Medical Information Assistant
Customer Support Assistant
Legal Document Assistant
```

প্রতিটা domain-এর জন্য আলাদা full model বানালে storage ও deployment cost বেড়ে যায়।

Multi-LoRA approach-এ:

```text
Base model = ১টা
Adapters = অনেকগুলো ছোট file
Router = কোন adapter use হবে তা ঠিক করে
```

> 🧠 **মনে রাখার ট্রিক:** "এক ডাক্তার, অনেক চশমা" — নতুন বিষয় মানে নতুন চশমা (ছোট), নতুন ডাক্তার (বড়) নয়।

> ✅ **নিজেকে যাচাই করো:** ১০টা domain থাকলে কি ১০টা full model লাগবে?
> <details><summary>উত্তর দেখো</summary>
> না। ১টা base model + ১০টা ছোট adapter হলেই চলে। এটাই storage আর deployment খরচ কমায়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-6"></a>

## Architecture

> 🎯 **এই section-এ বুঝব:** একটা user request ঢুকে বেরিয়ে আসা পর্যন্ত কোন পথে কোন অংশের হাত ঘুরে যায় — পুরো যাত্রাটা।

### 🚦 আগে একটা গল্প

ভাবো হাসপাতালে রোগী ঢুকল। প্রথমে **রিসেপশন ডেস্ক** (FastAPI) তাকে গ্রহণ করে। তারপর **রিসেপশনিস্ট** (router) তার সমস্যা শুনে ঠিক করে কোন চশমা লাগবে। **রেজিস্টার খাতা** (adapter registry) দেখে বলে দেয় সেই চশমা কোথায় রাখা। শেষে **ডাক্তার সেই চশমা পরে** (base model + selected LoRA) উত্তর দেন।

প্রতিটা তীর মানে এক হাত থেকে আরেক হাতে কাজ পার হওয়া — ঠিক নিচের ছবির মতো।

### কেন এই ধাপগুলো?

কারণ প্রতিটা অংশের একটাই কাজ (single responsibility)। রিসেপশনিস্ট শুধু সিদ্ধান্ত নেয়, ডাক্তার শুধু উত্তর দেন। এতে system পরিষ্কার থাকে, আর যেকোনো একটা অংশ আলাদা করে বদলানো সহজ হয়।

```text
User Request
   ↓
FastAPI Backend
   ↓
Router / Classifier
   ↓
Adapter Registry
   ↓
Base Model + Selected LoRA Adapter
   ↓
Response
```

> 🧠 **মনে রাখার ট্রিক:** পথটা মনে রাখো — **ডেস্ক → রিসেপশনিস্ট → খাতা → চশমা-পরা ডাক্তার → উত্তর**। উপর থেকে নিচে, একদম সোজা।

> ✅ **নিজেকে যাচাই করো:** router-এর কাজ কি নিজে উত্তর লেখা?
> <details><summary>উত্তর দেখো</summary>
> না। router শুধু ঠিক করে কোন adapter (চশমা) লাগবে। আসল উত্তর তৈরি করে base model + selected adapter।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-7"></a>

## গুরুত্বপূর্ণ ব্যাখ্যা

> 🎯 **এই section-এ বুঝব:** একটা খুব সাধারণ ভুল ধারণা ভাঙব — "তিনটা adapter মানে কি তিনটা আলাদা পুরো model?" উত্তর: না।

### 🤔 আগে একটা গল্প

নতুন শিক্ষার্থীরা প্রায়ই ভাবে: তিনটা চশমা মানে তিনজন আলাদা ডাক্তার। আসলে তা নয় — একজনই ডাক্তার, শুধু চশমাগুলো আলাদা। প্রয়োজনমতো তিনি একটা চশমা খুলে আরেকটা পরেন।

একইভাবে memory-তে base model একটাই থাকে। runtime-এ শুধু active adapter পাল্টায় — পুরো model তিনবার load হয় না।

### কেন এই ভুলটা হয়?

কারণ "Base + Bangla LoRA" লেখা দেখে মনে হয় যেন একটা সম্পূর্ণ নতুন model। বাস্তবে এটা কেবল ওই একই মানুষ + একটা চশমা। ভুল ধারণাটা তখনই সত্যি হয় যখন তুমি নিজে থেকে adapter **merge** করে আলাদা full model বানাও (পরে দেখব)।

এই setup-এ সাধারণত base model ৩ বার load হয় না।

ভুল ধারণা:

```text
Base + Bangla LoRA = ১টা full model
Base + Quran LoRA = ১টা full model
Base + Medical LoRA = ১টা full model
```

এটা তখনই হয় যখন প্রতিটা LoRA merge করে আলাদা full model বানানো হয়।

Adapter-based serving-এ structure এমন:

```text
১টা Base Model
+
Bangla LoRA file
+
Quran LoRA file
+
Medical LoRA file
```

Runtime-এ selected adapter active হয়।

> 🧠 **মনে রাখার ট্রিক:** "একজন ডাক্তার, চশমা পাল্টায়" — model একটাই memory-তে, শুধু active চশমা বদলায়।

> ✅ **নিজেকে যাচাই করো:** কখন সত্যিই আলাদা full model তৈরি হয়?
> <details><summary>উত্তর দেখো</summary>
> শুধু তখনই, যখন তুমি ইচ্ছা করে LoRA merge করে base-এর সাথে স্থায়ীভাবে বসিয়ে দাও। adapter-based serving-এ তা হয় না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-8"></a>

## কখন Adapter আলাদা রাখা ভালো?

> 🎯 **এই section-এ বুঝব:** কোন কোন পরিস্থিতিতে চশমাগুলো আলাদা করে রাখা (merge না করা) বুদ্ধিমানের কাজ।

### 🎒 আগে একটা গল্প

ভাবো তোমার ব্যাগে আলাদা আলাদা চশমা আছে। ভালো দিক: একটা চশমা নোংরা হলে শুধু সেটা মুছবে বা বদলাবে, বাকিগুলো অক্ষত। নতুন বিষয় এলে নতুন চশমা যোগ করবে, পুরো ব্যাগ ফেলে দিতে হবে না।

এই নমনীয়তাটাই adapter আলাদা রাখার সুবিধা — দ্রুত পরীক্ষা, সহজ rollback, কম জায়গা।

### কেন?

আলাদা রাখলে প্রতিটা adapter স্বাধীনভাবে update/rollback করা যায়, আর একটাই ছোট base ভাগ করে সবাই — তাই storage কম।

Adapters আলাদা রাখা ভালো যখন:

```text
- একই base model দিয়ে অনেক domain handle করতে হবে
- client-specific customization দরকার
- frequent update দরকার
- storage কম রাখতে হবে
- experiment দ্রুত করতে হবে
- rollback দরকার হতে পারে
```

> 🧠 **মনে রাখার ট্রিক:** অনেক domain + ঘন ঘন পরিবর্তন + rollback দরকার = চশমা আলাদা রাখো।

> ✅ **নিজেকে যাচাই করো:** একটা adapter খারাপ হলে আলাদা রাখলে সুবিধা কী?
> <details><summary>উত্তর দেখো</summary>
> শুধু ওই একটা adapter পুরনো version-এ ফেরানো (rollback) যায় — বাকি system-এ হাত দিতে হয় না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-9"></a>

## কখন LoRA Merge করা ভালো?

> 🎯 **এই section-এ বুঝব:** merge মানে কী, আর কোন অবস্থায় চশমাটা চোখে স্থায়ীভাবে বসিয়ে দেওয়াই ভালো।

### 🔩 আগে একটা গল্প

কখনো কখনো একটা চশমা এত ভালো আর এত বেশি ব্যবহার হয় যে বারবার পরা-খোলা বিরক্তিকর। তখন চোখের ডাক্তার সেটা **লেসিক সার্জারির মতো স্থায়ীভাবে চোখে বসিয়ে** দেন — আর খুলতে হয় না। এটাই **merge**: `Base + LoRA → এক নতুন full model`।

সুবিধা: চশমা পরানোর দেরিটুকু আর নেই, তাই একটু দ্রুত (কম latency), আর deployment সরল। অসুবিধা: এখন এটা স্থায়ী — খুলে অন্য চশমা পরানো যায় না, আর প্রতিটা merge আলাদা বড় model বানায়।

### কেন সবসময় merge নয়?

কারণ merge করলে নমনীয়তা হারায় আর অনেক domain থাকলে storage বেড়ে যায় (প্রতিটা merged model বড়)। তাই merge কেবল স্থিতিশীল, একক-domain, latency-সংবেদনশীল ক্ষেত্রেই মানানসই।

LoRA merge করা ভালো যখন:

```text
- একটাই stable production model দরকার
- adapter switching দরকার নেই
- latency কমাতে চান
- deployment simple রাখতে চান
```

Merge করলে:

```text
Base Model + LoRA Adapter → New Full Fine-tuned Model
```

তখন adapter আলাদা করে load করার দরকার নেই। কিন্তু অনেক domain থাকলে merged model অনেকগুলো হয়ে storage বাড়তে পারে।

> 🧠 **মনে রাখার ট্রিক:** Merge = চশমা চোখে স্থায়ীভাবে বসিয়ে দেওয়া। দ্রুত, কিন্তু আর খোলা যায় না।

> ✅ **নিজেকে যাচাই করো:** merge করলে কি adapter switching করা যায়?
> <details><summary>উত্তর দেখো</summary>
> না। merge স্থায়ী — চশমা এখন base-এর অংশ। switching দরকার হলে adapter আলাদা রাখতে হবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-10"></a>

## কখন Distillation ব্যবহার করা হয়?

> 🎯 **এই section-এ বুঝব:** distillation জিনিসটা কী, আর কেন একে "অভিজ্ঞ শিক্ষকের জ্ঞান ছোট ছাত্রকে শেখানো" বলা হয়।

### 👨‍🏫 আগে একটা গল্প

ভাবো একজন অভিজ্ঞ, দামি শিক্ষক (teacher) — বড় 7B model + অনেক চশমা। তাকে চব্বিশ ঘণ্টা রাখা ব্যয়বহুল। তাই তুমি একজন **ছোট, সস্তা ছাত্রকে** (student, ছোট 1.5B/3B model) ওই শিক্ষকের কাছে বসিয়ে সব শিখিয়ে নাও। শেখা শেষে শিক্ষককে বিদায় দিয়ে শুধু ছাত্রকেই কাজে রাখো।

এটাই **distillation** — বড় teacher-এর জ্ঞান ছোট student-এ চুইয়ে ঢালা।

### কেন?

Training-এর সময় teacher + student + data সব একসাথে থাকে বলে জায়গা বেশি লাগে। কিন্তু শেষে শুধু ছোট student রাখা হয় বলে deployment-এ inference খরচ ও জায়গা দুটোই কমে।

Distillation useful যখন complex teacher setup থেকে ছোট clean model বানাতে চান।

Example:

```text
Teacher:
Base 7B Model + Multiple LoRA Adapters

Student:
Small 1.5B / 3B model
```

Training phase-এ storage বেশি লাগতে পারে, কারণ teacher, student, data, checkpoints সব থাকে। কিন্তু final deployment-এ যদি শুধু student model রাখা হয়, তাহলে storage ও inference cost কমতে পারে।

> 🧠 **মনে রাখার ট্রিক:** Distillation = বড় শিক্ষক ছোট ছাত্রকে শেখায়; পরীক্ষার দিন শুধু ছাত্রই মাঠে নামে।

> ✅ **নিজেকে যাচাই করো:** distillation-এর পর deployment-এ কে থাকে?
> <details><summary>উত্তর দেখো</summary>
> শুধু ছোট student model। বড় teacher শুধু শেখানোর কাজে দরকার ছিল, তাই তাকে আর রাখতে হয় না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-11"></a>

# Project Structure

> 🎯 **এই section-এ বুঝব:** পুরো project-এর ফাইল-ফোল্ডার কীভাবে সাজানো, আর কোন ফাইল কার কাজ করে।

### 🗂️ আগে একটা গল্প

ভাবো একটা গোছানো অফিস। `app/` হলো কর্মীদের ঘর — ভেতরে রিসেপশনিস্ট (`router.py`), রেজিস্টার খাতা (`adapter_registry.py`), ডাক্তারের চেম্বার (`model_server.py`) আর সদর দরজা (`main.py`)। `adapters/` হলো চশমার আলমারি — প্রতিটা বিষয়ের চশমা আলাদা তাকে। বাকি ফাইলগুলো অফিসের নিয়মকানুন (requirements, Dockerfile, .env)।

### কেন এমন ভাগ?

প্রতিটা কাজ আলাদা ফাইলে থাকলে খুঁজে পাওয়া, বদলানো আর debug করা সহজ। এটাকে বলে separation of concerns — একেক ফাইল একেক দায়িত্ব।

```text
multi-lora-router/
│
├── app/
│   ├── main.py
│   ├── model_server.py
│   ├── router.py
│   └── adapter_registry.py
│
├── adapters/
│   ├── bangla/
│   ├── quran/
│   └── medical/
│
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

> 🧠 **মনে রাখার ট্রিক:** `app/` = কর্মীদের ঘর, `adapters/` = চশমার আলমারি। কোড খুঁজলে আগে ভাবো "এটা কার কাজ?"

> ✅ **নিজেকে যাচাই করো:** রিসেপশনিস্টের (router) কোড কোন ফাইলে?
> <details><summary>উত্তর দেখো</summary>
> `app/router.py`-তে। আর ডাক্তারের চেম্বার (model load ও generate) `app/model_server.py`-তে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-12"></a>

# Installation

> 🎯 **এই section-এ বুঝব:** কোড চালানোর আগে যে ঘর গোছানোর কাজ (setup) দরকার, সেটা কেন আর কীভাবে করব।

### 🧰 ছোট্ট কথা

রান্না শুরুর আগে যেমন উপকরণ আর বাসন গুছিয়ে নিতে হয়, তেমনি কোড চালানোর আগে একটা আলাদা কাজের জায়গা (virtual environment) আর দরকারি package গুছিয়ে নিতে হয়। পরের দুই ধাপে ঠিক এটাই করব।

> 🧠 **মনে রাখার ট্রিক:** Setup = রান্নার আগে বাজার করা। দুই ধাপ — আলাদা রান্নাঘর বানাও, তারপর উপকরণ আনো।

> ✅ **নিজেকে যাচাই করো:** Installation ধাপে মূলত কী দুটো কাজ করব?
> <details><summary>উত্তর দেখো</summary>
> (১) virtual environment তৈরি করা, (২) requirements.txt থেকে dependencies install করা।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

<a id="section-13"></a>

## 1. Virtual environment তৈরি করুন

> 🎯 **এই section-এ বুঝব:** virtual environment কী, আর কেন প্রতিটা project-এর জন্য আলাদা একটা বানানো ভালো।

### 🍱 আগে একটা গল্প

ভাবো প্রতিটা project-এর জন্য আলাদা একটা টিফিন বাক্স। এক বাক্সের খাবার (package) আরেক বাক্সে মেশে না — তাই এক project-এর version আরেকটার সাথে ঝগড়া করে না। `venv` ঠিক এই আলাদা বাক্সটাই বানায়।

### কেন?

সব project একই জায়গায় package রাখলে version conflict হয় (একজনের `torch` লাগে পুরনো, আরেকজনের নতুন)। আলাদা environment এই সমস্যা পুরো এড়িয়ে যায়।

```bash
python -m venv venv
```

Activate:

```bash
# Windows
venv\Scripts\activate
```

```bash
# Linux / macOS
source venv/bin/activate
```

> 🧠 **মনে রাখার ট্রিক:** venv = project-এর নিজস্ব টিফিন বাক্স। activate করা মানে "এই বাক্সটা এখন খোলা"।

> ✅ **নিজেকে যাচাই করো:** venv activate না করে install করলে সমস্যা কী?
> <details><summary>উত্তর দেখো</summary>
> তখন package গোটা সিস্টেমে global-ভাবে বসে, অন্য project-এর সাথে version conflict হতে পারে। তাই আগে activate করে নাও।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-14"></a>

## 2. Dependencies install করুন

> 🎯 **এই section-এ বুঝব:** এক command দিয়ে কীভাবে project-এর সব দরকারি package একসাথে আনা যায়।

### 🛒 আগে একটা গল্প

`requirements.txt` হলো তোমার বাজারের লিস্ট। `pip install -r requirements.txt` মানে দোকানদারকে পুরো লিস্ট ধরিয়ে দেওয়া — সে একে একে সব এনে দেয়। হাতে হাতে একটা একটা করে আনতে হয় না।

### কেন?

লিস্ট থাকলে যেকোনো মেশিনে হুবহু একই package আসে — team-এর সবার environment মিলে যায়।

```bash
pip install -r requirements.txt
```

> 🧠 **মনে রাখার ট্রিক:** `-r requirements.txt` = "পুরো বাজারের লিস্টটা একসাথে আনো"।

> ✅ **নিজেকে যাচাই করো:** নতুন কেউ project চালাতে চাইলে সবচেয়ে সহজ উপায় কী?
> <details><summary>উত্তর দেখো</summary>
> venv বানিয়ে activate করে `pip install -r requirements.txt` চালানো — এক লিস্ট থেকেই সব চলে আসে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-15"></a>

# requirements.txt

> 🎯 **এই section-এ বুঝব:** এই বাজারের লিস্টে কোন জিনিস কেন আছে — প্রতিটা package-এর ভূমিকা।

### 🧩 আগে একটা গল্প

এই লিস্টের প্রতিটা নাম একেকটা যন্ত্রাংশ: `fastapi`+`uvicorn` = সদর দরজা ও দারোয়ান (server), `torch`+`transformers` = ডাক্তারের মস্তিষ্ক (model চালানো), `peft` = চশমা পরানোর যন্ত্র (LoRA), `accelerate` = গতি বাড়ানোর সহকারী, `python-dotenv`+`pydantic` = নিয়ম আর সেটিংস পড়ার সহকারী।

### কেন আলাদা করে লেখা?

একটা ফাইলে লিখে রাখলে version আটকে রাখা যায় আর সবাই একই জিনিস পায় — কোন যাদু নেই, শুধু গোছানো তালিকা।

```txt
fastapi
uvicorn[standard]
torch
transformers
peft
accelerate
python-dotenv
pydantic
```

> 🧠 **মনে রাখার ট্রিক:** `peft` = LoRA চশমা পরানোর যন্ত্র। এই একটা লাইনই পুরো adapter জাদুর ভিত্তি।

> ✅ **নিজেকে যাচাই করো:** কোন package দিয়ে LoRA adapter load/switch করা হয়?
> <details><summary>উত্তর দেখো</summary>
> `peft` (Parameter-Efficient Fine-Tuning) — এটাই base model-এর উপর চশমা (adapter) বসায় ও পাল্টায়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-16"></a>

# .env.example

> 🎯 **এই section-এ বুঝব:** কোডের বাইরে আলাদা একটা সেটিংস ফাইলে (`.env`) কী রাখা হয়, আর কেন।

### ⚙️ আগে একটা গল্প

ভাবো একটা যন্ত্রের নব — কোন base model, কোন default চশমা, কোন device (CPU/GPU)। এগুলো কোডের ভেতরে হার্ডকোড না করে বাইরে একটা settings sheet-এ (`.env`) রাখা হয়, যেন কোড না ছুঁয়েও নব ঘোরানো যায়।

### কেন?

একই কোড আলাদা মেশিনে আলাদা সেটিংসে চালানো যায় — শুধু `.env` বদলাও। secret/config কোড থেকে আলাদা রাখা ভালো অভ্যাস।

```env
BASE_MODEL_NAME=Qwen/Qwen2.5-1.5B-Instruct
DEFAULT_ADAPTER=bangla
DEVICE=auto
```

> 🧠 **মনে রাখার ট্রিক:** `.env` = যন্ত্রের নব প্যানেল। কোড না বদলে শুধু নব ঘুরিয়ে base model বা default চশমা পাল্টাও।

> ✅ **নিজেকে যাচাই করো:** GPU না থাকলে `DEVICE=auto` কী করবে?
> <details><summary>উত্তর দেখো</summary>
> `auto` মানে system নিজেই বেছে নেবে — GPU থাকলে GPU, না থাকলে CPU। তোমাকে হাতে ঠিক করতে হয় না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-17"></a>

# Adapter Registry

> 🎯 **এই section-এ বুঝব:** "রেজিস্টার খাতা" (adapter registry) কী কাজ করে — কোন চশমা কোথায় আছে, কোনটা চালু, তার হিসাব রাখে।

### 📒 আগে একটা গল্প

হাসপাতালের রেজিস্টার খাতা ভাবো: প্রতিটা চশমার নাম, কোন বিষয়ের (domain), কোন তাকে রাখা (path), এখন ব্যবহারযোগ্য কিনা (status), আর ছোট বর্ণনা। রিসেপশনিস্ট চশমা চাইলে খাতা দেখে বলে দেয় সেটা কোথায় আর ব্যবহার করা যাবে কিনা।

`get_adapter()` ঠিক এই খাতা-দেখা কাজটাই করে — নাম দিলে তথ্য দেয়, আর status ঠিক না থাকলে (যেমন archived) বাধা দেয়।

### কেন দরকার?

কারণ কোন চশমা "production-ready" আর কোনটা এখনো "staging/experiment" — সেটা একজায়গায় লেখা থাকলে ভুল করে কাঁচা চশমা রোগীকে পরানো আটকানো যায়।

File: `app/adapter_registry.py`

```python
from dataclasses import dataclass


@dataclass
class AdapterInfo:
    name: str
    domain: str
    path: str
    status: str
    description: str


ADAPTER_REGISTRY = {
    "bangla": AdapterInfo(
        name="bangla",
        domain="general_bangla",
        path="./adapters/bangla",
        status="production",
        description="General Bangla assistant adapter"
    ),
    "quran": AdapterInfo(
        name="quran",
        domain="quran_arabic_learning",
        path="./adapters/quran",
        status="production",
        description="Quran, Arabic vocabulary, and Islamic learning adapter"
    ),
    "medical": AdapterInfo(
        name="medical",
        domain="medical_information",
        path="./adapters/medical",
        status="staging",
        description="Medical information adapter. Not for emergency diagnosis."
    ),
}


def get_adapter(adapter_name: str) -> AdapterInfo:
    adapter = ADAPTER_REGISTRY.get(adapter_name)

    if not adapter:
        raise ValueError(f"Adapter not found: {adapter_name}")

    if adapter.status not in ["production", "staging"]:
        raise ValueError(f"Adapter is not active: {adapter_name}")

    return adapter
```

> 🧠 **মনে রাখার ট্রিক:** Registry = চশমার রেজিস্টার খাতা। নাম → তথ্য + "চালু কিনা" যাচাই।

> ✅ **নিজেকে যাচাই করো:** কেউ `experiment` status-এর adapter চাইলে কী হবে?
> <details><summary>উত্তর দেখো</summary>
> `get_adapter()` error তুলবে — শুধু `production` বা `staging` চশমা serve করার অনুমতি আছে। এটা নিরাপত্তার জন্য।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-18"></a>

# Simple Router / Classifier

> 🎯 **এই section-এ বুঝব:** রিসেপশনিস্ট (router) কীভাবে প্রশ্ন পড়ে ঠিক করে কোন চশমা পরাতে হবে — আর এই সহজ version কীভাবে কাজ করে।

### 🛎️ আগে একটা গল্প

ভাবো রিসেপশনিস্ট রোগীর কথায় কিছু চেনা শব্দ খোঁজে — "কুরআন/সূরা/আয়াত" শুনলে কুরআন-চশমা, "জ্বর/ব্যথা/ডাক্তার" শুনলে মেডিকেল-চশমা। এই সহজ router ঠিক তাই করে: keyword মিলিয়ে চশমা বাছে (rule-based)।

### কেন এত সহজ রাখা?

কারণ শুরুতে বোঝার জন্য keyword-matching যথেষ্ট আর দ্রুত। পরে চাইলে এই অংশ smarter classifier/embedding/LLM দিয়ে বদলানো যায় — কিন্তু ধারণাটা একই: "প্রশ্ন পড়ে চশমা বাছা"।

File: `app/router.py`

এই sample router rule-based। Production system-এ চাইলে ছোট classifier model, embedding similarity, অথবা LLM-based router use করা যায়।

```python
def detect_adapter(user_input: str) -> str:
    """
    Simple rule-based adapter router.

    Production system-এ চাইলে এই অংশ replace করা যায়:
    - small text classifier
    - embedding similarity router
    - intent classification model
    - user-selected mode
    """

    text = user_input.lower()

    quran_keywords = [
        "quran", "কুরআন", "কোরআন", "সূরা", "সুরা",
        "আয়াত", "আয়াত", "তাফসির", "আরবি", "arabic"
    ]

    medical_keywords = [
        "জ্বর", "ব্যথা", "রোগ", "ডাক্তার", "medicine",
        "medical", "fever", "pain", "symptom", "treatment"
    ]

    bangla_keywords = [
        "বাংলা", "চিঠি", "লিখে", "ব্যাখ্যা", "অনুবাদ"
    ]

    if any(keyword in text for keyword in quran_keywords):
        return "quran"

    if any(keyword in text for keyword in medical_keywords):
        return "medical"

    if any(keyword in text for keyword in bangla_keywords):
        return "bangla"

    return "bangla"
```

> 🧠 **মনে রাখার ট্রিক:** Router = keyword শোনা রিসেপশনিস্ট। কিছু না মিললে সে নিরাপদে default "bangla" চশমা পরায়।

> ✅ **নিজেকে যাচাই করো:** প্রশ্নে কোনো keyword-ই না মিললে কোন adapter যায়?
> <details><summary>উত্তর দেখো</summary>
> শেষ লাইনের `return "bangla"` — অর্থাৎ default fallback হিসেবে bangla চশমা। কখনো "কোনো উত্তর নেই" হয় না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-19"></a>

# Model Server

> 🎯 **এই section-এ বুঝব:** ডাক্তারের চেম্বার (model server) কীভাবে base model একবার load করে, দরকারমতো চশমা পরায়, আর উত্তর তৈরি করে।

### 🩺 আগে একটা গল্প

এই class-টা হলো ডাক্তারের চেম্বার। `load_base_model()` = ডাক্তারকে একবার চেম্বারে বসানো (base model একবারই load)। `load_adapter_if_needed()` = নতুন চশমা লাগলে আলমারি থেকে বের করা (আগে বের করা থাকলে আবার নয়)। `set_active_adapter()` = এখন কোন চশমা পরা থাকবে ঠিক করা। `generate()` = রোগীর প্রশ্ন শুনে চশমা পরে উত্তর দেওয়া।

### কেন base একবার load?

কারণ ডাক্তারকে বারবার নতুন করে আনা মানে বিশাল সময় ও memory নষ্ট। একবার বসিয়ে দিয়ে শুধু চশমা পাল্টানোই দ্রুত ও সস্তা — এটাই পুরো architecture-এর মূল সাশ্রয়।

File: `app/model_server.py`

```python
import os
import torch
from dotenv import load_dotenv
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

from app.adapter_registry import get_adapter

load_dotenv()


class MultiLoRAModelServer:
    def __init__(self):
        self.base_model_name = os.getenv(
            "BASE_MODEL_NAME",
            "Qwen/Qwen2.5-1.5B-Instruct"
        )

        self.default_adapter = os.getenv("DEFAULT_ADAPTER", "bangla")

        self.tokenizer = None
        self.model = None
        self.loaded_adapters = set()
        self.active_adapter = None

    def load_base_model(self):
        """
        Base model একবার load করা হয়।
        """

        self.tokenizer = AutoTokenizer.from_pretrained(
            self.base_model_name,
            trust_remote_code=True
        )

        base_model = AutoModelForCausalLM.from_pretrained(
            self.base_model_name,
            dtype=torch.float16 if torch.cuda.is_available() else torch.float32,  # নতুন transformers-এ torch_dtype deprecated
            device_map="auto",
            trust_remote_code=True
        )

        default_adapter_info = get_adapter(self.default_adapter)

        self.model = PeftModel.from_pretrained(
            base_model,
            default_adapter_info.path,
            adapter_name=self.default_adapter
        )

        self.loaded_adapters.add(self.default_adapter)
        self.active_adapter = self.default_adapter
        self.model.eval()

    def load_adapter_if_needed(self, adapter_name: str):
        """
        Adapter আগে load না থাকলে load করা হয়।
        """

        if adapter_name in self.loaded_adapters:
            return

        adapter_info = get_adapter(adapter_name)

        self.model.load_adapter(
            adapter_info.path,
            adapter_name=adapter_name
        )

        self.loaded_adapters.add(adapter_name)

    def set_active_adapter(self, adapter_name: str):
        """
        Active LoRA adapter switch করা হয়।
        """

        self.load_adapter_if_needed(adapter_name)
        self.model.set_adapter(adapter_name)
        self.active_adapter = adapter_name

    def generate(self, prompt: str, adapter_name: str, max_new_tokens: int = 256):
        """
        Selected adapter ব্যবহার করে response generate করা হয়।
        """

        self.set_active_adapter(adapter_name)

        messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant. Answer clearly and safely."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

        if hasattr(self.tokenizer, "apply_chat_template"):
            input_text = self.tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True
            )
        else:
            input_text = prompt

        inputs = self.tokenizer(
            input_text,
            return_tensors="pt"
        ).to(self.model.device)

        with torch.no_grad():
            output = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=True,
                temperature=0.7,
                top_p=0.9
            )

        # শুধু নতুন generate হওয়া token decode করি; নাহলে response-এ
        # পুরো prompt + answer একসাথে চলে আসবে।
        gen_tokens = output[0][inputs["input_ids"].shape[1]:]
        generated_text = self.tokenizer.decode(
            gen_tokens,
            skip_special_tokens=True
        )

        return {
            "adapter_used": adapter_name,
            "response": generated_text
        }


model_server = MultiLoRAModelServer()
```

> 🧠 **মনে রাখার ট্রিক:** load base একবার → দরকারে চশমা আনো → active চশমা সেট করো → generate। ডাক্তার একজন, চশমা পাল্টায়।

> ✅ **নিজেকে যাচাই করো:** একই adapter দ্বিতীয়বার চাইলে কি আবার load হয়?
> <details><summary>উত্তর দেখো</summary>
> না। `load_adapter_if_needed()` আগে দেখে adapter-টা `loaded_adapters`-এ আছে কিনা; থাকলে সরাসরি ফিরে যায়, আবার load করে না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-20"></a>

# FastAPI App

> 🎯 **এই section-এ বুঝব:** সদর দরজা (FastAPI) কীভাবে বাইরের request নেয়, router-কে ডাকে, আর উত্তর ফেরত দেয়।

### 🚪 আগে একটা গল্প

এটা হাসপাতালের সদর দরজা ও রিসেপশন ডেস্ক। server চালু হওয়ার সময় (`lifespan`) ডাক্তারকে একবার চেম্বারে বসানো হয় (base model load)। `/generate` endpoint-এ রোগীর প্রশ্ন এলে: user নিজে চশমা বেছে না দিলে router বেছে দেয়, তারপর model_server উত্তর তৈরি করে। `/health` দিয়ে দেখা যায় সব ঠিক আছে কিনা।

### কেন startup-এ model load?

কারণ প্রথম রোগী আসার আগেই ডাক্তার বসে থাকলে সে সঙ্গে সঙ্গে উত্তর দিতে পারে — প্রতিটা request-এ নতুন করে ডাক্তার আনতে হয় না।

File: `app/main.py`

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.router import detect_adapter
from app.model_server import model_server


class GenerateRequest(BaseModel):
    prompt: str
    adapter: str | None = None
    max_new_tokens: int = 256


class GenerateResponse(BaseModel):
    adapter_used: str
    response: str


# পুরনো @app.on_event("startup") deprecated; আধুনিক lifespan ব্যবহার করি।
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    model_server.load_base_model()
    yield


app = FastAPI(
    title="Multi-LoRA Adapter Routing API",
    description="Base model + multiple LoRA adapters + router/classifier",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/")
def root():
    return {
        "message": "Multi-LoRA Adapter Routing API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "active_adapter": model_server.active_adapter,
        "loaded_adapters": list(model_server.loaded_adapters)
    }


@app.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):
    try:
        adapter_name = request.adapter or detect_adapter(request.prompt)

        result = model_server.generate(
            prompt=request.prompt,
            adapter_name=adapter_name,
            max_new_tokens=request.max_new_tokens
        )

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
```

> 🧠 **মনে রাখার ট্রিক:** সদর দরজা → (user চশমা দিলে সেটা, নাহলে router) → চেম্বার → উত্তর। startup-এ ডাক্তার একবার বসে।

> ✅ **নিজেকে যাচাই করো:** request-এ `adapter` না দিলে কে চশমা বাছে?
> <details><summary>উত্তর দেখো</summary>
> `request.adapter or detect_adapter(request.prompt)` — অর্থাৎ user না দিলে router (`detect_adapter`) প্রশ্ন পড়ে চশমা বেছে নেয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-21"></a>

# Locally Run করা

> 🎯 **এই section-এ বুঝব:** নিজের মেশিনে server চালু করে browser-এ কীভাবে test করা যায়।

### ▶️ আগে একটা গল্প

এতক্ষণ হাসপাতাল বানালাম; এবার দরজা খুলে চালু করি। `uvicorn` হলো সেই সুইচ যা server চালু করে। `/docs`-এ গেলে FastAPI নিজেই একটা সুন্দর test-পাতা বানিয়ে দেয় — code না লিখেই বোতাম টিপে প্রশ্ন পাঠানো যায়।

### কেন `/docs`?

কারণ এটা স্বয়ংক্রিয় interactive documentation — নতুনদের জন্য API চেষ্টা করে দেখার সবচেয়ে সহজ জায়গা।

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Open:

```text
http://localhost:8000/docs
```

> 🧠 **মনে রাখার ট্রিক:** `uvicorn` = চালু সুইচ, `/docs` = রেডিমেড test-পাতা।

> ✅ **নিজেকে যাচাই করো:** কোনো curl কমান্ড না লিখেও API test করতে চাইলে কোথায় যাবে?
> <details><summary>উত্তর দেখো</summary>
> browser-এ `http://localhost:8000/docs`-এ — সেখানে বোতাম টিপেই request পাঠানো যায়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-22"></a>

# API Test

> 🎯 **এই section-এ বুঝব:** router সত্যিই ঠিক চশমা বাছছে কিনা — তিন ধরনের প্রশ্ন পাঠিয়ে সেটা যাচাই করব।

### 🧪 ছোট্ট কথা

হাসপাতাল চালু হলো; এবার তিনজন আলাদা রোগী পাঠিয়ে দেখি রিসেপশনিস্ট সবাইকে ঠিক চশমার কাছে পাঠায় কিনা — একজন বাংলা, একজন কুরআন, একজন মেডিকেল। নিচের তিন test ঠিক এটাই করে।

> 🧠 **মনে রাখার ট্রিক:** তিন রোগী = তিন চশমার পরীক্ষা। প্রশ্ন পাল্টালে expected adapter পাল্টায় কিনা দেখো।

> ✅ **নিজেকে যাচাই করো:** এই test-গুলো আসলে কী যাচাই করছে?
> <details><summary>উত্তর দেখো</summary>
> router প্রশ্ন পড়ে সঠিক adapter (bangla/quran/medical) বাছছে কিনা, আর সেই চশমা দিয়ে উত্তর আসছে কিনা।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

<a id="section-23"></a>

## Bangla request

> 🎯 **এই section-এ বুঝব:** সাধারণ বাংলা প্রশ্ন পাঠালে router bangla চশমা বাছে — সেটা দেখব।

### 🇧🇩 ছোট্ট কথা

এখানে প্রশ্নে কোনো কুরআন বা মেডিকেল keyword নেই, তাই রিসেপশনিস্ট নিরাপদে default bangla চশমা পরায়।

```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "বাংলায় MLOps কী বুঝিয়ে বলো",
    "max_new_tokens": 200
  }'
```

Expected adapter:

```text
bangla
```

> 🧠 **মনে রাখার ট্রিক:** কোনো বিশেষ keyword নেই = default bangla চশমা।

> ✅ **নিজেকে যাচাই করো:** এই প্রশ্নে bangla adapter কেন এলো?
> <details><summary>উত্তর দেখো</summary>
> প্রশ্নে quran বা medical keyword নেই, তাই router fallback হিসেবে bangla বেছেছে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-24"></a>

## Quran request

> 🎯 **এই section-এ বুঝব:** প্রশ্নে "সূরা" থাকায় router কেন quran চশমা বাছে।

### 🕌 ছোট্ট কথা

"সূরা ফাতিহা" শব্দটা router-এর quran keyword তালিকায় আছে, তাই রিসেপশনিস্ট সঙ্গে সঙ্গে কুরআন-চশমা পরায়।

```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "সূরা ফাতিহার শব্দার্থ বাংলায় শেখাও",
    "max_new_tokens": 200
  }'
```

Expected adapter:

```text
quran
```

> 🧠 **মনে রাখার ট্রিক:** "সূরা/আয়াত/আরবি" শোনা মাত্রই কুরআন-চশমা।

> ✅ **নিজেকে যাচাই করো:** router কীভাবে বুঝল এটা quran প্রশ্ন?
> <details><summary>উত্তর দেখো</summary>
> প্রশ্নের "সূরা" শব্দটা `quran_keywords` তালিকায় মিলেছে, তাই quran adapter বাছা হয়েছে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-25"></a>

## Medical request

> 🎯 **এই section-এ বুঝব:** "জ্বর" শব্দ দেখে router কেন medical চশমা বাছে।

### 🌡️ ছোট্ট কথা

"জ্বর" শব্দটা medical keyword, তাই রিসেপশনিস্ট মেডিকেল-চশমা পরায়। মনে রেখো, এই adapter-এর status `staging` — তাই সতর্কতা/disclaimer জরুরি (safety section-এ আসছে)।

```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "জ্বর হলে কী কী লক্ষণ দেখা যায়?",
    "max_new_tokens": 200
  }'
```

Expected adapter:

```text
medical
```

> 🧠 **মনে রাখার ট্রিক:** "জ্বর/ব্যথা/ডাক্তার" = মেডিকেল-চশমা — কিন্তু disclaimer ছাড়া নয়।

> ✅ **নিজেকে যাচাই করো:** medical adapter serve করা গেল কেন, যদিও এটা `staging`?
> <details><summary>উত্তর দেখো</summary>
> registry-তে `production` আর `staging` — দুটোই allowed। তবে medical-এর মতো সংবেদনশীল ক্ষেত্রে disclaimer যোগ করা উচিত।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-26"></a>

# Dockerfile

> 🎯 **এই section-এ বুঝব:** পুরো app-টাকে "রান্নাঘরসহ বাক্সে" প্যাক করার রেসিপি (Dockerfile) কীভাবে কাজ করে।

### 📦 আগে একটা গল্প

মনে আছে Docker-এর সেই কথা — "শুধু কেক নয়, পুরো রান্নাঘরটাই বাক্সে ভরে পাঠাও"? Dockerfile হলো সেই বাক্স বানানোর ধাপে ধাপে রেসিপি: কোন Python নেবে, লিস্ট থেকে package আনবে, কোড কপি করবে, কোন দরজা (port) খোলা রাখবে, আর চালু হলে কী command চালাবে।

### কেন?

এই রেসিপি থাকলে যেকোনো মেশিনে হুবহু একই environment তৈরি হয় — "আমার মেশিনে তো চলছিল" সমস্যা আর হয় না।

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

> 🧠 **মনে রাখার ট্রিক:** Dockerfile = রান্নাঘরসহ বাক্স বানানোর রেসিপি। FROM → COPY → RUN → EXPOSE → CMD, ওপর থেকে নিচে।

> ✅ **নিজেকে যাচাই করো:** container চালু হলে সবার আগে কোন command চলে?
> <details><summary>উত্তর দেখো</summary>
> শেষ লাইনের `CMD` — অর্থাৎ uvicorn দিয়ে FastAPI server চালু হয়, ঠিক locally চালানোর মতোই।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-27"></a>

# Docker Image Build করা

> 🎯 **এই section-এ বুঝব:** রেসিপি (Dockerfile) থেকে আসল বাক্স (image) কীভাবে তৈরি করা হয়।

### 🏗️ আগে একটা গল্প

রেসিপি লেখা আর কেক বানানো এক নয়। `docker build` হলো রেসিপি ধরে সত্যিকারের বাক্সটা (image) বানানো। `-t multi-lora-router` মানে বাক্সের গায়ে একটা নাম-লেবেল সাঁটা, যেন পরে সহজে চেনা যায়।

### কেন লেবেল?

নাম না দিলে পরে কোন বাক্স চালাবে বুঝবে কীভাবে? tag/নাম বাক্স খুঁজে পেতে সাহায্য করে।

```bash
docker build -t multi-lora-router .
```

> 🧠 **মনে রাখার ট্রিক:** build = রেসিপি → বাক্স। `-t নাম` = বাক্সের গায়ে লেবেল।

> ✅ **নিজেকে যাচাই করো:** শেষের `.` (ডট) কী বোঝায়?
> <details><summary>উত্তর দেখো</summary>
> build context — অর্থাৎ বর্তমান ফোল্ডারটাই, যেখান থেকে Dockerfile ও কোড নিয়ে বাক্স বানানো হবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-28"></a>

# Docker Container Run করা

> 🎯 **এই section-এ বুঝব:** তৈরি বাক্স (image) থেকে চলন্ত app (container) কীভাবে চালু করা হয়।

### 🚀 আগে একটা গল্প

বাক্স (image) হলো বন্ধ প্যাকেট; `docker run` মানে প্যাকেট খুলে ভেতরের app চালু করা (container)। `-p 8000:8000` = বাক্সের ভেতরের ৮০০০ দরজা তোমার মেশিনের ৮০০০ দরজার সাথে জুড়ে দেওয়া, যেন browser পৌঁছাতে পারে। `--env-file .env` = আগে বানানো নব-প্যানেলটা ভেতরে ঢুকিয়ে দেওয়া।

### কেন port map?

বাক্সের ভেতরের দরজা বাইরে থেকে বন্ধ থাকে; map না করলে browser ভেতরের server-কে খুঁজে পাবে না।

```bash
docker run -p 8000:8000 --env-file .env multi-lora-router
```

Open:

```text
http://localhost:8000/docs
```

> 🧠 **মনে রাখার ট্রিক:** run = বাক্স খুলে চালু। `-p বাইরের:ভেতরের` দরজা জোড়া, `--env-file` নব-প্যানেল ঢোকানো।

> ✅ **নিজেকে যাচাই করো:** `-p 8000:8000` না দিলে কী হবে?
> <details><summary>উত্তর দেখো</summary>
> container ভেতরে চললেও বাইরের দরজা map হবে না, তাই browser-এ `localhost:8000` কাজ করবে না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-29"></a>

# Adapter Folder Example

> 🎯 **এই section-এ বুঝব:** একটা adapter (চশমা) ফোল্ডারের ভেতরে আসলে কী কী ফাইল থাকে।

### 🗃️ আগে একটা গল্প

প্রতিটা চশমার বাক্সে দুটো জিনিস: একটা নির্দেশিকা (`adapter_config.json` — চশমাটা কেমন, কোন base-এর জন্য) আর আসল কাচ (`adapter_model.safetensors` — শেখা `ΔW` ওজন)। এই দুটো থাকলেই peft চশমাটা পরাতে পারে।

### কেন এত ছোট?

মনে আছে — adapter পুরো model নয়, শুধু ছোট `ΔW`? তাই এই ফাইলগুলো base model-এর তুলনায় কয়েকশো গুণ ছোট।

```text
adapters/
├── bangla/
│   ├── adapter_config.json
│   └── adapter_model.safetensors
│
├── quran/
│   ├── adapter_config.json
│   └── adapter_model.safetensors
│
└── medical/
    ├── adapter_config.json
    └── adapter_model.safetensors
```

প্রতিটা adapter folder-এ trained LoRA adapter files থাকতে হবে।

> 🧠 **মনে রাখার ট্রিক:** এক চশমা = config (নির্দেশিকা) + safetensors (আসল কাচ/ওজন)।

> ✅ **নিজেকে যাচাই করো:** `adapter_model.safetensors`-এ আসলে কী থাকে?
> <details><summary>উত্তর দেখো</summary>
> LoRA-র শেখা ছোট weight পরিবর্তন (`ΔW`) — অর্থাৎ চশমার আসল কাচ। base model-এর ওজন এতে থাকে না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-30"></a>

# কীভাবে আলাদা LoRA Adapter train করা উচিত?

> 🎯 **এই section-এ বুঝব:** প্রতিটা চশমা কীভাবে বানানো উচিত — আর কোন ভুল পথ এড়ানো দরকার।

### 🧵 আগে একটা গল্প

প্রতিটা চশমা আলাদাভাবে **মূল ডাক্তারের উপরেই** বানাও: Base + বাংলা ডেটা → বাংলা-চশমা, Base + কুরআন ডেটা → কুরআন-চশমা। এভাবে প্রতিটা চশমা স্বাধীন।

ভুল পথ: এক চশমার উপর আরেক চশমা, তার উপর আরেকটা (chain) — যেন একটা চশমার ওপর আরেকটা চশমা চাপিয়ে দেখা। ঝাপসা, জট পাকানো, একটা খুললে বাকিগুলো নষ্ট।

### কেন chain এড়াবো?

কারণ chain করলে চশমাগুলো একে অন্যের উপর নির্ভরশীল হয়ে পড়ে — একটা বদলালে সব ভাঙে, debugging কঠিন হয়, deployment জটিল হয়।

Recommended clean approach:

```text
Base Model + Bangla Dataset  → Bangla LoRA
Base Model + Quran Dataset   → Quran LoRA
Base Model + Medical Dataset → Medical LoRA
```

Unnecessary chain training avoid করা ভালো:

```text
Base → Bangla LoRA → Quran LoRA → Medical LoRA
```

কারণ এতে adapter dependency তৈরি হয়, debugging কঠিন হয়, deployment messy হয়।

> 🧠 **মনে রাখার ট্রিক:** প্রতিটা চশমা সরাসরি মূল ডাক্তারের উপর বানাও — চশমার উপর চশমা (chain) নয়।

> ✅ **নিজেকে যাচাই করো:** `Base → Bangla → Quran → Medical` chain-এ সমস্যা কী?
> <details><summary>উত্তর দেখো</summary>
> প্রতিটা adapter আগেরটার উপর নির্ভরশীল হয়ে যায়; একটা বদলালে বাকিগুলো ভেঙে পড়তে পারে, আর debug/deploy কঠিন হয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-31"></a>

# Production Notes

> 🎯 **এই section-এ বুঝব:** খেলনা থেকে বেরিয়ে সত্যিকারের ব্যবহারকারীদের সামনে system চালাতে গেলে কোন কোন বাড়তি সাবধানতা লাগে।

### 🏭 ছোট্ট কথা

বাড়িতে রান্না করা আর রেস্টুরেন্ট চালানো এক নয় — রেস্টুরেন্টে লাগে হিসাব (version), মান-নিয়ন্ত্রণ (status), নিরাপত্তা (safety), নজরদারি (monitoring)। নিচের ছোট ছোট note-গুলো ঠিক এই "রেস্টুরেন্ট-মান" নিয়ে।

> 🧠 **মনে রাখার ট্রিক:** Production = খেলনা নয়, রেস্টুরেন্ট। হিসাব + মান + নিরাপত্তা + নজরদারি।

> ✅ **নিজেকে যাচাই করো:** Production Notes-গুলো কেন দরকার?
> <details><summary>উত্তর দেখো</summary>
> কারণ আসল ব্যবহারকারীদের সামনে system নির্ভরযোগ্য, নিরাপদ ও রক্ষণাবেক্ষণযোগ্য রাখতে version, status, safety, monitoring ইত্যাদি সামলাতে হয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

<a id="section-32"></a>

## 1. Adapter Versioning

> 🎯 **এই section-এ বুঝব:** কেন প্রতিটা চশমার গায়ে version নম্বর আর তথ্য লিখে রাখা দরকার।

### 🏷️ আগে একটা গল্প

ভাবো ওষুধের বোতলে যদি নাম-তারিখ-ব্যাচ লেখা না থাকত! চশমার ক্ষেত্রেও তাই — `bangla-v1`, `bangla-v2` লিখে রাখলে বোঝা যায় কোনটা নতুন, কোনটা পুরনো। সাথে metadata (কোন base, কোন data, কবে train, কে বানাল) থাকলে সমস্যা হলে দ্রুত খুঁজে বের করা যায়।

### কেন?

version ছাড়া rollback অসম্ভব — কোন version-এ ফিরব তা-ই তো জানা নেই। তথ্য লিখে রাখা মানে ভবিষ্যতের নিজেকে বাঁচানো।

Version name ব্যবহার করুন:

```text
bangla-v1
bangla-v2
quran-v1
quran-v2
medical-v1
```

Metadata রাখুন:

```text
adapter_name
base_model
dataset_version
training_date
evaluation_score
status
path
owner
```

> 🧠 **মনে রাখার ট্রিক:** প্রতিটা চশমার গায়ে লেবেল: নাম-version + কে/কবে/কোন data।

> ✅ **নিজেকে যাচাই করো:** version নম্বর না রাখলে সবচেয়ে বড় সমস্যা কী?
> <details><summary>উত্তর দেখো</summary>
> কোনো adapter খারাপ বেরোলে আগের ভালো version-এ ফেরা (rollback) কঠিন — কারণ কোন version ভালো ছিল তা-ই জানা থাকে না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-33"></a>

## 2. Adapter Status

> 🎯 **এই section-এ বুঝব:** প্রতিটা চশমার একটা "অবস্থা" (status) থাকে — কোনটা রোগীর সামনে চলবে, কোনটা এখনো পরীক্ষাধীন।

### 🚦 আগে একটা গল্প

ভাবো ট্রাফিক সিগন্যাল: `experiment` (এখনো ল্যাবে), `staging` (মহড়া চলছে), `production` (সবুজ বাতি, রোগীর সামনে চলবে), `archived`/`deprecated` (আর নয়)। শুধু সবুজ বাতির চশমাই আসল রোগীকে পরানো উচিত।

### কেন?

কাঁচা, অপরীক্ষিত চশমা রোগীকে পরালে ভুল উত্তর যেতে পারে। status থাকলে ভুল করে কাঁচা জিনিস serve করা আটকানো যায়।

Recommended status values:

```text
experiment
staging
production
archived
deprecated
```

শুধু `production` বা approved `staging` adapters serve করা উচিত।

> 🧠 **মনে রাখার ট্রিক:** status = ট্রাফিক বাতি। শুধু সবুজ (production/approved staging) চশমা রোগীর সামনে।

> ✅ **নিজেকে যাচাই করো:** `experiment` চশমা কেন serve করা উচিত নয়?
> <details><summary>উত্তর দেখো</summary>
> কারণ এটা এখনো ল্যাবে পরীক্ষাধীন — মান নিশ্চিত নয়। আসল ব্যবহারকারীকে দিলে ভুল/অনিরাপদ উত্তর যেতে পারে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-34"></a>

## 3. Router Improvement

> 🎯 **এই section-এ বুঝব:** এখনকার সহজ keyword-router-কে কীভাবে আরও চালাক করা যায়।

### 🧠 আগে একটা গল্প

আমাদের রিসেপশনিস্ট এখন শুধু চেনা শব্দ শোনে (keyword)। কিন্তু কেউ ঘুরিয়ে প্রশ্ন করলে সে বিভ্রান্ত হতে পারে। তাকে আরও প্রশিক্ষিত করা যায় — ছোট classifier, embedding মিল, বা LLM দিয়ে; অথবা সবচেয়ে সহজ: রোগীকেই জিজ্ঞেস করা "আপনি কোন বিভাগে যাবেন?" (user-selected mode)।

### কেন user-selected mode প্রায়ই সেরা?

কারণ user নিজে বেছে দিলে ভুল বোঝাবুঝির সুযোগ নেই — এটাই production-এ সবচেয়ে নির্ভরযোগ্য হয়।

Current router rule-based। Better options:

```text
- User-selected mode
- Small intent classifier
- Embedding similarity router
- LLM-based router
- Hybrid rule + classifier
```

Production-এ অনেক সময় user-selected mode সবচেয়ে reliable।

Example:

```text
Mode: General Bangla
Mode: Quran Learning
Mode: Medical Info
```

> 🧠 **মনে রাখার ট্রিক:** router উন্নত করার সিঁড়ি: keyword → classifier → embedding → LLM → সবচেয়ে সহজ ও নিরাপদ user-selected mode।

> ✅ **নিজেকে যাচাই করো:** কেন কখনো কখনো user-কেই mode বেছে নিতে দেওয়া হয়?
> <details><summary>উত্তর দেখো</summary>
> কারণ তখন router-এর ভুল বোঝার সুযোগই থাকে না — user নিজে সঠিক domain বেছে দেয়, তাই সবচেয়ে reliable।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-35"></a>

## 4. Safety

> 🎯 **এই section-এ বুঝব:** কেন মেডিকেল/আইন/ধর্মের মতো সংবেদনশীল উত্তরে সতর্কবার্তা (disclaimer) দেওয়া জরুরি।

### ⚠️ আগে একটা গল্প

মেডিকেল-চশমা পরা ডাক্তার হয়তো সাধারণ তথ্য দিতে পারেন, কিন্তু তিনি তোমার আসল চিকিৎসক নন। তাই বোতলের গায়ে সতর্কবার্তার মতো — "এটা শুধু সাধারণ তথ্য, জরুরি হলে ডাক্তার দেখান" — লিখে দেওয়া দরকার।

### কেন?

কারণ ভুল বিশ্বাসে কেউ ক্ষতিগ্রস্ত হতে পারে। disclaimer ব্যবহারকারীকে আর তোমাকে — দুজনকেই রক্ষা করে।

Medical, legal, finance, religious answer generation-এর ক্ষেত্রে safety rules এবং disclaimer দরকার।

Medical example:

```text
এই system শুধুমাত্র general information দেয়।
এটি professional medical advice-এর replacement না।
Emergency symptom থাকলে দ্রুত doctor-এর সাথে যোগাযোগ করতে হবে।
```

> 🧠 **মনে রাখার ট্রিক:** সংবেদনশীল domain = disclaimer বাধ্যতামূলক। "তথ্য দিই, চিকিৎসা নয়।"

> ✅ **নিজেকে যাচাই করো:** medical adapter কেন safety disclaimer ছাড়া চালানো ঝুঁকিপূর্ণ?
> <details><summary>উত্তর দেখো</summary>
> কারণ ব্যবহারকারী একে আসল ডাক্তারি পরামর্শ ভেবে নিতে পারে; ভুল সিদ্ধান্তে ক্ষতি হতে পারে। disclaimer সীমাটা স্পষ্ট করে দেয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-36"></a>

## 5. Monitoring

> 🎯 **এই section-এ বুঝব:** system চালু রাখার পর দুই ধরনের নজরদারি — যন্ত্রের স্বাস্থ্য (API) আর উত্তরের মান (ML)।

### 📈 আগে একটা গল্প

হাসপাতালে দুই ধরনের নজর: একদিকে বিল্ডিং ঠিক আছে কিনা (বিদ্যুৎ, পানি = latency, error rate, GPU/RAM), অন্যদিকে ডাক্তার ভালো চিকিৎসা দিচ্ছেন কিনা (ভুল উত্তর, ভুল চশমা বাছা, রোগীর feedback)। দুটোই দরকার।

### কেন ML-monitoring আলাদা?

কারণ server ঠিকঠাক চললেও উত্তর খারাপ হতে পারে (hallucination, ভুল routing)। শুধু "চলছে কিনা" নয়, "ভালো উত্তর দিচ্ছে কিনা" — সেটাও মাপতে হয়।

API এবং ML behavior দুইটাই monitor করতে হবে।

API monitoring:

```text
latency
error rate
request count
GPU memory
CPU/RAM
timeout
```

ML monitoring:

```text
adapter usage
bad responses
domain misrouting
user feedback
hallucination rate
data drift
quality score
```

> 🧠 **মনে রাখার ট্রিক:** দুই চোখ — API (যন্ত্র চলছে?) আর ML (উত্তর ভালো?)। একটা খোলা রাখলে অর্ধেক অন্ধ।

> ✅ **নিজেকে যাচাই করো:** latency ঠিক আছে, কিন্তু উত্তরগুলো ভুল — কোন monitoring এটা ধরবে?
> <details><summary>উত্তর দেখো</summary>
> ML monitoring (bad responses, hallucination rate, user feedback)। API monitoring শুধু বলবে server দ্রুত চলছে, উত্তর ঠিক কিনা নয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-37"></a>

## 6. Fallback Adapter

> 🎯 **এই section-এ বুঝব:** router যখন নিশ্চিত হতে পারে না, তখন কী করবে — নিরাপদ পথ কী।

### 🪂 আগে একটা গল্প

রিসেপশনিস্ট যদি বুঝতে না পারে রোগী কোন বিভাগের, তবে সে হাত গুটিয়ে বসে থাকে না — একটা নিরাপদ default বিভাগে (bangla) পাঠায়, অথবা রোগীকেই জিজ্ঞেস করে "আপনি কোন বিভাগে যাবেন?"। এই পিছনের জাল-টাই fallback।

### কেন?

কারণ "কোনো উত্তর নেই" ব্যবহারকারীর জন্য বাজে অভিজ্ঞতা। fallback নিশ্চিত করে system সবসময় অন্তত একটা যুক্তিসঙ্গত উত্তর দেয়।

Router unsure হলে default adapter use করুন:

```text
default_adapter = bangla
```

অথবা user-কে mode select করতে বলা যায়:

```text
আপনি কোন mode ব্যবহার করতে চান?
1. General Bangla
2. Quran Learning
3. Medical Info
```

> 🧠 **মনে রাখার ট্রিক:** নিশ্চিত না হলে থেমো না — default চশমা পরাও, নাহলে user-কে জিজ্ঞেস করো।

> ✅ **নিজেকে যাচাই করো:** router সন্দেহে পড়লে এই project-এ কোন adapter যায়?
> <details><summary>উত্তর দেখো</summary>
> default fallback adapter — এখানে `bangla`। এতে ব্যবহারকারী অন্তত একটা উত্তর পায়, খালি হাতে ফেরে না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-38"></a>

## 7. কখন Adapter Merge করবেন?

> 🎯 **এই section-এ বুঝব:** production-এ কোন শর্তগুলো একসাথে সত্যি হলে চশমা স্থায়ীভাবে বসিয়ে দেওয়া (merge) যুক্তিসঙ্গত।

### 🔩 আগে একটা গল্প

মনে আছে — merge মানে চশমা চোখে স্থায়ীভাবে বসিয়ে দেওয়া (lasik)? এটা কেবল তখনই করো যখন চশমাটা প্রমাণিত ভালো (stable), একটাই বিষয় খুব বেশি চলে, আর দ্রুততা (latency) খুব দরকার। অন্ধভাবে সব চশমা বসিয়ে দিলে নমনীয়তা হারাবে।

### কেন সাবধানে?

কারণ merge উল্টানো যায় না, আর প্রতিটা merged model আলাদা বড় ফাইল — অনেকগুলো হলে storage বাড়ে।

Merge করা যায় যদি:

```text
- adapter stable হয়
- এক domain খুব বেশি use হয়
- latency গুরুত্বপূর্ণ হয়
- adapter switching দরকার না হয়
```

সব adapter অন্ধভাবে merge করা উচিত না।

> 🧠 **মনে রাখার ট্রিক:** merge = lasik। stable + এক-domain + latency জরুরি — তবেই। উল্টানো যায় না।

> ✅ **নিজেকে যাচাই করো:** ঘন ঘন adapter switching দরকার এমন system-এ merge করা উচিত?
> <details><summary>উত্তর দেখো</summary>
> না। merge করলে চশমা আর খোলা-পরা যায় না। switching দরকার হলে adapter আলাদাই রাখতে হবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-39"></a>

## 8. কখন Distillation করবেন?

> 🎯 **এই section-এ বুঝব:** কখন অনেক চশমার ঝামেলা ছেড়ে একটা ছোট "শিক্ষিত ছাত্র" model-এ চলে যাওয়া বুদ্ধিমানের কাজ।

### 👨‍🏫 আগে একটা গল্প

মনে আছে — distillation মানে বড় শিক্ষকের জ্ঞান ছোট ছাত্রকে শেখানো? যখন চশমার সংখ্যা এত বেড়ে যায় যে সামলানো কঠিন, বা inference খরচ বেশি হয়ে যায়, তখন সব জ্ঞান এক ছোট পরিষ্কার ছাত্র-model-এ ঢেলে দিয়ে শুধু সেটাই deploy করা যায়।

### কেন?

কারণ ছোট single model চালানো সস্তা ও সরল — অনেক adapter manage করার জটিলতা আর থাকে না।

Distillation ব্যবহার করা যায় যদি:

```text
- অনেক adapter manage করা কঠিন হয়ে যায়
- ছোট model দরকার হয়
- inference cost বেশি হয়
- production-এ clean single model দরকার হয়
```

Final deployment-এ শুধু distilled student model রাখা যেতে পারে।

> 🧠 **মনে রাখার ট্রিক:** অনেক চশমা সামলানো কঠিন হলে → জ্ঞান ছোট ছাত্রে ঢালো (distill) → শুধু ছাত্রকে deploy করো।

> ✅ **নিজেকে যাচাই করো:** distillation merge থেকে কীভাবে আলাদা?
> <details><summary>উত্তর দেখো</summary>
> Merge = একই base-এ চশমা স্থায়ীভাবে বসানো (একই আকারের model)। Distillation = আলাদা একটা ছোট নতুন model-কে শিখিয়ে তৈরি করা, যা inference-এ সস্তা।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-40"></a>

# Summary

> 🎯 **এই section-এ বুঝব:** পুরো টিউটোরিয়ালের মূল কথাটা এক জায়গায় গুছিয়ে নেব — যেন এক নিঃশ্বাসে বলতে পারো।

### 🎁 ছোট্ট কথা

সব গল্প এক সুতোয়: একজন সাধারণ-শিক্ষিত ডাক্তার (base model), অনেকগুলো বিষয়-চশমা (LoRA adapters), আর একজন রিসেপশনিস্ট (router) যে প্রশ্ন শুনে ঠিক চশমা পরায়। এক ডাক্তার, অনেক চশমা — তাই সস্তা, নমনীয়, আর scalable।

### কেন এই approach জনপ্রিয়?

কারণ এক base ভাগ করে অনেক domain সামলানো যায় ছোট ছোট adapter দিয়ে — storage কম, নতুন বিষয় যোগ করা সহজ, rollback সহজ।

এই architecture-এর common নাম:

```text
PEFT-based Multi-Adapter Serving
Multi-LoRA Adapter Routing
Adapter-based Inference Architecture
Router-based Adapter Selection
```

Main idea:

```text
Base model একটাই।
বিভিন্ন কাজের জন্য আলাদা LoRA adapter থাকে।
Router/classifier input দেখে সঠিক adapter select করে।
Base model + selected adapter দিয়ে answer generate হয়।
```

এই approach storage-efficient, scalable, domain-specific MLOps deployment-এর জন্য useful।

> 🧠 **মনে রাখার ট্রিক:** পুরো course এক লাইনে — **এক ডাক্তার (base) + অনেক চশমা (adapters) + একজন রিসেপশনিস্ট (router)**।

> ✅ **নিজেকে যাচাই করো:** কেউ যদি জিজ্ঞেস করে "Multi-LoRA routing কী?", এক বাক্যে কী বলবে?
> <details><summary>উত্তর দেখো</summary>
> একটাই base model, তার উপর দরকারমতো আলাদা আলাদা ছোট LoRA adapter (চশমা) পরানো হয়, আর একটা router প্রশ্ন দেখে ঠিক করে কোন adapter দিয়ে উত্তর দেবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)
