# ২৪.১৩. Service And Router

গত লেসনে আমরা Pydantic Schema দিয়ে ইনপুট ভ্যালিডেশন আর Repository দিয়ে ডেটাবেজ অ্যাক্সেস স্তর তৈরি করেছি। এখন এই দুইটাকে সংযুক্ত করে বিজনেস লজিক লেখার পালা — `service.py`, আর তারপর সেটাকে HTTP-এর সাথে যুক্ত করার জন্য `router.py`।

`app/modules/subscription/service.py`:

```python
from datetime import date, timedelta
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.subscription import repository
from app.modules.subscription.models import StoreSubscription, SubscriptionPlan
from app.modules.subscription.schemas import (
    CreateSubscriptionPlanSchema,
    SubscribeSchema,
)


def create_plan(db: Session, data: CreateSubscriptionPlanSchema) -> SubscriptionPlan:
    return repository.create_plan(db, data)


def list_plans(db: Session) -> list[SubscriptionPlan]:
    return repository.list_plans(db)


def get_plan_or_404(db: Session, plan_id: UUID) -> SubscriptionPlan:
    plan = repository.get_plan_by_id(db, plan_id)
    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="এই আইডিতে কোনো প্ল্যান পাওয়া যায়নি।",
        )
    return plan


def subscribe(db: Session, user_id: UUID, data: SubscribeSchema) -> StoreSubscription:
    existing_active = repository.find_active_by_user(db, user_id)
    if existing_active is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="তোমার ইতিমধ্যে একটা সক্রিয় সাবস্ক্রিপশন আছে।",
        )

    plan = get_plan_or_404(db, data.plan_id)

    start_date = date.today()
    expiry_date = start_date + timedelta(days=plan.duration_in_days)

    return repository.create_subscription(
        db, user_id=user_id, plan_id=plan.id, start_date=start_date, expiry_date=expiry_date
    )


def get_my_subscriptions(db: Session, user_id: UUID) -> list[StoreSubscription]:
    return repository.find_by_user(db, user_id)
```

এই সার্ভিসটা মনোযোগ দিয়ে পড়লে দেখবে, Module 24.08-এর PRD-তে লেখা প্রতিটা বিজনেস রুলের একটা সরাসরি প্রতিনিধিত্ব এখানে আছে — "একজনের একটাই ACTIVE সাবস্ক্রিপশন থাকতে পারবে" রুলটা `409 Conflict` HTTPException-এর মাধ্যমে প্রয়োগ হয়েছে, আর "মেয়াদ = আজ + duration_in_days" রুলটা `timedelta` হিসাবের মধ্যে বাস্তবায়িত হয়েছে। এটাই দেখায় কেন রিকোয়ারমেন্ট অ্যানালাইসিস (Module 24.01-24.02) আগে করে রাখা জরুরি ছিল — প্রতিটা লাইন কোডের পেছনে একটা নির্দিষ্ট, আগে থেকে ভাবা সিদ্ধান্ত আছে, নতুন করে ভাবতে হচ্ছে না।

একটা ডিজাইন সিদ্ধান্ত লক্ষণীয় — Service লেয়ারেই সরাসরি `HTTPException` ছুঁড়ছি, যদিও এটা টেকনিক্যালি একটা HTTP-স্তরের কনসেপ্ট। এটা "pure" layered architecture-এর একটা ছোট ছাড়, কিন্তু FastAPI ইকোসিস্টেমে এটাই standard practice, কারণ `HTTPException` FastAPI নিজে ধরে সঠিক status code আর JSON বডি রেসপন্স তৈরি করে দেয়। যদি Service লেয়ারকে সম্পূর্ণ HTTP-অজ্ঞান রাখতে চাও (যেমন যদি ভবিষ্যতে এই সার্ভিস একটা CLI স্ক্রিপ্ট বা background worker থেকেও কল হয়), তাহলে কাস্টম exception ক্লাস (যেমন `SubscriptionConflictError`) ডিফাইন করে Service থেকে সেটা ছুঁড়ে, Router-এর একটা exception handler-এ সেটাকে HTTP রেসপন্সে রূপান্তর করা ভালো — আমরা এই ট্রেড-অফ সম্পর্কে সচেতন থাকবো, কিন্তু সরলতার জন্য এই মডিউলে সরাসরি `HTTPException` ব্যবহার করবো।

এখন `app/modules/subscription/router.py`:

```python
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.common.dependencies import require_roles, get_current_user
from app.database import get_db
from app.modules.subscription import service
from app.modules.subscription.schemas import (
    CreateSubscriptionPlanSchema,
    SubscriptionPlanReadSchema,
    SubscribeSchema,
    StoreSubscriptionReadSchema,
)
from app.modules.user.models import User, UserRole

plan_router = APIRouter(prefix="/subscription-plans", tags=["subscription-plans"])
subscription_router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@plan_router.post("", response_model=SubscriptionPlanReadSchema, status_code=201)
def create_plan(
    data: CreateSubscriptionPlanSchema,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN)),
):
    return service.create_plan(db, data)


@plan_router.get("", response_model=list[SubscriptionPlanReadSchema])
def list_plans(db: Session = Depends(get_db)):
    return service.list_plans(db)


@plan_router.get("/{plan_id}", response_model=SubscriptionPlanReadSchema)
def get_plan(plan_id: UUID, db: Session = Depends(get_db)):
    return service.get_plan_or_404(db, plan_id)


@subscription_router.post(
    "/subscribe", response_model=StoreSubscriptionReadSchema, status_code=201
)
def subscribe(
    data: SubscribeSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.subscribe(db, current_user.id, data)


@subscription_router.get(
    "/my-subscription", response_model=list[StoreSubscriptionReadSchema]
)
def my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_my_subscriptions(db, current_user.id)
```

লক্ষ্য করো, আমরা দুইটা আলাদা `APIRouter` ব্যবহার করেছি — `plan_router` (`/subscription-plans` রুটের জন্য) আর `subscription_router` (`/subscriptions` রুটের জন্য), কিন্তু দুটোই একই `service` মডিউল শেয়ার করছে। এটা Module 24.09-এর API প্ল্যানিং টেবিলে দুই ধরনের রিসোর্স (plans বনাম subscriptions) আলাদা থাকার সরাসরি প্রতিফলন।

`response_model=...` প্যারামিটারটা বিশেষভাবে গুরুত্বপূর্ণ, আর এটা FastAPI-এর একটা শক্তিশালী ফিচার যার সরাসরি সমতুল্য NestJS-এ নেই — এটা শুধু ডকুমেন্টেশনের জন্য না, রানটাইমে **আউটগোয়িং রেসপন্স** ফিল্টার করে দেয়। ধরো, `User` মডেলে `hashed_password` কলাম আছে, কিন্তু `response_model`-এ সেটা না থাকলে, ভুলবশত পুরো ORM অবজেক্ট রিটার্ন করলেও ক্লায়েন্ট কখনো `hashed_password` দেখতে পাবে না — FastAPI নিজেই সেটা বাদ দিয়ে দেয়। এটা একটা built-in সিকিউরিটি সেফটি-নেট, কিন্তু এখানে একটা কমন ভুলও লুকিয়ে আছে — যদি ডেভেলপার `response_model` **না** বসায় (ভেবে "যা আছে তাই রিটার্ন করবো"), তাহলে পুরো ORM অবজেক্ট, সব সেন্সিটিভ ফিল্ড সহ, সরাসরি JSON-এ সিরিয়ালাইজ হয়ে যায়। তাই প্রতিটা এন্ডপয়েন্টে `response_model` স্পষ্টভাবে বসানো একটা non-negotiable অভ্যাস হওয়া উচিত, বিশেষ করে যেখানে মডেলে সেন্সিটিভ ডেটা আছে।

`app/main.py`-তে দুইটা রুটার-ই রেজিস্টার করে দিতে হবে:

```python
app.include_router(plan_router)
app.include_router(subscription_router)
```

`require_roles(UserRole.SUPER_ADMIN)`-কে dependency-চেইনে বসানোর মানে হলো — FastAPI প্রথমে `get_current_user` চালাবে (টোকেন ডিকোড করে `req.user` সমতুল্য একটা `User` অবজেক্ট বানাবে), তারপর সেই ইউজারের রোল `SUPER_ADMIN` কিনা যাচাই করবে, তারপরই route handler-এর কোড চলবে। এটা একটা **dependency chain / pipeline প্যাটার্ন** — FastAPI dependency-গুলো ঘোষিত ক্রম অনুযায়ী রিজলভ করে, একধাপ একধাপ ফিল্টার হয়ে রিকোয়েস্ট এগোয়।

এখন এন্ড-টু-এন্ড ফ্লো সম্পূর্ণ — Schema ভ্যালিডেশন থেকে শুরু করে Router, Service, Repository, ডেটাবেজ পর্যন্ত। কোডটা চলে, `uvicorn app.main:app --reload` চালালে এরর ছাড়াই সার্ভার উঠবে, আর `http://localhost:8000/docs`-এ গিয়ে অটো-জেনারেটেড Swagger UI-তে সব এন্ডপয়েন্ট দেখা যাবে। কিন্তু "চলা" আর "সঠিকভাবে কাজ করা" এক জিনিস না — পরের লেসনে আমরা এই এন্ডপয়েন্টগুলো বাস্তবে কল করে দেখবো, ম্যানুয়াল টেস্টিং দিয়ে যাচাই করবো প্রতিটা বিজনেস রুল ঠিকভাবে কাজ করছে কিনা।
