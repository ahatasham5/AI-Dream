# ০৬. Real Life E-commerce Product API Design and JSON Data Modeling

আগের লেসনে আমরা চারটা প্রশ্নের একটা কাঠামো তৈরি করেছিলাম — এন্টিটি, ফিল্ড, সম্পর্ক, আর অপারেশন। এখন সময় এসেছে সেই কাঠামোটা হাতে-কলমে প্রয়োগ করার। ধরে নাও তুমি একটা ছোট ই-কমার্স প্ল্যাটফর্মের ব্যাকএন্ড বানাচ্ছো, আর তোমার প্রথম কাজ হলো **Product** এন্টিটির জন্য একটা সম্পূর্ণ API ডিজাইন করা।

**ধাপ এক — এন্টিটি চিহ্নিত করা।** আমাদের এন্টিটি এখানে স্পষ্ট — `Product`। কিন্তু বাস্তব জীবনে একটা প্রোডাক্টের সাথে প্রায়ই আরও ছোট এন্টিটি জড়িত থাকে, যেমন `Category` বা `Review`। আপাতত আমরা শুধু মূল `Product` নিয়ে কাজ করবো, পরের মডিউলগুলোতে সম্পর্কযুক্ত এন্টিটি নিয়ে আরও গভীরে যাবো।

**ধাপ দুই — ফিল্ড ঠিক করা।** একটা প্রোডাক্ট বিক্রি করতে গেলে ন্যূনতম কী কী তথ্য দরকার? নাম, বিবরণ, দাম, স্টকের পরিমাণ, ছবি, ক্যাটেগরি। এগুলো ভেবে বের করার সময় নিজেকে প্রশ্ন করো — "একজন ক্রেতা প্রোডাক্ট পেজে কী দেখতে চায়?" আর "দোকানদার (অ্যাডমিন) কী তথ্য ট্র্যাক করতে চায়?" এই দুই দৃষ্টিকোণ মিলিয়ে আমরা প্রোডাক্টের JSON গঠনটা এভাবে সাজাতে পারি:

```json
{
  "id": "prod_1001",
  "title": "রানিং শু",
  "description": "আরামদায়ক দৈনন্দিন ব্যবহারের জুতা",
  "price": 1500,
  "stock": 20,
  "category": "footwear",
  "images": ["shoe1.jpg", "shoe2.jpg"],
  "created_at": "2026-08-01T10:00:00Z"
}
```

(লক্ষ্য করো — Python/FastAPI কনভেনশন অনুযায়ী ফিল্ডের নাম `snake_case`-এ লেখা, যেমন `created_at`, JavaScript-এর `camelCase` কনভেনশনের বদলে।)

এই গঠনটা লক্ষ্য করলে দেখবে এতে সহজ ফিল্ড (string, number) আর একটা array (`images`) দুটোই আছে — ঠিক Module 8-এর তৃতীয় লেসনে JSON-এর গঠন নিয়ে যা শিখেছিলাম, তারই বাস্তব প্রয়োগ।

**ধাপ তিন — সম্পর্ক বিবেচনা করা।** এখানে `category` একটা সাধারণ স্ট্রিং হিসেবে রাখা হয়েছে, কিন্তু বড় সিস্টেমে এটা আলাদা একটা `Category` এন্টিটির সাথে যুক্ত (linked) থাকতো। আপাতত সরলতার জন্য আমরা string হিসেবেই রাখছি — এটাও একটা ডিজাইন সিদ্ধান্ত, আর প্রতিটা ডিজাইন সিদ্ধান্তেরই একটা কারণ থাকা উচিত (এখানে কারণ হলো — এখনো আমরা সম্পর্কযুক্ত ডেটাবেজ টেবিল নিয়ে কাজ করিনি, তাই সরল রাখাই ভালো)।

**ধাপ চার — অপারেশন আর endpoint ঠিক করা।** CRUD নীতি অনুসরণ করে আমাদের endpoint তালিকা দাঁড়ায়:

| Method | Endpoint | কাজ |
|--------|----------|-----|
| GET | `/api/products` | সব প্রোডাক্টের তালিকা |
| GET | `/api/products/:id` | নির্দিষ্ট একটা প্রোডাক্ট |
| POST | `/api/products` | নতুন প্রোডাক্ট তৈরি |
| PUT | `/api/products/:id` | প্রোডাক্ট আপডেট |
| DELETE | `/api/products/:id` | প্রোডাক্ট মুছে ফেলা |

এখন এই ডিজাইনটাকে FastAPI কোডে রূপান্তর করা যাক। এখানে প্রথম কাজটা হলো আমাদের ডিজাইন করা JSON গঠনটাকে একটা **Pydantic model** হিসেবে লিখে ফেলা — এটাই সেই "নকশা" যা কোড আর ডেটার মধ্যে একটা চুক্তি তৈরি করে:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

app = FastAPI()


class Product(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    price: float
    stock: int
    category: str
    images: list[str] = []
    created_at: datetime


class ProductCreate(BaseModel):
    title: str
    price: float
    stock: int
    description: Optional[str] = None
    category: str = "uncategorized"
    images: list[str] = []


products: list[Product] = []  # বাস্তবে এটা একটা ডেটাবেজ হতো
next_id = 1


# GET — সব প্রোডাক্ট
@app.get("/api/products")
def get_products():
    return {"success": True, "data": products}


# GET — একটা নির্দিষ্ট প্রোডাক্ট
@app.get("/api/products/{product_id}")
def get_product(product_id: int):
    product = next((p for p in products if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="প্রোডাক্ট পাওয়া যায়নি")
    return {"success": True, "data": product}


# POST — নতুন প্রোডাক্ট তৈরি
@app.post("/api/products", status_code=201)
def create_product(payload: ProductCreate):
    global next_id
    # ভ্যালিডেশন এখানে ProductCreate model নিজেই করে ফেলেছে —
    # title, price, stock ভুল টাইপ বা অনুপস্থিত হলে FastAPI আগেই 422 রেসপন্স দিয়ে দেবে
    new_product = Product(id=next_id, created_at=datetime.utcnow(), **payload.model_dump())
    next_id += 1
    products.append(new_product)
    return {"success": True, "data": new_product}
```

লক্ষ্য করো, আমরা দুইটা আলাদা model বানিয়েছি — `Product` (ডেটাবেজে বা রেসপন্সে যেমন থাকবে, `id` আর `created_at` সহ) আর `ProductCreate` (ক্লায়েন্ট যখন নতুন প্রোডাক্ট বানানোর রিকোয়েস্ট পাঠায়, তখন যা যা দিতে হবে)। এই বিভাজনটা ইচ্ছাকৃত — ক্লায়েন্ট কখনো `id` বা `created_at` নিজে ঠিক করে দিতে পারবে না, সার্ভারই সেটা নিয়ন্ত্রণ করে। ডিজাইনের সময় নেওয়া প্রতিটা সিদ্ধান্ত — কোন ফিল্ড আবশ্যিক, কোন ফরম্যাটে ডেটা থাকবে — সরাসরি এই model-এর গঠনে প্রতিফলিত হচ্ছে। এটাই ডেটা মডেলিং-এর আসল মূল্য — নকশা যত স্পষ্ট, কোড তত নির্ভুল আর পরিষ্কার হয়।

**একটা গুরুত্বপূর্ণ প্রোডাকশন নুয়ান্স — schema evolution আর versioning।** ধরো তোমার API চালু হওয়ার ছয় মাস পর তুমি সিদ্ধান্ত নিলে প্রতিটা প্রোডাক্টে একটা `sku` (Stock Keeping Unit) ফিল্ড *আবশ্যিক* করে দিতে হবে, কারণ ইনভেন্টরি সিস্টেমের সাথে মেলাতে এটা এখন লাগবেই। যদি তুমি সরাসরি `ProductCreate` model-এ `sku: str` (কোনো default value ছাড়া) যোগ করে দাও, তাহলে যেসব পুরনো ক্লায়েন্ট (মোবাইল অ্যাপ, অন্য কোনো ইন্টিগ্রেশন) এখনও পুরনো ফরম্যাটে রিকোয়েস্ট পাঠাচ্ছে — যাদের `sku` পাঠানোর কথা নাও থাকতে পারে — তাদের প্রতিটা রিকোয়েস্ট 422 এরর দিয়ে ব্যর্থ হয়ে যাবে, কোনো সতর্কতা ছাড়াই। এই সমস্যা এড়াতে কয়েকটা কৌশল আছে — নতুন ফিল্ডটাকে প্রথমে `Optional[str] = None` রেখে ধীরে ধীরে সব ক্লায়েন্টকে আপডেট করার সময় দেওয়া, অথবা API-এর একটা নতুন ভার্সন (যেমন `/api/v2/products`) চালু করা, যেখানে পুরনো ভার্সন (`/api/v1/products`) কিছুদিন সমান্তরালে চালু রেখে ক্লায়েন্টদের মাইগ্রেট হওয়ার সময় দেওয়া হয়। মূল কথা হলো — একটা লাইভ API-এর ডেটা মডেল বদলানো মানেই সেই মডেলের উপর নির্ভরশীল সব ক্লায়েন্টের কথাও একইসাথে ভাবা, নিজের কোডবেজের কথা ভাবাই যথেষ্ট না।

এখন আমরা জানি কীভাবে ডেটা মডেল ডিজাইন করতে হয় আর সেটাকে API-তে রূপান্তর করতে হয়। কিন্তু একবার JSON ডেটা হাতে পেলে, তার ভেতরের নির্দিষ্ট তথ্য পড়া বা পরিবর্তন করা কীভাবে করবো? পরের লেসনে আমরা ঠিক এই ব্যবহারিক দক্ষতাটা শিখবো।
