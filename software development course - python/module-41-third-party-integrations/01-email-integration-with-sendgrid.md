# ০১. Email Integration with SendGrid

এতদিন আমরা যা কিছু বানিয়েছি — Module 4-এ FastAPI দিয়ে API, Module 12-তে JWT দিয়ে অথেনটিকেশন, Module 15-16-এ ডেটাবেজ — সবকিছুই ছিলো আমাদের নিজের সিস্টেমের ভেতরে বন্দি। ইউজার সাইনআপ করলো, ডেটাবেজে সেভ হলো, JWT টোকেন ফেরত গেলো — সব কিছু আমাদের কন্ট্রোলে। কিন্তু বাস্তব একটা প্রোডাক্টে ইউজার সাইনআপ করার পর তুমি কি তাকে "ওয়েলকাম ইমেইল" পাঠাবে না? পাসওয়ার্ড ভুলে গেলে "রিসেট লিংক" পাঠাবে না? অর্ডার কনফার্ম হলে "রিসিট" পাঠাবে না? এই কাজগুলো আমাদের নিজের সার্ভার একা করতে পারে না — কারণ ইমেইল পাঠানো আসলে একটা সম্পূর্ণ আলাদা অবকাঠামো (ইমেইল সার্ভার, স্প্যাম ফিল্টার এড়ানো, ডেলিভারি নিশ্চিত করা) দাবি করে, যেটা নিজে বানানো একটা প্রায়-অসম্ভব কাজ। এখান থেকেই শুরু হয় আমাদের এই নতুন মডিউলের গল্প — **থার্ড পার্টি ইন্টিগ্রেশন**, মানে অন্য কোম্পানির বানানো বিশেষায়িত সার্ভিসকে নিজের ব্যাকএন্ডের ভেতর থেকে ব্যবহার করা।

ধরো তুমি একটা রেস্টুরেন্ট খুলেছো। রান্নাঘর, বসার জায়গা — সব তুমি নিজে বানাচ্ছো। কিন্তু খাবার ডেলিভারি করার জন্য তুমি কি নিজের ডেলিভারি ফ্লিট বানাবে, নাকি Pathao/Foodpanda-র মতো এক্সপার্ট সার্ভিস ব্যবহার করবে? বেশিরভাগ ক্ষেত্রে দ্বিতীয়টাই বুদ্ধিমানের কাজ — কারণ ডেলিভারি তাদের মূল বিশেষত্ব, তোমার না। ঠিক একইভাবে, ইমেইল ডেলিভারি করাটাও একটা বিশাল বিশেষায়িত সমস্যা — Gmail, Yahoo, Outlook প্রতিটা স্প্যাম চেনার জন্য জটিল অ্যালগরিদম চালায়, আর কোনো নতুন সার্ভার থেকে ইমেইল পাঠালে সেটা সহজেই স্প্যাম ফোল্ডারে চলে যায়। **SendGrid** নামের কোম্পানিটা ঠিক এই সমস্যার সমাধান — তারা বছরের পর বছর ধরে "ভালো রেপুটেশন" তৈরি করেছে মেইল সার্ভারগুলোর কাছে, আর সেই রেপুটেশনটা তারা তোমাকে ভাড়া দেয় একটা API-এর মাধ্যমে।

```mermaid
flowchart LR
    A[তোমার FastAPI Backend] -->|API Call + API Key| B[SendGrid API]
    B -->|Reputation + Infra ব্যবহার করে| C[Gmail/Yahoo/Outlook Server]
    C --> D[ইউজারের ইনবক্স]
```

এই ছবিটা লক্ষ্য করো — তোমার সার্ভার সরাসরি ইউজারের ইনবক্সে কিছু পাঠাচ্ছে না, বরং SendGrid-কে একটা "রিকোয়েস্ট" পাঠাচ্ছে, আর SendGrid নিজের ইনফ্রাস্ট্রাকচার দিয়ে সেটা পৌঁছে দিচ্ছে। এই প্যাটার্নটাই আমরা এই পুরো মডিউল জুড়ে বারবার দেখবো — নিজের ব্যাকএন্ড একটা "অর্কেস্ট্রেটর" হয়ে যায়, যে বিভিন্ন এক্সপার্ট সার্ভিসকে নির্দেশ দেয়।

শুরু করা যাক হাতে-কলমে। প্রথমে SendGrid-এ একটা অ্যাকাউন্ট খুলতে হবে (ফ্রি টায়ার আছে), এরপর তাদের ড্যাশবোর্ড থেকে একটা **API Key** জেনারেট করতে হবে। এই API Key আসলে একটা গোপন পাসওয়ার্ডের মতো — এটা দিয়ে SendGrid বুঝবে "এই রিকোয়েস্টটা কার পক্ষ থেকে আসছে, আর এই অ্যাকাউন্টের বিলে চার্জ করবে।" এখানেই প্রথম গুরুত্বপূর্ণ নিয়ম — **এই API Key কখনো তোমার কোডের ভেতরে সরাসরি লিখবে না**। কেন? কারণ কোড যদি GitHub-এ পাবলিক হয়ে যায় (ভুলে বা ইচ্ছাকৃতভাবে), তাহলে যে কেউ তোমার API Key ব্যবহার করে তোমার নামে ইমেইল পাঠাতে পারবে, তোমার বিল বাড়িয়ে দিতে পারবে। এই সমস্যা এড়ানোর জন্য আমরা ব্যবহার করবো **environment variables** — `.env` নামের একটা ফাইলে গোপন তথ্য রাখা, যেটা `.gitignore`-এ যোগ করা থাকে, ফলে সেটা কখনো GitHub-এ যায় না।

```bash
pip install sendgrid python-dotenv fastapi uvicorn
```

এখানে `sendgrid` হলো SendGrid-এর অফিসিয়াল Python ক্লায়েন্ট লাইব্রেরি, `python-dotenv` দিয়ে আমরা `.env` ফাইল থেকে গোপন তথ্য লোড করবো, আর `fastapi`/`uvicorn` তো আমাদের পরিচিত ব্যাকএন্ড ফ্রেমওয়ার্ক আর সার্ভার। `pip install` কমান্ডটা মূলত Node.js-এর `npm install`-এর মতোই কাজ করে — শুধু এটা প্যাকেজগুলো Python-এর নিজস্ব প্যাকেজ ইনডেক্স (PyPI) থেকে নামায়, আর প্রজেক্টের ভার্চুয়াল এনভায়রনমেন্টে ইনস্টল করে।

`.env` ফাইলে লেখো:

```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourapp.com
```

এবার আমাদের FastAPI অ্যাপে একটা ইমেইল সার্ভিস ফাইল বানাই, `services/email_service.py`:

```python
import os
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

load_dotenv()

sg_client = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
FROM_EMAIL = os.getenv("FROM_EMAIL")


async def send_welcome_email(to_email: str, user_name: str):
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject="স্বাগতম আমাদের প্ল্যাটফর্মে!",
        plain_text_content=f"হ্যালো {user_name}, তোমার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।",
        html_content=f"<strong>হ্যালো {user_name}</strong>, তোমার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।",
    )

    try:
        response = sg_client.send(message)
        print(f"Welcome email sent to {to_email}, status: {response.status_code}")
    except Exception as error:
        print(f"SendGrid error: {error}")
        raise
```

এই কোডটা লাইন ধরে দেখি। `SendGridAPIClient(...)` — এটা লাইব্রেরিকে বলে দিচ্ছে কোন অ্যাকাউন্ট দিয়ে কাজ করতে হবে, ঠিক Node.js-এর `sgMail.setApiKey(...)`-এর মতোই। `send_welcome_email`-কে আমরা `async def` দিয়ে লিখেছি — মনে আছে Module 5-এ আমরা শিখেছিলাম async/await কেন দরকার? কারণ ইমেইল পাঠানো একটা নেটওয়ার্ক কল, যেটা সম্পূর্ণ হতে কিছুটা সময় লাগে, আর সেই সময়টায় আমাদের সার্ভার অন্য কোনো ইউজারের রিকোয়েস্ট আটকে রাখবে না চাই।

কিন্তু এখানে একটা গুরুত্বপূর্ণ **প্রোডাকশন নুয়ান্স** আছে, যা Node.js থেকে Python-এ আসার সময় খেয়াল রাখা জরুরি — Node.js-এর `@sendgrid/mail` লাইব্রেরিটা ভেতরে ভেতরে সত্যিকারের non-blocking নেটওয়ার্ক কল করে, তাই `await sgMail.send(...)` লিখলে সার্ভার অন্য কাজ করতে পারে। কিন্তু Python-এর অফিসিয়াল `sendgrid` লাইব্রেরিটা ভেতরে `urllib`-ভিত্তিক একটা **সিঙ্ক্রোনাস (blocking)** HTTP কল করে — অর্থাৎ `sg_client.send(message)` লাইনটা `async def` ফাংশনের ভেতরে থাকলেও, এটা চলার সময় পুরো ইভেন্ট লুপ ব্লক হয়ে যায়, অন্য কোনো ইউজারের রিকোয়েস্ট সেই সময় প্রসেস হয় না। এটা আসলে "fake async" — ফাংশনটা `async` দেখতে হলেও ভেতরে সত্যিকারের await করার মতো কিছু নেই। প্রোডাকশনে এই সমস্যা এড়ানোর জন্য সাধারণত এই ব্লকিং কলটাকে একটা থ্রেডপুল এক্সিকিউটরে চালানো হয়, যেমন:

```python
import asyncio

async def send_welcome_email(to_email: str, user_name: str):
    message = Mail(...)
    loop = asyncio.get_running_loop()
    response = await loop.run_in_executor(None, sg_client.send, message)
```

এভাবে `sg_client.send(...)`-এর ব্লকিং কলটা একটা আলাদা থ্রেডে চলে, আর মূল ইভেন্ট লুপ মুক্ত থাকে অন্য রিকোয়েস্ট হ্যান্ডেল করার জন্য। এই তফাতটা মনে রাখা জরুরি — Node.js-এর SDK "স্বভাবতই async", কিন্তু Python-এর অফিসিয়াল SDK না, তাই ব্লকিং কোড থ্রেডপুলে সরিয়ে নেওয়াটা তোমার নিজের দায়িত্ব।

`try/except` ব্লকটা এখানে অপরিহার্য, কারণ SendGrid-এর সার্ভার ডাউন থাকতে পারে, অথবা API Key ভুল হতে পারে, অথবা রিসিভারের ইমেইল ঠিকানা অবৈধ হতে পারে — এই সব পরিস্থিতিতে আমাদের সার্ভার যেন ক্র্যাশ না করে, বরং সুন্দরভাবে এরর হ্যান্ডল করে, সেই নিশ্চয়তা `try/except` দেয়।

এবার এটাকে আমাদের সাইনআপ রাউটে ব্যবহার করি:

```python
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel, EmailStr

from services.email_service import send_welcome_email

app = FastAPI()


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


@app.post("/api/signup", status_code=201)
async def signup(payload: SignupRequest, background_tasks: BackgroundTasks):
    # ধরে নিচ্ছি ইউজার ডেটাবেজে সেভ হয়ে গেছে (Module 15-16 থেকে যা শিখেছি)
    new_user = await save_user_to_database(payload.name, payload.email, payload.password)

    # ইমেইল পাঠানো — কিন্তু এটা ব্যর্থ হলেও যেন সাইনআপ ব্যর্থ না হয়
    background_tasks.add_task(send_welcome_email, payload.email, payload.name)

    return {"message": "Signup successful", "user": new_user}
```

এখানে একটা গুরুত্বপূর্ণ ডিজাইন সিদ্ধান্ত লক্ষ্য করো — আমরা `await send_welcome_email(...)` সরাসরি না লিখে `background_tasks.add_task(...)` ব্যবহার করেছি। কেন? কারণ ইমেইল পাঠানো ব্যর্থ হলেও ইউজারের সাইনআপ ব্যর্থ হওয়া উচিত না — ইউজার তো ঠিকভাবে অ্যাকাউন্ট বানিয়েছে, শুধু ওয়েলকাম মেইলটা হয়তো একটু দেরিতে যাবে বা যাবে না। FastAPI-তে `BackgroundTasks`-ই হলো এই "fire and forget" প্যাটার্নের ইডিওম্যাটিক উপায় — response client-কে ফেরত পাঠানোর পরে FastAPI নিজেই ব্যাকগ্রাউন্ডে টাস্কটা চালায়, আর কোনো এরর হলে সেটা রিকোয়েস্ট-রেসপন্স সাইকেলকে প্রভাবিত করে না। এখানে সরাসরি `asyncio.create_task(...)` দিয়ে একটা "স্ট্রে" (stray) টাস্ক বানানো এড়িয়ে চলাই ভালো, কারণ সেভাবে বানানো টাস্কের লাইফসাইকেল ফ্রেমওয়ার্কের কন্ট্রোলের বাইরে চলে যায়, আর এরর হলে সেটা কোথাও ধরা পড়ে না, চুপচাপ হারিয়ে যায়। `BackgroundTasks` ব্যবহার করলে FastAPI নিজেই এই টাস্কের এক্সিকিউশন ম্যানেজ করে। এই ধরনের সিদ্ধান্তকে বলে "graceful degradation" — মূল কাজ (সাইনআপ) সবসময় প্রাধান্য পাবে, পার্শ্ব-কাজ (ইমেইল পাঠানো) ব্যর্থ হলেও যেন পুরো সিস্টেম না ভাঙে।

```mermaid
sequenceDiagram
    participant Client
    participant FastAPI as FastAPI Backend
    participant DB as Database
    participant SG as SendGrid

    Client->>FastAPI: POST /api/signup
    FastAPI->>DB: ইউজার সেভ করো
    DB-->>FastAPI: সফল
    FastAPI-->>Client: 201 Signup Successful (সাথে সাথেই)
    FastAPI->>SG: send_welcome_email (ব্যাকগ্রাউন্ডে)
    SG-->>FastAPI: Delivered / Failed (Client অপেক্ষা করে না)
```

আরেকটা বাস্তব বিষয় — ট্রানজ্যাকশনাল ইমেইল (যেমন পাসওয়ার্ড রিসেট) পাঠানোর সময় HTML টেমপ্লেট হার্ডকোড না করে SendGrid-এর **Dynamic Templates** ফিচার ব্যবহার করলে ভালো, যেখানে ডিজাইন তাদের ড্যাশবোর্ডে বানানো থাকে আর কোড শুধু ডেটা পাঠায়:

```python
async def send_password_reset_email(to_email: str, reset_link: str):
    message = Mail(from_email=FROM_EMAIL, to_emails=to_email)
    message.template_id = "d-xxxxxxxxxxxxxxxxxxxx"
    message.dynamic_template_data = {"resetLink": reset_link}

    sg_client.send(message)
```

এভাবে ডিজাইনার/মার্কেটিং টিম ইমেইলের চেহারা বদলাতে পারে কোড না ছুঁয়েই — এটা বড় টিমে কাজ ভাগাভাগির একটা সুন্দর উদাহরণ।

সবশেষে, প্রোডাকশন সিস্টেমে একটা লগ রাখা জরুরি যে কোন ইমেইল পাঠানো হয়েছে, কখন, সফল হয়েছে কিনা — এটা Module 32 (Logging and Observability)-এ যা শিখেছি তারই বাস্তব প্রয়োগ। আপাতত আমরা সহজ `print(...)` দিয়ে দেখালাম, কিন্তু বাস্তব প্রোডাকশনে Python-এর `logging` মডিউল (বা structlog-এর মতো লাইব্রেরি) দিয়ে এটা যুক্ত করবে।

ইমেইল তো গেলো টেক্সট আর HTML-এর মাধ্যমে। কিন্তু কিছু বার্তা এমন জরুরি যে ইমেইলও যথেষ্ট না — যেমন OTP কোড, যেটা ইউজার সাথে সাথে দেখা দরকার। সেজন্য পরের লেসনে আমরা দেখবো কীভাবে **Twilio** ব্যবহার করে সরাসরি মোবাইলে SMS পাঠানো যায়।
