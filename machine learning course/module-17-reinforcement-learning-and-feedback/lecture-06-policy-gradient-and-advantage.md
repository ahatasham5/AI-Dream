# Lecture 06 — Policy Gradient ও Advantage

> আগে যা জানা থাকলে ভালো: [Lecture 04](lecture-04-policy-value-and-q-learning.md)-এর policy, [Sigmoid](../module-03-logistic-regression/lecture-01-sigmoid.md) এবং gradient-এর ধারণা ([Module 10](../module-10-neural-network-training/lecture-02-derivative-to-gradient.md))। এই lecture শেষে পারবে: দুই action-এর একটা policy-তে expected reward ও তার gradient হাতে বের করতে, আর বলতে কেন reward থেকে "গড়" বাদ দিলে (advantage) শেখা স্থির হয়। ([Map-এ অবস্থান](../01-learning-map.md): objective = expected reward বাড়ানো; update = সেই objective-এর gradient দিয়ে policy-র parameter বদলানো।)

## সমস্যাটা কী?

এতক্ষণ Q-value শিখে তার থেকে policy বের করেছি। কিন্তু LLM-এ action মানে পুরো শব্দভান্ডারের যেকোনো token, আর প্রতিটা সম্ভাব্য উত্তরের জন্য আলাদা Q রাখা অসম্ভব। অথচ আমরা আসলে চাই সোজা কথা: যে উত্তরে বেশি reward এসেছে, model যেন সেই উত্তর দেওয়ার সম্ভাবনা বাড়ায়। এটা করার সরাসরি উপায় হলো policy-র সম্ভাবনাকেই শেখার parameter থেকে বের করা, আর reward বাড়ার দিকে সেই parameter সরানো।

## ধারণাটা সহজ ভাষায়

সবচেয়ে ছোট ঘটনা: একটা চালেই খেলা শেষ, দুটো action X আর Y। Reward ধরা যাক X-এ 1.0, Y-তে 0.2। Policy-র একটাই শেখার সংখ্যা **θ** (থিটা)। X নেওয়ার সম্ভাবনা `p = sigmoid(θ)`, Y-র সম্ভাবনা `1 − p`।

Agent প্রতিবার একটা action বাছে, তাই reward এলোমেলো। আমরা মাপতে চাই গড়ে কত reward আসে। এটার নাম **expected reward** (আশানুরূপ গড়): প্রতিটা reward-কে তার সম্ভাবনা দিয়ে গুণ করে যোগ।

`J = p × 1.0 + (1 − p) × 0.2`

(J এখানে expected reward-এর নাম।) θ = 0 হলে p = 0.5, তাই J = 0.5 × 1.0 + 0.5 × 0.2 = **0.6**। θ = 1 হলে p = 0.731, J = 0.731 + 0.269 × 0.2 = 0.785। θ বাড়লে J বাড়ে, তাই আমরা θ-কে J-এর gradient-এর দিকে সরাব (gradient ascent)।

### হাতে gradient

θ = 0-তে J-এর gradient: `(rX − rY) × p × (1 − p) = 0.8 × 0.5 × 0.5 = 0.2`। যাচাই: θ = 0.1 করলে J = 0.62, ঠিক `0.6 + 0.2 × 0.1`। কিন্তু এই সূত্র আমরা তখনই লিখতে পারি যখন reward আগে থেকে জানা। বাস্তবে reward জানা থাকে না, শুধু action বেছে চেষ্টা করলে পাওয়া যায়।

### Sample থেকে gradient

একটা কৌশল আছে। প্রতিটা action-এর **grad log p** (সম্ভাবনার log-এর gradient) নিই। Sigmoid-এর বেলায় এটা সহজ: X-এর জন্য `1 − p`, Y-র জন্য `−p`। θ = 0-তে p = 0.5, তাই X-এর `0.5`, Y-র `−0.5`। এখন প্রতিটা action-এর `reward × grad log p` সম্ভাবনা দিয়ে ভারিত গড় করি:

```text
0.5 × (1.0 × 0.5) + 0.5 × (0.2 × (−0.5)) = 0.25 − 0.05 = 0.2
```

এটা হুবহু উপরের gradient (0.2)। এটা কাকতালীয় নয়। J-এর gradient হলো `Σ (reward × p-এর gradient)`, আর `p-এর gradient = p × grad log p`। তাই `Σ p × reward × grad log p`, অর্থাৎ **`reward × grad log p`-এর expectation**। সুবিধা: এর জন্য reward-এর সূত্র লাগে না। একটা action বেছে (sample) তার `reward × grad log p` মেপে নিলেই চলে। অনেক sample-এর গড় আসল gradient-এর কাছে যায়। এই পদ্ধতির নাম **policy gradient** (ইতিহাসে REINFORCE)।

একটা sample-এ X এলে `1.0 × 0.5 = 0.5`, Y এলে `0.2 × (−0.5) = −0.1`। গড় (0.5 + (−0.1)) / 2 = 0.2। কিন্তু একেকটা sample আলাদা, এখানেই সমস্যা শুরু।

### সমস্যা: reward সব ধনাত্মক হলে

Reward-গুলো সবই ধনাত্মক হলে, যেকোনো action-ই বাড়ার দিকে ধাক্কা পায়, সামান্য হলেও। যদি সব reward-এ 10 যোগ করি (X = 11, Y = 10.2), আসল gradient একই থাকে, কিন্তু একেক sample-এর অনুমান হয়ে যায়: X-এ `11 × 0.5 = 5.5`, Y-তে `10.2 × (−0.5) = −5.1`। গড় এখনো 0.2, কিন্তু প্রতিটা sample বিশাল আর উল্টো দিকে ঝাঁকুনি দেয়। শেখা অস্থির হয়।

সমাধান: reward থেকে একটা **baseline** (সাধারণ গড় reward) বাদ দাও। যা বাকি থাকে তার নাম **advantage**:

`Adv = reward − baseline`

Advantage বলে "এই action গড়ের চেয়ে কতটা ভালো (বা খারাপ)"। এই উদাহরণে baseline = গড় reward = 0.6 (বা 10.6, 10 যোগ করলে)। তখন:

| | reward | Adv | `Adv × grad log p` |
|---|---|---|---|
| X | 1.0 (বা 11) | +0.4 | 0.4 × 0.5 = 0.2 |
| Y | 0.2 (বা 10.2) | −0.4 | (−0.4) × (−0.5) = 0.2 |

দুই action-এই অনুমান ঠিক 0.2। 10 যোগ করলেও Adv একই। অনুমানের গড় বদলায়নি (0.2), কিন্তু ঝাঁকুনি (variance) 28.09 থেকে 0 হয়ে গেছে। Baseline বাদ দিলে expectation বদলায় না, কারণ baseline action-এর ওপর নির্ভর করে না। শুধু ঝাঁকুনি কমে।

## ছোট একটা উদাহরণ: এক ধাপ update

θ = 0, learning rate η = 0.5, Adv ব্যবহার করে। ধরো sample-এ X এল: `Adv = 0.4`, `grad log p = 0.5`।

```text
θ_new = θ + η × Adv × grad log p = 0 + 0.5 × 0.4 × 0.5 = 0.1
p(X)  = sigmoid(0.1) = 0.525
```

Y এলেও `0.5 × (−0.4) × (−0.5) = 0.1`, একই। X-এর সম্ভাবনা 0.5 থেকে 0.525 হলো। Advantage ধনাত্মক মানে সেই action-এর সম্ভাবনা বাড়ে, ঋণাত্মক মানে কমে।

## Formula ও কোড

এক sample-এর update: `θ_new = θ + η × Adv × grad log p(action)`। এখানে η হলো learning rate, আর বাকি সবকিছু উপরের হিসাবে এসেছে। এটা update-এর নিয়ম; objective হলো expected reward J।

নিচের code প্রতিবার একটা action sample করে, baseline হিসেবে এখন পর্যন্ত reward-এর চলমান গড় নেয় (শুরুতে 0, তাই প্রথম কয়েক step এলোমেলো):

```python
import math, random

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

rX, rY = 1.0, 0.2
theta, lr, baseline = 0.0, 0.5, 0.0

random.seed(0)
for t in range(1, 201):
    p = sigmoid(theta)                # X নেওয়ার সম্ভাবনা
    if random.random() < p:
        r, grad_logp = rX, 1 - p      # X: grad log p = 1 - p
    else:
        r, grad_logp = rY, -p         # Y: grad log p = -p
    adv = r - baseline
    theta += lr * adv * grad_logp
    baseline += 0.1 * (r - baseline)
    if t in (10, 50, 100, 200):
        print(t, round(theta, 3), round(sigmoid(theta), 3))
# output:
# 10 0.977 0.726
# 50 3.215 0.961
# 100 4.004 0.982
# 200 4.406 0.988
```

X-এর সম্ভাবনা 0.5 থেকে বেড়ে প্রায় 0.99 হয়েছে। কখনোই ঠিক 1 হয় না।

## LLM-এর সঙ্গে যোগ

SFT-এ আমরা সঠিক উত্তরের log-probability বাড়াই ([Module 12-এর cross-entropy](../module-12-text-sequences-and-multimodal-models/lecture-04-next-token-and-cross-entropy.md)), প্রতিটা উত্তরকে সমান জোরে। Policy gradient-ও log-probability বাড়ায়, কিন্তু প্রতিটা উত্তরের জোর তার advantage। ভালো উত্তর বাড়ে, গড়ের নিচের উত্তর কমে। তাই মোটামুটি বলা যায়: policy gradient হলো reward দিয়ে ভার দেওয়া SFT।

## মনে রাখার সারকথা

- Expected reward = প্রতিটা reward × তার সম্ভাবনার যোগফল; policy gradient এটাকেই বাড়ায়।
- Gradient = `reward × grad log p`-এর expectation, তাই sample করা action আর পাওয়া reward থেকেই অনুমান করা যায়।
- Reward থেকে baseline বাদ দিলে (advantage) অনুমানের গড় একই থাকে, কিন্তু ঝাঁকুনি কমে; Adv ধনাত্মক হলে action-এর সম্ভাবনা বাড়ে।

## নিজে করো

১. θ = 0, rX = 1.0, rY = 0.2। Expected reward J কত?
২. p = 0.8 (rX = 1.0, rY = 0.2)। J ও J-এর gradient `(rX − rY) × p × (1 − p)` কত?
৩. rX = 3, rY = 1, p = 0.5। Baseline = গড় reward ধরলে Adv কত? X ও Y-এর `Adv × grad log p` কত, আর আসল gradient কত?

<details><summary>উত্তর</summary>

১. J = 0.5 × 1.0 + 0.5 × 0.2 = 0.6।
২. J = 0.8 × 1.0 + 0.2 × 0.2 = 0.84। Gradient = 0.8 × 0.8 × 0.2 = 0.128।
৩. Baseline = 0.5 × 3 + 0.5 × 1 = 2। Adv: X = +1, Y = −1। `grad log p`: X = 0.5, Y = −0.5। অনুমান: X-এ 1 × 0.5 = 0.5, Y-তে (−1) × (−0.5) = 0.5। আসল gradient = (3 − 1) × 0.5 × 0.5 = 0.5। দুই অনুমানই আসল gradient-এর সমান।

</details>

## পরের পাঠ

Baseline এখানে ছিল সহজ গড়। অনেক ধাপের খেলায় baseline প্রতিটা state-এ আলাদা হওয়া উচিত, আর policy এক বড় লাফে নষ্ট হয়ে যেতে পারে। দুটোই সামলায় [Lecture 07 — Actor-critic ও PPO](lecture-07-actor-critic-and-ppo.md)।
