# Module 29 — Authentication & Authorization

এই মডিউলে আমরা Module 11 (Cookies/Sessions), Module 12 (JWT) আর Module 21 (ডেটাবেজ অ্যাক্সেস কন্ট্রোল)-এ ছড়িয়ে থাকা authentication আর authorization-এর জ্ঞানকে একত্র করে একটা পূর্ণাঙ্গ, প্রোডাকশন-মানের auth স্থাপত্য তৈরি করি — FastAPI-কে মূল ফোকাস রেখে, ইন্টারমিডিয়েট স্থাপত্যিক-ওভারভিউ লেভেলে। Module 12-এর JWT hands-on আর Module 25-এর FastAPI advanced RBAC-এর সাথে বিষয়বস্তু ওভারল্যাপ করলেও, এই মডিউলের ফোকাস "পুরো ছবিটা" বোঝানো — গভীর হাতে-কলমে বাস্তবায়ন সেই দুটো মডিউলে।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-token-based-authentication-flow-and-security.md](01-token-based-authentication-flow-and-security.md) | JWT ইস্যু ও যাচাইয়ের সম্পূর্ণ ফ্লো, `OAuth2PasswordBearer`, access/refresh টোকেন কৌশল |
| 2 | [02-role-based-access-control-rbac-architecture.md](02-role-based-access-control-rbac-architecture.md) | RBAC-এর মূল স্থাপত্য: User, Role, Permission-এর সম্পর্ক |
| 3 | [03-implementing-authorization-middleware.md](03-implementing-authorization-middleware.md) | `require_role`/`require_permission` dependency factory বাস্তবায়ন |
| 4 | [04-user-roles-and-permissions-management.md](04-user-roles-and-permissions-management.md) | Role/Permission-এর SQLAlchemy/Pydantic মডেল ও ম্যানেজমেন্ট API |
| 5 | [05-securing-api-routes-with-authentication.md](05-securing-api-routes-with-authentication.md) | পূর্ণাঙ্গ route protection strategy ও সাধারণ ভুলসমূহ |

## এই মডিউল শেষে তুমি যা পারবে

- FastAPI-তে JWT-ভিত্তিক access/refresh টোকেন ইস্যু ও যাচাই করার dependency (`OAuth2PasswordBearer`) লিখতে পারবে
- Role আর Permission-এর একটা সুসংগঠিত RBAC মডেল ডিজাইন করতে পারবে, ডেটাবেজে many-to-many সম্পর্ক সহ
- `require_role`, `require_permission`, আর ownership-ভিত্তিক কাস্টম authorization dependency লিখতে পারবে
- একটা সম্পূর্ণ API-এর সব route-কে সঠিক স্তরে (public / authenticated / role-restricted) `APIRouter`-level dependencies দিয়ে সুরক্ষিত করতে পারবে
- Broken Object Level Authorization (BOLA)/IDOR-এর মতো সাধারণ authorization দুর্বলতা চিনতে ও প্রতিরোধ করতে পারবে

পরবর্তী মডিউল: **[Module 30 — API Security](../module-30-api-security/README.md)**
