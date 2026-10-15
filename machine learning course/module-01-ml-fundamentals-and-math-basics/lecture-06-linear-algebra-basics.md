# Lecture 06 — Linear Algebra: Vector, Dot Product ও Matrix

> আগে যা জানা থাকলে ভালো: শুধু যোগ আর গুণ। [Lecture 03](lecture-03-how-supervised-learning-works.md)-এ দেখেছ model-এর ভেতরে weight (parameter) থাকে। এই lecture শেষে পারবে: vector, dot product ও matrix দিয়ে অনেকগুলো feature থেকে prediction হাতে বের করতে।

[Map-এ অবস্থান](../01-learning-map.md): সাধারণ math-এর উপকরণ। এটা model নয়; model-এর ভেতরের হিসাব সুবিধামতো লেখার ভাষা।

## সমস্যাটা কী?

একটা বাড়ি বর্ণনা করতে তিনটা সংখ্যা লাগে: আয়তন, রুম, বয়স। Model প্রতিটা সংখ্যার জন্য একটা করে weight রাখে। এক বাড়ির দাম অনুমান করতে লিখতে হয়: `আয়তন × w₁ + রুম × w₂ + বয়স × w₃`। এক হাজার বাড়ি হলে এই লাইন এক হাজার বার লিখতে হবে, আর feature দশ হাজার হলে প্রতিটা লাইনও দশ হাজার টুকরো হবে। সংখ্যাগুলো একসঙ্গে রাখার ও একসঙ্গে হিসাব করার একটা সংক্ষিপ্ত উপায় দরকার। এটাই Linear Algebra দেয়।

## ধারণাটা সহজ ভাষায়

**Vector** হলো সংখ্যার একটা তালিকা। একটা বাড়ির তিনটা feature এক vector-এ রাখা যায়: `[2, 3, 1]` (আয়তন 2 হাজার বর্গফুট, রুম 3, বয়স 1 দশক)। Weight-গুলোও একটা vector: `[10, 5, −2]`।

**Dot product:** দুটো সমান লম্বা vector-এর প্রতিটা ঘর জোড়ায় গুণ করে সব গুণফল যোগ করা।

**Matrix** হলো vector-এর একটা table। অনেকগুলো বাড়ি রাখতে প্রতি সারিতে এক বাড়ির feature, প্রতি কলামে এক feature। Matrix-কে weight vector দিয়ে গুণ করলে প্রতিটা সারির dot product একসঙ্গে বেরিয়ে আসে। একেই বলে **matrix multiplication**।

## ছোট একটা উদাহরণ

Weight `w = [10, 5, −2]` (প্রতি হাজার বর্গফুটে 10 লাখ, প্রতি রুমে 5 লাখ, প্রতি দশক বয়সে −2 লাখ), আর bias `b = 5`। (**Bias** হলো একটা আলাদা সংখ্যা যা শেষে যোগ হয়।) দুটো বাড়ি:

| বাড়ি | আয়তন | রুম | বয়স |
|---|---|---|---|
| ১ | 2 | 3 | 1 |
| ২ | 1 | 2 | 4 |

**বাড়ি ১:**

```text
2 × 10 = 20
3 × 5  = 15
1 × (−2) = −2
যোগফল (dot product) = 33
bias যোগ করলে: 33 + 5 = 38
```

**বাড়ি ২:**

```text
1 × 10 = 10
2 × 5  = 10
4 × (−2) = −8
যোগফল = 12, bias যোগে 12 + 5 = 17
```

এখন দুটো বাড়ি একসঙ্গে। Matrix `X` আর weight vector `w`:

```text
X = [[2, 3, 1],      w = [10, 5, −2]
     [1, 2, 4]]

X × w = [33, 12]        (প্রতি সারির dot product)
X × w + b = [38, 17]
```

যা আলাদা করে দুবার হিসাব করতাম, matrix-গুণে এক লাইনে। এক হাজার বাড়ি হলেও লাইন একটাই থাকবে।

## Formula / কোড

এই কাজেরই সংক্ষিপ্ত রূপ: `ŷ = Xw + b`।

- `X`: feature-এর matrix (প্রতি সারি এক উদাহরণ)
- `w`: weight vector
- `b`: bias
- `ŷ` (পড়ে "y-hat"): অনুমান করা উত্তরগুলো

**আকার (shape) মিলিয়ে নেওয়ার নিয়ম:** `X`-এর কলাম সংখ্যা (3) আর `w`-র লম্বা (3) সমান হতে হবে। ফলে একটা vector আসে, যার লম্বা `X`-এর সারি সংখ্যার (2) সমান।

```python
X = [[2, 3, 1], [1, 2, 4]]
w = [10, 5, -2]
b = 5
for row in X:
    dot = sum(x * wi for x, wi in zip(row, w))
    print(dot, dot + b)
# output:
# 33 38
# 12 17
```

Linear Regression ([Module 02](../module-02-linear-regression/README.md)), Logistic Regression ([Module 03](../module-03-logistic-regression/README.md)) আর neural network-এর ভেতরে এই `Xw + b` হিসাবটাই চলে।

## সব model-এ matrix গুণ লাগে না

সব model এভাবে weight × feature করে না। দুটো উদাহরণ:

**Decision Tree** প্রশ্ন করতে করতে এগোয়, যেন nested if–else। যেমন: "আয়তন > 1500 বর্গফুট?" না হলে predict 40 লাখ, হ্যাঁ হলে 70 লাখ (সংখ্যাগুলো শুধু উদাহরণ)। প্রশ্নের শুরুটা **root**, শেষের উত্তরের ঘরগুলো **leaf**। Training-এ data থেকে ঠিক হয় কোন feature আর কোন সীমা দিয়ে ভাগ করলে ভুল কমে; সাধারণ regression tree-তে leaf-এর prediction থাকে ওই leaf-এ পড়া training উত্তরগুলোর গড়। এখানে `Xw + b` নেই।

**K-Means** ([Lecture 04](lecture-04-how-unsupervised-learning-works.md)) দূরত্ব মাপে, গুণ করে না।

সাবধান: **KNN** আর **K-Means** নাম কাছাকাছি হলেও আলাদা। KNN supervised: নতুন point-এর সবচেয়ে কাছের K টা পুরোনো (উত্তর জানা) point দেখে উত্তর বলে। K-Means unsupervised, শুধু দল বানায়। আর Logistic Regression নামে "Regression" থাকলেও সেটা classification-এর model।

## মনে রাখার সারকথা

- Vector = সংখ্যার তালিকা; matrix = vector-এর table।
- Dot product = জোড়ায় গুণ করে যোগ। Matrix × vector = প্রতি সারির dot product একসঙ্গে।
- `ŷ = Xw + b` অনেক উদাহরণের prediction এক লাইনে দেয়; কিন্তু Decision Tree-র মতো কিছু model এটা করে না।

## নিজে করো

১. `[1, 2, 3]` ও `[4, 5, 6]`-এর dot product কত?
২. বাড়ি `[3, 1, 2]`, `w = [10, 5, −2]`, `b = 5` হলে prediction কত?
৩. `X = [[1, 0, 2], [2, 1, 0]]` আর `w = [1, 2, 3]` হলে `Xw` কত? `X`-এর আকার কী আর ফলের লম্বা কত?

<details><summary>উত্তর</summary>

১. 1×4 + 2×5 + 3×6 = 4 + 10 + 18 = 32।

২. 3×10 + 1×5 + 2×(−2) = 30 + 5 − 4 = 31। bias যোগে 31 + 5 = 36।

৩. সারি ১: 1×1 + 0×2 + 2×3 = 7। সারি ২: 2×1 + 1×2 + 0×3 = 4। `Xw = [7, 4]`। `X`-এর আকার 2 সারি × 3 কলাম, `w`-র লম্বা 3 (মিলছে), ফলের লম্বা 2।

</details>

## পরের পাঠ

Model-এর অনুমান বের করতে vector লাগে। ভুল কতটা হলো, সেটা মাপতে লাগে গড় ও ছড়ানোর ধারণা, যেটা [Lecture 07](lecture-07-probability-and-statistics-basics.md)-এ। হাতে অনুশীলনের জন্য [Module 04](../module-04-math-foundations-practice/README.md) পরিকল্পিত আছে।
