# Module 24 — FastAPI Project Ecommerce

এই মডিউলে আমরা এতদিন আলাদা আলাদা ভাবে শেখা সব ধারণা — Python বেসিক, FastAPI-এর রুটিং ও dependency injection, SQLAlchemy/Alembic-এর মাইগ্রেশন ওয়ার্কফ্লো, Pydantic ভ্যালিডেশন — এক জায়গায় এনে একটা বাস্তব, চালু হওয়া প্রজেক্ট বানিয়েছি: **ShopKori**, একটা মাল্টি-ভেন্ডর ই-কমার্স ব্যাকএন্ড। পুরো মডিউলটাই একটানা একটা প্রজেক্ট জার্নাল — রিকোয়ারমেন্ট অ্যানালাইসিস থেকে শুরু করে সুপার অ্যাডমিন, সাবস্ক্রিপশন, স্টোর, আর প্রোডাক্ট মডিউল পর্যন্ত, ধাপে ধাপে, প্রতিটা লেসন আগেরটার উপর দাঁড়িয়ে। প্রতিটা লেসনে শুধু "কীভাবে বানাতে হয়" তা নয়, বরং "কেন এভাবে বানানো হচ্ছে" আর "বাস্তব প্রোডাকশনে এটা কীভাবে ভুল হতে পারে" — এই দুটো প্রশ্নের উত্তরও রাখা হয়েছে, যাতে এটা শুধু একটা কোডিং এক্সারসাইজ না হয়ে একটা lead-level ইঞ্জিনিয়ারিং অভ্যাসের চর্চা হয়।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-project-requirements.md](01-project-requirements.md) | ShopKori-এর স্টেকহোল্ডার, রোল, ইউজার স্টোরি চিহ্নিতকরণ |
| 2 | [02-requirement-analysis-part-2.md](02-requirement-analysis-part-2.md) | রিকোয়ারমেন্ট গ্রুমিং, edge case, প্রাথমিক ERD, timezone সতর্কতা |
| 3 | [03-technical-grooming-and-project-bootstrap.md](03-technical-grooming-and-project-bootstrap.md) | টুলস্ট্যাক সিদ্ধান্ত (FastAPI + SQLAlchemy + Alembic + Pydantic), প্রজেক্ট বুটস্ট্র্যাপ, ফোল্ডার কাঠামো |
| 4 | [04-finding-p0-task-and-hands-on-details.md](04-finding-p0-task-and-hands-on-details.md) | P0/P1/P2 প্রায়োরিটাইজেশন, ডেভেলপমেন্ট রোডম্যাপ |
| 5 | [05-connecting-database.md](05-connecting-database.md) | Docker PostgreSQL, SQLAlchemy Engine/Session, connection pool exhaustion সতর্কতা |
| 6 | [06-connecting-entity-with-sqlalchemy-and-running-migration.md](06-connecting-entity-with-sqlalchemy-and-running-migration.md) | `User` মডেল, Alembic `revision --autogenerate` / `upgrade head` |
| 7 | [07-api-for-super-admins-project-requirement.md](07-api-for-super-admins-project-requirement.md) | সুপার অ্যাডমিন PRD, seed script, `require_roles()` dependency |
| 8 | [08-bootstraping-subscription-module-with-prd.md](08-bootstraping-subscription-module-with-prd.md) | সাবস্ক্রিপশন মডিউলের PRD, `SubscriptionPlan`/`StoreSubscription` মডেল |
| 9 | [09-subscription-module-ui-planning-and-api-handson.md](09-subscription-module-ui-planning-and-api-handson.md) | API কন্ট্র্যাক্ট প্ল্যানিং, লেয়ার্ড আর্কিটেকচার সিকোয়েন্স ডায়াগ্রাম |
| 10 | [10-subscription-module-implementation-fastapi-module.md](10-subscription-module-implementation-fastapi-module.md) | `APIRouter` mounting, model registration, migration run |
| 11 | [11-module-introduction.md](11-module-introduction.md) | সাবস্ক্রিপশন সাব-আর্ক পুনঃপরিচিতি, স্তর-ভিত্তিক ইমপ্লিমেন্টেশন ক্রম |
| 12 | [12-preparing-schemas-and-repository-layer.md](12-preparing-schemas-and-repository-layer.md) | Pydantic Schema ভ্যালিডেশন, Repository প্যাটার্ন, Decimal বনাম float |
| 13 | [13-service-and-router.md](13-service-and-router.md) | `SubscriptionService`/Router, `response_model` সিকিউরিটি |
| 14 | [14-testing-end-points.md](14-testing-end-points.md) | `curl` দিয়ে ম্যানুয়াল টেস্টিং, হ্যাপি পাথ ও এজ কেস |
| 15 | [15-testing-api-and-assignment.md](15-testing-api-and-assignment.md) | `pytest` + `httpx.AsyncClient`, dependency override, অ্যাসাইনমেন্ট |
| 16 | [16-store-setup-module-introduction.md](16-store-setup-module-introduction.md) | Store মডিউল PRD, আন্তঃমডিউল যোগাযোগের ডিজাইন, race condition |
| 17 | [17-developing-store-module.md](17-developing-store-module.md) | `Store` মডেল, Schema, Repository, `COUNT(*)` অপ্টিমাইজেশন |
| 18 | [18-developing-router-and-service.md](18-developing-router-and-service.md) | `StoreService` (সাবস্ক্রিপশন-চেক লজিক), single-commit প্যাটার্ন, রুট-অর্ডারিং |
| 19 | [19-testing-the-system.md](19-testing-the-system.md) | User→Subscription→Store ইন্টিগ্রেশন টেস্টিং, N+1 কোয়েরি |
| 20 | [20-product-module-hands-on.md](20-product-module-hands-on.md) | `Product`/`Category` মডেল, IDOR প্রতিরোধ, stock race condition |

## এই মডিউল শেষে তুমি যা পারবে

- রিকোয়ারমেন্ট থেকে শুরু করে প্রোডাকশন-স্টাইল একটা FastAPI + SQLAlchemy ব্যাকএন্ড প্রজেক্ট নিজে হাতে বুটস্ট্র্যাপ করতে পারবে
- বিজনেস ডোমেইন অনুযায়ী মডিউলার আর্কিটেকচার ডিজাইন করতে পারবে (Router → Service → Repository লেয়ারিং)
- SQLAlchemy মডেল, রিলেশনশিপ (One-to-Many, Many-to-One, association entity), আর Alembic মাইগ্রেশন ওয়ার্কফ্লো ব্যবহার করতে পারবে
- Pydantic স্কিমা ভ্যালিডেশন, কাস্টম Repository, আর dependency-চেইন দিয়ে রোল-বেজড অ্যাক্সেস কন্ট্রোল বাস্তবায়ন করতে পারবে
- একাধিক FastAPI মডিউলকে নিয়ন্ত্রিতভাবে (পাবলিক সার্ভিস ফাংশনের মাধ্যমে) একে অপরের সাথে সংযুক্ত করতে পারবে
- ম্যানুয়াল (`curl`) ও স্বয়ংক্রিয় (`pytest` + `httpx`) — দুই ধরনের API টেস্টিং করতে পারবে
- connection pool exhaustion, N+1 কোয়েরি, race condition, আর IDOR-এর মতো বাস্তব প্রোডাকশন সমস্যা চিহ্নিত ও প্রতিরোধ করতে পারবে

পরবর্তী মডিউল: **[Module 25 — FastAPI Advanced](../module-25-fastapi-advanced/README.md)**
