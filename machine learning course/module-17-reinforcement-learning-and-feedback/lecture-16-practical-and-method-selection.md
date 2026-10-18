# Lecture 16 — Practical ও Method Selection: কোন সমস্যায় কোনটা

> আগে যা জানা থাকলে ভালো: [Reward hacking ও generalization](lecture-15-reward-hacking-and-generalization.md), [SFT (Module 15)](../module-15-domain-and-task-adaptation/lecture-02-sft-and-instruction-tuning.md) এবং [DPO (Module 16)](../module-16-preference-learning-and-dpo/lecture-04-dpo-objective-by-hand.md)। এই lecture শেষে পারবে: হাতে থাকা data দেখে SFT, DPO বা RL-এর কোনটা আগে চেষ্টা করবে ঠিক করতে, আর বলতে পারবে ফল কীভাবে মাপলে তুলনাটা ন্যায্য হয়। ([Map-এ অবস্থান](../01-learning-map.md): feedback-এর ধরন → objective → update। এই পাঠ ওই সারণি থেকে বাছাইয়ের নিয়ম।)

## সমস্যাটা কী?

SFT, DPO, GRPO সব "model-কে ভালো করে" বলা যায়, কিন্তু প্রতিটার জন্য আলাদা data লাগে, আর খরচও আলাদা। সবচেয়ে দামি পথ দিয়ে শুরু করলে সময় ও GPU নষ্ট হয়; আবার সস্তা পথে আটকে থাকলে সমস্যার আসল সংকেত কাজে লাগে না। তাই সিদ্ধান্ত নিতে হয় **কোন সংকেত হাতে আছে** আর **কতটা খরচ সামলানো যায়** দেখে।

## ধারণাটা সহজ ভাষায়

মূল নিয়ম: **যে সংকেত আছে সবচেয়ে সহজ পদ্ধতি দিয়ে তা ব্যবহার করো, আর প্রতিটা ধাপে আগের ধাপের চেয়ে ভালো হলো কি না মেপে তবেই পরের ধাপে যাও।** সিঁড়ির মতো:

1. **Baseline:** আগে model-কে prompt বা কয়েকটা উদাহরণ (few-shot) দিয়ে চালিয়ে মান মাপো। এটাই তুলনার মাপকাঠি। এতেই চলে গেলে training লাগে না।
2. **SFT:** সঠিক উত্তর (target) থাকলে সবচেয়ে সরল ও স্থির পথ।
3. **DPO:** ভালো/খারাপ pair থাকলে, বিশেষ করে সঠিক উত্তর একটা নির্দিষ্ট লেখা না হলে।
4. **RL (GRPO ইত্যাদি):** automatic verifier আছে আর model একাধিক উত্তর বানিয়ে ভালোটা বেছে শিখতে পারে, তখন।

| হাতে কী আছে | প্রথমে চেষ্টা | কেন |
|---|---|---|
| সঠিক উত্তরের তালিকা (target) | SFT | সরাসরি শেখা, rollout লাগে না |
| ভালো/খারাপ pair, target নেই | DPO | pair থেকেই চলে, আলাদা reward model লাগে না |
| Automatic verifier (test, উত্তর-মিল) | RLVR/GRPO | নিজের উত্তর বানিয়ে শেখে, target লাগে না |
| শুধু rubric বা judge-এর নম্বর | নম্বর থেকে pair বানিয়ে DPO; নয়তো reward model + RL | RL সবচেয়ে বেশি খরচ ও ঝুঁকি |
| কিছুই নেই | আগে data বা verifier বানাও | কোনো পদ্ধতিই সংকেত ছাড়া চলে না |
| শুধু chat-এ ভুল ধরানো | Inference-এ retry ([Lecture 12](lecture-12-correction-and-self-correction.md)) | Weight বদলায় না, তবে খরচও কম |

## খরচ কেমন বাড়ে

একটা ছোট হিসাব: ১০০০টা prompt, প্রতিটা উত্তর গড়ে ৩০০ token। RL-এ প্রতি prompt-এ `G = 8` টা উত্তর।

- **SFT:** ১টা target উত্তর শেখাতে `1000 × 300 = 300,000` token।
- **DPO:** chosen ও rejected দুটো উত্তর model পার হয়, তাই `1000 × 2 × 300 = 600,000` token। এর সঙ্গে reference model-এও forward চালাতে হয় ([Module 16](../module-16-preference-learning-and-dpo/lecture-03-reference-model-and-policy.md))।
- **GRPO:** শেখার আগে model-কে নতুন উত্তর **বানাতে** হয়: `1000 × 8 × 300 = 2,400,000` token। সংখ্যাটা SFT-এর ৮ গুণ। তার উপর উত্তর বানানো সাধারণত শুধু পড়ার চেয়ে ধীর, কারণ token একটা একটা করে তৈরি হয়।

```python
prompts, resp_len, G = 1000, 300, 8          # ১০০০ prompt, গড়ে ৩০০ token-এর উত্তর

sft_tokens = prompts * resp_len              # প্রতি prompt-এ ১টা target উত্তর
dpo_tokens = prompts * 2 * resp_len          # chosen + rejected, দুটোই model পার হয়
grpo_generated = prompts * G * resp_len      # প্রতি prompt-এ G টা নতুন উত্তর বানাতে হয়

print("SFT: token =", sft_tokens)
print("DPO: token =", dpo_tokens)
print("GRPO: বানানো token =", grpo_generated, "| SFT-এর", grpo_generated // sft_tokens, "গুণ")
# output:
# SFT: token = 300000
# DPO: token = 600000
# GRPO: বানানো token = 2400000 | SFT-এর 8 গুণ
```

সাবধান: এটা token-এর গণনা, সময় বা টাকার সরাসরি হিসাব নয়। GPU-র ধরন, batch আকার ও library-ভেদে ফল বদলায়।

সিদ্ধান্তের নিয়মটা একটা ছোট function-এও লেখা যায়:

```python
def choose_method(has_targets, has_pairs, has_verifier, only_scores):
    steps = ["prompt/few-shot baseline"]
    if has_targets:
        steps.append("SFT")
    if has_pairs:
        steps.append("DPO")
    if has_verifier:
        steps.append("RLVR/GRPO")
    elif only_scores:
        steps.append("scores থেকে pair বানিয়ে DPO, বা reward model + RL")
    return steps

# (has_targets, has_pairs, has_verifier, only_scores)
cases = {
    "সঠিক উত্তরের তালিকা আছে": (True, False, False, False),
    "শুধু ভালো/খারাপ pair আছে": (False, True, False, False),
    "target ও test-verifier দুটোই আছে": (True, False, True, False),
    "শুধু rubric-score আছে": (False, False, False, True),
    "কিছুই নেই": (False, False, False, False),
}
for name, flags in cases.items():
    print(name, "->", choose_method(*flags))
# output:
# সঠিক উত্তরের তালিকা আছে -> ['prompt/few-shot baseline', 'SFT']
# শুধু ভালো/খারাপ pair আছে -> ['prompt/few-shot baseline', 'DPO']
# target ও test-verifier দুটোই আছে -> ['prompt/few-shot baseline', 'SFT', 'RLVR/GRPO']
# শুধু rubric-score আছে -> ['prompt/few-shot baseline', 'scores থেকে pair বানিয়ে DPO, বা reward model + RL']
# কিছুই নেই -> ['prompt/few-shot baseline']
```

এটা সরল নিয়ম; বাস্তব সিদ্ধান্তে data-র মান, বাজেট ও ঝুঁকিও ওজন করতে হয়। তবে "target ও verifier দুটোই থাকলে SFT আগে, তারপর RL" ক্রমটা সাধারণ: SFT model-কে ভালো শুরুর বিন্দুতে আনে, যেখান থেকে RL-এর উত্তরগুলো অন্তত মাঝেমধ্যে ঠিক হয় ([Lecture 11](lecture-11-rlvr-and-grpo.md)-এর "সবাই ভুল হলে advantage ০" মনে করো)।

## দুটো বাজেট-পথ

| | কম খরচের পথ | Production-মানের পথ |
|---|---|---|
| Model | ছোট model + LoRA ([Module 13](../module-13-pretraining-finetuning-and-lora/lecture-02-finetuning-methods-map.md)) | প্রয়োজনে বড় model, full বা LoRA |
| পদ্ধতি | baseline → SFT → (দরকারে) DPO | baseline → SFT → DPO বা GRPO, একাধিক seed |
| Evaluation | ছোট held-out সেট, একটা seed | বড় held-out সেট, লুকানো test, একাধিক seed, মানুষের নমুনা যাচাই |
| ঝুঁকি | ছোট সেটে ফারাক আকস্মিক হতে পারে | খরচ ও সময় বেশি |

সুপারিশ: কম খরচের পথে শুরু করো, কিন্তু held-out evaluation-টা কিছুতেই কমিও না। Model-এর আকার কমানো যায়, মাপের সততা কমানো যায় না। RL-এ যাওয়ার আগে নিশ্চিত হও যে SFT/DPO-র baseline আসলেই যথেষ্ট নয়।

## Evaluation: তুলনা ন্যায্য রাখা

- **Held-out prompt আগেই আলাদা করো** এবং কখনো training-এ বা reward ঠিক করতে ব্যবহার কোরো না ([Module 05](../module-05-data-preparation-and-splits/lecture-03-train-validation-test-split.md))।
- **Baseline আর tuned model একই সেটে, একই নিয়মে** মাপো। ১০টা prompt-এ ৫ থেকে ৭ হওয়া কোনো প্রমাণ নয়, ২টা prompt-এর ফারাক আকস্মিক হতে পারে। কয়েকশো prompt লাগে, আর RL-এ অন্তত দুই-তিনটা seed।
- **শুধু প্রধান মান নয়, পাশের ক্ষতিও দেখো:** পুরনো ক্ষমতা কমেছে কি ([Module 15 — Forgetting](../module-15-domain-and-task-adaptation/lecture-07-forgetting-and-evaluation.md)), উত্তর অকারণে লম্বা হয়েছে কি, অকারণে এড়িয়ে যাচ্ছে কি।
- **Proxy নয়, আসল মান:** training reward বাড়া যথেষ্ট প্রমাণ নয় ([Lecture 15](lecture-15-reward-hacking-and-generalization.md))।

## মনে রাখার সারকথা

- হাতে কোন সংকেত আছে (target, pair, verifier, শুধু নম্বর) তা দেখে পদ্ধতি বাছো; সাধারণ ক্রম baseline → SFT → DPO/RL।
- RL-এ উত্তর বানানোর খরচ আছে: `G = 8` হলে বানানো token SFT-এর ৮ গুণ।
- সব তুলনা একই held-out সেটে, ছোট সেটের ফারাক বিশ্বাস না করে, আর পাশের ক্ষতি দেখে।

## নিজে করো

১. ২০০০ prompt, গড় উত্তর ২০০ token, `G = 4`। SFT-এর token ও GRPO-র বানানো token কত?
২. তোমার কাছে ৫০০টা prompt আর প্রতিটার test-সেট আছে, কিন্তু সঠিক উত্তরের লেখা নেই। প্রথমে কোন পথে যাবে?
৩. Baseline ৫০০ prompt-এর ৩০০টা ঠিক করেছে, tuned model ৩১০টা। এটাকে "উন্নতি হয়েছে" বলার আগে কী ভাবা উচিত?

<details><summary>উত্তর</summary>

১. SFT: `2000 × 200 = 400,000`। GRPO: `2000 × 4 × 200 = 1,600,000`, অর্থাৎ SFT-এর ৪ গুণ, `G`-এর সমান।
২. প্রথমে baseline মাপো, তারপর verifier (test) আছে বলে GRPO। যেহেতু target নেই, SFT-র সুযোগ কম। প্রথম সফল-উত্তর খুব কম হলে একটা ছোট ভালো শুরু (যেমন কিছু উদাহরণে SFT) লাগতে পারে।
৩. ফারাক মাত্র ১০টা prompt (২%)। আকস্মিক ওঠানামা হতে পারে কি না যাচাই করতে আরও prompt বা একাধিক seed লাগবে। সঙ্গে পাশের ক্ষতিও দেখতে হবে।

</details>

## পরের পাঠ

Module 17 এখানে শেষ। পরের module-এ teacher model থেকে ছোট student model-কে শেখানো: [Module 18 — Knowledge Distillation](../module-18-knowledge-distillation/README.md)।
