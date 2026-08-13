# Module 6 — API Development Part One

Module 5-এ আমরা asynchronous JavaScript বুঝেছি — কীভাবে Node.js একসাথে অনেক কাজ সামলায়, না থেমে থেকে। এই মডিউলে আমরা সেই ভিত্তির উপর দাঁড়িয়ে সত্যিকারের API বানানো শুরু করি, এবার FastAPI দিয়ে — status code দিয়ে সঠিকভাবে জবাব দেয়া, FastAPI-এ routing সাজানো, POST endpoint-এর ভেতরের গঠন বোঝা, ডেটার আকৃতি (Pydantic model) নিয়ে আগেভাগে চিন্তা করা, আর ক্লায়েন্ট থেকে আসা কোনো ডেটাকেই অন্ধভাবে বিশ্বাস না করে যাচাই করা।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-status-codes-in-api.md](01-status-codes-in-api.md) | HTTP status code-এর পরিবার (2xx/3xx/4xx/5xx) আর FastAPI-এ `status_code` ও `HTTPException` ব্যবহার |
| 2 | [02-routing-system-in-fastapi.md](02-routing-system-in-fastapi.md) | FastAPI-এ GET/POST/PUT/DELETE রুট সাজানো, `APIRouter` দিয়ে ভাগ করা |
| 3 | [03-anatomy-of-a-post-endpoint.md](03-anatomy-of-a-post-endpoint.md) | POST endpoint-এর ভেতরের গঠন — request body, Pydantic model, স্বয়ংক্রিয় validation |
| 4 | [04-data-modeling-and-data-flow.md](04-data-modeling-and-data-flow.md) | কোড লেখার আগে ডেটার আকৃতি ভাবা, request → validation → processing → storage → response |
| 5 | [05-data-validation-in-backend.md](05-data-validation-in-backend.md) | ক্লায়েন্টের ডেটা কেন কখনো বিশ্বাস করা যাবে না, Pydantic validator আর constrained type |
| 6 | [06-assignment-one-api-development.md](06-assignment-one-api-development.md) | হাতে-কলমে অ্যাসাইনমেন্ট — FastAPI দিয়ে একটা Notes API তৈরি |

## এই মডিউল শেষে তুমি যা পারবে

- সঠিক HTTP status code বেছে নিতে পারবে, প্রতিটা পরিস্থিতির জন্য
- FastAPI-এ GET, POST, PUT, DELETE রুট সংগঠিতভাবে লিখতে পারবে
- একটা POST endpoint কীভাবে request body গ্রহণ করে এবং প্রসেস করে তা বুঝবে
- কোড লেখার আগে ডেটা মডেলিং করার অভ্যাস গড়ে তুলবে
- ক্লায়েন্ট থেকে আসা ডেটা যাচাই (validate) করার কৌশল প্রয়োগ করতে পারবে
- এই সব ধারণা একসাথে করে নিজের হাতে একটা ছোট API তৈরি করতে পারবে

পূর্ববর্তী মডিউল: **Module 5 — Async JS Inside Node.js**, যেখানে আমরা asynchronous behavior-এর ভিত্তি তৈরি করেছিলাম, আর এই মডিউলে সেই ভিত্তির উপর দাঁড়িয়ে প্রথমবারের মতো পূর্ণাঙ্গ API endpoint বানানো শিখলাম।

পরবর্তী মডিউল: **[Module 7 — API Development Part Two](../module-07-api-development-part-two/README.md)**
