# Lecture 05 — DPO gradient ও training loop

> আগে যা জানা থাকলে ভালো: [DPO loss-এর ছয় ধাপ](lecture-04-dpo-objective-by-hand.md) আর [gradient descent-এর ধারণা](../module-02-linear-regression/lecture-03-gradient-descent-training.md)। এই lecture শেষে পারবে: gradient কোন দিকে ঠেলে তা বলতে, এক step-এর হিসাব করতে, আর DPO training loop-এর ধাপগুলো (batch, masking, full/LoRA, offline data) গুছিয়ে বলতে। ([Map-এ অবস্থান](../01-learning-map.md): এবার **update**। আগের lecture-এর loss হলো ভুল মাপা; এখানে সেই ভুল কমাতে parameter বদলানো)

## সমস্যাটা কী?

Loss পাওয়া গেছে ০.৪০৬। কিন্তু Policy-র parameter `θ` কীভাবে বদলালে এই সংখ্যা কমবে? উত্তর দেয় **gradient**: loss-কে parameter-এর সাপেক্ষে ঢাল (আগের lecture-গুলোর মতো)। আর শুধু একটা pair নিয়ে তো training হয় না; হাজার হাজার pair কীভাবে loop-এ ঢোকে, সেটাও দেখা দরকার।

## ধারণাটা সহজ ভাষায়: gradient কী বলে

Loss `L = −ln σ(z)`, `z = β × m`, আর `m` হলো chosen-এর log-ratio থেকে rejected-এর log-ratio বাদ। Policy শুধু `log π_θ(y_w|x)` আর `log π_θ(y_l|x)`-এর মধ্য দিয়ে loss-কে প্রভাবিত করে (reference স্থির)। ধাপে ধাপে:

1. `L = −ln σ(z)`-এর `z`-এর সাপেক্ষে ঢাল: `−(1 − σ(z)) = −σ(−z)` ([log loss-এর `p − y`](../module-03-logistic-regression/lecture-04-logistic-training-gradient.md), যেখানে `y = 1`)।
2. `z = β × (log π_θ(y_w|x) − log π_θ(y_l|x) + একটা স্থির সংখ্যা)`; স্থির সংখ্যাটা reference-এর অংশ থেকে আসে। তাই chosen-এর log probability ১ একক বাড়লে `z` বাড়ে `β`; rejected-এরটা ১ একক বাড়লে `z` কমে `β`।
3. দুটো গুণ করলে:

```
∂L / ∂ log π_θ(y_w|x) = − β × σ(−z)     (ঋণাত্মক)
∂L / ∂ log π_θ(y_l|x) = + β × σ(−z)     (ধনাত্মক)
```

Gradient descent-এ নতুন মান = পুরনো মান − learning rate × gradient। তাই:

- Chosen-এর gradient ঋণাত্মক, বিয়োগ করলে **chosen-এর log probability বাড়ে**।
- Rejected-এর gradient ধনাত্মক, বিয়োগ করলে **rejected-এর log probability কমে**।

পুরো parameter `θ`-র জন্য সূত্রটা chain rule দিয়ে এভাবে লেখা হয়:

```
∇_θ L = − β × σ(−z) × [ ∇_θ log π_θ(y_w|x) − ∇_θ log π_θ(y_l|x) ]
```

বন্ধনীর ভেতরের অংশ বলে "chosen-কে বাড়াও, rejected-কে কমাও", আর বাইরের `β × σ(−z)` বলে "কত জোরে"। `σ(−z)` মানে "model এই pair-এ কতটা **ভুল**": `m` ঋণাত্মক হলে (policy উল্টো দিকে) `σ(−z)` বড়, `m` অনেক বড় ধনাত্মক হলে প্রায় শূন্য। অর্থাৎ যে pair-এ model আগে থেকেই ঠিক, সেখানে ধাক্কা ছোট; যে pair-এ ভুল, সেখানে বড়।

## ছোট একটা উদাহরণ

আগের lecture-এর সংখ্যা: `m = 0.693`, `β = 1`, `z = 0.693`।

- `σ(−z) = σ(−0.693) = 0.333`।
- `∂L/∂ log π_θ(y_w) = −1 × 0.333 = −0.333`।
- `∂L/∂ log π_θ(y_l) = +0.333`।

শিক্ষামূলক সরলীকরণ: ধরো log probability দুটোই সরাসরি বদলানো যায়, learning rate `0.5`। (বাস্তবে এরা parameter নয়; gradient chain rule দিয়ে `θ`-তে যায়। দিকটা একই।)

| | আগে | নতুন = আগে − 0.5 × gradient |
|---|---:|---:|
| chosen | −1.022 | −1.022 + 0.167 = **−0.855** |
| rejected | −2.303 | −2.303 − 0.167 = **−2.470** |

নতুন `m = (−0.855 + 1.309) − (−2.470 + 1.897) = 0.454 + 0.573 = 1.027`, আর loss `0.406` থেকে `0.306`-এ নামল।

**`m` অনুযায়ী ঠেলার জোর (`β = 1`):**

| `m` | −2 | 0 | 0.693 | 2 | 5 |
|---|---:|---:|---:|---:|---:|
| `σ(−m)` | 0.881 | 0.5 | 0.333 | 0.119 | 0.007 |

## Training loop

ধারণা-বোঝানোর pseudo-code (**চালানো হয়নি**, কোনো library-র আসল API নয়):

```text
reference = স্থির copy (SFT model)          # parameter বদলায় না
policy    = reference-এর copy               # parameter বদলায়
for batch in preference_pairs:              # প্রতিটা: (prompt, chosen, rejected)
    lp_w  = policy-র log probability (chosen,  শুধু response token)
    lp_l  = policy-র log probability (rejected, শুধু response token)
    ref_w, ref_l = reference-এর log probability   # gradient ছাড়া
    m    = (lp_w - ref_w) - (lp_l - ref_l)
    loss = batch জুড়ে গড়( -ln sigmoid(beta * m) )
    loss থেকে gradient -> optimizer দিয়ে policy-র parameter update
```

এখানে কয়েকটা জিনিস জানা জরুরি:

- **Offline data:** pair-গুলো আগে থেকে তৈরি, training-এর মধ্যে policy নতুন উত্তর বানায় না। এখানে RL-এর মতো "উত্তর বানাও → reward নাও → update" rollout loop **নেই**। Data স্থির, তাই এটা supervised training-এর মতো সরল। (Rollout-ভিত্তিক RL পাবে [Module 17](../module-17-reinforcement-learning-and-feedback/lecture-08-policy-and-rollout-in-llm.md)-এ।)
- **Batch:** কয়েকটা pair একসঙ্গে নিয়ে loss-এর গড় বের করা হয়, গড়ের gradient দিয়ে এক update। ([batch ও epoch](../module-10-neural-network-training/lecture-06-batch-step-and-epoch.md))
- **Masking:** পুরো উত্তরের log probability-তে শুধু **response-এর token** যোগ হয়। Prompt-এর token আর padding (ছোট উত্তর সমান লম্বা করতে বসানো ফাঁকা token) বাদ যায়; নইলে সংখ্যা ভুল হবে।
- **Full ও LoRA:** policy-র সব parameter বদলানো যায় (full), অথবা অল্প কিছু (LoRA — [Module 13](../module-13-pretraining-finetuning-and-lora/lecture-03-lora-forward-pass-and-activation.md))। কোন parameter বদলাবে আর কোন objective থেকে শিখবে, এ দুটো আলাদা সিদ্ধান্ত।
- **Reference-এর খরচ:** reference-এর log probability policy-র মতোই model চালিয়ে বের করতে হয়। তাই (ক) দুটো model memory-তে রাখা যায়, (খ) যেহেতু reference স্থির, তার log probability আগেই হিসাব করে data-র সঙ্গে রাখা যায়, (গ) LoRA ব্যবহার করলে adapter বন্ধ করে চালালে বেস model-টাই reference-এর কাজ করতে পারে। কোনটা সম্ভব তা tool ও setup-এর উপর নির্ভর করে।

### Masking-এর ছোট উদাহরণ

```python
logprobs = [-0.9, -1.5, -0.7, -0.2, -0.1, -0.4]   # প্রতিটা token-এর log p (কাল্পনিক)
mask     = [0, 0, 1, 1, 1, 0]                       # 1 = response-এর token

total_all    = sum(logprobs)
total_masked = sum(lp for lp, k in zip(logprobs, mask) if k)
print("সব token যোগ     :", round(total_all, 3))
print("শুধু response যোগ:", round(total_masked, 3))
# output:
# সব token যোগ     : -3.8
# শুধু response যোগ: -1.0
```

### Gradient যাচাই

সূত্র ঠিক কি না, log probability-কে খুব সামান্য নড়িয়ে (finite difference) loss-এর পরিবর্তন মেপে মেলানো যায়:

```python
import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

def loss(lp_w, lp_l, ref_w=-1.309, ref_l=-1.897, beta=1.0):
    m = (lp_w - ref_w) - (lp_l - ref_l)
    return -math.log(sigmoid(beta * m))

eps = 1e-6
g_w = (loss(-1.022 + eps, -2.303) - loss(-1.022 - eps, -2.303)) / (2 * eps)
g_l = (loss(-1.022, -2.303 + eps) - loss(-1.022, -2.303 - eps)) / (2 * eps)
print(round(g_w, 3), round(g_l, 3))
# output:
# -0.333 0.333
```

সূত্রের `−0.333` ও `+0.333`-এর সঙ্গে মিলেছে।

## মনে রাখার সারকথা

- Gradient বলে: chosen-এর log probability বাড়াও, rejected-এর কমাও; জোর `β × σ(−z)`।
- যে pair-এ model আগে থেকেই ঠিক, সেখানে ঠেলা ছোট; যেখানে ভুল, সেখানে বড়।
- Loop-এ data offline ও স্থির (rollout নেই); response token mask করে log probability নেওয়া হয়; full বা LoRA, দুটোতেই চলে।

## নিজে করো

১. `m = 2`, `β = 1`। `σ(−m)` আর দুটো gradient কত?
২. `m = 1`, `β = 0.5`। `∂L/∂ log π_θ(y_w)` কত?
৩. দুটো pair: প্রথমটায় `m = −1`, দ্বিতীয়টায় `m = 3` (`β = 1`)। কোনটায় বেশি ধাক্কা লাগবে?
৪. Token log probability `[-1.2, -0.8, -0.5, -0.3, -0.2]`, mask `[0, 0, 1, 1, 0]`। উত্তরের log probability কত?

<details><summary>উত্তর</summary>

১. `σ(−2) = 0.119`; `∂L/∂ log π_θ(y_w) = −0.119`, `∂L/∂ log π_θ(y_l) = +0.119`।
২. `z = 0.5`, `σ(−0.5) = 0.378`, gradient `= −0.5 × 0.378 = −0.189`।
৩. প্রথমটায়: `σ(1) = 0.731`; দ্বিতীয়টায়: `σ(−3) = 0.047`। প্রথম pair-এ model ভুল দিকে ছিল, তাই সেখানে বেশি।
৪. শুধু তৃতীয় ও চতুর্থ token: `−0.5 + (−0.3) = −0.8`। (সব যোগ করলে `−3.0`; সেটা ভুল।)

</details>

## পরের পাঠ

DPO-র loss আর update পরিষ্কার। এবার জানা দরকার SFT, reward model আর DPO কীভাবে মিলে যায় বা আলাদা: [Lecture 06 — SFT, reward model ও DPO](lecture-06-sft-reward-model-and-dpo.md)।
