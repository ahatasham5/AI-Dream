# ৩৬.২১ Error Handling and Debugging in Fullstack Application

আগের লেসনে আমরা API দ্রুত করলাম caching দিয়ে। কিন্তু দ্রুত API-ও যদি ভুলভাবে error handle করে, ব্যবহারকারীর অভিজ্ঞতা খারাপ হবে। এই লেসনে আমরা Module ৩৪-এ শেখা debugging কৌশলগুলোকে একটা সুসংগঠিত error-handling সিস্টেমে রূপ দেবো, পুরো Personal Growth Tracker জুড়ে।

একটা হাসপাতালের ইমার্জেন্সি রুমের কথা ভাবো — প্রতিটা রোগীর (error) জন্য একটা স্পষ্ট প্রক্রিয়া থাকে: প্রথমে ট্রায়াজ (কত গুরুতর), তারপর সঠিক বিভাগে পাঠানো, আর রেকর্ড রাখা। এলোমেলোভাবে সবাইকে একই ঘরে ঢুকিয়ে দিলে বিশৃঙ্খলা তৈরি হয় — কোডেও ছড়িয়ে-ছিটিয়ে `try-catch` লিখলে একই সমস্যা হয়।

```mermaid
flowchart TD
    A[Route Handler-এ Error হলো] --> B[next(error) কল করলো]
    B --> C[Centralized Error Middleware]
    C --> D{Error-এর ধরন কী?}
    D -->|Validation Error| E[400 + স্পষ্ট মেসেজ]
    D -->|Auth Error| F[401/403]
    D -->|Not Found| G[404]
    D -->|অজানা Error| H[500 + Module 32 এ Log করা]
    E --> I[Client-কে Response]
    F --> I
    G --> I
    H --> I
```

Express-এ একটা centralized error handler, যেটা সব রুটের জন্য একই জায়গা থেকে error সামলায়:

```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  logger.error('অপ্রত্যাশিত error', {
    requestId: req.id,
    route: req.originalUrl,
    error: err.message,
    stack: err.stack,
  }); // Module 32-এ শেখা structured logging

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'অননুমোদিত অ্যাক্সেস' });
  }

  res.status(500).json({ error: 'কিছু একটা ভুল হয়েছে, আমরা দেখছি।' });
}

module.exports = errorHandler;
// server.js-এ সবার শেষে বসাতে হয়:
app.use(errorHandler);
```

Route-এ এখন শুধু `next(error)` কল করলেই চলে, নিজে থেকে response পাঠাতে হয় না:

```javascript
router.post('/', async (req, res, next) => {
  try {
    if (!req.body.title) {
      const err = new Error('title আবশ্যক');
      err.name = 'ValidationError';
      throw err;
    }
    const habit = await Habit.create({ userId: req.user.id, ...req.body });
    res.status(201).json(habit);
  } catch (err) {
    next(err); // centralized handler-এ পাঠিয়ে দিলো
  }
});
```

Frontend-এও একই ধরনের কেন্দ্রীভূত পদ্ধতি দরকার — একটা global fetch wrapper, যেটা সব API error একই জায়গা থেকে সামলায়, যাতে প্রতিটা কম্পোনেন্টে একই try-catch বারবার লিখতে না হয়:

```javascript
async function apiCall(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'অজানা সমস্যা');
  }
  return res.json();
}
```

এভাবে error handling ছড়িয়ে-ছিটিয়ে না রেখে একটা কেন্দ্রীয় জায়গায় সংগঠিত করা হলো — এখন যেকোনো নতুন error টাইপ যোগ করা, বা error message বদলানো, একটা মাত্র জায়গায় করলেই হয়। এই দীর্ঘ প্রজেক্ট-যাত্রার একদম শেষ ধাপে, একটা বিষয় বাকি রয়ে গেছে, যেটা সবসময় শেষে ভাবলে অনেক দেরি হয়ে যায় — নিরাপত্তা। পরের ও শেষ লেসনে আমরা সেটাই দেখবো।
