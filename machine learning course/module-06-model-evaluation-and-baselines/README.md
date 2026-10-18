# Module 06 — Model Evaluation ও Baselines

[কেন্দ্রীয় Model ও Math Map](../01-learning-map.md) · [Course Outline](../00-course-outline.md)

## Status: ৫টি lecture লেখা হয়েছে — পড়া ও অনুশীলন বাকি

Model কতটা ভালো, তা বোঝার মাপকাঠি ও মাপের পদ্ধতি: সহজ baseline, regression ও classification metric, threshold, এবং নির্ভরযোগ্য মূল্যায়নের নিয়ম। [Module 05](../module-05-data-preparation-and-splits/README.md)-এর train/validation/test ভাগের ধারণা এখানে ব্যবহার হয়। প্রতিটা lecture-এ ছোট dataset নিয়ে হাতে হিসাব ও চালানো Python code আছে। লেখা আছে মানেই শেখা শেষ নয়।

## Lectures

| # | Lecture | এক লাইনে |
|---|---|---|
| 01 | [Baseline](lecture-01-baselines.md) | সবচেয়ে সহজ নিয়ম (গড়, majority class) দিয়ে model-এর ফলকে অর্থপূর্ণ করা |
| 02 | [Regression Metrics](lecture-02-regression-metrics.md) | MAE, MSE, RMSE ও R²; একই prediction থেকে হাতে হিসাব |
| 03 | [Classification Metrics](lecture-03-classification-metrics.md) | Confusion matrix, accuracy, precision, recall ও F1 |
| 04 | [Threshold, Imbalance ও Metric বাছা](lecture-04-threshold-imbalance-and-metric-choice.md) | Threshold বদলালে precision/recall; imbalanced data-য় accuracy-র ফাঁদ; কাজ অনুযায়ী metric |
| 05 | [Cross-validation ও Final Test](lecture-05-cross-validation-and-final-test.md) | k-fold CV; test set একবারই ব্যবহার; ছোট test-এর সীমাবদ্ধতা |

## কোন ক্রমে পড়বে

১ → ২ → ৩ → ৪ → ৫, ক্রম ধরে। Regression নিয়ে কাজ হলে ১ ও ২ আগে, Classification-এ ১, ৩ ও ৪। Lecture 05 সব কাজেই লাগে।

আগে লাগবে: [Module 05-এর Lecture 03 (split)](../module-05-data-preparation-and-splits/lecture-03-train-validation-test-split.md) আর Lecture 04 (leakage)। Lecture 04-এ model-এর probability বোঝার জন্য [Sigmoid](../module-03-logistic-regression/lecture-01-sigmoid.md)-এর ধারণা কাজে লাগে। এর পরে: [Module 07 — Generalization ও Overfitting](../module-07-generalization-and-overfitting/README.md)।
