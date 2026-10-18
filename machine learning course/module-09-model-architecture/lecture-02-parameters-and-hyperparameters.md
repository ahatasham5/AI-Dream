# Lecture 02 — Parameters: Model-এর শেখা মান

> আগে যা জানা থাকলে ভালো: [Lecture 01](lecture-01-input-computation-output.md)-এর input, হিসাব ও output। এই lecture শেষে পারবে: input, parameter আর hyperparameter আলাদা করে চিনতে।

## সমস্যাটা কী?

Lecture 01-এর নিয়মে 2 আর 1 কোথা থেকে এল? আর "model শেখে" বলতে ঠিক কী বদলায়? Input তো প্রতিবার নতুন আসে। তাহলে শেখা জিনিসটা কোথায় থাকে? এই প্রশ্নের উত্তর হলো parameters।

## ধারণাটা সহজ ভাষায়

হিসাবের ভেতরে কিছু সংখ্যা বসানো থাকে। এগুলো training data দেখে ঠিক করা হয়। এই সংখ্যাগুলোকে **parameters** বলে।

Linear Regression-এ দুই রকম parameter থাকে:

- **weight (`w`)**: input কতটা গুরুত্বপূর্ণ, তার মাপ।
- **bias (`b`)**: input-এর হিসাবের পরে যোগ হওয়া একটা স্থির সংখ্যা।

সূত্রটা: `ŷ = w × x + b`। এখানে `x` input, আর `ŷ` (পড়ো "y-hat") হলো model-এর prediction।

তিনটা জিনিসের পার্থক্য এভাবে মনে রাখা যায়:

| জিনিস | কে ঠিক করে? | কখন বদলায়? |
|---|---|---|
| Input `x` | তথ্য থেকে আসে | প্রতিটা উদাহরণে নতুন |
| Parameter `w`, `b` | training | শেখানোর সময় |
| Hyperparameter | আমরা নিজে বেছে নিই | আমরা বদলালে |

**Hyperparameter** হলো এমন setting যা data থেকে শেখা হয় না, আমরা আগে থেকে ঠিক করে দিই। যেমন একটা layer-এ কয়টা unit থাকবে। Unit আর layer পরের lecture-এ আসবে; এখন শুধু নামটা চিনে রাখো।

## ছোট একটা উদাহরণ

ধরো `w = 2`, `b = 1`।

```text
x = 3 হলে: 2 × 3 + 1 = 7
x = 4 হলে: 2 × 4 + 1 = 9
```

Input বদলেছে, parameter একই আছে। এবার ধরো training-এর পর মান বদলে `w = 2.1`, `b = 1.05` হয়েছে:

```text
x = 3 হলে: 2.1 × 3 + 1.05 = 7.35
```

Parameter-এর **মান** বদলেছে (2 → 2.1, 1 → 1.05)। কিন্তু parameter-এর **সংখ্যা** দুই ক্ষেত্রেই 2টা। নতুন training example যোগ করলে মান বদলাতে পারে, সংখ্যা বাড়ে না। সংখ্যা বাড়ে তখনই, যখন model-এর গঠনে নতুন input বা unit যোগ হয়। সেটা [Lecture 07](lecture-07-shapes-and-parameter-count.md)-এ দেখব।

## কোড

```python
def model(x, w, b):
    return w * x + b

print(model(3, 2, 1))
print(round(model(3, 2.1, 1.05), 2))
# output:
# 7
# 7.35
```

## মনে রাখার সারকথা

- Parameter হলো হিসাবের ভেতরের শেখা মান (weight, bias)। Input নয়।
- Training-এ parameter-এর মান বদলায়; তাদের সংখ্যা বদলায় না।
- Hyperparameter আমরা নিজে বেছে দিই, model data থেকে শেখে না।

## নিজে করো

১. `w = 3`, `b = −1`, `x = 4` হলে prediction কত?
২. ওপরের model-এ parameter কয়টা?
৩. কোনটা hyperparameter: `w`, `x`, নাকি "hidden layer-এ কয়টা unit"?

<details><summary>উত্তর</summary>

১. `3 × 4 + (−1) = 11`।
২. 2টা: `w` আর `b`।
৩. "hidden layer-এ কয়টা unit"। আমরা এটা আগে ঠিক করে দিই। `w` শেখা হয় (parameter), আর `x` হলো input।

</details>

## পরের পাঠ

এতক্ষণ input ছিল একটা সংখ্যা। input একাধিক হলে হিসাব কেমন হয়: [Lecture 03 — একটি Unit](lecture-03-one-neuron.md)।
