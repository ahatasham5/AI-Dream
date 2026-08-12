# ০৫. Payment Processing with Stripe

আগের চারটা লেসনে আমরা যোগাযোগ (ইমেইল, SMS, WhatsApp) আর ডেটা সিঙ্ক (Salesforce CRM) নিয়ে কাজ করেছি — কোথাও সরাসরি টাকার লেনদেন জড়িত ছিলো না। এবার আমরা এমন একটা জায়গায় ঢুকছি যেখানে ভুল করার সুযোগ প্রায় নেই — **পেমেন্ট প্রসেসিং**। ধরো তুমি একটা ই-কমার্স সাইট বানাচ্ছো, ইউজার "Buy Now" চাপলো — এখন তার কার্ডের নম্বর কোথায় যাবে? তুমি কি নিজের সার্ভারে কার্ডের নম্বর সেভ করবে?

এই প্রশ্নের উত্তর একেবারে স্পষ্ট — **না, কখনোই না**। কার্ডের তথ্য নিজের সার্ভারে ছোঁয়ার সাথে সাথে তুমি একটা বিশাল কমপ্লায়েন্স দায়িত্বের (PCI-DSS) মধ্যে পড়ে যাও, আর সামান্য একটা নিরাপত্তা-ভুল হলে হাজার হাজার কার্ডের তথ্য চুরি হয়ে যেতে পারে। ঠিক এই সমস্যার সমাধান হিসেবেই **Stripe**-এর মতো পেমেন্ট গেটওয়ে তৈরি হয়েছে — তারা কার্ডের সংবেদনশীল তথ্য নিজেদের অতি-সুরক্ষিত সিস্টেমে সামলায়, তোমার সার্ভার শুধু "কত টাকা চার্জ করতে হবে, কার জন্য" — এই মেটাডেটাটুকু নিয়ে কাজ করে। এটা অনেকটা ব্যাংক লকারের মতো — তুমি নিজের বাসায় সোনাদানা রাখার ঝুঁকি না নিয়ে ব্যাংকের ভল্টে রাখো, শুধু চাবিটা (একটা রেফারেন্স/টোকেন) নিজের কাছে রাখো।

```mermaid
flowchart LR
    A[ইউজারের ব্রাউজার] -->|কার্ড তথ্য সরাসরি| B[Stripe.js / Stripe Elements]
    B -->|নিরাপদে টোকেনাইজ করে| C[Stripe সার্ভার]
    C -->|শুধু টোকেন/রেজাল্ট পাঠায়| D[তোমার Express Backend]
    D -->|চার্জ কনফার্ম করার নির্দেশ| C
```

এই ডায়াগ্রামটাই Stripe ইন্টিগ্রেশনের কেন্দ্রীয় ধারণা — কার্ডের কাঁচা তথ্য কখনোই তোমার ব্যাকএন্ডে আসে না, শুধু ফ্রন্টএন্ড থেকে সরাসরি Stripe-এ যায়, আর তোমার ব্যাকএন্ড শুধু একটা নিরাপদ রেফারেন্স (token/PaymentMethod ID) নিয়ে কাজ করে।

```bash
npm install stripe
```

```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```

```js
// services/paymentService.js
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(amountInCents, currency = 'usd') {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency,
    automatic_payment_methods: { enabled: true },
  });
  return paymentIntent;
}

module.exports = { createPaymentIntent };
```

এখানে **PaymentIntent** একটা গুরুত্বপূর্ণ ধারণা যা প্রথমে একটু অস্বাভাবিক লাগতে পারে — আমরা সরাসরি "চার্জ করো" বলছি না, বরং "একটা পেমেন্টের অভিপ্রায় (intent) তৈরি করো" বলছি। কেন এই বাড়তি ধাপ? কারণ বাস্তব পেমেন্টে অনেক কিছু ঘটতে পারে মাঝপথে — ব্যাংক অতিরিক্ত ভেরিফিকেশন (3D Secure) চাইতে পারে, কার্ড প্রত্যাখ্যান হতে পারে, ইউজার পেজ বন্ধ করে দিতে পারে। PaymentIntent এই পুরো প্রক্রিয়াটাকে একটা "স্টেট মেশিন" হিসেবে ট্র্যাক করে — `requires_payment_method` → `requires_confirmation` → `processing` → `succeeded`। এটা অনেকটা আমাদের নিজের অর্ডার সিস্টেমে "pending → confirmed → shipped" স্ট্যাটাসের ধারণার মতোই, শুধু এখানে Stripe নিজেই এই স্টেট মেশিনটা ম্যানেজ করছে।

Express রাউট বানাই:

```js
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount } = req.body; // amount ডলারে, যেমন 25.00

  try {
    const paymentIntent = await createPaymentIntent(Math.round(amount * 100));
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(502).json({ error: 'পেমেন্ট প্রসেস শুরু করা যায়নি' });
  }
});
```

লক্ষ্য করো `Math.round(amount * 100)` — Stripe সবসময় সবচেয়ে ছোট মুদ্রা এককে (সেন্ট, পয়সা) কাজ করে, ডলার/টাকায় না। এটা একটা সাধারণ কিন্তু গুরুত্বপূর্ণ ভুল-এড়ানোর বিষয় — ফ্লোটিং পয়েন্ট সংখ্যা (যেমন ২৫.০০ ডলার) নিয়ে সরাসরি হিসাব করলে রাউন্ডিং এরর হতে পারে, তাই ইন্টিজার (সেন্ট) নিয়ে কাজ করাই নিরাপদ।

ফ্রন্টএন্ডে (React বা প্লেইন JS) Stripe.js ব্যবহার করে এই `clientSecret` দিয়ে কার্ড ফর্ম দেখানো হয় — সেই কোড এই ব্যাকএন্ড-কেন্দ্রিক কোর্সের সীমার বাইরে, কিন্তু ধারণাটা মনে রাখা জরুরি: ব্যাকএন্ড শুধু "অনুমতি" তৈরি করে, আসল কার্ড-হ্যান্ডলিং ফ্রন্টএন্ড আর Stripe-এর মধ্যে সরাসরি ঘটে।

এখন প্রশ্ন হলো — পেমেন্ট সফল হলো কিনা, সেটা আমাদের ব্যাকএন্ড কীভাবে জানবে? এখানেই আসে আগের WhatsApp লেসনে শেখা **webhook** ধারণাটা আবার — Stripe পেমেন্ট সফল/ব্যর্থ হলে আমাদের সার্ভারকে জানিয়ে দেয়:

```js
const bodyParser = require('body-parser');

app.post(
  '/webhook/stripe',
  bodyParser.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      // এখানে অর্ডার স্ট্যাটাস আপডেট করো, ইনভয়েস ইমেইল পাঠাও ইত্যাদি
    }

    res.json({ received: true });
  }
);
```

এখানে `stripe.webhooks.constructEvent(...)` দিয়ে সিগনেচার যাচাই করা হচ্ছে — ঠিক সেই একই নিরাপত্তা-নীতি যা আমরা Twilio webhook-এও দেখেছিলাম। এটা অত্যন্ত গুরুত্বপূর্ণ, কারণ এই URL টা পাবলিক, আর যদি কেউ ভুয়া "payment succeeded" ইভেন্ট পাঠিয়ে দেয় সিগনেচার-যাচাই ছাড়া, তাহলে সে বিনামূল্যে পণ্য পেয়ে যেতে পারবে।

```mermaid
sequenceDiagram
    participant Browser
    participant Backend
    participant Stripe

    Browser->>Backend: POST /create-payment-intent
    Backend->>Stripe: PaymentIntent তৈরি করো
    Stripe-->>Backend: clientSecret
    Backend-->>Browser: clientSecret ফরওয়ার্ড
    Browser->>Stripe: কার্ড তথ্য সরাসরি Stripe-কে
    Stripe->>Backend: webhook: payment_intent.succeeded
    Backend->>Backend: অর্ডার কনফার্ম করো
```

খেয়াল করো, এখানে ব্রাউজার আর Stripe-এর মধ্যে সরাসরি একটা যোগাযোগ হচ্ছে যেখানে আমাদের ব্যাকএন্ড অংশগ্রহণ করছে না — এটাই কার্ড ডেটা সুরক্ষিত রাখার মূল কৌশল। আমাদের ব্যাকএন্ড শুধু শুরুতে অনুমতি দেয়, আর শেষে webhook দিয়ে ফলাফল জানে।

Stripe বিশ্বব্যাপী জনপ্রিয়, কিন্তু কিছু অঞ্চলে এবং কিছু ধরনের ব্যবসায় **PayPal**-এর নিজস্ব একটা বড় ব্যবহারকারী-ভিত্তি আছে, বিশেষ করে যেখানে ইউজাররা কার্ড না দিয়ে সরাসরি PayPal ব্যালেন্স ব্যবহার করতে চায়। পরের লেসনে আমরা দেখবো PayPal ইন্টিগ্রেশন কীভাবে কাজ করে, আর Stripe-এর সাথে এর কাঠামোগত মিল-অমিল কী।
