# Lecture 05 — Training উদাহরণ ও Loss

> আগে যা জানা থাকলে ভালো: [Next-token prediction ও cross-entropy](../module-12-text-sequences-and-multimodal-models/lecture-04-next-token-and-cross-entropy.md) আর [Sample, batch, step ও epoch](../module-10-neural-network-training/lecture-06-batch-step-and-epoch.md)। এই lecture শেষে পারবে: project-এর একটা training row দেখে বলতে কোন token-এ loss গোনা হয়, label smoothing-সহ loss হাতে বের করতে, আর epoch থেকে মোট step গুনতে।
> তথ্যের উৎস: `ocr-benchmark/surya_finetune/train_lora.py` (`DocumentOCRDataset`, `collate_fn`, `SmoothedTrainer`, `main`), `ocr-benchmark/surya_finetune/prompts.py`, `ocr-benchmark/surya_finetune/combined_manifest_v19.jsonl` (সারি গুনেছি, একটা সারি পড়েছি), `ocr-benchmark/docs/HISTORY_bn.md` (v19 সারি)। Chat template Hugging Face cache-এর `chat_template.jinja` থেকে।

## সমস্যাটা কী?

Model-এর input-এ আছে ছবির কয়েকশো token, তারপর prompt, তারপর উত্তর। সবখানে loss গুনলে model ছবির token আর prompt "অনুমান" করতেও শিখত, যা আমাদের কাজ নয়। আমরা চাই শুধু একটা জিনিস শিখুক: ছবি আর prompt দেখে সঠিক লেখা বলা। তাই loss ঠিক কোথায় গোনা হবে, সেটা আগে ঠিক করতে হয়।

## ধারণাটা সহজ ভাষায়

**একটা training row।** v19-এর manifest (`combined_manifest_v19.jsonl`) পড়ে দেখেছি: 29,202টা সারি, প্রতিটায় `image`, `prompt`, `text`, `box` ইত্যাদি। একটা আসল সারি (prompt ছোট করে দেখানো):

```text
image:  data/preprocessed_v19_pages/.../19709.jpg
prompt: Read the Bangla text inside the region <box>0,0,1000,1000</box> of this page image (...)
text:   ছাপলেন
```

`text` হলো সঠিক উত্তর (ground truth)। এটাই supervised শেখার "label"।

**Training-এ কী কী ঘটে** (`train_lora.py`):

1. সারিটা একটা কথোপকথন হয়: user-এর ঘরে ছবি আর prompt, assistant-এর ঘরে `text`।
2. Chat template সেটাকে token-এ বদলায়। উত্তরের অংশ হলো `text`-এর অক্ষরগুলো, তারপর `<|im_end|>` ও একটা নতুন লাইন।
3. **Label** বানানো হয়: ছবি ও prompt-এর অংশের label `-100` বসানো হয় (`-100` মানে "এই জায়গা loss-এ গোনা হবে না"), শুধু উত্তরের অংশে আসল token থাকে।
4. Model প্রতিটা অবস্থানে পরের token-এর score দেয়। Code এই score-কে এক ঘর সরিয়ে label-এর সঙ্গে মেলায় (অবস্থান i পরের token অনুমান করে)।
5. Loss হলো cross-entropy, সঙ্গে **label smoothing 0.1**।

**Label smoothing:** সঠিক token-কে 100% ধরার বদলে লক্ষ্য হয় 90% সঠিক token + 10% সব token-এ সমান ভাগ। উদ্দেশ্য model যেন কোনো token নিয়ে অতি-নিশ্চিত না হয়; project-এ এটা বারবার ঘোরা (repetition) আর "ভুল কিন্তু সুন্দর শব্দ" ঠেকানোর জন্য যোগ হয়েছে। এটা training loss-এর অংশ, inference-এ নেই।

## ছোট একটা উদাহরণ

উপরের সারি: উত্তর "ছাপলেন" = 6 অক্ষর, সঙ্গে `<|im_end|>` ও নতুন লাইন, মোট 8টা label। ধরি prompt-অংশে 517 token। প্রতি token-এ model সঠিকটাকে যত probability দিয়েছে, সেটা বানানো সংখ্যা।

**ধাপ ১: কোথায় loss।** মোট 525 অবস্থান, loss মাত্র 8টায়।

**ধাপ ২: সাধারণ loss।** প্রতি token-এর loss = −ln(p)। গড় নিলে 0.257 (নিচের code)।

**ধাপ ৩: smoothing-সহ।** ছোট একটা vocabulary (4 token) ধরি, সঠিক token প্রথমটা। তখন লক্ষ্য `[0.925, 0.025, 0.025, 0.025]`। Model-এর probability বদলালে loss:

| model-এর probability | সাধারণ loss | smoothing 0.1-সহ loss |
|---|---|---|
| [0.70, 0.10, 0.10, 0.10] | 0.357 | 0.503 |
| [0.925, 0.025, 0.025, 0.025] | 0.078 | **0.349** (সর্বনিম্ন) |
| [0.97, 0.01, 0.01, 0.01] | 0.030 | 0.374 |

সাধারণ loss শুধু কমতেই থাকে। কিন্তু smoothing-সহ loss 0.925-এ সবচেয়ে কম, তার চেয়ে বেশি নিশ্চিত হলে আবার বাড়ে। অতি-নিশ্চিত হওয়াকে শাস্তি দেওয়াই এর কাজ।

```python
import math

# ১) loss কোথায়: prompt অংশ -100, উত্তরের 8 token-এ আসল label
labels = ["-100"] * 517 + ["ছ", "া", "প", "ল", "ে", "ন", "<|im_end|>", "\n"]
print(len(labels), sum(1 for x in labels if x != "-100"))

# ২) সঠিক token-এ model-এর probability (বানানো) থেকে গড় loss
p_correct = [0.90, 0.80, 0.60, 0.70, 0.90, 0.50, 0.95, 0.99]
print(round(sum(-math.log(p) for p in p_correct) / len(p_correct), 3))

# ৩) label smoothing: লক্ষ্য = (1 - eps) × one-hot + eps ÷ K
def smoothed_loss(p, correct, eps=0.1):
    k = len(p)
    q = [eps / k] * k
    q[correct] += 1 - eps
    return -sum(qi * math.log(pi) for qi, pi in zip(q, p))

for p in ([0.70, 0.10, 0.10, 0.10], [0.925, 0.025, 0.025, 0.025], [0.97, 0.01, 0.01, 0.01]):
    print(round(-math.log(p[0]), 3), round(smoothed_loss(p, 0), 3))
# output:
# 525 8
# 0.257
# 0.357 0.503
# 0.078 0.349
# 0.03 0.374
```

**Step গোনা।** Batch 1 আর gradient accumulation 8 মানে 8টা সারি মিলে একবার weight বদলায়। 29,202 ÷ 8 = 3,650.25, শেষ ছোট ভাগসহ প্রতি epoch-এ 3,651 step। 3 epoch-এ 10,953। HISTORY-তে v19-এর step লেখা ঠিক 10,953। Project-এর হিসাবে প্রতি step প্রায় 9 সেকেন্ড, তাই 10,953 × 9 সেকেন্ড ≈ 27.4 ঘণ্টা (docs-এ ~27.9 ঘণ্টা)।

```python
import math
print(math.ceil(29202 / 8), math.ceil(29202 / 8) * 3)
# output:
# 3651 10953
```

## একটা মজার ফল: loss শূন্যে নামে না

আসল vocabulary 65,425 token-এর। Smoothing 0.1 থাকলে model যত ভালোই হোক, loss একটা নিচের সীমার নিচে নামতে পারে না, কারণ লক্ষ্যই "কিছুটা সবার মধ্যে ছড়ানো"। আমার হিসাবে (smoothing-করা লক্ষ্যের entropy, 65,425 token ধরে) সীমাটা প্রায় **1.434**। HISTORY-তে v19-এর train_loss 1.592 লেখা। অর্থাৎ 1.592 "খারাপ" নয়, সীমার কাছেই। (এই তুলনা project-এর docs-এ নেই, আমার নিজের হিসাব; আসল training log আমি দেখিনি। আর smoothing আসার আগের সংখ্যার সঙ্গে, যেমন ~0.5, এই সংখ্যা তুলনা করা যায় না।)

## আগের পাঠের ধারণা এখানে কোথায়

| ধারণা | আগের পাঠ | এই project-এ |
|---|---|---|
| Next-token prediction ও cross-entropy | [Module 12, Lecture 04](../module-12-text-sequences-and-multimodal-models/lecture-04-next-token-and-cross-entropy.md) | `logits[:-1]` বনাম `labels[1:]`, উত্তরের token-এ |
| Log loss | [Module 03, Lecture 03](../module-03-logistic-regression/lecture-03-log-loss.md) | −ln(সঠিক token-এর p) |
| Loss, gradient, update আলাদা | [Module 10, Lecture 01](../module-10-neural-network-training/lecture-01-loss-gradient-and-backpropagation.md) | Loss শুধু ভুল মাপে; update করে optimizer |
| Optimizer, learning rate | [Module 10, Lecture 05](../module-10-neural-network-training/lecture-05-optimizer-and-learning-rate.md) | learning rate 1e-4, warmup |
| Batch, step, epoch | [Module 10, Lecture 06](../module-10-neural-network-training/lecture-06-batch-step-and-epoch.md) | batch 1 × accumulation 8, 3 epoch |
| Regularization | [Module 07, Lecture 03](../module-07-generalization-and-overfitting/lecture-03-regularization-and-early-stopping.md) | weight decay 0.01, label smoothing 0.1 |
| Validation | [Module 10, Lecture 07](../module-10-neural-network-training/lecture-07-training-loop-and-validation.md) | Training-এ validation split নেই; `train_lora.py`-র মন্তব্য অনুযায়ী সব data-ই train করে, আর আলাদা GT sample দিয়ে পরে মাপা হয় ([Lecture 08](lecture-08-cer-wer-and-version-comparison.md)) |

## মনে রাখার সারকথা

- একটা training row = ছবি + prompt + সঠিক লেখা; loss শুধু উত্তরের token-এ (আর stop token-এ) গোনা হয়।
- Label smoothing অতি-নিশ্চিত হওয়াকে শাস্তি দেয়, তাই loss শূন্যে নামে না।
- 29,202 সারি ÷ 8, ওপরে ধরে, × 3 epoch = 10,953 step।

## নিজে করো

১. Prompt-অংশে 300 token, উত্তর "ছাপলেন" + stop token + নতুন লাইন। কয়টা অবস্থানে loss গোনা হয়?
২. সঠিক token-এ probability 0.5 হলে (smoothing ছাড়া) loss কত?
৩. 10,000 সারি, accumulation 8, 2 epoch হলে মোট step কয়টা?

<details><summary>উত্তর</summary>

১. 6 + 1 + 1 = **8**টা। Prompt-অংশের 300টায় `-100`।
২. −ln(0.5) = **0.693**।
৩. 10,000 ÷ 8 = 1,250 প্রতি epoch; 2 epoch-এ **2,500**।

</details>

## পরের পাঠ

Model-এর কোন অংশ এই loss দিয়ে বদলায়, সেটা LoRA config থেকে গোনা: [Lecture 06 — LoRA Config ও Parameter Count](lecture-06-lora-config-and-parameter-count.md)।
