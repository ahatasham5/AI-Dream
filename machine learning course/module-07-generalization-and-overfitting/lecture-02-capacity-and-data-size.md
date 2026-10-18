# Lecture 02 — Model-এর ক্ষমতা (capacity) আর data-র পরিমাণ

> আগে যা জানা থাকলে ভালো: [Lecture 01 — Underfitting আর Overfitting](lecture-01-underfitting-and-overfitting.md)। এই lecture শেষে পারবে: model-এর জটিলতা বাড়ালে train ও validation error কীভাবে আলাদা পথে চলে তা বলতে, আর data বাড়ালে overfitting কেন কমে তা ব্যাখ্যা করতে।

## সমস্যাটা কী?

Overfitting দেখার পর প্রশ্ন আসে: model কতটা জটিল রাখব? খুব সরল রাখলে underfitting, খুব জটিল রাখলে overfitting। আবার data মাত্র ৮টা হলে কী হবে, আর ৮০০টা হলে কী হবে? এই দুটো প্রশ্নের উত্তর একই জায়গায় এসে মেলে, তাই একসঙ্গে দেখব। Model বাছাই আর data সংগ্রহের পরিকল্পনা করার সময় ML team-কে এই হিসাবটা করতে হয়।

## ধারণাটা সহজ ভাষায়

**Capacity** মানে model কতটা জটিল আকার বানাতে পারে। এটা মোটামুটি model-এর শেখার মতো সংখ্যা (weight বা parameter)-র ওপর নির্ভর করে। Polynomial-এ degree `d` হলে weight থাকে `d + 1`টা। Neural network-এ layer আর unit বাড়লে parameter বাড়ে ([parameter গোনা](../module-09-model-architecture/lecture-07-shapes-and-parameter-count.md))।

Capacity বাড়ালে দুটো error আলাদা আচরণ করে:

- **Training error** কমতেই থাকে (অন্তত বাড়ে না)। বেশি weight মানে data-র আরও কাছে যাওয়ার সুযোগ।
- **Validation error** প্রথমে কমে, তারপর আবার বাড়ে। শুরুতে model pattern ধরতে শেখে; পরে noise মুখস্থ করতে শুরু করে।

তাই validation error-এর রেখা দেখতে অনেকটা **U** আকারের। U-এর সবচেয়ে নিচের জায়গাটাই বেছে নেওয়ার মতো capacity।

### Data কম হলে সমস্যা বাড়ে

Weight-এর সংখ্যা যদি data point-এর সংখ্যার সমান বা বেশি হয়, model সব point-ই ছুঁয়ে যেতে পারে। তখন training error `0` হয়ে যায়, কিন্তু সেটা শেখার প্রমাণ নয়।

- ২টা point-এ সরলরেখা (২টা weight) সবসময় নিখুঁত মেলে। সেখানে error `0` মানে কিছুই নয়।
- ৩টা point-এ degree 2 (৩টা weight) সবসময় মেলে।
- সাধারণভাবে `n`টা point-এ degree `n − 1` সবসময় মেলে।

উল্টো দিকে, data বেশি হলে সব point ছুঁয়ে যাওয়া কঠিন হয়ে যায়। Curve তখন noise-এর পেছনে ছুটতে পারে না, বাধ্য হয়ে মূল pattern ধরে। তাই **data বাড়ানো overfitting কমানোর একটা শক্তিশালী উপায়**, যদিও data জোগাড় করা প্রায়ই খরচের ব্যাপার।

## ছোট একটা উদাহরণ

তিনটা point: `(1, 2)`, `(2, 5)`, `(3, 4)`। এগুলো এক রেখায় পড়ে না।

**রেখা (degree 1):** সেরা রেখা `ŷ = 1.667 + 1.0x`।

- Prediction: `2.667, 3.667, 4.667`
- Error: `0.667, −1.333, 0.667`
- Square: `0.444, 1.778, 0.444`
- MSE `= 2.667 / 3 = 0.889`

**Degree 2:** ৩টা weight দিয়ে তিনটা সমীকরণ মিলিয়ে পাওয়া যায় `ŷ = −5 + 9x − 2x²`।

- `x = 1`: `−5 + 9 − 2 = 2` ✓
- `x = 2`: `−5 + 18 − 8 = 5` ✓
- `x = 3`: `−5 + 27 − 18 = 4` ✓

তিনটা point-ই নিখুঁত, MSE `0`। কিন্তু যেকোনো তিনটা point-এই এমন একটা degree 2 curve পাওয়া যায়, তাই এই নিখুঁত মিল আমাদের কিছু জানায় না। `x = 4`-এ গেলে এই curve বলবে `−5 + 36 − 32 = −1`; মাত্র তিনটা point দেখে এই ভবিষ্যদ্বাণীতে ভরসা করা যায় না। Capacity যত বাড়ে, model তত সহজে "শুধু এই data-র জন্য" curve বানাতে পারে।

## কোড: capacity বাড়ালে কী হয়

Lecture 01-এর helper (`fit`, `predict`, `mse`, `make_data`) আবার দরকার।

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

প্রথমে ওপরের হাতে-হিসাব মিলিয়ে নিই, তারপর degree 0 থেকে 7 পর্যন্ত ৮টা training point-এ চালাই:

```python
w = fit([1, 2, 3], [2, 5, 4], 2)
print("degree 2 weights:", [round(a, 3) for a in w], " mse:", round(mse(w, [1, 2, 3], [2, 5, 4]), 3))
print()

xtr, ytr = make_data(8, 59)                    # 8টা training point
xva, yva = make_data(200, 106, grid=False)     # 200টা validation point
print("degree  weights  train   val")
for d in range(8):
    w = fit(xtr, ytr, d)
    print(f"{d:>6}  {d + 1:>7}  {mse(w, xtr, ytr):.3f}  {mse(w, xva, yva):.3f}")

# output:
# degree 2 weights: [-5.0, 9.0, -2.0]  mse: 0.0
#
# degree  weights  train   val
#      0        1  0.210  0.257
#      1        2  0.180  0.190
#      2        3  0.058  0.109
#      3        4  0.048  0.127
#      4        5  0.043  0.136
#      5        6  0.035  0.163
#      6        7  0.008  0.253
#      7        8  0.000  0.261
```

Training error প্রতি ধাপে কমছে, ৮টা weight-এ গিয়ে `0.000`। Validation error degree 2-তে সবচেয়ে কম (`0.109`), তারপর ধীরে ধীরে বেড়ে degree 7-এ `0.261`। এই U-আকৃতিই দেখার বিষয়।

## কোড: data বাড়ালে কী হয়

এবার degree স্থির রেখে training point-এর সংখ্যা বাড়াই। Degree 7 (জটিল) আর degree 2 (মাঝারি) দুটোই চালাই। Validation set একই থাকবে।

```python
print("degree  n_train  train   val")
for d in (7, 2):
    for n in (8, 16, 32, 64, 128):
        xtr, ytr = make_data(n, 59)
        w = fit(xtr, ytr, d)
        print(f"{d:>6}  {n:>7}  {mse(w, xtr, ytr):.3f}  {mse(w, xva, yva):.3f}")

# output:
# degree  n_train  train   val
#      7        8  0.000  0.261
#      7       16  0.035  0.138
#      7       32  0.060  0.109
#      7       64  0.073  0.097
#      7      128  0.076  0.096
#      2        8  0.058  0.109
#      2       16  0.064  0.105
#      2       32  0.078  0.093
#      2       64  0.079  0.095
#      2      128  0.080  0.091
```

Degree 7-এর ক্ষেত্রে:

- Training error বাড়ছে (`0.000` থেকে `0.076`), কারণ এখন আর সব point মুখস্থ করা যাচ্ছে না।
- Validation error কমছে (`0.261` থেকে `0.096`), আর দুটো error কাছাকাছি আসছে।
- ফারাক (gap) প্রায় মিলিয়ে গেল। অর্থাৎ overfitting কমে গেছে, model-এর কোনো বদল ছাড়াই, শুধু data বেড়ে।

Degree 2-তে data বাড়ালে বদল ছোট (validation `0.109` থেকে `0.091`), কারণ ৮টা point-এই সে আগে থেকে মোটামুটি ঠিক ছিল।

সবশেষে দুটোই `0.09`-এর আশপাশে থামছে। এর কারণ, data বানানোর সময় আমরা যে noise যোগ করেছি তার নিজস্ব মান প্রায় `0.09`। Noise এমন একটা অংশ যা কোনো model-ই ভবিষ্যদ্বাণী করতে পারে না, তাই error ওই সীমার নিচে নামে না।

## মনে রাখার সারকথা

- Capacity বাড়ালে training error কমতেই থাকে, কিন্তু validation error-এর রেখা U-আকৃতির। U-এর তলাটাই লক্ষ্য।
- Weight-এর সংখ্যা data point-এর সংখ্যার কাছাকাছি বা বেশি হলে training error `0` হওয়া কিছুই প্রমাণ করে না।
- Data বাড়ালে একই model-এ overfitting কমে: training error বাড়ে, validation error কমে, দুটো কাছাকাছি আসে।

## নিজে করো

১. Degree 4 polynomial-এ কয়টা weight থাকে?

২. হাতে ৬টা training point আছে। কোন সর্বনিম্ন degree-এ model সবসময় সব point নিখুঁত মেলাতে পারে?

৩. একটা পরীক্ষায় validation error পাওয়া গেল: degree 1 → `0.50`, degree 2 → `0.20`, degree 3 → `0.18`, degree 4 → `0.35`। প্রতিটার training error কিন্তু ক্রমাগত কমছিল। কোন degree বাছবে, আর "training error সবচেয়ে কম যেটায়, সেটা বাছি" নিয়মটা কেন চলে না?

<details>
<summary>উত্তর</summary>

১. `4 + 1 = 5`টা weight (`w₀` থেকে `w₄`)।

২. ৬টা point মেলাতে ৬টা weight লাগে, তাই degree `6 − 1 = 5`। (Degree 5-এ ঠিক ৬টা weight।)

৩. Degree 3 বাছবে, কারণ validation error সবচেয়ে কম (`0.18`)। Training error সবসময় capacity-র সঙ্গে কমে, তাই ওই নিয়মে সবসময় সবচেয়ে জটিল model-টাই জেতে। অথচ degree 4-এর validation error বেড়ে গেছে, অর্থাৎ সে overfit করছে।

</details>

## পরের পাঠ

Capacity কমালে overfitting কমে, কিন্তু কখনো আমরা জটিল model-ই রাখতে চাই। তখন model-এর ক্ষমতা ঠিক রেখে তাকে "বেশি বাঁকতে না দেওয়ার" উপায় লাগে। সেটা [Lecture 03 — Regularization ও early stopping](lecture-03-regularization-and-early-stopping.md)।
