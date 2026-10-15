# Lecture 08 — LLM-এ Policy ও Rollout

> আগে যা জানা থাকলে ভালো: [Lecture 02](lecture-02-agent-environment-state-action-reward.md)–[07](lecture-07-actor-critic-and-ppo.md)-এর শব্দগুলো, [Logits ও softmax](../module-12-text-sequences-and-multimodal-models/lecture-03-logits-and-softmax.md), [Autoregressive decoder](../module-12-text-sequences-and-multimodal-models/lecture-07-autoregressive-decoder-and-stopping.md) এবং [Sequence probability ও log-ratio](../module-16-preference-learning-and-dpo/lecture-02-sequence-probability-and-log-ratio.md)। এই lecture শেষে পারবে: করিডোরের প্রতিটা RL-শব্দ LLM-এ কোনটা তা বলতে, আর একটা উত্তরের reward থেকে reference-এর শাস্তি বাদ দিয়ে চূড়ান্ত reward হাতে বের করতে। ([Map-এ অবস্থান](../01-learning-map.md): নতুন কোনো formula নয়; আগের RL-শব্দগুলো LLM-এ বসানো।)

## সমস্যাটা কী?

LLM-এর RL শুনলে মনে হয় একটা আলাদা জগৎ। আসলে করিডোরের প্রতিটা শব্দ LLM-এ একটা নির্দিষ্ট জিনিস। সেই মিলটা না জানলে RLHF, PPO বা GRPO পড়তে গিয়ে প্রতিটা শব্দেই আটকাতে হয়। তাই আগে একটা অনুবাদ-তালিকা।

## ধারণাটা সহজ ভাষায়

| করিডোর | LLM |
|---|---|
| State: কোন ঘরে আছি | Prompt আর এ পর্যন্ত লেখা সব token |
| Action: বাঁ বা ডান | পরের token (শব্দভান্ডারের একটা) |
| Policy: চাল বাছার নিয়ম | LLM নিজে: state দেখে প্রতিটা token-এর probability দেয় (softmax) |
| Episode: ঘর 0 থেকে শেষ ঘর | একটা পুরো উত্তর, `<eos>` পর্যন্ত |
| Reward: প্রতি চালে −1 বা +10 | সাধারণত উত্তর শেষ হলে একবার: verifier বা reward model-এর score |

**Rollout** মানে একটা episode চালানো, অর্থাৎ prompt থেকে শুরু করে একটা উত্তর বানানো (token sample করে করে)। RL-এ model নিজেই নিজের data বানায়। SFT বা DPO-র মতো তৈরি data দেওয়া থাকে না। এই উত্তর বানানোই RL-এর খরচের বড় অংশ।

দুটো জিনিস করিডোর থেকে আলাদা:

**১. Reward দেরিতে, একবার।** করিডোরে প্রতি চালে reward ছিল। LLM-এ উত্তরের মাঝের প্রতিটা token-এ reward সাধারণত 0, শেষে একটা সংখ্যা (যেমন সঠিক হলে 1, ভুল হলে 0)। γ = 1 ধরলে ([Lecture 03](lecture-03-return-discount-delayed-reward.md)), উত্তরের প্রতিটা token-এর return ওই একটাই সংখ্যা। কোন token ভালো ছিল, সেটা আলাদা করা কঠিন। এই credit assignment সামলাতে Lecture 07-এর critic বা পরে ([Lecture 11](lecture-11-rlvr-and-grpo.md)) group-এর তুলনা ব্যবহার হয়।

**২. Reference model।** শুরুর (সাধারণত SFT করা) model-এর একটা জমানো কপি, যার weight আর বদলায় না। এর কাজ কেন লাগে? Reward কখনো নিখুঁত নয়। Policy শুধু reward বাড়াতে চাইলে সে reward-এর ফাঁক খুঁজে অদ্ভুত, ভাঙা ভাষার উত্তরে চলে যেতে পারে ([Lecture 15](lecture-15-reward-hacking-and-generalization.md))। তাই reference থেকে policy কতটা সরেছে, তার একটা শাস্তি reward থেকে বাদ দেওয়া হয়।

শাস্তির মাপ আসে [Module 16](../module-16-preference-learning-and-dpo/lecture-03-reference-model-and-policy.md)-এর পরিচিত জিনিস থেকে: প্রতিটা token-এ `ln(policy-র probability / reference-এর probability)` (log-ratio)। উত্তরের সব token-এর log-ratio যোগ করে β (একটা ছোট সংখ্যা) দিয়ে গুণ করা হয়।

`চূড়ান্ত reward = উত্তরের reward − β × (সব token-এর log-ratio-র যোগফল)`

Policy reference-এর মতো থাকলে log-ratio প্রায় 0, শাস্তিও প্রায় 0। যত সরে, শাস্তি তত বাড়ে। (এটা reference থেকে দূরত্বের একটা sample-ভিত্তিক অনুমান।)

## ছোট একটা উদাহরণ

খেলনা model: prompt "২ + ৩ =", উত্তর `["৫", "<eos>"]`। Policy ও reference-এর probability:

| token | policy | reference | `ln(policy / reference)` |
|---|---|---|---|
| ৫ | 0.6 | 0.4 | ln(1.5) = 0.405 |
| `<eos>` (৫-এর পরে) | 0.9 | 0.8 | ln(1.125) = 0.118 |

যোগফল 0.405 + 0.118 = **0.523**। (পুরো উত্তরের probability: policy 0.6 × 0.9 = 0.54, reference 0.4 × 0.8 = 0.32।) Verifier বলল উত্তর ঠিক, reward = 1.0। β = 0.1:

```text
চূড়ান্ত reward = 1.0 − 0.1 × 0.523 = 0.948
```

এখন ধরো policy আরও সরে গেছে: ৫ আর `<eos>` দুটোতেই 0.99। Log-ratio: ln(0.99 / 0.4) = 0.906, ln(0.99 / 0.8) = 0.213, যোগফল 1.119। চূড়ান্ত reward = 1.0 − 0.1 × 1.119 = **0.888**। একই সঠিক উত্তর, কিন্তু reference থেকে বেশি সরার জন্য reward কমেছে।

## কোড

একই খেলনা model-এ সত্যিকারের rollout, পাঁচবার:

```python
import math, random

policy = {"<start>": {"৫": 0.6, "৪": 0.3, "<eos>": 0.1},
          "৫": {"<eos>": 0.9, "৫": 0.1},
          "৪": {"<eos>": 0.9, "৪": 0.1}}
ref    = {"<start>": {"৫": 0.4, "৪": 0.4, "<eos>": 0.2},
          "৫": {"<eos>": 0.8, "৫": 0.2},
          "৪": {"<eos>": 0.8, "৪": 0.2}}
BETA = 0.1

def rollout():
    state, toks = "<start>", []
    while True:
        dist = policy[state]
        tok = random.choices(list(dist), weights=dist.values())[0]
        toks.append(tok)
        if tok == "<eos>" or len(toks) == 4:
            return toks
        state = tok

def sum_log_ratio(toks):
    state, total = "<start>", 0.0
    for tok in toks:
        total += math.log(policy[state][tok] / ref[state][tok])
        state = tok
    return total

random.seed(3)
for _ in range(5):
    toks = rollout()
    reward = 1.0 if toks == ["৫", "<eos>"] else 0.0   # verifier
    lr = sum_log_ratio(toks)
    print(toks, "reward", reward, "sum log-ratio", round(lr, 3), "shaped", round(reward - BETA * lr, 3))
# output:
# ['৫', '<eos>'] reward 1.0 sum log-ratio 0.523 shaped 0.948
# ['৫', '<eos>'] reward 1.0 sum log-ratio 0.523 shaped 0.948
# ['৪', '<eos>'] reward 0.0 sum log-ratio -0.17 shaped 0.017
# ['৫', '<eos>'] reward 1.0 sum log-ratio 0.523 shaped 0.948
# ['৫', '<eos>'] reward 1.0 sum log-ratio 0.523 shaped 0.948
```

`shaped` হলো চূড়ান্ত reward। ভুল উত্তর `৪`-এ log-ratio সামান্য ঋণাত্মক, কারণ policy ৪-কে reference-এর চেয়ে কম সম্ভাবনা দেয়, তাই এই এক উত্তরে শাস্তির বদলে সামান্য বোনাস। অনেক উত্তরের গড়ে এই শাস্তি শূন্য বা তার বেশি হয়।

## পুরো loop (pseudo-code, চালানো হয়নি)

নিচের কোড ধারণা বোঝানোর জন্য; কোনো আসল library-র API নয়, চালানোও হয়নি।

```text
for প্রতিটা batch of prompts:
    responses = policy দিয়ে উত্তর বানাও             # rollout
    reward    = verifier বা reward model-এর score    # উত্তর শেষে
    penalty   = β × Σ ln(policy / reference)         # প্রতি token
    adv       = (reward − penalty) থেকে advantage     # critic বা group দিয়ে
    policy-কে clipped objective-এ update করো          # Lecture 07
```

Policy gradient-এর হিসাব আগের মতোই, তবে প্রতিটা token-এর log-probability-র ওপর। Advantage ধনাত্মক উত্তরের token-গুলোর সম্ভাবনা বাড়ে, ঋণাত্মকের কমে। Reward model কীভাবে বানানো হয় আর এই loop-এ পুরো কী কী model লাগে, [Lecture 09](lecture-09-rlhf-and-reward-modeling.md)-এ।

## মনে রাখার সারকথা

- LLM-এ state = prompt + এ পর্যন্ত লেখা token, action = পরের token, policy = LLM নিজে, episode = একটা পুরো উত্তর।
- Reward সাধারণত উত্তর শেষে একবার আসে, তাই প্রতিটা token-এর credit আলাদা করা কঠিন।
- Reference model থেকে সরার শাস্তি (`β × Σ ln(policy / reference)`) reward থেকে বাদ দেওয়া হয়, যাতে policy reward-এর ফাঁকে ভেঙে না যায়।

## নিজে করো

১. Prompt "২ + ৩ =", model এ পর্যন্ত লিখেছে "৫"। এই মুহূর্তে state কী? Action কী হতে পারে?
২. উত্তর `["৫", "<eos>"]`, policy-র probability 0.6 ও 0.9, reference-এর 0.5 ও 0.9, reward = 1, β = 0.1। চূড়ান্ত reward কত?
৩. কোনো উত্তরের reward 0, log-ratio-র যোগফল 2.0, β = 0.1। চূড়ান্ত reward কত?

<details><summary>উত্তর</summary>

১. State = prompt + এ পর্যন্ত লেখা "৫"। Action হলো শব্দভান্ডারের যেকোনো একটা token, যেমন `<eos>` (থামা) বা আরেকটা অক্ষর।
২. Log-ratio: ln(0.6 / 0.5) = 0.182, ln(0.9 / 0.9) = 0। যোগফল 0.182। চূড়ান্ত reward = 1 − 0.1 × 0.182 = 0.982।
৩. 0 − 0.1 × 2.0 = −0.2। উত্তরটা ভুলও, আবার reference থেকে অনেক সরেও গেছে, তাই ঋণাত্মক।

</details>

## পরের পাঠ

Reward-এর উৎস এখনো অজানা। মানুষের পছন্দ থেকে reward model বানিয়ে এই loop চালানোই RLHF: [Lecture 09 — RLHF ও reward modeling](lecture-09-rlhf-and-reward-modeling.md)।
