# Module 41 — Third Party Integrations

এতদিন আমরা যা কিছু বানিয়েছি সেটা মূলত আমাদের নিজের সিস্টেমের ভেতরেই সীমাবদ্ধ ছিলো — নিজের ডেটাবেজ, নিজের অথেনটিকেশন, নিজের API। কিন্তু বাস্তব একটা প্রোডাক্টের ইমেইল পাঠাতে হয়, SMS পাঠাতে হয়, পেমেন্ট নিতে হয়, কাস্টমারের তথ্য CRM-এ রাখতে হয়, ক্র্যাশ ট্র্যাক করতে হয় — এই কাজগুলোর প্রতিটার জন্য বিশেষায়িত থার্ড-পার্টি সার্ভিস আছে, আর একজন ব্যাকএন্ড ডেভেলপারের দক্ষতার একটা বড় অংশ হলো এই সার্ভিসগুলোকে নিরাপদে, নির্ভরযোগ্যভাবে নিজের সিস্টেমের সাথে জোড়া লাগানো। এই মডিউলে আমরা দশটা বাস্তব-জীবনের ইন্টিগ্রেশন হাতে-কলমে শিখবো, আর প্রতিটাতে দেখবো একই মৌলিক প্যাটার্ন কীভাবে বারবার ফিরে আসে — API Key নিরাপদে রাখা, async/await দিয়ে কল করা, এরর হ্যান্ডল করা, আর webhook দিয়ে উল্টো দিক থেকে তথ্য নেওয়া।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-email-integration-with-sendgrid.md](01-email-integration-with-sendgrid.md) | SendGrid দিয়ে ট্রানজ্যাকশনাল ইমেইল পাঠানো |
| 2 | [02-sms-integration-with-twilio.md](02-sms-integration-with-twilio.md) | Twilio দিয়ে SMS ও OTP ভেরিফিকেশন |
| 3 | [03-whatsapp-business-api-integration.md](03-whatsapp-business-api-integration.md) | WhatsApp Business API ও ইনকামিং মেসেজ webhook |
| 4 | [04-crm-integration-with-salesforce-api.md](04-crm-integration-with-salesforce-api.md) | Salesforce API দিয়ে Lead তৈরি ও CRM সিঙ্ক |
| 5 | [05-payment-processing-with-stripe.md](05-payment-processing-with-stripe.md) | Stripe PaymentIntent ও পেমেন্ট webhook |
| 6 | [06-payment-processing-with-paypal.md](06-payment-processing-with-paypal.md) | PayPal Order/Capture ফ্লো ও Strategy Pattern |
| 7 | [07-mailchimp-email-marketing-integration.md](07-mailchimp-email-marketing-integration.md) | Mailchimp দিয়ে বাল্ক ইমেইল মার্কেটিং |
| 8 | [08-hubspot-crm-integration.md](08-hubspot-crm-integration.md) | HubSpot CRM ও একাধিক ইন্টিগ্রেশনের সমন্বয় |
| 9 | [09-error-tracking-with-sentry.md](09-error-tracking-with-sentry.md) | Sentry দিয়ে প্রোডাকশন এরর ট্র্যাকিং |
| 10 | [10-analytics-integration-with-google-analytics.md](10-analytics-integration-with-google-analytics.md) | Google Analytics সার্ভার-সাইড ও ক্লায়েন্ট-সাইড ট্র্যাকিং |

## এই মডিউল শেষে তুমি যা পারবে

- SendGrid, Twilio, WhatsApp Business API ব্যবহার করে ইউজারের সাথে ইমেইল, SMS, WhatsApp-এর মাধ্যমে যোগাযোগ করা
- Salesforce ও HubSpot-এর মতো CRM প্ল্যাটফর্মের সাথে নিজের সিস্টেমের ডেটা সিঙ্ক্রোনাইজড রাখা
- Stripe ও PayPal দিয়ে নিরাপদে পেমেন্ট প্রসেস করা, কার্ডের সংবেদনশীল তথ্য নিজের সার্ভারে না রেখে
- Mailchimp দিয়ে বাল্ক ইমেইল মার্কেটিং ও সাবস্ক্রাইবার লিস্ট ম্যানেজমেন্ট করা
- webhook ব্যবহার করে বাইরের সার্ভিস থেকে আসা ইভেন্ট (পেমেন্ট সফল, আনসাবস্ক্রাইব, ইনকামিং মেসেজ) সামলানো
- API Key/সিক্রেট নিরাপদে `.env`-এ রাখা এবং কখনো কোডে হার্ডকোড না করা
- Sentry দিয়ে প্রোডাকশন এরর ট্র্যাক করা এবং Google Analytics দিয়ে ইউজার আচরণ বিশ্লেষণ করা
- একাধিক থার্ড-পার্টি সার্ভিসকে `Promise.allSettled()` ও try/catch দিয়ে নিরাপদে একসাথে সমন্বয় করা, যাতে একটার ব্যর্থতা পুরো সিস্টেম না ভাঙে

পরবর্তী মডিউল: **[Module 42 — Building AI Agents](../module-42-building-ai-agents/README.md)**
