# Lecture 01 — Vector, Matrix ও Shape: হাতে-কলমে অনুশীলন

> আগে যা জানা থাকলে ভালো: [Module 01-এর linear algebra পরিচিতি](../module-01-ml-fundamentals-and-math-basics/lecture-06-linear-algebra-basics.md) (vector মানে সংখ্যার তালিকা, matrix মানে সংখ্যার table) এবং [Linear Regression-এর `Xw + b`](../module-02-linear-regression/lecture-01-prediction-weight-and-bias.md)। এই lecture শেষে পারবে: যেকোনো vector বা matrix-এর shape বলতে, ছোট operation হাতে করতে, আর ML-এর ডেটা ও weight-এর shape ঠিক করতে।

## সমস্যাটা কী?

ML code-এর সবচেয়ে সাধারণ ভুল হলো shape মেলে না। "ডেটায় 100 জন ছাত্র, প্রত্যেকের 4টা feature; weight কয়টা লাগবে? ডেটা কীভাবে সাজাব?" এই প্রশ্নের উত্তর যে শুরুতেই দিতে পারে না, তার code বারবার ভেঙে যায়। তাই shape গুনতে পারাটা একটা মৌলিক অভ্যাস। ডেটা সাজানো, model বানানো, error খোঁজা সবখানে এটা লাগে।

## ধারণাটা সহজ ভাষায়

**Vector** হলো এক সারি সংখ্যা। একজন ছাত্রের তথ্য `[3, 7]` (3 ঘণ্টা পড়েছে, আগের পরীক্ষায় 7 পেয়েছে)। সংখ্যার সংখ্যা হলো vector-এর **length** বা dimension। এখানে 2।

**Matrix** হলো সারি ও কলামে সাজানো table। একটা সারি = একটা উদাহরণ (একজন ছাত্র), একটা কলাম = একটা feature। 3 জন ছাত্রের ডেটা:

```text
X = [[1, 2],
     [3, 4],
     [5, 6]]
```

**Shape** বলে কয়টা সারি আর কয়টা কলাম, লেখা হয় `(সারি, কলাম)`। এই `X`-এর shape `(3, 2)`। Vector-এর shape শুধু `(length,)`; `[0.5, −1]`-এর shape `(2,)`।

ML-এ নিয়মটা সবসময় একই:

- ডেটা `X`: shape `(n, d)`, n = উদাহরণ সংখ্যা, d = feature সংখ্যা।
- Target `y`: shape `(n,)`, প্রতি উদাহরণে একটা।
- Weight `w`: shape `(d,)`, প্রতি feature-এ একটা।
- Bias `b`: একটা সংখ্যা। তাই model-এর parameter সংখ্যা `d + 1`।

Python-এ index 0 থেকে শুরু: `X[2][1]` মানে তৃতীয় সারির দ্বিতীয় কলাম, মান `6`।

## ছোট একটা উদাহরণ: তিনটা মৌলিক operation

**১. যোগ ও scalar গুণ।** একই length-এর দুই vector-এর যোগ হয় অবস্থান ধরে ধরে। একটা সংখ্যা দিয়ে গুণ করলে প্রতিটা অংশ গুণ হয়।

`[1, 2] + [3, 4] = [4, 6]` এবং `2 × [1, 2] = [2, 4]`

**২. Transpose।** সারি আর কলাম অদলবদল। `X`-এর transpose `Xᵀ`:

```text
Xᵀ = [[1, 3, 5],
      [2, 4, 6]]
```

Shape `(3, 2)` থেকে `(2, 3)` হলো।

**৩. Update-ও vector operation।** [Gradient descent-এর update](../module-02-linear-regression/lecture-03-gradient-descent-training.md) ভেবে দেখো: `w_নতুন = w − α × g`। ধরো `w = [1, 2]`, `g = [0.4, −0.2]`, `α = 0.5`:

`α × g = [0.2, −0.1]`, তাই `w_নতুন = [1 − 0.2, 2 − (−0.1)] = [0.8, 2.1]`

সব weight একসঙ্গে এক লাইনে বদলে গেল। ML-এ vector operation ব্যবহারের এটাই কারণ: একই নিয়ম অনেক সংখ্যায় একসঙ্গে।

## কোড

```python
def shape(m):
    return (len(m), len(m[0])) if isinstance(m[0], list) else (len(m),)

def transpose(m):
    return [list(col) for col in zip(*m)]

X = [[1, 2], [3, 4], [5, 6]]
print(shape(X), shape([0.5, -1]), X[2][1])
print(transpose(X), shape(transpose(X)))
w, g, alpha = [1, 2], [0.4, -0.2], 0.5
print([wi - alpha * gi for wi, gi in zip(w, g)])
```

```text
# output:
(3, 2) (2,) 6
[[1, 3, 5], [2, 4, 6]] (2, 3)
[0.8, 2.1]
```

## মনে রাখার সারকথা

- Shape `(সারি, কলাম)`; ডেটা `X` হলো `(n, d)`, weight `w` হলো `(d,)`।
- যোগ-বিয়োগের জন্য shape হুবহু মিলতে হয়; গুণফল-এর নিয়ম আলাদা (পরের lecture)।
- Weight update একটা vector operation: `w − α × g`।

## নিজে করো

১. `A = [[1, 2, 3], [4, 5, 6]]`-এর shape কী? `A[1][2]` কত? `A`-এর transpose লেখো।

২. 100 জন ছাত্রের 4টা feature আছে। `X`-এর shape, `y`-এর shape, weight সংখ্যা এবং মোট parameter সংখ্যা কত?

৩. `a = [1, 2, 3]`, `b = [4, 0, −1]`। বের করো `a + b`, `2a`, `a − b`।

৪. `w = [0.5, −1, 2]`, `g = [1, −2, 0.5]`, `α = 0.1`। `w − α × g` কত?

৫. `[1, 2, 3]` আর `[1, 2]` কি যোগ করা যায়? কেন?

৬. একটা সাদা-কালো ছবি 28 × 28 pixel-এর matrix। এটাকে সারি ধরে ধরে সাজিয়ে একটা লম্বা vector বানালে length কত? (একে **flatten** বলে।)

<details>
<summary>উত্তর</summary>

১. 2 সারি, 3 কলাম, shape `(2, 3)`। `A[1][2]` = দ্বিতীয় সারির তৃতীয় সংখ্যা = 6। Transpose: `[[1, 4], [2, 5], [3, 6]]`, shape `(3, 2)`।

২. `X`: `(100, 4)`। `y`: `(100,)`। Weight 4টা। Parameter মোট `4 + 1 = 5` (bias সহ)।

৩. `a + b = [5, 2, 2]`, `2a = [2, 4, 6]`, `a − b = [1−4, 2−0, 3−(−1)] = [−3, 2, 4]`।

৪. `α × g = [0.1, −0.2, 0.05]`। `w − α × g = [0.4, −0.8, 1.95]`।

৫. না। Length আলাদা (3 আর 2), অবস্থান ধরে ধরে মেলানো যায় না; তৃতীয় অবস্থানের জন্য দ্বিতীয় vector-এ কোনো সংখ্যা নেই।

৬. `28 × 28 = 784`। (ছবি model-এ দিতে এই রূপান্তর ব্যবহার করা হয়।)

</details>

## পরের পাঠ

Shape বোঝা গেল। এবার দুটো vector বা matrix-এর গুণ, যা দিয়ে `Xw + b` হিসাব হয়: [Lecture 02 — Dot product ও matrix multiplication](lecture-02-dot-product-and-matrix-multiplication.md)।
