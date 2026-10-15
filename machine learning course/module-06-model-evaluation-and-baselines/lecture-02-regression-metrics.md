# Lecture 02 — Regression Metrics: MAE, MSE, RMSE ও R²

> আগে যা জানা থাকলে ভালো: [Baseline](lecture-01-baselines.md) আর Module 02-এর [error ও MSE](../module-02-linear-regression/lecture-02-error-and-mean-squared-error.md)। এই lecture শেষে পারবে: একই prediction থেকে MAE, MSE, RMSE ও R² হাতে বের করতে, আর প্রতিটা কী বলে তা বুঝতে।

## সমস্যাটা কী?

ধরো ৫টা বাড়ির দাম predict করেছ। এখন প্রশ্ন: "model কতটা ভুল করছে?" এক সংখ্যায় এর উত্তর দেওয়ার একাধিক উপায় আছে, আর উপায়ভেদে উত্তরের অর্থও আলাদা। কোনোটা বলে "গড়ে কত লাখ ভুল", কোনোটা বড় ভুলকে বেশি শাস্তি দেয়, কোনোটা বলে "baseline-এর চেয়ে কতটা ভালো"। এই মাপগুলোকে **metric** বলে। কোন metric কী বলে না জানলে ভুল সিদ্ধান্ত হয়।

## ধারণাটা সহজ ভাষায়

সবকিছুর শুরু একই: প্রতিটা বাড়ির **error = prediction − আসল** (Module 02-এর নিয়ম)।

- **MAE (Mean Absolute Error):** প্রতিটা error-এর চিহ্ন ফেলে দিয়ে (পরম মান) গড় নাও। উত্তর target-এর একক-এই আসে। MAE 5.8 মানে "গড়ে প্রায় 5.8 লাখ ভুল"।
- **MSE (Mean Squared Error):** প্রতিটা error-কে square করে গড়। বড় ভুল অনেক বেশি ওজন পায়। কিন্তু একক হয়ে যায় `(লাখ টাকা)²`, তাই সরাসরি পড়া কঠিন।
- **RMSE (Root Mean Squared Error):** MSE-র বর্গমূল। এতে একক আবার লাখ টাকায় ফিরে আসে, কিন্তু বড় ভুলের ওজন থাকে।
- **R² (R-squared):** model-এর ভুলকে "সবসময় গড় বলা" baseline-এর ভুলের সঙ্গে তুলনা করে। `1` মানে নিখুঁত, `0` মানে গড় বলার সমান, ঋণাত্মক মানে গড় বলার চেয়েও খারাপ।

**RMSE vs MAE:** RMSE সবসময় MAE-র সমান বা বড়। দুটোর ফারাক যত বেশি, বুঝবে ততটাই কিছু বড় ভুল আছে। সব error সমান হলে দুটো মান একই।

## ছোট একটা উদাহরণ

৫টা বাড়ি:

| আসল দাম | Prediction | error (pred − আসল) | \|error\| | error² |
|---|---|---|---|---|
| 50 | 55 | 5 | 5 | 25 |
| 60 | 58 | −2 | 2 | 4 |
| 70 | 72 | 2 | 2 | 4 |
| 80 | 75 | −5 | 5 | 25 |
| 100 | 85 | −15 | 15 | 225 |

- **MAE** = (5 + 2 + 2 + 5 + 15) / 5 = 29 / 5 = **5.8**
- **MSE** = (25 + 4 + 4 + 25 + 225) / 5 = 283 / 5 = **56.6**
- **RMSE** = √56.6 = **7.523**

RMSE (7.52) MAE-র (5.8) চেয়ে বেশ বড়। কারণ শেষ বাড়ির `−15` ভুল। ওই বাড়িটা বাদ দিলে চারটার MAE = 14 / 4 = 3.5, RMSE = √(58 / 4) = **3.81**। দুটো এখন কাছাকাছি।

**R²-এর হিসাব:**

1. আসল দামের গড় = (50 + 60 + 70 + 80 + 100) / 5 = **72**। "সবসময় 72 বলা" baseline।
2. Baseline-এর মোট squared error (**SST**): (−22)² + (−12)² + (−2)² + 8² + 28² = 484 + 144 + 4 + 64 + 784 = **1480**।
3. Model-এর মোট squared error (**SSE**): 25 + 4 + 4 + 25 + 225 = **283**।
4. `R² = 1 − SSE / SST = 1 − 283 / 1480 = 0.809`।

অর্থ: model baseline-এর ভুলের প্রায় 81% কমিয়েছে। উল্টোটা দেখতে চাইলে: সবসময় 60 বললে SSE = 100 + 0 + 100 + 400 + 1600 = 2200, R² = 1 − 2200/1480 = **−0.486**। গড়ের চেয়েও খারাপ, তাই ঋণাত্মক।

## Formula / কোড

```text
MAE  = (1/n) × Σ |ŷ − y|
MSE  = (1/n) × Σ (ŷ − y)²
RMSE = √MSE
R²   = 1 − Σ(ŷ − y)² / Σ(y − গড়(y))²
```

`n` হলো উদাহরণের সংখ্যা, `Σ` মানে সবগুলোর যোগফল, `ŷ` prediction, `y` আসল মান।

```python
from math import sqrt

actual    = [50, 60, 70, 80, 100]
predicted = [55, 58, 72, 75, 85]

errors = [p - a for a, p in zip(actual, predicted)]
n = len(actual)
mae = sum(abs(e) for e in errors) / n
mse = sum(e * e for e in errors) / n
rmse = sqrt(mse)

mean_actual = sum(actual) / n
sse = sum(e * e for e in errors)                       # model's squared error
sst = sum((a - mean_actual) ** 2 for a in actual)      # "always guess the mean" squared error
r2 = 1 - sse / sst

print("errors:", errors)
print("MAE =", mae, " MSE =", mse, " RMSE =", round(rmse, 3))
print("mean =", mean_actual, " SSE =", sse, " SST =", sst, " R2 =", round(r2, 3))
```

```text
# output:
# errors: [5, -2, 2, -5, -15]
# MAE = 5.8  MSE = 56.6  RMSE = 7.523
# mean = 72.0  SSE = 283  SST = 1480.0  R2 = 0.809
```

সাবধান: R²-এর baseline হলো **যে data মাপা হচ্ছে তারই আসল মানের গড়** (সাধারণ সংজ্ঞা)। আগের lecture-এর baseline ছিল train-এর গড়। তাই দুটো পুরোপুরি এক নয়, কিন্তু ধারণা একই: সরল অনুমানের সঙ্গে তুলনা।

## কোনটা কখন

| Metric | কখন ভালো |
|---|---|
| MAE | "গড়ে কত ভুল" সহজে বলতে চাইলে; অস্বাভাবিক বড় ভুলে কম বিচলিত হতে চাইলে |
| RMSE | বড় ভুল বিশেষভাবে ক্ষতিকর হলে; একক target-এর মতো রাখতে চাইলে |
| MSE | Training-এ loss হিসেবে (gradient সহজ), তুলনার জন্য নয় সাধারণত |
| R² | বিভিন্ন কাজের model-এর "baseline-এর চেয়ে কতটা ভালো" দেখতে |

## মনে রাখার সারকথা

- MAE = গড় পরম ভুল (একক একই); MSE = গড় বর্গ ভুল; RMSE = MSE-র বর্গমূল (একক আবার একই)।
- RMSE ও MAE-র ফারাক বেশি হলে কিছু বড় ভুল আছে।
- R² = `1 − (model-এর ভুল / গড় বলার ভুল)`; 0 মানে baseline-এর সমান, ঋণাত্মক মানে baseline-এর চেয়ে খারাপ।

## নিজে করো

১. আসল `[10, 20]`, prediction `[12, 17]`। MAE, MSE, RMSE কত?

২. একই data-য় R² কত? (আসল মানের গড় ধরো।)

৩. Model A-র পাঁচটা error সবই 5। Model B-র error `[0, 0, 0, 0, 25]`। দুটোর MAE ও RMSE কত? কোনটায় বড় ভুল আছে?

<details><summary>উত্তর</summary>

১. Error: 12 − 10 = 2, 17 − 20 = −3। MAE = (2 + 3) / 2 = **2.5**। MSE = (4 + 9) / 2 = **6.5**। RMSE = √6.5 = **2.55**।

২. গড় = 15। SST = (10 − 15)² + (20 − 15)² = 25 + 25 = 50। SSE = 4 + 9 = 13। R² = 1 − 13 / 50 = **0.74**।

৩. Model A: MAE = 5, MSE = 25, RMSE = **5**। Model B: MAE = 25 / 5 = **5**, MSE = 625 / 5 = 125, RMSE = √125 = **11.18**। দুজনের MAE সমান, কিন্তু B-র RMSE অনেক বেশি, কারণ B-তে একটা বড় ভুল আছে।

</details>

## পরের পাঠ

এতক্ষণ সংখ্যা predict করার কাজ। Class predict করার কাজে (spam কি না, রোগ আছে কি না) ভুলের মাপ আলাদা। [পরের lecture — Classification Metrics](lecture-03-classification-metrics.md)।
