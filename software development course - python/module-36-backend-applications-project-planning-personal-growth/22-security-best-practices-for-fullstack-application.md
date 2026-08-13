# ৩৬.২২ Security Best Practices for Fullstack Application

আমাদের Personal Growth Tracker যাত্রার শেষ ধাপে পৌঁছেছি — পরিকল্পনা, AI-সহায়ক ডেভেলপমেন্ট, বিল্ড, deploy, monitoring, performance, error handling — সব হয়ে গেছে। এই শেষ লেসনে আমরা পুরো অ্যাপ্লিকেশনটার উপর একটা নিরাপত্তার চাদর বিছিয়ে দেবো, যাতে এই এতদিনের পরিশ্রম কোনো সহজ আক্রমণে ভেঙে না পড়ে।

নিরাপত্তাকে ভাবা যায় একটা বাড়ির শেষ ধাপের মতো — দেয়াল-ছাদ (ফিচার) তৈরির পর তালা, গ্রিল, সিকিউরিটি ক্যামেরা বসানো। এগুলো বাড়ির "মূল কাজ" মনে না হলেও, এগুলো ছাড়া বাড়িতে থাকা নিরাপদ না।

```mermaid
flowchart TD
    A[Personal Growth Tracker] --> B["Auth: JWT + bcrypt hash - Module 12"]
    A --> C["Input Validation - Module 35.2"]
    A --> D["Rate Limiting - Module 35.2"]
    A --> E[HTTPS সবখানে]
    A --> F[Secrets .env-এ, গিটে না]
    A --> G[Dependency Vulnerability Scan]
    B --> Secure[নিরাপদ Production App]
    C --> Secure
    D --> Secure
    E --> Secure
    F --> Secure
    G --> Secure
```

পাসওয়ার্ড কখনো plain text-এ সংরক্ষণ করা উচিত না — bcrypt দিয়ে hash করা, যেটা Module ১২-তে শেখা হয়েছিলো:

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], bcrypt__rounds=12)

def register_user(db: Session, email: str, password: str) -> User:
    password_hash = pwd_context.hash(password)
    user = User(email=email, password_hash=password_hash)
    db.add(user)
    db.commit()
    return user

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

Module ৩৫.২-এ শেখা middleware guard এখানে পূর্ণাঙ্গভাবে প্রয়োগ হয়, আর Module ৩০-এ শেখা FastAPI security best practice-গুলো এখানে বাস্তবায়িত হয় — প্রতিটা sensitive route rate limiting আর input validation দিয়ে ঘেরা:

```python
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"  # clickjacking সুরক্ষা
        response.headers["Strict-Transport-Security"] = "max-age=63072000"
        return response

app.add_middleware(SecurityHeadersMiddleware)

@router.post("/login")
@limiter.limit("5/15minutes")  # ব্রুটফোর্স আক্রমণ ঠেকাতে
async def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    ...
```

আরেকটা গুরুত্বপূর্ণ অভ্যাস — third-party package-এর মধ্যে পরিচিত নিরাপত্তা দুর্বলতা আছে কিনা নিয়মিত পরীক্ষা করা:

```bash
pip install pip-audit
pip-audit
```

আর CI/CD পাইপলাইনে (Module ৩৬.১৮) এই audit-টা একটা automatic ধাপ হিসেবে যোগ করা যায়, যাতে দুর্বল dependency নিয়ে কেউ ভুলবশত deploy না করে ফেলে।

সবশেষে, `.env` ফাইল কখনো গিট রিপোজিটরিতে কমিট না হওয়া নিশ্চিত করা (`.gitignore`-এ থাকা), আর production-এ সবসময় HTTPS ব্যবহার করা, যাতে client আর server-এর মধ্যে ডেটা কেউ মাঝপথে পড়ে ফেলতে না পারে।

এখানেই আমাদের Personal Growth Tracker-এর যাত্রা সম্পূর্ণ হলো — পরিকল্পনা থেকে শুরু করে একটা নিরাপদ, পর্যবেক্ষিত, স্বয়ংক্রিয়ভাবে deploy হওয়া production অ্যাপ্লিকেশন পর্যন্ত। এই বাইশটা লেসনে আমরা যে প্যাটার্নটা অনুশীলন করলাম — পরিকল্পনা, বিল্ড, পর্যবেক্ষণ, উন্নতি, সুরক্ষা — এটাই যেকোনো বাস্তব সফটওয়্যার প্রজেক্টের জীবনচক্র। পরের মডিউলে আমরা এই কোডকে টিমের সাথে ভাগাভাগি করে কাজ করার হাতিয়ার — Git আর GitHub-এর গভীরে প্রবেশ করবো।
