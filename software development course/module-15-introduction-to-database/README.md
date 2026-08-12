# Module 15 — Introduction To Database

এই মডিউলে আমরা বুঝেছি কেন Module 12-এর "No Database" TODO Manager-এর ডেটা সার্ভার রিস্টার্ট হলেই হারিয়ে যেত, এবং সেই সমস্যার সমাধান হিসেবে নিজের কম্পিউটারে PostgreSQL ইনস্টল করে, Node.js/Express অ্যাপের সাথে কানেক্ট করে, পুরো TODO Manager-কে একটা স্থায়ী ডেটাবেজ-চালিত fullstack application-এ রূপান্তর করেছি।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-introduction-to-database-systems.md](01-introduction-to-database-systems.md) | Database Systems পরিচিতি |
| 2 | [02-install-a-database-engine-in-windows.md](02-install-a-database-engine-in-windows.md) | Windows-এ Database Engine ইনস্টল করা |
| 3 | [03-how-to-connect-database-in-a-fullstack-application.md](03-how-to-connect-database-in-a-fullstack-application.md) | Fullstack Application-এ Database কানেক্ট করা |
| 4 | [04-fullstack-application-part-2.md](04-fullstack-application-part-2.md) | Fullstack Application Part 2 (TODO Manager-কে DB-তে রূপান্তর) |
| 5 | [05-what-is-sql.md](05-what-is-sql.md) | SQL কী? |

## এই মডিউল শেষে তুমি যা পারবে

- ব্যাখ্যা করতে পারবে RAM (volatile) আর ডিস্ক-ভিত্তিক ডেটাবেজ (non-volatile persistence)-এর মধ্যে পার্থক্য
- নিজের Windows কম্পিউটারে PostgreSQL ইনস্টল করে psql ও pgAdmin দিয়ে যাচাই করতে পারবে
- `pg` প্যাকেজ, `.env` ফাইল, আর connection pooling ব্যবহার করে Express অ্যাপকে PostgreSQL-এর সাথে কানেক্ট করতে পারবে
- একটা ইন-মেমরি অ্যাপ্লিকেশনকে ডেটাবেজ-চালিত অ্যাপ্লিকেশনে রূপান্তর করতে পারবে (CRUD + SQL Injection থেকে সুরক্ষিত query)
- SQL-কে একটা declarative ভাষা হিসেবে বুঝবে, এবং DDL, DML, DQL — এই তিনটা শ্রেণীর পার্থক্য করতে পারবে

পরবর্তী মডিউল: **Module 16 — Database Schema And SQL Introduction**
