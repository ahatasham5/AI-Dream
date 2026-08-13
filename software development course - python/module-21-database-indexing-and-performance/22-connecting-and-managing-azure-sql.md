# ২১.২২. Connecting and Managing Azure SQL

আগের লেসনে আমরা একটা Azure SQL Database সেটআপ করেছি — সার্ভার তৈরি, ফায়ারওয়াল রুল, কানেকশন স্ট্রিং। এই মডিউলের শেষ লেসনে আমরা সেই ডাটাবেসকে বাস্তবে ব্যবহার করবো — আমাদের Python/FastAPI অ্যাপ্লিকেশন থেকে সংযোগ করে, এই পুরো মডিউলে শেখা প্রায় প্রতিটা কৌশল একসাথে প্রয়োগ করে একটা সংক্ষিপ্ত সারমর্ম তৈরি করবো।

Python থেকে Azure SQL Database-এ সংযোগ করার জন্য `pyodbc` নামের প্যাকেজ ব্যবহার করা হয় (Module 3-4-এ আমরা শিখেছি কীভাবে pip প্যাকেজ ইনস্টল আর ব্যবহার করতে হয়):

```bash
pip install pyodbc
```

```python
import os
import pyodbc
from functools import lru_cache

def build_conn_str() -> str:
    return (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        "SERVER=my-sql-server.database.windows.net;"
        "DATABASE=shop_db;"
        "UID=admin_user;"
        f"PWD={os.environ['DB_PASSWORD']};"  # Module 12-এর env variable অভ্যাস
        "Encrypt=yes;"  # ২১.১৪-এ শেখা Encryption in Transit
    )

@lru_cache(maxsize=1)
def get_connection() -> pyodbc.Connection:
    # pyodbc নিজেই আভ্যন্তরীণভাবে কানেকশন পুলিং সামলায় (২১.০৮-এ শেখা ধারণা)
    return pyodbc.connect(build_conn_str())
```

এখন আমরা একটা সম্পূর্ণ FastAPI রুট বানাবো যা এই মডিউলে শেখা একাধিক ধারণা একসাথে ব্যবহার করে — Parameterized Query (SQL Injection প্রতিরোধ, ২১.১৩), সঠিক কলাম আনা (২১.০৫), আর Least Privilege ইউজার (২১.১২):

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class OrderRequest(BaseModel):
    customer_id: int
    product_id: int

@app.get("/products")
def get_products(category: str):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Parameterized query — ইউজারের ইনপুট সরাসরি স্ট্রিং-এ জোড়া লাগানো হচ্ছে না
        cursor.execute(
            "SELECT id, name, price FROM products WHERE category = ?", category
        )
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")

@app.post("/orders", status_code=201)
def place_order(order: OrderRequest):
    conn = get_connection()
    cursor = conn.cursor()

    # Stored Procedure কল করা (২১.০৯-এ শেখা ধারণা)
    cursor.execute(
        "{CALL place_order (?, ?)}", order.customer_id, order.product_id
    )
    conn.commit()

    return {"message": "Order placed"}
```

এখানে `?` হলো `pyodbc`-র প্লেসহোল্ডার সিনট্যাক্স (PostgreSQL-এ যেমন আমরা `%s` দেখেছিলাম ২১.১৩-এ, SQL Server-এ এটা `?` আকারে হয়) — নীতিটা একদম একই, শুধু সিনট্যাক্স ভিন্ন।

Azure SQL Database "ম্যানেজ" করা মানে শুধু কানেক্ট করাই না — এটা একটা চলমান দায়িত্ব, যার মধ্যে পড়ে **Monitoring**। Azure Portal-এর "Query Performance Insight" টুল স্বয়ংক্রিয়ভাবে সবচেয়ে ধীর কুয়েরিগুলো চিহ্নিত করে দেখায় — অনেকটা ২১.০৭-এ শেখা `EXPLAIN ANALYZE`-এর একটা ভিজ্যুয়াল, স্বয়ংক্রিয় সংস্করণ, যেখানে তোমাকে ম্যানুয়ালি প্রতিটা কুয়েরি টেস্ট করতে হয় না।

```mermaid
flowchart TD
    A[FastAPI App] -->|"pyodbc package দিয়ে<br/>Connection Pool"| B[Azure SQL Database]
    B --> C["Query Performance Insight<br/>ধীর কুয়েরি চিহ্নিতকরণ"]
    B --> D["Automated Backup<br/>২১.১৬-এর ধারণা স্বয়ংক্রিয়"]
    B --> E["Firewall Rules<br/>২১.২১-এ সেটআপ করা"]
    C --> F["প্রয়োজনে নতুন Index যোগ<br/>(২১.০১-০৪-এর জ্ঞান প্রয়োগ)"]
```

এই ডায়াগ্রামটাই আসলে গোটা মডিউল ২১-এর একটা সারসংক্ষেপ — একটা বাস্তব ক্লাউড ডাটাবেস পরিচালনা করতে গেলে, ইনডেক্সিং, কুয়েরি অপ্টিমাইজেশন, নিরাপত্তা, ব্যাকআপ — এই সবকিছুই একসাথে কাজ করে, আলাদা আলাদা বিষয় হিসেবে না।

Azure SQL Database ম্যানেজমেন্টের আরেকটা গুরুত্বপূর্ণ দিক হলো **Scaling** — যদি অ্যাপ্লিকেশনের ট্রাফিক বাড়ে, Azure পোর্টাল থেকে বা CLI দিয়ে সহজেই Pricing Tier পরিবর্তন করা যায়, প্রায় কোনো ডাউনটাইম ছাড়াই:

```bash
# ডাটাবেসের Service Tier আপগ্রেড করা (Azure CLI)
az sql db update \
  --resource-group my-resource-group \
  --server my-sql-server \
  --name shop_db \
  --service-objective S3
```

এই লেসন দিয়ে আমরা Module 21-এর একটা পূর্ণ চক্র সম্পন্ন করলাম — শুরু হয়েছিলো একটা একক টেবিলের একটা কলামে ইনডেক্স বসানো দিয়ে (২১.০১), আর শেষ হচ্ছে একটা সম্পূর্ণ ক্লাউড-হোস্টেড, নিরাপদ, স্কেলযোগ্য প্রোডাকশন ডাটাবেস পরিচালনা করে। এই মডিউলে শেখা প্রতিটা ধারণা — ইনডেক্সিং, কুয়েরি অপ্টিমাইজেশন, ক্যাশিং, স্টোরড প্রসিডিউর, ভিউ, ট্রিগার, নিরাপত্তা, RBAC, ব্যাকআপ, আর ক্লাউড ডাটাবেস — একসাথে মিলে একজন ব্যাকএন্ড ডেভেলপারকে শুধু "কোড লেখা" থেকে "একটা নির্ভরযোগ্য, দ্রুত, নিরাপদ সিস্টেম বানানো"-র দিকে নিয়ে যায়। পরবর্তী মডিউলে আমরা সম্পূর্ণ নতুন একটা দিকে যাবো — সফটওয়্যার ডিজাইন প্যাটার্ন, যেখানে আমরা শিখবো কীভাবে কোডের গঠন নিজেই আরও পরিষ্কার, পুনর্ব্যবহারযোগ্য আর রক্ষণাবেক্ষণযোগ্য করে তোলা যায়।
