# ০৩. How to Connect Database in a Fullstack Application?

PostgreSQL এখন কম্পিউটারে চলছে, পোর্ট 5432-তে কান পেতে বসে আছে। কিন্তু এটা এখনও আমাদের FastAPI অ্যাপের (Module 4-এ শেখা) সাথে সম্পূর্ণ বিচ্ছিন্ন — দুইটা আলাদা প্রোগ্রাম, একে অপরের অস্তিত্ব সম্পর্কে কিছুই জানে না। এই লেসনে আমরা এই দুইটাকে একসাথে "কথা বলাবো"।

মনে করো ব্যাপারটাকে এভাবে — FastAPI সার্ভার একটা client, আর PostgreSQL server আরেকটা server। ঠিক যেমন ব্রাউজার HTTP দিয়ে ওয়েব সার্ভারের সাথে কথা বলে (Module 2), তেমনি আমাদের Python প্রোগ্রামকে PostgreSQL-এর নিজস্ব প্রোটোকল দিয়ে কথা বলতে হবে। এই কাজটা নিজে হাতে লিখতে গেলে ভীষণ জটিল হতো (TCP-এর উপর PostgreSQL-এর বাইনারি ওয়্যার প্রোটোকল বাস্তবায়ন করা), তাই আমরা ব্যবহার করবো একটা **pip package** (Module 3-এ শেখা built-in module বনাম external package-এর পার্থক্য মনে আছে?) — এর নাম **SQLAlchemy**।

```mermaid
sequenceDiagram
    participant FastAPI as FastAPI App
    participant SA as SQLAlchemy (Engine)
    participant PG as PostgreSQL Server

    FastAPI->>SA: create_engine() + connect()
    SA->>PG: নেটওয়ার্কে কানেকশন রিকোয়েস্ট (Port 5432)
    PG-->>SA: কানেকশন গৃহীত
    SA-->>FastAPI: Connection/Pool রেডি
    FastAPI->>SA: execute(text("SELECT ..."))
    SA->>PG: SQL পাঠালো
    PG-->>SA: ফলাফল পাঠালো
    SA-->>FastAPI: Python object আকারে ডেটা
```

SQLAlchemy আসলে দুইটা স্তরে কাজ করে — নিচের স্তরে **Core** (raw SQL চালানোর ইঞ্জিন আর কানেকশন ম্যানেজমেন্ট), আর উপরের স্তরে **ORM** (মডেল ক্লাস দিয়ে টেবিল রিপ্রেজেন্ট করা, যা আমরা Module 24-এ বিস্তারিত শিখবো)। এই লেসনে আমরা শুধু Core স্তরটা ব্যবহার করবো, কারণ SQL কমান্ডগুলো আসলে কী করছে সেটা প্রথমে হাতে-কলমে অনুভব করা জরুরি — ORM-এর abstraction-এর পেছনে কী ঘটছে সেটা না বুঝে ORM শেখা শুরু করলে ভিত্তিটা দুর্বল থেকে যায়।

প্রথমে প্যাকেজগুলো ইনস্টল করি একটা FastAPI প্রজেক্টে (Module 4-এ যেভাবে `pip install fastapi uvicorn` করেছিলে ঠিক সেভাবেই):

```bash
pip install sqlalchemy psycopg2-binary python-dotenv
```

এখানে `sqlalchemy` আমাদের কানেকশন আর query-এর জন্য, `psycopg2-binary` হলো PostgreSQL-এর জন্য Python-এর আসল **driver** (SQLAlchemy নিজে PostgreSQL-এর সাথে সরাসরি কথা বলে না, বরং driver-এর উপর একটা সুন্দর, ডেটাবেজ-এগনস্টিক ইন্টারফেস বসায় — চাইলে একই SQLAlchemy কোড MySQL বা SQLite-এর জন্যও কাজ করবে, শুধু driver আর কানেকশন স্ট্রিং বদলাতে হবে), আর `python-dotenv` দিয়ে `.env` ফাইল পড়বো।

এবার একটা গুরুত্বপূর্ণ প্রশ্ন — কানেকশনের তথ্য (হোস্ট, পোর্ট, ইউজারনেম, পাসওয়ার্ড, ডেটাবেজের নাম) কোথায় রাখবো? এগুলো সরাসরি কোডে লিখে ফেলা (hardcode করা) একটা বাজে অভ্যাস — বিশেষ করে পাসওয়ার্ড! যদি এই কোড GitHub-এ পাবলিক হয়ে যায়, তাহলে যে কেউ তোমার ডেটাবেজে ঢুকে যেতে পারবে। এর সমাধান হলো **environment variables** — কোডের বাইরে, একটা আলাদা `.env` ফাইলে এই সিক্রেট তথ্যগুলো রাখা।

প্রজেক্টের রুটে একটা `.env` ফাইল বানাই (এবং `.gitignore`-এ যোগ করি, যাতে ভুলেও GitHub-এ না যায়):

```
DATABASE_URL=postgresql+psycopg2://postgres:তোমার_ইনস্টলের_সময়_দেয়া_পাসওয়ার্ড@localhost:5432/todo_app
```

এই এক লাইনের মধ্যেই সবকিছু আছে — ড্রাইভার (`postgresql+psycopg2`), ইউজারনেম, পাসওয়ার্ড, হোস্ট, পোর্ট, আর ডেটাবেজের নাম। এটাকে বলে **connection URL/DSN** — অনেকটা ব্রাউজারের URL-এর মতোই একটা ঠিকানা, শুধু ওয়েব সার্ভারের বদলে ডেটাবেজ সার্ভারের।

এবার একটা `db.py` ফাইল বানাই, যেখানে আমরা কানেকশন সেটআপ করবো:

```python
# db.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
```

লক্ষ্য করো, `create_engine()` কল করলেই সাথে সাথে কোনো নেটওয়ার্ক কানেকশন খোলে না — এটা **lazy**। আসল কানেকশন তখনই তৈরি হয় যখন প্রথম query চালানো হয়। কিন্তু ভেতরে ভেতরে এই `engine` অবজেক্ট একটা **connection pool** ম্যানেজ করে। এটা বোঝা জরুরি। ধরো তোমার FastAPI অ্যাপে একসাথে ১০০ জন ইউজার রিকোয়েস্ট পাঠাচ্ছে। প্রতিটা রিকোয়েস্টের জন্য যদি নতুন করে ডেটাবেজের সাথে raw কানেকশন খোলা আর বন্ধ করা হয়, সেটা খুবই ধীরগতির — কারণ কানেকশন তৈরি করা নিজেই একটা ব্যয়বহুল কাজ (TCP হ্যান্ডশেক, অথেন্টিকেশন, ইত্যাদি)।

এর বদলে **connection pooling** ব্যবহার করি — অনেকটা একটা ট্যাক্সি স্ট্যান্ডের মতো কল্পনা করো। কয়েকটা ট্যাক্সি (কানেকশন) আগে থেকেই রেডি হয়ে দাঁড়িয়ে থাকে। কেউ যাত্রার (query) দরকার হলে একটা খালি ট্যাক্সি ধরে, কাজ শেষে ট্যাক্সিটা আবার স্ট্যান্ডে ফিরিয়ে দেয় — পরের যাত্রীর জন্য রেডি থাকে। নতুন করে ট্যাক্সি বানাতে হয় না বারবার।

```mermaid
flowchart TD
    R1["Request 1"] --> Pool["Connection Pool<br/>(কয়েকটা রেডি কানেকশন, engine এর ভেতরে)"]
    R2["Request 2"] --> Pool
    R3["Request 3"] --> Pool
    Pool --> PG[("PostgreSQL Server")]
```

**একটা কমন ভুল, যা এখানেই থামিয়ে দেয়া ভালো** — অনেকে শুরুতে ভাবে, "প্রতি রিকোয়েস্টে `psycopg2.connect(...)` দিয়ে সরাসরি একটা নতুন raw কানেকশন খুললে সমস্যা কী?" ছোট, লো-ট্রাফিক প্রজেক্টে এটা কাজ করেও যায় — কিন্তু এটা স্কেল করে না। প্রতিটা নতুন কানেকশনের জন্য PostgreSQL সার্ভারের নিজের একটা আলাদা process/backend তৈরি হয়, যার একটা মেমরি আর CPU খরচ আছে; সেকেন্ডে বেশি রিকোয়েস্ট আসলে সার্ভার এই কানেকশন-তৈরির খরচেই দম আটকে যায়, আসল query চালানোর আগেই। SQLAlchemy-র `engine` এই সমস্যাটা এড়িয়ে যায় কানেকশন আগে থেকে তৈরি করে পুল-এ রেখে, বারবার পুনর্ব্যবহার করে। Module 24-এ আমরা এই পুলের আকার (`pool_size`, `max_overflow`) কীভাবে টিউন করতে হয়, আর ভুলভাবে ম্যানেজ করলে প্রোডাকশনে কী ভয়ংকর বাগ (connection pool exhaustion) হতে পারে — সেটা গভীরে গিয়ে দেখবো।

এবার এই `engine`-কে আসলে ব্যবহার করে একটা রুট বানাই, যেখানে আমরা ডেটাবেজের ভার্সন চেক করবো — শুধু প্রমাণ করার জন্য যে কানেকশনটা আসলেই কাজ করছে:

```python
# main.py
from fastapi import FastAPI
from sqlalchemy import text
from db import engine

app = FastAPI()


@app.get("/db-health")
def db_health():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.scalar()
        return {"connected": True, "version": version}
    except Exception as err:
        return {"connected": False, "error": str(err)}
```

লক্ষ্য করো, `with engine.connect() as conn:` — এটা **context manager** (Python-এর `with` স্টেটমেন্ট)। `with` ব্লকের ভেতরে `conn` ব্যবহার হয়, আর ব্লক শেষ হলে (এমনকি এক্সসেপশন হলেও) কানেকশনটা স্বয়ংক্রিয়ভাবে পুলে ফিরিয়ে দেয়া হয়। এটা ভুলে গেলে — মানে raw `engine.connect()` কল করে কখনো `close()`/`with` না করলে — কানেকশনগুলো পুল থেকে বের হয়ে যায় কিন্তু আর ফেরত আসে না, ধীরে ধীরে পুল খালি হয়ে যায়, আর একটা সময় নতুন কোনো রিকোয়েস্ট ডেটাবেজে পৌঁছাতেই পারে না। ছোট স্কেলে এই বাগ চোখে পড়ে না, কারণ পুল সাধারণত বড় থাকে; প্রোডাকশনে হাই-ট্রাফিকে এটাই ভয়ংকর রূপ নেয়।

`text(...)` দিয়ে আমরা raw SQL স্ট্রিংকে SQLAlchemy-কে বুঝিয়ে দিচ্ছি এটা একটা executable SQL statement — খালি স্ট্রিং পাঠালে SQLAlchemy নিরাপত্তার কারণে আপত্তি করে।

`uvicorn main:app --reload` দিয়ে সার্ভার চালিয়ে, ব্রাউজার বা Postman/Thunder Client দিয়ে (Module 4-এ শেখা টুল) `GET http://localhost:8000/db-health` কল করে দেখো। যদি JSON রেসপন্সে `connected: true` আর PostgreSQL-এর ভার্সন দেখো, তাহলে আমাদের FastAPI অ্যাপ আর PostgreSQL ইঞ্জিন এখন একসাথে কাজ করছে।

এখন ফাউন্ডেশন তৈরি — সার্ভার ডেটাবেজের সাথে কথা বলতে পারে। পরের লেসনে আমরা এই কানেকশনকে আসল কাজে লাগাবো — সেই পুরোনো "No Database" TODO Manager-কে বাস্তব ডেটাবেজে রূপান্তর করা শুরু করবো।
