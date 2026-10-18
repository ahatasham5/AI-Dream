# Lecture 02 — পুরো উত্তরের probability ও log-ratio

> আগে যা জানা থাকলে ভালো: [Next-token prediction ও cross-entropy](../module-12-text-sequences-and-multimodal-models/lecture-04-next-token-and-cross-entropy.md) এবং [log loss](../module-03-logistic-regression/lecture-03-log-loss.md) (`−ln(p)`)। এই lecture শেষে পারবে: তিন-token উত্তরের probability গুণ করে ও log যোগ করে বের করতে, আর দুটো model-এর log-ratio হিসাব করতে। ([Map-এ অবস্থান](../01-learning-map.md): output-এর হিসাব থেকে পাওয়া সংখ্যা। এখানে training বা update নেই)

## সমস্যাটা কী?

DPO দুটো **পুরো উত্তর** তুলনা করে: chosen আর rejected। কিন্তু language model প্রতিবার একটা token-এর probability দেয়। তাই আগে একটা পুরো উত্তরের জন্য একটাই সংখ্যা বানানো দরকার। আরেকটা সমস্যা আছে: probability গুণ করতে থাকলে সংখ্যা এত ছোট হয় যে কম্পিউটার তাকে শূন্য ধরে ফেলে। এই দুটোর সমাধান এই lecture-এ।

## ধারণাটা সহজ ভাষায়

**১. পুরো উত্তরের probability = প্রতিটা token-এর probability-র গুণফল।** Model প্রতিটা token বাছার সময় prompt আর আগের token-গুলো দেখে। তাই "রাজধানী ঢাকা।" বলার probability হলো: প্রথমে "রাজধানী" বলার probability, গুণ "রাজধানী"-র পরে "ঢাকা" বলার probability, গুণ তার পরে "।" বলার probability।

এই পুরো probability-কে লেখা হয় `π(y | x)`। পড়তে হয়: "prompt `x` দেওয়া থাকলে model-এর `y` উত্তর দেওয়ার probability"। `π` (পাই) এখানে model-এর probability-র হিসাব।

**২. গুণ আসলে log-এ যোগ।** `ln` (স্বাভাবিক logarithm) গুণকে যোগে বদলায়: `ln(a × b) = ln(a) + ln(b)`। তাই পুরো উত্তরের **log probability** হলো প্রতিটা token-এর `ln p`-র যোগফল। এটাই Module 12-এর cross-entropy-র যোগফল, শুধু চিহ্ন উল্টো: `log π(y | x) = −(প্রতিটা token-এর cross-entropy-র যোগ)`।

**৩. Log probability সবসময় শূন্য বা ঋণাত্মক**, কারণ probability ১-এর বেশি হয় না। শূন্যের যত কাছে, উত্তরটা তত বেশি সম্ভাব্য। `−1.0` মানে `−2.3`-এর চেয়ে বেশি সম্ভাব্য।

## ছোট একটা উদাহরণ

উত্তর "রাজধানী ঢাকা।" তিন token। ধরো model প্রতিটার জন্য এই probability দিয়েছে:

| token | probability `p` | `ln p` |
|---|---:|---:|
| রাজধানী | 0.5 | −0.693 |
| ঢাকা | 0.8 | −0.223 |
| । | 0.9 | −0.105 |

- গুণ: `0.5 × 0.8 × 0.9 = 0.36`।
- log-এ যোগ: `−0.693 − 0.223 − 0.105 = −1.021`। সঠিক মান `−1.022`; তিন ঘরে গোল করার ফারাক।
- মিলিয়ে দেখো: `exp(−1.022) = 0.36`। দুটো পথে একই উত্তর।

### দুই model-এর তুলনা: log-ratio

এখন একই উত্তর আর একই prompt দুটো model-কে দেখাই: একটা **policy** `π_θ` (যেটা শেখানো হচ্ছে) আর একটা **reference** `π_ref` (যেটা তুলনার ভিত্তি)। এদের পরিচয় [পরের lecture](lecture-03-reference-model-and-policy.md)-এ; এখানে শুধু দুটো আলাদা model ধরে নাও।

| token | policy `p` | reference `p` | `ln(policy ÷ reference)` |
|---|---:|---:|---:|
| রাজধানী | 0.5 | 0.4 | 0.223 |
| ঢাকা | 0.8 | 0.75 | 0.065 |
| । | 0.9 | 0.9 | 0.000 |
| **মোট** | 0.36 | 0.27 | **0.288** |

শেষ ঘরের নাম **log-ratio**: `ln(π_θ(y|x) ÷ π_ref(y|x)) = log π_θ(y|x) − log π_ref(y|x)`। মানে পড়া যায় এভাবে:

- ধনাত্মক হলে policy এখন এই উত্তরকে reference-এর চেয়ে **বেশি** সম্ভাব্য মনে করে।
- ঋণাত্মক হলে **কম**।
- শূন্য হলে দুজনে একমত।

ছোট কথা: পুরো উত্তরের log-ratio = প্রতি token-এর log-ratio-র যোগফল। উপরের table-এ `0.223 + 0.065 + 0 = 0.288`, আর সরাসরি `−1.022 − (−1.309) = 0.287`। (তিন ঘরে গোলের ফারাক।)

## কোড

```python
import math

p = [0.5, 0.8, 0.9]                       # token-প্রতি probability
prod = 1.0
for x in p:
    prod *= x
log_sum = sum(math.log(x) for x in p)
print("গুণ        :", round(prod, 3))
print("log যোগ    :", round(log_sum, 3))
print("exp(log যোগ):", round(math.exp(log_sum), 3))

# অনেক লম্বা উত্তর: গুণ 0 হয়ে যায়, log যোগ ঠিক থাকে
long_p = [0.5] * 1100
prod_long = 1.0
for x in long_p:
    prod_long *= x
print("1100 token, গুণ :", prod_long)
print("1100 token, log :", round(sum(math.log(x) for x in long_p), 1))

# policy বনাম reference
policy, ref = [0.5, 0.8, 0.9], [0.4, 0.75, 0.9]
lp = sum(math.log(x) for x in policy)
lr = sum(math.log(x) for x in ref)
print("log-ratio:", round(lp - lr, 3))
# output:
# গুণ        : 0.36
# log যোগ    : -1.022
# exp(log যোগ): 0.36
# 1100 token, গুণ : 0.0
# 1100 token, log : -762.5
# log-ratio: 0.288
```

১১০০ token-এ গুণফল কম্পিউটারে `0.0` হয়ে গেল (underflow), কিন্তু log যোগে `−762.5` পরিষ্কার থাকল। তাই বাস্তবে সবসময় log probability নিয়েই কাজ হয়।

## মনে রাখার সারকথা

- পুরো উত্তরের probability = token probability-র গুণ; log নিলে সেটা `ln p`-র যোগ।
- Log probability শূন্য বা ঋণাত্মক; শূন্যের কাছে মানে বেশি সম্ভাব্য। লম্বা উত্তরে যোগফল সাধারণত বেশি ঋণাত্মক হয়।
- Log-ratio = `log π_θ − log π_ref`; ধনাত্মক মানে policy ওই উত্তরকে reference-এর চেয়ে বেশি পছন্দ করে।

## নিজে করো

১. চারটা token-এর প্রতিটার probability 0.5। পুরো উত্তরের probability আর log probability কত?
২. `log π_θ(y|x) = −2.0`, `log π_ref(y|x) = −2.5`। log-ratio কত? policy কতগুণ বেশি সম্ভাব্য মনে করছে?
৩. policy `[0.6, 0.5, 0.5]`, reference `[0.3, 0.5, 0.5]`। log-ratio কত? কোন token বদলেছে?

<details><summary>উত্তর</summary>

১. `0.5⁴ = 0.0625`; log probability `4 × ln 0.5 = −2.773`।
২. `−2.0 − (−2.5) = 0.5`; `exp(0.5) = 1.649`, অর্থাৎ প্রায় ১.৬৫ গুণ।
৩. শুধু প্রথম token-এ `ln(0.6 ÷ 0.3) = ln 2 = 0.693`; বাকি দুটোর log-ratio ০। মোট `0.693`; প্রথম token বদলেছে।

</details>

## পরের পাঠ

Policy আর reference কারা, কে শেখে আর কে স্থির থাকে: [Lecture 03 — Reference model ও policy](lecture-03-reference-model-and-policy.md)।
