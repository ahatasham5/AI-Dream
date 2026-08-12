# Module 5 — Async JS Inside Node.js

এই মডিউল দাঁড়িয়ে আছে Module 4-এর ভিত্তির ওপর — সেখানে আমরা callback-এর প্রাথমিক পরিচয় আর Express.js সেটআপ শিখেছিলাম, এবার সেই ভিত্তি থেকে গভীরে গিয়ে বুঝবো Node.js আসলে ভেতরে ভেতরে কীভাবে একসাথে অনেক কাজ সামলায়।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-introduction-to-async-js-nature-of-javascript.md](01-introduction-to-async-js-nature-of-javascript.md) | JavaScript-এর single-threaded প্রকৃতি, synchronous বনাম asynchronous |
| 2 | [02-async-code-in-nodejs-part-2.md](02-async-code-in-nodejs-part-2.md) | Callback recap, callback hell সমস্যা |
| 3 | [03-event-loop-and-callback-relation.md](03-event-loop-and-callback-relation.md) | Call stack, Node APIs, callback queue, event loop |
| 4 | [04-event-loop-promise-async-await-relation.md](04-event-loop-promise-async-await-relation.md) | Promise, microtask vs macrotask queue, async/await |
| 5 | [05-using-async-await-in-a-nodejs-project.md](05-using-async-await-in-a-nodejs-project.md) | Express.js রুটে async/await, try/catch দিয়ে error handling |
| 6 | [06-git-add-commit-push-pull-workflow.md](06-git-add-commit-push-pull-workflow.md) | Git add, commit, push, pull-এর কার্যপ্রণালী |
| 7 | [07-multiple-files-require-vs-import.md](07-multiple-files-require-vs-import.md) | একাধিক ফাইলে কোড ভাগ করা, CommonJS require বনাম ES Module import |
| 8 | [08-external-learning-materials.md](08-external-learning-materials.md) | বাড়তি শেখার উপকরণ কোথায়, কীভাবে খুঁজবে |

## এই মডিউল শেষে তুমি যা পারবে

- ব্যাখ্যা করতে পারবে কেন JavaScript single-threaded হয়েও একসাথে অনেক request সামলাতে পারে
- Call stack, Node API, callback queue আর event loop-এর সম্পর্ক নিজের ভাষায় বুঝিয়ে বলতে পারবে
- Promise আর async/await ব্যবহার করে callback hell এড়িয়ে পরিষ্কার asynchronous কোড লিখতে পারবে
- একটা Express.js রুটে try/catch সহ async/await দিয়ে বাস্তব error handling করতে পারবে
- Git-এর add, commit, push, pull কমান্ড দিয়ে কোড সংরক্ষণ ও শেয়ার করার পূর্ণ ওয়ার্কফ্লো চালাতে পারবে
- একটা প্রজেক্টকে একাধিক ফাইলে ভাগ করতে পারবে, আর CommonJS ও ES Modules-এর পার্থক্য বুঝবে

পরবর্তী মডিউল: [Module 6 — API Development Part One](../module-06-api-development-part-one/README.md)
