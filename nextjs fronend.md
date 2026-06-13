# Next.js Frontend Tutorial with FastAPI Backend

এই note-টা Next.js frontend শেখার জন্য, কিন্তু backend ধরে নেওয়া হয়েছে **FastAPI**।  
লক্ষ্য শুধু folder মুখস্থ করা না; লক্ষ্য হলো বুঝা:

```txt
কোন layer কেন আছে
কোন কাজ কোন file/folder-এ রাখা উচিত
FastAPI backend-এর সাথে clean API flow কীভাবে বানাবো
Project বড় হলে code কীভাবে maintainable থাকবে
```

Learning mindset:

```txt
প্রথমে flow বুঝবো
তারপর folder structure বুঝবো
তারপর code লিখবো
তারপর optimization/security ভাববো
```

<a id="index"></a>

## Index

<!-- tutorial-index:start -->
- [01. Big Picture: Frontend আসলে কী করে](#section-1)
- [02. Request Flow: Browser থেকে FastAPI পর্যন্ত](#section-2)
- [03. Frontend Layers: কোন component কেন ব্যবহার করছি](#section-3)
- [04. JavaScript, TypeScript এবং Async বুঝা](#section-4)
- [05. Project Setup এবং Package Selection](#section-5)
- [06. Folder Structure: Book-এর chapter-এর মতো সাজানো](#section-6)
- [07. App Router Basics: route, page, layout](#section-7)
- [08. Role-Based Routing: auth, protected, admin, student](#section-8)
- [09. Server Component vs Client Component](#section-9)
- [10. Rendering, Caching এবং Server Cost](#section-10)
- [11. Environment Variables এবং FastAPI URL](#section-11)
- [12. API Client: Axios বা Fetch কেন আলাদা রাখবো](#section-12)
- [13. Service Layer: Backend call-এর clean জায়গা](#section-13)
- [14. TypeScript Types, Zod এবং FastAPI Pydantic](#section-14)
- [15. Custom Hook Layer: UI logic আলাদা করা](#section-15)
- [16. Component Layer: UI clean রাখা](#section-16)
- [17. Page Layer: route compose করা](#section-17)
- [18. React Query vs Zustand: কোনটা কখন](#section-18)
- [19. Params এবং Query Params](#section-19)
- [20. Auth, Route Guard এবং Real Security](#section-20)
- [21. Complete Login Flow: Page থেকে FastAPI পর্যন্ত](#section-21)
- [22. Development Rules, Checklist এবং Summary](#section-22)
<!-- tutorial-index:end -->

---

<a id="section-1"></a>

## 01. Big Picture: Frontend আসলে কী করে

Frontend হলো user-এর সাথে system-এর visible connection। User button click করে, form fill করে, search করে, dashboard দেখে। এই সব visual কাজ Next.js করে।

কিন্তু important point:

```txt
Next.js frontend = UI + routing + frontend state + API request
FastAPI backend = real business logic + validation + database + auth + permission
Database        = permanent data storage
```

একটা professional app-এ frontend backend-এর replacement না। Frontend user experience smooth করে, কিন্তু security backend-এ থাকে।

Simple mental model:

```txt
User asks something
Frontend collects input
Frontend validates basic format
Frontend sends request to FastAPI
FastAPI validates again
FastAPI checks database/auth/permission
FastAPI sends clean JSON response
Frontend shows result
```

কেন Next.js ব্যবহার করবো:

| Need | Next.js কীভাবে help করে |
|---|---|
| Route/page বানানো | App Router দিয়ে folder-based routing |
| SEO/static page | Server Component এবং static rendering |
| Dashboard/app UI | Client Component, forms, state |
| Backend connect | fetch/Axios দিয়ে FastAPI call |
| Large app structure | layout, route groups, feature folders |

সবচেয়ে important rule:

```txt
Frontend সুন্দর হলেও backend validation/security ছাড়া app secure না।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-2"></a>

## 02. Request Flow: Browser থেকে FastAPI পর্যন্ত

একটা login example দিয়ে full flow:

```txt
User Browser
  -> /login page
  -> LoginForm component
  -> useLogin hook
  -> authService.login()
  -> api client/Axios
  -> FastAPI POST /api/v1/auth/login
  -> FastAPI validates email/password
  -> Database user lookup
  -> JWT token response
  -> Frontend saves token/session
  -> User dashboard এ যায়
```

এই flow বুঝলে folder structure naturally clear হয়।

Layer-by-layer কাজ:

| Layer | কাজ |
|---|---|
| `page.tsx` | route-এর screen compose করে |
| `component` | UI দেখায় |
| `hook` | loading, error, submit, redirect-এর logic রাখে |
| `service` | FastAPI endpoint call করে |
| `api client` | base URL, header, token attach করে |
| `FastAPI` | validation, auth, database, permission |

খারাপ pattern:

```txt
Page-এর ভিতরে form UI + validation + API call + token save + redirect সব লিখে ফেলা
```

ভালো pattern:

```txt
Page      = screen compose
Component = form UI
Hook      = form submit logic
Service   = API call
FastAPI   = real auth logic
```

এই separation app বড় হলে confusion কমায়।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-3"></a>

## 03. Frontend Layers: কোন component কেন ব্যবহার করছি

Next.js app-এ অনেক file/folder থাকবে। এগুলো মুখস্থ করার আগে purpose বুঝতে হবে।

Core responsibility table:

| Name | কেন ব্যবহার করছি | কোথায় রাখবো |
|---|---|---|
| Page | route/screen create করতে | `src/app/.../page.tsx` |
| Layout | common shell, sidebar, navbar reuse করতে | `src/app/.../layout.tsx` |
| UI Component | button, input, card, modal reuse করতে | `src/components/ui/` |
| Feature Component | specific feature-এর UI রাখতে | `src/features/auth/components/` |
| Service | FastAPI API call এক জায়গায় রাখতে | `src/features/*/services/` |
| Hook | frontend behavior/state logic রাখতে | `src/features/*/hooks/` |
| Store | global frontend state রাখতে | `src/store/` |
| Type | API data shape বুঝাতে | `src/features/*/types/` |
| Schema | frontend form validation করতে | `src/features/*/schemas/` |
| Constant | route path/config duplicate না করতে | `src/constants/` |
| Lib | reusable setup/helper রাখতে | `src/lib/` |

Short memory:

```txt
UI দেখায় component
Logic ধরে hook
API call করে service
Global state ধরে store
Validation করে schema
Route বানায় page
```

যে প্রশ্ন নিজেকে করবো:

```txt
এটা কি UI? -> component
এটা কি API call? -> service
এটা কি loading/error/submit logic? -> hook
এটা কি অনেক জায়গায় লাগবে? -> shared component/lib
এটা কি শুধু এক feature-এর? -> features/<name>/
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-4"></a>

## 04. JavaScript, TypeScript এবং Async বুঝা

FastAPI backend call করার আগে async বুঝা জরুরি। কারণ API response সাথে সাথে আসে না।

Synchronous:

```ts
console.log("Step 1");
console.log("Step 2");
console.log("Step 3");
```

Output:

```txt
Step 1
Step 2
Step 3
```

Asynchronous:

```ts
console.log("Step 1");

setTimeout(() => {
  console.log("Step 2");
}, 1000);

console.log("Step 3");
```

Output:

```txt
Step 1
Step 3
Step 2
```

API call async কেন:

```txt
Frontend request পাঠায়
Network লাগে
FastAPI validation করে
Database query হতে পারে
Auth/permission check হতে পারে
তারপর response আসে
```

Promise মানে future result:

```txt
pending   = কাজ চলছে
fulfilled = success
rejected  = error
```

`async/await` clean syntax:

```ts
async function getUsers() {
  const response = await fetch("http://localhost:8000/api/v1/users");
  const data = await response.json();
  return data;
}
```

Error handle:

```ts
async function loadUsers() {
  try {
    const users = await getUsers();
    return users;
  } catch (error) {
    console.error("Failed to load users", error);
    return [];
  }
}
```

Sequential vs parallel:

```ts
const user = await getUser();
const orders = await getOrders(user.id);
```

এখানে `orders` user-এর উপর depend করে। তাই sequential ঠিক।

```ts
const [users, products] = await Promise.all([
  getUsers(),
  getProducts(),
]);
```

এখানে দুই request independent। তাই parallel ভালো।

TypeScript কেন:

```txt
Backend response-এর shape আগে থেকে বুঝতে
Wrong field name ধরতে
Component props safe রাখতে
Refactor safer করতে
```

Example:

```ts
type User = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "teacher" | "student";
};
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-5"></a>

## 05. Project Setup এবং Package Selection

Create project:

```bash
npx create-next-app@latest my-frontend
cd my-frontend
```

Recommended choices:

```txt
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
src/ directory: Yes
App Router: Yes
Import alias: Yes
Alias: @/*
```

Useful packages:

```bash
npm install axios react-hook-form zod zustand lucide-react clsx tailwind-merge @tanstack/react-query
```

কোন package কেন:

| Package | কেন দরকার |
|---|---|
| `next` | App Router, rendering, page/layout |
| `react` | component-based UI |
| `typescript` | type safety |
| `tailwindcss` | fast utility-based styling |
| `axios` | common API client setup |
| `react-hook-form` | form state efficiently manage |
| `zod` | frontend validation schema |
| `zustand` | small global frontend state |
| `@tanstack/react-query` | API data cache/loading/error/refetch |
| `lucide-react` | icon |
| `clsx` | conditional className |
| `tailwind-merge` | Tailwind class conflict clean |

Run:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Important:

```txt
Package install করার আগে বুঝবো কেন দরকার।
যে package দরকার নেই, সেটা add করবো না।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-6"></a>

## 06. Folder Structure: Book-এর chapter-এর মতো সাজানো

Recommended structure:

```txt
my-frontend/
  public/
    images/
    icons/

  src/
    app/
      layout.tsx
      page.tsx
      loading.tsx
      error.tsx
      not-found.tsx

      (auth)/
        login/
          page.tsx

      (protected)/
        layout.tsx
        dashboard/
          page.tsx
        admin/
          page.tsx

    components/
      ui/
      layout/
      common/

    features/
      auth/
        components/
        hooks/
        services/
        schemas/
        types/

      users/
        components/
        hooks/
        services/
        types/

    lib/
      api.ts
      utils.ts

    store/
      authStore.ts

    constants/
      routes.ts

    types/

  .env.local
  package.json
  tsconfig.json
```

Book-like idea:

```txt
app/        = chapters/routes
features/   = each subject/topic
components/ = reusable visual pieces
lib/        = common tools
store/      = shared memory/state
constants/  = fixed names/paths
```

Feature folder example:

```txt
features/auth/
  components/LoginForm.tsx
  hooks/useLogin.ts
  services/authService.ts
  schemas/loginSchema.ts
  types/authTypes.ts
```

এই structure-এর benefit:

```txt
Auth related সব auth folder-এ
Users related সব users folder-এ
API call UI থেকে আলাদা
Logic UI থেকে আলাদা
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-7"></a>

## 07. App Router Basics: route, page, layout

Next.js App Router folder দিয়ে route বানায়।

```txt
src/app/page.tsx              -> /
src/app/login/page.tsx        -> /login
src/app/dashboard/page.tsx    -> /dashboard
src/app/users/[id]/page.tsx   -> /users/123
```

Special files:

| File | কাজ |
|---|---|
| `page.tsx` | route-এর main screen |
| `layout.tsx` | shared layout |
| `loading.tsx` | loading UI |
| `error.tsx` | error UI |
| `not-found.tsx` | 404 page |
| `route.ts` | Next.js server route/API handler |

FastAPI backend থাকলে `route.ts` কীভাবে ভাববো:

```txt
Real backend logic -> FastAPI
Next.js route.ts -> proxy, small server utility, webhook adapter, BFF pattern
```

App Router vs Pages Router:

| বিষয় | App Router | Pages Router |
|---|---|---|
| Folder | `src/app/` | `src/pages/` |
| Route file | `page.tsx` | file name route হয় |
| Layout | nested `layout.tsx` | `_app.tsx`/custom pattern |
| Loading/error | built-in file convention | manually handle |
| New project | recommended | old/legacy projects |

Confusion clear:

```txt
src/app/login/page.tsx = App Router
src/pages/login.tsx    = Pages Router
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-8"></a>

## 08. Role-Based Routing: auth, protected, admin, student

Small app:

```txt
src/app/
  login/page.tsx
  dashboard/page.tsx
```

Large role-based app:

```txt
src/app/
  (auth)/
    login/page.tsx
    register/page.tsx

  (protected)/
    layout.tsx

    admin/
      layout.tsx
      dashboard/page.tsx
      users/page.tsx

    teacher/
      layout.tsx
      courses/page.tsx

    student/
      layout.tsx
      courses/page.tsx

  unauthorized/page.tsx
```

Route group:

```txt
(auth) এবং (protected) URL-এ আসে না।
এগুলো শুধু route organize করার জন্য।
```

URL result:

```txt
(auth)/login/page.tsx                -> /login
(protected)/admin/dashboard/page.tsx -> /admin/dashboard
(protected)/student/courses/page.tsx -> /student/courses
```

কখন role-based routing দরকার:

| Situation | Structure |
|---|---|
| একটাই dashboard | `/dashboard` |
| admin/teacher/student আলাদা | `/admin`, `/teacher`, `/student` |
| protected routes অনেক | `(protected)` route group |
| login/register আলাদা shell | `(auth)` route group |

Important:

```txt
Route folder role অনুযায়ী সাজানো মানে security না।
Security FastAPI backend permission check দিয়ে হবে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-9"></a>

## 09. Server Component vs Client Component

App Router-এ component defaultভাবে Server Component।

Server Component ভালো যখন:

```txt
Static content
SEO দরকার
Initial load fast চাই
Server-side data fetch দরকার
Browser interaction নেই
```

Client Component দরকার যখন:

```txt
useState
useEffect
button click
form input
modal/sidebar open-close
localStorage/sessionStorage
browser API
React Query hook
Zustand hook
```

Client Component লিখতে file-এর শুরুতে:

```tsx
"use client";
```

Example:

```tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

Decision rule:

```txt
শুধু data/read-only page -> Server Component
User interaction আছে -> Client Component
Form submit আছে -> Client Component
Server থেকে initial data আনতে হবে -> Server Component useful
```

Common mistake:

```txt
সব file-এ blindly "use client" দেওয়া।
```

এতে bundle size বাড়ে, performance কমতে পারে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-10"></a>

## 10. Rendering, Caching এবং Server Cost

Server Component মানেই বেশি server cost না। Cost depend করে data fetching strategy-এর উপর।

Rendering choices:

| Situation | ভালো choice |
|---|---|
| About, Contact, public static page | Static Server Component |
| Public list, blog, products | Server Component + `revalidate` |
| Private dashboard/profile | dynamic fetch, `no-store`, auth |
| Search/filter/pagination | Client Component + React Query |
| Form/modal/sidebar | Client Component |

Static page:

```tsx
export default function AboutPage() {
  return <h1>About Us</h1>;
}
```

Cached public data:

```tsx
export default async function ProductsPage() {
  const res = await fetch(`${process.env.API_BASE_URL}/products`, {
    next: { revalidate: 60 },
  });

  const products = await res.json();

  return <pre>{JSON.stringify(products, null, 2)}</pre>;
}
```

Private data:

```tsx
export default async function DashboardPage() {
  const res = await fetch(`${process.env.API_BASE_URL}/me/dashboard`, {
    cache: "no-store",
  });

  const data = await res.json();
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

Rules:

```txt
Public data হলে cache/revalidate ভাববো
Private user data হলে no-store/auth ভাববো
React Query use করলে staleTime দিবো
সব fetch no-store করলে backend call বেশি হবে
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-11"></a>

## 11. Environment Variables এবং FastAPI URL

Local full-stack setup:

```txt
Next.js frontend -> http://localhost:3000
FastAPI backend  -> http://localhost:8000
API prefix       -> /api/v1
```

`.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
API_BASE_URL=http://localhost:8000/api/v1
```

Difference:

| Variable | কোথায় use |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | browser/client component থেকে accessible |
| `API_BASE_URL` | server-side code/server component-এ use |

FastAPI CORS idea:

```txt
Browser http://localhost:3000 থেকে http://localhost:8000 call করলে CORS লাগে।
FastAPI backend-এ frontend origin allow করতে হবে।
```

FastAPI example:

```py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Important:

```txt
Frontend env URL ভুল হলে API call fail করবে।
Backend CORS ভুল হলে browser request block করবে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-12"></a>

## 12. API Client: Axios বা Fetch কেন আলাদা রাখবো

API client আলাদা রাখলে common setup এক জায়গায় থাকে।

কেন দরকার:

```txt
baseURL এক জায়গায়
Authorization token এক জায়গায়
withCredentials এক জায়গায়
error interceptor এক জায়গায়
service files clean থাকে
```

File:

```txt
src/lib/api.ts
```

Axios setup:

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

HTTP-only cookie auth হলে:

```ts
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});
```

Fetch wrapper চাইলে:

```ts
export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${process.env.API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error("API request failed");
  }

  return res.json();
}
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-13"></a>

## 13. Service Layer: Backend call-এর clean জায়গা

Service layer-এর কাজ একটাই: FastAPI endpoint call করা।

File:

```txt
src/features/auth/services/authService.ts
```

```ts
import { api } from "@/lib/api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: "bearer";
  user: {
    id: number;
    email: string;
    name?: string;
    role: "admin" | "teacher" | "student";
  };
};

export async function loginUser(payload: LoginPayload) {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
}
```

URL combine:

```txt
baseURL      = http://localhost:8000/api/v1
service path = /auth/login
final URL    = http://localhost:8000/api/v1/auth/login
```

Service layer-এ কী থাকবে:

```txt
API endpoint path
request payload type
response type
request method: GET/POST/PATCH/DELETE
```

Service layer-এ কী থাকবে না:

```txt
button click logic
form input state
UI rendering
toast/modal/sidebar state
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-14"></a>

## 14. TypeScript Types, Zod এবং FastAPI Pydantic

Validation তিন জায়গায় ভাবতে হবে:

| Layer | Tool | Purpose |
|---|---|---|
| Frontend form | Zod | user-friendly error |
| Frontend code | TypeScript | developer safety |
| Backend API | Pydantic | real validation/security |

Zod schema:

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password minimum 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

FastAPI Pydantic schema:

```py
from pydantic import BaseModel, EmailStr

class LoginPayload(BaseModel):
    email: EmailStr
    password: str
```

Important:

```txt
Zod bypass করা যায়, কারণ browser user control করে।
Pydantic bypass করা যায় না, কারণ backend final gatekeeper।
```

Type naming:

```txt
LoginPayload  = frontend/backend request body
LoginResponse = backend response shape
User          = common data shape
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-15"></a>

## 15. Custom Hook Layer: UI logic আলাদা করা

Hook component থেকে behavior logic আলাদা করে।

Hook-এ রাখা যায়:

```txt
loading state
error state
submit function
service call
token save/remove
redirect trigger
toast message trigger
```

File:

```txt
src/features/auth/hooks/useLogin.ts
```

```ts
"use client";

import { useState } from "react";
import { loginUser } from "../services/authService";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);

      const data = await loginUser({ email, password });
      localStorage.setItem("accessToken", data.access_token);

      return data;
    } catch {
      setError("Login failed");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error };
}
```

কেন hook দরকার:

```txt
LoginForm UI clean থাকে
same login logic অন্য component-এ reuse করা যায়
loading/error centralized থাকে
test/debug সহজ হয়
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-16"></a>

## 16. Component Layer: UI clean রাখা

Component-এর কাজ UI দেখানো এবং user event capture করা।

File:

```txt
src/features/auth/components/LoginForm.tsx
```

```tsx
"use client";

import { useState } from "react";
import { useLogin } from "../hooks/useLogin";

export function LoginForm() {
  const { login, loading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(email, password);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      {error ? <p>{error}</p> : null}

      <button disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

Component-এ direct API call না রাখার কারণ:

```txt
UI messy হয়
reuse কঠিন হয়
test কঠিন হয়
error/loading logic duplicate হয়
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-17"></a>

## 17. Page Layer: route compose করা

Page route তৈরি করে, কিন্তু সব logic নিজের ভিতরে রাখে না।

File:

```txt
src/app/(auth)/login/page.tsx
```

```tsx
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main>
      <h1>Login</h1>
      <LoginForm />
    </main>
  );
}
```

Page-এর কাজ:

```txt
route screen compose করা
page metadata/SEO set করা
server-side data fetch করা যদি দরকার হয়
feature component বসানো
```

Page-এর কাজ না:

```txt
সব API call hardcode করা
সব form state রাখা
সব business logic রাখা
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-18"></a>

## 18. React Query vs Zustand: কোনটা কখন

React Query এবং Zustand এক জিনিস না।

```txt
React Query = server/API data manage করে
Zustand     = frontend/global UI state manage করে
```

React Query use করবো:

```txt
FastAPI থেকে list আনতে
loading/error state দরকার হলে
cache দরকার হলে
refetch দরকার হলে
pagination/search/filter থাকলে
```

Example:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function UsersList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/users");
      return response.data;
    },
    staleTime: 60 * 1000,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load users</p>;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

Zustand use করবো:

```txt
auth user/token
sidebar open/close
theme
cart
temporary global UI state
```

Example:

```ts
import { create } from "zustand";

type AuthState = {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
  logout: () => set({ token: null }),
}));
```

Decision:

```txt
Data backend থেকে আসে? -> React Query
Data শুধু frontend UI state? -> Zustand
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-19"></a>

## 19. Params এবং Query Params

URL থেকে data দুইভাবে আসে।

Route param:

```txt
/users/123
```

`123` specific user identify করে।

App Router folder:

```txt
src/app/users/[id]/page.tsx
```

Example:

```tsx
type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <div>User ID: {id}</div>;
}
```

Query params:

```txt
/products?search=phone&page=2&sort=price
```

Use cases:

```txt
search
filter
sort
pagination
view mode
```

Server Component:

```tsx
type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const query = await searchParams;
  const search = query.search ?? "";
  const page = Number(query.page ?? "1");

  return <div>{search} - page {page}</div>;
}
```

Rule:

```txt
যেটা resource identify করে -> route param
যেটা filter/search/sort করে -> query param
```

FastAPI final URL:

```txt
GET http://localhost:8000/api/v1/products?search=phone&page=2
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-20"></a>

## 20. Auth, Route Guard এবং Real Security

দুইটা word আলাদা:

```txt
Authentication = user কে সেটা verify করা
Authorization  = user কী access করতে পারবে
```

Protection তিন layer:

| Layer | কাজ |
|---|---|
| UI/menu | unavailable menu hide করা |
| Next.js route guard | redirect/UX protect করা |
| FastAPI backend | real token/role/permission check |

Important:

```txt
Frontend route guard security না, UX.
Real security FastAPI backend-এ enforce করতে হবে।
```

Next.js guard idea:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;

  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/student");

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};
```

FastAPI backend must still check:

```py
from fastapi import Depends, HTTPException

def require_role(required_role: str):
    def checker(current_user = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return current_user

    return checker
```

Best rule:

```txt
Next.js guard -> redirect/user experience
FastAPI guard -> permission/security
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-21"></a>

## 21. Complete Login Flow: Page থেকে FastAPI পর্যন্ত

Full file flow:

```txt
src/app/(auth)/login/page.tsx
  -> src/features/auth/components/LoginForm.tsx
  -> src/features/auth/hooks/useLogin.ts
  -> src/features/auth/services/authService.ts
  -> src/lib/api.ts
  -> FastAPI POST /api/v1/auth/login
```

FastAPI response:

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

Frontend after login:

```txt
token save/session set
user state update
redirect to dashboard
next request Authorization header সহ যাবে
```

Layer responsibility:

| Layer | Responsibility |
|---|---|
| Page | login route show |
| Form component | email/password input |
| Hook | submit/loading/error/token save |
| Service | POST `/auth/login` |
| API client | baseURL/header |
| FastAPI | validate, verify password, create JWT |

যদি HTTP-only cookie auth use করা হয়:

```txt
Frontend token localStorage-এ রাখবে না
FastAPI response cookie set করবে
Axios/fetch withCredentials use করবে
CORS allow_credentials=True লাগবে
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-22"></a>

## 22. Development Rules, Checklist এবং Summary

Rules:

1. Component-এর ভিতরে direct API call লিখবো না।
2. API call `services/` folder-এ রাখবো।
3. Loading/error/submit logic `hooks/` folder-এ রাখবো।
4. Feature-specific code `features/<feature>/` folder-এ রাখবো।
5. Reusable UI `components/ui/` folder-এ রাখবো।
6. `"use client"` শুধু দরকার হলে দেবো।
7. Server Component দিয়ে শুরু করবো, interaction দরকার হলে Client Component করবো।
8. Public data হলে cache/revalidate ভাববো।
9. Private data হলে auth + `no-store` অথবা React Query ভাববো।
10. FastAPI response-এর TypeScript type লিখবো।
11. Zod frontend validation দিবো, কিন্তু backend Pydantic validation বাদ দেবো না।
12. React Query backend/API data-এর জন্য।
13. Zustand frontend global state-এর জন্য।
14. Route param resource identify করবে।
15. Query param search/filter/sort/pagination control করবে।
16. Next.js route guard UX, FastAPI permission real security।
17. Auth strategy আগে decide করবো: localStorage token না HTTP-only cookie।
18. API base URL `.env.local`-এ রাখবো।
19. FastAPI CORS origin ঠিক রাখবো।
20. Project বড় হলে role-based route group ব্যবহার করবো।

Final memory:

```txt
app/          -> route/page/layout
components/   -> reusable UI
features/     -> feature-wise code
services/     -> FastAPI API call
hooks/        -> frontend behavior logic
schemas/      -> frontend validation
types/        -> data shape
lib/api       -> common API setup
store/        -> global frontend state
FastAPI       -> real backend validation/security
```

Official references:

- Next.js App Router: https://nextjs.org/docs/app
- Next.js Dynamic Routes: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes
- Next.js Search Params: https://nextjs.org/docs/app/api-reference/functions/use-search-params
- Next.js Auth Guide: https://nextjs.org/docs/app/guides/authentication
- TanStack Query: https://tanstack.com/query/latest
- Zustand: https://zustand.docs.pmnd.rs/
- Zod: https://zod.dev/

এই sequence follow করলে frontend note একটা বইয়ের মতো পড়া যায়: আগে concept, তারপর structure, তারপর data flow, তারপর auth/security, শেষে rules।

<!-- tutorial-nav:back -->
[Back to Index](#index)
