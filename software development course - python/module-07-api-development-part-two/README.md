# Module 7 — API Development Part Two

Module 6-এ আমরা FastAPI দিয়ে প্রথমবারের মতো একটা কাজ করা API বানিয়েছিলাম — status code, routing, POST request-এর অ্যানাটমি, ডেটা মডেলিং আর ভ্যালিডেশন। এই মডিউলে আমরা সেই একই API-কে একটা পরিণত, প্রোডাকশন-মানের স্ট্রাকচারে রূপান্তর করি — router দিয়ে রুট ভাগ করা, service layer দিয়ে ব্যবসায়িক লজিক আলাদা করা, আর middleware/dependency দিয়ে authentication, rate limiting আর audit logging-এর মতো বাস্তব ফিচার যোগ করা।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-module-recap-and-introduction.md](01-module-recap-and-introduction.md) | Module 6 রিক্যাপ, নতুন মডিউলের যাত্রাপথ |
| 2 | [02-why-routers-implementing-routers.md](02-why-routers-implementing-routers.md) | Router কেন দরকার, FastAPI-র APIRouter দিয়ে বাস্তবায়ন |
| 3 | [03-introduction-to-controller.md](03-introduction-to-controller.md) | Service Layer (Controller-স্টাইল) দিয়ে ব্যবসায়িক লজিক আলাদা করা |
| 4 | [04-introduction-to-middleware.md](04-introduction-to-middleware.md) | Middleware বনাম Dependency, call_next(), কখন কোনটা ব্যবহার করবে |
| 5 | [05-middleware-project-one.md](05-middleware-project-one.md) | হাতেকলমে auth_check dependency + logging middleware প্রজেক্ট |
| 6 | [06-module-recap-with-rate-limiting-middleware.md](06-module-recap-with-rate-limiting-middleware.md) | রিক্যাপ ও Rate Limiting middleware বাস্তবায়ন |
| 7 | [07-audit-logger-project.md](07-audit-logger-project.md) | Audit Logger middleware প্রজেক্ট |
| 8 | [08-rate-limiting-algorithms-to-explore.md](08-rate-limiting-algorithms-to-explore.md) | Rate Limiting-এর বিভিন্ন অ্যালগরিদম (Token Bucket, Leaky Bucket, ইত্যাদি) |
| 9 | [09-module-codebase-link.md](09-module-codebase-link.md) | মডিউলের সহায়ক কোডবেজ কেন ও কী থাকবে তার ব্যাখ্যা |
| 10 | [10-assignment.md](10-assignment.md) | চূড়ান্ত অ্যাসাইনমেন্ট — Task Management API |

## এই মডিউল শেষে তুমি যা পারবে

- FastAPI-র `APIRouter` দিয়ে বড় অ্যাপ্লিকেশনের রুটকে আলাদা আলাদা ফাইলে সংগঠিত করতে পারবে
- Router আর Service Layer-এর দায়িত্ব আলাদা করে (Separation of Concerns) কোড লিখতে পারবে
- Middleware আর Dependency-র পার্থক্য বুঝবে — কোনটা global concern-এর জন্য, কোনটা per-route concern-এর জন্য, এবং এই দুইয়ের মধ্যে ভুল সিদ্ধান্ত এড়াতে পারবে
- `Depends()` দিয়ে authentication-ভিত্তিক dependency লিখে নির্দিষ্ট রুট সুরক্ষিত করতে পারবে
- Rate limiting middleware বানিয়ে সার্ভারকে অতিরিক্ত request থেকে রক্ষা করতে পারবে, Token Bucket, Leaky Bucket, Fixed/Sliding Window অ্যালগরিদমের পার্থক্য বুঝবে, আর কেন in-memory rate limiting মাল্টি-প্রসেস ডিপ্লয়মেন্টে ব্যর্থ হয় সেটা জানবে
- Audit logging middleware দিয়ে সিস্টেমের গুরুত্বপূর্ণ কাজের একটা দায়বদ্ধ রেকর্ড রাখতে পারবে
- এই সবগুলো উপাদান একসাথে জুড়ে একটা পরিণত, প্রোডাকশন-স্টাইলের FastAPI প্রজেক্ট বানাতে পারবে

এই মডিউলটা মূলত **Module 6 — API Development Part One**-এর উপর ভিত্তি করে তৈরি, যেখানে routing, POST request, ডেটা মডেলিং আর ভ্যালিডেশনের মৌলিক ধারণাগুলো শেখানো হয়েছিলো — এখানে আমরা সেই ভিত্তির উপর স্ট্রাকচার আর নিরাপত্তার স্তর যোগ করলাম।

পরবর্তী মডিউল: **[Module 8 — Data Modeling Part One](../module-08-data-modeling-part-one/README.md)**
