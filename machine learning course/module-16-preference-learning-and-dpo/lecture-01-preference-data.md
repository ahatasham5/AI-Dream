# Lecture 01 — Preference data: দুটো উত্তরের মধ্যে কোনটা ভালো

> আগে যা জানা থাকলে ভালো: SFT-র ধারণা, অর্থাৎ একটা prompt-এর জন্য একটা আদর্শ উত্তর দেখিয়ে model শেখানো ([Module 15 — SFT](../module-15-domain-and-task-adaptation/lecture-02-sft-and-instruction-tuning.md)); আর [correction থেকে target ও preference](../module-17-reinforcement-learning-and-feedback/lecture-01-correction-target-preference-and-reward.md)-এর পরিচয়। এই lecture শেষে পারবে: একটা preference pair-এর তিনটা অংশ চিনতে, ranking থেকে pair বানাতে, আর বলতে কেন "পছন্দ" মানে "সত্য" নয়। ([Map-এ অবস্থান](../01-learning-map.md): শেখার সংকেত — data। এখানে model, loss বা update নেই)

## সমস্যাটা কী?

SFT-তে প্রতিটা প্রশ্নের জন্য একটা "আদর্শ উত্তর" লিখে দিতে হয়। কিন্তু অনেক কাজে আদর্শ উত্তর লেখা কঠিন, অথচ দুটো উত্তর পাশাপাশি দেখে "এটা বেশি ভালো" বলা সহজ। যেমন একই প্রশ্নের দুটো উত্তরের মধ্যে কোনটা বেশি ভদ্র, কোনটা বেশি পরিষ্কার, কোনটা বেশি কাজের। এই ধরনের তুলনা থেকে model শেখানোর জন্য যে data লাগে, তার নাম **preference data**। Chat assistant-এর উত্তরের ধরন ঠিক করা, OCR বা অনুবাদের আউটপুটে "কোনটা সঠিকের কাছাকাছি" বাছা, এসব জায়গায় এটা ব্যবহার হয়। বানান annotator (যারা data-তে label দেয়), domain বিশেষজ্ঞ, কখনো অন্য কোনো model।

## ধারণাটা সহজ ভাষায়

একটা preference উদাহরণে তিনটা জিনিস থাকে:

- **prompt** (`x`): model-কে যা জিজ্ঞেস করা হয়েছে।
- **chosen** (`y_w`, w = winner): দুটো উত্তরের মধ্যে যেটা পছন্দ হয়েছে।
- **rejected** (`y_l`, l = loser): যেটা কম পছন্দ হয়েছে।

এই তিনটাকে একসঙ্গে বলে একটা **preference pair**। আগামী lecture-গুলোতে `x`, `y_w`, `y_l` এই নামেই আসবে।

| prompt `x` | chosen `y_w` | rejected `y_l` |
|---|---|---|
| বাংলাদেশের রাজধানী কী? | বাংলাদেশের রাজধানী ঢাকা। | ঢাকা। |

এখানে দুটো উত্তরই সঠিক; পছন্দটা শুধু বলছে "পুরো বাক্যে উত্তর দেওয়া ভালো"। অর্থাৎ pair কোনো উত্তরের নম্বর দেয় না, শুধু দুটোর **আপেক্ষিক** অবস্থান বলে।

### Pair আসে কোথা থেকে?

1. **সরাসরি তুলনা:** একজন মানুষ একই prompt-এর দুটো উত্তর পাশাপাশি দেখে একটা বাছে।
2. **Ranking থেকে:** একজন চারটা উত্তরকে ভালো থেকে খারাপ ক্রমে সাজায়। ক্রম ধরে যত জোড়া হয়, প্রতিটা একটা pair।
3. **Correction থেকে:** model-এর ভুল উত্তর হয় rejected, মানুষের শুধরানো উত্তর হয় chosen।

### Ranking থেকে pair

ধরো একটা prompt-এর চারটা উত্তর A, B, C, D, ক্রমটা A > B > C > D। প্রতিটা দুটো উত্তরের জোড়ায় উপরেরটা chosen, নিচেরটা rejected। জোড়ার সংখ্যা `চার থেকে দুটো বাছা = 4 × 3 ÷ 2 = 6`।

```python
from itertools import combinations

ranking = ["A", "B", "C", "D"]          # A সবচেয়ে ভালো, D সবচেয়ে খারাপ
pairs = [{"chosen": b, "rejected": w} for b, w in combinations(ranking, 2)]

print(len(pairs), "টা pair")
for p in pairs:
    print(p["chosen"], ">", p["rejected"])
# output:
# 6 টা pair
# A > B
# A > C
# A > D
# B > C
# B > D
# C > D
```

সাবধান: একই ranking থেকে বানানো ৬টা pair ৬টা স্বাধীন তথ্য নয়। এরা একই চারটা উত্তর নিয়ে তৈরি।

## পছন্দ মানেই সত্য নয়

Preference শুধু বলে "কে কাকে বেশি পছন্দ করেছে"। উত্তরটা সঠিক কি না, সেটা এতে আপনাআপনি ধরা পড়ে না।

| prompt | chosen | rejected |
|---|---|---|
| ১২ × ১২ কত? | চমৎকার প্রশ্ন! ১২ × ১২ = ১৪৫। | ১৪৪। |

যদি annotator ভদ্র ও লম্বা উত্তরটা পছন্দ করে ফেলেন, pair-এর chosen হবে ভুল উত্তর। পরে যে model এই data থেকে শিখবে, সে শিখবে "এই ধরনের ভদ্র, লম্বা উত্তর বেশি সম্ভাব্য হওয়া উচিত" — ভুল অংকসহই। তাই preference data দিয়ে মূলত **style, পছন্দের ধরন, বা তুলনামূলক মান** শেখানো সহজ। Correctness শেখাতে চাইলে chosen-গুলো যাচাই করা (verified) হতে হবে। এই তফাত [lecture 08](lecture-08-small-dpo-practical-and-evaluation.md)-এর evaluation-এও ফিরবে।

## মনে রাখার সারকথা

- Preference pair = prompt `x` + chosen `y_w` + rejected `y_l`; এটা উত্তরের নম্বর নয়, তুলনা।
- Pair আসে সরাসরি তুলনা, ranking বা correction থেকে; n টা উত্তরের ranking থেকে `n(n−1)/2` টা pair হয়।
- Chosen মানে "বেশি পছন্দ হয়েছে", "সঠিক" নয়। Chosen-এর ভুল model-ও শিখে ফেলে।

## নিজে করো

১. একটা prompt-এর পাঁচটা উত্তরের ranking থেকে কয়টা pair হয়?
২. ১০০০ টা prompt, প্রতিটার চারটা করে উত্তর ranking করা। মোট কয়টা pair বানানো যায়?
৩. কোনো pair-এ chosen আর rejected হুবহু একই লেখা। এই pair থেকে model কী শিখবে? রাখা উচিত কি?

<details><summary>উত্তর</summary>

১. `5 × 4 ÷ 2 = 10`।
২. প্রতি prompt-এ 6, তাই `1000 × 6 = 6000`। তবে একই prompt-এর pair-গুলো পরস্পর নির্ভরশীল।
৩. কিছুই শিখবে না; তুলনা করার মতো কোনো পার্থক্য নেই। পরের lecture-গুলোতে দেখা যাবে, এমন pair-এ gradient শূন্য হয়। বাদ দেওয়াই ভালো।

</details>

## পরের পাঠ

Pair পাওয়া গেল। এখন model-কে বলতে হবে "chosen-এর probability বাড়াও, rejected-এর কমাও"। তার জন্য প্রথমে একটা পুরো উত্তরের probability কীভাবে মাপা হয় দেখতে হবে: [Lecture 02 — পুরো উত্তরের probability ও log-ratio](lecture-02-sequence-probability-and-log-ratio.md)।
