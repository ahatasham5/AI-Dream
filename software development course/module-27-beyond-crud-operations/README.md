# Module 27 — Beyond CRUD Operations

Module 6/26-এ Create নিয়ে গভীরভাবে কাজ করার পর, এই মডিউলে CRUD-এর বাকি অংশ — Update আর Delete — নিয়ে বিস্তারিত আলোচনা করা হয়েছে। PUT বনাম PATCH-এর সেমান্টিক পার্থক্য, ভ্যালিডেশন, কনকারেন্সি সমস্যা, আর soft/hard delete সিদ্ধান্ত — সবকিছু এখানে বাস্তব কোডসহ কভার হয়েছে।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-understanding-http-put-and-delete-methods.md](01-understanding-http-put-and-delete-methods.md) | HTTP PUT ও DELETE মেথডের সেমান্টিক্স, Idempotency |
| 2 | [02-implementing-put-patch-endpoints-in-expressjs.md](02-implementing-put-patch-endpoints-in-expressjs.md) | Express.js-এ PUT/PATCH এন্ডপয়েন্ট ইমপ্লিমেন্টেশন |
| 3 | [03-resource-updates-full-vs-partial-updates.md](03-resource-updates-full-vs-partial-updates.md) | Full vs Partial Update, Lost Update সমস্যা |
| 4 | [04-handling-put-patch-request-validation.md](04-handling-put-patch-request-validation.md) | PUT/PATCH রিকোয়েস্ট ভ্যালিডেশন (Zod partial schema) |
| 5 | [05-soft-delete-vs-hard-delete-implementation.md](05-soft-delete-vs-hard-delete-implementation.md) | Soft Delete বনাম Hard Delete ইমপ্লিমেন্টেশন |
| 6 | [06-best-practices-for-update-and-delete-operations.md](06-best-practices-for-update-and-delete-operations.md) | Update/Delete অপারেশনের বেস্ট প্র্যাকটিস চেকলিস্ট |

## এই মডিউল শেষে তুমি যা পারবে

- PUT, PATCH, DELETE-এর সঠিক ব্যবহার ও idempotency ব্যাখ্যা করতে পারবে
- Express.js-এ ফুল ও আংশিক আপডেট এন্ডপয়েন্ট বানাতে পারবে
- Lost-update সমস্যা চিনতে ও optimistic locking দিয়ে সমাধান করতে পারবে
- PATCH-এর জন্য partial validation schema ডিজাইন করতে পারবে
- Soft delete বনাম hard delete-এর মধ্যে সঠিক সিদ্ধান্ত নিতে পারবে
- Authorization, ভ্যালিডেশন, কনকারেন্সি, আর অডিট লগ সমন্বিত একটা সম্পূর্ণ আপডেট/ডিলিট ফ্লো ডিজাইন করতে পারবে

পরবর্তী মডিউল: **Module 28 — Response Formatting & Pagination**
