# Module 10 — Process

Module 9-এ আমরা পাইথনের কোড-লেভেল ভিত্তি (list, dict) পাকাপোক্ত করেছিলাম। এই ছোট মডিউলে আমরা কোডের গণ্ডি পেরিয়ে একধাপ নিচে নেমে দেখি — যখন `uvicorn main:app` চালানো হয়, তখন অপারেটিং সিস্টেমের ভেতরে আসলে কী ঘটে। Process, thread (আর Python-এর GIL), আর মাল্টি-ল্যাঙ্গুয়েজ সিস্টেম চালানোর ধারণা এই মডিউলের মূল বিষয়।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-what-is-a-process-finding-it-on-windows.md](01-what-is-a-process-finding-it-on-windows.md) | Process কী, Windows-এ কীভাবে খুঁজে বের করা যায় |
| 2 | [02-how-to-kill-a-python-process.md](02-how-to-kill-a-python-process.md) | Python প্রসেস বন্ধ (kill) করার পদ্ধতি |
| 3 | [03-what-is-a-thread.md](03-what-is-a-thread.md) | Thread কী, Python-এর GIL, ও কেন multiprocessing CPU-bound কাজের সঠিক সমাধান |
| 4 | [04-finding-a-thread-windows-mac-linux.md](04-finding-a-thread-windows-mac-linux.md) | Windows/macOS/Linux-এ থ্রেড খুঁজে বের করা |
| 5 | [05-running-multiple-language-software-together.md](05-running-multiple-language-software-together.md) | একাধিক ভাষায় লেখা সার্ভিস একসাথে চালানো |

## এই মডিউল শেষে তুমি যা পারবে

- বুঝবে process আর PID আসলে কী, এবং কীভাবে একটা `uvicorn`/`python` কমান্ড একটা প্রসেসে পরিণত হয়
- Windows, macOS, এবং Linux-এ চলমান প্রসেস ও থ্রেড খুঁজে বের করতে পারবে
- প্রয়োজনে সঠিকভাবে একটা প্রসেস বন্ধ (kill) করতে পারবে, যেমন "address already in use" সমস্যার সমাধানে
- process আর thread-এর পার্থক্য বুঝবে, এবং GIL কেন Python-এ থ্রেড দিয়ে CPU-bound কাজে সত্যিকারের প্যারালালিজম দেয় না, আর কেন এই ক্ষেত্রে multiprocessing দরকার হয়, তা ব্যাখ্যা করতে পারবে
- বুঝবে কেন ও কীভাবে একাধিক ভাষায় (যেমন Python ও Node.js) লেখা সার্ভিস একসাথে, HTTP দিয়ে সংযুক্ত হয়ে চলতে পারে

এই মডিউল বিল্ড হয়েছে Module 9-এর ভিত্তির উপর, এবং সরাসরি সংযুক্ত Module 2 (localhost, port), Module 4 (backend-to-backend কল, FastAPI vs Express), আর Module 5 (event loop)-এর সাথে।

কোর্স এখান থেকে এগিয়ে যায় **Module 11 — Cookies And Sessions**-এর দিকে, যেখানে HTTP-এর "স্টেটলেস" প্রকৃতি আর তা সামলানোর কৌশল নিয়ে আলোচনা শুরু হবে।
