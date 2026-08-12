# Module 16 — Database Schema And SQL Introduction

Module 15-এ আমরা SQL-এর সাথে পরিচিত হয়েছিলাম আর একটা সাধারণ `todos` টেবিল বানিয়েছিলাম। এই মডিউলে আমরা সেই পরিচয়কে গভীরে নিয়ে গেছি — বাস্তব সমস্যা থেকে কীভাবে এন্টিটি ও সম্পর্ক বের করতে হয়, কীভাবে সঠিক ডেটা টাইপ ও কনস্ট্রেইন্ট দিয়ে টেবিল ডিজাইন করতে হয়, কীভাবে লাইভ টেবিলে নিরাপদে পরিবর্তন আনতে হয়, আর কীভাবে SQL-এর ভেতরেই লুপ চালিয়ে বিপুল পরিমাণ টেস্ট ডেটা তৈরি করতে হয়।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-thinking-approach-for-database-design-start-from-zero.md](01-thinking-approach-for-database-design-start-from-zero.md) | Database Design-এর চিন্তাপদ্ধতি |
| 2 | [02-schema-design-basics.md](02-schema-design-basics.md) | Schema Design Basics |
| 3 | [03-how-to-alter-a-live-table.md](03-how-to-alter-a-live-table.md) | Live Table ALTER করা |
| 4 | [04-how-to-loop-in-sql-and-generate-fake-data.md](04-how-to-loop-in-sql-and-generate-fake-data.md) | SQL-এ লুপ ও Fake Data জেনারেশন |

## এই মডিউল শেষে তুমি যা পারবে

- বাস্তব সমস্যার বর্ণনা থেকে entity, attribute ও relationship বের করতে পারবে
- উপযুক্ত ডেটা টাইপ, `PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE` কনস্ট্রেইন্ট দিয়ে `CREATE TABLE` লিখতে পারবে
- নামকরণের প্রচলিত নিয়ম (plural টেবিল নাম, snake_case কলাম নাম) মেনে চলতে পারবে
- `ALTER TABLE` দিয়ে লাইভ টেবিলে নিরাপদে কলাম যোগ/মুছে/পরিবর্তন করতে পারবে এবং safe migration-এর ধাপগুলো বুঝবে
- `generate_series` ও PL/pgSQL লুপ ব্যবহার করে বিপুল পরিমাণ টেস্ট/ফেক ডেটা তৈরি করতে পারবে

পরবর্তী মডিউল: **Module 17 — Database Read Query Fundamentals**
