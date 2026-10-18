# Machine Learning — Course Outline

এই folder-এ ML শেখার notes module ভিত্তিক ভাবে রাখা। সময়ের সাথে module add, split বা merge হতে পারে — এটা একটা living document structure।

**অবস্থা (২০২৬-১০-১৫):** ১৮টা module-এর সব lecture লেখা আছে — মোট ১৩৭টা lecture, ২টা bridge, ২টা reference। লেখা থাকা মানে শেখা শেষ নয়; পড়া ও নিজে অনুশীলন করা বাকি।

## কোথা থেকে শুরু করবে

- **কঠিন শব্দ আটকালে:** [সহজ শব্দকোষ](02-glossary.md) — প্রতিটা শব্দের এক লাইনের মানে ও lecture-এর link।
- **কোন জিনিস কোথায় বসে:** [Model ও Math-এর মানচিত্র](01-learning-map.md) — output, objective ও update আলাদা করে বোঝার কেন্দ্র।
- **Lecture কীভাবে লেখা:** [সহজ লেখার নিয়ম](00-writing-style-guide.md)।

### দুটো পড়ার পথ

Module নম্বর পড়ার বাধ্যতামূলক ক্রম নয়। নিজের লক্ষ্য অনুযায়ী পথ বাছো।

| পথ | ক্রম | কার জন্য |
|---|---|---|
| **পূর্ণ পথ (গোড়া থেকে)** | 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 15 → 16 → 17 → 18 → 14 | যার ভিত্তি দুর্বল; সব ধাপে ধাপে চায় |
| **দ্রুত পথ (architecture থেকে)** | 01 → 02 (lecture 01–03) → 09 → 10 → 12 → 13 → 15 → 16 → 17 → 18 → 14। মাঝে আটকালে 04–08 থেকে প্রয়োজনীয় lecture | যে আগে LLM/fine-tuning বুঝতে চায়; data/evaluation পরে ফিরে পড়বে |

Module 14 (OCR) সবশেষে — এটা বাস্তব project-এ আগের ধারণাগুলো খুঁজে দেখার case study। ভিত্তি না থাকলে আগে সেখানে যাওয়া উচিত নয়।

## Note-Writing Standard (সব lecture-এ মানতে হবে)

বিস্তারিত নিয়ম ও ছাঁচ [00-writing-style-guide.md](00-writing-style-guide.md)-এ। সংক্ষেপে:

- নোট হবে স্বতন্ত্র study material — কথোপকথনের transcript বা কোনো প্রশ্নের সরাসরি উত্তর নয়। "হ্যাঁ", "তোমার প্রশ্ন", "আগে যেটা বলেছি" ধরনের ভাষা নয়।
- **এক lecture = এক ধারণা।** আগে সমস্যা ("এটা না থাকলে কী আটকে যায়"), তারপর ধারণা, তারপর ছোট সংখ্যার উদাহরণ, তারপর formula বা code।
- What / Why / Who-এর উত্তর কথার ভেতরে মিশে থাকবে; আলাদা শিরোনাম নয়।
- ছোট বাক্য, সহজ বাংলা। Technical শব্দ প্রথমবার আসার সময় এক লাইনে সহজ করা।
- উপমা শুধু সত্যিই কঠিন বা abstract ধারণায়, lecture-এ সর্বোচ্চ একটা।
- প্রতিটা সংখ্যা ও code Python চালিয়ে যাচাই করা; প্রতি lecture-এ "নিজে করো" ও উত্তর।
- প্রতিটি নতুন model/formula-এর আগে map-এ তার অবস্থান; output/inference, training objective ও update আলাদা।
- কোনো lecture-এ লেখা হয়নি বলে ধরা যাবে না যে পাঠক বিষয়টা শিখে ফেলেছে।

## Modules

| Module | বিষয় | Lecture | অবস্থা |
|---|---|---|---|
| [01 ML fundamentals ও math basics](module-01-ml-fundamentals-and-math-basics/) | ML কী; supervised/unsupervised/RL; vector, probability, calculus-এর পরিচয় | ৮ | লেখা প্রস্তুত |
| [02 Linear regression](module-02-linear-regression/) | prediction, loss, gradient descent, একাধিক feature, নতুন data-য় পরীক্ষা, Python | ৬ | লেখা প্রস্তুত |
| [03 Logistic regression](module-03-logistic-regression/) | sigmoid, decision boundary, log loss, training, Python | ৫ | লেখা প্রস্তুত |
| [04 Math অনুশীলন](module-04-math-foundations-practice/) | vector/matrix, dot product, mean/variance, derivative-এর হাতে-কলমে চর্চা | ৪ | লেখা প্রস্তুত |
| [05 Data প্রস্তুতি ও split](module-05-data-preparation-and-splits/) | data দেখা, encoding, scaling, train/validation/test, leakage | ৫ | লেখা প্রস্তুত |
| [06 Evaluation ও baseline](module-06-model-evaluation-and-baselines/) | baseline, regression ও classification metric, cross-validation | ৫ | লেখা প্রস্তুত |
| [07 Generalization ও overfitting](module-07-generalization-and-overfitting/) | underfitting/overfitting, capacity, regularization, learning curve | ৫ | লেখা প্রস্তুত |
| [08 End-to-end project](module-08-end-to-end-ml-project/) | ছোট regression project, Python-এ শুরু থেকে শেষ | ৫ | লেখা প্রস্তুত |
| [09 Model architecture](module-09-model-architecture/) | input → parameters → unit → activation → layer → forward pass → shape/count | ৯ + reference | লেখা প্রস্তুত (সহজ করে নতুন লেখা) |
| [10 Neural network training](module-10-neural-network-training/) | loss, gradient, chain rule, backpropagation, optimizer, training loop | ৮ + reference | লেখা প্রস্তুত |
| [11 ছবি থেকে representation](module-11-image-representation-and-vision/) | pixel, tensor, convolution, feature map, patch, encoder | ৭ | লেখা প্রস্তুত |
| [12 Text ও multimodal](module-12-text-sequences-and-multimodal-models/) | token, embedding, softmax, attention, transformer, image+text | ৮ + bridge | লেখা প্রস্তুত |
| [13 Fine-tuning, LoRA, quantization](module-13-pretraining-finetuning-and-lora/) | full/head/LoRA, rank/alpha, merge, QLoRA, LoRA variants, অন্য PEFT | ১৪ + bridge | লেখা প্রস্তুত |
| [14 OCR case study](module-14-ocr-system-case-study/) | বাস্তব OCR system: pipeline, loss, LoRA count, CER/WER | ৮ | লেখা প্রস্তুত (source: `ocr-benchmark`) |
| [15 SFT ও domain adaptation](module-15-domain-and-task-adaptation/) | SFT, loss mask, continued pretraining, correction data, forgetting | ৮ | লেখা প্রস্তুত |
| [16 Preference ও DPO](module-16-preference-learning-and-dpo/) | preference data, DPO হাতে-হিসাব, gradient, evaluation | ৮ | লেখা প্রস্তুত |
| [17 RL ও feedback](module-17-reinforcement-learning-and-feedback/) | RL ভিত্তি, PPO, RLHF/RLAIF/RLVR/GRPO, correction, reward hacking | ১৬ | লেখা প্রস্তুত |
| [18 Knowledge distillation](module-18-knowledge-distillation/) | teacher/student, soft target, KL loss, তুলনা | ৮ | লেখা প্রস্তুত |

> **সতর্কতা:** কিছু উদাহরণের সংখ্যা শেখানোর জন্য কাল্পনিক (lecture-এ চিহ্নিত)। Torch/PEFT/TRL-এর code environment-এ চালানো যায়নি, তাই সেগুলো "pseudo-code, চালানো হয়নি" বলে চিহ্নিত। Python-এর উদাহরণ (standard library) চালিয়ে মেলানো হয়েছে।

## Progress Log

- 2026-10-15 — **পুরো কোর্স সহজ করে সম্পূর্ণ করা হলো।** পুরনো ২৯টা lecture ঘন ও কঠিন ছিল; সব নতুন ছাঁচে (সমস্যা → ধারণা → ছোট উদাহরণ → অনুশীলন) সহজ করে আবার লেখা। ১০৮টা নতুন lecture যোগ: Module 02 (০৪–০৬), 03 (০২–০৫), 04, 05, 06, 07, 08 (সম্পূর্ণ), 10 (০২–০৮), 11 (সম্পূর্ণ), 12 (০১–০৮), 13 (০৬–১৪), 14 (০২–০৮), 15, 16, 17 (০২–১৬), 18। নতুন file: [শব্দকোষ](02-glossary.md), [লেখার নিয়ম](00-writing-style-guide.md)।
- 2026-09-21 — Note quality সংশোধন: output score ও lossless compression-এর পৃথক bridge lecture; quantization lecture ধারাবাহিকভাবে পুনর্লিখন, margin-এর শর্ত ও অনুশীলনসহ।
- 2026-09-21 — বর্তমান পাঠ LoRA A/B ও quantization; বিস্তারিত শেখার অনুরোধে Module 13 বিস্তৃত এবং 15–18-এর lecture plan যোগ। Correction/feedback-এর প্রাথমিক পাঠ প্রস্তুত।
- 2026-09-21 — Fine-tuning-এর প্রধান পরিবারের map যোগ: parameter নির্বাচন ও learning signal আলাদা।
- 2026-09-20 — Course pacing পুনর্বিন্যাস: Module 09-এ ৯টি focused lecture; Module 10–13-এর prerequisite-সহ পরিকল্পনা; OCR reference Module 14-এ সরানো।
- 2026-09-19 — `ocr-benchmark`-এর docs ও নির্বাচিত code পড়ে OCR architecture/LoRA case study যোগ হয়েছে; source project-এ পরিবর্তন বা training করা হয়নি।
- 2026-09-19 — Module 09-এর পড়ার ক্রম: architecture/layer/unit → parameters ও hyperparameters → architecture design।
- 2026-09-19 — বাকি fundamentals Module 04–08 হিসেবে পরে শেখার জন্য সংরক্ষিত; বর্তমান বিষয় Module 09-এর architecture পরিচিতি ও design।
- 2026-09-19 — কেন্দ্রীয় model/math map ও নির্দিষ্ট পড়ার পথ যোগ হয়েছে।
- 2026-09-19 — Module 01-এর lecture 04 ও 05 বিস্তৃত: K-Means ও tabular Q-learning-এর mathematical sequence, সংখ্যার উদাহরণ, diagram ও অনুশীলন।
- 2026-09-19 — Module 02-এ MSE ও gradient descent-এর দুটি lecture যোগ।
- 2026-09-19 — Module 03-এ sigmoid-এর প্রাথমিক নোট যোগ।
- 2026-09-19 — Module 02 শুরু: Linear Regression-এর পরিচয় ও prediction-এর ছোট উদাহরণ।
- 2026-09-19 — Folder শুরু হলো, module-01 তৈরি হলো।
- 2026-09-19 — Module 01-এর প্রাথমিক পরিচিতি নোট: ML-এর ধরন ও math basics।
