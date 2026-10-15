# Lecture 06 — Python-এ Linear Regression, শুরু থেকে

> আগে যা জানা থাকলে ভালো: [Lecture 03](lecture-03-gradient-descent-training.md) (gradient descent), [Lecture 04](lecture-04-many-features-and-dot-product.md) (একাধিক feature) ও [Lecture 05](lecture-05-checking-on-new-data.md) (train/test)। এই lecture শেষে পারবে: কোনো library ছাড়া ২০ লাইনের Python-এ Linear Regression train করতে ও test MSE মাপতে।

[Map-এ অবস্থান](../01-learning-map.md): এই code-এ model-এর তিনটা আলাদা কাজ তিন জায়গায় আছে: output বের করা (`predict`), ভুল মাপা (`mse`), মান বদলানো (`train`-এর ভেতরের update)।

## সমস্যাটা কী?

এতক্ষণ সব হাতে হিসাব করেছি। দুটো উদাহরণের জন্য তা চলে, কিন্তু একশ ধাপ বা হাজার উদাহরণ হলে অসম্ভব। কম্পিউটারকে দিয়ে একই হিসাব করালে দুটো লাভ: দ্রুত, আর আমাদের হাতের হিসাব ঠিক ছিল কি না মিলিয়ে নেওয়া যায়।

## ধারণাটা সহজ ভাষায়

পুরো কাজ চারটা ছোট function-এ ভাগ হয়েছে, প্রতিটা একটা কাজ করে:

| Function | কাজ | আগের কোন lecture |
|---|---|---|
| `dot` | একটা উদাহরণের feature ও weight-এর dot product | Lecture 04 |
| `predict` | সব উদাহরণের অনুমান `ŷ = x · w + b` | Lecture 01, 04 |
| `mse` | অনুমান আর সঠিক উত্তরের MSE | Lecture 02 |
| `train` | বারবার gradient বের করে `w`, `b` update | Lecture 03, 04 |

Library দরকার নেই; শুধু Python-এর `sum`, `zip` আর list।

## Code

```python
def dot(row, w):
    return sum(x * wi for x, wi in zip(row, w))

def predict(X, w, b):
    return [dot(row, w) + b for row in X]

def mse(pred, y):
    return sum((p - t) ** 2 for p, t in zip(pred, y)) / len(y)

def train(X, y, w, b, lr, steps):
    n, k = len(y), len(w)                       # n উদাহরণ, k feature
    for _ in range(steps):
        err = [p - t for p, t in zip(predict(X, w, b), y)]
        grad_w = [2 / n * sum(err[i] * X[i][j] for i in range(n)) for j in range(k)]
        grad_b = 2 / n * sum(err)
        w = [wj - lr * g for wj, g in zip(w, grad_w)]   # নতুন = পুরোনো − lr × gradient
        b = b - lr * grad_b
    return w, b
```

`X` হলো list-of-lists (প্রতি ভেতরের list এক উদাহরণের feature)। `w` একটা list, `b` একটা সংখ্যা। `train` প্রতিবার পুরোনো `w`, `b` থেকে gradient বের করে তারপর দুটো একসঙ্গে বদলায়।

## পরীক্ষা ১: হাতের হিসাব মেলানো

Lecture 03-এর data, শুরু `w = 1`, `b = 0`, learning rate 0.1। হাতের হিসাব ছিল: ধাপ 1-এ `w = 1.8`, `b = 0.5`, MSE 0.65।

```python
X, y = [[1], [2]], [3, 5]
w, b = [1.0], 0.0
for step in range(4):
    print(step, [round(v, 3) for v in w], round(b, 3), round(mse(predict(X, w, b), y), 4))
    w, b = train(X, y, w, b, lr=0.1, steps=1)
w, b = train(X, y, [1.0], 0.0, lr=0.1, steps=500)
print("500 ধাপ পরে:", [round(v, 3) for v in w], round(b, 3), round(mse(predict(X, w, b), y), 6))
# output:
# 0 [1.0] 0.0 6.5
# 1 [1.8] 0.5 0.65
# 2 [2.05] 0.66 0.0708
# 3 [2.127] 0.713 0.0133
# 500 ধাপ পরে: [2.0] 1.0 0.0
```

ধাপ 1, 2, 3-এর সংখ্যা Lecture 03-এর table-এর সঙ্গে হুবহু মিলে গেছে। 500 ধাপ পরে `w = 2`, `b = 1`, MSE 0, যেটা আমরা Lecture 01-এ হাতে বের করেছিলাম।

## পরীক্ষা ২: Train ও Test

Lecture 05-এর data। শুরু `w = 0`, `b = 0`, learning rate 0.02, 3000 ধাপ, শুধু train অংশের ওপর।

```python
data = [(1, 3.2), (2, 4.8), (3, 7.3), (4, 8.9), (5, 11.2), (6, 12.8)]
train_X = [[x] for x, _ in data[:4]]; train_y = [y for _, y in data[:4]]
test_X = [[x] for x, _ in data[4:]];  test_y = [y for _, y in data[4:]]
w, b = train(train_X, train_y, [0.0], 0.0, lr=0.02, steps=3000)
print("w =", round(w[0], 3), " b =", round(b, 3))
print("train MSE:", round(mse(predict(train_X, w, b), train_y), 4))
print("test  MSE:", round(mse(predict(test_X, w, b), test_y), 4))
print("test অনুমান:", [round(p, 2) for p in predict(test_X, w, b)])
# output:
# w = 1.96  b = 1.15
# train MSE: 0.0405
# test  MSE: 0.0373
# test অনুমান: [10.95, 12.91]
```

`w = 1.96`, `b = 1.15` পেলাম; Lecture 05-এ আমরা এই মানই ধরে নিয়েছিলাম। `train` function test data কখনো দেখেনি। test MSE আলাদা করে শুধু মাপা হয়েছে।

## পরীক্ষা ৩: Learning rate বড় হলে

Lecture 03-এর সেই data, প্রথম পাঁচটা ধাপের MSE:

```python
X, y = [[1], [2]], [3, 5]
for lr in (0.1, 0.5):
    w, b = [1.0], 0.0
    losses = []
    for _ in range(5):
        losses.append(round(mse(predict(X, w, b), y), 2))
        w, b = train(X, y, w, b, lr, 1)
    print("lr =", lr, losses)
# output:
# lr = 0.1 [6.5, 0.65, 0.07, 0.01, 0.01]
# lr = 0.5 [6.5, 38.25, 225.28, 1327.01, 7816.82]
```

`lr = 0.5`-এ MSE কমার বদলে লাফিয়ে বাড়ছে। লাফ এত বড় যে প্রতিবার লক্ষ্য ছাড়িয়ে যাচ্ছে।

## পরীক্ষা ৪: দুই feature, code একই

Lecture 04-এর দুই-feature data-তে এক ধাপ (`lr = 0.01`), তারপর অনেক ধাপ (`lr = 0.05`)। কোড বদলাতে হয়নি, শুধু `X`-এর প্রতি সারিতে দুটো সংখ্যা।

```python
X = [[1, 2], [2, 1], [3, 3]]
y = [5, 4, 9]
w, b = train(X, y, [0.0, 0.0], 0.0, lr=0.01, steps=1)
print("এক ধাপ:", [round(v, 3) for v in w], round(b, 3), round(mse(predict(X, w, b), y), 3))
w, b = train(X, y, [0.0, 0.0], 0.0, lr=0.05, steps=2000)
print("2000 ধাপ:", [round(v, 3) for v in w], round(b, 3))
# output:
# এক ধাপ: [0.267, 0.273] 0.12 26.23
# 2000 ধাপ: [1.0, 2.0] 0.0
```

এক ধাপের সংখ্যা Lecture 04-এর হাতের হিসাবের সঙ্গে মিলল (`w = [0.267, 0.273]`, `b = 0.12`, MSE 26.23)। অনেক ধাপ পরে model সঠিক সম্পর্ক `y = 1 × x₁ + 2 × x₂ + 0` খুঁজে পেল।

## মনে রাখার সারকথা

- পুরো Linear Regression ২০ লাইনের Python: `predict` (output), `mse` (ভুল মাপা), `train`-এর ভেতরে gradient ও update।
- Code-এর ফল হাতের হিসাবের সঙ্গে মিলছে, এভাবে দুদিক থেকেই যাচাই হয়।
- Feature বাড়লে code বদলায় না; learning rate বেশি বড় হলে loss বাড়ে।

সাবধান: এই code ছোট ও শেখার জন্য। প্রতি ধাপে পুরো data ঘোরে, তাই বড় data-য় ধীর। বাস্তবে এর জন্য অপটিমাইজড library ব্যবহার করা হয়; কিন্তু ভেতরের হিসাব এই কাজটাই করে।

## নিজে করো

১. পরীক্ষা ১-এ `lr = 0.05` দিয়ে 1 ধাপ চালালে `w`, `b` কত হবে? (Lecture 03-এর অনুশীলন ১-এর সঙ্গে মেলাও।)
২. পরীক্ষা ২-এ `steps=3` করলে train MSE বড় না ছোট হবে বলে মনে হয়? কেন?
৩. পরীক্ষা ২-এর `data[:4]` বদলে শুধু প্রথম দুটো (`data[:2]`) train আর বাকি চারটা test নিয়ে 3000 ধাপ চালাও। train MSE ও test MSE কেমন হয়?

<details><summary>উত্তর</summary>

১. `w = 1.4`, `b = 0.25`। (Lecture 03-এর অনুশীলন ১-এর হাতের হিসাবের সঙ্গে হুবহু মেলে।)

২. 3 ধাপে model মাত্র `w ≈ 1.48`, `b ≈ 0.51`-এ পৌঁছায়, তাই train MSE অনেক বড়: প্রায় 3.68। 3000 ধাপে শেখা শেষ হয়, তখন 0.0405।

৩. দুটো train point-এর মধ্য দিয়ে প্রায় নিখুঁত রেখা যায় (`w ≈ 1.6`, `b ≈ 1.6`), তাই train MSE প্রায় 0। কিন্তু test (x = 3 থেকে 6) MSE প্রায় 1.68, যা আগের 0.0373-এর চেয়ে অনেক বেশি। কম train data-য় রেখা ঠিকমতো ধরা পড়েনি, এটা train MSE ছোট কিন্তু test MSE বড় হওয়ার উদাহরণ।

</details>

## পরের পাঠ

Module 02 এখানে শেষ। যেখানে উত্তর সংখ্যা না হয়ে "হ্যাঁ/না" category, সেখানে Linear Regression-এর অনুমানকে 0–1 probability-তে বদলাতে হয়: [Module 03](../module-03-logistic-regression/README.md)-এ। আর data কীভাবে ভাগ ও ঠিক করতে হয় তার যত্নের কথা [Module 05](../module-05-data-preparation-and-splits/README.md)-এ।
