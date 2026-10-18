# Module 03 — Logistic Regression

[কেন্দ্রীয় Model ও Math Map](../01-learning-map.md) · [Course Outline](../00-course-outline.md) · [লেখার নিয়ম](../00-writing-style-guide.md)

## Status: ৫টি lecture লেখা হয়েছে — 2026-10-15

"হ্যাঁ না কি না" ধরনের (দুই class-এর) প্রশ্নের জন্য Logistic Regression: score থেকে probability, probability থেকে সিদ্ধান্ত, ভুল মাপা (log loss), শেখানো (gradient descent) ও Python-এ পুরো পথ। Lecture লেখা হয়েছে মানে পড়া বা অনুশীলন সম্পন্ন হয়েছে এমন নয়।

## Lectures

| # | Lecture | এক লাইনে |
|---|---|---|
| 01 | [Sigmoid](lecture-01-sigmoid.md) | যেকোনো score-কে 0–1 probability বানানো; 0.5 সীমা |
| 02 | [Logistic model ও decision boundary](lecture-02-logistic-model-and-decision-boundary.md) | `z → p → class` পুরো output-পথ; boundary কোথায়, সীমা বদলালে কী হয় |
| 03 | [Log loss](lecture-03-log-loss.md) | ভুল মাপার নিয়ম; সংখ্যার উদাহরণে কেন MSE নয় |
| 04 | [Gradient descent দিয়ে training](lecture-04-logistic-training-gradient.md) | `error = p − y` দিয়ে gradient ও এক-দুই ধাপ হাতে update; Linear Regression-এর সঙ্গে তুলনা |
| 05 | [Python-এ Logistic Regression](lecture-05-logistic-regression-in-python.md) | Library ছাড়া training, ফল পড়া ও নতুন input-এ prediction |

## কোন ক্রমে পড়বে

1. আগে [Module 02-এর Linear Regression](../module-02-linear-regression/README.md) (prediction, MSE, gradient descent)।
2. তারপর এই module-এর 01 → 05 ক্রমে। প্রতিটা lecture আগেরটার উপর দাঁড়িয়ে।
3. Vector, mean বা derivative-এ আটকে গেলে [Module 04-এর অনুশীলন](../module-04-math-foundations-practice/README.md)।

## এক নজরে: Linear বনাম Logistic Regression

| | Linear Regression | Logistic Regression |
|---|---|---|
| কাজ | সংখ্যা predict | দুই class-এর probability ও সিদ্ধান্ত |
| Output | `w × x + b` | `σ(w × x + b)` |
| ভুল মাপা | MSE | log loss |
| Update | gradient descent | gradient descent (একই নিয়ম) |

পরে Module 06-এ classification-এর মাপকাঠি (accuracy-র বাইরে) ও সীমা বাছাই আসবে।
