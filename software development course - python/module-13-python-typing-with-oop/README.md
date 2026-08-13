# Module 13 — Python Typing With OOP

এতদিন আমরা যা কিছু লিখেছি — Python ফাংশন, FastAPI রুট — সবকিছু প্লেইন, টাইপ হিন্ট ছাড়া বা হালকা টাইপ হিন্ট সহ Python দিয়ে লিখেছি। এই মডিউলে আমরা প্রথমে বুঝবো কেন বড় প্রজেক্টে টাইপ দরকার হয়, Python-এর টাইপ হিন্ট TypeScript-এর static typing থেকে ঠিক কীভাবে আলাদা (ঐচ্ছিক বনাম বাধ্যতামূলক, রানটাইমে এনফোর্স হয় না বনাম হয়), mypy/pyright আর Pydantic দিয়ে কীভাবে এই ফাঁক পূরণ করা হয় — এবং তারপর Object-Oriented Programming (OOP)-এর চারটা মূল স্তম্ভের প্রথম তিনটা আর Class/Inheritance-এর ভিত্তি গড়ে তুলবো, প্রতি ধাপে Python আর TypeScript-এর মধ্যে গুরুত্বপূর্ণ পার্থক্যগুলো স্পষ্টভাবে চিহ্নিত করে।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-why-do-we-need-type-hints.md](01-why-do-we-need-type-hints.md) | Python-এ Type Hint কেন দরকার? (TypeScript-এর static typing-এর সাথে তুলনা) |
| 2 | [02-running-type-checked-python-project.md](02-running-type-checked-python-project.md) | mypy/pyright দিয়ে টাইপ-চেকড প্রজেক্ট চালানো |
| 3 | [03-type-hints-and-pydantic-in-fastapi.md](03-type-hints-and-pydantic-in-fastapi.md) | FastAPI-তে Type Hint ও Pydantic |
| 4 | [04-introduction-to-object-orientation-why-types.md](04-introduction-to-object-orientation-why-types.md) | Object Orientation পরিচিতি: Types কেন দরকার? |
| 5 | [05-introduction-to-oop.md](05-introduction-to-oop.md) | OOP পরিচিতি (চারটা স্তম্ভ) |
| 6 | [06-encapsulation-first-pillar.md](06-encapsulation-first-pillar.md) | Encapsulation: OOP-এর প্রথম স্তম্ভ |
| 7 | [07-encapsulation-recap.md](07-encapsulation-recap.md) | Encapsulation রিক্যাপ |
| 8 | [08-abstraction-oop.md](08-abstraction-oop.md) | Abstraction - OOP (Python-এর ABC মডিউল) |
| 9 | [09-what-is-a-class-basics.md](09-what-is-a-class-basics.md) | Class কী? বেসিক ধারণা |
| 10 | [10-inheritance-in-oop.md](10-inheritance-in-oop.md) | Inheritance in OOP |

## এই মডিউল শেষে তুমি যা পারবে

- Python-এ type hint কেন দরকার এবং TypeScript-এর static typing থেকে এটা কীভাবে দর্শনগতভাবে আলাদা তা ব্যাখ্যা করতে পারবে
- `mypy`/`pyright` দিয়ে নিজের Python প্রজেক্ট টাইপ-চেক করতে পারবে, আর বুঝবে কেন পাস করা মানেই রানটাইম-সেফ না
- Pydantic দিয়ে টাইপ হিন্টকে সত্যিকারের রানটাইম ভ্যালিডেশনে রূপান্তর করতে পারবে
- Encapsulation ও Abstraction ব্যবহার করে বাস্তব-জীবনের সমস্যার মডেল বানাতে পারবে, আর জানবে Python-এ "private" আসলে কতটা enforced
- Class লিখতে ও Inheritance দিয়ে কোড পুনর্ব্যবহার করতে পারবে, Python-এর multiple inheritance-এর ঝুঁকি বুঝে

পরবর্তী মডিউল: **[Module 14 — Protocols And Polymorphism](../module-14-protocols-and-polymorphism/README.md)**
