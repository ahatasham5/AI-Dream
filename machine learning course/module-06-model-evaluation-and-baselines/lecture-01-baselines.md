# Lecture 01 — Baseline: model ভালো কি না বোঝার সবচেয়ে সহজ মাপকাঠি

> আগে যা জানা থাকলে ভালো: [Train, Validation ও Test](../module-05-data-preparation-and-splits/lecture-03-train-validation-test-split.md) (এই lecture-এ ওই একই train/validation data আবার ব্যবহার হবে)। এই lecture শেষে পারবে: regression ও classification-এর baseline বানাতে, আর model-এর ফলকে baseline-এর সঙ্গে তুলনা করতে।

## সমস্যাটা কী?

ধরো তোমার model-এর validation-এ গড় ভুল 4.69 লাখ টাকা। এটা ভালো, না খারাপ? সংখ্যাটা একা দেখে বলা যায় না। যদি দেখা যেত কোনো ভাবনা-চিন্তা ছাড়া একটা সংখ্যা বললেও ভুল 5 লাখই হয়, তাহলে 4.69 তেমন কিছু নয়। আবার ভুল 19 হলে 4.69 দারুণ। তুলনার জন্য একটা সহজ মাপকাঠি লাগে।

## ধারণাটা সহজ ভাষায়

**Baseline** হলো সবচেয়ে সহজ, কোনো শেখা ছাড়া নিয়ম, যা দিয়ে prediction করা যায়। তোমার model-কে অন্তত এই নিয়মের চেয়ে ভালো হতে হবে। নইলে model বানানোর পরিশ্রম বৃথা। ML team-রা প্রতিটা প্রকল্পে প্রথমেই baseline বানায়।

দুটো সাধারণ baseline:

- **Regression:** training data-র সব target-এর **গড় (mean)** সবাইকে বলে দাও। (outlier থাকলে median-ও চলে।)
- **Classification:** training data-তে যে class সবচেয়ে বেশি, সব সময় সেটাই বলো। একে **majority class baseline** বলে।

ভুল মাপতে এখানে সবচেয়ে সহজ মাপ ধরছি: **গড় ভুল** = প্রতিটা prediction-এ `|prediction − আসল|` বের করে তাদের গড়। এটার আনুষ্ঠানিক নাম MAE, [পরের lecture](lecture-02-regression-metrics.md)-এ বিস্তারিত।

আর Classification-এ মাপ হিসেবে **accuracy**: কত শতাংশ prediction ঠিক।

## ছোট একটা উদাহরণ

### Regression

Module 05-এর data: train-এর ৬টা বাড়ি `(আয়তন, দাম)`: `(900,52), (1300,75), (1400,70), (800,40), (1700,96), (1200,58)`। Validation: `(1500,88), (1000,50)`। Test-কে এখন ছুঁইনি।

**Baseline।** Train-এর দামের গড় = (52 + 75 + 70 + 40 + 96 + 58) / 6 = 391 / 6 = **65.17**। Validation-এর দুটো বাড়ির জন্যই সে বলবে 65.17।

- `(1500, 88)`: |65.17 − 88| = 22.83
- `(1000, 50)`: |65.17 − 50| = 15.17
- গড় ভুল = (22.83 + 15.17) / 2 = **19.0**

**Linear model।** Train data থেকে `ŷ = w × আয়তন + b` শেখানো হলে (এখানে gradient descent-এর শেষ ফলের সমান সমাধানটা সরাসরি সূত্রে বের করেছি) পাওয়া যায় `w ≈ 0.0572`, `b ≈ −4.47`। Validation-এ:

- 1500 → 81.4, আসল 88, ভুল 6.6
- 1000 → 52.8, আসল 50, ভুল 2.8
- গড় ভুল ≈ **4.69** (কোড-এ রাউন্ড না করা সংখ্যা ব্যবহার হয়েছে, তাই হাতের হিসাবে সামান্য তফাত হতে পারে)

তুলনা: baseline 19.0, model 4.69। Model baseline-এর চেয়ে প্রায় চার গুণ ভালো। এখন 4.69 সংখ্যাটার একটা মানে আছে।

### Classification

১০টা ইমেইল: ৮টা সাধারণ (`ok`), ২টা `spam`। Baseline: সব সময় `ok` বলো। ৮টা ঠিক, accuracy = 8 / 10 = **0.8**। অর্থাৎ কেউ যদি বলে "আমার spam-filter-এর accuracy 80%", এতে আনন্দের কিছু নেই; কোনো কিছু না শিখেও 80% পাওয়া যায়। (কেন এই accuracy বিভ্রান্ত করে, তা [Lecture 04](lecture-04-threshold-imbalance-and-metric-choice.md)-এ।)

## Formula / কোড

```python
train = [(900, 52), (1300, 75), (1400, 70), (800, 40), (1700, 96), (1200, 58)]
val = [(1500, 88), (1000, 50)]

def avg_error(pairs, predict):
    return sum(abs(predict(a) - p) for a, p in pairs) / len(pairs)

# baseline: always answer with the mean price of the training houses
mean_price = sum(p for _, p in train) / len(train)
print("baseline answer:", round(mean_price, 2))
print("baseline error :", round(avg_error(val, lambda a: mean_price), 2))

# linear model w*x + b, fitted on train (least squares)
n = len(train)
mx = sum(a for a, _ in train) / n
my = mean_price
w = sum((a - mx) * (p - my) for a, p in train) / sum((a - mx) ** 2 for a, _ in train)
b = my - w * mx
print("w =", round(w, 4), "b =", round(b, 2))
print("predictions:", [round(w * a + b, 1) for a, _ in val])
print("linear error   :", round(avg_error(val, lambda a: w * a + b), 2))

# classification baseline: always predict the most common class
labels = ["ok"] * 8 + ["spam"] * 2
majority = max(set(labels), key=labels.count)
print("majority class:", majority, "accuracy:", labels.count(majority) / len(labels))
```

```text
# output:
# baseline answer: 65.17
# baseline error : 19.0
# w = 0.0572 b = -4.47
# predictions: [81.4, 52.8]
# linear error   : 4.69
# majority class: ok accuracy: 0.8
```

সাবধান: baseline-এর গড়, majority class — সবই **train data** থেকে নেওয়া। Validation বা test থেকে নিলে সেটা [leakage](../module-05-data-preparation-and-splits/lecture-04-data-leakage.md)।

## মনে রাখার সারকথা

- Model-এর ফল একা দেখে বোঝা যায় না; সবচেয়ে সহজ নিয়মের (baseline) সঙ্গে তুলনা করতে হয়।
- Regression-এর baseline: train-এর গড় (বা median); classification-এর: সবচেয়ে বেশি class।
- Model baseline-কে হারাতে না পারলে সেই model এখনো কাজের নয়।

## নিজে করো

১. Train-এর দাম `[40, 50, 60, 70]`। Baseline কত বলে? Validation-এর একটা বাড়ির আসল দাম 65 হলে baseline-এর ভুল কত?

২. Train-এর দাম `[40, 50, 60, 100]`। Mean ও median baseline কত? আসল দাম 55 হলে কোনটার ভুল কম?

৩. ২০টা ইমেইলে ১৫টা `ok`, ৫টা `spam`। Majority baseline-এর accuracy কত? কোনো model-এর accuracy 0.80 হলে সেটা baseline-এর চেয়ে কত ভালো, আর তা কয়টা ইমেইলের তফাত?

<details><summary>উত্তর</summary>

১. গড় = (40 + 50 + 60 + 70) / 4 = **55**। ভুল |55 − 65| = **10**।

২. Mean = (40 + 50 + 60 + 100) / 4 = **62.5**। Median: মাঝখানে 50 ও 60, তাই **55**। আসল 55 হলে mean-এর ভুল 7.5, median-এর ভুল 0। এখানে **median**-এর ভুল কম (100 নামের বড় মানটা mean-কে টেনে বাড়িয়েছে)।

৩. Baseline accuracy = 15 / 20 = **0.75**। Model 0.80 মানে ২০টার ১৬টা ঠিক; baseline-এর ১৫টা ঠিক। তফাত মাত্র **৫ শতাংশ-পয়েন্ট, ১টা ইমেইল**।

</details>

## পরের পাঠ

আমরা এখানে "গড় ভুল" দিয়ে তুলনা করেছি। কিন্তু ভুল মাপার আরও পদ্ধতি আছে, আর প্রতিটার আলাদা স্বভাব। [পরের lecture — Regression Metrics](lecture-02-regression-metrics.md)-এ MAE, MSE, RMSE ও R²।
