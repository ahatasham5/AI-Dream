# ৩৪.০২. Using Debug Logs Effectively

আগের লেসনে আমরা বলেছিলাম logs হলো প্রোডাকশন ডিবাগিং-এর সবচেয়ে প্রাথমিক প্রমাণ। কিন্তু শুধু লগ থাকলেই চলবে না — Module 32-তে আমরা Winston/Pino দিয়ে লগ লিখতে শিখেছিলাম, এখন শিখবো কীভাবে সেই লগগুলোকে *ডিবাগিং-এর জন্য কার্যকরভাবে* ব্যবহার করতে হয়। একটা খারাপভাবে লেখা লগ লাইন, আর একটা ভালোভাবে লেখা লগ লাইনের মধ্যে পার্থক্য হতে পারে ৫ মিনিট বনাম ৫ ঘণ্টার ডিবাগিং সময়ের।

প্রথম সমস্যা হলো **log level** ঠিকভাবে ব্যবহার না করা। অনেকে সবকিছু `info` দিয়ে লেখে, ফলে প্রোডাকশনে হাজার হাজার লাইনের মধ্যে আসল সমস্যাটা হারিয়ে যায়। সঠিক নিয়ম হলো:

```js
const logger = require('./logger'); // Module 32-এর Winston logger

logger.debug('Cache lookup attempted', { key: cacheKey }); // শুধু ডেভেলপমেন্টে দরকার
logger.info('Order created', { orderId: order.id }); // স্বাভাবিক ঘটনা, রেকর্ড রাখার জন্য
logger.warn('Payment retry triggered', { orderId: order.id, attempt: 2 }); // সন্দেহজনক, কিন্তু ভাঙেনি
logger.error('Payment failed permanently', { orderId: order.id, error: err.message, stack: err.stack });
```

প্রোডাকশনে সাধারণত `debug` লেভেল বন্ধ রাখা হয় (পারফরম্যান্সের জন্য), কিন্তু যখন একটা নির্দিষ্ট সমস্যা তদন্ত করছো, সাময়িকভাবে সেই লেভেল চালু করে দেখা যায় — একে বলে **dynamic log level**:

```js
// একটা প্রোটেক্টেড admin endpoint, যেটা রানটাইমে log level বদলাতে দেয়
app.post('/admin/log-level', requireAdmin, (req, res) => {
  logger.level = req.body.level; // যেমন 'debug'
  res.json({ message: `Log level changed to ${req.body.level}` });
});
```

এভাবে পুরো অ্যাপ redeploy না করেই, সন্দেহজনক সময়ে বেশি বিস্তারিত তথ্য পাওয়া যায়, আর সমস্যা মিটে গেলে আবার `info`-তে ফিরিয়ে আনা যায় — একটা ডাক্তারের মতো, যিনি সাধারণ চেকআপে হালকা পরীক্ষা করেন, কিন্তু সন্দেহ হলে বিস্তারিত টেস্ট করান।

দ্বিতীয় গুরুত্বপূর্ণ অভ্যাস হলো **প্রাসঙ্গিক তথ্য (context) যোগ করা**। শুধু `logger.error('Something failed')` লেখা প্রায় অকেজো — কোন request, কোন ইউজার, কোন ডেটা নিয়ে fail হলো, সেটা ছাড়া তদন্ত করা অসম্ভব। আগের লেসনের `correlationId` এখানেই কাজে লাগে:

```mermaid
flowchart LR
    Bad["logger.error('DB error')"] -->|তদন্তে অকেজো| Confused["কোন request? কোন ডেটা? জানা নেই"]
    Good["logger.error('Order save failed', { correlationId, orderId, userId, error: err.message })"] -->|সরাসরি সমাধানের পথ দেখায়| Found["দ্রুত root cause খুঁজে পাওয়া যায়"]
```

তৃতীয় অভ্যাস — **error object পুরোটা লগ করা**, শুধু `err.message` না, `err.stack`-ও রাখা, কারণ stack trace বলে দেয় ঠিক কোন ফাইলের কোন লাইনে সমস্যাটা শুরু হয়েছিলো। আর চতুর্থ, প্রায়ই ভুলে যাওয়া অভ্যাস — sensitive data (পাসওয়ার্ড, টোকেন, কার্ড নম্বর) কখনো লগে না রাখা, কারণ লগ ফাইল অনেক মানুষ দেখতে পারে, আর এটা Module 12-এ শেখা নিরাপত্তার নীতির সরাসরি লঙ্ঘন।

লগ যত ভালোভাবেই লেখা হোক না কেন, কখনো কখনো সমস্যাটা এত জটিল হয় যে শুধু লগ দিয়ে ধরা যায় না — তখন দরকার হয় সরাসরি চলমান প্রসেসের ভেতরে উঁকি দেওয়া। পরের লেসনে আমরা শিখবো কীভাবে নিরাপদে remote debugging করা যায়।
