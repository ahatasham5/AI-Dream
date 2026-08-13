# Module 4 — Python With FastAPI

Module 3-এ আমরা বড় ছবিটা দেখেছি — কেন Python-ভিত্তিক ব্যাকএন্ড ব্যবহার করি, কীভাবে বিভিন্ন সার্ভার একসাথে কাজ করে। এই মডিউলে আমরা হাতে-কলমে কাজে নামি: Python-এর কয়েকটা মৌলিক ধারণা ঝালিয়ে নিয়ে, FastAPI দিয়ে প্রথম প্রকৃত ওয়েব সার্ভার বানাই, সেটাকে Postman/Thunder Client দিয়ে টেস্ট করি, URL দিয়ে ডেটা পাঠানোর দুটো পদ্ধতি শিখি, একাধিক backend-কে একে অপরের সাথে কথা বলাই, আর Node.js-এর Express.js-এর সাথে তুলনা করে দেখি ব্যাকএন্ডের মূল ধারণাগুলো ভাষা-নিরপেক্ষ কীভাবে।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-introduction-to-the-module.md](01-introduction-to-the-module.md) | মডিউলের ভূমিকা, কী কী শেখা হবে |
| 2 | [02-python-basics-for-fastapi.md](02-python-basics-for-fastapi.md) | Variable, Data Type, Function, List Comprehension |
| 3 | [03-what-is-callback-how-it-works.md](03-what-is-callback-how-it-works.md) | Callback/Coroutine কী, কীভাবে কাজ করে |
| 4 | [04-scope-and-mutability-in-python.md](04-scope-and-mutability-in-python.md) | Python-এ Scope আর Mutability (let/var/const-এর সমতুল্য চিন্তা) |
| 5 | [05-fastapi-setup-with-postman-and-thunder-client.md](05-fastapi-setup-with-postman-and-thunder-client.md) | FastAPI সেটআপ, Postman/Thunder Client দিয়ে টেস্ট |
| 6 | [06-get-api-query-vs-path-params.md](06-get-api-query-vs-path-params.md) | Query Parameter বনাম Path/Route Parameter |
| 7 | [07-backend-as-client-calling-backend-from-backend.md](07-backend-as-client-calling-backend-from-backend.md) | একটা Backend কীভাবে আরেকটা Backend-এর Client হয় |
| 8 | [08-fastapi-vs-expressjs.md](08-fastapi-vs-expressjs.md) | FastAPI বনাম Express.js — গঠনগত মিল |
| 9 | [09-code-links.md](09-code-links.md) | Companion কোড রিপোজিটরির প্রয়োজনীয়তা |

## এই মডিউল শেষে তুমি যা পারবে

- Callback/coroutine কী এবং কেন Python-এর `async`/`await`-এ এত ঘন ঘন ব্যবহৃত হয় তা ব্যাখ্যা করতে পারবে
- Python-এ scope আর mutability কীভাবে কাজ করে বুঝে যথাযথভাবে variable ব্যবহার করতে পারবে
- FastAPI দিয়ে রুট-ভিত্তিক একটা ওয়েব সার্ভার নিজে হাতে বানাতে পারবে
- Postman বা Thunder Client দিয়ে API টেস্ট করতে পারবে, ব্রাউজার ছাড়াই
- Path Parameter আর Query Parameter-এর পার্থক্য বুঝে সঠিক জায়গায় ব্যবহার করতে পারবে
- `httpx` ব্যবহার করে একটা backend থেকে আরেকটা backend-কে কল করতে পারবে
- বুঝবে কেন FastAPI আর Express.js-এর মতো ভিন্ন ভাষার framework গঠনগতভাবে একই রকম

পরবর্তী মডিউল: **[Module 5 — Async Python Inside FastAPI](../module-05-async-python-inside-fastapi/README.md)**
</content>
