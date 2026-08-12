# Module 34 — Production Debugging

Module 33-তে আমরা শিখেছি *কখন* একটা প্রোডাকশন সমস্যা হচ্ছে সেটা মনিটরিং আর অ্যালার্টিং দিয়ে টের পাওয়া। এই মডিউলে আমরা তার পরের ধাপে যাবো — অ্যালার্ম বাজার পর, প্রসেস থামিয়ে না দিয়ে, চলমান একটা প্রোডাকশন সিস্টেমের ভেতরে কীভাবে গোয়েন্দাগিরি করে আসল সমস্যাটা খুঁজে বের করা যায়।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-production-debugging-techniques.md](01-production-debugging-techniques.md) | প্রোডাকশন ডিবাগিং-এর মূল কৌশল ও correlation ID |
| 2 | [02-using-debug-logs-effectively.md](02-using-debug-logs-effectively.md) | Debug logs কার্যকরভাবে ব্যবহার করা |
| 3 | [03-remote-debugging-in-production.md](03-remote-debugging-in-production.md) | প্রোডাকশনে নিরাপদে remote debugging |
| 4 | [04-memory-leak-detection-and-analysis.md](04-memory-leak-detection-and-analysis.md) | Memory leak শনাক্ত ও বিশ্লেষণ |
| 5 | [05-performance-profiling-in-production.md](05-performance-profiling-in-production.md) | CPU profiling ও flame graph দিয়ে পারফরম্যান্স সমস্যা খোঁজা |

## এই মডিউল শেষে তুমি যা পারবে

- প্রোডাকশন সিস্টেমে না থামিয়ে সমস্যা তদন্তের সঠিক পদ্ধতি অনুসরণ করতে পারবে
- correlation ID ব্যবহার করে একটা নির্দিষ্ট request-এর পুরো যাত্রা ট্রেস করতে পারবে
- log level আর প্রাসঙ্গিক তথ্যসহ কার্যকর debug log লিখতে পারবে
- Node.js Inspector দিয়ে নিরাপদে remote debugging করতে পারবে
- heap snapshot তুলনা করে memory leak শনাক্ত করতে পারবে
- CPU profiling ও flame graph দিয়ে ধীরগতির root cause খুঁজে বের করতে পারবে

পরবর্তী মডিউল: **Module 35 — Advanced Topics**
