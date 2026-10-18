# Lecture 02 — Encoding ও Scaling: data-কে model-এর উপযোগী সংখ্যায় আনা

> আগে যা জানা থাকলে ভালো: [Dataset পরিদর্শন](lecture-01-inspecting-a-dataset.md) (numeric ও categorical column)। এই lecture শেষে পারবে: এলাকার নামকে one-hot সংখ্যায় বদলাতে, আর একটা numeric column-কে min-max বা standardization দিয়ে ছোট পরিসরে আনতে।

## সমস্যাটা কী?

Model-এর ভেতরে শুধু গুণ আর যোগ চলে। `"Mirpur"` লেখাটাকে `w × x`-এ বসানো যায় না। আবার আয়তন (800 থেকে 1500) আর রুমের সংখ্যা (2 থেকে 4) একই model-এ দিলে বড় সংখ্যার column প্রায় সবটা প্রভাব নিয়ে নেয়, আর training ধীর বা অস্থির হয়ে যায়। তাই train-এর আগে data-কে সংখ্যায় আর কাছাকাছি মাপে আনতে হয়।

## ধারণাটা সহজ ভাষায়

**Encoding** মানে লেখা বা ধরনকে সংখ্যায় বদলানো।

প্রথমে মনে হতে পারে: Mirpur = 1, Dhanmondi = 2, Uttara = 3 লিখে দিলেই হয়। কিন্তু তাতে model ধরে নেবে Uttara "বড়", Mirpur "ছোট", আর Dhanmondi ঠিক মাঝখানে। এলাকার মধ্যে এমন কোনো ক্রম নেই। তাই সাধারণ উপায় হলো **one-hot encoding**: প্রতিটা ধরনের জন্য একটা করে 0/1 column। বাড়িটা যে এলাকার, শুধু সেই column-এ `1`, বাকিতে `0`।

**Scaling** মানে একটা numeric column-এর মানগুলো একটা ছোট পরিসরে আনা। দুটো প্রচলিত উপায়:

- **Min-max scaling:** সবচেয়ে ছোট মান হবে 0, সবচেয়ে বড় মান 1, বাকিগুলো তার মাঝে।
  `নতুন মান = (x − min) / (max − min)`
- **Standardization:** মানগুলোর গড় হবে 0, ছড়ানো (standard deviation) হবে 1।
  `নতুন মান = (x − mean) / std`
  **Standard deviation (std)** হলো মানগুলো গড় থেকে গড়ে কতটা দূরে থাকে তার মাপ।

Scaling কেন লাগে, তা [Module 02-এর gradient-এর সূত্র](../module-02-linear-regression/lecture-03-gradient-descent-training.md)-এ দেখা যায়: `g_w`-এর হিসাবে `x` গুণ হয়ে আসে। `x` বড় হলে gradient বিশাল হয়, আর এক ধাপেই `w` অনেক দূরে ছিটকে যায়।

## ছোট একটা উদাহরণ

৫টা বাড়ির আয়তন ও এলাকা:

| area | locality |
|---|---|
| 800 | Mirpur |
| 1000 | Dhanmondi |
| 900 | Uttara |
| 1100 | Uttara |
| 1000 | Mirpur |

**One-hot।** এলাকা তিনটা (বর্ণক্রমে): Dhanmondi, Mirpur, Uttara। প্রতিটা বাড়ির জন্য তিন ঘরের একটা তালিকা:

- Mirpur → `[0, 1, 0]`
- Dhanmondi → `[1, 0, 0]`
- Uttara → `[0, 0, 1]`

**Min-max।** min = 800, max = 1100, তাই `max − min = 300`। ধাপে ধাপে:

- 800 → (800 − 800) / 300 = **0**
- 1000 → (1000 − 800) / 300 = **0.667**
- 900 → 100 / 300 = **0.333**
- 1100 → 300 / 300 = **1**

**Standardization।** mean = (800 + 1000 + 900 + 1100 + 1000) / 5 = 960। গড় থেকে দূরত্ব: −160, 40, −60, 140, 40। এগুলোর বর্গের গড় = (25600 + 1600 + 3600 + 19600 + 1600) / 5 = 10400, তাই std = √10400 = **101.98**। যেমন 800 → (800 − 960) / 101.98 = **−1.569**।

**Scaling-এর লাভ।** তিনটা বাড়ি: আয়তন `[800, 1000, 1200]`, দাম `[40, 50, 60]`। শুরুতে `w = 0`, `b = 0`, learning rate `0.1`। Module 02-এর সূত্রে `g_w`:

- আসল আয়তনে: g_w = (2/3) × (−40×800 − 50×1000 − 60×1200) = **−102666.67**, তাই নতুন `w` = 0 − 0.1 × (−102666.67) = **10266.67**। অথচ দাম আয়তনের চেয়ে অনেক ছোট; `w`-এর ঠিক মান 0.05-এর কাছাকাছি হওয়ার কথা। এক ধাপেই model ছিটকে গেছে।
- Min-max করা আয়তনে `[0, 0.5, 1]`: g_w = **−56.67**, নতুন `w` = **5.67**। এখনো ঠিক মান নয়, কিন্তু ধাপটা সামলানো যায়।

## Formula / কোড

```python
from statistics import mean, pstdev

area = [800, 1000, 900, 1100, 1000]
locality = ["Mirpur", "Dhanmondi", "Uttara", "Uttara", "Mirpur"]

# one-hot encoding: one 0/1 column per category
cats = sorted(set(locality))
print(cats)
for loc in locality:
    print(loc, [1 if loc == c else 0 for c in cats])

# min-max scaling: (x - min) / (max - min)
lo, hi = min(area), max(area)
print("min-max :", [round((a - lo) / (hi - lo), 3) for a in area])

# standardization: (x - mean) / std
m, s = mean(area), pstdev(area)
print("mean =", m, "std =", round(s, 3))
print("standard:", [round((a - m) / s, 3) for a in area])
```

```text
# output:
# ['Dhanmondi', 'Mirpur', 'Uttara']
# Mirpur [0, 1, 0]
# Dhanmondi [1, 0, 0]
# Uttara [0, 0, 1]
# Uttara [0, 0, 1]
# Mirpur [0, 1, 0]
# min-max : [0.0, 0.667, 0.333, 1.0, 0.667]
# mean = 960 std = 101.98
# standard: [-1.569, 0.392, -0.588, 1.373, 0.392]
```

`pstdev` মানে সব মানের গড় বর্গ-দূরত্ব ধরে std (উপরের হাতের হিসাবের মতোই)।

সাবধান: `min`, `max`, `mean`, `std` কোন data থেকে নিচ্ছ, সেটা খুব গুরুত্বপূর্ণ। এখানে ৫টা বাড়ি থেকেই নিয়েছি শুধু অনুশীলনের জন্য। সঠিক নিয়ম [Lecture 04](lecture-04-data-leakage.md)-এ আছে।

## মনে রাখার সারকথা

- Categorical column-কে one-hot করো (ক্রম নেই এমন ধরনে 1, 2, 3 বসিয়ো না); numeric column-কে scale করো।
- Min-max মান আনে 0 থেকে 1-এ; standardization মান আনে গড় 0, std 1-এ।
- Scaling না করলে বড় মাপের column-এর কারণে gradient বিশাল হয়ে training অস্থির হতে পারে।

## নিজে করো

১. এলাকা এখন চারটা: Dhanmondi, Gulshan, Mirpur, Uttara (বর্ণক্রমে)। Gulshan-এর বাড়ির one-hot তালিকা কী?

২. Area-র min 800, max 1200। আয়তন 1100-এর min-max মান কত?

৩. মান `[2, 4, 6]`। Standardization করলে `6`-এর নতুন মান কত? (std-এর জন্য `pstdev` সূত্র ধরো।)

<details><summary>উত্তর</summary>

১. বর্ণক্রমে column: Dhanmondi, Gulshan, Mirpur, Uttara। Gulshan দ্বিতীয়, তাই **`[0, 1, 0, 0]`**।

২. (1100 − 800) / (1200 − 800) = 300 / 400 = **0.75**।

৩. mean = 4। দূরত্ব: −2, 0, 2। বর্গের গড় = (4 + 0 + 4) / 3 = 8/3, std = √(8/3) = 1.633। `6` → (6 − 4) / 1.633 = **1.225**।

</details>

## পরের পাঠ

Data এখন সংখ্যায় ও ঠিক মাপে। কিন্তু model ভালো হয়েছে কি না তা কোন data দিয়ে দেখব? [পরের lecture](lecture-03-train-validation-test-split.md)-এ data-কে train, validation ও test-এ ভাগ করা শিখব।
