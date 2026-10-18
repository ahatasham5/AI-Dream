# Module 01 — ML Fundamentals ও Math Basics

[কেন্দ্রীয় Model ও Math Map](../01-learning-map.md) · [Course Outline](../00-course-outline.md) · [লেখার নিয়ম](../00-writing-style-guide.md)

## Status: সহজ ভাষায় নতুন করে লেখা হয়েছে (২০২৬-১০-১৫); পড়া ও অনুশীলন সম্পন্ন ধরা হচ্ছে না

প্রতিটা lecture ছোট: একটা ধারণা, ছোট সংখ্যার উদাহরণ, আর শেষে "নিজে করো"। কোনো গণিত-পটভূমি ধরে নেওয়া হয়নি।

## কী শিখবে

- ML কী, কেন লাগে, আর তিন ধরনের শেখা
- Supervised, unsupervised ও reinforcement learning ভেতরে কীভাবে কাজ করে (ছোট সংখ্যার হিসাবে)
- দরকারি গণিত: vector ও matrix, mean ও probability, slope ও gradient descent

## Lectures

| # | Lecture | এক লাইনে |
|---|---|---|
| 01 | [Machine Learning কী?](lecture-01-what-is-ml.md) | Rule হাতে লেখা বনাম উদাহরণ থেকে শেখা; training ও prediction |
| 02 | [ML-এর তিন ধরন ও দরকারি শব্দ](lecture-02-types-and-terminology.md) | Supervised, unsupervised, RL; feature, label, model |
| 03 | [Supervised Learning কীভাবে শেখে](lecture-03-how-supervised-learning-works.md) | Guess, ভুল মাপা (loss), parameter update; train ও test-এর প্রথম ধারণা |
| 04 | [Unsupervised Learning: K-Means](lecture-04-how-unsupervised-learning-works.md) | কাছের কেন্দ্র বাছা ও গড় দিয়ে কেন্দ্র সরানো; হাতে হিসাব |
| 05 | [Reinforcement Learning: Q-learning](lecture-05-how-reinforcement-learning-works.md) | State, action, reward; Q-table ও এক ধাপ update |
| 06 | [Linear Algebra: Vector, Dot Product ও Matrix](lecture-06-linear-algebra-basics.md) | `Xw + b` হাতে হিসাব; কোন model-এ লাগে, কোনটায় লাগে না |
| 07 | [Mean, ছড়ানো ও Probability](lecture-07-probability-and-statistics-basics.md) | Mean, variance, probability, standardization |
| 08 | [Slope ও Gradient Descent](lecture-08-calculus-intuition.md) | Slope দেখে parameter বদলানো; learning rate |

## কোন ক্রমে পড়বে

1. Lecture 01 → 02 → 03: ML-এর মূল ধারণা। এটুকু পড়েই [Module 02](../module-02-linear-regression/README.md) শুরু করা যায়।
2. Lecture 06 → 07 → 08: Module 02 পড়ার সময় যে গণিত লাগবে। Lecture 08 Module 02-এর Lecture 03-এর আগে পড়ে নেওয়া ভালো।
3. Lecture 04 ও 05 (K-Means, Q-learning) ঐচ্ছিক শাখা: unsupervised আর RL-এর স্বাদ। পরের Module 02, 03 পড়ার জন্য এগুলো জরুরি নয়; Module 17 শুরুর আগে Lecture 05 দেখে নিও।

## পরের ধাপ

গণিতের হাতে-কলমে অনুশীলন [Module 04](../module-04-math-foundations-practice/README.md)-এ পরিকল্পিত। এই module-এর lecture পড়া মানেই বিষয়টা আয়ত্ত হওয়া নয়; "নিজে করো" অংশের সমাধান নিজে করে দেখাই আসল পরীক্ষা।
