# Lecture 04 — Derivative ও Gradient: হাতে-কলমে অনুশীলন

> আগে যা জানা থাকলে ভালো: [Module 01-এর calculus-র ধারণা](../module-01-ml-fundamentals-and-math-basics/lecture-08-calculus-intuition.md) এবং [Linear Regression-এর gradient descent](../module-02-linear-regression/lecture-03-gradient-descent-training.md)। এই lecture শেষে পারবে: ছোট function-এর derivative ও partial derivative হাতে বের করতে, সংখ্যা দিয়ে নিজের হিসাব যাচাই করতে, আর gradient descent-এর এক ধাপ করতে।

## সমস্যাটা কী?

Training মানে loss কমানো, আর কমাতে হলে জানতে হয় weight-কে একটু বাড়ালে loss বাড়ে না কমে, আর কত দ্রুত। এই উত্তরটাই derivative। Gradient descent-এর পুরো ধারণা এর উপর দাঁড়িয়ে। আরেকটা কারণ: হাতে-লেখা gradient সূত্রে ভুল থাকলে training চুপচাপ খারাপ হয়, কোনো error message আসে না। সংখ্যা দিয়ে নিজের derivative যাচাই করার অভ্যাস সেই ভুল ধরে।

## ধারণাটা সহজ ভাষায়

**Derivative** হলো ঢাল: input একটু বাড়ালে function-এর মান কত বদলায়, সেই হার। ধনাত্মক ঢাল মানে input বাড়ালে মান বাড়ে; ঋণাত্মক মানে কমে।

সংখ্যা দিয়ে ঢাল মাপা যায়: `(f(x + h) − f(x)) / h`, যেখানে h খুব ছোট (যেমন 0.001)। `f(x) = x²` আর `x = 3` হলে `f(3.001) = 9.006001`, তাই `(9.006001 − 9) / 0.001 = 6.001`, প্রায় 6।

কয়েকটা নিয়ম যথেষ্ট:

| function | derivative |
|---|---|
| ধ্রুবক `c` | 0 |
| `c × x` | `c` |
| `x²` | `2x` |
| যোগফল | আলাদা আলাদা derivative-এর যোগ |

যাচাই: `x²`-এর ঢাল `x = 3`-এ `2 × 3 = 6`, উপরের সংখ্যার হিসাবের সঙ্গে মেলে।

**Partial derivative:** function-এ একাধিক parameter থাকলে (যেমন `w` আর `b`), একটার derivative নিতে অন্যটাকে স্থির ধরা হয়। সব parameter-এর partial derivative একসঙ্গে সাজালে **gradient** (একটা vector)।

**ভেতর-বাইরের নিয়ম (chain rule-এর প্রথম পরিচয়):** `f = (error)²` যেখানে `error = w × x + b − y`। বাইরের ঢাল `2 × error`, আর `error`-এর ভেতরের ঢাল `w`-এর সাপেক্ষে `x` ও `b`-এর সাপেক্ষে `1`। দুটো গুণ করলে:

`∂f/∂w = 2 × error × x` এবং `∂f/∂b = 2 × error`

(Chain rule পরে [Module 10-এ](../module-10-neural-network-training/lecture-03-chain-rule.md) আলাদা করে আসবে।) এই দুটোই Linear Regression-এর `g_w` আর `g_b`-এর মূল।

## ছোট একটা উদাহরণ

একটা উদাহরণ: `x = 2`, `y = 5`, শুরুতে `w = 1`, `b = 0`। `f(w, b) = (w × 2 + b − 5)²`।

1. `error = 1 × 2 + 0 − 5 = −3`, `f = 9`
2. `∂f/∂w = 2 × (−3) × 2 = −12`
3. `∂f/∂b = 2 × (−3) = −6`
4. যাচাই: `w`-কে 0.001 বাড়ালে `f` হয় `8.988004`; ঢাল `(8.988004 − 9) / 0.001 = −11.996 ≈ −12` ✓।
5. `α = 0.1` নিয়ে এক ধাপ: `w = 1 − 0.1 × (−12) = 2.2`, `b = 0 − 0.1 × (−6) = 0.6`।
6. নতুন `error = 2.2 × 2 + 0.6 − 5 = 0`, `f = 0`।

একটাই উদাহরণ ছিল বলে এক ধাপেই loss 0 হয়ে গেছে। বাস্তবে অনেক উদাহরণের গড়ে অনেক ধাপ লাগে।

## কোড: নিজের derivative যাচাই

```python
def slope(f, x, h=0.001):
    return (f(x + h) - f(x)) / h

print(round(slope(lambda x: x ** 2, 3), 3))

x, y = 2, 5
def f(w, b):
    return (w * x + b - y) ** 2

w, b, h = 1.0, 0.0, 0.001
print(round((f(w + h, b) - f(w, b)) / h, 3), round((f(w, b + h) - f(w, b)) / h, 3))
error = w * x + b - y
print(2 * error * x, 2 * error)
```

```text
# output:
6.001
-11.996 -5.999
-12.0 -6.0
```

সংখ্যার ঢাল (`−11.996, −5.999`) আর হাতে-করা সূত্র (`−12, −6`) প্রায় এক। এমন মিললে সূত্র ঠিক ধরা যায়।

## মনে রাখার সারকথা

- Derivative = ঢাল; ঋণাত্মক ঢালে parameter বাড়ালে loss কমে, ধনাত্মকে কমালে।
- Gradient = সব parameter-এর partial derivative; `error²`-এর জন্য `2 × error × x` আর `2 × error`।
- হাতের সূত্র সংখ্যার ঢাল `(f(x + h) − f(x)) / h` দিয়ে যাচাই করা যায়।

## নিজে করো

১. `f(x) = x²`-এর ঢাল `x = 3`-এ সংখ্যা দিয়ে (`h = 0.001`) আর সূত্র দিয়ে বের করো।

২. `f(x) = 3x² + 2x + 7`-এর derivative কী? `x = 2`-এ মান কত?

৩. `f(w, b) = (3w + b − 6)²`, `w = 1`, `b = 1`। `∂f/∂w` আর `∂f/∂b` কত?

৪. Dataset `x = [1, 2]`, `y = [3, 5]`, `w = 2`, `b = 0`। MSE-র gradient `g_w = (2/n) × Σ(error × x)`, `g_b = (2/n) × Σ(error)` বের করো। `α = 0.1` নিয়ে এক ধাপ update করে নতুন MSE বের করো।

৫. Sigmoid-এর derivative হলো `σ(z) × (1 − σ(z))`। `z = 0` আর `z = 2`-এ এর মান কত?

৬. Logistic Regression-এর একটা উদাহরণ: `x = 2`, `y = 1`, `w = 0`, `b = 0`। [Lecture 04-এর](../module-03-logistic-regression/lecture-04-logistic-training-gradient.md) সূত্রে `g_w = (p − y) × x` কত? তারপর `w`-কে 0.001 বাড়িয়ে loss `−ln(σ(w × 2))`-এর সংখ্যার ঢাল দিয়ে মিলিয়ে দেখো।

৭. কোনো loss-এ `w = 3`-এ ঢাল `+5`। gradient descent `w`-কে বাড়াবে না কমাবে? `α = 0.1` হলে নতুন `w` কত?

<details>
<summary>উত্তর</summary>

১. সংখ্যা দিয়ে `(3.001² − 9) / 0.001 = 6.001`। সূত্র `2x = 6`।

২. `f'(x) = 6x + 2`। `x = 2`-এ `6 × 2 + 2 = 14`। (সংখ্যার ঢাল `h = 0.001`-এ প্রায় `14.003`।)

৩. `error = 3 × 1 + 1 − 6 = −2`। `∂f/∂w = 2 × (−2) × 3 = −12`। `∂f/∂b = 2 × (−2) = −4`। (সংখ্যার ঢাল প্রায় `−11.99` আর `−4.00`।)

৪. Prediction `[2, 4]`, error `[−1, −1]`। `g_w = (2/2) × (−1 × 1 + −1 × 2) = −3`। `g_b = (2/2) × (−1 + −1) = −2`। নতুন `w = 2 − 0.1 × (−3) = 2.3`, `b = 0 − 0.1 × (−2) = 0.2`। নতুন prediction `[2.5, 4.8]`, error `[−0.5, −0.2]`, MSE `(0.25 + 0.04) / 2 = 0.145`। আগের MSE ছিল `1`।

৫. `z = 0`: `0.5 × 0.5 = 0.25`। `z = 2`: `σ(2) ≈ 0.881`, `0.881 × 0.119 ≈ 0.105`। (z-এর মান বড় হলে ঢাল ছোট হয়।)

৬. `p = σ(0) = 0.5`, `g_w = (0.5 − 1) × 2 = −1`। সংখ্যার ঢাল: `w = 0.001`-এ loss `−ln(σ(0.002))`, ঢাল প্রায় `−0.9995 ≈ −1` ✓।

৭. ঢাল ধনাত্মক, তাই `w` কমাতে হবে। নতুন `w = 3 − 0.1 × 5 = 2.5`।

</details>

## পরের পাঠ

Module 04-এর অনুশীলন শেষ। এই ভিত্তি নিয়ে আবার [Module 03-এর Logistic Regression](../module-03-logistic-regression/README.md) বা Module 05-এ ডেটা তৈরির কাজে যাওয়া যায়; পরে neural network-এর training-এ এই derivative-ই বারবার ফিরে আসবে ([Module 10-এর chain rule](../module-10-neural-network-training/lecture-03-chain-rule.md))।
