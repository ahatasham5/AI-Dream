# Module 47 — Web Development With Gin Framework

Module 46-এ আমরা Go ভাষার ব্যাকরণ শিখেছি — struct, function, concurrency, আর HTTP-এর প্রাথমিক ধারণা। এই মডিউলে আমরা সেই জ্ঞান নিয়ে এগিয়ে যাই একটা বাস্তব ওয়েব ফ্রেমওয়ার্কের দিকে — **Gin**, যেটা Go জগতের Express.js। ধাপে ধাপে আমরা একটা সম্পূর্ণ ব্লগ পোস্ট API বানাবো: প্রজেক্ট সেটআপ থেকে শুরু করে routing, middleware, GORM দিয়ে ডেটাবেজ সংযোগ, JWT authentication, কেন্দ্রীভূত error handling, অটোমেটেড টেস্টিং, আর সবশেষে Docker দিয়ে deployment পর্যন্ত। প্রতিটা লেসন আগের লেসনের কোডের উপর দাঁড়িয়ে থাকে, যাতে মডিউলের শেষে তোমার হাতে একটা প্রোডাকশন-প্রস্তুত ব্যাকএন্ড সিস্টেম প্রস্তুত থাকে।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-introduction-to-gin-framework.md](01-introduction-to-gin-framework.md) | Gin কী, কেন দরকার, Express.js-এর সাথে তুলনা |
| 2 | [02-setting-up-a-gin-project.md](02-setting-up-a-gin-project.md) | প্রজেক্ট স্ট্রাকচার, go mod, .env কনফিগারেশন |
| 3 | [03-building-rest-apis-with-gin.md](03-building-rest-apis-with-gin.md) | মডেল, কন্ট্রোলার, রুট দিয়ে REST API বানানো |
| 4 | [04-routing-and-middleware-in-gin.md](04-routing-and-middleware-in-gin.md) | রুট গ্রুপিং, কাস্টম middleware, query/path parameter |
| 5 | [05-connecting-to-databases-with-gorm.md](05-connecting-to-databases-with-gorm.md) | GORM দিয়ে PostgreSQL সংযোগ, AutoMigrate, CRUD |
| 6 | [06-user-authentication-and-jwt-in-gin.md](06-user-authentication-and-jwt-in-gin.md) | User মডেল, bcrypt, JWT দিয়ে authentication |
| 7 | [07-error-handling-and-logging-in-gin.md](07-error-handling-and-logging-in-gin.md) | কেন্দ্রীভূত error handling, panic recovery, logging |
| 8 | [08-testing-and-debugging-in-gin.md](08-testing-and-debugging-in-gin.md) | httptest দিয়ে অটোমেটেড টেস্ট, debugging টুলস |
| 9 | [09-deploying-gin-applications.md](09-deploying-gin-applications.md) | Docker, docker-compose, production সেটিংস |

## এই মডিউল শেষে তুমি যা পারবে

- Gin ফ্রেমওয়ার্কের কাঠামো আর Express.js-এর সাথে এর সাদৃশ্য ব্যাখ্যা করতে পারবে
- একটা সংগঠিত ফোল্ডার স্ট্রাকচারে Gin প্রজেক্ট সেটআপ করতে পারবে (routes, controllers, models, middleware)
- GORM দিয়ে ডেটাবেজ মডেল বানিয়ে সম্পূর্ণ CRUD REST API তৈরি করতে পারবে
- কাস্টম middleware লিখে routing, logging, আর authentication নিয়ন্ত্রণ করতে পারবে
- bcrypt আর JWT ব্যবহার করে একটা নিরাপদ ইউজার authentication সিস্টেম বানাতে পারবে
- কেন্দ্রীভূত error handling আর panic recovery দিয়ে একটা স্থিতিশীল API ডিজাইন করতে পারবে
- httptest প্যাকেজ দিয়ে Gin API-এর জন্য অটোমেটেড টেস্ট লিখতে পারবে
- Docker আর docker-compose দিয়ে একটা Gin অ্যাপ্লিকেশন প্রোডাকশনে deploy করতে পারবে

পরবর্তী মডিউল: **[Module 48 — Final Project One](../module-48-final-project-one/README.md)**
