# Module 19 — ERD - Basics

Module 18-তে আমরা relationship আর normalization-এর তত্ত্ব শিখেছি। এই মডিউলে সেই তত্ত্বকে ছবিতে রূপ দেয়া শিখবো — ERD (Entity Relationship Diagram) — আর তারপর ৬টা ভিন্ন ভিন্ন বাস্তব-জীবনের সিস্টেমে (E-commerce, Freelancer Platform, Ride-Sharing, CMS, Job Portal, Booking) সম্পূর্ণ ERD, Schema, Transaction, Trigger, আর Index ডিজাইন করে দেখবো।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-database-design-concepts.md](01-database-design-concepts.md) | Database Design Concepts |
| 2 | [02-ecommerce-erd.md](02-ecommerce-erd.md) | E-commerce ERD |
| 3 | [03-homework-erd-for-blogpost.md](03-homework-erd-for-blogpost.md) | হোমওয়ার্ক: Blogpost ERD |
| 4 | [04-freelancer-platform-erd.md](04-freelancer-platform-erd.md) | Freelancer Platform ERD, Schema, Transactions, Triggers, Indexes |
| 5 | [05-ride-sharing-erd.md](05-ride-sharing-erd.md) | Ride-Sharing Database ERD, Schema, Transactions, Triggers, Indexes |
| 6 | [06-cms-erd.md](06-cms-erd.md) | Content Management (CMS) Database ERD, Schema, Transactions, Triggers, Indexes |
| 7 | [07-job-portal-erd.md](07-job-portal-erd.md) | Job Portal ERD, Schema, Transactions, Triggers, Indexes |
| 8 | [08-booking-erd.md](08-booking-erd.md) | Booking Database ERD, Schema, Transactions, Triggers, Indexes |
| 9 | [09-ecommerce-advanced-erd.md](09-ecommerce-advanced-erd.md) | E-commerce Database (Advanced) ERD, Schema, Transactions, Triggers, Indexes |

## এই মডিউল শেষে তুমি যা পারবে

- Entity, Attribute, Relationship আর Cardinality চিহ্নিত করে Mermaid `erDiagram` দিয়ে যেকোনো সিস্টেমের ব্লুপ্রিন্ট আঁকতে পারবে
- যেকোনো বাস্তব ডোমেইনের বর্ণনা থেকে টেবিল স্কিমা ও `CREATE TABLE` স্টেটমেন্ট ডিজাইন করতে পারবে
- একাধিক টেবিলে "সব অথবা কিছুই না" পরিবর্তনের জন্য Transaction লিখতে পারবে
- ডাটাবেজ-লেভেলে স্বয়ংক্রিয় নিয়ম বলবৎ করতে Trigger লিখতে পারবে
- কোন কলামে Index দরকার তা চিহ্নিত করে যুক্তিসহ ব্যাখ্যা করতে পারবে
- self-referencing সম্পর্ক, circular FK, আর overlap checking-এর মতো জটিল ডিজাইন সমস্যা সমাধান করতে পারবে

পরবর্তী মডিউল: **Module 20 — Structured Query Language (SQL)**
