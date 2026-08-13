# Module 26 — POST API & Data Handling

Module 6/7-এর POST রিকোয়েস্টের বেসিক ধারণাকে এই ছোট কিন্তু গুরুত্বপূর্ণ মডিউলে আমরা বাস্তব-জগতের গভীরতায় নিয়ে গেছি — ফাইল আপলোড, সংগঠিত এরর হ্যান্ডলিং, আর সিকিউরিটি বেস্ট প্র্যাকটিস।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-form-submission-and-file-upload-handling.md](01-form-submission-and-file-upload-handling.md) | Form Submission ও FastAPI `UploadFile` দিয়ে File Upload |
| 2 | [02-error-handling-in-post-apis.md](02-error-handling-in-post-apis.md) | POST API-তে গোছানো Error Handling |
| 3 | [03-post-api-security-best-practices.md](03-post-api-security-best-practices.md) | POST API Security Best Practices |

## এই মডিউল শেষে তুমি যা পারবে

- FastAPI-এর `UploadFile`/`File()` দিয়ে নিরাপদভাবে ফাইল আপলোড হ্যান্ডল করতে পারবে (সাইজ, টাইপ, নামকরণ, স্ট্রিমিং)
- কাস্টম `AppError` ক্লাস আর কেন্দ্রীয় `exception_handler` দিয়ে POST এরর সামলাতে পারবে
- Mass Assignment, বড় পেলোড, আর ব্রুট-ফোর্সের মতো ঝুঁকি চিনতে ও ঠেকাতে পারবে
- Pydantic মডেল দিয়ে allow-list ভিত্তিক ইনপুট ভ্যালিডেশন করতে পারবে

পরবর্তী মডিউল: **[Module 27 — Beyond CRUD Operations](../module-27-beyond-crud-operations/README.md)**
