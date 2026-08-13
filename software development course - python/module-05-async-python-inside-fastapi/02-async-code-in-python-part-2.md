# ০২. Async Code in Python Part 2 (Coroutine, Task, create_task)

আগের লেসনে আমরা দেখেছি asynchronous কোড কেন দরকার, আর GIL কেন Python-এর asyncio-র নকশার পেছনের একটা বড় কারণ। এখন সময় হয়েছে তিনটা শব্দের সম্পর্কটা পরিষ্কার করার — **coroutine**, **task**, আর `asyncio.create_task`। এই তিনটা এত ঘনঘন গুলিয়ে যায় যে অনেক ডেভেলপার বছরের পর বছর FastAPI লিখেও এদের সঠিক পার্থক্য জানে না, শুধু কাজ চলে যায় বলে চালিয়ে দেয়।

## Coroutine — একটা "রেসিপি যা এখনো শুরু হয়নি"

`async def` দিয়ে বানানো একটা ফাংশনকে ডাকলে, সেটা সাথে সাথে চলা শুরু করে না। বরং এটা একটা **coroutine object** তৈরি করে দেয় — একটা রেসিপির মতো, যেটা লেখা হয়ে গেছে, কিন্তু এখনো রান্না শুরু হয়নি।

```python
import asyncio

async def make_tea():
    print("চা বানানো শুরু")
    await asyncio.sleep(1)
    print("চা তৈরি")
    return "গরম চা"

coro = make_tea()
print(type(coro))  # <class 'coroutine'>
# এখনো "চা বানানো শুরু" প্রিন্ট হয়নি! coroutine তৈরি হয়েছে, চলেনি।
```

এই লাইনটা লক্ষ্য করার মতো — `make_tea()` কল করাটা ফাংশনটাকে **চালায় না**, শুধু একটা coroutine object বানায়। এটাকে আসলে "চালানোর" জন্য তিনটা রাস্তা আছে: `await` করা, `asyncio.run()`-এ পাঠানো, বা `asyncio.create_task()`-এ পাঠানো। নতুনদের সবচেয়ে বেশি বিভ্রান্ত করা একটা ভুল হলো একটা coroutine বানিয়ে সেটা `await` বা `create_task` না করেই ভুলে যাওয়া — Python এই ক্ষেত্রে একটা সতর্কবার্তা দেয়: `RuntimeWarning: coroutine 'make_tea' was never awaited`। এটা শুধু warning, error না — মানে কোডটা "নিরবে" চা বানানোর কাজটাই করেনি, কেউ খেয়াল না করলে এই বাগ প্রোডাকশনে অলক্ষিত থেকে যেতে পারে।

## Task — একটা "রান্নাঘরে বসিয়ে দেওয়া রেসিপি"

যখন তুমি চাও একটা কাজ **ব্যাকগ্রাউন্ডে চলুক, কিন্তু তার শেষ হওয়ার জন্য সাথে সাথে অপেক্ষা করতে না চাও**, তখন আসে `asyncio.create_task()`। এটা coroutine-টাকে event loop-এর কাছে জমা দিয়ে দেয়, "এখন থেকে শিডিউল করো, চালাও" — আর একটা `Task` object ফেরত দেয়, যেটাকে পরে `await` করে ফলাফল নেওয়া যায়।

```python
import asyncio

async def make_tea():
    await asyncio.sleep(2)
    return "গরম চা"

async def make_toast():
    await asyncio.sleep(1)
    return "টোস্ট"

async def main():
    tea_task = asyncio.create_task(make_tea())
    toast_task = asyncio.create_task(make_toast())

    # দুটোই এখন ব্যাকগ্রাউন্ডে "একসাথে" চলছে
    tea = await tea_task
    toast = await toast_task
    print(f"{toast} আর {tea} দুটোই রেডি")

asyncio.run(main())
```

এখানে পুরো প্রোগ্রাম প্রায় ২ সেকেন্ডে শেষ হবে, ৩ সেকেন্ডে না — কারণ `make_tea` আর `make_toast` দুটো `await asyncio.sleep()`-এর অপেক্ষার সময় একে অপরের সাথে ওভারল্যাপ করে, event loop দুটো coroutine-এর মধ্যে পালাক্রমে "সুইচ" করে। যদি এই দুটোকে সরাসরি `await make_tea()` তারপর `await make_toast()` লিখতাম (কোনো `create_task` না ব্যবহার করে), তাহলে প্রথমটা পুরো শেষ না হওয়া পর্যন্ত দ্বিতীয়টা শুরুই হতো না — মোট সময় লাগতো ৩ সেকেন্ড।

```mermaid
sequenceDiagram
    participant Main as main()
    participant Loop as Event Loop
    participant Tea as make_tea Task (2s)
    participant Toast as make_toast Task (1s)

    Main->>Loop: create_task(make_tea) — শিডিউল হলো
    Main->>Loop: create_task(make_toast) — শিডিউল হলো
    Loop->>Tea: চালানো শুরু
    Loop->>Toast: চালানো শুরু (tea-এর সাথে সমান্তরালে)
    Toast-->>Loop: ১ সেকেন্ড পর শেষ
    Tea-->>Loop: ২ সেকেন্ড পর শেষ
    Main->>Main: উভয়ের ফলাফল হাতে পাওয়া গেলো, মোট সময় ~২ সেকেন্ড
```

এখানে গুরুত্বপূর্ণ বিষয়টা হলো — এটা **সত্যিকারের parallel না**, GIL-এর কারণে একই মুহূর্তে একটাই কোড লাইন চলছে। কিন্তু I/O-অপেক্ষার সময়টায় event loop অন্য task-কে সুযোগ দিচ্ছে, তাই ফলাফলে মনে হচ্ছে দুটো কাজ "একসাথে" এগোচ্ছে — এই পার্থক্যটা (concurrency বনাম parallelism) মাথায় স্পষ্ট রাখা দরকার, কারণ ভুল ধারণা নিয়ে CPU-bound কাজে `create_task` ব্যবহার করলে কোনো লাভ হবে না, বরং কোড জটিল হয়ে যাবে।

## একাধিক Task-কে একসাথে অপেক্ষা করানো — `asyncio.gather`

উপরের উদাহরণে দুটো task-কে আলাদা করে `await` করেছি। বাস্তব কোডে, যখন অনেকগুলো স্বাধীন কাজ একসাথে চালাতে হয়, `asyncio.gather()` অনেক বেশি পরিষ্কার:

```python
async def main():
    tea, toast = await asyncio.gather(make_tea(), make_toast())
    print(f"{toast} আর {tea} দুটোই রেডি")
```

`gather` নিজেই ভেতরে ভেতরে coroutine-গুলোকে task বানিয়ে শিডিউল করে দেয়, তারপর সবগুলোর ফলাফল একটা লিস্টে (বা এখানে unpack করা tuple-এ) ফেরত দেয়।

## একটা প্রোডাকশন কর্নার কেস — একটা Task ব্যর্থ হলে বাকিগুলোর কী হয়

এখানে একটা বাস্তব প্রশ্ন আসা উচিত — ধরো তুমি পাঁচটা task একসাথে `gather` করেছো, আর তার মধ্যে একটা exception ছুঁড়ে দিলো। বাকি চারটার কী হবে? ডিফল্ট আচরণে, `asyncio.gather()` প্রথম যে exception পায় সেটা সাথে সাথে propagate করে দেয়, কিন্তু **বাকি task-গুলো বাতিল হয় না, চলতেই থাকে ব্যাকগ্রাউন্ডে** — এটা অনেক ডেভেলপারকে চমকে দেয়, কারণ তারা ধরে নেয় একটা ব্যর্থ হলে সব থেমে যাবে। এই "চুপচাপ চলতে থাকা" task-গুলো যদি নিজেরাও exception ছোঁড়ে, আর কেউ সেটা `await` করে না ধরে, তাহলে Python একটা "exception was never retrieved" warning দেয় — লগে চুপচাপ জমা হতে থাকে, কেউ খেয়াল না করলে প্রোডাকশনে ডিবাগ করা কঠিন হয়ে যায়।

যদি চাও একটা ব্যর্থ হলে বাকি সব task-ও বাতিল হয়ে যাক, তাহলে `return_exceptions=False` (যেটা ডিফল্ট) রেখে নিজে হাতে বাকি task-গুলো cancel করতে হবে, অথবা `return_exceptions=True` দিয়ে প্রতিটা task-এর ফলাফল/exception আলাদাভাবে নিয়ে নিজে যাচাই করতে হবে:

```python
results = await asyncio.gather(make_tea(), make_toast(), return_exceptions=True)
for result in results:
    if isinstance(result, Exception):
        print("একটা কাজ ব্যর্থ হয়েছে:", result)
    else:
        print("সফল:", result)
```

এই প্যাটার্নটা মনে রাখা জরুরি, কারণ ব্যাস্তব FastAPI প্রজেক্টে যখন একসাথে একাধিক ডেটাবেজ কল বা একাধিক external API কল `gather` করা হয় (যেমন একটা ড্যাশবোর্ড পেজে একসাথে ইউজার প্রোফাইল, অর্ডার হিস্টরি, আর নোটিফিকেশন — তিনটা আলাদা সোর্স থেকে আনা), একটা সোর্স ডাউন থাকলে বাকি দুটো যদি নিরবে ঝুলে থাকে বা চাপা exception রেখে দেয়, ডিবাগ করা রাতভর কষ্টের কাজ হয়ে যায়।

## Node.js-এর তুলনা

Node.js-এ `Promise.all()` প্রায় হুবহু `asyncio.gather()`-এর মতো আচরণ করে — একটা reject করলে সাথে সাথে propagate হয়, কিন্তু বাকি Promise-গুলো "settled" (resolve/reject) হওয়া পর্যন্ত ব্যাকগ্রাউন্ডে চলতেই থাকে। Node.js-এর `Promise.allSettled()` হলো Python-এর `return_exceptions=True`-এর সমতুল্য — সব ফলাফল, ব্যর্থতা সহ, একসাথে হাতে পাওয়া।

```js
const [tea, toast] = await Promise.all([makeTea(), makeToast()]);
```

কাঠামোটা এক, শুধু নাম আলাদা — Python-এ `create_task`/`gather`, Node.js-এ Promise নিজে থেকেই যখন তৈরি হয় তখনই ব্যাকগ্রাউন্ডে "শুরু" হয়ে যায় (Python-এর মতো আলাদা করে schedule করার লাগে না, এটা একটা সূক্ষ্ম পার্থক্য — JavaScript-এ Promise তৈরি হওয়া মাত্রই তার ভেতরের কোড সিঙ্ক্রোনাসভাবে শুরু হয়ে যায়, যতক্ষণ না প্রথম `await`-এ থামে)।

coroutine, task, আর gather-এর এই সম্পর্কটা এখন পরিষ্কার হয়ে গেছে। কিন্তু এখনো একটা মৌলিক প্রশ্ন বাকি — event loop ভেতরে ভেতরে ঠিক কীভাবে ঠিক করে "এখন কোন coroutine-এর পালা"? পরের লেসনে আমরা ঠিক সেই ইঞ্জিনটার ভেতরেই ঢুকবো।
