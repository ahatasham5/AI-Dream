# ০৭. Accessing and Manipulating JSON Data

একটা JSON object হাতে পাওয়া মানেই কাজ শেষ না — বরং আসল কাজ শুরু হয় তখন, যখন তোমাকে তার ভেতর থেকে নির্দিষ্ট তথ্য খুঁজে বের করতে হয়, অথবা কোনো একটা মান পরিবর্তন করতে হয়। ধরো একটা আলমারি আছে, যার ভেতরে অনেকগুলো ড্রয়ার, আর প্রতিটা ড্রয়ারের ভেতরে আবার ছোট ছোট বাক্স থাকতে পারে। JSON object-এর ভেতরের ডেটা অ্যাক্সেস করা অনেকটা এই আলমারি থেকে সঠিক ড্রয়ার খুলে সঠিক বাক্সটা বের করার মতোই একটা সুশৃঙ্খল প্রক্রিয়া।

ধরা যাক আমাদের কাছে আগের লেসনের প্রোডাক্ট object-টা আছে:

```javascript
const product = {
  id: "prod_1001",
  title: "রানিং শু",
  price: 1500,
  stock: 20,
  category: "footwear",
  supplier: {
    name: "স্পোর্টস হাউস",
    location: "ঢাকা"
  }
};
```

এর ভেতরের মান অ্যাক্সেস করার দুইটা উপায় আছে — **dot notation** আর **bracket notation**।

```javascript
// Dot notation — সবচেয়ে বেশি ব্যবহৃত, যখন key-এর নাম আগে থেকে জানা থাকে
console.log(product.title); // "রানিং শু"
console.log(product.supplier.name); // "স্পোর্টস হাউস" — nested object-এর ভেতরে যাওয়া

// Bracket notation — যখন key-এর নাম একটা variable-এ থাকে, অথবা key-তে স্পেস/বিশেষ অক্ষর থাকে
const field = "price";
console.log(product[field]); // 1500

console.log(product["category"]); // "footwear" — dot notation-এর সমতুল্য, কিন্তু string আকারে
```

লক্ষ্য করো, bracket notation বিশেষভাবে কাজে লাগে যখন কোন key অ্যাক্সেস করবে সেটা আগে থেকে জানা থাকে না, বরং রানটাইমে ঠিক হয় — যেমন কোনো ফাংশন যদি ব্যবহারকারীর দেওয়া ফিল্ডের নাম অনুযায়ী ডেটা খুঁজে বের করে।

এবার আসা যাক পরিবর্তনের (manipulation) প্রসঙ্গে। এখানে একটা গুরুত্বপূর্ণ পার্থক্য বোঝা দরকার — **mutable** (সরাসরি পরিবর্তন) বনাম **immutable** (মূল object অক্ষত রেখে নতুন object তৈরি) পদ্ধতি।

```javascript
// Mutable পদ্ধতি — সরাসরি মূল object পরিবর্তন করা হচ্ছে
product.stock = 15;
product.price = 1400;
console.log(product.stock); // 15 — মূল object-ই বদলে গেছে

// Immutable পদ্ধতি — spread operator ব্যবহার করে একটা নতুন object তৈরি করা হচ্ছে
const updatedProduct = { ...product, stock: 15, price: 1400 };
console.log(product.stock); // এখনও পুরনো মান, কারণ মূল object অক্ষত আছে
console.log(updatedProduct.stock); // 15 — নতুন object-এ পরিবর্তিত মান
```

`{ ...product, stock: 15 }`-এ ব্যবহৃত তিনটা ডট (`...`) কে বলে **spread operator** — এটা মূল object-এর সব key-value কপি করে একটা নতুন object তৈরি করে, তারপর যে key-গুলো নতুন করে দেওয়া হয়েছে (এখানে `stock`), সেগুলো ওভাররাইট করে দেয়।

প্রশ্ন হতে পারে — mutable পদ্ধতি সহজ হলেও কেন immutable পদ্ধতি এত গুরুত্বপূর্ণ, বিশেষ করে ব্যাকএন্ডে? কারণটা হলো নির্ভরযোগ্যতা। ধরো একটা ফাংশন ডেটাবেজ থেকে একটা প্রোডাক্ট object নিয়ে এলো, আর সেটা নিয়ে কয়েকটা হিসাব-নিকাশ করতে হবে বিভিন্ন জায়গায়। যদি কোনো একটা ফাংশন সরাসরি সেই মূল object পরিবর্তন করে ফেলে, তাহলে অন্য জায়গায় যেখানে পুরনো মানটা দরকার ছিল, সেখানে ভুল ফলাফল আসবে — কারণ ডেটা "চুপিচুপি" বদলে গেছে। immutable পদ্ধতি এই সমস্যা এড়ায়, কারণ প্রতিটা পরিবর্তন একটা নতুন, আলাদা object তৈরি করে, মূলটা অক্ষত থাকে।

nested object-এর ক্ষেত্রেও একই নীতি প্রযোজ্য, শুধু একটু বাড়তি যত্ন লাগে:

```javascript
// supplier-এর location পরিবর্তন করতে হলে nested spread দরকার
const relocated = {
  ...product,
  supplier: { ...product.supplier, location: "চট্টগ্রাম" }
};
console.log(relocated.supplier.location); // "চট্টগ্রাম"
console.log(product.supplier.location); // "ঢাকা" — মূল ডেটা অক্ষত
```

এই dot/bracket notation আর mutable/immutable পরিবর্তনের কৌশলগুলো প্রতিটা ব্যাকএন্ড route handler-এ বারবার ব্যবহার হবে — বিশেষ করে PUT আর PATCH endpoint-এ, যেখানে কোনো একটা রিসোর্সের নির্দিষ্ট কিছু ফিল্ড আপডেট করতে হয়। কিন্তু বাস্তব ডেটা সবসময় একটা একক object না — বেশিরভাগ ক্ষেত্রেই আমাদের কাজ করতে হয় object-এর একটা তালিকা নিয়ে, যেমন সব প্রোডাক্টের array। পরের লেসনে আমরা দেখবো কীভাবে সেই array-গুলো নিয়ে কার্যকরভাবে কাজ করা যায়।
