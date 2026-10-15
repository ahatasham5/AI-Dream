# Lecture 01 — Dataset পরিদর্শন: train করার আগে data দেখে নেওয়া

> আগে যা জানা থাকলে ভালো: feature ও target কী, তা [Module 01 — ML-এর ধরন ও Terminology](../module-01-ml-fundamentals-and-math-basics/lecture-02-types-and-terminology.md)-এ আছে। এই lecture শেষে পারবে: একটা ছোট table দেখে missing value ও অসম্ভব মান খুঁজে বের করতে, আর কী করবে তা ঠিক করতে।

## সমস্যাটা কী?

ধরো কেউ তোমাকে ৮টা বাড়ির তথ্যের একটা table দিয়ে বলল, "দাম predict করার model বানাও।" তুমি সঙ্গে সঙ্গে train শুরু করলে। কিন্তু table-এর একটা বাড়ির আয়তন লেখা `0`, একটার বয়স ফাঁকা, আর একটার দামই নেই। এসব না দেখে train করলে model ভুল তথ্য থেকে শিখবে, আর তুমি বুঝতেও পারবে না ভুলটা কোথায়। তাই train-এর আগে data একবার দেখে নিতে হয়। ML engineer-রা সময়ের বড় একটা অংশ এই কাজেই দেন।

## ধারণাটা সহজ ভাষায়

**Dataset** হলো একটা table। প্রতিটা **row** একটা উদাহরণ (এখানে একটা বাড়ি), আর প্রতিটা **column** একটা তথ্য।

- **Feature** — যা দেখে অনুমান করা হবে (আয়তন, রুম, বয়স, এলাকা)।
- **Target** — যা অনুমান করতে চাই (দাম)।
- `id`-র মতো column শুধু row চেনার নাম। বাড়ির দাম সম্পর্কে এটা কিছু বলে না, তাই এটা feature নয়।

Column-এর ধরনও দেখতে হয়। সংখ্যার column (আয়তন) হলো **numeric**। নাম বা ধরনের column (এলাকা: Mirpur, Uttara) হলো **categorical**। ধরন আলাদা হলে পরের প্রস্তুতিও আলাদা; সেটা [পরের lecture](lecture-02-encoding-and-scaling.md)-এ আসবে।

পরিদর্শনে তিনটা জিনিস খুঁজি:

1. **Missing value** — ঘর ফাঁকা।
2. **অসম্ভব মান** — আয়তন `0`, বয়স `-3`। এগুলো সম্ভবত টাইপের ভুল বা সংগ্রহের ভুল।
3. **Column-এর পরিসর** — প্রতিটা numeric column-এর ছোটতম (min) আর বড়তম (max) মান। অদ্ভুত মান সহজেই ধরা পড়ে।

Missing value পেলে সাধারণত তিনটা পথ আছে:

- **Row বাদ দেওয়া।** সহজ, কিন্তু data কমে যায়।
- **মান ভরা (fill বা impute)।** বাকি মানগুলোর **median** দিয়ে ভরা সবচেয়ে সাধারণ। Median হলো মানগুলো ছোট থেকে বড় সাজালে ঠিক মাঝখানের মান। যেমন `5, 7, 8, 10, 10, 12`-এ মাঝখানে `8` আর `10`, তাই median `9`। একটা অস্বাভাবিক বড় মান থাকলে mean অনেক নড়ে, median প্রায় নড়ে না।
- **Target-ই missing হলে row বাদ।** কারণ model-কে শেখানোর মতো সঠিক উত্তরই নেই।

## ছোট একটা উদাহরণ

৮টা বাড়ি। দাম লাখ টাকায়।

| id | area (বর্গফুট) | rooms | age (বছর) | locality | price |
|---|---|---|---|---|---|
| 1 | 800 | 2 | 5 | Mirpur | 40 |
| 2 | 1000 | 3 | 10 | Dhanmondi | 70 |
| 3 | 1200 | 3 | **ফাঁকা** | Mirpur | 55 |
| 4 | 900 | 2 | 8 | Uttara | 45 |
| 5 | **0** | 3 | 7 | Uttara | 48 |
| 6 | 1500 | 4 | 3 | Dhanmondi | **ফাঁকা** |
| 7 | 1100 | 3 | 12 | Uttara | 50 |
| 8 | 1000 | 3 | 10 | Mirpur | 52 |

চোখে দেখেই তিনটা সমস্যা পাওয়া গেল। এবার সিদ্ধান্ত নিই:

1. **id 6:** target (price) নেই। এই row বাদ। বাকি থাকে ৭টা row।
2. **id 5:** আয়তন `0` হতে পারে না। একে missing ধরে নিই।
3. **id 3 ও id 5:** ফাঁকা age আর area-র জন্য বাকি মানগুলোর median বসাই।
   - Area-র জানা মান (800, 900, 1000, 1000, 1100, 1200) → median **1000**।
   - Age-এর জানা মান (5, 7, 8, 10, 10, 12) → median **9**।

## Formula / কোড

একই কাজ ছোট Python code-এ। এখানে প্রতিটা column-এর সারাংশ দেখে তারপর পরিষ্কার করা হয়েছে।

```python
from statistics import median

cols = ["id", "area", "rooms", "age", "locality", "price"]
rows = [
    (1, 800, 2, 5, "Mirpur", 40),
    (2, 1000, 3, 10, "Dhanmondi", 70),
    (3, 1200, 3, None, "Mirpur", 55),
    (4, 900, 2, 8, "Uttara", 45),
    (5, 0, 3, 7, "Uttara", 48),
    (6, 1500, 4, 3, "Dhanmondi", None),
    (7, 1100, 3, 12, "Uttara", 50),
    (8, 1000, 3, 10, "Mirpur", 52),
]

for j, name in enumerate(cols):
    vals = [r[j] for r in rows]
    known = [v for v in vals if v is not None]
    missing = len(vals) - len(known)
    if isinstance(known[0], str):
        print(name, "missing:", missing, "values:", sorted(set(known)))
    else:
        print(name, "missing:", missing, "min:", min(known), "max:", max(known))

# 1) target missing -> drop the row
rows = [r for r in rows if r[5] is not None]
# 2) area == 0 is impossible -> treat as missing
rows = [(i, None if a == 0 else a, rm, ag, loc, p) for i, a, rm, ag, loc, p in rows]
# 3) fill missing area/age with the median of known values
for j in (1, 3):
    med = median(r[j] for r in rows if r[j] is not None)
    print(cols[j], "median =", med)
    rows = [tuple(med if (k == j and v is None) else v for k, v in enumerate(r)) for r in rows]
print("after cleaning:", len(rows), "rows")
```

```text
# output:
# id missing: 0 min: 1 max: 8
# area missing: 0 min: 0 max: 1500
# rooms missing: 0 min: 2 max: 4
# age missing: 1 min: 3 max: 12
# locality missing: 0 values: ['Dhanmondi', 'Mirpur', 'Uttara']
# price missing: 1 min: 40 max: 70
# area median = 1000.0
# age median = 9.0
# after cleaning: 7 rows
```

সারাংশেই ধরা পড়ল: `area`-র min `0` (সন্দেহজনক), `age` ও `price`-এ একটা করে ফাঁকা।

সাবধান: এখানে সব row থেকে median নিয়েছি, শুধু হিসাব দেখানোর জন্য। আসল কাজে median শুধু training data থেকে নিতে হয়। কেন, তা [Lecture 04 — Data Leakage](lecture-04-data-leakage.md)-এ দেখবে।

## মনে রাখার সারকথা

- Train করার আগে প্রতিটা column-এর missing value, অসম্ভব মান আর min/max দেখে নাও।
- Target ফাঁকা হলে row বাদ; feature ফাঁকা হলে row বাদ অথবা median দিয়ে ভরা।
- `id`-র মতো column feature নয়; আর numeric ও categorical column-এর প্রস্তুতি আলাদা।

## নিজে করো

১. একটা table-এ `id` column আছে (১ থেকে ৮)। এটা কি feature হিসেবে দেওয়া উচিত? কেন?

২. Age column-এর মান `4, 6, ফাঁকা, 10, 20`। ফাঁকা ঘরে median বসালে কত বসবে?

৩. ১০টা বাড়ির table-এ ২টার price ফাঁকা, ১টার area `0`। Price ফাঁকা row বাদ দিলে কয়টা row থাকে? Area `0` নিয়ে কী করবে?

<details><summary>উত্তর</summary>

১. না। `id` শুধু row চেনার নাম। এর সঙ্গে দামের কোনো সত্যিকারের সম্পর্ক নেই। দিলে model কাকতালীয় নিয়ম শিখে ফেলতে পারে।

২. জানা মান সাজালে `4, 6, 10, 20`। মাঝখানে `6` আর `10`, তাই median = (6 + 10) / 2 = **8**। (Mean হতো 10, `20` মানটা সেটাকে টেনে বাড়িয়েছে।)

৩. ১০ − ২ = **৮টা** row থাকে। Area `0` অসম্ভব, তাই একে missing ধরে বাকি area-র median দিয়ে ভরবে (অথবা সেই row-ও বাদ দেবে)।

</details>

## পরের পাঠ

Data এখন পরিষ্কার। কিন্তু model শুধু সংখ্যা বোঝে, আর সংখ্যাগুলো কাছাকাছি মাপের হলে শেখা সহজ হয়। [পরের lecture](lecture-02-encoding-and-scaling.md)-এ এলাকার নামকে সংখ্যায় আর বড়-ছোট মাপকে সমান করা শিখব।
