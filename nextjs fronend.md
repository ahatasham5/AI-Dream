# Next.js Frontend Notes with FastAPI Backend

<a id="index"></a>

## Index

<!-- tutorial-index:start -->
- [1. Big Picture](#section-1)
- [2. Tools and Packages](#section-2)
- [3. Installation](#section-3)
- [4. Recommended Folder Structure](#section-4)
- [5. App Router Basics](#section-5)
- [6. App Router vs Pages Router](#section-6)
- [7. Role-Based App Router Scaffold](#section-7)
- [8. Route Guard and Route Protection](#section-8)
- [9. Params and Query Params](#section-9)
- [10. Synchronous and Asynchronous JavaScript](#section-10)
  - [10.1 Synchronous Example](#section-11)
  - [10.2 Asynchronous Example](#section-12)
  - [10.3 Promise কী](#section-13)
  - [10.4 async/await কী](#section-14)
  - [10.5 FastAPI API Call Async কেন](#section-15)
  - [10.6 try/catch/finally](#section-16)
  - [10.7 Sequential vs Parallel Async](#section-17)
  - [10.8 Server Component-এ Async](#section-18)
  - [10.9 Client Component-এ Async](#section-19)
  - [10.10 React Query Async](#section-20)
  - [10.11 Common Mistakes](#section-21)
- [11. Server Component vs Client Component](#section-22)
- [12. Rendering and Server Cost](#section-23)
- [13. Environment Variables](#section-24)
- [14. FastAPI Backend Connection](#section-25)
- [15. Axios Setup](#section-26)
- [16. Service Layer](#section-27)
- [17. Custom Hook](#section-28)
- [18. Component](#section-29)
- [19. Page](#section-30)
- [20. React Query](#section-31)
- [21. Zustand](#section-32)
- [22. Zod](#section-33)
- [23. Route Constants](#section-34)
- [24. Development Rules](#section-35)
- [25. Simple Login Flow](#section-36)
- [26. Common Scripts](#section-37)
- [27. Use Cases](#section-38)
- [28. Official Docs References](#section-39)
- [29. Final Summary](#section-40)
<!-- tutorial-index:end -->

---


এই note-টা আমার Next.js frontend শেখার জন্য।  
আমার backend focus হলো **FastAPI**।

Main goal:

```txt
Clean frontend structure
FastAPI backend-এর সাথে API connection
Code যেন বড় হলে messy না হয়
```

---

<a id="section-1"></a>

## 1. Big Picture

একটা frontend app-এ সাধারণত এই flow থাকে:

```txt
User Browser
  ↓
Next.js Page
  ↓
Component
  ↓
Custom Hook
  ↓
Service Function
  ↓
Axios / Fetch
  ↓
FastAPI Backend
```

সহজভাবে:

```txt
Page       = কোন route-এ কী দেখাবে
Component  = UI part
Hook       = frontend logic
Service    = API call
Axios      = backend request পাঠানোর common setup
FastAPI    = real backend logic, database, auth, validation
```

Important rule:

```txt
Component-এর ভিতরে সরাসরি API call লিখবো না।
API call services folder-এ রাখবো।
Logic hook-এ রাখবো।
UI component clean রাখবো।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-2"></a>

## 2. Tools and Packages

| Package | কাজ |
|---|---|
| `next` | React framework. Routing, rendering, layout manage করে। |
| `react` | Component-based UI বানানোর library। |
| `typescript` | Type safety দেয়, ভুল কমায়। |
| `tailwindcss` | Utility class দিয়ে দ্রুত UI design করা যায়। |
| `axios` | FastAPI backend-এ HTTP request পাঠায়। |
| `react-hook-form` | Form input ও submit efficiently handle করে। |
| `zod` | Frontend form validation করে। |
| `zustand` | Global frontend state রাখে। যেমন auth user, theme, sidebar। |
| `@tanstack/react-query` | Backend/API data fetch, cache, loading/error state manage করে। |
| `lucide-react` | Icon library। |
| `clsx` | Conditional className manage করে। |
| `tailwind-merge` | Tailwind class conflict clean করে। |

Short memory:

```txt
Zod         = frontend validation
Pydantic    = FastAPI backend validation
Axios       = API request
React Query = API data cache/loading/refetch
Zustand     = global frontend state
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-3"></a>

## 3. Installation

প্রথমে Node.js LTS install থাকতে হবে।

```bash
npx create-next-app@latest my-frontend
```

Recommended setup:

```txt
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
src/ directory: Yes
App Router: Yes
Turbopack: Yes
Import alias: Yes
Alias: @/*
```

Project folder-এ যান:

```bash
cd my-frontend
```

Packages install:

```bash
npm install axios react-hook-form zod zustand lucide-react clsx tailwind-merge @tanstack/react-query
```

Run:

```bash
npm run dev
```

Browser:

```txt
http://localhost:3000
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-4"></a>

## 4. Recommended Folder Structure

```txt
my-frontend/
│
├── public/
│   ├── images/
│   └── icons/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── common/
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   └── users/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types/
│   │
│   ├── lib/
│   │   ├── axios.ts
│   │   └── utils.ts
│   │
│   ├── store/
│   │   └── authStore.ts
│   │
│   ├── types/
│   └── constants/
│
├── .env.local
├── package.json
├── tsconfig.json
└── next.config.ts
```

Folder meaning:

| Folder | কাজ |
|---|---|
| `src/app/` | Routes/pages/layouts রাখার জায়গা। |
| `src/components/ui/` | Button, Input, Modal, Card type reusable UI। |
| `src/components/layout/` | Navbar, Sidebar, Footer। |
| `src/features/` | Feature-wise code. যেমন auth, users, products। |
| `features/*/components/` | ঐ feature-এর UI component। |
| `features/*/hooks/` | ঐ feature-এর frontend logic। |
| `features/*/services/` | ঐ feature-এর API call। |
| `features/*/types/` | ঐ feature-এর TypeScript type। |
| `src/lib/` | Axios setup, utility। |
| `src/store/` | Zustand global state। |
| `src/constants/` | Route path, fixed config। |

Main rule:

```txt
Reusable UI       → components/
Feature-specific  → features/
API call          → services/
Logic             → hooks/
Global state      → store/
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-5"></a>

## 5. App Router Basics

Next.js App Router folder-based routing use করে।

```txt
src/app/page.tsx              → /
src/app/login/page.tsx        → /login
src/app/dashboard/page.tsx    → /dashboard
src/app/users/page.tsx        → /users
```

Special files:

| File | কাজ |
|---|---|
| `page.tsx` | Route-এর main page। |
| `layout.tsx` | Shared layout। |
| `loading.tsx` | Loading UI। |
| `error.tsx` | Error UI। |
| `not-found.tsx` | 404 page। |
| `route.ts` | Next.js API route। FastAPI থাকলে এটা optional। |

Important:

```txt
FastAPI backend থাকলে real backend logic FastAPI-তেই রাখবো।
Next.js route.ts শুধু proxy, health check, বা small frontend-side server utility-এর জন্য use করা যেতে পারে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-6"></a>

## 6. App Router vs Pages Router

Next.js-এ দুই ধরনের routing style আছে:

```txt
App Router   → src/app/
Pages Router → src/pages/
```

এই scaffold **App Router** follow করে।

App Router structure:

```txt
src/app/
  page.tsx              → /
  login/
    page.tsx            → /login
  dashboard/
    page.tsx            → /dashboard
```

Pages Router structure:

```txt
src/pages/
  index.tsx             → /
  login.tsx             → /login
  dashboard.tsx         → /dashboard
```

Folder diye route করার পার্থক্য:

| বিষয় | App Router | Pages Router |
|---|---|---|
| Main folder | `src/app/` | `src/pages/` |
| Route file | `page.tsx` | file name নিজেই route |
| `/login` | `app/login/page.tsx` | `pages/login.tsx` |
| Layout | nested `layout.tsx` | `_app.tsx` বা custom layout pattern |
| Loading/error UI | `loading.tsx`, `error.tsx` | manually handle করতে হয় |
| Route group | `(group)` folder | নেই |
| New project-এর জন্য | Recommended | Mostly legacy/old project |

Important confusion:

```txt
App Router-এ page file-এর নাম page.tsx।
কিন্তু page.tsx থাকা মানেই Pages Router না।

src/app/.../page.tsx   → App Router
src/pages/...          → Pages Router
```

Decision:

```txt
New complex project হলে App Router use করবো।
Old project Pages Router হলে slowly migrate করা যায়।
Role-based dashboard/admin panel-এর জন্য App Router বেশি clean।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-7"></a>

## 7. Role-Based App Router Scaffold

Project ছোট হলে simple structure enough:

```txt
src/app/
  login/
    page.tsx
  dashboard/
    page.tsx
```

কিন্তু project বড় হলে role-based structure দরকার হতে পারে।

Example roles:

```txt
admin
teacher
student
```

Role-based App Router scaffold:

```txt
src/app/
│
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
│
├── (protected)/
│   ├── layout.tsx
│   │
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── teacher/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── courses/
│   │       └── page.tsx
│   │
│   └── student/
│       ├── layout.tsx
│       ├── dashboard/
│       │   └── page.tsx
│       └── courses/
│           └── page.tsx
│
├── unauthorized/
│   └── page.tsx
└── not-found.tsx
```

URL result:

```txt
(auth)/login/page.tsx                  → /login
(protected)/admin/dashboard/page.tsx   → /admin/dashboard
(protected)/teacher/courses/page.tsx   → /teacher/courses
(protected)/student/courses/page.tsx   → /student/courses
```

`(auth)` এবং `(protected)` হলো **route group**। এগুলো URL-এ আসে না। এগুলো শুধু folder organize করার জন্য।

Role-based feature folder:

```txt
src/features/
  auth/
  admin/
  teacher/
  student/
  users/
  courses/
```

কখন role-based scaffold দরকার:

- admin/teacher/student আলাদা dashboard থাকলে
- আলাদা sidebar/menu/layout দরকার হলে
- role অনুযায়ী route permission আলাদা হলে
- project বড় এবং long-term maintain করতে হলে

Simple vs role-based scaffold:

| Scaffold | কখন use করবো |
|---|---|
| Simple `dashboard/page.tsx` | ছোট app, একটাই dashboard |
| Role-based `/admin`, `/teacher`, `/student` | বড় app, আলাদা role, আলাদা layout |
| Route group `(protected)` | protected routes একসাথে organize করতে |
| Feature folder `features/admin` | role-specific component/hook/service রাখতে |

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-8"></a>

## 8. Route Guard and Route Protection

Route guard মানে user route-এ ঢোকার আগে check করা:

```txt
User logged in কিনা?
User-এর role ঠিক আছে কিনা?
Token/session valid কিনা?
```

দুইটা word আলাদা:

```txt
Authentication = user logged in কিনা
Authorization  = user কোন role/data access করতে পারবে
```

Protection তিন জায়গায় ভাবতে হবে:

| Layer | কাজ |
|---|---|
| FastAPI backend | Real security. Token/role/database permission check। |
| Next.js proxy/layout/page | Frontend route redirect বা UX guard। |
| UI menu/sidebar | User যেটা access করতে পারবে না সেটা hide করা। |

Important:

```txt
Frontend route guard security না, UX.
Real security সবসময় FastAPI backend-এ enforce করতে হবে।
```

Next.js v16 docs-এ `middleware` rename হয়ে `proxy.ts` হয়েছে। অনেক পুরোনো tutorial-এ এখনও `middleware.ts` দেখা যায়।

File location:

```txt
src/proxy.ts
```

অথবা `src/` না থাকলে project root-এ:

```txt
proxy.ts
```

Basic `proxy.ts` guard example:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/student");

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};
```

Role check layout/page level-এ করা যায়:

```tsx
import { redirect } from "next/navigation";

async function getCurrentUser() {
  // FastAPI /me endpoint call করে current user আনতে হবে
  return {
    id: 1,
    email: "admin@example.com",
    role: "admin",
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
```

FastAPI backend protection idea:

```py
from fastapi import Depends, HTTPException

def require_role(required_role: str):
    def checker(current_user = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return current_user

    return checker
```

Then route:

```py
@router.get("/admin/users")
async def get_users(current_user = Depends(require_role("admin"))):
    return []
```

Best rule:

```txt
Next.js guard → redirect / user experience
FastAPI guard → real permission/security
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-9"></a>

## 9. Params and Query Params

URL থেকে data দুইভাবে আসে:

```txt
Route params / dynamic params
Query params / search params
```

Dynamic route param:

```txt
/users/123
```

এখানে `123` হলো route param।

App Router folder:

```txt
src/app/users/[id]/page.tsx
```

Page example:

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

More examples:

```txt
src/app/products/[slug]/page.tsx       → /products/iphone-15
src/app/courses/[courseId]/page.tsx    → /courses/10
src/app/users/[id]/page.tsx            → /users/123
```

Query/search params:

```txt
/products?search=phone&page=2&sort=price
```

এখানে:

```txt
search = phone
page   = 2
sort   = price
```

Server Component page-এ query পড়া:

```tsx
type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    sort?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const query = await searchParams;

  const search = query.search ?? "";
  const page = Number(query.page ?? "1");
  const sort = query.sort ?? "latest";

  return (
    <div>
      Search: {search}, Page: {page}, Sort: {sort}
    </div>
  );
}
```

Client Component-এ query পড়া:

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export function ProductFilterInfo() {
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const page = searchParams.get("page") ?? "1";

  return (
    <p>
      Search: {search}, Page: {page}
    </p>
  );
}
```

Param vs query compare:

| Type | Example URL | Use case |
|---|---|---|
| Param | `/users/123` | specific resource/details page |
| Param | `/products/iphone-15` | product details by slug |
| Query | `/products?search=phone` | filter/search |
| Query | `/products?page=2` | pagination |
| Query | `/products?sort=price` | sort |

Rule:

```txt
যেটা page/resource identify করে → route param
যেটা filter/search/sort/page control করে → query param
```

FastAPI connection example:

```ts
export async function getProducts(params: {
  search?: string;
  page?: number;
  sort?: string;
}) {
  const response = await api.get("/products", {
    params,
  });

  return response.data;
}
```

Final request URL:

```txt
GET http://localhost:8000/api/v1/products?search=phone&page=2&sort=price
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-10"></a>

## 10. Synchronous and Asynchronous JavaScript

Next.js frontend শেখার জন্য **synchronous** আর **asynchronous** বুঝা খুব important।

সহজভাবে:

```txt
Synchronous  = একটার পর একটা কাজ হবে, আগের কাজ শেষ না হলে পরের কাজ শুরু হবে না
Asynchronous = long task চলতে পারে, meanwhile অন্য কাজ চলতে পারে
```

Real-life example:

```txt
Synchronous:
চা বানানো শেষ না হওয়া পর্যন্ত তুমি অন্য কিছু করছো না।

Asynchronous:
চা বসিয়ে দিলে, চা ফুটতে থাকলো, meanwhile তুমি অন্য কাজ করলে।
```

JavaScript single-threaded হলেও async কাজ handle করতে পারে। API request, timer, file upload, database request এগুলো সাধারণত async।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-11"></a>

### 10.1 Synchronous Example

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

এখানে line by line execute হয়।

আরেকটা example:

```ts
function add(a: number, b: number) {
  return a + b;
}

const result = add(10, 20);
console.log(result);
```

এখানে `add()` function immediately result return করে। তাই এটা synchronous।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-12"></a>

### 10.2 Asynchronous Example

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

কারণ `setTimeout` async। JavaScript wait না করে পরের line execute করে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-13"></a>

### 10.3 Promise কী

Promise মানে future result।

```txt
Promise pending   = কাজ চলছে
Promise fulfilled = কাজ successful
Promise rejected  = error হয়েছে
```

Example:

```ts
const promise = fetch("http://localhost:8000/api/v1/products");
```

`fetch()` সাথে সাথে data return করে না। এটা একটা Promise return করে। পরে response আসবে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-14"></a>

### 10.4 async/await কী

`async/await` Promise handle করার clean syntax।

```ts
async function getProducts() {
  const response = await fetch("http://localhost:8000/api/v1/products");
  const data = await response.json();

  return data;
}
```

এখানে:

```txt
async = এই function Promise return করবে
await = Promise resolve হওয়া পর্যন্ত অপেক্ষা করবে
```

Important:

```txt
await শুধু async function-এর ভিতরে use করা যায়।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-15"></a>

### 10.5 FastAPI API Call Async কেন

Frontend যখন FastAPI backend-এ request পাঠায়, তখন result আসতে সময় লাগে।

কারণ backend-এ হতে পারে:

- database query
- authentication check
- file processing
- AI model call
- external API call

তাই frontend API call async হয়।

Service example:

```ts
import { api } from "@/lib/axios";

export async function getUsers() {
  const response = await api.get("/users");
  return response.data;
}
```

Usage:

```ts
const users = await getUsers();
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-16"></a>

### 10.6 try/catch/finally

Async API call করলে error handle করতে হবে।

```ts
async function loadUsers() {
  try {
    const users = await getUsers();
    console.log(users);
  } catch (error) {
    console.log("Failed to load users", error);
  } finally {
    console.log("Request finished");
  }
}
```

Meaning:

```txt
try     = normal কাজ
catch   = error হলে কী হবে
finally = success/error যাই হোক শেষে চলবে
```

Custom hook-এ loading state manage করার জন্য `finally` useful।

```ts
async function login(email: string, password: string) {
  try {
    setLoading(true);
    const data = await loginUser({ email, password });
    return data;
  } catch (error) {
    setError("Login failed");
  } finally {
    setLoading(false);
  }
}
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-17"></a>

### 10.7 Sequential vs Parallel Async

Sequential মানে একটার পর একটা:

```ts
const user = await getUser();
const orders = await getOrders();
const notifications = await getNotifications();
```

এখানে `getOrders()` শুরু হবে `getUser()` শেষ হওয়ার পরে।

যদি request গুলো একে অপরের উপর depend না করে, তাহলে parallel ভালো:

```ts
const [user, orders, notifications] = await Promise.all([
  getUser(),
  getOrders(),
  getNotifications(),
]);
```

এতে তিনটা request একসাথে শুরু হয়।

Rule:

```txt
একটার result অন্যটার দরকার হলে → sequential await
স্বাধীন request হলে → Promise.all
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-18"></a>

### 10.8 Server Component-এ Async

Next.js Server Component async হতে পারে।

```tsx
export default async function ProductsPage() {
  const response = await fetch(`${process.env.API_BASE_URL}/products`, {
    next: { revalidate: 60 },
  });

  const products = await response.json();

  return (
    <div>
      {products.map((product: { id: number; name: string }) => (
        <p key={product.id}>{product.name}</p>
      ))}
    </div>
  );
}
```

এটা server-side data fetch করার জন্য useful।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-19"></a>

### 10.9 Client Component-এ Async

Client Component-এর main component function সাধারণত async করা হয় না। Event handler async করা হয়।

```tsx
"use client";

export default function SaveButton() {
  async function handleClick() {
    await fetch("/api/save", {
      method: "POST",
    });
  }

  return <button onClick={handleClick}>Save</button>;
}
```

Form submit example:

```tsx
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  await login(email, password);
}
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-20"></a>

### 10.10 React Query Async

React Query-এর `queryFn` async হয়।

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ["users"],
  queryFn: async () => {
    const response = await api.get("/users");
    return response.data;
  },
});
```

React Query নিজে loading/error/cache manage করে।

তাই সবসময় manual `useState` দিয়ে loading manage করতে হয় না।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-21"></a>

### 10.11 Common Mistakes

ভুল ১: `await` না দেওয়া।

```ts
const data = getUsers();
console.log(data);
```

এখানে `data` actual users না, Promise হতে পারে।

ঠিক:

```ts
const data = await getUsers();
console.log(data);
```

ভুল ২: `async` ছাড়া `await` use করা।

```ts
function loadUsers() {
  const users = await getUsers();
}
```

ঠিক:

```ts
async function loadUsers() {
  const users = await getUsers();
}
```

ভুল ৩: independent request sequential করা।

```ts
const users = await getUsers();
const products = await getProducts();
```

যদি দুইটা independent হয়:

```ts
const [users, products] = await Promise.all([
  getUsers(),
  getProducts(),
]);
```

ভুল ৪: error handle না করা।

```ts
const data = await getUsers();
```

ভালো:

```ts
try {
  const data = await getUsers();
} catch (error) {
  console.log(error);
}
```

Final memory:

```txt
Normal calculation       → synchronous
API call                 → asynchronous
FastAPI request          → asynchronous
Server Component fetch   → async/await
Client button/form event → async handler
React Query queryFn      → async function
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-22"></a>

## 11. Server Component vs Client Component

Next.js App Router-এ component defaultভাবে **Server Component**।

Server Component ভালো:

- Static page
- SEO দরকার
- Initial load fast রাখতে
- Server-side data fetch করতে

Client Component দরকার:

- `useState`
- `useEffect`
- button click
- form input
- modal open/close
- `localStorage`
- browser API
- Zustand
- React Query hooks

Client Component লিখতে file-এর প্রথম লাইনে দিতে হয়:

```tsx
"use client";
```

Example:

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

Simple rule:

```txt
যেখানে interaction নেই  → Server Component
যেখানে interaction আছে → Client Component
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-23"></a>

## 12. Rendering and Server Cost

Server Component মানেই বেশি server cost না।

Cost depend করে page কীভাবে data আনছে:

```txt
Static page       = cost কম
Cached data page  = cost কম/medium
Dynamic page      = cost বেশি হতে পারে
```

Static page:

```tsx
export default function AboutPage() {
  return <h1>About Us</h1>;
}
```

এখানে FastAPI call নেই, user-specific data নেই। তাই cost কম।

Public data যদি ১ মিনিট পর পর update হলেই চলে:

```tsx
export default async function ProductsPage() {
  const res = await fetch(`${process.env.API_BASE_URL}/products`, {
    next: { revalidate: 60 },
  });

  const products = await res.json();

  return (
    <div>
      {products.map((product: { id: number; name: string }) => (
        <p key={product.id}>{product.name}</p>
      ))}
    </div>
  );
}
```

Private/user-specific data:

```tsx
export default async function DashboardPage() {
  const res = await fetch(`${process.env.API_BASE_URL}/me/dashboard`, {
    cache: "no-store",
  });

  const data = await res.json();

  return <div>{data.name}</div>;
}
```

When to use what:

| Situation | Best choice |
|---|---|
| About, Contact, Landing | Static Server Component |
| Public product/blog list | Server Component + `revalidate` |
| Dashboard/profile/private data | Dynamic fetch / `no-store` |
| Search/filter/pagination | Client Component + React Query |
| Modal/form/sidebar | Client Component |

Cost কমানোর rules:

1. সব page-এ blindly `"use client"` দেবো না।
2. সব fetch-এ blindly `cache: "no-store"` দেবো না।
3. Public data হলে `revalidate` ভাববো।
4. Private data হলে auth + `no-store` ঠিক আছে।
5. React Query use করলে `staleTime` set করবো।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-24"></a>

## 13. Environment Variables

`.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
API_BASE_URL=http://localhost:8000/api/v1
```

Difference:

```txt
NEXT_PUBLIC_API_BASE_URL = browser/client component থেকে use করা যায়
API_BASE_URL             = server component/server-side code থেকে use করা ভালো
```

FastAPI backend যদি `/api/v1` prefix না use করে:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
API_BASE_URL=http://localhost:8000
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-25"></a>

## 14. FastAPI Backend Connection

Local setup:

```txt
Next.js frontend → http://localhost:3000
FastAPI backend  → http://localhost:8000
API prefix       → /api/v1
```

Browser থেকে FastAPI call করলে CORS দরকার।

FastAPI CORS example:

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

FastAPI login endpoint example:

```py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

class LoginPayload(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(payload: LoginPayload):
    return {
        "access_token": "jwt-token-here",
        "token_type": "bearer",
        "user": {
            "id": 1,
            "email": payload.email,
        },
    }
```

Frontend request URL:

```txt
POST http://localhost:8000/api/v1/auth/login
```

Important:

```txt
Frontend Zod validation = user experience ভালো করার জন্য
FastAPI Pydantic validation = real backend validation
```

Frontend validation bypass করা যায়। Backend validation bypass করা যায় না।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-26"></a>

## 15. Axios Setup

File:

```txt
src/lib/axios.ts
```

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

কাজ:

```txt
এক জায়গায় baseURL থাকবে
এক জায়গায় auth token attach হবে
সব service একই api instance use করবে
```

HTTP-only cookie auth use করলে:

```ts
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});
```

তখন FastAPI CORS-এ `allow_credentials=True` লাগবে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-27"></a>

## 16. Service Layer

Service layer-এর কাজ হলো backend API call করা।

File:

```txt
src/features/auth/services/authService.ts
```

```ts
import { api } from "@/lib/axios";

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
  };
};

export async function loginUser(payload: LoginPayload) {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
}
```

Note:

```txt
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
service path=/auth/login
final URL=http://localhost:8000/api/v1/auth/login
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-28"></a>

## 17. Custom Hook

Hook-এর কাজ হলো frontend logic handle করা।

File:

```txt
src/features/auth/hooks/useLogin.ts
```

```ts
import { useState } from "react";
import { loginUser } from "../services/authService";

export function useLogin() {
  const [loading, setLoading] = useState(false);

  async function login(email: string, password: string) {
    try {
      setLoading(true);

      const data = await loginUser({ email, password });

      localStorage.setItem("accessToken", data.access_token);

      return data;
    } finally {
      setLoading(false);
    }
  }

  return { login, loading };
}
```

Hook-এ রাখা যায়:

- loading state
- submit logic
- error handling
- service function call
- localStorage update

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-29"></a>

## 18. Component

Component-এর কাজ UI দেখানো।

File:

```txt
src/features/auth/components/LoginForm.tsx
```

```tsx
"use client";

import { useState } from "react";
import { useLogin } from "../hooks/useLogin";

export default function LoginForm() {
  const { login, loading } = useLogin();

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

      <button disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

এখানে component শুধু UI + event handle করছে। API call সরাসরি component-এ নেই।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-30"></a>

## 19. Page

Page route তৈরি করে।

File:

```txt
src/app/login/page.tsx
```

```tsx
import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main>
      <h1>Login</h1>
      <LoginForm />
    </main>
  );
}
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-31"></a>

## 20. React Query

React Query use করবো যখন API data cache/loading/error/refetch দরকার।

Example use cases:

- Search
- Filter
- Pagination
- Dashboard widgets
- Data list বারবার fetch করা

Example:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export function ProductSearch({ search }: { search: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", search],
    queryFn: async () => {
      const response = await api.get("/products", {
        params: { search },
      });

      return response.data;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong</p>;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

Remember:

```txt
React Query hook use করলে component client হতে হবে।
staleTime দিলে FastAPI call কম হয়।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-32"></a>

## 21. Zustand

Zustand global frontend state রাখে।

Use cases:

- logged in user
- auth token
- theme
- sidebar open/close
- cart
- temporary UI state

React Query আর Zustand আলাদা:

```txt
React Query = backend/API data
Zustand     = frontend/global UI state
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-33"></a>

## 22. Zod

Zod frontend form validation করে।

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

Validation flow:

```txt
User form fill করে
  ↓
Zod frontend-এ check করে
  ↓
Valid হলে service API call করে
  ↓
FastAPI আবার Pydantic দিয়ে validate করে
```

Important:

```txt
Zod user experience ভালো করে।
Pydantic backend security/data correctness রাখে।
দুই জায়গাতেই validation দরকার।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-34"></a>

## 23. Route Constants

File:

```txt
src/constants/routes.ts
```

```ts
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  USERS: "/users",
};
```

Usage:

```tsx
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function Navbar() {
  return (
    <nav>
      <Link href={ROUTES.HOME}>Home</Link>
      <Link href={ROUTES.LOGIN}>Login</Link>
      <Link href={ROUTES.DASHBOARD}>Dashboard</Link>
    </nav>
  );
}
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-35"></a>

## 24. Development Rules

1. Component-এর ভিতরে direct API call লিখবো না।
2. API call `services/` folder-এ রাখবো।
3. Frontend logic `hooks/` folder-এ রাখবো।
4. Feature-specific code `features/` folder-এ রাখবো।
5. Reusable UI `components/` folder-এ রাখবো।
6. Backend response-এর TypeScript type লিখবো।
7. FastAPI schema change হলে frontend type update করবো।
8. `"use client"` শুধু দরকার হলে দেবো।
9. Public page static রাখার চেষ্টা করবো।
10. Public data হলে `revalidate` ব্যবহার ভাববো।
11. Private data হলে `no-store` বা React Query use করবো।
12. React Query use করলে `staleTime` set করবো।
13. Zod frontend validation দিবো।
14. FastAPI Pydantic validation অবশ্যই রাখবো।
15. Auth token কোথায় রাখবো সেটা শুরুতেই decide করবো: localStorage না HTTP-only cookie।
16. Role-based route হলে `/admin`, `/teacher`, `/student` আলাদা folder/layout করবো।
17. Route group `(auth)` এবং `(protected)` URL change না করে organize করতে use করবো।
18. Next.js route guard UX-এর জন্য, FastAPI permission check security-এর জন্য।
19. Details page হলে `[id]` বা `[slug]` param use করবো।
20. Search/filter/pagination হলে query/search params use করবো।
21. API call সবসময় async হিসেবে ভাববো।
22. `await` use করলে function `async` হতে হবে।
23. Independent multiple API call হলে `Promise.all` use করা যায়।
24. Async API call-এ `try/catch/finally` দিয়ে error/loading handle করবো।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-36"></a>

## 25. Simple Login Flow

```txt
src/app/login/page.tsx
  ↓
LoginForm.tsx
  ↓
useLogin.ts
  ↓
authService.ts
  ↓
src/lib/axios.ts
  ↓
FastAPI: POST /api/v1/auth/login
  ↓
Response: access_token + user
```

Layer meaning:

```txt
Page      = route
Form      = UI
Hook      = submit/loading/error logic
Service   = API request
Axios     = baseURL/token setup
FastAPI   = auth/database/validation
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-37"></a>

## 26. Common Scripts

| Command | কাজ |
|---|---|
| `npm run dev` | Development server চালু করে। |
| `npm run build` | Production build তৈরি করে। |
| `npm run start` | Production build locally run করে। |
| `npm run lint` | Linting issue check করে। |

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-38"></a>

## 27. Use Cases

এই scaffold ব্যবহার করা যাবে:

- Dashboard application
- Admin panel
- LMS frontend
- SaaS frontend
- Authentication-based app
- FastAPI backend connected frontend
- Production-ready frontend starter

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-39"></a>

## 28. Official Docs References

- App Router: https://nextjs.org/docs/app
- Pages Router: https://nextjs.org/docs/pages
- Route Groups: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
- Dynamic Routes: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes
- Search Params: https://nextjs.org/docs/app/api-reference/functions/use-search-params
- Authentication and Authorization: https://nextjs.org/docs/app/guides/authentication
- Proxy for route guard/redirect: https://nextjs.org/docs/app/api-reference/file-conventions/proxy

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-40"></a>

## 29. Final Summary

এই structure মনে রাখলেই অনেক confusion কমবে:

```txt
app/        → route/page
components/ → reusable UI
features/   → feature-wise code
hooks/      → frontend logic
services/   → FastAPI API call
lib/axios   → common API setup
store/      → global frontend state
types/      → TypeScript types
proxy.ts    → early route guard / redirect
async/await → API call এবং server data fetching
```

সবচেয়ে important:

```txt
UI আলাদা
Logic আলাদা
API call আলাদা
Backend FastAPI আলাদা
Route guard frontend UX
Permission check backend security
API call async
Error/loading handle করতে হবে
```

এভাবে লিখলে project বড় হলেও code clean, understandable এবং maintainable থাকে।

<!-- tutorial-nav:back -->
[Back to Index](#index)
