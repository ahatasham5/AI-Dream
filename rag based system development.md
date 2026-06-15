# RAG Based System Development Tutorial with FastAPI Backend

এই note-টা RAG based system development শেখার জন্য। Backend হিসেবে ধরা হয়েছে **FastAPI**, RAG vector store example হিসেবে ধরা হয়েছে **ChromaDB**, আর example domain হিসেবে ধরা হয়েছে **Fatwa GPT / document-based question answering system**।

Important:

```txt
Database choice project basis-এ change হবে।
এই tutorial-এ ChromaDB দিয়ে RAG/vector search দেখানো হবে।
কিন্তু project অনুযায়ী relational data লাগলে PostgreSQL/SQLite/MySQL আলাদা app database হিসেবে add করা যাবে।
```

Main goal:

```txt
RAG আসলে কী problem solve করে তা বোঝা
Document, chunk, embedding, metadata, vector DB relation বোঝা
কোন component/file/service কেন ব্যবহার করছি তা বোঝা
FastAPI দিয়ে practical RAG backend বানানোর flow শেখা
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
- [10. Vector DB Choose করার নিয়ম](#section-10)
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

RAG মানে **Retrieval-Augmented Generation**।

সহজভাবে:

```txt
LLM নিজের training memory থেকে answer না দিয়ে
প্রথমে আপনার document/database থেকে relevant তথ্য খুঁজে নেয়
তারপর সেই retrieved context দেখে answer তৈরি করে
```

Example:

```txt
User:
আসরের নামাজ কয় রাকাত?

Normal LLM:
নিজের training knowledge থেকে answer দিবে

RAG system:
আপনার verified book/PDF/database থেকে related অংশ খুঁজবে
তারপর সেই source দেখে answer দিবে
সাথে citation/source দেখাবে
```

RAG দরকার হয় যখন:

```txt
আপনার private document আছে
updated knowledge দরকার
source citation দরকার
hallucination কমাতে চান
domain-specific answer দরকার
```

Fatwa GPT-এর মতো system-এ RAG খুব important, কারণ answer শুধু সুন্দর হলেই হবে না। Answer কোথা থেকে এসেছে, source verified কি না, কোন page/chapter থেকে এসেছে, এগুলোও জানতে হবে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-2"></a>

## 02. Normal LLM vs RAG-Based System

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

| বিষয় | Normal LLM | RAG |
|---|---|---|
| Knowledge source | model training data | আপনার document/database |
| Updated data | weak | strong, যদি data update করেন |
| Citation | সাধারণত নেই | রাখা যায় |
| Hallucination control | কম | context দিয়ে কমানো যায় |
| Private data | নেই | আছে |
| Domain accuracy | uncertain | source quality-এর ওপর নির্ভর করে |

RAG magic না। যদি retrieved context ভুল হয়, answer-ও ভুল হতে পারে। তাই RAG system-এ retrieval quality, metadata, verified source, prompt, citation, verification সব একসাথে important।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-3"></a>

## 03. RAG System Layers: কোন অংশ কেন

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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-4"></a>

## 04. Core Terms: Document, Chunk, Embedding, Metadata

RAG শেখার আগে এই terms clear করতে হবে:

| Term | সহজ meaning |
|---|---|
| Document | PDF, book, article, FAQ, database row |
| Chunk | document-এর ছোট text অংশ |
| Embedding | text meaning-এর numeric/vector representation |
| Vector DB | embedding store/search করার জায়গা |
| Metadata | source/filter/citation info |
| Retriever | relevant chunks খুঁজে আনে |
| Context | retrieved chunks যা LLM-কে দেওয়া হয় |
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-5"></a>

## 05. End-to-End RAG Flow

RAG system দুইটা বড় phase-এ কাজ করে:

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
embedding বানিয়ে store করবো
তারপর PDF থেকে question-answer করবো
```

এই mini project করতে পারলে RAG-এর practical 70% concept clear হয়ে যাবে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-6"></a>

## 06. Metadata vs Embedding vs Vector DB

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

Search করার সময়:

```txt
User question
  -> question embedding
  -> vector DB similarity search
  -> matched text + metadata return
```

Metadata দিয়ে filter করা যায়:

```txt
language = "bn"
topic = "salah"
verified_status = "verified"
book = "ফিকহুস সালাত"
```

Fatwa GPT example:

```txt
User asks:
নামাজ না পড়ার বিধান কী?

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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-7"></a>

## 07. Fatwa GPT Metadata Design

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
  "source_name": "ফাতওয়া সংকলন",
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

Metadata না থাকলে user প্রশ্ন করলে এই answers দেওয়া কঠিন:

```txt
এই উত্তর কোন বই থেকে দিলে?
কোন page?
কোন আলেম?
এই source verified কি না?
এইটা কোন madhhab-এর view?
```

তাই Fatwa GPT-এর জন্য metadata design আগে চিন্তা করা উচিত। পরে add করতে গেলে re-ingestion লাগতে পারে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-8"></a>

## 08. Chunking, Node Parser, এবং Node

Chunking মানে বড় document ছোট ছোট অংশে ভাগ করা।

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
citation page/chapter ধরে দেখানো সহজ হয়
irrelevant text কম যায়
```

LlamaIndex-এ অনেক সময় chunk-কে **Node** বলা হয়। Node শুধু text না, text-এর সাথে metadata/id/relationship রাখে।

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
Node Parser document কে structured node/chunk বানায়
Embedding model node text থেকে vector বানায়
Vector DB node + metadata save করে
```

Important:

```txt
Chunking strategy answer quality directly affect করে।
খুব ছোট chunk হলে context missing হয়।
খুব বড় chunk হলে irrelevant text বেশি যায়।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-9"></a>

## 09. Embedding Model, Cost, এবং Privacy Thinking

Embedding model text-কে vector বানায়।

Example:

```txt
"আসরের নামাজ চার রাকাত ফরজ।"
  -> [0.12, -0.44, 0.87, ...]
```

Embedding দুই জায়গায় লাগে:

```txt
1. document chunk embed করার সময়
2. user question embed করার সময়
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
Document যত বড়, ingestion cost তত বেশি
User query যত বেশি, query embedding cost তত বেশি
Free tier থাকলেও rate limit থাকে
Production app হলে pricing, quota, data policy check করতে হবে
```

`gemini-embedding-001` বা অন্য কোনো provider পুরোপুরি unlimited free ধরে plan করা ঠিক না। Learning/prototype-এ free tier use করা যায়, কিন্তু production-এর আগে official pricing, rate limit, data retention, privacy policy check করতে হবে।

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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-10"></a>

## 10. Vector DB Choose করার নিয়ম

Vector DB choose করার আগে প্রশ্নগুলো:

```txt
1. data size কত?
2. metadata filter কত দরকার?
3. local/simple setup দরকার নাকি separate production service দরকার?
4. production scale লাগবে কি না?
5. self-host করবেন নাকি managed service?
6. team simple Python-based vector store দিয়ে শুরু করবে নাকি database infra manage করবে?
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

App বড় হলে optional relational DB:
PostgreSQL / SQLite

Scale বড় হলে:
Qdrant

Relational vector setup চাইলে:
PostgreSQL + pgvector

Research/high-performance custom index চাইলে:
FAISS
```

কেন ChromaDB দিয়ে শুরু করছি:

```txt
chunks
embeddings
metadata
collections
persistent local storage
semantic search
metadata filtering
```

ChromaDB দিয়ে আপনি খুব দ্রুত এই flow বানাতে পারবেন:

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

এই tutorial-এ "database" বলতে main RAG database হিসেবে **ChromaDB** ধরা হবে। Production app বড় হলে ChromaDB-এর পাশে PostgreSQL/SQLite add করা যায়।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-11"></a>

## 11. Recommended Stack: Learning থেকে Production

Learning path:

```txt
Phase 1:
FastAPI + ChromaDB দিয়ে manual RAG flow দেখা

Phase 2:
PDF upload + ChromaDB persistent collection দিয়ে custom RAG বানানো

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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-12"></a>

## 12. FastAPI Project Setup with uv

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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-13"></a>

## 13. Folder Structure: RAG Backend সাজানো

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
Route শুধু request নেয়
Service flow manage করে
Repository DB handle করে
RAG helper chunk/prompt কাজ করে
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-14"></a>

## 14. ChromaDB Collection Design: Documents এবং Chunks

ChromaDB table-based relational database না। এখানে main concept হলো **collection**।

একটা collection-এর ভিতরে প্রতিটি chunk save হবে এই parts নিয়ে:

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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-15"></a>

## 15. Ingestion Pipeline: PDF থেকে Vector Store

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
    embeddings = []
    metadatas = []

    for index, chunk in enumerate(chunks):
        chunk_id = f"{document_id}_chunk_{index:04d}"
        embedding = await embedding_service.create_embedding(chunk.text)

        ids.append(chunk_id)
        documents.append(chunk.text)
        embeddings.append(embedding)
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
Upload হওয়ার সাথে সাথে source verified ধরে নিবেন না।
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-16"></a>

## 16. Retrieval Pipeline: User Question থেকে Context

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
  "question": "আসরের নামাজ কয় রাকাত?",
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-17"></a>

## 17. Prompt with Context এবং Citation

RAG prompt-এর goal হলো LLM-কে force করা যেন সে retrieved context থেকে answer দেয়।

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
ফিকহুস সালাত, সালাত অধ্যায়, পৃষ্ঠা ২৩
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-18"></a>

## 18. LangChain: কখন লাগবে, কখন লাগবে না

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
LangChain + ChromaDB দিয়ে flow বুঝুন

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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-19"></a>

## 19. LlamaIndex: Metadata, Node Parser, Query Engine

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

| বিষয় | LangChain | LlamaIndex |
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-20"></a>

## 20. Multi-Step RAG Pipeline vs Multi-Agent

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

| বিষয় | Multi-step RAG pipeline | Multi-agent |
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-21"></a>

## 21. Verification Layers: Backend, Source, Answer

RAG system-এ "verification" বলতে একটাই জিনিস বোঝায় না। তিনটা layer আছে।

| Verification type | কী verify করে | কোথায় হয় |
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-22"></a>

## 22. Better Retrieval: Filter, Hybrid Search, Rerank

Basic vector search সবসময় enough না। Better RAG-এর জন্য retrieval improve করতে হয়।

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
reranker দিয়ে best 5 chunks choose করুন
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-23"></a>

## 23. FastAPI API Design: Upload, Ask, Admin

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
  "question": "আসরের নামাজ কয় রাকাত?",
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-24"></a>

## 24. Frontend Connection: Next.js বা Expo App

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
Frontend trust তৈরি করবে citation/source visibility দিয়ে।
Backend trust enforce করবে verified source filtering দিয়ে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-25"></a>

## 25. Development Rules, Checklist, এবং Summary

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
9. Relational app database add করা, যদি project-এ user/admin/audit/report দরকার হয়
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
LangChain লাগবে = framework/helper দিয়ে দ্রুত pipeline বানাতে চাইলে
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

RAG শেখার সবচেয়ে ভালো way:

```txt
আগে small working system বানান।
তারপর metadata, citation, verification, rerank, agent layer add করুন।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)
