# Lecture 07 — Output Formatting ও Error-এর উৎস

> আগে যা জানা থাকলে ভালো: [Layout ও Recognition](lecture-03-layout-vs-recognition.md) আর [Recognition-এর ভেতরের গঠন](lecture-04-encoder-decoder-in-recognition.md)। এই lecture শেষে পারবে: model-এর কাঁচা output থেকে final লেখা হতে কোন কোন ধাপ পার হয় তা বলতে, আর একটা ভুল কোন ধাপ থেকে এসেছে তা খোঁজার ক্রম বলতে।
> তথ্যের উৎস: `ocr-benchmark/surya_finetune/block_pipeline.py` (`_assemble_recognized_parts`, `apply_markup`, `trim_repetition_loop`, `dedupe_recognized_text`), `ocr-benchmark/surya_finetune/merge_outputs.py`, `ocr-benchmark/surya_finetune/vllm_inference_service.py` (`_predict_page`), `ocr-benchmark/docs/HISTORY_bn.md` (v18, v19 অংশ), `ocr-benchmark/plan.md` (২০২৬-১০-১৪), আর `ocr-benchmark/surya_finetune/gt_outputs/*.json` (সংরক্ষিত output; CER আমি নিজে গুনেছি)।

## সমস্যাটা কী?

Final লেখায় ভুল দেখলে সবচেয়ে সহজ কথা: "model খারাপ"। কিন্তু model যা লেখে, সেটা final লেখা হওয়ার আগে অনেক ধাপ পার হয়: ছবি তৈরি, layout, crop, model, তারপর আরও কিছু code। ভুল model-এর না হলে আবার train করে কোনো লাভ নেই, উল্টো ২৫ ঘণ্টার একটা run নষ্ট হয়।

## ধারণাটা সহজ ভাষায়

Model-এর কাঁচা output সরাসরি final হয় না। `block_pipeline.py` অনুযায়ী তার ওপর এই কাজগুলো চলে:

- **Generation-এর সময়:** একই অংশ বারবার ঘুরতে শুরু করলে (loop) কেটে ফেলা; শেষের বাড়তি সংখ্যা-আবর্জনা সরানো।
- **Block ধরে:** `NA` (মানে "লেখা নেই") খালি করা; শিরোনামে `##`, তালিকায় `-` বসানো; একই লেখা দুবার এলে একটা বাদ দেওয়া।
- **পুরো পাতায়:** তিন ধরনের output তৈরি হয়:
  - **recognition:** পুরো পাতা এক call-এ পড়া।
  - **structure:** block ধরে আলাদা আলাদা পড়ে জোড়া।
  - **merged:** structure-কে ভিত্তি ধরে, recognition-এর সঙ্গে খুব মিললে (সাদৃশ্য ০.৭৫ বা তার বেশি) সেখান থেকে ছোট সংশোধন নেওয়া।

তাই ভুলের উৎস অন্তত পাঁচ জায়গায় হতে পারে। প্রতিটার একটা করে আসল উদাহরণ project-এর docs থেকে:

| উৎস | উদাহরণ | কে ঠিক করবে |
|---|---|---|
| ১. ছবি তৈরি | স্ক্যান করা বইয়ের পাতা web app-এ warp হয়ে ঝাপসা হতো, training-এ এমন ছিল না; ঠিক হয়নি model, ঠিক হয়েছে ছবির নিয়ম | ছবির code |
| ২. Layout / block বাছাই | সত্যিকারের শেষ দুই লাইন কালির সীমায় (0.0282 < 0.03) ফাঁকা ধরে বাদ গেছে | Layout-এর code |
| ৩. Recognition model | আরবি, ﷺ চিহ্ন, ছোট font-এর footnote ভুল পড়া; training-এ আরবি ছিল হরকত-ছাড়া কিছু synthetic লাইন | নতুন data, training |
| ৪. পরের code | dedupe হাতের লেখা মুছে দিত; "।" খেয়ে ফেলত; loop-কাটা ঠিকমতো চলত না | Post-processing code |
| ৫. মাপার code | CER-এ header-এর লেখা ধরা পড়ত না, শুধু v17-v18-কে শাস্তি দিয়েছিল | Scoring code |

২ ও ৪-এর সারি HISTORY (v19, ২০২৬-০৯-২৯) ও plan.md-র ২০২৬-১০-১৪ এন্ট্রি থেকে; ৫-এর কথা [Lecture 08](lecture-08-cer-wer-and-version-comparison.md)-এ আবার আসবে।

## ছোট একটা উদাহরণ

নিচের দুটো উদাহরণ `gt_outputs/` ফাইলে রাখা আসল output থেকে। CER মানে ভুল অক্ষরের হার; হাতে হিসাব পরের lecture-এ। এখানে শুধু সংখ্যার দিকটা দেখো।

**উদাহরণ ক: ঠিক পড়া, তবু ১১.৮% ভুল।** নমুনা `rudro4_short_line`, সঠিক লেখা `আমী তোমেকা ভোলাবিসা`। v16-এর merged output ছিল:

```text
আমী তোমেকা ভোলাবিসা

NA
```

পড়া হুবহু ঠিক, শুধু শেষে বাড়তি `NA`। এই দুই অক্ষরেই CER 2 ÷ 17 = 11.8%, WER 1 ÷ 3 = 33.3%। কোডে `NA`-কে খালি করার নিয়মটা আছে শুধু `crop_scope` আর `page_box` input mode-এ। v16 চলে `crop` mode-এ (`vllm_inference_service.py`-র মন্তব্য), তাই ওই ধাপই ছিল না:

```python
EMPTY = "NA"

def assemble(texts, input_mode):
    out = []
    for text in texts:
        # v19-এর input mode-এ "NA" মানে "এই অংশে লেখা নেই"
        if input_mode in ("page_box", "crop_scope") and text.strip() == EMPTY:
            text = ""
        if text:
            out.append(text)
    return "\n\n".join(out)

blocks = ["আমী তোমেকা ভোলাবিসা", "NA"]       # দ্বিতীয় block-এর ফল NA
print(repr(assemble(blocks, "crop")))
print(repr(assemble(blocks, "crop_scope")))
# output:
# 'আমী তোমেকা ভোলাবিসা\n\nNA'
# 'আমী তোমেকা ভোলাবিসা'
```

(কোন block থেকে `NA` এসেছিল, তা আমি যাচাই করিনি; code-নিয়ম আর সংরক্ষিত output থেকে এটুকুই বলা যায়।)

**উদাহরণ খ: একই weight, তিন mode, তিন ফল।** v19 (`crop_scope`) দিয়ে নমুনা `handwritten_rudro`, সঠিক লেখা 236 অক্ষর (space ছাড়া):

| Output mode | CER |
|---|---|
| recognition (পুরো পাতা এক call) | 2.1% |
| structure (block ধরে) | 10.6% |
| merged | 8.1% |

Weight একই, তবু ফল আলাদা। কারণ খুঁজতে দেখি structure ও merged output "তোমার নামের আড়ালে…" দিয়ে শুরু; recognition output শুরু হয়েছে "হ্যালো সর্বনাম," দিয়ে। অর্থাৎ প্রথম লাইনটা (space ছাড়া 14 অক্ষর) block-ভিত্তিক পথে আসেনি। সেই 14 অক্ষর merged output-এর সামনে বসিয়ে আবার মাপলে CER 8.1% থেকে ঠিক 2.1% হয়, recognition-এর সমান। অর্থাৎ ফারাকটা পুরোটাই একটা হারানো লাইনের, পড়ার মান নয়।

কোন ধাপে লাইনটা হারাল (layout, ফাঁকা-পরীক্ষা, নাকি model), তা আমি যাচাই করিনি; ছবি দিয়ে pipeline চালাইনি। ফাইলগুলো ২০২৬-০৯-২৯-এর, এরপর layout-এ আরও সংশোধন যোগ হয়েছে (plan.md, ২০২৬-১০-১৪)।

## ভুল খোঁজার ক্রম

কাছের ধাপ থেকে দূরে যাও, উল্টো দিক থেকে:

1. **মাপার ভুল?** Reference লেখা ঠিক আছে কি, header-এর মতো বাড়তি লেখা scoring-এ ধরা পড়ছে কি।
2. **Post-processing?** কাঁচা model output আর final লেখা পাশাপাশি রাখো। কোন লাইন কোথায় বদলাল?
3. **Recognition?** কাঁচা output-এ ওই অংশ ভুল আছে? তবে crop-টা দেখো, ঠিক crop-এ ভুল হলে model-এর ভুল।
4. **Layout / block?** ওই অংশ কোনো block-এ পড়েছিল কি, নাকি বাদ গেছে? Project-এ block-গুলো ছবির ওপর আঁকা দেখার একটা অংশ আছে (plan.md, ২০২৬-১০-১৪)।
5. **ছবি তৈরি?** Crop ঠিক আছে, কালি কাটা যায়নি, training-এর মতো ছবি?

Project-এ প্রতিটা mode-এর কাঁচা output আলাদা ফাইলে রাখা হয় (`gt_outputs/v19cs@recognition.json`, `@structure`, `@merged`), যাতে এই তুলনা সম্ভব হয়।

## আগের পাঠের ধারণা এখানে কোথায়

| ধারণা | আগের পাঠ | এই project-এ |
|---|---|---|
| Output/inference বনাম training | [Module 09, Lecture 08](../module-09-model-architecture/lecture-08-architecture-vs-training.md) | Output-এর ভুল সারাতে training লাগে না, যদি ভুল code-এ হয় |
| লেখা তৈরি, থামা | [Module 12, Lecture 07](../module-12-text-sequences-and-multimodal-models/lecture-07-autoregressive-decoder-and-stopping.md) | Loop-এ আটকানো, token সীমা, stop token |
| Error analysis | [Module 07, Lecture 04](../module-07-generalization-and-overfitting/lecture-04-learning-curves-and-error-analysis.md) | ভুল ধরনে ভাগ করা: ছবি, layout, model, code, মাপা |
| Baseline তুলনা | [Module 06, Lecture 01](../module-06-model-evaluation-and-baselines/lecture-01-baselines.md) | একই weight-এর তিন mode একে অন্যের তুলনা |

## মনে রাখার সারকথা

- Model-এর কাঁচা output আর final লেখা এক নয়; মাঝে loop-কাটা, `NA` খালি করা, markup, dedupe, merge চলে।
- ভুল পাঁচ জায়গা থেকে আসতে পারে: ছবি, layout, model, পরের code, মাপার code।
- একই weight-এ mode বদলালে ফল বদলাতে পারে, তাই "ফল বদলেছে" মানেই "model বদলেছে" নয়।

## নিজে করো

১. Final লেখায় একটা অনুচ্ছেদ পুরোপুরি নেই। অন্তত তিনটা সম্ভাব্য কারণ লেখো।
২. কোডে `NA` খালি করা হয় `crop_scope`-এ কিন্তু `crop`-এ নয়। কেন এই তফাত যুক্তিসংগত?
৩. 236 অক্ষরের reference-এ একটা 14-অক্ষরের লাইন বাদ পড়লে CER-এ আনুমানিক কত পয়েন্ট যোগ হয়?

<details><summary>উত্তর</summary>

১. যেমন: Layout অংশটাকে Picture ধরে বাদ দিয়েছে; কালি কম বলে ফাঁকা ধরা পড়েছে; পুরোনো dedupe ধাপ লেখাটাকে "একই" ভেবে মুছেছে। (মূল ছবি তৈরির সময় অংশটা কেটে গিয়ে থাকলেও এমন হয়।)
২. v19-এর `SCOPE_PROMPT`-এ স্পষ্ট লেখা: "If the region contains no text, answer NA", তাই সেখানে `NA` মানে খালি। পুরনো `DEFAULT_PROMPT`-এ এই নির্দেশ নেই, তাই কোড সেখানে `NA`-কে বিশেষ কিছু ধরে না।
৩. 14 ÷ 236 = 5.93%, অর্থাৎ প্রায় 6 পয়েন্ট। উপরের উদাহরণে 8.1 − 2.1 = 6.0, মোটামুটি এর সমান।

</details>

## পরের পাঠ

"CER ১০%" বা "WER ২০%" আসলে কীভাবে গোনা হয়, আর দুটো version-কে ন্যায্যভাবে তুলনা করতে কী লাগে: [Lecture 08 — CER, WER ও Version তুলনা](lecture-08-cer-wer-and-version-comparison.md)।
