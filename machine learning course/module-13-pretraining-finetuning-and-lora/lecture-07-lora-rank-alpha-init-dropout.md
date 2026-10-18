# Lecture 07 — LoRA-র চারটা Setting: Rank, Alpha, শুরুর মান, Dropout

> আগে যা জানা থাকলে ভালো: [A, B-র আকার ও `ΔW = s·B·A`](lecture-04-lora-matrix-pairs-and-effective-weights.md) আর [gradient কীভাবে parameter বদলায়](../module-10-neural-network-training/lecture-04-backpropagation.md)। এই lecture শেষে পারবে: LoRA-র প্রতিটা setting formula-র কোন অংশ বদলায় তা বলতে, আর কেন B শূন্য দিয়ে শুরু হয় তা সংখ্যায় দেখাতে। ([Map-এ অবস্থান](../01-learning-map.md): LoRA-র hyperparameter। এগুলো শেখা মান নয়, training-এর আগে ঠিক করা সেটিং।)

## সমস্যাটা কী?

LoRA config-এ চারটা সেটিং বারবার চোখে পড়ে: `r`, `alpha`, শুরুর মান, `dropout`। নাম দেখে গুলিয়ে ফেলা সহজ, আর ভুল সেটিং-এ training অকেজো হতে পারে। মনে রাখার সহজ উপায়: প্রতিটা সেটিং LoRA-র একটা নির্দিষ্ট অংশ বদলায়। Formula-টা আবার দেখো:

**`z = Wx + b + s × B( A( dropout(x) ) )`, যেখানে `s = α / r`**

| Setting | formula-র কোন অংশ | কী নিয়ন্ত্রণ করে |
|---|---|---|
| **r** (rank) | A, B-র আকার | সংশোধনের "ক্ষমতা" আর parameter সংখ্যা |
| **α** (alpha) | `s = α / r` | সংশোধন কত জোরে যোগ হবে |
| শুরুর মান | A, B-র training-পূর্ব মান | training শুরুতে model কেমন থাকবে |
| **dropout** | LoRA পথের input | training-এর সময় বাড়তি এলোমেলো বাধা |

## r: সংশোধনের ক্ষমতা

`W` যদি `m×d` হয়, `ΔW = B·A` হয় `m×d`, কিন্তু তার **rank** সর্বোচ্চ `r`। Rank-এর সহজ অর্থ: matrix-টা কয়টা স্বাধীন row দিয়ে গঠিত। `r = 1` হলে `B` একটা column, `A` একটা row, আর `BA`-র প্রতিটা row ওই একই row-এর গুণিতক:

```text
B = [1, 2, 0, −1]ᵀ,  A = [1, 0, 2, 1]
BA = [[ 1, 0,  2,  1],     ← A × 1
      [ 2, 0,  4,  2],     ← A × 2
      [ 0, 0,  0,  0],     ← A × 0
      [−1, 0, −2, −1]]     ← A × (−1)
```

`r` বাড়ালে সংশোধন আরও বৈচিত্র্য পায়, কিন্তু `r × (d + m)` সূত্রে parameter ও বাড়ে। 1000×1000 matrix-এ `r = 1, 8, 64`-এ trainable যথাক্রমে 2,000, 16,000 আর 128,000 (W-র 0.2%, 1.6%, 12.8%)। কোন r ভালো, সেটা কাজ আর data দেখে পরীক্ষা করে ঠিক করতে হয়।

## α: সংশোধনের জোর

Standard LoRA-তে `s = α / r`। অর্থাৎ α দিয়ে LoRA পথের ফল কতগুণ হবে ঠিক হয়:

```text
r=2, α=4 → s = 2        r=4, α=8 → s = 2
r=4, α=4 → s = 1        r=8, α=8 → s = 1
```

`r` বদলালেও α/r এক রাখলে সংশোধনের জোর একই থাকে। LoRA paper-এর উদ্দেশ্য ছিল `r` পরিবর্তনের সময় অন্য সেটিং বারবার নতুন করে বাছতে না হওয়া। Lecture 04-এর `B(Ax) = [1, 2, 1]`-এ `s = 0.5` হলে সংশোধন `[0.5, 1, 0.5]`, `s = 2` হলে `[2, 4, 2]` হয়। (rsLoRA নামে একটা variant এই `α / r` বদলে অন্য scale নেয়; সেটা Lecture 11-এ।)

## শুরুর মান: কেন B শূন্য

Fine-tuning শুরুর সময় model যেন ঠিক checkpoint-এর মতোই চলে, তা চাওয়া স্বাভাবিক। Standard LoRA-তে তাই **A-কে ছোট random মান আর B-কে শূন্য** দিয়ে শুরু করা হয়। তখন `ΔW = B·A = 0`, আর `z = Wx + b`, অর্থাৎ checkpoint-এর ফলই।

কিন্তু B শূন্য থাকলে শেখা কি আটকে যায় না? ছোট একটা পরীক্ষা: `W = [[1,1],[−1,1]]`, `x = [2,1]`, target `[4,1]`, `s = 1`। তিনটা শুরুতে gradient দেখি।

```python
def matvec(M, v):
    return [sum(m * x for m, x in zip(row, v)) for row in M]

W, x, target, s = [[1, 1], [-1, 1]], [2, 1], [4, 1], 1

def loss(A, B):                         # সব output-এর ভুলের বর্গের যোগ
    z = [w + s * d for w, d in zip(matvec(W, x), matvec(B, matvec(A, x)))]
    return sum((a - b) ** 2 for a, b in zip(z, target))

def grads(A, B, h=1e-6):                # ঠেলা দিয়ে gradient
    def g(M):
        out = [[0.0] * len(M[0]) for _ in M]
        for i in range(len(M)):
            for j in range(len(M[0])):
                M[i][j] += h; up = loss(A, B)
                M[i][j] -= 2 * h; dn = loss(A, B)
                M[i][j] += h
                out[i][j] = round((up - dn) / (2 * h), 3)
        return out
    return g(A), g(B)

cases = {
    "A random, B=0 ": ([[0.5, -0.5]], [[0.0], [0.0]]),
    "A=0, B=0      ": ([[0.0, 0.0]], [[0.0], [0.0]]),
    "A, B দুটোই random": ([[0.5, -0.5]], [[0.3], [-0.2]]),
}
for name, (A, B) in cases.items():
    gA, gB = grads(A, B)
    z = [w + s * d for w, d in zip(matvec(W, x), matvec(B, matvec(A, x)))]
    print(f"{name}: শুরুতে z = {[round(v, 2) for v in z]} | grad A = {gA} | grad B = {gB}")

A, B = [[0.5, -0.5]], [[0.0], [0.0]]
gA, gB = grads(A, B)
B = [[B[i][0] - 0.1 * gB[i][0]] for i in range(2)]      # এক update, lr = 0.1
print("এক update-এর পরে B =", [r[0] for r in B], "| grad A =", grads(A, B)[0])
# output:
# A random, B=0 : শুরুতে z = [3.0, -1.0] | grad A = [[0.0, 0.0]] | grad B = [[-1.0], [-2.0]]
# A=0, B=0      : শুরুতে z = [3.0, -1.0] | grad A = [[0.0, 0.0]] | grad B = [[0.0], [0.0]]
# A, B দুটোই random: শুরুতে z = [3.15, -1.1] | grad A = [[0.66, 0.33]] | grad B = [[-0.85], [-2.1]]
# এক update-এর পরে B = [0.1, 0.2] | grad A = [[-1.9, -0.95]]
```

| শুরু | শুরুতে `z` (checkpoint: `[3, −1]`) | gradient |
|---|---|---|
| A random, B = 0 | `[3, −1]`, অপরিবর্তিত | `grad B ≠ 0`, `grad A = 0` |
| দুটোই 0 | `[3, −1]` | দুটোই 0, আটকে যায় |
| দুটোই random | `[3.15, −1.1]`, শুরুতেই সরে গেছে | দুটোই ≠ 0 |

প্রথম ক্ষেত্রে শুরুতে `grad A = 0` কারণ A-এর gradient-এ B গুণ হয়ে আসে, আর B এখন 0। কিন্তু `grad B ≠ 0`, কারণ B-র gradient-এ গুণ হয়ে আসে `Ax` (এখানে `0.5 × 2 − 0.5 × 1 = 0.5`), যা A random বলে শূন্য নয়। তাই প্রথম update-এ B নড়ে (`[0.1, 0.2]`)। তখন B শূন্য নয়, তাই `grad A` আর শূন্য থাকে না (`[−1.9, −0.95]`)। দুটোই শূন্য হলে কেউ নড়ে না। দুটোই random হলে শুরুতেই checkpoint-এর ফল সরে যায়। তাই standard পছন্দ: B শূন্য, A ছোট random। (এই loss এখানে সহজ বর্গের যোগ, কোনো আসল task-এর loss নয়। Initialization-এর আরও ধরন Lecture 12-এ।)

## Dropout: training-এর সময় বাধা

**Dropout** হলো training-এ input-এর কিছু সংখ্যা এলোমেলোভাবে `0` করে দেওয়া, যাতে model একটা নির্দিষ্ট সংখ্যার উপর বেশি নির্ভর না করে। LoRA-তে সাধারণত এটা শুধু LoRA পথের input-এ বসে, মূল `Wx` পথে নয়। বাদ না পড়া সংখ্যাগুলো `1/(1 − p)` গুণ বাড়ানো হয় (`p` = বাদ পড়ার সম্ভাবনা), যাতে গড়ে মান একই থাকে। Inference-এ dropout বন্ধ।

```python
def matvec(M, v):
    return [sum(m * x for m, x in zip(row, v)) for row in M]

A = [[1, 0, 0, 0], [0, 1, 0, 0]]
B = [[1, 0], [0, 1], [-1, 1]]
x = [1, 2, 0, 1]
p = 0.25                                   # dropout-এর সম্ভাবনা
mask = [1, 0, 1, 1]                        # বাস্তবে এটা প্রতিবার random; এখানে ধরে নেওয়া

x_drop = [m * v / (1 - p) for m, v in zip(mask, x)]    # বাদ না পড়া মান 1/(1-p) গুণ
print("x         =", x)
print("dropout-র পরে x =", [round(v, 3) for v in x_drop])
print("LoRA পথ, dropout ছাড়া:", matvec(B, matvec(A, x)))
print("LoRA পথ, এই mask-এ    :", [round(v, 3) for v in matvec(B, matvec(A, x_drop))])
# output:
# x         = [1, 2, 0, 1]
# dropout-র পরে x = [1.333, 0.0, 0.0, 1.333]
# LoRA পথ, dropout ছাড়া: [1, 2, 1]
# LoRA পথ, এই mask-এ    : [1.333, 0.0, -1.333]
```

এই mask-এ দ্বিতীয় সংখ্যা বাদ পড়ায় LoRA পথের ফল সরে গেছে। প্রতিবার আলাদা mask আসে, তাই training-এ LoRA পথ বারবার ছোট ছোট এলোমেলো অবস্থায় শেখে। Dropout কতটা উপকারী, সেটা data-র পরিমাণ আর কাজ দেখে পরীক্ষা করার বিষয়।

## মনে রাখার সারকথা

- `r` A, B-র আকার ঠিক করে (সংশোধনের ক্ষমতা ও parameter সংখ্যা); `α` ঠিক করে `s = α / r`, অর্থাৎ জোর।
- Standard LoRA-তে B শূন্য, A ছোট random, তাই training শুরুতে model checkpoint-এর মতোই; আর প্রথম update-এ B নড়ে বলে A-ও শিখতে পারে।
- Dropout শুধু training-এ, সাধারণত LoRA পথের input-এ বসে; inference-এ বন্ধ।

## নিজে করো

১. `r = 16`, `α = 32` হলে `s` কত? `r = 16`, `α = 8` হলে?
২. `W` যদি `512×512` হয়, `r = 4`-এ A + B-তে কয়টা trainable সংখ্যা?
৩. `A = [[1, 1]]`, `B = [[0], [0]]` (r = 1) হলে `x = [3, 2]`-এ LoRA পথের ফল কত? B-র gradient-এ কী গুণ হয়ে আসে, যে কারণে B শূন্য হলেও সে শিখতে পারে?

<details><summary>উত্তর</summary>

১. `32 / 16 = 2`; `8 / 16 = 0.5`।
২. `4 × (512 + 512) = 4,096`।
৩. `Ax = 5`, `B(Ax) = [0, 0]`, তাই LoRA পথের ফল `[0, 0]`। B-র gradient-এ `Ax` (এখানে `5`) গুণ হয়ে আসে, আর `Ax` শূন্য নয় (A random শুরু হয়েছিল বলে)। তাই B শূন্য হলেও তার gradient `0` নয়।

</details>

## পরের পাঠ

কোন কোন matrix-এ LoRA বসবে, আর সেই বাছাই trainable সংখ্যা, gradient ও memory কীভাবে বদলায়: [Lecture 08 — Target selection, gradient ও memory](lecture-08-target-selection-gradient-and-memory.md)।

Source: [LoRA paper](https://arxiv.org/abs/2106.09685), [PEFT LoRA documentation](https://huggingface.co/docs/peft/en/package_reference/lora)।
