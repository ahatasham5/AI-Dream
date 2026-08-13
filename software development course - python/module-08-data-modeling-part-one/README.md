# Module 8 — Data Modeling Part One

এই মডিউলে আমরা ব্যাকএন্ড ডেভেলপমেন্টের একটা কেন্দ্রীয় দক্ষতা শিখবো — বাস্তব জগতের জিনিসকে (User, Product, Order) কোডে আর ডেটাতে কীভাবে সঠিকভাবে প্রকাশ করতে হয়। শুরু হবে Object Oriented Programming-এর মূল ধারণা দিয়ে, তারপর আমরা যাবো JSON-এর জগতে — যেটা frontend আর backend-এর মধ্যে ডেটা আদান-প্রদানের সার্বজনীন ভাষা। শেষে আমরা এই জ্ঞান দিয়ে একটা বাস্তব ই-কমার্স Product API ডিজাইন করবো, আর JSON ডেটা নিয়ে কাজ করার ব্যবহারিক কৌশলগুলো শিখবো।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-introduction-to-oop.md](01-introduction-to-oop.md) | Object Oriented Programming-এর পরিচিতি — object, class, properties, methods |
| 2 | [02-oop-in-real-life.md](02-oop-in-real-life.md) | বাস্তব জগতের এন্টিটি (User, Product) OOP-তে মডেল করা |
| 3 | [03-introduction-to-json.md](03-introduction-to-json.md) | JSON কী, কেন, আর কখন ব্যবহার হয় |
| 4 | [04-json-data-flow-frontend-to-backend.md](04-json-data-flow-frontend-to-backend.md) | Frontend থেকে Backend পর্যন্ত JSON ডেটার যাত্রা |
| 5 | [05-approaching-api-design-with-data-modeling.md](05-approaching-api-design-with-data-modeling.md) | ডেটা মডেলিং মাথায় রেখে API ডিজাইন করার পদ্ধতি |
| 6 | [06-ecommerce-product-api-design.md](06-ecommerce-product-api-design.md) | বাস্তব ই-কমার্স Product API ডিজাইন ও JSON মডেলিং |
| 7 | [07-accessing-manipulating-json-data.md](07-accessing-manipulating-json-data.md) | JSON ডেটা অ্যাক্সেস ও পরিবর্তন করা |
| 8 | [08-array-json-and-higher-order-functions.md](08-array-json-and-higher-order-functions.md) | List of JSON ও Higher Order Functions (list comprehension, reduce) |

## এই মডিউল শেষে তুমি যা পারবে

- Object আর Class-এর পার্থক্য বুঝে বাস্তব এন্টিটিকে (User, Product) OOP-এর ভাষায় মডেল করতে পারবে
- JSON কী এবং কেন এটা frontend-backend যোগাযোগের সার্বজনীন ফরম্যাট, তা ব্যাখ্যা করতে পারবে
- একটা ফর্ম সাবমিট থেকে শুরু করে সার্ভার রেসপন্স পর্যন্ত JSON ডেটার সম্পূর্ণ যাত্রা ধাপে ধাপে বর্ণনা করতে পারবে
- কোনো নতুন ফিচার শুরুর আগে এন্টিটি, ফিল্ড, সম্পর্ক আর অপারেশন চিহ্নিত করে API ডিজাইন করতে পারবে
- একটা বাস্তব ই-কমার্স Product-এর জন্য JSON ডেটা মডেল ও CRUD endpoint ডিজাইন করতে পারবে
- bracket notation/`.get()` আর mutable/immutable পদ্ধতিতে JSON object (dict)-এর ডেটা অ্যাক্সেস ও পরিবর্তন করতে পারবে
- list comprehension আর `functools.reduce`-এর মতো টুল দিয়ে List of Dicts নিয়ে কার্যকরভাবে কাজ করতে পারবে

এই মডিউলটা দাঁড়িয়ে আছে Module 7-এ শেখা ভিত্তির উপর — সেখানে আমরা যে ব্যাকএন্ড রুট আর ডেটা হ্যান্ডলিং-এর প্রাথমিক ধারণা পেয়েছিলাম, এখানে আমরা সেই ডেটাকে আরও গঠিতভাবে মডেল করা আর ডিজাইন করা শিখলাম।

পরবর্তী মডিউল: **[Module 9 — Python Essentials For Backend Development](../module-09-python-essentials-for-backend-development/README.md)**
