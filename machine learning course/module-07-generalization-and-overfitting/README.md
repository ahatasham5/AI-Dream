# Module 07 — Generalization ও Overfitting নিয়ন্ত্রণ

[কেন্দ্রীয় Model ও Math Map](../01-learning-map.md) · [Course Outline](../00-course-outline.md) · [Writing Style Guide](../00-writing-style-guide.md)

## Status: ৫টি lecture লেখা হয়েছে — পড়া ও অনুশীলন বাকি

এই module-এর প্রশ্ন একটাই: model নতুন data-তেও ভালো করছে কি না, আর না করলে কী করব। প্রতিটা lecture-এ ছোট polynomial-এর উদাহরণে train error আর validation error সংখ্যায় পাশাপাশি দেখানো হয়েছে। সব code Python 3 standard library দিয়ে চালিয়ে output বসানো হয়েছে। লেখা হয়েছে মানেই শেখা হয়েছে নয়।

## Lecture-এর তালিকা

| # | Lecture | এক লাইনে |
|---|---|---|
| 01 | [Underfitting আর Overfitting](lecture-01-underfitting-and-overfitting.md) | Train আর validation error পাশাপাশি দেখে তিন অবস্থা চেনা |
| 02 | [Capacity ও data-র পরিমাণ](lecture-02-capacity-and-data-size.md) | Model জটিল করলে error-এর U-আকৃতি; data বাড়ালে overfitting কমা |
| 03 | [Regularization ও early stopping](lecture-03-regularization-and-early-stopping.md) | L2 penalty হাতে হিসাব; validation দেখে training থামানো |
| 04 | [Learning curve ও error analysis](lecture-04-learning-curves-and-error-analysis.md) | আরও data লাগবে না আরও জটিল model, তা বোঝা; ভুলের ছক খোঁজা |
| 05 | [Hyperparameter বাছাই](lecture-05-choosing-hyperparameters.md) | Validation দিয়ে বাছা, test একবার |

## কোন ক্রমে পড়বে

**01 → 02 → 03 → 04 → 05**, ক্রমানুসারে। প্রতিটা lecture আগের lecture-এর উদাহরণ ও helper code ব্যবহার করে: Lecture 01-এ দেওয়া `fit`, `predict`, `mse`, `make_data` ফাংশন বাকি চারটাতে আবার লাগে।

## আগে কী জানা থাকলে ভালো

- [Module 01: Underfitting/overfitting-এর প্রথম পরিচয়](../module-01-ml-fundamentals-and-math-basics/lecture-03-how-supervised-learning-works.md)
- [Module 02: MSE](../module-02-linear-regression/lecture-02-error-and-mean-squared-error.md) ও [gradient descent](../module-02-linear-regression/lecture-03-gradient-descent-training.md)
- [Module 05: Train/validation/test split](../module-05-data-preparation-and-splits/lecture-03-train-validation-test-split.md) এবং [Module 06: Baseline](../module-06-model-evaluation-and-baselines/lecture-01-baselines.md)

## এরপর কোথায়

এই module-এর ধারণা ব্যবহার করে [Module 08 — End-to-end ML project](../module-08-end-to-end-ml-project/README.md)।
