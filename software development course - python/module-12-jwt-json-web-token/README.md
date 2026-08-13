# Module 12 — JWT (JSON Web Token)

Module 11-এ আমরা দেখেছি Cookie আর Session দিয়ে Authentication বানাতে গিয়ে কোথায় কোথায় সীমাবদ্ধতা তৈরি হয় — স্কেলেবিলিটি, ক্রস-ডোমেইন, মাল্টি-প্ল্যাটফর্ম সমর্থন, CSRF ঝুঁকি। এই মডিউলে আমরা শিখবো আধুনিক ওয়েবের সবচেয়ে জনপ্রিয় সমাধান — JWT (JSON Web Token), যেটা দিয়ে সার্ভারকে কোনো তথ্য নিজের কাছে "মনে" না রেখেই একজন ব্যবহারকারীকে নিরাপদে চিনতে পারে। এর ভিত্তি হিসেবে আমরা হ্যাশিং-এর ধারণাটাও গভীরভাবে বুঝবো, আর শেষে একটা সম্পূর্ণ প্রজেক্ট বানিয়ে সব জোড়া লাগাবো।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-introduction-to-jwt.md](01-introduction-to-jwt.md) | JWT-র পরিচয় |
| 2 | [02-idea-of-hashing.md](02-idea-of-hashing.md) | Hashing-এর ধারণা |
| 3 | [03-hashing-username-and-password.md](03-hashing-username-and-password.md) | Username ও Password হ্যাশ করা (passlib) |
| 4 | [04-jwt-the-better-approach-for-authenticate-client.md](04-jwt-the-better-approach-for-authenticate-client.md) | JWT — ক্লায়েন্ট Authenticate করার উন্নত পদ্ধতি |
| 5 | [05-jwt-hands-on.md](05-jwt-hands-on.md) | JWT হ্যান্ডস-অন — জেনারেট ও ভেরিফাই করা |
| 6 | [06-assignment-personal-todo-manager-with-auth.md](06-assignment-personal-todo-manager-with-auth.md) | অ্যাসাইনমেন্ট: Authentication সহ পার্সোনাল TODO ম্যানেজার |

## এই মডিউল শেষে তুমি যা পারবে

- JWT কী, কেন দরকার, এবং এটা Session-ভিত্তিক Authentication-এর সমস্যাগুলো কীভাবে সমাধান করে তা ব্যাখ্যা করতে পারবে
- Hashing কী, এনক্রিপশন থেকে এটা কীভাবে আলাদা, তা বুঝবে
- `passlib` (bcrypt) দিয়ে পাসওয়ার্ড নিরাপদে হ্যাশ করতে পারবে
- `pyjwt` প্যাকেজ ও FastAPI-এর `OAuth2PasswordBearer` দিয়ে JWT তৈরি ও যাচাই করতে পারবে
- সম্পূর্ণ একটা Authentication ব্যবস্থা (রেজিস্ট্রেশন, লগইন, প্রোটেক্টেড রুট) নিজে হাতে বানাতে পারবে, ডেটাবেস ছাড়াই

পরবর্তী মডিউল: **[Module 13 — Python Typing With OOP](../module-13-python-typing-with-oop/README.md)**
