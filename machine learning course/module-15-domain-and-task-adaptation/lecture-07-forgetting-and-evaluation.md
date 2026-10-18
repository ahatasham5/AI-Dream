# Lecture 07 — Forgetting ও Evaluation: কী শিখল, কী হারাল

> আগে যা জানা থাকলে ভালো: [Lecture 04 — CPT-র খেলনা model](lecture-04-continued-pretraining-dapt-tapt.md), [Data leakage](../module-05-data-preparation-and-splits/lecture-04-data-leakage.md) এবং [Baseline](../module-06-model-evaluation-and-baselines/lecture-01-baselines.md)। এই lecture শেষে পারবে: tuning-এর ফল মাপার সময় তিনটা ফাঁদ চিনতে: ভুলে যাওয়া, leakage ও মুখস্থ করা।
> Map-এ অবস্থান: [Learning Map](../01-learning-map.md) → মূল্যায়ন। Training-এর হিসাব বদলায়নি; এখানে শুধু ফল পড়ার নিয়ম।

## সমস্যাটা কী?

Tuning শেষে domain test-এ loss কমেছে। খুশির খবর। কিন্তু তিনটা প্রশ্ন বাকি। Model কি আগে যা পারত তা এখন ভুলে গেছে? Test-এর লেখা কি আগেই training-এ ঢুকে ছিল? Model কি লেখাগুলো মুখস্থ করেছে? এই তিনটা না দেখলে একটা ভালো সংখ্যাই মিথ্যা আশ্বাস দিতে পারে। যিনি model ব্যবহার করবেন, তাঁর কাছে সত্যিকারের নতুন লেখায় কাজ করাটাই আসল।

## ধারণাটা সহজ ভাষায়

**১. Catastrophic forgetting।** Model একই parameter দিয়ে সব কাজ করে। নতুন data-র দিকে parameter সরালে পুরোনো ক্ষমতার জায়গা কমে যায়, আর পুরোনো কাজ খারাপ হয়। কমানোর সাধারণ উপায়:
- কম learning rate ও কম step।
- Replay: নতুন data-র সঙ্গে পুরোনো ধরনের কিছু data মিশিয়ে দেওয়া।
- PEFT (যেমন LoRA): কম অংশ বদলায় বলে ক্ষতি সাধারণত সীমিত থাকে, কিন্তু শূন্য নয়। মাপতে হবে।

**২. Leakage।** Test-এর লেখা (বা প্রায় একই লেখা) training data-য় থাকলে loss ভুলভাবে কম দেখায়। সামান্য বদলানো কপিও leakage; তাই শুধু হুবহু মিল খুঁজলে চলে না। Training data বানানোর আগেই test আলাদা করে রাখো।

**৩. Memorization।** Model training-এর লেখা হুবহু মনে রেখে ফেরত দিলে সে শেখেনি, মুখস্থ করেছে। এতে গ্রাহকের ব্যক্তিগত তথ্য ফাঁসও হতে পারে ([Lecture 03](lecture-03-domain-adaptation-and-data-selection.md))। দুটো সংকেত: model-এর output-এর কত অংশ training data-র হুবহু অংশ, আর training loss ও নতুন লেখার loss-এর ফাঁক কত বড়।

এই কারণে সবসময় **দুই ধরনের test** রাখো: নতুন ক্ষমতার (domain-এর অদেখা লেখা) আর পুরোনো ক্ষমতার (সাধারণ অদেখা লেখা)। দুটোই tuning-এর আগে ও পরে মাপো।

## ছোট একটা উদাহরণ

Lecture 04-এর খেলনা model। তিনটা model: base, CPT (শুধু domain text), mix (domain text ও সাধারণ text-এর কিছুটা ফের)। দুই test-ই training-এ ছিল না।

| Model | নতুন (domain) loss | পুরোনো (সাধারণ) loss |
|---|---:|---:|
| Base | 2.874 | 1.666 |
| CPT | 1.682 | 1.738 |
| Mix | 1.711 | 1.644 |

- CPT: নতুন loss `2.874 − 1.682 = 1.192` কমেছে (লাভ), পুরোনো `1.738 − 1.666 = 0.072` বেড়েছে (ক্ষতি, forgetting)।
- Mix: লাভ সামান্য কম (1.711), কিন্তু পুরোনো loss প্রায় আগের মতো। এই ছোট model-এ replay-এ পুরোনো loss base-এর চেয়ে সামান্য কমেওছে; আসল model-এ এমনটা না-ও হতে পারে।

খেলনা model-এ প্রভাব ছোট; আসল model-এ মাত্রা আলাদা হতে পারে। তবে এই দুই test পাশাপাশি রাখার ধরনটাই শেখার বিষয়।

**Leakage:** `"আমি কার্ড ব্লক করি"` বাক্যটা CPT-র text-এও আছে। সেটাকে test ধরলে loss 1.366। একই model-এ সত্যিকারের অদেখা বাক্যে 1.682। ফাঁক `1.682 − 1.366 = 0.316`; এটা model-এর ক্ষমতা নয়, শুধু leakage-এর ফল।

**Memorization-এর পরীক্ষা:** model দুটো বাক্য বানাল। প্রথমটা training-এর হুবহু কপি, দ্বিতীয়টা নয়।

## কোড

```python
import math, copy
from collections import defaultdict

general = ["আমি রোজ ভাত খাই", "আমি রোজ ভাত খাই", "আমি রোজ পানি খাই",
           "সে রোজ বই পড়ে", "সে রোজ বই পড়ে", "আমি বই পড়ি"]
domain = ["আমি কার্ড ব্লক করি", "আমি কার্ড ব্লক করি", "আমি পিন রিসেট করি",
          "আমি কার্ড রিসেট করি", "সে পিন ব্লক করে"]
V = 16

def train(sents, c=None):                # Lecture 04-এর একই গোনা-model
    c = c if c is not None else defaultdict(lambda: defaultdict(float))
    for s in sents:
        t = s.split() + ["<end>"]
        for a, b in zip(t[:-1], t[1:]):
            c[a][b] += 1
    return c

def loss(c, sents, k=0.5):
    ls = []
    for s in sents:
        t = s.split() + ["<end>"]
        ls += [-math.log((c[a][b] + k) / (sum(c[a].values()) + k * V))
               for a, b in zip(t[:-1], t[1:])]
    return sum(ls) / len(ls)

base = train(general)
cpt = train(domain, copy.deepcopy(base))
mix = train(domain + general[::2], copy.deepcopy(base))   # সাধারণ text-এর কিছুটা ফের

new_test, old_test = ["আমি পিন ব্লক করি"], ["আমি রোজ বই পড়ি"]
for name, m in [("base", base), ("cpt", cpt), ("mix", mix)]:
    print(name, "নতুন:", round(loss(m, new_test), 3), "পুরোনো:", round(loss(m, old_test), 3))

leaky = ["আমি কার্ড ব্লক করি"]                          # এটা domain train-এও আছে
print("leaky test:", round(loss(cpt, leaky), 3), " clean test:", round(loss(cpt, new_test), 3))
generated = ["আমি কার্ড ব্লক করি", "আমি পিন ব্লক করি"]   # model-এর (ধরে নেওয়া) output
print("train-এর হুবহু কপি:", [g in domain for g in generated])
```

```text
# output:
base নতুন: 2.874 পুরোনো: 1.666
cpt নতুন: 1.682 পুরোনো: 1.738
mix নতুন: 1.711 পুরোনো: 1.644
leaky test: 1.366  clean test: 1.682
train-এর হুবহু কপি: [True, False]
```

## মনে রাখার সারকথা
- নতুন ক্ষমতার test ও পুরোনো ক্ষমতার test, দুটোই tuning-এর আগে ও পরে মাপো; লাভ ও ক্ষতি পাশাপাশি দেখো।
- Test আগে আলাদা করো; হুবহু ও প্রায়-একই কপি দুটোই leakage।
- Model-এর output training data-র হুবহু অংশ হলে সেটা মুখস্থ; ব্যক্তিগত তথ্য থাকলে বড় ঝুঁকি।

## নিজে করো

১. উপরের সারণিতে CPT-তে নতুন loss কত কমেছে আর পুরোনো কত বেড়েছে?
২. Leaky ও clean test-এর ফাঁক কত? এটা কেন ক্ষমতার প্রমাণ নয়?
৩. Model দুটো বাক্য বানাল: `["আমি কার্ড ব্লক করি", "আমি পিন ব্লক করি"]`। Domain training data-তে `"আমি কার্ড ব্লক করি"` আছে, অন্যটা নেই। কোনটা হুবহু কপি?

<details><summary>উত্তর</summary>

১. নতুন `2.874 − 1.682 = 1.192` কমেছে; পুরোনো `1.738 − 1.666 = 0.072` বেড়েছে।
২. `1.682 − 1.366 = 0.316`। Leaky বাক্যটা model training-এ দেখেছে, তাই loss কম; অদেখা লেখায় এই সুবিধা নেই।
৩. প্রথমটা (`True`)। এটা training data-য় হুবহু আছে। দ্বিতীয়টা নেই (`False`)।

</details>

## পরের পাঠ

সব ধারণা এক জায়গায় এনে base, CPT, SFT ও retrieval-কে একই নিয়মে তুলনা: [Lecture 08 — Adaptation Experiment](lecture-08-adaptation-experiment.md)।
