# Lecture 05 — নতুন input-এর prediction আর পুরো script

> আগে যা জানা থাকলে ভালো: [Lecture 02 — preprocessing](lecture-02-inspect-split-preprocess.md) আর [Lecture 04 — validation ও test](lecture-04-validation-error-analysis-final-test.md)। এই lecture শেষে পারবে: নতুন একটা ফ্ল্যাটের ভাড়া train-এর শেখা মান দিয়েই বলতে, আর পুরো project একটা script হিসেবে চালাতে।

## সমস্যাটা কী?

Model train হয়েছে, কিন্তু কেউ এসে জিজ্ঞেস করল: "৯০০ বর্গফুট, ২ ঘরের ফ্ল্যাটের ভাড়া কত?" ৯০০ আর ২ সরাসরি model-এ দিলে ভুল ফল আসবে, কারণ model scale করা মান (`−0.5`, `0.1` ধরনের) দিয়ে শিখেছে। নতুন input-কেও ঠিক একই preprocessing পার করাতে হয়। প্রতিটা প্রকৃত ML ব্যবহারে (app, website বা report) এই ধাপটা সবচেয়ে বেশি ভুল হয়।

## ধারণাটা সহজ ভাষায়

Train শেষে আমরা শুধু weight আর bias নিয়ে বসে নেই। Model ঠিকমতো চালাতে এই সবগুলো একসঙ্গে লাগে:

- `w₁, w₂, b`: শেখা weight আর bias
- `size` আর `rooms`-এর **train-এর গড় ও std**: scale করার জন্য
- `rooms`-এর **train-এর median**: `rooms` অজানা থাকলে ভরার জন্য

নতুন input-এর পথ:

1. `rooms` ফাঁকা থাকলে train-এর median বসাও।
2. Train-এর গড় আর std দিয়ে scale করো। **নতুন করে গড় বের করা যাবে না**: একটাই সারির গড় সেই সারিই, আর ওটা train-এর গড় নয়।
3. Model-এর output বের করার হিসাব (`w₁ × size′ + w₂ × rooms′ + b`) চালাও।

এই পথে target নেই, loss নেই, update-ও নেই। Prediction-এর সময় শুধু শেখা মান স্থির রেখে output বের করা হয়।

**সীমার বাইরের input নিয়ে সাবধান:** train-এর সবচেয়ে বড় ফ্ল্যাট ছিল ১৩১৯ বর্গফুট। ৩০০০ বর্গফুটের ফ্ল্যাট model কখনো দেখেনি। রেখা তবু একটা সংখ্যা দেবে, কিন্তু সেটা ভরসার মতো নয়। বাস্তব সিস্টেমে input train-এর সীমার ভেতরে কি না, আগে পরীক্ষা করা হয়।

## ছোট একটা উদাহরণ

নতুন ফ্ল্যাট: `size = 900`, `rooms = 2`। Train-এর মান: `size` গড় `872.08`, std `271.82`; `rooms` গড় `2.5`, std `0.91`। Weight `w₁ = 2.171`, `w₂ = 2.181`, `b = 17.004`।

- Scale: `size′ = (900 − 872.08)/271.82 ≈ 0.103`, `rooms′ = (2 − 2.5)/0.91 ≈ −0.55`
- Prediction `= 17.004 + 2.171 × 0.103 + 2.181 × (−0.55) = 17.004 + 0.224 − 1.200 ≈ 16.03`

অর্থাৎ প্রায় `16.0` হাজার টাকা। (Python-এ আরও বেশি দশমিক নিয়ে একই `16.0` আসে।)

## কোড

আগের lecture-গুলোর code-এর নিচে বসাও। একটা ফাংশন, যা `size` আর (ঐচ্ছিক) `rooms` নিয়ে ভাড়া বলে:

```python
def predict_rent(size, rooms=None):
    if rooms is None:                            # অজানা হলে train-এর median
        rooms = rooms_median
    x = [(size - means[0]) / stds[0], (rooms - means[1]) / stds[1]]   # train-এর mean/std দিয়েই scale
    return predict(w, b, x)

for size, rooms in ((900, 2), (900, 3), (1200, 4), (900, None)):
    print(f"size={size}, rooms={rooms}: ভাড়া ≈ {predict_rent(size, rooms):.1f} হাজার টাকা")

# output:
# size=900, rooms=2: ভাড়া ≈ 16.0 হাজার টাকা
# size=900, rooms=3: ভাড়া ≈ 18.4 হাজার টাকা
# size=1200, rooms=4: ভাড়া ≈ 23.2 হাজার টাকা
# size=900, rooms=None: ভাড়া ≈ 18.4 হাজার টাকা
```

পড়ার নিয়ম:

- `(900, 2)` → `16.0`, হাতে-হিসাবের সঙ্গে মিলল।
- `(900, 3)` → `18.4`: একটা ঘর বেশি হলে ভাড়া প্রায় `2.4` বাড়ে।
- `(900, None)`: `rooms` অজানা, তাই median `3` বসেছে। ফল `18.4`, `(900, 3)`-এর সমান।

সীমার পরীক্ষা:

```python
lo, hi = min(r[0] for r in train), max(r[0] for r in train)
print("train-এ size-এর সীমা:", lo, "থেকে", hi)
print(f"size=3000: ≈ {predict_rent(3000, 4):.1f} (সীমার বাইরে, ভরসা করা যায় না)")

# output:
# train-এ size-এর সীমা: 448 থেকে 1319
# size=3000: ≈ 37.6 (সীমার বাইরে, ভরসা করা যায় না)
```

৩০০০ বর্গফুটে `37.6`-এর মতো একটা সংখ্যা এসেছে, যা dataset-এর সর্বোচ্চ ভাড়ারও (`24.3`) অনেক ওপরে। ফাংশনটা তবু উত্তর দিচ্ছে, কারণ model সীমা জানে না। এমন input-এ সতর্কবার্তা দেওয়া বা প্রত্যাখ্যান করা project-এর দায়িত্ব।

## পুরো script

পাঁচটা lecture-এর code একসঙ্গে। একটা file-এ (যেমন `rent_project.py`) রেখে `python3 rent_project.py` চালালে নিচের output-ই আসবে (Python 3.12-এ চালানো)। প্রতিটা `# ----------` লাইন একেকটা lecture-এর অংশ।

```python
import random, math, statistics

# ---------- Lecture 01: সমস্যা ও dataset ----------
random.seed(42)                                  # seed স্থির, তাই প্রতিবার একই data
rows = []                                        # প্রতিটা সারি: [size, rooms, rent]
for _ in range(40):
    size = random.randint(400, 1400)                                   # বর্গফুট
    rooms = max(1, min(4, round(size / 350 + random.gauss(0, 0.5))))   # ঘর (১ থেকে ৪)
    rent = 3 + 0.010 * size + 2.0 * rooms + random.gauss(0, 1.2)       # ভাড়া, হাজার টাকা
    rows.append([size, rooms, round(rent, 1)])
rows[7][1] = None                                # একটা ঘরের সংখ্যা অজানা, বাস্তব data-র মতো

print("সারির সংখ্যা:", len(rows))
for r in rows[:5]:
    print(r)

# ---------- Lecture 02: পরিদর্শন, ভাগ করা, প্রস্তুতি ----------
missing = [i for i, r in enumerate(rows) if None in r]
print("missing আছে এমন সারি:", missing)
for name, j in (("size", 0), ("rooms", 1), ("rent", 2)):
    vals = [r[j] for r in rows if r[j] is not None]
    print(f"{name}: min={min(vals)} max={max(vals)} mean={sum(vals) / len(vals):.2f}")

random.shuffle(rows)                             # আগে এলোমেলো করো, তারপর কাটো
train, val, test = rows[:24], rows[24:32], rows[32:]
print("train/val/test:", len(train), len(val), len(test))
print("missing সারি কোন ভাগে: train =", sum(None in r for r in train),
      " val =", sum(None in r for r in val), " test =", sum(None in r for r in test))

# শুধু train থেকে শেখা মান; val/test-এ এটাই বসবে
rooms_median = statistics.median([r[1] for r in train if r[1] is not None])
print("train-এর rooms median:", rooms_median)

def fill(rs):
    return [[s, rooms_median if rm is None else rm, y] for s, rm, y in rs]

train, val, test = fill(train), fill(val), fill(test)

means = [sum(r[j] for r in train) / len(train) for j in (0, 1)]
stds = [math.sqrt(sum((r[j] - means[j]) ** 2 for r in train) / len(train)) for j in (0, 1)]
print("train mean:", [round(m, 2) for m in means], " std:", [round(s, 2) for s in stds])

def scale(rs):                                   # (মান − mean) / std; target y আলাদা
    return [[(r[j] - means[j]) / stds[j] for j in (0, 1)] for r in rs], [r[2] for r in rs]

Xtr, ytr = scale(train)
Xva, yva = scale(val)
Xte, yte = scale(test)
print("train-এর প্রথম সারি:", train[0][:2], "-> scaled:", [round(v, 2) for v in Xtr[0]])

# ---------- Lecture 03: baseline ও Linear Regression ----------
def mae(preds, ys):
    return sum(abs(p - y) for p, y in zip(preds, ys)) / len(ys)

def rmse(preds, ys):
    return math.sqrt(sum((p - y) ** 2 for p, y in zip(preds, ys)) / len(ys))

mean_rent = sum(ytr) / len(ytr)                  # baseline: সবার জন্য train-এর গড় ভাড়া
base_val = [mean_rent] * len(yva)
print(f"baseline (সবার জন্য গড় {mean_rent:.2f}): val MAE={mae(base_val, yva):.2f}  RMSE={rmse(base_val, yva):.2f}")

def predict(w, b, x):
    return sum(wi * xi for wi, xi in zip(w, x)) + b

w, b, lr = [0.0, 0.0], 0.0, 0.1
n = len(Xtr)
for step in range(1, 301):
    errs = [predict(w, b, x) - y for x, y in zip(Xtr, ytr)]
    g_w = [2 / n * sum(e * x[j] for e, x in zip(errs, Xtr)) for j in range(2)]
    g_b = 2 / n * sum(errs)
    w = [wi - lr * g for wi, g in zip(w, g_w)]
    b = b - lr * g_b
    if step in (1, 10, 50, 300):
        print(f"step {step:>3}: train MSE={sum(e * e for e in errs) / n:.3f}")
print("weights:", [round(v, 3) for v in w], " bias:", round(b, 3))

# ---------- Lecture 04: validation, error analysis, final test ----------
tr_pred = [predict(w, b, x) for x in Xtr]
va_pred = [predict(w, b, x) for x in Xva]
print(f"model    train RMSE={rmse(tr_pred, ytr):.2f}   val MAE={mae(va_pred, yva):.2f}  RMSE={rmse(va_pred, yva):.2f}")
print(f"baseline                    val MAE={mae(base_val, yva):.2f}  RMSE={rmse(base_val, yva):.2f}")

print("গড় error (prediction − actual):", round(sum(p - y for p, y in zip(va_pred, yva)) / len(yva), 2))
print("size rooms  actual  predicted  error")
for r, p in sorted(zip(val, va_pred), key=lambda t: -abs(t[1] - t[0][2])):
    print(f"{r[0]:>4} {r[1]:>5.0f} {r[2]:>7.1f} {p:>10.1f} {p - r[2]:>+7.1f}")

te_pred = [predict(w, b, x) for x in Xte]       # test: শুধু এই একবার
base_te = [mean_rent] * len(yte)
print(f"test: model MAE={mae(te_pred, yte):.2f} RMSE={rmse(te_pred, yte):.2f} | baseline MAE={mae(base_te, yte):.2f} RMSE={rmse(base_te, yte):.2f}")

# ---------- Lecture 05: নতুন input-এর prediction ----------
def predict_rent(size, rooms=None):
    if rooms is None:                            # অজানা হলে train-এর median
        rooms = rooms_median
    x = [(size - means[0]) / stds[0], (rooms - means[1]) / stds[1]]   # train-এর mean/std দিয়েই scale
    return predict(w, b, x)

for size, rooms in ((900, 2), (900, 3), (1200, 4), (900, None)):
    print(f"size={size}, rooms={rooms}: ভাড়া ≈ {predict_rent(size, rooms):.1f} হাজার টাকা")

lo, hi = min(r[0] for r in train), max(r[0] for r in train)
print("train-এ size-এর সীমা:", lo, "থেকে", hi)
print(f"size=3000: ≈ {predict_rent(3000, 4):.1f} (সীমার বাইরে, ভরসা করা যায় না)")

# output:
# সারির সংখ্যা: 40
# [1054, 4, 22.8]
# [650, 2, 15.4]
# [1092, 3, 18.4]
# [1004, 3, 19.2]
# [623, 2, 14.8]
# missing আছে এমন সারি: [7]
# size: min=448 max=1347 mean=899.38
# rooms: min=1 max=4 mean=2.67
# rent: min=9.0 max=24.3 mean=17.57
# train/val/test: 24 8 8
# missing সারি কোন ভাগে: train = 0  val = 0  test = 1
# train-এর rooms median: 3.0
# train mean: [872.08, 2.5]  std: [271.82, 0.91]
# train-এর প্রথম সারি: [650, 2] -> scaled: [-0.82, -0.55]
# baseline (সবার জন্য গড় 17.00): val MAE=4.45  RMSE=4.94
# step   1: train MSE=307.684
# step  10: train MSE=6.585
# step  50: train MSE=1.371
# step 300: train MSE=1.371
# weights: [2.171, 2.181]  bias: 17.004
# model    train RMSE=1.17   val MAE=0.75  RMSE=0.78
# baseline                    val MAE=4.45  RMSE=4.94
# গড় error (prediction − actual): -0.38
# size rooms  actual  predicted  error
#  671     2    15.2       14.2    -1.0
#  722     2    15.6       14.6    -1.0
# 1225     4    24.3       23.4    -0.9
# 1335     4    23.5       24.3    +0.8
# 1054     4    22.8       22.0    -0.8
# 1347     3    21.3       22.0    +0.7
#  650     2    14.5       14.0    -0.5
# 1121     4    23.0       22.6    -0.4
# test: model MAE=0.92 RMSE=1.28 | baseline MAE=4.01 RMSE=4.46
# size=900, rooms=2: ভাড়া ≈ 16.0 হাজার টাকা
# size=900, rooms=3: ভাড়া ≈ 18.4 হাজার টাকা
# size=1200, rooms=4: ভাড়া ≈ 23.2 হাজার টাকা
# size=900, rooms=None: ভাড়া ≈ 18.4 হাজার টাকা
# train-এ size-এর সীমা: 448 থেকে 1319
# size=3000: ≈ 37.6 (সীমার বাইরে, ভরসা করা যায় না)
```

## project-এর ধাপ আর কোন module কী দিয়েছে

| ধাপ | এই script-এ | বিস্তারিত |
|---|---|---|
| সমস্যা, dataset | Lecture 01 | [Module 06: Baseline](../module-06-model-evaluation-and-baselines/lecture-01-baselines.md) |
| পরিদর্শন, split | Lecture 02 | [Module 05: Split](../module-05-data-preparation-and-splits/lecture-03-train-validation-test-split.md), [Leakage](../module-05-data-preparation-and-splits/lecture-04-data-leakage.md) |
| Scaling | Lecture 02 | [Module 05: Scaling](../module-05-data-preparation-and-splits/lecture-02-encoding-and-scaling.md) |
| Linear Regression, gradient descent | Lecture 03 | [Module 02](../module-02-linear-regression/lecture-03-gradient-descent-training.md) |
| MAE, RMSE | Lecture 03–04 | [Module 06: Regression metric](../module-06-model-evaluation-and-baselines/lecture-02-regression-metrics.md) |
| Overfitting-এর পরীক্ষা, error analysis | Lecture 04 | [Module 07](../module-07-generalization-and-overfitting/README.md) |

এই project একটা ছোট প্রতিলিপি। আরও বড় data বা আরও feature এলে নতুন দিক আসবে: [cross-validation](../module-06-model-evaluation-and-baselines/lecture-05-cross-validation-and-final-test.md), [regularization](../module-07-generalization-and-overfitting/lecture-03-regularization-and-early-stopping.md) আর feature বাছাই। Linear Regression-এর জায়গায় অন্য model (যেমন neural network) বসালেও এই কাঠামো একই থাকে: data প্রস্তুত, split, train, validation, test, নতুন input।

## মনে রাখার সারকথা

- নতুন input-কে train-এর মতোই preprocessing করাতে হয়, আর সেই মান (গড়, std, median) train থেকেই আসে।
- Prediction-এর পথে শুধু output বের করা হয়; loss বা update নেই।
- Input train-এর সীমার বাইরে গেলে model-এর ফলে ভরসা করা যায় না।

## নিজে করো

১. নতুন ফ্ল্যাট `size = 1000`, `rooms = 3`। উপরের `872.08, 271.82, 2.5, 0.91, w₁ = 2.171, w₂ = 2.181, b = 17.004` ব্যবহার করে ভাড়া বের করো।

২. নতুন ফ্ল্যাটের scale করতে train-এর গড় না নিয়ে শুধু ওই একটা ফ্ল্যাটের নিজের মান দিয়ে গড় বের করলে কী হবে?

৩. `rooms` ফাঁকা থাকলে কোন মান বসবে, আর সেটা কোথা থেকে আসবে?

<details>
<summary>উত্তর</summary>

১. `size′ = (1000 − 872.08)/271.82 ≈ 0.471`, `rooms′ = (3 − 2.5)/0.91 ≈ 0.549`। Prediction `= 17.004 + 2.171 × 0.471 + 2.181 × 0.549 ≈ 17.004 + 1.022 + 1.198 ≈ 19.22`। অর্থাৎ প্রায় `19.2` হাজার টাকা।

২. একটা মানের গড় সেই মানই, তাই `(মান − গড়) = 0`; scale করা মান সবসময় `0` আসবে। এটা train-এর scale-এর সঙ্গে মেলে না, ফল ভুল।

৩. Train-এর `rooms`-এর median, অর্থাৎ `3`। এটা train-এ শেখা মান।

</details>

## পরের পাঠ

Module 08 এখানে শেষ। একই কাঠামোয় আরও জটিল model-এর জন্য [Module 09 — Model architecture](../module-09-model-architecture/README.md) আর তারপর [Module 10 — Neural network training](../module-10-neural-network-training/README.md)।
