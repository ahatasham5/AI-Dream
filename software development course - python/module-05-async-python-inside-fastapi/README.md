# Module 5 — Async Python Inside FastAPI

Module 4-এ আমরা coroutine-এর প্রাথমিক পরিচয় আর FastAPI সেটআপ শিখেছিলাম, এবার সেই ভিত্তি থেকে গভীরে গিয়ে বুঝবো Python আসলে ভেতরে ভেতরে কীভাবে একসাথে অনেক কাজ সামলায় — GIL কী, event loop কীভাবে চলে, coroutine/task/Future কীভাবে সম্পর্কিত, আর সবচেয়ে গুরুত্বপূর্ণ — একটা ভুল, ব্লকিং কল কীভাবে পুরো FastAPI সার্ভারকে প্রোডাকশনে থামিয়ে দিতে পারে।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-introduction-to-async-python-nature-of-python.md](01-introduction-to-async-python-nature-of-python.md) | GIL কী, Python-এর প্রকৃতি, synchronous বনাম asynchronous |
| 2 | [02-async-code-in-python-part-2.md](02-async-code-in-python-part-2.md) | Coroutine, Task, `create_task`, `gather`, exception হ্যান্ডলিং |
| 3 | [03-event-loop-and-callback-relation.md](03-event-loop-and-callback-relation.md) | Event loop ভেতরে ভেতরে কীভাবে চলে, selector, ready queue |
| 4 | [04-event-loop-future-async-await-relation.md](04-event-loop-future-async-await-relation.md) | Future, Task-Future সম্পর্ক, race condition, `asyncio.Lock` |
| 5 | [05-using-async-await-in-a-fastapi-project.md](05-using-async-await-in-a-fastapi-project.md) | FastAPI রুটে async/await, sync DB/HTTP কল ব্লক করার বিপদ, timeout |
| 6 | [06-git-add-commit-push-pull-workflow.md](06-git-add-commit-push-pull-workflow.md) | Git add, commit, push, pull-এর কার্যপ্রণালী |
| 7 | [07-multiple-files-python-import-system.md](07-multiple-files-python-import-system.md) | Python-এর import সিস্টেম, package, relative বনাম absolute import |
| 8 | [08-external-learning-materials.md](08-external-learning-materials.md) | বাড়তি শেখার উপকরণ কোথায়, কীভাবে খুঁজবে |

## এই মডিউল শেষে তুমি যা পারবে

- ব্যাখ্যা করতে পারবে GIL কী, আর কেন Python-এ থ্রেড আর asyncio দুটো আলাদা ধরনের concurrency দেয়
- Coroutine, Task, আর Future-এর সম্পর্ক নিজের ভাষায় বুঝিয়ে বলতে পারবে
- `asyncio.create_task` আর `asyncio.gather` দিয়ে একাধিক asynchronous কাজ সমান্তরালে চালাতে পারবে
- চিনতে পারবে কেন একটা sync/blocking কল একটা `async def` FastAPI endpoint-এর ভেতরে পুরো সার্ভারকে প্রোডাকশনে থামিয়ে দিতে পারে, আর কীভাবে এটা এড়ানো যায়
- asyncio-লেভেলে race condition কীভাবে তৈরি হয়, আর `asyncio.Lock` দিয়ে কীভাবে সমাধান করা যায় বুঝবে
- Git-এর add, commit, push, pull কমান্ড দিয়ে কোড সংরক্ষণ ও শেয়ার করার পূর্ণ ওয়ার্কফ্লো চালাতে পারবে
- একটা FastAPI প্রজেক্টকে router/service প্যাটার্নে একাধিক ফাইলে ভাগ করতে পারবে, relative আর absolute import-এর পার্থক্য বুঝবে

পরবর্তী মডিউল: **[Module 6 — API Development Part One](../module-06-api-development-part-one/README.md)**
