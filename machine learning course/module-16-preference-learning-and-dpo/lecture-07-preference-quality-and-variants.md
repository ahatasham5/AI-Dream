# Lecture 07 — Preference data-র মান ও DPO-র variants

> আগে যা জানা থাকলে ভালো: [SFT, reward model ও DPO-র তুলনা](lecture-06-sft-reward-model-and-dpo.md) এবং [preference data](lecture-01-preference-data.md)। এই lecture শেষে পারবে: length bias আর noisy pair কীভাবে DPO-কে বিপথে নিতে পারে তা বলতে, আর IPO, ORPO, SimPO প্রতিটা DPO-র কোন অংশ বদলায় তা চিনতে। ([Map-এ অবস্থান](../01-learning-map.md): variant এলে আগে দেখি কোন অংশ বদলেছে। এখানে objective-এর আকার ও data-র মান আলোচনা; নতুন update পদ্ধতি নেই)

## সমস্যাটা কী?

DPO-তে rollout বা আলাদা reward model নেই, তাই শেখার পুরো সংকেত আসে preference pair থেকে। Pair-এ কোনো প্যাটার্ন বা ভুল লুকিয়ে থাকলে model সেটাই শিখে ফেলবে। আবার DPO-র নিজেরও কিছু দুর্বলতা আছে, যা সারাতে নতুন নামের variant এসেছে। দুটোই এই lecture-এ।

## Data-র দুটো পরিচিত সমস্যা

### ১. Length bias (দৈর্ঘ্যের পক্ষপাত)

Annotator অনেক সময় লম্বা, বিস্তারিত উত্তরকে বেশি পছন্দ করেন। যদি data-তে chosen প্রায়ই rejected-এর চেয়ে লম্বা হয়, model শিখতে পারে "লম্বা লিখলেই জেতা যায়", অথচ উত্তর আসলে ভালো হয়নি। DPO-তে এর একটা গাণিতিক দিকও আছে: পুরো উত্তরের log probability হলো token-এর `ln p`-র **যোগফল**, তাই উত্তর লম্বা হলে মান সাধারণত আরও ঋণাত্মক হয়।

ধরো প্রতিটা token-এ probability 0.8, দুটো উত্তরই সমান "মানের"; শুধু দৈর্ঘ্য ৫ আর ২০:

```python
import math

for n in [5, 20]:
    lp_sum = n * math.log(0.8)
    print("token", n, " যোগফল =", round(lp_sum, 3), " গড় =", round(lp_sum / n, 3))
# output:
# token 5  যোগফল = -1.116  গড় = -0.223
# token 20  যোগফল = -4.463  গড় = -0.223
```

যোগফল দৈর্ঘ্যের সঙ্গে বদলায়, প্রতি token-এর গড় বদলায় না। DPO-তে log-ratio নেওয়ায় (policy − reference) দৈর্ঘ্যের প্রভাব অনেকটা কমে, কিন্তু data-তে chosen-এর লম্বা হওয়ার প্যাটার্ন থাকলে প্রবণতাটা থেকে যেতে পারে। সাধারণ প্রতিকার: chosen ও rejected-এর দৈর্ঘ্য মিলিয়ে নেওয়া, evaluation-এ দৈর্ঘ্য আলাদা করে মাপা, আর (নিচের) দৈর্ঘ্য-স্বাভাবিক করা variant দেখা।

### ২. Noisy pair (ভুল বা অনিশ্চিত label)

Annotator-রা সবসময় একমত হন না। ধরো তিনজন, প্রত্যেকে স্বাধীনভাবে ০.৭ সম্ভাবনায় আসলেই ভালো উত্তরটা বাছেন। Majority (দুজন বা তিনজন) ঠিক হওয়ার সম্ভাবনা:

`0.7³ + 3 × 0.7² × 0.3 = 0.343 + 0.441 = 0.784`।

```python
q = 0.7
print(round(q**3 + 3 * q**2 * (1 - q), 3))
# output:
# 0.784
```

অর্থাৎ প্রতি ৫টা pair-এর একটার কাছাকাছি (২১.৬%) label উল্টো থাকতে পারে। উল্টো label-এ [Lecture 05](lecture-05-dpo-gradient-and-training-loop.md)-এর gradient policy-কে ভুল উত্তরের দিকেই ঠেলে দেয়। প্রতিকার: বেশি annotator, মতভেদের pair আলাদা বা বাদ দেওয়া, সঠিকতা-নির্ভর কাজে chosen যাচাই করা, আর training-এ ব্যবহার না হওয়া পরিষ্কার একটা evaluation set রাখা।

## DPO-র variants: কোন অংশ বদলায়?

নতুন নাম দেখলেই নতুন math ধরে নিও না। আগে জিজ্ঞেস করো: DPO-র কোন অংশ বদলেছে? ([Map-এর §৭](../01-learning-map.md))

| পদ্ধতি | DPO-র কোন অংশ বদলায় | কোন সমস্যার জন্য |
|---|---|---|
| **DPO** (ভিত্তি) | — reference-সাপেক্ষ log-ratio-র পার্থক্য, sigmoid log loss | — |
| **IPO** | Loss-এর আকার: sigmoid log loss-এর জায়গায় পার্থক্যটাকে একটা লক্ষ্য মানের কাছে টানা (regression-ধরনের) | Preference খুব নিশ্চিত ধরলে DPO অতিরিক্ত দূরে সরে যেতে পারে (overfitting) |
| **ORPO** | Reference model বাদ; SFT loss আর odds-ভিত্তিক preference অংশ একসঙ্গে এক stage-এ | আলাদা SFT stage ও reference model-এর খরচ কমানো |
| **SimPO** | Reference model বাদ; score হয় দৈর্ঘ্য-স্বাভাবিক করা গড় log probability, সঙ্গে একটা লক্ষ্য ব্যবধান | Length bias আর reference-এর memory খরচ |

কোনো variant-এর সূত্র এখানে ইচ্ছে করেই দেওয়া হয়নি। ব্যবহার করার আগে মূল paper দেখে সূত্র আর hyperparameter মিলিয়ে নিও (যেমন "A General Theoretical Paradigm to Understand Learning from Human Preferences" — IPO; "ORPO: Monolithic Preference Optimization without Reference Model"; "SimPO: Simple Preference Optimization with a Reference-Free Reward")। কোনটা কার কাজে ভালো, তা নির্ভর করে data আর task-এর উপর। সবখানে একটা পদ্ধতি সেরা ধরে নেওয়ার প্রমাণ এখানে নেই।

## মনে রাখার সারকথা

- Length bias আর noisy pair data থেকেই আসে; model সেটাই শেখে যা pair বলে।
- পুরো উত্তরের log probability দৈর্ঘ্যের উপর নির্ভরশীল; তাই দৈর্ঘ্য আলাদা করে দেখা দরকার।
- IPO loss-এর আকার, ORPO ও SimPO reference model বাদ দেওয়ার দিকটা বদলায়; বাকি কাঠামো পরিচিত।

## নিজে করো

১. প্রতি token-এ probability 0.9। ১০ token আর ৪০ token-এর log probability-র যোগফল ও গড় কত?
২. তিনজন annotator, প্রত্যেকে স্বাধীনভাবে ০.৮ সম্ভাবনায় সঠিকটা বাছেন। Majority ঠিক হওয়ার সম্ভাবনা কত?
৩. কোন দুটো variant reference model বাদ দেয়?

<details><summary>উত্তর</summary>

১. ১০ token: `10 × ln 0.9 = −1.054`, গড় `−0.105`। ৪০ token: `−4.214`, গড় `−0.105`। যোগফল ৪ গুণ, গড় একই।
২. `0.8³ + 3 × 0.8² × 0.2 = 0.512 + 0.384 = 0.896`।
৩. ORPO ও SimPO (উপরের table অনুযায়ী)।

</details>

## পরের পাঠ

তত্ত্ব অনেক হলো। এবার ছোট একটা policy-তে DPO সত্যিই চালিয়ে দেখা এবং কী দিয়ে ফল মাপা হয়: [Lecture 08 — ছোট DPO practical ও evaluation](lecture-08-small-dpo-practical-and-evaluation.md)।
