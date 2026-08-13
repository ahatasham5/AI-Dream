# Module 21 — Database Indexing And Performance

এই মডিউলে আমরা ডাটাবেসকে দ্রুত, নিরাপদ, আর স্কেলযোগ্য করে তোলার কৌশলগুলো শিখেছি — ইনডেক্সিং কীভাবে কাজ করে তা দিয়ে শুরু করে, কুয়েরি অপ্টিমাইজেশন আর ক্যাশিং হয়ে, স্টোরড প্রসিডিউর-ভিউ-ট্রিগারের মতো ডাটাবেস-সাইড লজিক, তারপর অথেন্টিকেশন-SQL ইনজেকশন-এনক্রিপশন-RBAC-এর মতো নিরাপত্তা বিষয়, আর সবশেষে ব্যাকআপ কৌশল ও Firebase/Azure SQL-এর মতো ক্লাউড ডাটাবেস পর্যন্ত।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-understanding-database-indexing.md](01-understanding-database-indexing.md) | ইনডেক্সিং কী, কেন দরকার |
| 2 | [02-types-of-indexes-btree-hash-composite.md](02-types-of-indexes-btree-hash-composite.md) | B-Tree, Hash, Composite ইনডেক্স |
| 3 | [03-clustered-vs-non-clustered-indexes.md](03-clustered-vs-non-clustered-indexes.md) | Clustered বনাম Non-Clustered ইনডেক্স |
| 4 | [04-indexing-best-practices.md](04-indexing-best-practices.md) | ইনডেক্সিং-এর ভালো অভ্যাস |
| 5 | [05-query-optimization-fundamentals.md](05-query-optimization-fundamentals.md) | কুয়েরি অপ্টিমাইজেশনের মূলনীতি |
| 6 | [06-database-caching-strategies.md](06-database-caching-strategies.md) | ডাটাবেস ক্যাশিং কৌশল |
| 7 | [07-analyzing-query-execution-plans.md](07-analyzing-query-execution-plans.md) | Execution Plan বিশ্লেষণ (EXPLAIN ANALYZE) |
| 8 | [08-performance-tuning-techniques.md](08-performance-tuning-techniques.md) | সামগ্রিক পারফরম্যান্স টিউনিং |
| 9 | [09-what-are-stored-procedures-performance-benefits.md](09-what-are-stored-procedures-performance-benefits.md) | Stored Procedure ও এর পারফরম্যান্স সুবিধা |
| 10 | [10-creating-and-using-views.md](10-creating-and-using-views.md) | View তৈরি ও ব্যবহার |
| 11 | [11-what-are-triggers-automatic-actions.md](11-what-are-triggers-automatic-actions.md) | Trigger — স্বয়ংক্রিয় প্রতিক্রিয়া |
| 12 | [12-user-authentication-and-authorization.md](12-user-authentication-and-authorization.md) | ডাটাবেস-স্তরে Authentication ও Authorization |
| 13 | [13-sql-injection-and-prevention-techniques.md](13-sql-injection-and-prevention-techniques.md) | SQL Injection ও প্রতিরোধ কৌশল |
| 14 | [14-encryption-techniques-in-databases.md](14-encryption-techniques-in-databases.md) | ডাটাবেস এনক্রিপশন কৌশল |
| 15 | [15-role-based-access-control-rbac.md](15-role-based-access-control-rbac.md) | Role-Based Access Control (RBAC) |
| 16 | [16-backup-and-disaster-recovery-strategies.md](16-backup-and-disaster-recovery-strategies.md) | ব্যাকআপ ও দুর্যোগ পুনরুদ্ধার কৌশল |
| 17 | [17-introduction-to-cloud-databases.md](17-introduction-to-cloud-databases.md) | ক্লাউড ডাটাবেস পরিচিতি |
| 18 | [18-firebase-realtime-database-overview.md](18-firebase-realtime-database-overview.md) | Firebase Realtime Database |
| 19 | [19-firebase-cloud-firestore-fundamentals.md](19-firebase-cloud-firestore-fundamentals.md) | Firebase Cloud Firestore |
| 20 | [20-azure-sql-database-basics.md](20-azure-sql-database-basics.md) | Azure SQL Database বেসিক্স |
| 21 | [21-setting-up-azure-sql-database.md](21-setting-up-azure-sql-database.md) | Azure SQL Database সেটআপ করা |
| 22 | [22-connecting-and-managing-azure-sql.md](22-connecting-and-managing-azure-sql.md) | Azure SQL সংযোগ ও ব্যবস্থাপনা |

## এই মডিউল শেষে তুমি যা পারবে

- ব্যাখ্যা করতে পারবে ইনডেক্স কীভাবে কাজ করে এবং B-Tree, Hash, Composite, Clustered, Non-Clustered-এর মধ্যে পার্থক্য বুঝবে
- সঠিক নিয়ম মেনে ইনডেক্স বসাতে পারবে এবং `EXPLAIN ANALYZE` দিয়ে কুয়েরির পারফরম্যান্স বিশ্লেষণ করতে পারবে
- কুয়েরি অপ্টিমাইজেশন, ক্যাশিং (Redis), আর সাধারণ পারফরম্যান্স টিউনিং কৌশল প্রয়োগ করতে পারবে
- Stored Procedure, View, আর Trigger লিখে ডাটাবেস-সাইড লজিক তৈরি করতে পারবে
- SQL Injection চিনতে ও Parameterized Query দিয়ে প্রতিরোধ করতে পারবে
- ডাটাবেস এনক্রিপশন, RBAC, আর GRANT/REVOKE দিয়ে অনুমতি নিয়ন্ত্রণ করতে পারবে
- Backup, RPO/RTO-এর ধারণা বুঝে দুর্যোগ পুনরুদ্ধার পরিকল্পনা করতে পারবে
- Firebase Realtime Database ও Cloud Firestore-এর মধ্যে পার্থক্য বুঝে উপযুক্তটা বেছে নিতে পারবে
- Azure SQL Database সেটআপ করে Python/FastAPI অ্যাপ্লিকেশন থেকে নিরাপদে সংযোগ করতে পারবে

পরবর্তী মডিউল: **[Module 22 — Software Design Patterns - Theory With Implementations](../module-22-software-design-patterns/README.md)**
