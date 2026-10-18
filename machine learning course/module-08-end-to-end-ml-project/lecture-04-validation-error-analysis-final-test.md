# Lecture 04 — Validation, error analysis আর final test

> আগে যা জানা থাকলে ভালো: [Lecture 03 — Baseline ও Linear Regression](lecture-03-baseline-and-linear-regression.md), [Underfitting আর Overfitting](../module-07-generalization-and-overfitting/lecture-01-underfitting-and-overfitting.md) আর [Final test](../module-06-model-evaluation-and-baselines/lecture-05-cross-validation-and-final-test.md)। এই lecture শেষে পারবে: validation-এ model আর baseline তুলনা করতে, ভুলগুলো সারি ধরে দেখতে, আর test set একবারই ব্যবহার করে চূড়ান্ত ফল জানাতে।

## সমস্যাটা কী?

Train-এর error ভালো দেখাচ্ছে (RMSE `1.17`)। কিন্তু model যে data দিয়ে শিখেছে, সেখানে ভালো করা প্রত্যাশিত। আসল প্রশ্ন: নতুন ফ্ল্যাটে কেমন? আবার শুধু একটা গড় সংখ্যা দেখে বোঝা যায় না কোন ফ্ল্যাটে model কেন ভুল করছে। আর test set যদি বারবার দেখি, সেটাও আর নিরপেক্ষ থাকে না ([Module 07: Hyperparameter বাছাই](../module-07-generalization-and-overfitting/lecture-05-choosing-hyperparameters.md))। প্রতিটা প্রকৃত project-এ এই তিনটা ধাপ থাকে।

## ধারণাটা সহজ ভাষায়

তিন ধাপ, এই ক্রমে:

1. **Validation-এ তুলনা:** model-এর MAE/RMSE কি baseline-এর চেয়ে ভালো? train error-এর সঙ্গে validation error-এর ফারাক কত? (Validation অনেক বেশি হলে overfitting, [Module 07](../module-07-generalization-and-overfitting/lecture-01-underfitting-and-overfitting.md)।)
2. **Error analysis:** validation-এর প্রতিটা ফ্ল্যাটের prediction, আসল ভাড়া আর error পাশাপাশি দেখা। কোনটায় সবচেয়ে বেশি ভুল? ভুলগুলো কি এলোমেলো, নাকি কোনো ছক আছে (যেমন সবসময় বড় ফ্ল্যাটে কম বলা)? ([Module 07: Error analysis](../module-07-generalization-and-overfitting/lecture-04-learning-curves-and-error-analysis.md))।
3. **Final test:** সন্তুষ্ট হলে test set-এ **একবার** model মাপা। এই সংখ্যাই বাইরে জানানো হয়। এরপর test দেখে model বদলানো চলবে না।

## ছোট একটা উদাহরণ

Validation-এর দুটো ফ্ল্যাট (নিচের কোডের table থেকে, এক দশমিক পর্যন্ত):

- ফ্ল্যাট ক: আসল `15.2`, prediction `14.2`, error `14.2 − 15.2 = −1.0`
- ফ্ল্যাট খ: আসল `23.5`, prediction `24.3`, error `24.3 − 23.5 = +0.8`

এই দুটোতে MAE `= (1.0 + 0.8)/2 = 0.9`। RMSE `= √((1.0 + 0.64)/2) ≈ 0.906`। পুরো ৮টার ফল কোড দেবে।

## কোড

আগের lecture-গুলোর code-এর নিচে বসাও। ধাপ ১: train আর validation-এ model, এবং baseline।

```python
tr_pred = [predict(w, b, x) for x in Xtr]
va_pred = [predict(w, b, x) for x in Xva]
print(f"model    train RMSE={rmse(tr_pred, ytr):.2f}   val MAE={mae(va_pred, yva):.2f}  RMSE={rmse(va_pred, yva):.2f}")
print(f"baseline                    val MAE={mae(base_val, yva):.2f}  RMSE={rmse(base_val, yva):.2f}")

# output:
# model    train RMSE=1.17   val MAE=0.75  RMSE=0.78
# baseline                    val MAE=4.45  RMSE=4.94
```

- Model-এর validation RMSE `0.78`, baseline-এর `4.94`। Model প্রায় ৬ গুণ ভালো।
- Validation error train error-এর (`1.17`) চেয়ে **কম**। Overfitting-এ উল্টোটা হয় (validation অনেক বেশি)। এখানে সেটা নেই। Validation কম আসার কারণ সম্ভবত ঘটনাক্রমে: ৮টা সারিতে ভাগ্যক্রমে সহজ উদাহরণ পড়েছে। ৮টা সংখ্যার ওপর বেশি ভরসা করা যায় না।

ধাপ ২: error analysis। সবচেয়ে বড় ভুল (পরম মানে) আগে রেখে ৮টা ফ্ল্যাট:

```python
print("গড় error (prediction − actual):", round(sum(p - y for p, y in zip(va_pred, yva)) / len(yva), 2))
print("size rooms  actual  predicted  error")
for r, p in sorted(zip(val, va_pred), key=lambda t: -abs(t[1] - t[0][2])):
    print(f"{r[0]:>4} {r[1]:>5.0f} {r[2]:>7.1f} {p:>10.1f} {p - r[2]:>+7.1f}")

# output:
# গড় error (prediction − actual): -0.38
# size rooms  actual  predicted  error
#  671     2    15.2       14.2    -1.0
#  722     2    15.6       14.6    -1.0
# 1225     4    24.3       23.4    -0.9
# 1335     4    23.5       24.3    +0.8
# 1054     4    22.8       22.0    -0.8
# 1347     3    21.3       22.0    +0.7
#  650     2    14.5       14.0    -0.5
# 1121     4    23.0       22.6    -0.4
```

- সবচেয়ে বড় ভুল মাত্র `1.0` হাজার টাকা। ছোট-বড় সব ফ্ল্যাটেই ভুল ছোট।
- ৮টার মধ্যে ৬টায় model কম বলেছে (গড় error `−0.38`)। এই অল্প সংখ্যায় এটা কাকতালীয় হতে পারে। ছক বলার মতো যথেষ্ট প্রমাণ নেই, তবে data বাড়ালে আবার দেখার কথা মনে রাখা ভালো।
- সবচেয়ে বড় দুই ভুল ২-ঘরের ছোট ফ্ল্যাটে (`671`, `722` বর্গফুট), দুটোতেই `−1.0`। এটাও ৮টা সারিতে ছক বলার মতো নয়।

আমরা জানি data বানানোর সময় noise ছিল প্রায় `1.2`, আর কোনো model গড়ে এই noise-এর নিচে নামতে পারে না। তাই train RMSE `1.17` সম্ভাব্য সেরা মানের কাছেই। বাস্তব project-এ এই সংখ্যা জানা থাকে না, তখন learning curve ([Module 07](../module-07-generalization-and-overfitting/lecture-04-learning-curves-and-error-analysis.md)) আর ভুলের ছক দেখে বুঝতে হয় আর উন্নতির জায়গা আছে কি না।

এই model-এ কোনো পরিবর্তন দরকার পড়েনি, তাই এবার test। ধাপ ৩: test set, একবারই।

```python
te_pred = [predict(w, b, x) for x in Xte]       # test: শুধু এই একবার
base_te = [mean_rent] * len(yte)
print(f"test: model MAE={mae(te_pred, yte):.2f} RMSE={rmse(te_pred, yte):.2f} | baseline MAE={mae(base_te, yte):.2f} RMSE={rmse(base_te, yte):.2f}")

# output:
# test: model MAE=0.92 RMSE=1.28 | baseline MAE=4.01 RMSE=4.46
```

Test-এ model-এর RMSE `1.28`, baseline-এর `4.46`। অর্থাৎ নতুন ফ্ল্যাটে model গড়ে প্রায় `0.92` হাজার টাকা (MAE) ভুল করে, baseline-এর `4.01`-এর তুলনায়।

Test RMSE (`1.28`) validation RMSE-র (`0.78`) চেয়ে বেশি। কারণ validation-এ ভাগ্য ভালো ছিল। Test-এর `1.28` noise-এর সীমার (`≈ 1.2`) কাছাকাছি, তাই যুক্তিসংগত। আমরা তাই এভাবে জানাব: "Model baseline-এর চেয়ে অনেক ভালো, নতুন ফ্ল্যাটে ভাড়া গড়ে প্রায় ১ হাজার টাকার ভুলে অনুমান করে।" ৮টা সারির সংখ্যা তার চেয়ে নিখুঁত দাবি করা ঠিক নয়।

## মনে রাখার সারকথা

- Validation-এ model-কে baseline-এর সঙ্গে আর train error-এর সঙ্গে তুলনা করো; train-এর চেয়ে validation অনেক বেশি হলে overfitting।
- Error analysis: ভুলগুলো সারি ধরে দেখো। এলোমেলো হলে সম্ভবত noise; ছক থাকলে model বা feature-এ কিছু বাদ পড়ছে।
- Test একবারই। ফল দেখে model বদলাতে ইচ্ছে হলে সেই বদল validation দিয়ে করো, test দিয়ে নয়।

## নিজে করো

১. কোন কারণে test set বারবার ব্যবহার করা যায় না?

২. ফ্ল্যাট গ-এ আসল ভাড়া `21.3`, prediction `22.0`। Error কত (prediction − actual)? Model বেশি বলেছে না কম?

৩. Validation-এ model-এর RMSE যদি baseline-এর RMSE-র চেয়ে বেশি আসত, কী করতে? (দুটো জিনিস দেখার কথা বলো।)

<details>
<summary>উত্তর</summary>

১. যতবার test দেখে সিদ্ধান্ত বদলানো হয়, test ততই model-কে বাছাইয়ের অংশ করে ফেলে। তখন test-এর ফল আসল নতুন data-র ফলের চেয়ে ভালো দেখায়।

২. `22.0 − 21.3 = +0.7`। ধনাত্মক, তাই model বেশি বলেছে।

৩. প্রথমে preprocessing আর code-এ ভুল আছে কি না দেখতাম (যেমন scale-এ train-এর বদলে অন্য মান, learning rate)। তারপর train error-ও কম কি না দেখতাম: train-ও বেশি হলে underfitting, তখন আরও feature বা জটিল model লাগত।

</details>

## পরের পাঠ

Model train আর যাচাই শেষ। শেষ কাজ: নতুন একটা ফ্ল্যাটের ভাড়া বলা, আর পুরো script একত্রে দেখা: [Lecture 05 — নতুন input-এর prediction](lecture-05-predicting-new-input.md)।
