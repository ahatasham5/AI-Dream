# ০৮. Array, JSON and Higher Order Functions in JavaScript

ব্যাকএন্ডে বেশিরভাগ ডেটা একা আসে না — একজন ইউজার নয়, বরং হাজার ইউজারের তালিকা; একটা প্রোডাক্ট নয়, বরং পুরো ক্যাটালগ। Module 4-এ আমরা দেখেছিলাম এই ধরনের ডেটার স্বাভাবিক আকৃতি হলো **Array of Objects** — একগুচ্ছ JSON object-এর তালিকা। এখন প্রশ্ন হলো, এই তালিকা নিয়ে বাস্তব কাজ — ফিল্টার করা, রূপান্তর করা, যোগফল বের করা — কীভাবে দক্ষভাবে করা যায়? উত্তরটা হলো **higher-order functions** — এমন ফাংশন, যেগুলো অন্য একটা ফাংশনকে প্যারামিটার হিসেবে গ্রহণ করে, আর তার ভিত্তিতে সিদ্ধান্ত নেয়।

চিন্তা করো একটা রেস্টুরেন্টের ওয়েটারের কথা (যে উপমাটা আমরা আগেও ব্যবহার করেছি) — তুমি ওয়েটারকে বলতে পারো "শুধু নিরামিষ খাবারগুলো আলাদা করো" (এটা filter), অথবা "প্রতিটা খাবারের দামের সাথে ১০% ভ্যাট যোগ করে নতুন তালিকা দাও" (এটা map), অথবা "সব খাবারের মোট দাম বলো" (এটা reduce)। ওয়েটার নিজে জানে না কোন নিয়মে কাজ করতে হবে, তুমি তাকে নিয়মটা (ফাংশন আকারে) বলে দাও, আর সে সেটা প্রতিটা আইটেমের উপর প্রয়োগ করে। এটাই higher-order function-এর মূল ধারণা।

ধরা যাক আমাদের কাছে একটা প্রোডাক্ট ক্যাটালগ আছে:

```javascript
const products = [
  { id: 1, title: "রানিং শু", price: 1500, stock: 20, category: "footwear" },
  { id: 2, title: "টি-শার্ট", price: 500, stock: 0, category: "clothing" },
  { id: 3, title: "স্যান্ডেল", price: 800, stock: 12, category: "footwear" },
  { id: 4, title: "জ্যাকেট", price: 2500, stock: 5, category: "clothing" }
];
```

**`filter()`** — শর্ত মেলে এমন আইটেম বেছে নেয়। ধরো আমরা শুধু স্টকে থাকা প্রোডাক্টগুলো দেখাতে চাই:

```javascript
const inStock = products.filter((p) => p.stock > 0);
// স্টকে নেই এমন "টি-শার্ট" বাদ পড়ে যাবে
console.log(inStock.length); // 3
```

**`map()`** — প্রতিটা আইটেমকে রূপান্তর করে নতুন array বানায়। ধরো frontend-এ পাঠানোর আগে প্রতিটা প্রোডাক্টে একটা ফরম্যাট করা দামের ফিল্ড যোগ করতে হবে:

```javascript
const withFormattedPrice = products.map((p) => ({
  ...p, // আগের সব ফিল্ড অক্ষত রাখা হলো (immutable পদ্ধতি, আগের লেসনে শেখা)
  formattedPrice: `৳${p.price}`
}));
console.log(withFormattedPrice[0].formattedPrice); // "৳1500"
```

**`reduce()`** — পুরো array-কে একটা একক মানে "গুটিয়ে" আনে, যেমন যোগফল বের করা:

```javascript
const totalInventoryValue = products.reduce((total, p) => total + p.price * p.stock, 0);
console.log(totalInventoryValue); // প্রতিটা প্রোডাক্টের (দাম × স্টক) যোগফল
```

এখানে `reduce`-এর দ্বিতীয় প্যারামিটার (`0`) হলো শুরুর মান (accumulator-এর প্রাথমিক অবস্থা), আর প্রতিটা আইটেমের জন্য ফাংশনটা চলে, ধীরে ধীরে যোগফল জমা করে।

**`find()`** — শর্ত মেলে এমন প্রথম আইটেমটা বের করে (Module 4-এ সংক্ষেপে দেখেছিলাম):

```javascript
const jacket = products.find((p) => p.title === "জ্যাকেট");
console.log(jacket.price); // 2500
```

এই ফাংশনগুলোর আসল শক্তি বোঝা যায় যখন এগুলোকে **চেইন** করা হয় — একটার ফলাফল আরেকটার ইনপুট হিসেবে ব্যবহার করা:

```javascript
// footwear ক্যাটেগরির স্টকে থাকা প্রোডাক্টগুলোর মোট মূল্য বের করা
const footwearValue = products
  .filter((p) => p.category === "footwear" && p.stock > 0)
  .reduce((total, p) => total + p.price * p.stock, 0);

console.log(footwearValue); // (1500×20) + (800×12) = 39600
```

এই ধরনের চেইনিং প্রায় প্রতিটা বাস্তব Express.js route-এ দেখা যাবে। উদাহরণস্বরূপ, একটা GET endpoint যেটা query parameter অনুযায়ী প্রোডাক্ট ফিল্টার করে দেয়:

```javascript
app.get("/api/products", (req, res) => {
  const { category, inStockOnly } = req.query;

  let result = products;

  if (category) {
    result = result.filter((p) => p.category === category);
  }
  if (inStockOnly === "true") {
    result = result.filter((p) => p.stock > 0);
  }

  res.json({ success: true, count: result.length, data: result });
});
```

এই একটা endpoint-এর ভেতরেই আমরা এই মডিউলে শেখা প্রায় সব ধারণা একসাথে দেখতে পাচ্ছি — JSON আকারে ডেটা রাখা (Array of Objects), higher-order function দিয়ে সেই ডেটা প্রসেস করা, আর `res.json()` দিয়ে ফলাফল ফেরত পাঠানো, ঠিক যেভাবে Module 6 আর Module 8-এর আগের লেসনগুলোতে আমরা endpoint ডিজাইন করা শিখেছিলাম।

এখানেই Module 8-এর যাত্রা শেষ হচ্ছে — object, class, JSON, আর array নিয়ে কাজ করার মৌলিক আর ব্যবহারিক দক্ষতা এখন তোমার হাতে আছে। এই ভিত্তির উপর দাঁড়িয়ে পরের মডিউলে, **Module 9 — JS Essentials for Backend Development**-এ, আমরা JavaScript-এর ডেটা টাইপ, object, আর array নিয়ে আরও গভীরে যাবো, বিশেষ করে destructuring-এর মতো কৌশল শিখবো, যা ব্যাকএন্ড কোডকে আরও পরিষ্কার আর সংক্ষিপ্ত করে তোলে।
