# Lecture 06 — On-policy ও Offline Distillation: কে উদাহরণ তৈরি করে

> আগে যা জানা থাকলে ভালো: [Response distillation](lecture-02-response-and-sequence-distillation.md) ও [Distillation loss](lecture-04-distillation-loss.md)। এই lecture শেষে পারবে: offline ও on-policy distillation-এর পার্থক্য এবং কোনটার খরচ কেন বেশি তা বলতে।
> [Map-এ অবস্থান](../01-learning-map.md): training data কোথা থেকে আসে। Loss-এর সূত্র একই; বদলায় কোন text-এর উপর loss মাপা হয়।

## সমস্যাটা কী?

Student-কে teacher-এর লেখা উত্তর দিয়ে শেখালে সে teacher-এর পথ চেনে। কিন্তু ব্যবহারের সময় student নিজে লেখে, আর প্রতিটা token আগের নিজের লেখার উপর নির্ভর করে। একবার একটা token teacher-এর পথ থেকে সরে গেলে student এমন অবস্থায় পড়ে, যা training data-তে কখনো ছিলই না। সেখানে সে আরও ভুল করে, আর ভুলগুলো জমতে থাকে। এই সমস্যার প্রচলিত নাম **exposure bias**। সমাধান: student-এর নিজের লেখা অবস্থাতেই teacher-এর সংকেত দেওয়া।

## ধারণাটা সহজ ভাষায়

**Offline distillation:** উদাহরণ আগে থেকেই তৈরি এবং স্থির। সাধারণত teacher সেগুলো লিখে রেখেছে ([Lecture 02](lecture-02-response-and-sequence-distillation.md))। Student শুধু সেগুলো পড়ে শেখে।

**On-policy distillation:** Student নিজে prompt থেকে উত্তর লেখে। তারপর teacher সেই লেখার প্রতিটা অবস্থানে বলে "এখানে আমি কোন probability দিতাম"। Loss মাপা হয় student-এর নিজের লেখা text-এর উপর। "On-policy" শব্দটা [Module 17-এর RL](../module-17-reinforcement-learning-and-feedback/lecture-05-exploration-on-off-policy.md) থেকে এসেছে: যে model শিখছে, সে নিজেই data তৈরি করে।

| | Offline | On-policy |
|---|---|---|
| কে text লেখে | Teacher (আগে থেকে) | Student (প্রতি step-এ নতুন) |
| Teacher-এর কাজ | একবার উত্তর লেখা | প্রতিবার student-এর text score করা |
| Data আবার ব্যবহার | সহজে হয় | হয় না, কারণ student বদলায় |
| খরচ | কম | বেশি |
| ঝুঁকি | Student নিজের ভুলের অবস্থায় অপ্রস্তুত | Teacher-এর token-স্তরের probability লাগে, API-র text-only teacher-এ সাধারণত অসম্ভব |
| মাঝামাঝি | কিছু data teacher-এর, কিছু student-এর লেখা | |

Mixed পদ্ধতিও চলে: কিছু উদাহরণ teacher-এর লেখা, কিছু student-এর লেখা। Generalized Knowledge Distillation (reference নিচে) এরকম একটা কাঠামো দেয়।

## ছোট একটা উদাহরণ

একটা খেলনা ধারণা: ধরো প্রতি ধাপে student teacher-এর পথে থাকে 0.9 সম্ভাবনায়, এই 0.9 শুধু দেখানোর জন্য বসানো, কোনো মাপা সংখ্যা নয়। Offline data-তে শুধু teacher-এর পথই আছে। কতক্ষণ student সেই পরিচিত পথে থাকে?

| ধাপ | এখনো teacher-এর পথে (0.9^k) | অচেনা জায়গায় (1 − 0.9^k) |
|---|---|---|
| 0 | 1.000 | 0.000 |
| 1 | 0.900 | 0.100 |
| 2 | 0.810 | 0.190 |
| 3 | 0.729 | 0.271 |
| 4 | 0.656 | 0.344 |
| 5 | 0.590 | 0.410 |

পাঁচ ধাপের মধ্যে 41% উত্তর অন্তত একবার অচেনা জায়গায় ঢুকে গেছে। Offline training সেই অবস্থায় teacher কী করত তা দেখায়নি। On-policy-তে ঠিক ওই অবস্থাগুলোতেই teacher-এর probability পাওয়া যায়, তাই student সেখান থেকে ফেরার পথ শেখে।

```python
# খেলনা ধারণা: প্রতি ধাপে student teacher-এর পথে থাকে 0.9 সম্ভাবনায়
for k in range(0, 6):
    print("ধাপ", k, "| এখনো পথে:", round(0.9 ** k, 3), "| অচেনা জায়গায়:", round(1 - 0.9 ** k, 3))
```

```text
# output:
ধাপ 0 | এখনো পথে: 1.0 | অচেনা জায়গায়: 0.0
ধাপ 1 | এখনো পথে: 0.9 | অচেনা জায়গায়: 0.1
ধাপ 2 | এখনো পথে: 0.81 | অচেনা জায়গায়: 0.19
ধাপ 3 | এখনো পথে: 0.729 | অচেনা জায়গায়: 0.271
ধাপ 4 | এখনো পথে: 0.656 | অচেনা জায়গায়: 0.344
ধাপ 5 | এখনো পথে: 0.59 | অচেনা জায়গায়: 0.41
```

## On-policy loop-এর কাঠামো

নিচের কোড **ধারণা বোঝানোর pseudo-code**। এটা চালানো হয়নি, আর function-এর নাম কাল্পনিক, কোনো library-র আসল API নয়।

```text
# pseudo-code (চালানো হয়নি)
for prompts in batches:
    y = student_generate(prompts)          # student নিজে লেখে
    p = teacher_token_probs(prompts, y)    # teacher সেই লেখার প্রতি অবস্থানে probability দেয়
    q = student_token_probs(prompts, y)    # student-এর নিজের probability
    loss = average_kl(p, q)                # Lecture 04-এর KL, প্রতি অবস্থানে
    update(student, loss)                  # শুধু student-এর weight বদলায়
```

সাবধান: কিছু পদ্ধতি এখানে KL-এর উল্টো দিক (`student ‖ teacher`) নেয়। দিকটা আলাদা design-সিদ্ধান্ত; এই lecture-এ শুধু "কার লেখা text-এর উপর loss" তা বোঝানো হলো।

## কোন পথ কখন

- **কম খরচের পথ:** offline। Teacher একবার লেখে, student অনেকবার শেখে। ছোট উত্তরে সাধারণত যথেষ্ট।
- **Production-গ্রেড পথ:** offline দিয়ে শুরু করে on-policy বা mixed যোগ করা। উত্তর লম্বা হলে (যেমন ধাপে ধাপে যুক্তি) এটা বেশি কাজে আসে, কারণ ভুল জমার সুযোগ বেশি। খরচ বাড়ে, কারণ teacher প্রতি step-এ চলে।
- **সুপারিশ:** আগে offline baseline দাঁড় করাও এবং মাপো। student-এর লেখা লম্বা উত্তরে ভুল জমাট বাঁধতে দেখলে তবেই on-policy যোগ করো।

## মনে রাখার সারকথা

- Offline: উদাহরণ স্থির, teacher-এর লেখা। On-policy: student লেখে, teacher সেই লেখায় সংকেত দেয়।
- Offline-এ student teacher-এর পথ চেনে, কিন্তু নিজের ভুলের পরের অবস্থা চেনে না; ভুল জমতে পারে।
- On-policy-র খরচ বেশি, আর teacher-এর token-স্তরের probability লাগে।

## নিজে করো

১. প্রতি ধাপে 0.9 ধরলে 3 ধাপ পর কত শতাংশ অচেনা জায়গায়?
২. (ক) Teacher-এর লেখা স্থির 10,000 উত্তরে SFT, (খ) student লেখে আর teacher সেই লেখা score করে। কোনটা on-policy?
৩. 1,000 prompt, student প্রতিটায় 200 token লেখে। Teacher এক pass-এ কত token-অবস্থানে probability দেবে? 3 pass-এ কত? Offline-এর তুলনায় এটা বেশি খরচ কেন?

<details><summary>উত্তর</summary>

১. `1 − 0.9³ = 1 − 0.729 = 0.271`, অর্থাৎ **27.1%**।
২. **(খ)**। (ক) offline।
৩. 1,000 × 200 = **200,000** অবস্থান; 3 pass-এ **600,000**। বেশি খরচের কারণ: প্রতিবার student নতুন text লেখে, তাই teacher-কে প্রতিবার নতুন করে চালাতে হয়, আর আগের হিসাব আবার ব্যবহার করা যায় না।

</details>

## পরের পাঠ

Teacher-এর উত্তর যে সবসময় ঠিক নয়, তা এখনো ধরা হয়নি। Student ভুল শিখলে কী হয় আর কীভাবে ঠেকানো যায়: [Lecture 07 — Reasoning data ও verification](lecture-07-reasoning-data-and-verification.md)।

**Reference:** [On-Policy Distillation of Language Models (GKD)](https://arxiv.org/abs/2306.13649)।
