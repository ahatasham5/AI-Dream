# Module 35 — Advanced Topics

এই মডিউলে আমরা এতদিন যা শিখেছি (API testing, logging, monitoring, debugging) সেগুলোকে একসাথে নিয়ে বাস্তব production-এর চ্যালেঞ্জগুলোর মুখোমুখি হবো — high traffic সামলানো, middleware দিয়ে API রক্ষা করা, লোড টেস্ট করে ক্যাপাসিটি পরিকল্পনা করা, frontend আর backend উভয়ের সমস্যা খুঁজে বের করা, এবং শেষে নিরাপদ ও স্বয়ংক্রিয়ভাবে deploy করা।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-high-traffic-management-in-a-backend-application.md](01-high-traffic-management-in-a-backend-application.md) | হাই ট্রাফিক সামলানোর কৌশল |
| 2 | [02-guard-your-api-using-middlewares.md](02-guard-your-api-using-middlewares.md) | middleware দিয়ে API সুরক্ষা |
| 3 | [03-api-load-testing-and-planning-high-traffic-management.md](03-api-load-testing-and-planning-high-traffic-management.md) | লোড টেস্টিং ও ক্যাপাসিটি পরিকল্পনা |
| 4 | [04-trouble-shooting-frontend-application.md](04-trouble-shooting-frontend-application.md) | Frontend ট্রাবলশুটিং |
| 5 | [05-trouble-shooting-backend-application.md](05-trouble-shooting-backend-application.md) | Backend ট্রাবলশুটিং |
| 6 | [06-deployment-strategies.md](06-deployment-strategies.md) | Deployment strategies (blue-green, rolling, canary) |
| 7 | [07-frictionless-deployment-pipeline.md](07-frictionless-deployment-pipeline.md) | স্বয়ংক্রিয় CI/CD পাইপলাইন |

## এই মডিউল শেষে তুমি যা পারবে

- ব্যাখ্যা করতে পারবে কীভাবে scaling, caching, আর queueing দিয়ে হাই ট্রাফিক সামলাতে হয়
- middleware দিয়ে rate limiting, validation, আর authentication guard বসাতে পারবে
- JMeter দিয়ে লোড টেস্ট করে সিস্টেমের breaking point আর ক্যাপাসিটি বের করতে পারবে
- DevTools ব্যবহার করে frontend সমস্যা এবং logs/metrics/stack trace ব্যবহার করে backend সমস্যা আলাদা করে চিনতে পারবে
- Blue-green, rolling, আর canary deployment-এর মধ্যে পার্থক্য বুঝবে
- একটা CI/CD পাইপলাইন ডিজাইন করতে পারবে যেটা টেস্ট, ডেপ্লয়, আর মনিটরিং-লিঙ্কড rollback একসাথে করে

পরবর্তী মডিউল: **Module 36 — Backend Applications Project Planning: Personal Growth**
