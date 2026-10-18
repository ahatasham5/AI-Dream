# Lecture 03 — Logits ও Softmax: Score থেকে Probability

> আগে যা জানা থাকলে ভালো: [Bridge 01 — logits ও argmax](bridge-01-output-scores-and-selection.md) এবং [Sigmoid](../module-03-logistic-regression/lecture-01-sigmoid.md)। এই lecture শেষে পারবে: পাঁচটা score থেকে হাতে softmax বের করতে এবং temperature কী বদলায় তা বলতে।
> Map-এ অবস্থান: [Learning Map](../01-learning-map.md) → text model-এর output-এর হিসাব। Loss এখানে নেই, সেটা [Lecture 04](lecture-04-next-token-and-cross-entropy.md)-এ।

## সমস্যাটা কী?

Model-এর শেষে প্রতিটি token-এর জন্য একটা score আসে: ধরো `[1, 0, 3, 1, -1]`। এখান থেকে argmax দিয়ে বিজয়ী বাছা যায়। কিন্তু আমরা জানতে চাই "কোন token-এর সম্ভাবনা কত?"। Probability হতে হলে সংখ্যাগুলো 0-এর বেশি হতে হবে আর মোট হতে হবে 1। কাঁচা score-এর একটা negative, আর যোগফল 4। তাই score-কে probability বানানোর একটা নিয়ম দরকার।

## ধারণাটা সহজ ভাষায়

**Logits** কোথা থেকে আসে? শেষ hidden vector `h` আর output matrix। এই matrix-এ vocab-এর প্রতিটা token-এর জন্য একটা সারি। প্রতিটা সারির সঙ্গে `h`-এর dot product করলে সেই token-এর score হয়। [Bridge 01](bridge-01-output-scores-and-selection.md)-এ তিন অক্ষরের জন্য যা করেছি, এখানে সেটাই পাঁচ token-এর জন্য।

**Softmax** score-কে probability বানায় তিন ধাপে:

1. প্রতিটা score-এর `e` ঘাত নাও (`e ≈ 2.718`)। এতে সংখ্যা সবসময় 0-এর বেশি হয়, আর বড় score আরও বড় ফল দেয়।
2. সবগুলো যোগ করো।
3. প্রতিটাকে যোগফল দিয়ে ভাগ করো। এতে মোট ঠিক 1 হয়।

## ছোট একটা উদাহরণ

[Lecture 02](lecture-02-embedding.md)-এর পাঁচ token। ধরো model-এর শেষ vector `h = [1, 2]` এবং output matrix নিচের মতো (শেখানোর জন্য বসানো)।

| token | সারি | Score (logit) |
|---|---|---:|
| আমি | [1, 0] | 1×1 + 2×0 = 1 |
| ভাত | [2, -1] | 1×2 + 2×(-1) = 0 |
| খাই | [1, 1] | 1×1 + 2×1 = 3 |
| পানি | [-1, 1] | 1×(-1) + 2×1 = 1 |
| `<end>` | [-1, 0] | 1×(-1) + 2×0 = -1 |

**ধাপ ১ — e ঘাত:**

| token | আমি | ভাত | খাই | পানি | `<end>` |
|---|---:|---:|---:|---:|---:|
| e^score | 2.718 | 1.000 | 20.086 | 2.718 | 0.368 |

**ধাপ ২ — যোগফল:** 2.718 + 1.000 + 20.086 + 2.718 + 0.368 = **26.890**।

**ধাপ ৩ — ভাগ:** যেমন "খাই": 20.086 ÷ 26.890 = 0.747।

| token | আমি | ভাত | খাই | পানি | `<end>` |
|---|---:|---:|---:|---:|---:|
| Probability | 0.101 | 0.037 | 0.747 | 0.101 | 0.014 |

মোট 1। সবচেয়ে বড় score পেয়েছে সবচেয়ে বড় probability: "খাই" 74.7%। এই সংখ্যা model-এর নিজের মত; বাস্তবে "খাই" ঠিক কি না, তা আলাদা প্রশ্ন।

## Formula

যেখানে `z_i` হলো i-তম token-এর score:

`p_i = e^(z_i) ÷ (e^(z_1) + e^(z_2) + … + e^(z_n))`

উপরের হিসাবটাই এই লাইন। `p_খাই = e^3 ÷ 26.890 = 0.747`।

**Sigmoid-এর সঙ্গে যোগ:** token মাত্র দুটো হলে softmax আর [sigmoid](../module-03-logistic-regression/lecture-01-sigmoid.md) একই জিনিস। Score `[z, 0]` দিলে প্রথমটার softmax = `e^z ÷ (e^z + 1)` = `1 ÷ (1 + e^(-z))`। z = 2 হলে দুটোই 0.881। Binary logistic regression হলো দুই বিকল্পের softmax।

## Temperature: বিকল্পগুলোর মধ্যে ফারাক ছোট-বড় করা

Softmax-এর আগে সব score-কে একটা সংখ্যা **T** (temperature) দিয়ে ভাগ করা যায়।

- T < 1 (যেমন 0.5): score-এর ফারাক বড় হয়, বিজয়ী আরও প্রাধান্য পায়।
- T > 1 (যেমন 2): ফারাক ছোট হয়, probability সবার মধ্যে ছড়িয়ে যায়।

| T | আমি | ভাত | খাই | পানি | `<end>` |
|---|---:|---:|---:|---:|---:|
| 0.5 | 1.8% | 0.2% | 96.2% | 1.8% | প্রায় 0 |
| 1 | 10.1% | 3.7% | 74.7% | 10.1% | 1.4% |
| 2 | 17.6% | 10.7% | 47.8% | 17.6% | 6.5% |

Token-এর ক্রম একই থাকে, শুধু ছড়ানো বদলায়। T = 0.5-এর হিসাবে score হয়ে যায় `[2, 0, 6, 2, -2]`। Temperature কখন কাজে লাগে তা [Lecture 07](lecture-07-autoregressive-decoder-and-stopping.md)-এ।

## কোড

```python
import math

vocab = ["আমি", "ভাত", "খাই", "পানি", "<end>"]
h = [1, 2]                                  # শেষ hidden vector
W_out = [[1, 0], [2, -1], [1, 1], [-1, 1], [-1, 0]]   # প্রতি token-এর একটি row
logits = [sum(a * b for a, b in zip(h, row)) for row in W_out]
print("logits:", logits)

def softmax(z, T=1.0):
    exps = [math.exp(x / T) for x in z]
    total = sum(exps)
    return [e / total for e in exps]

for T in (1.0, 0.5, 2.0):
    p = softmax(logits, T)
    print("T =", T, [round(x, 3) for x in p], "sum =", round(sum(p), 3))

z = 2.0   # sigmoid = দুই score-এর softmax
print(round(1 / (1 + math.exp(-z)), 4), round(softmax([z, 0.0])[0], 4))
```

```text
# output:
logits: [1, 0, 3, 1, -1]
T = 1.0 [0.101, 0.037, 0.747, 0.101, 0.014] sum = 1.0
T = 0.5 [0.018, 0.002, 0.962, 0.018, 0.0] sum = 1.0
T = 2.0 [0.176, 0.107, 0.478, 0.176, 0.065] sum = 1.0
0.8808 0.8808
```

সাবধান: score খুব বড় (যেমন 1000) হলে `e^1000` কম্পিউটারে সামলানো যায় না। বাস্তব code তাই আগে সবার থেকে সবচেয়ে বড় score বাদ দিয়ে নেয়। সবার থেকে একই সংখ্যা বাদ দিলে probability বদলায় না, তাই ফল একই।

## মনে রাখার সারকথা

- Logits হলো প্রতি token-এর কাঁচা score: `h` আর output matrix-এর সারির dot product।
- Softmax: e ঘাত → যোগফল → ভাগ। ফল 0-এর বেশি আর মোট 1।
- Temperature সব score-কে ভাগ করে ছড়ানো বদলায়; token-এর ক্রম বদলায় না। দুই token হলে softmax = sigmoid।

## নিজে করো

১. Score `[2, 0]`-এর softmax কত?
২. তিনটি score সমান `[0, 0, 0]` হলে প্রতিটার probability কত?
৩. Score `[4, 2]` আর T = 2 হলে probability কত?

<details><summary>উত্তর</summary>

১. e² = 7.389, e⁰ = 1, যোগফল 8.389। Probability **[0.881, 0.119]**। (এটা sigmoid(2) = 0.881 মনে করায়।)
২. সবার e⁰ = 1, যোগফল 3, প্রতিটা 1 ÷ 3 = **0.333**।
৩. T = 2 হলে score হয় `[2, 1]`। e² = 7.389, e¹ = 2.718, যোগফল 10.107। Probability **[0.731, 0.269]**।

</details>

## পরের পাঠ

Probability তো পেলাম, কিন্তু model শেখে কীভাবে? সঠিক token-এর probability কত দিল, সেটাই মাপার জিনিস: [Lecture 04 — Next-token Prediction ও Cross-entropy](lecture-04-next-token-and-cross-entropy.md)।
