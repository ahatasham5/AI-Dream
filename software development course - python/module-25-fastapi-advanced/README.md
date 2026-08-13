# Module 25 — FastAPI Advanced

Module 24-এ বানানো ই-কমার্স ব্যাকএন্ডকে এই মডিউলে আমরা প্রোডাকশন-গ্রেড সিস্টেমে রূপান্তরিত করেছি — অথেন্টিকেশন, অথরাইজেশন, এরর হ্যান্ডলিং, টেস্টিং, ইভেন্ট-ড্রিভেন আর্কিটেকচার, রিয়েল-টাইম কমিউনিকেশন, ক্যাশিং, মাইক্রোসার্ভিস আর ডিপ্লয়মেন্ট — একে একে সব যোগ করে, এবার Python-এর FastAPI ইকোসিস্টেম দিয়ে।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-routing-and-middleware-in-fastapi.md](01-routing-and-middleware-in-fastapi.md) | FastAPI-এ APIRouter, Middleware, রিকোয়েস্ট পাইপলাইন |
| 2 | [02-authentication-with-jwt-and-oauth2.md](02-authentication-with-jwt-and-oauth2.md) | JWT ও OAuth2PasswordBearer দিয়ে Authentication |
| 3 | [03-authorization-and-rbac.md](03-authorization-and-rbac.md) | Authorization ও Role-Based Access Control |
| 4 | [04-error-handling-and-logging-in-fastapi.md](04-error-handling-and-logging-in-fastapi.md) | Exception Handler ও Structured Logging |
| 5 | [05-api-versioning-and-rate-limiting.md](05-api-versioning-and-rate-limiting.md) | API Versioning ও Rate Limiting |
| 6 | [06-unit-testing-and-integration-testing-in-fastapi.md](06-unit-testing-and-integration-testing-in-fastapi.md) | Unit ও Integration Testing (pytest) |
| 7 | [07-event-driven-architecture-with-kafka.md](07-event-driven-architecture-with-kafka.md) | Kafka দিয়ে Event-Driven Architecture |
| 8 | [08-websockets-in-fastapi-for-real-time-applications.md](08-websockets-in-fastapi-for-real-time-applications.md) | WebSocket দিয়ে Real-Time অ্যাপ্লিকেশন |
| 9 | [09-caching-strategies-with-redis-in-fastapi.md](09-caching-strategies-with-redis-in-fastapi.md) | Redis দিয়ে Caching Strategy |
| 10 | [10-microservices-architecture-with-fastapi.md](10-microservices-architecture-with-fastapi.md) | Microservices Architecture |
| 11 | [11-building-a-scalable-project-with-fastapi.md](11-building-a-scalable-project-with-fastapi.md) | স্কেলযোগ্য প্রজেক্ট গঠন |
| 12 | [12-deploying-a-fastapi-application-to-production.md](12-deploying-a-fastapi-application-to-production.md) | Production Deployment (Docker, CI/CD) |

## এই মডিউল শেষে তুমি যা পারবে

- FastAPI-এর APIRouter, Middleware, আর Dependency চেইন পাইপলাইন ব্যাখ্যা করতে পারবে
- JWT + OAuth2PasswordBearer দিয়ে অথেন্টিকেশন ও কাস্টম RBAC dependency দিয়ে অথরাইজেশন বসাতে পারবে
- গ্লোবাল Exception Handler দিয়ে কনসিস্টেন্ট এরর হ্যান্ডলিং ও structured logging করতে পারবে
- API ভার্সনিং ও রেট লিমিটিং প্রয়োগ করতে পারবে
- pytest ও dependency_overrides দিয়ে ইউনিট ও ইন্টিগ্রেশন টেস্ট লিখতে পারবে
- Kafka দিয়ে ইভেন্ট-ড্রিভেন যোগাযোগ ও WebSocket দিয়ে রিয়েল-টাইম ফিচার বানাতে পারবে
- Redis দিয়ে ক্যাশিং স্ট্র্যাটেজি প্রয়োগ করতে পারবে, race condition ও thundering herd সমস্যা এড়াতে পারবে
- Monolith বনাম Microservices আর্কিটেকচারের পার্থক্য ও ট্রেড-অফ বুঝতে পারবে
- Docker ও CI/CD দিয়ে একটা FastAPI অ্যাপ প্রোডাকশনে ডিপ্লয় করতে পারবে

পরবর্তী মডিউল: **[Module 26 — POST API & Data Handling](../module-26-post-api-and-data-handling/README.md)**
