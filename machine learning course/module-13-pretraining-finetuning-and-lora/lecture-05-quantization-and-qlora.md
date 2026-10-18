# Lecture 05 — Quantization: একই shape, কাছাকাছি মান

> আগে যা জানা থাকলে ভালো: [lossless আর lossy-র পার্থক্য](bridge-01-lossless-compression.md), [output score থেকে একটা ফল বাছা](../module-12-text-sequences-and-multimodal-models/bridge-01-output-scores-and-selection.md), আর weights ও forward pass। এই lecture শেষে পারবে: quantization-এ কী বদলায় আর কী বদলায় না বলতে, ছোট একটা error হাতে মাপতে, আর কোন শর্তে সিদ্ধান্ত অপরিবর্তিত থাকে তা যাচাই করতে। ([Map-এ অবস্থান](../01-learning-map.md): সংখ্যা সংরক্ষণের precision। Matrix-এর আকার বা loss এতে বদলায় না।)

## সমস্যাটা কী?

বড় model-এ কোটি কোটি weight। প্রতিটা weight যদি 16 bit জায়গা নেয়, তাহলে model memory-তে আঁটানোই কঠিন হয়। Weight-এর সংখ্যা কমানো যায় না (তাহলে model-ই বদলে যায়)। তাই প্রতিটা weight-কে **কম bit-এ** রাখার কথা ওঠে। এই কাজের নাম **quantization**। যারা সীমিত memory-র GPU-তে model চালাতে বা fine-tune করতে চায়, তাদের জন্য এটা জরুরি।

## ধারণাটা সহজ ভাষায়

4 bit-এ মোট `2⁴ = 16`টা আলাদা code সম্ভব। অথচ 16 bit-এ `2¹⁶ = 65,536`টা। তাই 4 bit-এ সব আলাদা মান আলাদাভাবে রাখা যায় না। Quantization বেশ কয়েকটা কাছাকাছি মানকে একই code-এ ফেলে। Code থেকে মান ফেরত আনতে একটা **scale** (মাপ) বা তালিকা লাগে, সেটাও কিছু জায়গা নেয়।

ফল এই:

- Matrix-এর shape আর weight-এর সংখ্যা **একই** থাকে।
- প্রতিটা weight-এর মান **কাছাকাছি** হয়, হুবহু নয়। [Bridge](bridge-01-lossless-compression.md)-এর ভাষায় এটা lossy।
- Weight বদলালে পরের হিসাবের ফলও বদলায়, তাই শেষের score-ও কিছুটা সরে যায়।

## ছোট একটা উদাহরণ

একটা সরল quantizer: -1 থেকে 1-এর মাঝে সমান দূরত্বে 16টা স্তর। এটা বাস্তব NF4-এর নিয়ম নয় (সেটা [Lecture 10](lecture-10-precision-nf4-and-qlora-practice.md)-এ), শুধু ধারণা বোঝানোর জন্য। প্রতিটা weight-কে কাছের স্তরে নামিয়ে 4 bit-এর code রাখা হয়।

দ্বিতীয় অংশে দুই class-এর score বের করা হয়: প্রতি class-এর 4টা weight আর input `x`। দেখা হয় quantization-এর পরে সবচেয়ে বড় score কোন class-এর।

```python
STEP = 2 / 15                    # -1 থেকে 1-এর মাঝে 16টা স্তর (4 bit)

def quantize(w):
    code = round((w + 1) / STEP)             # 0..15
    return code, -1 + code * STEP            # (সংরক্ষিত code, ফেরত পাওয়া মান)

weights = [0.237, -0.512, 0.049, 0.800]
for w in weights:
    code, back = quantize(w)
    print(f"w={w:+.3f}  code={code:2d} ({code:04b})  ফেরত={back:+.3f}  error={back - w:+.3f}")

# দুই class-এর score: প্রতি class-এর 4টা weight
W = [[0.237, -0.512, 0.049, 0.800],
     [0.300,  0.400, -0.600, 0.100]]
Wq = [[quantize(w)[1] for w in row] for row in W]

def scores(M, x):
    return [sum(w * v for w, v in zip(row, x)) for row in M]

for x in ([1.0, 0.5, 1.0, 1.0], [1.0, 1.0, 0.0, 0.5], [0.5, 1.5, 1.0, 1.0]):
    s0, s1 = scores(W, x), scores(Wq, x)
    eps = max(abs(a - b) for a, b in zip(s0, s1))        # score-এর সর্বোচ্চ error
    margin = abs(s0[0] - s0[1])
    print("x =", x, "| আসল", [round(v, 3) for v in s0], "| quantized", [round(v, 3) for v in s1])
    print("   eps =", round(eps, 3), " margin =", round(margin, 3), " 2*eps =", round(2 * eps, 3),
          " সেরা class:", s0.index(max(s0)), "->", s1.index(max(s1)))
# output:
# w=+0.237  code= 9 (1001)  ফেরত=+0.200  error=-0.037
# w=-0.512  code= 4 (0100)  ফেরত=-0.467  error=+0.045
# w=+0.049  code= 8 (1000)  ফেরত=+0.067  error=+0.018
# w=+0.800  code=14 (1110)  ফেরত=+0.867  error=+0.067
# x = [1.0, 0.5, 1.0, 1.0] | আসল [0.83, 0.0] | quantized [0.9, -0.033]
#    eps = 0.07  margin = 0.83  2*eps = 0.14  সেরা class: 0 -> 0
# x = [1.0, 1.0, 0.0, 0.5] | আসল [0.125, 0.75] | quantized [0.167, 0.7]
#    eps = 0.05  margin = 0.625  2*eps = 0.1  সেরা class: 1 -> 1
# x = [0.5, 1.5, 1.0, 1.0] | আসল [0.2, 0.25] | quantized [0.333, 0.133]
#    eps = 0.134  margin = 0.051  2*eps = 0.268  সেরা class: 1 -> 0
```

প্রতিটা weight-এ error ছোট (সর্বোচ্চ 0.067), কিন্তু score-এ জমে `eps` বড় হয়। প্রথম দুই input-এ সেরা class একই থেকেছে। তৃতীয়টায় দুই class-এর score প্রায় সমান (0.2 আর 0.25), তাই সামান্য error-এ সেরা class বদলে গেছে।

## কখন সিদ্ধান্ত বদলায় না

**Margin** হলো সেরা score আর দ্বিতীয় সেরা score-এর ফারাক। প্রতিটা score-এর error যদি সর্বোচ্চ `ε` হয়, তাহলে:

**margin > 2ε হলে সেরা class বদলাবে না।**

কারণ একটা score `ε` নামতে পারে, অন্যটা `ε` উঠতে পারে; তাই ফারাক সর্বোচ্চ `2ε` কমে। ওপরের উদাহরণে প্রথম দুই input-এ `margin` (0.83, 0.625) যথাক্রমে `2ε` (0.14, 0.1)-এর অনেক বেশি, তাই নিরাপদ। তৃতীয় input-এ `0.051 < 0.268`, তাই নিশ্চয়তা নেই। (নিশ্চয়তা না থাকা মানে বদলাবেই, তা নয়; এখানে বদলেছে।)

সাবধান: `ε` হলো **শেষ score**-এর error। Weight-এর error সরাসরি `ε` নয়, কারণ error অনেক গুণ-যোগের ভেতর দিয়ে মিশে যায়। আর এই শর্ত একটা নির্দিষ্ট input-এর সিদ্ধান্ত রক্ষা করে, পুরো model-এর accuracy নয়। সঠিক মাপ পেতে quantization-এর পরে আলাদা test data-তে ফল দেখতে হয়।

আরেকটা ভুল ধারণা: score দশ গুণ বড় করলে (`[4.9, 5.05]` → `[49, 50.5]`) ক্রম একই থাকে। Positive গুণে ranking বদলায় না, তাই ভুল ক্রম সারে না।

## Storage precision আর compute precision

এক মিলিয়ন weight 16 bit-এ রাখলে raw size প্রায় 2 MB, 4 bit-এ প্রায় 0.5 MB। কিন্তু training-এ আরও জিনিস memory নেয়: scale, activations, gradients, optimizer-এর হিসাব। তাই পুরো training memory চার ভাগের এক ভাগ হয় না।

**QLoRA** ঠিক এই ভাগাভাগিটা কাজে লাগায়: frozen base weights কম bit-এ (মূল পদ্ধতিতে 4 bit) রাখা হয়, আর LoRA-র A, B সাধারণত বেশি precision-এ শেখানো হয়। হিসাবের সময় প্রয়োজনমতো base মান ফেরত এনে বেশি precision-এ গুণ করা হয়। অর্থাৎ 4 bit মানে প্রতিটা গুণ বা gradient 4 bit-এ নয়; শুধু **রাখার** পদ্ধতি। গতি কতটা বাড়ে বা কমে তা hardware আর implementation-এর উপর নির্ভর করে।

আমাদের OCR project-এর training script base model bfloat16-এ load করে LoRA শেখায়; সেটা QLoRA নয়, কারণ ওতে 4 bit quantization নেই।

Training চলাকালেই quantization-এর প্রভাব অনুকরণ করে model-কে মানিয়ে নেওয়াকে quantization-aware training বলে। সেটা Lecture 10-এ।

## মনে রাখার সারকথা

- Quantization weight-এর সংখ্যা আর shape একই রাখে, শুধু প্রতিটা মান কম bit-এ রাখে; ফলে মান কাছাকাছি হয়, হুবহু নয়।
- Weight-এর ছোট error পরের হিসাবে মিশে score সরাতে পারে। Margin > 2ε হলে সেরা বিকল্প বদলায় না।
- QLoRA-তে frozen base কম bit-এ থাকে, LoRA অংশ বেশি precision-এ শেখানো হয়।

## নিজে করো

১. 3 bit-এ কয়টা আলাদা code সম্ভব?
২. 7 বিলিয়ন weight 16 bit-এ আর 4 bit-এ রাখলে raw size কত? (scale ধরো না)
৩. আসল score `[3.0, 2.8]`, প্রতিটা score-এর error সর্বোচ্চ 0.15। সেরা class না-বদলানোর নিশ্চয়তা আছে কি? আর `[5.0, 3.0]`-এ?

<details><summary>উত্তর</summary>

১. `2³ = 8`টা।
২. 16 bit = 2 byte: `7 × 10⁹ × 2 = 14 GB`। 4 bit = 0.5 byte: `7 × 10⁹ × 0.5 = 3.5 GB`।
৩. `[3.0, 2.8]`: margin `0.2`, কিন্তু `2ε = 0.3`। `0.2 < 0.3`, তাই নিশ্চয়তা নেই (বদলাতে পারে, আবার নাও বদলাতে পারে)। `[5.0, 3.0]`: margin `2.0 > 0.3`, তাই বদলাবে না।

</details>

## পরের পাঠ

LoRA-তে কোন parameter বদলাবে সেই সিদ্ধান্তের বিস্তারিত: [Lecture 06 — Full, selective ও head training](lecture-06-full-selective-and-head-training.md)। NF4, double quantization আর QLoRA-র বাস্তব হিসাব পরে: [Lecture 10](lecture-10-precision-nf4-and-qlora-practice.md)। Quantization-এর সঙ্গে LoRA-র শুরুর মানের সম্পর্ক [Lecture 12](lecture-12-init-variants-pissa-loftq.md)-এ, আর full/LoRA/QLoRA একই শর্তে তুলনা [Lecture 14](lecture-14-controlled-comparison.md)-এ। LoRA-র variant ও অন্য PEFT: [Lecture 11](lecture-11-lora-variants-rslora-adalora-dora.md), [13](lecture-13-other-peft-adapters-prompts-ia3.md)।

References: [QLoRA paper](https://arxiv.org/abs/2305.14314), [Quantization-aware training paper](https://arxiv.org/abs/1712.05877)।
