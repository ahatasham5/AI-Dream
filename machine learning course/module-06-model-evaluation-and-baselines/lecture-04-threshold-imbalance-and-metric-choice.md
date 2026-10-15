# Lecture 04 — Threshold, Class Imbalance ও কাজ অনুযায়ী Metric বাছা

> আগে যা জানা থাকলে ভালো: [Classification Metrics](lecture-03-classification-metrics.md) (TP, FP, FN, precision, recall) আর [Sigmoid](../module-03-logistic-regression/lecture-01-sigmoid.md) (model-এর probability)। এই lecture শেষে পারবে: threshold বদলালে precision ও recall কীভাবে বদলায় তা হাতে হিসাব করতে, আর accuracy কখন বিভ্রান্ত করে তা চিনতে।

## সমস্যাটা কী?

Logistic regression-এর মতো model সরাসরি "spam" বা "নয়" বলে না। সে একটা probability দেয়, যেমন "এটা spam হওয়ার সম্ভাবনা 0.7"। সেটাকে সিদ্ধান্তে বদলাতে একটা সীমা (threshold) লাগে। প্রশ্ন: সীমাটা 0.5-ই কেন? আর সব কাজে কি একই metric চলে? ধরো ১০০ জনের মধ্যে মাত্র ২ জন রোগী। একটা model সবাইকে "সুস্থ" বললেই accuracy 98%, অথচ সে একজন রোগীকেও ধরেনি। এই দুটো সমস্যাই এই lecture-এ।

## ধারণাটা সহজ ভাষায়

**Threshold।** Probability ≥ threshold হলে model positive (spam) বলে। Threshold বদলালেও model একই থাকে; শুধু সিদ্ধান্তের কঠোরতা বদলায়:

- **Threshold বাড়ালে** model কম জিনিসকে positive বলে। যা বলে তা সাধারণত বেশি নির্ভরযোগ্য, কিন্তু কিছু আসল positive ফসকে যায়। **Precision বাড়ে, recall কমে।**
- **Threshold কমালে** model বেশি জিনিসকে positive বলে। বেশি আসল positive ধরা পড়ে, কিন্তু ভুল অ্যালার্মও বাড়ে। **Recall বাড়ে, precision কমে।**

**Class imbalance।** এক class অনেক বেশি, অন্যটা খুব কম (যেমন ১০০ জনে ২ জন রোগী)। তখন সব সময় বড় class বলা model-ও উঁচু accuracy পায়। তাই imbalanced data-য় accuracy একা বিশ্বাসযোগ্য নয়; precision, recall, F1 দেখতে হয়।

**Metric বাছা।** কোন ভুল বেশি ক্ষতিকর, তা থেকে metric ঠিক হয়:

| কাজ | বেশি ক্ষতিকর ভুল | বেশি দেখবে |
|---|---|---|
| রোগ screening | রোগী ফসকে যাওয়া (FN) | Recall |
| ব্যাংকের জালিয়াতি শনাক্ত | জালিয়াতি ফসকে যাওয়া (FN) | Recall (সঙ্গে precision) |
| Spam folder (জরুরি মেইল হারানো চলে না) | সাধারণ মেইলকে spam বলা (FP) | Precision |
| দুই class প্রায় সমান, ভুলের ক্ষতি সমান | — | Accuracy |
| Precision ও recall দুটোই দরকার | — | F1 |
| বাড়ির দাম (সংখ্যা) | — | MAE / RMSE |

## ছোট একটা উদাহরণ

### Threshold বদলানো

৮টা ইমেইলের জন্য model-এর spam probability আর আসল উত্তর (1 = spam):

| probability | 0.95 | 0.85 | 0.70 | 0.60 | 0.45 | 0.40 | 0.30 | 0.10 |
|---|---|---|---|---|---|---|---|---|
| আসল | 1 | 1 | 0 | 1 | 0 | 1 | 0 | 0 |

(মোট spam 4টা।)

**Threshold 0.5।** Probability ≥ 0.5: 0.95, 0.85, 0.70, 0.60 — চারটা positive।
- 0.95, 0.85, 0.60 আসলে spam → TP = 3। 0.70 আসলে নয় → FP = 1।
- Spam 0.40 ফসকেছে → FN = 1।
- Precision = 3 / 4 = **0.75**, Recall = 3 / 4 = **0.75**।

**Threshold 0.8 (কড়া)।** Positive: 0.95, 0.85।
- TP = 2, FP = 0, FN = 2 (0.60 ও 0.40 ফসকেছে)।
- Precision = 2 / 2 = **1.0**, Recall = 2 / 4 = **0.5**।

**Threshold 0.3 (ঢিলা)।** Positive: 0.95, 0.85, 0.70, 0.60, 0.45, 0.40, 0.30 (সাতটা)।
- TP = 4, FP = 3 (0.70, 0.45, 0.30), FN = 0।
- Precision = 4 / 7 = **0.571**, Recall = 4 / 4 = **1.0**।

| threshold | precision | recall |
|---|---|---|
| 0.8 | 1.0 | 0.5 |
| 0.5 | 0.75 | 0.75 |
| 0.3 | 0.571 | 1.0 |

একটা বাড়লে অন্যটা কমে। কোনটা প্রাধান্য পাবে, তা কাজের উপর নির্ভর করে।

### Class imbalance

১০০ জন, মাত্র ২ জন রোগী (positive)।

- **Model X: সবাইকে "সুস্থ" বলে।** TP = 0, FN = 2, FP = 0, TN = 98। Accuracy = 98 / 100 = **0.98**। Recall = 0 / 2 = **0**। Precision = 0 ÷ 0 (কাউকেই positive বলেনি), নির্ধারিত নয়।
- **Model Y: একজন রোগীকে ধরে, দুজন সুস্থকে ভুল করে রোগী বলে।** TP = 1, FN = 1, FP = 2, TN = 96। Accuracy = 97 / 100 = **0.97**। Recall = 1 / 2 = **0.5**। Precision = 1 / 3 = **0.33**।

Accuracy বলছে X ভালো (0.98 > 0.97)। কিন্তু X কোনো রোগী ধরেনি; Y অন্তত অর্ধেক ধরেছে। এখানে recall-ই আসল ছবি দেখায়।

## Formula / কোড

কোনো নতুন formula নেই; আগের precision ও recall-এর সূত্রই বিভিন্ন threshold ও বিভিন্ন গণনায়।

```python
# (model's spam probability, really spam?)
mails = [(0.95, 1), (0.85, 1), (0.70, 0), (0.60, 1),
         (0.45, 0), (0.40, 1), (0.30, 0), (0.10, 0)]

for t in (0.3, 0.5, 0.8):
    pred = [(1 if p >= t else 0, y) for p, y in mails]
    tp = sum(a == 1 and y == 1 for a, y in pred)
    fp = sum(a == 1 and y == 0 for a, y in pred)
    fn = sum(a == 0 and y == 1 for a, y in pred)
    print(f"threshold {t}: TP={tp} FP={fp} FN={fn}  precision={tp/(tp+fp):.3f} recall={tp/(tp+fn):.3f}")

# class imbalance: 100 patients, only 2 are sick
def report(tp, fn, fp, tn):
    n = tp + fn + fp + tn
    rec = tp / (tp + fn)
    prec = f"{tp/(tp+fp):.2f}" if tp + fp else "n/a (0/0)"
    print(f"accuracy={(tp+tn)/n:.2f} recall={rec:.2f} precision={prec}")

print("always 'healthy':", end=" ")
report(tp=0, fn=2, fp=0, tn=98)
print("real screening  :", end=" ")
report(tp=1, fn=1, fp=2, tn=96)
```

```text
# output:
# threshold 0.3: TP=4 FP=3 FN=0  precision=0.571 recall=1.000
# threshold 0.5: TP=3 FP=1 FN=1  precision=0.750 recall=0.750
# threshold 0.8: TP=2 FP=0 FN=2  precision=1.000 recall=0.500
# always 'healthy': accuracy=0.98 recall=0.00 precision=n/a (0/0)
# real screening  : accuracy=0.97 recall=0.50 precision=0.33
```

সাবধান: Threshold validation set দেখে বাছো, test set দেখে নয়। Threshold-ও একটা setting, আর setting বাছার জায়গা validation ([Module 05 Lecture 03](../module-05-data-preparation-and-splits/lecture-03-train-validation-test-split.md))।

## মনে রাখার সারকথা

- Threshold বাড়ালে precision সাধারণত বাড়ে, recall কমে; কমালে উল্টো।
- Class imbalance থাকলে accuracy প্রতারণা করে; recall, precision, F1 দেখো।
- আগে ঠিক করো কোন ভুল বেশি ক্ষতিকর (FN না FP), তারপর metric বাছো।

## নিজে করো

১. উপরের ৮টা ইমেইলে threshold 0.65 হলে precision ও recall কত?

২. ২০০টা লেনদেনে ৪টা জালিয়াতি। Model সব লেনদেনকে "সঠিক" বলে। Accuracy ও recall কত?

৩. কোন কাজে কোন metric? (ক) বিমানবন্দরে ব্যাগে বিস্ফোরক শনাক্ত, (খ) ইমেইল spam folder-এ পাঠানো যেখানে জরুরি মেইল হারানো চলবে না, (গ) বাড়ির দাম predict।

<details><summary>উত্তর</summary>

১. Probability ≥ 0.65: 0.95, 0.85, 0.70। এর মধ্যে 0.95, 0.85 আসল spam (TP = 2), 0.70 নয় (FP = 1)। আসল spam 0.60 ও 0.40 ফসকেছে (FN = 2)। Precision = 2 / 3 = **0.667**। Recall = 2 / 4 = **0.5**।

২. সবাইকে সঠিক বললে 196টা ঠিক, 4টা ভুল। Accuracy = 196 / 200 = **0.98**। Recall = 0 / 4 = **0** (একটা জালিয়াতিও ধরা পড়েনি)।

৩. (ক) **Recall** (একটা বিস্ফোরকও ফসকানো চলে না); (খ) **Precision** (সাধারণ মেইলকে spam বলা চলে না); (গ) **MAE বা RMSE** (সংখ্যা predict, তাই regression metric)।

</details>

## পরের পাঠ

এত হিসাব এক validation set-এর উপর। কিন্তু validation set ছোট হলে সেই ফলই কাকতালীয় হতে পারে। [পরের lecture — Cross-validation ও Final Test](lecture-05-cross-validation-and-final-test.md)-এ আরও নির্ভরযোগ্য মাপ আর test set-এর শেষ ব্যবহার।
