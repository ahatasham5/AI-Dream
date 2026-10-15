# Lecture 08 — Pure Python-এ একটি Neural Network শুরু থেকে Train করা

> আগে যা জানা থাকলে ভালো: [Backpropagation](lecture-04-backpropagation.md), [Optimizer ও learning rate](lecture-05-optimizer-and-learning-rate.md), [Batch, step ও epoch](lecture-06-batch-step-and-epoch.md)। এই lecture শেষে পারবে: একটা ছোট network-এর forward, backward ও update কোডের কোন লাইন কোন ধাপ তা চিনতে, আর code চালিয়ে loss কমতে দেখতে।

## সমস্যাটা কী?

এ পর্যন্ত প্রতিটি ধাপ আলাদা করে শেখা হয়েছে। এখন সব একসঙ্গে জুড়ে একটা সত্যিকারের network train করে দেখা দরকার, নইলে ধাপগুলো কাগজেই থেকে যায়। কাজটা হবে **XOR**:

| `x₁` | `x₂` | target |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

দুটো input আলাদা হলে 1, একই হলে 0। Weighted sum ও bias-এর কোনো সরল model এটা পারে না। এই চারটা input-এ সরল model-এর সবচেয়ে ভালো ফল হলো সব input-এ `0.5` বলা, তখন loss `0.25`। Hidden layer আর ReLU-র মতো activation ([Module 09 — Activation](../module-09-model-architecture/lecture-04-activation.md)) থাকলে network এটা শিখতে পারে। তাই XOR ছোট হলেও network-এর দরকার বোঝানোর ভালো উদাহরণ।

## ধারণাটা সহজ ভাষায়

Network `2 → 4 → 1`: দুটি input, চারটি ReLU hidden unit, একটি output (activation ছাড়া)। Parameter গোনা: `4 × (2 + 1) + (4 + 1) = 17` ([গণনার নিয়ম](../module-09-model-architecture/lecture-07-shapes-and-parameter-count.md))।

শুরুতে parameter-এ কী মান বসবে? এটাকে বলে **initialization**। আমরা ছোট random সংখ্যা বসাই। সব weight একই মান হলে চারটা hidden unit একই হিসাব করে, একই gradient পায়, আর কখনো আলাদা হয় না। Random মান সেটা ভাঙে।

কোডের কাঠামো আগের lecture-গুলোর সরাসরি রূপ:

| কোডের অংশ | কোন lecture |
|---|---|
| `forward` | [Module 09 — Forward pass](../module-09-model-architecture/lecture-06-forward-pass.md) |
| `total += (y − t)²` | Loss (MSE) |
| `dy`, `dz` ও `gW`-এর লাইন | [Backpropagation](lecture-04-backpropagation.md) |
| শেষে `W -= LR × gW` | [Gradient descent](lecture-05-optimizer-and-learning-rate.md) |
| বাইরের `for epoch` | [Epoch ও step](lecture-06-batch-step-and-epoch.md) |

এখানে 4টা sample-ই এক batch (batch size 4), তাই প্রতি epoch-এ একটাই step। Data মাত্র 4টা, আলাদা validation data বানানো যায় না; এটা শুধু loop দেখার উদাহরণ।

## কোড

পুরো প্রোগ্রাম (Python standard library, 39 লাইন):

```python
# A tiny neural network (2 -> 4 -> 1) trained on XOR, pure Python
import random
random.seed(0)
H, LR = 4, 0.05
data = [([0, 0], 0), ([0, 1], 1), ([1, 0], 1), ([1, 1], 0)]

W1 = [[random.uniform(-1, 1) for _ in range(2)] for _ in range(H)]
b1 = [0.1] * H
W2 = [random.uniform(-1, 1) for _ in range(H)]
b2 = 0.0

def forward(x):
    z = [W1[j][0]*x[0] + W1[j][1]*x[1] + b1[j] for j in range(H)]
    h = [max(0.0, v) for v in z]                    # ReLU
    y = sum(W2[j]*h[j] for j in range(H)) + b2
    return z, h, y

for epoch in range(0, 1501):
    gW1 = [[0.0, 0.0] for _ in range(H)]; gb1 = [0.0]*H
    gW2 = [0.0]*H; gb2 = 0.0; total = 0.0
    for x, t in data:
        z, h, y = forward(x)
        total += (y - t) ** 2
        dy = 2 * (y - t) / len(data)                # dL/dy (4টার গড়)
        gb2 += dy
        for j in range(H):
            gW2[j] += dy * h[j]
            dz = dy * W2[j] * (1.0 if z[j] > 0 else 0.0)
            gb1[j] += dz
            gW1[j][0] += dz * x[0]; gW1[j][1] += dz * x[1]
    if epoch % 250 == 0:
        print(epoch, round(total / len(data), 4))
    for j in range(H):                              # update
        W2[j] -= LR * gW2[j]; b1[j] -= LR * gb1[j]
        W1[j][0] -= LR * gW1[j][0]; W1[j][1] -= LR * gW1[j][1]
    b2 -= LR * gb2

for x, t in data:
    print(x, "target", t, "prediction", round(forward(x)[2], 3))
```

চালালে:

```text
0 0.4842
250 0.166
500 0.1572
750 0.0818
1000 0.005
1250 0.0001
1500 0.0
[0, 0] target 0 prediction 0.001
[0, 1] target 1 prediction 0.998
[1, 0] target 1 prediction 1.0
[1, 1] target 0 prediction 0.001
```

প্রথম লাইনের `0.4842` হলো একেবারে শুরুর (random parameter-এর) loss; তখন network-এর prediction আন্দাজি। `1500`-তে loss প্রায় শূন্য, আর চারটা prediction target-এর কাছে। অর্থাৎ network XOR শিখেছে।

লক্ষ করো, `250` থেকে `500` পর্যন্ত loss প্রায় একই (`0.166 → 0.1572`), তারপর হঠাৎ নামছে। Training-এর পথ সবসময় মসৃণ নয়।

## Initialization ও learning rate-এর প্রভাব

কোডে `random.seed(...)` ও `LR` বদলে চালিয়ে দেখা গেছে (`LR`-এর সারিগুলোতে `seed 0` রাখা হয়েছে):

| পরিবর্তন | 1500 epoch-এর পরে loss |
|---|---|
| `seed 3` | `0.0` (শিখেছে) |
| `seed 1` | `0.25`, আটকে (prediction সব `0.5`) |
| `seed 2` | `0.25`, আটকে |
| `LR = 0.2` | 500 epoch-এই `0.0` |
| `LR = 0.001` | `0.2146`, ধীর |
| `LR = 0.5` | `0.125`, আটকে |

`seed 1`-এ আটকে যাওয়ার কারণ দেখা গেছে: দুটি hidden unit সব input-এ `0` দিচ্ছে (ReLU "মৃত"), বাকি দুটি সব input-এ ধনাত্মক। তখন network কার্যত সরল হয়ে যায়, আর সরল model-এর সেরা উত্তর `0.5`। অর্থাৎ ভালো initialization ও learning rate না হলে সব ঠিক থাকলেও training আটকে যেতে পারে। এ কারণেই বাস্তবে এগুলো সাবধানে বেছে নেওয়া হয়।

## মনে রাখার সারকথা

- Network train করা মানে একটা লুপ: forward → loss → backward → update, বারবার।
- কোড লম্বা হলেও প্রতিটা লাইন আগের lecture-এর এক ধাপ; নতুন কোনো ধারণা এতে নেই।
- Initialization ও learning rate ভুল হলে loss আটকে যেতে পারে; তাই এগুলো পরীক্ষা করে বাছতে হয়।

## নিজে করো

1. এই network-এ মোট parameter কয়টা? `H = 8` করলে কয়টা?
2. `LR = 0.001` নিয়ে 1500 epoch-এ loss কেন `0.2146`-এ থেমে নেই, শুধু ধীর? [Lecture 05](lecture-05-optimizer-and-learning-rate.md)-এর ভিত্তিতে বলো।
3. ধরো `dy`-এর লাইনে `/ len(data)` বাদ দেওয়া হলো। Gradient কত গুণ হবে? এর প্রভাব কী?

<details><summary>উত্তর</summary>

1. `4 × 3 + 5 = 17`। `H = 8`-এ `8 × 3 + (8 + 1) = 33`।

2. Learning rate ছোট, তাই প্রতি step ছোট। Loss নামছে (শুরুর `0.4842` থেকে `0.2146`), কিন্তু আস্তে। আরও অনেক epoch লাগবে, বা learning rate বাড়াতে হবে (`LR = 0.2`-এ 500 epoch-এই শেষ)।

3. Gradient `4` গুণ হবে (loss এখন গড়ের বদলে যোগফলের gradient)। তাই `LR = 0.05` রেখেও কাজ হবে `LR = 0.2`-এর সমান। এই ছোট সমস্যায় সেটা ভালো চলে (উপরের table: `LR = 0.2`-এ 500 epoch-এই `0.0`; `/ len(data)` বাদ দিয়ে চালালেও একই ফল পাওয়া গেছে)। কিন্তু batch size বদলালে gradient-এর আকারও বদলাত, তাই সাধারণত গড় ধরা হয়, যাতে learning rate batch size-এর উপর কম নির্ভর করে।

</details>

## পরের পাঠ

Module 10 এখানে শেষ। Network কীভাবে শেখে তা এখন হাতে-কলমে দেখা হলো। ছবি ও text কীভাবে সংখ্যায় রূপ নিয়ে network-এ ঢোকে, সেটা পরের module-গুলোর বিষয়: [Module 11 — Image representation](../module-11-image-representation-and-vision/README.md)।
