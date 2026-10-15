# Lecture 03 — Regularization আর early stopping: overfitting-এর লাগাম

> আগে যা জানা থাকলে ভালো: [Lecture 02 — Capacity ও data-র পরিমাণ](lecture-02-capacity-and-data-size.md) এবং [gradient descent](../module-02-linear-regression/lecture-03-gradient-descent-training.md)। এই lecture শেষে পারবে: L2 penalty হাতে হিসাব করতে, আর validation error দেখে training কখন থামাতে হয় তা বলতে।

## সমস্যাটা কী?

কখনো আমরা জটিল model রাখতে চাই, কিন্তু data অল্প। Lecture 02-এ দেখেছি ৮টা point-এ degree 7 model overfit করে। Data বাড়ানো সবসময় সম্ভব নয়, model ছোট করলেও কিছু pattern হারাতে পারি। এমন অবস্থায় প্রচলিত উপায় হলো model-কে জটিল রেখেই তার "বাঁকার স্বাধীনতা" কমিয়ে দেওয়া। দুটো জনপ্রিয় উপায় আছে: **regularization** আর **early stopping**। প্রায় প্রতিটা বাস্তব ML project-এ এর অন্তত একটা ব্যবহার হয়।

## ধারণাটা সহজ ভাষায়

Overfit করা model-এর weight দেখলে একটা সূত্র পাওয়া যায়: weight-গুলো অস্বাভাবিক বড় হয়ে যায়। বড় weight মানে curve হঠাৎ হঠাৎ খাড়া ওঠে-নামে, যাতে প্রতিটা noise-ওয়ালা point ছোঁয়া যায়। (নিচের কোডে `λ`-জরিমানা ছাড়া degree 7 model-এর সবচেয়ে বড় weight প্রায় ৯৯০০।)

### Regularization: বড় weight-এর জরিমানা

**Regularization** মানে loss-এর সঙ্গে একটা জরিমানা (**penalty**) যোগ করা, যাতে weight বড় হলে loss বাড়ে। সবচেয়ে চেনা রূপ **L2 regularization**:

`নতুন loss = MSE + λ × (weight-গুলোর square-এর যোগফল)`

`λ` (lambda) একটা সংখ্যা, যা আমরা নিজে ঠিক করি। এটা কতটা কড়া জরিমানা তা ঠিক করে। `λ = 0` হলে জরিমানা নেই, আগের মতোই MSE। `λ` যত বড়, weight ছোট রাখার চাপ তত বেশি। সাধারণত bias (`w₀`) জরিমানার বাইরে থাকে।

[Map](../01-learning-map.md)-এ কোথায় বদলাল: model-এর output বের করার হিসাব আগের মতোই। বদলেছে **training objective**, অর্থাৎ ভুলের মাপ। এখন "ভুল" মানে prediction-এর ভুল **আর** weight-এর বড়ত্ব, দুটোর যোগফল।

### Early stopping: সময়মতো থামা

Gradient descent শুরু হয় ছোট weight (যেমন সব `0`) থেকে, তারপর ধাপে ধাপে বাড়ে। প্রথম দিকে model বড় pattern ধরে; অনেক পরে সে noise-এর পেছনে ছুটতে শুরু করে। তাই প্রতি ধাপে validation error দেখা হয়। যখন সেটা আর কমছে না, training থামিয়ে সবচেয়ে ভালো validation-এর সময়ের weight রেখে দেওয়া হয়। একে বলে **early stopping**। এতেও weight বড় হওয়ার আগেই থামা হয়, তাই কাজটা regularization-এর মতোই।

Decision tree-এর ক্ষেত্রে একই উদ্দেশ্যে tree-র সর্বোচ্চ গভীরতা (depth) সীমা করে দেওয়া হয়।

## ছোট একটা উদাহরণ: L2 penalty হাতে হিসাব

সবচেয়ে ছোট model: একটাই weight `w`, `ŷ = w × x`। Data: `(1, 3)` আর `(2, 5)`। ধরি `λ = 1`।

`নতুন loss = MSE + 1 × w²`

**`w = 2.6`** (penalty ছাড়া সেরা মান):
- Prediction `2.6, 5.2`; error `−0.4, 0.2`; square `0.16, 0.04`; MSE `0.10`
- Penalty `2.6² = 6.76`
- মোট `0.10 + 6.76 = 6.86`

**`w = 2.0`**:
- Prediction `2, 4`; error `−1, −1`; MSE `1`
- Penalty `4`; মোট `5.0`

**`w = 1.8`**:
- Prediction `1.8, 3.6`; error `−1.2, −1.4`; square `1.44, 1.96`; MSE `1.70`
- Penalty `3.24`; মোট `4.94`

**`w = 1.5`**:
- Prediction `1.5, 3`; error `−1.5, −2`; MSE `(2.25 + 4) / 2 = 3.125`
- Penalty `2.25`; মোট `5.375`

Penalty ছাড়া `w = 2.6` সেরা ছিল (MSE `0.10`)। Penalty যোগ হওয়ায় সেটার মোট loss সবচেয়ে বেশি, আর সর্বনিম্ন loss সরে এসেছে `1.8`-এর আশপাশে। এই একটা weight-এর model-এ calculus দিয়ে সর্বনিম্ন বের করলে পাওয়া যায় `w = Σ(x·y) / (Σx² + n·λ) = 13 / (5 + 2) ≈ 1.857`, loss `≈ 4.929`। অর্থাৎ penalty weight-কে `2.6` থেকে `1.857`-এর দিকে ছোট করে টেনেছে।

```python
xs, ys, lam = [1, 2], [3, 5], 1
for w in (2.6, 2.0, 1.8, 1.5):
    m = sum((w * x - y) ** 2 for x, y in zip(xs, ys)) / len(xs)
    print(f"w={w}: mse={m:.3f}  penalty={lam * w * w:.3f}  total={m + lam * w * w:.3f}")

w_best = sum(x * y for x, y in zip(xs, ys)) / (sum(x * x for x in xs) + len(xs) * lam)
print("সর্বনিম্ন loss-এর w:", round(w_best, 3))

# output:
# w=2.6: mse=0.100  penalty=6.760  total=6.860
# w=2.0: mse=1.000  penalty=4.000  total=5.000
# w=1.8: mse=1.700  penalty=3.240  total=4.940
# w=1.5: mse=3.125  penalty=2.250  total=5.375
# সর্বনিম্ন loss-এর w: 1.857
```

একাধিক weight হলে penalty সবগুলোর square যোগ করে। যেমন `w₁ = 3`, `w₂ = −2`, `λ = 0.1` হলে penalty `0.1 × (9 + 4) = 1.3`।

## কোড: λ বাড়ালে কী হয়

Lecture 01-এর helper-এর `fit` ফাংশনে `lam` নামের একটা argument আছে। সেটাই L2 penalty-র `λ`।

<details>
<summary>Helper code (Lecture 01-এর হুবহু একই)</summary>

```python
import random

def fit(xs, ys, degree, lam=0.0):
    """Polynomial-এর সেরা weight বের করে: w0 + w1*x + w2*x^2 + ..."""
    n, m = len(xs), degree + 1
    A = [[x ** j for j in range(m)] for x in xs]
    M = [[sum(A[k][i] * A[k][j] for k in range(n)) + (n * lam if i == j and i > 0 else 0)
          for j in range(m)] + [sum(A[k][i] * ys[k] for k in range(n))] for i in range(m)]
    for c in range(m):                        # Gaussian elimination
        p = max(range(c, m), key=lambda r: abs(M[r][c]))
        M[c], M[p] = M[p], M[c]
        for r in range(m):
            if r != c:
                f = M[r][c] / M[c][c]
                M[r] = [a - f * b for a, b in zip(M[r], M[c])]
    return [M[i][m] / M[i][i] for i in range(m)]

def predict(w, x):
    return sum(wj * x ** j for j, wj in enumerate(w))

def mse(w, xs, ys):
    return sum((predict(w, x) - y) ** 2 for x, y in zip(xs, ys)) / len(xs)

def make_data(n, seed, noise=0.3, grid=True):
    rnd = random.Random(seed)
    xs = [i / (n - 1) for i in range(n)] if grid else sorted(rnd.uniform(0, 1) for _ in range(n))
    return xs, [0.5 + 5 * x - 4 * x * x + rnd.gauss(0, noise) for x in xs]
```

</details>

আগের ৮টা training point-এ degree 7 model, বিভিন্ন `λ` দিয়ে:

```python
xtr, ytr = make_data(8, 59)
xva, yva = make_data(200, 106, grid=False)

print("lambda    train   val    max|w| (bias বাদে)")
for lam in (0, 0.0001, 0.001, 0.01, 0.1, 1):
    w = fit(xtr, ytr, 7, lam)
    print(f"{lam:<8}  {mse(w, xtr, ytr):.3f}  {mse(w, xva, yva):.3f}  {max(abs(a) for a in w[1:]):.1f}")

# output:
# lambda    train   val    max|w| (bias বাদে)
# 0         0.000  0.261  9905.9
# 0.0001    0.051  0.118  5.2
# 0.001     0.063  0.113  3.2
# 0.01      0.101  0.132  1.4
# 0.1       0.160  0.199  0.4
# 1         0.202  0.247  0.1
```

পড়ার নিয়ম:

- **`λ = 0`**: Training `0.000`, validation `0.261`, সবচেয়ে বড় weight প্রায় ৯৯০০ (bias বাদে)। পুরো overfitting।
- **`λ = 0.001`**: Training সামান্য বেড়েছে (`0.063`) কিন্তু validation নেমে `0.113`। Weight ছোট হয়ে `3.2`। এই table-এর সেরা।
- **`λ = 1`**: Weight প্রায় শূন্য (সবচেয়ে বড় `0.1`), কিন্তু training `0.202` আর validation `0.247`: model এখন এত আটকে আছে যে আবার underfitting।

অর্থাৎ `λ` একটা নব (knob), যা underfitting আর overfitting-এর মাঝে model-কে সরায়। `λ` বাড়ানো মানে capacity কমানো। ঠিক `λ` কীভাবে বাছব, সেটা [Lecture 05](lecture-05-choosing-hyperparameters.md)-এ।

## কোড: early stopping

একই data, একই degree 7 model, কিন্তু এবার `fit`-এর বদলে gradient descent। সব weight `0` থেকে শুরু; প্রতি ধাপে validation error দেখে সবচেয়ে ভালো ধাপটা মনে রাখা হয়।

```python
D, lr = 7, 0.5
w = [0.0] * (D + 1)
best = (1e9, 0)                                   # (সবচেয়ে ভালো val error, কোন step-এ)
print("step   train   val")
for step in range(1, 5001):
    g = [0.0] * (D + 1)                           # gradient
    for x, y in zip(xtr, ytr):
        e = predict(w, x) - y
        for j in range(D + 1):
            g[j] += 2 * e * x ** j / len(xtr)
    w = [a - lr * b for a, b in zip(w, g)]        # update
    v = mse(w, xva, yva)
    if v < best[0]:
        best = (v, step)
    if step in (10, 50, 200, 500, 1000, 5000):
        print(f"{step:>5}  {mse(w, xtr, ytr):.3f}  {v:.3f}")
print("best step:", best[1], " val:", round(best[0], 3))

# output:
# step   train   val
#    10  1.201  1.065
#    50  0.162  0.171
#   200  0.081  0.114
#   500  0.064  0.111
#  1000  0.059  0.114
#  5000  0.053  0.118
# best step: 434  val: 0.111
```

প্রথমে দুটো error-ই দ্রুত নামে। প্রায় ৪৩৪ ধাপে validation error সবচেয়ে কম (`0.111`)। তারপর training error কমতেই থাকে (`0.053`), কিন্তু validation আবার সামান্য বাড়ে (`0.118`)। ওই ৪৩৪ ধাপেই থামলে আমরা পাই ভালো মানের weight। তুলনা করার জন্য, একই model পুরো মিলিয়ে ফেললে (`fit`, `λ = 0`) validation error ছিল `0.261`।

সাবধান: যে validation data দিয়ে `λ` বা থামার ধাপ বাছা হলো, সেটা আর পুরোপুরি "অদেখা" থাকে না। তাই চূড়ান্ত ফল জানাতে আলাদা test set লাগে ([Lecture 05](lecture-05-choosing-hyperparameters.md))।

## মনে রাখার সারকথা

- L2 regularization: `নতুন loss = MSE + λ × (weight-এর square-এর যোগফল)`। এতে বড় weight-এর খরচ বাড়ে, তাই weight ছোট থাকে।
- `λ` খুব ছোট হলে overfitting থেকে যায়, খুব বড় হলে underfitting আসে; মাঝখানে একটা ভালো মান থাকে।
- Early stopping: validation error কমা থামলে training থামাও এবং সেরা ধাপের weight রাখো।

## নিজে করো

১. `λ = 0` হলে L2 penalty-সহ loss আর সাধারণ MSE-র সম্পর্ক কী?

২. `w₁ = 3`, `w₂ = −2`, `λ = 0.1` আর MSE `0.5`। নতুন loss কত?

৩. Training চলাকালীন validation error: ধাপ 100 → `0.30`, 200 → `0.22`, 300 → `0.20`, 400 → `0.21`, 500 → `0.24`। কোন ধাপের weight রাখবে? `λ`-কে অনেক বড় (যেমন `1000`) করলে model কেমন হবে?

<details>
<summary>উত্তর</summary>

১. Penalty `0 × (…) = 0`, তাই নতুন loss হুবহু MSE।

২. Penalty `0.1 × (3² + (−2)²) = 0.1 × 13 = 1.3`। নতুন loss `0.5 + 1.3 = 1.8`।

৩. ধাপ 300, কারণ validation error সবচেয়ে কম (`0.20`)। `λ = 1000` হলে weight ছোট না রাখলে loss ভয়ানক বেড়ে যায়, তাই weight প্রায় `0` হয়ে model প্রায় একটা স্থির সংখ্যা বলে (শুধু bias থাকে)। এটা underfitting।

</details>

## পরের পাঠ

Validation আর training error-এর রেখা দেখে সমস্যার ধরন কীভাবে আরও পরিষ্কার চেনা যায়, আর কোথায় ভুল হচ্ছে তা কীভাবে খোঁজা যায়, তা [Lecture 04 — Learning curve আর error analysis](lecture-04-learning-curves-and-error-analysis.md)-এ।
