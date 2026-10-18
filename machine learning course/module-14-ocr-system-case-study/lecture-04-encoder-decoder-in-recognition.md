# Lecture 04 — Recognition Model-এর ভেতরে: Encoder ও Decoder

> আগে যা জানা থাকলে ভালো: [Encoder](../module-11-image-representation-and-vision/lecture-06-encoder.md), [Autoregressive decoder](../module-12-text-sequences-and-multimodal-models/lecture-07-autoregressive-decoder-and-stopping.md) এবং [Image ও text একসঙ্গে](../module-12-text-sequences-and-multimodal-models/lecture-08-image-and-text-together.md)। এই lecture শেষে পারবে: একটা crop থেকে লেখা বেরোনোর পথ (encoder → image token → decoder → অক্ষর) বলতে, আর একটা crop-এর মোট token গুনতে।
> তথ্যের উৎস: `ocr-benchmark/as_sunnah_ocr_1/docs/MODEL_ARCHITECTURE.md` (১–১০ নং অংশ), `ocr-benchmark/surya_finetune/vllm_inference_service.py` (`_vllm_generate`)। নিজে মিলিয়েছি: base model-এর `config.json`, `tokenizer.json`, `chat_template.jinja` (Hugging Face cache) আর `model.safetensors`-এর header।

## সমস্যাটা কী?

আগের lecture-এ recognition model-কে কালো বাক্স ধরেছি: crop ঢোকে, লেখা বেরোয়। কিন্তু ছবি তো সংখ্যার ছক, আর লেখা বেরোতে হয় অক্ষরের পর অক্ষর। এই দুই ভিন্ন জিনিসের মাঝে সেতু কীভাবে তৈরি হয়, সেটা না বুঝলে model-এর খরচ আর সীমা (কেন ঘন পাতায় সময় বেশি, কেন prompt ছোট করা যায় না) বোঝা যায় না।

## ধারণাটা সহজ ভাষায়

Model-এর দুটো বড় অংশ:

**Vision encoder** ছবির patch-গুলোকে নিয়ে একটা token-তালিকা বানায়। এখানে 12টা block আছে, ভেতরের মাপ (hidden size) 768, মোট প্রায় 100.6 million parameter। একদম শেষে একটা **merger** 2×2 patch জুড়ে একটা করে vector বানায়, যার দৈর্ঘ্য 1024। এই 1024 ঠিক language অংশের hidden size, তাই এই vector সরাসরি "লেখার token"-এর জায়গায় বসতে পারে। এগুলোই **image token** ([Lecture 02](lecture-02-image-enters-the-pipeline.md)-এ গোনা)।

**Language decoder** একটা লেখা-তৈরির model: 24টা layer, hidden size 1024, মোট প্রায় 565.1 million parameter। সে একটা একটা করে অক্ষর তৈরি করে, আর `<|im_end|>` নামের stop token বাছলে থামে।

এখানে সাধারণ "encoder-decoder with cross-attention" নয়। Image token আর prompt-এর token একই তালিকায় পাশাপাশি বসে, আর পুরো তালিকাটা decoder-এর input। [Module 12, Lecture 08](../module-12-text-sequences-and-multimodal-models/lecture-08-image-and-text-together.md)-এ এর নাম ছিল (ক) বিকল্প: একই তালিকায় পাশাপাশি। Chat template অনুযায়ী input দেখতে এমন:

```text
<|im_start|>user
<|vision_start|> [image token × N] <|vision_end|> prompt <|im_end|>
<|im_start|>assistant
```

এরপর model এই লাইনের পরে একটা একটা token বসায়: উত্তরের অক্ষর, শেষে `<|im_end|>`।

**Tokenizer এখানে অক্ষর-ভিত্তিক।** `tokenizer.json`-এ প্রতিটা অক্ষর আলাদা token, vocabulary 65,425। বাংলায় একটা code point (অক্ষর, মাত্রা বা যুক্ত চিহ্ন) মানে একটা token। তাই output token সংখ্যা প্রায় লেখার অক্ষর সংখ্যার সমান। তুলনায় [Module 12, Lecture 01](../module-12-text-sequences-and-multimodal-models/lecture-01-token-and-tokenizer.md)-এর subword tokenizer অনেক ছোট তালিকা বানায়।

Decoding-এর নিয়ম: greedy (temperature 0), সঙ্গে LoRA-র জন্য `repetition_penalty = 1.3`, আর একই অংশ বারবার ঘুরতে শুরু করলে আটকানোর code (loop guard)।

## ছোট একটা উদাহরণ

এক লাইনের crop, ছবি 127×440। [Lecture 02](lecture-02-image-enters-the-pipeline.md) অনুযায়ী 75টা image token। Prompt হলো v19-এর `SCOPE_PROMPT` (`prompts.py`)। `tokenizer.json` দিয়ে গুনে দেখেছি: chat template-এর বিশেষ চিহ্নসহ prompt-অংশ মোট 514 token, আর পুরো input 589। এটা `MODEL_ARCHITECTURE.md`-র মাপা 589-এর সঙ্গে মেলে। উত্তর "আমাকে আমার মতো থাকতে দাও": 24 অক্ষর, তাই 24 token + stop token।

```python
text = "আমাকে আমার মতো থাকতে দাও"
image_tokens = 75            # 127x440-এর crop
prompt_tokens = 514          # SCOPE_PROMPT + chat template
output_tokens = len(text) + 1   # প্রতি অক্ষর 1 token + stop token
print(len(text), image_tokens + prompt_tokens, output_tokens,
      image_tokens + prompt_tokens + output_tokens)
# output:
# 24 589 25 614
```

লক্ষ্য করো, একটা ছোট crop-এ ছবি মাত্র 75 token, কিন্তু prompt 514। Prompt ছবির প্রায় ৭ গুণ। ভাষাটা অক্ষর-ভিত্তিক বলে দীর্ঘ ইংরেজি নির্দেশ অনেক token খায়।

Parameter-ও এই গঠন থেকে গুনে মেলানো যায়:

```python
vocab, hidden = 65_425, 1_024
embedding = vocab * hidden
layers = 18 * 21_555_360 + 6 * 18_352_640   # 18 linear-attention + 6 full-attention layer
language = embedding + layers + 1_024       # শেষে একটা norm-এর 1,024
vision = 100_592_896
print(embedding, layers)
print(language, vision, vision + language)
# output:
# 66995200 498112320
# 565108544 100592896 665701440
```

একই 665,701,440 আমি base model file-এর header থেকে আলাদাভাবে গুনেও পেয়েছি। Embedding-এর 66,995,200 হলো token-তালিকার table (65,425 সারি, 1,024 কলাম); output-এ score বের করার layer-ও (`lm_head`) এই একই table ব্যবহার করে, তাই আলাদা সংখ্যা নেই।

## আগের পাঠের ধারণা এখানে কোথায়

| ধারণা | আগের পাঠ | এই model-এ |
|---|---|---|
| Patch ও patch embedding | [Module 11, Lecture 05](../module-11-image-representation-and-vision/lecture-05-patches-and-patch-embedding.md) | 16×16 patch, প্রথম Conv layer 1,536 সংখ্যাকে 768 করে |
| Encoder | [Module 11, Lecture 06](../module-11-image-representation-and-vision/lecture-06-encoder.md) | 12 block + merger, ফল image token |
| Token | [Module 12, Lecture 01](../module-12-text-sequences-and-multimodal-models/lecture-01-token-and-tokenizer.md) | অক্ষর-ভিত্তিক, vocabulary 65,425 |
| Embedding | [Module 12, Lecture 02](../module-12-text-sequences-and-multimodal-models/lecture-02-embedding.md) | 65,425 × 1,024 table |
| Logits ও softmax | [Module 12, Lecture 03](../module-12-text-sequences-and-multimodal-models/lecture-03-logits-and-softmax.md) | প্রতি ধাপে 65,425 score |
| Attention, Transformer block | [Module 12, Lecture 05](../module-12-text-sequences-and-multimodal-models/lecture-05-context-and-attention.md), [06](../module-12-text-sequences-and-multimodal-models/lecture-06-transformer-block.md) | Decoder-এর 24 layer |
| লেখা তৈরি ও থামা | [Module 12, Lecture 07](../module-12-text-sequences-and-multimodal-models/lecture-07-autoregressive-decoder-and-stopping.md) | greedy, stop token বাছলে থামা |

সাবধান: Decoder-এর 24 layer-এর 18টা "linear attention" ধরনের (Gated DeltaNet), 6টা সাধারণ full attention। এই linear ধরনের ভেতরের হিসাব এই course-এ এখনো পড়ানো হয়নি, তাই এখানে শুধু নামটুকু জানলেই চলবে।

## মনে রাখার সারকথা

- Vision encoder ছবিকে image token বানায়; language decoder সেই token আর prompt দেখে অক্ষর অক্ষর করে লেখে।
- Image token আর prompt একই তালিকায় বসে; আলাদা cross-attention নেই।
- Tokenizer অক্ষর-ভিত্তিক, তাই output token ≈ অক্ষর সংখ্যা; ছোট crop-এ prompt-ই বেশিরভাগ token।

## নিজে করো

১. Embedding table-এ parameter কয়টা? (65,425 × 1,024)
২. 75 image token, 514 prompt token আর 25 output token হলে মোট কয়টা token সাজানো হয়?
৩. একটা ঘন পাতায় 1,000 অক্ষর লেখা। Output token কত, এবং এ থেকে কী বোঝা যায়?

<details><summary>উত্তর</summary>

১. 65,425 × 1,024 = **66,995,200**।
২. 75 + 514 + 25 = **614**।
৩. প্রায় 1,000 + 1 (stop token)। বাংলায় এক অক্ষর এক token, তাই লম্বা লেখায় decoder-কে এক এক ধাপে একটা করে 1,000 বার চলতে হয়। এই কারণেই ঘন পাতায় সময় বেশি লাগে।

</details>

## পরের পাঠ

Model-এর গঠন জানা হলো। এবার দেখব তাকে শেখানোর একটা উদাহরণ কেমন, আর loss কোন token-এ গোনা হয়: [Lecture 05 — Training উদাহরণ ও Loss](lecture-05-training-example-and-loss.md)।
