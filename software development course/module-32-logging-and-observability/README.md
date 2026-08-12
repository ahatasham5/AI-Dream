# Module 32 — Logging & Observability

Module 31-এ আমরা শিখেছি API-এর পারফরম্যান্স কীভাবে মাপতে ও উন্নত করতে হয়, আর দেখেছি এই পুরো প্রক্রিয়ায় logging কতটা গুরুত্বপূর্ণ ভূমিকা রাখে। এই মডিউলে আমরা সেই logging-কে একটা প্রফেশনাল, প্রোডাকশন-রেডি সিস্টেমে পরিণত করবো — Winston আর Pino দিয়ে শুরু করে, structured logging-এর নিয়ম মেনে, প্রতিটা request/response আর error স্বয়ংক্রিয়ভাবে ধরে, আর লগ ফাইল নিয়ন্ত্রিতভাবে সংরক্ষণ করে।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-implementing-logging-with-winston-and-pino.md](01-implementing-logging-with-winston-and-pino.md) | Winston ও Pino দিয়ে logging শুরু করা |
| 2 | [02-structured-logging-best-practices.md](02-structured-logging-best-practices.md) | Structured (JSON) logging-এর নিয়ম |
| 3 | [03-request-and-response-logging-middleware.md](03-request-and-response-logging-middleware.md) | স্বয়ংক্রিয় Request/Response Logging Middleware |
| 4 | [04-error-logging-and-stack-trace-management.md](04-error-logging-and-stack-trace-management.md) | Error Logging ও Stack Trace ব্যবস্থাপনা |
| 5 | [05-log-rotation-and-storage-strategies.md](05-log-rotation-and-storage-strategies.md) | Log Rotation ও সংরক্ষণ কৌশল |

## এই মডিউল শেষে তুমি যা পারবে

- Winston ও Pino লাইব্রেরি দিয়ে প্রোডাকশন-গ্রেড logger সেটআপ করতে পারবে
- unstructured আর structured logging-এর পার্থক্য বুঝে সঠিক ফরম্যাটে লগ লিখতে পারবে
- middleware দিয়ে প্রতিটা HTTP request/response স্বয়ংক্রিয়ভাবে লগ করতে পারবে
- centralized error handling middleware দিয়ে error ও stack trace সঠিকভাবে ধরতে ও লগ করতে পারবে
- log rotation কনফিগার করে ডিস্ক স্পেস ও পুরনো লগ ব্যবস্থাপনা করতে পারবে

পরবর্তী মডিউল: **Module 33 — Monitoring & Alerting**
