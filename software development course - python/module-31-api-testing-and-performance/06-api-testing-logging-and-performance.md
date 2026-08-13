# ৩১.০৬. API Testing, Logging and Performance

এই মডিউলে আমরা তিনটা জিনিস আলাদা আলাদাভাবে শিখেছি — Postman/JMeter দিয়ে টেস্টিং, response time আর percentile মাপা, আর caching দিয়ে অপটিমাইজেশন। এই শেষ লেসনে আমরা এই সবগুলোকে একসাথে জোড়া দেবো, আর দেখবো কেন **logging** এই পুরো চক্রের একটা অপরিহার্য অংশ — যা পরের মডিউল (Logging & Observability)-এর ভিত্তি তৈরি করবে।

## কেন টেস্টিং, লগিং আর পারফরম্যান্স আলাদা করা যায় না

চিন্তা করো তুমি JMeter দিয়ে লোড টেস্ট চালালে, আর দেখলে p95 response time হঠাৎ ২ সেকেন্ডে চলে গেছে। এখন প্রশ্ন হলো — *কেন*? কোন নির্দিষ্ট endpoint স্লো? কোন নির্দিষ্ট সময়ে সমস্যা হচ্ছে? ডেটাবেজ কোয়েরি স্লো, নাকি cache miss বেশি হচ্ছে? এই প্রশ্নগুলোর উত্তর শুধু একটা সংখ্যা (p95 = 2000ms) দিয়ে পাওয়া যাবে না — দরকার একটা **লগ**, যেটা প্রতিটা রিকোয়েস্টের বিস্তারিত বিবরণ রেখে দেয়।

```mermaid
flowchart LR
    A[JMeter Load Test চালানো] --> B[সমস্যা ধরা পড়লো: p95 বেশি]
    B --> C{কেন স্লো?}
    C --> D[Log ফাইল খুলে দেখা]
    D --> E[কোন Endpoint, কোন সময়, কত সময় নিলো]
    E --> F[Root Cause খুঁজে পাওয়া]
    F --> G[Fix করে আবার Load Test চালানো]
```

## একটা সাধারণ Logging Middleware দিয়ে শুরু

Module 7-এ আমরা middleware-এর ধারণা শিখেছিলাম। চলো একটা সহজ FastAPI middleware বানাই, যা প্রতিটা রিকোয়েস্টের সময় মাপে আর লগ করে — এটাই পরের মডিউলে আমরা প্রফেশনাল Python logging লাইব্রেরি দিয়ে আরও ভালোভাবে করবো, কিন্তু এখন মূল ধারণাটা দেখি:

```python
import json
import time
from datetime import datetime, timezone

from fastapi import FastAPI, Request

app = FastAPI()


@app.middleware("http")
async def performance_logger(request: Request, call_next):
    start = time.perf_counter()

    response = await call_next(request)

    duration_ms = (time.perf_counter() - start) * 1000
    log_entry = {
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "duration_ms": round(duration_ms, 2),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    # এখন শুধু print করছি, পরের মডিউলে এটা ফাইলে/সিস্টেমে যাবে
    print(json.dumps(log_entry))

    # একটা সহজ threshold চেক — স্লো রিকোয়েস্ট আলাদা করে চিহ্নিত করা
    if duration_ms > 500:
        print(f"⚠️  SLOW REQUEST: {request.method} {request.url.path} নিলো {duration_ms:.2f}ms")

    return response
```

এখানে `await call_next(request)`-এর *পরে* সময় মাপা হচ্ছে — তাহলেই প্রকৃত duration পাওয়া যাবে, শুধু route handler-এর ভেতরের কোড না, পুরো middleware chain সহ পুরো সময়টা। **একটা কমন ভুল** এখানে হলো — যদি middleware-এর ভেতরে কোনো ব্লকিং (synchronous, non-async) কাজ করা হয়, যেমন ভারী CPU হিসাব বা সিনক্রোনাস ফাইল I/O, তাহলে সেটা পুরো event loop-কে ব্লক করে দেয়, আর তোমার measured duration-এ শুধু এই একটা রিকোয়েস্টের সময় বাড়বে না, বরং একই সময়ে চলতে থাকা বাকি সব রিকোয়েস্টও ধীর হয়ে যাবে — কারণ FastAPI-এর async model-এ একটা সিঙ্গেল ইভেন্ট লুপ সব রিকোয়েস্ট শেয়ার করে। তাই middleware-এর ভেতরের কোড সবসময় `async`-বান্ধব রাখা জরুরি।

এই টেস্টও এখন pytest দিয়ে যাচাই করা সম্ভব — `httpx.AsyncClient` দিয়ে একটা রিকোয়েস্ট পাঠিয়ে দেখা যায় response header বা log output-এ `duration_ms` ঠিকমতো বসছে কিনা, যা প্রতিবার ম্যানুয়ালি Postman-এ চেক করার চেয়ে দ্রুত আর CI-friendly।

## টেস্ট → লগ → অপটিমাইজ — একটা চক্র (cycle)

বাস্তব প্রজেক্টে performance improvement কোনো একবারের কাজ না, এটা একটা চলমান চক্র। প্রথমে load test চালিয়ে সমস্যা খুঁজে বের করা হয়, লগ দেখে root cause বের করা হয়, caching বা কোড অপটিমাইজেশন দিয়ে সমাধান করা হয়, এরপর আবার load test চালিয়ে যাচাই করা হয় সমাধানটা কাজ করলো কিনা। এই চক্রটা এমনভাবে চলতে থাকে যতক্ষণ না তোমার API business requirement অনুযায়ী যথেষ্ট দ্রুত হয়।

| ধাপ | টুল/কৌশল | এই মডিউলের কোন লেসন |
|---|---|---|
| ফাংশনাল/রিগ্রেশন টেস্ট | Postman, pytest + httpx | Lesson 2 |
| লোড পরিমাপ | Apache JMeter, Locust | Lesson 3 |
| বিশ্লেষণ | Percentile, Throughput | Lesson 4 |
| সমাধান | Caching (in-memory, Redis) | Lesson 5 |
| পর্যবেক্ষণ | Logging middleware | এই লেসন |

আমরা এখন জানি কীভাবে performance সমস্যা খুঁজে বের করতে হয়, মাপতে হয়, আর সমাধান করতে হয় — আর তার মধ্যে logging যে কতটা গুরুত্বপূর্ণ, তারও একটা আভাস পেলাম। পরের মডিউলে আমরা এই logging-কেই একটা পূর্ণাঙ্গ, প্রফেশনাল সিস্টেমে রূপান্তরিত করবো — Winston আর Pino-এর মতো লাইব্রেরি দিয়ে, যা আসল প্রোডাকশন অ্যাপ্লিকেশনে ব্যবহার হয়।
