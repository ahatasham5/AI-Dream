# Next.js Frontend Tutorial with FastAPI Backend

এই note-টা Next.js frontend শেখার জন্য, কিন্তু backend ধরে নেওয়া হয়েছে **FastAPI**।  
লক্ষ্য শুধু folder মুখস্থ করা না; লক্ষ্য হলো বুঝা:

```txt
কোন layer কেন আছে
কোন কাজ কোন file/folder-এ রাখা উচিত
FastAPI backend-এর সাথে clean API flow কীভাবে বানাবো
Project বড় হলে code কীভাবে maintainable থাকবে
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
- [13. Service Layer: Backend call-এর clean জায়গা](#section-13)
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

> 🎯 **এই section-এ বুঝব:** frontend আসলে কী কাজ করে, আর কোথায় গিয়ে থামে — কেন আসল security backend-এ থাকে।

### 🍽️ আগে একটা গল্প

ভাবো একটা রেস্টুরেন্ট। **Frontend হলো সুন্দর করে সাজানো ডাইনিং হল** — টেবিল, মেনু কার্ড, আলো, বসার জায়গা। গ্রাহক এখানেই বসে, মেনু দেখে, অর্ডার দেয়। আর **backend হলো রান্নাঘর** — যেখানে আসল রান্না, হিসাব-নিকাশ, স্টক সব হয়। গ্রাহক রান্নাঘরে ঢোকে না; সে শুধু হল-এ যা দেখে তা নিয়েই কাজ চালায়। 😊

Next.js frontend ঠিক এই ডাইনিং হলের কাজটাই করে: user-কে সুন্দর screen দেখায়, input নেয়, কিন্তু আসল সিদ্ধান্ত (কে ঢুকতে পারবে, ডেটা ঠিক কিনা) নেয় রান্নাঘর = FastAPI।

### কেন এভাবে ভাগ করা?

হল যত সুন্দরই হোক, তুমি চাইবে না গ্রাহক নিজে রান্নাঘরে ঢুকে টাকার হিসাব বদলে দিক। ঠিক তেমনি frontend browser-এ চলে, আর browser পুরোপুরি user-এর হাতে — সে code দেখতে ও বদলাতে পারে। তাই কোনো নিরাপত্তা শুধু frontend-এ রাখলে সেটা সহজে ভাঙা যায়। আসল যাচাই তাই backend-এ রাখতেই হবে।

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
| Route/page বানানো | App Router দিয়ে folder-based routing |
| SEO/static page | Server Component এবং static rendering |
| Dashboard/app UI | Client Component, forms, state |
| Backend connect | fetch/Axios দিয়ে FastAPI call |
| Large app structure | layout, route groups, feature folders |

সবচেয়ে important rule:

```txt
Frontend সুন্দর হলেও backend validation/security ছাড়া app secure না।
```

> 🧠 **মনে রাখার ট্রিক:** Frontend = ডাইনিং হল, Backend = রান্নাঘর। সাজানো যত সুন্দরই হোক, আসল রান্না আর হিসাব হয় ভেতরে।

> ✅ **নিজেকে যাচাই করো:** frontend-এ ইতিমধ্যে email/password validation আছে — তবু backend-এ আবার validation কেন লাগে?
> <details><summary>উত্তর দেখো</summary>
> কারণ browser user-এর হাতে; সে frontend code বা request বদলে validation bypass করতে পারে। তাই backend হলো শেষ দারোয়ান (gatekeeper) — সেখানে যাচাই না করলে app নিরাপদ না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-2"></a>

## 02. Request Flow: Browser থেকে FastAPI পর্যন্ত

> 🎯 **এই section-এ বুঝব:** একটা request browser থেকে FastAPI পর্যন্ত কোন কোন হাত ঘুরে যায়, আর প্রতিটা হাতের কাজ কী।

### 🧾 আগে একটা গল্প

রেস্টুরেন্টে তুমি অর্ডার দিলে সেটা সাথে সাথে রান্নাঘরে টেলিপোর্ট হয় না। ওয়েটার অর্ডার স্লিপ লেখে → রান্নাঘরে পৌঁছায় → শেফ রান্না করে → আবার ওয়েটার প্লেট এনে টেবিলে দেয়। প্রতিটা ধাপে আলাদা একজন, আলাদা কাজ।

একটা login request-ও ঠিক এভাবেই ধাপে ধাপে যায় — page → component → hook → service → api client → FastAPI। প্রতিটা layer একজন কর্মীর মতো, নিজের ছোট্ট কাজটাই করে।

### কেন এত ধাপ?

এক ওয়েটার যদি একাই অর্ডার নেয়, রান্না করে, বিল বানায় — সব গুলিয়ে যায়। কাজ ভাগ করলে প্রতিটা অংশ ছোট, বোঝা সহজ, বদলানো সহজ। frontend-এও তাই: আলাদা layer থাকলে app বড় হলে confusion কমে।

একটা login example দিয়ে full flow:

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
  -> User dashboard এ যায়
```

এই flow বুঝলে folder structure naturally clear হয়।

Layer-by-layer কাজ:

| Layer | কাজ |
|---|---|
| `page.tsx` | route-এর screen compose করে |
| `component` | UI দেখায় |
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

এই separation app বড় হলে confusion কমায়।

> 🧠 **মনে রাখার ট্রিক:** Page → Component → Hook → Service → API → FastAPI — অর্ডার স্লিপ টেবিল থেকে রান্নাঘরে যাওয়ার পথ।

> ✅ **নিজেকে যাচাই করো:** login-এর loading/error দেখানো আর token save করার logic কোন layer-এ রাখা উচিত?
> <details><summary>উত্তর দেখো</summary>
> hook-এ। component শুধু UI দেখায়, service শুধু API call করে; loading/error/submit/redirect-এর মতো behavior logic hook-এ থাকে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-3"></a>

## 03. Frontend Layers: কোন component কেন ব্যবহার করছি

> 🎯 **এই section-এ বুঝব:** কোন কাজ কোন file/folder-এ রাখব, আর কেন — যাতে মুখস্থ না করে বুঝে রাখা যায়।

### 🗄️ আগে একটা গল্প

ভাবো তোমার ঘরের একটা বড় আলমারি। জামা এক তাকে, বই আরেক তাকে, ওষুধ আলাদা ড্রয়ারে। কেন? কারণ দরকারের সময় খুঁজে পাওয়া সহজ হয়। সব একসাথে গাদা করে রাখলে প্রতিবার খোঁজাখুঁজিতেই সময় শেষ।

Frontend-এর file/folder ঠিক আলমারির তাক — UI এক জায়গায়, logic আরেক জায়গায়, API call আলাদা জায়গায়।

### কেন এই ভাগাভাগি?

একটা কাজের জন্য সবসময় একটাই নির্দিষ্ট জায়গা থাকলে, নতুন code কোথায় লিখব বা পুরনো code কোথায় খুঁজব — কোনো দ্বিধা থাকে না। এটাই বড় project-কে পরিচ্ছন্ন রাখে।

Next.js app-এ অনেক file/folder থাকবে। এগুলো মুখস্থ করার আগে purpose বুঝতে হবে।

Core responsibility table:

| Name | কেন ব্যবহার করছি | কোথায় রাখবো |
|---|---|---|
| Page | route/screen create করতে | `src/app/.../page.tsx` |
| Layout | common shell, sidebar, navbar reuse করতে | `src/app/.../layout.tsx` |
| UI Component | button, input, card, modal reuse করতে | `src/components/ui/` |
| Feature Component | specific feature-এর UI রাখতে | `src/features/auth/components/` |
| Service | FastAPI API call এক জায়গায় রাখতে | `src/features/*/services/` |
| Hook | frontend behavior/state logic রাখতে | `src/features/*/hooks/` |
| Store | global frontend state রাখতে | `src/store/` |
| Type | API data shape বুঝাতে | `src/features/*/types/` |
| Schema | frontend form validation করতে | `src/features/*/schemas/` |
| Constant | route path/config duplicate না করতে | `src/constants/` |
| Lib | reusable setup/helper রাখতে | `src/lib/` |

Short memory:

```txt
UI দেখায় component
Logic ধরে hook
API call করে service
Global state ধরে store
Validation করে schema
Route বানায় page
```

যে প্রশ্ন নিজেকে করবো:

```txt
এটা কি UI? -> component
এটা কি API call? -> service
এটা কি loading/error/submit logic? -> hook
এটা কি অনেক জায়গায় লাগবে? -> shared component/lib
এটা কি শুধু এক feature-এর? -> features/<name>/
```

> 🧠 **মনে রাখার ট্রিক:** UI→component, logic→hook, call→service, global state→store, validation→schema, route→page। ছয়টা তাক, ছয় রকম জিনিস।

> ✅ **নিজেকে যাচাই করো:** submit করার সময়ের loading/error/submit logic কোথায় রাখবে?
> <details><summary>উত্তর দেখো</summary>
> hook-এ। এটা UI-ও না, API call-ও না — এটা behavior logic, তাই hook-এর তাকে যায়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-4"></a>

## 04. JavaScript, TypeScript এবং Async বুঝা

> 🎯 **এই section-এ বুঝব:** API response সাথে সাথে আসে না কেন, আর async/await দিয়ে কীভাবে অপেক্ষা করি — সাথে TypeScript কেন দরকার।

### ☕ আগে একটা গল্প

চায়ের দোকানে অর্ডার দিয়ে তুমি কি চা না আসা পর্যন্ত জমে দাঁড়িয়ে থাকো? না — অর্ডার দাও, পাশে বসে ফোন দেখো, চা হলে দোকানদার ডাক দেয়। এটাই **asynchronous**: কাজে সময় লাগবে জেনে অপেক্ষায় আটকে না থেকে অন্য কাজ চালিয়ে যাওয়া।

API call-ও তাই: request পাঠানোর পর network, database, auth সব হতে সময় লাগে। ততক্ষণ browser জমে থাকে না।

### কেন async জানা জরুরি?

result যেহেতু "পরে" আসে, তাই তোমাকে বলতে হয় "এই ডেটা না আসা পর্যন্ত পরের লাইনে যাব না" — সেটাই `await`। এটা না বুঝলে ডেটা আসার আগেই তুমি সেটা ব্যবহার করে ফেলবে, আর `undefined` error খাবে।

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
Frontend request পাঠায়
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

> 🧠 **মনে রাখার ট্রিক:** `await` = "চা না আসা পর্যন্ত পরের লাইনে যাব না"। Promise-এর তিন মুড: pending (চলছে), fulfilled (হয়ে গেছে), rejected (গণ্ডগোল)।

> ✅ **নিজেকে যাচাই করো:** দুটো API call একটা আরেকটার উপর নির্ভর করে না — একসাথে দ্রুত চালাতে কী ব্যবহার করবে?
> <details><summary>উত্তর দেখো</summary>
> `Promise.all([...])` দিয়ে parallel চালাবে। independent হলে একটার জন্য আরেকটাকে অপেক্ষা করানো (sequential await) শুধু সময় নষ্ট।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-5"></a>

## 05. Project Setup এবং Package Selection

> 🎯 **এই section-এ বুঝব:** project কীভাবে বানাই, আর কোন package কেন নিই (আর কোনটা নিই না)।

### 🛒 আগে একটা গল্প

রান্না শুরুর আগে বাজারে যাও। বুদ্ধিমান রাঁধুনি শুধু রেসিপিতে যা লাগবে তাই কেনে — অকারণে দশটা মশলা কিনে রান্নাঘর ভরায় না। প্রতিটা জিনিসের একটা কারণ থাকে।

Package install করাও তেমন: প্রতিটা package মানে extra ওজন। শুধু দরকারিগুলোই নাও।

### কেন "কেন" জিজ্ঞেস করা জরুরি?

অপ্রয়োজনীয় package project ভারী করে, security ঝুঁকি বাড়ায়, আর নতুন লোকের বুঝতে কষ্ট হয়। তাই প্রতিটা package-এর পাশে একটা উত্তর থাকা উচিত: "এটা ঠিক কোন কাজের জন্য?"

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

> 🧠 **মনে রাখার ট্রিক:** package install-এর আগে একটাই প্রশ্ন — "এটা কেন?" উত্তর না থাকলে কিনো না।

> ✅ **নিজেকে যাচাই করো:** `axios` আর `@tanstack/react-query` — এদের কাজ কি একই?
> <details><summary>উত্তর দেখো</summary>
> না। axios শুধু API call করার tool। react-query সেই ডেটার cache, loading/error state, refetch সব manage করে। একটা "পাঠায়", আরেকটা "সামলায়"।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-6"></a>

## 06. Folder Structure: Book-এর chapter-এর মতো সাজানো

> 🎯 **এই section-এ বুঝব:** folder-গুলো একটা বইয়ের মতো কীভাবে সাজাই, যাতে যেকোনো code সহজে খুঁজে পাওয়া যায়।

### 📚 আগে একটা গল্প

একটা ভালো বই খোলো — শুরুতে সূচিপত্র, তারপর অধ্যায়, প্রতিটা অধ্যায়ে নিজের বিষয়, শেষে পরিশিষ্ট। তুমি কোনো তথ্য খুঁজতে গেলে জানো কোন অধ্যায়ে যেতে হবে।

Frontend folder structure ঠিক তেমন: `app/` হলো অধ্যায় (routes), `features/` হলো এক একটা বিষয়, `components/` হলো ছবি/চিত্র যা বারবার লাগে, `lib/` হলো টুলবক্স।

### কেন এই সাজানো?

বই যদি এলোমেলো হতো — কোনো সূচি নেই, অধ্যায় নেই — পড়া অসম্ভব হতো। বড় project-ও তাই: নির্দিষ্ট structure থাকলে নতুন feature কোথায় যাবে, পুরনো code কোথায় আছে — সবাই জানে।

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

> 🧠 **মনে রাখার ট্রিক:** app=অধ্যায়, features=বিষয়, components=ছবি, lib=টুল, store=স্মৃতি, constants=স্থির নাম।

> ✅ **নিজেকে যাচাই করো:** auth-এর FastAPI call করার service ফাইল কোন folder-এ রাখবে?
> <details><summary>উত্তর দেখো</summary>
> `src/features/auth/services/`-এ। auth সম্পর্কিত সব কিছু auth folder-এ, আর API call service সাব-ফোল্ডারে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-7"></a>

## 07. App Router Basics: route, page, layout

> 🎯 **এই section-এ বুঝব:** App Router কীভাবে folder থেকে route বানায়, আর special file-গুলো (page/layout/loading/error) কী কাজ করে।

### 🚪 আগে একটা গল্প

ভাবো একটা বিল্ডিং। প্রতিটা **folder হলো একটা ঘর**, আর সেই ঘরের **`page.tsx` হলো দরজা/ঘর নম্বর** — এটা দিয়েই ভেতরে ঢোকা যায়। URL হলো ঠিকানা: `/dashboard` মানে dashboard ঘরের দরজায় যাওয়া।

আর `layout.tsx` হলো সব ঘরের **common সাজসজ্জা** — যেমন প্রতিটা ঘরে একই রকম করিডোর, একই দেয়ালের রং। navbar/sidebar এখানে থাকে বলে প্রতিটা page-এ বারবার লিখতে হয় না।

### কেন folder দিয়ে routing?

আলাদা করে route মুখস্থ configure করার বদলে Next.js বলে: "তুমি folder বানাও, আমি নিজেই route বানিয়ে দিচ্ছি।" এতে ঠিকানা আর কোথায় কী আছে — দুটো একসাথে মিলে যায়, খুঁজতে সুবিধা।

Next.js App Router folder দিয়ে route বানায়।

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

| বিষয় | App Router | Pages Router |
|---|---|---|
| Folder | `src/app/` | `src/pages/` |
| Route file | `page.tsx` | file name route হয় |
| Layout | nested `layout.tsx` | `_app.tsx`/custom pattern |
| Loading/error | built-in file convention | manually handle |
| New project | recommended | old/legacy projects |

Confusion clear:

```txt
src/app/login/page.tsx = App Router
src/pages/login.tsx    = Pages Router
```

> 🧠 **মনে রাখার ট্রিক:** folder = ঘর, `page.tsx` = দরজা, `layout.tsx` = সব ঘরের common সাজসজ্জা।

> ✅ **নিজেকে যাচাই করো:** `/users/123`-এর মতো dynamic route বানাতে কোন folder/file বানাবে?
> <details><summary>উত্তর দেখো</summary>
> `src/app/users/[id]/page.tsx`। `[id]` bracket দিয়ে Next.js বোঝে এই অংশটা পরিবর্তনশীল (123, 456 যেকোনো কিছু হতে পারে)।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-8"></a>

## 08. Role-Based Routing: auth, protected, admin, student

> 🎯 **এই section-এ বুঝব:** বড় app-এ role অনুযায়ী route কীভাবে সাজাই, আর route group `(bracket)` আসলে কী করে।

### 🏢 আগে একটা গল্প

বড় বিল্ডিংয়ে আলাদা floor: admin floor, teacher floor, student floor। প্রতিটা floor-এর নিজের ঘর আছে। আর `(auth)`, `(protected)` হলো ভেতরের **organizing label** — যেমন তুমি ফাইলে গোপন নোট লিখে রাখো নিজের সুবিধার জন্য, কিন্তু বাইরের ঠিকানায় সেটা দেখা যায় না।

### কেন route group?

বড় হলে সব page একসাথে থাকলে গুলিয়ে যায়। `(protected)`-এর মতো group দিয়ে সম্পর্কিত page একসাথে রাখা যায়, common layout share করা যায় — অথচ URL নোংরা হয় না, কারণ bracket folder ঠিকানায় আসে না। তবে মনে রেখো: এটা শুধু সাজানো, নিরাপত্তা নয়।

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
Route folder role অনুযায়ী সাজানো মানে security না।
Security FastAPI backend permission check দিয়ে হবে।
```

> 🧠 **মনে রাখার ট্রিক:** `(bracket)` folder URL-এ আসে না — এটা শুধু ভেতরের সাজানোর label, দরজার নম্বর নয়।

> ✅ **নিজেকে যাচাই করো:** admin/teacher/student folder আলাদা করে সাজালে কি app নিরাপদ হয়ে গেল?
> <details><summary>উত্তর দেখো</summary>
> না। folder সাজানো শুধু organization ও UX। আসল security আসে FastAPI backend-এর token/role/permission check থেকে — folder নাম কেউ চাইলে সরাসরি URL দিয়ে চেষ্টা করতে পারে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-9"></a>

## 09. Server Component vs Client Component

> 🎯 **এই section-এ বুঝব:** Server Component আর Client Component-এর পার্থক্য, আর কখন কোনটা বেছে নেব।

### 🍽️ আগে একটা গল্প

**Server Component হলো — রান্নাঘরে আগে থেকে প্লেট সাজিয়ে টেবিলে দিয়ে দেওয়া।** গ্রাহক বসেই তৈরি খাবার দেখে; কিছু করতে হয় না, তাই দ্রুত আর হালকা।

**Client Component হলো — টেবিলে বসে গ্রাহক নিজে যা করে।** বাটন চাপা, লবণ চাওয়া, ফর্ম পূরণ — এসব interaction টেবিলেই (browser-এ) ঘটে। এর জন্য file-এর শুরুতে `"use client"` লিখে বলে দিতে হয়: "এটা গ্রাহকের হাতের কাজ"।

### কেন default Server?

বেশিরভাগ জিনিস শুধু দেখানোর জন্য — আগে থেকে সাজিয়ে দিলেই হয়, তাতে দ্রুত load হয় আর browser-এ কম code পাঠাতে হয়। শুধু যেখানে সত্যিকারের interaction লাগে সেখানেই Client Component দরকার। তাই Next.js default-এ সব Server, তুমি প্রয়োজন হলে Client করো।

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
সব file-এ blindly "use client" দেওয়া।
```

এতে bundle size বাড়ে, performance কমতে পারে।

> 🧠 **মনে রাখার ট্রিক:** Server = আগে সাজানো প্লেট (দ্রুত, static); Client = টেবিলে গ্রাহকের হাতের কাজ (বাটন, useState → `"use client"`)।

> ✅ **নিজেকে যাচাই করো:** একটা counter, যেখানে button চাপলে সংখ্যা বাড়ে (`useState`) — এটা কোন ধরনের component?
> <details><summary>উত্তর দেখো</summary>
> Client Component। useState আর onClick browser-এর interaction, তাই file-এর শুরুতে `"use client"` দিতে হবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-10"></a>

## 10. Rendering, Caching এবং Server Cost

> 🎯 **এই section-এ বুঝব:** rendering-এর কোন choice কখন, আর caching কীভাবে server-এর কাজ কমায়।

### 🍲 আগে একটা গল্প

**Caching হলো — আগে বানিয়ে রাখা খাবার।** ব্যস্ত রেস্টুরেন্টে জনপ্রিয় খাবার আগেই কিছু বানিয়ে রাখা হয়, যাতে অর্ডার এলে সাথে সাথে দেওয়া যায় — রান্নাঘরের চাপ কমে। কিন্তু কারো ব্যক্তিগত/টাটকা অর্ডার (যেমন "আমার নিজের হিসাব") আগে বানিয়ে রাখা যায় না — সেটা প্রতিবার fresh বানাতে হয় (`no-store`)।

### কেন caching নিয়ে ভাবতে হয়?

প্রতিটা fetch যদি প্রতিবার backend-এ যায়, রান্নাঘরে (server) চাপ বাড়ে, খরচ বাড়ে, ধীর হয়। Public ডেটা (blog, products) আগে বানিয়ে রাখলে (revalidate) দ্রুত হয়। কিন্তু private ডেটা fresh লাগবেই। Next 15+ থেকে fetch default cache করে না — তাই cache চাইলে নিজে বলে দিতে হয়।

Server Component মানেই বেশি server cost না। Cost depend করে data fetching strategy-এর উপর।

Rendering choices:

| Situation | ভালো choice |
|---|---|
| About, Contact, public static page | Static Server Component |
| Public list, blog, products | Server Component + `revalidate` |
| Private dashboard/profile | dynamic fetch, `no-store`, auth |
| Search/filter/pagination | Client Component + React Query |
| Form/modal/sidebar | Client Component |

> **গুরুত্বপূর্ণ পরিবর্তন (Next.js 15+):** এখন `fetch()` **default-এ আর cache হয় না** (Next 14-এর উল্টো)। Cache চাইলে explicitly `next: { revalidate: N }` দিতে হবে। তাই "কিছু cache হচ্ছে না কেন" — এটা beginner-দের সবচেয়ে common confusion।

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

> 🧠 **মনে রাখার ট্রিক:** Public → আগে বানিয়ে রাখো (revalidate); Private → fresh বানাও (no-store)। Next 15+: cache চাইলে নিজে বলতে হবে।

> ✅ **নিজেকে যাচাই করো:** private dashboard-এর ডেটা fetch করছ — cache option কী দেবে?
> <details><summary>উত্তর দেখো</summary>
> `cache: "no-store"` (সাথে auth)। private ডেটা প্রতিবার fresh লাগবে; আগে বানিয়ে রাখা যাবে না, নইলে একজনের ডেটা আরেকজন দেখে ফেলতে পারে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-11"></a>

## 11. Environment Variables এবং FastAPI URL

> 🎯 **এই section-এ বুঝব:** FastAPI-র URL কোথায় রাখি, `NEXT_PUBLIC_` মানে কী, আর CORS কেন লাগে।

### 🪪 আগে একটা গল্প

ভাবো দুটো ঠিকানা লেখা কাগজ। একটা তুমি যে কাউকে দেখাতে পারো (public), আরেকটা শুধু ভেতরের লোকের জন্য গোপন। `NEXT_PUBLIC_` দিয়ে শুরু হওয়া env browser-ও দেখতে পায়; না দিয়ে শুরু হলে সেটা শুধু server-এর কাছে থাকে।

আর CORS হলো **দরজার দারোয়ান**: রান্নাঘর (backend) ঠিক করে কোন ঠিকানা (origin) থেকে আসা লোককে ভেতরে ঢুকতে দেবে।

### কেন এই আলাদা করা?

কিছু গোপন তথ্য (যেমন secret key) browser-এ গেলে বিপদ — তাই সেগুলো `NEXT_PUBLIC_` ছাড়া রাখতে হয়। আর দারোয়ান (CORS) ঠিক না থাকলে browser নিরাপত্তার কারণে অন্য origin-এর request আটকে দেয়।

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

| Variable | কোথায় use |
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

> 🧠 **মনে রাখার ট্রিক:** `NEXT_PUBLIC_` = browser-ও দেখে; ছাড়া = শুধু server। CORS = দরজার দারোয়ান, কোন origin ঢুকতে পারবে ঠিক করে।

> ✅ **নিজেকে যাচাই করো:** browser-এ চলা client component থেকে API URL দরকার — কোন env নাম ব্যবহার করবে?
> <details><summary>উত্তর দেখো</summary>
> `NEXT_PUBLIC_API_BASE_URL`। শুধু `NEXT_PUBLIC_` prefix থাকা env-ই browser-এ পৌঁছায়; server-only env browser থেকে পাওয়া যায় না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-12"></a>

## 12. API Client: Axios বা Fetch কেন আলাদা রাখবো

> 🎯 **এই section-এ বুঝব:** সব API call-এর common setup (baseURL, token, header) কেন এক জায়গায় রাখি।

### 🔑 আগে একটা গল্প

ভাবো তোমার বাড়ির সব চাবি এক গোছায় বাঁধা। প্রতিবার আলাদা করে চাবি খোঁজার বদলে গোছাটাই তুলে নাও। API client ঠিক সেই চাবির গোছা — baseURL, Authorization token, header সব এক জায়গায় বাঁধা থাকে।

আর interceptor হলো এমন একজন সহকারী যে **প্রতিটা request বেরোনোর আগে নিজে থেকে token জুড়ে দেয়** — তোমাকে প্রতিবার মনে রাখতে হয় না।

### কেন আলাদা রাখা?

যদি প্রতিটা service ফাইলে আলাদা করে baseURL, token লিখতে হয়, একটা বদলালে সব জায়গায় খুঁজে বদলাতে হবে — ভুল হবেই। এক জায়গায় থাকলে একবার বদলালেই সব ঠিক।

API client আলাদা রাখলে common setup এক জায়গায় থাকে।

কেন দরকার:

```txt
baseURL এক জায়গায়
Authorization token এক জায়গায়
withCredentials এক জায়গায়
error interceptor এক জায়গায়
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

> 🧠 **মনে রাখার ট্রিক:** api client = এক গোছা চাবি (baseURL + token + header)। interceptor = প্রতিটা request-এ auto token জুড়ে দেওয়া সহকারী।

> ✅ **নিজেকে যাচাই করো:** প্রতিটা request-এর header-এ token কে বসিয়ে দেয়?
> <details><summary>উত্তর দেখো</summary>
> request interceptor। তাই প্রতিটা service call-এ আলাদা করে token লিখতে হয় না — এক জায়গায় সেট করা থাকে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-13"></a>

## 13. Service Layer: Backend call-এর clean জায়গা

> 🎯 **এই section-এ বুঝব:** service layer-এর একমাত্র কাজ কী, আর কী কী এখানে ঢুকবে না।

### 🧑‍🍳 আগে একটা গল্প

ভাবো একজন ডেডিকেটেড ওয়েটার যার একটাই কাজ — অর্ডার স্লিপ রান্নাঘরে পৌঁছে দেওয়া। সে খাবার সাজায় না, টেবিল মোছে না, গ্রাহকের সাথে গল্প করে না। শুধু "এই অর্ডারটা ভেতরে দাও, উত্তরটা নিয়ে আসো"।

Service layer ঠিক সেই ওয়েটার — এর একমাত্র কাজ FastAPI endpoint call করা।

### কেন এত সীমিত কাজ?

যদি ওয়েটার রান্না-সাজানো-হিসাব সব করতে যায়, গুলিয়ে যাবে। service-এ শুধু API call রাখলে backend URL বা method বদলালে এক জায়গায় ঠিক করলেই হয়, আর UI/logic-এর সাথে মিশে থাকে না।

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

> 🧠 **মনে রাখার ট্রিক:** Service = শুধু endpoint call করা ওয়েটার। click/state/UI এখানে ঢুকবে না।

> ✅ **নিজেকে যাচাই করো:** form-এর input state কি service layer-এ রাখবে?
> <details><summary>উত্তর দেখো</summary>
> না। input state UI-এর সাথে যুক্ত — সেটা component/hook-এ থাকে। service শুধু endpoint, payload type, response type, method জানে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-14"></a>

## 14. TypeScript Types, Zod এবং FastAPI Pydantic

> 🎯 **এই section-এ বুঝব:** তিন জায়গায় validation কেন — Zod, TypeScript, আর Pydantic — কে কী কাজ করে।

### 🛂 আগে একটা গল্প

একটা নিরাপদ ভবনে ঢুকতে অনেক সময় তিন স্তরের চেক থাকে: গেটে একজন (ভদ্রভাবে জিজ্ঞেস করে), লিফটে কার্ড, আর দরজায় আসল তালা। প্রথম দুটো সুবিধা/সৌজন্যের জন্য; আসল নিরাপত্তা কিন্তু দরজার তালা।

Validation-ও তিন স্তর: **Zod** = user-কে সুন্দর error দেখানো, **TypeScript** = developer-এর ভুল ধরা, **Pydantic** = backend-এর আসল তালা।

### কেন backend-এর validation বাদ দেওয়া যায় না?

Zod browser-এ চলে, তাই user সেটা bypass করতে পারে (গেটের ভদ্র লোককে পাশ কাটানো যায়)। কিন্তু Pydantic backend-এ, user-এর নাগালের বাইরে — তাই সেটাই আসল রক্ষাকবচ।

Validation তিন জায়গায় ভাবতে হবে:

| Layer | Tool | Purpose |
|---|---|---|
| Frontend form | Zod | user-friendly error |
| Frontend code | TypeScript | developer safety |
| Backend API | Pydantic | real validation/security |

Zod schema:

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Valid email required"), // Zod 4: z.string().email() deprecated, এখন z.email()
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
Zod bypass করা যায়, কারণ browser user control করে।
Pydantic bypass করা যায় না, কারণ backend final gatekeeper।
```

Type naming:

```txt
LoginPayload  = frontend/backend request body
LoginResponse = backend response shape
User          = common data shape
```

> 🧠 **মনে রাখার ট্রিক:** Zod = user-friendly error, TypeScript = dev safety, Pydantic = আসল তালা। Zod bypass হয়, Pydantic হয় না।

> ✅ **নিজেকে যাচাই করো:** কেউ browser-এ Zod validation পাশ কাটিয়ে খারাপ ডেটা পাঠাল — কে সেটা আটকাবে?
> <details><summary>উত্তর দেখো</summary>
> FastAPI-র Pydantic (backend)। browser user-এর হাতে বলে Zod bypass করা যায়; backend-এর Pydantic সেই খারাপ ডেটা প্রত্যাখ্যান করে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-15"></a>

## 15. Custom Hook Layer: UI logic আলাদা করা

> 🎯 **এই section-এ বুঝব:** hook দিয়ে behavior logic (loading, error, submit) component থেকে কীভাবে আলাদা করি।

### 🎭 আগে একটা গল্প

মঞ্চে অভিনেতা যা দেখায় তা হলো UI (component)। কিন্তু পর্দার পেছনে একজন লোক আলো, শব্দ, cue সব সামলায় — দর্শক তাকে দেখে না, কিন্তু নাটক চলে তার জন্যই। **Hook হলো সেই পর্দার পেছনের লোক** — loading, error, submit, token save সব সামলায়, যাতে মঞ্চ (UI) পরিষ্কার থাকে।

### কেন hook দরকার?

সব logic component-এর ভিতরে ঢুকিয়ে দিলে UI code জটিল হয়, আর একই logic আরেক জায়গায় লাগলে copy-paste করতে হয়। hook-এ রাখলে সেই logic যেকোনো component reuse করতে পারে, আর test করাও সহজ।

Hook component থেকে behavior logic আলাদা করে।

Hook-এ রাখা যায়:

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
same login logic অন্য component-এ reuse করা যায়
loading/error centralized থাকে
test/debug সহজ হয়
```

> 🧠 **মনে রাখার ট্রিক:** Hook = পর্দার পেছনের লোক (behavior/logic); Component = মঞ্চে যা দেখা যায় (UI)।

> ✅ **নিজেকে যাচাই করো:** `loginUser()` call করা আর token save করার কাজটা কোথায় রাখবে?
> <details><summary>উত্তর দেখো</summary>
> hook-এ (যেমন `useLogin`)। এতে LoginForm UI পরিষ্কার থাকে, একই login logic অন্য জায়গায় reuse করা যায়, loading/error centralize হয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-16"></a>

## 16. Component Layer: UI clean রাখা

> 🎯 **এই section-এ বুঝব:** component-এর কাজ শুধু UI দেখানো ও user event ধরা — কেন এখানে API call রাখব না।

### 🪑 আগে একটা গল্প

Component হলো রেস্টুরেন্টের **সাজানো টেবিল** — গ্রাহক এখানে বসে, মেনু দেখে, বাটন চাপে, অর্ডার দেয়। কিন্তু টেবিল নিজে রান্না করে না; সে শুধু গ্রাহকের চাওয়াটা ভেতরে (hook/service-এ) পাঠিয়ে দেয়।

### কেন component-এ direct API call না?

টেবিলে যদি রান্নাঘরও বসিয়ে দাও, সব জট পাকিয়ে যাবে। component-এ যদি API call, token save, redirect সব ঢুকে যায় — UI নোংরা হয়, reuse কঠিন হয়, একই logic বারবার লিখতে হয়। তাই component শুধু "দেখাও আর event ধরো", বাকিটা hook/service-এ পাঠাও।

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
UI messy হয়
reuse কঠিন হয়
test কঠিন হয়
error/loading logic duplicate হয়
```

> 🧠 **মনে রাখার ট্রিক:** Component = সাজানো টেবিল — দেখাও ও event ধরো; আসল কাজ hook/service-এ পাঠিয়ে দাও।

> ✅ **নিজেকে যাচাই করো:** component-এর ভিতরে সরাসরি API call লিখলে কী সমস্যা হয়?
> <details><summary>উত্তর দেখো</summary>
> UI messy হয়, reuse ও test কঠিন হয়, আর error/loading logic বারবার duplicate হয়। তাই API call service-এ, logic hook-এ রাখা উচিত।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-17"></a>

## 17. Page Layer: route compose করা

> 🎯 **এই section-এ বুঝব:** page-এর কাজ কীভাবে route compose করা — সব logic নিজে না রেখে।

### 🖼️ আগে একটা গল্প

Page হলো রেস্টুরেন্টের একটা **সাজানো ঘরের ফ্রেম** — কোথায় টেবিল বসবে, কোথায় সাইনবোর্ড থাকবে সেটা ঠিক করে। কিন্তু ফ্রেম নিজে রান্না বা পরিবেশন করে না; সে শুধু ঠিক জায়গায় ঠিক জিনিস (feature component) বসিয়ে দেয়।

### কেন page হালকা রাখা?

Page-এর কাজ screen সাজানো আর metadata/SEO ঠিক করা, আর দরকার হলে server-side ডেটা আনা। সব API call, form state, business logic page-এ ঢোকালে সেটা ভারী ও অগোছালো হয়। component/hook/service-এ ভাগ করলে page পড়তে ও বুঝতে সহজ থাকে।

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
server-side data fetch করা যদি দরকার হয়
feature component বসানো
```

Page-এর কাজ না:

```txt
সব API call hardcode করা
সব form state রাখা
সব business logic রাখা
```

> 🧠 **মনে রাখার ট্রিক:** Page = ঘরের ফ্রেম — screen compose + metadata; business logic এখানে নয়।

> ✅ **নিজেকে যাচাই করো:** page-এর ভিতরে কি সব API call hardcode করে ফেলা উচিত?
> <details><summary>উত্তর দেখো</summary>
> না। page শুধু route screen compose করবে আর feature component বসাবে। API call service-এ, form/submit logic hook-এ থাকবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-18"></a>

## 18. React Query vs Zustand: কোনটা কখন

> 🎯 **এই section-এ বুঝব:** কোন ধরনের state React Query দিয়ে, আর কোনটা Zustand দিয়ে সামলাব।

### 🍱 আগে একটা গল্প

**React Query হলো — রান্নাঘর থেকে আনা খাবার সামলানো।** খাবার কোথা থেকে এলো, কতক্ষণ টাটকা থাকবে, বাসি হলে আবার আনতে হবে কিনা — এসব সে দেখে (server data, cache, refetch)।

**Zustand হলো — টেবিলের নিজের ছোট নোটবই।** গ্রাহক কী theme পছন্দ করছে, sidebar খোলা না বন্ধ, cart-এ কী আছে — এসব শুধু frontend-এর নিজের কথা, রান্নাঘরের সাথে সম্পর্ক নেই।

### কেন দুটো আলাদা tool?

Server data-র নিজস্ব ঝামেলা আছে (loading, error, cache, stale) — সেটার জন্য React Query বানানো। আর নিছক UI state (open/close, theme) সহজ, তার জন্য Zustand-এর ছোট নোটবইই যথেষ্ট। ভুল tool দিয়ে ভুল কাজ করলে অকারণ জটিলতা বাড়ে।

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

> 🧠 **মনে রাখার ট্রিক:** backend থেকে আসে? → React Query (আনা খাবার)। শুধু frontend UI? → Zustand (টেবিলের নোটবই)।

> ✅ **নিজেকে যাচাই করো:** sidebar খোলা/বন্ধ state কোথায় রাখবে?
> <details><summary>উত্তর দেখো</summary>
> Zustand-এ। এটা নিছক frontend UI state, backend থেকে আসে না — তাই React Query দরকার নেই।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-19"></a>

## 19. Params এবং Query Params

> 🎯 **এই section-এ বুঝব:** URL থেকে ডেটা দুইভাবে আসে — route param আর query param — কোনটা কখন।

### 🏨 আগে একটা গল্প

হোটেলে দুটো জিনিস আলাদা: **ঘর নম্বর** কোন ঘর সেটা চেনায় (route param — যেমন `/users/123`, কোন user)। আর ঘরের ভেতরের **setting** — AC কত, আলো কেমন — এগুলো ঐ ঘরকে চেনায় না, শুধু কীভাবে দেখাবে সেটা ঠিক করে (query param — যেমন `?search=phone&page=2`)।

### কেন এই পার্থক্য?

যা দিয়ে নির্দিষ্ট resource চেনা যায় সেটা path-এর অংশ (route param)। আর যা search/filter/sort/pagination-এর মতো "কীভাবে দেখাব" ঠিক করে, সেটা query param — এগুলো optional, বদলায়, একাধিক থাকতে পারে। গুলিয়ে ফেললে URL অগোছালো আর অর্থহীন হয়।

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

> 🧠 **মনে রাখার ট্রিক:** resource চেনায় → route param (ঘর নম্বর); filter/search/sort → query param (ঘরের setting)।

> ✅ **নিজেকে যাচাই করো:** `/products?search=phone`-এ `search` কোন ধরনের param?
> <details><summary>উত্তর দেখো</summary>
> query param। এটা কোনো নির্দিষ্ট product চেনায় না, শুধু list কীভাবে filter হবে সেটা ঠিক করে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-20"></a>

## 20. Auth, Route Guard এবং Real Security

> 🎯 **এই section-এ বুঝব:** authentication vs authorization-এর পার্থক্য, আর আসল security আসলে কোথায় থাকে।

### 💂 আগে একটা গল্প

Next.js-এর route guard (middleware/proxy) হলো **দরজার দারোয়ান** — কেউ token ছাড়া ঢুকতে চাইলে সে ভদ্রভাবে ফিরিয়ে দেয় (login-এ redirect করে)। কিন্তু দারোয়ান শুধু সামনের দরজা সামলায়; আসল **তালা-চাবি (permission)** থাকে ভেতরের ভল্টে = FastAPI backend-এ।

দুটো শব্দ আলাদা: **Authentication** = তুমি কে (পরিচয় যাচাই), **Authorization** = তুমি কী করতে পারবে (অনুমতি)।

### কেন frontend guard যথেষ্ট নয়?

দারোয়ানকে ফাঁকি দিয়ে কেউ সরাসরি ভল্টে হানা দিতে পারে — মানে API সরাসরি call করতে পারে, browser guard এড়িয়ে। তাই আসল যাচাই backend-এ থাকতেই হবে। frontend guard শুধু সুন্দর UX দেয়।

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

> **File-এর নাম গুরুত্বপূর্ণ:** Next.js 16-এ এই code `proxy.ts` file-এ থাকবে এবং function-এর নাম `proxy`। পুরনো Next.js 15-এ file-এর নাম `middleware.ts` এবং function-এর নাম `middleware`। ভুল file/নাম দিলে guard silently চলবে না।

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16: proxy.ts | Next.js 15: middleware.ts-এ function-এর নাম হবে middleware
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

> 🧠 **মনে রাখার ট্রিক:** Next guard = দারোয়ান (redirect/UX); FastAPI = ভল্টের তালা (আসল permission)। Next 16: `proxy.ts`, Next 15: `middleware.ts`।

> ✅ **নিজেকে যাচাই করো:** frontend route guard কি একাই যথেষ্ট security?
> <details><summary>উত্তর দেখো</summary>
> না। guard শুধু redirect/UX দেয় এবং bypass করা যায়। আসল security FastAPI-র token/role/permission check-এ enforce করতে হবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-21"></a>

## 21. Complete Login Flow: Page থেকে FastAPI পর্যন্ত

> 🎯 **এই section-এ বুঝব:** এতক্ষণ শেখা সব layer একসাথে জুড়ে একটা পূর্ণ login flow কীভাবে কাজ করে।

### 🍜 আগে একটা গল্প

এবার সব কর্মী একসাথে কাজ করবে: গ্রাহক টেবিলে অর্ডার দিল (Page/Form), ওয়েটার স্লিপ নিল (Hook), রান্নাঘরে পৌঁছাল (Service → api client), শেফ রান্না করে প্লেট ফেরত দিল (FastAPI → token), আর গ্রাহক খাবার পেল (dashboard-এ redirect)। এক সুতোয় গাঁথা পুরো যাত্রা।

### কেন পুরো flow একবার দেখা জরুরি?

আলাদা আলাদা layer বুঝলেও, একসাথে কীভাবে হাত বদলায় সেটা দেখলে ছবিটা পূর্ণ হয় — কোন ডেটা কোথায় তৈরি হয়, token কোথায় জন্মায় আর কোথায় সংরক্ষিত হয়, সব পরিষ্কার হয়।

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

যদি HTTP-only cookie auth use করা হয়:

```txt
Frontend token localStorage-এ রাখবে না
FastAPI response cookie set করবে
Axios/fetch withCredentials use করবে
CORS allow_credentials=True লাগবে
```

> 🧠 **মনে রাখার ট্রিক:** Page → Form → Hook → Service → api → FastAPI — একটাই সরল সুতো, অর্ডার থেকে পরিবেশন পর্যন্ত।

> ✅ **নিজেকে যাচাই করো:** HTTP-only cookie auth ব্যবহার করলে token কোথায় রাখবে?
> <details><summary>উত্তর দেখো</summary>
> localStorage-এ নয়। FastAPI response-এ cookie সেট করবে, আর Axios/fetch `withCredentials` ব্যবহার করবে (CORS-এ `allow_credentials=True` লাগবে)।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-22"></a>

## 22. Development Rules, Checklist এবং Summary

> 🎯 **এই section-এ বুঝব:** পুরো tutorial-এর মূল নিয়মগুলো এক জায়গায় গেঁথে নিয়ে মনে রাখার মতো করে সাজাব।

### ✅ আগে একটা গল্প

রান্নাঘর বন্ধ করার আগে ভালো শেফ একটা checklist মেলায়: গ্যাস বন্ধ? বাসন ধোয়া? স্টক ঠিক? প্রতিটা টিক দিয়ে নিশ্চিত হয় কিছু বাদ পড়েনি। এই section সেই checklist — সব শেখা নিয়ম একবার মিলিয়ে নেওয়া।

### কেন checklist?

বড় app-এ সিদ্ধান্ত অনেক; নিয়মগুলো এক জায়গায় থাকলে প্রতিবার ভাবতে হয় না, ভুলও কম হয়। এটা তোমার দ্রুত রেফারেন্স।

Rules:

1. Component-এর ভিতরে direct API call লিখবো না।
2. API call `services/` folder-এ রাখবো।
3. Loading/error/submit logic `hooks/` folder-এ রাখবো।
4. Feature-specific code `features/<feature>/` folder-এ রাখবো।
5. Reusable UI `components/ui/` folder-এ রাখবো।
6. `"use client"` শুধু দরকার হলে দেবো।
7. Server Component দিয়ে শুরু করবো, interaction দরকার হলে Client Component করবো।
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
20. Project বড় হলে role-based route group ব্যবহার করবো।

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

এই sequence follow করলে frontend note একটা বইয়ের মতো পড়া যায়: আগে concept, তারপর structure, তারপর data flow, তারপর auth/security, শেষে rules।

> 🧠 **মনে রাখার ট্রিক:** UI→component, logic→hook, call→service, validation: Zod (সৌজন্য) + Pydantic (আসল), guard: Next (UX) + FastAPI (security)।

> ✅ **নিজেকে যাচাই করো:** পুরো tutorial-এর সবচেয়ে বড় security নিয়মটা এক লাইনে বলো।
> <details><summary>উত্তর দেখো</summary>
> Next.js-এর route guard শুধু UX/redirect — আসল security সবসময় FastAPI backend-এ token/role/permission দিয়ে enforce করতে হবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)
