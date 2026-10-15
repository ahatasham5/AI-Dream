# Lecture 05 — Optimizer ও Learning Rate

> আগে যা জানা থাকলে ভালো: [Backpropagation থেকে পাওয়া gradient](lecture-04-backpropagation.md) এবং [Gradient descent-এর প্রথম উদাহরণ](../module-02-linear-regression/lecture-03-gradient-descent-training.md)। এই lecture শেষে পারবে: learning rate কম, ঠিক, বেশি হলে কী ঘটে তা সংখ্যায় বলতে এবং momentum ও Adam কোন অংশ বদলায় তা বলতে।

## সমস্যাটা কী?

Gradient বলে "কোন দিকে সরো"। কিন্তু কতটা সরবে? আস্তে সরলে অনেক সময় লাগে। বেশি জোরে সরলে ভালো জায়গা পার হয়ে যায়, loss কমার বদলে বেড়ে যেতে পারে। Gradient হাতে নিয়ে parameter বদলানোর নিয়মটাকে বলে **optimizer**। যারা model train করেন, তাদের প্রথম বড় সিদ্ধান্তগুলোর একটা হলো কোন optimizer ও কোন learning rate।

## ধারণাটা সহজ ভাষায়

সবচেয়ে সরল optimizer হলো **gradient descent**:

`নতুন w = পুরোনো w − learning rate × gradient`

**Learning rate** (`lr`) হলো এক ধাপের "আকার" ঠিক করা সংখ্যা। এটা weight বা bias-এর মতো শেখা হয় না। আমরা হাতে বেছে দিই, তাই এটা একটা **hyperparameter** ([Module 09 — Parameters ও hyperparameters](../module-09-model-architecture/lecture-02-parameters-and-hyperparameters.md))।

## ছোট একটা উদাহরণ: চার রকম learning rate

আগের মতো একটাই weight: `prediction = 3w + 1`, target `5`, তাই `loss = (3w − 4)²`। শুরুতে `w = 2` (loss `4`)। সেরা `w` হলো `4/3 ≈ 1.333` (তখন loss `0`)। চার রকম learning rate-এ 5টা update:

| learning rate | step 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 0.01 | 4 | 2.69 | 1.808 | 1.216 | 0.818 | 0.55 |
| 0.05 | 4 | 0.04 | 0.0 | 0.0 | 0.0 | 0.0 |
| 0.1 | 4 | 2.56 | 1.638 | 1.049 | 0.671 | 0.429 |
| 0.12 | 4 | 5.382 | 7.243 | 9.746 | 13.114 | 17.646 |

(এগুলো loss-এর মান। `0.0` মানে `0.001`-এর চেয়েও ছোট।)

- **0.01 (ছোট):** loss কমছে, কিন্তু আস্তে। 5 ধাপেও `0.55`।
- **0.05 (ভালো):** দ্বিতীয় ধাপেই প্রায় শূন্য।
- **0.1 (একটু বেশি):** loss কমছে, কিন্তু `w` ডান-বাঁয়ে লাফাচ্ছে: `2 → 0.8 → 1.76 → 0.992 → 1.606 → 1.115`। সেরা মান `1.333` বারবার পার হচ্ছে।
- **0.12 (অনেক বেশি):** প্রতি ধাপে loss **বাড়ছে**। Training ভেঙে পড়ছে, একে বলে **diverge** করা।

সাবধান: `0.05` এখানে ভালো কারণ এই ছোট সমস্যায় gradient-এর আকার এমন। অন্য model, অন্য data-তে ভালো learning rate আলাদা। তাই learning rate সবসময় পরীক্ষা করে ঠিক করতে হয়।

## Momentum ও Adam: কী বদলায়?

Plain gradient descent-এ প্রতি ধাপ শুধু **বর্তমান** gradient দেখে। বড় network-এ এতে ধীর বা এলোমেলো চলা হয়। তাই আরও চালাক optimizer আছে। এই lecture-এ শুধু পরিচয়; হাতে পূর্ণ হিসাব নয়। একই update ছাঁচের কোন অংশ বদলাচ্ছে সেটাই মূল কথা:

| Optimizer | কোন অংশ বদলায় | সহজ কথায় |
|---|---|---|
| Gradient descent | কিছু না: `ধাপ = lr × gradient` | বর্তমান gradient দেখে সরো |
| Momentum | gradient-এর জায়গায় আগের gradient-গুলোর জমানো "গতি" `v` | একই দিকে চলতে থাকলে গতি বাড়ে |
| Adam | momentum, আর প্রতিটি parameter-এর ধাপ তার gradient-এর সাধারণ আকার দিয়ে ছোট-বড় করা | বড় gradient আর ছোট gradient-এর parameter প্রায় সমান ধাপে সরে |

**Momentum:** `v = β × v + gradient`, তারপর `w = w − lr × v`। `β` সাধারণত `0.9`। উপরের সমস্যায় `lr = 0.01`, `β = 0.9`-এ প্রথম 5টা `w`:

- Plain: `1.88, 1.782, 1.701, 1.635, 1.58`
- Momentum: `1.88, 1.674, 1.427, 1.187, 0.999`

Momentum দ্রুত এগোচ্ছে। কিন্তু 4র্থ ধাপে `1.187`, সেরা মান `1.333` পার হয়ে গেছে। গতি জমলে লক্ষ্য পার হয়ে ফেরত আসতেও পারে।

**Adam:** প্রথম ধাপে দুটো parameter-এর gradient `12` ও `0.12` হলে, `lr = 0.01`-এ plain gradient descent-এর ধাপ `0.12` ও `0.0012`। Adam-এ দুটোরই ধাপ প্রায় `0.01`। অর্থাৎ gradient-এর আকার যাই হোক, সব parameter প্রায় সমান গতিতে শেখা শুরু করে। বড় model train করতে Adam-ধরনের optimizer ব্যাপকভাবে ব্যবহার হয়।

## কোড

উপরের প্রথম table-এর কোড:

```python
def loss(w):
    return (3 * w + 1 - 5) ** 2          # prediction = 3w + 1, target = 5

def grad(w):
    return 2 * (3 * w + 1 - 5) * 3

for lr in (0.01, 0.05, 0.1, 0.12):
    w, losses = 2.0, []
    for step in range(6):
        losses.append(round(loss(w), 3))
        w = w - lr * grad(w)             # gradient descent
    print(lr, losses)

# output:
# 0.01 [4.0, 2.69, 1.808, 1.216, 0.818, 0.55]
# 0.05 [4.0, 0.04, 0.0, 0.0, 0.0, 0.0]
# 0.1 [4.0, 2.56, 1.638, 1.049, 0.671, 0.429]
# 0.12 [4.0, 5.382, 7.243, 9.746, 13.114, 17.646]
```

## মনে রাখার সারকথা

- Optimizer = gradient থেকে নতুন parameter বানানোর নিয়ম। সবচেয়ে সরল: `w − lr × gradient`।
- Learning rate ছোট হলে ধীর, বড় হলে লাফালাফি বা diverge। সঠিক মান পরীক্ষা করে বের করতে হয়।
- Momentum আগের gradient জমিয়ে গতি দেয়; Adam প্রতি parameter-এর ধাপ আলাদা করে মাপে। দুটোই update ছাঁচের একটা অংশ বদলায়, gradient বের করার পদ্ধতি নয়।

## নিজে করো

1. `w = 2`, gradient `12`, learning rate `0.02`-এ নতুন `w` ও নতুন loss কত?
2. একই `w = 2`-এ learning rate `0.2` নিলে কী হয়?
3. Momentum (`β = 0.9`, `lr = 0.01`) দিয়ে `w = 2` থেকে প্রথম দুই ধাপ করো। দ্বিতীয় ধাপের gradient হাতে বের করো।

<details><summary>উত্তর</summary>

1. `নতুন w = 2 − 0.02 × 12 = 1.76`। `loss = (3 × 1.76 − 4)² = 1.28² = 1.6384`।

2. `নতুন w = 2 − 0.2 × 12 = −0.4`। `loss = (3 × (−0.4) − 4)² = (−5.2)² = 27.04`। Loss `4` থেকে বেড়ে `27.04` হয়েছে, learning rate অনেক বড়।

3. প্রথম ধাপ: `v = 0.9 × 0 + 12 = 12`, `w = 2 − 0.01 × 12 = 1.88`। দ্বিতীয় ধাপের gradient: `2 × (3 × 1.88 − 4) × 3 = 6 × 1.64 = 9.84`। `v = 0.9 × 12 + 9.84 = 20.64`, `w = 1.88 − 0.01 × 20.64 = 1.6736`। (মিলিয়ে দেখো: উপরের তালিকায় `1.674`।)

</details>

## পরের পাঠ

আসল training-এ হাজার হাজার sample থাকে। প্রতি update-এ কতগুলো sample ব্যবহার হবে, আর পুরো data কতবার ঘোরা হবে? এটা [Lecture 06 — Batch, step ও epoch](lecture-06-batch-step-and-epoch.md)-এ আসছে।
