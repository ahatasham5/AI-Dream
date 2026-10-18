# Lecture 07 — Mean, ছড়ানো ও Probability

> আগে যা জানা থাকলে ভালো: [Lecture 03](lecture-03-how-supervised-learning-works.md) — loss হলো ভুলগুলোর গড় ধরনের একটা সংখ্যা। এই lecture শেষে পারবে: একটা তালিকার mean, variance ও standard deviation হাতে বের করতে, আর probability ও scaling-এর সহজ ব্যবহার বলতে।

[Map-এ অবস্থান](../01-learning-map.md): সাধারণ math-এর উপকরণ। Mean ও square-এর হিসাব MSE ও K-Means-এ আসে।

## সমস্যাটা কী?

হাজারটা বাড়ির দাম একটা তালিকায় আছে। পুরো তালিকা দেখে কিছু বোঝা যায় না। আমরা চাই একটা-দুটো সংখ্যায় তালিকাটা বর্ণনা করতে। আরেকটা সমস্যা: model অনেক সময় নিশ্চিত নয়। সে "spam" বা "ok" বলার বদলে বলে "85% সম্ভাবনা spam", আর এই 85% ঠিক কী, সেটাও বুঝতে হবে।

## ধারণাটা সহজ ভাষায়

**Mean** (গড়): সব সংখ্যা যোগ করে সংখ্যার সংখ্যা দিয়ে ভাগ। এটা বলে তালিকার "মাঝামাঝি" কোথায়।

**ছড়ানো (spread):** শুধু mean যথেষ্ট নয়। `[5, 5, 5, 5]` আর `[1, 3, 7, 9]`-এর mean দুটোই 5, কিন্তু দ্বিতীয়টা অনেক ছড়ানো। ছড়ানো মাপার জন্য প্রতিটা সংখ্যা mean থেকে কতটা দূরে তার square-এর গড় নেওয়া হয়। এটাই **variance**। Variance-এর square root-কে বলে **standard deviation**, যেটা মূল সংখ্যার এককেই থাকে।

**Probability** হলো কোনো ঘটনা ঘটার সম্ভাবনা, 0 থেকে 1-এর মধ্যে। 0 মানে ঘটবে না, 1 মানে নিশ্চিত ঘটবে। মোটামুটি হিসাব: ঘটনাটা কতবার ঘটেছে ÷ মোট কতবার দেখা গেছে।

## ছোট একটা উদাহরণ

### Mean, variance, standard deviation

তালিকা: `2, 4, 4, 4, 5, 5, 7, 9` (মোট 8টা সংখ্যা)।

```text
Mean = (2+4+4+4+5+5+7+9) / 8 = 40 / 8 = 5

প্রতিটা সংখ্যা − mean:  −3, −1, −1, −1, 0, 0, 2, 4
তাদের square:           9, 1, 1, 1, 0, 0, 4, 16   (যোগফল 32)

Variance = 32 / 8 = 4
Standard deviation = √4 = 2
```

অর্থাৎ সংখ্যাগুলো mean 5 থেকে সাধারণত প্রায় 2 দূরে থাকে।

সাবধান: এখানে 8 দিয়ে ভাগ করা হয়েছে। কিছু জায়গায় sample থেকে অনুমান করার সময় 7 (n − 1) দিয়ে ভাগ করা হয়; সেটা Module 04-এ আসবে।

### Probability

10টা email দেখে 3টা spam পাওয়া গেল। Spam-এর probability মোটামুটি 3 ÷ 10 = 0.3। Classification model সরাসরি এমন একটা সংখ্যা দেয়: "এই mail-এর spam হওয়ার probability 0.85।" সংখ্যা থেকে সিদ্ধান্ত নিতে একটা সীমা (যেমন 0.5-এর বেশি হলে spam) ঠিক করা হয়। এটা [Module 03](../module-03-logistic-regression/lecture-01-sigmoid.md)-এ আসবে।

### সব feature-কে একই মাপে আনা (standardization)

আয়তন 1000-এর কাছাকাছি, রুম 1–5। এই দুই feature-কে একসঙ্গে ব্যবহার করলে বড় সংখ্যা model-কে বেশি টানে। সমাধান: প্রতিটা feature-কে বদলে `(মান − mean) ÷ standard deviation` করা। এখন উপরের তালিকায়:

```text
9 → (9 − 5) / 2 = 2
2 → (2 − 5) / 2 = −1.5
5 → (5 − 5) / 2 = 0
```

নতুন সংখ্যা মানে: mean থেকে কত standard deviation দূরে। এখন সব feature-ই 0-র আশেপাশে, একই ধরনের মাপে।

## কোড

```python
data = [2, 4, 4, 4, 5, 5, 7, 9]
mean = sum(data) / len(data)
variance = sum((x - mean) ** 2 for x in data) / len(data)
std = variance ** 0.5
print(mean, variance, std)
print([(x - mean) / std for x in data])
# output:
# 5.0 4.0 2.0
# [-1.5, -0.5, -0.5, -0.5, 0.0, 0.0, 1.0, 2.0]
```

## একটা সংযোগ

Variance হলো "mean থেকে পার্থক্যের square-এর গড়"। আর model-এর loss (MSE, [Module 02](../module-02-linear-regression/lecture-02-error-and-mean-squared-error.md)) হলো "অনুমান আর সঠিক উত্তরের পার্থক্যের square-এর গড়"। গঠন একই; শুধু কোন জিনিসের পার্থক্য নেওয়া হচ্ছে সেটা আলাদা।

## মনে রাখার সারকথা

- Mean বলে তালিকার মাঝামাঝি; variance ও standard deviation বলে কতটা ছড়ানো।
- Probability 0 থেকে 1-এর সংখ্যা; ঘটনা ÷ মোট থেকে মোটামুটি বের হয়।
- Feature-গুলো একই মাপে আনতে `(মান − mean) ÷ standard deviation` ব্যবহার হয়।

## নিজে করো

১. `[1, 3, 5]`-এর mean কত?
২. একই তালিকার variance ও standard deviation কত?
৩. ২০টা email-এর মধ্যে 5টা spam হলে spam-এর probability কত? আর উপরের `2, 4, 4, 4, 5, 5, 7, 9` তালিকায় `7`-এর standardized মান কত?

<details><summary>উত্তর</summary>

১. (1 + 3 + 5) / 3 = 3।

২. Mean থেকে পার্থক্য: −2, 0, 2। Square: 4, 0, 4, যোগফল 8। Variance = 8/3 = 2.667। Standard deviation = √2.667 = 1.633।

৩. 5 ÷ 20 = 0.25। আর `7`-এর standardized মান = (7 − 5) / 2 = 1।

</details>

## পরের পাঠ

Loss কতটা, সেটা মাপা গেল। এবার প্রশ্ন: loss কমাতে parameter কোন দিকে সরাব? সেটা বলে দেয় slope, [Lecture 08](lecture-08-calculus-intuition.md)-এ।
