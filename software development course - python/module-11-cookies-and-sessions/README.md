# Module 11 — Cookies And Sessions

এতদিন আমরা যত API বানিয়েছি, প্রতিটা request-কে সার্ভার সম্পূর্ণ আলাদা, নতুন একটা মানুষ হিসেবে ট্রিট করেছে — সার্ভারের কোনো "স্মৃতি" ছিলো না। এই মডিউলে আমরা দেখবো কীভাবে একটা ওয়েবসাইট তোমাকে "মনে রাখে" — লগইন অবস্থা ধরে রাখা থেকে শুরু করে শপিং কার্ট পর্যন্ত। Cookie আর Session — এই দুইটা ধারণা দিয়েই আধুনিক ওয়েবের প্রায় সব "মনে রাখা"-র কাজ শুরু হয়েছিলো।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-stateless-http-and-intro-to-cookie.md](01-stateless-http-and-intro-to-cookie.md) | HTTP-এর Stateless স্বভাব ও Cookie-র পরিচয় |
| 2 | [02-understanding-cookies-how-to-make-and-save.md](02-understanding-cookies-how-to-make-and-save.md) | Cookie বোঝা: কীভাবে বানাতে ও সেভ করতে হয় |
| 3 | [03-simple-login-and-protected-route-using-cookie.md](03-simple-login-and-protected-route-using-cookie.md) | Cookie দিয়ে সিম্পল লগইন ও Protected Route |
| 4 | [04-implementing-session-with-cookies-custom-storage.md](04-implementing-session-with-cookies-custom-storage.md) | Cookie দিয়ে Session বানানো: Custom Session Storage |
| 5 | [05-third-party-library-for-session-and-cookie.md](05-third-party-library-for-session-and-cookie.md) | Third Party Library দিয়ে Session ও Cookie (SessionMiddleware, Redis-backed session) |
| 6 | [06-session-and-cookie-recap.md](06-session-and-cookie-recap.md) | Session ও Cookie রিক্যাপ |
| 7 | [07-session-vs-cookie.md](07-session-vs-cookie.md) | Session বনাম Cookie |
| 8 | [08-problem-with-cookie-based-auth-system.md](08-problem-with-cookie-based-auth-system.md) | Cookie-ভিত্তিক Auth সিস্টেমের সমস্যা |
| 9 | [09-cookie-use-cases.md](09-cookie-use-cases.md) | Cookie-র বাস্তব ব্যবহার |
| 10 | [10-module-recap-questions.md](10-module-recap-questions.md) | মডিউল রিক্যাপ ও যাচাই প্রশ্ন |

## এই মডিউল শেষে তুমি যা পারবে

- HTTP কেন stateless, আর এই সমস্যার সমাধানে Cookie কীভাবে কাজ করে তা ব্যাখ্যা করতে পারবে
- FastAPI-এ Cookie সেট করতে, পড়তে, আর মেয়াদ নিয়ন্ত্রণ করতে পারবে
- Cookie ব্যবহার করে একটা সিম্পল লগইন সিস্টেম ও প্রোটেক্টেড রুট বানাতে পারবে
- নিজের হাতে (custom) এবং Starlette-এর `SessionMiddleware`/Redis দিয়ে Session ম্যানেজ করতে পারবে
- Session ও Cookie-র পার্থক্য এবং Cookie-ভিত্তিক Authentication-এর সীমাবদ্ধতা বুঝবে

পরবর্তী মডিউল: **[Module 12 — JWT](../module-12-jwt-json-web-token/README.md)**
