# Lecture 05 — Hyperparameter বাছাই: validation দিয়ে বেছে, test দিয়ে একবার যাচাই

> আগে যা জানা থাকলে ভালো: [Lecture 03 — Regularization](lecture-03-regularization-and-early-stopping.md) (`λ`), [Lecture 02 — Capacity](lecture-02-capacity-and-data-size.md) (degree) এবং [train/validation/test split](../module-05-data-preparation-and-splits/lecture-03-train-validation-test-split.md)। এই lecture শেষে পারবে: validation error দেখে hyperparameter বাছতে, আর কেন test set বাছাইয়ের কাজে ব্যবহার করা যায় না তা বলতে।

## সমস্যাটা কী?

আগের lecture-গুলোতে degree, `λ`, training-এর ধাপ সংখ্যার মতো কিছু মান আমরা নিজেরাই ঠিক করেছি। এগুলোর ভুল মান মানেই underfitting বা overfitting। কিন্তু কোন মান ঠিক, তা কেউ আগে থেকে বলে দেয় না। আবার "যেটায় test error কম, সেটা বেছে নিই" বললে অন্য বিপদ আছে, যা একটু পরে দেখব। প্রতিটা ML team যেকোনো model-এ এই বাছাইয়ের কাজ করে।

## ধারণাটা সহজ ভাষায়

Model দুই ধরনের সংখ্যা নিয়ে চলে:

- **Parameter**: training শেখায়। যেমন polynomial-এর weight `w₀, w₁, …`।
- **Hyperparameter**: training শুরুর আগে আমরা নিজে ঠিক করি। Training এগুলো শেখায় না। যেমন degree, `λ`, learning rate, training-এর ধাপের সংখ্যা। (আগের পরিচয়: [Parameter ও hyperparameter](../module-09-model-architecture/lecture-02-parameters-and-hyperparameters.md)।)

Hyperparameter বাছার উপায় সোজা: কয়েকটা মান চেষ্টা করো, প্রতিটার জন্য model train করে **validation error** মাপো, যেটায় সবচেয়ে কম সেটা নাও। চেষ্টা করা মানগুলোর তালিকাকে বলে **grid**, আর সবগুলো মিলিয়ে দেখাকে **grid search**।

এখানে তিনটা data-র আলাদা কাজ আছে:

| Data | কাজ |
|---|---|
| Training | Parameter (weight) শেখানো |
| Validation | Hyperparameter বাছা |
| Test | সবকিছু ঠিক হয়ে যাওয়ার পর **একবার** চূড়ান্ত মান মাপা |

Test দিয়ে বাছাই করলে কী ভুল হয়? ধরো ২০টা বিকল্প চেষ্টা করলে। যেগুলো ঘটনাক্রমে test data-র সঙ্গে বেশি মিলেছে, সেটাই জিতবে। তখন test error আর "অদেখা data-র ফল" থাকে না, বাছাইয়ের অংশ হয়ে যায়। চূড়ান্ত সংখ্যাটা তাই বাস্তবের চেয়ে ভালো দেখায়। Test-কে তালাবন্ধ রাখার কারণ এটাই।

## ছোট একটা উদাহরণ

তিনটা বিকল্প, হাতে-হিসাবের মতো সংখ্যা (বানানো):

| `λ` | Validation MSE |
|---|---|
| 0.001 | 0.30 |
| 0.01 | 0.22 |
| 0.1 | 0.25 |

সবচেয়ে কম `0.22`, তাই `λ = 0.01` বাছা হলো। এখন এই `λ`-তে model train করে test set-এ **একবার** মাপলাম, ধরো `0.24`। এই `0.24`-ই আমরা বাইরে জানাব। কখনো test-এ দেখলাম `0.40` বলে ফিরে গিয়ে `λ` বদলে আবার test মাপলে test আর আলাদা থাকে না।

## কোড: degree আর λ একসঙ্গে বাছা

Lecture 01-এর helper লাগবে।

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

Data: ১৬টা training, ৩০টা validation, ২০০টা test point। Degree ৫টা (1, 2, 3, 5, 7) আর `λ` চারটা (0, 0.001, 0.01, 0.1), মোট ২০ রকম মিশ্রণ। `search` ফাংশন একটা seed থেকে data বানিয়ে ২০টা মিশ্রণ validation-এ মেপে সেরাটা বাছে, তারপর শুধু সেটা test-এ মাপে।

```python
degrees, lams = (1, 2, 3, 5, 7), (0, 0.001, 0.01, 0.1)

def search(seed):
    xtr, ytr = make_data(16, seed)
    xva, yva = make_data(30, seed + 1000, grid=False)
    xte, yte = make_data(200, seed + 2000, grid=False)
    best, table = (1e9,), {}
    for d in degrees:
        for lam in lams:
            v = mse(fit(xtr, ytr, d, lam), xva, yva)
            table[(d, lam)] = v
            if v < best[0]:
                best = (v, d, lam)
    w = fit(xtr, ytr, best[1], best[2])
    return table, best, mse(w, xte, yte)        # test শুধু সেরা model-এ, একবার

table, (v, d, lam), test = search(6)
print("degree   lam=0   0.001   0.01    0.1    (validation MSE)")
for dd in degrees:
    print(f"{dd:>6}   " + "   ".join(f"{table[(dd, l)]:.3f}" for l in lams))
print(f"\nবেছে নেওয়া: degree={d}, lam={lam}, val={v:.3f}")
print(f"test (একবারই): {test:.3f}")

# output:
# degree   lam=0   0.001   0.01    0.1    (validation MSE)
#      1   0.203   0.204   0.209   0.258
#      2   0.130   0.121   0.177   0.255
#      3   0.131   0.126   0.153   0.254
#      5   0.127   0.134   0.148   0.247
#      7   0.191   0.132   0.154   0.241
#
# বেছে নেওয়া: degree=2, lam=0.001, val=0.121
# test (একবারই): 0.080
```

পড়ার নিয়ম:

- Degree 1 সব সারিতে খারাপ (`≈ 0.20`): underfitting।
- Degree 2 থেকে 5-এ ভালো মান (`0.12`–`0.13`), degree 7-এ `λ = 0` হলে খারাপ (`0.191`), `λ = 0.001` হলে ভালো (`0.132`)। Regularization জটিল model-কে বাঁচিয়েছে।
- `λ = 0.1` সব সারিতে খারাপ: খুব কড়া জরিমানা মানে underfitting।
- সর্বনিম্ন `0.121`: degree 2, `λ = 0.001`। Test-এ ফল `0.080`।

Validation মাত্র ৩০টা point, তাই একবারের সংখ্যা এদিক-ওদিক হতে পারে, এখানে test-এর ফল validation-এর চেয়ে ভালো এসেছে। একই কাজ ১০০ বার আলাদা data নিয়ে করে গড় দেখলে ছবি পরিষ্কার হয়:

```python
vs, ts = [], []
for seed in range(100, 200):
    _, b, t = search(seed)
    vs.append(b[0]); ts.append(t)
print(f"১০০ বারের গড়: val={sum(vs) / 100:.3f}  test={sum(ts) / 100:.3f}")

# output:
# ১০০ বারের গড়: val=0.100  test=0.106
```

গড়ে বাছাই করা model-এর validation error (`0.100`) test error-এর (`0.106`) চেয়ে কম। কারণ আমরা ২০টার মধ্যে validation-এ সবচেয়ে ভালোটাই বেছেছি, তাই তার validation ফল কিছুটা বেশি আশাবাদী। Test সেই আশাবাদ থেকে মুক্ত, তাই চূড়ান্ত ফল test থেকেই জানাতে হয়।

কয়েকটা ব্যবহারিক কথা:

- `λ`-এর মতো মান ১০ গুণ করে করে (0.001, 0.01, 0.1) চেষ্টা করা ভালো। প্রথমে মোটা grid, পরে সেরা মানের আশপাশে ঘন grid।
- সেরা মান grid-এর একদম কিনারায় এলে grid আরও বাড়িয়ে দেখো।
- Validation ছোট হলে বাছাই এলোমেলো হয়। তখন একটা validation set-এর বদলে data কয়েকভাগে ভেঙে ঘুরিয়ে মাপা (**cross-validation**) কাজে লাগে; সেটা [Module 06-এ](../module-06-model-evaluation-and-baselines/lecture-05-cross-validation-and-final-test.md) আছে।

## মনে রাখার সারকথা

- Parameter training শেখায়; hyperparameter (degree, `λ`, learning rate) আমরা বাছি।
- Hyperparameter বাছো validation error দিয়ে: কয়েকটা মান চেষ্টা করে সবচেয়ে কম error-টা নাও।
- Test set শুধু শেষে একবার। তা দিয়ে বাছলে test-এর ফল আর বিশ্বাসযোগ্য থাকে না।

## নিজে করো

১. Degree, weight `w₁`, `λ`, learning rate, bias: কোনগুলো hyperparameter আর কোনগুলো parameter?

২. `λ = 0.001, 0.01, 0.1, 1`-এর validation error যথাক্রমে `0.30, 0.22, 0.25, 0.40`। কোন `λ` বাছবে? Test set কখন মাপবে?

৩. এক বন্ধু ৫০টা hyperparameter-মিশ্রণ চেষ্টা করে test error সবচেয়ে কম যেটায়, সেটা নিয়ে "আমার model-এর test error `0.10`" বলছে। কী সমস্যা, আর কীভাবে ঠিক করবে?

<details>
<summary>উত্তর</summary>

১. Hyperparameter: degree, `λ`, learning rate (আমরা বাছি)। Parameter: `w₁`, bias (training শেখায়)।

২. `λ = 0.01`, কারণ validation error সবচেয়ে কম (`0.22`)। Test set মাপবে সবকিছু ঠিক হওয়ার পর, ওই এক `λ`-তে train করা model-এ, মাত্র একবার।

৩. ৫০টার মধ্যে test-এর সঙ্গে ঘটনাক্রমে সবচেয়ে বেশি মেলা model-টাই বাছা হয়েছে, তাই `0.10` বাস্তবের চেয়ে ভালো দেখাচ্ছে। ঠিক করতে বাছাই করবে validation error দিয়ে, আর test শেষে একবার মাপবে।

</details>

## পরের পাঠ

Module 07 এখানে শেষ। এই module-এর সব ধারণা (train/validation error, capacity, regularization, learning curve, validation দিয়ে বাছাই) এবার একটা সম্পূর্ণ ছোট project-এ একসঙ্গে ব্যবহার হবে: [Module 08 — End-to-end ML project](../module-08-end-to-end-ml-project/README.md)।
