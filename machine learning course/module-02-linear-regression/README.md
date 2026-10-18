# Module 02 — Linear Regression

[কেন্দ্রীয় Model ও Math Map](../01-learning-map.md) · [Course Outline](../00-course-outline.md) · [লেখার নিয়ম](../00-writing-style-guide.md)

## Status: ৬টা lecture সহজ ভাষায় লেখা (২০২৬-১০-১৫); পড়া ও অনুশীলন সম্পন্ন ধরা হচ্ছে না

[Module 01](../module-01-ml-fundamentals-and-math-basics/README.md)-এর ধারণা (parameter, loss, slope) একটা আসল model, Linear Regression-এ বসানো হয়েছে। প্রথমে অনুমান বের করা, তারপর ভুল মাপা, তারপর parameter শেখানো, শেষে নতুন data-য় যাচাই ও Python-এ সম্পূর্ণ code।

## আগে কী লাগবে

Module 01-এর Lecture 03 (training-এর তিন ধাপ), 06 (dot product) ও 08 (slope ও gradient descent)। Lecture 07 (mean) পড়া থাকলে MSE সহজ লাগবে।

## Lectures

| # | Lecture | এক লাইনে | Model-এর কোন কাজ |
|---|---|---|---|
| 01 | [Prediction, Weight ও Bias](lecture-01-prediction-weight-and-bias.md) | `ŷ = w × x + b` দিয়ে অনুমান বের করা | Output |
| 02 | [Error ও Mean Squared Error](lecture-02-error-and-mean-squared-error.md) | অনুমানের ভুল মাপা, MSE হাতে হিসাব | ভুল মাপা (loss) |
| 03 | [Gradient Descent](lecture-03-gradient-descent-training.md) | Slope দেখে `w`, `b` update; MSE 6.5 থেকে 0.65 | Update |
| 04 | [অনেক Feature ও Dot Product](lecture-04-many-features-and-dot-product.md) | প্রতি feature-এর আলাদা weight; এক ধাপ update | Output ও update, একাধিক feature |
| 05 | [নতুন Data-তে যাচাই](lecture-05-checking-on-new-data.md) | Train ও test MSE; মুখস্থ করা model-এর সমস্যা | মূল্যায়ন (প্রথম ধারণা) |
| 06 | [Python-এ Linear Regression](lecture-06-linear-regression-in-python.md) | Library ছাড়া training loop; চালানো output সহ | সব একসঙ্গে |

## কোন ক্রমে পড়বে

1. Lecture 01 → 02 → 03: এক feature নিয়ে পুরো চক্র (অনুমান, ভুল, update)।
2. Lecture 04: একই চক্র অনেক feature-এ।
3. Lecture 05: model আসলেই ভালো কি না কীভাবে জানব।
4. Lecture 06: সব মিলিয়ে নিজে code চালানো। এটা পড়ার সময় আগের lecture-এর হাতের হিসাবের সঙ্গে output মিলিয়ে দেখো।

প্রতিটা lecture-এর "নিজে করো" নিজে করে তারপর উত্তর খুলে মিলাবে।

## পরের ধাপ

- উত্তর "হ্যাঁ/না" ধরনের category হলে: [Module 03 — Logistic Regression](../module-03-logistic-regression/README.md)।
- Data ভাগ করা, scale ঠিক করা ও leakage: [Module 05](../module-05-data-preparation-and-splits/README.md)।
- Evaluation-এর বিস্তারিত (baseline, metric, cross-validation): [Module 06](../module-06-model-evaluation-and-baselines/README.md)।
- Overfitting ও regularization: [Module 07](../module-07-generalization-and-overfitting/README.md)।
