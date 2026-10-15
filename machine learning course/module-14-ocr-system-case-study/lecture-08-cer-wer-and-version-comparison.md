# Lecture 08 — CER, WER ও Version তুলনা

> আগে যা জানা থাকলে ভালো: [Train, validation, test](../module-05-data-preparation-and-splits/lecture-03-train-validation-test-split.md), [Data leakage](../module-05-data-preparation-and-splits/lecture-04-data-leakage.md) আর [Baseline](../module-06-model-evaluation-and-baselines/lecture-01-baselines.md)। এই lecture শেষে পারবে: CER ও WER হাতে বের করতে, আর বলতে দুটো version-এর তুলনা কখন ন্যায্য।
> তথ্যের উৎস: `ocr-benchmark/surya_finetune/compute_cer_wer.py` (`levenshtein`, `cer`, `wer`), `ocr-benchmark/surya_finetune/compute_gt_eval.py` (pooled হিসাব, header-মোছা, bootstrap), `ocr-benchmark/surya_finetune/gt_samples.py`, `ocr-benchmark/surya_finetune/gt_outputs/*.json`, `ocr-benchmark/docs/HISTORY_bn.md` (সারসংক্ষেপ table, v17–v19 অংশ)। নিচের নিজের code project-এর `cer`/`wer`-এর সঙ্গে একই ফল দেয়, তা project-এর আসল function দিয়ে মিলিয়ে দেখেছি।

## সমস্যাটা কী?

"v19 ভালো" বলতে হলে একটা সংখ্যা লাগে। কিন্তু লেখার ভুল মাপা সহজ নয়: দুটো লেখা হুবহু মেলে না, অথচ কতটা না মেলে? একটা অক্ষর ভুল আর একটা শব্দ বাদ, দুটো কি সমান ভুল? আবার সংখ্যা পাওয়ার পর প্রশ্ন, দুটো version-এর সংখ্যা পাশাপাশি রাখা কি ন্যায্য?

## ধারণাটা সহজ ভাষায়

**Edit distance:** একটা লেখাকে আরেকটায় বদলাতে কমপক্ষে কয়টা ছোট বদল লাগে। বদল তিন রকম: একটা বসানো, একটা মোছা, একটা পাল্টানো।

- **CER** (character error rate) = অক্ষর ধরে edit distance ÷ reference-এর অক্ষর সংখ্যা।
- **WER** (word error rate) = শব্দ ধরে edit distance ÷ reference-এর শব্দ সংখ্যা।

Reference হলো মানুষের যাচাই করা সঠিক লেখা (project-এ একে GT, ground truth বলে)।

Project-এর নিয়ম:

- আগে NFC করা। Unicode-এ একই দেখতে অক্ষর দুভাবে লেখা যায় (নিচে উদাহরণ), NFC তাদের একরূপ করে।
- CER-এ space আর নতুন লাইন গোনা হয় না। বাংলার ক্ষেত্রে "অক্ষর" মানে Unicode code point, তাই `ি`, `া` আলাদা একক।
- WER-এ লেখা space ধরে শব্দে ভাগ হয়।

## ছোট একটা উদাহরণ

Reference "আমি ভাত খাই": space বাদে 9 code point, 3 শব্দ।

| Output | অক্ষরে বদল | CER | শব্দে বদল | WER |
|---|---|---|---|---|
| আমি ভাট খাই | 1 (ত → ট) | 1 ÷ 9 = 0.111 | 1 | 1 ÷ 3 = 0.333 |
| আমি ভাত | 3 (খাই মোছা) | 3 ÷ 9 = 0.333 | 1 | 1 ÷ 3 = 0.333 |
| আমি ভাত খাই | 0 | 0 | 0 | 0 |

একটা অক্ষরের ভুলে WER-এ পুরো শব্দ ভুল হয়, তাই WER সাধারণত CER-এর চেয়ে বড়। আর শব্দ বাদ গেলে দুটোই বাড়ে, কিন্তু অক্ষর হিসাবে বেশি।

```python
import unicodedata

def edit_distance(a, b):
    dp = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        prev, dp[0] = dp[0], i
        for j in range(1, len(b) + 1):
            cur = dp[j]
            dp[j] = min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] != b[j - 1]))
            prev = cur
    return dp[-1]

def chars(text):   # NFC, তারপর space ও নতুন লাইন বাদ
    return unicodedata.normalize("NFC", text).replace(" ", "").replace("\n", "")

def cer(ref, hyp):
    return edit_distance(chars(ref), chars(hyp)) / len(chars(ref))

def wer(ref, hyp):
    return edit_distance(ref.split(), hyp.split()) / len(ref.split())

ref = "আমি ভাত খাই"
for hyp in ["আমি ভাট খাই", "আমি ভাত", "আমি ভাত খাই"]:
    print(hyp, "| CER", round(cer(ref, hyp), 3), "| WER", round(wer(ref, hyp), 3))
print("শুধু space:", cer("ভাত খাই।", "ভাত খাই ।"), wer("ভাত খাই।", "ভাত খাই ।"))
a, b = "য়", "য়"          # য় : এক code point বনাম য + নুক্তা (দুই code point)
print(a == b, unicodedata.normalize("NFC", a) == unicodedata.normalize("NFC", b))
# output:
# আমি ভাট খাই | CER 0.111 | WER 0.333
# আমি ভাত | CER 0.333 | WER 0.333
# আমি ভাত খাই | CER 0.0 | WER 0.0
# শুধু space: 0.0 1.0
# False True
```

শেষ দুই লাইন দুটো ফাঁদ দেখায়:

- **Space-এর পার্থক্য:** "ভাত খাই।" আর "ভাত খাই ।" অক্ষরে এক (CER 0), কিন্তু শব্দ ভাগ আলাদা, তাই WER 100%। HISTORY-তে v9-এর WER 42.9% বিভ্রান্তিকর ছিল ঠিক এই কারণে: যতিচিহ্নের আগে space দেওয়ার ফরম্যাটের তফাত, পড়ার ভুল নয়। সেখানে CER-ই নির্ভরযোগ্য ধরা হয়েছিল।
- **NFC:** বাংলা `য়` লেখা যায় দুভাবে: এক code point (U+09DF) হিসেবে, অথবা `য` (U+09AF) আর নুক্তা (U+09BC) দুই code point হিসেবে। পর্দায় দেখতে এক, কিন্তু `==` বলে আলাদা। NFC-র পর সমান। Project-এ হাতে-টাইপ করা reference-এ এই গোলমাল সত্যিই ধরা পড়েছিল।

## অনেক নমুনা একসঙ্গে: pooled বনাম গড়

Project-এর `compute_gt_eval.py` **pooled** হিসাব করে: সব নমুনার ভুল অক্ষর যোগ, ÷ সব নমুনার reference অক্ষর যোগ। প্রতি নমুনার CER-এর গড় নয়। তফাত কতটা হতে পারে, একটা ছোট আসল উদাহরণ। `gt_outputs/`-এর v16 ও v19 (`crop_scope`) merged output, তিনটা নমুনা:

| নমুনা | reference অক্ষর | v16: ভুল | v19: ভুল |
|---|---|---|---|
| rudro4_short_line | 17 | 2 | 0 |
| amake_amar_moto | 212 | 2 | 4 |
| handwritten_rudro | 236 | 13 | 19 |

```python
v16 = [(2, 17), (2, 212), (13, 236)]    # (ভুল অক্ষর, reference-এর অক্ষর)
v19 = [(0, 17), (4, 212), (19, 236)]
for name, rows in (("v16", v16), ("v19", v19)):
    pooled = sum(e for e, n in rows) / sum(n for e, n in rows)
    mean = sum(e / n for e, n in rows) / len(rows)
    print(name, "pooled", round(pooled * 100, 1), "| প্রতি নমুনার গড়", round(mean * 100, 1))
# output:
# v16 pooled 3.7 | প্রতি নমুনার গড় 6.1
# v19 pooled 4.9 | প্রতি নমুনার গড় 3.3
```

Pooled-এ v16 এগিয়ে (3.7 বনাম 4.9), গড়ে v19 এগিয়ে (3.3 বনাম 6.1)। কারণ 17-অক্ষরের ছোট নমুনা গড়ে 236-অক্ষরের নমুনার সমান ওজন পায়। এটা শুধু তিন নমুনার খেলনা তুলনা; কোনো version ভালো তার প্রমাণ নয়। শিক্ষা: তুলনার আগে ঠিক করো কীভাবে এক সংখ্যা বানাবে, এবং সবার জন্য একই নিয়ম রাখো।

## Version তুলনা কখন ন্যায্য

HISTORY-র সারসংক্ষেপ table থেকে, held-out ১৪টা GT নমুনায় production path-এ (সব pipeline সংশোধনের পর):

| Version | CER | WER |
|---|---|---|
| v16 | 10.9% | 23.8% |
| v17 | 16.3% | 27.6% |
| v19 | 9.8% | 17.6% |

এই তিন সারি পাশাপাশি রাখা যায়, কারণ একই নমুনা, একই pipeline। কিন্তু table-এর পুরনো সারি (যেমন v9-এর CER 5.7%) মাপা হয়েছিল মাত্র ২ বা ৮টা নমুনায়। HISTORY নিজেই বলছে সেগুলো সরাসরি তুলনীয় নয়। তাই "v9-এর 5.7% < v19-এর 9.8%, অতএব v9 ভালো" ধরা ভুল।

ন্যায্য তুলনার শর্ত:

1. **একই নমুনা।** এক set-এর সংখ্যা আরেক set-এর সংখ্যার পাশে বসানো যায় না।
2. **Held-out নমুনা।** যে ছবি training-এ ছিল, তা বাদ। v18-এর আগের audit-এ ১০টা GT-র ২টা training-এ পাওয়া যায় (leakage); সরানোর পর v16-এর CER 9.2% থেকে 11.0% হয়ে যায়। `compute_gt_eval.py` এখন সেগুলো আলাদা চিহ্নিত করে ([Module 05, Lecture 04](../module-05-data-preparation-and-splits/lecture-04-data-leakage.md))।
3. **একই pipeline mode।** [Lecture 07](lecture-07-output-formatting-and-error-sources.md)-এ দেখেছ, একই weight-এ mode বদলালে CER বদলায়।
4. **মাপার code ঠিক।** v17 ও v18-এর হাতের লেখায় বড় "regression" মূলত scoring-এর একটা ভুল ছিল: header-এর রূপ ধরা পড়ত না। সংশোধনে v17-এর held-out CER 21.0% থেকে 15.6% হয় (HISTORY)।
5. **ছোট set-এ ঝুঁকি।** 14টা নমুনায় 1–2 পয়েন্টের তফাত শুধু ভাগ্যের হতে পারে। `compute_gt_eval.py`-র মন্তব্যও তাই বলে, আর সেই কারণে bootstrap দিয়ে confidence interval ছাপে। সেই সংখ্যা আমি চালিয়ে দেখিনি।

**Baseline:** table-এর প্রথম সারি আগে-থেকে-শেখানো Surya OCR 2 (কোনো fine-tune ছাড়া), CER 36.3%, WER 59.7%। কোনো version-এর সংখ্যা এর সঙ্গে তুলনা করেই বোঝা যায় fine-tuning কিছু দিয়েছে কি না। (এটাও পুরনো, ছোট নমুনা-সেটের সংখ্যা।)

**CER আর training loss এক জিনিস নয়।** Loss ([Lecture 05](lecture-05-training-example-and-loss.md)) প্রতি token-এর probability থেকে আসে। CER আসে model-এর আসল output লেখা থেকে। একটা কমলে অন্যটা কমবেই, এমন নয়।

## আগের পাঠের ধারণা এখানে কোথায়

| ধারণা | আগের পাঠ | এই project-এ |
|---|---|---|
| Held-out, test set | [Module 05, Lecture 03](../module-05-data-preparation-and-splits/lecture-03-train-validation-test-split.md) | GT নমুনা training-এর বাইরে রাখা |
| Data leakage | [Module 05, Lecture 04](../module-05-data-preparation-and-splits/lecture-04-data-leakage.md) | ২টা GT ছবি training-এ ছিল |
| Baseline | [Module 06, Lecture 01](../module-06-model-evaluation-and-baselines/lecture-01-baselines.md) | LoRA ছাড়া base model |
| Metric, ভুলের গড় | [Module 06, Lecture 02](../module-06-model-evaluation-and-baselines/lecture-02-regression-metrics.md) | Pooled বনাম প্রতি নমুনার গড় |
| ছোট set-এর অনিশ্চয়তা | [Module 06, Lecture 05](../module-06-model-evaluation-and-baselines/lecture-05-cross-validation-and-final-test.md) | 14 নমুনা, bootstrap |
| Overfitting | [Module 07, Lecture 01](../module-07-generalization-and-overfitting/lecture-01-underfitting-and-overfitting.md) | v6-এ CER 12.7% থেকে 19.7%, একই বাক্য তিনবার ফিরে আসা (HISTORY) |

## মনে রাখার সারকথা

- CER = অক্ষর ধরে edit distance ÷ reference-এর অক্ষর; WER = শব্দ ধরে। Reference-এর মান দিয়ে ভাগ।
- সংখ্যা বানানোর নিয়ম (pooled বা গড়, space, NFC) সংখ্যার মানকে বদলে দেয়।
- Version তুলনা ন্যায্য হতে একই held-out নমুনা, একই pipeline, ঠিক scoring আর ছোট set-এর অনিশ্চয়তার হিসাব লাগে।

## নিজে করো

১. Reference "আমি ভাত খাই", output "আমি ভাত খাই খাই"। CER ও WER কত?
২. Reference "ভাত খাই।", output "ভাত খাই"। CER ও WER কত?
৩. নমুনা A: reference 10 অক্ষর, 1 ভুল। নমুনা B: 100 অক্ষর, 20 ভুল। Pooled CER আর প্রতি নমুনার CER-এর গড় কত?

<details><summary>উত্তর</summary>

১. Output-এ বাড়তি "খাই" মানে 3 অক্ষর বসানো। CER = 3 ÷ 9 = **0.333**। শব্দে 1 বসানো, WER = 1 ÷ 3 = **0.333**।
২. Reference-এ space বাদে 7 অক্ষর (ভ া ত খ া ই ।), একটা ("।") মোছা: CER = 1 ÷ 7 = **0.143**। শব্দ: "খাই।" বনাম "খাই" আলাদা, তাই 1 পাল্টানো, WER = 1 ÷ 2 = **0.5**।
৩. Pooled = (1 + 20) ÷ (10 + 100) = 21 ÷ 110 = **19.1%**। প্রতি নমুনার গড় = (10% + 20%) ÷ 2 = **15%**।

</details>

## পরের পাঠ

Module 14-এর পথ এখানে শেষ: ছবি থেকে লেখা, model-এর গঠন, training, LoRA-র সংখ্যা, output আর মাপা। এই ধারণাগুলো এরপর Module 15-এ আরও কাজে লাগবে: [Domain ও task adaptation](../module-15-domain-and-task-adaptation/README.md)।
