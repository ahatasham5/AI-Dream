# Lecture 04 — অনেকগুলো Feature ও Dot Product

> আগে যা জানা থাকলে ভালো: [Lecture 03](lecture-03-gradient-descent-training.md) — একটা feature নিয়ে gradient descent, আর [Module 01, Lecture 06](../module-01-ml-fundamentals-and-math-basics/lecture-06-linear-algebra-basics.md) — dot product। এই lecture শেষে পারবে: একাধিক feature থাকলে prediction ও এক ধাপ update হাতে করতে।

[Map-এ অবস্থান](../01-learning-map.md): Linear Regression-এর একই model; শুধু input-এর feature বেড়েছে। Output-এর হিসাব, loss ও update আগের মতোই আলাদা ধাপ।

## সমস্যাটা কী?

বাড়ির দাম শুধু আয়তনে ঠিক হয় না। রুম কয়টা, বাড়ি কত পুরোনো, সেগুলোও দামে প্রভাব ফেলে। শুধু আয়তন দিয়ে অনুমান করলে এই তথ্যগুলো বাদ পড়ে। আমরা চাই একাধিক feature একসঙ্গে ব্যবহার করতে, আর একটা feature-এর জন্য যে `w` ছিল তার জায়গায় প্রতিটা feature-এর জন্য আলাদা weight।

## ধারণাটা সহজ ভাষায়

প্রতিটা feature-এর নিজের weight থাকে। তিনটা feature `x₁, x₂, x₃` (আয়তন, রুম, বয়স) থাকলে:

`ŷ = x₁ × w₁ + x₂ × w₂ + x₃ × w₃ + b`

প্রতিটা feature-কে তার weight দিয়ে গুণ করে যোগ করার কাজটাই **dot product**। Feature-গুলো একটা vector `x`, weight-গুলো একটা vector `w` হলে সূত্রটা সংক্ষেপে `ŷ = x · w + b`। অনেক বাড়ির feature একটা matrix `X`-এ রাখলে (প্রতি সারি এক বাড়ি), সব অনুমান একসঙ্গে: `ŷ = Xw + b`।

পরিবর্তন শুধু এটুকু: weight-এর সংখ্যা feature-এর সংখ্যার সমান হয়, আর bias সবসময় একটাই।

## ছোট একটা উদাহরণ: Prediction

Feature: আয়তন (হাজার বর্গফুটে), রুম, বয়স (দশকে)। এক বাড়ি `x = [2, 3, 1]`। Weight `w = [10, 5, −2]`, `b = 5`।

```text
2 × 10   = 20
3 × 5    = 15
1 × (−2) = −2
dot product = 33
ŷ = 33 + 5 = 38 লাখ টাকা
```

প্রতিটা weight-এর নিজস্ব অর্থ আছে: রুম 1 বাড়লে অনুমান 5 লাখ বাড়ে, বয়স 1 দশক বাড়লে 2 লাখ কমে (ঋণাত্মক weight মানে ওই feature বাড়লে অনুমান কমে)।

```python
x = [2, 3, 1]
w = [10, 5, -2]
b = 5
dot = sum(xi * wi for xi, wi in zip(x, w))
print(dot, dot + b)
# output:
# 33 38
```

## ছোট একটা উদাহরণ: একটা Update

দুই feature, তিনটা বাড়ি। Data সংখ্যা ছোট রাখতে বানানো; সঠিক সম্পর্ক `y = x₁ + 2 × x₂` (bias 0):

| বাড়ি | x₁ | x₂ | সঠিক y |
|---|---|---|---|
| ১ | 1 | 2 | 5 |
| ২ | 2 | 1 | 4 |
| ৩ | 3 | 3 | 9 |

শুরুতে `w = [0, 0]`, `b = 0`, α = 0.01।

**১. অনুমান ও loss:** তিন অনুমানই 0। Error `[−5, −4, −9]`। MSE = (25 + 16 + 81)/3 = 40.667।

**২. Gradient।** একটা feature-এর সূত্রই, শুধু প্রতিটা weight-এর জন্য নিজের feature দিয়ে গুণ:

```text
g_w₁ = (2/3) × [(−5×1) + (−4×2) + (−9×3)] = (2/3) × (−40) = −26.667
g_w₂ = (2/3) × [(−5×2) + (−4×1) + (−9×3)] = (2/3) × (−41) = −27.333
g_b  = (2/3) × [(−5) + (−4) + (−9)]       = (2/3) × (−18) = −12
```

**৩. Update:** `নতুন = পুরোনো − α × gradient`:

```text
w₁ = 0 − 0.01 × (−26.667) = 0.267
w₂ = 0 − 0.01 × (−27.333) = 0.273
b  = 0 − 0.01 × (−12)     = 0.12
```

নতুন অনুমান `[0.933, 0.927, 1.74]`, error `[−4.067, −3.073, −7.26]`, MSE = **26.23**। 40.667 থেকে কমল। একই ধাপ বারবার চালালে `w` ও `b` সঠিক মান `[1, 2]` ও 0-র দিকে এগোয় (Lecture 06-এ code দিয়ে দেখব)।

লক্ষ করো কী বদলায়নি: error বের করা, MSE, আর `নতুন = পুরোনো − α × gradient` একই। শুধু প্রতিটা weight-এর জন্য আলাদা gradient।

সাবধান: Feature-গুলোর মান খুব আলাদা মাপের হলে (যেমন আয়তন 1000, রুম 3) learning rate বাছা কঠিন হয়ে পড়ে। এজন্য আগে সবাইকে একই মাপে আনা হয় ([Module 01, Lecture 07](../module-01-ml-fundamentals-and-math-basics/lecture-07-probability-and-statistics-basics.md), বিস্তারিত Module 05)।

## মনে রাখার সারকথা

- একাধিক feature হলে প্রতিটার একটা করে weight; অনুমান = dot product + একটাই bias।
- Gradient: `g_wⱼ = (2/n) × Σ (error × feature j)`, `g_b = (2/n) × Σ error`।
- Update-এর নিয়ম একই থাকে; শুধু parameter-এর সংখ্যা বাড়ে।

## নিজে করো

১. `x = [1, 2, 3]`, `w = [2, 0, 1]`, `b = 1` হলে `ŷ` কত?
২. 4টা feature-এর model-এ কয়টা parameter (weight + bias)?
৩. উপরের update-উদাহরণে `g_w₂` নিজে হিসাব করো।

<details><summary>উত্তর</summary>

১. 1×2 + 2×0 + 3×1 = 5; bias যোগে 5 + 1 = 6।

২. 4টা weight + 1টা bias = 5টা parameter।

৩. `g_w₂ = (2/3) × [(−5)×2 + (−4)×1 + (−9)×3] = (2/3) × (−10 − 4 − 27) = (2/3) × (−41) = −27.333`।

</details>

## পরের পাঠ

Training data-র MSE কমানো গেল। কিন্তু model আসলে নতুন data-য় কেমন, সেটা কীভাবে জানব? [Lecture 05](lecture-05-checking-on-new-data.md)-এ।
