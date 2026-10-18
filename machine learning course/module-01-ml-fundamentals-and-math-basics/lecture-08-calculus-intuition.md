# Lecture 08 — Slope ও Gradient Descent

> আগে যা জানা থাকলে ভালো: [Lecture 03](lecture-03-how-supervised-learning-works.md) — training মানে loss কমে এমন দিকে parameter বদলানো; আর [Lecture 07](lecture-07-probability-and-statistics-basics.md)-এর square-এর হিসাব। এই lecture শেষে পারবে: slope দেখে parameter কোন দিকে বদলাতে হবে বলতে, এবং gradient descent-এর এক ধাপ হাতে করতে।

[Map-এ অবস্থান](../01-learning-map.md): সাধারণ math-এর উপকরণ → শেখানোর পদ্ধতির (update) ভিত্তি।

## সমস্যাটা কী?

[Lecture 03](lecture-03-how-supervised-learning-works.md)-এর শেষে দেখেছিলে `w = 2` আর `w = 4`-এর loss সমান। অর্থাৎ শুধু loss দেখে বলা যায় না `w` বাড়াব না কমাব। আবার সব সম্ভাব্য `w` চেষ্টা করাও অসম্ভব, কারণ বাস্তব model-এ parameter লক্ষ লক্ষ। দরকার এমন একটা সংখ্যা যা বলে দেয় কোন দিকে গেলে loss কমবে।

## ধারণাটা সহজ ভাষায়

কোনো parameter-কে একটুখানি বাড়ালে loss কত বদলায়, সেই বদলের হারকে বলে **slope** (গণিতের ভাষায় **derivative**)।

- Slope ঋণাত্মক হলে: parameter বাড়ালে loss কমে। তাই parameter বাড়াও।
- Slope ধনাত্মক হলে: parameter বাড়ালে loss বাড়ে। তাই parameter কমাও।
- Slope 0 হলে: ওই জায়গায় loss আর কমছে না, আমরা নিচে পৌঁছে গেছি।
- Slope যত বড়, loss তত দ্রুত বদলাচ্ছে।

একটা উপমা: কুয়াশায় পাহাড়ে দাঁড়িয়ে নিচে নামতে হবে। পুরো পাহাড় দেখা যায় না, কিন্তু পায়ের নিচের ঢাল কোন দিকে বুঝতে পারো। ঢালের উল্টো দিকে একটু হাঁটো, আবার ঢাল দেখো। এভাবে ছোট ছোট ধাপে নিচে পৌঁছানো যায়। এই পদ্ধতির নাম **gradient descent**।

## ছোট একটা উদাহরণ

একটা parameter `w` আর loss ধরি `loss(w) = (w − 3)²`। সবচেয়ে ভালো মান `w = 3` (সেখানে loss 0)। কিন্তু আমরা এটা জানি না, শুরু করছি `w = 0` থেকে।

**Slope দেখা।** `w = 1`-এ loss 4। `w` একটু বাড়িয়ে 1.01 করলে loss 3.9601। অর্থাৎ 0.01 বাড়ানোয় loss কমল 0.0399, মানে প্রতি এক একক বাড়ানোয় প্রায় 4 কমে। তাই slope প্রায় −4 (ঋণাত্মক, বাড়ালে loss কমে)। এই loss-এর সঠিক slope-এর সূত্র `2 × (w − 3)`; `w = 1`-এ সেটা `2 × (−2) = −4`। সূত্রটা কীভাবে বের হয় সেটা [Module 04](../module-04-math-foundations-practice/lecture-04-derivative-and-gradient-practice.md)-এ আসবে; এখন এটুকু ধরে নাও।

**Update।** নিয়ম: `নতুন w = পুরোনো w − α × slope`। এখানে **α** (alpha) হলো **learning rate**, প্রতি ধাপে কতটা বড় লাফ দেব তার মাপ। ধরি α = 0.1।

- `w = 0`: slope = 2 × (0 − 3) = −6। নতুন w = 0 − 0.1 × (−6) = 0.6।
- `w = 0.6`: slope = 2 × (0.6 − 3) = −4.8। নতুন w = 0.6 + 0.48 = 1.08।

প্রতিবার slope ঋণাত্মক ছিল, তাই `w` বেড়েছে। লক্ষ করো: নিচের কাছে এলে slope ছোট হয়, তাই লাফও আপনা-আপনি ছোট হয়।

**Learning rate বেশি বড় হলে।** α = 1.1 নিলে: `w = 0` থেকে `0 − 1.1 × (−6) = 6.6`, তারপর `6.6 − 1.1 × 7.2 = −1.32`। এবার `w` বারবার লক্ষ্য পার হয়ে দুই দিকে ছুটছে, loss 9 → 12.96 → 18.66 বেড়ে চলছে। তাই learning rate ছোট রাখতে হয়।

## কোড

```python
def loss(w):
    return (w - 3) ** 2

def slope(w):
    return 2 * (w - 3)

w, lr = 0.0, 0.1
for step in range(6):
    print(step, "w =", round(w, 3), "loss =", round(loss(w), 3), "slope =", round(slope(w), 3))
    w = w - lr * slope(w)
# output:
# 0 w = 0.0 loss = 9.0 slope = -6.0
# 1 w = 0.6 loss = 5.76 slope = -4.8
# 2 w = 1.08 loss = 3.686 slope = -3.84
# 3 w = 1.464 loss = 2.359 slope = -3.072
# 4 w = 1.771 loss = 1.51 slope = -2.458
# 5 w = 2.017 loss = 0.966 slope = -1.966
```

`w` ধীরে ধীরে 3-এর দিকে যাচ্ছে, loss কমছে। এই `loss`, `slope` আর `w` update-এর তিনটা কাজ ([Lecture 03](lecture-03-how-supervised-learning-works.md)-এর তিন ধাপের মতো) আলাদা রাখা আছে।

## একাধিক parameter হলে

Model-এ দুটো parameter থাকলে (যেমন `w` ও `b`) প্রতিটার জন্য আলাদা slope বের হয়। অন্যটা স্থির রেখে এই parameter বদলালে loss কত বদলায়, সেটাই তার slope। এই slope-গুলোর তালিকাকে বলে **gradient**। প্রতিটা parameter নিজের slope দিয়ে একই নিয়মে বদলায়। [Module 02-এর Lecture 03](../module-02-linear-regression/lecture-03-gradient-descent-training.md)-এ এটা `w` ও `b` দিয়ে দেখব।

## মনে রাখার সারকথা

- Slope বলে parameter বাড়ালে loss কোন দিকে আর কত দ্রুত বদলায়।
- Gradient descent: `নতুন মান = পুরোনো মান − learning rate × slope`, বারবার।
- Learning rate খুব বড় হলে লাফ লক্ষ্য ছাড়িয়ে যায়, loss বাড়তে পারে।

## নিজে করো

১. উপরের `loss(w) = (w − 3)²`-এ `w = 5` হলে slope কত? `w` বাড়াব না কমাব?
২. α = 0.1 হলে `w = 5` থেকে এক ধাপ পরে নতুন `w` কত?
৩. `w = 3`-এ slope কত? সেখানে update করলে `w` কী হয়?

<details><summary>উত্তর</summary>

১. Slope = 2 × (5 − 3) = 4, ধনাত্মক। অর্থাৎ `w` বাড়ালে loss বাড়ে, তাই `w` কমাতে হবে।

২. নতুন w = 5 − 0.1 × 4 = 4.6। (3-এর দিকে সরল।)

৩. Slope = 2 × (3 − 3) = 0। নতুন w = 3 − α × 0 = 3, কিছু বদলায় না। অর্থাৎ নিচের বিন্দুতে পৌঁছে গেলে update নিজে থেকেই থেমে যায়।

</details>

## পরের পাঠ

Module 01-এর ভিত্তি এখানে শেষ। [Module 02](../module-02-linear-regression/README.md)-এ এই সব উপকরণ একটা আসল model, Linear Regression-এ বসানো হবে।
