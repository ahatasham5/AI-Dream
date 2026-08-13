# ২৪.১৭. Developing Store Module

গত লেসনে আমরা Store মডিউলের রিকোয়ারমেন্ট আর আন্তঃমডিউল যোগাযোগের কাঠামো ঠিক করেছি। এখন হাতে-কলমে বানানোর পালা — মডেল, Pydantic Schema, আর Repository, ঠিক সাবস্ক্রিপশন মডিউলের মতো ক্রম মেনে (Module 24.08 আর 24.12-এর প্যাটার্ন পুনরাবৃত্তি করে, কারণ একই স্থাপত্য নীতি সব মডিউলে সমানভাবে প্রযোজ্য)।

প্রথমে ফোল্ডার কাঠামো তৈরি করি:

```
app/modules/store/
├── __init__.py
├── models.py
├── schemas.py
├── repository.py
├── service.py
└── router.py
```

`app/modules/store/models.py`:

```python
import enum
import uuid
from datetime import datetime

from sqlalchemy import String, Enum, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class StoreStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(100))
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    status: Mapped[StoreStatus] = mapped_column(
        Enum(StoreStatus, name="store_status_enum"), default=StoreStatus.PENDING
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    products: Mapped[list["Product"]] = relationship(back_populates="store")
```

এখানে `Product` ক্লাসের একটা ফরওয়ার্ড রেফারেন্স আছে (স্ট্রিং টাইপ হিন্ট `"Product"` হিসেবে), যেটা আমরা Module 24.20-এ পুরোপুরি ডিফাইন করবো। SQLAlchemy-তে `relationship()` স্ট্রিং নাম দিয়ে লেজি-রিজলভ হয়, তাই `Product` ক্লাস এখনো আমদানি না করা থাকলেও কোনো সমস্যা নেই — যতক্ষণ Alembic-এর `env.py`-তে ইভেন্টুয়ালি সেটা ইমপোর্ট হয়, SQLAlchemy metadata-তে দুটোই নিবন্ধিত থাকবে। বাস্তব প্রজেক্টেও প্রায়ই এভাবে আগে থেকে সম্পর্কের কাঠামো ঠিক করে রাখা হয়, মডেল পুরোপুরি বাস্তবায়নের আগেই।

এখন Schema — `app/modules/store/schemas.py`:

```python
import re
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator

from app.modules.store.models import StoreStatus

SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class CreateStoreSchema(BaseModel):
    name: str
    slug: str

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, value: str) -> str:
        if not SLUG_PATTERN.match(value):
            raise ValueError(
                "slug শুধু lowercase অক্ষর, সংখ্যা আর হাইফেন দিয়ে গঠিত হতে হবে।"
            )
        return value


class StoreReadSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    owner_id: UUID
    name: str
    slug: str
    status: StoreStatus
```

`@field_validator` দিয়ে কাস্টম regex ভ্যালিডেশন যোগ করা হয়েছে, যাতে `slug` সবসময় URL-safe থাকে — এটা Module 24.16-এর রিকোয়ারমেন্টে বলা "URL-friendly ইউনিক নাম" শর্তটার সরাসরি বাস্তবায়ন। Pydantic v2-এ `@field_validator` মেথড অবশ্যই `@classmethod` হতে হবে, আর ভ্যালিডেশন ব্যর্থ হলে `ValueError` ছুঁড়তে হয় — Pydantic নিজেই সেটা ধরে একটা structured `422` এরর রেসপন্সে রূপান্তর করে দেয়।

এখন Repository লেয়ার — `app/modules/store/repository.py`:

```python
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.modules.store.models import Store


def count_by_owner(db: Session, owner_id: UUID) -> int:
    stmt = select(func.count()).select_from(Store).where(Store.owner_id == owner_id)
    return db.scalar(stmt)


def find_by_slug(db: Session, slug: str) -> Store | None:
    stmt = select(Store).where(Store.slug == slug)
    return db.scalars(stmt).first()


def find_by_owner(db: Session, owner_id: UUID) -> list[Store]:
    stmt = select(Store).where(Store.owner_id == owner_id)
    return db.scalars(stmt).all()


def find_all(db: Session) -> list[Store]:
    return db.scalars(select(Store)).all()


def find_by_id(db: Session, store_id: UUID) -> Store | None:
    return db.get(Store, store_id)
```

`count_by_owner()` ফাংশনটা এখানে বিশেষভাবে গুরুত্বপূর্ণ — এটাই Service লেয়ারে গিয়ে `max_store_limit`-এর বিপরীতে যাচাই হবে। খেয়াল করো এখানে `select(func.count())` ব্যবহার করা হয়েছে, `find_by_owner(db, owner_id)`-এর ফলাফলের `len()` নেয়ার বদলে — এটা একটা গুরুত্বপূর্ণ পারফরম্যান্স সিদ্ধান্ত। যদি একজন ওউনারের ভবিষ্যতে হাজার হাজার স্টোর থাকে (যদিও আমাদের বিজনেস রুলে সীমিত, কিন্তু ধরে নিলাম সাধারণভাবে), তাহলে সব রো ডেটাবেজ থেকে টেনে এনে Python-এ `len()` গণনা করা মেমরি আর নেটওয়ার্ক ব্যান্ডউইথ অপচয় করে। `COUNT(*)` কোয়েরি ডেটাবেজ ইঞ্জিনকেই এই কাজ করতে দেয়, যা সবসময় বেশি efficient — এই প্যাটার্নটা যেকোনো জায়গায় প্রযোজ্য যেখানে তোমার শুধু সংখ্যা দরকার, পুরো ডেটা না।

`find_by_slug()` দরকার হবে, কারণ ইউনিক কনস্ট্রেইন্ট ডেটাবেজ লেভেলে থাকলেও, ইউজারকে একটা পরিষ্কার এরর মেসেজ দেয়ার জন্য (ডেটাবেজের কাঁচা `IntegrityError` দেখানোর বদলে, যা `psycopg2.errors.UniqueViolation` টাইপের একটা কম-বোঝা যাওয়া স্ট্যাক ট্রেস তৈরি করে) Service লেয়ারে আগে থেকেই চেক করে নেয়া ভালো অভ্যাস।

মডেল রেজিস্টার করতে `alembic/env.py`-তে ইমপোর্ট যুক্ত করি:

```python
from app.modules.store.models import Store  # noqa: F401
```

মাইগ্রেশন জেনারেট আর রান করে ফেলি:

```bash
alembic revision --autogenerate -m "create stores table"
alembic upgrade head
```

মডেল, Schema, আর Repository — Store মডিউলের ভিত্তি প্রস্তুত। পরের লেসনে আমরা `service.py` লিখবো, যেখানে গত লেসনে পরিকল্পনা করা ক্রস-মডিউল সাবস্ক্রিপশন-চেক লজিকটা বাস্তবায়িত হবে, তারপর `router.py` দিয়ে HTTP এন্ডপয়েন্ট উন্মুক্ত করবো।
