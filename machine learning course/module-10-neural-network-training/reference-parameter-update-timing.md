# Reference — Parameter কখন বদলায়, আর কতগুলো থাকে

> Reference নোট: [Batch, step ও epoch](lecture-06-batch-step-and-epoch.md) পড়ার পর কাজে লাগে। মূল পথের lecture নয়; "parameter কবে, কোনটা, কতবার বদলায়" ধরনের সন্দেহ মেটানোর জন্য।

## 1. মান বদলায়, সংখ্যা বদলায় না

Training-এ parameter-এর **মান** বদলায়। **সংখ্যা** বদলায় না, যদি architecture একই থাকে। যেমন একটা unit-এর `w = 2`, `b = 1` এক update-এর পরে `w = 2.1`, `b = 1.05` হতে পারে। আগে-পরে দুই অবস্থাতেই parameter 2টি।

সংখ্যা বদলায় শুধু architecture বদলালে:

- 3টা input নেওয়া dense unit-এ `3 weights + 1 bias = 4` parameter। Input 4টা হলে `4 + 1 = 5`।
- `2 → 4 → 1` network-এ `4 × (2 + 1) + (4 + 1) = 17`। Hidden unit 8টা করলে `8 × 3 + 9 = 33`।

Weight-কে `0` করে দিলে parameter গোনা কমে না; গঠন থেকে সেটা বাদ দেওয়া আলাদা কাজ। (সাবধান: এই নিয়ম fixed-architecture network-এর। Decision Tree-র মতো model-এ training-এর সময়ই গঠন বাড়ে।)

## 2. Update কখন হয়?

Update হয় **step**-এ: একটা batch-এর forward, loss ও backward শেষ হওয়ার পর optimizer parameter বদলায় ([Lecture 05](lecture-05-optimizer-and-learning-rate.md))।

| শব্দ | মানে | `6` sample, batch size `2` হলে |
|---|---|---|
| Step | এক batch নিয়ে এক update | প্রতি batch-এ 1টা |
| Epoch | পুরো data একবার | `⌈6 ÷ 2⌉ = 3` step |
| 4 epoch | | `3 × 4 = 12` step |

তাই "একবার train করেছি" কথাটা অস্পষ্ট; এটা পুরো training run, এক epoch, না এক step, তা আলাদা করে বলতে হয়।

## 3. Gradient জমিয়ে update (gradient accumulation)

কখনো একসঙ্গে বড় batch memory-তে ধরে না। তখন কয়েকটা ছোট batch-এর gradient জমিয়ে গড় করে তারপর **একবার** update করা হয়। তখন প্রতিটা ছোট batch-এর পরে update হয় না।

উদাহরণ: [Lecture 06-এর data](lecture-06-batch-step-and-epoch.md)-য় `w = 0`, `b = 0` থেকে তিনটা batch (size `2`)-এর `w`-gradient `−13`, `−57`, `−133`; `b`-gradient `−8`, `−16`, `−24`। গড় করলে `w`-gradient `−67.667`, `b`-gradient `−16`। এটা ঠিক 6টা sample একসঙ্গে নিলে (batch size `6`) পাওয়া gradient। তাই তিনটা batch জমানো আর batch size `6` একই update দেয়, কিন্তু memory লাগে ছোট batch-এর সমান। এখানে এক epoch-এ 1টাই update।

## 4. সুযোগ থাকলেও সব parameter প্রতিবার বদলায় না

- **Gradient শূন্য:** [Lecture 04](lecture-04-backpropagation.md)-এর উদাহরণে unit B-এর সব gradient `0` ছিল। Update-এর পরে B-এর weights `[−1, 1]`, bias `0` একই থেকেছে। অন্য sample-এ B সক্রিয় হলে বদলাতে পারে।
- **Frozen parameter:** কিছু parameter ইচ্ছা করে update থেকে বাদ রাখা যায়। এগুলো forward pass-এ কাজ করে, শুধু বদলায় না। (পরে fine-tuning-এ এটা কাজে লাগে, [Module 13](../module-13-pretraining-finetuning-and-lora/README.md)।)
- **Inference:** শেখা শেষ হলে prediction-এর সময় কোনো parameter বদলায় না। শুধু forward pass চলে।

## সারকথা

- Training-এ মান বদলায়, গঠন একই থাকলে সংখ্যা নয়।
- Update হয় প্রতি step-এ; এক epoch-এ step = ⌈sample ÷ batch size⌉।
- Gradient শূন্য বা parameter frozen হলে সেটা বদলায় না।
