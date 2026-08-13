# ০৮. List, JSON and Higher Order Functions in Python

ব্যাকএন্ডে বেশিরভাগ ডেটা একা আসে না — একজন ইউজার নয়, বরং হাজার ইউজারের তালিকা; একটা প্রোডাক্ট নয়, বরং পুরো ক্যাটালগ। Module 4-এ আমরা দেখেছিলাম এই ধরনের ডেটার স্বাভাবিক আকৃতি হলো **List of Dicts** — একগুচ্ছ JSON object-এর তালিকা। এখন প্রশ্ন হলো, এই তালিকা নিয়ে বাস্তব কাজ — ফিল্টার করা, রূপান্তর করা, যোগফল বের করা — কীভাবে দক্ষভাবে করা যায়? Python-এ এর প্রধান দুইটা টুল হলো **list comprehension** আর **`functools.reduce`** — যেগুলো একটা নিয়ম (function বা expression) নিয়ে প্রতিটা আইটেমের উপর প্রয়োগ করে।

চিন্তা করো একটা রেস্টুরেন্টের ওয়েটারের কথা (যে উপমাটা আমরা আগেও ব্যবহার করেছি) — তুমি ওয়েটারকে বলতে পারো "শুধু নিরামিষ খাবারগুলো আলাদা করো" (এটা filter), অথবা "প্রতিটা খাবারের দামের সাথে ১০% ভ্যাট যোগ করে নতুন তালিকা দাও" (এটা map/transform), অথবা "সব খাবারের মোট দাম বলো" (এটা reduce)। ওয়েটার নিজে জানে না কোন নিয়মে কাজ করতে হবে, তুমি তাকে নিয়মটা বলে দাও, আর সে সেটা প্রতিটা আইটেমের উপর প্রয়োগ করে। JavaScript-এ এই কাজগুলো `filter()`/`map()`/`reduce()` মেথড দিয়ে হতো; Python-এ সেই একই ধারণাটা প্রকাশ করা হয় **list comprehension** সিনট্যাক্স দিয়ে, যেটা প্রায়ই আরও সংক্ষিপ্ত আর পাইথনিক।

ধরা যাক আমাদের কাছে একটা প্রোডাক্ট ক্যাটালগ আছে:

```python
products = [
    {"id": 1, "title": "রানিং শু", "price": 1500, "stock": 20, "category": "footwear"},
    {"id": 2, "title": "টি-শার্ট", "price": 500, "stock": 0, "category": "clothing"},
    {"id": 3, "title": "স্যান্ডেল", "price": 800, "stock": 12, "category": "footwear"},
    {"id": 4, "title": "জ্যাকেট", "price": 2500, "stock": 5, "category": "clothing"},
]
```

**ফিল্টার করা** — শর্ত মেলে এমন আইটেম বেছে নেওয়া। ধরো আমরা শুধু স্টকে থাকা প্রোডাক্টগুলো দেখাতে চাই:

```python
in_stock = [p for p in products if p["stock"] > 0]
# স্টকে নেই এমন "টি-শার্ট" বাদ পড়ে যাবে
print(len(in_stock))  # 3
```

**রূপান্তর করা (map-এর সমতুল্য)** — প্রতিটা আইটেমকে বদলে নতুন list বানানো। ধরো frontend-এ পাঠানোর আগে প্রতিটা প্রোডাক্টে একটা ফরম্যাট করা দামের ফিল্ড যোগ করতে হবে:

```python
with_formatted_price = [
    {**p, "formatted_price": f"৳{p['price']}"}  # আগের সব ফিল্ড অক্ষত রাখা হলো (immutable পদ্ধতি, আগের লেসনে শেখা)
    for p in products
]
print(with_formatted_price[0]["formatted_price"])  # "৳1500"
```

**`functools.reduce()`** — পুরো list-কে একটা একক মানে "গুটিয়ে" আনে, যেমন যোগফল বের করা:

```python
from functools import reduce

total_inventory_value = reduce(lambda total, p: total + p["price"] * p["stock"], products, 0)
print(total_inventory_value)  # প্রতিটা প্রোডাক্টের (দাম × স্টক) যোগফল
```

এখানে `reduce`-এর তৃতীয় প্যারামিটার (`0`) হলো শুরুর মান (accumulator-এর প্রাথমিক অবস্থা), আর প্রতিটা আইটেমের জন্য lambda ফাংশনটা চলে, ধীরে ধীরে যোগফল জমা করে। বাস্তবে অবশ্য সহজ যোগফলের জন্য `sum()` বিল্ট-ইন ফাংশন আর একটা জেনারেটর এক্সপ্রেশন দিয়েও একই কাজ করা যায় (`sum(p["price"] * p["stock"] for p in products)`) — `reduce` তখনই আসলে দরকার হয়, যখন যোগফলের চেয়ে জটিল কোনো accumulation লজিক লাগে।

**খুঁজে বের করা (find-এর সমতুল্য)** — শর্ত মেলে এমন প্রথম আইটেমটা বের করা:

```python
jacket = next((p for p in products if p["title"] == "জ্যাকেট"), None)
print(jacket["price"])  # 2500
```

এই কৌশলগুলোর আসল শক্তি বোঝা যায় যখন এগুলোকে **একের পর এক** প্রয়োগ করা হয় — একটার ফলাফল আরেকটার ইনপুট হিসেবে ব্যবহার করা:

```python
# footwear ক্যাটেগরির স্টকে থাকা প্রোডাক্টগুলোর মোট মূল্য বের করা
footwear_products = [p for p in products if p["category"] == "footwear" and p["stock"] > 0]
footwear_value = reduce(lambda total, p: total + p["price"] * p["stock"], footwear_products, 0)

print(footwear_value)  # (1500×20) + (800×12) = 39600
```

এই ধরনের প্যাটার্ন প্রায় প্রতিটা বাস্তব FastAPI route-এ দেখা যাবে। উদাহরণস্বরূপ, একটা GET endpoint যেটা query parameter অনুযায়ী প্রোডাক্ট ফিল্টার করে দেয়:

```python
from typing import Optional

@app.get("/api/products")
def get_products(category: Optional[str] = None, in_stock_only: bool = False):
    result = products

    if category:
        result = [p for p in result if p["category"] == category]
    if in_stock_only:
        result = [p for p in result if p["stock"] > 0]

    return {"success": True, "count": len(result), "data": result}
```

এই একটা endpoint-এর ভেতরেই আমরা এই মডিউলে শেখা প্রায় সব ধারণা একসাথে দেখতে পাচ্ছি — JSON আকারে ডেটা রাখা (List of Dicts), list comprehension দিয়ে সেই ডেটা প্রসেস করা, আর একটা dict রিটার্ন করে FastAPI-কে দিয়ে JSON রেসপন্স বানানো, ঠিক যেভাবে Module 6 আর Module 8-এর আগের লেসনগুলোতে আমরা endpoint ডিজাইন করা শিখেছিলাম।

**একটা প্রোডাকশন নুয়ান্স — list comprehension কখন পড়া কঠিন হয়ে যায়।** উপরের উদাহরণগুলোতে প্রতিটা comprehension-এ একটাই সহজ শর্ত ছিল, তাই এক লাইনে লেখা স্বাভাবিক পড়া যাচ্ছিল। কিন্তু ধরো তোমাকে একসাথে চার-পাঁচটা শর্ত (category মিলছে কিনা, stock আছে কিনা, discount সক্রিয় কিনা, supplier ব্লক করা না থাকলে) একটাই comprehension-এ বসাতে হলো — তখন এক লাইনের মধ্যে এত বেশি `and`/`or`/নেগেশন লজিক ঠেসে দিলে ছয় মাস পর কেউ (এমনকি তুমি নিজেও) এই কোডে ফিরে এসে বুঝতে অনেক সময় নেবে ঠিক কোন শর্তটা কী করছে। এটাই list comprehension-এর **readability limit** — যখন এটা একনজরে বোঝা যাচ্ছে না, তখন সেটা আর "সংক্ষিপ্ত" নয়, বরং "গোপন জটিলতা" হয়ে দাঁড়ায়। এই অবস্থায় একটা সাধারণ `for` লুপে ফিরে যাওয়াই ভালো, যেখানে প্রতিটা শর্ত নিজের একটা লাইন পায় আর একটা বর্ণনামূলক নাম (যেমন `is_eligible`) দিয়ে বোঝা যায় কী চেক করা হচ্ছে। সংক্ষিপ্ত কোড লেখাই সবসময় লক্ষ্য না — পরে যে কেউ (তুমি নিজেও ছয় মাস পর) সহজে পড়তে পারবে, সেটাই আসল লক্ষ্য।

এখানেই Module 8-এর যাত্রা শেষ হচ্ছে — object, class, JSON, আর list নিয়ে কাজ করার মৌলিক আর ব্যবহারিক দক্ষতা এখন তোমার হাতে আছে। এই ভিত্তির উপর দাঁড়িয়ে পরের মডিউলে, **Module 9 — Python Essentials for Backend Development**-এ, আমরা Python-এর ডেটা টাইপ, dict, আর list নিয়ে আরও গভীরে যাবো, বিশেষ করে unpacking-এর মতো কৌশল শিখবো, যা ব্যাকএন্ড কোডকে আরও পরিষ্কার আর সংক্ষিপ্ত করে তোলে।
