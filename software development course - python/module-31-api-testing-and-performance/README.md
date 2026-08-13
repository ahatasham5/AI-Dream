# Module 31 — API Testing & Performance

Module 30 পর্যন্ত আমরা API-কে নিরাপদ রাখা শিখেছি। কিন্তু নিরাপদ API-ও যদি ধীরগতির হয় বা লোডের চাপে ভেঙে পড়ে, তাহলে ইউজার অভিজ্ঞতা খারাপ হয়ে যায়। এই মডিউলে আমরা শিখবো কীভাবে Postman, pytest + httpx, Apache JMeter আর Locust দিয়ে FastAPI-এর পারফরম্যান্স টেস্ট করা যায়, response time-কে সঠিকভাবে বিশ্লেষণ করা যায় (average না, percentile দিয়ে), আর caching কৌশল দিয়ে ধীরগতির API-কে দ্রুত করা যায়।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-introduction-to-api-performance-testing.md](01-introduction-to-api-performance-testing.md) | Performance Testing কী, কেন দরকার |
| 2 | [02-using-postman-for-api-testing-and-performance-monitoring.md](02-using-postman-for-api-testing-and-performance-monitoring.md) | Postman ও pytest + httpx দিয়ে response time ও correctness টেস্ট |
| 3 | [03-load-testing-with-apache-jmeter.md](03-load-testing-with-apache-jmeter.md) | JMeter ও Locust দিয়ে লোড টেস্টিং |
| 4 | [04-measuring-and-analyzing-api-response-times.md](04-measuring-and-analyzing-api-response-times.md) | Percentile (p50/p95/p99) ও Throughput বিশ্লেষণ |
| 5 | [05-api-performance-optimization-caching-strategies.md](05-api-performance-optimization-caching-strategies.md) | In-memory ও Redis (async) ক্যাশিং কৌশল |
| 6 | [06-api-testing-logging-and-performance.md](06-api-testing-logging-and-performance.md) | টেস্টিং, লগিং ও পারফরম্যান্সের সংযোগ |

## এই মডিউল শেষে তুমি যা পারবে

- Postman ব্যবহার করে API-এর response time মাপতে ও automated test script লিখতে পারবে
- pytest + httpx দিয়ে FastAPI-এর জন্য automated, CI-friendly regression টেস্ট লিখতে পারবে
- Apache JMeter বা Locust দিয়ে বাস্তব লোড সিমুলেট করে load test চালাতে পারবে
- average-এর বদলে percentile (p50, p95, p99) দিয়ে পারফরম্যান্স বিশ্লেষণ করতে পারবে
- in-memory এবং Redis (redis.asyncio) ক্যাশিং দিয়ে API response time কমাতে পারবে, আর cache invalidation-এর ঝুঁকি এড়াতে পারবে
- performance measurement, logging আর optimization-এর মধ্যে সম্পর্ক বুঝবে

পরবর্তী মডিউল: **[Module 32 — Logging & Observability](../module-32-logging-and-observability/README.md)**
