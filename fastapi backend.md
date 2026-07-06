# FastAPI Backend Tutorial for Next.js Frontend

এই note-টা FastAPI backend শেখার জন্য। Frontend side হিসেবে ধরা হয়েছে **Next.js App Router**।

Main goal:

```txt
Backend কেন দরকার বুঝা
Request কীভাবে backend-এর ভিতর দিয়ে যায় বুঝা
কোন component/file কেন ব্যবহার করছি বুঝা
Next.js frontend-এর জন্য clean, secure JSON API বানানো
Project বড় হলেও structure maintainable রাখা
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

> 🎯 **এই section-এ বুঝব:** Backend পর্দার পিছনে আসলে কোন কাজটা করে, আর frontend থেকে সে কেন আলাদা — এটা মন থেকে বুঝব। (এখনো code মুখস্থ করা লাগবে না, শুধু "কেন" ধরব।)

### 🍽️ আগে একটা গল্প — রেস্টুরেন্ট

ভাবো তুমি একটা রেস্টুরেন্টে ঢুকলে। সামনে ঝকঝকে **ডাইনিং হল** — সুন্দর টেবিল, মেনু কার্ড, ওয়েটার। এটা সবাই দেখে, এখানেই তুমি বসে অর্ডার দাও। এটাই **frontend (Next.js)** — user যা চোখে দেখে আর ছুঁয়ে দেখে।

কিন্তু আসল কাজটা হয় ভিতরের **রান্নাঘরে** — উপকরণ যাচাই, রান্না, প্লেট সাজানো, হিসাব রাখা। গ্রাহক রান্নাঘর দেখে না, কিন্তু রান্নাঘর ছাড়া খাবার আসবে কোথা থেকে? এটাই **backend (FastAPI)** — app-এর আসল brain। 🧠

আর ভাঁড়ারঘর/গুদাম যেখানে সব চাল-ডাল-মশলা জমা থাকে, সেটা **database**। রান্নাঘর দরকার মতো সেখান থেকে জিনিস আনে আর নতুন জিনিস রেখে দেয়।

তাই মনে রাখো: গ্রাহক যত সুন্দর মেনুই দেখুক, বিল-হিসাব-নিরাপত্তা সব হয় রান্নাঘরে — ডাইনিং হলে নয়।

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
| Response formatting | frontend যেন clean JSON পায় |
| Error handling | frontend/user যেন meaningful error পায় |

Important rule:

```txt
Frontend validation = user experience
Backend validation  = real data correctness/security
```

User browser থেকে কেউ চাইলে frontend validation bypass করতে পারে। কিন্তু backend validation bypass করা উচিত না।

কেন? কারণ ডাইনিং হলের নিয়ম (frontend) গ্রাহক নিজে ভেঙে ফেলতে পারে — কিন্তু রান্নাঘরের নিয়ম (backend) শেফের হাতে, বাইরের কেউ সেটা টপকাতে পারে না। তাই আসল নিরাপত্তা আর ডেটার শুদ্ধতা সবসময় backend-এ enforce করি।

> 🧠 **মনে রাখার ট্রিক:** Frontend = সাজানো **ডাইনিং হল** (গ্রাহক দেখে), Backend = **রান্নাঘর** (আসল কাজ)। নিরাপত্তা সবসময় রান্নাঘরে রাখো — সাজানো হলে নয়।

> ✅ **নিজেকে যাচাই করো:** Frontend-এ তো email format check করা হচ্ছে, তাহলে backend-এ আবার একই check কেন লাগবে?
> <details><summary>উত্তর দেখো</summary>
> কারণ frontend check গ্রাহকের সুবিধার জন্য (তাড়াতাড়ি ভুল ধরিয়ে দেয়), কিন্তু এটা browser-এ চলে বলে যে কেউ সেটা bypass করে সরাসরি backend-এ ভুল data পাঠাতে পারে। তাই আসল যাচাই backend-এ থাকতেই হবে — নাহলে নোংরা/বিপজ্জনক data database-এ ঢুকে যাবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-2"></a>

## 02. Request Lifecycle: Browser থেকে Database পর্যন্ত

> 🎯 **এই section-এ বুঝব:** একটা request browser থেকে বেরিয়ে database ছুঁয়ে আবার screen-এ ফিরে আসা পর্যন্ত কোন কোন স্টেশন পার হয়।

### 🧾 আগে একটা গল্প — অর্ডার স্লিপের সফর

ভাবো তুমি ওয়েটারকে বললে "এক প্লেট বিরিয়ানি"। কী কী ঘটে?

1. ওয়েটার তোমার কথা একটা **অর্ডার স্লিপে** লেখে (= HTTP request)।
2. স্লিপ রান্নাঘরের সঠিক শেফের কাছে যায় (= Router endpoint)।
3. শেফ আগে দেখে অর্ডারটা ঠিকঠাক লেখা আছে কিনা — বিরিয়ানি বানানো সম্ভব তো? (= Schema validation)।
4. তারপর রেসিপি মেনে রান্না হয় (= Service/business logic)।
5. দরকারি চাল-মাংস ভাঁড়ার থেকে আনা হয় (= Repository/Database)।
6. শেষে সাজানো প্লেট ওয়েটার তোমার টেবিলে দিয়ে আসে (= JSON Response)।

মানে **request = ভিতরে যাওয়া অর্ডার স্লিপ**, আর **response = বাইরে ফিরে আসা প্লেট**। মাঝের প্রতিটা স্টেশনের আলাদা কাজ আছে।

একটা request backend-এর ভিতরে সাধারণত এইভাবে যায়:

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
  -> LoginResponse schema safe data পাঠায়
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

ছোট project-এ সব layer আলাদা না করলেও চলে। কিন্তু বড় project-এ আলাদা রাখলে code easier to test, debug, and maintain.

কেন এই ভাগাভাগি? ছোট চায়ের দোকানে একজনই অর্ডার নেয়, রান্না করে, বিল দেয় — সমস্যা নেই। কিন্তু বড় রেস্টুরেন্টে যদি একজনই সব করে, কিছু ভুল হলে কোথায় ভুল হলো ধরা কঠিন। কাজ ভাগ করা থাকলে সমস্যা কোন স্টেশনে সেটা চট করে বোঝা যায়।

> 🧠 **মনে রাখার ট্রিক:** Request = ভিতরে যাওয়া **অর্ডার স্লিপ**, Response = বাইরে ফেরা **প্লেট**। প্রতিটা layer এক-একটা স্টেশন।

> ✅ **নিজেকে যাচাই করো:** Login request-এ password verify হওয়ার কাজটা কোন স্টেশনে (layer-এ) হয়?
> <details><summary>উত্তর দেখো</summary>
> Service/business logic layer-এ (এখানে `auth_service`)। Router শুধু request গ্রহণ করে, schema data-র shape যাচাই করে, কিন্তু "password ঠিক আছে কিনা" — এই business rule টা service-এ চলে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-3"></a>

## 03. FastAPI Building Blocks: কোন অংশ কেন

> 🎯 **এই section-এ বুঝব:** FastAPI-র বারবার আসা শব্দগুলোকে রান্নাঘরের এক-একজন কর্মীর সাথে মিলিয়ে চিনব, যাতে নাম শুনলেই কাজটা মনে পড়ে।

### 👨‍🍳 আগে একটা গল্প — রান্নাঘরের টিম

একটা রান্নাঘরে সবাই সব করে না, প্রত্যেকের আলাদা কাজ:

- **Router** = ওয়েটার — কোন অর্ডার কোন টেবিলের (কোন URL), সেটা বুঝে সঠিক জায়গায় পাঠায়।
- **Schema** = অর্ডার-যাচাই কেরানি — স্লিপ ঠিকঠাক ভরা আছে কিনা দেখে।
- **Service** = হেড শেফ — আসল রেসিপি/নিয়ম জানে।
- **Repository** = ভাঁড়ার-কিপার — গুদাম থেকে জিনিস আনা-নেওয়া করে।
- **Model** = গুদামের তাক কীভাবে সাজানো (database table-এর গঠন)।
- **Dependency** = আগে থেকে রেডি রাখা common উপকরণ (কাটা পেঁয়াজ, ফুটানো পানি) — সবাই বারবার ব্যবহার করে।

প্রত্যেকের কাজ আলাদা রাখলে রান্নাঘর গোছানো থাকে।

FastAPI শেখার সময় এই words বারবার আসবে:

| Name | কাজ | Example file |
|---|---|---|
| `FastAPI()` app | backend application create করে | `app/main.py` |
| Router | API endpoints group করে | `app/api/v1/routes/users.py` |
| Path param | URL-এর part থেকে value নেয় | `/users/{user_id}` |
| Query param | `?search=...` value নেয় | `/users?role=admin` |
| Request body | POST/PATCH data নেয় | login/register payload |
| Pydantic schema | input/output validate করে | `schemas/user.py` |
| Response model | frontend-এ safe data পাঠায় | `UserPublic` |
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

> 🧠 **মনে রাখার ট্রিক:** Router = **ওয়েটার**, Schema = **অর্ডার-যাচাই**, Service = **হেড শেফ**, Repository = **ভাঁড়ার-কিপার**, Model = **তাকের সাজানো**, Response model = **প্লেট থেকে গোপন জিনিস সরানো**।

> ✅ **নিজেকে যাচাই করো:** কোন block নিশ্চিত করে যে frontend-এ কখনো `hashed_password`-এর মতো গোপন field পৌঁছাবে না?
> <details><summary>উত্তর দেখো</summary>
> Response model। এটা প্লেট বাইরে যাওয়ার আগে গোপন/অতিরিক্ত জিনিস ছেঁকে ফেলে — শুধু নিরাপদ field-গুলো frontend-এ পাঠায়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-4"></a>

## 04. Installation এবং Local Setup

> 🎯 **এই section-এ বুঝব:** `uv` দিয়ে backend project কীভাবে সেটআপ করি, আর কেন এই একটা tool এত ঝামেলা কমিয়ে দেয়।

### 🧰 আগে একটা গল্প — অল-ইন-ওয়ান সহকারী

ভাবো নতুন রান্নাঘর খুলছ। আগে আলাদা লোক লাগত: একজন গ্যাস লাগায়, একজন উপকরণ কেনে, একজন হিসাব রাখে কোন ব্র্যান্ডের কত কেনা হলো। ঝামেলা!

`uv` হলো এমন এক **অল-ইন-ওয়ান সহকারী** যে একাই সব করে — সঠিক Python version আনে, আলাদা ঘর (virtual environment) বানায়, package আনে, আর কোন version কেনা হলো তার হিসাব (lockfile) রাখে। তাই একটাই tool শিখলেই সেটআপের বেশিরভাগ কাজ হয়ে যায়।

Modern FastAPI backend setup-এর জন্য আমরা **uv** use করবো। `uv` Python version, virtual environment, dependency, lockfile, command run - সব একসাথে manage করে।

Windows-এ uv install:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Check:

```bash
uv --version
```

New backend project:

```bash
uv init backend
cd backend
```

Python version pin:

```bash
uv python install 3.12
uv python pin 3.12
```

Main dependencies:

```bash
uv add "fastapi[standard]" uvicorn python-dotenv
```

Database/auth/upload dependencies:

```bash
uv add sqlmodel "passlib[bcrypt]" "python-jose[cryptography]" python-multipart
```

Test dependency:

```bash
uv add --dev pytest
```

Project sync:

```bash
uv sync
```

Run:

```bash
uv run uvicorn app.main:app --reload
```

Alternative FastAPI dev command:

```bash
uv run fastapi dev app/main.py
```

Project dependency files:

| File | কাজ |
|---|---|
| `pyproject.toml` | project metadata এবং dependencies |
| `uv.lock` | exact resolved dependency versions |
| `.python-version` | project Python version |
| `.venv/` | uv managed virtual environment |

Open:

```txt
Backend API: http://localhost:8000
Swagger docs: http://localhost:8000/docs
ReDoc docs:   http://localhost:8000/redoc
```

> 🧠 **মনে রাখার ট্রিক:** `uv` = রান্নাঘরের **অল-ইন-ওয়ান সহকারী**। `uv add` = জিনিস আনো, `uv run` = কাজ চালাও, `uv sync` = সবার রান্নাঘর একরকম করো।

> ✅ **নিজেকে যাচাই করো:** টিমের নতুন কেউ project ক্লোন করল। ঠিক তোমার মতো একই dependency version পেতে সে কোন command দেবে?
> <details><summary>উত্তর দেখো</summary>
> `uv sync`। এটা `uv.lock` ফাইল দেখে হুবহু একই version-গুলো বসিয়ে দেয় — তাই সবার মেশিনে environment একরকম হয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-5"></a>

## 05. First FastAPI App

> 🎯 **এই section-এ বুঝব:** প্রথম ছোট্ট FastAPI app বানিয়ে দেখব — একটা URL হিট করলে কীভাবে JSON ফেরত আসে।

### 🔑 আগে একটা গল্প — প্রথমবার রান্নাঘর খোলা

আজ রান্নাঘরের উদ্বোধন। এখনো বড় মেনু নেই, শুধু দরজায় একটা সাইনবোর্ড: কেউ উঁকি দিলে ভিতর থেকে জবাব আসে "হ্যাঁ, রান্নাঘর চালু আছে!" 🎉

আমাদের প্রথম app ঠিক তাই করে — কেউ `/` ঠিকানায় গেলে backend একটা ছোট্ট message ফেরত পাঠায়। এটাই প্রমাণ যে রান্নাঘরের আলো জ্বলছে, দরজা খোলা।

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
uv run uvicorn app.main:app --reload
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

> 🧠 **মনে রাখার ট্রিক:** প্রথম endpoint = দরজার **"চালু আছি" সাইনবোর্ড**। হিট করো, জবাব পাও — মানে রান্নাঘর বেঁচে আছে।

> ✅ **নিজেকে যাচাই করো:** এখানে ভিতরে কোনো database বা await নেই, তবু `async def` লিখলাম কেন?
> <details><summary>উত্তর দেখো</summary>
> অভ্যাস আর ভবিষ্যতের সুবিধার জন্য। পরে এই endpoint-এ database/API/file call যোগ করলে `await` লাগবে, তখন আগে থেকেই `async def` থাকলে সহজ হয়। FastAPI দুটোই সামলাতে পারে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-6"></a>

## 06. API Prefix, Versioning এবং APIRouter

> 🎯 **এই section-এ বুঝব:** URL-এ `/api/v1` prefix আর router কেন ব্যবহার করি — এতে ভবিষ্যতে কী সুবিধা হয়।

### 📖 আগে একটা গল্প — মেনুর নতুন সংস্করণ

ভাবো রেস্টুরেন্টের একটা মেনু আছে — "মেনু v1"। অনেক পুরনো গ্রাহক এই মেনু মুখস্থ। এখন তুমি নতুন কিছু বদলাতে চাও, কিন্তু হঠাৎ বদলালে পুরনো গ্রাহক ঘাবড়ে যাবে।

বুদ্ধিমানের কাজ: পুরনো "মেনু v1" রেখেই আলাদা "মেনু v2" চালু করা। যে চায় পুরনোটা দেখুক, যে চায় নতুনটা। এটাই **versioning** (`/api/v1`, `/api/v2`)।

আর **Router** হলো মেনুর আলাদা আলাদা পাতা — একটা পাতায় শুধু পানীয় (`users`), আরেকটায় শুধু বিরিয়ানি (`courses`)। সব একজায়গায় জট পাকিয়ে না রেখে গুছিয়ে রাখা।

Production-style API usually versioned হয়:

```txt
/api/v1/auth/login
/api/v1/users
/api/v1/courses
```

Why versioning:

```txt
Future-এ breaking change হলে /api/v2 করা যায়
Old frontend /api/v1 use করতে পারে
Mobile app/frontend একসাথে migrate করা সহজ হয়
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

> 🧠 **মনে রাখার ট্রিক:** `/api/v1` = **মেনুর সংস্করণ** (পুরনো গ্রাহক বাঁচাও), Router = **মেনুর আলাদা পাতা** (এক feature = এক পাতা)।

> ✅ **নিজেকে যাচাই করো:** ভবিষ্যতে API-তে এমন বড় পরিবর্তন আনতে হলো যা পুরনো frontend ভেঙে দেবে — তুমি কী করবে?
> <details><summary>উত্তর দেখো</summary>
> পুরনো `/api/v1` অক্ষত রেখে নতুন `/api/v2` বানাব। পুরনো frontend আগের মতো v1 ব্যবহার করবে, নতুন frontend ধীরে ধীরে v2-তে সরে যাবে — কেউ হঠাৎ ভেঙে পড়বে না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-7"></a>

## 07. Path, Query এবং Request Body

> 🎯 **এই section-এ বুঝব:** API-তে data তিন জায়গা থেকে আসে — কোনটা কখন ব্যবহার করব, তা গল্পে বুঝব।

### 🍽️ আগে একটা গল্প — অর্ডার দেওয়ার তিন রকম তথ্য

ওয়েটারকে অর্ডার দেওয়ার সময় তিন রকম তথ্য দাও:

- **কোন টেবিলের খাবার?** — "৫ নম্বর টেবিল"। নির্দিষ্ট একটা জিনিস চিহ্নিত করছ। এটাই **path parameter** (`/users/123`)।
- **কীভাবে চাও?** — "ঝাল কম, বড় সাইজ"। ঐচ্ছিক ছাঁকনি/পছন্দ। এটাই **query parameter** (`?role=admin&page=2`)।
- **নতুন কিছু জমা দিচ্ছ?** — একটা ভরা ফর্ম, যেমন নতুন গ্রাহকের নাম-নম্বর। এটাই **request body** (POST/PATCH data)।

মানে: **কোনটা** → path, **কেমন করে/ছাঁকনি** → query, **নতুন data জমা** → body।

API input সাধারণত তিন জায়গা থেকে আসে।

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

> 🧠 **মনে রাখার ট্রিক:** **কোন** জিনিস → path (`/users/5`), **কেমন করে/ছাঁকনি** → query (`?page=2`), **নতুন data জমা** → body (ভরা ফর্ম)।

> ✅ **নিজেকে যাচাই করো:** `GET /api/v1/users?role=admin&page=2` — এখানে `role` আর `page` কোন ধরনের parameter?
> <details><summary>উত্তর দেখো</summary>
> দুটোই query parameter (`?`-এর পরে আছে)। এগুলো ঐচ্ছিক ছাঁকনি/নিয়ন্ত্রণ — কোন নির্দিষ্ট user চিহ্নিত করছে না, বরং list-টা কীভাবে ছেঁকে দেখাব সেটা বলছে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-8"></a>

## 08. Pydantic Schema এবং Response Model

> 🎯 **এই section-এ বুঝব:** Pydantic schema কীভাবে data-র shape ঠিক রাখে আর গোপন জিনিস বাইরে যাওয়া আটকায়।

### 📝 আগে একটা গল্প — অর্ডার ফর্ম যাচাই

ভাবো রেস্টুরেন্টে ঢোকার সময় একটা **ফর্ম** ভরতে হয়: নাম, ফোন, কতজন। কেরানি দেখে নেয় — ফোন নম্বরের জায়গায় সত্যিই নম্বর আছে তো? খালি ঘর নেই তো? ভুল থাকলে ফর্ম ফেরত। এটাই **Pydantic schema** — ঢোকার data যাচাই করে।

আবার বেরোনোর সময় তোমাকে যে রসিদ দেওয়া হয়, তাতে রান্নাঘরের গোপন রেসিপি বা কর্মচারীর বেতন লেখা থাকে না — শুধু তোমার দরকারি তথ্য। এটাই **response model** — বাইরে যাওয়া data থেকে গোপন field (যেমন `hashed_password`) ছেঁকে ফেলে।

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
Sensitive/internal field schema দিয়ে hide করবো।

> 🧠 **মনে রাখার ট্রিক:** Create/Update schema = **ঢোকার ফর্ম যাচাই**, Response model = **বেরোনোর রসিদ** (গোপন কিছু নেই)। ঢোকা-বেরোনোর ফর্ম আলাদা।

> ✅ **নিজেকে যাচাই করো:** কেন `UserCreate`-এ `password` থাকে কিন্তু `UserPublic`-এ থাকে না?
> <details><summary>উত্তর দেখো</summary>
> কারণ user register করার সময় password লাগে (ঢোকার ফর্ম), কিন্তু response-এ password বা hashed_password পাঠানো ভয়ংকর নিরাপত্তা-ঝুঁকি। তাই আলাদা schema — বেরোনোর রসিদে গোপন জিনিস রাখা হয় না।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-9"></a>

## 09. Sync, Async এবং Await

> 🎯 **এই section-এ বুঝব:** `def`, `async def`, আর `await` আসলে কী, আর একসাথে অনেক request কীভাবে সামলানো যায়।

### 🍳 আগে একটা গল্প — একসাথে অনেক অর্ডার সামলানো শেফ

ভাবো এক শেফ। **Sync** শেফ একটা কাজ শেষ না করে পরেরটা ধরে না — চুলায় পানি ফুটতে দিলে সে হাঁ করে দাঁড়িয়ে ফোটা পর্যন্ত তাকিয়ে থাকে, এই সময় অন্য অর্ডার আটকে থাকে। 😴

**Async** শেফ চালাক — পানি ফুটতে দিয়ে (`await`) সে ততক্ষণে অন্য অর্ডারের সবজি কাটে। পানি ফুটে গেলে ফিরে এসে সেই কাজ শেষ করে। একজন হলেও অনেক অর্ডার সে চটপট সামলায়।

`await` মানে: "এই কাজটা সময় নেবে (পানি ফোটা/DB call), ততক্ষণ অন্য কাজ চলুক"।

FastAPI endpoint দুইভাবে লেখা যায়:

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
await     = async কাজ শেষ হওয়া পর্যন্ত অপেক্ষা
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

> 🧠 **মনে রাখার ট্রিক:** `async` শেফ পানি ফুটতে দিয়ে (`await`) অন্য অর্ডার সামলায়। `def` শেফ দাঁড়িয়ে অপেক্ষা করে। অপেক্ষার কাজ থাকলে `await`।

> ✅ **নিজেকে যাচাই করো:** একটা `async def` endpoint-এর ভিতরে যদি ভারী blocking কাজ (যেমন বড় CPU হিসাব) দাও, সমস্যা কী?
> <details><summary>উত্তর দেখো</summary>
> Async শেফ তখন সেই এক কাজেই আটকে যায়, অন্য অর্ডার সামলাতে পারে না — মানে অন্য request আটকে থেকে performance পড়ে যায়। এমন CPU-heavy কাজ background worker/queue-তে পাঠানো ভালো।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-10"></a>

## 10. Project Structure: Simple থেকে Production Style

> 🎯 **এই section-এ বুঝব:** ছোট থেকে বড় project-এ folder কীভাবে সাজাই, আর কেন শুরুতেই বেশি জটিল করা উচিত নয়।

### 🏠 আগে একটা গল্প — ছোট দোকান থেকে বড় রেস্টুরেন্ট

ছোট চায়ের দোকানে সব এক তাকে — চিনি, চা, কাপ পাশাপাশি। খুঁজতে অসুবিধা নেই, কারণ জিনিস কম। এটাই **flat/simple structure** — শেখা আর MVP-র জন্য যথেষ্ট।

কিন্তু বড় রেস্টুরেন্টে আলাদা ঘর লাগে — শুকনো ভাঁড়ার, ফ্রিজ, রান্নার জায়গা, হিসাবঘর। নাহলে হাজার জিনিসে জট পাকিয়ে যায়। এটাই **production structure** (models/, schemas/, services/...)।

ভুল হলো: ছোট দোকানে বড় রেস্টুরেন্টের ১০টা ঘর বানানো — শুধু শুধু জটিলতা। দরকার বাড়লে তবেই ঘর বাড়াও।

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
  pyproject.toml
  uv.lock
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
  pyproject.toml
  uv.lock
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
Project বড় হলে service/repository/module আলাদা করবো।

> 🧠 **মনে রাখার ট্রিক:** ছোট দোকান = **এক তাকে সব** (flat)। বড় রেস্টুরেন্ট = **আলাদা ঘর** (service/repository)। আগে দরকার, তারপর ঘর — উল্টো নয়।

> ✅ **নিজেকে যাচাই করো:** একদম নতুন শেখা/MVP project-এ কি সাথে সাথে microservice বানানো উচিত?
> <details><summary>উত্তর দেখো</summary>
> না। শুরুতে clean monolith (এক গোছানো project) যথেষ্ট। ছোট দোকানে ১০টা ঘর বানানোর মতো — শুধু জটিলতা বাড়ে। project সত্যিই বড় হলে ধীরে ধীরে layer/module আলাদা করব।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-11"></a>

## 11. Model vs Schema vs Service vs Repository

> 🎯 **এই section-এ বুঝব:** Model, Schema, Service, Repository — এই চার শব্দ কে কী কাজ করে, তা পরিষ্কার আলাদা করে চিনব।

### 🗂️ আগে একটা গল্প — কে কোন প্রশ্নের উত্তর দেয়

এই চারজনকে চেনার সহজ উপায় — প্রত্যেকে একটা আলাদা প্রশ্নের উত্তর দেয়:

- **Model**: "গুদামের তাক কীভাবে সাজানো?" (database table-এর গঠন)।
- **Schema**: "দরজা দিয়ে কোন data ঢুকবে/বেরোবে?" (API-র ফর্ম)।
- **Service**: "নিয়মটা কী?" (password hash করা, login rule)।
- **Repository**: "গুদাম থেকে জিনিস কীভাবে আনব?" (database query)।

একই `model` শব্দ দুই মানে বোঝায় বলে গুলিয়ে যায় — এই note-এ **Model = database table**, **Schema = API-র shape**। এটুকু গেঁথে নাও।

FastAPI learning-এ `model` word confusing হতে পারে। এই note-এ:

```txt
Model  = database table structure
Schema = API request/response shape
```

Responsibility:

| Layer | প্রশ্ন | Example |
|---|---|---|
| Model | database কীভাবে data রাখবে? | `User` table |
| Schema | API দিয়ে কোন data ঢুকবে/বের হবে? | `UserCreate`, `UserPublic` |
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

> 🧠 **মনে রাখার ট্রিক:** Model = **তাকের সাজানো** (DB), Schema = **দরজার ফর্ম** (API), Service = **নিয়ম/রেসিপি**, Repository = **গুদাম আনা-নেওয়া**। প্রত্যেকে এক প্রশ্নের উত্তর।

> ✅ **নিজেকে যাচাই করো:** "user by email খুঁজে বের করা" — এই কাজটা কোন layer-এর?
> <details><summary>উত্তর দেখো</summary>
> Repository। এটা সরাসরি database query — গুদাম থেকে জিনিস খুঁজে আনা। Service সেই user নিয়ে নিয়ম (যেমন password মিলছে কিনা) প্রয়োগ করে।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-12"></a>

## 12. Database Basics with SQLModel

> 🎯 **এই section-এ বুঝব:** Database কীভাবে সংযোগ করি, table বানাই, আর কেন session প্রতিবার খুলে-বন্ধ করি।

### 🏬 আগে একটা গল্প — ভাঁড়ারঘর আর তার চাবি

Database হলো রেস্টুরেন্টের **ভাঁড়ারঘর** — সব জিনিস স্থায়ীভাবে জমা থাকে, রেস্টুরেন্ট বন্ধ হলেও থাকে। **Model** ঠিক করে সেই ভাঁড়ারের তাক কীভাবে সাজানো (কোন কলামে কী থাকবে)।

আর প্রতিবার কেউ ভাঁড়ারে ঢুকতে চাইলে একটা **চাবি (session)** নেয়, কাজ শেষে চাবি ফেরত দেয় — নাহলে চাবি হারিয়ে ভাঁড়ার খোলা পড়ে থাকবে। এটাই `yield` dependency: request এলে session খোলে, কাজ শেষে বন্ধ করে দেয়। 🔑

FastAPI নিজে database force করে না। Common choices:

```txt
SQLAlchemy = professional/common ORM
SQLModel   = SQLAlchemy + Pydantic style, learning-friendly
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

> 🧠 **মনে রাখার ট্রিক:** Database = **স্থায়ী ভাঁড়ারঘর**, Model = **তাকের নকশা**, Session = **এক-বারের চাবি** (নিয়ে-কাজ-করে-ফেরত)। চাবি ফেরত না দিলে ভাঁড়ার খোলা থেকে যায়।

> ✅ **নিজেকে যাচাই করো:** `create_all` কি production-এ column যোগ/পরিবর্তন সামলাতে পারে?
> <details><summary>উত্তর দেখো</summary>
> না। `create_all` শুধু নতুন table বানায়, existing table-এর গঠন বদলায় না। Production-এ column add/change করতে **Alembic** migration ব্যবহার করতে হয়।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-13"></a>

## 13. CRUD Flow: Create, Read, Update, Delete

> 🎯 **এই section-এ বুঝব:** ভাঁড়ারে data নিয়ে চার রকম কাজ — বানানো, দেখা, বদলানো, মোছা — কীভাবে হয়।

### 📒 আগে একটা গল্প — ভাঁড়ারের খাতা

ভাঁড়ার-কিপারের একটা খাতা আছে। সে মাত্র চার রকম কাজ করে:

- নতুন জিনিস তুলে **লেখে** (Create = POST)।
- খাতা দেখে জিনিস **খোঁজে** (Read = GET)।
- পুরনো হিসাব **কাটাকুটি করে ঠিক করে** (Update = PUT/PATCH)।
- জিনিস শেষ হলে লাইন **মুছে দেয়** (Delete = DELETE)।

এই চারটাই যেকোনো app-এর data নিয়ে করা মূল কাজ — একসাথে বলে **CRUD**। বাকি সব এদেরই ওপর গড়া।

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

> 🧠 **মনে রাখার ট্রিক:** **CRUD** = ভাঁড়ার খাতার চার কাজ — **C**reate লেখা (POST), **R**ead খোঁজা (GET), **U**pdate ঠিক করা (PUT/PATCH), **D**elete মোছা (DELETE)।

> ✅ **নিজেকে যাচাই করো:** যে user খুঁজছি সে না থাকলে কী করা উচিত, আর কেন?
> <details><summary>উত্তর দেখো</summary>
> `HTTPException(status_code=404, detail="User not found")` raise করা উচিত। খাতায় জিনিস নেই মানে "পাওয়া গেল না" — frontend যেন পরিষ্কার বুঝতে পারে, তাই ৪০৪ status দিই, চুপচাপ খালি জবাব দিই না।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-14"></a>

## 14. Dependencies: Reusable Logic Inject করা

> 🎯 **এই section-এ বুঝব:** একই কাজ বারবার না লিখে কীভাবে "আগে থেকে রেডি" করে সব endpoint-এ পৌঁছে দিই।

### 🧅 আগে একটা গল্প — আগে থেকে কাটা পেঁয়াজ

ব্যস্ত রান্নাঘরে প্রতিটা অর্ডারের জন্য নতুন করে পেঁয়াজ কাটতে বসলে সময় নষ্ট। তাই শেফ সকালে একবার পেঁয়াজ কেটে, পানি ফুটিয়ে, রসুন বেটে **আগে থেকে রেডি** রাখে। যে কোনো রান্নায় হাত বাড়ালেই পাওয়া যায়।

এটাই **dependency injection**। database session, current user, role check — এমন যেসব জিনিস বহু endpoint-এ বারবার লাগে, সেগুলো একবার বানিয়ে রাখি, তারপর `Depends(...)` দিয়ে যেখানে দরকার সেখানে হাতে তুলে দিই। বারবার একই code লিখতে হয় না।

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

> 🧠 **মনে রাখার ট্রিক:** Dependency = **আগে থেকে কাটা পেঁয়াজ**। একবার রেডি করো, `Depends(...)` দিয়ে সব endpoint-এ হাতে তুলে দাও — বারবার কাটা নয়।

> ✅ **নিজেকে যাচাই করো:** `get_current_user` কেন সব protected endpoint-এ আলাদা করে না লিখে dependency বানানো হয়?
> <details><summary>উত্তর দেখো</summary>
> কারণ token decode করে user বের করার কাজটা প্রায় সব protected endpoint-এ একই। একবার dependency বানিয়ে রাখলে যেখানে দরকার শুধু `Depends(get_current_user)` লিখলেই হয় — code repeat হয় না, ভুলের সুযোগও কমে।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-15"></a>

## 15. Environment Variables এবং CORS

> 🎯 **এই section-এ বুঝব:** গোপন সেটিং (secret) কোথায় রাখি, আর দুটো আলাদা ঠিকানার (frontend/backend) মধ্যে কথা বলতে CORS কেন লাগে।

### 🔐 আগে একটা গল্প — সিন্দুকের চাবি আর দারোয়ান

রান্নাঘরের গোপন রেসিপি আর সিন্দুকের চাবি তুমি নিশ্চয়ই মেনু কার্ডে ছাপাবে না — আলাদা লকারে রাখবে। এটাই **environment variable** (`.env`): SECRET_KEY, DATABASE_URL-এর মতো গোপন জিনিস code-এ hardcode না করে আলাদা রাখি, git-এ commit করি না।

আর **CORS** হলো দারোয়ান। Frontend থাকে `localhost:3000`-এ, backend `localhost:8000`-এ — দুটো আলাদা ঠিকানা (origin)। Browser নিরাপত্তার জন্য জিজ্ঞেস করে "এই বাইরের ঠিকানাকে ঢুকতে দেব?" CORS setting দিয়ে আমরা বলে দিই কোন origin-কে বিশ্বাস করি। 🛡️

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

> 🧠 **মনে রাখার ট্রিক:** `.env` = **গোপন লকার** (secret কখনো code/git-এ নয়)। CORS = **দারোয়ান** (কোন বাইরের origin-কে ঢুকতে দেব ঠিক করে)।

> ✅ **নিজেকে যাচাই করো:** Frontend `localhost:3000` থেকে backend `localhost:8000`-এ call করছে, কিন্তু browser ব্লক করছে — সম্ভাব্য কারণ কী?
> <details><summary>উত্তর দেখো</summary>
> CORS ঠিকমতো সেট করা নেই। দুটো আলাদা origin, তাই দারোয়ান (browser) frontend origin-কে চেনে না। `allow_origins`-এ frontend-এর ঠিকানা যোগ করলে সমস্যা মিটবে।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-16"></a>

## 16. Authentication: Login, Password Hash, JWT

> 🎯 **এই section-এ বুঝব:** User কে "তুমিই কি সেই ব্যক্তি?" — এটা কীভাবে যাচাই করি, password নিরাপদে রাখি, আর token দিই।

### 🎟️ আগে একটা গল্প — হাতে সিল-মারা টিকিট

ভাবো কোনো অনুষ্ঠানে ঢুকছ। প্রথমবার গেটে পরিচয় দেখাও (email/password)। ঠিক থাকলে গেটকিপার তোমার হাতে একটা **সিল মেরে দেয়** — এই সিলটাই **JWT token**। এরপর প্রতিবার ভিতরে-বাইরে যেতে শুধু হাতের সিল দেখালেই হয়, বারবার পরিচয়পত্র লাগে না।

আর password? গেটকিপার তোমার আসল password কোথাও লিখে রাখে না — রাখলে চুরি হলে সর্বনাশ। বদলে সে password-কে এমন এক গোপন কোডে (**hash**) বদলে রাখে যেটা উল্টে আসল password বের করা যায় না। পরে মেলানোর সময় আবার hash করে মিলিয়ে দেখে। 🔒

Authentication মানে user কে সেটা verify করা।

Flow:

```txt
User email/password পাঠায়
  -> FastAPI user খুঁজে
  -> Password verify করে
  -> JWT access token তৈরি করে
  -> Frontend token/session save করে
  -> Next request-এ Authorization header পাঠায়
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

> 🧠 **মনে রাখার ট্রিক:** Login = পরিচয় দেখানো, JWT token = **হাতে সিল-মারা টিকিট** (পরে শুধু সিল দেখাও)। Password কখনো raw নয় — সবসময় **hash** করে রাখো।

> ✅ **নিজেকে যাচাই করো:** Database চুরি হয়ে গেলেও user-দের password যাতে ফাঁস না হয়, তার জন্য কী করি?
> <details><summary>উত্তর দেখো</summary>
> Raw password কখনো store করি না — শুধু তার hash রাখি। Hash উল্টে আসল password বের করা যায় না, তাই database চুরি হলেও চোর সরাসরি password পায় না।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-17"></a>

## 17. Authorization: Role এবং Permission Protection

> 🎯 **এই section-এ বুঝব:** User কে চেনা আর user কী করতে *পারবে* — এই দুটোর তফাত, আর কীভাবে access আটকাই।

### 🚪 আগে একটা গল্প — কার হাতে কোন চাবি

Hotel-এ ঢুকতে সবার পরিচয় লাগে (authentication)। কিন্তু সবাই সব ঘরে ঢুকতে পারে না — অতিথির চাবিতে শুধু তার নিজের ঘর খোলে, ম্যানেজারের চাবিতে অফিসও খোলে, মালিকের master key সব খোলে। কে কোথায় যেতে পারবে — এটাই **authorization**।

**Role** = পদবি (admin/teacher/student), **permission** = নির্দিষ্ট একটা কাজের অনুমতি (`ride:create`)। ছোট app-এ role দিয়েই চলে; বড় app-এ প্রতিটা কাজের আলাদা permission ভাগ করা সুবিধার।

মনে রেখো: **Authentication = তুমি কে?** আর **Authorization = তুমি কী করতে পারবে?**

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

> 🧠 **মনে রাখার ট্রিক:** Authenticatio**N** = তুমি কে (**N**ame)? Authoriza**T**ion = তুমি কী করতে পারবে (per**T**ission)? Role = পদবি, permission = নির্দিষ্ট চাবি।

> ✅ **নিজেকে যাচাই করো:** Frontend-এ admin ছাড়া কেউ "Delete" বাটন দেখে না — তাহলে backend-এ role check না রাখলেও চলবে কি?
> <details><summary>উত্তর দেখো</summary>
> না, চলবে না। বাটন লুকানো শুধু UX — কেউ সরাসরি backend URL-এ request পাঠিয়ে delete করার চেষ্টা করতে পারে। আসল নিরাপত্তা backend-এর role/permission check-ই দেয়।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-18"></a>

## 18. Error Handling এবং Status Code

> 🎯 **এই section-এ বুঝব:** কিছু ভুল হলে backend কীভাবে ভদ্রভাবে জানায়, আর কোন সংখ্যা (status code) কী বোঝায়।

### 🚦 আগে একটা গল্প — ওয়েটারের ভদ্র জবাব

ভাবো তুমি এমন খাবার চাইলে যা মেনুতেই নেই। ভালো ওয়েটার চুপ করে থাকে না, আবার খারাপ ব্যবহারও করে না — সে পরিষ্কার বলে "স্যরি, এটা আমাদের নেই" (404), বা "এই টেবিল আপনার জন্য সংরক্ষিত নয়" (403)। ভুলটা কী, সেটা সে বুঝিয়ে দেয়।

HTTP **status code** হলো এই ভদ্র জবাবের সংখ্যা-ভাষা: 200 = ঠিক আছে, 201 = নতুন বানানো হলো, 400 = তোমার অনুরোধে ভুল, 401 = পরিচয় দাওনি, 403 = অনুমতি নেই, 404 = জিনিস নেই, 422 = ফর্মে ভুল, 500 = রান্নাঘরে গণ্ডগোল। সঠিক সংখ্যা দিলে frontend সহজে বোঝে কী হয়েছে।

FastAPI error raise করতে `HTTPException` use করা হয়।

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

> 🧠 **মনে রাখার ট্রিক:** Status code = **ওয়েটারের ভদ্র জবাবের সংখ্যা**। **2xx** = ঠিক আছে, **4xx** = তোমার (client) ভুল, **5xx** = আমাদের (server) ভুল।

> ✅ **নিজেকে যাচাই করো:** Login-এ ভুল password দিলে কোন status code উপযুক্ত, আর কেন 404 নয়?
> <details><summary>উত্তর দেখো</summary>
> 401 (Not authenticated) — কারণ পরিচয় যাচাই ব্যর্থ হয়েছে। 404 মানে "জিনিসটাই নেই", কিন্তু এখানে user থাকতেও পারে, শুধু password মিলছে না — তাই 401 বেশি সঠিক।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-19"></a>

## 19. File Upload এবং Background Tasks

> 🎯 **এই section-এ বুঝব:** ফাইল (ছবি/PDF) কীভাবে গ্রহণ করি, আর কিছু কাজ পরে-করার জন্য কীভাবে পিছনে ফেলে রাখি।

### 📦 আগে একটা গল্প — পার্সেল আর পরে-করার কাজ

দুটো আলাদা জিনিস এখানে:

**File upload** = গ্রাহক রান্নাঘরে একটা পার্সেল (ছবি/PDF) জমা দিল। backend সেটা গ্রহণ করে, নাম-ধরন দেখে, তারপর রাখে।

**Background task** = ধরো অর্ডার শেষে গ্রাহককে একটা ধন্যবাদ-চিরকুট পাঠাতে হবে। গ্রাহককে দাঁড় করিয়ে রেখে চিরকুট লেখা বোকামি — তুমি বরং প্লেট দিয়ে দাও (response), আর চিরকুট লেখার কাজটা **পরে করার** জন্য পিছনে রেখে দাও। ছোট পরে-করা কাজে `BackgroundTasks`, ভারী কাজে Celery/RQ-র মতো queue। ⏳

File upload করতে `python-multipart` dependency দরকার। এই note-এর setup section-এ আমরা already `uv add ... python-multipart` করেছি।

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

> 🧠 **মনে রাখার ট্রিক:** File upload = **জমা পার্সেল**। Background task = **পরে-করার চিরকুট** (গ্রাহককে দাঁড় করিয়ে রেখো না)। ছোট কাজ → `BackgroundTasks`, ভারী কাজ → queue।

> ✅ **নিজেকে যাচাই করো:** Signup-এর পর welcome email পাঠানোর কাজটা কেন response-এর আগে না করে background task-এ দিই?
> <details><summary>উত্তর দেখো</summary>
> কারণ email পাঠাতে সময় লাগে; সেটা শেষ হওয়ার জন্য user-কে দাঁড় করিয়ে রাখলে response ধীর হবে। background task-এ দিলে user সাথে সাথে জবাব পায়, email-টা পিছনে পাঠানো হয়।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-20"></a>

## 20. MVP, Redis, Queue এবং Scaling Decision

> 🎯 **এই section-এ বুঝব:** সবচেয়ে কম দিয়ে কাজ চালু করা (MVP) মানে কী, আর Redis/queue কখন সত্যিই দরকার।

### 🚲 আগে একটা গল্প — আগে সাইকেল, পরে গাড়ি

একজন নতুন উদ্যোক্তা প্রথম দিনেই দামি স্পোর্টস কার কেনে না — আগে একটা সাইকেল দিয়ে হলেও গন্তব্যে পৌঁছানো শুরু করে। কাজ চললে তারপর ভালো বাহন কেনে। এটাই **MVP (Minimum Viable Product)** — সব feature নয়, কিন্তু মূল কাজটা চলে।

**Redis** হলো রান্নাঘরের হাতের কাছের **ছোট টুকরিটা** — যেখানে বারবার লাগে এমন জিনিস চটজলদি রাখা যায় (cache, OTP, rate limit)। খুব দ্রুত, কিন্তু অস্থায়ী। শুরুতেই এটা বাধ্যতামূলক নয়; সত্যিই দরকার হলে তখন যোগ করি — আগেভাগে জটিলতা টেনে আনি না।

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
PostgreSQL/SQLite + FastAPI দিয়েই শুরু করা যায়।
OTP/cache/rate limit/queue দরকার হলে Redis add করবো।

> 🧠 **মনে রাখার ট্রিক:** MVP = **আগে সাইকেল, পরে গাড়ি** (মূল কাজ আগে)। Database = **স্থায়ী ভাঁড়ার**, Redis = **হাতের কাছের দ্রুত টুকরি** (অস্থায়ী)। দরকার হলে তবেই Redis।

> ✅ **নিজেকে যাচাই করো:** একদম নতুন MVP-তে কি Redis বসানো বাধ্যতামূলক?
> <details><summary>উত্তর দেখো</summary>
> না। PostgreSQL/SQLite + FastAPI দিয়েই শুরু করা যায়। OTP, cache, rate limit বা queue-র মতো নির্দিষ্ট দরকার এলে তখন Redis যোগ করলেই চলে — আগেভাগে নয়।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-21"></a>

## 21. Next.js Frontend Connection

> 🎯 **এই section-এ বুঝব:** Next.js frontend কীভাবে FastAPI backend-এর সাথে কথা বলে, আর কী কী মিললে সংযোগ ঠিক কাজ করে।

### 📞 আগে একটা গল্প — সঠিক নম্বরে ফোন

Frontend আর backend দুই আলাদা বাড়ি। কথা বলতে হলে frontend-কে backend-এর **সঠিক ঠিকানা** জানতে হবে (`http://localhost:8000/api/v1`)। ভুল নম্বরে ফোন করলে কেউ ধরবে না!

এই ঠিকানা frontend তার `.env.local`-এ রাখে। তারপর যখন login বা data লাগে, সেই ঠিকানায় request পাঠায়। শুধু ঠিকানা ঠিক থাকলেই হবে না — দুই পক্ষের "ভাষা"ও মিলতে হবে: frontend যে shape-এ data পাঠায়, backend-এর schema-ও সেই shape চাইতে হবে; আবার backend যা ফেরত দেয়, frontend-এর type-ও সেটাই আশা করতে হবে।

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

> 🧠 **মনে রাখার ট্রিক:** সংযোগের তিন শর্ত — **সঠিক ঠিকানা** (baseURL + prefix মিলবে), **CORS দারোয়ান খোলা**, আর **একই ভাষা** (payload ↔ schema, response ↔ type)।

> ✅ **নিজেকে যাচাই করো:** সব ঠিক মনে হচ্ছে, তবু browser console-এ CORS error — কোথায় দেখব?
> <details><summary>উত্তর দেখো</summary>
> Backend-এর CORS setting-এ frontend-এর origin (`http://localhost:3000`) allow করা আছে কিনা দেখব। দারোয়ান (CORS) frontend-এর ঠিকানা না চিনলে browser request আটকে দেয়।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-22"></a>

## 22. API Docs, OpenAPI এবং Testing

> 🎯 **এই section-এ বুঝব:** FastAPI কীভাবে নিজে থেকেই সুন্দর docs বানিয়ে দেয়, আর কেন test লিখি।

### 📋 আগে একটা গল্প — নিজে থেকে সাজানো মেনু আর মহড়া

মজার ব্যাপার — FastAPI তোমার লেখা code দেখেই নিজে থেকে একটা **ইন্টারঅ্যাকটিভ মেনু** (Swagger `/docs`) বানিয়ে দেয়, যেখানে যে কেউ endpoint চেপে দেখে নিতে পারে কী চাইলে কী পাওয়া যায়। আলাদা করে মেনু লিখতে হয় না!

আর **test** হলো রেস্টুরেন্ট খোলার আগে **মহড়া** — সত্যিকারের গ্রাহক আসার আগেই নিজেরা অর্ডার দিয়ে দেখে নিই সব ঠিকঠাক আসছে কিনা। এতে আসল গ্রাহকের সামনে বিব্রত হতে হয় না।

FastAPI automatic docs দেয়।

```txt
Swagger: http://localhost:8000/docs
ReDoc:   http://localhost:8000/redoc
```

Why useful:

```txt
Endpoint test করা যায়
Request/response schema দেখা যায়
Frontend developer API বুঝতে পারে
Validation/debug easy হয়
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
uv run pytest
```

Test first:

```txt
health endpoint
login success/fail
protected route
validation error
core CRUD endpoint
```

> 🧠 **মনে রাখার ট্রিক:** `/docs` = FastAPI-র **নিজে-সাজানো মেনু** (বিনা পরিশ্রমে)। Test = **খোলার আগে মহড়া** (গ্রাহকের আগে ভুল ধরো)।

> ✅ **নিজেকে যাচাই করো:** `/docs`-এ automatic যে schema/description দেখা যায়, সেটা FastAPI কোথা থেকে পায়?
> <details><summary>উত্তর দেখো</summary>
> তোমার লেখা code থেকেই — type hint, Pydantic schema, `response_model`, router `tags` ইত্যাদি পড়ে FastAPI নিজে OpenAPI docs বানায়। তাই code পরিষ্কার লিখলে docs-ও পরিষ্কার হয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-23"></a>

## 23. Practical Domain Example: Fleet/Uber-Type Backend

> 🎯 **এই section-এ বুঝব:** এতক্ষণের সব concept একটা বাস্তব বড় app-এ (Uber-টাইপ) কীভাবে একসাথে খাটে।

### 🚕 আগে একটা গল্প — বড় রেস্টুরেন্ট চেইন

এতক্ষণ একটা রান্নাঘর শিখলাম। এবার ভাবো একটা বড় চেইন — যেখানে অনেক বিভাগ: গ্রাহক, ড্রাইভার, হিসাবঘর, সাপোর্ট, fleet ম্যানেজার। প্রত্যেকের আলাদা কাজ, আলাদা অনুমতি।

এখানে আগের শেখা সবকিছুই ফিরে আসে — role/permission, schema যাচাই, service-এ নিয়ম, repository-তে query। শুধু domain (বিভাগ) বেড়ে যায়। তাই বড় হলে feature/domain ধরে folder আলাদা করি — কিন্তু মনে রেখো, **শুরুটা সবসময় একটা গোছানো monolith দিয়েই ভালো**, প্রথম দিনেই চেইন বানাতে যাব না।

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
Domain বড় হলে feature/domain আলাদা করবো।
কিন্তু শুরুতে clean monolith রাখাই practical।

> 🧠 **মনে রাখার ট্রিক:** বড় app = **অনেক বিভাগের রেস্টুরেন্ট চেইন**, কিন্তু concept সেই একই (role, schema, service, repository)। **আগে গোছানো monolith, পরে ভাগ**।

> ✅ **নিজেকে যাচাই করো:** Uber-টাইপ app শুরু করছ। প্রথম দিনেই কি প্রতিটা domain আলাদা microservice বানাবে?
> <details><summary>উত্তর দেখো</summary>
> না। শুরুতে সব একটা clean monolith-এ রাখব, শুধু folder দিয়ে domain আলাদা করব। app সত্যিই বড় ও জটিল হলে, আর দল বড় হলে, তখন microservice-এর কথা ভাবব।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-24"></a>

## 24. Development Rules, Checklist এবং Summary

> 🎯 **এই section-এ বুঝব:** পুরো যাত্রার নিয়ম আর checklist এক জায়গায় — যেন কাজের সময় দ্রুত মিলিয়ে নিতে পারি।

### 🧑‍🍳 আগে একটা গল্প — রাঁধুনির দেয়ালে টাঙানো নিয়ম

ভালো রান্নাঘরের দেয়ালে একটা তালিকা টাঙানো থাকে — "হাত ধোও, কাঁচা-রান্না আলাদা রাখো, চুলা বন্ধ করে যাও"। রোজ সব মুখস্থ রাখতে হয় না, চোখ বুলিয়ে নিলেই হয়।

এই section সেই দেয়ালের তালিকা — এতক্ষণে শেখা সব নিয়মের সারসংক্ষেপ। নতুন feature বানানোর আগে বা শেষে একবার চোখ বুলিয়ে নিলে বড় ভুল এড়ানো যায়। এটা মুখস্থ করার জিনিস নয়, বারবার ফিরে দেখার জিনিস।

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
11. DB session dependency দিয়ে manage করবো।
12. Business logic বড় হলে service layer-এ রাখবো।
13. Database query বড় হলে repository layer add করবো।
14. Auth route এবং protected route আলাদা ভাববো।
15. Permission backend-এ enforce করবো।
16. Meaningful status code use করবো।
17. `/docs` দিয়ে endpoint manually test করবো।
18. Critical endpoint-এর test রাখবো।
19. MVP-তে clean monolith যথেষ্ট।
20. Redis/queue/microservice পরে দরকার হলে add করবো।
21. Dependency add করবো `uv add` দিয়ে।
22. Command run করবো `uv run` দিয়ে।
23. Team/project setup sync করবো `uv sync` দিয়ে।

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

> 🧠 **মনে রাখার ট্রিক:** এই checklist = **রান্নাঘরের দেয়ালে টাঙানো নিয়ম**। মুখস্থ নয় — কাজের আগে/পরে চোখ বুলিয়ে নাও।

> ✅ **নিজেকে যাচাই করো:** নতুন একটা protected endpoint বানালে, checklist থেকে অন্তত দুটো জিনিস কী মেলাবে?
> <details><summary>উত্তর দেখো</summary>
> যেমন — (১) backend-এ role/permission enforce করেছি তো? (২) response-এ sensitive data যাচ্ছে না তো (response_model আছে)? সাথে input Pydantic দিয়ে validate হচ্ছে কিনা, সঠিক status code দিচ্ছি কিনা — এগুলোও মিলিয়ে নেওয়া ভালো।</details>

এই sequence follow করলে backend tutorial একটা বইয়ের মতো পড়া যায়: আগে backend-এর role, তারপর request flow, তারপর code component, তারপর database/auth/security, শেষে frontend integration এবং scaling decision।

<!-- tutorial-nav:back -->
[Back to Index](#index)
