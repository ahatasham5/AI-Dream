# Module 10 — Neural Network Training

[কেন্দ্রীয় Model ও Math Map](../01-learning-map.md) · [Course Outline](../00-course-outline.md) · [লেখার নিয়ম](../00-writing-style-guide.md)

## Status: 8টি ছোট lecture ও 1টি reference লেখা হয়েছে

Network কীভাবে শেখে, তা ছোট সংখ্যার উদাহরণে ধাপে ধাপে দেখা হয়েছে: loss → gradient → chain rule → backpropagation → optimizer → batch ও epoch → validation → পূর্ণ ছোট network-এর code। সব সংখ্যা Python দিয়ে মেলানো। লেখা আছে মানেই শেখা শেষ নয়; পড়া ও অনুশীলন বাকি।

## আগে যা পরিষ্কার থাকলে ভালো

- [Module 09 — Forward pass](../module-09-model-architecture/lecture-06-forward-pass.md) ও [shape/parameter count](../module-09-model-architecture/lecture-07-shapes-and-parameter-count.md)
- [Module 02 — MSE](../module-02-linear-regression/lecture-02-error-and-mean-squared-error.md) ও [gradient descent](../module-02-linear-regression/lecture-03-gradient-descent-training.md)
- Derivative অস্পষ্ট লাগলে [Module 04 — Derivative ও gradient অনুশীলন](../module-04-math-foundations-practice/lecture-04-derivative-and-gradient-practice.md)

## Lecture ক্রম

| ক্রম | Lecture | এক লাইনে |
|---|---|---|
| 01 | [Network কীভাবে শেখে: পুরো ছবিটা](lecture-01-loss-gradient-and-backpropagation.md) | Forward → loss → gradient → update চক্র; একটি weight-এর update |
| 02 | [Derivative থেকে gradient](lecture-02-derivative-to-gradient.md) | Parameter ঠেলে loss-এর পরিবর্তন মাপা; gradient = সব derivative একসঙ্গে |
| 03 | [Chain rule](lecture-03-chain-rule.md) | পরপর ধাপের derivative গুণ করে জোড়া লাগানো; দুই পথের যোগ |
| 04 | [Backpropagation](lecture-04-backpropagation.md) | `2 → 2 → 1` network-এর 9টি gradient পেছন থেকে হাতে ও code-এ |
| 05 | [Optimizer ও learning rate](lecture-05-optimizer-and-learning-rate.md) | Gradient descent, learning rate-এর প্রভাব, momentum ও Adam কোন অংশ বদলায় |
| 06 | [Sample, batch, step ও epoch](lecture-06-batch-step-and-epoch.md) | Mini-batch training-এর সময়ক্রম ও step গোনা |
| 07 | [Training loop ও validation](lecture-07-training-loop-and-validation.md) | Validation loss, overfitting ও early stopping |
| 08 | [Pure Python-এ Neural Network](lecture-08-neural-network-in-python.md) | XOR-এর ছোট network শুরু থেকে train; loss কমতে দেখা |

## কোন ক্রমে পড়বে

**01 → 02 → 03 → 04 → 05 → 06 → 07 → 08।** প্রতিটা lecture আগেরটার উপর দাঁড়িয়ে। 01 থেকে 04 হলো "gradient কীভাবে পাওয়া যায়", 05 থেকে 07 হলো "gradient দিয়ে কীভাবে training চলে", 08-এ সব একসঙ্গে। Derivative-এ আটকে গেলে 02–03-এর আগে Module 04-এর অনুশীলন দেখো।

## সংরক্ষিত Reference

- [Parameter কখন বদলায়, আর কতগুলো থাকে](reference-parameter-update-timing.md) — মান বনাম সংখ্যা, update-এর সময়, gradient জমানো; Lecture 06-এর পর

## এরপর

[Module 11 — Image representation](../module-11-image-representation-and-vision/README.md) এবং [Module 12 — Text ও multimodal](../module-12-text-sequences-and-multimodal-models/README.md): ছবি ও লেখা কীভাবে সংখ্যা হয়ে এই ধরনের network-এ ঢোকে। Overfitting, regularization ও validation-এর গভীর আলোচনা [Module 07](../module-07-generalization-and-overfitting/README.md)-এ।
