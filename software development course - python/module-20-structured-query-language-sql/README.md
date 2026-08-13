# Module 20 — Structured Query Language (SQL)

Module 19-এ আমরা ৬টা বাস্তব ডোমেইনে ERD, Schema, Transaction, Trigger, আর Index ডিজাইন করেছি — কিন্তু সেগুলোর ভেতরের SQL কমান্ডগুলো (GRANT, BEGIN/COMMIT, JOIN) আমরা ব্যবহার করেছি ব্যাখ্যা ছাড়াই দ্রুত। এই মডিউলে আমরা থেমে, প্রতিটা কমান্ড গভীরভাবে বুঝবো — Access Control থেকে শুরু করে Transaction, JOIN-এর সব ধরন, Subquery, CTE, আর সবশেষে Window Function পর্যন্ত।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-dcl-grant-and-revoke.md](01-dcl-grant-and-revoke.md) | DCL: GRANT ও REVOKE Commands |
| 2 | [02-tcl-commit-rollback-savepoint.md](02-tcl-commit-rollback-savepoint.md) | TCL: COMMIT, ROLLBACK, SAVEPOINT |
| 3 | [03-understanding-join-operations.md](03-understanding-join-operations.md) | JOIN Operations বোঝা |
| 4 | [04-types-of-joins.md](04-types-of-joins.md) | JOIN-এর ধরন: INNER, LEFT, RIGHT, FULL |
| 5 | [05-writing-subqueries.md](05-writing-subqueries.md) | Subquery লেখা |
| 6 | [06-working-with-nested-queries.md](06-working-with-nested-queries.md) | Nested Query নিয়ে কাজ করা |
| 7 | [07-common-table-expressions.md](07-common-table-expressions.md) | Common Table Expressions (CTE) |
| 8 | [08-implementing-window-functions.md](08-implementing-window-functions.md) | Window Function প্রয়োগ করা |

## এই মডিউল শেষে তুমি যা পারবে

- `GRANT`/`REVOKE` দিয়ে role-ভিত্তিক অনুমতি নিয়ন্ত্রণ করতে পারবে
- `BEGIN`/`COMMIT`/`ROLLBACK`/`SAVEPOINT` দিয়ে নিরাপদ multi-step ডেটা পরিবর্তন লিখতে পারবে
- INNER, LEFT, RIGHT, FULL JOIN-এর পার্থক্য বুঝে সঠিকটা বেছে নিতে পারবে
- Scalar ও multi-row Subquery লিখতে পারবে, আর কখন JOIN বনাম Subquery ব্যবহার করা ভালো তা বুঝতে পারবে
- Nested Query (derived table) দিয়ে জটিল এগ্রিগেশন করতে পারবে
- CTE (`WITH`) দিয়ে জটিল কোয়েরিকে পড়ার-যোগ্য ধাপে সাজাতে পারবে
- Window Function (`OVER`, `PARTITION BY`, `RANK()`, `ROW_NUMBER()`) দিয়ে গ্রুপ না ভেঙে এগ্রিগেট হিসাব করতে পারবে

Module 1-এর "Welcome to SWE" থেকে শুরু করে এখানে পৌঁছানো পর্যন্ত তুমি Web Server, Backend System, Python/FastAPI, Async প্রোগ্রামিং, API Development, OOP, Cookies/Sessions, JWT Authentication, আর সবশেষে সম্পূর্ণ Database ও SQL-এর একটা শক্ত ভিত্তি তৈরি করে ফেলেছো — কিন্তু ডাটাবেজ নিয়ে যাত্রা এখনো শেষ হয়নি। এতদিন আমরা schema আর query সঠিকভাবে লেখা নিয়ে কাজ করেছি; পরের ধাপ হলো সেই query গুলো দ্রুত চালানো — অর্থাৎ Indexing আর Performance।

পরবর্তী মডিউল: **[Module 21 — Database Indexing And Performance](../module-21-database-indexing-and-performance/README.md)**
