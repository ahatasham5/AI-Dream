# ২৪.১৫. Testing API And Assignment

গত লেসনে আমরা `curl` দিয়ে হাতে হাতে সাবস্ক্রিপশন মডিউলের এন্ডপয়েন্ট টেস্ট করেছি। এই লেসনে আমরা সেই একই পরিস্থিতিগুলো **স্বয়ংক্রিয় (automated) টেস্ট**-এ রূপান্তর করবো, `pytest` আর `httpx.AsyncClient` ব্যবহার করে, আর তারপর সাবস্ক্রিপশন সাব-আর্ক (লেসন ১১-১৫) শেষ করবো একটা অ্যাসাইনমেন্ট দিয়ে, যা তুমি নিজে হাতে বাস্তবায়ন করে দেখবে।

FastAPI টেস্টিংয়ের প্রচলিত টুল হলো `pytest`, আর HTTP ক্লায়েন্ট হিসেবে `httpx` — যা `requests`-এর মতোই ইন্টারফেস, কিন্তু async সাপোর্ট করে আর FastAPI অ্যাপকে সরাসরি ইন-প্রসেস কল করতে পারে, আসল নেটওয়ার্ক সকেট না খুলেই (`ASGITransport` ব্যবহার করে)। প্রথমে একটা টেস্ট-নির্দিষ্ট ডেটাবেজ ফিক্সচার বানানো ভালো অভ্যাস — প্রোডাকশন ডেটাবেজে টেস্ট চালালে বিপজ্জনক, কারণ টেস্ট রান আসল ডেটা মুছে দিতে পারে।

`tests/conftest.py`:

```python
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = "postgresql://shopkori:shopkori_pass@localhost:5432/shopkori_test_db"
test_engine = create_engine(TEST_DATABASE_URL)
TestSessionLocal = sessionmaker(bind=test_engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
```

`app.dependency_overrides[get_db] = override_get_db` লাইনটা এখানে সবচেয়ে গুরুত্বপূর্ণ কৌশল — এটা FastAPI-কে বলছে, "টেস্টের সময় আসল `get_db`-এর বদলে এই টেস্ট-স্পেসিফিক ভার্সনটা ইনজেক্ট করো, যা একটা আলাদা টেস্ট ডেটাবেজে কানেক্ট হয়।" এটা NestJS-এর টেস্টিং মডিউলে `overrideProvider()`-এর ধারণাগত সমতুল্য। এভাবে প্রোডাকশন কোড একটা লাইনও না বদলে, টেস্টের সময় ভিন্ন dependency সরবরাহ করা যায়।

`tests/test_subscription.py`:

```python
import pytest


@pytest.mark.anyio
async def test_subscription_flow(client):
    admin_login = await client.post(
        "/auth/login",
        data={"username": "admin@shopkori.com", "password": "ChangeMe123!"},
    )
    admin_token = admin_login.json()["access_token"]

    owner_login = await client.post(
        "/auth/login",
        data={"username": "owner@shopkori.com", "password": "OwnerPass123!"},
    )
    owner_token = owner_login.json()["access_token"]

    # সুপার অ্যাডমিন প্ল্যান তৈরি করতে পারবে
    plan_res = await client.post(
        "/subscription-plans",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Basic", "price": 499, "duration_in_days": 30, "max_store_limit": 1},
    )
    assert plan_res.status_code == 201
    plan_id = plan_res.json()["id"]

    # টোকেন ছাড়া প্ল্যান তৈরি করা যাবে না
    unauth_res = await client.post(
        "/subscription-plans",
        json={"name": "Hacked", "price": 0, "duration_in_days": 1, "max_store_limit": 1},
    )
    assert unauth_res.status_code == 401

    # স্টোর ওউনার প্ল্যানে সাবস্ক্রাইব করতে পারবে
    sub_res = await client.post(
        "/subscriptions/subscribe",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"plan_id": plan_id},
    )
    assert sub_res.status_code == 201
    assert sub_res.json()["status"] == "ACTIVE"

    # দ্বিতীয়বার সাবস্ক্রাইব করলে 409 আসবে
    duplicate_res = await client.post(
        "/subscriptions/subscribe",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"plan_id": plan_id},
    )
    assert duplicate_res.status_code == 409
```

এই টেস্ট ফাইলটা আসলে গত লেসনের প্রতিটা `curl` কমান্ডের একটা কোডবদ্ধ রূপ — পার্থক্য হলো, এখন এটা `pytest` চালিয়ে যেকোনো সময়, যতবার খুশি, সেকেন্ডের মধ্যে পুনরায় চালানো যায়, আর ফলাফল pass/fail হিসেবে স্পষ্টভাবে দেখা যায়। এটাই automated testing-এর মূল ভ্যালু — ম্যানুয়াল টেস্টিং একবার করে বোঝায় "এই মুহূর্তে এটা কাজ করছে", কিন্তু automated টেস্ট বোঝায় "ভবিষ্যতে কেউ কোড বদলালেও এটা কাজ করা চালিয়ে যাবে, নাহলে টেস্ট ফেল করে জানিয়ে দেবে" — এটাকে বলে **regression protection**।

```bash
pytest tests/test_subscription.py -v
```

```mermaid
flowchart LR
    Dev["ডেভেলপার নতুন কোড লেখে"] --> Run["pytest"]
    Run --> Pass{"সব টেস্ট pass?"}
    Pass -->|হ্যাঁ| Merge["কোড মার্জ করা নিরাপদ"]
    Pass -->|না| Fix["বাগ ঠিক করা, আবার রান করা"]
    Fix --> Run
```

**একটা প্রোডাকশন-লেভেল সতর্কতা টেস্ট ডেটাবেজ নিয়ে** — উপরের `setup_database` ফিক্সচারে `autouse=True` আর `scope="function"` রাখা হয়েছে, মানে প্রতিটা টেস্ট ফাংশনের আগে টেবিল তৈরি হয়, পরে ড্রপ হয়। এটা টেস্টগুলোকে একে অপরের থেকে সম্পূর্ণ **isolated (বিচ্ছিন্ন)** রাখে — একটা টেস্টের ডেটা আরেকটা টেস্টের ফলাফলে প্রভাব ফেলতে পারে না। এই isolation ছাড়া একটা কমন সমস্যা হয়: টেস্ট আলাদা আলাদা রান করলে pass করে, কিন্তু একসাথে সব রান করলে fail করে ("flaky tests") — কারণ আগের টেস্টের রেখে যাওয়া ডেটা পরের টেস্টের অনুমানকে ভেঙে দেয়। বড় টেস্ট স্যুটে টেবিল ড্রপ/রিক্রিয়েট ধীর হয়ে যায়, তখন প্রতি টেস্টে একটা ট্রানজেকশন খুলে টেস্ট শেষে rollback করাটা দ্রুততর বিকল্প — কিন্তু ছোট স্কেলে সরল `create_all`/`drop_all` যথেষ্ট।

**অ্যাসাইনমেন্ট — এখন তোমার পালা:**

সাবস্ক্রিপশন মডিউল নিয়ে নিচের কাজগুলো নিজে হাতে বাস্তবায়ন করো:

1. একটা নতুন এন্ডপয়েন্ট `PATCH /subscription-plans/{id}` বানাও, যা শুধু `SUPER_ADMIN` ব্যবহার করতে পারবে, আর `UpdateSubscriptionPlanSchema` (Module 24.12-এ ইতিমধ্যে তৈরি, সব ফিল্ড ঐচ্ছিক) নেবে।
2. `service.py`-তে একটা ফাংশন লেখো `is_subscription_expired(subscription)`, যা চেক করবে `expiry_date` অতীতে চলে গেছে কিনা, আর যদি গেছে, `status`-কে `EXPIRED`-এ আপডেট করে সেভ করবে। এটা `get_my_subscriptions()`-এর ভেতরে কল করো, যাতে প্রতিবার সাবস্ক্রিপশন চেক করার সময় মেয়াদ স্বয়ংক্রিয়ভাবে যাচাই হয়।
3. একটা `pytest` টেস্ট লেখো যা যাচাই করে — অস্তিত্বহীন `plan_id` দিয়ে সাবস্ক্রাইব করার চেষ্টা করলে `404 Not Found` আসে (Module 24.13-এ `get_plan_or_404()`-এর `404` ইতিমধ্যে আছে, শুধু টেস্ট লিখতে হবে)।
4. চিন্তা করো — যদি একজন `CUSTOMER` রোলের ইউজার `/subscriptions/subscribe` কল করে, বর্তমান কোডে কী হবে? তুমি কি মনে করো এটাতে `require_roles()` বসানো উচিত? যদি হ্যাঁ, সেটা যোগ করো।

এই অ্যাসাইনমেন্টটা শেষ করলে সাবস্ক্রিপশন মডিউল কার্যকরীভাবে সম্পূর্ণ — মডেল থেকে শুরু করে Schema, Repository, Service, Router, আর টেস্ট পর্যন্ত পুরো স্ট্যাক তুমি নিজের হাতে বানিয়েছো। এটাই এই মডিউলের প্রথম "সম্পূর্ণ vertical slice" — একটা ফিচার একদম উপর থেকে নিচ পর্যন্ত পুরোপুরি কাজ করছে।

সাবস্ক্রিপশন মডিউল শেষ, আর রোডম্যাপ অনুযায়ী (Module 24.04) এখন পরবর্তী নির্ভরতা হলো **Store মডিউল** — কারণ একজন স্টোর ওউনার এখন সাবস্ক্রাইব করতে পারে, কিন্তু এখনো স্টোর খুলতে পারে না। পরের লেসনে আমরা ঠিক সেই কাজ শুরু করবো।
