# ৩২.০৪. Error Logging and Stack Trace Management

আগের লেসনে আমরা প্রতিটা request/response লগ করা শিখেছি, আর দেখেছি ৫০০ স্ট্যাটাস কোড আসলে সেটাকে `error` লেভেলে লগ করা হচ্ছে। কিন্তু একটা এরর শুধু "স্ট্যাটাস কোড ৫০০" বললেই যথেষ্ট না — আমাদের জানা দরকার *ঠিক কোথায়*, *কোন লাইনে*, *কী কারণে* এররটা ঘটলো। এই তথ্যই থাকে **stack trace**-এ, আর এই লেসনে আমরা শিখবো কীভাবে এটা সঠিকভাবে ধরতে, লগ করতে হয়।

## Stack Trace আসলে কী

যখন JavaScript-এ একটা এরর তৈরি হয়, সেটা নিজের সাথে একটা "ভ্রমণপথ" বহন করে — এরর কোন ফাংশন থেকে শুরু হয়ে কোন কোন ফাংশন হয়ে উপরে উঠে এসেছে, তার একটা তালিকা। এটা অনেকটা ডাক পার্সেলের ট্র্যাকিং হিস্ট্রির মতো — শুধু "পার্সেল হারিয়ে গেছে" জানলে চলে না, জানা দরকার ঠিক কোন গুদামে গিয়ে হারিয়েছে।

```js
function getProductPrice(product) {
  return product.price.amount; // যদি product.price undefined হয়, এখানে ক্র্যাশ করবে
}

function calculateTotal(cart) {
  return cart.items.reduce((sum, item) => sum + getProductPrice(item), 0);
}

// calculateTotal({ items: [{ name: 'Book' }] }) কল করলে:
// TypeError: Cannot read properties of undefined (reading 'amount')
//     at getProductPrice (/app/cart.js:2:25)
//     at /app/cart.js:6:44
//     at Array.reduce (<anonymous>)
//     at calculateTotal (/app/cart.js:6:22)
```

এই stack trace থেকে আমরা ঠিক বুঝতে পারি এরর `getProductPrice` ফাংশনের ভেতরে, `cart.js` ফাইলের ২ নম্বর লাইনে ঘটেছে, আর সেটা `calculateTotal`-এর ভেতর থেকে কল হয়েছিলো। এই তথ্য ছাড়া শুধু "TypeError হয়েছে" জানলে হাজার লাইনের কোডবেসে সমস্যাটা খুঁজে বের করা প্রায় অসম্ভব হয়ে যেতো।

## Express-এ Centralized Error Handling

Module 7-এ middleware শেখার সময় আমরা জেনেছিলাম Express-এ একটা বিশেষ ধরনের middleware আছে যার ৪টা প্যারামিটার থাকে (`err, req, res, next`) — এটাই **error-handling middleware**। এটাকেই আমরা ব্যবহার করবো সব এরর এক জায়গায় ধরে, সঠিকভাবে লগ করার জন্য।

```js
const logger = require('./logger');

// route handler-এ এরর হলে next(err) দিয়ে এখানে পাঠানো হয়
function errorHandler(err, req, res, next) {
  logger.error('Unhandled error occurred', {
    requestId: req.requestId, // আগের লেসনের middleware থেকে পাওয়া
    method: req.method,
    path: req.originalUrl,
    errorMessage: err.message,
    stack: err.stack, // পুরো stack trace সংরক্ষণ
  });

  // ইউজারকে stack trace কখনোই দেখানো উচিত না — নিরাপত্তা ঝুঁকি
  res.status(err.statusCode || 500).json({
    error: 'একটা সমস্যা হয়েছে, পরে আবার চেষ্টা করুন',
    requestId: req.requestId, // ইউজার এই আইডি সাপোর্টকে জানালে দ্রুত খুঁজে বের করা যাবে
  });
}

module.exports = errorHandler;
```

এই middleware-টাকে `app.use()` চেইনের সবচেয়ে শেষে বসাতে হবে, সব route-এর পরে:

```js
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);

app.use(errorHandler); // সবার শেষে — Express নিয়ম অনুযায়ী এখানেই বসাতে হয়
```

Async route handler-এ থ্রো হওয়া এরর স্বয়ংক্রিয়ভাবে এই middleware-এ পৌঁছায় না, তাই `try/catch` দিয়ে ধরে `next(err)` কল করতে হয়:

```js
app.post('/api/orders', async (req, res, next) => {
  try {
    const order = await createOrder(req.body);
    res.status(201).json({ data: order });
  } catch (err) {
    next(err); // errorHandler middleware-এ পাঠানো হলো
  }
});
```

## requestId দিয়ে সংযোগ স্থাপন

লক্ষ করো, error log-এও আমরা সেই একই `req.requestId` ব্যবহার করছি যা আগের লেসনে তৈরি হয়েছিলো। এটা খুবই শক্তিশালী একটা প্যাটার্ন — যদি একজন ইউজার অভিযোগ করে "আমার অর্ডার দিতে সমস্যা হচ্ছে", আর তুমি তাকে requestId জিজ্ঞেস করো (বা সেটা response-এ আগে থেকেই ছিলো), তাহলে তুমি লগ ফাইলে সেই একটা আইডি দিয়ে সার্চ করে সেই নির্দিষ্ট রিকোয়েস্টের পুরো জীবনচক্র — শুরু থেকে এরর পর্যন্ত — এক জায়গায় দেখতে পাবে।

```mermaid
flowchart TD
    A[একটা Error থ্রো হলো] --> B[try/catch দিয়ে ধরা হলো]
    B --> C[next(err) দিয়ে Error Middleware-এ পাঠানো]
    C --> D[পুরো Stack Trace + requestId লগ করা হলো]
    D --> E[Log ফাইলে সংরক্ষিত]
    C --> F[Client-কে নিরাপদ, সংক্ষিপ্ত Error Message পাঠানো]
```

এখন আমাদের সিস্টেম এরর সঠিকভাবে ধরে, লগ করে, আর ইউজারকে নিরাপদ জবাব দেয়। কিন্তু এই সব লগ যদি একটা ফাইলে জমতে থাকে অসীমভাবে, একদিন সেই ফাইল ডিস্কের পুরো জায়গা দখল করে ফেলবে। পরের, এই মডিউলের শেষ লেসনে আমরা দেখবো কীভাবে লগ ফাইল ব্যবস্থাপনা (rotation, storage) করতে হয়, যাতে এই সমস্যা না হয়।
