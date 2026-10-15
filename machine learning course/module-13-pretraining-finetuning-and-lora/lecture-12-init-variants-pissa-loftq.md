# Lecture 12 — শুরুর মান বদলানো: PiSSA ও LoftQ

> আগে যা জানা থাকলে ভালো: [Lecture 11 — LoRA variants](lecture-11-lora-variants-rslora-adalora-dora.md) এবং [Lecture 10 — quantization error](lecture-10-precision-nf4-and-qlora-practice.md)। এই lecture শেষে পারবে: বলতে initialization আর training objective আলাদা জিনিস, এবং PiSSA ও LoftQ কীভাবে শুধু শুরুর মান বদলায়, তার ছোট হিসাব করতে।

## সমস্যাটা কী?

সাধারণ LoRA শুরু হয় এভাবে: `A` ছোট random মান, `B` পুরো শূন্য। তাই শুরুতে `BA = 0`, model ঠিক base-এর মতো চলে। নিরাপদ, কিন্তু শুরুর ওই LoRA অংশ কিছুই জানে না।

QLoRA-তে আরেকটা সমস্যা আছে। Base weight 4-bit-এ ঠেলা হয়েছে, মানে `Q ≠ W`। LoRA শূন্য থেকে শুরু করলে model শুরু হয় ক্ষতিগ্রস্ত `Q` থেকে, আসল `W` থেকে নয়। প্রশ্ন: শুরুর মান আরও বুদ্ধি করে বসালে কি লাভ হয়?

## ধারণাটা সহজ ভাষায়

**Initialization** হলো training শুরুর আগে parameter-এ প্রথম মান বসানো। এটা শুধু শুরুর বিন্দু ঠিক করে। **Loss বদলায় না, gradient বা update-এর নিয়মও বদলায় না।** [Map-এর](../01-learning-map.md) হিসাবে: output-এর সূত্র একই, objective একই, update পদ্ধতি একই। শুধু শুরুর parameter আর কোনটা frozen সেটা আলাদা।

| | সাধারণ LoRA | PiSSA | LoftQ |
|---|---|---|---|
| শুরুতে `A`, `B` | A random, B = 0 | `W`-এর প্রধান অংশ থেকে | quantization-এ হারানো অংশের আনুমানিক রূপ |
| Frozen অংশ | `W` (বা quantized `Q`) | `W`-এর বাকি অংশ `W_res` | নতুনভাবে বেছে নেওয়া `Q` |
| শুরুতে model-এর output | base-এর সমান (QLoRA-তে `Q`-র সমান) | base-এর সমান | `Q + BA ≈ W`, `Q`-এর চেয়ে কাছাকাছি |
| বদলায় না | Loss, optimizer, forward-এর সূত্র | একই | একই |

### SVD: matrix-কে গুরুত্ব অনুযায়ী টুকরো করা

PiSSA বোঝার জন্য একটা ধারণা লাগে: **SVD** (singular value decomposition)। এটি যেকোনো matrix-কে গুরুত্ব অনুযায়ী সাজানো কয়েকটা সরল টুকরোর (rank-1 matrix) যোগফল হিসেবে লেখে। প্রতিটা টুকরোর সঙ্গে একটা সংখ্যা থাকে, তার নাম **singular value**; বড় মানে সেই টুকরো matrix-এর বেশি অংশ বহন করে। প্রথম `r`টা টুকরো রাখলে সেটা rank-`r` সেরা আনুমানিক রূপ, আর বাকিটা অবশিষ্টাংশ।

### PiSSA

**PiSSA** (Meng ও অন্যান্য, 2024) `W`-কে ভাগ করে:

- প্রধান `r`টা টুকরো → `B` ও `A`-তে বসায়, এবং এগুলোই trainable।
- বাকি অংশ `W_res = W − BA` → frozen।

ফলে `W_res + BA = W`, শুরুতে model-এর output base-এর সঙ্গে হুবহু সমান। কিন্তু LoRA-র মতো শূন্য থেকে নয়, শুরুর trainable অংশে ইতিমধ্যে `W`-এর সবচেয়ে বড় অংশ আছে। Paper-এর দাবি: এতে training দ্রুত এগোয় ও ফল ভালো হয়। তাদের নিজের পরীক্ষায় (GSM8K, Mistral-7B) PiSSA 72.86% আর LoRA 67.7%। এটা paper-এর setup-এর ফল; তোমার task-এ আলাদা হতে পারে।

### LoftQ

**LoftQ** (Li ও অন্যান্য, 2023) QLoRA-র শুরুর error নিয়ে কাজ করে। ধারণা: `Q` আর `A, B` একসঙ্গে বেছে নাও যাতে `Q + BA ≈ W` হয়। কয়েকবার পালা করে:

1. `W − BA`-কে quantize করে `Q` বের করো।
2. `W − Q` (হারানো অংশ) থেকে rank-`r` আনুমানিক রূপ নিয়ে নতুন `B, A` বানাও।

Paper-এর দাবি: কম bit-এ (যেমন 2-bit) generalization বেশি ভালো হয়। এই lecture-এ আমরা শুধু এক পালার ফল হাতে দেখব।

## ছোট একটা উদাহরণ

`W = [[3, 1.2], [1.2, 3]]` নিই। এই matrix-এর প্রধান দিক `u = (1,1)/√2`; প্রধান singular value `uᵀWu = 4.2`।

**PiSSA, r = 1:**

```text
প্রধান অংশ BA    = 4.2 × u uᵀ = [[2.1, 2.1], [2.1, 2.1]]
বাকি অংশ W_res   = W − BA     = [[0.9, -0.9], [-0.9, 0.9]]
```

Input `x = [1, 0]` হলে `W_res·x + BA·x = [0.9, -0.9] + [2.1, 2.1] = [3.0, 1.2]`, আর `W·x = [3.0, 1.2]`। শুরুর output একই।

**LoftQ, এক পালা:** grid-কে এমন ধরি যাতে মানগুলো scale-এর পূর্ণ গুণিতকে যায়; scale = absmax/3 = 1।

```text
Q = [[3, 1], [1, 3]]            (1.2 → 1)
W − Q = [[0, 0.2], [0.2, 0]]    ‖W − Q‖ = 0.283
এর rank-1 রূপ BA = [[0.1, 0.1], [0.1, 0.1]]
Q + BA = [[3.1, 1.1], [1.1, 3.1]]   ‖W − (Q + BA)‖ = 0.2
```

QLoRA-র সাধারণ শুরুতে error ছিল 0.283; LoftQ-ধাঁচের শুরুতে 0.2। এখানে `W − Q`-এর দুটো টুকরো সমান বড় (±0.2), তাই যেকোনো একটা বাছা হয়েছে; ফল একই। `r = 2` নিলে 2×2 matrix-এ error 0 হতো।

```python
import math

W = [[3.0, 1.2], [1.2, 3.0]]
def sub(A, B): return [[a - b for a, b in zip(r, s)] for r, s in zip(A, B)]
def fro(A): return math.sqrt(sum(x * x for r in A for x in r))
def show(A): return [[round(x, 3) for x in r] for r in A]

# এই symmetric matrix-এর প্রধান দিক হাতে জানা: u = (1,1)/sqrt(2)
u = [1 / math.sqrt(2)] * 2
def top_part(M):   # M-এর rank-1 প্রধান অংশ = (uᵀMu) · u uᵀ
    s = sum(u[i] * M[i][j] * u[j] for i in range(2) for j in range(2))
    return s, [[s * u[i] * u[j] for j in range(2)] for i in range(2)]

# --- PiSSA, r = 1: BA = প্রধান অংশ, frozen = বাকিটা ---
s1, BA = top_part(W)
Wres = sub(W, BA)
print("s1 =", round(s1, 3), " BA =", show(BA), " W_res =", show(Wres))
x = [1, 0]
y = [sum((Wres[i][j] + BA[i][j]) * x[j] for j in range(2)) for i in range(2)]
print("PiSSA শুরুতে W_res·x + BA·x =", [round(v, 3) for v in y], "| W·x =", [W[0][0], W[1][0]])

# --- LoftQ-ধাঁচ, ১ ধাপ: grid = scale-এর পূর্ণ গুণিতক, scale = absmax/3 ---
scale = max(abs(v) for r in W for v in r) / 3
Q = [[round(v / scale) * scale for v in r] for r in W]
R = sub(W, Q)                       # quantization-এর পর যা হারিয়েছে
_, R1 = top_part(R)                 # তার rank-1 আনুমানিক রূপ = LoRA-র শুরুর মান
Qp = [[Q[i][j] + R1[i][j] for j in range(2)] for i in range(2)]
print("Q =", show(Q), " ||W - Q|| =", round(fro(R), 3))
print("Q + BA =", show(Qp), " ||W - (Q + BA)|| =", round(fro(sub(W, Qp)), 3))
# output:
# s1 = 4.2  BA = [[2.1, 2.1], [2.1, 2.1]]  W_res = [[0.9, -0.9], [-0.9, 0.9]]
# PiSSA শুরুতে W_res·x + BA·x = [3.0, 1.2] | W·x = [3.0, 1.2]
# Q = [[3.0, 1.0], [1.0, 3.0]]  ||W - Q|| = 0.283
# Q + BA = [[3.1, 1.1], [1.1, 3.1]]  ||W - (Q + BA)|| = 0.2
```

এটা 2×2 খেলনা matrix; বাস্তব model-এ SVD অনেক বড় matrix-এ হয়, তার জন্য library ব্যবহার হয়। PEFT docs-এ `init_lora_weights` option-এ `"pissa"`, `"pissa_niter_[n]"` (fast SVD) ও `"loftq"` (সঙ্গে `loftq_config`) দেখা গেছে। এই lecture-এ সেগুলো চালানো হয়নি।

## ঝুঁকি ও সীমা

- **Base বদলে যায় (PiSSA):** frozen অংশ এখন `W_res`, মূল `W` নয়। তাই শুধু adapter ফাইল দিয়ে মূল base-এর উপর বসানো যায় না; `W_res` আলাদা রাখতে বা রূপান্তর করতে হয়। এটা যুক্তির ফল; নির্দিষ্ট tool-এর নিয়ম docs থেকে দেখে নাও।
- **শুরুর বাড়তি খরচ:** SVD বা পালা করা quantization লাগে। Paper-এর মতে PiSSA-র শুরু কয়েক সেকেন্ডে হয়; বড় model-এ এটা এখানে যাচাই করা হয়নি।
- **ফল task-নির্ভর:** দুই paper-ই নিজেদের benchmark-এ ভালো ফল দেখিয়েছে। তোমার data-য় ভালো হবে এমন নিশ্চয়তা নেই; [Lecture 14](lecture-14-controlled-comparison.md)-এর মতো তুলনা করতে হবে।

## মনে রাখার সারকথা

- Initialization শুধু শুরুর মান ঠিক করে; loss, update-এর নিয়ম ও output-এর সূত্র একই থাকে।
- PiSSA প্রধান অংশ trainable বানায় ও বাকিটা frozen রাখে; শুরুর output base-এর সমান।
- LoftQ quantization-এ হারানো অংশকে LoRA-র শুরুর মান বানায়, যাতে `Q + BA` আসল `W`-এর কাছে থাকে।

## নিজে করো

১. উপরের `W`-তে `x = [0, 1]`। PiSSA-র শুরুতে `W_res·x + BA·x` কত?
২. PiSSA-য় `W_res` আর `BA` যোগ করলে কী পাওয়া উচিত? উদাহরণের এক ঘরে যাচাই করো।
৩. কোন বিবৃতি ঠিক: (ক) PiSSA loss বদলায় (খ) PiSSA শুধু শুরুর মান ও frozen অংশ বদলায়?
৪. LoftQ-র উদাহরণে `r = 2` নিলে `Q + BA` আর `W`-এর পার্থক্য কত হতো?

<details><summary>উত্তর</summary>

১. `W_res·x = [-0.9, 0.9]`, `BA·x = [2.1, 2.1]`। যোগ `[1.2, 3.0]`। `W·x = [1.2, 3.0]`, মিলেছে।
২. `W` পাওয়া উচিত। যেমন উপরের-ডানের ঘর: `-0.9 + 2.1 = 1.2` (= `W[0][1]`)।
৩. (খ)। Initialization loss বা update-এর নিয়ম বদলায় না।
৪. `W − Q = [[0, 0.2], [0.2, 0]]` নিজেই rank 2, তাই rank-2 রূপ হুবহু। `Q + BA = W`, পার্থক্য 0।

</details>

## পরের পাঠ

এতক্ষণ সব variant ছিল LoRA-র পরিবার। LoRA ছাড়া আরও PEFT পদ্ধতি আছে যেগুলো সম্পূর্ণ আলাদা জায়গায় বসে: [Lecture 13 — Adapter, soft prompt, prefix tuning, IA³ ও bias-only](lecture-13-other-peft-adapters-prompts-ia3.md)।

**References:** [PiSSA](https://arxiv.org/abs/2404.02948), [LoftQ](https://arxiv.org/abs/2310.08659), [PEFT LoRA docs](https://huggingface.co/docs/peft/en/package_reference/lora)।
