# ০২. SMS Integration with Twilio

আগের লেসনে আমরা SendGrid দিয়ে ইমেইল পাঠানো শিখেছি, আর দেখেছি কীভাবে একটা এক্সপার্ট থার্ড-পার্টি সার্ভিসকে "ভাড়া" করে নিজের ব্যাকএন্ডের কাজ সহজ করা যায়। কিন্তু ইমেইলের একটা সীমাবদ্ধতা আছে — মানুষ সবসময় ইমেইল চেক করে না। কেউ সাইনআপ করার পর ওটিপি (OTP) ভেরিফিকেশনের জন্য যদি তাকে ইমেইল চেক করতে বলো, সে হয়তো ৫ মিনিট পর দেখবে, বা স্প্যাম ফোল্ডারে চলে যাবে বলে দেখবেই না। কিন্তু মোবাইলে একটা SMS এলে সেটা মানুষ প্রায় সাথে সাথেই দেখে। এই তাৎক্ষণিকতার কারণেই OTP ভেরিফিকেশন, জরুরি এলার্ট, ডেলিভারি আপডেটের মতো কাজে SMS আজও সবচেয়ে নির্ভরযোগ্য মাধ্যম।

কিন্তু SMS পাঠানো ইমেইলের চেয়েও জটিল একটা সমস্যা, কারণ এখানে জড়িত আছে বিশ্বের শত শত মোবাইল অপারেটর (Grameenphone, Robi, AT&T, Vodafone...) — প্রত্যেকের নিজস্ব নেটওয়ার্ক, নিজস্ব প্রোটোকল। তোমার একার পক্ষে এতগুলো অপারেটরের সাথে সরাসরি চুক্তি করে SMS পাঠানোর ব্যবস্থা করা প্রায় অসম্ভব। **Twilio** ঠিক এই জটিলতাটা লুকিয়ে রাখে — তুমি শুধু তাদের API-কে "এই নম্বরে এই মেসেজ পাঠাও" বললেই তারা পেছনের সব অপারেটর-সংযোগ সামলে নেয়। এটা অনেকটা Module 3-এ আমরা যেভাবে দেখেছিলাম Node.js-এর `http` মডিউল নেটওয়ার্কের জটিলতা লুকিয়ে একটা সহজ ইন্টারফেস দেয় — Twilio ঠিক তেমনই টেলিকম জগতের জটিলতা লুকিয়ে একটা সহজ API দেয়।

```mermaid
flowchart LR
    A[FastAPI Backend] -->|Twilio SDK Call| B[Twilio API]
    B --> C1[Grameenphone]
    B --> C2[AT&T]
    B --> C3[Vodafone]
    C1 & C2 & C3 --> D[ইউজারের ফোন]
```

শুরু করার জন্য Twilio-তে অ্যাকাউন্ট খুলে তিনটা জিনিস সংগ্রহ করতে হবে — **Account SID**, **Auth Token**, আর একটা **Twilio Phone Number** (তাদের কাছ থেকে কেনা বা ট্রায়াল নম্বর)। এই তিনটাই সংবেদনশীল তথ্য, তাই আগের লেসনের মতোই `.env` ফাইলে রাখবো।

```bash
pip install twilio python-dotenv fastapi uvicorn
```

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15005550006
```

এবার `services/sms_service.py`:

```python
import os
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()

client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN"),
)


def send_otp(to_phone_number: str, otp_code: str) -> str:
    try:
        message = client.messages.create(
            body=f"তোমার ভেরিফিকেশন কোড: {otp_code}। এটা কারো সাথে শেয়ার করো না।",
            from_=os.getenv("TWILIO_PHONE_NUMBER"),
            to=to_phone_number,
        )
        print("SMS sent, SID:", message.sid)
        return message.sid
    except Exception as error:
        print("Twilio error:", str(error))
        raise error
```

লক্ষ্য করো, `send_otp` একটা সাধারণ (synchronous) ফাংশন — আগের SendGrid লেসনে যেমন দেখেছিলাম, Python-এর অফিসিয়াল `twilio` প্যাকেজও ভেতরে ব্লকিং HTTP কল করে, `async`/`await` সাপোর্ট করে না। তাই FastAPI-র `async def` রুটের ভেতর থেকে এটা সরাসরি কল করলে ইভেন্ট লুপ কিছুক্ষণ ব্লক হয়ে যায়; ভারী লোডে `run_in_threadpool` বা `httpx`-ভিত্তিক নিজস্ব কল দিয়ে সমাধান করা যায়, কিন্তু ছোট স্কেলে এটা সরাসরি কল করাই যথেষ্ট।

এবার OTP ভেরিফিকেশনের পুরো ফ্লোটা বানাই। এখানে একটা গুরুত্বপূর্ণ প্রশ্ন — OTP কোডটা কোথায় রাখবো? সাধারণত সাময়িক তথ্য মেমোরিতে বা Redis-এ রাখা হয়, ডেটাবেজে না, কারণ এটা কয়েক মিনিট পরই অপ্রয়োজনীয় হয়ে যায়:

```python
import random
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

otp_store: dict[str, dict] = {}  # বাস্তব প্রোডাকশনে Redis ব্যবহার করা উচিত


class SendOtpRequest(BaseModel):
    phone_number: str


class VerifyOtpRequest(BaseModel):
    phone_number: str
    otp_code: str


@app.post("/api/send-otp")
async def send_otp_route(payload: SendOtpRequest):
    otp_code = str(random.randint(100000, 999999))

    otp_store[payload.phone_number] = {
        "otp_code": otp_code,
        "expires_at": time.time() + 5 * 60,
    }

    try:
        send_otp(payload.phone_number, otp_code)
        return {"message": "OTP পাঠানো হয়েছে"}
    except Exception:
        raise HTTPException(status_code=502, detail="SMS পাঠাতে ব্যর্থ, একটু পর আবার চেষ্টা করো")


@app.post("/api/verify-otp")
async def verify_otp_route(payload: VerifyOtpRequest):
    record = otp_store.get(payload.phone_number)

    if not record or record["expires_at"] < time.time():
        raise HTTPException(status_code=400, detail="OTP মেয়াদোত্তীর্ণ, নতুন করে চেষ্টা করো")
    if record["otp_code"] != payload.otp_code:
        raise HTTPException(status_code=400, detail="ভুল OTP")

    del otp_store[payload.phone_number]
    return {"verified": True}
```

লক্ষ্য করো `HTTPException(status_code=502, ...)` ব্যবহার করেছি — Module 6 (Status Codes)-এ আমরা শিখেছিলাম প্রতিটা স্ট্যাটাস কোডের নির্দিষ্ট অর্থ আছে। ৫০২ মানে "Bad Gateway" — অর্থাৎ আমাদের সার্ভার ঠিক আছে, কিন্তু যে বাইরের সার্ভিসের (Twilio) উপর আমরা নির্ভর করছিলাম, সেটা সাড়া দেয়নি। এই সূক্ষ্ম পার্থক্যটা ফ্রন্টএন্ড ডেভেলপারকে বুঝতে সাহায্য করে সমস্যাটা কোথায় — আমাদের সার্ভার না, বাইরের সিস্টেম।

```mermaid
sequenceDiagram
    participant User
    participant Backend
    participant Twilio

    User->>Backend: POST /send-otp (ফোন নম্বর)
    Backend->>Backend: র‍্যান্ডম ৬-ডিজিট কোড জেনারেট
    Backend->>Twilio: SMS পাঠাও
    Twilio-->>User: SMS ডেলিভার
    User->>Backend: POST /verify-otp (কোড লিখে)
    Backend->>Backend: মিলিয়ে দেখো, ভেরিফাই করো
```

একটা বাস্তব সতর্কতা — Twilio-র মতো SMS সার্ভিস প্রতিটা মেসেজের জন্য চার্জ করে, তাই কেউ যদি একই নম্বরে বারবার OTP রিকোয়েস্ট পাঠাতে থাকে (rate limiting ছাড়া), তোমার বিল আকাশছোঁয়া হয়ে যেতে পারে। এখানেই Module 7-এ শেখা **rate limiting**-এর গুরুত্ব বোঝা যায় — FastAPI-তে এটা সাধারণত একটা dependency বা `slowapi`-র মতো মিডলওয়্যার দিয়ে করা হয়, যা একই নম্বরে মিনিটে একবারের বেশি OTP পাঠানো আটকে দেয়। আর Module 30-এ শেখা API সিকিউরিটির নীতিগুলো এখানে সরাসরি কাজে লাগে।

SMS দিয়ে টেক্সট মেসেজ তো পাঠানো গেলো, কিন্তু আজকাল ব্যবসাগুলো আরও সমৃদ্ধ যোগাযোগ চায় — ছবি, বাটন, টেমপ্লেট মেসেজ, রিড রিসিট। পরের লেসনে আমরা দেখবো কীভাবে **WhatsApp Business API** ব্যবহার করে এই ধরনের সমৃদ্ধ কথোপকথন তৈরি করা যায়।
