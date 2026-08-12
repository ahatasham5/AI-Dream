# Module 24 — NestJS Project Ecommerce

এই মডিউলে আমরা এতদিন আলাদা আলাদা ভাবে শেখা সব ধারণা — Module 22-এর ডিজাইন প্যাটার্ন ও Dependency Injection, Module 23-এর NestJS বেসিক, Module 18-20-এর ERD ও রিলেশনশিপ, Module 12-এর JWT অথেন্টিকেশন — এক জায়গায় এনে একটা বাস্তব, চালু হওয়া প্রজেক্ট বানিয়েছি: **ShopKori**, একটা মাল্টি-ভেন্ডর ই-কমার্স ব্যাকএন্ড। পুরো মডিউলটাই একটানা একটা প্রজেক্ট জার্নাল — রিকোয়ারমেন্ট অ্যানালাইসিস থেকে শুরু করে সুপার অ্যাডমিন, সাবস্ক্রিপশন, স্টোর, আর প্রোডাক্ট মডিউল পর্যন্ত, ধাপে ধাপে, প্রতিটা লেসন আগেরটার উপর দাঁড়িয়ে।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-project-requirements.md](01-project-requirements.md) | ShopKori-এর স্টেকহোল্ডার, রোল, ইউজার স্টোরি চিহ্নিতকরণ |
| 2 | [02-requirement-analysis-part-2.md](02-requirement-analysis-part-2.md) | রিকোয়ারমেন্ট গ্রুমিং, edge case, প্রাথমিক ERD |
| 3 | [03-technical-grooming-and-project-bootstrap.md](03-technical-grooming-and-project-bootstrap.md) | টুলস্ট্যাক সিদ্ধান্ত, NestJS প্রজেক্ট বুটস্ট্র্যাপ, ফোল্ডার কাঠামো |
| 4 | [04-finding-p0-task-and-hands-on-details.md](04-finding-p0-task-and-hands-on-details.md) | P0/P1/P2 প্রায়োরিটাইজেশন, ডেভেলপমেন্ট রোডম্যাপ |
| 5 | [05-connecting-database.md](05-connecting-database.md) | Docker PostgreSQL, `@nestjs/config`, TypeORM কানেকশন |
| 6 | [06-connecting-entity-with-typeorm-and-running-migration.md](06-connecting-entity-with-typeorm-and-running-migration.md) | `User` এন্টিটি, TypeORM migration generate/run |
| 7 | [07-api-for-super-admins-project-requirement.md](07-api-for-super-admins-project-requirement.md) | সুপার অ্যাডমিন PRD, seed script, RolesGuard |
| 8 | [08-bootstraping-subscription-module-with-prd.md](08-bootstraping-subscription-module-with-prd.md) | সাবস্ক্রিপশন মডিউলের PRD, `SubscriptionPlan`/`StoreSubscription` এন্টিটি |
| 9 | [09-subscription-module-ui-planning-and-api-handson.md](09-subscription-module-ui-planning-and-api-handson.md) | API কন্ট্র্যাক্ট প্ল্যানিং, লেয়ার্ড আর্কিটেকচার সিকোয়েন্স ডায়াগ্রাম |
| 10 | [10-subscription-module-implementation-nestjs-module.md](10-subscription-module-implementation-nestjs-module.md) | Module wiring, `TypeOrmModule.forFeature`, migration run |
| 11 | [11-module-introduction.md](11-module-introduction.md) | সাবস্ক্রিপশন সাব-আর্ক পুনঃপরিচিতি, স্তর-ভিত্তিক ইমপ্লিমেন্টেশন ক্রম |
| 12 | [12-preparing-dto-and-repository-layer.md](12-preparing-dto-and-repository-layer.md) | DTO ভ্যালিডেশন (`class-validator`), কাস্টম Repository প্যাটার্ন |
| 13 | [13-service-and-controller.md](13-service-and-controller.md) | `SubscriptionService`/`SubscriptionController`, গার্ড পাইপলাইন |
| 14 | [14-testing-end-points.md](14-testing-end-points.md) | `curl` দিয়ে ম্যানুয়াল টেস্টিং, হ্যাপি পাথ ও এজ কেস |
| 15 | [15-testing-api-and-assignment.md](15-testing-api-and-assignment.md) | Jest e2e টেস্ট, স্বয়ংক্রিয় রিগ্রেশন প্রোটেকশন, অ্যাসাইনমেন্ট |
| 16 | [16-store-setup-module-introduction.md](16-store-setup-module-introduction.md) | Store মডিউল PRD, আন্তঃমডিউল যোগাযোগের ডিজাইন |
| 17 | [17-developing-store-module.md](17-developing-store-module.md) | `Store` এন্টিটি, DTO, Repository |
| 18 | [18-developing-controller-and-module.md](18-developing-controller-and-module.md) | `StoreService` (সাবস্ক্রিপশন-চেক লজিক), `StoreController` |
| 19 | [19-testing-the-system.md](19-testing-the-system.md) | User→Subscription→Store ইন্টিগ্রেশন টেস্টিং |
| 20 | [20-product-module-hands-on.md](20-product-module-hands-on.md) | `Product`/`Category` এন্টিটি, মালিকানা যাচাই, পুরো প্রজেক্ট রিক্যাপ |

## এই মডিউল শেষে তুমি যা পারবে

- রিকোয়ারমেন্ট থেকে শুরু করে প্রোডাকশন-স্টাইল একটা NestJS + TypeORM ব্যাকএন্ড প্রজেক্ট নিজে হাতে বুটস্ট্র্যাপ করতে পারবে
- বিজনেস ডোমেইন অনুযায়ী মডিউলার আর্কিটেকচার ডিজাইন করতে পারবে (Controller → Service → Repository লেয়ারিং)
- TypeORM এন্টিটি, রিলেশনশিপ (One-to-Many, Many-to-One, join entity), আর মাইগ্রেশন ওয়ার্কফ্লো ব্যবহার করতে পারবে
- DTO ভ্যালিডেশন, কাস্টম Repository, আর Guard/Decorator দিয়ে রোল-বেজড অ্যাক্সেস কন্ট্রোল বাস্তবায়ন করতে পারবে
- একাধিক NestJS মডিউলকে `imports`/`exports`-এর মাধ্যমে নিরাপদে একে অপরের সাথে সংযুক্ত করতে পারবে
- ম্যানুয়াল (`curl`) ও স্বয়ংক্রিয় (Jest e2e) — দুই ধরনের API টেস্টিং করতে পারবে

পরবর্তী মডিউল: **Module 25 — NestJS Advanced**
