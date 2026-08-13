# ৩০.০৫. CSRF Token Implementation

আগের লেসনের শেষে আমরা একটা ইঙ্গিত রেখে এসেছিলাম — এমন একটা আক্রমণ যেখানে আক্রমণকারী ইউজারের cookie চুরি করে না, বরং সেই cookie-কেই ইউজারের অজান্তে "ব্যবহার" করে ফেলে। এটাই Cross-Site Request Forgery, সংক্ষেপে CSRF (উচ্চারণ করা হয় "সি-সার্ফ")। এই আক্রমণ বোঝার জন্য প্রথমে মনে করিয়ে দেওয়া দরকার Module 11-এ শেখা cookie-র একটা মৌলিক বৈশিষ্ট্য — ব্রাউজার স্বয়ংক্রিয়ভাবে একটা ডোমেইনের cookie সেই ডোমেইনে পাঠানো প্রতিটা request-এর সাথে জুড়ে দেয়, সেই request কোথা থেকে এসেছে সেটা বিবেচনা না করেই।

এই স্বয়ংক্রিয়তাটাই CSRF আক্রমণের ভিত্তি। ধরো তুমি `bank.com`-এ লগইন করে আছো, আর তোমার ব্রাউজারে তার session cookie জমা আছে। এখন তুমি অজান্তে একটা দূষিত ওয়েবসাইট `evil.com`-এ যাও, যেখানে লুকানো একটা ফর্ম আছে যেটা পেজ লোড হওয়ার সাথে সাথেই `bank.com/transfer`-এ একটা POST request পাঠিয়ে দেয়, টাকা আক্রমণকারীর অ্যাকাউন্টে পাঠানোর অনুরোধ নিয়ে। যেহেতু এই request `bank.com`-এর উদ্দেশ্যেই যাচ্ছে, ব্রাউজার স্বয়ংক্রিয়ভাবে তোমার `bank.com` session cookie সেই request-এর সাথে জুড়ে দেয় — আর `bank.com`-এর সার্ভার দেখে একটা বৈধ, লগইন করা ইউজারের অনুরোধ, request-টা আসলে কোথা থেকে trigger হয়েছে তা বিবেচনা না করেই।

```mermaid
sequenceDiagram
    participant U as ইউজার ব্রাউজার
    participant E as evil.com
    participant B as bank.com

    Note over U,B: ইউজার আগে থেকেই bank.com-এ লগইন করা (cookie সেট আছে)
    U->>E: evil.com ভিজিট করে
    E-->>U: লুকানো ফর্ম, auto-submit
    U->>B: POST /transfer (ব্রাউজার স্বয়ংক্রিয়ভাবে bank.com cookie জুড়ে দেয়)
    Note over B: cookie বৈধ মনে হয়, কিন্তু request আসলে ইউজারের ইচ্ছায় হয়নি
    B-->>U: টাকা ট্রান্সফার সম্পন্ন (আক্রমণ সফল)
```

লক্ষ্য করার বিষয়, এবং এটা এই লেসনের সবচেয়ে গুরুত্বপূর্ণ কথা — CSRF কাজ করে শুধুমাত্র তখনই যখন authentication সম্পূর্ণভাবে cookie-নির্ভর হয়, কারণ cookie-ই একমাত্র credential যেটা ব্রাউজার নিজে থেকে জুড়ে দেয়, ইউজারের বা frontend কোডের সরাসরি অংশগ্রহণ ছাড়াই। Module 11-এ আমরা যে cookie-বনাম-token বিতর্কটা দেখেছিলাম, তার একটা বাস্তব ফলাফল এখানে দেখা যাচ্ছে। যদি authentication `Authorization: Bearer <token>` header দিয়ে হয় (Module 12, 29-এর JWT পদ্ধতি, যেখানে frontend প্রতিটা request-এ সচেতনভাবে token জুড়ে দেয়), তাহলে CSRF ব্যবহারিকভাবে অসম্ভব হয়ে যায় — কারণ `evil.com`-এর একটা লুকানো ফর্ম নিজে থেকে সেই `Authorization` header জুড়ে দিতে পারে না (ফর্ম সাবমিশন কাস্টম header পাঠাতে পারে না), আর JavaScript দিয়ে fetch করে header জুড়তে গেলে সেটা একটা cross-origin request হয়ে যায়, যা CORS (লেসন ২) আটকে দেয়, কারণ `evil.com` তোমার allowed origin-এর তালিকায় নেই। এটাই একটা বড় কারণ কেন আধুনিক SPA/mobile-app আর্কিটেকচারে JWT-header-ভিত্তিক auth এত জনপ্রিয় — CSRF-এর পুরো সমস্যাটাই এখানে অবান্তর হয়ে যায়, বাড়তি কোনো CSRF middleware ছাড়াই।

কিন্তু এই সুবিধাটা সবক্ষেত্রে পাওয়া যায় না। অনেক প্রজেক্টেই refresh token বা session httpOnly cookie-তে রাখা হয় (Module 29, লেসন ১-এ যেমন দেখেছি — access token ছোট মেয়াদের হলেও refresh token প্রায়ই httpOnly cookie-তে সংরক্ষিত থাকে, XSS থেকে রক্ষা পাওয়ার জন্যই), অথবা কিছু প্রজেক্ট সরাসরি cookie-ভিত্তিক session auth ব্যবহার করে server-rendered পেজের সাথে। যেই মুহূর্তে কোনো authentication-সংক্রান্ত তথ্য cookie-তে থাকছে আর ব্রাউজার সেটা স্বয়ংক্রিয়ভাবে জুড়ে দিচ্ছে, সেই মুহূর্তেই CSRF সুরক্ষা প্রাসঙ্গিক থেকে যায় — এমনকি যদি মূল access token header-ভিত্তিক হয়, refresh endpoint-টা (যেটা cookie পড়ে) নিজেই একটা CSRF-উন্মুক্ত টার্গেট হতে পারে।

প্রথম প্রতিরক্ষা স্তর, আগের লেসনেই উল্লেখ করা `samesite` cookie অ্যাট্রিবিউট:

```python
response.set_cookie(
    key="session",
    value=token,
    httponly=True,
    secure=True,
    samesite="strict",  # অথবা "lax"
)
```

`sameSite: "strict"` ব্রাউজারকে বলে দেয় "এই cookie শুধু তখনই পাঠাও যখন request একই সাইট থেকে শুরু হয়েছে" — মানে `evil.com`-এর ফর্ম থেকে `bank.com`-এ request গেলেও cookie জুড়বে না। এটা অনেক ক্ষেত্রেই যথেষ্ট, কিন্তু `lax` মোডে কিছু ব্যতিক্রম থাকে (যেমন লিংকে ক্লিক করে নেভিগেট করা), আর পুরনো ব্রাউজারে এই অ্যাট্রিবিউট সমর্থিত নাও হতে পারে। তাই defense-in-depth নীতি মেনে, একটা দ্বিতীয়, আরও সরাসরি প্রতিরক্ষা ব্যবহার করা হয় — **CSRF Token**।

CSRF Token-এর মূল ধারণা হলো: প্রতিটা state-পরিবর্তনকারী request-এর (POST/PUT/DELETE) সাথে একটা গোপন, অনুমান-অযোগ্য টোকেন জুড়ে পাঠাতে হবে, যেটা শুধুমাত্র সেই সাইটের নিজস্ব পেজ থেকেই পাওয়া সম্ভব — cookie-র মতো এটা স্বয়ংক্রিয়ভাবে জুড়ে যায় না, বরং JavaScript দিয়ে সচেতনভাবে বসাতে হয়, যেটা `evil.com` করতে পারবে না কারণ সে টোকেনের মানটাই জানে না।

একটা জনপ্রিয়, সহজ পদ্ধতি হলো **Double-Submit Cookie** প্যাটার্ন — সার্ভার একটা random টোকেন তৈরি করে দুই জায়গায় পাঠায়: একটা সাধারণ (non-httpOnly) cookie হিসেবে, আরেকটা response body-তে যাতে frontend সেটা পড়ে পরবর্তী request-এ header হিসেবে জুড়ে দিতে পারে। সার্ভার শুধু যাচাই করে দুটো মান মিলছে কিনা।

```python
# security/csrf.py
import secrets
from fastapi import Request, HTTPException, Depends

def issue_csrf_token(response):
    token = secrets.token_hex(32)
    response.set_cookie(
        key="csrf_token",
        value=token,
        httponly=False,  # frontend থেকে পড়তে হবে বলেই httponly না
        secure=True,
        samesite="strict",
    )
    return token

def verify_csrf_token(request: Request):
    cookie_token = request.cookies.get("csrf_token")
    header_token = request.headers.get("x-csrf-token")

    if not cookie_token or not header_token or cookie_token != header_token:
        raise HTTPException(status_code=403, detail="CSRF যাচাই ব্যর্থ")
```

```python
# রুট সেটআপ
from fastapi import APIRouter, Response, Depends

router = APIRouter()

@router.get("/api/csrf-token")
async def get_csrf_token(response: Response):
    token = issue_csrf_token(response)
    return {"csrfToken": token}

@router.post("/api/transfer", dependencies=[Depends(verify_csrf_token)])
async def transfer(payload: TransferInput, current_user=Depends(get_current_user)):
    return await transfer_handler(payload, current_user)
```

লক্ষ্য করো, `verify_csrf_token` এখানে একটা route-level dependency হিসেবে বসেছে, Express-এর middleware চেইনের ধারণাটাই — শুধু FastAPI-এ এই চেইনটা `Depends()` দিয়ে ঘোষণা করা হয়, `next()` কল করার বদলে ফাংশনটা normally return করলেই পরের স্তরে যাওয়ার অনুমতি হয়ে যায়, আর exception তুললে (এখানে `HTTPException`) চেইন থেমে যায়।

আর frontend-এ, প্রতিটা POST/PUT/DELETE request পাঠানোর আগে ওই টোকেনটা header হিসেবে জুড়ে দিতে হবে:

```ts
// frontend fetch উদাহরণ
const res = await fetch("/api/csrf-token");
const { csrfToken } = await res.json();

await fetch("/api/transfer", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CSRF-Token": csrfToken,
  },
  credentials: "include", // cookie পাঠানোর জন্য
  body: JSON.stringify({ amount: 100 }),
});
```

এই প্যাটার্নের নিরাপত্তা নির্ভর করে একটা সহজ যুক্তির উপর — `evil.com` কোনোভাবে `bank.com`-এর cookie পড়তে পারে না (Same-Origin Policy, লেসন ২), তাই সে সঠিক `X-CSRF-Token` header বসাতে পারবে না, যদিও cookie নিজে স্বয়ংক্রিয়ভাবে জুড়ে যাবে। এই একই double-submit প্যাটার্ন প্যাকেজ করা `fastapi-csrf-protect`-এর মতো তৃতীয়-পক্ষ লাইব্রেরিও পাওয়া যায়, কিন্তু প্যাটার্নটা নিজে এতটাই সহজ আর নির্ভরযোগ্য যে উপরের মতো একটা ছোট কাস্টম dependency লিখে নিজে বাস্তবায়ন করাও সমান বৈধ এবং কার্যকর একটা পথ — বাড়তি dependency কমানোরও একটা সুবিধা তাতে থাকে।

মনে রাখা দরকার, GET request-এ সাধারণত CSRF সুরক্ষা দরকার হয় না, কারণ GET-কে idempotent এবং side-effect-free হওয়ার কথা (Module 6-এ শেখা REST নীতি) — CSRF সুরক্ষা কেবল সেই সব request-এ বসানো উচিত যেগুলো ডেটা পরিবর্তন করে।

এখন পর্যন্ত আমরা তিনটা বড় আক্রমণ প্রতিরোধ করা শিখেছি — SQL Injection, XSS, আর CSRF, প্রতিটাই আলাদা আলাদা middleware বা কৌশল দিয়ে। কিন্তু এই সবগুলো header, cookie flag, আর নিরাপত্তা নিয়ম হাতে-কলমে বসানো ভুলপ্রবণ। পরের লেসনে আমরা দেখবো `secure` লাইব্রেরি কীভাবে এই কাজগুলোর অনেকটাই একসাথে, নির্ভরযোগ্যভাবে সামলে দেয়।
