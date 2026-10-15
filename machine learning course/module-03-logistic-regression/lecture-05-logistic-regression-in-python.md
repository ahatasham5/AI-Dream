# Lecture 05 — Python-এ Logistic Regression

> আগে যা জানা থাকলে ভালো: [Logistic model](lecture-02-logistic-model-and-decision-boundary.md), [log loss](lecture-03-log-loss.md) ও [gradient-এর এক ধাপ](lecture-04-logistic-training-gradient.md)। এই lecture শেষে পারবে: কোনো library ছাড়া Python-এ Logistic Regression train করে নতুন input-এর probability ও class বের করতে। ([Map-এ অবস্থান](../01-learning-map.md): Logistic Regression → output, objective ও update, তিনটাই কোডে)

## সমস্যাটা কী?

হাতে দু-তিন ধাপ হিসাব করা গেছে, কিন্তু ভালো `w, b` পেতে হাজার ধাপ লাগে। সেটা কম্পিউটারকে দিয়ে করাতে হবে। তার আগে কোডটা এমনভাবে সাজাতে হবে যেন আগের lecture-এর প্রতিটা ধাপ কোডের একটা function-এর সঙ্গে মেলে। Library ছাড়া লিখলে ভেতরে কী ঘটছে স্পষ্ট দেখা যায়।

## ধারণাটা সহজ ভাষায়

কোডে তিনটা আলাদা অংশ থাকবে, ঠিক আগের lecture-এর তিন ধাপের মতো:

| ধাপ | কোডের function | কাজ |
|---|---|---|
| Output | `predict_proba(x, w, b)` | `p = σ(w × x + b)` |
| ভুল মাপা | `log_loss(w, b)` | সব উদাহরণের গড় log loss |
| Update | `gradient(w, b)` এবং training loop | `w, b` বদলানো |

একটা পুরো pass-এর জন্য ডেটার সব উদাহরণ ব্যবহার করা হয়, আর এই pass-কে বলে **epoch**। এখানে প্রতিটা epoch-এ ঠিক একবার update হয় (Linear Regression-এর lecture-এর মতো পুরো ডেটা দিয়ে gradient)।

## ছোট একটা উদাহরণ: পড়ার ঘণ্টা থেকে পাস

ডেটা: 10 জন ছাত্র। কয়েকজন কম পড়েও পাস করেছে, কয়েকজন বেশি পড়েও ফেল, ইচ্ছে করেই এমন রাখা হয়েছে, যেন বাস্তবের মতো একটু অগোছালো হয়।

```python
import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

xs = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]  # hours studied
ys = [0,   0,   0,   1,   0,   1,   0,   1,   1,   1]    # 1 = pass

def predict_proba(x, w, b):
    return sigmoid(w * x + b)

def log_loss(w, b):
    total = 0
    for x, y in zip(xs, ys):
        p = predict_proba(x, w, b)
        total += -(y * math.log(p) + (1 - y) * math.log(1 - p))
    return total / len(xs)

def gradient(w, b):
    gw = gb = 0
    for x, y in zip(xs, ys):
        error = predict_proba(x, w, b) - y
        gw += error * x
        gb += error
    return gw / len(xs), gb / len(xs)

w, b, lr = 0.0, 0.0, 0.5
for epoch in range(1, 2001):
    gw, gb = gradient(w, b)
    w, b = w - lr * gw, b - lr * gb
    if epoch in (1, 10, 100, 500, 2000):
        print(epoch, round(log_loss(w, b), 4), round(w, 3), round(b, 3))

print("boundary x =", round(-b / w, 2))
preds = [1 if predict_proba(x, w, b) >= 0.5 else 0 for x in xs]
print("accuracy", sum(p == y for p, y in zip(preds, ys)), "/", len(xs))
```

```text
# output:
1 0.6458 0.237 0.0
10 0.5802 0.349 -0.526
100 0.445 1.021 -2.68
500 0.4335 1.343 -3.691
2000 0.4335 1.353 -3.722
boundary x = 2.75
accuracy 8 / 10
```

## ফল পড়া

প্রতিটা লাইনে epoch, গড় log loss, `w`, `b`।

- Loss `0.693` (কিছুই না জানা model) থেকে নেমে `0.4335`-এ স্থির হয়েছে। 500 আর 2000 epoch-এর loss প্রায় একই, মানে আর উন্নতি হচ্ছে না।
- Loss 0 হয়নি। কারণ ডেটা অগোছালো: 2.0 ঘণ্টায় একজন পাস করেছে, অথচ 2.5 ও 3.5 ঘণ্টায় ফেল করেছে। কোনো সোজা সীমা এটা পুরো আলাদা করতে পারে না।
- শেখা model: `z = 1.353 × x − 3.722`। Boundary `x = 3.722 / 1.353 ≈ 2.75` ঘণ্টা।
- Accuracy 8/10: ভুল দুটো হলো x = 2.0 (পাস করেছে, model বলেছে ফেল) আর x = 3.5 (ফেল করেছে, model বলেছে পাস)।

Accuracy মানে সঠিক সিদ্ধান্তের অনুপাত। এখানে এটা training ডেটার উপরেই মাপা, নতুন ডেটায় নয়। নতুন ডেটায় যাচাই Module 06-এ আসবে।

## নতুন input-এ ব্যবহার

Training শেষ হলে `w, b` স্থির; নতুন x দিলে শুধু output-এর হিসাব চলে, সঠিক y জানা লাগে না। উপরের কোডের পরে:

```python
for x in [1.8, 3.2]:
    p = predict_proba(x, w, b)
    print(x, round(p, 3), "pass" if p >= 0.5 else "fail")
```

```text
# output:
1.8 0.217 fail
3.2 0.648 pass
```

## মনে রাখার সারকথা

- কোডের তিন অংশ: output (`predict_proba`), ভুল মাপা (`log_loss`), update (`gradient` ও loop)।
- Loss নামতে নামতে একসময় স্থির হয়; অগোছালো ডেটায় সেটা 0 হয় না।
- Training শেষে `w, b` স্থির রেখে নতুন x থেকে p ও class বের করা যায়।

## নিজে করো

১. হাতে প্রথম ধাপের `g_w` ও `g_b` বের করো (`w = 0, b = 0`)। কোডের epoch 1-এর `w = 0.237`-এর সঙ্গে মেলাও। (সাহায্য: x-এর যোগফল 27.5, পাস করা ছাত্রদের x-এর যোগফল 18.5, আর 5 জন পাস।)

২. কোডে `lr = 0.01` দিয়ে 100 epoch চালালে loss 0.6357 হয়, `lr = 0.5` দিলে 0.445। কোনটা ভালো এগিয়েছে? কেন?

৩. `lr = 5.0` দিয়ে 100 epoch চালালে loss 0.8819 হয়। এই মান শুরুর 0.693 থেকেও বেশি। এর মানে কী?

৪. সীমা 0.5-এর বদলে 0.8 করলে boundary কোথায় যায়? Accuracy কত হয়? (সাহায্য: `p ≥ 0.8` হতে `z ≥ 1.386` লাগে; শেখা model `z = 1.353x − 3.722`।)

৫. `x = 3.0` ছাত্রের p ও class কী? এটা boundary 2.75 থেকে কোন দিকে?

<details>
<summary>উত্তর</summary>

১. `p = 0.5` সবার। `g_b = গড়(0.5 − y) = 0.5 − 0.5 = 0` (10 জনের 5 জন পাস, তাই y-এর গড় 0.5)। `g_w = গড়((0.5 − y) × x) = (0.5 × 27.5 − 18.5) / 10 = (13.75 − 18.5) / 10 = −0.475`। `w = 0 − 0.5 × (−0.475) = 0.2375 ≈ 0.237`, `b = 0`। কোডের সঙ্গে মেলে।

২. `lr = 0.5` বেশি এগিয়েছে (loss 0.445 < 0.6357)। ছোট learning rate-এ প্রতি ধাপ ছোট, তাই 100 ধাপে কম দূর যাওয়া যায়।

৩. Loss শুরুর মানের চেয়ে বেড়ে গেছে, অর্থাৎ learning rate এত বড় যে প্রতিটা ধাপ ভালো মান পার হয়ে যাচ্ছে, training ঠিক পথে নেই। Learning rate ছোট করতে হবে।

৪. `1.353x − 3.722 = 1.386` থেকে `x = 5.108 / 1.353 ≈ 3.77`। এই সীমায় 5.0, 4.5, 4.0 ঘণ্টার ছাত্ররা পাস, বাকিরা ফেল বলে ধরা হয়; সিদ্ধান্ত `[0,0,0,0,0,0,0,1,1,1]`, আর accuracy আবারও 8/10 (x = 2.0 ও 3.0 ভুল, x = 3.5-এ এবার সঠিক)।

৫. `z = 1.353 × 3.0 − 3.722 = 0.337`, `p ≈ 0.584`, class 1 (পাস)। 3.0 > 2.75, তাই boundary-র ডান দিকে।

</details>

## পরের পাঠ

Logistic Regression-এর পুরো পথ (output, objective, update) হাতে আর কোডে দেখা হলো। Module 04-এ vector, matrix, mean ও derivative-এর হাতে অনুশীলন, যা এই হিসাবগুলোর ভিত্তি: [Module 04 — Math foundations অনুশীলন](../module-04-math-foundations-practice/README.md)। আর ডেটা ঠিকমতো সাজানো ও আলাদা করার কাজ Module 05-এ।
