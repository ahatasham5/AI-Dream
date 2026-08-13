# Module 9 — Python Essentials For Backend Development

Module 2-এ আমরা `dict`, `list`, আর basic function নিয়ে দ্রুত পরিচিত হয়েছিলাম, FastAPI-এর জন্য দরকারি ন্যূনতম ভিত্তি তৈরি করার জন্য। এই মডিউলে আমরা সেই ভিত্তিটাকেই আরও ধীরে, গভীরভাবে, খুঁটিনাটিসহ ঝালাই করেছি — কারণ dict আর list-ই হলো সেই মৌলিক উপাদান, যা দিয়ে ব্যাকএন্ডের প্রতিটা ডেটা প্রকাশ পায়, আর dataclass/Pydantic model যেভাবে সেই উপাদানের উপর আরও কাঠামো যুক্ত করে।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-module-introduction.md](01-module-introduction.md) | মডিউলের ভূমিকা ও পুনরায় বেসিকে ফেরার কারণ |
| 2 | [02-python-data-types-and-objects.md](02-python-data-types-and-objects.md) | ডেটা টাইপ, dict, dataclass ও Pydantic model-এর সীমারেখা |
| 3 | [03-python-objects-in-real-life.md](03-python-objects-in-real-life.md) | বাস্তব জীবনের উদাহরণে object (attribute ও method) |
| 4 | [04-lists-and-lists-of-dicts-objects.md](04-lists-and-lists-of-dicts-objects.md) | List ও List of Dicts/Objects |
| 5 | [05-destructuring-unpacking-in-lists-and-dicts.md](05-destructuring-unpacking-in-lists-and-dicts.md) | List ও Dict-এ Unpacking, `**kwargs`, সাধারণ ভুল |
| 6 | [06-lists-in-real-life.md](06-lists-in-real-life.md) | বাস্তব উদাহরণে comprehension, sum, generator, next |
| 7 | [07-some-external-learning-sources-1.md](07-some-external-learning-sources-1.md) | বাড়তি শেখার উৎস: ডকুমেন্টেশন, প্র্যাকটিস, ভিজ্যুয়ালাইজেশন |
| 8 | [08-python-list-and-dict-text-lesson-part-one.md](08-python-list-and-dict-text-lesson-part-one.md) | সংক্ষিপ্ত রেফারেন্স: List ও Dict একসাথে, mutable default argument ফাঁদ |
| 9 | [09-common-backend-pattern-with-list-comprehensions-and-json.md](09-common-backend-pattern-with-list-comprehensions-and-json.md) | ব্যাকএন্ড প্যাটার্ন: filter, search, pagination, readability limit |

## এই মডিউল শেষে তুমি যা পারবে

- Python-এর primitive ও composite (dict/list) টাইপগুলো স্পষ্টভাবে আলাদা করতে পারবে
- `dict`, `dataclass`, আর Pydantic model-এর মধ্যে সঠিক টুল কখন বেছে নিতে হয় বুঝতে পারবে
- dict আর list of dicts দিয়ে বাস্তব ডেটা মডেল করতে পারবে
- unpacking দিয়ে পরিষ্কার, সংক্ষিপ্ত কোড লিখতে পারবে (বিশেষ করে FastAPI route handler-এ), আর builtin নাম শ্যাডো করার মতো সাধারণ ভুল এড়াতে পারবে
- list comprehension, generator expression, `sum()`, `next()` ব্যবহার করে list of dicts নিয়ে কাজ করতে পারবে
- query parameter থেকে ফিল্টারিং, সার্চিং, আর হালকা পেজিনেশন বাস্তবায়ন করতে পারবে, আর জানবে কখন comprehension ছেড়ে সাধারণ loop-এ ফিরে যাওয়া উচিত

এই মডিউল বিল্ড হয়েছে Module 2-এর ভিত্তির উপর, আর সরাসরি সহায়ক Module 4-এ শেখা scope/mutability আর FastAPI বেসিকসের জন্য।

পরবর্তী মডিউল: **[Module 10 — Process](../module-10-process/README.md)**
