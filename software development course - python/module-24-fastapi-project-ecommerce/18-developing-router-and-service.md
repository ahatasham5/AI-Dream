# ২৪.১৮. Developing Service And Router

গত লেসনে Store মডিউলের মডেল, Schema, আর Repository তৈরি হয়েছে। এখন `service.py` লিখে গত লেসনে পরিকল্পনা করা ক্রস-মডিউল সংযোগটা বাস্তবে কাজে লাগানোর পালা, তারপর `router.py` দিয়ে এন্ডপয়েন্ট উন্মুক্ত করা।

`app/modules/store/service.py`:

```python
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.store import repository
from app.modules.store.models import Store, StoreStatus
from app.modules.store.schemas import CreateStoreSchema
from app.modules.subscription import repository as subscription_repository
from app.modules.subscription.models import SubscriptionStatus


def create_store(db: Session, owner_id: UUID, data: CreateStoreSchema) -> Store:
    active_subscription = subscription_repository.find_active_by_user(db, owner_id)
    if active_subscription is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="স্টোর খুলতে হলে আগে একটা সক্রিয় সাবস্ক্রিপশন লাগবে।",
        )

    existing_slug = repository.find_by_slug(db, data.slug)
    if existing_slug is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="এই slug ইতিমধ্যে ব্যবহৃত হচ্ছে।",
        )

    current_store_count = repository.count_by_owner(db, owner_id)
    if current_store_count >= active_subscription.plan.max_store_limit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"তোমার প্ল্যানে সর্বোচ্চ {active_subscription.plan.max_store_limit}টা "
                "স্টোর খোলা যায়। এই সীমা পার হয়ে গেছে।"
            ),
        )

    store = Store(owner_id=owner_id, name=data.name, slug=data.slug, status=StoreStatus.PENDING)
    db.add(store)
    db.commit()
    db.refresh(store)
    return store


def get_my_stores(db: Session, owner_id: UUID) -> list[Store]:
    return repository.find_by_owner(db, owner_id)


def get_all_stores(db: Session) -> list[Store]:
    return repository.find_all(db)


def suspend_store(db: Session, store_id: UUID) -> Store:
    store = repository.find_by_id(db, store_id)
    if store is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="স্টোর পাওয়া যায়নি।"
        )
    store.status = StoreStatus.SUSPENDED
    db.commit()
    db.refresh(store)
    return store
```

এই সার্ভিসটা মনোযোগ দিয়ে দেখো — `create_store()` ফাংশনে তিনটা আলাদা চেক ক্রমান্বয়ে হচ্ছে: প্রথমে সক্রিয় সাবস্ক্রিপশন আছে কিনা (গত লেসনের ক্রস-মডিউল কল, `subscription_repository.find_active_by_user()` ব্যবহার করে — লক্ষ্য করো Module 24.16-এ বলা কনভেনশন এখানে সামান্য শিথিল করা হয়েছে, `repository` সরাসরি ইমপোর্ট করে, কারণ এখানে শুধু একটা read-only lookup, কোনো বিজনেস লজিক না; আসলে আরও কড়াকড়ি প্রজেক্টে `subscription.service.get_active_subscription_or_none()`-এর মতো একটা পাবলিক ফাংশন বানানো ভালো হতো), তারপর slug ইউনিক কিনা, সবশেষে `max_store_limit` পার হয়ে গেছে কিনা। এই তিনটা চেক ঠিক Module 24.16-এর PRD-তে লেখা ক্রম আর যুক্তি মেনে সাজানো — সবচেয়ে মৌলিক শর্ত (সাবস্ক্রিপশন থাকা) আগে যাচাই হচ্ছে, কারণ সেটা না থাকলে বাকি চেকগুলো করার কোনো মানেই নেই।

**এখানে Module 24.12-এ প্রতিশ্রুতি দেয়া "single commit" প্যাটার্নটা লক্ষ করো** — `db.add(store)` করার পর একবারই `db.commit()` কল হচ্ছে, Repository-লেভেলে আলাদা আলাদা কমিট নেই। তিনটা চেক ব্যর্থ হলে কোনো `db.commit()` কলই হয় না, তাই ডেটাবেজে অসম্পূর্ণ অবস্থা তৈরির কোনো ঝুঁকি নেই — পুরো `create_store()` ফাংশনটা একটা logical transaction হিসেবে কাজ করে। এটা একটা "cheapest/most fundamental check first" নীতির উদাহরণ — বিজনেস লজিকে সবচেয়ে সহজ আর মৌলিক শর্ত আগে যাচাই করলে কোড পড়তে সহজ হয় আর অপ্রয়োজনীয় ডেটাবেজ কাজ কম হয় (`count_by_owner()`-এর মতো তুলনামূলক ভারী কোয়েরি সবচেয়ে শেষে চালানো হচ্ছে, কারণ আগের দুটো চেক ব্যর্থ হলে এটা চালানোরই প্রয়োজন নেই)।

এখন `app/modules/store/router.py`:

```python
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.common.dependencies import require_roles, get_current_user
from app.database import get_db
from app.modules.store import service
from app.modules.store.schemas import CreateStoreSchema, StoreReadSchema
from app.modules.user.models import User, UserRole

router = APIRouter(prefix="/stores", tags=["stores"])


@router.post("", response_model=StoreReadSchema, status_code=201)
def create_store(
    data: CreateStoreSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STORE_OWNER)),
):
    return service.create_store(db, current_user.id, data)


@router.get("/my-stores", response_model=list[StoreReadSchema])
def my_stores(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STORE_OWNER)),
):
    return service.get_my_stores(db, current_user.id)


@router.get("", response_model=list[StoreReadSchema])
def all_stores(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN)),
):
    return service.get_all_stores(db)


@router.patch("/{store_id}/suspend", response_model=StoreReadSchema)
def suspend(
    store_id: UUID,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN)),
):
    return service.suspend_store(db, store_id)
```

`app/main.py`-তে এই রুটারটাও রেজিস্টার করে দিতে হবে:

```python
from app.modules.store.router import router as store_router

app.include_router(store_router)
```

**একটা রুট-অর্ডারিং সতর্কতা** — লক্ষ্য করো `/stores/my-stores` আর `/stores` (GET) — দুটো ভিন্ন এন্ডপয়েন্ট, কিন্তু ভবিষ্যতে যদি `/stores/{store_id}` টাইপের একটা প্যারামিটারাইজড রুট যোগ করতে হয়, তাহলে সেটা **অবশ্যই** `/stores/my-stores`-এর **পরে** ডিফাইন করতে হবে, আগে না। FastAPI রুট ম্যাচিং ডিক্লেয়ারেশন-ক্রম অনুযায়ী হয় — যদি `/stores/{store_id}` আগে ডিফাইন করা থাকে, তাহলে `/stores/my-stores` রিকোয়েস্ট এসে এই প্যারামিটারাইজড রুটে ম্যাচ হয়ে যাবে, `store_id="my-stores"` হিসেবে ধরে নিয়ে — যা একটা UUID পার্স করার এররে গিয়ে থামবে, বা আরও খারাপ, ভুল ডেটা রিটার্ন করবে যদি টাইপ কো-ইর্সন কোনোভাবে পাস করে যায়। এই ধরনের "static route vs dynamic route" অর্ডারিং বাগ FastAPI, Express, সব রাউটিং ফ্রেমওয়ার্কেই কমন, আর এটা টেস্টিংয়ে সহজে ধরা পড়ে না যদি টেস্ট শুধু হ্যাপি পাথ চেক করে।

Store মডিউলের কোর ফাংশনালিটি এখন কোড আকারে দাঁড়িয়ে গেছে। কিন্তু আগের সাব-আর্কের মতোই, লেখা কোড আর কাজ-করা কোড এক জিনিস না। পরের লেসনে আমরা এই পুরো ফ্লো — সাবস্ক্রাইব করা থেকে শুরু করে স্টোর তৈরি, লিমিট ছাড়িয়ে যাওয়া, সুপার অ্যাডমিনের সাসপেন্ড করা পর্যন্ত — পুরোটা টেস্ট করে দেখবো।
