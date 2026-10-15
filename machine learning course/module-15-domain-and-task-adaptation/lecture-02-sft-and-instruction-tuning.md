# Lecture 02 — SFT ও Instruction Tuning: কোন Token-এ Loss

> আগে যা জানা থাকলে ভালো: [Lecture 01 — Pretraining ও checkpoint](lecture-01-pretraining-objective-and-checkpoint.md) এবং [Next-token cross-entropy](../module-12-text-sequences-and-multimodal-models/lecture-04-next-token-and-cross-entropy.md)। এই lecture শেষে পারবে: একটা (প্রশ্ন, উত্তর) জোড়া থেকে training sequence বানাতে, আর loss mask দিয়ে loss হাতে বের করতে।
> Map-এ অবস্থান: [Learning Map](../01-learning-map.md) → শেখার লক্ষ্য (objective)। Output বের করার হিসাব আগের মতোই; বদলেছে শুধু data ও কোন token-এর ভুল গোনা হবে।

## সমস্যাটা কী?

Base model লেখা চালিয়ে যেতে জানে। তাকে "পিন ভুলে গেলে?" দিলে সে হয়তো আরেকটা প্রশ্ন জুড়ে দেয়, উত্তর দেয় না। আমরা চাই প্রশ্ন পেলে উত্তর আসুক। এটা শেখাতে প্রশ্ন-উত্তরের উদাহরণ লাগে। তখন আরেকটা প্রশ্ন ওঠে: model-এর ভুল কোথায় মাপব? প্রশ্নের অংশে, নাকি উত্তরের অংশে? প্রশ্ন তো মানুষ লিখে দেয়, model-কে সেটা বানানো শেখানোর দরকার নেই।

## ধারণাটা সহজ ভাষায়

**SFT (Supervised Fine-Tuning)** মানে input আর তার সঠিক output-এর জোড়া দিয়ে আগে শেখানো model-কে আরও শেখানো। Loss আগের মতোই next-token cross-entropy। বদলেছে শুধু data। ML-এর টিম এটা দিয়েই model-কে নির্দিষ্ট কাজের আচরণ শেখায়।

**Instruction tuning** হলো SFT-এর একটা ব্যবহার, যেখানে input একটা নির্দেশনা আর output তার উত্তর। নানা রকম কাজের নির্দেশনা মেশানো হয়, যাতে model নতুন নির্দেশনাও মানতে পারে। সব SFT data নির্দেশনা-উত্তরের আকারে হয় না; যেমন ছবি থেকে লেখা পড়ার জোড়াও SFT।

**Training sequence বানানো:** প্রশ্ন, উত্তর আর থামার চিহ্ন `<end>` জুড়ে একটাই লম্বা token সারি হয়। Model এই সারি পড়ে প্রতি অবস্থানে পরের token অনুমান করে, ঠিক pretraining-এর মতো। প্রথম token-এর আগে কিছু নেই, তাই সেটা কখনো target নয়। `<end>` উত্তরের অংশ, কারণ কখন থামতে হয় সেটাও শেখার বিষয়।

**Loss mask:** প্রতিটা target token-এর জন্য একটা সংখ্যা, 1 বা 0। প্রশ্নের অংশের token-এ 0, উত্তরের token ও `<end>`-এ 1। যেখানে mask 0, সেখানে loss-কে 0 দিয়ে গুণ করা হয়। ফলে সেই token থেকে loss বা gradient কিছুই আসে না। প্রশ্নের token তবু context হিসেবে model-এর ভেতর দিয়ে যায়; শুধু সেগুলো অনুমান করার ভুল গোনা হয় না।

সাবধান: কিছু সেটআপে প্রশ্নের অংশেও loss রাখা হয়। সেটা একটা design-এর সিদ্ধান্ত। এখানে সরল ও প্রচলিত শুরু ধরা হয়েছে: শুধু উত্তরে loss।

Training-এর সময় যে ছাঁচে (template) প্রশ্ন সাজানো হয়েছিল, ব্যবহারের সময়ও ঠিক সেই ছাঁচে সাজাতে হয়। ছাঁচ model অনুযায়ী আলাদা, তাই সেই model-এর documentation দেখো।

## ছোট একটা উদাহরণ

প্রশ্ন "পিন ভুলে গেলে ?", উত্তর "পিন রিসেট করুন"। পুরো সারি (শব্দকে এক token ধরা হয়েছে):

`পিন | ভুলে | গেলে | ? | পিন | রিসেট | করুন | <end>`

প্রথম চারটা প্রশ্ন, পরের চারটা উত্তর। প্রথম `পিন` কোনো target নয়, তাই target থাকে সাতটা। ধরো model সঠিক token-কে নিচের probability দিয়েছে (বানানো সংখ্যা):

| Target token | p | −ln p | mask |
|---|---:|---:|---:|
| ভুলে | 0.10 | 2.303 | 0 |
| গেলে | 0.20 | 1.609 | 0 |
| ? | 0.10 | 2.303 | 0 |
| পিন | 0.30 | 1.204 | 1 |
| রিসেট | 0.20 | 1.609 | 1 |
| করুন | 0.60 | 0.511 | 1 |
| `<end>` | 0.50 | 0.693 | 1 |

- Mask ছাড়া সব সাতটার গড়: `10.232 / 7 = 1.462`।
- Mask-সহ শুধু উত্তরের চারটা: `4.017 / 4 = 1.004`।

প্রশ্নের token আগাম অনুমান করা কঠিন, তাই mask ছাড়া loss-এর বড় অংশ আসত এমন অংশ থেকে, যা আমরা শেখাতে চাই না।

## Formula / কোড

উদাহরণের একই কাজ:

`loss = Σ (mᵢ × (−ln pᵢ)) / Σ mᵢ`

- `pᵢ`: i-তম target token-এর সঠিক probability।
- `mᵢ`: সেই token-এর mask (0 বা 1)।
- ভাগ করা হচ্ছে mask-এর যোগফল দিয়ে, অর্থাৎ গণনায় ধরা token-এর সংখ্যা দিয়ে।

সংখ্যা বসিয়ে: `(1.204 + 1.609 + 0.511 + 0.693) / 4 = 1.004`।

সাবধান: গড় কীভাবে নেওয়া হবে (গণনায় ধরা token দিয়ে, নাকি অন্য কিছু দিয়ে ভাগ), সেটা training library অনুযায়ী আলাদা হতে পারে। এখানে সরল গড়।

```python
import math

tokens = ["পিন", "ভুলে", "গেলে", "?", "পিন", "রিসেট", "করুন", "<end>"]
n_prompt = 4                          # প্রথম ৪টা token প্রশ্ন
p = [0.10, 0.20, 0.10, 0.30, 0.20, 0.60, 0.50]   # সাতটা target-এর সঠিক p
targets = tokens[1:]                  # প্রথম token কখনো target নয়
mask = [1 if i + 1 >= n_prompt else 0 for i in range(len(targets))]

losses = [-math.log(x) for x in p]
no_mask = sum(losses) / len(losses)
masked = sum(l * m for l, m in zip(losses, mask)) / sum(mask)
print("mask:", mask)
print("no mask:", round(no_mask, 3))
print("masked :", round(masked, 3))
```

```text
# output:
mask: [0, 0, 0, 1, 1, 1, 1]
no mask: 1.462
masked : 1.004
```

## মনে রাখার সারকথা
- SFT মানে input-সঠিক output জোড়া দিয়ে একই next-token loss-এ আরও শেখানো; instruction tuning তার একটা ব্যবহার।
- প্রশ্ন + উত্তর + `<end>` এক সারি; mask দিয়ে সাধারণত শুধু উত্তরের (ও `<end>`-এর) ভুল গোনা হয়।
- Mask 0 হলে সেই token থেকে loss ও gradient আসে না, কিন্তু সেটা context হিসেবে থাকে।

## নিজে করো

১. উত্তরের তিনটা token-এর probability 0.5, 0.5, 0.25 আর সবগুলোর mask 1। গড় loss কত?
২. তিন token-এর p `[0.8, 0.5, 0.5]`, mask `[0, 1, 1]`। Mask-সহ ও mask ছাড়া গড় loss কত? কোনটা বড়?
৩. উদাহরণের সারণিতে "?" token-এর p 0.10-এর বদলে 0.40 হলে mask-সহ loss বদলায় কি?

<details><summary>উত্তর</summary>

১. `(0.693 + 0.693 + 1.386) / 3 = 0.924`।
২. Loss: `0.223, 0.693, 0.693`। Mask-সহ `(0.693 + 0.693) / 2 = 0.693`। Mask ছাড়া `(0.223 + 0.693 + 0.693) / 3 = 0.536`। Mask-সহ বড়, কারণ সহজ (p = 0.8) প্রশ্নের token গড় কমিয়ে দিচ্ছিল।
৩. বদলায় না, `1.004`-ই থাকে। "?" token-এর mask 0, তাই তার loss (`2.303` থেকে `0.916`) গণনায় নেই। Mask ছাড়া loss বদলাত।

</details>

## পরের পাঠ

SFT-এর data কোন বিষয়ের, আর কোন ঘাটতি ভরাতে কোন উপায় লাগবে: [Lecture 03 — Domain Adaptation ও Data Selection](lecture-03-domain-adaptation-and-data-selection.md)।
