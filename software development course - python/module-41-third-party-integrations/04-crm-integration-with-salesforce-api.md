# ০৪. CRM Integration with Salesforce API

আগের তিনটা লেসনে আমরা দেখলাম কীভাবে ইউজারের সাথে যোগাযোগ করা যায় — ইমেইল, SMS, WhatsApp। কিন্তু একটা প্রশ্ন থেকেই যাচ্ছে — এই ইউজারদের তথ্য, তাদের সাথে কথোপকথনের ইতিহাস, তারা কোন পর্যায়ে আছে (নতুন লিড? পেইড কাস্টমার? চলে যাচ্ছে?) — এসব কে ট্র্যাক করবে? তোমার নিজের ডেটাবেজে ইউজার টেবিল আছে ঠিকই (Module 15-16), কিন্তু সেলস টিম, সাপোর্ট টিম চায় আরও রিচ একটা ভিউ — কে কবে কল করেছিলো, কোন ডিল কত টাকার, পরবর্তী ফলো-আপ কবে। এই সবকিছু ম্যানেজ করার জন্য বিশেষায়িত সফটওয়্যার লাগে, যাকে বলে **CRM (Customer Relationship Management)**, আর এই জগতের সবচেয়ে বড় নাম **Salesforce**।

এখানে একটা গুরুত্বপূর্ণ ধারণাগত পার্থক্য বুঝে নেওয়া দরকার। SendGrid বা Twilio ছিলো "অ্যাকশন সার্ভিস" — তুমি একটা কমান্ড দিলে, তারা কিছু একটা করে দেয় (মেইল পাঠায়, SMS পাঠায়)। Salesforce অনেকটা ভিন্ন — এটা একটা **সিস্টেম অফ রেকর্ড**, মানে এটা নিজেই একটা ডেটাবেজের মতো, যেখানে কাস্টমার/লিড/ডিলের তথ্য জমা থাকে, আর তোমার ব্যাকএন্ডের কাজ হলো নিজের সিস্টেমের ডেটার সাথে Salesforce-এর ডেটা সিঙ্ক্রোনাইজড রাখা। এটাকে এভাবে ভাবতে পারো — তোমার নিজের ডেটাবেজ হলো "প্রোডাক্টের সত্য" (কে লগইন করতে পারবে, কার কী পারমিশন), আর Salesforce হলো "ব্যবসার সত্য" (কে গুরুত্বপূর্ণ কাস্টমার, কার সাথে কবে দেখা করতে হবে) — দুটো আলাদা উদ্দেশ্যে দুটো আলাদা ডেটাবেজ, কিন্তু তাদের মধ্যে তথ্য প্রবাহিত হতে হয়।

```mermaid
flowchart LR
    A[তোমার Database\nUser, Order টেবিল] -->|নতুন সাইনআপ/অর্ডার হলে| B[Sync Logic]
    B -->|Salesforce API Call| C[Salesforce CRM]
    C -->|সেলস/সাপোর্ট টিম দেখে| D[Sales Rep Dashboard]
```

Salesforce-এর সাথে কানেক্ট হওয়া SendGrid বা Twilio-র চেয়ে একটু জটিল, কারণ এখানে সাধারণ API Key যথেষ্ট না — এখানে ব্যবহার হয় **OAuth 2.0**-এর মতো একটা অথেনটিকেশন মডেল, যেটা নিয়ে আমরা Module 29-এ টোকেন-ভিত্তিক অথেনটিকেশনের প্রসঙ্গে আলোচনা করেছিলাম। ধারণাটা একই — ইউজারনেম, পাসওয়ার্ড আর একটা সিক্রেট টোকেন ব্যবহার করে একটা সেশন/এক্সেস টোকেন সংগ্রহ করতে হয়, যেটা দিয়ে পরবর্তী সব রিকোয়েস্ট অথরাইজড হয়।

```bash
pip install simple-salesforce python-dotenv fastapi uvicorn
```

`simple-salesforce` হলো Python-এর জন্য জনপ্রিয় একটা Salesforce লাইব্রেরি, যেটা অথেনটিকেশন আর ডেটা অপারেশন — দুটোই সহজ করে দেয়।

```
SALESFORCE_USERNAME=you@yourcompany.com
SALESFORCE_PASSWORD=yourpassword
SALESFORCE_SECURITY_TOKEN=xxxxxxxxxxxxxxxxx
```

```python
# services/crm_service.py
import os
from dotenv import load_dotenv
from simple_salesforce import Salesforce

load_dotenv()

def get_salesforce_connection() -> Salesforce:
    # jsforce-এ লগইন একটা আলাদা async স্টেপ ছিলো (conn.login(...))।
    # simple-salesforce আরও সহজ — কনস্ট্রাক্টরেই ইউজারনেম/পাসওয়ার্ড/টোকেন দিলে
    # লাইব্রেরি নিজেই অথেনটিকেট করে সেশন তৈরি করে ফেলে, আলাদা করে login() কল করতে হয় না।
    return Salesforce(
        username=os.environ["SALESFORCE_USERNAME"],
        password=os.environ["SALESFORCE_PASSWORD"],
        security_token=os.environ["SALESFORCE_SECURITY_TOKEN"],
    )

def create_lead(name: str, email: str, company: str) -> str:
    sf = get_salesforce_connection()

    result = sf.Lead.create({
        "LastName": name,
        "Email": email,
        "Company": company,
        "LeadSource": "Website Signup",
    })

    if not result["success"]:
        raise Exception("Salesforce lead তৈরি ব্যর্থ হয়েছে")
    return result["id"]
```

এখানে `sf.Lead.create({...})` লাইনটা লক্ষ্য করার মতো। `simple_salesforce.Salesforce` ইনস্ট্যান্সের উপর সরাসরি `.Lead`, `.Contact`, `.Opportunity` — এই রকম অ্যাট্রিবিউট অ্যাক্সেস করলে সেটা সংশ্লিষ্ট Salesforce অবজেক্টের সাথে ডাইনামিকভাবে কানেক্ট হয়ে যায় (একে বলে "sObject")। প্রতিটা sObject-এর নিজস্ব ফিল্ড সেট আছে। এটা অনেকটা আমাদের নিজের ডেটাবেজের টেবিলের মতোই ভাবতে পারো — শুধু পার্থক্য হলো এই "টেবিল"গুলো Salesforce নিজেই ডিফাইন করে রেখেছে, তুমি সরাসরি স্কিমা বদলাতে পারো না (কাস্টম ফিল্ড অবশ্য যোগ করা যায়)।

এবার এটাকে আমাদের সাইনআপ ফ্লোতে যুক্ত করি, ঠিক যেভাবে আগে ইমেইল যুক্ত করেছিলাম:

```python
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel

app = FastAPI()

class SignupRequest(BaseModel):
    name: str
    email: str
    company: str | None = None

def sync_lead_to_crm(name: str, email: str, company: str) -> None:
    # simple-salesforce সিঙ্ক্রোনাস (blocking) — এটা async রুটের ভেতরে
    # সরাসরি await করলে পুরো ইভেন্ট লুপ ব্লক হয়ে যাবে। তাই এটাকে
    # FastAPI-র BackgroundTasks দিয়ে রেসপন্সের পরে আলাদা থ্রেডে চালানো হচ্ছে।
    try:
        lead_id = create_lead(name, email, company or "Individual")
        print("Salesforce lead created:", lead_id)
    except Exception as err:
        print("CRM sync failed:", err)

@app.post("/api/signup", status_code=201)
async def signup(payload: SignupRequest, background_tasks: BackgroundTasks):
    new_user = await save_user_to_database(payload.name, payload.email)

    background_tasks.add_task(
        sync_lead_to_crm, payload.name, payload.email, payload.company
    )

    return {"user": new_user}
```

এখানেও আমরা আগের লেসনের মতোই fire-and-forget প্যাটার্ন ব্যবহার করেছি — CRM সিঙ্ক ব্যর্থ হলেও সাইনআপ যেন ব্যর্থ না হয়, আর `try/except` দিয়ে ব্যর্থতা লগ করা হচ্ছে কিন্তু ইউজারকে এরর দেখানো হচ্ছে না। বাস্তব প্রোডাকশন সিস্টেমে অবশ্য এই ধরনের সিঙ্ক সাধারণত সরাসরি রিকোয়েস্টের ভেতরে (এমনকি ব্যাকগ্রাউন্ড টাস্কেও) না করে একটা আলাদা **queue** (যেমন Python-এ Celery বা RQ) ব্যবহার করা হয়, যাতে Salesforce ধীরগতির হলেও আমাদের মূল API দ্রুত সাড়া দিতে পারে, আর ব্যর্থ হলে পরে আবার চেষ্টা (retry) করা যায়।

```mermaid
sequenceDiagram
    participant Client
    participant Backend as FastAPI Backend
    participant Queue as Job Queue
    participant SF as Salesforce

    Client->>Backend: POST /signup
    Backend->>Backend: ডেটাবেজে সেভ
    Backend-->>Client: 201 Created (তাৎক্ষণিক)
    Backend->>Queue: "createLead" জব যোগ করো
    Queue->>SF: Lead তৈরি করো (ব্যাকগ্রাউন্ডে, retry সহ)
```

এই queue-ভিত্তিক প্যাটার্নটা মনে রাখা ভালো, কারণ এই মডিউলের পরের বেশ কয়েকটা লেসনেও (Mailchimp, HubSpot) আমরা একই ধরনের "বাইরের সিস্টেমের সাথে সিঙ্ক" সমস্যার মুখোমুখি হবো, আর প্রতিবারই মূল নীতি একই থাকবে — বাইরের সার্ভিসের ধীরগতি বা ব্যর্থতা যেন আমাদের মূল প্রোডাক্টের গতি বা নির্ভরযোগ্যতা নষ্ট না করে। Python ইকোসিস্টেমে এই ধরনের ব্যাকগ্রাউন্ড জব প্রসেসিংয়ের জন্য সবচেয়ে পরিচিত টুল হলো **Celery** (RabbitMQ বা Redis-কে ব্রোকার হিসেবে ব্যবহার করে) আর হালকা বিকল্প হিসেবে **RQ (Redis Queue)** — এগুলো অনেকটা Node.js-এর BullMQ-র মতোই কাজ করে।

কাস্টমারের তথ্য তো CRM-এ গেলো, কিন্তু এখনো আমরা টাকার লেনদেন নিয়ে কিছু বলিনি। একটা রিয়েল প্রোডাক্টে সবচেয়ে গুরুত্বপূর্ণ ইন্টিগ্রেশনগুলোর একটা হলো পেমেন্ট প্রসেসিং। পরের লেসনে আমরা ঢুকবো সেই জগতে — **Stripe** দিয়ে পেমেন্ট নেওয়া শিখবো।
