# Bridge 01 — একই তথ্য কম জায়গায় রাখা

> আগে যা জানা থাকলে ভালো: computer-এ সব তথ্য bit (0 বা 1) দিয়ে রাখা হয়, আর 8 bit = 1 byte। [Output score-এর bridge](../module-12-text-sequences-and-multimodal-models/bridge-01-output-scores-and-selection.md) পড়া থাকলে পরের lecture-এ সুবিধা হবে। এই পাঠ শেষে পারবে: "হুবহু ফেরত পাওয়া যায়" আর "কাছাকাছি ফেরত পাওয়া যায়", এই দুই রকম ছোট করার পার্থক্য বলতে।
> Map-এ অবস্থান: [Learning Map](../01-learning-map.md) → তথ্য সংরক্ষণের পদ্ধতি। এখানে model-এর হিসাব, loss বা update নেই।

## সমস্যাটা কী?

বড় model-এর file অনেক বড়। সেটা disk-এ রাখতে বা কাউকে পাঠাতে গেলে জায়গা আর সময় লাগে। তাই file ছোট করার দুটো আলাদা উপায় জানা দরকার। একটায় ছোট করার পরেও আসল তথ্য **হুবহু** ফেরত আসে। অন্যটায় ফেরত আসে শুধু **কাছাকাছি** মান। Model-এর কাজে দুটোর প্রভাব আলাদা, আর পরের lecture-এর quantization দ্বিতীয় ধরনের। তাই আগে প্রথমটা পরিষ্কার করে নিই।

## ধারণাটা সহজ ভাষায়

একই জিনিস বারবার থাকলে পুরোটা বারবার না লিখে "কতবার আছে" লেখা যায়। ধরো আসল data হলো ছয়টা A, পাঁচটা B, চারটা C:

```text
Original:      AAAAAABBBBBCCCC     (15টা অক্ষর)
Encoded:       A6B5C4              (6টা অক্ষর)
পড়ার নিয়ম:    একটা অক্ষর, তারপর সেটা কতবার
Decoded:       AAAAAABBBBBCCCC
```

Decode করলে প্রতিটা অক্ষর আসলের মতোই ফেরত আসে। এই ধরনকে বলে **lossless compression** (কিছু না হারানো সংক্ষেপণ)। এই কৌশলের নাম run-length encoding। ZIP-এর মতো সাধারণ tool-ও lossless পদ্ধতি ব্যবহার করে।

কিন্তু সব data এতে ছোট হয় না। একই নিয়মে `ABC` লিখলে হয় `A1B1C1`। 3টা অক্ষর থেকে 6টা হয়ে গেল। ভালো compressor এই ঝুঁকি সামলায়, কিন্তু **সব রকম data-কে সবসময় ছোট করা অসম্ভব**। কারণটা গোনা দিয়েই বোঝা যায়: n bit-এর সম্ভাব্য আলাদা বার্তা 2ⁿ টা, আর তার চেয়ে ছোট বার্তা আছে মাত্র 2ⁿ − 1 টা। প্রতিটা আলাদা আসলের জন্য আলাদা ছোট encoding লাগে, কিন্তু ছোট encoding কম পড়ে যায়।

## ছোট একটা উদাহরণ

নিচের কোড দুটো data encode করে, decode করে মিলিয়ে দেখে, আর গোনার হিসাবটাও ছাপে। (এখানে প্রতিটা অক্ষর 1 byte ধরা হয়েছে। এটা শেখার জন্য বানানো সরল format; বাস্তব file-এ header আর অন্য তথ্যও থাকে।)

```python
def encode(s):
    out, i = [], 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]:
            j += 1
        out.append(s[i] + str(j - i))      # অক্ষর + কতবার
        i = j
    return "".join(out)

def decode(e):
    return "".join(e[k] * int(e[k + 1]) for k in range(0, len(e), 2))

for original in ["AAAAAABBBBBCCCC", "ABC"]:
    e = encode(original)
    print(original, "->", e, "| size", len(original), "->", len(e), "| হুবহু ফেরত:", decode(e) == original)

for n in [2, 3, 8]:
    print(n, "bit-এর বার্তা:", 2 ** n, "| তার চেয়ে ছোট:", 2 ** n - 1)
# output:
# AAAAAABBBBBCCCC -> A6B5C4 | size 15 -> 6 | হুবহু ফেরত: True
# ABC -> A1B1C1 | size 3 -> 6 | হুবহু ফেরত: True
# 2 bit-এর বার্তা: 4 | তার চেয়ে ছোট: 3
# 3 bit-এর বার্তা: 8 | তার চেয়ে ছোট: 7
# 8 bit-এর বার্তা: 256 | তার চেয়ে ছোট: 255
```

## Model file-এর ক্ষেত্রে

Compressed checkpoint (শেখা মানগুলোর সংরক্ষিত file) disk-এ ছোট হতে পারে। কিন্তু model চালাতে হলে সাধারণত সেটা decode করে আসল weights হিসেবের উপযোগী আকারে memory-তে রাখতে হয়। তাই disk-এর file ছোট মানেই চালানোর সময় memory সমান অনুপাতে কমে, এমন নয়। আর lossless হওয়ায় decode করা weights আসলের সঙ্গে হুবহু এক, তাই model-এর ফলও বদলায় না।

## Quantization-এর সঙ্গে পার্থক্য

Quantization-এ প্রতিটা সংখ্যাকে সীমিত কয়েকটা মানের কোনো একটায় নামিয়ে রাখা হয়। যেমন `0.237` রাখা হলো `0.2` হিসেবে।

```text
আসল:     [0.237, -0.512, 0.049]
ধরা যাক রাখা হলো এক দশমিক ঘরে: [0.2, -0.5, 0.0]
```

(এটা শুধু ধারণা বোঝানোর rounding; বাস্তব quantization-এর নিয়ম পরের lecture-এ।) এখান থেকে `0.237` আর ফেরত আসে না। এটা **lossy** (কিছু হারানো) পদ্ধতি।

| পদ্ধতি | কী রাখা হয় | ফেরত কী আসে |
|---|---|---|
| Lossless compression | মূল তথ্যের সংক্ষিপ্ত লেখা | আসল bytes, হুবহু |
| Lossy quantization | সীমিত কয়েকটা মান | কাছাকাছি মান, আসল নয় |

একটা quantized file-কে আবার lossless পদ্ধতিতে ছোট করা যায়। তখন decode করলে quantized মানই ফেরত আসে; quantization-এর সময় যা হারিয়েছিল তা ফেরত আসে না।

## মনে রাখার সারকথা

- Lossless compression-এ decode করলে আসল তথ্য হুবহু ফেরত আসে; কিন্তু সব data এতে ছোট হয় না।
- Disk-এ file ছোট হলেও চালানোর সময় memory সমান কমবে, এমন নিশ্চয়তা নেই।
- Quantization lossy: আকার কমে, কিন্তু মান কাছাকাছি হয়, হুবহু নয়।

## নিজে করো

১. `AAABBBBBBC`-কে এই lecture-এর নিয়মে encode করো। আকার কত থেকে কত হলো?
২. `ABAB`-কে একই নিয়মে encode করলে আকার বাড়ে না কমে?
৩. কোনটা lossless, কোনটা lossy? (ক) weights file ZIP করা (খ) প্রতিটা weight এক দশমিক ঘরে rounding করে রাখা।

<details><summary>উত্তর</summary>

১. তিনটা A, ছয়টা B, একটা C, তাই `A3B6C1`। আকার 10 থেকে 6।
২. `ABAB` → `A1B1A1B1`। আকার 4 থেকে 8, অর্থাৎ বাড়ে।
৩. (ক) lossless, কারণ unzip করলে আসল file ফেরত আসে। (খ) lossy, কারণ rounding-এর পরে আসল মান আর পাওয়া যায় না।

</details>

## পরের পাঠ

এবার কম bit-এ weights রাখলে কী ঘটে, আর তার ফল ঠিক থাকবে কি না কীভাবে বোঝা যায়: [Lecture 05 — Quantization](lecture-05-quantization-and-qlora.md)। তার আগে LoRA-র ধারণা শেখা হবে [Lecture 03](lecture-03-lora-forward-pass-and-activation.md) থেকে। পড়ার ক্রম [README](README.md)-তে আছে।

Reference: [DEFLATE lossless format specification](https://www.rfc-editor.org/rfc/rfc1951)।
