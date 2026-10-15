# সহজ লেখার নিয়ম — সব lecture-এর জন্য

এই file-টা হলো lecture লেখার **ছাঁচ**। উদ্দেশ্য একটাই: পাঠক যেন একবার পড়েই বুঝতে পারে। কঠিন লাগলে ধরে নিতে হবে লেখা ভুল, পাঠক নয়।

[Course Outline](00-course-outline.md) · [Learning Map](01-learning-map.md)

## ১. মূল নীতি

1. **এক lecture = এক ধারণা।** দুটো নতুন জিনিস একসঙ্গে ঢোকানো যাবে না।
2. **ছোট বাক্য, সহজ বাংলা।** Technical শব্দ (loss, gradient, layer ইত্যাদি) ইংরেজিতেই থাকবে, কিন্তু প্রথমবার আসার সময় এক লাইনে সহজ করে বলতে হবে সেটা কী।
3. **আগে সমস্যা, তারপর সমাধান।** "এটা কী" বলার আগে বলতে হবে "এটা না থাকলে কী অসুবিধা হতো"। ধারণাটা কে ব্যবহার করে সেটাও কথার ভেতরে এক-দুই বাক্যে আসবে। আলাদা What/Why/Who শিরোনাম দেওয়া যাবে না।
4. **আগে ছোট সংখ্যার উদাহরণ, পরে নিয়ম।** Formula-র আগে ২–৩টা সংখ্যা দিয়ে হাতে হিসাব দেখাতে হবে। তারপর বলা যাবে "এই কাজটারই সংক্ষিপ্ত রূপ হলো এই formula।"
5. **শর্তের ভিড় নয়।** "এই উদাহরণে", "সব ক্ষেত্রে নয়", "নির্ধারিত নিয়ম অনুযায়ী" ধরনের সতর্কতা শুধু তখনই লিখবে যখন সেটা না জানলে পাঠক ভুল বুঝবে। তখনো এক লাইনের `সাবধান:` হিসেবে।
6. **গল্প/উপমা কম।** শুধু সত্যিই কঠিন বা abstract ধারণায়, আর lecture-এ সর্বোচ্চ একটা। সরল তথ্যে উপমা দেবে না।
7. **নিজের কথা, transcript নয়।** "তোমার প্রশ্ন", "আগে বলেছি", "হ্যাঁ" ধরনের উত্তরসুলভ ভাষা চলবে না। পাঠক chat দেখেনি ধরে নাও। পাঠককে "তুমি" বলে সম্বোধন করা যাবে।
8. **সৎ অবস্থা।** "লেখা হয়েছে" আর "শেখা হয়েছে" আলাদা। কোথাও লিখবে না যে পাঠক বিষয়টা শিখে ফেলেছে।

## ২. Lecture-এর কাঠামো (এই ক্রমেই)

```markdown
# Lecture NN — <সহজ শিরোনাম>

> আগে যা জানা থাকলে ভালো: <এক লাইন + link>। এই lecture শেষে পারবে: <এক লাইনের লক্ষ্য>।

## সমস্যাটা কী?
(২–4 বাক্য। একটা বাস্তব ছোট পরিস্থিতি। এই ধারণা না থাকলে কী আটকে যায়।)

## ধারণাটা সহজ ভাষায়
(মূল ধারণা ছোট ছোট অনুচ্ছেদে। নতুন term প্রথমবার **bold** করে এক লাইনে সহজ পরিচয়।)

## ছোট একটা উদাহরণ
(২–৩টা সংখ্যা। প্রতিটা ধাপ আলাদা লাইনে, হিসাবসহ। সব সংখ্যা Python চালিয়ে মিলিয়ে নেবে।)

## Formula / কোড (যদি লাগে)
(উদাহরণের একই কাজটাই formula বা ছোট Python code হিসেবে। সব নতুন symbol-এর মানে এক লাইনে।)

## ছবি (যদি লাগে)
(Mermaid diagram — সর্বোচ্চ একটা, ছোট, ৭টার বেশি box নয়।)

## মনে রাখার সারকথা
- ৩টা bullet, প্রতিটা এক লাইন।

## নিজে করো
১. ... ২. ... ৩. ...  (সহজ থেকে একটু কঠিন)
<details><summary>উত্তর</summary> ... হিসাবসহ ... </details>

## পরের পাঠ
(এক লাইন: পরের lecture কেন আসছে + link।)
```

- **দৈর্ঘ্য:** সাধারণত ৫০০–৯০০ শব্দ। বেশি লম্বা হলে ধারণাটা ভাগ করার কথা ভাবো (নতুন lecture না বানিয়ে আগে লেখা ছোট করো)।
- **অনুশীলনের উত্তর** অবশ্যই ঠিক হতে হবে; Python দিয়ে যাচাই করবে।

## ৩. Math ও সংখ্যার নিয়ম

- নতুন symbol একবারে একটাই আনবে। আগে কথায় বলবে ("error মানে prediction থেকে সঠিক মান বাদ"), তারপর symbol।
- Formula-র পরে সবসময় সংখ্যা বসিয়ে দেখাবে।
- সংখ্যা ছোট রাখবে (১, ২, ৩, ০.৫ ইত্যাদি)। ভগ্নাংশ দশমিক ২–৩ ঘর পর্যন্ত।
- **প্রতিটা সংখ্যা Python দিয়ে মিলিয়ে নেবে**, আন্দাজে লিখবে না।
- Model-এর "ফল বের করা" (output/inference), "ভুল মাপা" (loss/objective) আর "মান বদলানো" (update) সবসময় আলাদা রাখবে। [Learning Map](01-learning-map.md) দেখো।

## ৪. Code-এর নিয়ম

- **শুধু Python 3 standard library** (numpy/torch নয়, কারণ environment-এ নেই)। ছোট (৪০ লাইনের মধ্যে), comment ইংরেজি বা সহজ বাংলায়।
- Code চালিয়ে output দেখে lecture-এ `# output:` হিসেবে হুবহু বসাবে। চালানোর জন্য scratchpad ব্যবহার করবে।
- Torch/Hugging Face/PEFT-এর মতো library-র কোড দরকার হলে সেটা "ধারণা বোঝানোর pseudo-code" বলে স্পষ্ট চিহ্নিত করবে এবং চালানো হয়নি বলে জানাবে। আসল API-র নাম আন্দাজে লিখবে না।

## ৫. Mermaid-এর নিয়ম

- Node label সবসময় `"..."` এর ভেতরে।
- `Loop`, `end`, `Note`, `participant`-এর মতো reserved শব্দ node/participant-এর নাম হিসেবে নয়।
- `flowchart LR/TD` বা `sequenceDiagram` — সহজ ধরনই ব্যবহার করবে।

## ৬. File ও link-এর নিয়ম

- File নাম: `lecture-NN-<slug>.md`। নাম বদলাবে না, আর নতুন lecture-এর জন্য নিচের তালিকার নামই ব্যবহার করবে।
- নিজের module-এর বাইরের কোনো file **বদলাবে না**। অন্য module-এর lecture-এ link দিতে পারো, কিন্তু শুধু নিচের তালিকার নামে।
- প্রতিটা lecture-এর শুরুর `> আগে যা জানা...` লাইনে অন্তত একটা আগের lecture-এর link থাকবে (প্রথম lecture হলে শুধু কী লাগবে তা লিখবে)।
- Module-এর `README.md` হালনাগাদ করবে: Status, lecture-এর সারণি (নাম, এক লাইনের বিবরণ, link), আর "কোন ক্রমে পড়বে"।
- **Bengali file লেখার নিয়ম:** Edit tool বাংলা অক্ষরে (ড়, য়, ঢ় ইত্যাদি) ব্যর্থ হতে পারে। তাই যেসব file ভেতর থেকে বদলাবে সেগুলো আগে পুরো পড়ে নাও, তারপর **সম্পূর্ণ file `Write` দিয়ে নতুন করে লিখবে**। শেষে নিজের সব file NFC normalize করবে:
  **আগে পড়ো, তারপর লেখো** (উল্টো করলে file খালি হয়ে যায়)। এই কমান্ডটাই ব্যবহার করো, নিজে বানিয়ে নয়:
  `python3 - file1 file2 <<'EOF'` — বদলে সরাসরি এই script দাও:
  ```bash
  python3 -c "import sys,unicodedata as u
for p in sys.argv[1:]:
    t=u.normalize('NFC',open(p,encoding='utf-8').read())
    assert t.strip(),p
    open(p,'w',encoding='utf-8').write(t)" file1 file2
  ```
  চালানোর আগে file-গুলোর একটা backup `cp` করে রাখো, আর পরে `wc -c` দিয়ে দেখো কোনো file ০ byte হয়নি।

## ৭. পুরনো lecture নতুন করে লেখার নিয়ম

- File-এর নাম ও মূল বিষয় একই থাকবে; ভাষা, উদাহরণ ও কাঠামো বদলে উপরের ছাঁচে আনবে।
- পুরনো নোটের সত্য তথ্য ও সংখ্যা রাখবে (Python দিয়ে আবার মিলিয়ে), কিন্তু শর্তের ভিড়, ঘন অনুচ্ছেদ আর একসঙ্গে অনেক term সরাবে।
- নোটে যা ভুল বা অস্পষ্ট পেলে ঠিক করবে এবং report-এ জানাবে।

## ৮. সব lecture-এর file-তালিকা (এই নামগুলোই ব্যবহার হবে)

পথ: `module-XX-.../lecture-NN-slug.md`। ★ = পুরনো file, নতুন করে লেখা হবে। বাকিগুলো নতুন।

**module-01-ml-fundamentals-and-math-basics:** ★01-what-is-ml, ★02-types-and-terminology, ★03-how-supervised-learning-works, ★04-how-unsupervised-learning-works, ★05-how-reinforcement-learning-works, ★06-linear-algebra-basics, ★07-probability-and-statistics-basics, ★08-calculus-intuition

**module-02-linear-regression:** ★01-prediction-weight-and-bias, ★02-error-and-mean-squared-error, ★03-gradient-descent-training, 04-many-features-and-dot-product, 05-checking-on-new-data, 06-linear-regression-in-python

**module-03-logistic-regression:** ★01-sigmoid, 02-logistic-model-and-decision-boundary, 03-log-loss, 04-logistic-training-gradient, 05-logistic-regression-in-python

**module-04-math-foundations-practice:** 01-vectors-matrices-and-shapes, 02-dot-product-and-matrix-multiplication, 03-mean-variance-and-probability, 04-derivative-and-gradient-practice

**module-05-data-preparation-and-splits:** 01-inspecting-a-dataset, 02-encoding-and-scaling, 03-train-validation-test-split, 04-data-leakage, 05-time-and-group-splits

**module-06-model-evaluation-and-baselines:** 01-baselines, 02-regression-metrics, 03-classification-metrics, 04-threshold-imbalance-and-metric-choice, 05-cross-validation-and-final-test

**module-07-generalization-and-overfitting:** 01-underfitting-and-overfitting, 02-capacity-and-data-size, 03-regularization-and-early-stopping, 04-learning-curves-and-error-analysis, 05-choosing-hyperparameters

**module-08-end-to-end-ml-project:** 01-problem-and-dataset, 02-inspect-split-preprocess, 03-baseline-and-linear-regression, 04-validation-error-analysis-final-test, 05-predicting-new-input

**module-09-model-architecture:** ★01-input-computation-output, ★02-parameters-and-hyperparameters, ★03-one-neuron, ★04-activation, ★05-hidden-layer, ★06-forward-pass, ★07-shapes-and-parameter-count, ★08-architecture-vs-training, ★09-designing-a-model-architecture; ★reference-architecture-overview.md

**module-10-neural-network-training:** ★01-loss-gradient-and-backpropagation, 02-derivative-to-gradient, 03-chain-rule, 04-backpropagation, 05-optimizer-and-learning-rate, 06-batch-step-and-epoch, 07-training-loop-and-validation, 08-neural-network-in-python; ★reference-parameter-update-timing.md

**module-11-image-representation-and-vision:** 01-pixel-and-channel, 02-image-shape-and-tensor, 03-local-pattern-and-convolution, 04-feature-map, 05-patches-and-patch-embedding, 06-encoder, 07-resize-and-preprocessing

**module-12-text-sequences-and-multimodal-models:** ★bridge-01-output-scores-and-selection.md, 01-token-and-tokenizer, 02-embedding, 03-logits-and-softmax, 04-next-token-and-cross-entropy, 05-context-and-attention, 06-transformer-block, 07-autoregressive-decoder-and-stopping, 08-image-and-text-together

**module-13-pretraining-finetuning-and-lora:** ★bridge-01-lossless-compression.md, ★01-training-and-finetuning, ★02-finetuning-methods-map, ★03-lora-forward-pass-and-activation, ★04-lora-matrix-pairs-and-effective-weights, ★05-quantization-and-qlora, 06-full-selective-and-head-training, 07-lora-rank-alpha-init-dropout, 08-target-selection-gradient-and-memory, 09-merge-save-load, 10-precision-nf4-and-qlora-practice, 11-lora-variants-rslora-adalora-dora, 12-init-variants-pissa-loftq, 13-other-peft-adapters-prompts-ia3, 14-controlled-comparison

**module-14-ocr-system-case-study:** ★01-ocr-project-architecture-and-lora, 02-image-enters-the-pipeline, 03-layout-vs-recognition, 04-encoder-decoder-in-recognition, 05-training-example-and-loss, 06-lora-config-and-parameter-count, 07-output-formatting-and-error-sources, 08-cer-wer-and-version-comparison

**module-15-domain-and-task-adaptation:** 01-pretraining-objective-and-checkpoint, 02-sft-and-instruction-tuning, 03-domain-adaptation-and-data-selection, 04-continued-pretraining-dapt-tapt, 05-multitask-and-multilingual-tuning, 06-correction-dataset-and-hard-examples, 07-forgetting-and-evaluation, 08-adaptation-experiment

**module-16-preference-learning-and-dpo:** 01-preference-data, 02-sequence-probability-and-log-ratio, 03-reference-model-and-policy, 04-dpo-objective-by-hand, 05-dpo-gradient-and-training-loop, 06-sft-reward-model-and-dpo, 07-preference-quality-and-variants, 08-small-dpo-practical-and-evaluation

**module-17-reinforcement-learning-and-feedback:** ★01-correction-target-preference-and-reward, 02-agent-environment-state-action-reward, 03-return-discount-delayed-reward, 04-policy-value-and-q-learning, 05-exploration-on-off-policy, 06-policy-gradient-and-advantage, 07-actor-critic-and-ppo, 08-policy-and-rollout-in-llm, 09-rlhf-and-reward-modeling, 10-rlaif-and-feedback-quality, 11-rlvr-and-grpo, 12-correction-and-self-correction, 13-task-case-studies, 14-domain-expert-answer-evaluation, 15-reward-hacking-and-generalization, 16-practical-and-method-selection

**module-18-knowledge-distillation:** 01-teacher-and-student, 02-response-and-sequence-distillation, 03-logits-temperature-soft-targets, 04-distillation-loss, 05-feature-and-intermediate-distillation, 06-on-policy-and-offline, 07-reasoning-data-and-verification, 08-practical-and-comparison

## ৯. কাজ শেষে report-এ কী দেবে

1. যে file লিখেছ/নতুন করে লিখেছ — একটা তালিকা (path + এক লাইনের বিবরণ)।
2. প্রতিটা নতুন lecture-এ যে নতুন term/ধারণা এসেছে।
3. পুরনো নোটে যা ভুল/অস্পষ্ট পেয়ে ঠিক করেছ।
4. যা যাচাই করতে পারোনি বা ঝুঁকি আছে (যেমন চালাতে না পারা code)।
5. অন্য module-এর কাছে তোমার কোনো অনুরোধ (যেমন "Module X-এ এই term আগে আসা দরকার")।
