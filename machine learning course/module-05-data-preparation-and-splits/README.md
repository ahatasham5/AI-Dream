# Module 05 — Data Preparation, Data Splits ও Leakage

[কেন্দ্রীয় Model ও Math Map](../01-learning-map.md) · [Course Outline](../00-course-outline.md)

## Status: ৫টি lecture লেখা হয়েছে — পড়া ও অনুশীলন বাকি

Model-কে শেখানোর আগে data দেখা, সংখ্যায় আনা, ভাগ করা এবং ভাগের সময় ভুল তথ্য ঢুকে পড়া ঠেকানো। প্রতিটা lecture-এ একটা ছোট dataset নিয়ে হাতে হিসাব ও চালানো Python code আছে। লেখা আছে মানেই শেখা শেষ নয়; অনুশীলন নিজে করে দেখতে হবে।

## Lectures

| # | Lecture | এক লাইনে |
|---|---|---|
| 01 | [Dataset পরিদর্শন](lecture-01-inspecting-a-dataset.md) | Feature/target, missing value, অসম্ভব মান খোঁজা; row বাদ দেওয়া বা median দিয়ে ভরা |
| 02 | [Encoding ও Scaling](lecture-02-encoding-and-scaling.md) | One-hot encoding; min-max ও standardization; scaling না করলে gradient কেন বিশাল হয় |
| 03 | [Train, Validation ও Test](lecture-03-train-validation-test-split.md) | তিন ভাগের আলাদা ভূমিকা; shuffle ও seed; মুখস্থ-model-এর ফাঁদ |
| 04 | [Data Leakage](lecture-04-data-leakage.md) | Target leakage ও preprocessing leakage; আগে split, তারপর শুধু train থেকে fit |
| 05 | [Time ও Group Split](lecture-05-time-and-group-splits.md) | কখন এলোমেলো ভাগ ভুল; সময় ও group ধরে ভাগ |

## কোন ক্রমে পড়বে

১ → ২ → ৩ → ৪ → ৫, ক্রম ধরে। প্রতিটার শেষে "নিজে করো" হিসাব করে তারপর পরেরটায় যাও। Lecture 04 ও 05 বুঝতে Lecture 03-এর তিন ভাগের ধারণা আগে লাগবে।

আগে লাগবে: [Module 01 — Terminology](../module-01-ml-fundamentals-and-math-basics/lecture-02-types-and-terminology.md) আর [Module 02 — MSE](../module-02-linear-regression/lecture-02-error-and-mean-squared-error.md)। এর পরে: [Module 06 — Model Evaluation ও Baselines](../module-06-model-evaluation-and-baselines/README.md)।
