# Lecture 07 — Shape ও Parameter Count

> আগে যা জানা থাকলে ভালো: [Lecture 06-এর `2 → 2 → 1` network](lecture-06-forward-pass.md)। এই lecture শেষে পারবে: একটা dense network-এ parameter কয়টা তা এক সূত্রে বের করতে, আর দুটো layer জোড়া লাগবে কি না তা shape দেখে বলতে।

## সমস্যাটা কী?

Network বানানোর সময় দুটো প্রশ্ন বারবার আসে। প্রথমত, এক layer-এর output পরের layer-এর input-এর সঙ্গে মিলছে তো? না মিললে code চলবেই না। দ্বিতীয়ত, model-টা কত বড়? Model-এর আকার সাধারণত মাপা হয় তার parameter কয়টা, তা দিয়ে। এই দুটোর উত্তর আসে shape আর count থেকে।

## ধারণা ১: Parameter count-এর একটা সূত্র

একটা dense unit-এ যতগুলো input, ততগুলো weight, আর একটা bias ([Lecture 03](lecture-03-one-neuron.md))। একটা layer-এ অনেক unit থাকে। তাই:

**একটা dense layer-এর parameter = (input সংখ্যা + 1) × unit সংখ্যা**

`+1` হলো bias। পুরো network-এর count হলো প্রতিটা layer-এর count-এর যোগফল।

### উদাহরণ ১: `2 → 2 → 1`

| Layer | হিসাব | Parameter |
|---|---|---|
| Hidden: 2 input, 2 unit | `(2 + 1) × 2` | 6 |
| Output: 2 input, 1 unit | `(2 + 1) × 1` | 3 |
| মোট | `6 + 3` | **9** |

Lecture 06-এর A, B, C তিন unit-এর weights আর bias গুনলেও 9 হয়: A-তে 3, B-তে 3, C-তে 3।

### উদাহরণ ২: `3 → 4 → 1` (বাড়ির তিনটা তথ্য থেকে দাম)

| Layer | হিসাব | Parameter |
|---|---|---|
| Hidden: 3 input, 4 unit | `(3 + 1) × 4` | 16 |
| Output: 4 input, 1 unit | `(4 + 1) × 1` | 5 |
| মোট | `16 + 5` | **21** |

লক্ষ্য করো, মোট unit 5টা (hidden-এ 4 আর output-এ 1), কিন্তু parameter 21টা। দুটো এক জিনিস নয়। Input, intermediate মান আর prediction parameter নয়; তাই count-এ ঢোকে না।

```python
def dense_params(n_inputs, n_units):
    # প্রতি unit-এ n_inputs টা weight + 1টা bias
    return (n_inputs + 1) * n_units

def network_params(sizes):
    total = 0
    for i in range(len(sizes) - 1):
        total += dense_params(sizes[i], sizes[i + 1])
    return total

print(network_params([2, 2, 1]))
print(network_params([3, 4, 1]))
# output:
# 9
# 21
```

সাবধান: এই সূত্র শুধু dense layer-এর জন্য। অন্য ধরনের layer-এ (যেমন ছবির জন্য, Module 11) গণনা আলাদা।

## ধারণা ২: Shape

**Shape** হলো সংখ্যাগুলো কয় সারি আর কয় কলামে সাজানো। একটা উদাহরণের input `[2, 1]` কে ধরা হয় `1×2` (১ সারি, ২ কলাম)।

Layer-এর weights সাজানো হয় একটা table-এ: **প্রতি সারি এক input-এর জন্য, প্রতি কলাম এক unit-এর জন্য।** তাই shape হয় `input সংখ্যা × unit সংখ্যা`।

Lecture 06-এর network-এ:

| জিনিস | Shape | মন্তব্য |
|---|---|---|
| Input | `1×2` | `[2, 1]` |
| Hidden weights | `2×2` | কলাম 1 = A-র weights `[1, 1]`, কলাম 2 = B-র `[−1, 1]` |
| Hidden output | `1×2` | `[3, 0]` |
| Output weights | `2×1` | C-র weights `[2, 1]` |
| Prediction | `1×1` | `7` |

গুণের নিয়ম: **`(a×b)` কে `(b×c)` দিয়ে গুণ করলে `(a×c)` হয়। মাঝের দুটো সংখ্যা সমান হতেই হবে।**

```text
(1×2) · (2×2) = (1×2)     ← input থেকে hidden-এর ফল
(1×2) · (2×1) = (1×1)     ← hidden থেকে prediction
```

প্রতিবার মাঝের সংখ্যা মিলেছে (2 আর 2, 2 আর 2)। যে layer-এর output-এ 2টা মান, পরের layer-কে ঠিক 2টা input নেওয়ার মতো করে বানাতে হয়। এই মিল ভাঙলেই shape error আসে।

সাবধান: কিছু বই বা library weights-এর table উল্টো করে (transposed) লেখে। তখন shape `unit × input` হয়। কিন্তু মিলের নিয়ম একই থাকে।

## মনে রাখার সারকথা

- Dense layer-এর parameter = `(input + 1) × unit`; network-এর count = সব layer-এর যোগফল।
- Weights-এর shape = `input সংখ্যা × unit সংখ্যা`; দুটো layer জোড়া লাগতে মাঝের সংখ্যা মিলতে হবে।
- নতুন training data এলে parameter-এর মান বদলায়, count বদলায় না। Unit বাড়ালে count বাড়ে।

## নিজে করো

১. 4টা input থেকে সরাসরি 1টা unit (কোনো hidden layer নেই): parameter কয়টা?
২. `4 → 3 → 2` network-এ মোট parameter কয়টা?
৩. Hidden weights-এর shape `3×4`। পরের layer-এর weights `5×1` হলে কি জোড়া লাগবে?

<details><summary>উত্তর</summary>

১. `(4 + 1) × 1 = 5`।
২. Hidden: `(4 + 1) × 3 = 15`। Output: `(3 + 1) × 2 = 8`। মোট `15 + 8 = 23`।
৩. না। Hidden output-এ 4টা মান (`3×4`-এর কলাম সংখ্যা), কিন্তু পরের layer 5টা input চায়। `4 ≠ 5`। পরের weights `4×?` আকারের হতে হবে, যেমন `4×1`।

</details>

## পরের পাঠ

Network-এর গঠন (architecture), তার ভেতরের মান (parameters) আর শেখানোর কাজ (training): এই তিনটা আলাদা করে চেনা। [Lecture 08](lecture-08-architecture-vs-training.md)।
