# Lecture 02 — Derivative থেকে Gradient

> আগে যা জানা থাকলে ভালো: [Lecture 01-এর চার ধাপের চক্র](lecture-01-loss-gradient-and-backpropagation.md)। এই lecture শেষে পারবে: একটি parameter-এর derivative ছোট "ঠেলা" দিয়ে বের করতে এবং কয়েকটি derivative একসঙ্গে সাজিয়ে gradient বলতে। Derivative আরও অনুশীলনের জন্য: [Module 04 — Derivative ও gradient অনুশীলন](../module-04-math-foundations-practice/lecture-04-derivative-and-gradient-practice.md)।

## সমস্যাটা কী?

Loss এখন `4`। `w` বাড়াব নাকি কমাব? বাড়ালে loss কি বাড়বে? আর কতটা বদলালে কতটা ফল হবে? শুধু loss-এর মান দেখে এর উত্তর পাওয়া যায় না। দরকার এমন একটা সংখ্যা, যা বলে "`w` একটু বদলালে loss কোন দিকে কত জোরে বদলায়।" এই সংখ্যাটাকেই **derivative** বলে।

## ধারণাটা সহজ ভাষায়

Derivative বের করার সবচেয়ে সোজা উপায় হলো parameter-কে একটু ঠেলে দেখা।

**Derivative = (loss-এর পরিবর্তন) ÷ (parameter-এর পরিবর্তন)**, যখন পরিবর্তনটা খুব ছোট।

Lecture 01-এর উদাহরণ ধরো: `prediction = 3w + 1`, target `5`, তাই `loss = (3w + 1 − 5)²`। এখন `w = 2`।

- `w = 2` হলে prediction `7`, loss `(7 − 5)² = 4`।
- `w`-কে `0.001` বাড়িয়ে `2.001` করলে prediction `7.003`, loss `(7.003 − 5)² = 4.012009`।
- Loss বেড়েছে `4.012009 − 4 = 0.012009`। ভাগ করলে `0.012009 ÷ 0.001 = 12.009`।

অর্থাৎ `w` সামান্য বাড়ালে loss বাড়ছে `w`-এর বৃদ্ধির প্রায় `12` গুণ। Derivative প্রায় `12`। ঠেলা যত ছোট, সংখ্যাটা তত নিখুঁত হয়:

| ঠেলা `h` | `w`-এর ঢাল | `b`-এর ঢাল |
|---|---|---|
| 1 | 21 | 5 |
| 0.1 | 12.9 | 4.1 |
| 0.01 | 12.09 | 4.01 |
| 0.001 | 12.009 | 4.001 |

ঠেলা ছোট হতে হতে `w`-এর ঢাল `12`-এর দিকে আর `b`-এর ঢাল `4`-এর দিকে যাচ্ছে। এটাই `w` ও `b`-এর derivative। (`b` এসেছে নিচের অংশে।)

**ঢালের উপমা:** পাহাড়ে দাঁড়িয়ে পায়ের নিচের ঢাল দেখো। ঢাল যত খাড়া, এক পা এগোলে উচ্চতা তত বেশি বদলায়। Derivative হলো loss-এর "ঢাল"। চিহ্ন বলে ঢাল কোন দিকে, সংখ্যা বলে কতটা খাড়া।

## Derivative-এর চিহ্ন থেকে কী বোঝা যায়

- **ধনাত্মক (যেমন 12):** parameter বাড়ালে loss বাড়ে। তাই parameter **কমাতে** হবে।
- **ঋণাত্মক:** parameter বাড়ালে loss কমে। তাই parameter **বাড়াতে** হবে।
- **শূন্য:** এই অবস্থানে parameter একটু বদলালে loss প্রায় বদলায় না। এর মানে এই নয় যে model পুরো শিখে ফেলেছে।

দুটো ছোট সূত্র মনে রাখলে অনেক হিসাব সহজ হয়:

- `c × w`-এর derivative `c` (যেমন `3w` বাড়লে প্রতি 1 বৃদ্ধিতে 3 বাড়ে)।
- `w²`-এর derivative `2w` (যেমন `w = 3`-এ `6`; ঠেলা `0.001` দিয়ে দেখলে `6.001` আসে)।

Loss `(3w + 1 − 5)²`-এর derivative `12` কেন হলো, তার সূত্র পাওয়া যায় chain rule থেকে। সেটা [Lecture 03](lecture-03-chain-rule.md)-এর বিষয়।

## অনেক Parameter: Gradient

Network-এ parameter একটা নয়, অনেক। এক parameter-কে ঠেলে দেখার সময় **বাকি সব স্থির** রাখা হয়। এভাবে পাওয়া প্রতিটি derivative-কে **partial derivative** বলে। সব parameter-এর partial derivative একসঙ্গে সাজালে যে তালিকা পাওয়া যায়, তার নাম **gradient**।

ধরো এখন দুটি parameter: `prediction = 3w + b`, `w = 2`, `b = 1`, `loss = (3w + b − 5)²`। উপরের table থেকে:

- `w`-এর derivative `12`
- `b`-এর derivative `4`
- **gradient = `[12, 4]`**

Gradient-এর প্রতিটি সংখ্যা নিজ parameter-এর কথা বলে। `b`-এর ঠেলায় loss কম বদলায় (`4`), `w`-এর ঠেলায় বেশি (`12`), কারণ `w` তিন গুণ হারে prediction-কে প্রভাবিত করে।

## ছোট একটা উদাহরণ: gradient দিয়ে এক পা

Gradient `[12, 4]` দুটোই ধনাত্মক, তাই দুটো parameter-ই কমাতে হবে। Learning rate `0.02` নিয়ে:

```text
নতুন w = 2 − 0.02 × 12 = 1.76
নতুন b = 1 − 0.02 × 4  = 0.92
```

নতুন prediction `3 × 1.76 + 0.92 = 6.2`, নতুন loss `(6.2 − 5)² = 1.44`। Loss `4` থেকে `1.44`-এ নেমেছে।

## কোড

উপরের "ঠেলা" পদ্ধতি Python-এ (standard library):

```python
def loss(w, b):
    return (3 * w + b - 5) ** 2

w, b = 2, 1
for h in (1, 0.1, 0.01, 0.001):
    slope_w = (loss(w + h, b) - loss(w, b)) / h   # শুধু w ঠেলা
    slope_b = (loss(w, b + h) - loss(w, b)) / h   # শুধু b ঠেলা
    print(h, round(slope_w, 3), round(slope_b, 3))

# output:
# 1 21.0 5.0
# 0.1 12.9 4.1
# 0.01 12.09 4.01
# 0.001 12.009 4.001
```

সাবধান: এই "ঠেলা" পদ্ধতি শুধু যাচাইয়ের জন্য ভালো। বড় network-এ প্রতিটি parameter আলাদা ঠেলতে গেলে কোটি কোটি বার forward pass লাগত। তাই training-এ derivative বের করা হয় backpropagation দিয়ে (Lecture 04)।

## মনে রাখার সারকথা

- Derivative = parameter একটু বদলালে loss কত বদলায়, তার অনুপাত। ছোট ঠেলা দিয়ে মেলানো যায়।
- Gradient = সব parameter-এর derivative একসঙ্গে। প্রতিটা অন্য সব parameter স্থির রেখে হিসাব।
- ধনাত্মক derivative মানে parameter কমাও, ঋণাত্মক মানে বাড়াও।

## নিজে করো

1. `loss = (3w + 1 − 5)²`-এ `w = 1` হলে loss কত? Derivative `2 × (prediction − 5) × 3` সূত্রে বের করো। `w` বাড়াব না কমাব?
2. `f(x) = x²`-এর `x = 4`-এ derivative সূত্র দিয়ে ও `h = 0.001` ঠেলা দিয়ে বের করো।
3. `loss = (3w + b − 5)²`-এ `w = 1`, `b = 1` হলে gradient কত? Learning rate `0.02`-এ নতুন `w`, `b` ও নতুন loss বের করো।

<details><summary>উত্তর</summary>

1. `prediction = 3 × 1 + 1 = 4`, `loss = (4 − 5)² = 1`। Derivative `2 × (4 − 5) × 3 = −6`। ঋণাত্মক, তাই `w` **বাড়াতে** হবে।

2. সূত্র: `2 × 4 = 8`। ঠেলা দিয়ে: `((4.001)² − 16) ÷ 0.001 = 8.001`। দুটো প্রায় মেলে।

3. `w`-এর derivative `2 × (4 − 5) × 3 = −6`, `b`-এর derivative `2 × (4 − 5) × 1 = −2`। Gradient `[−6, −2]`। নতুন `w = 1 − 0.02 × (−6) = 1.12`, নতুন `b = 1 − 0.02 × (−2) = 1.04`। নতুন prediction `3 × 1.12 + 1.04 = 4.4`, নতুন loss `(4.4 − 5)² = 0.36`।

</details>

## পরের পাঠ

আসল network-এ একটা parameter loss পর্যন্ত পৌঁছানোর আগে কয়েকটা ধাপ পার হয়। এই পরপর ধাপের derivative কীভাবে জোড়া লাগে তা দেখা যাবে [Lecture 03 — Chain rule](lecture-03-chain-rule.md)-এ।
