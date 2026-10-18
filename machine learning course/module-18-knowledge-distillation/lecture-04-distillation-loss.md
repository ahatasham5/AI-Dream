# Lecture 04 — Distillation Loss: Hard Target, Soft Target ও KL Divergence

> আগে যা জানা থাকলে ভালো: [Soft target ও temperature](lecture-03-logits-temperature-soft-targets.md) এবং [Cross-entropy](../module-12-text-sequences-and-multimodal-models/lecture-04-next-token-and-cross-entropy.md)। এই lecture শেষে পারবে: দুটো probability-র দূরত্ব KL divergence দিয়ে হাতে মাপতে, মিলিত distillation loss লিখতে, আর বলতে পারবে gradient student-এর logit কোন দিকে সরায়।
> [Map-এ অবস্থান](../01-learning-map.md): শেখার লক্ষ্য (loss) ও update-এর দিক। Output বের করা ([Lecture 03](lecture-03-logits-temperature-soft-targets.md)), loss মাপা আর weight বদলানো এখানে আলাদা ধাপে দেখানো হয়েছে।

## সমস্যাটা কী?

Student-এর সামনে দুটো তথ্য: মানুষের সঠিক label (hard target) আর teacher-এর probability (soft target)। Student-এর output এই দুটোর কাছে আনতে হবে। তার জন্য একটা সংখ্যা লাগে, যা বলে "student-এর probability teacher-এর probability থেকে কত দূরে"। সেই সংখ্যা কমানোই training-এর লক্ষ্য।

## ধারণাটা: দূরত্ব মাপা

প্রথমে **বিস্ময়** (surprise)। কোনো ঘটনায় model যদি probability `q` দেয়, ঘটনাটা ঘটলে তার বিস্ময় `−ln(q)`। Probability কম দিলে বিস্ময় বেশি। এটা আমরা log loss-এ দেখেছি।

এখন ধরো teacher-এর বণ্টন `P`, student-এর `Q`। ঘটনা ঘটে `P` অনুযায়ী, কিন্তু student ভাবে `Q`। Student-এর গড় বিস্ময় হলো **cross-entropy**: `H(P, Q) = Σ P_i × (−ln Q_i)`।

Student যদি একদম teacher-এর মতো হতো (`Q = P`), তবু কিছু বিস্ময় থাকত, কারণ teacher নিজেও নিশ্চিত নয়। সেই ন্যূনতম বিস্ময় `H(P) = Σ P_i × (−ln P_i)`।

**KL divergence** হলো এই দুয়ের ফারাক, অর্থাৎ student-এর বাড়তি বিস্ময়:

`KL(P ‖ Q) = H(P, Q) − H(P)`

শূন্য হয় শুধু `Q = P` হলে, আর কখনো ঋণাত্মক হয় না। ছোট মান মানে student teacher-এর কাছাকাছি।

## ছোট একটা উদাহরণ: হাতে KL

Teacher `P = [0.7, 0.2, 0.1]`, student `Q = [0.5, 0.3, 0.2]`।

**Cross-entropy:**
`0.7×0.693 + 0.2×1.204 + 0.1×1.609 = 0.485 + 0.241 + 0.161 = 0.887`

**Teacher-এর নিজের H(P):**
`0.7×0.357 + 0.2×1.609 + 0.1×2.303 = 0.250 + 0.322 + 0.230 = 0.802`

**KL:** `0.887 − 0.802 = 0.085`।

একই ফল class ধরে ধরে `P_i × ln(P_i / Q_i)` যোগ করেও আসে:

| class | P | Q | P × ln(P / Q) |
|---|---|---|---|
| 1 | 0.7 | 0.5 | +0.2355 |
| 2 | 0.2 | 0.3 | −0.0811 |
| 3 | 0.1 | 0.2 | −0.0693 |
| যোগফল | | | **0.0851** |

এটাই KL-এর সাধারণ সূত্র: `KL(P ‖ Q) = Σ P_i × ln(P_i / Q_i)`। সাবধান: KL উল্টালে মান বদলায়। এখানে `KL(Q ‖ P) = 0.092`, `KL(P ‖ Q) = 0.085`। Distillation-এ teacher আগে বসে: `KL(teacher ‖ student)`।

## Cross-entropy-র সঙ্গে সম্পর্ক

`H(P, Q) = H(P) + KL(P ‖ Q)`। Teacher-এর `H(P)` student-এর weight-এর উপর নির্ভর করে না, তাই student-এর জন্য cross-entropy কমানো আর KL কমানো একই কাজ। Gradient-ও একই। এ কারণেই কোডে soft target-এর loss কখনো "cross-entropy", কখনো "KL" নামে থাকে।

Hard target হলো বিশেষ ক্ষেত্র: `P = [1, 0, 0]`-এ `H(P) = 0`, তাই KL আর cross-entropy দুটোই `−ln(Q_সঠিক)`। উপরের `Q`-তে সেটা `−ln(0.5) = 0.693`। এটাই সাধারণ training-এর cross-entropy।

## মিলিত Loss

Distillation-এ দুটো loss যোগ করা হয়:

`L = α × CE(hard label, student, T = 1) + (1 − α) × T² × KL(teacher_T ‖ student_T)`

- `α` (0 থেকে 1): hard label-এর উপর কতটা ভরসা। `α = 0` মানে শুধু teacher।
- `teacher_T`, `student_T`: দুজনেই একই `T`-তে softmax করা probability।
- **`T²` কেন?** T বাড়ালে soft loss-এর gradient ছোট হয়ে যায়। T² গুণ করে সেটা hard loss-এর সঙ্গে তুলনীয় মাপে রাখা হয়। নিচের কোডে উদাহরণটা দেখো: T = 1, 2, 4-এ gradient-এর মাপ 0.665, 0.246, 0.071, কিন্তু T² গুণ করলে 0.665, 0.985, 1.142।

**সংখ্যায়:** teacher logits `[5, 2, −1]`, student logits `[1, 1, 0]`, সঠিক class 1ম, `T = 2`, `α = 0.5`। Hard loss `−ln(0.4223) = 0.862`। Soft `KL = 0.356`, `T² × KL = 1.424`। মোট `0.5 × 0.862 + 0.5 × 1.424 = 1.143`।

## Gradient-এর দিক

Softmax-এর পর (cross-entropy বা KL) loss-এর gradient student-এর প্রতিটা logit-এ হলো সরল: `q_i − p_i` (T = 1-এ; T থাকলে `(q_i − p_i) ÷ T`, এখানে probability T-তে হিসাব করা)।

- `q_i > p_i`: student বেশি দিয়েছে। Gradient ধনাত্মক, তাই gradient descent logit **কমায়**।
- `q_i < p_i`: student কম দিয়েছে। Gradient ঋণাত্মক, তাই logit **বাড়ে**।

**এক ধাপ (T = 1, learning rate 1):** `P = [0.7, 0.2, 0.1]`, student logits `z = [1, 1, 0]`, ফলে `q = [0.422, 0.422, 0.155]`।

- Gradient `q − P = [−0.278, +0.222, +0.055]`
- নতুন `z = z − gradient = [1.278, 0.778, −0.055]`
- নতুন `q = [0.535, 0.324, 0.141]`
- `KL` আগে 0.160, পরে 0.058

Class 1-এর logit বেড়েছে, বাকি দুটো কমেছে, student teacher-এর কাছে এসেছে। এই gradient logit-এর উপর; weights-এ সেটা পৌঁছায় backpropagation দিয়ে ([Module 10](../module-10-neural-network-training/lecture-04-backpropagation.md))। Teacher-এর weight-এ কোনো gradient যায় না।

## কোড

```python
import math

def softmax(z, T=1.0):
    e = [math.exp(v / T) for v in z]
    s = sum(e)
    return [v / s for v in e]

def cross_entropy(p, q):
    return -sum(a * math.log(b) for a, b in zip(p, q) if a > 0)

def kl(p, q):
    return sum(a * math.log(a / b) for a, b in zip(p, q) if a > 0)

P, Q = [0.7, 0.2, 0.1], [0.5, 0.3, 0.2]
print("KL(P||Q) =", round(kl(P, Q), 4), "| KL(Q||P) =", round(kl(Q, P), 4))
print("CE =", round(cross_entropy(P, Q), 4), "| H(P) =", round(cross_entropy(P, P), 4))

# এক ধাপ gradient descent: student-এর logit-এ gradient = q - p
z = [1.0, 1.0, 0.0]
q = softmax(z)
grad = [a - b for a, b in zip(q, P)]
z_new = [a - 1.0 * g for a, g in zip(z, grad)]        # learning rate = 1
print("q       =", [round(v, 3) for v in q])
print("gradient=", [round(v, 3) for v in grad])
print("KL আগে =", round(kl(P, q), 4), "| পরে =", round(kl(P, softmax(z_new)), 4))
```

```text
# output:
KL(P||Q) = 0.0851 | KL(Q||P) = 0.092
CE = 0.8869 | H(P) = 0.8018
q       = [0.422, 0.422, 0.155]
gradient= [-0.278, 0.222, 0.055]
KL আগে = 0.1602 | পরে = 0.0575
```

`T²` আর মিলিত loss-এর হিসাব:

```python
import math

def softmax(z, T=1.0):
    e = [math.exp(v / T) for v in z]
    s = sum(e)
    return [v / s for v in e]

def kl(p, q):
    return sum(a * math.log(a / b) for a, b in zip(p, q) if a > 0)

t_logits, s_logits = [5.0, 2.0, -1.0], [1.0, 1.0, 0.0]

# T বাড়ালে soft loss-এর gradient ছোট হয়; T² গুণ করলে মাপ প্রায় স্থির থাকে
for T in (1, 2, 4):
    p, q = softmax(t_logits, T), softmax(s_logits, T)
    norm = math.sqrt(sum(((a - b) / T) ** 2 for a, b in zip(q, p)))
    print("T =", T, "| gradient-এর মাপ =", round(norm, 3), "| × T² =", round(norm * T * T, 3))

# মিলিত loss: alpha × hard + (1 - alpha) × T² × soft
alpha, T, hard_label = 0.5, 2, 0
hard = -math.log(softmax(s_logits)[hard_label])
soft = kl(softmax(t_logits, T), softmax(s_logits, T))
total = alpha * hard + (1 - alpha) * T * T * soft
print("hard =", round(hard, 3), "| soft KL =", round(soft, 3), "| total =", round(total, 3))
```

```text
# output:
T = 1 | gradient-এর মাপ = 0.665 | × T² = 0.665
T = 2 | gradient-এর মাপ = 0.246 | × T² = 0.985
T = 4 | gradient-এর মাপ = 0.071 | × T² = 1.142
hard = 0.862 | soft KL = 0.356 | total = 1.143
```

## মনে রাখার সারকথা

- KL divergence = student-এর বাড়তি বিস্ময় = cross-entropy − teacher-এর নিজের entropy। শূন্য মানে student হুবহু teacher-এর মতো।
- Student-এর জন্য soft target-এর cross-entropy আর KL একই; hard target-এ KL = সাধারণ cross-entropy।
- Logit-এর gradient `q − p`: student যেখানে বেশি দিয়েছে সেখানে কমে, যেখানে কম দিয়েছে সেখানে বাড়ে। `T²` গুণ gradient-এর মাপ ঠিক রাখে।

## নিজে করো

১. `P = [0.5, 0.5]`, `Q = [0.25, 0.75]`। `KL(P ‖ Q)` কত?
২. `P = [0.9, 0.1]`, `Q = [0.5, 0.5]`। `q − p` কত? কোন logit বাড়বে, কোনটা কমবে? KL কত?
৩. `α = 0.4`, hard loss 0.8, soft `KL` 0.05, `T = 2`। মোট loss কত?

<details><summary>উত্তর</summary>

১. `0.5×ln(0.5/0.25) + 0.5×ln(0.5/0.75) = 0.5×0.693 + 0.5×(−0.405) = 0.3466 − 0.2027 = ` **0.144**।
২. `q − p = [0.5 − 0.9, 0.5 − 0.1] = [−0.4, +0.4]`। প্রথম logit **বাড়বে** (student কম দিয়েছিল), দ্বিতীয়টা **কমবে**। `KL = 0.9×ln(0.9/0.5) + 0.1×ln(0.1/0.5) = 0.529 − 0.161 = ` **0.368**।
৩. `0.4×0.8 + 0.6×4×0.05 = 0.32 + 0.12 = ` **0.44**।

</details>

## পরের পাঠ

এতক্ষণ শুধু শেষ output মেলানো হলো। Student আর teacher-এর ভেতরের সংখ্যাও মেলানো যায়: [Lecture 05 — Feature ও intermediate distillation](lecture-05-feature-and-intermediate-distillation.md)।
