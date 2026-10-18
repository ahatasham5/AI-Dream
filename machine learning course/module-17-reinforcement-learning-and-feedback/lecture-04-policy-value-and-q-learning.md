# Lecture 04 — Policy, Value ও Q-learning

> আগে যা জানা থাকলে ভালো: [Lecture 03](lecture-03-return-discount-delayed-reward.md)-এর return (`নিজের reward + γ × পরের return`) এবং Module 01-এর [Q-learning পরিচয়](../module-01-ml-fundamentals-and-math-basics/lecture-05-how-reinforcement-learning-works.md)। এই lecture শেষে পারবে: Q-table থেকে policy বের করতে, একটা Q-value update হাতে করতে, আর বলতে পারবে table কখন ছেড়ে সূত্র বা neural network নিতে হয়। ([Map-এ অবস্থান](../01-learning-map.md): Q-learning হলো শেখানোর algorithm; Q-table সেই শেখা মানের জায়গা।)

## সমস্যাটা কী?

করিডোরের রোবট এখনো এলোমেলো চলে। ভালো করতে হলে প্রতিটা ঘরে তার জানা দরকার, "ডান গেলে মোট কত return আশা করা যায়, আর বাঁ গেলে কত?" Return সে আগে থেকে জানে না, কারণ ভবিষ্যৎ এখনো ঘটেনি। তাই এই অনুমানটা অভিজ্ঞতা থেকে শিখতে হয়। অনুমানগুলো শেখা হয়ে গেলে প্রতি ঘরে বেশি মানের চালটা বেছে নিলেই ভালো আচরণ পাওয়া যায়।

## ধারণাটা সহজ ভাষায়

**Policy** আগের lecture থেকে চেনা: কোন state-এ কোন action নেওয়া হবে, তার নিয়ম। করিডোরে একটা policy হতে পারে "ঘর 0, 1, 2 সবখানে ডান"।

**Q(s, a)** হলো একটা সংখ্যা: "state `s`-এ action `a` নিয়ে, তারপর ভালোভাবে চললে return কত হবে বলে আশা করি।" করিডোরে 3টা ঘর আর 2টা action, তাই ছকে মোট 6টা সংখ্যা। এই ছকের নাম **Q-table**। Q-table হাতে থাকলে policy সোজা: প্রতি ঘরে যে action-এর Q বড়, সেটা নাও।

**V(s)** হলো একটা state-এর নিজের মান, অর্থাৎ ওই ঘর থেকে ভালোভাবে চললে return কত। ভালো চালে `V(s)` ওই ঘরের সবচেয়ে বড় Q-এর সমান। V আমরা Lecture 07-এ কাজে লাগাব।

Q-table শেখা হয় **Q-learning**-এর update দিয়ে। এক step অভিজ্ঞতার (state, action, reward, next state) পর:

1. **Target** বানাও: `reward + γ × (next state-এর সবচেয়ে বড় Q)`। এটা Lecture 03-এর "নিজের reward + γ × পরের return"-এর অনুমান-রূপ। পরের return-এর জায়গায় বসেছে পরের ঘরের সেরা Q। Next state শেষ ঘর হলে ওই অংশ বাদ, target শুধু reward।
2. পুরোনো Q-কে target-এর দিকে একটু সরাও: `নতুন Q = পুরোনো Q + α × (target − পুরোনো Q)`।

**α** (learning rate) ঠিক করে কতটা সরবে। এই lecture-এ α = 0.5, γ = 0.9।

## ছোট একটা উদাহরণ

শুরুতে Q-table-এর সব সংখ্যা 0।

**অভিজ্ঞতা ১:** ঘর 2, action ডান, reward +10, খেলা শেষ।

```text
target       = 10                       (শেষ, তাই পরের অংশ নেই)
নতুন Q(2,ডান) = 0 + 0.5 × (10 − 0) = 5
```

**অভিজ্ঞতা ২:** ঘর 1, action ডান, reward −1, next state ঘর 2। এখন Q(2, ডান) = 5, Q(2, বাঁ) = 0।

```text
target       = −1 + 0.9 × max(0, 5) = 3.5
নতুন Q(1,ডান) = 0 + 0.5 × (3.5 − 0) = 1.75
```

শেষ ঘরের খবর (+10) প্রথমে ঘর 2-এ এল, তারপর ঘর 1-এ। প্রতি episode-এ খবর এক ধাপ করে পিছনে যায়। অনেক episode চালালে পুরো table ভরে।

## কোড

এলোমেলো চাল দিয়ে ৩০০টা episode চালিয়ে Q-table শেখা:

```python
import random

GOAL, GAMMA, ALPHA = 3, 0.9, 0.5
ACTIONS = ["বাঁ", "ডান"]

def step(state, action):
    nxt = min(state + 1, GOAL) if action == "ডান" else max(state - 1, 0)
    return (nxt, 10, True) if nxt == GOAL else (nxt, -1, False)

Q = {(s, a): 0.0 for s in range(GOAL) for a in ACTIONS}

random.seed(0)
for ep in range(300):
    s, done = 0, False
    while not done:
        a = random.choice(ACTIONS)              # এলোমেলো চাল
        s2, r, done = step(s, a)
        best_next = 0.0 if done else max(Q[(s2, b)] for b in ACTIONS)
        target = r + GAMMA * best_next
        Q[(s, a)] += ALPHA * (target - Q[(s, a)])
        s = s2

for s in range(GOAL):
    print("ঘর", s, {a: round(Q[(s, a)], 2) for a in ACTIONS})
print({s: max(ACTIONS, key=lambda a: Q[(s, a)]) for s in range(GOAL)})
# output:
# ঘর 0 {'বাঁ': 4.58, 'ডান': 6.2}
# ঘর 1 {'বাঁ': 4.58, 'ডান': 8.0}
# ঘর 2 {'বাঁ': 6.2, 'ডান': 10.0}
# {0: 'ডান', 1: 'ডান', 2: 'ডান'}
```

শেখা মানগুলো Lecture 03-এর return-এর সঙ্গে মেলে: ঘর 0-তে ডান 6.2, ঘর 1-এ ডান 8, ঘর 2-এ ডান 10। ঘর 1-এ বাঁ গেলে ঘর 0-তে ফেরা হয়: `−1 + 0.9 × 6.2 = 4.58`। শেখা policy: সব ঘরে ডান।

খেয়াল করো, চাল ছিল এলোমেলো, তবু শেখা policy ভালো। কেন এটা সম্ভব, [Lecture 05](lecture-05-exploration-on-off-policy.md)-এ।

## Table যখন যথেষ্ট নয়

করিডোরে ৬টা সংখ্যা। কিন্তু OCR-এ state মানে একটা ছবি, LLM-এ state মানে এ পর্যন্ত লেখা সব token। এত state-এর জন্য ছক বানানো যায় না, আর প্রতিটা state জীবনে একবারও দেখা না-ও যেতে পারে। তখন ছকের জায়গায় একটা **সূত্র** বসানো হয়, যা state-এর বৈশিষ্ট্য থেকে Q বের করে। সূত্রের মান (weight) শেখা হয়।

করিডোরে ছোট একটা নমুনা: `Q(ঘর, ডান) ≈ w0 + w1 × ঘর`, শুরুতে `w0 = w1 = 0`।

অভিজ্ঞতা: ঘর 2, ডান, শেষ, target = 10। অনুমান ছিল 0, তাই error = 10 − 0 = 10। Weight বদলানোর নিয়ম gradient descent-এর মতো: `weight = weight + α × error × ওই weight-এর input`, এখানে α = 0.1।

```text
w0 = 0 + 0.1 × 10 × 1 = 1       (w0-এর input সবসময় 1)
w1 = 0 + 0.1 × 10 × 2 = 2       (w1-এর input ঘর নম্বর, 2)
```

এখন `Q(0) = 1`, `Q(1) = 3`, `Q(2) = 5`। একটা অভিজ্ঞতায় তিন ঘরের অনুমানই বদলে গেছে। Table হলে শুধু একটা ঘর বদলাত। এটাই সূত্রের শক্তি: দেখা state থেকে না-দেখা state-এ শিক্ষা ছড়ায়। ঝুঁকিও এটাই, ভুল ছড়ালেও সবখানে ছড়ায়।

এখানে target-কে একটা স্থির সংখ্যা ধরা হয়, আর `(target − Q)²` কমানো হয়। সূত্রের জায়গায় neural network বসালে ([Module 10](../module-10-neural-network-training/lecture-05-optimizer-and-learning-rate.md)-এর training) এটাই deep RL-এর Q-network (DQN নামে পরিচিত)। হিসাব একই থাকে, শুধু gradient network-এর ভেতর দিয়ে যায়।

## মনে রাখার সারকথা

- Q(s, a) = state `s`-এ action `a` নিলে ভবিষ্যৎ return-এর অনুমান; প্রতি state-এ সেরা Q-এর action বাছলেই policy পাওয়া যায়।
- Q-learning update: `target = reward + γ × পরের সেরা Q`, তারপর পুরোনো Q target-এর দিকে α-র মাপে সরে।
- State অনেক হলে table-এর বদলে সূত্র বা neural network Q অনুমান করে, আর এক অভিজ্ঞতা অনেক state-এর অনুমান বদলায়।

## নিজে করো

১. এখন Q(1, ডান) = 1.75, Q(2, ডান) = 5, Q(2, বাঁ) = 0। আবার একই অভিজ্ঞতা (ঘর 1, ডান, reward −1, next ঘর 2) এল। নতুন Q(1, ডান) কত? (α = 0.5, γ = 0.9)
২. শেখা table-এ ঘর 1-এর Q: বাঁ 4.58, ডান 8.0। এই ঘরে policy কোন action নেবে? V(ঘর 1) কত?
৩. উপরের সূত্রে এখন `w0 = 1`, `w1 = 2`। নতুন অভিজ্ঞতা: ঘর 1, target = 8, α = 0.1। নতুন `w0`, `w1` ও Q(0), Q(1), Q(2) কত?

<details><summary>উত্তর</summary>

১. Target = −1 + 0.9 × max(0, 5) = 3.5। নতুন Q = 1.75 + 0.5 × (3.5 − 1.75) = 2.625।
২. ডান (8.0 > 4.58)। V(ঘর 1) = সেরা Q = 8।
৩. অনুমান Q(1) = 1 + 2 × 1 = 3, error = 8 − 3 = 5। `w0 = 1 + 0.1 × 5 × 1 = 1.5`, `w1 = 2 + 0.1 × 5 × 1 = 2.5`। তাই Q(0) = 1.5, Q(1) = 1.5 + 2.5 = 4, Q(2) = 1.5 + 5 = 6.5।

</details>

## পরের পাঠ

এই lecture-এ চাল ছিল এলোমেলো। কিন্তু agent যদি শেখা Q দেখে সবসময় সেরা চালই দেয়, সে কি নতুন কিছু আবিষ্কার করতে পারবে? [Lecture 05 — Exploration, on-policy ও off-policy](lecture-05-exploration-on-off-policy.md)।
