# Module 09 — Model Architecture: ছোট ধাপে শেখা

[কেন্দ্রীয় Model ও Math Map](../01-learning-map.md) · [Course Outline](../00-course-outline.md) · [লেখার নিয়ম](../00-writing-style-guide.md)

## Status: বর্তমান মূল পাঠ — নতুন করে সহজ ভাষায় লেখা

৯টা ছোট lecture আর একটা reference পাতা প্রস্তুত। প্রতিটা lecture-এ একটাই ধারণা, ছোট সংখ্যার হাতে-হিসাব, কোড (Python 3, শুধু standard library) আর উত্তরসহ অনুশীলন আছে। সব সংখ্যা Python দিয়ে মিলিয়ে নেওয়া হয়েছে। লেখা আছে মানেই শেখা শেষ নয়; পড়া ও অনুশীলন বাকি ধরা হচ্ছে।

গোটা module জুড়ে একটাই ছোট network চলে: `2 → 2 → 1`। Input `[2, 1]` থেকে hidden `[3, 0]`, তারপর output `7`।

## Lecture-এর তালিকা

| # | Lecture | এক লাইনে |
|---|---|---|
| 01 | [Input, হিসাব, Output](lecture-01-input-computation-output.md) | Model-এর তিন অংশ আলাদা করা |
| 02 | [Parameters](lecture-02-parameters-and-hyperparameters.md) | Input থেকে আলাদা, শেখা মান; মান বনাম সংখ্যা |
| 03 | [একটি Unit](lecture-03-one-neuron.md) | কয়েকটা input থেকে একটা score |
| 04 | [Activation](lecture-04-activation.md) | ReLU, sigmoid, আর কেন activation লাগে |
| 05 | [পাশাপাশি Unit ও পরপর Layer](lecture-05-hidden-layer.md) | Hidden layer, আর পরের layer-এর input কোথা থেকে আসে |
| 06 | [Forward Pass](lecture-06-forward-pass.md) | `2 → 2 → 1` network-এর পুরো হিসাব (কোডসহ) |
| 07 | [Shape ও Parameter Count](lecture-07-shapes-and-parameter-count.md) | `(input + 1) × unit` আর shape-এর মিল |
| 08 | [Architecture, Parameters ও Training](lecture-08-architecture-vs-training.md) | গঠন, মান আর শেখানো আলাদা করা |
| 09 | [Architecture বেছে নেওয়া](lecture-09-designing-a-model-architecture.md) | Output থেকে শুরু করে validation পর্যন্ত পাঁচ প্রশ্ন |

## কোন ক্রমে পড়বে

Lecture 01 থেকে 09, নম্বরের ক্রমে। প্রতিটা lecture আগেরটার উপর দাঁড়িয়ে আছে, তাই মাঝখান থেকে শুরু না করাই ভালো। কোনো lecture কঠিন লাগলে আগের lecture-এর "নিজে করো" অংশ আবার করে দেখো।

সব lecture শেষে [এক-পাতার মানচিত্র](reference-architecture-overview.md) ফিরে দেখার জন্য। এটা প্রথম পাঠ নয়।

## এরপর

[Module 10 — Neural Network Training](../module-10-neural-network-training/README.md)। তার আগে দরকার হলে [Module 02-এর MSE ও gradient descent](../module-02-linear-regression/README.md) দেখে নিয়ো। বাস্তব project-এর উদাহরণ পাবে [Module 14 — OCR Case Study](../module-14-ocr-system-case-study/README.md)-এ।
