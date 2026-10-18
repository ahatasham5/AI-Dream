# Module 04 — Math Foundations: হাতে-কলমে অনুশীলন

[কেন্দ্রীয় Model ও Math Map](../01-learning-map.md) · [Course Outline](../00-course-outline.md) · [লেখার নিয়ম](../00-writing-style-guide.md)

## Status: ৪টি অনুশীলন-lecture লেখা হয়েছে — 2026-10-15

[Module 01-এর math পরিচিতি](../module-01-ml-fundamentals-and-math-basics/lecture-06-linear-algebra-basics.md) আবার লেখা হয়নি। এখানে শুধু হাতে-কলমে অনুশীলন, আর প্রতিটা ধারণা ML-এর কোথায় লাগে তা। প্রতিটা lecture-এ অন্তত ৫টা অনুশীলন, উত্তরসহ। Lecture লেখা হয়েছে মানে অনুশীলন করা হয়েছে এমন নয়।

## Lectures

| # | Lecture | এক লাইনে | ML-এ কোথায় লাগে |
|---|---|---|---|
| 01 | [Vector, matrix ও shape](lecture-01-vectors-matrices-and-shapes.md) | Shape গোনা, transpose, vector-এর যোগ ও scalar গুণ | ডেটা `(n, d)`, weight `(d,)`, `w − α × g` |
| 02 | [Dot product ও matrix multiplication](lecture-02-dot-product-and-matrix-multiplication.md) | Dot product, shape-এর নিয়ম, `Xw + b`, sigmoid | Linear ও Logistic Regression-এর score |
| 03 | [Mean, variance ও probability](lecture-03-mean-variance-and-probability.md) | গড়, ছড়ানো, count থেকে probability | MSE, standardization, log loss |
| 04 | [Derivative ও gradient](lecture-04-derivative-and-gradient-practice.md) | ঢাল, partial derivative, সংখ্যা দিয়ে যাচাই, এক ধাপ update | Gradient descent |

## কোন ক্রমে পড়বে

1. 01 → 02 → 03 → 04 ক্রমে; প্রতিটার অনুশীলন নিজে করে তারপর উত্তর দেখা।
2. Module 02 ও 03-এর কোনো হিসাবে আটকে গেলে এই module-এর সংশ্লিষ্ট lecture-এ ফিরে আসা যায় (যেমন gradient-এ আটকালে 04, `Xw + b`-তে 02)।
3. তারপর [Module 05 — Data preparation](../module-05-data-preparation-and-splits/README.md)।

সব ধারণা Python-এর standard library দিয়ে যাচাই করা, কোনো বাইরের library লাগে না।
