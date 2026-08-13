# ২৪.০৫. Connecting Database

গত লেসনে আমরা ঠিক করেছিলাম, রোডম্যাপের প্রথম P0 টাস্ক হলো ডেটাবেজ কানেকশন — কারণ এটা ছাড়া বাকি সব কাজ থমকে থাকবে। কোনো মডেল, কোনো মাইগ্রেশন, কোনো সার্ভিস লজিক — কিছুই ডেটাবেজ ছাড়া অর্থবহ না। তাই এই লেসনে আমরা প্রথমবারের মতো FastAPI অ্যাপ্লিকেশনকে একটা আসল PostgreSQL ডেটাবেজের সাথে যুক্ত করবো।

প্রথমে দরকার একটা চলমান PostgreSQL ইনস্ট্যান্স। ডেভেলপমেন্টের সুবিধার জন্য আমরা Docker ব্যবহার করবো, যাতে লোকাল মেশিনে সরাসরি PostgreSQL ইনস্টল করতে না হয়। প্রজেক্টের রুটে একটা `docker-compose.yml` ফাইল তৈরি করি:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: shopkori
      POSTGRES_PASSWORD: shopkori_pass
      POSTGRES_DB: shopkori_db
    ports:
      - '5432:5432'
    volumes:
      - shopkori_pg_data:/var/lib/postgresql/data
volumes:
  shopkori_pg_data:
```

```bash
docker compose up -d
```

এই কমান্ডটা ব্যাকগ্রাউন্ডে একটা PostgreSQL সার্ভার চালু করে দেবে, পোর্ট ৫৪৩২-এ। এখন আমাদের FastAPI অ্যাপ্লিকেশনকে বলতে হবে এই ডেটাবেজের ঠিকানা কোথায়। `pydantic-settings` ব্যবহার করে আমরা `.env` ফাইলে সংবেদনশীল তথ্য রাখবো, কোডে হার্ডকোড করবো না — এটা নিরাপত্তার একটা মৌলিক নিয়ম, যেন ডেটাবেজ পাসওয়ার্ড কখনো Git-এ কমিট না হয়।

`.env`:

```
DATABASE_URL=postgresql://shopkori:shopkori_pass@localhost:5432/shopkori_db
JWT_SECRET_KEY=change-this-to-a-real-secret
```

`.gitignore`-এ `.env` যোগ করে দিতে ভুলো না। এরপর `app/config.py`-তে কনফিগারেশন ক্লাস লিখি:

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
```

এখন `app/database.py`-তে আসল ডেটাবেজ কানেকশনের কোড লিখি — এটাই এই লেসনের সবচেয়ে গুরুত্বপূর্ণ অংশ:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

engine = create_engine(
    settings.database_url,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

কয়েকটা সিদ্ধান্ত এখানে বিশদভাবে ব্যাখ্যা করা দরকার, কারণ এগুলো প্রোডাকশনে বড় প্রভাব ফেলে।

**`pool_size` আর `max_overflow`** — SQLAlchemy একটা connection pool রাখে, যাতে প্রতি রিকোয়েস্টে নতুন করে TCP কানেকশন খুলতে না হয় (যা ধীর)। `pool_size=5` মানে সর্বোচ্চ ৫টা কানেকশন সবসময় খোলা থাকবে, আর `max_overflow=10` মানে চাপ বেশি হলে সাময়িকভাবে আরও ১০টা এক্সট্রা কানেকশন খোলা যাবে। `pool_pre_ping=True` দিলে প্রতিটা কানেকশন ব্যবহারের আগে একটা ছোট "ping" পাঠিয়ে যাচাই করে নেয় কানেকশনটা এখনো জীবিত কিনা — এটা দরকার কারণ PostgreSQL বা লোড ব্যালেন্সার প্রায়ই idle কানেকশন কিছু সময় পর নিজে থেকে বন্ধ করে দেয়, আর `pre_ping` ছাড়া তুমি একটা "stale connection" এরর পাবে, যা ডিবাগ করা বিরক্তিকর।

**`get_db()` জেনারেটর ফাংশন আর সবচেয়ে কমন প্রোডাকশন ভুল** — এই ফাংশনটা FastAPI-এর dependency system-এ ব্যবহার হবে (`Depends(get_db)`)। `yield` করার পর, রিকোয়েস্ট শেষ হলে FastAPI নিজে থেকে জেনারেটরের বাকি অংশ (`finally: db.close()`) চালায়। এটা এতটাই গুরুত্বপূর্ণ যে এখানে না বুঝলে প্রোডাকশনে ভয়ংকর একটা বাগ তৈরি হয়: **connection pool exhaustion**।

কল্পনা করো, কেউ ভুলবশত `get_db()` ব্যবহার না করে নিজে সরাসরি `SessionLocal()` কল করে একটা রুট হ্যান্ডলারে, আর `close()` করতে ভুলে যায়:

```python
# ভুল প্যাটার্ন — এটা করবে না
@router.get("/leaky")
def leaky_endpoint():
    db = SessionLocal()          # session তৈরি হলো
    result = db.query(User).all()
    return result                 # db.close() কখনো কল হলো না!
```

প্রতিবার এই এন্ডপয়েন্ট কল হওয়ার সাথে সাথে একটা করে কানেকশন pool থেকে বের হয়ে যায়, কিন্তু আর ফিরে আসে না। ৫টা `pool_size` + ১০টা `max_overflow` মিলিয়ে সর্বোচ্চ ১৫টা কানেকশন পাওয়া যায় — মাত্র ১৫টা রিকোয়েস্টের পরে ষোড়শ রিকোয়েস্টটা `TimeoutError: QueuePool limit of size 5 overflow 10 reached` এরর দিয়ে আটকে যাবে। ডেভেলপমেন্টে হালকা ট্রাফিকে এটা লক্ষ্যই করা যায় না, কারণ কানেকশন লিক হওয়া ধীরে ধীরে জমে। কিন্তু প্রোডাকশনে হাই-ট্রাফিক আওয়ারে মাত্র কয়েক মিনিটেই পুরো অ্যাপ্লিকেশন "hang" হয়ে যায় — নতুন কোনো রিকোয়েস্ট ডেটাবেজে পৌঁছাতেই পারে না। এই কারণেই আমরা কখনো ম্যানুয়ালি `SessionLocal()` কল করবো না; সবসময় `Depends(get_db)` দিয়ে ইনজেক্ট করবো, যাতে FastAPI-এর dependency lifecycle নিজেই `close()` নিশ্চিত করে — এমনকি এক্সসেপশন হলেও, কারণ `finally` ব্লক গ্যারান্টি দেয় ক্লিনআপ চলবে।

এখন `app/main.py`-তে অ্যাপ্লিকেশন তৈরি করি:

```python
from fastapi import FastAPI

app = FastAPI(title="ShopKori API")


@app.get("/health")
def health_check():
    return {"status": "ok"}
```

অ্যাপ্লিকেশন চালিয়ে দেখা যাক সব ঠিক আছে কিনা:

```bash
uvicorn app.main:app --reload
```

`http://localhost:8000/health` খুলে `{"status": "ok"}` দেখতে পাওয়া মানে সার্ভার চলছে। এই মুহূর্তে ডেটাবেজে এখনো কোনো টেবিল নেই — কারণ আমরা এখনো কোনো মডেল ডিফাইন করিনি বা মাইগ্রেশন চালাইনি। এটাই স্বাভাবিক; কানেকশন স্থাপন আর স্কিমা তৈরি করা দুটো আলাদা ধাপ। পরের লেসনে আমরা প্রথম মডেল — `User` — ডিফাইন করবো, আর তারপর Alembic-এর মাইগ্রেশন সিস্টেম ব্যবহার করে সেটাকে বাস্তব একটা ডেটাবেজ টেবিলে রূপান্তর করবো।
