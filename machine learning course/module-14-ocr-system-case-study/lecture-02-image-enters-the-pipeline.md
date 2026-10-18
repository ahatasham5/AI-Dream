# Lecture 02 — ছবি Pipeline-এ ঢোকে: Pixel থেকে Image Token

> আগে যা জানা থাকলে ভালো: [Resize ও preprocessing](../module-11-image-representation-and-vision/lecture-07-resize-and-preprocessing.md) আর [Patch ও patch embedding](../module-11-image-representation-and-vision/lecture-05-patches-and-patch-embedding.md)। এই lecture শেষে পারবে: একটা ছবির মাপ থেকে model কয়টা image token পাবে তা বের করতে, আর বলতে কেন training ও inference-এ ছবি একই নিয়মে তৈরি হতে হবে।
> তথ্যের উৎস: `ocr-benchmark/web_for_data/backend/app/services/_scan_common.py` (`crop_page`, `enhance_page`, `normalize_illumination`), `ocr-benchmark/web_for_data/backend/app/services/page_scanner.py`, `ocr-benchmark/surya_finetune/train_lora.py` (`--max_pixels_per_image`), `ocr-benchmark/as_sunnah_ocr_1/docs/MODEL_ARCHITECTURE.md` (৪ নং অংশ), `ocr-benchmark/docs/HISTORY_bn.md` (v19 production অংশ)। Model-এর processor-এর নিয়ম base model-এর `preprocessor_config.json` ও transformers-এর `smart_resize` code পড়ে নিয়েছি।

## সমস্যাটা কী?

ফোনে তোলা পাতার ছবি কাত থাকে, এক কোণে ছায়া পড়ে, আর মাপে বিশাল হয়: যেমন 4000×2789 pixel। এই ছবি সরাসরি model-কে দিলে দুটো অসুবিধা। প্রথমত ছায়া আর কাতের কারণে অক্ষর ভুল পড়া হয়। দ্বিতীয়ত ছবি যত বড়, model-এর কাছে পৌঁছানো টুকরোর সংখ্যা তত বেশি, ফলে সময় আর memory বাড়ে।

তাই ছবি দুই দফায় তৈরি হয়: আগে project-এর নিজের code পাতা পরিষ্কার করে, তারপর model-এর processor ছবিকে নির্দিষ্ট মাপে এনে টুকরো করে।

## ধারণাটা সহজ ভাষায়

**দফা ১ — পাতা পরিষ্কার (project-এর code):**

- পাতার কিনারা খুঁজে কেটে নেওয়া ও সোজা করা (`crop_page`)।
- ধূসর করা, তারপর ছায়া সমান করা, তারপর contrast বাড়ানো (`enhance_page`)।
- JPEG (quality 92) হিসেবে রাখা।

ছায়া সমান করার ধারণা সহজ: প্রতিটা pixel-কে তার আশপাশের কাগজের উজ্জ্বলতা দিয়ে ভাগ করা। আশপাশের উজ্জ্বলতা বের হয় ছবিকে খুব ঝাপসা করে (`normalize_illumination`)।

**দফা ২ — model-এর processor:**

1. ছবির উচ্চতা ও প্রস্থ **৩২-এর গুণিতকে** আনা, আর মোট pixel একটা সীমার মধ্যে রাখা।
2. প্রতিটা pixel-এর মান `(px/255 − 0.5)/0.5` করে −1 থেকে 1-এর মধ্যে আনা।
3. ছবিকে **16×16 pixel-এর patch**-এ কাটা।
4. পাশাপাশি **2×2 patch মিলে একটা image token**। তাই এক token মানে 32×32 pixel।

কয়টা image token হবে, তা শুধু ছবির মাপ থেকেই ঠিক হয়: `(উচ্চতা ÷ 32) × (প্রস্থ ÷ 32)`।

## ছোট একটা উদাহরণ

**ছায়া সমান করা।** একই কালো দাগ, কিন্তু একবার ছায়ায়, একবার আলোয়:

| জায়গা | কাগজের উজ্জ্বলতা | কালির মান | কালি ÷ কাগজ × 255 |
|---|---|---|---|
| ছায়া | 100 | 50 | 127.5 |
| আলো | 200 | 100 | 127.5 |

দুই জায়গায় কালির মান আলাদা ছিল (50 আর 100), ভাগের পর এক হয়ে গেছে। কাগজ দুই জায়গাতেই হয়েছে 255।

**Image token গোনা।** নিচের code Qwen2-VL-ধরনের processor-এর `smart_resize` নিয়মেরই কপি। Training-এ pixel সীমা ছিল 800,000; processor-এর নিজের সীমা 16,777,216।

```python
import math

def smart_resize(height, width, factor=32, min_pixels=65536, max_pixels=16777216):
    h = round(height / factor) * factor
    w = round(width / factor) * factor
    if h * w > max_pixels:                       # বেশি বড়: ছোট করো
        beta = math.sqrt(height * width / max_pixels)
        h = max(factor, math.floor(height / beta / factor) * factor)
        w = max(factor, math.floor(width / beta / factor) * factor)
    elif h * w < min_pixels:                     # বেশি ছোট: বড় করো
        beta = math.sqrt(min_pixels / (height * width))
        h = math.ceil(height * beta / factor) * factor
        w = math.ceil(width * beta / factor) * factor
    return h, w

def image_tokens(height, width, max_pixels=16777216):
    h, w = smart_resize(height, width, max_pixels=max_pixels)
    return h, w, (h // 16) * (w // 16) // 4      # 2x2 patch = 1 token

for name, (H, W) in {"এক লাইনের crop": (127, 440),
                     "পরিষ্কার পাতা": (1225, 898),
                     "কাঁচা ফোনের ছবি": (4000, 2789)}.items():
    for cap in (16777216, 800000):
        print(name, (H, W), "সীমা", cap, "->", image_tokens(H, W, cap))
# output:
# এক লাইনের crop (127, 440) সীমা 16777216 -> (160, 480, 75)
# এক লাইনের crop (127, 440) সীমা 800000 -> (160, 480, 75)
# পরিষ্কার পাতা (1225, 898) সীমা 16777216 -> (1216, 896, 1064)
# পরিষ্কার পাতা (1225, 898) সীমা 800000 -> (1024, 736, 736)
# কাঁচা ফোনের ছবি (4000, 2789) সীমা 16777216 -> (4000, 2784, 10875)
# কাঁচা ফোনের ছবি (4000, 2789) সীমা 800000 -> (1056, 736, 759)
```

লক্ষ্য করো:

- ছোট crop (127×440 = 55,880 pixel) সীমার চেয়ে ছোট, তাই বড় করে 160×480 করা হয়েছে। ফল 75 token।
- কাঁচা ফোনের ছবিতে সীমা না থাকলে 10,875 token, 800,000-এর সীমায় 759। প্রায় ১৪ গুণ তফাত।

এই সংখ্যাগুলো `MODEL_ARCHITECTURE.md`-তে আসল processor দিয়ে মাপা সংখ্যার সঙ্গে হুবহু মেলে।

## Project-এ কোন সিদ্ধান্ত

- Training (`train_lora.py`) প্রতিটা ছবি 800,000 pixel-এ বেঁধে দেয়।
- Production inference-এ কোনো সীমা নেই (`--max-pixels` 0, মানে ছবি যেমন আছে তেমন)। HISTORY-তে লেখা: inference-এর সীমা training-এর 800k-তে নামানোর পরীক্ষা বেশিরভাগ sample-এ খারাপ হওয়ায় বাতিল।

তাই "training-এর মতো করাই সবসময় ভালো" ধরে নেওয়া যাবে না; মেপে দেখতে হয়।

## একটা আসল শিক্ষা: দুই জায়গায় দুই নিয়ম

HISTORY অনুযায়ী ২০২৬-০৯-২৯-এর আগে পাতা পরিষ্কারের code দুই জায়গায় আলাদা কপিতে ছিল: training data বানানোয় একটা, web app-এ আরেকটা। ফলে web app স্ক্যান করা বইয়ের পাতাকেও warp করত (বেঁকিয়ে কাটত), অথচ v19 কখনো সেভাবে warp করা পাতা দেখে শেখেনি। docs-এ লেখা পরীক্ষায় এক পাতার ৫টা শব্দের মধ্যে web-এর নিয়মে পড়া গেছে ১টা, training-এর নিয়মে ৪টা; ঠিক করার পর ৩টা। এখন দুই জায়গা একই function (`crop_page` ও `enhance_page`) ডাকে, পার্থক্য শুধু একটা profile-এ। (এই পরীক্ষা আমি আবার চালাইনি; docs থেকে নেওয়া।)

শিক্ষা: model যে ধরনের ছবি দিয়ে শিখেছে, ব্যবহারের সময়ও সেই ধরনের ছবি দিতে হয়। নইলে model ঠিক থাকলেও ফল খারাপ হয়।

## আগের পাঠের ধারণা এখানে কোথায়

| ধারণা | আগের পাঠ | এই project-এ |
|---|---|---|
| Resize, normalize | [Module 11, Lecture 07](../module-11-image-representation-and-vision/lecture-07-resize-and-preprocessing.md) | `(px/255 − 0.5)/0.5`, ৩২-এর গুণিতকে resize |
| Pixel ও channel | [Module 11, Lecture 01](../module-11-image-representation-and-vision/lecture-01-pixel-and-channel.md) | প্রতি patch-এ 3 channel × 2 frame × 16 × 16 = 1,536 সংখ্যা |
| Patch | [Module 11, Lecture 05](../module-11-image-representation-and-vision/lecture-05-patches-and-patch-embedding.md) | 16×16 patch, তারপর 2×2 জুড়ে 1 token |
| Training ও inference-এ একই নিয়ম | [Module 05, Lecture 02](../module-05-data-preparation-and-splits/lecture-02-encoding-and-scaling.md) | দুই copy আলাদা হয়ে ভুল ফল |

## মনে রাখার সারকথা

- Model পায় pixel নয়, image token; এক token = 32×32 pixel।
- Token সংখ্যা ছবির (resize-করা) মাপ থেকে ঠিক হয়, তাই pixel সীমা token আর খরচ দুটোই নিয়ন্ত্রণ করে।
- Training আর inference-এ ছবি তৈরির নিয়ম আলাদা হলে model-এর ফল খারাপ হতে পারে।

## নিজে করো

১. ছবির উচ্চতা 480, প্রস্থ 640। Image token কয়টা?
২. একটা pixel-এর মান 192। `(px/255 − 0.5)/0.5` কত?
৩. 127×440-এর crop কেন 160×480 হয়ে গেল?

<details><summary>উত্তর</summary>

১. 480 আর 640 দুটোই 32-এর গুণিতক (15 × 32, 20 × 32), মোট pixel 307,200 সীমার ভেতরে। তাই মাপ বদলায় না। Patch: (480 ÷ 16) × (640 ÷ 16) = 30 × 40 = 1,200। 4 দিয়ে ভাগ করে 300 token।
২. 192 ÷ 255 = 0.753; 0.753 − 0.5 = 0.253; 0.253 ÷ 0.5 = **0.506**।
৩. 127 × 440 = 55,880 pixel, যা ন্যূনতম সীমা 65,536-এর চেয়ে কম। তাই ছবি বড় করা হয়েছে, আর উচ্চতা-প্রস্থ ৩২-এর গুণিতকে উঠে হয়েছে 160 × 480।

</details>

## পরের পাঠ

ছবি তৈরি হলো। এবার দেখব সেই ছবির কোথায় কী আছে বলার কাজ আর কী লেখা আছে পড়ার কাজ কেন আলাদা। [Lecture 03 — Layout ও Recognition](lecture-03-layout-vs-recognition.md)।
