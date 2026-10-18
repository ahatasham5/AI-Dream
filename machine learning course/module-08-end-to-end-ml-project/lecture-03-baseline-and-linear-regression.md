# Lecture 03 — Baseline আর Linear Regression train করা

> আগে যা জানা থাকলে ভালো: [Lecture 02 — পরিদর্শন, split, প্রস্তুতি](lecture-02-inspect-split-preprocess.md), [একাধিক feature-এর prediction](../module-02-linear-regression/lecture-01-prediction-weight-and-bias.md), [MSE](../module-02-linear-regression/lecture-02-error-and-mean-squared-error.md) আর [gradient descent](../module-02-linear-regression/lecture-03-gradient-descent-training.md)। এই lecture শেষে পারবে: baseline আর Linear Regression-এর ফল একই মাপে তুলনার জন্য প্রস্তুত করতে, আর দুই feature-এর model gradient descent দিয়ে train করতে।

## সমস্যাটা কী?

Model train করে বলা গেল "training error ১.৩৭"। এটা ভালো না খারাপ? তুলনার কিছু না থাকলে জানা যায় না। তাই আগে একটা সহজ baseline-এর ফল নিতে হয়, যার চেয়ে ভালো না করলে model-এর কোনো মূল্য নেই। ML team-রা প্রতিটা project-এ প্রথমে এটাই করে ([Module 06: Baseline](../module-06-model-evaluation-and-baselines/lecture-01-baselines.md))।

## ধারণাটা সহজ ভাষায়

**Baseline:** সব ফ্ল্যাটের জন্য train-এর গড় ভাড়াটাই বলা। Feature দেখার দরকার নেই।

**Linear Regression:** Lecture 02-এর scale করা দুটো feature (`size′`, `rooms′`) নিয়ে

`ŷ = w₁ × size′ + w₂ × rooms′ + b`

এখানে `w₁, w₂` weight আর `b` bias। এই হিসাবটা model-এর **output বের করার পথ**। এর weight কীভাবে শিখবে সেটা আলাদা দুটো ধাপ ([Learning Map](../01-learning-map.md)):

- **ভুল মাপা (objective):** train-এর MSE।
- **মান বদলানো (update):** gradient descent। প্রতিবার `w₁, w₂, b` একটু করে বদলায়, MSE কমানোর দিকে।

**মাপের একক:** MSE-র একক হাজার টাকার বর্গ, পড়া কঠিন। তাই তুলনায় দুটো মাপ নেব:

- **MAE** = গড় `|error|`। সরাসরি "গড়ে কত হাজার টাকা ভুল"।
- **RMSE** = `√MSE`। এটাও হাজার টাকার এককে, কিন্তু বড় ভুলকে বেশি গুরুত্ব দেয়।

## ছোট একটা উদাহরণ

**MAE ও RMSE:** আসল ভাড়া `[10, 20]`, prediction `[11, 17]`।

- Error `+1, −3`
- MAE `= (1 + 3) / 2 = 2.0`
- MSE `= (1 + 9) / 2 = 5`; RMSE `= √5 ≈ 2.236`

RMSE বেশি, কারণ বড় ভুলটা (`3`) বেশি গুরুত্ব পেয়েছে।

**একটা gradient descent ধাপ:** দুটো train সারি (scale করা feature আর target): `(1, 0) → 3` এবং `(0, 1) → 5`। শুরুতে `w₁ = w₂ = b = 0`, learning rate `α = 0.1`।

- Prediction `0, 0`; error `−3, −5`; MSE `(9 + 25)/2 = 17`
- `g_w₁ = (2/2) × (−3 × 1 + −5 × 0) = −3`
- `g_w₂ = (2/2) × (−3 × 0 + −5 × 1) = −5`
- `g_b = (2/2) × (−3 − 5) = −8`
- নতুন `w₁ = 0 − 0.1 × (−3) = 0.3`, `w₂ = 0.5`, `b = 0.8`
- নতুন prediction `0.3 + 0.8 = 1.1` আর `0.5 + 0.8 = 1.3`; error `−1.9, −3.7`; MSE `(3.61 + 13.69)/2 = 8.65`

এক ধাপেই MSE `17` থেকে `8.65`। আমাদের কোডে একই কাজ ২৪টা সারি আর ৩০০ বার করে।

## কোড

আগের lecture-এর code-এর নিচে বসাও। প্রথমে দুটো মাপ আর baseline:

```python
def mae(preds, ys):
    return sum(abs(p - y) for p, y in zip(preds, ys)) / len(ys)

def rmse(preds, ys):
    return math.sqrt(sum((p - y) ** 2 for p, y in zip(preds, ys)) / len(ys))

mean_rent = sum(ytr) / len(ytr)                  # baseline: সবার জন্য train-এর গড় ভাড়া
base_val = [mean_rent] * len(yva)
print(f"baseline (সবার জন্য গড় {mean_rent:.2f}): val MAE={mae(base_val, yva):.2f}  RMSE={rmse(base_val, yva):.2f}")

# output:
# baseline (সবার জন্য গড় 17.00): val MAE=4.45  RMSE=4.94
```

Baseline প্রতিটা validation ফ্ল্যাটে `17.00` বলছে, আর গড়ে প্রায় `4.45` হাজার টাকা ভুল করছে (RMSE `4.94`)। Model-কে এর চেয়ে অনেক ভালো করতে হবে।

এবার gradient descent। Weight আর bias শুরুতে `0`, learning rate `0.1`, ৩০০ ধাপ:

```python
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

# output:
# step   1: train MSE=307.684
# step  10: train MSE=6.585
# step  50: train MSE=1.371
# step 300: train MSE=1.371
# weights: [2.171, 2.181]  bias: 17.004
```

পড়ার নিয়ম:

- প্রথম ধাপে MSE `307.684` (সব prediction `0`, তাই error মানে পুরো ভাড়াটাই)। ১০ ধাপে `6.585`, ৫০ ধাপে `1.371`।
- ৫০ ধাপের পর MSE আর বদলায়নি, অর্থাৎ training এখানেই থিতু হয়েছে।
- **Bias `17.004`, baseline-এর গড়ের (`17.00`) প্রায় সমান।** কারণ feature-গুলো গড় বাদ দিয়ে scale করা, তাই feature যখন "গড়ের মতো" (শূন্য), তখন model গড় ভাড়াই বলে। Weight দুটো সেই গড়ের ওপর বাড়তি অংশ যোগ করে।
- `w₁ = 2.171`: `size` গড়ের চেয়ে এক std (≈ ২৭২ বর্গফুট) বেশি হলে ভাড়া প্রায় `2.17` হাজার টাকা বাড়ে। `w₂ = 2.181`: `rooms` এক std (≈ ০.৯ ঘর) বেশি হলে প্রায় `2.18` বাড়ে। এই এককগুলো scale করা feature-এর, মূল এককের নয়।

Training MSE `1.371` মানে training RMSE `√1.371 ≈ 1.17` হাজার টাকা। এই সংখ্যা চতুর্থ lecture-এ validation-এর সঙ্গে তুলনা হবে।

## মনে রাখার সারকথা

- Baseline (গড় বলা) আগে নিতে হয়; model-কে তার চেয়ে ভালো করতে হবে।
- Linear Regression-এর output বের করা (`ŷ = w₁x₁ + w₂x₂ + b`), ভুল মাপা (MSE) আর মান বদলানো (gradient descent) তিনটা আলাদা ধাপ।
- MAE আর RMSE target-এর এককেই (এখানে হাজার টাকা) পড়া যায়, তাই MSE-র চেয়ে সহজে বোঝা যায়।

## নিজে করো

১. আসল ভাড়া `[12, 18, 30]`, baseline সবার জন্য `20` বলছে। MAE আর RMSE কত?

২. ওপরের gradient descent উদাহরণে (দুটো সারি, `α = 0.1`) প্রথম ধাপের পর `b` কত হয়েছিল?

৩. ৫০ ধাপ আর ৩০০ ধাপের পর training MSE একই (`1.371`) কেন?

<details>
<summary>উত্তর</summary>

১. Error `8, 2, −10`। MAE `= (8 + 2 + 10)/3 ≈ 6.667`। MSE `= (64 + 4 + 100)/3 = 56`; RMSE `= √56 ≈ 7.483`।

২. `b = 0 − 0.1 × (−8) = 0.8`।

৩. ৫০ ধাপেই gradient প্রায় শূন্য হয়ে গেছে, অর্থাৎ MSE আর কমার জায়গা নেই (এই লাইনের সর্বনিম্ন বিন্দু পাওয়া গেছে)। তাই আরও ধাপ বদল আনে না।

</details>

## পরের পাঠ

এখন train error জানি, কিন্তু আসল পরীক্ষা অদেখা data। Validation-এ model আর baseline তুলনা, ভুলগুলো ঘেঁটে দেখা আর test-এ একবার চূড়ান্ত মাপ: [Lecture 04 — Validation, error analysis ও final test](lecture-04-validation-error-analysis-final-test.md)।
