# ০৮. HubSpot CRM Integration

আমরা আগে Salesforce (লেসন ৪) দেখেছি ভারী, এন্টারপ্রাইজ-গ্রেড CRM হিসেবে, আর Mailchimp (লেসন ৭) দেখেছি ইমেইল-মার্কেটিং-কেন্দ্রিক টুল হিসেবে। **HubSpot** এই দুইয়ের মাঝামাঝি একটা চমৎকার জায়গায় দাঁড়িয়ে আছে — এটা একইসাথে CRM, মার্কেটিং, আর সেলস প্ল্যাটফর্ম, আর ছোট-মাঝারি কোম্পানির কাছে এটা খুব জনপ্রিয় কারণ এর ফ্রি টায়ার আছে এবং API তুলনামূলক সহজবোধ্য। এই লেসনে আমরা HubSpot ইন্টিগ্রেট করবো, আর পাশাপাশি লক্ষ্য করবো Salesforce-এর সাথে এর ধারণাগত মিল — কারণ দুটোই মূলত "Contact/Lead/Deal" নামের অবজেক্ট নিয়ে কাজ করে, শুধু API-এর আকার-প্রকার আলাদা।

HubSpot-এর অথেনটিকেশন সিস্টেম Salesforce-এর জটিল OAuth ফ্লোর চেয়ে সহজ — একটা **Private App Token** তৈরি করলেই কাজ চলে (নিজের অ্যাকাউন্টের ভেতরের ব্যবহারের জন্য), যেটা অনেকটা আমরা SendGrid/Twilio-তে যে সাধারণ API Key দেখেছিলাম তার মতোই।

```bash
pip install hubspot-api-client python-dotenv fastapi uvicorn
```

```
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxxxxxxxxxxxxxxxxxx
```

```python
# services/hubspot_service.py
import os
from dotenv import load_dotenv
from hubspot import HubSpot
from hubspot.crm.contacts import SimplePublicObjectInput, ApiException

load_dotenv()

# নোট: hubspot-api-client প্যাকেজের ভার্সন ভেদে ক্লাসের নাম কিছুটা আলাদা হতে
# পারে (যেমন SimplePublicObjectInput বনাম SimplePublicObjectInputForCreate) —
# কোড লেখার আগে বর্তমান ভার্সনের ডকুমেন্টেশন একবার চেক করে নেওয়া ভালো।
hubspot_client = HubSpot(access_token=os.getenv("HUBSPOT_ACCESS_TOKEN"))


def create_contact(email: str, first_name: str, last_name: str):
    contact_obj = SimplePublicObjectInput(properties={
        "email": email,
        "firstname": first_name,
        "lastname": last_name,
        "lifecyclestage": "lead",
    })

    try:
        response = hubspot_client.crm.contacts.basic_api.create(
            simple_public_object_input_for_create=contact_obj
        )
        return response.id
    except ApiException as error:
        if error.status == 409:
            print("Contact আগে থেকেই HubSpot-এ আছে")
            return None
        raise error
```

এখানে `lifecyclestage: 'lead'` লক্ষ্য করো — HubSpot প্রতিটা কন্টাক্টকে একটা "জীবনচক্রের পর্যায়ে" রাখে (subscriber → lead → marketing qualified lead → customer)। এটা সেলস টিমকে বুঝতে সাহায্য করে কে এখনো শুধু আগ্রহী, আর কে টাকা দিয়েছে। আমাদের ব্যাকএন্ডের কাজ হলো, প্রোডাক্টে যখন এমন কিছু ঘটে যা এই পর্যায় বদলে দেয় (যেমন প্রথম পেমেন্ট), তখন HubSpot-কেও সেটা জানানো:

```python
def update_lifecycle_stage(contact_id: str, new_stage: str):
    hubspot_client.crm.contacts.basic_api.update(
        contact_id=contact_id,
        simple_public_object_input=SimplePublicObjectInput(
            properties={"lifecyclestage": new_stage}
        ),
    )


# পেমেন্ট সফল হলে (আগের Stripe লেসনের webhook থেকে কল করা যায়)
@app.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    event = ...  # ... signature verify করার পর
    if event["type"] == "payment_intent.succeeded":
        customer_email = event["data"]["object"]["receipt_email"]
        contact = await find_hubspot_contact_by_email(customer_email)
        if contact:
            await asyncio.to_thread(update_lifecycle_stage, contact["id"], "customer")
    return {"received": True}
```

এই কোডটা আসলে এই পুরো মডিউলের একটা গুরুত্বপূর্ণ শিক্ষা তুলে ধরে — **থার্ড-পার্টি ইন্টিগ্রেশনগুলো একে অপরের সাথে যুক্ত হয়**। Stripe-এর webhook থেকে পাওয়া তথ্য দিয়ে HubSpot আপডেট হচ্ছে। বাস্তব প্রোডাকশন সিস্টেমে এভাবেই দশ-বারোটা থার্ড-পার্টি সার্ভিস একে অপরের সাথে যুক্ত হয়ে একটা বড় "ইন্টিগ্রেশন নেটওয়ার্ক" তৈরি করে, আর তোমার ব্যাকএন্ড হয়ে ওঠে সেই নেটওয়ার্কের কেন্দ্রীয় সমন্বয়কারী।

```mermaid
flowchart TD
    A[Stripe Webhook: Payment Succeeded] --> B[FastAPI Backend]
    B --> C[নিজের DB-তে Order আপডেট]
    B --> D[HubSpot: lifecycle stage = customer]
    B --> E[SendGrid: Invoice ইমেইল পাঠাও]
    B --> F[Sentry: যদি কোনো ধাপ ব্যর্থ হয়, লগ করো]
```

এই ডায়াগ্রামটা একটা গুরুত্বপূর্ণ ডিজাইন প্রশ্ন তুলে ধরে — যদি এই চারটা কাজের মধ্যে একটা (ধরো HubSpot আপডেট) ব্যর্থ হয়, বাকিগুলো কি থেমে যাবে? উত্তর হওয়া উচিত না — প্রতিটা ইন্টিগ্রেশন কল আলাদাভাবে try/catch দিয়ে ঘেরা থাকা উচিত, যাতে একটার ব্যর্থতা অন্যগুলোকে প্রভাবিত না করে:

```python
async def handle_payment_succeeded(event):
    email = event["data"]["object"]["receipt_email"]

    # HubSpot, SendGrid, Mailchimp — এদের অফিসিয়াল Python SDK গুলো সাধারণত
    # সিঙ্ক্রোনাস (blocking)। FastAPI-এর async ইভেন্ট লুপ ব্লক না করার জন্য
    # প্রতিটাকে asyncio.to_thread() দিয়ে আলাদা থ্রেডে চালানো হয়েছে — এটা এই
    # মডিউলের একটা পুনরাবৃত্ত থিম: "async অ্যাপের ভেতরে সিঙ্ক SDK কীভাবে চালাতে হয়"।
    results = await asyncio.gather(
        asyncio.to_thread(update_crm_lifecycle, email),
        asyncio.to_thread(send_invoice_email, email),
        asyncio.to_thread(sync_to_mailchimp, email),
        return_exceptions=True,
    )

    for index, result in enumerate(results):
        if isinstance(result, Exception):
            print(f"Integration {index} failed: {result}")
```

এখানে `asyncio.gather(..., return_exceptions=True)` ব্যবহার করা হয়েছে — এটা ঠিক JavaScript-এর `Promise.allSettled()`-এর সমতুল্য, এবং এটাই এই প্যাটার্নের সরাসরি Python সংস্করণ। ডিফল্টভাবে `asyncio.gather()` (অর্থাৎ `return_exceptions=False`) হলো `Promise.all()`-এর মতো — একটা কোরুটিন ব্যর্থ হলেই পুরো `gather()` কল সেই এক্সেপশন তুলে ধরে ব্যর্থ হয়ে যায়, বাকিগুলো যদিও ব্যাকগ্রাউন্ডে চলতেই থাকে কিন্তু তাদের ফলাফল আর তোমার হাতে আসে না। কিন্তু `return_exceptions=True` দিলে প্রতিটা কোরুটিনকে স্বাধীনভাবে শেষ পর্যন্ত চলতে দেওয়া হয়, আর কোনোটা ব্যর্থ হলে সেই এক্সেপশনটাকে raise না করে ফলাফলের লিস্টে একটা সাধারণ মানের মতোই রেখে দেওয়া হয় — ফলে একাধিক স্বাধীন থার্ড-পার্টি ইন্টিগ্রেশন একসাথে চালানোর জন্য এটাই সঠিক পদ্ধতি।

এতক্ষণ আমরা দেখলাম কীভাবে বিভিন্ন সার্ভিস একে অপরের সাথে ডেটা শেয়ার করে, ফাংশনালিটি যোগ করে। কিন্তু এত জটিল ইন্টিগ্রেশনের নেটওয়ার্কে যখন কোনো একটা জায়গায় সত্যিকারের বাগ বা ক্র্যাশ হয়, সেটা কীভাবে দ্রুত ধরা যায়? পরের লেসনে আমরা দেখবো **Sentry** দিয়ে এরর ট্র্যাকিং — একটা সিস্টেম যা প্রোডাকশনে ঘটা প্রতিটা ক্র্যাশ, এক্সেপশন, আর তার সম্পূর্ণ প্রেক্ষাপট রেকর্ড করে রাখে।
