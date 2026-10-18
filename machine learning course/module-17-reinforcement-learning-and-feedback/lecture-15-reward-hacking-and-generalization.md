# Lecture 15 — Reward Hacking ও Generalization

> আগে যা জানা থাকলে ভালো: [Task ভেদে reward-এর নকশা](lecture-13-task-case-studies.md) এবং [RLHF ও reward modeling](lecture-09-rlhf-and-reward-modeling.md)। এই lecture শেষে পারবে: proxy reward আর আসল লক্ষ্যের ফারাক হিসাবে দেখাতে, outcome ও process reward-এর পার্থক্য বলতে, আর training-এ কী কী দেখে ফাঁকি ধরা যায় তা জানতে। ([Map-এ অবস্থান](../01-learning-map.md): এটা objective ঠিক আছে কি না তার যাচাই; update-এর নতুন নিয়ম নয়।)

## সমস্যাটা কী?

RL model-কে শেখায় reward বাড়াতে, তুমি আসলে কী চাও তা বাড়াতে নয়। যে সংখ্যা তুমি মাপছ সেটা আসল লক্ষ্যের একটা **proxy** (প্রতিনিধি)। Proxy আর লক্ষ্য একরকম না হলে model সেই ফাঁক খুঁজে বের করে। একে বলে **reward hacking**। Model "ঠকাচ্ছে" এমন নয়; সে ঠিক সেটাই করছে যার জন্য তাকে পুরস্কার দেওয়া হচ্ছে।

সহজ উদাহরণ: code লেখার reward হলো "দেখা test-গুলো পাস"। Model যদি শেখে test-এর উত্তর সরাসরি মুখস্থ বসিয়ে দিতে, reward সর্বোচ্চ, কিন্তু code আসলে কাজ করে না।

## ধারণাটা সহজ ভাষায়

একটা ছোট হিসাব। তিনটা সম্ভাব্য সমাধান। প্রতিটার দেখা ৫টা test-এর ফল (proxy) আর লুকানো ১০টা test-এর ফল (আসল মান):

| সমাধান | proxy: দেখা test (৫টা) | আসল: লুকানো test (১০টা) |
|---|---|---|
| সৎ সমাধান | 4/5 = 0.8 | 8/10 = 0.8 |
| আংশিক সমাধান | 3/5 = 0.6 | 5/10 = 0.5 |
| test মুখস্থ | 5/5 = 1.0 | 1/10 = 0.1 |

Proxy-র সর্বোচ্চ বাছলে "test মুখস্থ" জেতে (১.০), অথচ আসলে সবচেয়ে ভালো "সৎ সমাধান"। RL training ঠিক এই proxy বাড়ানোর দিকে ঠেলে। তাই proxy আর আসল মানের ফারাক ধরাই এই পাঠের কাজ।

```python
# প্রতিটা candidate: (নাম, দেখা test-এ পাস /৫, লুকানো test-এ পাস /১০)
candidates = [("সৎ সমাধান", 4, 8),
              ("আংশিক সমাধান", 3, 5),
              ("test মুখস্থ", 5, 1)]

for name, vis, hid in candidates:
    print(name, "| proxy (দেখা test):", vis / 5, "| আসল (লুকানো test):", hid / 10)

best_proxy = max(candidates, key=lambda c: c[1] / 5)
best_true = max(candidates, key=lambda c: c[2] / 10)
print("proxy যাকে বাছে:", best_proxy[0])
print("আসলে যে ভালো:", best_true[0])
# output:
# সৎ সমাধান | proxy (দেখা test): 0.8 | আসল (লুকানো test): 0.8
# আংশিক সমাধান | proxy (দেখা test): 0.6 | আসল (লুকানো test): 0.5
# test মুখস্থ | proxy (দেখা test): 1.0 | আসল (লুকানো test): 0.1
# proxy যাকে বাছে: test মুখস্থ
# আসলে যে ভালো: সৎ সমাধান
```

আরও কিছু চেনা ধরন: reward model লম্বা উত্তরকে বেশি নম্বর দিলে model অকারণে লম্বা লেখে; [Lecture 14](lecture-14-domain-expert-answer-evaluation.md)-এর মতো rubric-এ "উৎস আছে" দেখলেই নম্বর দিলে model উৎসের মতো দেখতে বানানো লেখা বসায়; verifier শুধু চূড়ান্ত উত্তর দেখলে model ভুল যুক্তিতেও ঠিক উত্তরে পৌঁছাতে শেখে।

## ফাঁকি কমানোর উপায়

1. **Proxy-র বাইরে লুকানো পরীক্ষা:** training-এ যে test দেখা যায় তার বাইরে আলাদা test রাখো, আর সেটা reward-এ কখনো ঢুকতে দিও না। Training reward ও লুকানো মান দুটোই নজরে রাখো।
2. **Reference থেকে দূরে সরার জরিমানা:** [Lecture 09](lecture-09-rlhf-and-reward-modeling.md)-এর `β`। ছোট উদাহরণ: `β = 0.5`। উত্তর ১-এর reward ২.০, reference থেকে log-ratio ৩.০; মোট `2.0 − 0.5 × 3.0 = 0.5`। উত্তর ২-এর reward ১.৫, log-ratio ১.০; মোট `1.5 − 0.5 × 1.0 = 1.0`। জরিমানা থাকায় reference-এর কাছের উত্তর এগিয়ে গেল। `β` খুব বড় হলে অবশ্য model প্রায় কিছুই শেখে না।
3. **একাধিক reward একসঙ্গে:** শুধু একটা সংখ্যা না রেখে কয়েকটা সংকেত (সঠিকতা, দৈর্ঘ্যের সীমা, format) মেলানো।
4. **নমুনা মানুষকে দেখানো:** সর্বোচ্চ reward পাওয়া উত্তরগুলো মাঝেমধ্যে চোখে দেখা। ফাঁকি সংখ্যায় ধরা না পড়লেও উত্তরে ধরা পড়ে।

## Outcome reward বনাম process reward

**Outcome reward** শুধু শেষ ফল দেখে (উত্তর মিলল কি না)। **Process reward** প্রতিটা ধাপের নম্বর দেয়। উদাহরণ: ৪ ধাপের যুক্তিতে ধাপ ৩ ভুল, কিন্তু ভাগ্যক্রমে চূড়ান্ত উত্তর মিলে গেছে। Outcome reward `1`। ধাপগুলো `[1, 1, 0, 1]` হলে process reward গড়ে `3/4 = 0.75`, আর "সবচেয়ে দুর্বল ধাপ" ধরলে `0`। অর্থাৎ process reward ভুল যুক্তি ধরে ফেলে।

কিন্তু process reward-এর খরচ আছে: প্রতি ধাপের label মানুষ বা model-কে দিতে হয়, আর সেই step-judge-ও ভুল বা ফাঁকিযোগ্য হতে পারে। তাই বেছে নেওয়া হয় কাজের ধরন দেখে: চূড়ান্ত উত্তর নির্ভরযোগ্য ও সস্তায় যাচাই করা গেলে outcome দিয়ে শুরু; যুক্তির ধাপ গুরুত্বপূর্ণ আর ভাগ্য-ঠিক উত্তর বেশি দেখা গেলে process যোগ।

```python
steps = [1, 1, 0, 1]                 # প্রতিটা ধাপ ঠিক (1) নাকি ভুল (0)
final_answer_correct = 1             # চূড়ান্ত উত্তর মিলে গেছে

outcome_reward = final_answer_correct
process_reward = sum(steps) / len(steps)
print("outcome =", outcome_reward, "| process (গড়) =", process_reward, "| process (সবচেয়ে দুর্বল ধাপ) =", min(steps))

beta = 0.5
for name, r, log_ratio in [("reference থেকে অনেক দূরে", 2.0, 3.0), ("reference-এর কাছে", 1.5, 1.0)]:
    print(name, "| মোট reward =", r - beta * log_ratio)
# output:
# outcome = 1 | process (গড়) = 0.75 | process (সবচেয়ে দুর্বল ধাপ) = 0
# reference থেকে অনেক দূরে | মোট reward = 0.5
# reference-এর কাছে | মোট reward = 1.0
```

## Generalization: নতুন প্রশ্নে কাজ করে কি?

Training prompt-এ reward বাড়লেই model সত্যি ভালো হয়নি। দেখতে হয় **নতুন, আগে না-দেখা prompt**-এ আসল মান বাড়ছে কি না। কাল্পনিক একটা training-এর হিসাব (training reward = proxy; held-out আসল মান আলাদা prompt-এ মাপা):

| Step | Training reward (proxy) | Held-out আসল মান |
|---|---|---|
| 0 | 0.50 | 0.50 |
| 100 | 0.70 | 0.62 |
| 200 | 0.85 | 0.66 |
| 300 | 0.95 | 0.58 |

Proxy বাড়ছেই, কিন্তু আসল মান step 200-এ সর্বোচ্চ, তারপর কমছে। এটা ফাঁকি শেখার সাধারণ লক্ষণ। সমাধান: held-out মান যে checkpoint-এ সবচেয়ে ভালো সেটা রাখো, আর সময়মতো থামো।

```python
# কাল্পনিক training: (step, training reward = proxy, held-out আসল মান)
log = [(0, 0.50, 0.50), (100, 0.70, 0.62), (200, 0.85, 0.66), (300, 0.95, 0.58)]

best = max(log, key=lambda row: row[2])
print("held-out মান সবচেয়ে ভালো step =", best[0], "| মান =", best[2])
print("শেষ step-এ proxy =", log[-1][1], "কিন্তু আসল মান =", log[-1][2])
# output:
# held-out মান সবচেয়ে ভালো step = 200 | মান = 0.66
# শেষ step-এ proxy = 0.95 কিন্তু আসল মান = 0.58
```

## মনে রাখার সারকথা

- Reward একটা proxy; model proxy বাড়ায়, লক্ষ্য নয়। ফাঁক থাকলে সেটাই কাজে লাগায়।
- ফাঁকি ধরার উপায়: লুকানো পরীক্ষা, reference-জরিমানা (`β`), একাধিক সংকেত, মানুষের নমুনা দেখা।
- Outcome reward সস্তা কিন্তু ভুল যুক্তি ধরে না; process reward ধরে, কিন্তু খরচ ও নিজের ফাঁকির ঝুঁকি আছে। Training reward নয়, held-out মান দেখে checkpoint বাছো।

## নিজে করো

১. উপরের তিন সমাধানে যদি লুকানো test-ও reward-এ ঢোকানো হতো (দেখা + লুকানো মিলিয়ে ১৫টার কত পাস), "test মুখস্থ"-এর reward কত হতো? আর "সৎ সমাধান"-এর?
২. ধাপ `[1, 0, 1, 1, 1]`, চূড়ান্ত উত্তর মিলেছে। outcome ও process (গড়) reward কত?
৩. `β = 0.2`, `r = 3.0`, log-ratio `4.0`। মোট reward কত?

<details><summary>উত্তর</summary>

১. মুখস্থ: `(5 + 1)/15 = 0.4`; সৎ: `(4 + 8)/15 = 0.8`। লুকানো test reward-এ ঢুকলে সৎ সমাধানই ভালো দেখায়। তবে তখন আর সেই test "লুকানো" থাকে না, অর্থাৎ নতুন লুকানো test দরকার।
২. outcome `1`; process `4/5 = 0.8`।
৩. `3.0 − 0.2 × 4.0 = 2.2`।

</details>

## পরের পাঠ

শেষ পাঠে সব মিলিয়ে সিদ্ধান্ত: কোন সমস্যায় SFT, DPO বা RL, কত compute, আর কীভাবে মাপা হবে: [Lecture 16 — Practical ও Method Selection](lecture-16-practical-and-method-selection.md)।
