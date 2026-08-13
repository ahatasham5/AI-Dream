# ২৪.১৪. Testing End Points

গত লেসনে সাবস্ক্রিপশন মডিউলের Service আর Router লেখা শেষ হয়েছে, আর সার্ভার এরর ছাড়াই উঠছে। কিন্তু কোড চলা মানে এই না যে এটা সঠিকভাবে কাজ করছে — বিজনেস লজিকের প্রতিটা শাখা বাস্তবে চালিয়ে দেখা দরকার। এই লেসনে আমরা ম্যানুয়াল API টেস্টিং করবো, যেন সাবস্ক্রিপশন ফ্লো লঞ্চ করার আগে নিশ্চিত হওয়া যায় সব ঠিকঠাক কাজ করছে।

ম্যানুয়াল টেস্টিংয়ের জন্য আমরা `curl` অথবা Postman/Thunder Client ব্যবহার করতে পারি — এই লেসনে `curl` দিয়ে দেখাচ্ছি, যাতে কমান্ড লাইনেই পুরো ফ্লো দেখা যায় এবং সহজে রিপ্রোডিউস করা যায়। একটা সুবিধা এখানে বিশেষভাবে উল্লেখযোগ্য — FastAPI স্বয়ংক্রিয়ভাবে `/docs`-এ একটা ইন্টারেক্টিভ Swagger UI দেয়, যেখানে ব্রাউজার থেকেই সরাসরি এন্ডপয়েন্ট টেস্ট করা যায়, `curl` কমান্ড না লিখেও — তবে টিমমেটদের সাথে reproducible স্টেপ শেয়ার করার জন্য `curl` স্ক্রিপ্ট বেশি সুবিধাজনক।

**ধাপ ১: সুপার অ্যাডমিন হিসেবে লগইন করে টোকেন নেয়া** (ধরে নিচ্ছি পরের মডিউলের মতো একটা বেসিক `/auth/login` এন্ডপয়েন্ট আছে যা Module 24.07-এর seed করা অ্যাডমিন দিয়ে কাজ করে):

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@shopkori.com&password=ChangeMe123!"
```

FastAPI-এর `OAuth2PasswordBearer`/`OAuth2PasswordRequestForm`-ভিত্তিক স্ট্যান্ডার্ড লগইন এন্ডপয়েন্ট JSON বডি না, বরং `application/x-www-form-urlencoded` ফর্ম ডেটা আশা করে (OAuth2 স্পেকের অংশ) — এটা একটা কমন কনফিউশনের জায়গা, যারা NestJS-এর মতো সবসময় JSON বডি আশা করে অভ্যস্ত। রেসপন্স থেকে `access_token` কপি করে রাখি, বাকি রিকোয়েস্টে ব্যবহার করবো।

**ধাপ ২: একটা সাবস্ক্রিপশন প্ল্যান তৈরি করা:**

```bash
curl -X POST http://localhost:8000/subscription-plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"name":"Basic","price":499,"duration_in_days":30,"max_store_limit":1}'
```

প্রত্যাশিত রেসপন্স ২০১ স্ট্যাটাসসহ নতুন প্ল্যান অবজেক্ট। এখানে একটা গুরুত্বপূর্ণ negative test — যদি আমরা এই একই রিকোয়েস্ট টোকেন ছাড়া পাঠাই, বা একজন সাধারণ `CUSTOMER` রোলের টোকেন দিয়ে পাঠাই, তাহলে `require_roles()` (Module 24.07) কাজ করে ৪০৩ Forbidden ফেরত দেয়া উচিত। এই negative test-টা চালিয়ে দেখাই আসল যাচাই — শুধু "সফল কেস" টেস্ট করলে dependency আসলে কাজ করছে কিনা সেটা প্রমাণ হয় না।

```bash
curl -X POST http://localhost:8000/subscription-plans \
  -H "Content-Type: application/json" \
  -d '{"name":"Hacked","price":0,"duration_in_days":30,"max_store_limit":100}'
# প্রত্যাশিত: 401 Unauthorized (কোনো টোকেন নেই)
```

খেয়াল করো, এই রিকোয়েস্টে `price: 0` পাঠানো হয়েছে — যা Module 24.12-এর `Field(gt=0)` ভ্যালিডেশন অনুযায়ী আসলে বাতিল হওয়া উচিত। কিন্তু বাস্তবে যা হবে তা হলো, dependency chain অথেন্টিকেশন **আগে** চেক করে (কারণ Pydantic body-parsing dependency-এর পরে ঘটে যদি auth dependency আগে ডিক্লেয়ার করা থাকে) — ফলে ৪০১ এররই আগে আসবে, ৪২২ আসার সুযোগ পাবে না। এই আচরণটা বোঝা জরুরি, কারণ এটা টেস্ট লেখার সময় "কোন এরর আগে আসবে" নিয়ে ভুল ধারণা তৈরি করতে পারে — একটা রিকোয়েস্টে একাধিক ভ্যালিডেশন ব্যর্থ হলে, dependency resolution-এর ক্রমই ঠিক করে কোন এররটা প্রথমে ক্লায়েন্ট দেখবে।

**ধাপ ৩: প্ল্যানের তালিকা দেখা (পাবলিক এন্ডপয়েন্ট, টোকেন লাগবে না):**

```bash
curl http://localhost:8000/subscription-plans
```

**ধাপ ৪: একজন স্টোর ওউনার সাবস্ক্রাইব করা:**

```bash
curl -X POST http://localhost:8000/subscriptions/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <store_owner_token>" \
  -d '{"plan_id":"<plan-id-from-step-2>"}'
```

প্রত্যাশিত রেসপন্স — একটা `StoreSubscription` অবজেক্ট, `status: "ACTIVE"`, আর `expiry_date` আজকের তারিখ থেকে ৩০ দিন পরে (কারণ প্ল্যানের `duration_in_days` ৩০)।

**ধাপ ৫: দ্বিতীয়বার সাবস্ক্রাইব করার চেষ্টা (এজ কেস, Module 24.08-এর বিজনেস রুল #৩ যাচাই):**

```bash
curl -X POST http://localhost:8000/subscriptions/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <store_owner_token>" \
  -d '{"plan_id":"<plan-id-from-step-2>"}'
# প্রত্যাশিত: 409 Conflict — "তোমার ইতিমধ্যে একটা সক্রিয় সাবস্ক্রিপশন আছে।"
```

যদি এই রেসপন্সটা ঠিক এভাবেই আসে, তাহলে বুঝবে `service.subscribe()`-এর `409` লজিক (Module 24.13) সঠিকভাবে কাজ করছে।

এই পুরো টেস্টিং প্রক্রিয়াটাকে আমরা একটা সিকোয়েন্স ডায়াগ্রামে সাজিয়ে দেখতে পারি, যাতে বোঝা যায় প্রতিটা রিকোয়েস্ট সিস্টেমের কোন কোন স্তর অতিক্রম করছে:

```mermaid
sequenceDiagram
    participant Tester as Manual Tester (curl)
    participant Dep as get_current_user dependency
    participant Router as subscription router
    participant Svc as SubscriptionService
    participant DB as PostgreSQL

    Tester->>Dep: POST /subscriptions/subscribe (২য়বার)
    Dep->>Router: টোকেন বৈধ
    Router->>Svc: subscribe(db, user_id, data)
    Svc->>DB: find_active_by_user(user_id)
    DB-->>Svc: একটা ACTIVE রেকর্ড পাওয়া গেলো
    Svc-->>Router: HTTPException(409) ছোঁড়া হলো
    Router-->>Tester: 409 Conflict
```

এই ধরনের ম্যানুয়াল, ধাপে-ধাপে টেস্টিং একটা গুরুত্বপূর্ণ অভ্যাস — প্রতিটা এন্ডপয়েন্ট শুধু "হ্যাপি পাথ" (সবকিছু ঠিক থাকলে কী হয়) না, বরং এর "স্যাড পাথ" বা এজ কেসগুলোও (ভুল ইনপুট, অননুমোদিত অ্যাক্সেস, ডুপ্লিকেট অপারেশন) যাচাই করা উচিত। বাস্তব প্রোডাকশন বাগগুলোর বড় একটা অংশই আসলে এই এজ কেস থেকেই আসে, হ্যাপি পাথ থেকে না।

ম্যানুয়াল টেস্টিং প্রতিবার করা ক্লান্তিকর আর ভুলপ্রবণ — একবার একটা বাগ ঠিক করার পর আগের সব টেস্ট আবার হাতে চালানো বাস্তবসম্মত না। পরের লেসনে আমরা দেখবো কীভাবে এই একই টেস্টগুলো **স্বয়ংক্রিয়** (automated) করা যায় `pytest` আর `httpx` দিয়ে, আর সেই সাথে একটা অ্যাসাইনমেন্ট থাকবে তোমার জন্য — যাতে তুমি নিজে হাতে সাবস্ক্রিপশন মডিউলের বাকি এজ কেসগুলো চিন্তা করে দেখতে পারো।
