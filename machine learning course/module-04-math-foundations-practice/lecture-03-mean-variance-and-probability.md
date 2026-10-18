# Lecture 03 — Mean, Variance ও Probability: হাতে-কলমে অনুশীলন

> আগে যা জানা থাকলে ভালো: [Module 01-এর probability ও statistics পরিচিতি](../module-01-ml-fundamentals-and-math-basics/lecture-07-probability-and-statistics-basics.md) এবং [MSE](../module-02-linear-regression/lecture-02-error-and-mean-squared-error.md)। এই lecture শেষে পারবে: গড়, variance ও standard deviation হাতে বের করতে, ডেটার count থেকে probability হিসাব করতে, আর বলতে পারবে ML-এর কোথায় এগুলো আসে।

## সমস্যাটা কী?

হাজার সংখ্যার তালিকা দেখে কিছু বোঝা যায় না। দুটো প্রশ্নের উত্তর পেলে ছবিটা পরিষ্কার হয়: সংখ্যাগুলো সাধারণত কোথায় আছে (**mean**), আর কতটা ছড়ানো (**variance**)। এছাড়া classification-এ আমরা সম্ভাবনা নিয়ে কাজ করি, তাই probability-র সহজ নিয়মগুলো হাতে থাকা দরকার।

ML-এ এই হিসাবগুলো এভাবে ফিরে আসে: MSE হলো squared error-এর mean; feature-এর মান সাজানোর (standardization) সময় mean আর standard deviation লাগে; আর log loss-এ probability-র `−ln` নেওয়া হয়।

## ধারণাটা সহজ ভাষায়

**Mean** = সব সংখ্যার যোগফল ÷ সংখ্যার সংখ্যা।

**Deviation** = একটা সংখ্যা থেকে mean বাদ (`x − mean`)। সব deviation যোগ করলে সবসময় 0 হয়, কারণ উপরের ও নিচের দিক কাটাকাটি হয়ে যায়। তাই "কতটা ছড়ানো" মাপতে deviation-কে square করে নিই (MSE-তে যে কারণে error square হয়, একই কারণ)।

**Variance** = deviation-এর square-এর mean।

**Standard deviation (std)** = variance-এর বর্গমূল। এটা মূল সংখ্যার একই এককে ছড়ানো দেখায়।

সাবধান: এই lecture-এ variance-এ n দিয়ে ভাগ করা হয়েছে। কিছু library নমুনা (sample) ধরে `n − 1` দিয়ে ভাগ করে, তাই ছোট ডেটায় ফল আলাদা হতে পারে।

**Probability** হলো 0 থেকে 1-এর মধ্যে একটা সংখ্যা। ডেটা থেকে সহজ হিসাব: `ঘটনা কতবার ঘটেছে ÷ মোট কতবার`। কয়েকটা নিয়ম:

- সব সম্ভাব্য ফলের probability-র যোগফল 1। তাই "ঘটবে না"-র probability = `1 − p`।
- দুটো **independent** (একটা অন্যটাকে প্রভাবিত করে না) ঘটনা একসঙ্গে ঘটার probability = দুটোর গুণফল।

## ছোট একটা উদাহরণ

নম্বর: `[4, 6, 8, 10, 12]`।

1. Mean: `(4 + 6 + 8 + 10 + 12) / 5 = 40 / 5 = 8`
2. Deviation: `[−4, −2, 0, 2, 4]` (যোগফল 0)
3. Square: `[16, 4, 0, 4, 16]`
4. Variance: `(16 + 4 + 0 + 4 + 16) / 5 = 8`
5. Std: `√8 ≈ 2.828`

MSE-র সঙ্গে মিল: [Module 02-এর](../module-02-linear-regression/lecture-02-error-and-mean-squared-error.md) error `[−2, −3]`-এর square `[4, 9]`, mean `6.5`। MSE আসলে error-এর square-এর mean; পদ্ধতি একই।

Standardization-এর পূর্বাভাস: প্রতিটা সংখ্যা থেকে mean বাদ দিয়ে std দিয়ে ভাগ করলে `[−1.414, −0.707, 0, 0.707, 1.414]` পাওয়া যায়। এতে ডেটার mean 0 আর std 1 হয়; এই কৌশল Module 05-এ কাজে লাগবে।

Probability: 100টা email-এ 30টা spam। `P(spam) = 30 / 100 = 0.3`, `P(spam নয়) = 1 − 0.3 = 0.7`। দুটো আলাদা email দুটোই spam হওয়ার probability (independent ধরে) `0.3 × 0.3 = 0.09`। অন্তত একটা spam হওয়ার probability = `1 − (দুটোই spam নয়) = 1 − 0.7 × 0.7 = 0.51`। আর সত্যি class-এর probability 0.3 হলে log loss `−ln(0.3) ≈ 1.204`।

## কোড

```python
import math

def mean(v):
    return sum(v) / len(v)

def variance(v):
    m = mean(v)
    return mean([(x - m) ** 2 for x in v])

marks = [4, 6, 8, 10, 12]
m, var = mean(marks), variance(marks)
print(m, var, round(math.sqrt(var), 3))
print([round((x - m) / math.sqrt(var), 3) for x in marks])
print(mean([e ** 2 for e in [-2, -3]]))
print(30 / 100, round(1 - 0.7 * 0.7, 2), round(-math.log(0.3), 3))
```

```text
# output:
8.0 8.0 2.828
[-1.414, -0.707, 0.0, 0.707, 1.414]
6.5
0.3 0.51 1.204
```

## মনে রাখার সারকথা

- Mean কেন্দ্র দেখায়; variance (আর std) ছড়ানো দেখায়, deviation-কে square করে।
- MSE = error-এর square-এর mean; log loss-এ আছে probability-র `−ln`।
- Probability: count ÷ মোট; `1 − p` হলো "ঘটবে না"; independent ঘটনার গুণ।

## নিজে করো

১. `[2, 4, 9]`-এর mean কত? প্রতিটা deviation লিখে যোগফল দেখাও।

২. `[2, 4, 6, 8]`-এর variance আর std বের করো।

৩. একটা model-এর error `[1, −2, 2]`। MSE কত?

৪. 200 জন রোগীর 50 জন অসুস্থ। `P(অসুস্থ)`, `P(সুস্থ)` কত? দুজন আলাদা রোগী (independent) দুজনই অসুস্থ হওয়ার probability কত?

৫. `[10, 20, 30]`-কে standardize করো (mean বাদ, std দিয়ে ভাগ; variance-এ n দিয়ে ভাগ)।

৬. `[1, 1, 1, 1, 100]`-এর mean কত? এটা কি তালিকার "সাধারণ" মান? এই ধারণা MSE-র সঙ্গে কীভাবে মেলে?

৭. তিনটা class-এর probability `[0.2, 0.5, ?]`। অজানাটা কত? আর সত্যি class-এর probability যদি 0.25 হয়, log loss কত?

<details>
<summary>উত্তর</summary>

১. Mean `(2 + 4 + 9) / 3 = 5`। Deviation `[−3, −1, 4]`, যোগফল `0`।

২. Mean 5; deviation `[−3, −1, 1, 3]`; square `[9, 1, 1, 9]`; variance `20 / 4 = 5`; std `√5 ≈ 2.236`।

৩. Square `[1, 4, 4]`, mean `9 / 3 = 3`।

৪. `P(অসুস্থ) = 50 / 200 = 0.25`, `P(সুস্থ) = 0.75`। দুজনই অসুস্থ: `0.25 × 0.25 = 0.0625`।

৫. Mean 20; deviation `[−10, 0, 10]`; variance `(100 + 0 + 100) / 3 ≈ 66.67`; std `≈ 8.165`; ফল `[−1.225, 0, 1.225]`।

৬. Mean `104 / 5 = 20.8`। কিন্তু তালিকার চারটা সংখ্যা 1; একটা বড় মানই mean-কে টেনে নিয়েছে। MSE-তেও একই: squared error হওয়ায় একটা বড় ভুল পুরো গড়কে অনেক বাড়িয়ে দিতে পারে।

৭. যোগফল 1 হতে হবে: `1 − 0.2 − 0.5 = 0.3`। Log loss `−ln(0.25) ≈ 1.386`।

</details>

## পরের পাঠ

শেষ ভিত্তি হলো derivative ও gradient, যা দিয়ে gradient descent বলে দেয় weight কোন দিকে বদলাবে: [Lecture 04 — Derivative ও gradient-এর অনুশীলন](lecture-04-derivative-and-gradient-practice.md)।
