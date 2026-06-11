# FastAPI Backend Notes for Next.js Frontend

এই note-টা FastAPI backend শেখার জন্য।  
Frontend side হিসেবে আমি Next.js App Router use করবো।

Main goal:

```txt
Clean FastAPI backend structure
Next.js frontend-এর জন্য API তৈরি করা
Auth, role protection, database, validation বুঝা
Project বড় হলেও code যেন maintainable থাকে
```

---

## 1. Big Picture

Full-stack app-এর flow:

```txt
User Browser
  ↓
Next.js Frontend
  ↓
Axios / Fetch
  ↓
FastAPI Backend
  ↓
Service / Business Logic
  ↓
Database
```

সহজভাবে:

```txt
Next.js  = UI, page, form, frontend state
FastAPI  = API, auth, validation, database logic
Database = permanent data storage
```

FastAPI backend-এর কাজ:

- API route তৈরি করা
- request data validate করা
- database query করা
- authentication/authorization check করা
- response পাঠানো
- error/status code handle করা
- frontend-এর জন্য clean JSON API provide করা

Important rule:

```txt
Frontend validation = user experience
Backend validation  = real security/data correctness
```

---

## 2. Backend Architecture Flow

একটা clean FastAPI backend সাধারণত এই flow follow করে:

```txt
Request
  ↓
Router / Endpoint
  ↓
Dependency
  ↓
Service Function
  ↓
Repository / Database Query
  ↓
Database
  ↓
Response Schema
```

Layer meaning:

```txt
Router      = URL endpoint define করে
Schema      = request/response data shape
Dependency  = common logic inject করে, যেমন DB session/current user
Service     = business logic
Repository  = database query
Model       = database table structure
Config      = env/settings
```

ছোট project হলে সব layer আলাদা না করলেও চলে। কিন্তু বড় project হলে আলাদা রাখা ভালো।

---

## 3. Installation

Windows local setup:

```bash
py -m venv .venv
```

Activate:

```bash
.venv\Scripts\activate
```

Install:

```bash
python -m pip install "fastapi[standard]" uvicorn python-dotenv
```

Database + auth package দরকার হলে:

```bash
python -m pip install sqlmodel passlib[bcrypt] python-jose[cryptography]
```

Common `requirements.txt`:

```txt
fastapi[standard]
uvicorn
python-dotenv
sqlmodel
passlib[bcrypt]
python-jose[cryptography]
```

Run:

```bash
fastapi dev app/main.py
```

Alternative:

```bash
uvicorn app.main:app --reload
```

Open:

```txt
Backend API: http://localhost:8000
Swagger docs: http://localhost:8000/docs
ReDoc docs:   http://localhost:8000/redoc
```

---

## 4. Simple Project Structure

শুরুতে simple structure:

```txt
backend/
│
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── routers/
│       ├── auth.py
│       └── users.py
│
├── .env
├── requirements.txt
└── README.md
```

Folder/file meaning:

| File/Folder | কাজ |
|---|---|
| `app/main.py` | FastAPI app create করে, routers include করে। |
| `app/config.py` | Environment variable/settings manage করে। |
| `app/database.py` | Database engine/session setup। |
| `app/models.py` | Database table model। |
| `app/schemas.py` | Request/response Pydantic schema। |
| `app/routers/` | API endpoints। |
| `.env` | Secret/config value। |
| `requirements.txt` | Python packages list। |

---

## 5. Bigger Project Structure

Project বড় হলে feature/domain based structure ভালো।

```txt
backend/
│
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   │
│   ├── db/
│   │   ├── database.py
│   │   └── session.py
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── router.py
│   │       └── endpoints/
│   │           ├── auth.py
│   │           ├── users.py
│   │           ├── admin.py
│   │           └── courses.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   └── course.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   └── course.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   └── course_service.py
│   │
│   └── dependencies/
│       ├── auth.py
│       └── roles.py
│
├── tests/
├── .env
└── requirements.txt
```

Simple vs bigger scaffold:

| Scaffold | কখন use করবো |
|---|---|
| Single `models.py`, `schemas.py` | ছোট learning project |
| `models/`, `schemas/`, `services/` folders | medium/large project |
| `api/v1/endpoints/` | versioned production-style API |
| `dependencies/` | reusable auth/DB/role logic |
| `services/` | business logic clean রাখতে |

---

## 6. First FastAPI App

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

---

## 7. API Prefix and Versioning

Production-style API usually versioned হয়:

```txt
/api/v1/auth/login
/api/v1/users
/api/v1/courses
```

Why versioning:

```txt
Future-এ API change করলে /api/v2 বানানো যাবে
Old frontend /api/v1 use করতে পারবে
Breaking change safely handle করা যায়
```

Example:

```py
from fastapi import FastAPI, APIRouter

app = FastAPI()

api_router = APIRouter(prefix="/api/v1")

@api_router.get("/health")
async def health_check():
    return {"status": "ok"}

app.include_router(api_router)
```

Final URL:

```txt
GET http://localhost:8000/api/v1/health
```

---

## 8. APIRouter

APIRouter দিয়ে endpoints আলাদা file-এ রাখা যায়।

File:

```txt
app/routers/users.py
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

Main file:

```py
from fastapi import FastAPI
from app.routers import users

app = FastAPI()

app.include_router(users.router, prefix="/api/v1")
```

Final URL:

```txt
GET http://localhost:8000/api/v1/users/
```

Rule:

```txt
এক feature = এক router file
auth.py, users.py, courses.py, admin.py
```

---

## 9. Path Parameters

Path parameter URL-এর অংশ।

Example URL:

```txt
/api/v1/users/123
```

এখানে `123` হলো `user_id`.

FastAPI:

```py
from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}")
async def get_user(user_id: int):
    return {
        "id": user_id,
        "name": "Demo User",
    }
```

Request:

```txt
GET /api/v1/users/123
```

Response:

```json
{
  "id": 123,
  "name": "Demo User"
}
```

Use path param when:

```txt
Specific resource দরকার
User details, product details, course details
```

---

## 10. Query Parameters

Query parameter URL-এর `?` এর পর থাকে।

Example:

```txt
/api/v1/products?search=phone&page=2&limit=10
```

FastAPI:

```py
from fastapi import APIRouter

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/")
async def get_products(
    search: str | None = None,
    page: int = 1,
    limit: int = 10,
):
    return {
        "search": search,
        "page": page,
        "limit": limit,
        "items": [],
    }
```

Use query param when:

```txt
Search
Filter
Sort
Pagination
Optional control
```

Path vs query:

| Type | Example | Use case |
|---|---|---|
| Path param | `/users/123` | specific user |
| Query param | `/users?role=admin` | filter users |
| Query param | `/products?page=2` | pagination |

---

## 11. Request Body

POST/PUT/PATCH request-এ data body হিসেবে আসে।

Frontend login request:

```json
{
  "email": "admin@example.com",
  "password": "secret123"
}
```

FastAPI schema:

```py
from pydantic import BaseModel, EmailStr

class LoginPayload(BaseModel):
    email: EmailStr
    password: str
```

Endpoint:

```py
from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(payload: LoginPayload):
    return {
        "email": payload.email,
        "access_token": "jwt-token-here",
    }
```

Request:

```txt
POST /api/v1/auth/login
```

Important:

```txt
FastAPI automatically request body validate করে।
Wrong email হলে validation error দিবে।
Required field missing হলে 422 error দিবে।
```

---

## 12. Pydantic Schemas

Pydantic schema data shape define করে।

Common schema types:

```txt
Create schema   = create request data
Update schema   = update request data
Public schema   = response data
Internal model  = database/internal data
```

Example:

```py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserPublic(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: str
```

Why separate schema:

```txt
Request-এ password লাগতে পারে
Response-এ password পাঠানো যাবে না
```

Bad response:

```json
{
  "id": 1,
  "email": "user@example.com",
  "password": "hashed-password"
}
```

Good response:

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Demo User",
  "role": "student"
}
```

---

## 13. Response Model

Response model দিয়ে API response shape control করা যায়।

```py
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])

class UserPublic(BaseModel):
    id: int
    email: EmailStr
    name: str

@router.get("/{user_id}", response_model=UserPublic)
async def get_user(user_id: int):
    return {
        "id": user_id,
        "email": "user@example.com",
        "name": "Demo User",
        "password": "secret",
    }
```

Response model থাকলে `password` response থেকে বাদ যাবে।

Important:

```txt
Backend থেকে frontend-এ শুধু safe data পাঠাবো।
Sensitive data response model দিয়ে hide/filter করবো।
```

---

## 14. Synchronous and Asynchronous in FastAPI

FastAPI endpoint দুইভাবে লেখা যায়:

```py
def normal_endpoint():
    ...
```

```py
async def async_endpoint():
    ...
```

সহজভাবে:

```txt
def       = synchronous function
async def = asynchronous function
```

Async দরকার যখন:

- async database client use করবো
- external API call async হবে
- file/network operation await করা যাবে
- concurrent request efficiently handle করতে চাই

Example:

```py
@router.get("/health")
async def health_check():
    return {"status": "ok"}
```

`await` use করতে হলে function `async def` হতে হবে:

```py
@router.get("/external")
async def call_external_api():
    result = await some_async_function()
    return result
```

Important:

```txt
async function-এর ভিতরে blocking কাজ avoid করতে হবে।
Heavy CPU task বা blocking DB call সরাসরি দিলে performance issue হতে পারে।
```

Common rule:

```txt
Simple API endpoint           → async def okay
Blocking sync library use করলে → def ব্যবহার করাও acceptable
Async DB/client use করলে       → async def + await
```

Frontend connection:

```txt
Next.js API call async
FastAPI endpoint async হতে পারে
Database query async/sync হতে পারে
```

---

## 15. CORS for Next.js Frontend

Next.js frontend:

```txt
http://localhost:3000
```

FastAPI backend:

```txt
http://localhost:8000
```

এগুলো আলাদা origin। তাই browser CORS check করবে।

FastAPI CORS setup:

```py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Development multiple origin:

```py
allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

Important:

```txt
CORS frontend browser-এর security rule।
Postman/curl-এ CORS error normally দেখা যায় না।
```

---

## 16. Environment Variables

`.env`:

```env
APP_NAME=AI Dream API
ENVIRONMENT=development
SECRET_KEY=change-this-secret
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=sqlite:///./app.db
FRONTEND_URL=http://localhost:3000
```

Config file:

```py
import os
from dotenv import load_dotenv

load_dotenv()

APP_NAME = os.getenv("APP_NAME", "FastAPI App")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
```

Rule:

```txt
Secret/config hardcode করবো না।
.env file use করবো।
.env git commit করবো না।
```

---

## 17. Database Basics with SQLModel

FastAPI যেকোনো database use করতে পারে। Learning project-এর জন্য SQLite easy।

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

`yield` dependency meaning:

```txt
Request শুরু হলে DB session create হবে
Endpoint কাজ করবে
Request শেষ হলে session close হবে
```

---

## 18. Database Models

Database model table structure define করে।

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
| `email` | user email, unique |
| `hashed_password` | raw password না, hashed password |
| `role` | admin/teacher/student |
| `is_active` | account active কিনা |

Important:

```txt
Raw password database-এ রাখা যাবে না।
Always hashed password save করতে হবে।
```

---

## 19. CRUD Example

Create user:

```py
from fastapi import APIRouter, Depends
from sqlmodel import Session

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/")
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

Read users:

```py
from sqlmodel import select

@router.get("/")
async def get_users(session: Session = Depends(get_session)):
    statement = select(User)
    users = session.exec(statement).all()
    return users
```

Read one user:

```py
from fastapi import HTTPException

@router.get("/{user_id}")
async def get_user(
    user_id: int,
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
```

CRUD meaning:

```txt
Create = POST
Read   = GET
Update = PUT/PATCH
Delete = DELETE
```

---

## 20. Dependencies

Dependency হলো reusable logic inject করার system।

Common dependencies:

- DB session
- current user
- role check
- pagination params
- settings/config

DB session dependency:

```py
def get_session():
    with Session(engine) as session:
        yield session
```

Use:

```py
@router.get("/users")
async def get_users(session: Session = Depends(get_session)):
    ...
```

Current user dependency idea:

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

---

## 21. Authentication

Authentication মানে user কে সেটা verify করা।

Common flow:

```txt
User email/password পাঠায়
  ↓
FastAPI user খুঁজে
  ↓
Password verify করে
  ↓
JWT access token তৈরি করে
  ↓
Frontend token save করে
  ↓
Next request-এ Authorization header পাঠায়
```

Header:

```txt
Authorization: Bearer <access_token>
```

Login response example:

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

Password hashing idea:

```py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)
```

JWT create idea:

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

Important:

```txt
SECRET_KEY .env থেকে আসবে।
Raw password কখনও database-এ রাখা যাবে না।
Token expire time রাখা ভালো।
```

---

## 22. Authorization and Role Protection

Authorization মানে user কী access করতে পারবে।

Example roles:

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

Role-based route idea:

```txt
/api/v1/admin/users       → admin only
/api/v1/teacher/courses   → teacher only
/api/v1/student/courses   → student only
```

Frontend vs backend:

```txt
Next.js route guard = UX / redirect
FastAPI role check  = real security
```

---

## 23. Error Handling

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

Example:

```py
@router.post("/", status_code=201)
async def create_course(payload: CourseCreate):
    return {"message": "Course created"}
```

Rule:

```txt
Error message frontend-friendly হতে হবে।
Sensitive internal error expose করবো না।
```

---

## 24. File Upload

FastAPI file upload করতে `UploadFile` use করা যায়।

Install support package if needed:

```bash
python -m pip install python-multipart
```

Example:

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

- profile image
- PDF upload
- audio upload
- document processing

Important:

```txt
Large file হলে size limit, storage path, security check দরকার।
Frontend FormData দিয়ে file পাঠাবে।
```

---

## 25. Background Tasks

Response পাঠানোর পরে কোনো কাজ করতে চাইলে background task use করা যায়।

Example:

```py
from fastapi import BackgroundTasks, APIRouter

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

Use cases:

- email sending
- log writing
- small post-processing

Important:

```txt
Heavy production job হলে Celery/RQ/queue better।
Small task হলে FastAPI BackgroundTasks enough।
```

---

## 26. Next.js Frontend Connection

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
import { api } from "@/lib/axios";

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

CORS must allow:

```txt
http://localhost:3000
```

Data format:

```txt
FastAPI response snake_case হতে পারে: access_token
Frontend চাইলে camelCase map করতে পারে: accessToken
```

---

## 27. API Docs and OpenAPI

FastAPI automatic docs তৈরি করে।

Swagger:

```txt
http://localhost:8000/docs
```

ReDoc:

```txt
http://localhost:8000/redoc
```

Why useful:

- endpoint test করা যায়
- request/response schema দেখা যায়
- frontend developer API বুঝতে পারে
- backend validation/debug easy হয়

Good API docs-এর জন্য:

```py
router = APIRouter(prefix="/users", tags=["users"])
```

Response model use করলে docs আরও clear হয়।

---

## 28. Testing

FastAPI test করতে `TestClient` use করা যায়।

Install:

```bash
python -m pip install pytest
```

Test file:

```txt
tests/test_health.py
```

Example:

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

Test use cases:

- health endpoint
- login success/fail
- protected route
- CRUD endpoint
- validation error

---

## 29. Development Rules

1. API version prefix use করবো: `/api/v1`.
2. Router আলাদা file-এ রাখবো।
3. Request/response schema আলাদা রাখবো।
4. Raw password database-এ save করবো না।
5. Response-এ sensitive data পাঠাবো না।
6. FastAPI Pydantic validation অবশ্যই রাখবো।
7. Frontend validation থাকলেও backend validation বাদ দেবো না।
8. CORS only trusted frontend origin allow করবো।
9. `.env` file git commit করবো না।
10. Auth route আর protected route আলাদা ভাববো।
11. Role permission backend-এ enforce করবো।
12. DB session dependency দিয়ে manage করবো।
13. Business logic বড় হলে service layer-এ রাখবো।
14. API error status code meaningful রাখবো।
15. Docs `/docs` দিয়ে endpoint manually test করবো।
16. Async/sync function বুঝে use করবো।
17. Independent slow কাজ হলে background task বা queue ভাববো।
18. Tests অন্তত critical endpoint-এর জন্য রাখবো।

---

## 30. Simple Auth Flow

```txt
Next.js LoginForm
  ↓
POST /api/v1/auth/login
  ↓
FastAPI receives email/password
  ↓
Pydantic validates request body
  ↓
Database থেকে user খোঁজা
  ↓
Password verify
  ↓
JWT token create
  ↓
Response: access_token + user
  ↓
Frontend token save করে
  ↓
Next request-এ Authorization header পাঠায়
```

Protected route flow:

```txt
GET /api/v1/admin/users
  ↓
Authorization: Bearer token
  ↓
FastAPI token decode করে
  ↓
Current user খুঁজে
  ↓
Role admin কিনা check করে
  ↓
Allowed হলে response
  ↓
Not allowed হলে 403
```

---

## 31. Common Commands

| Command | কাজ |
|---|---|
| `py -m venv .venv` | Virtual environment create। |
| `.venv\Scripts\activate` | Windows venv activate। |
| `python -m pip install -r requirements.txt` | Packages install। |
| `uvicorn app.main:app --reload` | Development server run। |
| `fastapi dev app/main.py` | FastAPI dev server run। |
| `pytest` | Tests run। |

---

## 32. Use Cases

এই backend scaffold ব্যবহার করা যাবে:

- Authentication API
- Role-based dashboard backend
- Admin panel API
- LMS backend
- SaaS backend
- AI app backend
- File upload API
- Next.js frontend-connected API

---

## 33. Official Docs References

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

---

## 34. Final Summary

FastAPI backend structure মনে রাখার সহজ way:

```txt
main.py       → app create + router include
routers/      → API endpoints
schemas/      → request/response validation
models/       → database tables
database.py   → DB engine/session
dependencies/ → current user, DB session, role guard
services/     → business logic
core/config   → env/settings/security
```

Full-stack responsibility:

```txt
Next.js → UI, frontend state, route guard UX
FastAPI → API, validation, auth, role permission, database
Database → permanent data
```

সবচেয়ে important:

```txt
Validation backend-এ must
Permission backend-এ must
Sensitive data response-এ দিবো না
Raw password save করবো না
Frontend CORS allow করতে হবে
API docs দিয়ে সব endpoint test করবো
```

এভাবে backend সাজালে Next.js frontend-এর সাথে clean, scalable, secure API তৈরি করা সহজ হবে।
