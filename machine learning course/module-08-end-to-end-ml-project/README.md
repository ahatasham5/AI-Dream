# Module 08 — End-to-End ML Project — Python Practical

[কেন্দ্রীয় Model ও Math Map](../01-learning-map.md) · [Course Outline](../00-course-outline.md) · [Writing Style Guide](../00-writing-style-guide.md)

## Status: ৫টি lecture লেখা হয়েছে — পড়া ও অনুশীলন বাকি

একটাই ছোট regression project, ধাপে ধাপে: ফ্ল্যাটের আকার আর ঘরের সংখ্যা থেকে মাসিক ভাড়া অনুমান। ৪০টা সারির dataset code দিয়েই বানানো হয় (seed স্থির), তাই সবার ফল এক। পাঁচটা lecture-এর code জুড়লে একটা চলমান script হয়; সেটা [Lecture 05](lecture-05-predicting-new-input.md)-এ একটাই code block-এ আছে। সব code Python 3.12-এ চালিয়ে output বসানো হয়েছে, আর পুরো script-এর output প্রতিটা lecture-এর output-এর সমষ্টির সঙ্গে মিলিয়ে দেখা হয়েছে। লেখা হয়েছে মানেই শেখা হয়েছে নয়।

## Lecture-এর তালিকা

| # | Lecture | এক লাইনে |
|---|---|---|
| 01 | [সমস্যা ও dataset](lecture-01-problem-and-dataset.md) | Feature, target, সফলতার মাপকাঠি ঠিক করা; seed-সহ data বানানো |
| 02 | [পরিদর্শন, split, preprocessing](lecture-02-inspect-split-preprocess.md) | Data দেখা, ২৪/৮/৮ ভাগ, train থেকে median ও scale শেখা |
| 03 | [Baseline ও Linear Regression](lecture-03-baseline-and-linear-regression.md) | গড়-বলা baseline আর gradient descent দিয়ে দুই feature-এর model |
| 04 | [Validation, error analysis, final test](lecture-04-validation-error-analysis-final-test.md) | Validation-এ তুলনা, ভুলের সারি ঘাঁটা, test একবার |
| 05 | [নতুন input-এর prediction](lecture-05-predicting-new-input.md) | শেখা preprocessing দিয়ে নতুন ফ্ল্যাটের ভাড়া; পুরো script |

## কোন ক্রমে পড়বে

**01 → 02 → 03 → 04 → 05**। প্রতিটা lecture-এর code আগের code-এর নিচে বসে; তাই ক্রম ভাঙলে চলবে না। শেষ lecture-এর পুরো script একটা file-এ রেখে একবারে চালানো যায়।

## আগে কী জানা থাকলে ভালো

- [Module 02: Linear Regression](../module-02-linear-regression/README.md)
- Module 05 ([data পরিদর্শন, scaling, split, leakage](../module-05-data-preparation-and-splits/lecture-03-train-validation-test-split.md)) আর Module 06 ([baseline, metric, test](../module-06-model-evaluation-and-baselines/lecture-01-baselines.md))
- Module 07 ([overfitting, validation দিয়ে বাছাই](../module-07-generalization-and-overfitting/README.md))

Module 05 ও 06 না পড়া থাকলেও চলবে: এই project-এর প্রতিটা lecture-এ দরকারি ধারণা সংক্ষেপে আবার বলা আছে।

## এরপর কোথায়

একই কাঠামোয় আরও জটিল model: [Module 09 — Model architecture](../module-09-model-architecture/README.md), তারপর [Module 10 — Neural network training](../module-10-neural-network-training/README.md)।
