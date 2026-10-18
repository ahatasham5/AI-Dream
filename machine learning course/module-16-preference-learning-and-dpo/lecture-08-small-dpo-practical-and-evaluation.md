# Lecture 08 — ছোট DPO practical ও evaluation

> আগে যা জানা থাকলে ভালো: [DPO loss](lecture-04-dpo-objective-by-hand.md) ও [gradient](lecture-05-dpo-gradient-and-training-loop.md)। এই lecture শেষে পারবে: একটা খেলনা policy-তে DPO-র কয়েক step চালিয়ে chosen-এর probability বাড়তে দেখতে, আর বলতে model-কে কোন কোন মাপ দিয়ে যাচাই করতে হয় (style বনাম correctness সহ)। ([Map-এ অবস্থান](../01-learning-map.md): এখানে output, loss ও update একসঙ্গে চলে, কিন্তু অংশগুলো code-এ আলাদা চিহ্নিত)

## সমস্যাটা কী?

এ পর্যন্ত DPO-র প্রতিটা অংশ আলাদা করে হাতে হিসাব করা হয়েছে। কিন্তু সত্যিই কাজ করে কি না না দেখলে ভরসা হয় না। আবার বাস্তব language model-এ চালাতে GPU লাগে, যা এখানে নেই। তাই সবচেয়ে ছোট policy নিয়ে সব অংশ একসঙ্গে চালাই। এরপর প্রশ্ন: training-এর পরে "ভালো হয়েছে" কীভাবে প্রমাণ হবে? Loss কমা যথেষ্ট নয়।

## খেলনা policy

একটাই prompt: "বাংলাদেশের রাজধানী কী?" এর চারটা সম্ভাব্য **পুরো** উত্তর:

| সূচক | উত্তর | reference-এর probability |
|---|---|---:|
| A | ঢাকা। | 0.40 |
| B | বাংলাদেশের রাজধানী ঢাকা। | 0.30 |
| C | বাংলাদেশের রাজধানী চট্টগ্রাম। (সুন্দর, কিন্তু ভুল) | 0.20 |
| D | জানি না। | 0.10 |

Policy হলো এই চারটার উপর একটা **softmax table**: চারটা সংখ্যা (logits `θ`) আর softmax। এখানে পুরো উত্তরটাই একটা "পছন্দ", তাই `log π_θ(y|x)` হলো table-এর ওই সারির `log` probability। বাস্তব model-এ এটা [token log probability-র যোগফল](lecture-02-sequence-probability-and-log-ratio.md)। Reference হলো শুরুর একটা স্থির copy।

Preference data (তিনটা pair): B ≻ A (পুরো বাক্য ভালো), B ≻ D, A ≻ D। C কোনো pair-এ নেই।

Softmax table-এর জন্য `∂ log π(y) / ∂θ_k = [k = y] − π_k` (সূচক `k` উত্তর `y` হলে 1, নইলে 0, তারপর `π_k` বাদ)। বাকি অংশ [Lecture 05](lecture-05-dpo-gradient-and-training-loop.md)-এর `− β σ(−z)` গুণক।

## কোড (pure Python, চালানো হয়েছে)

```python
import math

def softmax(z):
    e = [math.exp(v) for v in z]
    return [v / sum(e) for v in e]

def sigmoid(v):
    return 1 / (1 + math.exp(-v))

ref_logits = [math.log(p) for p in [0.40, 0.30, 0.20, 0.10]]  # reference (স্থির)
ref_lp = [math.log(p) for p in softmax(ref_logits)]           # log πref
logits = list(ref_logits)             # policy: শুরুতে reference-এর copy
pairs = [(1, 0), (1, 3), (0, 3)]      # (chosen, rejected): B>A, B>D, A>D
beta, lr = 0.5, 1.0

def loss_and_grad(logits):
    p = softmax(logits)
    loss, grad = 0.0, [0.0] * 4
    for w, l in pairs:
        m = (math.log(p[w]) - ref_lp[w]) - (math.log(p[l]) - ref_lp[l])
        loss += -math.log(sigmoid(beta * m))
        c = -beta * sigmoid(-beta * m)            # dL/dm
        for k in range(4):                        # d log p_y / d logit_k = [k==y] - p_k
            grad[k] += c * (((k == w) - p[k]) - ((k == l) - p[k]))
    n = len(pairs)
    return loss / n, [g / n for g in grad]

for step in range(41):
    loss, grad = loss_and_grad(logits)
    if step in (0, 1, 5, 10, 20, 40):
        print("step", step, " loss", round(loss, 3),
              " p =", [round(x, 3) for x in softmax(logits)])
    logits = [v - lr * g for v, g in zip(logits, grad)]
# output:
# step 0  loss 0.693  p = [0.4, 0.3, 0.2, 0.1]
# step 1  loss 0.639  p = [0.385, 0.341, 0.192, 0.081]
# step 5  loss 0.481  p = [0.314, 0.492, 0.157, 0.038]
# step 10  loss 0.363  p = [0.234, 0.633, 0.117, 0.016]
# step 20  loss 0.243  p = [0.135, 0.794, 0.067, 0.004]
# step 40  loss 0.148  p = [0.058, 0.912, 0.029, 0.001]
```

Code-এর অংশগুলো: `softmax` ও `log` = output-এর হিসাব; `m` ও `loss` = objective; `grad` ও শেষ লাইনের `logits = ...` = update। কোনো উত্তর বানানো বা reward গোনা নেই: data স্থির, তাই এটা offline।

## কী দেখা গেল

- **Step 0:** policy = reference, `m = 0`, loss `ln 2 = 0.693`।
- **B (chosen):** probability `0.30 → 0.912`। Loss `0.693 → 0.148`।
- **D (সবসময় rejected):** `0.10 → 0.001`।
- **A:** একবার chosen, একবার rejected। B-র কাছে হেরে নামছে (0.40 → 0.058)।
- **C-র probability-ও কমল (0.20 → 0.029),** যদিও C কোনো pair-এ ছিল না। কারণ probability-র মোট ১; B বেশি নিলে বাকিরা কমে। এটা "C ভুল" শেখার ফল নয়।

C-র ব্যাপারটাই preference-এর সীমা দেখায়। Annotator ভুল করে "সুন্দর কিন্তু ভুল" C-কে বেছে নিলে (`pairs = [(2, 0), (2, 3), (0, 3)]` দিয়ে একই code চালালে) step 40-এ `p ≈ [0.08, 0.06, 0.86, 0.001]`: model ঠিক C-কেই প্রায় ৮৬% সম্ভাব্য বানিয়ে ফেলে। Data যা বলে, DPO তাই শেখে ([Lecture 01](lecture-01-preference-data.md))।

একই `lr` ধরে `β = 0.1` দিয়ে চালালে step 40-এ B-র probability `0.63` পর্যন্ত যায়, অর্থাৎ ধীর। এখানে gradient-এ `β` গুণক আছে বলে এমন হয়েছে; অন্য setup-এ প্রভাব ভিন্ন হতে পারে।

**সীমা:** এই table-এ প্রতিটা উত্তরের নিজস্ব logit, তাই এক prompt-এর শিক্ষা অন্য prompt-এ ছড়ায় না। বাস্তব model-এ parameter ভাগাভাগি হয়, তাই নতুন prompt-এ কী হবে সেটা আলাদা করে পরীক্ষা করা দরকার; এই toy তা দেখাতে পারে না।

বাস্তবে DPO-র জন্য তৈরি trainer আছে (যেমন Hugging Face TRL; [DPO trainer docs](https://huggingface.co/docs/trl/dpo_trainer)), কিন্তু তার API এখানে চালিয়ে যাচাই করা হয়নি বলে code দেওয়া হলো না।

## Evaluation: কী দিয়ে মাপব?

Loss কমা মানে শুধু "training pair-এ policy আগের চেয়ে ভালো ভাগ করছে"। এর বাইরে চার ধরনের মাপ লাগে:

| মাপ | কী বলে | সীমা |
|---|---|---|
| **Held-out preference accuracy** | Training-এ ব্যবহৃত হয়নি এমন pair-এ কতবার `m > 0` | শুধু preference-এর সঙ্গে মিল দেখায়, সঠিকতা নয় |
| **Win-rate** (human বা AI judge: নতুন model বনাম reference) | কোন model-এর উত্তর বেশি পছন্দ হচ্ছে | Judge লম্বা বা সুন্দর উত্তরের দিকে ঝুঁকতে পারে |
| **Task metric** | আসল কাজের নম্বর: exact match, CER/WER, test pass, যাচাই করা final answer | যেখানে যাচাইযোগ্য উত্তর আছে সেখানেই সবচেয়ে নির্ভরযোগ্য |
| **পার্শ্বপ্রতিক্রিয়া** | উত্তরের গড় দৈর্ঘ্য, reference থেকে কতদূর সরেছে, পুরোনো ক্ষমতা ([forgetting](../module-15-domain-and-task-adaptation/lecture-07-forgetting-and-evaluation.md)) | আলাদা evaluation set লাগে |

### Held-out preference accuracy হাতে

পাঁচটা নতুন pair, প্রতিটার `(Δ_w, Δ_l)` (দুই log-ratio):

| pair | `Δ_w` | `Δ_l` | `m = Δ_w − Δ_l` | `m > 0`? |
|---|---:|---:|---:|---|
| ১ | 0.8 | −0.2 | 1.0 | হ্যাঁ |
| ২ | 0.3 | 0.5 | −0.2 | না |
| ৩ | 1.1 | −0.4 | 1.5 | হ্যাঁ |
| ৪ | −0.1 | −0.6 | 0.5 | হ্যাঁ |
| ৫ | 0.2 | 0.6 | −0.4 | না |

Accuracy = `3 ÷ 5 = 0.6`।

```python
held_out = [(0.8, -0.2), (0.3, 0.5), (1.1, -0.4), (-0.1, -0.6), (0.2, 0.6)]
margins = [dw - dl for dw, dl in held_out]
correct = sum(1 for m in margins if m > 0)
print("preference accuracy:", correct, "/", len(margins), "=", correct / len(margins))
# output:
# preference accuracy: 3 / 5 = 0.6
```

Held-out set বানানোর সময় **prompt ধরে** ভাগ করতে হয়: একই prompt-এর pair-গুলো একই ভাগে থাকবে, নইলে training-এর prompt-ই evaluation-এ ঢুকে leakage হয় ([Data leakage](../module-05-data-preparation-and-splits/lecture-04-data-leakage.md))।

### Style বনাম correctness

একটা **কাল্পনিক** ফল, শুধু ধারণা বোঝাতে (বাস্তব experiment নয়):

| model | reference-এর বিপরীতে win-rate | exact match |
|---|---:|---:|
| Reference (SFT) | 50% | 62% |
| DPO-র পরে | 74% | 61% |

Win-rate বেড়েছে, কিন্তু exact match বাড়েনি, সামান্য কমেছে। উত্তর আগের চেয়ে বেশি পছন্দের (ভদ্র, গোছানো) হয়েছে, কিন্তু বেশি সঠিক হয়নি। শুধু preference accuracy বা win-rate দেখলে এটাকে সাফল্য ভাবা হতো। তাই যে কাজের সঠিকতা আছে, সেখানে task metric না দেখে model বদলানো উচিত নয়। সঠিকতা-কেন্দ্রিক কাজে যাচাই করা chosen-সহ data, আর প্রয়োজনে verifier-ভিত্তিক পথ ([RLVR](../module-17-reinforcement-learning-and-feedback/lecture-11-rlvr-and-grpo.md)) বিবেচনা করা হয়।

## মনে রাখার সারকথা

- খেলনা policy-তে DPO চালালে chosen B-র probability 0.30 থেকে 0.912 হয়, rejected D-র 0.10 থেকে 0.001; এতে rollout লাগেনি, data স্থির।
- Pair-এ ছিল না এমন উত্তরের probability-ও বদলায়; আর ভুল preference পেলে model ভুলটাই শেখে।
- Loss বা win-rate শেষ কথা নয়: held-out preference accuracy, task metric আর পার্শ্বপ্রতিক্রিয়া একসঙ্গে দেখতে হয়।

## নিজে করো

১. উপরের code-এ `pairs`-এ শুধু `(1, 0)` রেখে চালালে কোন উত্তরগুলোর probability বাড়বে, কোনগুলোর কমবে বলে মনে হয়? চালিয়ে মেলাও।
২. Held-out pair-এর `m` গুলো `[0.5, 0.4, −0.1, 0.9]` হলে preference accuracy কত?
৩. Win-rate 60% → 80% হলো, exact match একই। কোন সিদ্ধান্ত নেওয়া নিরাপদ নয়, কেন?

<details><summary>উত্তর</summary>

১. B বাড়ে (step 40-এ ≈ 0.946), A কমে (≈ 0.004)। C ও D-র logit বদলায় না, তবু তাদের probability কমে (≈ 0.034 ও 0.017), কারণ B মোট probability-র বড় অংশ নিয়ে নেয়। দুটোর অনুপাত ২ : ১-ই থাকে।
২. চারটার মধ্যে তিনটায় `m > 0`; accuracy `3 ÷ 4 = 0.75`।
৩. "model আরও সঠিক হয়েছে" ধরে নেওয়া নিরাপদ নয়। Win-rate পছন্দের মাপ; exact match একই থাকলে সঠিকতা বাড়েনি।

</details>

## পরের পাঠ

Module 16 এখানে শেষ। DPO-তে rollout ছিল না; এবার সেই rollout-ভিত্তিক RL কীভাবে কাজ করে, state, action, reward দিয়ে ধাপে ধাপে: [Module 17 — RL ও feedback](../module-17-reinforcement-learning-and-feedback/README.md)।
