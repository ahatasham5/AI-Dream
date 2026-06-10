# Next.js Frontend Scaffold

এটি একটি **Next.js Frontend Scaffold** প্রজেক্ট।  
এই scaffold ব্যবহার করে একটি clean, scalable এবং maintainable frontend project তৈরি করা যায়।

এই প্রজেক্টে ব্যবহার করা হয়েছে:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- Zustand
- React Hook Form
- Zod
- TanStack Query
- Lucide React

এই structure dashboard app, admin panel, LMS frontend, SaaS frontend, authentication-based app অথবা backend API-connected frontend project-এর জন্য ব্যবহার করা যাবে।

---

## Project Objective

এই scaffold-এর মূল উদ্দেশ্য হলো frontend project-কে organized রাখা।

সাধারণত project বড় হলে সব component, API call, form logic এবং state management একসাথে mixed হয়ে যায়।  
তাই এই project-এ code আলাদা আলাদা layer-এ রাখা হয়েছে:

```txt
Page
 ↓
Component
 ↓
Custom Hook
 ↓
Service Function
 ↓
Axios Wrapper
 ↓
Backend API
```

এই pattern follow করলে project maintain করা সহজ হয়।

---

## Installation Process

প্রথমে আপনার computer-এ **Node.js LTS version** install থাকতে হবে।

তারপর terminal-এ নিচের command চালান:

```bash
npx create-next-app@latest my-frontend
```

Setup করার সময় recommended option:

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

তারপর project folder-এ যান:

```bash
cd my-frontend
```

Required packages install করুন:

```bash
npm install axios react-hook-form zod zustand lucide-react clsx tailwind-merge @tanstack/react-query
```

Development server চালু করুন:

```bash
npm run dev
```

Browser-এ open করুন:

```txt
http://localhost:3000
```

---

## Package List and Work Purpose

| Package Name | Type | কাজ / Purpose |
|---|---|---|
| `next` | Framework | React ভিত্তিক frontend application তৈরি করার main framework। Routing, rendering, layout এবং API route handle করে। |
| `react` | UI Library | Component-based user interface তৈরি করতে ব্যবহৃত হয়। |
| `react-dom` | UI Renderer | React component browser DOM-এ render করে। |
| `typescript` | Language Tool | Code-এ type safety যোগ করে, error কমায় এবং maintainability বাড়ায়। |
| `tailwindcss` | Styling | Utility-first CSS framework। দ্রুত responsive UI design করতে সাহায্য করে। |
| `eslint` | Code Quality | Code-এর error, bad practice এবং linting issue check করে। |
| `axios` | API Client | Backend API-তে HTTP request পাঠানোর জন্য ব্যবহার করা হয়। |
| `react-hook-form` | Form Management | Form input, validation এবং submission efficiently handle করে। |
| `zod` | Validation | Schema-based validation করার জন্য ব্যবহৃত হয়। Form এবং API data validate করতে helpful। |
| `zustand` | State Management | Lightweight global state management। Auth, theme, sidebar state ইত্যাদির জন্য useful। |
| `@tanstack/react-query` | Server State Management | API data fetching, caching, loading state, refetching এবং server state manage করে। |
| `lucide-react` | Icon Library | Clean এবং modern icon ব্যবহার করার জন্য। |
| `clsx` | Utility | Conditional className manage করতে ব্যবহৃত হয়। |
| `tailwind-merge` | Utility | Tailwind CSS class conflict remove করে final class merge করে। |

---

## Project Folder Structure

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
│   │   │
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   └── api/
│   │       └── health/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   └── common/
│   │       ├── PageHeader.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   └── LoginForm.tsx
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   ├── hooks/
│   │   │   │   └── useLogin.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   └── users/
│   │       ├── components/
│   │       ├── services/
│   │       ├── hooks/
│   │       └── types/
│   │
│   ├── lib/
│   │   ├── axios.ts
│   │   ├── env.ts
│   │   ├── utils.ts
│   │   └── validators.ts
│   │
│   ├── hooks/
│   │   └── useDebounce.ts
│   │
│   ├── store/
│   │   └── authStore.ts
│   │
│   ├── types/
│   │   └── common.types.ts
│   │
│   ├── constants/
│   │   └── routes.ts
│   │
│   └── styles/
│       └── globals.css
│
├── .env.local
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Folder Explanation

| Folder / File | কাজ |
|---|---|
| `public/` | Static file যেমন image, icon, logo রাখার জন্য। |
| `src/app/` | Next.js App Router-এর routes, pages, layouts, loading UI, error UI রাখার জায়গা। |
| `src/app/layout.tsx` | Application-এর main root layout। |
| `src/app/page.tsx` | Homepage route `/`। |
| `src/app/loading.tsx` | Route loading state-এর UI। |
| `src/app/error.tsx` | Runtime error handle করার UI। |
| `src/app/not-found.tsx` | Custom 404 page। |
| `src/components/` | Reusable UI components রাখার জায়গা। |
| `src/components/ui/` | Button, Input, Modal, Card এর মতো small reusable UI component। |
| `src/components/layout/` | Navbar, Sidebar, Footer এর মতো layout component। |
| `src/components/common/` | PageHeader, EmptyState, Loader এর মতো common component। |
| `src/features/` | Feature-based module যেমন auth, users, products, dashboard। |
| `src/features/auth/` | Authentication related component, service, hook এবং type। |
| `src/lib/` | Axios setup, utility function, environment helper ইত্যাদি। |
| `src/hooks/` | Reusable custom React hooks। |
| `src/store/` | Global state management file। |
| `src/types/` | Shared TypeScript type এবং interface। |
| `src/constants/` | Fixed value যেমন route path, menu item, config value। |
| `.env.local` | Local environment variable রাখার file। |
| `next.config.ts` | Next.js configuration file। |
| `tsconfig.json` | TypeScript configuration file। |
| `package.json` | Project scripts, dependencies এবং metadata। |

---

## Frontend Architecture

এই project layered architecture follow করে।

```txt
User Browser
   ↓
Next.js App Router
   ↓
Page
   ↓
Feature Component
   ↓
Custom Hook
   ↓
Service Function
   ↓
Axios Wrapper
   ↓
Backend API
```

Example login flow:

```txt
src/app/login/page.tsx
   ↓
src/features/auth/components/LoginForm.tsx
   ↓
src/features/auth/hooks/useLogin.ts
   ↓
src/features/auth/services/authService.ts
   ↓
src/lib/axios.ts
   ↓
Backend API: /auth/login
```

---

## App Router Concept

Next.js App Router folder-based routing ব্যবহার করে।

যে folder-এর ভিতরে `page.tsx` থাকবে, সেটি route হিসেবে কাজ করবে।

Example:

```txt
src/app/page.tsx              → /
src/app/login/page.tsx        → /login
src/app/dashboard/page.tsx    → /dashboard
src/app/users/page.tsx        → /users
```

Special files:

| File Name | কাজ |
|---|---|
| `layout.tsx` | Shared layout তৈরি করে। |
| `page.tsx` | Actual route page তৈরি করে। |
| `loading.tsx` | Loading state দেখায়। |
| `error.tsx` | Error state handle করে। |
| `not-found.tsx` | 404 page দেখায়। |
| `route.ts` | API route handler তৈরি করে। |

---

## Server Component and Client Component

Next.js App Router-এ default component হলো **Server Component**।

Server Component ভালো:

- SEO-এর জন্য
- Fast initial load-এর জন্য
- Server-side data fetching-এর জন্য
- Static content render করার জন্য

Client Component দরকার যখন:

- `useState` দরকার
- `useEffect` দরকার
- Button click/event দরকার
- Form input manage করতে হবে
- `localStorage` ব্যবহার করতে হবে
- Browser API ব্যবহার করতে হবে

Client Component লিখতে হলে file-এর শুরুতে দিতে হবে:

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

---

## Rendering Strategy and Server Cost

Next.js App Router-এ component defaultভাবে **Server Component** হলেও এর মানে এই না যে প্রতিটা page সবসময় costly server request করবে।

মূল idea:

```txt
Server Component = server-side render হতে পারে
Static Rendering / Cached Rendering = build/cache থেকে serve হতে পারে
Dynamic Rendering = প্রতিটা request-এ fresh server/API/database work হতে পারে
```

Cost সাধারণত বাড়ে যখন:

- সব page dynamic বানানো হয়
- প্রতিটা request-এ FastAPI / database call করা হয়
- caching বা revalidation ব্যবহার করা হয় না
- সব জায়গায় blindly `"use client"` দেওয়া হয়
- React Query refetch বেশি হয়
- middleware বা backend query heavy হয়

Static public page হলে simple Server Component রাখাই ভালো:

```tsx
export default function AboutPage() {
  return <h1>About Us</h1>;
}
```

Public data যদি কিছু সময় পর পর update হলেই চলে, তাহলে revalidate ব্যবহার করা যায়:

```tsx
export default async function ProductsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products`, {
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

Private, real-time বা user-specific data হলে `no-store` ব্যবহার করা যায়:

```tsx
export default async function DashboardPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/me/dashboard`, {
    cache: "no-store",
  });

  const data = await res.json();

  return <div>{data.name}</div>;
}
```

Rule:

```txt
Public static page          → Server Component + static rendering
Public semi-dynamic data    → Server Component + revalidate
Private dashboard/profile   → dynamic/no-store অথবা Client Component + React Query
Interactive UI              → ছোট Client Component
```

ভালো pattern হলো পুরো page client না করে শুধু interactive অংশ client করা।

```tsx
// app/products/page.tsx
import ProductFilter from "./ProductFilter";

export default async function ProductsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products`, {
    next: { revalidate: 60 },
  });

  const products = await res.json();

  return (
    <div>
      <ProductFilter />
      {products.map((product: { id: number; name: string }) => (
        <p key={product.id}>{product.name}</p>
      ))}
    </div>
  );
}
```

```tsx
// app/products/ProductFilter.tsx
"use client";

export default function ProductFilter() {
  return <input placeholder="Search product" />;
}
```

---

## Environment Variables

Root folder-এ `.env.local` file তৈরি করুন।

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

FastAPI backend যদি `/api/v1` prefix ব্যবহার না করে, তাহলে value হতে পারে:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

এই value Axios wrapper-এ ব্যবহার করা হবে FastAPI backend API connect করার জন্য।

---

## Axios Setup

File path:

```txt
src/lib/axios.ts
```

Example:

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

এভাবে সব API request centralized থাকবে।

FastAPI যদি HTTP-only cookie auth ব্যবহার করে, তাহলে Axios config-এ `withCredentials: true` লাগতে পারে। তখন FastAPI CORS config-এও credential allow করতে হবে।

---

## FastAPI Backend Connection Notes

এই frontend scaffold FastAPI backend-এর সাথে connect করার জন্য service layer ব্যবহার করবে। Next.js-এর `src/app/api/` route optional। FastAPI project থাকলে main backend logic FastAPI-তেই রাখা ভালো।

Common local setup:

```txt
Next.js frontend  → http://localhost:3000
FastAPI backend   → http://localhost:8000
API prefix        → /api/v1
```

FastAPI backend-এ CORS allow করতে হবে, না হলে browser request block করবে।

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

FastAPI endpoint example:

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

Frontend service call তখন হবে:

```txt
POST http://localhost:8000/api/v1/auth/login
```

Important:

- Frontend Zod validation user experience ভালো করে।
- FastAPI Pydantic validation backend-এর real validation।
- Frontend type এবং backend schema match রাখতে হবে।
- FastAPI response অনেক সময় `snake_case` হয়, যেমন `access_token`।
- Frontend চাইলে response map করে `camelCase` ব্যবহার করতে পারে।

---

## Service Layer Example

File path:

```txt
src/features/auth/services/authService.ts
```

```ts
import { api } from "@/lib/axios";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  token_type: "bearer";
  user?: {
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

Service layer-এর কাজ হলো backend API communication handle করা।

FastAPI backend যদি `/api/v1` prefix `.env.local`-এর `NEXT_PUBLIC_API_BASE_URL`-এ already থাকে, তাহলে service path শুধু `/auth/login` হবে।

---

## Custom Hook Example

File path:

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

Hook layer frontend logic handle করে।

Example:

- Loading state
- Form submit logic
- API call trigger
- LocalStorage update
- Error handling

---

## React Query, Zustand and Zod Notes

`@tanstack/react-query` server state manage করে। মানে backend API থেকে আসা data, loading state, error state, caching, refetching এগুলো handle করে।

Next.js App Router-এ `useQuery()` বা `useMutation()` ব্যবহার করলে component client হতে হবে:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export function ProductSearch({ search }: { search: string }) {
  const { data, isLoading } = useQuery({
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

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

React Query use করার সময়:

- `staleTime` দিলে একই data বারবার FastAPI থেকে fetch কম হবে।
- `refetchOnWindowFocus: false` দিলে tab focus হলেই automatic refetch হবে না।
- Search/filter/pagination/dashboard widget-এর জন্য useful।
- Static public page-এর জন্য সবসময় React Query দরকার নেই।

Zustand global client state রাখে:

```txt
Auth user
Theme
Sidebar open/close
Cart
Temporary UI state
```

Zustand আর React Query এক জিনিস না:

```txt
Zustand     → frontend/global UI state
React Query → backend/API/server state
```

Zod frontend form validation করে:

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

কিন্তু FastAPI backend-এ Pydantic model validation অবশ্যই রাখতে হবে। Frontend validation bypass করা যায়, backend validation bypass করা যায় না।

---

## Component Example

File path:

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
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

---

## Page Example

File path:

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

---

## Route Constants Example

File path:

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

---

## Available Scripts

| Command | কাজ |
|---|---|
| `npm run dev` | Development server চালু করে। |
| `npm run build` | Production build তৈরি করে। |
| `npm run start` | Production build locally run করে। |
| `npm run lint` | Code quality এবং linting issue check করে। |

---

## Development Rules

Project clean রাখার জন্য নিচের rules follow করা উচিত:

1. Component-এর ভিতরে সরাসরি API call লেখা যাবে না।
2. API call সবসময় `services/` folder-এ রাখতে হবে।
3. Frontend logic custom hook-এর ভিতরে রাখা ভালো।
4. Reusable UI component `components/` folder-এ রাখতে হবে।
5. Feature-specific code `features/` folder-এ রাখতে হবে।
6. API payload এবং response-এর জন্য TypeScript type ব্যবহার করতে হবে।
7. Route path `constants/routes.ts` file-এ রাখা ভালো।
8. Environment variable `.env.local` file-এ রাখতে হবে।
9. `"use client"` শুধু তখনই ব্যবহার করতে হবে যখন browser-side feature দরকার।
10. Component ছোট এবং focused রাখা উচিত।
11. Public/static page dynamic বানাবেন না যদি দরকার না থাকে।
12. FastAPI থেকে public data আনলে possible হলে cache/revalidate strategy ভাবতে হবে।
13. Private/user-specific data হলে `no-store`, auth header বা cookie flow ঠিকভাবে handle করতে হবে।
14. React Query use করলে `staleTime` এবং refetch behavior control করতে হবে।
15. FastAPI backend schema change হলে frontend TypeScript type update করতে হবে।

---

## Recommended Data Flow

```txt
Page
 ↓
Component
 ↓
Hook
 ↓
Service
 ↓
Axios
 ↓
Backend API
```

এই flow follow করলে code debug, test এবং maintain করা সহজ হয়।

---

## Project Use Cases

এই scaffold ব্যবহার করা যাবে:

- Dashboard application
- Admin panel
- LMS frontend
- SaaS frontend
- Authentication-based frontend
- API-connected frontend
- Supabase frontend
- FastAPI backend connected frontend
- Production-ready frontend starter

---

## Final Notes

এই project structure medium to large frontend application-এর জন্য suitable।

Routing, UI, business logic, API service, global state এবং shared utility আলাদা রাখার কারণে project বড় হলেও code clean থাকে।

Project-এ নতুন feature add করতে হলে সেটি `src/features/` folder-এর ভিতরে add করা উচিত।  
সবকিছু `components/` folder-এ রাখলে project messy হয়ে যাবে।
