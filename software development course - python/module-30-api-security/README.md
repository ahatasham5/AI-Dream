# Module 30 — API Security

Module 29-এ আমরা "কে ভেতরে ঢুকতে পারবে" আর "সে কী করতে পারবে" প্রশ্নের সমাধান করেছি। এই মডিউলে আমরা সেটাকে আরও বিস্তৃত করে দেখি — একজন বৈধ ইউজারও যেন ভুল ইনপুট, ক্রস-সাইট আক্রমণ, বা অতিরিক্ত ট্র্যাফিক দিয়ে সিস্টেমের ক্ষতি করতে না পারে। CORS, SQL Injection, XSS, CSRF, security headers, আর rate limiting/validation — এই সবগুলো মিলিয়ে একটা defense-in-depth কৌশল তৈরি করি, Python + FastAPI-কে কেন্দ্র করে।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-api-security-and-best-practices.md](01-api-security-and-best-practices.md) | API Security-র পূর্ণাঙ্গ ছবি, defense-in-depth, OWASP Top 10 |
| 2 | [02-cors-configuration-and-security-headers.md](02-cors-configuration-and-security-headers.md) | CORS প্রিফ্লাইট, `CORSMiddleware`, বেসিক security header |
| 3 | [03-sql-injection-prevention-techniques.md](03-sql-injection-prevention-techniques.md) | SQL Injection কীভাবে ঘটে, parameterized query, SQLAlchemy ORM |
| 4 | [04-cross-site-scripting-xss-protection.md](04-cross-site-scripting-xss-protection.md) | Stored/Reflected XSS, sanitization, CSP, httponly cookie |
| 5 | [05-csrf-token-implementation.md](05-csrf-token-implementation.md) | CSRF আক্রমণের প্রক্রিয়া, `samesite`, Double-Submit Cookie টোকেন |
| 6 | [06-using-helmetjs-for-enhanced-security.md](06-using-helmetjs-for-enhanced-security.md) | `secure` লাইব্রেরি ও কাস্টম middleware দিয়ে security header কনফিগারেশন |
| 7 | [07-security-best-practices-for-fastapi-apis.md](07-security-best-practices-for-fastapi-apis.md) | Rate limiting, input validation, চূড়ান্ত নিরাপত্তা চেকলিস্ট |

## এই মডিউল শেষে তুমি যা পারবে

- CORS সঠিকভাবে কনফিগার করতে পারবে, preflight request কীভাবে কাজ করে তা বুঝবে
- SQL Injection চিনতে এবং parameterized query/ORM দিয়ে প্রতিরোধ করতে পারবে
- Stored ও Reflected XSS-এর পার্থক্য বুঝবে এবং sanitization/CSP দিয়ে প্রতিরোধ করতে পারবে
- CSRF আক্রমণের প্রক্রিয়া বুঝবে এবং CSRF টোকেন/`sameSite` cookie দিয়ে প্রতিরোধ করতে পারবে
- `secure` লাইব্রেরি দিয়ে একগুচ্ছ security header দ্রুত ও নির্ভরযোগ্যভাবে বসাতে পারবে
- Rate limiting আর input validation দিয়ে DoS ও দূষিত ইনপুট ঠেকাতে পারবে
- একটা সম্পূর্ণ নিরাপত্তা চেকলিস্ট মাথায় রেখে নতুন যেকোনো FastAPI প্রজেক্ট শুরু করতে পারবে

পরবর্তী মডিউল: **[Module 31 — API Testing & Performance](../module-31-api-testing-and-performance/README.md)**
