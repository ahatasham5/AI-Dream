# Lecture 05 — Time ও Group অনুযায়ী Split: test যেন আসল পরিস্থিতির মতো হয়

> আগে যা জানা থাকলে ভালো: [Data Leakage](lecture-04-data-leakage.md) আর [Train/Validation/Test split](lecture-03-train-validation-test-split.md)। এই lecture শেষে পারবে: কোন data-তে এলোমেলো ভাগ চলবে না তা চিনতে, আর time split ও group split করতে।

## সমস্যাটা কী?

আগের lecture-এ data এলোমেলো করে ভাগ করেছি। সাধারণ ক্ষেত্রে সেটাই ঠিক। কিন্তু দুটো পরিস্থিতিতে এতে নীরবে leakage ঢোকে:

- **সময়ের ক্রম আছে:** আগামী মাসের বিক্রি predict করতে হবে। এলোমেলো ভাগে validation-এর "মার্চ"-এর আশেপাশের মাসগুলো train-এ থাকে। Model আসলে ভবিষ্যৎ দেখে ফেলেছে।
- **একই ব্যক্তির অনেক row:** একজন রোগীর তিনটা scan। এলোমেলো ভাগে একটা scan train-এ, আরেকটা test-এ গেল। Model রোগ নয়, রোগীর চেহারা চিনে ফেলল।

দুই ক্ষেত্রেই test set আসল পরিস্থিতির মতো কঠিন থাকে না, তাই ফল বাড়িয়ে দেখায়।

## ধারণাটা সহজ ভাষায়

নীতিটা এক: **test set বানাও এমনভাবে, যেমন অবস্থায় model আসলে কাজ করবে।**

**Time split।** আসল কাজে model অতীত দেখে ভবিষ্যৎ predict করবে। তাই ভাগও হবে সময় ধরে: পুরনো সময় train-এ, নতুন সময় test-এ (মাঝে validation চাইলে সেটা train আর test-এর মাঝখানের সময়)। Shuffle করা হয় না।

**Group split।** Row-গুলো যদি গোষ্ঠীতে (রোগী, ক্রেতা, দোকান) বাঁধা থাকে, আর model-কে নতুন গোষ্ঠীর জন্যই কাজ করতে হয়, তাহলে একটা গোষ্ঠীর **সব row একই দিকে** যাবে: হয় সবাই train-এ, নয় সবাই test-এ। গোষ্ঠীকে **group** বলা হয়।

কোনটা কখন:

| পরিস্থিতি | split |
|---|---|
| আগামীকাল/আগামী মাস predict | time split |
| নতুন রোগী/নতুন ক্রেতার জন্য predict, প্রতিজনের একাধিক row | group split |
| row-গুলো স্বাধীন, সময় বা গোষ্ঠীর প্রভাব নেই | এলোমেলো split |

## ছোট একটা উদাহরণ

### Time split

১০ মাসের বিক্রি (একক):

| মাস | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| বিক্রি | 10 | 12 | 13 | 15 | 18 | 19 | 22 | 25 | 27 | 30 |

Model: যে মাস জিজ্ঞেস করা হবে, train-এর সবচেয়ে কাছের মাসের বিক্রিটাই বলে। (দুটো মাস সমান দূরে থাকলে code আগেরটা নেয়।)

**এলোমেলো ভাগ:** validation = মাস 2, 8, 9। Train = বাকি মাসগুলো (1, 3, 4, 5, 6, 7, 10)।

- মাস 2: কাছে 1 ও 3 সমান দূরে, আগেরটা (মাস 1) নিলে উত্তর 10। আসল 12। ভুল 2।
- মাস 8: কাছে মাস 7, উত্তর 22। আসল 25। ভুল 3।
- মাস 9: কাছে মাস 10, উত্তর 30। আসল 27। ভুল 3।
- গড় ভুল = (2 + 3 + 3) / 3 = **2.67**।

**Time split:** train = মাস 1 থেকে 7, test = মাস 8, 9, 10। তিন মাসেই সবচেয়ে কাছের train মাস হলো 7, উত্তর 22।

- মাস 8: ভুল |22 − 25| = 3
- মাস 9: ভুল |22 − 27| = 5
- মাস 10: ভুল |22 − 30| = 8
- গড় ভুল = (3 + 5 + 8) / 3 = **5.33**।

এলোমেলো ভাগে ভুল অর্ধেক দেখাচ্ছিল, কারণ model দুই পাশের মাস দেখে নিতে পারত। সত্যিকারের ভবিষ্যতে সেই সুযোগ নেই। Time split সেই কঠিন অবস্থাটাই মাপে।

### Group split

চারজন রোগী, প্রত্যেকের দুটো scan। `reading` একটা সংখ্যা, `রোগ` মানে রোগ আছে (1) বা নেই (0)।

| রোগী | P1 | P1 | P2 | P2 | P3 | P3 | P4 | P4 |
|---|---|---|---|---|---|---|---|---|
| reading | 120 | 121 | 150 | 149 | 140 | 141 | 142 | 143 |
| রোগ | 0 | 0 | 1 | 1 | 0 | 0 | 1 | 1 |

Model: train-এর যে row-এর reading সবচেয়ে কাছে, তার রোগের ফলটাই বলে। এক রোগীর দুটো reading প্রায় একই। আবার P3 ও P4-এর reading কাছাকাছি হলেও ফল উল্টো। অর্থাৎ এই model রোগ নয়, রোগীকেই চিনে রাখে।

- **Scan ধরে এলোমেলো ভাগ:** validation-এ গেল P4-এর 143, P1-এর 120, P3-এর 140, P2-এর 150। প্রত্যেকের "জোড়া" scan (142, 121, 141, 149) train-এ আছে। চারটাই ঠিক, accuracy **1.0**।
- **Group split:** train = P1, P2; validation = P3, P4। P3-এর 140 ও 141, P4-এর 142 ও 143: train-এর সবচেয়ে কাছের reading 149 (P2, রোগ 1)। P4 (রোগ 1) দুটো ঠিক হলো; P3 (রোগ 0) দুটো ভুল। Accuracy **2/4 = 0.5**।

প্রথমটা নতুন রোগীর ক্ষেত্রে ভুল আশা দেয়; দ্বিতীয়টা সত্যি ছবি।

## Formula / কোড

```python
import random

sales = [(1, 10), (2, 12), (3, 13), (4, 15), (5, 18),
         (6, 19), (7, 22), (8, 25), (9, 27), (10, 30)]   # (month, units)

def nearest(month, seen):                    # answer = sales of the closest known month
    return min(seen, key=lambda r: abs(r[0] - month))[1]

def avg_error(rows, seen):
    return sum(abs(nearest(m, seen) - s) for m, s in rows) / len(rows)

# random split: 3 random months held out
rows = sales[:]
random.Random(0).shuffle(rows)
val, train = sorted(rows[:3]), sorted(rows[3:])
print("random  val months:", [m for m, _ in val], "error:", round(avg_error(val, train), 2))

# time split: last 3 months held out
train, test = sales[:7], sales[7:]
print("time    val months:", [m for m, _ in test], "error:", round(avg_error(test, train), 2))
```

```text
# output:
# random  val months: [2, 8, 9] error: 2.67
# time    val months: [8, 9, 10] error: 5.33
```

Group split-এর মূল কাজটুকু:

```python
# scans = list of (patient, reading, disease) rows, as in the table above
patients = {"P1", "P2"}                      # these patients go to train
train = [s for s in scans if s[0] in patients]
val   = [s for s in scans if s[0] not in patients]
```

Group-এর নাম আগে ভাগ করো, তারপর সেই নাম ধরে row আলাদা করো। Row ধরে সরাসরি ভাগ করবে না।

## মনে রাখার সারকথা

- Test set এমন হবে, যেমন অবস্থায় model আসলে কাজ করবে।
- সময়ের ক্রম থাকলে পুরনো থেকে train, নতুনে test (shuffle নয়)।
- একই ব্যক্তি/দোকানের row একাধিক হলে group ধরে ভাগ করো, যেন একটা group দুই দিকে না যায়।

## নিজে করো

১. কোথায় কোন split? (ক) আগামী সপ্তাহের শেয়ারের দাম, (খ) ৫০ জন ছাত্রের প্রত্যেকের ১০টা পরীক্ষার ফল, নতুন ছাত্রের জন্য predict, (গ) আলাদা আলাদা ১০০০টা অসম্পর্কিত বাড়ির বিক্রি।

২. উপরের বিক্রির data-য় শেষ ২ মাস test, মাস 1–8 train। Nearest-month model-এর গড় ভুল কত?

৩. ৫ জন রোগী, প্রত্যেকের ২টা scan, মোট ১০ row। ৩ জন রোগী train-এ গেলে কয়টা row train-এ, কয়টা validation-এ?

<details><summary>উত্তর</summary>

১. (ক) **time split**; (খ) **group split** (ছাত্র হলো group); (গ) **এলোমেলো split** চলে।

২. Train-এর সবচেয়ে কাছের মাস 8 (বিক্রি 25)। মাস 9: |25 − 27| = 2। মাস 10: |25 − 30| = 5। গড় = (2 + 5) / 2 = **3.5**।

৩. ৩ জন × ২ = **৬টা row** train-এ, বাকি ২ জন × ২ = **৪টা row** validation-এ।

</details>

## পরের পাঠ

Module 05 এখানে শেষ: data দেখা, সংখ্যায় আনা, ভাগ করা, leakage এড়ানো। এবার model-কে মাপার পালা। [Module 06-এর প্রথম lecture — Baseline](../module-06-model-evaluation-and-baselines/lecture-01-baselines.md): একটা সংখ্যা "ভালো" কি না, তা বুঝতে কীসের সঙ্গে তুলনা করব।
