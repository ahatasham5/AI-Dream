# ০৩. Javascript Objects In Real Life

গত লেসনে আমরা object-কে একটা ফোল্ডারের সাথে তুলনা করেছিলাম। এবার চলো আরেকটু বাস্তব একটা উদাহরণ নিই — Module 8-এ আমরা যে ই-কমার্স প্রোডাক্টের কথা বলেছিলাম, সেটাকেই আরেকটু বিস্তারিতভাবে দেখি।

বাস্তব জীবনে একটা প্রোডাক্টের অনেক বৈশিষ্ট্য থাকে — নাম, দাম, স্টকে কতগুলো আছে, কোন ক্যাটাগরির। আর কিছু আচরণও থাকে — যেমন দাম কমানো, স্টক আপডেট করা। জাভাস্ক্রিপ্ট object দিয়ে এই দুটোই একসাথে প্রকাশ করা যায় — বৈশিষ্ট্য (properties) আর আচরণ (methods)।

```javascript
const product = {
  name: "Wireless Mouse",
  price: 950,
  stock: 40,
  category: "Electronics",

  applyDiscount(percentage) {
    const discountAmount = (this.price * percentage) / 100;
    this.price = this.price - discountAmount;
    return this.price;
  },

  isInStock() {
    return this.stock > 0;
  }
};

console.log(product.name);        // "Wireless Mouse"
product.applyDiscount(10);        // দাম ১০% কমিয়ে দেবে
console.log(product.price);       // 855
console.log(product.isInStock()); // true
```

এখানে `applyDiscount` আর `isInStock` হলো method — অর্থাৎ object-এর ভেতরে থাকা function। লক্ষ্য করো `this` শব্দটা — এটা বলে দিচ্ছে "এই object-টার নিজের ভেতরের `price` বা `stock`-এর কথা বলছি, অন্য কোনো ভ্যারিয়েবলের না।" `this` অনেকটা মানুষের কথা বলার সময় "আমার" শব্দটার মতো — একজন ওয়েটার যখন বলে "আমার টেবিলের অর্ডার", তখন সে তার নিজের দায়িত্বে থাকা টেবিলের কথা বলছে, অন্য ওয়েটারের টেবিলের কথা না।

এখন প্রশ্ন হলো, ব্যাকএন্ডে এটা কোথায় কাজে লাগে? মনে করো Module 6-এ আমরা যে POST endpoint বানিয়েছিলাম, সেখানে `req.body` থেকে যে ডেটা আসে, সেটাও একটা object।

```javascript
app.post("/products", (req, res) => {
  const newProduct = req.body; // { name: "Keyboard", price: 1200, stock: 15 }
  console.log(newProduct.name);
  res.status(201).json({ message: "Product created", data: newProduct });
});
```

এখানে `req.body` কোনো জাদু নয় — এটা ঠিক আগের `product` object-এর মতোই একটা সাধারণ জাভাস্ক্রিপ্ট object, শুধু এটা এসেছে ক্লায়েন্টের পাঠানো JSON থেকে (Module 8 লেসন ৪-এ আমরা এই ফ্লো দেখেছিলাম)।

```mermaid
flowchart LR
    Client[ক্লায়েন্ট থেকে JSON আসে] --> Parse["express.json() middleware পার্স করে"]
    Parse --> Body[req.body একটা সাধারণ JS Object হয়ে যায়]
    Body --> Use[তুমি .name, .price ইত্যাদি দিয়ে অ্যাক্সেস করো]
```

তাহলে দেখা যাচ্ছে, object শুধু থিওরির জিনিস না — এটাই সেই মৌলিক কাঠামো যার উপর দাঁড়িয়ে পুরো API ডেভেলপমেন্ট চলে। এখন প্রশ্ন আসে, একটা না, অনেকগুলো প্রোডাক্ট একসাথে থাকলে কী হবে? সেটার উত্তর খুঁজতেই পরের লেসনে আমরা array আর array of objects নিয়ে কথা বলবো।
