# RAG Based System Development Tutorial with FastAPI Backend

এই note-টা RAG based system development শেখার জন্য। Backend হিসেবে ধরা হয়েছে **FastAPI**, RAG vector store example হিসেবে ধরা হয়েছে **ChromaDB**, আর example domain হিসেবে ধরা হয়েছে **Fatwa GPT / document-based question answering system**।

Important:

```txt
Database choice project basis-এ change হবে।
এই tutorial-এ ChromaDB দিয়ে RAG/vector search দেখানো হবে।
কিন্তু project অনুযায়ী relational data লাগলে PostgreSQL/SQLite/MySQL আলাদা app database হিসেবে add করা যাবে।
```

Main goal:

```txt
RAG আসলে কী problem solve করে তা বোঝা
Document, chunk, embedding, metadata, vector DB relation বোঝা
কোন component/file/service কেন ব্যবহার করছি তা বোঝা
FastAPI দিয়ে practical RAG backend বানানোর flow শেখা
LangChain, LlamaIndex, multi-agent কখন লাগবে আর কখন লাগবে না বোঝা
Production-style citation, verification, metadata filter, admin review চিন্তা করা
```

Learning order:

```txt
Concept -> Data flow -> Metadata -> Vector DB -> Ingestion -> Retrieval -> Answer -> Citation -> Verification -> Scaling
```

<a id="index"></a>

## Index

<!-- tutorial-index:start -->
- [01. Big Picture: RAG আসলে কী করে](#section-1)
- [02. Normal LLM vs RAG-Based System](#section-2)
- [03. RAG System Layers: কোন অংশ কেন](#section-3)
- [04. Core Terms: Document, Chunk, Embedding, Metadata](#section-4)
- [05. End-to-End RAG Flow](#section-5)
- [06. Metadata vs Embedding vs Vector DB](#section-6)
- [07. Fatwa GPT Metadata Design](#section-7)
- [08. Chunking, Node Parser, এবং Node](#section-8)
- [09. Embedding Model, Cost, এবং Privacy Thinking](#section-9)
- [10. Vector DB Choose করার নিয়ম](#section-10)
- [11. Recommended Stack: Learning থেকে Production](#section-11)
- [12. FastAPI Project Setup with uv](#section-12)
- [13. Folder Structure: RAG Backend সাজানো](#section-13)
- [14. ChromaDB Collection Design: Documents এবং Chunks](#section-14)
- [15. Ingestion Pipeline: PDF থেকে Vector Store](#section-15)
- [16. Retrieval Pipeline: User Question থেকে Context](#section-16)
- [17. Prompt with Context এবং Citation](#section-17)
- [18. LangChain: কখন লাগবে, কখন লাগবে না](#section-18)
- [19. LlamaIndex: Metadata, Node Parser, Query Engine](#section-19)
- [20. Multi-Step RAG Pipeline vs Multi-Agent](#section-20)
- [21. Verification Layers: Backend, Source, Answer](#section-21)
- [22. Better Retrieval: Filter, Hybrid Search, Rerank](#section-22)
- [23. FastAPI API Design: Upload, Ask, Admin](#section-23)
- [24. Frontend Connection: Next.js বা Expo App](#section-24)
- [25. Development Rules, Checklist, এবং Summary](#section-25)
<!-- tutorial-index:end -->

---

<a id="section-1"></a>

## 01. Big Picture: RAG আসলে কী করে

> 🎯 **এই section-এ বুঝব:** RAG আসলে কোন সমস্যা সমাধান করে, আর কেন LLM-কে "বই দেখে" উত্তর দেওয়ার ক্ষমতা দেওয়া হয়। (কোড এখনো লাগবে না — শুধু "কেন" বুঝব।)

### 📖 আগে একটা গল্প

ভাবো তোমার দুই বন্ধু পরীক্ষা দিচ্ছে। একজন সব **মুখস্থ** করে এসেছে — সে দ্রুত উত্তর দেয়, কিন্তু ভুলে গেলে বানিয়ে বানিয়ে বলে দেয় (আর কেউ ধরতে পারে না কোথা থেকে এলো)। আরেকজন **open-book পরীক্ষা** দিচ্ছে — সে প্রশ্ন পড়ে আগে ঠিক পাতাটা খুঁজে বের করে, তারপর বই দেখে উত্তর লেখে, আর নিচে লিখে দেয় "পৃষ্ঠা ২৩ থেকে"। 📚

Normal LLM হলো প্রথম বন্ধু — সব training থেকে মুখস্থ। **RAG হলো দ্বিতীয় বন্ধু** — আগে তোমার document থেকে সঠিক অংশ খুঁজে (Retrieval), তারপর সেটা দেখে উত্তর বানায় (Generation)। তাই নাম **Retrieval-Augmented Generation**।

### কেন এই দরকার?

মুখস্থ-বন্ধুর দুইটা সমস্যা: (১) সে ভুলে গেলে আত্মবিশ্বাসের সাথে ভুল বলে (এটাকে বলে **hallucination**), আর (২) সে কোথা থেকে বলল দেখাতে পারে না। তোমার নিজের private বই, নতুন তথ্য, বা "source verified কি না" — এগুলো তার training-এ ছিলই না। RAG এই দুইটাই ঠিক করে: উত্তর আসে তোমার দেওয়া বই থেকে, আর সাথে থাকে citation।

RAG মানে **Retrieval-Augmented Generation**।

সহজভাবে:

```txt
LLM নিজের training memory থেকে answer না দিয়ে
প্রথমে আপনার document/database থেকে relevant তথ্য খুঁজে নেয়
তারপর সেই retrieved context দেখে answer তৈরি করে
```

Example:

```txt
User:
আসরের নামাজ কয় রাকাত?

Normal LLM:
নিজের training knowledge থেকে answer দিবে

RAG system:
আপনার verified book/PDF/database থেকে related অংশ খুঁজবে
তারপর সেই source দেখে answer দিবে
সাথে citation/source দেখাবে
```

RAG দরকার হয় যখন:

```txt
আপনার private document আছে
updated knowledge দরকার
source citation দরকার
hallucination কমাতে চান
domain-specific answer দরকার
```

Fatwa GPT-এর মতো system-এ RAG খুব important, কারণ answer শুধু সুন্দর হলেই হবে না। Answer কোথা থেকে এসেছে, source verified কি না, কোন page/chapter থেকে এসেছে, এগুলোও জানতে হবে।

> 🧠 **মনে রাখার ট্রিক:** RAG = **open-book পরীক্ষা**। LLM মুখস্থ বলে না — আগে বই খুঁজে, তারপর দেখে উত্তর লেখে, আর সূত্র দেখায়।

> ✅ **নিজেকে যাচাই করো:** একটা LLM এমনিতেই তো অনেক কিছু জানে। তাহলে Fatwa GPT-তে RAG লাগবে কেন?
> <details><summary>উত্তর দেখো</summary>
> কারণ LLM-এর মুখস্থ knowledge-এ তোমার নির্দিষ্ট verified বই থাকে না, সে ভুলে গেলে বানিয়ে বলে (hallucination), আর কোন বই-কোন পৃষ্ঠা তা দেখাতে পারে না। RAG উত্তরকে তোমার verified source-এর সাথে বেঁধে দেয় এবং citation দেখায় — fatwa-র মতো sensitive জায়গায় এটাই সবচেয়ে জরুরি।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-2"></a>

## 02. Normal LLM vs RAG-Based System

> 🎯 **এই section-এ বুঝব:** একই প্রশ্নে normal LLM আর RAG আলাদা করে কী করে, আর কেন RAG-এর উত্তর বেশি বিশ্বাসযোগ্য।

### 🎤 আগে একটা গল্প

দুইটা টিভি অনুষ্ঠান ভাবো। প্রথমটায় উপস্থাপক স্মৃতি থেকে যা মনে আসে বলে দেন — দ্রুত, কিন্তু ভুল হলে ধরার উপায় নেই। দ্বিতীয়টায় উপস্থাপক প্রশ্ন শুনে আগে **ফাইল ক্যাবিনেট থেকে ঠিক কাগজটা** বের করেন, তারপর সেটা হাতে নিয়ে পড়ে উত্তর দেন। দ্বিতীয়জন একটু ধীর, কিন্তু তার উত্তর যাচাই করা যায়। RAG হলো দ্বিতীয় উপস্থাপক।

### কেন পার্থক্যটা জরুরি

Normal LLM-এ knowledge আসে training data থেকে — যা fixed, পুরনো হতে পারে, আর তোমার private document সেখানে নেই। RAG-এ knowledge আসে তোমার দেওয়া document থেকে — তুমি data update করলেই উত্তর update হয়। তাই নিচের flow-তে খেয়াল করো: RAG-এ আগে embedding + search ধাপ যোগ হয়েছে, তারপরই LLM কাজ শুরু করে।

Normal LLM flow:

```txt
User question
  -> LLM
  -> answer
```

RAG flow:

```txt
User question
  -> question embedding
  -> vector search
  -> relevant chunks
  -> LLM with context
  -> grounded answer + citation
```

Difference:

| বিষয় | Normal LLM | RAG |
|---|---|---|
| Knowledge source | model training data | আপনার document/database |
| Updated data | weak | strong, যদি data update করেন |
| Citation | সাধারণত নেই | রাখা যায় |
| Hallucination control | কম | context দিয়ে কমানো যায় |
| Private data | নেই | আছে |
| Domain accuracy | uncertain | source quality-এর ওপর নির্ভর করে |

RAG magic না। যদি retrieved context ভুল হয়, answer-ও ভুল হতে পারে। তাই RAG system-এ retrieval quality, metadata, verified source, prompt, citation, verification সব একসাথে important।

> 🧠 **মনে রাখার ট্রিক:** Normal LLM = **স্মৃতি থেকে বলা**, RAG = **কাগজ বের করে পড়ে বলা**। ভুল কাগজ বের করলে ভুল উত্তরও আসবে — তাই "কোন কাগজ আনলাম" ধাপটাই RAG-এর প্রাণ।

> ✅ **নিজেকে যাচাই করো:** RAG-এর উত্তর কি সবসময় সঠিক হওয়ার গ্যারান্টি দেয়?
> <details><summary>উত্তর দেখো</summary>
> না। RAG উত্তরকে retrieved context-এর সাথে বাঁধে, কিন্তু যদি ভুল বা irrelevant chunk আসে, উত্তরও ভুল হতে পারে। তাই retrieval quality, verified source, ভালো prompt আর verification — সব মিলিয়েই RAG নির্ভরযোগ্য হয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-3"></a>

## 03. RAG System Layers: কোন অংশ কেন

> 🎯 **এই section-এ বুঝব:** একটা RAG app আসলে কয়েকটা আলাদা "বিভাগ" (layer) দিয়ে তৈরি, আর প্রতিটা বিভাগ কেন আলাদা কাজ করে।

### 🍽️ আগে একটা গল্প

একটা ভালো রেস্টুরেন্ট ভাবো। সামনে **রিসেপশনিস্ট** (order নেয়, বিল করে, কে ঢুকবে ঠিক করে) = FastAPI backend। পেছনে বিশাল **গুদাম/pantry** যেখানে লেবেল-সহ সব উপকরণ সাজানো = ChromaDB। একজন **রাঁধুনি** যিনি উপকরণ দেখে রান্না করেন = LLM। আর একজন **ম্যানেজার** যিনি জটিল সিদ্ধান্ত নেন = Agent layer। সবাই মিলে চলে, কিন্তু কেউ কারও কাজ করে না।

### কেন layer আলাদা রাখি

মূল নিয়মটা সোনার মতো: **deterministic কাজ (হ্যাঁ/না, filter, permission) backend/database করবে; meaning বা reasoning-এর কাজ LLM/agent করবে।** যেমন "এই source verified কি না" — এটা একটা সত্য fact, তাই এটা metadata-তে রাখা হয়, LLM নিজে অনুমান করে না। এভাবে ভাগ করলে system predictable, secure আর debug-friendly থাকে।

একটা professional RAG app-এ সাধারণত এই layers থাকে:

```txt
Frontend
  -> user question, upload UI, citation show

FastAPI Backend
  -> auth, API, upload, validation, admin approval, business rules

ChromaDB
  -> chunks, embeddings, metadata, semantic search

RAG Service
  -> chunking, embedding, retrieval, context building

Optional App Database
  -> users, chat history, admin audit, billing, permissions

LLM
  -> final answer generation

Optional Agent Layer
  -> routing, verification, conflict handling, admin review decision
```

Layer responsibility:

| Layer | কাজ |
|---|---|
| FastAPI | API, auth, validation, upload, admin workflow |
| ChromaDB | text chunks, embeddings, metadata, vector search |
| Optional App DB | users, permissions, chat history, admin audit |
| RAG service | chunk, embed, retrieve, prompt build |
| LLM | context থেকে answer লেখা |
| Agent | complex decision বা verification |

Important rule:

```txt
Backend/database deterministic কাজ করবে।
LLM/agent meaning বা reasoning-এর কাজ করবে।
```

যেমন `verified_status` ChromaDB metadata বা app database-এ থাকবে। LLM নিজে source verified কিনা decide করবে না। LLM বা retriever শুধু সেই metadata use করবে।

> 🧠 **মনে রাখার ট্রিক:** রেস্টুরেন্ট মডেল — **রিসেপশনিস্ট (FastAPI)**, **গুদাম (ChromaDB)**, **রাঁধুনি (LLM)**, **ম্যানেজার (Agent)**। Fact-এর কাজ backend, meaning-এর কাজ LLM।

> ✅ **নিজেকে যাচাই করো:** "এই document verified কি না" — এই সিদ্ধান্ত LLM-কে দিয়ে নেওয়ানো কি ঠিক হবে?
> <details><summary>উত্তর দেখো</summary>
> না। verified কি না — এটা একটা নির্দিষ্ট সত্য (deterministic fact), যা admin ঠিক করে metadata-তে সংরক্ষণ করে। LLM meaning বোঝে, কিন্তু fact যাচাই করার দায়িত্ব তার না। retriever শুধু ওই metadata দেখে filter করে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-4"></a>

## 04. Core Terms: Document, Chunk, Embedding, Metadata

> 🎯 **এই section-এ বুঝব:** RAG-এর জাদুর শব্দগুলো — document, chunk, embedding, vector DB, metadata — সহজ analogy দিয়ে পাকা করে ফেলব।

### 🗂️ আগে একটা গল্প

ভাবো তুমি একটা বিশাল লাইব্রেরি সাজাচ্ছ। পুরো **বই = document**। বইকে পড়ার সুবিধার্থে ছোট ছোট **index card = chunk** বানালে (এক কার্ডে এক টুকরো লেখা)। এবার প্রতিটা কার্ডের অর্থকে একটা **স্থানাঙ্ক/coordinate = embedding** দিয়ে চিহ্নিত করলে — কাছাকাছি অর্থের কার্ড মানচিত্রে কাছাকাছি বিন্দুতে বসে। পুরো এই স্মার্ট **ক্যাটালগ = vector DB**। আর প্রতিটা কার্ডের গায়ের **লেবেল (লেখক, অধ্যায়, পৃষ্ঠা) = metadata**।

### কেন এগুলো আলাদা করে বোঝা জরুরি

কারণ প্রতিটা জিনিস আলাদা কাজে লাগে, আর মানুষ এগুলো গুলিয়ে ফেলে। **Text** হলো উত্তরের কাঁচামাল, **embedding** হলো খোঁজার কাঁচামাল, **metadata** হলো filter/citation-এর কাঁচামাল, আর **vector DB** হলো খোঁজার engine। নিচের JSON record-টায় দেখো — একটাই chunk, কিন্তু তিন ধরনের তথ্য পাশাপাশি বসে আছে।

RAG শেখার আগে এই terms clear করতে হবে:

| Term | সহজ meaning |
|---|---|
| Document | PDF, book, article, FAQ, database row |
| Chunk | document-এর ছোট text অংশ |
| Embedding | text meaning-এর numeric/vector representation |
| Vector DB | embedding store/search করার জায়গা |
| Metadata | source/filter/citation info |
| Retriever | relevant chunks খুঁজে আনে |
| Context | retrieved chunks যা LLM-কে দেওয়া হয় |
| Prompt | question + instruction + context |
| Citation | answer-এর source reference |

Minimal RAG record:

```json
{
  "id": "chunk_001",
  "text": "আসরের নামাজ চার রাকাত ফরজ।",
  "embedding": [0.12, -0.44, 0.87],
  "metadata": {
    "book": "ফিকহুস সালাত",
    "page": 23,
    "topic": "salah",
    "language": "bn",
    "verified_status": "verified"
  }
}
```

Short memory:

```txt
Text answer-এর material
Embedding search-এর material
Metadata filter/citation-এর material
Vector DB search-এর engine
```

> 🧠 **মনে রাখার ট্রিক:** লাইব্রেরি মডেল — **বই = document**, **কার্ড = chunk**, **অর্থের স্থানাঙ্ক = embedding**, **স্মার্ট ক্যাটালগ = vector DB**, **কার্ডের লেবেল = metadata**।

> ✅ **নিজেকে যাচাই করো:** "কাছাকাছি অর্থ = কাছাকাছি বিন্দু" — embedding-এর এই কথাটা মানে কী?
> <details><summary>উত্তর দেখো</summary>
> Embedding প্রতিটা লেখাকে সংখ্যার একটা coordinate (vector) বানায়। যেসব লেখার অর্থ মিল, তাদের coordinate-ও কাছাকাছি বসে। তাই প্রশ্নের embedding-এর কাছাকাছি বিন্দুগুলো খুঁজলেই অর্থগত ভাবে মিল-খাওয়া chunk পাওয়া যায় — হুবহু শব্দ না মিললেও চলে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-5"></a>

## 05. End-to-End RAG Flow

> 🎯 **এই section-এ বুঝব:** একটা RAG system শুরু থেকে শেষ পর্যন্ত ঠিক কোন কোন ধাপে কাজ করে, আর কেন এটা দুইটা আলাদা phase-এ ভাগ।

### 📚 আগে একটা গল্প

একটা লাইব্রেরি চালু করার কথা ভাবো। প্রথমে তুমি চুপচাপ **বই সাজাও** — শেলফে তুলো, লেবেল লাগাও, ক্যাটালগে entry করো। এটা visitor আসার আগেই একবার হয়। এরপর যখন **পাঠক প্রশ্ন নিয়ে আসে**, তুমি ক্যাটালগ দেখে ঠিক বইটা বের করে উত্তর দাও। RAG-ও ঠিক তাই: প্রথমটা **Ingestion phase** (বই সাজানো), দ্বিতীয়টা **Query phase** (পাঠককে উত্তর দেওয়া)।

### কেন দুই phase আলাদা

কারণ বই সাজানো (chunk, embedding তৈরি, save) একটা ভারী কাজ যা একবার করলেই চলে — প্রতিবার প্রশ্নে করলে system ধীর ও ব্যয়বহুল হবে। উল্টো দিকে প্রশ্নের সময় দরকার শুধু দ্রুত খুঁজে আনা। এই ভাগটা মনে রাখলে নিচের দুই flow কখনো গুলিয়ে যাবে না।

RAG system দুইটা বড় phase-এ কাজ করে:

```txt
1. Ingestion phase
2. Query/Retrieval phase
```

Ingestion phase:

```txt
Admin uploads PDF/book
  -> FastAPI validates file + metadata
  -> text extract
  -> chunk/node create
  -> embedding create
  -> text + embedding + metadata save
  -> admin marks source verified
```

Query phase:

```txt
User asks question
  -> FastAPI receives question
  -> question embedding create
  -> metadata filter apply
  -> vector search top chunks
  -> optional rerank
  -> context build
  -> LLM answer from context
  -> citation attach
  -> optional verifier check
  -> final response
```

প্রথম mini project goal:

```txt
একটা PDF upload করবো
PDF থেকে text extract করবো
chunk বানাবো
embedding বানিয়ে store করবো
তারপর PDF থেকে question-answer করবো
```

এই mini project করতে পারলে RAG-এর practical 70% concept clear হয়ে যাবে।

> 🧠 **মনে রাখার ট্রিক:** **Ingestion = বই সাজানো (একবার), Query = পাঠককে উত্তর দেওয়া (বারবার)।** ভারী কাজ আগে, দ্রুত কাজ প্রশ্নের সময়।

> ✅ **নিজেকে যাচাই করো:** embedding তৈরি করা কি ingestion-এ হয়, নাকি query-তে?
> <details><summary>উত্তর দেখো</summary>
> দুই জায়গাতেই — কিন্তু ভিন্নভাবে। Ingestion-এ document-এর প্রতিটা chunk-এর embedding একবার বানিয়ে save করা হয়। Query-তে শুধু user-এর প্রশ্নটার embedding বানিয়ে সেটা দিয়ে search করা হয়। ভারী কাজটা (সব chunk embed) আগেই সেরে রাখা হয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-6"></a>

## 06. Metadata vs Embedding vs Vector DB

> 🎯 **এই section-এ বুঝব:** embedding, metadata আর vector DB — এই তিনটা যে আলাদা জিনিস আর কীভাবে একসাথে এক record-এ থাকে, সেটা পাকা করব।

### 🏷️ আগে একটা গল্প

একটা বইয়ের কথা ভাবো। বইটা **কী নিয়ে** — সেটা তার ভেতরের অর্থ, মানে **embedding**। বইয়ের মলাটে লাগানো **লেবেল** — লেখক, প্রকাশনী, অধ্যায় — সেটা **metadata**। আর যে বিশাল **শেলফ+ক্যাটালগ** সব বই ধরে রাখে ও খুঁজে দেয়, সেটা **vector DB**। লেবেল কিন্তু বইয়ের অর্থের অংশ না — আলাদা করে গায়ে সাঁটা। তেমনি metadata embedding-এর অংশ না, বরং record-এর পাশে বসা আলাদা তথ্য।

### কেন এই পার্থক্য কাজে লাগে

দুইটা আলাদা প্রশ্নের দুই আলাদা হাতিয়ার লাগে। "এর সাথে অর্থে মিলে এমন কিছু আছে?" → **embedding দিয়ে similarity search**। "শুধু hanafi, verified, বাংলা বইগুলোর মধ্যে খোঁজো" → **metadata দিয়ে filter**। দুইটা একসাথে ব্যবহার করলেই তুমি নির্ভুল আর নিয়ন্ত্রিত retrieval পাবে।

Metadata embedding-এর part না। Metadata সাধারণত vector DB record-এর part।

একটা chunk save করলে সাধারণত থাকে:

```txt
text      = আসল লেখা
embedding = ওই লেখার meaning vector
metadata  = source/filter/citation info
```

Flow:

```txt
Text chunk
  -> embedding model
  -> vector তৈরি
  -> vector DB record save:
       id
       text
       embedding
       metadata
```

Search করার সময়:

```txt
User question
  -> question embedding
  -> vector DB similarity search
  -> matched text + metadata return
```

Metadata দিয়ে filter করা যায়:

```txt
language = "bn"
topic = "salah"
verified_status = "verified"
book = "ফিকহুস সালাত"
```

Fatwa GPT example:

```txt
User asks:
নামাজ না পড়ার বিধান কী?

Retriever filter:
topic = salah
verified_status = verified
language = bn

Search result:
matched chunks + source_name + page_number + author
```

Final rule:

```txt
Embedding = meaning search
Metadata = filter/citation/source identity
Vector DB = text + embedding + metadata store/search করে
```

> 🧠 **মনে রাখার ট্রিক:** **Embedding = বই কী নিয়ে (অর্থ), Metadata = মলাটের লেবেল, Vector DB = শেলফ+ক্যাটালগ।** লেবেল অর্থের অংশ না — পাশে বসানো।

> ✅ **নিজেকে যাচাই করো:** "শুধু verified আর বাংলা source থেকে খোঁজো" — এই কাজটা embedding করে, নাকি metadata?
> <details><summary>উত্তর দেখো</summary>
> Metadata। embedding অর্থে-মিল খুঁজে আনে, কিন্তু "verified কি না" বা "ভাষা bn কি না" — এগুলো নির্দিষ্ট label, তাই metadata filter দিয়ে সীমা বেঁধে দেওয়া হয়। দুইটা একসাথে চললে সঠিক ও নিরাপদ result আসে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-7"></a>

## 07. Fatwa GPT Metadata Design

> 🎯 **এই section-এ বুঝব:** Fatwa GPT-এর মতো sensitive system-এ কেন আগেভাগে ভালো metadata ডিজাইন করা এত জরুরি, আর কী কী রাখতে হয়।

### 🏷️ আগে একটা গল্প

ভাবো একটা বইয়ের গায়ে কোনো লেবেল নেই — না লেখকের নাম, না পৃষ্ঠা নম্বর, না "এটা যাচাই করা হয়েছে" সিল। বইটা পড়ে তুমি হয়তো উত্তর পাবে, কিন্তু কেউ জিজ্ঞেস করলে "এটা কার বই, কোন পাতা, কে যাচাই করেছে?" — তুমি নিরুত্তর। fatwa-র মতো জায়গায় এই নিরুত্তর থাকাটাই সবচেয়ে বিপজ্জনক।

### কেন metadata আগে ডিজাইন করতে হয়

কারণ metadata-ই উত্তরের "প্রমাণপত্র"। কোন বই, কোন পৃষ্ঠা, কোন আলেম, কোন madhhab, verified কি না — সব আসে metadata থেকে। আর একটা বাস্তব কারণ: metadata পরে যোগ করতে গেলে পুরো document আবার ingest (re-ingestion) করতে হতে পারে। তাই শুরুতেই ভেবে নেওয়া সময় বাঁচায়।

Demo RAG-এ metadata optional হতে পারে। Production RAG-এ metadata almost mandatory। Islamic/Fatwa RAG-এ metadata critical।

Minimum metadata:

```txt
document_id
title
source_name
author
page_number
chapter
topic
language
chunk_index
verified_status
```

Better metadata:

```txt
madhhab
fatwa_category
reference_type
book_volume
source_reliability
verified_by
verified_at
upload_date
source_url
edition
```

Example:

```json
{
  "document_id": "fatwa_book_001",
  "title": "নামাজ ত্যাগের বিধান",
  "source_name": "ফাতওয়া সংকলন",
  "author": "শাইখ ...",
  "page_number": 45,
  "chapter": "সালাত",
  "topic": "salah",
  "madhhab": "hanafi",
  "language": "bn",
  "verified_status": "verified",
  "chunk_index": 12
}
```

Metadata না থাকলে user প্রশ্ন করলে এই answers দেওয়া কঠিন:

```txt
এই উত্তর কোন বই থেকে দিলে?
কোন page?
কোন আলেম?
এই source verified কি না?
এইটা কোন madhhab-এর view?
```

তাই Fatwa GPT-এর জন্য metadata design আগে চিন্তা করা উচিত। পরে add করতে গেলে re-ingestion লাগতে পারে।

> 🧠 **মনে রাখার ট্রিক:** Metadata = উত্তরের **প্রমাণপত্র/লেবেল**। লেবেল ছাড়া বই = "কোথা থেকে এলো" বলতে না পারা। আর লেবেল আগে ডিজাইন করো — পরে করলে পুরো বই আবার সাজাতে হয়।

> ✅ **নিজেকে যাচাই করো:** metadata design না করে ইঙ্গেস্ট করে ফেলার পর কেন সেটা যোগ করা কষ্টকর?
> <details><summary>উত্তর দেখো</summary>
> কারণ chunk আর embedding ইতিমধ্যে save হয়ে গেছে metadata ছাড়া। এখন নতুন field যোগ করতে হলে প্রতিটা chunk আবার প্রসেস করে (re-ingestion) নতুন metadata সহ সংরক্ষণ করতে হয় — যা সময়, খরচ ও ঝুঁকি বাড়ায়। তাই শুরুতেই ডিজাইন করা লাভজনক।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-8"></a>

## 08. Chunking, Node Parser, এবং Node

> 🎯 **এই section-এ বুঝব:** বড় document-কে কেন ছোট টুকরো (chunk) করি, chunk আর Node-এর পার্থক্য কী, আর chunk size কেন উত্তরের মান ঠিক করে।

### 🃏 আগে একটা গল্প

একটা ২০০ পৃষ্ঠার বই কাউকে দিয়ে বললে "এখান থেকে আমার প্রশ্নের উত্তর খুঁজে দাও" — সে হিমশিম খাবে। কিন্তু যদি বইটাকে ছোট ছোট **index card**-এ ভাগ করো (এক কার্ডে এক টুকরো), তাহলে ঠিক প্রাসঙ্গিক কার্ডটা টেনে বের করা সহজ। এই কার্ডগুলোই **chunk**। আর একটা **Node** হলো এমন কার্ড যার গায়ে লেবেল (metadata), একটা id, এবং আগে-পরের কার্ডের সাথে বাঁধা সুতো (relationship) লাগানো আছে।

### কেন chunk size এত গুরুত্বপূর্ণ

কার্ড খুব ছোট হলে দরকারি প্রসঙ্গ (context) কেটে যায় — উত্তর অসম্পূর্ণ হয়। কার্ড খুব বড় হলে অপ্রাসঙ্গিক লেখা বেশি ঢোকে — search ঘোলাটে হয়, খরচও বাড়ে। তাই মাঝামাঝি size + সামান্য overlap রাখা হয়, যাতে এক কার্ড থেকে আরেক কার্ডে অর্থ হারিয়ে না যায়।

Chunking মানে বড় document ছোট ছোট অংশে ভাগ করা।

Example:

```txt
একটা ২০০ page PDF
  -> chapter/page ধরে text extract
  -> ৫০০-৮০০ token করে chunk
  -> overlap সহ chunk create
```

কেন chunk দরকার:

```txt
LLM পুরো PDF একসাথে নিতে পারে না
vector search ছোট meaning block-এ ভালো কাজ করে
citation page/chapter ধরে দেখানো সহজ হয়
irrelevant text কম যায়
```

LlamaIndex-এ অনেক সময় chunk-কে **Node** বলা হয়। Node শুধু text না, text-এর সাথে metadata/id/relationship রাখে।

```txt
Chunk = text-এর ছোট অংশ
Node  = text chunk + metadata + id + relationship
```

Node example:

```json
{
  "node_id": "node_001",
  "text": "আসরের নামাজ চার রাকাত ফরজ।",
  "metadata": {
    "document_id": "book_001",
    "page": 23,
    "topic": "salah",
    "verified_status": "verified"
  },
  "relationships": {
    "previous": "node_000",
    "next": "node_002"
  }
}
```

Node Parser কী:

```txt
Document Loader PDF/text load করে
Node Parser document কে structured node/chunk বানায়
Embedding model node text থেকে vector বানায়
Vector DB node + metadata save করে
```

Important:

```txt
Chunking strategy answer quality directly affect করে।
খুব ছোট chunk হলে context missing হয়।
খুব বড় chunk হলে irrelevant text বেশি যায়।
```

> 🧠 **মনে রাখার ট্রিক:** **Chunk = index card, Node = লেবেল+id+সুতোওয়ালা কার্ড।** কার্ড বেশি ছোট → context হারায়; বেশি বড় → আবর্জনা ঢোকে।

> ✅ **নিজেকে যাচাই করো:** chunk আর Node-এর মূল পার্থক্য এক লাইনে বলো তো?
> <details><summary>উত্তর দেখো</summary>
> Chunk হলো শুধু text-এর ছোট অংশ। Node হলো সেই text chunk + তার metadata + id + আগে-পরের node-এর সাথে relationship। মানে Node = chunk-এর সমৃদ্ধ (enriched) সংস্করণ, যা LlamaIndex-এ বেশি ব্যবহৃত হয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-9"></a>

## 09. Embedding Model, Cost, এবং Privacy Thinking

> 🎯 **এই section-এ বুঝব:** embedding model আসলে কী করে, এটা ব্যবহারে খরচ কেন বাড়ে, আর private document-এর ক্ষেত্রে privacy নিয়ে কেন সাবধান হতে হয়।

### 🌐 আগে একটা গল্প

Embedding model যেন একজন **অনুবাদক**, যে প্রতিটা বাক্যকে "অর্থের স্থানাঙ্ক" (সংখ্যার তালিকা) ভাষায় অনুবাদ করে দেয়। এখন এই অনুবাদক যদি বাইরের কোনো কোম্পানির অফিসে বসে থাকে (hosted API), তাহলে অনুবাদ করাতে প্রতিবার তোমার লেখা তার কাছে পাঠাতে হয় — এবং প্রতি পাঠানোয় সামান্য **ফি** লাগে। উল্টো দিকে তুমি চাইলে অনুবাদককে নিজের ঘরে বসাতে পারো (local model) — তখন লেখা বাইরে যায় না।

### কেন cost আর privacy নিয়ে ভাবতেই হয়

Document যত বড়, তত বেশি বাক্য অনুবাদ করাতে হয় → ingestion খরচ বাড়ে। প্রতিটা user প্রশ্নেও একবার করে অনুবাদ লাগে → query খরচ বাড়ে। আর fatwa/islamic source-এর মতো sensitive লেখা বাইরের API-তে পাঠানোর আগে অবশ্যই তাদের data policy বোঝা দরকার — নইলে গোপন তথ্য অজান্তে বাইরে চলে যেতে পারে।

Embedding model text-কে vector বানায়।

Example:

```txt
"আসরের নামাজ চার রাকাত ফরজ।"
  -> [0.12, -0.44, 0.87, ...]
```

Embedding দুই জায়গায় লাগে:

```txt
1. document chunk embed করার সময়
2. user question embed করার সময়
```

Options:

```txt
OpenAI embedding models
Gemini embedding models
local embedding models
sentence-transformers
```

Cost thinking:

```txt
Document যত বড়, ingestion cost তত বেশি
User query যত বেশি, query embedding cost তত বেশি
Free tier থাকলেও rate limit থাকে
Production app হলে pricing, quota, data policy check করতে হবে
```

`gemini-embedding-001` বা অন্য কোনো provider পুরোপুরি unlimited free ধরে plan করা ঠিক না। Learning/prototype-এ free tier use করা যায়, কিন্তু production-এর আগে official pricing, rate limit, data retention, privacy policy check করতে হবে।

Privacy thinking:

```txt
Sensitive/private document হলে provider policy বুঝুন
Islamic/fatwa source private হলে upload pipeline control করুন
enterprise/paid tier দরকার হতে পারে
local embedding model দরকার হতে পারে
```

Simple rule:

```txt
Learning = hosted embedding easy
Production = cost + privacy + rate limit check
Sensitive data = policy না বুঝে external API-তে পাঠাবেন না
```

> 🧠 **মনে রাখার ট্রিক:** Embedding model = **অর্থের অনুবাদক**। বাইরের অনুবাদক = সুবিধা কিন্তু ফি + তোমার লেখা বাইরে যায়; ঘরের অনুবাদক (local) = খরচ নেই, তথ্য গোপন থাকে।

> ✅ **নিজেকে যাচাই করো:** learning-এর সময় hosted embedding ঠিক আছে, কিন্তু sensitive fatwa document-এ কেন সাবধান হতে হয়?
> <details><summary>উত্তর দেখো</summary>
> কারণ embed করতে গেলে লেখাটা external provider-এর server-এ পাঠাতে হয়। Learning/prototype-এ এটা সমস্যা না, কিন্তু private/sensitive source-এর ক্ষেত্রে data কোথায় যাচ্ছে, কতদিন থাকছে (retention), কীভাবে ব্যবহৃত হচ্ছে — এসব policy না বুঝে পাঠানো ঝুঁকিপূর্ণ। দরকারে local embedding model বা paid/enterprise tier ব্যবহার করতে হয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-10"></a>

## 10. Vector DB Choose করার নিয়ম

> 🎯 **এই section-এ বুঝব:** এত রকম vector DB-র মধ্যে থেকে কোনটা কখন বেছে নেব, আর কেন শুরুতে ChromaDB দিয়ে শুরু করা বুদ্ধিমানের কাজ।

### 🚗 আগে একটা গল্প

কোথাও যেতে হলে তুমি কী বাহন নেবে? পাশের দোকানে গেলে **সাইকেল** যথেষ্ট, শহরে গেলে **গাড়ি**, আর মালবোঝাই দূরের চালানে দরকার **ট্রাক**। কেউ মুদি আনতে ট্রাক ভাড়া করে না, আবার কেউ আসবাব সরাতে সাইকেলে ভরসা করে না। Vector DB বাছাইও ঠিক তেমন — data-র আকার, filter-এর দরকার, আর scale অনুযায়ী বাহন বদলায়।

### কেন "সবচেয়ে বড়" নয়, "সবচেয়ে মানানসই"

শুরুতেই সবচেয়ে শক্তিশালী production DB বেছে নিলে setup জটিল হয়, শেখা আটকে যায়। ChromaDB হলো সেই "সাইকেল" — setup সহজ, Python app-এর সাথে দ্রুত মেলে, metadata filter আছে, আর শেখা ও প্রথম RAG backend-এর জন্য যথেষ্ট। পরে load বাড়লে Qdrant বা pgvector-এর মতো বড় বাহনে যাওয়া যায়। মনে রাখো — **RAG/vector DB আর relational app DB দুইটা আলাদা সিদ্ধান্ত**।

Vector DB choose করার আগে প্রশ্নগুলো:

```txt
1. data size কত?
2. metadata filter কত দরকার?
3. local/simple setup দরকার নাকি separate production service দরকার?
4. production scale লাগবে কি না?
5. self-host করবেন নাকি managed service?
6. team simple Python-based vector store দিয়ে শুরু করবে নাকি database infra manage করবে?
```

Common choices:

| Option | Best for | Strength | Weakness |
|---|---|---|---|
| ChromaDB | learning + first RAG backend | setup সহজ, Python app-এর সাথে quick, metadata filter আছে | large multi-tenant production-এ later migration লাগতে পারে |
| pgvector | MVP + normal production | PostgreSQL-এর ভিতর vector + relational data | massive scale-এ dedicated DB দরকার হতে পারে |
| Qdrant | serious production RAG | strong vector search + metadata/payload filter | আলাদা service maintain করতে হবে |
| FAISS | research/custom high performance | fast similarity search, GPU support | full database না, metadata/API নিজে করতে হবে |

প্রথমে দুইটা decision আলাদা করুন:

```txt
Vector/RAG database:
chunks, embeddings, metadata, similarity search

Relational app database:
users, roles, permissions, payments, admin audit, chat sessions, reports
```

এক project-এ দুইটাই থাকতে পারে:

```txt
ChromaDB = RAG chunks/search
PostgreSQL/SQLite/MySQL = app relational data
```

এই tutorial-এর জন্য practical suggestion:

```txt
Main database/vector store:
ChromaDB

App বড় হলে optional relational DB:
PostgreSQL / SQLite

Scale বড় হলে:
Qdrant

Relational vector setup চাইলে:
PostgreSQL + pgvector

Research/high-performance custom index চাইলে:
FAISS
```

কেন ChromaDB দিয়ে শুরু করছি:

```txt
chunks
embeddings
metadata
collections
persistent local storage
semantic search
metadata filtering
```

ChromaDB দিয়ে আপনি খুব দ্রুত এই flow বানাতে পারবেন:

```txt
PDF text
  -> chunks
  -> embeddings
  -> ChromaDB collection
  -> query embedding
  -> similarity search
  -> answer with citation
```

Important limitation:

```txt
ChromaDB vector/RAG store হিসেবে ভালো।
কিন্তু user auth, payment, admin audit, complex relational report এগুলোর জন্য আলাদা app database দরকার হতে পারে।
```

এই tutorial-এ "database" বলতে main RAG database হিসেবে **ChromaDB** ধরা হবে। Production app বড় হলে ChromaDB-এর পাশে PostgreSQL/SQLite add করা যায়।

> 🧠 **মনে রাখার ট্রিক:** Vector DB = **বাহন বাছাই** — কাজ অনুযায়ী সাইকেল/গাড়ি/ট্রাক। শুরুতে ChromaDB (সাইকেল), scale বাড়লে Qdrant (ট্রাক)।

> ✅ **নিজেকে যাচাই করো:** users, permissions, payment — এগুলো কি ChromaDB-তে রাখা উচিত?
> <details><summary>উত্তর দেখো</summary>
> না। ChromaDB হলো RAG chunks/embedding/metadata আর similarity search-এর জন্য। users, roles, payment, admin audit-এর মতো relational data-র জন্য আলাদা relational app database (PostgreSQL/SQLite) লাগে। এক project-এ দুইটাই পাশাপাশি থাকতে পারে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-11"></a>

## 11. Recommended Stack: Learning থেকে Production

> 🎯 **এই section-এ বুঝব:** কোন ধাপে কী tool যোগ করব — শেখা থেকে production পর্যন্ত একটা নিরাপদ, ধাপে-ধাপে path।

### 🚼 আগে একটা গল্প

বাচ্চা আগে **হামাগুড়ি** দেয়, তারপর **হাঁটে**, তারপর **দৌড়ায়** — কেউ প্রথম দিনেই দৌড় শুরু করে না। RAG শেখাও তেমন। Phase 1-এ শুধু FastAPI + ChromaDB দিয়ে হাত পাকাও (হামাগুড়ি), তারপর metadata/citation যোগ করো (হাঁটা), শেষে reranker/agent (দৌড়)। প্রতিটা ধাপ আগেরটার ওপর দাঁড়ায়।

### কেন ধাপে ধাপে

কারণ একসাথে সব tool (LangChain + Qdrant + multi-agent + relational DB) নিলে কোথায় সমস্যা হলো ধরাই যায় না, শেখাও থেমে যায়। ছোট working system আগে বানালে প্রতিটা নতুন layer কী সমস্যা সমাধান করছে সেটা তুমি নিজের চোখে বুঝতে পারো — তখন যোগ করা সহজ ও অর্থবহ হয়।

Learning path:

```txt
Phase 1:
FastAPI + ChromaDB দিয়ে manual RAG flow দেখা

Phase 2:
PDF upload + ChromaDB persistent collection দিয়ে custom RAG বানানো

Phase 3:
metadata filter + citation + admin verified source add করা

Phase 4:
reranker, hybrid search, answer verifier add করা

Phase 5:
complex need হলে app database, Qdrant, বা agent layer add করা
```

Fatwa GPT MVP stack:

```txt
Frontend:
Next.js অথবা Expo React Native

Backend:
FastAPI

RAG database/vector store:
ChromaDB

Optional relational app database:
PostgreSQL / SQLite / MySQL

File storage:
local folder / S3 / Supabase storage

Embedding:
OpenAI/Gemini/local embedding model

LLM:
OpenAI/Gemini/local model

RAG framework:
custom code first, LangChain/LlamaIndex optional
```

Starting architecture:

```txt
FastAPI
  -> ChromaDB persistent collection
  -> optional relational app database
  -> custom embedding/search service
  -> custom prompt/citation system
```

এই path learning এবং first implementation সহজ রাখে। পরে user/auth/admin audit/reporting complex হলে ChromaDB-এর পাশে relational app database add করা যাবে।

> 🧠 **মনে রাখার ট্রিক:** **হামাগুড়ি → হাঁটা → দৌড়।** FastAPI+ChromaDB আগে, তারপর metadata/citation, শেষে rerank/agent। এক ধাপে সব নয়।

> ✅ **নিজেকে যাচাই করো:** প্রথম দিনেই multi-agent + Qdrant + LangChain একসাথে না নেওয়ার কারণ কী?
> <details><summary>উত্তর দেখো</summary>
> কারণ তখন কোনো সমস্যা হলে সেটা কোন অংশ থেকে এলো বোঝা কঠিন, শেখার গতি কমে যায়, আর প্রতিটা layer আসলে কী দরকার মেটাচ্ছে তা স্পষ্ট হয় না। ছোট working system আগে বানালে প্রতিটা নতুন layer-এর প্রয়োজন নিজে থেকেই বোঝা যায়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-12"></a>

## 12. FastAPI Project Setup with uv

> 🎯 **এই section-এ বুঝব:** `uv` দিয়ে কীভাবে পরিষ্কারভাবে project তৈরি ও dependency যোগ করব, আর কোন file কী কাজ করে।

### 🧑‍🍳 আগে একটা গল্প

ভালো রাঁধুনি রান্না শুরুর আগে সব উপকরণ মেপে বাটিতে সাজিয়ে রাখেন (mise en place) — তখন রান্নার সময় হুড়োহুড়ি হয় না। `uv` হলো তোমার সেই **স্মার্ট রসুইঘর ম্যানেজার**: সে ঠিক Python version এনে দেয়, প্রতিটা package গুছিয়ে যোগ করে, আর `uv.lock`-এ লিখে রাখে ঠিক কোন version ব্যবহার হলো — যাতে অন্য মেশিনেও হুবহু একই রান্না হয়।

### কেন uv আর lock file

কারণ "আমার মেশিনে চলছিল" সমস্যা এড়াতে হলে সবার একই version লাগবে। `uv.lock` সেই version-গুলো তালাবদ্ধ করে রাখে, `.python-version` Python-টা ঠিক করে, আর `.env` গোপন key আলাদা রাখে — যাতে কখনো code-এ hardcode করে ফাঁস না হয়।

FastAPI backend setup-এর জন্য `uv` use করবো।

Project create:

```bash
uv init rag-backend
cd rag-backend
```

Python pin:

```bash
uv python install 3.12
uv python pin 3.12
```

Dependencies:

```bash
uv add "fastapi[standard]" uvicorn python-dotenv pydantic
uv add chromadb
uv add pypdf python-multipart
uv add openai
uv add pytest httpx
```

Optional dependencies:

```bash
uv add llama-index
uv add langchain
```

Optional relational app database dependencies:

```bash
uv add sqlalchemy alembic
uv add psycopg[binary]    # PostgreSQL হলে
```

Run server:

```bash
uv run uvicorn app.main:app --reload
```

Test:

```bash
uv run pytest
```

Important files:

```txt
pyproject.toml   = dependencies/project config
uv.lock          = locked dependency versions
.python-version  = selected Python version
.env             = local secrets/config
```

Rule:

```txt
Secret key, API key, database URL কখনো code-এ hardcode করবেন না।
```

> 🧠 **মনে রাখার ট্রিক:** `uv` = **স্মার্ট রসুইঘর ম্যানেজার** (mise en place)। `uv.lock` সব version তালাবদ্ধ রাখে, `.env` গোপন key আলাদা রাখে।

> ✅ **নিজেকে যাচাই করো:** `uv.lock` file-টা কেন দরকার?
> <details><summary>উত্তর দেখো</summary>
> এটা প্রতিটা dependency-র ঠিক কোন version ব্যবহার হচ্ছে তা তালাবদ্ধ করে রাখে। ফলে অন্য developer বা server-এ project চালালে হুবহু একই version install হয় — "আমার মেশিনে চলছিল" ধরনের version mismatch সমস্যা হয় না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-13"></a>

## 13. Folder Structure: RAG Backend সাজানো

> 🎯 **এই section-এ বুঝব:** RAG backend-এর কোড কেন আলাদা আলাদা folder-এ ভাগ করি, আর প্রতিটা folder-এর দায়িত্ব কী।

### 🗄️ আগে একটা গল্প

ভাবো একটা রান্নাঘরে সব জিনিস — চামচ, মশলা, বাসন, বিল — একটাই ড্রয়ারে ঠেসে রাখা। কিছু খুঁজতে গেলেই বিশৃঙ্খলা। ভালো রান্নাঘরে প্রতিটা ড্রয়ারের একটা কাজ থাকে। RAG backend-ও তাই: `api/routes` দরজায় order নেয়, `services` রান্না করে, `repositories` গুদাম সামলায়, `rag` chunk/prompt-এর যন্ত্রপাতি রাখে। প্রতিটা folder = একটা নির্দিষ্ট কাজের ড্রয়ার।

### কেন এভাবে ভাগ করি

কারণ এক route file-এর ভিতর upload + parse + chunk + embed + DB save + answer — সব একসাথে লিখলে সেটা পড়া, test করা, বা ঠিক করা দুঃস্বপ্ন হয়ে যায়। দায়িত্ব ভাগ করলে (separation of concerns) প্রতিটা অংশ আলাদাভাবে বোঝা, বদলানো ও test করা যায়।

Clean structure:

```txt
app/
  main.py
  core/
    config.py
    security.py
  db/
    session.py
    base.py
  api/
    v1/
      routes/
        documents.py
        chat.py
        admin.py
  models/
    document.py
    chunk.py
    chat.py
  schemas/
    document.py
    chat.py
  services/
    ingestion_service.py
    embedding_service.py
    retrieval_service.py
    answer_service.py
    citation_service.py
    verification_service.py
  repositories/
    document_repository.py
    chunk_repository.py
  rag/
    chunker.py
    text_extractors.py
    prompt_templates.py
  tests/
```

Responsibility:

| Folder | কাজ |
|---|---|
| `api/routes` | HTTP endpoint |
| `schemas` | request/response validation |
| `models` | DB table |
| `services` | business/RAG logic |
| `repositories` | DB query |
| `rag` | chunking, prompt, extractor helper |
| `core` | config/security |

Bad pattern:

```txt
একটা route file-এর ভিতর upload + PDF parse + chunk + embed + DB save + answer সব লেখা
```

Good pattern:

```txt
Route শুধু request নেয়
Service flow manage করে
Repository DB handle করে
RAG helper chunk/prompt কাজ করে
```

> 🧠 **মনে রাখার ট্রিক:** প্রতিটা folder = **একটা কাজের ড্রয়ার**। Route দরজায় order নেয়, Service রান্না করে, Repository গুদাম সামলায়। এক ড্রয়ারে সব ঠাসা = বিশৃঙ্খলা।

> ✅ **নিজেকে যাচাই করো:** একটাই route file-এ upload + parse + embed + save + answer সব লেখার সমস্যা কী?
> <details><summary>উত্তর দেখো</summary>
> এটা পড়া, test করা আর debug করা কঠিন হয়ে পড়ে; একটা অংশ বদলাতে গেলে বাকি সব ভাঙার ঝুঁকি থাকে। দায়িত্ব ভাগ করলে (route শুধু request, service flow, repository DB, rag helper) প্রতিটা অংশ স্বাধীনভাবে বোঝা ও পরিবর্তন করা যায়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-14"></a>

## 14. ChromaDB Collection Design: Documents এবং Chunks

> 🎯 **এই section-এ বুঝব:** ChromaDB-তে collection কী, একটা chunk record-এ কী কী থাকে, আর কী রাখা উচিত ও কী রাখা উচিত না।

### 📦 আগে একটা গল্প

ChromaDB টেবিল-সারিওয়ালা relational database না। এটাকে ভাবো একটা বড় **লেবেলওয়ালা বাক্স** যার নাম `fatwa_chunks` (এটাই **collection**)। বাক্সের ভিতর অজস্র index card, প্রতিটা কার্ডে চারটা জিনিস আঠা দিয়ে সাঁটা: একটা **id** (কার্ড নম্বর), **document** (লেখা), **embedding** (অর্থের স্থানাঙ্ক), আর **metadata** (গায়ের লেবেল)। খুঁজতে গেলে বাক্সটা প্রশ্নের স্থানাঙ্কের কাছাকাছি কার্ডগুলো টেনে দেয়।

### কেন সব কিছু এই বাক্সে রাখব না

কারণ প্রতিটা বাক্সের একটা উদ্দেশ্য থাকে। chunk text, embedding, source metadata — এগুলো এই বাক্সের জন্য ঠিক। কিন্তু password, payment, বা admin audit log-এর একমাত্র কপি এখানে রাখা বিপজ্জনক ও ভুল জায়গা — ওগুলোর জন্য আলাদা secure relational database লাগে।

ChromaDB table-based relational database না। এখানে main concept হলো **collection**।

একটা collection-এর ভিতরে প্রতিটি chunk save হবে এই parts নিয়ে:

```txt
id         = unique chunk id
document  = chunk text
embedding = chunk text-এর vector
metadata  = source/filter/citation info
```

Collection name:

```txt
fatwa_chunks
```

ChromaDB persistent client:

```python
import chromadb

chroma_client = chromadb.PersistentClient(path="./chroma_store")

collection = chroma_client.get_or_create_collection(
    name="fatwa_chunks",
    metadata={"description": "Verified and pending Fatwa GPT document chunks"},
)
```

Chunk record design:

```json
{
  "id": "fatwa_book_001_chunk_0005",
  "document": "আসরের নামাজ চার রাকাত ফরজ।",
  "embedding": [0.12, -0.44, 0.87],
  "metadata": {
    "document_id": "fatwa_book_001",
    "title": "ফিকহুস সালাত",
    "source_name": "ফিকহুস সালাত",
    "author": "শাইখ ...",
    "page_number": 23,
    "chapter": "সালাত",
    "topic": "salah",
    "madhhab": "hanafi",
    "language": "bn",
    "verified_status": "verified",
    "chunk_index": 5
  }
}
```

Add records:

```python
collection.add(
    ids=["fatwa_book_001_chunk_0005"],
    documents=["আসরের নামাজ চার রাকাত ফরজ।"],
    embeddings=[[0.12, -0.44, 0.87]],
    metadatas=[
        {
            "document_id": "fatwa_book_001",
            "title": "ফিকহুস সালাত",
            "source_name": "ফিকহুস সালাত",
            "author": "শাইখ ...",
            "page_number": 23,
            "chapter": "সালাত",
            "topic": "salah",
            "madhhab": "hanafi",
            "language": "bn",
            "verified_status": "verified",
            "chunk_index": 5,
        }
    ],
)
```

Query with metadata filter:

```python
results = collection.query(
    query_embeddings=[query_embedding],
    n_results=8,
    where={
        "$and": [
            {"verified_status": "verified"},
            {"language": "bn"},
            {"topic": "salah"},
        ]
    },
)
```

ChromaDB-তে রাখতে পারেন:

```txt
chunk text
embedding
source metadata
verified_status
page/chapter/topic
citation information
```

ChromaDB-তে না রাখাই ভালো:

```txt
password
payment data
complex user permission graph
admin audit log-এর only copy
large raw PDF binary
```

Important rule:

```txt
ChromaDB RAG chunks/search-এর source of truth হতে পারে।
কিন্তু full SaaS/app data-এর জন্য future-এ relational app database দরকার হতে পারে।
```

> 🧠 **মনে রাখার ট্রিক:** Collection = **লেবেলওয়ালা বাক্স**; প্রতিটা কার্ডে **id + document + embedding + metadata**। password/payment এই বাক্সে নয় — আলাদা secure DB-তে।

> ✅ **নিজেকে যাচাই করো:** ChromaDB-র একটা chunk record-এ মূলত কোন চারটা অংশ থাকে?
> <details><summary>উত্তর দেখো</summary>
> id (unique chunk id), document (chunk-এর text), embedding (ওই text-এর vector), আর metadata (source/filter/citation info)। এই চারটা মিলেই এক-একটা searchable কার্ড তৈরি হয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-15"></a>

## 15. Ingestion Pipeline: PDF থেকে Vector Store

> 🎯 **এই section-এ বুঝব:** একটা PDF কীভাবে ধাপে ধাপে সার্চযোগ্য chunk-এ পরিণত হয়, আর কেন upload হওয়া মানেই "verified" নয়।

### 🏭 আগে একটা গল্প

Ingestion pipeline যেন একটা **কারখানার conveyor belt**। এক মাথায় ঢোকে কাঁচা PDF, তারপর ধাপে ধাপে: file যাচাই → text বের করা → পরিষ্কার করা → ছোট কার্ডে (chunk) কাটা → গায়ে লেবেল (metadata) সাঁটা → অর্থের স্থানাঙ্ক (embedding) বানানো → বাক্সে (vector store) তুলে রাখা। শেষ ধাপে একজন **quality inspector (admin)** সিল মারে "verified"।

### কেন upload = verified নয়

কারণ যে কেউ ভুল বা অযাচাই বই তুলে দিতে পারে। fatwa-র মতো জায়গায় অযাচাই source থেকে উত্তর দেওয়া বিপজ্জনক। তাই প্রতিটা chunk প্রথমে `pending` অবস্থায় থাকে; admin/source team রিভিউ করে metadata-তে `verified_status` বদলায়। খেয়াল করো — code-এ প্রতি chunk আলাদা embed না করে **batch embedding** নেওয়া হয়, যাতে দ্রুত হয় ও rate-limit-এ চাপ কম পড়ে।

Ingestion pipeline-এর কাজ হলো document system-এ ঢোকানো।

Flow:

```txt
Upload file
  -> validate file type/size
  -> save file
  -> extract text
  -> clean text
  -> split into chunks/nodes
  -> attach metadata
  -> create embeddings
  -> save chunks + embeddings
  -> mark status pending/verified
```

Pseudo service:

```python
async def ingest_document(file, metadata, current_user):
    document_id = create_document_id()
    text_pages = extract_text_from_pdf(file)
    chunks = chunk_text_pages(text_pages, metadata)

    ids = []
    documents = []
    metadatas = []

    for index, chunk in enumerate(chunks):
        chunk_id = f"{document_id}_chunk_{index:04d}"

        ids.append(chunk_id)
        documents.append(chunk.text)
        metadatas.append(
            {
                "document_id": document_id,
                "title": metadata.title,
                "author": metadata.author,
                "source_name": metadata.source_name,
                "page_number": chunk.page_number,
                "chapter": chunk.chapter,
                "topic": metadata.topic,
                "madhhab": metadata.madhhab,
                "language": metadata.language,
                "verified_status": "pending",
                "chunk_index": index,
                "uploaded_by": str(current_user.id),
            }
        )

    # প্রতি chunk-এ আলাদা করে embedding call না করে একবারে batch embedding নিই।
    # এতে অনেক দ্রুত হয় এবং API rate-limit-এ কম চাপ পড়ে।
    embeddings = await embedding_service.create_embeddings(documents)

    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )

    return {"document_id": document_id, "chunks": len(chunks)}
```

Admin verification:

```txt
Upload হওয়ার সাথে সাথে source verified ধরে নিবেন না।
Admin/source team review করে ChromaDB metadata-তে `verified_status` update করবে।
```

Statuses:

```txt
pending
verified
rejected
needs_review
```

Fatwa GPT rule:

```txt
User-facing answer শুধু verified source থেকে আসা উচিত।
```

> 🧠 **মনে রাখার ট্রিক:** Ingestion = **conveyor belt**: PDF → text → clean → chunk → label → embed → store → **inspector-এর verified সিল**। Upload মানেই verified না।

> ✅ **নিজেকে যাচাই করো:** নতুন upload হওয়া document-এর `verified_status` শুরুতে কী থাকা উচিত, আর কে সেটা বদলাবে?
> <details><summary>উত্তর দেখো</summary>
> শুরুতে `pending` থাকা উচিত — কারণ upload মানেই source নির্ভরযোগ্য নয়। admin বা source-review team document যাচাই করে ChromaDB metadata-তে `verified_status` কে `verified` (বা rejected/needs_review) করবে। user-facing answer শুধু verified chunk থেকে আসা উচিত।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-16"></a>

## 16. Retrieval Pipeline: User Question থেকে Context

> 🎯 **এই section-এ বুঝব:** user-এর একটা প্রশ্ন থেকে কীভাবে ঠিক প্রাসঙ্গিক chunk খুঁজে এনে LLM-এর জন্য context বানানো হয়।

### 🔎 আগে একটা গল্প

ভাবো একজন **দক্ষ লাইব্রেরিয়ান**। পাঠক প্রশ্ন করলে সে প্রথমে প্রশ্নটা মন দিয়ে বোঝে (normalize), তারপর ঠিক করে কোন তাক-এ (verified, বাংলা, salah বিষয়) খুঁজবে (metadata filter), তারপর প্রশ্নের অর্থের কাছাকাছি কার্ডগুলো টেনে আনে (vector search), সবচেয়ে ভালো কয়েকটা বেছে নেয় (top_k / rerank), আর সেগুলো সাজিয়ে হাতে তুলে দেয় (context build)। Retrieval pipeline ঠিক এই লাইব্রেরিয়ানের কাজ করে।

### কেন এত ধাপ

কারণ শুধু "অর্থে মিল" যথেষ্ট নয়। filter না দিলে অযাচাই বা ভুল ভাষার chunk আসতে পারে; খুব বেশি chunk আনলে context লম্বা ও ঘোলাটে হয়; duplicate থাকলে LLM বিভ্রান্ত হয়। ভালো retrieval মানে — প্রাসঙ্গিক, verified, citation-সহ, duplicate-কম, আর manageable দৈর্ঘ্যের context।

Retrieval pipeline user question থেকে relevant chunks আনে।

Flow:

```txt
User question
  -> normalize question
  -> optional topic detect
  -> create question embedding
  -> apply metadata filters
  -> vector similarity search
  -> top_k chunks
  -> optional rerank
  -> context build
```

Pseudo service:

```python
async def retrieve_context(question: str, filters: dict):
    query_embedding = await embedding_service.create_embedding(question)

    where_filter = {
        "$and": [
            {"verified_status": "verified"},
            {"language": filters.get("language", "bn")},
        ]
    }

    if filters.get("topic"):
        where_filter["$and"].append({"topic": filters["topic"]})

    if filters.get("madhhab"):
        where_filter["$and"].append({"madhhab": filters["madhhab"]})

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=8,
        where=where_filter,
        include=["documents", "metadatas", "distances"],
    )

    chunks = normalize_chroma_results(results)
    return build_context(chunks)
```

ChromaDB result থেকে সাধারণত এগুলো normalize করতে হবে:

```txt
documents[0] -> matched chunk texts
metadatas[0] -> source/citation metadata
distances[0] -> similarity distance
ids[0] -> chunk ids
```

Context object:

```json
{
  "question": "আসরের নামাজ কয় রাকাত?",
  "chunks": [
    {
      "text": "আসরের নামাজ চার রাকাত ফরজ।",
      "source_name": "ফিকহুস সালাত",
      "page_number": 23,
      "topic": "salah",
      "chunk_id": "fatwa_book_001_chunk_0005"
    }
  ]
}
```

Good retrieval:

```txt
relevant text আনে
verified source আনে
metadata/citation সহ আনে
duplicate কম আনে
context length manageable রাখে
```

> 🧠 **মনে রাখার ট্রিক:** Retrieval = **দক্ষ লাইব্রেরিয়ান** — বোঝো (normalize) → তাক বাছো (filter) → কার্ড টানো (vector search) → সেরাগুলো বাছো (rerank) → সাজিয়ে দাও (context)।

> ✅ **নিজেকে যাচাই করো:** vector search-এর আগে metadata filter দেওয়ার লাভ কী?
> <details><summary>উত্তর দেখো</summary>
> এটা খোঁজার আগেই অযাচাই বা অপ্রাসঙ্গিক chunk বাদ দিয়ে দেয় — যেমন শুধু verified, নির্দিষ্ট ভাষা বা topic-এর মধ্যে সীমা বাঁধা। ফলে similarity search আরও নির্ভুল result দেয়, ভুল বা অননুমোদিত source উত্তরে ঢোকার সুযোগ কমে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-17"></a>

## 17. Prompt with Context এবং Citation

> 🎯 **এই section-এ বুঝব:** কীভাবে prompt লিখে LLM-কে বাধ্য করব শুধু দেওয়া context থেকে উত্তর দিতে এবং সূত্র (citation) দেখাতে।

### 📝 আগে একটা গল্প

Open-book পরীক্ষায় পরীক্ষক যদি বলে দেয়: "শুধু এই কয়েকটা পাতা দেখে উত্তর লিখবে, নিজে থেকে কিছু বানাবে না, আর প্রতিটা দাবির পাশে পৃষ্ঠা নম্বর লিখবে" — তাহলে ছাত্র সীমার বাইরে যেতে পারে না। Prompt হলো সেই **কঠোর পরীক্ষকের নির্দেশনা**। এটা LLM-কে বলে দেয়: এই context-ই তোমার একমাত্র বই; না পেলে বলবে "source insufficient"।

### কেন citation আলাদা field-এ

কারণ শুধু সুন্দর উত্তর যথেষ্ট নয় — উত্তরটা যাচাইযোগ্য হতে হবে। citation যদি শুধু লেখার মধ্যে মিশে থাকে, frontend সেটা আলাদা করে দেখাতে বা যাচাই করতে পারে না। তাই answer-এর পাশে citation-কে structured data (আলাদা field) হিসেবে ফেরত দেওয়া হয়।

RAG prompt-এর goal হলো LLM-কে force করা যেন সে retrieved context থেকে answer দেয়।

Basic prompt:

```txt
You are answering using only the provided context.
If the context does not contain the answer, say that the source is insufficient.

Question:
{question}

Context:
{context_chunks}

Answer in Bangla.
Include citation after each key claim.
```

Fatwa GPT prompt rule:

```txt
Context-এর বাইরে নতুন fatwa বানানো যাবে না।
Source insufficient হলে স্পষ্ট বলতে হবে।
Sensitive question হলে admin review suggest করতে হবে।
```

Citation format:

```txt
উত্তর:
আসরের নামাজ চার রাকাত ফরজ।

সূত্র:
ফিকহুস সালাত, সালাত অধ্যায়, পৃষ্ঠা ২৩
```

Better citation object:

```json
{
  "answer": "আসরের নামাজ চার রাকাত ফরজ।",
  "citations": [
    {
      "source_name": "ফিকহুস সালাত",
      "chapter": "সালাত",
      "page_number": 23,
      "chunk_id": "chunk_001"
    }
  ],
  "confidence": "context_supported"
}
```

Rule:

```txt
Answer UI-তে শুধু text না, citation data আলাদা field হিসেবে return করুন।
```

> 🧠 **মনে রাখার ট্রিক:** Prompt = **কঠোর পরীক্ষকের নির্দেশনা** — "শুধু এই পাতা দেখে লেখো, না পেলে বলো insufficient, প্রতিটা দাবির পাশে সূত্র দাও"।

> ✅ **নিজেকে যাচাই করো:** context-এ প্রশ্নের উত্তর না থাকলে prompt অনুযায়ী LLM-এর কী করা উচিত?
> <details><summary>উত্তর দেখো</summary>
> নিজে থেকে উত্তর বানানো যাবে না। LLM-কে স্পষ্ট বলতে হবে যে source/context যথেষ্ট নয় (source insufficient)। fatwa-র মতো sensitive ক্ষেত্রে এটা দরকারে admin review-ও suggest করবে — বানানো (hallucinated) উত্তর দেওয়ার চেয়ে "জানি না" বলা নিরাপদ।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-18"></a>

## 18. LangChain: কখন লাগবে, কখন লাগবে না

> 🎯 **এই section-এ বুঝব:** LangChain আসলে কী, এটা RAG-এর জন্য বাধ্যতামূলক কিনা, আর কখন এটা ব্যবহার করা বুদ্ধিমানের কাজ।

### 🧰 আগে একটা গল্প

আসবাব বানাতে তুমি চাইলে কাঠ কেটে, স্ক্রু ঘুরিয়ে হাতে বানাতে পারো (custom code), আবার চাইলে একটা **রেডিমেড কিট + পাওয়ার টুল** কিনতে পারো যেখানে টুকরোগুলো আগে থেকে মাপা (LangChain)। কিট দ্রুত কাজ করায়, বিশেষত যখন তুমি নতুন বা প্রোটোটাইপ বানাচ্ছ। কিন্তু আসবাব বানানোর জন্য কিট **বাধ্যতামূলক না** — হাতেও নিখুঁত করা যায়।

### কেন এটা optional

RAG-এর আসল বাধ্যতামূলক অংশগুলো (chunk, embedding, vector search, prompt, answer) LangChain ছাড়াও বানানো যায়। LangChain শুধু এই অংশগুলো জোড়া লাগানো সহজ করে — DocumentLoader, TextSplitter, Retriever ইত্যাদি রেডি দেয়। দ্রুত prototype বা DB/LLM সহজে বদলাতে চাইলে ভালো; কিন্তু dependency কম, debug সহজ আর custom citation logic চাইলে custom code বেশি মানানসই।

LangChain RAG-এর mandatory part না। LangChain হলো framework/helper library।

RAG mandatory parts:

```txt
Document/text
Chunking
Embedding model
Vector store/search
Retrieved context
LLM prompt
Final answer
```

LangChain এগুলো connect করতে সাহায্য করে:

```txt
DocumentLoader
TextSplitter
Embedding wrapper
VectorStore wrapper
Retriever
PromptTemplate
Chain
Tool calling
```

কখন LangChain use করবেন:

```txt
RAG flow দ্রুত prototype করতে চান
বিভিন্ন vector DB test করতে চান
PDF/website/doc loader ready চাই
OpenAI/Gemini/Ollama সহজে switch করতে চান
tool calling বা chain composition দরকার
```

কখন LangChain লাগবে না:

```txt
Simple production RAG flow
FastAPI + ChromaDB/custom vector store code লিখতে চান
dependency কম রাখতে চান
debug সহজ রাখতে চান
custom citation/metadata logic বেশি important
```

Fatwa GPT recommended approach:

```txt
Learning:
LangChain + ChromaDB দিয়ে flow বুঝুন

MVP:
FastAPI + ChromaDB + custom retrieval code

Advanced:
reranker + metadata filter + verifier + citation system
```

Simple rule:

```txt
RAG বানাতে LangChain লাগে না।
RAG দ্রুত বানাতে LangChain help করে।
Production-grade RAG-এ LangChain optional।
```

> 🧠 **মনে রাখার ট্রিক:** LangChain = **রেডিমেড আসবাব কিট + পাওয়ার টুল**। দ্রুত বানায়, কিন্তু বাধ্যতামূলক না — হাতেও (custom code) বানানো যায়।

> ✅ **নিজেকে যাচাই করো:** "RAG বানাতে হলে LangChain লাগবেই" — কথাটা কি ঠিক?
> <details><summary>উত্তর দেখো</summary>
> না। RAG-এর মূল অংশগুলো (chunk, embedding, vector search, prompt, answer) LangChain ছাড়াও বানানো যায়। LangChain কেবল এগুলো দ্রুত জোড়া লাগাতে সাহায্য করে — তাই এটা helpful, কিন্তু optional। বিশেষত custom citation/metadata logic বেশি জরুরি হলে custom code ভালো।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-19"></a>

## 19. LlamaIndex: Metadata, Node Parser, Query Engine

> 🎯 **এই section-এ বুঝব:** LlamaIndex কীসের জন্য বিশেষভাবে ভালো, LangChain-এর সাথে এর পার্থক্য কী, আর metadata নিয়ে একটা ভুল ধারণা ভাঙব।

### 📇 আগে একটা গল্প

LangChain যদি হয় সাধারণ পাওয়ার-টুল কিট, তাহলে LlamaIndex হলো একজন **বিশেষজ্ঞ লাইব্রেরিয়ান** যার একমাত্র ধ্যান-জ্ঞান document সামলানো — বই লোড করা, কার্ডে ভাগ করা (Node Parser), সাজানো, আর প্রশ্ন এলে দ্রুত খুঁজে দেওয়া (query engine)। document-ভারী RAG-এ এই বিশেষজ্ঞ খুব কাজে দেয়।

### কেন "metadata লাগে না" ধারণাটা ভুল

অনেকে ভাবে LlamaIndex ব্যবহার করলে metadata নিয়ে ভাবতে হয় না। সঠিকটা হলো — LlamaIndex file name, page-এর মতো কিছু metadata নিজে ধরতে পারে, কিন্তু author, madhhab, verified_status-এর মতো **domain-specific** লেবেল তোমাকেই দিতে হবে। মানে এটা metadata সামলানো *সহজ* করে, metadata-র *দরকার শেষ* করে না।

LlamaIndex হলো RAG/data framework। এর focus হলো private data load, parse, index, retrieve, query engine তৈরি করা।

Mental model:

```txt
Document
  -> Loader
  -> Node Parser
  -> Nodes
  -> Embedding
  -> Vector Store
  -> Retriever / Query Engine
  -> LLM answer
```

LangChain vs LlamaIndex:

| বিষয় | LangChain | LlamaIndex |
|---|---|---|
| main focus | LLM app orchestration | data indexing + retrieval |
| best for | chains, tools, agents, workflow | document QA, RAG, knowledge base |
| data handling | আছে | primary focus |
| agent workflow | strong | আছে, কিন্তু primary focus না |
| beginner RAG | ভালো | খুব ভালো |

LlamaIndex use করলে metadata লাগে না, এটা ভুল। সঠিকটা:

```txt
LlamaIndex metadata manage করা সহজ করে।
Metadata-এর দরকার শেষ করে না।
```

LlamaIndex কিছু metadata automatically ধরতে পারে:

```txt
file name
page info
document id
```

কিন্তু domain-specific metadata আপনাকেই দিতে হবে:

```txt
author
madhhab
fatwa_category
verified_status
source_reliability
book_volume
page_number
```

LlamaIndex use করবেন যখন:

```txt
document-heavy RAG
PDF/book ingestion দরকার
query engine দ্রুত বানাতে চান
citation/source tracking দরকার
chunking/retrieval framework চাই
```

Custom code use করবেন যখন:

```txt
retrieval logic খুব custom
FastAPI + ChromaDB/custom vector store full control চান
dependency কম রাখতে চান
production debug predictable রাখতে চান
```

> 🧠 **মনে রাখার ট্রিক:** LlamaIndex = **document-বিশেষজ্ঞ লাইব্রেরিয়ান**। কিছু metadata নিজে ধরে, কিন্তু domain লেবেল (author/madhhab/verified) তোমাকেই দিতে হবে।

> ✅ **নিজেকে যাচাই করো:** "LlamaIndex ব্যবহার করলে আর metadata নিয়ে ভাবতে হয় না" — এটা কি সত্য?
> <details><summary>উত্তর দেখো</summary>
> না। LlamaIndex metadata manage করা সহজ করে এবং file name/page-এর মতো কিছু জিনিস নিজে ধরতে পারে, কিন্তু author, madhhab, fatwa_category, verified_status-এর মতো domain-specific metadata তোমাকেই দিতে হয়। এটা metadata-র দরকার শেষ করে না, শুধু সামলানো সহজ করে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-20"></a>

## 20. Multi-Step RAG Pipeline vs Multi-Agent

> 🎯 **এই section-এ বুঝব:** "একের পর এক ধাপ" (multi-step pipeline) আর "অনেক agent মিলে সিদ্ধান্ত" (multi-agent) — এই দুইটা যে এক নয়, তা পরিষ্কার হবে।

### 🏭 আগে একটা গল্প

দুইভাবে কাজ হতে পারে। এক, **অ্যাসেম্বলি লাইন** — প্রতিটা জিনিস একই ধাপগুলো একই ক্রমে পার হয়, কোনো বদল নেই (multi-step RAG pipeline)। দুই, **একদল বিশেষজ্ঞের মিটিং** — কেউ প্রশ্ন ভাগ করে, কেউ যাচাই করে, কেউ সিদ্ধান্ত নেয়, আলোচনা করে পথ বদলায় (multi-agent)। মিটিং শক্তিশালী কিন্তু ধীর, দামি আর অনিশ্চিত।

### কেন MVP-তে pipeline আগে

কারণ অ্যাসেম্বলি লাইন predictable, সস্তা, দ্রুত আর সহজে debug হয় — production MVP আর citation RAG-এর জন্য যথেষ্ট। multi-agent তখনই দরকার যখন প্রতিবার আলাদা পথ/সিদ্ধান্ত লাগে (জটিল reasoning, conflict handling)। শুরুতে agent নিলে খরচ, latency আর hallucination/loop-এর ঝুঁকি অকারণে বাড়ে।

Multi-step RAG pipeline আর multi-agent এক জিনিস না।

Main difference:

```txt
Multi-step RAG pipeline = fixed workflow
Multi-agent = multiple LLM roles/agents with decision-making
```

Multi-step RAG:

```txt
User question
  -> query normalize
  -> metadata filter
  -> vector search
  -> rerank
  -> generate answer
  -> citation attach
  -> optional verifier
```

Multi-agent:

```txt
User question
  -> Router Agent
  -> Retriever Agent
  -> Source Checker Agent
  -> Answer Agent
  -> Verifier Agent
  -> Supervisor Agent
```

Comparison:

| বিষয় | Multi-step RAG pipeline | Multi-agent |
|---|---|---|
| Structure | fixed steps | dynamic roles/agents |
| Control | বেশি predictable | কম predictable |
| Debugging | সহজ | কঠিন |
| Cost | কম | বেশি |
| Latency | কম | বেশি |
| Best for | production MVP, citation RAG | complex reasoning, conflict handling |
| Risk | কম | hallucination/loop risk বেশি |

Fatwa GPT start:

```txt
Phase 1:
simple multi-step RAG

Phase 2:
metadata filter + rerank + citation

Phase 3:
small verifier/router agent

Phase 4:
full multi-agent only if needed
```

Simple rule:

```txt
Same steps every time হলে -> multi-step RAG pipeline
Different path/decision দরকার হলে -> multi-agent
Production MVP হলে -> multi-step pipeline
Advanced reasoning/audit দরকার হলে -> agent layer
```

> 🧠 **মনে রাখার ট্রিক:** Multi-step = **অ্যাসেম্বলি লাইন** (fixed, দ্রুত, সস্তা); Multi-agent = **বিশেষজ্ঞদের মিটিং** (dynamic, ধীর, দামি)। MVP-তে লাইন আগে।

> ✅ **নিজেকে যাচাই করো:** প্রতিবার একই কয়েকটা ধাপ চললে কোনটা বেছে নেবে — pipeline নাকি multi-agent?
> <details><summary>উত্তর দেখো</summary>
> Multi-step RAG pipeline। যখন প্রতিবার একই ধাপ একই ক্রমে চলে, তখন fixed pipeline বেশি predictable, সস্তা, দ্রুত আর সহজে debug হয়। ভিন্ন ভিন্ন পথ/সিদ্ধান্ত বা জটিল reasoning দরকার হলেই কেবল multi-agent-এর কথা ভাবা উচিত।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-21"></a>

## 21. Verification Layers: Backend, Source, Answer

> 🎯 **এই section-এ বুঝব:** RAG-এ "verification" মানে একটা জিনিস না — তিনটা আলাদা স্তরে তিন ধরনের যাচাই হয়, সেটা গুলিয়ে না ফেলা।

### 🛂 আগে একটা গল্প

বিমানবন্দরে একবারে সব যাচাই হয় না — কয়েকটা আলাদা চেকপয়েন্ট থাকে। প্রথমে **টিকিট/ID ঠিক আছে কিনা** দেখে (schema validation — field/shape ঠিক আছে?)। তারপর **লাগেজ স্ক্যান** হয় — জিনিসটা অনুমোদিত কিনা (source/admin verification — document approved কিনা)। শেষে **বোর্ডিং গেটে** মিলিয়ে দেখে সব ঠিকঠাক কিনা (answer verification — উত্তরটা সত্যিই source থেকে এসেছে কিনা)। প্রতিটা চেকপয়েন্টের কাজ আলাদা।

### কেন এগুলো আলাদা রাখা জরুরি

কারণ মানুষ এই তিনটা গুলিয়ে ফেলে। Pydantic শুধু data-র আকার ঠিক আছে কিনা দেখে — সেটা source verified কিনা তা বলে না। আবার LLM meaning বোঝে, কিন্তু "document trusted কিনা" সেটা backend/admin-এর কাজ। তিন স্তর আলাদা রাখলে প্রতিটার দায়িত্ব স্পষ্ট থাকে আর ফাঁক থেকে যায় না।

RAG system-এ "verification" বলতে একটাই জিনিস বোঝায় না। তিনটা layer আছে।

| Verification type | কী verify করে | কোথায় হয় |
|---|---|---|
| Schema validation | field/data shape ঠিক কি না | FastAPI/Pydantic |
| Source/admin verification | document approved কি না | Backend/Admin panel/DB |
| Answer/context verification | answer source-supported কি না | verifier step/LLM/custom logic |

FastAPI/Pydantic verifies:

```txt
file আছে কি না
title empty কি না
page_number number কি না
user admin কি না
metadata required fields আছে কি না
```

Backend/Admin verifies:

```txt
এই document trusted source কি না
admin approve করেছে কি না
source rejected/pending কি না
```

Retriever uses:

```txt
verified_status = verified
```

Answer verifier checks:

```txt
answer retrieved context থেকে এসেছে কি না
answer context-এর বাইরে claim করেছে কি না
citation missing কি না
source conflict আছে কি না
```

Example:

```txt
Retrieved context:
আসরের নামাজ চার রাকাত ফরজ।

LLM answer:
আসরের নামাজ তিন রাকাত।

Verifier:
Answer is not supported by context.
```

Important:

```txt
FastAPI schema validation আর LLM answer verification এক জিনিস না।
Backend source verified করে।
RAG retriever verified source use করে।
Verifier answer context-supported কি না দেখে।
```

> 🧠 **মনে রাখার ট্রিক:** বিমানবন্দরের ৩ চেকপয়েন্ট — **ID চেক (schema), লাগেজ স্ক্যান (source verified), বোর্ডিং গেট (answer context-supported)।**

> ✅ **নিজেকে যাচাই করো:** Pydantic schema validation আর answer verification কি এক জিনিস?
> <details><summary>উত্তর দেখো</summary>
> না। Pydantic শুধু দেখে data-র শেপ ঠিক কিনা (field আছে কিনা, page_number সংখ্যা কিনা)। Answer verification দেখে LLM-এর উত্তরটা সত্যিই retrieved context থেকে এসেছে কিনা, বাইরে গিয়ে দাবি করেছে কিনা, citation আছে কিনা। দুইটা আলাদা স্তরের যাচাই।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-22"></a>

## 22. Better Retrieval: Filter, Hybrid Search, Rerank

> 🎯 **এই section-এ বুঝব:** সাধারণ vector search-এর ওপরে filter, hybrid search আর rerank যোগ করে কীভাবে retrieval-এর মান আরও বাড়ানো যায়।

### 🎤 আগে একটা গল্প

একটা ট্যালেন্ট শো ভাবো। প্রথম রাউন্ডে অনেক প্রতিযোগীকে ডাকা হয় (top 20 chunk আনা), কিন্তু বিচারকরা এরপর তাদের **আবার সেরা-থেকে-খারাপ সাজিয়ে** সেরা ৫ জনকে বেছে নেন (rerank)। আবার কিছু ভূমিকা আছে যেখানে হুবহু শব্দ মেলাটা জরুরি — যেমন নির্দিষ্ট আরবি/ইসলামিক পরিভাষা — তখন শুধু "অর্থে মিল" (vector) নয়, "শব্দে মিল" (keyword)-ও মেলানো হয়। এই দুই মিলিয়ে খোঁজাই **hybrid search**।

### কেন শুধু vector search যথেষ্ট না

কারণ semantic search কখনো খুব broad result আনে, বানান-ভেদ (Arabic/Bangla) মিস করে, বা duplicate ভরে দেয়। filter অযাচাই source ছাঁটে, hybrid exact phrase ধরে, rerank সেরাগুলো সামনে আনে, আর source priority (primary > secondary, verified > pending) মান আরও বাড়ায়।

Basic vector search সবসময় enough না। Better RAG-এর জন্য retrieval improve করতে হয়।

Metadata filter:

```txt
verified_status = verified
language = bn
topic = salah
madhhab = hanafi
```

Hybrid search:

```txt
vector similarity + keyword search
```

কেন দরকার:

```txt
Islamic terms exact word match important হতে পারে
Arabic/Bangla spelling variation থাকতে পারে
semantic search কখনো broad result আনে
keyword search exact phrase ধরে
```

Rerank:

```txt
প্রথমে top 20 chunks আনুন
reranker দিয়ে best 5 chunks choose করুন
```

Source priority:

```txt
primary source > secondary source
verified > pending
specific madhhab > generic
same language > translated
```

Context cleanup:

```txt
duplicate chunks remove
too long chunks trim
same page/source group করা
irrelevant metadata remove
citation metadata keep করা
```

Practical retrieval pipeline:

```txt
Question
  -> normalize
  -> topic detect
  -> metadata filter
  -> hybrid search
  -> rerank
  -> source priority
  -> context build
```

> 🧠 **মনে রাখার ট্রিক:** Rerank = **ট্যালেন্ট শো**: আগে অনেককে ডাকো (top 20), তারপর সেরা-থেকে-খারাপ সাজিয়ে সেরা ৫ বাছো। Hybrid = অর্থে-মিল (vector) + শব্দে-মিল (keyword)।

> ✅ **নিজেকে যাচাই করো:** ইসলামিক পরিভাষার exact শব্দ ধরতে কেন শুধু vector search-এর ওপর ভরসা না করে hybrid search দরকার হতে পারে?
> <details><summary>উত্তর দেখো</summary>
> কারণ vector/semantic search অর্থে-কাছাকাছি জিনিস আনে, কিন্তু নির্দিষ্ট পরিভাষা বা বানান হুবহু ধরতে সবসময় পারে না — কখনো broad বা অপ্রাসঙ্গিক result আসে। keyword search exact phrase ধরে। দুইটা মিলিয়ে (hybrid) অর্থগত মিল আর হুবহু শব্দ-মিল দুটোই নিশ্চিত হয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-23"></a>

## 23. FastAPI API Design: Upload, Ask, Admin

> 🎯 **এই section-এ বুঝব:** RAG backend-এর দরকারি endpoint-গুলো কী কী, প্রতিটা কী করে, আর কোনটায় কেমন security নিয়ম লাগে।

### 🍽️ আগে একটা গল্প

API endpoint-গুলো যেন একটা রেস্টুরেন্টের আলাদা আলাদা দরজা। `/documents/upload` হলো **রান্নাঘরের পেছনের দরজা** — শুধু কর্মীরা (auth) ঢুকবে। `/admin/.../verify` হলো **ম্যানেজারের অফিস** — শুধু admin। আর `/chat/ask` হলো **সামনের দরজা** যেখানে অতিথি অর্ডার দেয়, কিন্তু তাকে শুধু verified রান্নাই পরিবেশন করা হয়। প্রতিটা দরজার নিয়ম আলাদা।

### কেন request/response-এর গঠন আগে ঠিক করি

কারণ frontend আর backend-এর মধ্যে একটা পরিষ্কার "চুক্তি" (contract) দরকার — কোন প্রশ্নে কী পাঠাব, কী ফেরত আসবে। খেয়াল করো ask response-এ শুধু `answer` নয়, আলাদা `citations`, `status` আর `needs_admin_review` field আছে — এতে frontend সূত্র দেখাতে ও পরের ধাপ ঠিক করতে পারে।

RAG backend-এর useful endpoints:

```txt
POST   /api/v1/documents/upload
GET    /api/v1/documents
GET    /api/v1/documents/{document_id}
PATCH  /api/v1/admin/documents/{document_id}/verify
POST   /api/v1/chat/ask
GET    /api/v1/chat/sessions/{session_id}
POST   /api/v1/feedback
```

Upload request:

```txt
file
title
author
language
source_type
topic
madhhab
```

Ask request:

```json
{
  "question": "আসরের নামাজ কয় রাকাত?",
  "language": "bn",
  "filters": {
    "topic": "salah",
    "madhhab": "hanafi",
    "verified_only": true
  }
}
```

Ask response:

```json
{
  "answer": "আসরের নামাজ চার রাকাত ফরজ।",
  "citations": [
    {
      "source_name": "ফিকহুস সালাত",
      "page_number": 23,
      "chapter": "সালাত",
      "chunk_id": "chunk_001"
    }
  ],
  "status": "answered",
  "needs_admin_review": false
}
```

Admin verify endpoint:

```json
{
  "verified_status": "verified",
  "notes": "Source checked by admin."
}
```

Security rule:

```txt
Upload endpoint protected
Admin verify endpoint admin-only
Ask endpoint only verified source use করবে
```

> 🧠 **মনে রাখার ট্রিক:** Endpoint = রেস্টুরেন্টের দরজা — **upload = পেছনের দরজা (auth), admin verify = ম্যানেজার অফিস (admin-only), ask = সামনের দরজা (শুধু verified পরিবেশন)।**

> ✅ **নিজেকে যাচাই করো:** ask response-এ শুধু `answer` text না দিয়ে আলাদা `citations` field কেন রাখা হয়?
> <details><summary>উত্তর দেখো</summary>
> যাতে frontend উত্তরের পাশাপাশি source/citation আলাদাভাবে দেখাতে পারে (book, page, chapter, verified badge) এবং user উত্তরটা যাচাই করতে পারে। citation লেখার মধ্যে মিশে থাকলে সেটা structured ভাবে ব্যবহার বা যাচাই করা যায় না — আলাদা field রাখলে trust ও transparency বাড়ে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-24"></a>

## 24. Frontend Connection: Next.js বা Expo App

> 🎯 **এই section-এ বুঝব:** RAG frontend শুধু প্রশ্নের বাক্স নয় কেন — source/citation দেখানোই কেন এখানে সবচেয়ে জরুরি।

### 🧾 আগে একটা গল্প

একটা দোকান থেকে দামি জিনিস কিনলে তুমি শুধু জিনিসটা চাও না — সাথে **রসিদ** চাও, যেন প্রমাণ থাকে কোথা থেকে, কত দামে এলো। RAG frontend-ও তাই: শুধু answer দেখানো মানে রসিদ ছাড়া জিনিস দেওয়া। ভালো frontend answer-এর সাথে **source card** দেখায় — কোন বই, কোন পৃষ্ঠা, verified কিনা — এটাই user-এর কাছে বিশ্বাস তৈরি করে।

### কেন trust দুই জায়গায় ভাগ

মনে রাখো — **frontend trust দেখায় (citation/source visibility দিয়ে), backend trust প্রয়োগ করে (verified source filtering দিয়ে)।** frontend সুন্দর করে source দেখাল কিন্তু backend যদি অযাচাই chunk-ও পাঠায়, তাহলে বিশ্বাসটা ফাঁপা। তাই দুই দিকেই কাজ করতে হয়।

Frontend শুধু question input box না। RAG frontend-এ source transparency দেখাতে হবে।

Next.js/Expo flow:

```txt
User types question
  -> frontend calls FastAPI /chat/ask
  -> loading state
  -> answer show
  -> citations/source cards show
  -> feedback buttons show
```

UI should show:

```txt
answer
source name
page number
chapter/topic
verified badge
confidence/status
admin review message if needed
feedback action
```

Bad UI:

```txt
শুধু answer text দেখানো, source না দেখানো
```

Good UI:

```txt
Answer
Sources
  - book name
  - page
  - chapter
  - verified status
Feedback
  - helpful
  - wrong source
  - needs review
```

Frontend type:

```ts
type RagCitation = {
  source_name: string;
  page_number?: number;
  chapter?: string;
  topic?: string;
  chunk_id: string;
};

type RagAnswerResponse = {
  answer: string;
  citations: RagCitation[];
  status: "answered" | "insufficient_context" | "needs_review";
  needs_admin_review: boolean;
};
```

Rule:

```txt
Frontend trust তৈরি করবে citation/source visibility দিয়ে।
Backend trust enforce করবে verified source filtering দিয়ে।
```

> 🧠 **মনে রাখার ট্রিক:** Frontend = **রসিদ দেখানো** (source card, verified badge); Backend = **শুধু verified জিনিসই দেওয়া** (source filtering)। দুটো একসাথে = আসল বিশ্বাস।

> ✅ **নিজেকে যাচাই করো:** শুধু answer text দেখিয়ে source লুকিয়ে রাখলে সমস্যা কী?
> <details><summary>উত্তর দেখো</summary>
> user বুঝতে পারে না উত্তরটা কোথা থেকে এলো, verified কিনা, কোন বই/পৃষ্ঠা — ফলে বিশ্বাস তৈরি হয় না এবং ভুল ধরার উপায় থাকে না। বিশেষত fatwa-র মতো ক্ষেত্রে source transparency আবশ্যক। তাই answer-এর সাথে book, page, chapter, verified status দেখানো উচিত।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-25"></a>

## 25. Development Rules, Checklist, এবং Summary

> 🎯 **এই section-এ বুঝব:** পুরো tutorial-এর শিক্ষা একসাথে গুছিয়ে — কোন ক্রমে বানাব, কী দিয়ে শুরু করব না, আর কোন সিদ্ধান্ত কখন নেব।

### 🧱 আগে একটা গল্প

বাড়ি বানানোর সময় কেউ আগে ছাদ ঢালে না — আগে ভিত্তি, তারপর দেয়াল, তারপর ছাদ, শেষে রং। RAG-ও তাই: আগে একটা ছোট working PDF-QA (ভিত্তি), তারপর metadata/citation (দেয়াল), তারপর admin verification (ছাদ), শেষে rerank/agent (রং)। উল্টো ক্রমে গেলে পুরো কাঠামো নড়বড়ে হয়।

### কেন এই checklist মূল্যবান

কারণ এটা সিদ্ধান্তের ম্যাপ — কখন LangChain, কখন LlamaIndex, কখন relational DB, কখন multi-agent। নতুন অবস্থায় সবচেয়ে বড় ভুল হলো একসাথে সব নেওয়া (multi-agent, পাঁচটা vector DB, কোনো metadata নেই)। এই section সেই ভুলগুলো এক জায়গায় মনে করিয়ে দেয়, আর নিরাপদ path দেখায়: আগে ছোট working system, তারপর একটা একটা layer।

Build order:

```txt
1. Simple PDF QA demo
2. Metadata design
3. ChromaDB collection design
4. Ingestion pipeline
5. Retrieval pipeline
6. Prompt + citation
7. Admin source verification
8. Frontend source display
9. Relational app database add করা, যদি project-এ user/admin/audit/report দরকার হয়
10. Feedback + audit
11. Rerank/verifier/agent layer
```

Do first:

```txt
PDF upload
text extract
chunk
embedding
store
ask question
answer with citation
```

Do not start with:

```txt
full multi-agent system
complex framework stack
five vector DBs
no metadata
no admin verification
no citation
```

Decision rules:

```txt
LangChain লাগবে = framework/helper দিয়ে দ্রুত pipeline বানাতে চাইলে
LlamaIndex লাগবে = document-heavy RAG/index/query engine চাইলে
ChromaDB লাগবে = simple local/prototype/first RAG vector store চাইলে
Relational DB লাগবে = users, roles, permissions, reports, admin audit দরকার হলে
pgvector লাগবে = PostgreSQL-এর ভিতর relational + vector একসাথে রাখতে চাইলে
Qdrant লাগবে = dedicated scalable vector DB দরকার হলে
Multi-agent লাগবে = complex reasoning/conflict/verification দরকার হলে
Custom code লাগবে = control, debug, citation, metadata logic important হলে
```

Fatwa GPT recommended MVP:

```txt
FastAPI
ChromaDB
optional relational app database
custom ingestion/retrieval service
metadata filter
verified source only
context-only answer
citation response
admin review workflow
```

Final mental model:

```txt
RAG = source-grounded answering architecture
Metadata = source/filter/citation identity
Embedding = semantic search vector
Vector DB = similar chunk search engine
FastAPI = real app/business/security layer
LLM = retrieved context থেকে answer writer
Verifier/agent = optional quality/audit layer
```

RAG শেখার সবচেয়ে ভালো way:

```txt
আগে small working system বানান।
তারপর metadata, citation, verification, rerank, agent layer add করুন।
```

> 🧠 **মনে রাখার ট্রিক:** বাড়ি বানানোর মতো — **ভিত্তি (PDF-QA) → দেয়াল (metadata/citation) → ছাদ (verification) → রং (rerank/agent)।** আগে ছোট working system, তারপর layer।

> ✅ **নিজেকে যাচাই করো:** RAG শেখার/বানানোর সবচেয়ে ভালো প্রথম ধাপ কোনটা?
> <details><summary>উত্তর দেখো</summary>
> একটা ছোট কিন্তু পুরো কাজ করা system — PDF upload → text extract → chunk → embedding → store → question → citation-সহ answer। এটা দাঁড় করানোর পর তার ওপর ধাপে ধাপে metadata, citation, verification, rerank আর দরকার হলে agent layer যোগ করা উচিত। শুরুতেই full multi-agent বা অনেক framework একসাথে নয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)
