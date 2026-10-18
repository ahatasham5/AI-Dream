# Lecture 02 — Image Shape ও Tensor

> আগে যা জানা থাকলে ভালো: [Pixel ও channel](lecture-01-pixel-and-channel.md) এবং [dense layer-এর shape ও parameter count](../module-09-model-architecture/lecture-07-shapes-and-parameter-count.md)। এই lecture শেষে পারবে: একটা ছবি বা ছবির দলের shape লিখতে, আর ছবিকে সরাসরি dense layer-এ দিলে কী সমস্যা হয় তা বলতে।

## সমস্যাটা কী?

Module 09-এ দেখেছ, একটা layer-এর input কয়টা সংখ্যা, সেটা আগে থেকে জানা লাগে। না হলে weight-এর সংখ্যাই ঠিক করা যায় না। ছবির বেলায় প্রশ্ন হলো: "এই ছবির আকার কত?" — এটা এক কথায়, সবাই একই নিয়মে লেখার মতো করে বলার উপায় দরকার। এই উপায়ের নাম **shape**।

## ধারণাটা সহজ ভাষায়

একটা ছবির তিনটা মাপ:

- **H (height)** — কয়টা সারি
- **W (width)** — কয়টা কলাম
- **C (channel)** — প্রতি pixel-এ কয়টা সংখ্যা (সাদা-কালোতে ১, রঙিনে ৩)

সাদা-কালো ছবির shape `(H, W)` বা `(H, W, 1)`। রঙিন ছবির shape `(H, W, 3)`। এই ক্রম (channel শেষে) বেশি চোখে পড়ে। কিছু library `(C, H, W)` ক্রমে রাখে — সংখ্যা একই, শুধু সাজানোর ক্রম আলাদা।

মডেল একবারে একটা ছবি না নিয়ে অনেকগুলো একসঙ্গে নেয়, কারণ তাতে কাজ দ্রুত হয়। এই ছবির দলকে বলে **batch**। তখন সামনে আরেকটা মাপ যোগ হয়: `(N, H, W, C)`, যেখানে `N` হলো কয়টা ছবি।

**Tensor** হলো যেকোনো মাপের সংখ্যার ছক:

| নাম | কয় মাপ | উদাহরণ |
|---|---|---|
| vector | ১ | `[2, 1]` |
| matrix | ২ | সাদা-কালো ছবি `(H, W)` |
| tensor | ৩ বা বেশি | রঙিন ছবি `(H, W, C)`, batch `(N, H, W, C)` |

নতুন কোনো জাদু নেই — এটা সেই nested list-ই, শুধু বেশি স্তরের।

## ছোট একটা উদাহরণ

একটা ছোট `shape` ফাংশন nested list-এর ভেতরে ঢুকে প্রতি স্তরের দৈর্ঘ্য গুনে দেয়।

```python
def shape(x):
    s = []
    while isinstance(x, list):
        s.append(len(x))
        x = x[0]
    return tuple(s)

gray = [[0, 0, 9, 9] for _ in range(4)]            # H=4, W=4
rgb = [[[10 * r + c, 100 + c, 200 + r] for c in range(3)] for r in range(2)]  # H=2, W=3, C=3
batch = [rgb, rgb]                                  # N=2
print("gray :", shape(gray))
print("rgb  :", shape(rgb))
print("batch:", shape(batch))

# channel-last (H,W,C) -> channel-first (C,H,W): same numbers, new order
chw = [[[px[c] for px in row] for row in rgb] for c in range(3)]
print("chw  :", shape(chw))
print("pixel (row 1, col 2):", rgb[1][2], "->", [chw[c][1][2] for c in range(3)])
```

```text
# output:
gray : (4, 4)
rgb  : (2, 3, 3)
batch: (2, 2, 3, 3)
chw  : (3, 2, 3)
pixel (row 1, col 2): [12, 102, 201] -> [12, 102, 201]
```

- `rgb`-এর shape `(2, 3, 3)`: ২ সারি, ৩ কলাম, ৩ channel — মোট `2 × 3 × 3 = 18` সংখ্যা।
- `batch`-এ দুটো ছবি, shape `(2, 2, 3, 3)` — মোট ৩৬ সংখ্যা।
- `chw`-এ সংখ্যাগুলো একই; শুধু ক্রম বদলেছে। একই pixel দুই ক্রমেই `[12, 102, 201]` পাওয়া গেছে।

## ছবিকে সরাসরি Dense Layer-এ দিলে

Module 09-এর dense layer একটা vector নেয়। ছবি দিতে হলে সব pixel সারি ধরে ধরে লম্বা এক লাইনে সাজাতে হয় — একে **flatten** বলে। তারপর parameter count-এর নিয়ম (`(input + 1) × unit`) বসানো যায়।

```python
def dense_params(n_in, n_out):
    return (n_in + 1) * n_out

for h, w, c in [(4, 4, 1), (224, 224, 3)]:
    n = h * w * c
    print((h, w, c), "flatten:", n, "dense 100 units:", dense_params(n, 100))
```

```text
# output:
(4, 4, 1) flatten: 16 dense 100 units: 1700
(224, 224, 3) flatten: 150528 dense 100 units: 15052900
```

ছোট ৪×৪ ছবিতে ১৭০০ parameter চলে। কিন্তু সাধারণ আকারের ২২৪×২২৪ রঙিন ছবিতে শুধু ১০০ unit-এর এক layer-ই দেড় কোটির বেশি parameter চায়। আরেকটা ক্ষতি আছে: flatten করলে কোন pixel কার পাশে ছিল, সেই তথ্য আর সোজাসুজি থাকে না। এই দুই সমস্যার সমাধান পরের lecture-এর বিষয়।

## মনে রাখার সারকথা

- ছবির shape: `(H, W, C)`; অনেক ছবির দল (batch) হলে `(N, H, W, C)`।
- Tensor মানে শুধু বেশি মাপের nested list; channel-first আর channel-last-এ সংখ্যা একই, ক্রম আলাদা।
- Flatten করে dense layer-এ দিলে parameter বিস্ফোরিত হয় এবং pixel-এর পাশাপাশি থাকার তথ্য হারায়।

## নিজে করো

১. ৩২×৩২ রঙিন ছবির ৮টার একটা batch (channel-last)-এর shape কী? মোট কয়টা সংখ্যা?
২. ২৮×২৮ সাদা-কালো ছবি flatten করলে কয়টা input? সেটা ১০ unit-এর dense layer-এ দিলে parameter কত?
৩. `(H=5, W=7, C=3)` ছবিকে channel-first করলে shape কী?

<details><summary>উত্তর</summary>

১. shape `(8, 32, 32, 3)`; মোট `8 × 32 × 32 × 3 = 24576` সংখ্যা।
২. flatten করলে `28 × 28 = 784` input। parameter `(784 + 1) × 10 = 7850`।
৩. `(3, 5, 7)`।

</details>

## পরের পাঠ

**কোথায় কাজে লাগবে:** Module 12-এ text-এর shape হবে `(token-এর সংখ্যা, vector-এর দৈর্ঘ্য)`; ছবি ও লেখা মেলানোর সময় দুই পক্ষের shape মেলাতে এই ভাষাই লাগবে। এখন flatten-এর দুই সমস্যার সমাধান দেখো: [Lecture 03 — Local pattern ও convolution](lecture-03-local-pattern-and-convolution.md)।
