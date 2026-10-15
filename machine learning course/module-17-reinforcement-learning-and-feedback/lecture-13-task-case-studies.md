# Lecture 13 — Task ভেদে Reward-এর নকশা

> আগে যা জানা থাকলে ভালো: [RLVR ও GRPO](lecture-11-rlvr-and-grpo.md) এবং [RLAIF ও feedback-এর মান](lecture-10-rlaif-and-feedback-quality.md)। এই lecture শেষে পারবে: একটা কাজ দেখে বলতে কে যাচাই করবে, reward-এর সূত্র কী হবে, আর কোথায় ফাঁকির ঝুঁকি। ([Map-এ অবস্থান](../01-learning-map.md): feedback → reward-এর সূত্র। RL-এর update আগের পাঠগুলোর মতোই; এখানে শুধু reward বানানো।)

## সমস্যাটা কী?

RL-এর algorithm (GRPO, PPO) যেকোনো reward নিয়ে চলে। কিন্তু reward কী হবে, সেটা তোমাকেই ঠিক করতে হয়, আর সেই সিদ্ধান্তই শেষ পর্যন্ত model কী শিখবে তা ঠিক করে। ভুল reward দিলে model ঠিক সেটাই শেখে যা তুমি মাপছ, তুমি যা চেয়েছিলে তা নয়। তাই প্রতিটা কাজের জন্য ভাবতে হয়: কে বা কী যাচাই করবে, কত নম্বর দেব, আর কোথায় ফাঁকি দেওয়া সম্ভব।

## ধারণাটা সহজ ভাষায়

কাজ ভেদে যাচাই সহজ বা কঠিন হয়। সহজ থেকে কঠিনের দিকে:

| কাজ | কে যাচাই করে | Reward-এর সূত্র (উদাহরণ) | ফাঁকির ঝুঁকি |
|---|---|---|---|
| Math | চূড়ান্ত উত্তরের মিল | ঠিক উত্তর ১, format ঠিক হলে +০.১ | উত্তর ঠিক কিন্তু যুক্তি ভুল (ধাপগুলো যাচাই না হলে) |
| Code | Test চালানো | যতগুলো test পাস, তার অনুপাত | Test-এর উত্তর মুখস্থ বসিয়ে দেওয়া |
| OCR | Reference লেখার সঙ্গে মিল | `1 − min(CER, 1)` | ভুল reference; layout বা বানানের ভিন্নরূপ |
| Style / সৌজন্য | Rubric বা reward model | rubric-এর কত অংশ মিলল | Judge-এর পক্ষপাত; শুধু style, তথ্য নয় |
| Robotics | Environment-এর অবস্থা | লক্ষ্যে পৌঁছালে বড় পুরস্কার, পথে ছোট সংকেত | সংকেত লোভে ঘুরপাক খাওয়া |
| Tool-use | কাজ সফল হয়েছে কি না | সফলতা − প্রতি call-এর খরচ | অপ্রয়োজনীয় call বা ভুল call-এ সফলতার ভান |

(CER মানে character error rate, reference-এর তুলনায় ভুল অক্ষরের হার। [Lecture 01](lecture-01-correction-target-preference-and-reward.md) দেখো।)

নকশার কয়েকটা সাধারণ প্রশ্ন:

- **Partial credit দেব কি?** সব-বা-কিছুই-না reward (সব test পাস হলে ১, নইলে ০) সহজ, কিন্তু কঠিন প্রশ্নে বেশিরভাগ উত্তরই ০ পায়, ফলে [Lecture 11](lecture-11-rlvr-and-grpo.md)-এর advantage ০ হয়ে শেখাই বন্ধ থাকে। আংশিক নম্বর সংকেত দেয়, কিন্তু "৫টার ৩টা পাস" ভালো কি না তা কাজ বুঝে ঠিক করতে হয়।
- **Dense না sparse?** Sparse reward শুধু শেষে আসে (কাজ হলো কি না)। Dense reward পথের মাঝেও আসে (লক্ষ্যের দিকে এগোলে)। Dense সহজে শেখায়, কিন্তু ভুল dense সংকেত ফাঁকির রাস্তা খোলে।
- **খরচ ধরব কি?** Tool-use বা robotics-এ কাজ সফল হলেও অনেক ধাপ বা সময় লাগলে সেটাকে কম নম্বর দেওয়া যায়।

## ছোট একটা উদাহরণ

প্রতিটা কাজের একটা করে হিসাব:

- **OCR:** reference `বইটি`, model লিখল `বউটি`। ৪টা অক্ষরের ১টা ভুল, CER `1/4 = 0.25`, reward `0.75`। যদি লিখত `বই`, তাহলে ২টা অক্ষর বাদ, CER `2/4 = 0.5`, reward `0.5`।
- **Math:** উত্তর `42` ঠিক ও format ঠিক হলে `1.1`; উত্তর ভুল কিন্তু format ঠিক হলে `0.1`।
- **Code:** ৫টা test-এর ৩টা পাস, reward `3/5 = 0.6`।
- **Robot:** লক্ষ্য থেকে দূরত্ব ৫ থেকে ৪ হলে `(5 − 4) − 0.1 = 0.9` (০.১ প্রতি ধাপের সময়-খরচ)। দূরত্ব ৪ থেকে ৪.৫ হলে `−0.6`।
- **Tool-use:** সফল, ২টা call, প্রতি call-এর খরচ ০.১ হলে `1 − 0.2 = 0.8`। ৬টা call হলে `0.4`।
- **Style:** rubric-এ ৩টা প্রশ্নের ২টা মিললে `2/3 ≈ 0.67`।

```python
import unicodedata

def edit_distance(a, b):
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]

def ocr_reward(ref, pred):                      # OCR: 1 - min(CER, 1)
    ref = unicodedata.normalize("NFC", ref)
    pred = unicodedata.normalize("NFC", pred)
    cer = edit_distance(ref, pred) / len(ref)
    return 1 - min(cer, 1)

def math_reward(answer, gold, format_ok):       # ঠিক উত্তর ১, format ঠিক হলে +০.১
    return (1.0 if answer == gold else 0.0) + (0.1 if format_ok else 0.0)

def code_reward(passed, total):                 # test-এর কত অংশ পাস
    return passed / total

def robot_reward(dist_before, dist_after, reached):   # লক্ষ্যের দিকে এগোলে পুরস্কার
    return 10.0 if reached else (dist_before - dist_after) - 0.1

def tool_reward(success, calls, cost=0.1):      # সফলতা - প্রতি call-এর খরচ
    return (1.0 if success else 0.0) - cost * calls

print("OCR বইটি→বউটি:", ocr_reward("বইটি", "বউটি"))
print("OCR বইটি→বই:", ocr_reward("বইটি", "বই"))
print("math ঠিক+format:", math_reward("42", "42", True), "| ভুল+format:", math_reward("41", "42", True))
print("code ৫টার ৩টা পাস:", code_reward(3, 5))
print("robot এগোল:", robot_reward(5.0, 4.0, False), "| পিছোল:", round(robot_reward(4.0, 4.5, False), 1))
print("tool সফল ২ call:", round(tool_reward(True, 2), 1), "| সফল ৬ call:", round(tool_reward(True, 6), 1))
# output:
# OCR বইটি→বউটি: 0.75
# OCR বইটি→বই: 0.5
# math ঠিক+format: 1.1 | ভুল+format: 0.1
# code ৫টার ৩টা পাস: 0.6
# robot এগোল: 0.9 | পিছোল: -0.6
# tool সফল ২ call: 0.8 | সফল ৬ call: 0.4
```

সাবধান: OCR-এ অক্ষর গুনতে Unicode normalization (এখানে NFC) আগে করে নিতে হয়, নইলে একই বাংলা অক্ষর দুই রকম কোডে লেখা থাকলে ভুল গোনা হয়। এখানের সংখ্যাগুলো শুধু সূত্র বোঝানোর, কোনো পরীক্ষিত project recipe নয়।

## Task আর শেখার পথ মেলানো

Reward বানানো গেলেই RL সবচেয়ে ভালো পথ, এমন নয়। OCR-এ সঠিক লেখা (target) হাতে থাকলে SFT সরাসরি সহজ বিকল্প। Style-এ pair পাওয়া গেলে DPO চলে। RL বেশি কাজে লাগে যেখানে সঠিক উত্তর একটা নির্দিষ্ট লেখা নয়, কিন্তু উত্তর ভালো কি না মাপা যায় (math, code, tool-use, robotics)। বিস্তারিত সিদ্ধান্ত [Lecture 16](lecture-16-practical-and-method-selection.md)-এ।

## মনে রাখার সারকথা

- Reward-এর সূত্র কাজ থেকে আসে: কে যাচাই করে, কত অংশ নম্বর, কোন খরচ কাটা হবে।
- Sparse reward সহজ কিন্তু অনেক সময় সংকেত দেয় না; dense সংকেত দেয় কিন্তু ফাঁকির সুযোগ বাড়ায়।
- প্রতিটা reward-এর পাশে লিখে রাখো কোথায় ফাঁকি সম্ভব; পরের lecture ঠিক সেটা নিয়ে।

## নিজে করো

১. Reference `বইটি`, model লিখল `বইটি`। OCR reward কত?
২. ৮টা test-এর ৬টা পাস হলে code reward কত? সব-বা-কিছুই-না নিয়মে কত?
৩. Tool-use-এ সফল, ৪টা call, প্রতি call-এর খরচ ০.১৫। Reward কত?

<details><summary>উত্তর</summary>

১. CER 0, reward `1 − 0 = 1.0`।
২. `6/8 = 0.75`; সব-বা-কিছুই-না নিয়মে `0`, কারণ সব test পাস হয়নি।
৩. `1 − 0.15 × 4 = 1 − 0.6 = 0.4`।

</details>

## পরের পাঠ

কিছু কাজে সঠিক উত্তরের পরীক্ষক নেই, বরং বিশেষজ্ঞের বিচার লাগে। সেই সংবেদনশীল ক্ষেত্রে মূল্যায়ন কেমন: [Lecture 14 — Domain-expert উত্তরের মূল্যায়ন](lecture-14-domain-expert-answer-evaluation.md)।
