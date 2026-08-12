# ৩১.০৫. API Performance Optimization - Caching Strategies

আগের লেসনে আমরা মাপতে শিখেছি একটা API কতটা ধীর, আর কোথায় সমস্যা। এখন প্রশ্ন হলো — সমাধান কী? সবচেয়ে সহজ আর সবচেয়ে কার্যকর সমাধানগুলোর একটা হলো **caching** — একই উত্তর বারবার নতুন করে তৈরি না করে, একবার তৈরি করা উত্তর সংরক্ষণ করে রাখা, আর পরের বার সরাসরি সেটাই ফেরত দেয়া।

## Caching-এর মূল ধারণা: লাইব্রেরির উপমা

ধরো একটা লাইব্রেরিতে কেউ একটা বই খুঁজতে চাইলে, প্রতিবার পুরো গুদাম হাতড়ে বের করা লাগে — এটা ধীর। কিন্তু যদি সবচেয়ে বেশি চাওয়া বইগুলো লাইব্রেরিয়ানের ডেস্কের পাশে একটা ছোট শেলফে রাখা থাকে, তাহলে সেই বইগুলোর জন্য গুদামে যাওয়ারই দরকার হয় না — সরাসরি ডেস্ক থেকে দিয়ে দেয়া যায়। এই "ডেস্কের পাশের শেলফ"-ই হলো cache — দ্রুত অ্যাক্সেসযোগ্য একটা জায়গা, যেখানে ঘনঘন চাওয়া ডেটা আগে থেকেই তৈরি করে রাখা থাকে।

Module 21-এ আমরা ডেটাবেজ ক্যাশিং নিয়ে সংক্ষেপে কথা বলেছিলাম — এখন আমরা সেটাকে API লেভেলে প্রয়োগ করবো, বাস্তব কোড দিয়ে।

```mermaid
flowchart TD
    A[Client Request আসলো] --> B{Cache-এ ডেটা আছে?}
    B -->|হ্যাঁ, Cache Hit| C[সরাসরি Cache থেকে Response পাঠানো — দ্রুত]
    B -->|না, Cache Miss| D[Database থেকে ডেটা আনা]
    D --> E[সেই ডেটা Cache-এ সংরক্ষণ করা]
    E --> F[Client-কে Response পাঠানো]
```

## In-Memory Cache: সবচেয়ে সহজ শুরু

সবচেয়ে সাধারণ ক্যাশ হলো একটা সাধারণ JavaScript অবজেক্ট বা Map, যা সার্ভারের মেমরিতেই থাকে। চলো আগের মডিউলগুলোর `/api/products` endpoint-এ একটা সহজ ক্যাশ যোগ করি:

```js
const express = require('express');
const app = express();

const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // ৬০ সেকেন্ড পর্যন্ত ক্যাশ বৈধ থাকবে

app.get('/api/products', async (req, res) => {
  const cacheKey = 'all-products';
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log('Cache HIT — সরাসরি মেমরি থেকে পাঠানো হলো');
    return res.json({ data: cached.data, source: 'cache' });
  }

  console.log('Cache MISS — ডেটাবেজ থেকে আনতে হচ্ছে');
  const products = await getProductsFromDB();
  cache.set(cacheKey, { data: products, timestamp: Date.now() });

  res.json({ data: products, source: 'database' });
});
```

এখানে লক্ষণীয় ব্যাপার হলো **TTL (Time To Live)** — আমরা ক্যাশকে চিরকাল বৈধ রাখছি না, ৬০ সেকেন্ড পর সেটা "বাসি" (stale) হয়ে যাচ্ছে আর নতুন করে ডেটাবেজ থেকে আনা হচ্ছে। এটা জরুরি, কারণ প্রোডাক্ট আপডেট হলে পুরনো ক্যাশ দেখানো ঠিক হবে না — caching-এর সবচেয়ে বড় challenge-ই হলো এই **cache invalidation** (কখন পুরনো ডেটা ফেলে দিতে হবে) ঠিক করা।

## Redis: প্রোডাকশন-গ্রেড Cache

উপরের in-memory cache-এর একটা বড় সমস্যা আছে — যদি তোমার একাধিক সার্ভার ইনস্ট্যান্স চলে (যেমন লোড ব্যালান্সারের পেছনে), প্রতিটা ইনস্ট্যান্সের নিজের আলাদা মেমরি থাকে, তাই ক্যাশ শেয়ার হয় না। এই সমস্যা সমাধানের জন্য ব্যবহার হয় **Redis** — একটা আলাদা, দ্রুতগতির ডেটাবেজ যা শুধু key-value ডেটা মেমরিতে রাখার জন্য ডিজাইন করা। Module 25-এ NestJS-এর সাথে Redis ক্যাশিং সংক্ষেপে দেখেছিলাম, এখানে Express-এ একই ধারণা:

```js
const redis = require('redis');
const client = redis.createClient();
await client.connect();

app.get('/api/products', async (req, res) => {
  const cacheKey = 'all-products';
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    return res.json({ data: JSON.parse(cachedData), source: 'redis-cache' });
  }

  const products = await getProductsFromDB();
  await client.setEx(cacheKey, 60, JSON.stringify(products)); // ৬০ সেকেন্ড TTL
  res.json({ data: products, source: 'database' });
});
```

এখানে `setEx` মেথডের তৃতীয় প্যারামিটারই হলো TTL — Redis নিজেই সময় শেষ হলে ডেটা মুছে ফেলে, আমাদের ম্যানুয়ালি timestamp চেক করতে হয় না। যেহেতু Redis একটা আলাদা প্রসেস (এমনকি আলাদা সার্ভারেও থাকতে পারে), তোমার সব API ইনস্ট্যান্স একই ক্যাশ শেয়ার করতে পারে।

Caching দিয়ে আমরা response time নাটকীয়ভাবে কমাতে পারি — কিন্তু কখন কতটা কাজ করলো, কোন request cache hit হলো আর কোনটা miss হলো, সেটা ট্র্যাক না করলে আমরা বুঝবোই না caching আসলে কাজ করছে কিনা। পরের লেসনে আমরা দেখবো কীভাবে টেস্টিং, লগিং, আর পারফরম্যান্স মনিটরিং — এই তিনটাকে একসাথে একটা সিস্টেমে বেঁধে ফেলা যায়।
