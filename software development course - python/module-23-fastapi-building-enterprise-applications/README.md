# Module 23 — FastAPI - Building Enterprise Applications

আগের মডিউলে (NestJS ভার্সনে যা পড়ানো হতো) আমরা দেখেছিলাম কীভাবে একটা opinionated ফ্রেমওয়ার্ক Controller-Provider-Module প্যাটার্নে একটা এন্টারপ্রাইজ অ্যাপ্লিকেশন সংগঠিত করে। এই মডিউলে আমরা একই লক্ষ্যে পৌঁছাবো, কিন্তু FastAPI দিয়ে — যেখানে ফ্রেমওয়ার্ক নিজে কোনো কাঠামো চাপায় না। আমরা দেখবো কেন এই "কাঠামোহীনতা" আসলে একটা trade-off, কীভাবে নিজেরাই একটা প্রোডাকশন-শেপড প্রজেক্ট স্ক্যাফোল্ড করতে হয়, আর NestJS-এর Controller/Provider/Module ধারণাগুলোর FastAPI-সমতুল্য — Router, Dependency/Service, আর Feature Package — একটা একটা করে হাতে-কলমে বানাবো।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-fastapi-intro.md](01-fastapi-intro.md) | FastAPI-এর unopinionated দর্শন বনাম NestJS-এর opinionated কাঠামো |
| 2 | [02-introduction-to-fastapi-ecosystem.md](02-introduction-to-fastapi-ecosystem.md) | Starlette, Pydantic, SQLAlchemy, Alembic — FastAPI ইকোসিস্টেম |
| 3 | [03-running-a-fastapi-project.md](03-running-a-fastapi-project.md) | প্রোডাকশন-শেপড প্রজেক্ট স্ক্যাফোল্ড করে uvicorn দিয়ে চালানো |
| 4 | [04-files-and-folder-structures.md](04-files-and-folder-structures.md) | রিকমেন্ডেড ফোল্ডার কাঠামো, models বনাম schemas |
| 5 | [05-routers-in-fastapi.md](05-routers-in-fastapi.md) | Router — NestJS Controller-এর সমতুল্য |
| 6 | [06-dependencies-services-in-fastapi.md](06-dependencies-services-in-fastapi.md) | Depends() ও Service — NestJS Provider-এর সমতুল্য |
| 7 | [07-structuring-fastapi-feature-modules.md](07-structuring-fastapi-feature-modules.md) | Feature Package — NestJS Module-এর সমতুল্য |
| 8 | [08-module-summary.md](08-module-summary.md) | তুলনামূলক রিক্যাপ ও কখন কোন ফ্রেমওয়ার্ক ভালো |

## এই মডিউল শেষে তুমি যা পারবে

- ব্যাখ্যা করতে পারবে কেন FastAPI unopinionated, আর এই স্বাধীনতার সাথে আসা দায়িত্ব ও ঝুঁকি কী
- FastAPI-এর ইকোসিস্টেমের প্রতিটা লাইব্রেরির (Starlette, Pydantic, SQLAlchemy, Alembic) ভূমিকা ব্যাখ্যা করতে পারবে
- নিজে হাতে একটা প্রোডাকশন-শেপড প্রজেক্ট স্ক্যাফোল্ড করে uvicorn দিয়ে চালাতে পারবে
- একটা FastAPI প্রজেক্টের রিকমেন্ডেড ফোল্ডার কাঠামো পড়ে বুঝতে ও প্রয়োগ করতে পারবে
- `APIRouter` দিয়ে prefix ও tags সহ রুট বানাতে পারবে
- `Depends()` দিয়ে সার্ভিস ইনজেকশন করতে পারবে, request-scoped dependency-র গুরুত্ব বুঝবে
- Plain Python package দিয়ে ফিচার-ভিত্তিক মডিউল সংগঠন বানাতে পারবে, আর কেন এখানে টিম-ডিসিপ্লিন জরুরি তা ব্যাখ্যা করতে পারবে
- বুঝবে কোন পরিস্থিতিতে NestJS-এর opinionated কাঠামো, আর কোন পরিস্থিতিতে FastAPI-এর flexibility বেশি সুবিধাজনক

পরবর্তী মডিউল: **[Module 24 — FastAPI Project Ecommerce](../module-24-fastapi-project-ecommerce/README.md)**
