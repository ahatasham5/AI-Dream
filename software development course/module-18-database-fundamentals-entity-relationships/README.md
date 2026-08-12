# Module 18 — Database Fundamentals Entity Relationships

এই মডিউলে আমরা একটা টেবিল থেকে বেরিয়ে একাধিক টেবিলের জগতে ঢুকবো — সম্পর্ক (relationship) কী, কেন দরকার, কীভাবে One-to-Many আর Many-to-Many বাস্তবায়ন করতে হয়, JOIN আর Subquery দিয়ে কীভাবে ছড়ানো ডেটা একসাথে করতে হয়, আর সবশেষে Database Normalization (1NF, 2NF)-এর মাধ্যমে একটা schema-কে নিয়মতান্ত্রিকভাবে পরিষ্কার করতে হয়। পুরো মডিউল জুড়ে আমরা একই বইয়ের দোকান আর ছাত্র-কোর্স উদাহরণ ধাপে ধাপে বিকশিত করবো।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-module-intro-what-is-relationship.md](01-module-intro-what-is-relationship.md) | মডিউল পরিচিতি: Relationship কী |
| 2 | [02-working-with-db-oop-point-of-view.md](02-working-with-db-oop-point-of-view.md) | Database-কে OOP-এর দৃষ্টিকোণ থেকে দেখা |
| 3 | [03-why-we-need-multiple-tables.md](03-why-we-need-multiple-tables.md) | কেন একাধিক টেবিল দরকার |
| 4 | [04-problem-with-current-two-table-design.md](04-problem-with-current-two-table-design.md) | বর্তমান দুই-টেবিল ডিজাইনের সমস্যা |
| 5 | [05-implementing-one-to-many-many-to-many-relationship.md](05-implementing-one-to-many-many-to-many-relationship.md) | One to Many / Many to Many বাস্তবায়ন |
| 6 | [06-more-on-one-to-many-one-to-one-relationship.md](06-more-on-one-to-many-one-to-one-relationship.md) | One to Many ও One to One নিয়ে আরও |
| 7 | [07-subqueries-and-joins-why-do-we-need-them.md](07-subqueries-and-joins-why-do-we-need-them.md) | Subquery ও Join: কেন দরকার |
| 8 | [08-relationship-type-one-to-many-real-life-example.md](08-relationship-type-one-to-many-real-life-example.md) | One to Many: বাস্তব উদাহরণ |
| 9 | [09-many-to-many-relationship-real-life-example.md](09-many-to-many-relationship-real-life-example.md) | Many to Many: বাস্তব উদাহরণ |
| 10 | [10-database-normalization-introduction.md](10-database-normalization-introduction.md) | Database Normalization পরিচিতি |
| 11 | [11-first-normal-form-in-action.md](11-first-normal-form-in-action.md) | First Normal Form হাতেকলমে |
| 12 | [12-candidate-key-primary-key-composite-key.md](12-candidate-key-primary-key-composite-key.md) | Candidate Key, Primary Key ও Composite Key |
| 13 | [13-questions-related-to-2nf.md](13-questions-related-to-2nf.md) | 2NF নিয়ে নিজেকে যাচাই করার প্রশ্ন |
| 14 | [14-second-normal-form-in-detail-part-1.md](14-second-normal-form-in-detail-part-1.md) | Second Normal Form বিস্তারিত — পার্ট ১ |
| 15 | [15-second-normal-form-in-detail-part-2.md](15-second-normal-form-in-detail-part-2.md) | Second Normal Form বিস্তারিত — পার্ট ২ |

## এই মডিউল শেষে তুমি যা পারবে

- Table-Row-Column আর Class-Object-Property-এর মধ্যেকার সাদৃশ্য ব্যাখ্যা করতে পারবে
- Redundancy আর Update/Insert/Delete Anomaly চিনতে পারবে এবং কেন multiple table দরকার তা ব্যাখ্যা করতে পারবে
- Foreign Key দিয়ে One-to-Many, junction table দিয়ে Many-to-Many, আর shared primary key দিয়ে One-to-One সম্পর্ক বাস্তবায়ন করতে পারবে
- `JOIN` (INNER/LEFT) ও Subquery ব্যবহার করে একাধিক টেবিল থেকে জটিল প্রশ্নের উত্তর বের করতে পারবে
- Candidate Key, Primary Key ও Composite Key-এর পার্থক্য বুঝবে
- একটা schema-কে 1NF ও 2NF অনুযায়ী যাচাই করে redundancy-মুক্ত করতে পারবে

পরবর্তী মডিউল: **Module 19 — ERD Basics**
