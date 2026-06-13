# FastAPI Backend Tutorial for Next.js Frontend

এই note-টা FastAPI backend শেখার জন্য। Frontend side হিসেবে ধরা হয়েছে **Next.js App Router**।

Main goal:

```txt
Backend কেন দরকার বুঝা
Request কীভাবে backend-এর ভিতর দিয়ে যায় বুঝা
কোন component/file কেন ব্যবহার করছি বুঝা
Next.js frontend-এর জন্য clean, secure JSON API বানানো
Project বড় হলেও structure maintainable রাখা
```

Learning order:

```txt
Concept -> Request flow -> Building blocks -> Small app -> Structure -> Database -> Auth -> Permission -> Frontend connection
```

<a id="index"></a>

## Index

<!-- tutorial-index:start -->
- [01. Big Picture: Backend আসলে কী করে](#section-1)
- [02. Request Lifecycle: Browser থেকে Database পর্যন্ত](#section-2)
- [03. FastAPI Building Blocks: কোন অংশ কেন](#section-3)
- [04. Installation এবং Local Setup](#section-4)
- [05. First FastAPI App](#section-5)
- [06. API Prefix, Versioning এবং APIRouter](#section-6)
- [07. Path, Query এবং Request Body](#section-7)
- [08. Pydantic Schema এবং Response Model](#section-8)
- [09. Sync, Async এবং Await](#section-9)
- [10. Project Structure: Simple থেকে Production Style](#section-10)
- [11. Model vs Schema vs Service vs Repository](#section-11)
- [12. Database Basics with SQLModel](#section-12)
- [13. CRUD Flow: Create, Read, Update, Delete](#section-13)
- [14. Dependencies: Reusable Logic Inject করা](#section-14)
- [15. Environment Variables এবং CORS](#section-15)
- [16. Authentication: Login, Password Hash, JWT](#section-16)
- [17. Authorization: Role এবং Permission Protection](#section-17)
- [18. Error Handling এবং Status Code](#section-18)
- [19. File Upload এবং Background Tasks](#section-19)
- [20. MVP, Redis, Queue এবং Scaling Decision](#section-20)
- [21. Next.js Frontend Connection](#section-21)
- [22. API Docs, OpenAPI এবং Testing](#section-22)
- [23. Practical Domain Example: Fleet/Uber-Type Backend](#section-23)
- [24. Development Rules, Checklist এবং Summary](#section-24)
<!-- tutorial-index:end -->

---

<a id="section-1"></a>

## 01. Big Picture: Backend আসলে কী করে

Backend হলো app-এর real brain। Frontend user-এর সাথে কথা বলে, backend business rule enforce করে।

Simple responsibility:

```txt
Next.js  = UI, routing, forms, frontend state
FastAPI  = API, validation, auth, permission, business logic
Database = permanent data storage
```

FastAPI backend-এর main কাজ:

| কাজ | কেন দরকার |
|---|---|
| API route তৈরি | frontend যেন data চাইতে পারে |
| Request validation | ভুল/অসম্পূর্ণ data reject করতে |
| Authentication | user কে verify করতে |
| Authorization | user কী access করতে পারবে তা control করতে |
| Database operation | permanent data create/read/update/delete করতে |
| Business logic | app-এর real rule apply করতে |
| Response formatting | frontend যেন clean JSON পায় |
| Error handling | frontend/user যেন meaningful error পায় |

Important rule:

```txt
Frontend validation = user experience
Backend validation  = real data correctness/security
```

User browser থেকে কেউ চাইলে frontend validation bypass করতে পারে। কিন্তু backend validation bypass করা উচিত না।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-2"></a>

## 02. Request Lifecycle: Browser থেকে Database পর্যন্ত

একটা request backend-এর ভিতরে সাধারণত এইভাবে যায়:

```txt
Next.js Frontend
  -> HTTP Request
  -> FastAPI Router/Endpoint
  -> Dependency
  -> Pydantic Schema Validation
  -> Service/Business Logic
  -> Repository/Database Query
  -> Database
  -> Response Schema
  -> JSON Response
  -> Next.js Frontend
```

Login example:

```txt
POST /api/v1/auth/login
  -> LoginPayload schema email/password validate করে
  -> auth_service user খুঁজে
  -> password verify করে
  -> JWT token create করে
  -> LoginResponse schema safe data পাঠায়
```

কেন layer ভাগ করি:

```txt
Router      = URL and HTTP method
Schema      = data shape and validation
Service     = business rule
Repository  = database query
Model       = database table
Dependency  = repeated common logic
```

ছোট project-এ সব layer আলাদা না করলেও চলে। কিন্তু বড় project-এ আলাদা রাখলে code easier to test, debug, and maintain.

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-3"></a>

## 03. FastAPI Building Blocks: কোন অংশ কেন

FastAPI শেখার সময় এই words বারবার আসবে:

| Name | কাজ | Example file |
|---|---|---|
| `FastAPI()` app | backend application create করে | `app/main.py` |
| Router | API endpoints group করে | `app/api/v1/routes/users.py` |
| Path param | URL-এর part থেকে value নেয় | `/users/{user_id}` |
| Query param | `?search=...` value নেয় | `/users?role=admin` |
| Request body | POST/PATCH data নেয় | login/register payload |
| Pydantic schema | input/output validate করে | `schemas/user.py` |
| Response model | frontend-এ safe data পাঠায় | `UserPublic` |
| DB model | database table define করে | `models/user.py` |
| Dependency | reusable logic inject করে | `get_session`, `get_current_user` |
| Service | business logic রাখে | `services/auth_service.py` |
| Repository | database query রাখে | `repositories/user_repository.py` |
| Middleware | request/response মাঝখানে কাজ করে | CORS |

Short memory:

```txt
Route receives request
Schema checks data
Service applies rule
Repository talks to DB
Model defines DB table
Response model protects output
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-4"></a>

## 04. Installation এবং Local Setup

Windows local setup:

```bash
py -m venv .venv
.venv\Scripts\activate
```

Install:

```bash
python -m pip install "fastapi[standard]" uvicorn python-dotenv
```

Database/auth packages:

```bash
python -m pip install sqlmodel passlib[bcrypt] python-jose[cryptography] python-multipart pytest
```

Common `requirements.txt`:

```txt
fastapi[standard]
uvicorn
python-dotenv
sqlmodel
passlib[bcrypt]
python-jose[cryptography]
python-multipart
pytest
```

Run:

```bash
uvicorn app.main:app --reload
```

Alternative:

```bash
fastapi dev app/main.py
```

Open:

```txt
Backend API: http://localhost:8000
Swagger docs: http://localhost:8000/docs
ReDoc docs:   http://localhost:8000/redoc
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-5"></a>

## 05. First FastAPI App

File:

```txt
app/main.py
```

```py
from fastapi import FastAPI

app = FastAPI(
    title="AI Dream API",
    version="1.0.0",
)

@app.get("/")
async def root():
    return {"message": "FastAPI backend is running"}
```

Run:

```bash
uvicorn app.main:app --reload
```

Visit:

```txt
http://localhost:8000
```

Response:

```json
{
  "message": "FastAPI backend is running"
}
```

কেন `async def`:

```txt
Endpoint future-এ database/API/file/network operation await করতে পারবে।
FastAPI async endpoint efficiently handle করতে পারে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-6"></a>

## 06. API Prefix, Versioning এবং APIRouter

Production-style API usually versioned হয়:

```txt
/api/v1/auth/login
/api/v1/users
/api/v1/courses
```

Why versioning:

```txt
Future-এ breaking change হলে /api/v2 করা যায়
Old frontend /api/v1 use করতে পারে
Mobile app/frontend একসাথে migrate করা সহজ হয়
```

Router file:

```txt
app/api/v1/routes/users.py
```

```py
from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
async def get_users():
    return [
        {"id": 1, "name": "Ahatasham"},
        {"id": 2, "name": "Rahim"},
    ]
```

Main app:

```py
from fastapi import FastAPI, APIRouter
from app.api.v1.routes import users

app = FastAPI(title="AI Dream API")

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(users.router)

app.include_router(api_router)
```

Final URL:

```txt
GET http://localhost:8000/api/v1/users/
```

Rule:

```txt
এক feature/domain = এক router file
auth.py, users.py, courses.py, admin.py
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-7"></a>

## 07. Path, Query এবং Request Body

API input সাধারণত তিন জায়গা থেকে আসে।

Path parameter:

```txt
GET /api/v1/users/123
```

```py
@router.get("/{user_id}")
async def get_user(user_id: int):
    return {"id": user_id}
```

Use when:

```txt
Specific resource identify করতে
User details, course details, product details
```

Query parameter:

```txt
GET /api/v1/users?role=admin&page=2
```

```py
@router.get("/")
async def get_users(
    role: str | None = None,
    page: int = 1,
    limit: int = 10,
):
    return {
        "role": role,
        "page": page,
        "limit": limit,
        "items": [],
    }
```

Use when:

```txt
Search
Filter
Sort
Pagination
Optional control
```

Request body:

```json
{
  "email": "admin@example.com",
  "password": "secret123"
}
```

```py
from pydantic import BaseModel, EmailStr

class LoginPayload(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
async def login(payload: LoginPayload):
    return {"email": payload.email}
```

Rule:

```txt
Resource identity -> path param
Filter/control    -> query param
POST/PATCH data   -> request body
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-8"></a>

## 08. Pydantic Schema এবং Response Model

Pydantic schema data shape define এবং validate করে।

Common schema types:

```txt
Create schema   = create request data
Update schema   = update request data
Public schema   = safe response data
Login schema    = auth request data
```

Example:

```py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserUpdate(BaseModel):
    name: str | None = None
    is_active: bool | None = None

class UserPublic(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: str
    is_active: bool
```

Why separate schema:

```txt
Create request-এ password লাগে
Database model-এ hashed_password থাকে
Response-এ password/hashed_password পাঠানো যাবে না
```

Response model:

```py
@router.get("/{user_id}", response_model=UserPublic)
async def get_user(user_id: int):
    return {
        "id": user_id,
        "email": "user@example.com",
        "name": "Demo User",
        "role": "student",
        "is_active": True,
        "hashed_password": "secret-hash",
    }
```

`response_model=UserPublic` থাকলে unsafe field response থেকে filter হবে।

Important:

```txt
Backend থেকে frontend-এ শুধু safe data পাঠাবো।
Sensitive/internal field schema দিয়ে hide করবো।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-9"></a>

## 09. Sync, Async এবং Await

FastAPI endpoint দুইভাবে লেখা যায়:

```py
def normal_endpoint():
    ...
```

```py
async def async_endpoint():
    ...
```

Simple meaning:

```txt
def       = synchronous function
async def = asynchronous function
await     = async কাজ শেষ হওয়া পর্যন্ত অপেক্ষা
```

Async useful when:

```txt
Async database client
External API call
Network/file operation
Many concurrent requests
```

Example:

```py
@router.get("/health")
async def health_check():
    return {"status": "ok"}
```

`await` use:

```py
@router.get("/external")
async def call_external_api():
    result = await some_async_function()
    return result
```

Important:

```txt
async endpoint-এর ভিতরে heavy blocking কাজ দিলে performance issue হতে পারে।
CPU-heavy কাজ হলে background worker/queue ভাবতে হবে।
```

Practical rule:

```txt
Simple endpoint -> async def okay
Blocking sync library -> def acceptable
Async DB/client -> async def + await
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-10"></a>

## 10. Project Structure: Simple থেকে Production Style

শুরুতে simple:

```txt
backend/
  app/
    main.py
    config.py
    database.py
    models.py
    schemas.py
    routers/
      auth.py
      users.py
  .env
  requirements.txt
```

Learning/MVP-এর জন্য enough।

Medium/production-style:

```txt
backend/
  app/
    main.py

    core/
      config.py
      security.py

    db/
      session.py

    api/
      v1/
        router.py
        routes/
          auth.py
          users.py
          courses.py

    models/
      user.py
      course.py

    schemas/
      auth.py
      user.py
      course.py

    services/
      auth_service.py
      user_service.py

    repositories/
      user_repository.py

    dependencies/
      auth.py
      roles.py

  tests/
  .env
  requirements.txt
```

Scaffold decision:

| Situation | Best structure |
|---|---|
| learning/demo | flat/simple |
| small MVP | router-based |
| medium app | router + service layer |
| complex business logic | service + repository layer |
| many domains/team | modular/feature-based |
| huge enterprise | clean architecture |
| many independent deployable services | microservices |

Important:

```txt
শুরুতেই microservice বানাবো না।
প্রথমে clean monolith বানাবো।
Project বড় হলে service/repository/module আলাদা করবো।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-11"></a>

## 11. Model vs Schema vs Service vs Repository

FastAPI learning-এ `model` word confusing হতে পারে। এই note-এ:

```txt
Model  = database table structure
Schema = API request/response shape
```

Responsibility:

| Layer | প্রশ্ন | Example |
|---|---|---|
| Model | database কীভাবে data রাখবে? | `User` table |
| Schema | API দিয়ে কোন data ঢুকবে/বের হবে? | `UserCreate`, `UserPublic` |
| Service | business rule কী? | password hash, login rule |
| Repository | database query কীভাবে হবে? | get user by email |
| Router | URL endpoint কী? | `POST /auth/login` |

Example flow:

```txt
POST /users
  -> UserCreate schema validates body
  -> user_service hashes password
  -> user_repository saves user
  -> User model writes database table
  -> UserPublic schema sends safe response
```

এই separation করলে:

```txt
Router thin থাকে
Business logic service-এ থাকে
Database query repository-তে থাকে
Schema sensitive field hide করে
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-12"></a>

## 12. Database Basics with SQLModel

FastAPI নিজে database force করে না। Common choices:

```txt
SQLAlchemy = professional/common ORM
SQLModel   = SQLAlchemy + Pydantic style, learning-friendly
```

Install:

```bash
python -m pip install sqlmodel
```

Database setup:

```py
from sqlmodel import SQLModel, Session, create_engine

DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
```

Model:

```py
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    name: str
    hashed_password: str
    role: str = "student"
    is_active: bool = True
```

Meaning:

| Field | কাজ |
|---|---|
| `id` | primary key |
| `email` | unique user email |
| `hashed_password` | raw password না, hashed password |
| `role` | admin/teacher/student |
| `is_active` | account active কিনা |

`yield` dependency:

```txt
Request শুরু হলে session create
Endpoint কাজ করে
Request শেষ হলে session close
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-13"></a>

## 13. CRUD Flow: Create, Read, Update, Delete

CRUD meaning:

```txt
Create = POST
Read   = GET
Update = PUT/PATCH
Delete = DELETE
```

Create user:

```py
from fastapi import APIRouter, Depends
from sqlmodel import Session

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserPublic)
async def create_user(
    payload: UserCreate,
    session: Session = Depends(get_session),
):
    user = User(
        email=payload.email,
        name=payload.name,
        hashed_password="hashed-password-here",
        role="student",
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    return user
```

Read list:

```py
from sqlmodel import select

@router.get("/", response_model=list[UserPublic])
async def get_users(session: Session = Depends(get_session)):
    statement = select(User)
    users = session.exec(statement).all()
    return users
```

Read one:

```py
from fastapi import HTTPException

@router.get("/{user_id}", response_model=UserPublic)
async def get_user(
    user_id: int,
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
```

Important:

```txt
Database model return করলেও response_model safe fields filter করবে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-14"></a>

## 14. Dependencies: Reusable Logic Inject করা

Dependency হলো repeated logic endpoint-এ inject করার system।

Common dependencies:

```txt
DB session
current user
role check
permission check
pagination params
settings/config
```

DB session:

```py
def get_session():
    with Session(engine) as session:
        yield session
```

Use:

```py
from fastapi import Depends

@router.get("/users")
async def get_users(session: Session = Depends(get_session)):
    ...
```

Current user idea:

```py
def get_current_user():
    return {
        "id": 1,
        "email": "admin@example.com",
        "role": "admin",
    }
```

Use:

```py
@router.get("/me")
async def get_me(current_user = Depends(get_current_user)):
    return current_user
```

Rule:

```txt
যে logic অনেক endpoint-এ লাগে, সেটা dependency বানাবো।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-15"></a>

## 15. Environment Variables এবং CORS

`.env`:

```env
APP_NAME=AI Dream API
ENVIRONMENT=development
SECRET_KEY=change-this-secret
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=sqlite:///./app.db
FRONTEND_URL=http://localhost:3000
```

Config:

```py
import os
from dotenv import load_dotenv

load_dotenv()

APP_NAME = os.getenv("APP_NAME", "FastAPI App")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
```

CORS কেন:

```txt
Next.js frontend -> http://localhost:3000
FastAPI backend  -> http://localhost:8000
Different origin, তাই browser CORS check করবে।
```

CORS setup:

```py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Rules:

```txt
Secret/config hardcode করবো না।
.env git commit করবো না।
Production-এ "*" origin avoid করবো।
Cookie auth হলে allow_credentials=True লাগবে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-16"></a>

## 16. Authentication: Login, Password Hash, JWT

Authentication মানে user কে সেটা verify করা।

Flow:

```txt
User email/password পাঠায়
  -> FastAPI user খুঁজে
  -> Password verify করে
  -> JWT access token তৈরি করে
  -> Frontend token/session save করে
  -> Next request-এ Authorization header পাঠায়
```

Header:

```txt
Authorization: Bearer <access_token>
```

Password hashing:

```py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)
```

JWT create:

```py
from datetime import datetime, timedelta, timezone
from jose import jwt

SECRET_KEY = "change-this-secret"
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_minutes: int = 60):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

Login response:

```json
{
  "access_token": "jwt-token-here",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

Important:

```txt
Raw password database-এ রাখা যাবে না।
SECRET_KEY .env থেকে আসবে।
Token expire time রাখা ভালো।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-17"></a>

## 17. Authorization: Role এবং Permission Protection

Authorization মানে user কী access করতে পারবে।

Simple roles:

```txt
admin
teacher
student
```

Role dependency:

```py
from fastapi import Depends, HTTPException

def require_role(required_role: str):
    def checker(current_user = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail="Forbidden")

        return current_user

    return checker
```

Admin-only endpoint:

```py
@router.get("/admin/users")
async def get_admin_users(
    current_user = Depends(require_role("admin")),
):
    return []
```

Large app-এ permission-based RBAC ভালো:

```txt
roles:
- admin
- driver
- customer
- support

permissions:
- ride:create
- ride:view_own
- ride:view_all
- ride:assign_driver
- driver:approve
- payment:view
- user:manage
```

Database table idea:

```txt
users
roles
permissions
role_permissions
```

Permission dependency:

```py
def require_permission(permission_code: str):
    def checker(current_user = Depends(get_current_user)):
        user_permissions = current_user.permissions

        if permission_code not in user_permissions:
            raise HTTPException(status_code=403, detail="Not enough permission")

        return current_user

    return checker
```

Frontend vs backend:

```txt
Next.js route guard = UX / redirect
FastAPI role check  = real security
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-18"></a>

## 18. Error Handling এবং Status Code

FastAPI error raise করতে `HTTPException` use করা হয়।

```py
from fastapi import HTTPException

if not user:
    raise HTTPException(
        status_code=404,
        detail="User not found",
    )
```

Common status codes:

| Status | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Bad request |
| `401` | Not authenticated |
| `403` | Not allowed |
| `404` | Not found |
| `422` | Validation error |
| `500` | Server error |

Create endpoint:

```py
@router.post("/", status_code=201)
async def create_course(payload: CourseCreate):
    return {"message": "Course created"}
```

Rules:

```txt
Error message frontend-friendly হবে।
Sensitive internal error expose করবো না।
Wrong auth হলে 401/403 clear রাখবো।
Missing resource হলে 404 দিবো।
Validation error হলে Pydantic 422 দিবে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-19"></a>

## 19. File Upload এবং Background Tasks

File upload:

```bash
python -m pip install python-multipart
```

```py
from fastapi import APIRouter, UploadFile, File

router = APIRouter(prefix="/files", tags=["files"])

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    return {
        "filename": file.filename,
        "content_type": file.content_type,
    }
```

Use cases:

```txt
profile image
PDF upload
audio upload
document processing
```

Background task:

```py
from fastapi import APIRouter, BackgroundTasks

router = APIRouter(prefix="/emails", tags=["emails"])

def send_email(email: str):
    print(f"Sending email to {email}")

@router.post("/send")
async def send_email_later(
    email: str,
    background_tasks: BackgroundTasks,
):
    background_tasks.add_task(send_email, email)
    return {"message": "Email sending started"}
```

Decision:

```txt
Small post-response task -> BackgroundTasks
Heavy production job     -> Celery/RQ/queue
Large file upload        -> size limit/storage/security ভাববো
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-20"></a>

## 20. MVP, Redis, Queue এবং Scaling Decision

MVP = Minimum Viable Product.

মানে:

```txt
সব feature না, কিন্তু main কাজটা চলবে।
```

MVP-তে focus:

```txt
Auth
Core CRUD
Basic role protection
Admin/dashboard API
Critical validation
Basic tests
```

Advanced feature পরে:

```txt
Redis cache
OTP storage
Rate limiting
Queue/background worker
Live status
Analytics
Auto scaling
Microservices
```

Redis কী:

```txt
Database = permanent storage
Redis    = very fast temporary storage/cache
```

Redis use cases:

```txt
cache
OTP temporary storage
rate limit
token blacklist
queue broker
online/offline status
ride request timeout
```

Decision:

```txt
Small MVP শুরুতে Redis বাধ্যতামূলক না।
PostgreSQL/SQLite + FastAPI দিয়েই শুরু করা যায়।
OTP/cache/rate limit/queue দরকার হলে Redis add করবো।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-21"></a>

## 21. Next.js Frontend Connection

FastAPI backend:

```txt
http://localhost:8000/api/v1
```

Next.js `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
API_BASE_URL=http://localhost:8000/api/v1
```

Frontend service:

```ts
import { api } from "@/lib/api";

export async function loginUser(payload: {
  email: string;
  password: string;
}) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}
```

Final URL:

```txt
POST http://localhost:8000/api/v1/auth/login
```

Data naming:

```txt
FastAPI response snake_case হতে পারে: access_token
Frontend চাইলে camelCase map করতে পারে: accessToken
```

Connection checklist:

```txt
FastAPI running on 8000
Next.js running on 3000
CORS allows frontend origin
API prefix matches frontend baseURL
Request body schema matches frontend payload
Response model matches frontend TypeScript type
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-22"></a>

## 22. API Docs, OpenAPI এবং Testing

FastAPI automatic docs দেয়।

```txt
Swagger: http://localhost:8000/docs
ReDoc:   http://localhost:8000/redoc
```

Why useful:

```txt
Endpoint test করা যায়
Request/response schema দেখা যায়
Frontend developer API বুঝতে পারে
Validation/debug easy হয়
```

Docs clear করতে:

```py
router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}", response_model=UserPublic)
async def get_user(user_id: int):
    ...
```

Testing:

```py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

Run:

```bash
pytest
```

Test first:

```txt
health endpoint
login success/fail
protected route
validation error
core CRUD endpoint
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-23"></a>

## 23. Practical Domain Example: Fleet/Uber-Type Backend

Transport, fleet, Uber-type, LMS, SaaS - এসব app-এ role, permission, payment, booking, profile, report অনেক domain থাকে।

Example roles:

```txt
customer
driver
admin
support
accounts
fleet_manager
```

Domain folders:

```txt
models/
  user.py
  role.py
  permission.py
  driver.py
  vehicle.py
  ride.py
  payment.py

schemas/
  user.py
  driver.py
  vehicle.py
  ride.py

services/
  auth_service.py
  driver_service.py
  vehicle_service.py
  ride_service.py
  payment_service.py

repositories/
  user_repository.py
  ride_repository.py
  vehicle_repository.py
```

Fleet manager responsibility:

```txt
Vehicle add/edit
Driver assign
Trip approve/assign
Fuel log view
Maintenance record manage
Report view
```

Vehicle create flow:

```txt
Next.js form
  -> POST /api/v1/vehicles
  -> VehicleCreate schema validates
  -> vehicle_service checks business rule
  -> vehicle_repository saves DB
  -> Vehicle model writes table
  -> VehicleResponse sends safe JSON
  -> Next.js shows success
```

Main lesson:

```txt
Domain বড় হলে feature/domain আলাদা করবো।
কিন্তু শুরুতে clean monolith রাখাই practical।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-24"></a>

## 24. Development Rules, Checklist এবং Summary

Rules:

1. API version prefix use করবো: `/api/v1`.
2. Router আলাদা file-এ রাখবো।
3. Request schema আর response schema আলাদা রাখবো।
4. Database model আর API schema confuse করবো না।
5. Raw password database-এ save করবো না।
6. Response-এ sensitive data পাঠাবো না।
7. Pydantic backend validation always রাখবো।
8. Frontend validation থাকলেও backend validation বাদ দেবো না।
9. CORS only trusted frontend origin allow করবো।
10. `.env` file git commit করবো না।
11. DB session dependency দিয়ে manage করবো।
12. Business logic বড় হলে service layer-এ রাখবো।
13. Database query বড় হলে repository layer add করবো।
14. Auth route এবং protected route আলাদা ভাববো।
15. Permission backend-এ enforce করবো।
16. Meaningful status code use করবো।
17. `/docs` দিয়ে endpoint manually test করবো।
18. Critical endpoint-এর test রাখবো।
19. MVP-তে clean monolith যথেষ্ট।
20. Redis/queue/microservice পরে দরকার হলে add করবো।

Final memory:

```txt
main.py        -> FastAPI app create + router include
api/routes     -> URL endpoints
schemas/       -> request/response shape
models/        -> database table
db/session     -> database session
dependencies/  -> DB/current user/role guard
services/      -> business logic
repositories/  -> database query
core/config    -> env/settings
core/security  -> password hash/JWT
```

Full-stack responsibility:

```txt
Next.js -> UI, route, form, frontend state, UX guard
FastAPI -> API, validation, auth, permission, database
Database -> permanent storage
Redis/Queue -> optional scale/performance helper
```

Official references:

- FastAPI Tutorial: https://fastapi.tiangolo.com/tutorial/
- Bigger Applications: https://fastapi.tiangolo.com/tutorial/bigger-applications/
- Path Parameters: https://fastapi.tiangolo.com/tutorial/path-params/
- Query Parameters: https://fastapi.tiangolo.com/tutorial/query-params/
- Request Body: https://fastapi.tiangolo.com/tutorial/body/
- CORS: https://fastapi.tiangolo.com/tutorial/cors/
- Async/Await: https://fastapi.tiangolo.com/async/
- OAuth2/JWT: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
- SQL Databases: https://fastapi.tiangolo.com/tutorial/sql-databases/
- Handling Errors: https://fastapi.tiangolo.com/tutorial/handling-errors/

এই sequence follow করলে backend tutorial একটা বইয়ের মতো পড়া যায়: আগে backend-এর role, তারপর request flow, তারপর code component, তারপর database/auth/security, শেষে frontend integration এবং scaling decision।

<!-- tutorial-nav:back -->
[Back to Index](#index)
