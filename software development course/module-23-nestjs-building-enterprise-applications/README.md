# Module 23 — NestJS - Building Enterprise Applications

Module 22-এ আমরা Design Pattern-এর তত্ত্ব শিখেছিলাম — Dependency Injection, Factory, Strategy, Decorator। এই মডিউলে আমরা দেখবো কীভাবে এই সবগুলো ধারণা একসাথে মিলে একটা বাস্তব, প্রোডাকশন-রেডি ফ্রেমওয়ার্ক তৈরি করে — NestJS। এখানে আমরা Express.js-এর (Module 4, 6, 7) পরিচিত ধারণাগুলোকে একটা আরও কাঠামোবদ্ধ, এন্টারপ্রাইজ-গ্রেড রূপে দেখবো, আর নিজে হাতে একটা প্রজেক্ট তৈরি করে, চালিয়ে, Controller-Provider-Module বানাবো।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-nestjs-intro.md](01-nestjs-intro.md) | NestJS কী, কেন দরকার, Express.js-এর সাথে পার্থক্য |
| 2 | [02-introduction-to-nestjs-ecosystem.md](02-introduction-to-nestjs-ecosystem.md) | NestJS-এর প্যাকেজ ও ইকোসিস্টেম |
| 3 | [03-running-a-nestjs-project.md](03-running-a-nestjs-project.md) | CLI দিয়ে প্রজেক্ট তৈরি ও রান করা |
| 4 | [04-files-and-folder-structures.md](04-files-and-folder-structures.md) | প্রজেক্টের ফোল্ডার ও ফাইল কাঠামো |
| 5 | [05-controllers-in-nestjs.md](05-controllers-in-nestjs.md) | Controller — রুট, প্যারামিটার, বডি হ্যান্ডলিং |
| 6 | [06-providers-in-nestjs.md](06-providers-in-nestjs.md) | Provider/Service — বিজনেস লজিক ও Dependency Injection |
| 7 | [07-modules-in-nestjs-applications.md](07-modules-in-nestjs-applications.md) | Module — ফিচার-ভিত্তিক সংগঠন |
| 8 | [08-module-summery.md](08-module-summery.md) | সম্পূর্ণ রিকোয়েস্ট-রেসপন্স চক্র রিক্যাপ |

## এই মডিউল শেষে তুমি যা পারবে

- ব্যাখ্যা করতে পারবে NestJS কেন opinionated ফ্রেমওয়ার্ক, আর কেন এটা বড় দল/প্রজেক্টে সুবিধাজনক
- `@nestjs/cli` দিয়ে নতুন প্রজেক্ট তৈরি করে রান করতে পারবে
- একটা NestJS প্রজেক্টের ফোল্ডার কাঠামো পড়ে বুঝতে পারবে
- `@Controller()`, `@Get()`, `@Post()`, `@Param()`, `@Query()`, `@Body()` ব্যবহার করে রুট বানাতে পারবে
- `@Injectable()` Provider বানিয়ে Constructor Injection দিয়ে Controller-এর সাথে যুক্ত করতে পারবে
- `@Module()` দিয়ে একটা ফিচারকে সংগঠিত করে অন্য Module-এর সাথে `imports`/`exports` করতে পারবে

পরবর্তী মডিউল: **Module 24 — NEST JS Project Ecommerce**
