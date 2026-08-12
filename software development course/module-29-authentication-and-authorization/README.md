# Module 29 — Authentication & Authorization

এই মডিউলে আমরা Module 11 (Cookies/Sessions), Module 12 (JWT), Module 21 (ডেটাবেজ RBAC) আর Module 25 (NestJS-এ JWT/Passport/RBAC)-এ ছড়িয়ে থাকা authentication আর authorization-এর জ্ঞানকে একত্র করে একটা পূর্ণাঙ্গ, প্রোডাকশন-মানের auth স্থাপত্য তৈরি করি — Express + TypeScript-কে মূল ফোকাস রেখে, আর NestJS-এর সমতুল্য পদ্ধতিও ছোট আকারে তুলনা করে দেখি।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-token-based-authentication-flow-and-security.md](01-token-based-authentication-flow-and-security.md) | JWT ইস্যু ও যাচাইয়ের সম্পূর্ণ ফ্লো, access/refresh টোকেন কৌশল |
| 2 | [02-role-based-access-control-rbac-architecture.md](02-role-based-access-control-rbac-architecture.md) | RBAC-এর মূল স্থাপত্য: User, Role, Permission-এর সম্পর্ক |
| 3 | [03-implementing-authorization-middleware.md](03-implementing-authorization-middleware.md) | `requireRole`/`requirePermission` মিডলওয়্যার বাস্তবায়ন |
| 4 | [04-user-roles-and-permissions-management.md](04-user-roles-and-permissions-management.md) | Role/Permission-এর ডেটাবেজ মডেল ও ম্যানেজমেন্ট API |
| 5 | [05-securing-api-routes-with-authentication.md](05-securing-api-routes-with-authentication.md) | পূর্ণাঙ্গ route protection strategy ও সাধারণ ভুলসমূহ |

## এই মডিউল শেষে তুমি যা পারবে

- Express + TypeScript-এ JWT-ভিত্তিক access/refresh টোকেন ইস্যু ও যাচাই করার middleware লিখতে পারবে
- Role আর Permission-এর একটা সুসংগঠিত RBAC মডেল ডিজাইন করতে পারবে, ডেটাবেজে many-to-many সম্পর্ক সহ
- `requireRole`, `requirePermission`, আর ownership-ভিত্তিক কাস্টম authorization middleware লিখতে পারবে
- একটা সম্পূর্ণ API-এর সব route-কে সঠিক স্তরে (public / authenticated / role-restricted) সুরক্ষিত করতে পারবে
- Broken Object Level Authorization (BOLA)-এর মতো সাধারণ authorization দুর্বলতা চিনতে ও প্রতিরোধ করতে পারবে
- Express আর NestJS (Module 25)-এর auth স্থাপত্যের মধ্যে ধারণাগত সমতা দেখতে পারবে

পরবর্তী মডিউল: **Module 30 — API Security**
