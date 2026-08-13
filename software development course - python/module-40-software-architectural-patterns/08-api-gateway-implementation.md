# ৪০.৮ API Gateway Implementation

আগের লেসনে আমরা দেখলাম MVC-তে একটা সার্ভিসের ভেতরে কীভাবে Model, View, Controller সংগঠিত হয়। কিন্তু Module ৪০.২-এ আমরা যে microservices দেখেছিলাম, সেখানে একটা সমস্যা তৈরি হয় — ক্লায়েন্ট (মোবাইল অ্যাপ, ওয়েব ফ্রন্টএন্ড) যদি সরাসরি প্রতিটা সার্ভিসের সাথে আলাদা আলাদা যোগাযোগ করে, তাহলে ক্লায়েন্টকে জানতে হয় প্রতিটা সার্ভিসের ঠিকানা, প্রতিটার নিজস্ব auth লজিক, আর নেটওয়ার্কে অনেকগুলো আলাদা রাউন্ড-ট্রিপ লাগে। এই সমস্যার সমাধান হলো **API Gateway**।

একটা অফিস ভবনের রিসেপশনিস্টের কথা ভাবা যাক। ভবনে দশটা আলাদা ডিপার্টমেন্ট আছে (accounting, HR, IT, legal), কিন্তু ভিজিটর সরাসরি কোনো ডিপার্টমেন্টে ঢুকতে পারে না — সবাইকে প্রথমে রিসেপশনে আসতে হয়। রিসেপশনিস্ট ভিজিটরের পরিচয় যাচাই করে (auth), তারপর সঠিক ডিপার্টমেন্টে পাঠিয়ে দেয় (routing)। API Gateway ঠিক এই রিসেপশনিস্টের ভূমিকা পালন করে — সব ক্লায়েন্ট রিকোয়েস্ট একটা মাত্র প্রবেশদ্বার দিয়ে ঢোকে, আর Gateway সেটাকে সঠিক microservice-এ পাঠিয়ে দেয়।

```mermaid
flowchart TD
    Client[Client - Web/Mobile] --> GW["API Gateway<br/>Auth + Routing + Rate Limiting"]
    GW --> Auth[Auth Service]
    GW --> Task[Task Service]
    GW --> Notif[Notification Service]
    GW --> Report[Reporting Service]
```

একটা Gateway সাধারণত একইসাথে কয়েকটা দায়িত্ব পালন করে — **routing** (কোন পাথ কোন সার্ভিসে যাবে), **authentication** (Module ১২-এর JWT যাচাই একবার Gateway-তে করলে প্রতিটা সার্ভিসে আলাদা করে করতে হয় না), **rate limiting** (Module ৭.৬-এর মতো, কিন্তু এখন কেন্দ্রীভূতভাবে পুরো সিস্টেমের জন্য), আর **request aggregation** (একাধিক সার্ভিসের ডেটা মিলিয়ে একটা রেসপন্স বানানো)।

FastAPI দিয়ে একটা সরল Gateway-এর কাঠামো দেখা যাক, যেখানে `httpx` (Module ৪-এ পরিচিত) ব্যবহার করে রিকোয়েস্ট ফরওয়ার্ড করা হচ্ছে:

```python
from fastapi import FastAPI, Request, HTTPException, Depends
import httpx
import jwt
import os

app = FastAPI()
client = httpx.AsyncClient()

SERVICE_MAP = {
    "tasks": "http://task-service:4001",
    "notifications": "http://notification-service:4002",
}

# কেন্দ্রীভূত auth dependency — একবার এখানে যাচাই হলে সব সার্ভিস নিশ্চিন্ত
async def verify_token(request: Request):
    token = request.headers.get("authorization", "").split(" ")[-1]
    try:
        return jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# রাউটিং রুল — কোন পাথ কোন সার্ভিসে যাবে
@app.api_route("/api/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy(service: str, path: str, request: Request, user: dict = Depends(verify_token)):
    if service == "auth":
        # auth সার্ভিসে টোকেন যাচাই লাগে না, লগইন করার জন্যই তো টোকেন চাওয়া হচ্ছে
        pass
    target = SERVICE_MAP.get(service)
    if not target:
        raise HTTPException(status_code=404, detail="Unknown service")
    upstream_response = await client.request(
        request.method, f"{target}/{path}",
        headers={"X-User-Id": user.get("sub", "")},
        content=await request.body(),
    )
    return upstream_response.json()

# uvicorn gateway:app --host 0.0.0.0 --port 8080
```

লক্ষ্য করো — `task-service` বা `notification-service`-এর কোডে আর আলাদা করে JWT verify করার প্রয়োজন নেই, কারণ Gateway সেটা আগেই করে ফেলেছে এবং `X-User-Id` হেডারের মাধ্যমে পাস করে দিতে পারে। এটা Module ৩৮.২-এর Single Responsibility নীতিরই একটা স্থাপত্য-স্তরের প্রয়োগ — প্রতিটা সার্ভিস শুধু তার নিজের ব্যবসায়িক লজিক নিয়ে চিন্তা করে, ক্রস-কাটিং কনসার্ন (auth, logging, rate limiting) Gateway-এর দায়িত্ব।

তবে সাবধান থাকা দরকার — Gateway যদি ভেঙে পড়ে, পুরো সিস্টেম অনুপলব্ধ হয়ে যায়, কারণ এটা এখন একটা **single point of failure**। তাই বাস্তব প্রোডাকশনে Gateway-কে সবসময় একাধিক ইনস্ট্যান্স হিসেবে চালানো হয়, লোড ব্যালান্সারের পেছনে (Module ৪০.১২-তে আমরা এই লোড ব্যালান্সিং নিয়ে বিস্তারিত আলোচনা করবো)।

এই লেসনে আমরা Gateway কীভাবে কাজ করে সেটার মূল ধারণা আর নিজে-লেখা বাস্তবায়ন দেখলাম। পরের লেসনে আমরা দেখবো Gateway-এর পেছনে থাকা সার্ভিসগুলো নিজেদের মধ্যে কীভাবে কথা বলে — সেটাই Inter-Service Communication।
