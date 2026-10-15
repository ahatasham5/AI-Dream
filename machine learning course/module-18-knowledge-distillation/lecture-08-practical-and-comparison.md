# Lecture 08 — Practical ও Comparison: Distillation, Quantization ও LoRA কখন কোনটা

> আগে যা জানা থাকলে ভালো: [Lecture 01–07](lecture-01-teacher-and-student.md), [Quantization](../module-13-pretraining-finetuning-and-lora/lecture-05-quantization-and-qlora.md) এবং [LoRA-র A/B matrix](../module-13-pretraining-finetuning-and-lora/lecture-04-lora-matrix-pairs-and-effective-weights.md)। এই lecture শেষে পারবে: তিনটা পদ্ধতি কী বদলায় তা আলাদা করে বলতে, একটা সমস্যার জন্য পদ্ধতি বেছে নিতে, এবং ছোট একটা distillation নিজে চালিয়ে ফল দেখতে।
> [Map-এ অবস্থান](../01-learning-map.md): তিনটা পদ্ধতি তিন আলাদা জায়গায় হাত দেয়। Distillation শেখার signal বদলায়, quantization সংখ্যার precision বদলায়, LoRA কোন parameter শেখা হবে তা বদলায়।

## সমস্যাটা কী?

"Model ছোট ও দ্রুত করো" শুনলে তিনটা নাম একসঙ্গে আসে: distillation, quantization, LoRA। সবই মডেলকে "হালকা" করে মনে হয়, কিন্তু আসলে তিনটা আলাদা জিনিস বদলায়। ভুল পদ্ধতি বাছলে সময় যায়, অথচ সমস্যা মেটে না। যেমন memory-তে ঢুকছে না বলে LoRA করলে memory কমে না।

## ধারণাটা সহজ ভাষায়

| | Distillation | Quantization | LoRA |
|---|---|---|---|
| কী বদলায় | নতুন student-এর weights, teacher-এর signal থেকে শেখা | একই weights-এর precision (কম bit) | মূল weights স্থির, ছোট A/B adapter শেখা |
| Weights-এর সংখ্যা | Student-এ কম হতে পারে | একই | মূল + ছোট adapter |
| Training | হ্যাঁ (student train) | সাধারণত না | হ্যাঁ, কিন্তু অল্প parameter |
| Memory (চালানোর সময়) | Student ছোট হলে কমে | কমে | কমে না |
| Latency | ছোট model-এ হিসাব কম, তাই কমে | hardware ও implementation-এর উপর নির্ভর | সাধারণত কমে না |
| মূল ঝুঁকি | Student teacher-এর চেয়ে কম পারে; teacher-এর ভুল আসে | সংখ্যার approximation থেকে মান কমা | Base model-এর সীমা, data-র মান |
| মূল কাজ | ছোট বা দ্রুত model, নতুন আচরণ | কম memory | নতুন কাজ বা domain-এ সস্তা adaptation |

LoRA adapter merge করলে চালানোর খরচ মূল model-এর সমান, তার কম নয়। Quantization-এর "মান কমা" আসলে মাপতে হয়, ধরে নেওয়া যায় না ([Module 13 Lecture 05](../module-13-pretraining-finetuning-and-lora/lecture-05-quantization-and-qlora.md))।

## ছোট একটা উদাহরণ: Memory-র হিসাব

7B teacher ও 1B student-এর শুধু weights, চার রকমে:

| | Weights |
|---|---|
| 7B, 16-bit | 14.0 GB |
| 7B, 4-bit | 3.5 GB |
| 1B, 16-bit | 2.0 GB |
| 1B, 4-bit | 0.5 GB |

LoRA-র জন্য `d = 4096`, rank `r = 8`: একটা `4096 × 4096` matrix-এ নতুন সংখ্যা `2 × 8 × 4096 = 65,536`, মূল matrix-এ 16,777,216। অনুপাত 0.39%।

```python
def weights_gb(params, bits):                 # শুধু weights-এর raw মাপ (activation ইত্যাদি বাদে)
    return params * bits / 8 / 1e9

print("7B teacher, 16-bit        :", weights_gb(7e9, 16), "GB")
print("7B teacher, 4-bit (quant.) :", weights_gb(7e9, 4), "GB")
print("1B student, 16-bit        :", weights_gb(1e9, 16), "GB")
print("1B student, 4-bit         :", weights_gb(1e9, 4), "GB")

d, r = 4096, 8                                # LoRA: d×d matrix-এর জন্য A (r×d) আর B (d×r)
print("LoRA: নতুন সংখ্যা", 2 * r * d, "| মূল matrix-এ", d * d, "| অনুপাত", round(2 * r * d / (d * d) * 100, 2), "%")
```

```text
# output:
7B teacher, 16-bit        : 14.0 GB
7B teacher, 4-bit (quant.) : 3.5 GB
1B student, 16-bit        : 2.0 GB
1B student, 4-bit         : 0.5 GB
LoRA: নতুন সংখ্যা 65536 | মূল matrix-এ 16777216 | অনুপাত 0.39 %
```

সাবধান: সত্যিকারের memory-তে activation, KV cache ও অন্য জিনিসও যোগ হয়, তাই পুরো মাপ এর চেয়ে বেশি।

## সিদ্ধান্ত-সারণি

| পরিস্থিতি | আগে ভাবো |
|---|---|
| Model GPU-র memory-তে ঢুকছে না, কাজের মান ঠিক আছে | Quantization (সবচেয়ে সস্তা, অল্প বা নেই training) |
| প্রতিদিন লাখো অনুরোধ, খরচ ও latency অনেক কমাতে হবে, কাজ সংকীর্ণ | Distillation (ছোট student) |
| নতুন domain বা ধরনে অভ্যস্ত করাতে হবে, GPU কম | LoRA (SFT-এর সঙ্গে) |
| Teacher শুধু API-তে, probability পাওয়া যায় না | Response distillation ([Lecture 02](lecture-02-response-and-sequence-distillation.md)) |
| Memory আর latency দুটোই কমাতে হবে | আগে distill, তারপর student quantize; দরকার হলে student-এ LoRA |

**কম খরচের পথ:** আগে নিজের model quantize করে মান আর গতি মাপো। যথেষ্ট না হলে API-র teacher থেকে কয়েক হাজার উদাহরণ লিখিয়ে response distillation। খরচ প্রায় `prompt সংখ্যা × গড় token × teacher-এর দাম প্রতি token` (দাম তোমার provider-এর তালিকা থেকে নাও)।

**Production-গ্রেড পথ:** baseline মাপা, response ও probability দুই সংকেতে distill, [Lecture 07-এর বাছাই](lecture-07-reasoning-data-and-verification.md), দরকারে on-policy ([Lecture 06](lecture-06-on-policy-and-offline.md)), তারপর quantize। শেষে একই held-out test data-য় মান, latency ও memory মাপা।

**সুপারিশ:** সস্তা পথ দিয়ে শুরু করো। Quantization আর baseline মাপা প্রায় বিনা খরচে হয়। Distillation-এর training খরচ তখনই দাও যখন মেপে দেখো ছোট student-এর বাস্তব দরকার। শুরুতেই "কত মান হারানো চলবে" সংখ্যায় ঠিক করে নাও; নইলে "যথেষ্ট ভালো" কী তা বলা যায় না।

## একটা খেলনা Distillation

লক্ষ্য: ছোট student, teacher-এর soft target থেকে শিখুক; তুলনা করো শুধু hard label থেকে শেখার সঙ্গে।

- **Teacher:** 2 input → 4 ReLU hidden → 3 class, 27টা fixed সংখ্যা।
- **Student:** 2 input → 3 class সরাসরি (softmax), মাত্র 9টা সংখ্যা।
- **Hard:** teacher যে class-এ সবচেয়ে বেশি probability দেয় সেটাই label `[1, 0, 0]` ধরনের।
- **Soft:** teacher-এর পুরো probability (T = 1)। Loss-এর gradient `q − p` ([Lecture 04](lecture-04-distillation-loss.md))।
- **মাপ:** student-এর শেখা না-দেখা 2,000 point-এ (ক) student-এর সেরা class teacher-এর সঙ্গে কতটা মেলে, (খ) গড় `KL(teacher ‖ student)`।

প্রথম অংশ: model ও training।

```python
import math, random

def softmax(z):
    m = max(z); e = [math.exp(v - m) for v in z]; s = sum(e)
    return [v / s for v in e]

# Teacher: 2 input -> 4 ReLU hidden -> 3 class (fixed weights, মোট 27 সংখ্যা)
W1 = [[1.5, -1.0], [-1.0, 1.5], [1.0, 1.0], [-1.5, -1.5]]; b1 = [0.0, 0.0, -0.5, 0.5]
W2 = [[1.5, -1.0, 0.5, -1.0], [-1.0, 1.5, 0.5, -1.0], [-0.5, -0.5, -1.0, 1.5]]; b2 = [0.0, 0.0, 0.0]

def teacher(x):
    h = [max(0.0, sum(w * v for w, v in zip(r, x)) + b) for r, b in zip(W1, b1)]
    return softmax([sum(w * v for w, v in zip(r, h)) + b for r, b in zip(W2, b2)])

def student(W, x):                 # Student: 2 input -> 3 class (মোট 9 সংখ্যা)
    return softmax([W[k][0] * x[0] + W[k][1] * x[1] + W[k][2] for k in range(3)])

def train(xs, targets, epochs=400, lr=0.5):
    W = [[0.0] * 3 for _ in range(3)]
    for _ in range(epochs):
        for x, t in zip(xs, targets):
            q = student(W, x)
            for k in range(3):     # logit k-এর gradient = q_k - target_k
                g = (q[k] - t[k]) / len(xs)
                W[k][0] -= lr * g * x[0]; W[k][1] -= lr * g * x[1]; W[k][2] -= lr * g
    return W

def evaluate(W, tests):            # teacher-এর সঙ্গে মিল, আর গড় KL(teacher || student)
    agree = kl = 0.0
    for x in tests:
        p, q = teacher(x), student(W, x)
        agree += p.index(max(p)) == q.index(max(q))
        kl += sum(a * math.log(a / b) for a, b in zip(p, q) if a > 0)
    return agree / len(tests), kl / len(tests)
```

দ্বিতীয় অংশ: পরীক্ষা (উপরের কোডের নিচেই জুড়ে চালাতে হবে)।

```python
rng = random.Random(0)
point = lambda: (rng.uniform(-2, 2), rng.uniform(-2, 2))
tests = [point() for _ in range(2000)]          # যে point student দেখেনি

for n in (6, 12, 30):                           # training point-এর সংখ্যা
    score = {"hard": [], "soft": []}
    for trial in range(20):                     # 20 বার আলাদা training set
        xs = [point() for _ in range(n)]
        soft = [teacher(x) for x in xs]         # teacher-এর পুরো probability
        hard = [[1.0 if k == p.index(max(p)) else 0.0 for k in range(3)] for p in soft]
        score["hard"].append(evaluate(train(xs, hard), tests))
        score["soft"].append(evaluate(train(xs, soft), tests))
    for name, r in score.items():
        print("n=%2d %s: মিল=%.3f  KL=%.3f" % (n, name, sum(a for a, _ in r) / 20, sum(k for _, k in r) / 20))
```

```text
# output:
n= 6 hard: মিল=0.774  KL=0.617
n= 6 soft: মিল=0.877  KL=0.155
n=12 hard: মিল=0.898  KL=0.179
n=12 soft: মিল=0.962  KL=0.032
n=30 hard: মিল=0.942  KL=0.069
n=30 soft: মিল=0.986  KL=0.012
```

**ফল পড়া:** 6টা মাত্র training point-এ soft target-এর student teacher-এর সঙ্গে 87.7% মিলেছে, hard label-এ 77.4%। কারণ soft target-এ প্রতিটা point থেকে student তিনটা সংখ্যা পায়, hard-এ শুধু একটা class। Training point বাড়লে ফারাক কমে (n = 30-এ 98.6% বনাম 94.2%)। এই KL-এর বড় ফারাক দেখায় hard label-এর student বেশি আত্মবিশ্বাসী হয়ে ভুল probability দেয়।

**সীমা:** এটা খেলনা। Teacher ও student দুটোই খুব ছোট, data দুই-মাত্রার, আর 20 বারের গড় ধরে এক seed-এর ফল। বাস্তব বড় model-এ এই ফারাক একই থাকবে বলা যায় না; সেখানে মাপতে হবে।

## মনে রাখার সারকথা

- Distillation শেখার signal বদলায়, quantization precision বদলায়, LoRA কোন parameter শেখা হবে তা বদলায়। তাই তিনটা সমস্যায় আলাদা কাজ করে।
- Memory না কমলে LoRA সমাধান নয়; ছোট student বা quantization দরকার। কাজ সংকীর্ণ আর অনুরোধ বিপুল হলে distillation সুবিধাজনক।
- যেকোনো পদ্ধতির পরে একই held-out data-য় মান, latency আর memory মাপতে হবে।

## নিজে করো

১. 13B model, 16-bit আর 4-bit; আর 3B student, 16-bit। প্রতিটার weights কত GB? শুধু weights ধরলে 8 GB GPU-তে কোনগুলো ধরবে?
২. `d = 1024`, `r = 16`। LoRA-র নতুন সংখ্যা কত? মূল `d × d` matrix-এর কত শতাংশ?
৩. (ক) Model 20 GB, GPU 16 GB, কাজের মান ঠিক। (খ) নতুন পরিভাষায় অভ্যস্ত করাতে হবে, একটা GPU। (গ) প্রতিদিন লাখো অনুরোধ, API-খরচ কমাতে হবে, কাজ সংকীর্ণ। কোনটায় কোন পদ্ধতি আগে ভাববে?
৪. খেলনা পরীক্ষায় n = 12-এ soft আর hard-এর মিলের পার্থক্য কত শতাংশ-পয়েন্ট?

<details><summary>উত্তর</summary>

১. 13B 16-bit = 13e9 × 2 = **26 GB**; 13B 4-bit = 13e9 × 0.5 = **6.5 GB**; 3B 16-bit = **6 GB**। 8 GB-তে ধরে **13B 4-bit (6.5)** ও **3B 16-bit (6)**; 26 GB ধরে না। (Activation বাদে, তাই বাস্তবে আরও জায়গা লাগবে।)
২. `2 × 16 × 1024 = 32,768`। মূল matrix `1,048,576`। অনুপাত `32,768 ÷ 1,048,576 = 3.125%`।
৩. (ক) **Quantization**। (খ) **LoRA** (SFT-এর সঙ্গে)। (গ) **Distillation** (ছোট student), তারপর দরকারে quantization।
৪. 0.962 − 0.898 = 0.064, অর্থাৎ **6.4 শতাংশ-পয়েন্ট**।

</details>

## পরের পাঠ

এই module-এর শেষ lecture এটাই। তিনটা পদ্ধতি বাস্তব একটা project-এ কীভাবে বসে তা দেখতে চাইলে পরে [Module 14 — OCR case study](../module-14-ocr-system-case-study/README.md)। পদ্ধতি বাছার আগে model-এর মান কীভাবে মাপে তা মনে রাখতে [Module 06-এর baseline](../module-06-model-evaluation-and-baselines/lecture-01-baselines.md) দেখতে পারো।
