# Lecture 05 — নতুন Data-তে যাচাই: Train ও Test

> আগে যা জানা থাকলে ভালো: [Lecture 03](lecture-03-gradient-descent-training.md) — training মানে MSE কমানো; আর [Module 01, Lecture 03](../module-01-ml-fundamentals-and-math-basics/lecture-03-how-supervised-learning-works.md)-এর train/test-এর প্রথম ইঙ্গিত। এই lecture শেষে পারবে: data দুই ভাগ করে train MSE ও test MSE আলাদা মাপতে এবং ফল পড়তে।

[Map-এ অবস্থান](../01-learning-map.md): এটা evaluation, অর্থাৎ শেখানো model মাপা। এখানে শুধু প্রথম ধারণা; বিস্তারিত [Module 05](../module-05-data-preparation-and-splits/README.md) ও [Module 06](../module-06-model-evaluation-and-baselines/README.md)-এ।

## সমস্যাটা কী?

Training শেষে training data-য় MSE ছোট দেখে আমরা খুশি হই। কিন্তু model-টা বানানো হয়েছে নতুন, না-দেখা data-র জন্য। যে model শুধু training উদাহরণ মুখস্থ করে নিয়েছে, তার training MSE 0 হতে পারে, অথচ নতুন data-য় সে হাস্যকর রকম ভুল করবে। training MSE দেখে এই ফাঁকি ধরা যায় না।

## ধারণাটা সহজ ভাষায়

সমাধান: হাতের data শুরুতেই দুই ভাগ করা।

- **Train set:** model এই অংশ দেখে শেখে (gradient descent এটার ওপরই চলে)।
- **Test set:** এই অংশ training-এর সময় আড়ালে রাখা হয়। training শেষে শুধু মাপার জন্য ব্যবহার হয়।

তারপর MSE দুই জায়গায় মাপা হয়: **train MSE** আর **test MSE**। Test MSE হলো "নতুন data-য় model কেমন করবে"-র সবচেয়ে কাছাকাছি অনুমান।

**নিয়ম:** test data দেখে কখনো `w` বা `b` বদলানো চলবে না। বদলালে test data আর নতুন data থাকে না; ফলাফল আমাদের নিজের পছন্দ-করা হয়ে যায়।

## ছোট একটা উদাহরণ

6টা data point, প্রায় `y = 2x + 1`-এর কাছাকাছি, একটু noise সহ:

| x | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| y | 3.2 | 4.8 | 7.3 | 8.9 | 11.2 | 12.8 |

সহজ রাখতে প্রথম চারটা (x = 1–4) train, শেষ দুটো (x = 5, 6) test। Train data দিয়ে gradient descent চালালে (code পরের lecture-এ) পাওয়া যায় `w = 1.96`, `b = 1.15`।

**Train MSE:**

| x | y | অনুমান | error | error² |
|---|---|---|---|---|
| 1 | 3.2 | 3.11 | −0.09 | 0.0081 |
| 2 | 4.8 | 5.07 | 0.27 | 0.0729 |
| 3 | 7.3 | 7.03 | −0.27 | 0.0729 |
| 4 | 8.9 | 8.99 | 0.09 | 0.0081 |

train MSE = 0.162 / 4 = **0.0405**।

**Test MSE** (model এই দুটো কখনো দেখেনি):

| x | y | অনুমান | error | error² |
|---|---|---|---|---|
| 5 | 11.2 | 10.95 | −0.25 | 0.0625 |
| 6 | 12.8 | 12.91 | 0.11 | 0.0121 |

test MSE = 0.0746 / 2 = **0.0373**।

দুটো MSE কাছাকাছি এবং দুটোই ছোট। অর্থাৎ model নতুন data-য়ও ভালো। (Test set-এ মাত্র দুটো point, তাই test MSE এখানে train-এর চেয়ে সামান্য কম হয়েছে ভাগ্যক্রমে; এটা সাধারণ নিয়ম নয়।)

**তুলনা: মুখস্থ-করা model।** এমন model বানাই যে, নতুন `x` এলে training-এর সবচেয়ে কাছের `x`-এর `y` হুবহু বলে দেয়। Train data-য় সে সবসময় ঠিক। কিন্তু test-এ `x = 5` ও `6` দুটোর কাছেই সবচেয়ে কাছের train point `x = 4`, তাই সে দুবারই 8.9 বলে। Error 8.9 − 11.2 = −2.3 আর 8.9 − 12.8 = −3.9। Test MSE = (5.29 + 15.21)/2 = 10.25।

## কোড

```python
data = [(1, 3.2), (2, 4.8), (3, 7.3), (4, 8.9), (5, 11.2), (6, 12.8)]
train, test = data[:4], data[4:]          # প্রথম 4টা শেখার জন্য, শেষ 2টা পরীক্ষার জন্য
w, b = 1.96, 1.15                          # train data থেকে শেখা মান

def mse(rows, predict):
    return sum((predict(x) - y) ** 2 for x, y in rows) / len(rows)

def linear(x):
    return w * x + b

def memorizer(x):                          # সবচেয়ে কাছের train x-এর y হুবহু বলে দেয়
    return min(train, key=lambda row: abs(row[0] - x))[1]

print("linear     train:", round(mse(train, linear), 4), " test:", round(mse(test, linear), 4))
print("memorizer  train:", round(mse(train, memorizer), 4), " test:", round(mse(test, memorizer), 4))
# output:
# linear     train: 0.0405  test: 0.0373
# memorizer  train: 0.0  test: 10.25
```

## ফল পড়ার ছক

| Train MSE | Test MSE | সম্ভাব্য অর্থ |
|---|---|---|
| ছোট | ছোট, কাছাকাছি | model নতুন data-তেও ভালো |
| ছোট | অনেক বড় | **overfitting**: মুখস্থ করেছে, নতুন data-য় পারছে না (উপরের memorizer) |
| বড় | বড় | **underfitting**: model যথেষ্ট শেখেনি |

সাবধান: এখানে সহজ রাখতে শেষের দুটো point test নিয়েছি। বাস্তবে সাধারণত এলোমেলোভাবে ভাগ করা হয়, বা সময় ধরে (আগের data train, পরেরটা test)। তাছাড়া 6টা point খুবই কম, ফলের ওপর বেশি ভরসা করা যায় না। আরও যত্নের কথা Module 05–07-এ আসবে, যেমন tuning-এর জন্য তৃতীয় একটা "validation set"।

## মনে রাখার সারকথা

- Data শুরুতেই train ও test-এ ভাগ করো; test set দেখে model বদলাবে না।
- Train MSE দেখায় model কত ভালো শিখেছে; test MSE দেখায় নতুন data-য় কেমন করবে।
- Train MSE ছোট কিন্তু test MSE বড় হলে overfitting।

## নিজে করো

১. `w = 1.96`, `b = 1.15` দিয়ে `x = 5`-এর অনুমান কত? সঠিক y 11.2 হলে error ও error² কত?
২. কোনো model-এর train MSE 0.5, test MSE 8। কী বোঝা যায়?
৩. কেন test data দেখে `w` বদলালে test MSE-এর ওপর আর ভরসা করা যায় না?

<details><summary>উত্তর</summary>

১. 1.96 × 5 + 1.15 = 9.8 + 1.15 = 10.95। Error 10.95 − 11.2 = −0.25। error² = 0.0625।

২. Train-এ ভালো, test-এ অনেক খারাপ: overfitting-এর লক্ষণ। Model training উদাহরণগুলো মুখস্থ করেছে, নতুন data-য় পারছে না।

৩. তাহলে model-কে test data দেখে দেখে মানিয়ে নেওয়া হয়েছে, ফলে আর সেটা "না-দেখা data" থাকে না। test MSE তখন নতুন data-র আসল অবস্থা বলে না, শুধু ওই নির্দিষ্ট দুটো point-এর সঙ্গে মিলের মাপ দেয়।

</details>

## পরের পাঠ

এবার সব মিলিয়ে নিজে প্রোগ্রাম লিখব: prediction, MSE, gradient descent ও test MSE, কোনো library ছাড়া। [Lecture 06](lecture-06-linear-regression-in-python.md)-এ।
