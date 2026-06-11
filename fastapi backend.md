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

## 6. FastAPI Scaffold Types

FastAPI scaffold মানে হলো:

```txt
Project folder structure
Code organization pattern
কোন logic কোন file/folder-এ থাকবে
```

Project ছোট না বড়, feature কত complex, team কয়জন, future scaling লাগবে কিনা — এগুলোর উপর scaffold depend করে।

### 6.1 Simple / Flat Scaffold

ছোট project, demo, learning, quick MVP test-এর জন্য।

```txt
app/
  main.py
  database.py
  models.py
  schemas.py
  crud.py
  auth.py
```

Use করবো যখন:

```txt
ছোট API
১-৫টা table
একজন developer
দ্রুত prototype
```

Problem:

```txt
Project বড় হলে models.py, schemas.py, crud.py অনেক বড় হয়ে যায়।
```

---

### 6.2 Router-Based Scaffold

এটা FastAPI-এর common clean starting structure। Feature অনুযায়ী route আলাদা থাকে।

```txt
app/
  main.py
  core/
    config.py
    security.py
  db/
    database.py
  models/
    user.py
    ride.py
    driver.py
  schemas/
    user.py
    ride.py
    driver.py
  routers/
    auth.py
    users.py
    rides.py
    drivers.py
  services/
    auth_service.py
    ride_service.py
```

Use করবো যখন:

```txt
MVP backend
Medium-size app
API route বেশি হচ্ছে
Team-based development শুরু হচ্ছে
```

---

### 6.3 Feature-Based / Modular Scaffold

এখানে প্রতিটি feature/module নিজের ভিতরে router, schema, model, service রাখে।

```txt
app/
  main.py
  core/
    config.py
    security.py
  db/
    database.py
  modules/
    auth/
      router.py
      schemas.py
      service.py
    users/
      router.py
      models.py
      schemas.py
      service.py
    drivers/
      router.py
      models.py
      schemas.py
      service.py
    rides/
      router.py
      models.py
      schemas.py
      service.py
    payments/
      router.py
      models.py
      schemas.py
      service.py
```

Use করবো যখন:

```txt
Project বড় হবে
Feature অনেক
Multiple developer কাজ করবে
Long-term maintain করতে হবে
```

LMS, marketplace, SaaS, Uber-type app-এর জন্য এই pattern useful।

---

### 6.4 Layered Architecture Scaffold

এখানে code layer অনুযায়ী ভাগ হয়: API layer, service layer, repository layer, model layer।

```txt
app/
  main.py
  api/
    v1/
      routes/
        auth.py
        users.py
        rides.py
  core/
    config.py
    security.py
  db/
    session.py
    base.py
  models/
    user.py
    ride.py
  schemas/
    user.py
    ride.py
  services/
    user_service.py
    ride_service.py
  repositories/
    user_repository.py
    ride_repository.py
```

Layer meaning:

```txt
router      = request receive করে
schema      = input/output validation করে
service     = business logic handle করে
repository  = database query handle করে
model       = database table structure
```

Professional backend-এর জন্য এটা খুব useful, কারণ code test করা সহজ হয়।

---

### 6.5 Clean Architecture Scaffold

আরও advanced structure। Business logic framework/database থেকে আলাদা রাখে।

```txt
app/
  main.py
  domain/
    entities/
      user.py
      ride.py
  application/
    use_cases/
      create_ride.py
      assign_driver.py
  infrastructure/
    database/
      models.py
      repositories.py
  presentation/
    api/
      routes/
        rides.py
        users.py
```

Use করবো যখন:

```txt
Very large project
Enterprise backend
Business logic খুব complex
Long-term scaling দরকার
```

Learning/MVP-এর জন্য সাধারণত এটা overkill।

---

### 6.6 Microservice-Style Scaffold

Backend একাধিক service-এ ভাগ করলে microservice-style হয়।

```txt
services/
  auth-service/
    app/
      main.py
  ride-service/
    app/
      main.py
  payment-service/
    app/
      main.py
  notification-service/
    app/
      main.py
```

Use করবো যখন:

```txt
অনেক user
অনেক team
প্রতিটি service আলাদা deploy করতে হবে
High scaling দরকার
```

শুরুতে এটা দরকার নেই। MVP-তে monolith backend রাখাই ভালো।

---

## 7. Scaffold Decision Guide

কোন scaffold বেছে নিবো:

| Situation | Best scaffold |
|---|---|
| শেখা/demo | Simple / Flat |
| ছোট MVP | Router-based |
| Medium app | Router-based + Services |
| Complex business logic | Layered Architecture |
| অনেক feature/team | Feature-based / Modular |
| Enterprise/highly complex | Clean Architecture |
| Huge scale/many deployable services | Microservices |

আমার practical default:

```txt
FastAPI Monolith Backend
Router-based + Layered Architecture
PostgreSQL
SQLAlchemy বা SQLModel
Alembic migration
Pydantic schemas
JWT Auth
RBAC/Permission layer
Redis optional
Celery optional
```

Important:

```txt
শুরুতেই microservice বানাবো না।
প্রথমে clean monolith বানাবো।
Project বড় হলে module/service/repository আলাদা করবো।
```

---

## 8. Model vs Schema Vocabulary

FastAPI learning-এ **model** word একটু confusing, কারণ দুইভাবে use হয়:

```txt
Database Model       = database table structure
Pydantic Model/Schema = API request/response validation
```

এই note-এ আমি সহজ করার জন্য বলবো:

```txt
Model  = database table-এর জন্য
Schema = API data-এর জন্য
```

Database model example:

```py
from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String, unique=True, nullable=False)
    vehicle_type = Column(String, nullable=False)
    status = Column(String, default="available")
    is_active = Column(Boolean, default=True)
```

এখানে:

```txt
Vehicle class     = vehicles table-এর Python version
__tablename__     = database table name
id                = table column
vehicle_number    = table column
nullable=False    = required column
unique=True       = duplicate allowed না
default=True      = default value
```

Schema example:

```py
from pydantic import BaseModel

class VehicleCreate(BaseModel):
    vehicle_number: str
    vehicle_type: str

class VehicleUpdate(BaseModel):
    vehicle_number: str | None = None
    vehicle_type: str | None = None
    status: str | None = None
    is_active: bool | None = None

class VehicleResponse(BaseModel):
    id: int
    vehicle_number: str
    vehicle_type: str
    status: str
    is_active: bool

    class Config:
        from_attributes = True
```

Schema type:

```txt
VehicleCreate   = frontend থেকে create করার সময় যা আসবে
VehicleUpdate   = update করার সময় optional data
VehicleResponse = backend frontend-এ যা পাঠাবে
```

Model vs schema:

| বিষয় | Model | Schema |
|---|---|---|
| কাজ | Database table define করে | API data validate/format করে |
| Folder | `models/` | `schemas/` |
| Example | `Vehicle` | `VehicleCreate`, `VehicleResponse` |
| Sensitive field | থাকতে পারে | response-এ hide করা যায় |
| Frontend direct use | না | হ্যাঁ, request/response shape হিসেবে |

Example:

```txt
User model:
id
name
email
hashed_password
role
is_active
created_at
updated_at

UserResponse schema:
id
name
email
role
is_active
```

`hashed_password` database model-এ থাকবে, কিন্তু API response schema-তে যাবে না।

Final memory:

```txt
models/  → database কীভাবে data রাখবে
schemas/ → API দিয়ে কোন data ঢুকবে/বের হবে
routes/  → URL endpoint
services/ → business logic
repositories/ → database query
```

---

## 9. Transport/Fleet/Uber-Type Scaffold Example

Transport, fleet, Uber-type, LMS, SaaS-এর মতো বড় app-এ role, permission, payment, trip/booking, profile — অনেক domain থাকে।

Example roles:

```txt
customer
driver
admin
super_admin
support
accounts
fleet_manager
```

Recommended scaffold:

```txt
backend/
  app/
    main.py

    core/
      config.py
      security.py
      permissions.py
      dependencies.py

    db/
      session.py
      base.py

    api/
      v1/
        routes/
          auth.py
          users.py
          customers.py
          drivers.py
          rides.py
          vehicles.py
          payments.py
          admin.py
          support.py

    models/
      user.py
      role.py
      permission.py
      customer_profile.py
      driver_profile.py
      ride.py
      vehicle.py
      payment.py

    schemas/
      auth.py
      user.py
      role.py
      customer.py
      driver.py
      ride.py
      vehicle.py
      payment.py

    services/
      auth_service.py
      user_service.py
      role_service.py
      ride_service.py
      driver_service.py
      payment_service.py

    repositories/
      user_repository.py
      role_repository.py
      ride_repository.py
      driver_repository.py
      payment_repository.py

    utils/
      otp.py
      fare.py
      location.py

  migrations/
  tests/
  requirements.txt
  .env
```

Fleet/Transport app model examples:

```txt
models/user.py               → users table
models/role.py               → roles table
models/permission.py         → permissions table
models/driver.py             → drivers table
models/vehicle.py            → vehicles table
models/trip.py               → trips table
models/trip_schedule.py      → trip_schedules table
models/fuel_log.py           → fuel_logs table
models/maintenance_log.py    → maintenance_logs table
models/driver_attendance.py  → driver_attendance table
```

Fleet Manager role:

```txt
Fleet Manager = vehicle + driver operation manager
```

এই role করতে পারে:

- Vehicle add/edit
- Driver assign
- Trip approve/assign
- Fuel log add/view
- Maintenance record manage
- Driver attendance view
- Reports view

Request flow:

```txt
Frontend
  ↓
api/v1/routes/vehicles.py
  ↓
schemas/vehicle.py দিয়ে request validate
  ↓
services/vehicle_service.py দিয়ে business logic
  ↓
repositories/vehicle_repository.py দিয়ে database query
  ↓
models/vehicle.py দিয়ে DB table read/write
  ↓
schemas/vehicle.py দিয়ে response format
  ↓
Frontend
```

Example:

```txt
Frontend sends:
{
  "vehicle_number": "Dhaka Metro Ga 1234",
  "vehicle_type": "Microbus"
}

schemas/vehicle.py → VehicleCreate
models/vehicle.py  → Vehicle table
schemas/vehicle.py → VehicleResponse
```

---

## 10. MVP, Advanced Features, and Redis

MVP = **Minimum Viable Product**.

মানে:

```txt
সবকিছু না, কিন্তু main কাজটা চলবে।
```

Uber-type MVP:

```txt
User login
Ride request
Driver assign
Trip start/end
Fare calculate
Basic admin panel
```

Advanced features পরে add করা যায়:

```txt
Live tracking
Online payment
Promo code
Rating
Chat
Notification
Analytics
Auto scaling
```

Redis কী:

```txt
Database = permanent storage
Redis    = very fast temporary storage/cache
```

Redis use cases:

- Cache
- Session/token storage
- OTP temporary storage
- Rate limiting
- Queue/background jobs
- Real-time status
- Driver online/offline state
- Ride request timeout
- Token blacklist

FastAPI + Redis ecosystem:

```txt
redis-py
Celery + Redis
RQ + Redis
```

Decision:

```txt
Small MVP শুরুতে Redis বাধ্যতামূলক না।
PostgreSQL + FastAPI দিয়েই শুরু করা যায়।
OTP, queue, rate limit, live status দরকার হলে Redis add করা ভালো।
```

---

## 11. First FastAPI App

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

## 12. API Prefix and Versioning

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

## 13. APIRouter

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

## 14. Path Parameters

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

## 15. Query Parameters

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

## 16. Request Body

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

## 17. Pydantic Schemas

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

## 18. Response Model

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

## 19. Synchronous and Asynchronous in FastAPI

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

## 20. CORS for Next.js Frontend

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

## 21. Environment Variables

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

## 22. Database Basics with SQLModel

FastAPI যেকোনো database use করতে পারে। Learning project-এর জন্য SQLite easy।

FastAPI নিজে database ORM force করে না। Common choice:

```txt
SQLAlchemy = সবচেয়ে common/professional ORM
SQLModel   = SQLAlchemy + Pydantic style, learning-friendly
```

অনেক tutorial-এ `Base`, `Column`, `Integer`, `String` দেখা যায়। সেটা SQLAlchemy style।  
এই section-এ SQLModel দেখানো হয়েছে, কারণ learning project-এর জন্য syntax সহজ।

Concept একই:

```txt
Model class = database table
Class field = table column
Session     = database connection/work unit
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

`yield` dependency meaning:

```txt
Request শুরু হলে DB session create হবে
Endpoint কাজ করবে
Request শেষ হলে session close হবে
```

---

## 23. Database Models

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

## 24. CRUD Example

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

## 25. Dependencies

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

## 26. Authentication

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

## 27. Authorization and Role Protection

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

Simple role check:

```txt
if user.role != "admin":
    block
```

বড় app-এ শুধু role না, permission-based RBAC ভালো:

```txt
roles
- admin
- driver
- customer
- support

permissions
- ride:create
- ride:view_own
- ride:view_all
- ride:assign_driver
- driver:approve
- driver:suspend
- payment:view
- payment:refund
- user:manage
```

Database table idea:

```txt
users
- id
- name
- email
- password_hash
- role_id

roles
- id
- name

permissions
- id
- code
- description

role_permissions
- role_id
- permission_id
```

Permission dependency idea:

```py
from fastapi import Depends, HTTPException, status

def get_current_user():
    # JWT token verify করে user return করবে
    pass

def require_permission(permission_code: str):
    def checker(current_user = Depends(get_current_user)):
        user_permissions = current_user.permissions

        if permission_code not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permission",
            )

        return current_user

    return checker
```

Route protection example:

```py
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/rides", tags=["rides"])

@router.get("/all")
async def get_all_rides(
    user = Depends(require_permission("ride:view_all")),
):
    return {"message": "All rides"}
```

Role-based request flow:

```txt
Login
  ↓
JWT token-এর মধ্যে user_id থাকবে
  ↓
API request-এ token যাবে
  ↓
get_current_user token verify করবে
  ↓
Database থেকে user + role + permissions আনবে
  ↓
require_permission check করবে
  ↓
Allowed হলে service execute করবে
```

Frontend vs backend:

```txt
Next.js route guard = UX / redirect
FastAPI role check  = real security
```

---

## 28. Error Handling

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

## 29. File Upload

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

## 30. Background Tasks

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

## 31. Next.js Frontend Connection

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

## 32. API Docs and OpenAPI

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

## 33. Testing

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

## 34. Development Rules

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
19. Learning/demo project হলে flat scaffold enough।
20. MVP/medium project হলে router-based + service layer ভালো।
21. Complex project হলে repository layer add করবো।
22. Very large project ছাড়া microservice শুরু করবো না।
23. `models/` database table structure রাখবে।
24. `schemas/` API request/response shape রাখবে।
25. Role-based app হলে `roles`, `permissions`, `role_permissions` design করবো।
26. FastAPI permission check backend security হিসেবে রাখবো।
27. Redis শুরুতেই না, দরকার হলে cache/OTP/rate limit/queue-এর জন্য add করবো।
28. Fleet/Uber-type app হলে driver, vehicle, ride, payment, role, permission আলাদা domain হিসেবে ভাববো।

---

## 35. Simple Auth Flow

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

## 36. Common Commands

| Command | কাজ |
|---|---|
| `py -m venv .venv` | Virtual environment create। |
| `.venv\Scripts\activate` | Windows venv activate। |
| `python -m pip install -r requirements.txt` | Packages install। |
| `uvicorn app.main:app --reload` | Development server run। |
| `fastapi dev app/main.py` | FastAPI dev server run। |
| `pytest` | Tests run। |

---

## 37. Use Cases

এই backend scaffold ব্যবহার করা যাবে:

- Authentication API
- Role-based dashboard backend
- Admin panel API
- LMS backend
- SaaS backend
- AI app backend
- File upload API
- Next.js frontend-connected API
- Transport/Fleet management backend
- Uber-type ride backend MVP

---

## 38. Official Docs References

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
- ChatGPT share note 1: https://chatgpt.com/share/6a2a949f-d05c-83ec-af21-ffdfa8223f86
- ChatGPT share note 2: https://chatgpt.com/share/6a2a94bf-45f8-83ec-817c-4691035c9b8b

---

## 39. Final Summary

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
repositories/ → database query layer
permissions/  → RBAC permission rules
utils/         → small helpers like OTP, fare, location
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
MVP-তে clean monolith যথেষ্ট
Redis/queue/microservice পরে দরকার হলে add করবো
```

এভাবে backend সাজালে Next.js frontend-এর সাথে clean, scalable, secure API তৈরি করা সহজ হবে।
