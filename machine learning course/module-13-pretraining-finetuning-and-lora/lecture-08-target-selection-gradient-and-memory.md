# Lecture 08 — কোথায় LoRA বসাবে: Target, Gradient ও Memory

> আগে যা জানা থাকলে ভালো: [A, B-র আকার ও parameter সংখ্যা](lecture-04-lora-matrix-pairs-and-effective-weights.md) আর [Adam optimizer-এর পরিচয়](../module-10-neural-network-training/lecture-05-optimizer-and-learning-rate.md)। এই lecture শেষে পারবে: কোন matrix-এ LoRA বসালে trainable সংখ্যা কত হয় তা গুনতে, frozen matrix-এর ভেতর দিয়ে gradient কীভাবে যায় তা বলতে, আর training memory-র হিসাব করতে। ([Map-এ অবস্থান](../01-learning-map.md): LoRA → কোথায় বসবে ও তার খরচ)

## সমস্যাটা কী?

একটা বড় model-এ শত শত weight matrix থাকে। LoRA কি সবগুলোতে বসবে, নাকি কয়েকটায়? বেশি জায়গায় বসালে ক্ষমতা বাড়ে, কিন্তু trainable সংখ্যা আর memory-ও বাড়ে। আবার "মূল weight frozen" শুনে মনে হতে পারে frozen অংশ হিসাব থেকে বাদ, বা LoRA মানেই memory প্রায় শূন্য। এই দুটো ধারণা ঠিক নয়। এই lecture সংখ্যা দিয়ে দেখায় কেন।

## ধারণাটা সহজ ভাষায়

তিনটা শব্দ আলাদা করে নাও:

- **Unit:** Module 09-এর পরিচয়: matrix-এর একটা row, অর্থাৎ একটা output।
- **Module:** code-এ নাম দেওয়া একটা weight matrix। যেমন attention-এর ভেতরে query আর value তৈরির দুটো matrix-এর code-নাম `q_proj` আর `v_proj`। (Attention [Module 12](../module-12-text-sequences-and-multimodal-models/lecture-05-context-and-attention.md)-এ; এখন শুধু নামের পরিচয় দরকার। নাম model-ভেদে আলাদা হয়।)
- **Block:** কয়েকটা module আর অন্য হিসাব মিলিয়ে এক গুচ্ছ, যেটা model-এ বারবার সাজানো থাকে ([Transformer block](../module-12-text-sequences-and-multimodal-models/lecture-06-transformer-block.md))।

LoRA বসাতে তুমি **target modules**-এর নামের তালিকা দাও। Standard LoRA-তে প্রতিটা block-এ তালিকার প্রতিটা module নিজের **আলাদা** A, B জোড়া পায়। তালিকার বাইরের module-এ LoRA পথ থাকে না।

## ছোট একটা উদাহরণ: trainable কত?

একটা খেলনা block-এ চারটা module: `q_proj` (4×4), `v_proj` (4×4), `ff1` (8×4), `ff2` (4×8)। `r = 2`। সূত্র `r × (d + m)`:

```python
def lora_count(m, d, r):                 # W: m x d  ->  A: r x d, B: m x r
    return r * (d + m)

# খেলনা block: প্রতিটা matrix-এর (m, d)
toy = {"q_proj": (4, 4), "v_proj": (4, 4), "ff1": (8, 4), "ff2": (4, 8)}
r = 2
for name, (m, d) in toy.items():
    print(f"{name}: W {m}x{d} = {m * d:2d} | LoRA r=2 = {lora_count(m, d, r)}")

# বড় আকারের উদাহরণ (সংখ্যাগুলো শেখার জন্য বানানো, কোনো আসল model-এর নয়)
big = {"q_proj": (1024, 1024), "v_proj": (1024, 1024), "ff1": (4096, 1024), "ff2": (1024, 4096)}
blocks, r = 24, 8
N = blocks * sum(m * d for m, d in big.values())
print("মোট W =", f"{N:,}")
for label, keys in [("শুধু q", ["q_proj"]), ("q + v", ["q_proj", "v_proj"]), ("চারটাই", list(big))]:
    T = blocks * sum(lora_count(*big[k], r) for k in keys)
    print(f"{label}: trainable {T:,} = {T / N:.2%}")
# output:
# q_proj: W 4x4 = 16 | LoRA r=2 = 16
# v_proj: W 4x4 = 16 | LoRA r=2 = 16
# ff1: W 8x4 = 32 | LoRA r=2 = 24
# ff2: W 4x8 = 32 | LoRA r=2 = 24
# মোট W = 251,658,240
# শুধু q: trainable 393,216 = 0.16%
# q + v: trainable 786,432 = 0.31%
# চারটাই: trainable 2,752,512 = 1.09%
```

খেলনা আকারে সাশ্রয় নেই (16 বনাম 16)। বড় আকারে (24 block, `r = 8`) শুধু `q` বাছলে trainable মূল সংখ্যার 0.16%, চারটাই বাছলে 1.09%। Target বাড়ালে trainable সংখ্যা সমানুপাতিক হারে বাড়ে। কোন target ভালো, তা কাজ দেখে পরীক্ষা করতে হয়। বাছাই করার আগে বোঝা দরকার তার খরচ আর gradient-এর চলাচল।

আমাদের OCR project-এ saved adapter-এ ভাষার সব layer আর vision-এর সব block-এর নির্বাচিত module-এ LoRA পাওয়া গেছে। সব layer-এ LoRA থাকা মানে সব মূল parameter trainable নয়। বিস্তারিত: [OCR case study](../module-14-ocr-system-case-study/lecture-01-ocr-project-architecture-and-lora.md)।

## Frozen matrix-এর ভেতর দিয়ে gradient

দুই layer-এর ছোট network: layer 1-এ LoRA আছে (A1, B1 trainable), layer 2-এর W2 frozen। `y = W2 · h`, loss `(y − 5)²`। B1-এর gradient বের করতে loss থেকে পেছনে `h` পর্যন্ত যেতে হয়, আর সেই পথে W2 পড়ে। তাই W2 frozen হলেও gradient তার ভেতর দিয়ে যায়:

`dL/dh = (dL/dy) × W2`, তারপর `dL/dB1 = (dL/dh) × (A1·x)`।

```python
def matvec(M, v):
    return [sum(m * x for m, x in zip(row, v)) for row in M]

x, target = [2, 1], 5
W1, A1, B1 = [[1, 1], [-1, 1]], [[1, 0]], [[0], [1]]    # layer 1: LoRA আছে

def run(W2, B1):                         # layer 2: W2 frozen, LoRA নেই
    h = [p + q for p, q in zip(matvec(W1, x), matvec(B1, matvec(A1, x)))]
    y = sum(w * v for w, v in zip(W2[0], h))
    return h, y, (y - target) ** 2

for W2 in ([[2, 1]], [[0, 0]]):
    h, y, L = run(W2, B1)
    dy = 2 * (y - target)                            # dL/dy
    dh = [dy * w for w in W2[0]]                     # W2 পার হয়ে পেছনে যায়
    Ax = matvec(A1, x)[0]
    grad_B1 = [d * Ax for d in dh]
    numeric = []
    for i in range(2):
        up = [r[:] for r in B1]; dn = [r[:] for r in B1]
        up[i][0] += 1e-6; dn[i][0] -= 1e-6
        numeric.append(round((run(W2, up)[2] - run(W2, dn)[2]) / 2e-6, 3))
    print(f"W2={W2[0]}: y={y}, dL/dh={dh}, grad B1={grad_B1}, numeric={numeric}")
# output:
# W2=[2, 1]: y=7, dL/dh=[8, 4], grad B1=[16, 8], numeric=[16.0, 8.0]
# W2=[0, 0]: y=0, dL/dh=[0, 0], grad B1=[0, 0], numeric=[0.0, 0.0]
```

`W2 = [2, 1]`-এ `B1`-এর gradient `[16, 8]`, ঠেলা পদ্ধতির সঙ্গে মেলে। `W2` শূন্য করলে gradient `[0, 0]` হয়ে যায়, অর্থাৎ B1 শেখে W2-এর মাধ্যমেই। তবে frozen W2-র **নিজের** gradient (`dy × h`) রাখা বা optimizer-এ দেওয়ার দরকার নেই। এখানেই memory বাঁচে।

## Memory: কী কমে, কী কমে না

Training-এ প্রতিটা trainable parameter-এর জন্য জমা থাকে: তার মান, তার gradient, আর Adam-এর বাড়তি দুটো সংখ্যা। মোট 4টা সংখ্যা। Frozen parameter-এর শুধু মান থাকে, 1টা সংখ্যা। (এটা সংখ্যার গোনা, byte নয়; byte-এ precision-এর প্রভাব পড়ে।)

```python
# প্রতি parameter-এর জন্য training-এ কতগুলো সংখ্যা জমা হয় (Adam ধরে):
# মান 1 + gradient 1 + optimizer-এর বাড়তি 2 = 4। Frozen হলে শুধু মান 1।
def numbers_full(N):
    return 4 * N

def numbers_lora(N, T):                  # N = মূল (frozen), T = LoRA-র trainable
    return N + 4 * T

N = 1_000_000                            # একটা 1000x1000 matrix
T = 8 * (1000 + 1000)                    # r = 8
print("full :", f"{numbers_full(N):,}")
print("LoRA :", f"{numbers_lora(N, T):,}", f"({numbers_lora(N, T) / numbers_full(N):.1%})")

N = 251_658_240                          # ওপরের বড় উদাহরণের মোট W
for label, T in [("q + v", 786_432), ("চারটাই", 2_752_512)]:
    print(f"{label}: LoRA {numbers_lora(N, T):,} = {numbers_lora(N, T) / numbers_full(N):.1%} of full ({numbers_full(N):,})")
# output:
# full : 4,000,000
# LoRA : 1,064,000 (26.6%)
# q + v: LoRA 254,803,968 = 25.3% of full (1,006,632,960)
# চারটাই: LoRA 262,668,288 = 26.1% of full (1,006,632,960)
```

LoRA-তে memory প্রায় ৪ ভাগের ১ ভাগ হয়েছে, শূন্যের কাছে নয়। কারণ frozen মূল weight-গুলো (`N`) এখনও memory-তে থাকে। কমেছে gradient আর optimizer-এর অংশ। এই হিসাবে আরও কিছু ধরা হয়নি: forward pass-এর মাঝের মানগুলো (activations) backward-এর জন্য জমা রাখতে হয়, আর LoRA সেটা বাদ দেয় না। বাকি `N` কমাতে base weights কম bit-এ রাখার কথা আসে, সেটাই [QLoRA](lecture-05-quantization-and-qlora.md)।

## মনে রাখার সারকথা

- Target modules-এর তালিকা ঠিক করে LoRA কোথায় বসবে; বেশি target মানে বেশি trainable সংখ্যা (`r × (d + m)` প্রতি module)।
- Frozen matrix-ও gradient-এর পথে থাকে; শুধু তার নিজের gradient বা optimizer state লাগে না।
- LoRA-তে gradient ও optimizer memory কমে, কিন্তু frozen weights আর activations-এর memory থাকে।

## নিজে করো

১. 12টা block, প্রতিটায় শুধু `q_proj` আর `v_proj` (প্রতিটা `512×512`), `r = 4`। LoRA-র trainable মোট কত? ওই matrix-গুলোর মূল সংখ্যা কত?
২. একটা `1000×1000` matrix-এ `r = 16` হলে `numbers_lora` কত?
৩. উপরের gradient উদাহরণে `W2 = [0, 0]` হলে `B1`-এর gradient কেন `0`?

<details><summary>উত্তর</summary>

১. প্রতি matrix `4 × (512 + 512) = 4,096`। `12 × 2 × 4,096 = 98,304`। মূল: `12 × 2 × 262,144 = 6,291,456`। অনুপাত প্রায় 1.56%।
২. `T = 16 × 2000 = 32,000`। `1,000,000 + 4 × 32,000 = 1,128,000`।
৩. `dL/dh = dy × W2`, আর `W2` শূন্য বলে `dL/dh = [0, 0]`। B1-এর gradient `dL/dh`-কে গুণ করেই আসে, তাই শূন্য। Loss-এর পরিবর্তন W2 পার হয়ে B1-এ পৌঁছাতে পারে না।

</details>

## পরের পাঠ

শেখা শেষ হলে A, B-কে কীভাবে মূল W-তে মিশিয়ে ফেলা যায়, কীভাবে শুধু adapter-টুকু save-load করা যায়: [Lecture 09 — Merge, save ও load](lecture-09-merge-save-load.md)।
