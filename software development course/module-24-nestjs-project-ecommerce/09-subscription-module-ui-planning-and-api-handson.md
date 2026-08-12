# ২৪.০৯. Subscription Module UI Planning And API Hands-On

গত লেসনে আমরা `SubscriptionPlan` আর `StoreSubscription` এন্টিটি ডিজাইন করেছি। কোড আরও গভীরে যাওয়ার আগে, একটা গুরুত্বপূর্ণ অভ্যাস চর্চা করা দরকার — **API contract planning**। ব্যাকএন্ড ডেভেলপার হলেও, ফ্রন্টএন্ড দলের সাথে কাজ করার সময় তোমাকেই ঠিক করে দিতে হয় কোন এন্ডপয়েন্টে কী ডেটা যাবে, কী ফিরে আসবে। এটা না করলে ফ্রন্টএন্ড আর ব্যাকএন্ড আলাদা আলাদা কল্পনায় কাজ করে, আর ইন্টিগ্রেশনের সময় বিশৃঙ্খলা তৈরি হয়।

চলো কল্পনা করি ফ্রন্টএন্ডে দুইটা মূল স্ক্রিন লাগবে সাবস্ক্রিপশনের জন্য — একটা "Pricing Page" (সব প্ল্যান দেখানোর জন্য, পাবলিক), আর একটা "Subscribe" ফ্লো (স্টোর ওউনার লগইন করে একটা প্ল্যান বেছে নেবে)। এই দুইটা UI চিন্তা থেকেই আমরা এন্ডপয়েন্ট তালিকা বের করতে পারি:

| মেথড | এন্ডপয়েন্ট | কে অ্যাক্সেস করবে | কাজ |
|---|---|---|---|
| POST | `/subscription-plans` | SUPER_ADMIN | নতুন প্ল্যান তৈরি |
| GET | `/subscription-plans` | Public | সব প্ল্যানের তালিকা |
| GET | `/subscription-plans/:id` | Public | একটা নির্দিষ্ট প্ল্যানের বিস্তারিত |
| PATCH | `/subscription-plans/:id` | SUPER_ADMIN | প্ল্যান আপডেট |
| POST | `/subscriptions/subscribe` | STORE_OWNER | একটা প্ল্যানে সাবস্ক্রাইব করা |
| GET | `/subscriptions/my-subscription` | STORE_OWNER | নিজের বর্তমান সাবস্ক্রিপশন দেখা |

প্রতিটা এন্ডপয়েন্টের জন্য আমরা এখন রিকোয়েস্ট/রেসপন্স শেপ চূড়ান্ত করবো — এটাই পরের লেসনে DTO লেখার ভিত্তি হবে। যেমন `POST /subscriptions/subscribe`:

**Request body:**
```json
{
  "planId": "a3f1c2e0-1234-4a5b-9c8d-abc123456789"
}
```

**Success response (201):**
```json
{
  "id": "f9e8d7c6-...",
  "userId": "u1u1u1u1-...",
  "planId": "a3f1c2e0-...",
  "startDate": "2026-08-08",
  "expiryDate": "2026-09-07",
  "status": "ACTIVE"
}
```

**Error response — যদি আগে থেকে একটা ACTIVE সাবস্ক্রিপশন থাকে (409 Conflict):**
```json
{
  "statusCode": 409,
  "message": "তোমার ইতিমধ্যে একটা সক্রিয় সাবস্ক্রিপশন আছে।"
}
```

এই এরর কেসটা গুরুত্বপূর্ণ — গত লেসনের বিজনেস রুল #৩ ("সর্বোচ্চ একটা ACTIVE সাবস্ক্রিপশন") এখানে একটা কংক্রিট এরর রেসপন্সে রূপান্তরিত হলো। এই ধরনের এজ কেস আগে থেকে লিখে রাখলে সার্ভিস লজিক লেখার সময় ভুলে যাওয়ার সম্ভাবনা কমে যায়।

পুরো ফ্লোটা একটা সিকোয়েন্স ডায়াগ্রামে দেখা যাক — একজন স্টোর ওউনার কীভাবে সাবস্ক্রাইব করে, ধাপে ধাপে সিস্টেমের ভেতরে কী ঘটে:

```mermaid
sequenceDiagram
    participant Client as Store Owner (Frontend)
    participant Controller as SubscriptionController
    participant Service as SubscriptionService
    participant Repo as StoreSubscriptionRepository
    participant DB as PostgreSQL

    Client->>Controller: POST /subscriptions/subscribe { planId }
    Controller->>Service: subscribe(userId, planId)
    Service->>Repo: findActiveByUser(userId)
    Repo->>DB: SELECT ... WHERE status='ACTIVE'
    DB-->>Repo: কোনো একটিভ সাবস্ক্রিপশন নেই
    Service->>Service: startDate = আজ, expiryDate = plan.durationInDays পরে
    Service->>Repo: save(newSubscription)
    Repo->>DB: INSERT INTO store_subscriptions
    DB-->>Repo: সেভ সফল
    Repo-->>Service: StoreSubscription entity
    Service-->>Controller: subscription object
    Controller-->>Client: 201 Created
```

এই ডায়াগ্রামটা লক্ষ করলে দেখবে, Controller কখনো সরাসরি Repository বা ডেটাবেজ স্পর্শ করছে না — সবকিছু Service-এর মধ্য দিয়ে যাচ্ছে। এটা NestJS-এর **layered architecture**-এর মূল নিয়ম, যা Module 22-তে শেখা Separation of Concerns-এরই একটা প্রয়োগ: Controller শুধু HTTP-সংক্রান্ত জিনিস (রুট, স্ট্যাটাস কোড) নিয়ে ভাবে, Service বিজনেস লজিক নিয়ে ভাবে, আর Repository শুধু ডেটাবেজ কোয়েরি নিয়ে ভাবে। প্রতিটা স্তর শুধু তার ঠিক নিচের স্তরকে চেনে, উপরেরটাকে না — এতে করে যেকোনো একটা স্তর বদলালে (যেমন REST থেকে GraphQL-এ যাওয়া) বাকি স্তরগুলো অক্ষত থাকে।

এই এন্ডপয়েন্ট তালিকা আর সিকোয়েন্স ডায়াগ্রামই এখন আমাদের ইমপ্লিমেন্টেশনের রোডম্যাপ। পরের লেসনে আমরা প্রথমবারের মতো এই মডিউলের ভেতরের বাস্তব NestJS কোড লিখতে বসবো — module registration আর প্রাথমিক wiring দিয়ে শুরু করে।
