# Docker Tutorial for Next.js, FastAPI, and PostgreSQL

এই note-টা Docker শেখার জন্য। Example full-stack project হিসেবে ধরা হয়েছে **Next.js frontend**, **FastAPI backend**, এবং **PostgreSQL database**।

Main goal:

```txt
Docker কেন দরকার বুঝা
Image, container, Dockerfile, volume, network-এর relation বুঝা
একটা app containerize করা
Docker Compose দিয়ে frontend, backend, database একসাথে run করা
Development এবং production setup-এর difference বুঝা
Project বড় হলেও Docker configuration clean, secure, maintainable রাখা
```

Learning order:

```txt
Concept -> Image -> Container -> Dockerfile -> Storage -> Network -> Compose -> Development -> Production -> Deployment
```

Important:

```txt
Docker app-এর code বা architecture ঠিক করে না।
Docker app এবং তার runtime/dependency-কে repeatable package হিসেবে run করতে help করে।
```

<a id="index"></a>

## Index

<!-- tutorial-index:start -->
- [01. Big Picture: Docker আসলে কী problem solve করে](#section-1)
- [02. Container vs Virtual Machine](#section-2)
- [03. Docker Architecture: Client, Engine, Registry](#section-3)
- [04. Image, Container, Dockerfile, Registry Relation](#section-4)
- [05. Installation এবং First Check](#section-5)
- [06. First Container এবং Essential Commands](#section-6)
- [07. Dockerfile Building Blocks: কোন instruction কেন](#section-7)
- [08. FastAPI Backend Dockerfile with uv](#section-8)
- [09. Next.js Frontend Dockerfile](#section-9)
- [10. Build Context, Layer Cache, এবং .dockerignore](#section-10)
- [11. Port Mapping, localhost, এবং 0.0.0.0](#section-11)
- [12. Container Storage: Volume vs Bind Mount](#section-12)
- [13. Docker Network এবং Service Name DNS](#section-13)
- [14. Docker Compose: Multi-Container App](#section-14)
- [15. Full-Stack Project Structure](#section-15)
- [16. Complete Development Compose Setup](#section-16)
- [17. Environment Variables, Config, এবং Secrets](#section-17)
- [18. PostgreSQL Persistence, Migration, এবং Backup](#section-18)
- [19. Healthcheck, depends_on, এবং Startup Readiness](#section-19)
- [20. Development Workflow এবং Hot Reload](#section-20)
- [21. Production Images: Multi-Stage, Small, Non-Root](#section-21)
- [22. Logs, Shell, Inspection, এবং Debugging](#section-22)
- [23. Testing, CI, Tagging, এবং Registry](#section-23)
- [24. Deployment, Scaling, এবং Docker-এর Boundary](#section-24)
- [25. Cleanup, Disk Usage, এবং Safe Reset](#section-25)
- [26. Development Rules, Checklist, এবং Summary](#section-26)
<!-- tutorial-index:end -->

---

<a id="section-1"></a>

## 01. Big Picture: Docker আসলে কী problem solve করে

> 🎯 **এই section-এ বুঝব:** Docker কোন সমস্যা সমাধান করে, আর কেন সবাই এটা ব্যবহার করে। (এখনো একটাও command মুখস্থ করা লাগবে না — শুধু "কেন" বুঝব।)

### 🍰 আগে একটা গল্প

ভাবো তুমি দারুণ একটা কেক বানালে তোমার রান্নাঘরে। বন্ধুকে বললে, "তুমিও বানাও!" সে বানাতে গিয়ে দেখল তার ওভেন আলাদা, ময়দার ব্র্যান্ড আলাদা, চিনির মাপ আলাদা। ফল: তার কেক তোমার মতো হলো না। 😅

Developer-দের জীবনে এই ঘটনাই বারবার ঘটে। তুমি তোমার ল্যাপটপে app বানালে, চলল দিব্যি; বন্ধুর মেশিনে দিলে চলে না। বিখ্যাত সেই বাক্য তখন বের হয়: **"কিন্তু আমার মেশিনে তো চলছিল!"**

Docker এই সমস্যারই সমাধান। Docker বলে: *"শুধু কেক পাঠিও না — পুরো রান্নাঘরটাই একটা বাক্সে ভরে পাঠাও।"* ওভেন, ময়দা, মাপ সব একসাথে। তাহলে যেকোনো জায়গায় হুবহু একই কেক হবে।

### কেন এই সমস্যা হয়?

একটা full-stack app চালাতে অনেক আলাদা জিনিস (dependency) লাগে:

```txt
Next.js-এর জন্য Node.js
FastAPI-এর জন্য Python এবং Python packages
Database-এর জন্য PostgreSQL
Optional Redis, worker, vector DB
ঠিক environment variables
ঠিক runtime version
```

এত জিনিস প্রতিটা মেশিনে হাতে হাতে মেলানো কঠিন। তাই Docker ছাড়া বারবার এই যন্ত্রণাগুলো হয় — খেয়াল করো, প্রতিটার মূল কারণ একটাই: **সবার environment আলাদা**:

```txt
আমার machine-এ চলে, অন্য developer-এর machine-এ চলে না
Node/Python/PostgreSQL version mismatch
এক project-এর dependency আরেক project-এর সাথে conflict করে
নতুন developer-এর local setup করতে অনেক সময় লাগে
local, CI, এবং production environment আলাদা behave করে
```

Docker approach:

```txt
Frontend runtime + dependency -> frontend image
Backend runtime + dependency  -> backend image
PostgreSQL runtime            -> official database image

প্রতিটা image থেকে isolated container run
Compose দিয়ে সব container একসাথে manage
```

Full-stack mental model:

```txt
Browser
  -> localhost:3000
  -> Next.js container
  -> backend:8000
  -> FastAPI container
  -> db:5432
  -> PostgreSQL container
  -> named volume
```

Docker-এর main benefit:

| Benefit | Meaning |
|---|---|
| Consistency | একই image local, CI, server-এ run করা যায় |
| Isolation | প্রতিটা service নিজের dependency নিয়ে চলে |
| Repeatability | config file থেকে environment আবার create করা যায় |
| Portability | compatible container runtime থাকলে image run করা যায় |
| Fast onboarding | পুরো stack এক command-এ start করা যায় |
| Clean host | host machine-এ সব database/runtime install করতে হয় না |

Docker কী করে না:

```txt
খারাপ code ভালো করে না
database backup automatically design করে না
secret management automatically secure করে না
production orchestration/monitoring-এর সব problem solve করে না
container image বানালেই app scalable হয়ে যায় না
```

> 🧠 **মনে রাখার ট্রিক:** Docker = "রান্নাঘরসহ কেক পাঠানো"। এটা তোমার recipe (code) ভালো বানায় না — কিন্তু নিশ্চিত করে যে recipe **সব জায়গায় একই ভাবে** রান্না হবে।

> ✅ **নিজেকে যাচাই করো:** তোমার বন্ধুর কম্পিউটারে তোমার app চলছে না, কারণ তার Python version আলাদা। Docker এটা কীভাবে ঠেকাবে?
> <details><summary>উত্তর দেখো</summary>
> Docker image-এর ভিতরেই সঠিক Python version প্যাক করা থাকে। বন্ধু সেই image চালালে তার মেশিনের Python লাগেই না — বাক্সের ভিতরের version-টাই চলে। তাই version mismatch হওয়ার সুযোগ নেই।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-2"></a>

## 02. Container vs Virtual Machine

> 🎯 **এই section-এ বুঝব:** Container আর Virtual Machine (VM) — দুটোই "আলাদা করে রাখা" (isolation) দেয়, কিন্তু কীভাবে আলাদা, আর কেন container হালকা।

### 🏠 আগে একটা গল্প

ভাবো একটা বড় বিল্ডিং। **VM** হলো — প্রতিটা ভাড়াটের জন্য আলাদা আলাদা **পুরো বাড়ি** বানানো: আলাদা ছাদ, আলাদা পানির লাইন, আলাদা বিদ্যুৎ (= প্রত্যেকের নিজের আলাদা OS)। খুবই নিরাপদ, কিন্তু জায়গা আর খরচ প্রচুর, বানাতে সময় লাগে।

**Container** হলো — একই বিল্ডিংয়ের ভেতর আলাদা আলাদা **ফ্ল্যাট**: ছাদ, পানি, বিদ্যুৎ (= OS kernel) সবাই শেয়ার করে, কিন্তু প্রতিটা ফ্ল্যাটের দরজা আলাদা, ভেতরে কে থাকে অন্যরা দেখে না। তাই ফ্ল্যাট বানানো সস্তা, দ্রুত, আর অনেকগুলো একসাথে রাখা যায়।

এখন technical কথায় আসি:

Virtual Machine এবং container দুটোই isolation দেয়, কিন্তু level আলাদা।

Virtual Machine:

```txt
Physical/Cloud Host
  -> Hypervisor
  -> Guest OS
  -> Runtime
  -> App
```

Container:

```txt
Physical/Cloud Host
  -> Host OS kernel
  -> Container runtime
  -> Isolated process + app filesystem
```

Difference:

| বিষয় | Container | Virtual Machine |
|---|---|---|
| কী package করে | app, runtime, libraries | full guest operating system |
| Kernel | host kernel share করে | নিজের guest kernel থাকে |
| Startup | সাধারণত দ্রুত | তুলনামূলক slow |
| Size | সাধারণত ছোট | সাধারণত বড় |
| Isolation | process/container level | machine/OS level |
| Common use | app/service packaging | full OS/environment isolation |

Container-কে lightweight VM বলা convenient, কিন্তু technically exact না।

```txt
VM = একটা complete machine-এর abstraction
Container = isolated process এবং filesystem-এর abstraction
```

Linux container Linux kernel-এর feature use করে। Windows/macOS-এ Docker Desktop সাধারণত managed Linux VM-এর ভিতরে Linux containers run করায়।

VM এবং Docker একসাথেও use হয়:

```txt
Cloud VM
  -> Docker Engine
  -> frontend container
  -> backend container
  -> database container
```

Security lesson:

```txt
Container isolated হলেও security boundary perfect না।
Untrusted image run করবো না।
Unnecessary privileged mode use করবো না।
Host Docker socket container-এ mount করবো না, unless strong reason আছে।
```

> 🧠 **মনে রাখার ট্রিক:** VM = আলাদা **বাড়ি** (নিজের OS)। Container = একই বাড়ির আলাদা **ফ্ল্যাট** (kernel শেয়ার)। ফ্ল্যাট সস্তা ও চটপট — তাই container হালকা আর দ্রুত চালু হয়।

> ✅ **নিজেকে যাচাই করো:** ১০টা container চালালে কি ১০টা OS চালু হয়?
> <details><summary>উত্তর দেখো</summary>
> না। ১০টা container একই host OS kernel শেয়ার করে (একই বাড়ির ১০টা ফ্ল্যাট)। কিন্তু ১০টা VM মানে ১০টা আলাদা guest OS — অনেক বেশি RAM/জায়গা লাগে। এই কারণেই একটা মেশিনে অনেক container চালানো যায়, কিন্তু অত VM নয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-3"></a>

## 03. Docker Architecture: Client, Engine, Registry

> 🎯 **এই section-এ বুঝব:** "Docker" আসলে একটা জিনিস নয় — কয়েকটা অংশ মিলে কাজ করে। কে হুকুম দেয়, কে আসল কাজ করে, আর ছবিগুলো (image) কোথায় জমা থাকে।

### 🍽️ আগে একটা গল্প — রেস্টুরেন্ট

ভাবো তুমি রেস্টুরেন্টে বসে আছ:

- তুমি **ওয়েটারকে** অর্ডার দাও — এই যে হুকুম দেওয়া, এটাই **Docker CLI** (`docker ...` command)।
- ওয়েটার তোমার অর্ডার **রান্নাঘরে** পৌঁছে দেয় — এটাই **Docker API**।
- **রান্নাঘর/শেফ** আসল রান্নাটা করে — খাবার বানায়, প্লেট সাজায়। এটাই **Docker daemon (Engine)** — সব আসল কাজ এখানেই হয়।
- দরকারি **উপকরণ যে গুদামে** থাকে, দরকার হলে আনানো হয় — এটাই **Registry** (image-এর গুদাম, যেমন Docker Hub)।

মজার ব্যাপার: তুমি (CLI) কখনো নিজে রান্না করো না। তুমি শুধু বলো "এটা চাই", আর daemon (শেফ) সেটা করে দেয়। এটাই মনে রাখলে অনেক confusion কেটে যাবে।

এখন মিলিয়ে নাও:

Docker use করার সময় কয়েকটা component একসাথে কাজ করে:

```txt
Docker CLI
  -> Docker API
  -> Docker daemon / Engine
  -> image, container, network, volume manage

Docker Registry
  -> image store/distribute
```

Responsibility:

| Component | কাজ |
|---|---|
| Docker CLI | `docker ...` command নেয় |
| Docker daemon | build/run/stop/network/volume-এর real কাজ করে |
| Docker Desktop | desktop app, Engine, CLI, Compose integration দেয় |
| Docker Compose | multiple service declaratively manage করে |
| Registry | image push/pull করার remote storage |
| Docker Hub | default public registry |

Example:

```bash
docker run nginx:alpine
```

Behind the scenes:

```txt
1. CLI daemon-কে request পাঠায়
2. image local-এ না থাকলে registry থেকে pull হয়
3. image থেকে container create হয়
4. writable container layer add হয়
5. network attach হয়
6. image-এর default process start হয়
```

Useful version checks:

```bash
docker version
docker info
docker compose version
```

Difference:

```txt
docker version = client এবং server version
docker info    = Engine, storage, container/image summary
```

Modern command:

```bash
docker compose up
```

Old tutorials-এ পাওয়া যেতে পারে:

```bash
docker-compose up
```

এই tutorial-এ Compose V2-এর `docker compose` syntax use করা হবে।

> 🧠 **মনে রাখার ট্রিক:** তুমি (CLI) = অর্ডার দাও। Engine/daemon = শেফ, আসল কাজ করে। Registry = উপকরণের গুদাম। তুমি কখনো নিজে রান্না করো না — শুধু হুকুম দাও।

> ✅ **নিজেকে যাচাই করো:** তুমি `docker run nginx` লিখলে, কিন্তু nginx image তোমার মেশিনে নেই। কী হবে?
> <details><summary>উত্তর দেখো</summary>
> CLI তোমার হুকুম daemon-কে দেবে। daemon দেখবে image local-এ নেই, তাই **Registry** (Docker Hub) থেকে সেটা pull (আনানো) করবে, তারপর container বানিয়ে চালাবে। মানে গুদামে গিয়ে উপকরণ এনে তবেই রান্না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-4"></a>

## 04. Image, Container, Dockerfile, Registry Relation

> 🎯 **এই section-এ বুঝব:** Docker শেখার সবচেয়ে বিভ্রান্তিকর ৪টা শব্দ — Dockerfile, Image, Container, Registry — একে অপরের সাথে কীভাবে জড়িত। এই একটা section বুঝলে অর্ধেক Docker বোঝা হয়ে যায়।

### 🍰 কেকের গল্পটা মনে আছে?

Section ১-এর কেকের গল্পে ফিরি — এই ৪টা শব্দ ঠিক কেক বানানোর ধাপগুলোর মতো:

- **Dockerfile** = কেকের **রেসিপি** (লেখা নির্দেশনা: কী কী লাগবে, কীভাবে বানাবে)।
- **Image** = রেসিপি অনুযায়ী বানানো **প্যাকেটজাত, রিইউজেবল ছাঁচ** — একবার বানালে বারবার একই কেক বের করা যায়।
- **Container** = সেই ছাঁচ থেকে বের হওয়া **আসল, গরম, পরিবেশন-করা কেক** (চলমান app)।
- **Registry** = প্যাকেটজাত ছাঁচ রাখার **গুদাম**, যেখান থেকে অন্যরাও নিতে পারে।

এই চারটা word clear হলে Docker-এর half confusion চলে যায়।

```txt
Dockerfile
  -> docker build
  -> Image
  -> docker run
  -> Container

Image
  -> docker push
  -> Registry
  -> docker pull
  -> অন্য machine-এর local image
```

Simple definitions:

| Term | Meaning |
|---|---|
| Dockerfile | image কীভাবে build হবে তার recipe |
| Image | read-only, versioned application package/template |
| Container | image-এর running instance |
| Registry | images store/share করার server |
| Tag | image version/name label |
| Layer | image filesystem change-এর cached step |

Analogy:

```txt
Dockerfile = cake recipe
Image      = তৈরি cake-এর reusable mold/package
Container  = সেই image থেকে চলমান serving
Registry   = packaged image রাখার warehouse
```

এক image থেকে multiple container:

```txt
my-api:1.0 image
  -> api-container-1
  -> api-container-2
  -> api-container-3
```

Image immutable:

```txt
existing image edit করি না
Dockerfile/code change করে new image build করি
new tag/digest দিয়ে identify করি
```

Container-এর writable layer temporary। Container remove হলে volume/bind mount-এ না থাকা change হারিয়ে যায়।

Image naming:

```txt
repository/name:tag

ai-dream/backend:1.0.0
ai-dream/backend:git-a1b2c3d
postgres:18-alpine
```

Important:

```txt
latest কোনো guarantee না যে image tested, newest, বা production-ready।
Production deploy-এ explicit version tag, এবং stronger reproducibility লাগলে digest pin করা ভালো।
```

> 🧠 **মনে রাখার ট্রিক:** **রে-ছাঁ-ক-গু** → **রে**সিপি (Dockerfile) → **ছাঁ**চ (Image) → **ক**েক (Container) → **গু**দাম (Registry)। `build` = রেসিপি থেকে ছাঁচ, `run` = ছাঁচ থেকে কেক।

> ✅ **নিজেকে যাচাই করো:** এক Image থেকে কি ৩টা Container বানানো যায়? আর Container বন্ধ করে দিলে তার ভেতরের ডেটা কি Image-এ ফিরে যায়?
> <details><summary>উত্তর দেখো</summary>
> হ্যাঁ — এক ছাঁচ (Image) থেকে অনেকগুলো কেক (Container) বানানো যায়, সবাই একই রকম হয়। কিন্তু Image **immutable** (অপরিবর্তনীয়) — Container-এর ভেতরে যা লেখা হয় তা Image-এ ফেরে না; Container মুছে দিলে (volume ছাড়া) সেই ডেটা হারিয়ে যায়। ডেটা ধরে রাখতে volume লাগে (পরে section ১২-তে)।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-5"></a>

## 05. Installation এবং First Check

> 🎯 **এই section-এ বুঝব:** Docker নিজের মেশিনে কীভাবে বসাই, আর বসানোর পর সত্যিই কাজ করছে কিনা কীভাবে যাচাই করি।

### 🧰 আগে একটা গল্প — নতুন রান্নাঘর বসানো

Docker install করা মানে বাসায় একটা আস্ত নতুন রান্নাঘর (kitchen) বসানো। রান্নাঘর বসানোর পর কোনো experienced রাঁধুনি সাথে সাথে কঠিন রান্না চাপায় না — আগে চুলাটা একবার জ্বালিয়ে দেখে ঠিকমতো আগুন আসে কিনা। Docker-এর সেই "চুলা জ্বালিয়ে দেখা" হলো `docker run --rm hello-world` — একদম ছোট্ট একটা container যেটা শুধু "আমি চলছি!" বলে বন্ধ হয়ে যায়।

### কেন verify করা জরুরি

Windows আর macOS-এ Docker আসলে ভেতরে ভেতরে একটা ছোট Linux মেশিন চালায় (মনে আছে? container-দের একটা Linux kernel দরকার — section ২)। তাই install হলেই যে Engine (শেফ) জেগে আছে তা নয়। `docker version` আর `hello-world` চালিয়ে নিশ্চিত হই যে CLI (ওয়েটার) আর daemon (শেফ) দুজনেই কথা বলছে — তারপরই আসল কাজে নামি।

Windows/macOS beginner setup:

```txt
Docker Desktop install
Docker Desktop start
WSL2-based engine use করা, যদি Windows হয়
Terminal restart
```

Linux-এ দুইটা common option:

```txt
Docker Desktop
Docker Engine + Compose plugin
```

Installation command সময়ের সাথে এবং operating system অনুযায়ী change হতে পারে। তাই official installation page follow করতে হবে:

```txt
https://docs.docker.com/get-docker/
```

Install verify:

```bash
docker version
docker compose version
docker run --rm hello-world
```

`hello-world` flow:

```txt
image pull
container create
message print
process exit
--rm থাকার কারণে stopped container remove
```

Linux permission issue হলে common error:

```txt
permission denied while trying to connect to Docker daemon socket
```

Possible reasons:

```txt
Docker service চলছে না
current user-এর permission নেই
Docker context ভুল
```

Check:

```bash
docker context ls
docker info
```

Docker group access security-sensitive, কারণ Docker daemon control করা effectively host-এ high privilege দিতে পারে। Blindly permission command copy না করে official Linux post-install guide এবং team policy follow করতে হবে।

Windows/WSL project performance:

```txt
WSL-based development হলে project WSL filesystem-এর ভিতরে রাখা সাধারণত better।
Windows filesystem bind mount করলে কিছু project-এ file watching/I/O slow হতে পারে।

> 🧠 **মনে রাখার ট্রিক:** Install করলেই হয় না — **চুলা জ্বালিয়ে দেখো**। `hello-world` চললে বুঝবে পুরো chain (CLI → API → Engine → Registry) ঠিক আছে।

> ✅ **নিজেকে যাচাই করো:** `docker run --rm hello-world` চালানোর পর container-টা `docker ps`-এ দেখা যায় না কেন?
> <details><summary>উত্তর দেখো</summary>
> কারণ `hello-world` তার message print করেই কাজ শেষ করে বন্ধ (exit) হয়ে যায়, আর `--rm` flag বন্ধ হওয়া container-টাকে সাথে সাথে মুছে দেয়। `docker ps` শুধু চলমান container দেখায়, তাই ওটা সেখানে নেই। (`docker ps -a` দিলেও নেই, কারণ `--rm` মুছে ফেলেছে।)</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-6"></a>

## 06. First Container এবং Essential Commands

> 🎯 **এই section-এ বুঝব:** প্রথম নিজের হাতে একটা container চালানো, আর রোজকার দরকারি command গুলো — চালু, বন্ধ, দেখা, ভেতরে ঢোকা।

### 🚗 আগে একটা গল্প — গাড়ি চালানো শেখা

Container চালানো অনেকটা গাড়ি চালানোর মতো। প্রথমে স্টার্ট দাও (`run`/`start`), দরকার হলে থামাও (`stop`), আবার চালু করো (`restart`), আর পুরনো গাড়ি ফেলে দাও (`rm`)। ভেতরে কী হচ্ছে জানতে dashboard দেখো (`logs`), আর ইঞ্জিনের ভেতরে হাত দিতে হলে বনেট খুলে ঢোকো (`exec -it ... sh`)। এই কয়েকটা "পেডাল" শিখে গেলে যেকোনো container সামলাতে পারবে।

### কেন এই command গুলো বারবার লাগবে

একটা image (ছাঁচ) থেকে container (কেক) বানানোর পর তোমাকে সেটার সাথে কথা বলতে হবে — সে চলছে কিনা দেখা, কী বলছে শোনা, ভেতরে গিয়ে খোঁজ নেওয়া। `-d` মানে background-এ চালাও (গাড়ি চলুক, তুমি অন্য কাজ করো), আর `--name` দিলে container-টাকে নাম ধরে ডাকা যায়, random id মনে রাখতে হয় না।

Nginx container run:

```bash
docker run --name demo-web -d -p 8080:80 nginx:alpine
```

Flag meaning:

| Flag | কাজ |
|---|---|
| `--name demo-web` | readable container name |
| `-d` | background/detached mode |
| `-p 8080:80` | host port 8080 -> container port 80 |
| `nginx:alpine` | image এবং tag |

Browser:

```txt
http://localhost:8080
```

Container list:

```bash
docker ps
docker ps -a
```

Difference:

```txt
docker ps    = running containers
docker ps -a = running + stopped containers
```

Lifecycle:

```bash
docker stop demo-web
docker start demo-web
docker restart demo-web
docker rm demo-web
```

Running container force remove সাধারণত avoid করবো:

```bash
docker rm -f demo-web
```

Logs:

```bash
docker logs demo-web
docker logs -f --tail 100 demo-web
```

Container-এর ভিতরে shell:

```bash
docker exec -it demo-web sh
```

সব image-এ `bash` থাকে না। Alpine/minimal image-এ অনেক সময় `sh` use করতে হয়।

Image commands:

```bash
docker image ls
docker pull nginx:alpine
docker image inspect nginx:alpine
docker image rm nginx:alpine
```

Run one-off command:

```bash
docker run --rm python:3.13-slim python --version
docker run --rm node:24-alpine node --version
```

Useful naming rule:

```txt
image = noun/package
container = running instance

docker image ls
docker container ls
```

Short aliases like `docker ps` common, কিন্তু full object-based commands docs/script-এ clearer হতে পারে।

> 🧠 **মনে রাখার ট্রিক:** `run` = নতুন গাড়ি স্টার্ট, `start/stop/restart` = পুরনোটা চালু/বন্ধ, `logs` = dashboard, `exec -it sh` = বনেট খুলে ভেতরে ঢোকা, `rm` = গাড়ি ফেলে দেওয়া।

> ✅ **নিজেকে যাচাই করো:** `docker exec -it demo-web bash` দিলে error এলো, কিন্তু `sh` দিলে কাজ করল — কেন?
> <details><summary>উত্তর দেখো</summary>
> Alpine-এর মতো ছোট (minimal) image-এ জায়গা বাঁচাতে `bash` রাখা হয় না, শুধু হালকা `sh` থাকে। তাই ওই container-এ `bash` খুঁজে পায় না। ছোট image-এ ভেতরে ঢুকতে হলে `sh` ব্যবহার করতে হবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-7"></a>

## 07. Dockerfile Building Blocks: কোন instruction কেন

> 🎯 **এই section-এ বুঝব:** Dockerfile (রেসিপি)-র প্রতিটা লাইন কী করে, আর কোন লাইন build-এর সময় চলে বনাম কোনটা container চালু হওয়ার সময়।

### 📝 আগে একটা গল্প — রেসিপি কার্ড

মনে আছে section ৪-এর কথা? Dockerfile হলো কেকের **রেসিপি কার্ড**। এখন সেই কার্ডটা খুলে প্রতিটা লাইন পড়ছি। ভাবো একটা রেসিপি: "এই বেস ময়দা নাও (`FROM`) → এই টেবিলে কাজ করো (`WORKDIR`) → উপকরণ এনে রাখো (`COPY`) → এখন মেশাও/সেঁকো (`RUN`) → পরিবেশনের সময় এভাবে সাজাও (`CMD`)।" প্রতিটা instruction রেসিপির একটা ধাপ।

### কেন RUN আর CMD গুলিয়ে ফেলা বিপজ্জনক

সবচেয়ে বড় confusion এখানেই: `RUN` চলে **ছাঁচ বানানোর সময়** (build) — যেমন আগে থেকে ময়দা মেখে রাখা। আর `CMD` চলে **কেক পরিবেশনের সময়** (container start) — যেমন প্লেটে সাজিয়ে টেবিলে দেওয়া। রেসিপিতে যা আগে করে রাখা যায় তা `RUN`-এ, আর যা প্রতিবার পরিবেশনের সময় করতে হয় তা `CMD`-তে। এটা মাথায় থাকলে অর্ধেক Dockerfile ভুল আপনিই এড়িয়ে যাবে।

Basic Dockerfile:

```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["python", "main.py"]
```

Core instructions:

| Instruction | কাজ |
|---|---|
| `FROM` | base image select করে |
| `WORKDIR` | next instructions-এর working directory |
| `COPY` | build context থেকে file image-এ copy করে |
| `RUN` | build time command execute করে |
| `ENV` | image/container environment variable set করে |
| `ARG` | build-time input নেয় |
| `EXPOSE` | intended container port document করে |
| `USER` | process কোন user হিসেবে run করবে |
| `CMD` | default runtime command |
| `ENTRYPOINT` | container-এর main executable define করে |
| `HEALTHCHECK` | container health probe define করতে পারে |

Build:

```bash
docker build -t my-api:dev .
```

Run:

```bash
docker run --rm -p 8000:8000 my-api:dev
```

Build context:

```txt
শেষের "." current directory-কে build context করে।
Dockerfile শুধু context-এর ভিতরের file COPY করতে পারে।
```

`RUN` vs `CMD`:

```txt
RUN = image build হওয়ার সময় চলে
CMD = container start হওয়ার সময় চলে
```

Example:

```dockerfile
RUN npm ci
CMD ["npm", "run", "start"]
```

`EXPOSE` port publish করে না:

```txt
EXPOSE 8000 = image metadata/documentation
-p 8000:8000 = host-এ port publish
```

Exec form preferred:

```dockerfile
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Shell form:

```dockerfile
CMD uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Exec form সাধারণত signal forwarding এবং argument handling clearer রাখে।

> 🧠 **মনে রাখার ট্রিক:** `RUN` = রান্নার **প্রস্তুতি** (build-এ একবার), `CMD` = **পরিবেশন** (প্রতিবার container চালু হলে)। আর `EXPOSE` শুধু "এই দরজাটা আছে" লিখে রাখা — দরজা খোলে `-p`।

> ✅ **নিজেকে যাচাই করো:** Dockerfile-এ শুধু `EXPOSE 8000` লিখেছ কিন্তু browser থেকে `localhost:8000`-এ কিছু আসছে না — কেন?
> <details><summary>উত্তর দেখো</summary>
> `EXPOSE` কোনো port আসলে খোলে না — এটা শুধু documentation, মানে "এই container 8000-এ কথা বলার কথা"। বাইরে থেকে ঢুকতে হলে run-এর সময় `-p 8000:8000` দিয়ে host-এর দরজা container-এর দরজার সাথে জুড়তে হবে (বিস্তারিত section ১১-তে)।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-8"></a>

## 08. FastAPI Backend Dockerfile with uv

> 🎯 **এই section-এ বুঝব:** আমাদের আসল FastAPI backend-এর জন্য একটা রেসিপি (Dockerfile) কীভাবে লিখি, আর কেন dependency আগে copy করলে build দ্রুত হয়।

### 🛒 আগে একটা গল্প — বাজার আগে, রান্না পরে

ভাবো তুমি রোজ রান্না করো। বাজার (dependency install) করতে সময় লাগে অনেক, কিন্তু বাজারের লিস্ট প্রায় একই থাকে। রান্নার পদ (তোমার code) কিন্তু রোজ বদলায়। বুদ্ধিমান রাঁধুনি তাই আগে বাজারটা সেরে গুছিয়ে রাখে, তারপর পদ রান্না করে। পরদিন পদ বদলালেও বাজার আবার করতে হয় না। Dockerfile-এ ঠিক এই কারণেই `pyproject.toml`/`uv.lock` (বাজারের লিস্ট) আগে copy করে install করি, তারপর বাকি code copy করি।

### কেন এই ক্রম layer cache বাঁচায়

Docker প্রতিটা ধাপকে একটা "layer" হিসেবে মনে রাখে (cache করে)। কোনো ধাপ আর তার আগের সব ধাপ না বদলালে Docker সেই তৈরি layer আবার ব্যবহার করে — নতুন করে করে না। তাই lockfile আগে থাকলে, তুমি শুধু code বদলালে ভারী install layer-টা cache থেকেই আসে, build সেকেন্ডে শেষ। (বিস্তারিত section ১০-এ।)

Backend structure:

```txt
backend/
  app/
    main.py
  pyproject.toml
  uv.lock
  Dockerfile
  .dockerignore
```

`backend/Dockerfile`:

```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:0.9.0 /uv /uvx /bin/

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY . .
RUN uv sync --frozen --no-dev

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Why dependency files আগে copy:

```txt
Source code প্রায়ই change হয়
Dependency lockfile তুলনামূলক কম change হয়
আগে dependency layer build করলে source change-এর পরও install layer cache reuse হয়
```

Build:

```bash
docker build -t ai-dream-backend:dev ./backend
```

Run:

```bash
docker run --rm \
  --name ai-dream-backend \
  -p 8000:8000 \
  --env-file ./backend/.env \
  ai-dream-backend:dev
```

Health endpoint:

```py
from fastapi import FastAPI

app = FastAPI()


@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok"}
```

Important:

```txt
Uvicorn container-এর ভিতরে 127.0.0.1-এ bind করলে host/container network থেকে পাওয়া যাবে না।
--host 0.0.0.0 use করতে হবে।
```

Version note:

```txt
Python এবং uv tag example হিসেবে দেওয়া।
নিজের project-এর tested version pin করবো।
Production reproducibility আরও strong করতে image digest pin করা যায়।
```

Development-এ reload:

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Production-এ `--reload` use করবো না।

> 🧠 **মনে রাখার ট্রিক:** **বাজার আগে, রান্না পরে** — lockfile copy + install আগে, তারপর code copy। আর container-এ সবসময় `--host 0.0.0.0`, নাহলে বাইরে থেকে কেউ পাবে না।

> ✅ **নিজেকে যাচাই করো:** তুমি backend চালালে, কিন্তু host থেকে `localhost:8000`-এ কিছু আসছে না, অথচ container চলছে। uvicorn-এ কী ভুল হতে পারে?
> <details><summary>উত্তর দেখো</summary>
> সম্ভবত uvicorn `127.0.0.1`-এ bind করেছে, যা মানে "শুধু নিজের ভেতরের কথা শুনব"। container-এর বাইরে (host বা অন্য container) থেকে পাওয়ার জন্য `--host 0.0.0.0` দিতে হবে — মানে "সব দরজা দিয়ে আসা কথা শুনব"।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-9"></a>

## 09. Next.js Frontend Dockerfile

> 🎯 **এই section-এ বুঝব:** Next.js frontend-এর জন্য development Dockerfile লেখা, আর কেন browser আর server আলাদা URL দিয়ে backend-কে ডাকে।

### 🍽️ আগে একটা গল্প — একই রেসিপি, অন্য রান্নাঘর

Backend-এ যে "বাজার আগে, রান্না পরে" নিয়ম শিখলে, frontend-এও ঠিক তাই — শুধু উপকরণ বদলায় (Node.js, npm)। `package.json` + `package-lock.json` আগে copy করে `npm ci`, তারপর বাকি code। রেসিপির কাঠামো এক, শুধু রান্নাঘরটা আলাদা।

### কেন npm install নয়, npm ci

`npm install` মাঝে মাঝে version একটু এদিক-ওদিক করে ফেলতে পারে — মানে দুই মেশিনে দুই রকম বাজার। কিন্তু `npm ci` হুবহু `package-lock.json` মেনে চলে — যেটা লেখা আছে ঠিক সেটাই আনে। Docker-এর মূল লক্ষ্যই তো "সব জায়গায় একই" (section ১), তাই lockfile মেনে চলা `ci` এখানে ভালো। আর একটা মজার ব্যাপার: Next.js-এর server আর user-এর browser দুই জায়গা থেকে backend-কে দুই নামে ডাকে — কেন, সেটা network section-এ (১৩) পরিষ্কার হবে।

Frontend structure:

```txt
frontend/
  src/
  public/
  package.json
  package-lock.json
  next.config.ts
  Dockerfile
  .dockerignore
```

Simple development Dockerfile:

```dockerfile
# syntax=docker/dockerfile:1

FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
```

Build:

```bash
docker build -t ai-dream-frontend:dev ./frontend
```

Run:

```bash
docker run --rm \
  --name ai-dream-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
  ai-dream-frontend:dev
```

Important:

```txt
package-lock.json থাকলে npm ci use করবো।
npm install-এর বদলে npm ci lockfile অনুযায়ী repeatable clean install করে।
```

If project uses another package manager:

```txt
pnpm-lock.yaml -> pnpm install --frozen-lockfile
yarn.lock      -> yarn install --frozen-lockfile / --immutable
bun.lock       -> matching Bun command
```

এক project-এ lockfile এবং package manager consistent রাখবো।

`NEXT_PUBLIC_` caution:

```txt
NEXT_PUBLIC_ variable browser bundle-এ expose হতে পারে।
এখানে secret, private key, database password রাখবো না।
```

Server-side এবং browser-side URL আলাদা হতে পারে:

```txt
Next.js server container -> http://backend:8000
User browser             -> http://localhost:8000
```

এই difference networking section-এ detail-এ দেখানো হবে।

> 🧠 **মনে রাখার ট্রিক:** lockfile থাকলে **`npm ci`** (হুবহু একই বাজার), আর `NEXT_PUBLIC_` মানে "সবাই দেখতে পাবে" — তাই সেখানে কোনো password/secret নয়।

> ✅ **নিজেকে যাচাই করো:** ভুল করে `NEXT_PUBLIC_DB_PASSWORD=...` দিলে কী বিপদ হতে পারে?
> <details><summary>উত্তর দেখো</summary>
> `NEXT_PUBLIC_` দিয়ে শুরু হওয়া variable browser-এ পাঠানো JavaScript bundle-এর ভেতর চলে যায়, মানে যেকোনো user সেটা দেখে ফেলতে পারে। database password এভাবে পুরো দুনিয়ার কাছে ফাঁস হয়ে যাবে। secret কখনো `NEXT_PUBLIC_`-এ রাখা যাবে না — ওগুলো শুধু server-side environment-এ থাকবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-10"></a>

## 10. Build Context, Layer Cache, এবং .dockerignore

> 🎯 **এই section-এ বুঝব:** Docker কীভাবে ধাপে ধাপে (layer) build করে ও পুরনো কাজ cache থেকে reuse করে, আর `.dockerignore` দিয়ে কেন অপ্রয়োজনীয় জিনিস বাদ দিই।

### 🧱 আগে একটা গল্প — লেগো দিয়ে বানানো

একটা image আসলে অনেকগুলো layer একটার উপর একটা বসানো — ঠিক লেগো ব্লকের টাওয়ারের মতো। তুমি যদি উপরের একটা ব্লক বদলাও, নিচের ব্লকগুলো ভাঙতে হয় না, ওগুলো যেমন আছে তেমনই থাকে (cache reuse)। কিন্তু যদি নিচের কোনো ব্লক বদলাও, তার উপরের সব ব্লক আবার নতুন করে বসাতে হয়। এই কারণেই কম-বদলানো জিনিস (dependency) নিচে, আর বেশি-বদলানো জিনিস (source code) উপরে রাখি।

### কেন .dockerignore দরকার — আর build context আসলে কী

Build-এর সময় শেষের `.` মানে "এই folder-টা পুরো Engine-এর কাছে পাঠাও" — এটাই **build context**। এর ভেতরে `node_modules` বা `.venv`-এর মতো বিশাল, অপ্রয়োজনীয় জিনিস থাকলে সেগুলোও পাঠানো হয়, build ধীর হয়, আর ভুল করে secret file (`.env`) image-এ ঢুকে যাওয়ার ঝুঁকি থাকে। `.dockerignore` হলো সেই "পাঠানোর দরকার নেই" লিস্ট — অনেকটা `.gitignore`-এর মতো।

Docker build প্রতিটা instruction থেকে layer তৈরি করতে পারে।

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

এখানে source file change হলে:

```txt
package files same -> npm ci layer cache reuse
COPY source layer rebuild
পরের layer rebuild
```

Bad order:

```dockerfile
COPY . .
RUN npm ci
```

একটা source file change হলেও dependency install আবার চলতে পারে।

Frontend `.dockerignore`:

```dockerignore
node_modules
.next
out
coverage
.git
.env*
!.env.example
Dockerfile*
compose*.yaml
npm-debug.log*
```

Backend `.dockerignore`:

```dockerignore
.venv
__pycache__
*.py[cod]
.pytest_cache
.ruff_cache
.mypy_cache
htmlcov
.coverage
.git
.env*
!.env.example
Dockerfile*
compose*.yaml
```

Why:

```txt
build context ছোট হয়
build faster হয়
host dependency image-এ accidental copy হয় না
secret file image layer-এ যাওয়ার risk কমে
cache invalidation কম হয়
```

কিন্তু `.dockerignore` alone secret security guarantee না। Secret source tree-তে রাখা, ভুল stage-এ copy করা, বা build argument-এ দেওয়া dangerous হতে পারে।

Inspect layers:

```bash
docker history ai-dream-backend:dev
docker image inspect ai-dream-backend:dev
```

Fresh base image check:

```bash
docker build --pull -t ai-dream-backend:dev ./backend
```

No-cache diagnostic build:

```bash
docker build --no-cache -t ai-dream-backend:dev ./backend
```

Rule:

```txt
Normal build-এ cache useful।
Every build-এ --no-cache use করলে build slow হবে।
Dependency/cache problem debug বা fully fresh rebuild দরকার হলে use করবো।

> 🧠 **মনে রাখার ট্রিক:** Image = লেগো টাওয়ার। **কম বদলায় নিচে, বেশি বদলায় উপরে** — তাহলে নিচের ব্লকগুলো cache থেকে reuse হয়। `.dockerignore` = "পাঠানোর দরকার নেই" লিস্ট।

> ✅ **নিজেকে যাচাই করো:** তুমি শুধু একটা লাইন code বদলালে, তবু `npm ci` আবার পুরোটা চলল। Dockerfile-এ কী ভুল থাকতে পারে?
> <details><summary>উত্তর দেখো</summary>
> সম্ভবত `COPY . .` লাইনটা `RUN npm ci`-এর আগে আছে। তাহলে যেকোনো code বদলালে ওই COPY layer বদলে যায়, আর তার উপরের সব layer (install সহ) আবার চলে। ঠিক করতে হবে: আগে `COPY package*.json` + `RUN npm ci`, তারপর `COPY . .` — যাতে code বদলালেও install layer cache থেকে আসে।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-11"></a>

## 11. Port Mapping, localhost, এবং 0.0.0.0

> 🎯 **এই section-এ বুঝব:** বাইরে থেকে container-এর ভেতরে ঢোকা যায় কীভাবে (port mapping), আর কেন প্রতিটা container-এর `localhost` মানে সে নিজেই।

### 🏢 আগে একটা গল্প — বিল্ডিংয়ের গেট আর ফ্ল্যাট নম্বর

মনে আছে container = বিল্ডিংয়ের ফ্ল্যাট (section ২)? এখন ভাবো তুমি বাইরে থেকে চিঠি পাঠাচ্ছ। তুমি জানো **বিল্ডিংয়ের মেইন গেট নম্বর** (host port, যেমন 8080), কিন্তু ভেতরে চিঠি যাবে কোন **ফ্ল্যাটে** (container port, যেমন 80) সেটা দারোয়ান ঠিক করে দেয়। `-p 8080:80` মানে ঠিক এই ম্যাপিং: "গেট 8080-এ আসা সব চিঠি ফ্ল্যাট 80-এ দাও।"

আর `localhost`? প্রতিটা ফ্ল্যাটের বাসিন্দা "আমার বাসা" বললে নিজের ফ্ল্যাটই বোঝায়। তাই container-এর ভেতর থেকে `localhost` মানে সেই container নিজে — পাশের ফ্ল্যাট (অন্য container) নয়। পাশের ফ্ল্যাটকে ডাকতে তার নাম ধরে ডাকতে হয় (`db`, `backend` — section ১৩)।

### কেন 0.0.0.0 লাগে

`127.0.0.1` মানে "শুধু নিজের ভেতরের কথা শুনব" — দরজা প্রায় বন্ধ। `0.0.0.0` মানে "আমার সব দরজা দিয়ে আসা কথা শুনব"। container-এর app যদি শুধু `127.0.0.1`-এ শোনে, তাহলে দারোয়ান (port mapping) চিঠি ভেতরে দিতে গেলেও app সেটা তোলে না। তাই container-এর ভেতরের app-কে `0.0.0.0`-এ শোনাতে হয়।

Port syntax:

```txt
HOST_PORT:CONTAINER_PORT
```

Example:

```bash
docker run -p 8080:8000 my-api
```

Meaning:

```txt
Browser/host calls localhost:8080
Docker forwards to container port 8000
```

`EXPOSE 8000` এবং `-p 8080:8000` এক জিনিস না।

| Config | কাজ |
|---|---|
| `EXPOSE 8000` | image-এর intended port document করে |
| `-p 8080:8000` | host থেকে port accessible করে |
| `ports:` | Compose-এ port publish করে |
| `expose:` | container network-এর intended port document করে |

Critical `localhost` rule:

```txt
প্রতিটা container-এর localhost সেই container নিজে।
```

Backend container-এর ভিতর:

```txt
localhost:5432 = backend container-এর port 5432
db:5432        = PostgreSQL service
```

Next.js server container-এর ভিতর:

```txt
localhost:8000 = frontend container
backend:8000   = FastAPI service
```

User browser-এর ভিতর:

```txt
localhost:8000 = user machine-এর published backend port
backend:8000   = browser সাধারণত resolve করতে পারবে না
```

Binding:

```txt
127.0.0.1 = process-এর own loopback only
0.0.0.0   = container-এর সব network interface-এ listen
```

FastAPI:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Next.js dev:

```bash
npm run dev -- --hostname 0.0.0.0
```

Database host-এ publish করা optional:

```yaml
services:
  db:
    ports:
      - "5432:5432"
```

Production-এ app ছাড়া host/external client-এর database access দরকার না হলে DB port publish না করাই safer।

> 🧠 **মনে রাখার ট্রিক:** `-p গেট:ফ্ল্যাট` (host:container)। container-এর ভেতর **`localhost` = আমি নিজে**; পাশের container-কে ডাকতে নাম ধরে ডাকো। App-কে শোনাও `0.0.0.0`-তে।

> ✅ **নিজেকে যাচাই করো:** backend container-এর ভেতরে `localhost:5432`-এ database খুঁজছ, কিন্তু connection পাচ্ছ না। কেন, আর ঠিক করবে কীভাবে?
> <details><summary>উত্তর দেখো</summary>
> backend-এর ভেতরে `localhost` মানে backend container নিজে — সেখানে তো database নেই! database অন্য একটা container (ফ্ল্যাট)। তাকে তার service name ধরে ডাকতে হবে, যেমন `db:5432`। container-এর ভেতর অন্য service-কে কখনো `localhost` দিয়ে ডাকা যায় না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-12"></a>

## 12. Container Storage: Volume vs Bind Mount

> 🎯 **এই section-এ বুঝব:** container মুছে গেলে ভেতরের ডেটা কেন হারায়, আর ডেটা বাঁচাতে volume ও bind mount কীভাবে কাজ করে।

### 💾 আগে একটা গল্প — এক্সটার্নাল হার্ড-ডিস্ক

মনে আছে container = ছাঁচ থেকে বের হওয়া কেক (section ৪)? কেক খেয়ে ফেললে বা ফেলে দিলে তার ভেতরের সব শেষ। container-ও তেমন — মুছে দিলে ভেতরে লেখা সব ডেটা হারায়। তাহলে database-এর জরুরি ডেটা রাখব কোথায়?

সমাধান: **এক্সটার্নাল হার্ড-ডিস্ক**। container-এর বাইরে আলাদা একটা storage রাখো, container সেখানে ডেটা লেখে। container ফেলে দিলেও হার্ড-ডিস্কটা থেকে যায়। এই বাইরের locker-ই হলো **named volume** — Docker নিজে সামলায়। আর **bind mount** হলো তোমার নিজের কম্পিউটারের একটা folder সরাসরি container-এর ভেতরে জুড়ে দেওয়া — যেন তোমার ডেস্কের ড্রয়ার container-এর ভেতর থেকেও খোলা যায় (development-এ code live edit করতে দারুণ)।

### কেন দুটো আলাদা জিনিস

**Volume** = Docker-এর নিজের locker, database-এর মতো দীর্ঘস্থায়ী ডেটার জন্য (দ্রুত, নিরাপদ, cross-OS ঝামেলা কম)। **Bind mount** = তোমার host-এর folder, development-এ source code-এর জন্য (তুমি editor-এ save করলে container সাথে সাথে দেখে)। কাজ আলাদা, তাই দুটো আলাদা tool।

Container filesystem-এর writable layer permanent storage হিসেবে depend করা উচিত না।

```txt
container remove
  -> writable layer remove
  -> unmounted data lost
```

Storage options:

| Type | Managed by | Best use |
|---|---|---|
| Named volume | Docker | database, durable application data |
| Bind mount | developer/host | source code, local config, development |
| tmpfs | memory | temporary sensitive/non-persistent data |

Named volume:

```bash
docker volume create postgres_data

docker run --rm \
  --name demo-db \
  -e POSTGRES_PASSWORD=secret \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:18-alpine
```

List/inspect:

```bash
docker volume ls
docker volume inspect postgres_data
```

Bind mount:

```bash
docker run --rm \
  -p 8000:8000 \
  --mount type=bind,source="$PWD/backend",target=/app \
  ai-dream-backend:dev
```

Compose syntax:

```yaml
services:
  backend:
    volumes:
      - ./backend:/app

  db:
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Decision:

```txt
Source code live edit -> bind mount
PostgreSQL data       -> named volume
Uploaded permanent file -> object storage বা carefully managed volume
Cache/temp data       -> tmpfs বা disposable volume, use case অনুযায়ী
```

Database folder সরাসরি cross-OS bind mount করলে permission/performance সমস্যা হতে পারে। Local Docker database-এর জন্য named volume সাধারণত cleaner।

Important:

```txt
Named volume backup না।
Volume host disk failure, accidental deletion, corruption থেকে protect করে না।
Real backup আলাদা রাখতে হবে।

> 🧠 **মনে রাখার ট্রিক:** **Volume = Docker-এর external হার্ড-ডিস্ক** (database data), **bind mount = তোমার নিজের folder container-এ জোড়া** (live code)। আর মনে রেখো: volume ≠ backup!

> ✅ **নিজেকে যাচাই করো:** তোমার PostgreSQL container তুমি `docker rm` দিয়ে মুছে ফেললে, কিন্তু আগে `-v postgres_data:/var/lib/postgresql/data` দিয়ে চালিয়েছিলে। ডেটা কি হারাবে?
> <details><summary>উত্তর দেখো</summary>
> না। ডেটা container-এর ভেতরে নয়, বাইরের `postgres_data` volume (external হার্ড-ডিস্ক)-এ লেখা ছিল। container মুছলেও volume থেকে যায়, তাই নতুন container সেই volume আবার mount করলে পুরনো ডেটা ফিরে পাবে। (কিন্তু `docker volume rm postgres_data` বা `down -v` দিলে locker-টাই মুছে যাবে — তখন হারাবে।)</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-13"></a>

## 13. Docker Network এবং Service Name DNS

> 🎯 **এই section-এ বুঝব:** container-রা নিজেদের মধ্যে কীভাবে কথা বলে, আর কেন IP নয়, service name (নাম) ধরে ডাকতে হয়।

### 📞 আগে একটা গল্প — ফ্ল্যাটে ফ্ল্যাটে ইন্টারকম

আবার সেই বিল্ডিং (section ২)। প্রতিটা ফ্ল্যাটে (container) একটা ইন্টারকম আছে, আর সব ইন্টারকম একটা কমন লাইনে (Docker network) যুক্ত। মজার ব্যাপার: তুমি নম্বর মুখস্থ না করে শুধু নাম বললেই হয় — "backend-কে দাও", "db-কে দাও"। বিল্ডিংয়ের একটা অটো-ডিরেক্টরি (internal DNS) নামটাকে সঠিক ফ্ল্যাটে পৌঁছে দেয়।

এটাই Compose-এর জাদু: তুমি service-এর নাম (`db`, `backend`) ধরে ডাকো, Docker নিজে সঠিক container খুঁজে দেয়।

### কেন IP hard-code করা যায় না

ফ্ল্যাটের বাসিন্দা বদলালে বা নতুন করে ঢুকলে IP (ঘরের অস্থায়ী নম্বর) বদলে যেতে পারে। কিন্তু নাম (`db`) স্থির থাকে। তাই code-এ IP লিখে রাখলে container recreate হলেই সব ভেঙে পড়ে — কিন্তু service name সবসময় কাজ করে। এই কারণেই `DATABASE_URL`-এ `@db:5432` লিখি, কোনো `192.168.x.x` নয়।

Compose defaultভাবে project-এর জন্য network create করে।

```yaml
services:
  backend:
    build: ./backend

  db:
    image: postgres:18-alpine
```

Compose network-এর ভিতরে:

```txt
backend service can call db:5432
db service name internal DNS name হিসেবে কাজ করে
manual container IP দরকার হয় না
```

Database URL:

```env
DATABASE_URL=postgresql+psycopg://app_user:password@db:5432/app_db
```

Wrong inside backend container:

```env
DATABASE_URL=postgresql+psycopg://app_user:password@localhost:5432/app_db
```

কারণ `localhost` backend container-কেই point করে।

Service-to-service communication:

```txt
frontend server -> http://backend:8000
backend         -> postgresql://db:5432
backend         -> redis://redis:6379
```

Host-to-container communication:

```txt
browser -> http://localhost:3000
browser -> http://localhost:8000
DB tool -> localhost:5432, only if port published
```

Custom network example:

```yaml
services:
  frontend:
    networks:
      - public

  backend:
    networks:
      - public
      - private

  db:
    networks:
      - private

networks:
  public:
  private:
```

এখানে frontend এবং db same network share করে না। Backend bridge হিসেবে দুই network-এ আছে।

Most local projects:

```txt
Compose default network enough।
Need না থাকলে custom network complexity add করবো না।
```

Rule:

```txt
Container IP hard-code করবো না।
Compose service name use করবো।
Container recreate হলে IP change হতে পারে, service name stable থাকে।

> 🧠 **মনে রাখার ট্রিক:** Container-রা **ইন্টারকমে নাম ধরে** কথা বলে — IP নয়, **service name**। নাম স্থির, IP অস্থির।

> ✅ **নিজেকে যাচাই করো:** তোমার `DATABASE_URL`-এ `@localhost:5432` লেখা, কিন্তু backend container database খুঁজে পাচ্ছে না। কী বদলাবে?
> <details><summary>উত্তর দেখো</summary>
> `localhost` backend container নিজেকেই বোঝায় (section ১১)। database তো অন্য ফ্ল্যাট। ইন্টারকমে তার নাম ধরে ডাকতে হবে — `localhost` বদলে `db` লিখতে হবে: `@db:5432`। Compose-এর internal DNS সেই নামকে সঠিক container-এ পাঠিয়ে দেবে।</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-14"></a>

## 14. Docker Compose: Multi-Container App

> 🎯 **এই section-এ বুঝব:** একাধিক container হাতে হাতে না চালিয়ে একটা file দিয়ে পুরো stack একসাথে চালানো — এটাই Docker Compose।

### 🎛️ আগে একটা গল্প — এক রিমোট দিয়ে পুরো ঘর

এতক্ষণ আমরা প্রতিটা container আলাদা আলাদা `docker run` দিয়ে চালাচ্ছিলাম — frontend, backend, db — তিনটা আলাদা লম্বা command, তিনবার। ভাবো ঘরে তিনটা আলাদা রিমোট: একটা টিভির, একটা AC-র, একটা লাইটের। বিরক্তিকর, তাই না?

**Docker Compose হলো একটা ইউনিভার্সাল রিমোট** — একটা বোতাম টিপলেই (`docker compose up`) পুরো ঘর (সব container) একসাথে চালু। আর কোন যন্ত্র কীভাবে চলবে সেটা একটা কাগজে (`compose.yaml`) লেখা থাকে, তাই বারবার মনে রাখতে হয় না।

### কেন YAML file-এ লিখি

Compose "declarative" — মানে তুমি *কীভাবে* করবে সেটা না লিখে *কী চাই* সেটা লেখো: "আমি চাই একটা backend এই image থেকে, একটা db ওই image থেকে, এই port-এ, এই volume দিয়ে।" Docker নিজে সেই অবস্থা বানিয়ে দেয়। ফলে যেকোনো নতুন developer একই file থেকে হুবহু একই stack এক command-এ পায় — Docker-এর মূল প্রতিশ্রুতি (consistency) এখানে চূড়ান্ত রূপ পায়।

Compose YAML file-এ multiple service declaratively define করে।

Minimal example:

```yaml
name: ai-dream

services:
  backend:
    build:
      context: ./backend
    ports:
      - "8000:8000"

  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: local_password
      POSTGRES_DB: app_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Modern Compose file-এ top-level `version:` field দরকার নেই।

Run:

```bash
docker compose up
docker compose up -d
docker compose up --build
```

Difference:

```txt
up         = foreground, logs terminal-এ
up -d      = background
up --build = start-এর আগে changed images build
```

Status/logs:

```bash
docker compose ps
docker compose logs
docker compose logs -f backend
```

Stop/remove:

```bash
docker compose stop
docker compose down
```

Difference:

```txt
stop = containers stop করে, objects রেখে দেয়
down = project containers এবং default network remove করে
```

Named volume defaultভাবে থাকে:

```bash
docker compose down
```

Volume-সহ remove:

```bash
docker compose down -v
```

`-v` database data delete করতে পারে। Use করার আগে নিশ্চিত হতে হবে।

One-off command:

```bash
docker compose run --rm backend uv run pytest
```

Running service-এ command:

```bash
docker compose exec backend sh
```

Validate resolved Compose model:

```bash
docker compose config
```

শুধু service rebuild:

```bash
docker compose build backend
docker compose up -d backend
```

> 🧠 **মনে রাখার ট্রিক:** Compose = **পুরো ঘরের এক রিমোট**। `up` = সব চালু, `down` = সব গুটিয়ে ফেলা (network সহ), `stop` = শুধু থামানো (রেখে দেওয়া)। আর সাবধান — `down -v` locker (volume) সহ মুছে দেয়!

> ✅ **নিজেকে যাচাই করো:** `docker compose stop` আর `docker compose down`-এর মধ্যে পার্থক্য কী? আর কোনটায় database ডেটা মুছে যাওয়ার ঝুঁকি?
> <details><summary>উত্তর দেখো</summary>
> `stop` শুধু container গুলো থামায় কিন্তু container ও network রেখে দেয় (পরে দ্রুত আবার চালু করা যায়)। `down` container ও default network মুছে ফেলে। তবে সাধারণ `down` volume মোছে না — ডেটা নিরাপদ। ঝুঁকি শুধু `down -v`-তে, কারণ ওটা named volume (database locker)-ও মুছে দেয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-15"></a>

## 15. Full-Stack Project Structure

> 🎯 **এই section-এ বুঝব:** পুরো project-এর file/folder কীভাবে গুছিয়ে রাখলে dev ও prod দুটোই পরিষ্কার আর maintainable থাকে।

### 🗄️ আগে একটা গল্প — গোছানো রান্নাঘরের তাক

একটা এলোমেলো রান্নাঘরে রান্না করা যায় ঠিকই, কিন্তু জিনিস খুঁজতে খুঁজতেই সময় শেষ। গোছানো রান্নাঘরে প্রতিটা জিনিসের নির্দিষ্ট তাক থাকে — মশলা এক জায়গায়, বাসন আরেক জায়গায়। Project structure ঠিক তেমন: frontend-এর জিনিস `frontend/`-এ, backend-এর `backend/`-এ, আর পুরো ঘর চালানোর রিমোট (`compose.yaml`) root-এ। নতুন কেউ এলে চোখ বুলিয়েই বুঝে যায় কোথায় কী।

### কেন dev আর prod আলাদা রাখি

Development-এর রান্নাঘর আর restaurant-এর production রান্নাঘর এক নয় — একটায় পরীক্ষা-নিরীক্ষা চলে, আরেকটায় দ্রুত-নিরাপদ পরিবেশন। তাই `Dockerfile` (dev) আর `Dockerfile.prod`, বা `compose.yaml` আর `compose.prod.yaml` আলাদা রাখি। আর `.env.example` রাখি যেন নতুন developer বুঝে নেয় কোন কোন secret লাগবে — আসল মান (`.env`) কিন্তু কখনো Git-এ যায় না।

Recommended structure:

```txt
ai-dream/
  frontend/
    src/
    public/
    package.json
    package-lock.json
    next.config.ts
    Dockerfile
    Dockerfile.prod
    .dockerignore

  backend/
    app/
      main.py
    migrations/
    pyproject.toml
    uv.lock
    Dockerfile
    Dockerfile.prod
    .dockerignore

  compose.yaml
  compose.prod.yaml
  .env.example
  .gitignore
```

Responsibility:

| File | কাজ |
|---|---|
| `frontend/Dockerfile` | frontend development image |
| `backend/Dockerfile` | backend development image |
| `compose.yaml` | local development stack |
| `Dockerfile.prod` | optimized production image, যদি আলাদা file রাখা হয় |
| `compose.prod.yaml` | production-specific override/config |
| `.env.example` | required variable names + safe example |
| `.dockerignore` | build context filter |
| `.gitignore` | repository tracking filter |

Alternative:

```txt
এক Dockerfile-এর named stages:
  development
  builder
  production

Compose build.target দিয়ে stage select
```

Example:

```yaml
services:
  frontend:
    build:
      context: ./frontend
      target: development
```

Decision:

```txt
Team-এর জন্য যেটা সবচেয়ে clear সেটাই use করবো।
এক file excessively complex হলে dev/prod Dockerfile আলাদা করা যায়।
Duplicate config বেড়ে গেলে multi-stage named targets better।
```

Root `.gitignore`:

```gitignore
.env
.env.*
!.env.example

frontend/node_modules/
frontend/.next/
backend/.venv/
backend/__pycache__/
```

Never commit:

```txt
real database password
JWT secret
cloud credential
private key
production .env
database dump with real user data
```

> 🧠 **মনে রাখার ট্রিক:** **প্রতিটা জিনিসের নিজের তাক** — frontend/backend আলাদা folder, রিমোট (compose) root-এ, dev আর prod আলাদা file। আর আসল secret কখনো Git-এ নয়।

> ✅ **নিজেকে যাচাই করো:** `.env` আর `.env.example` — কোনটা Git-এ commit করা ঠিক, আর কেন?
> <details><summary>উত্তর দেখো</summary>
> শুধু `.env.example` commit করা ঠিক — এতে শুধু variable-এর *নাম* আর নিরাপদ উদাহরণ থাকে, আসল কোনো password নেই। `.env`-এ থাকে আসল secret (database password ইত্যাদি), তাই সেটা `.gitignore`-এ রেখে কখনো commit করব না — নাহলে গোপন তথ্য পুরো repo-র সবার কাছে ফাঁস হয়ে যাবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-16"></a>

## 16. Complete Development Compose Setup

> 🎯 **এই section-এ বুঝব:** আগের সব টুকরো (image, volume, network, port, env, healthcheck) এক `compose.yaml`-এ জোড়া দিয়ে পুরো stack চালু করা।

### 🍱 আগে একটা গল্প — পুরো থালি একসাথে

এতক্ষণ আলাদা আলাদা পদ শিখলাম — ভাত (db), তরকারি (backend), মিষ্টি (frontend)। এই section-এ সব একসাথে একটা থালিতে সাজাই। এই `compose.yaml`-ই তোমার আসল project-এর ইউনিভার্সাল রিমোট: এক command-এ database উঠবে, ready হলে backend উঠবে, সেটা ready হলে frontend উঠবে — সব ঠিক ক্রমে, ঠিক connection দিয়ে।

### কেন এত কিছু একসাথে

এখানে প্রতিটা টুকরো তার জায়গায় বসছে: `volumes` (locker) দিয়ে ডেটা টেকে, service name (`db`, `backend`) দিয়ে ইন্টারকমে কথা হয়, `depends_on` + `healthcheck` দিয়ে সঠিক ক্রম নিশ্চিত হয়, আর দুই রকম URL (`API_INTERNAL_URL` vs `NEXT_PUBLIC_API_URL`) দিয়ে server ও browser আলাদা পথে backend পায়। একটা file পড়েই পুরো app-এর নকশা বোঝা যায়।

`compose.yaml`:

```yaml
name: ai-dream

services:
  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-app_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}
      POSTGRES_DB: ${POSTGRES_DB:-app_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}",
        ]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 10s

  backend:
    build:
      context: ./backend
    command:
      [
        "uv",
        "run",
        "uvicorn",
        "app.main:app",
        "--host",
        "0.0.0.0",
        "--port",
        "8000",
        "--reload",
      ]
    environment:
      DATABASE_URL: postgresql+psycopg://${POSTGRES_USER:-app_user}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB:-app_db}
      FRONTEND_ORIGIN: http://localhost:3000
    volumes:
      - ./backend:/app
      - backend_venv:/app/.venv
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test:
        [
          "CMD",
          "python",
          "-c",
          "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health')",
        ]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s

  frontend:
    build:
      context: ./frontend
    command: ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
    environment:
      API_INTERNAL_URL: http://backend:8000
      NEXT_PUBLIC_API_URL: http://localhost:8000
      WATCHPACK_POLLING: "true"
    volumes:
      - ./frontend:/app
      - frontend_node_modules:/app/node_modules
      - frontend_next:/app/.next
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy

volumes:
  postgres_data:
  backend_venv:
  frontend_node_modules:
  frontend_next:
```

Root `.env.example`:

```env
POSTGRES_USER=app_user
POSTGRES_PASSWORD=change_me_for_local_development
POSTGRES_DB=app_db
```

Create local env:

```bash
cp .env.example .env
```

Run:

```bash
docker compose config
docker compose up --build
```

Open:

```txt
Next.js:  http://localhost:3000
FastAPI:  http://localhost:8000
API docs: http://localhost:8000/docs
```

Why database `ports` নেই:

```txt
Backend internal network দিয়ে db:5432 call করে।
Host DB tool দরকার হলে development override-এ 5432 publish করা যায়।
```

`compose.db-tools.yaml`:

```yaml
services:
  db:
    ports:
      - "5432:5432"
```

Use:

```bash
docker compose -f compose.yaml -f compose.db-tools.yaml up
```

Important frontend URL difference:

```txt
Server Component/server-side fetch -> API_INTERNAL_URL=http://backend:8000
Browser/client-side fetch           -> NEXT_PUBLIC_API_URL=http://localhost:8000
```

Production-এ browser সাধারণত public domain বা same-origin reverse proxy URL use করবে।

> 🧠 **মনে রাখার ট্রিক:** এক থালিতে সব পদ — **Server fetch → `backend:8000`** (ভেতরের ইন্টারকম), **Browser fetch → `localhost:8000`** (বাইরের গেট)। দুই জায়গা, দুই পথ।

> ✅ **নিজেকে যাচাই করো:** frontend-এ দুটো আলাদা URL কেন — `API_INTERNAL_URL=http://backend:8000` আর `NEXT_PUBLIC_API_URL=http://localhost:8000`?
> <details><summary>উত্তর দেখো</summary>
> Next.js-এর server (container-এর ভেতরে) backend-কে ইন্টারকমে service name দিয়ে ডাকে — `backend:8000`। কিন্তু user-এর browser চলে তার নিজের মেশিনে, সে Docker network-এর `backend` নাম চেনে না; তাকে host-এ publish করা গেট `localhost:8000` ব্যবহার করতে হয়। তাই একই backend, কিন্তু কে ডাকছে তার উপর URL আলাদা।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-17"></a>

## 17. Environment Variables, Config, এবং Secrets

> 🎯 **এই section-এ বুঝব:** config আর secret-এর পার্থক্য, Compose-এ `.env` কীভাবে কাজ করে, আর গোপন জিনিস কীভাবে নিরাপদে রাখি।

### 🔑 আগে একটা গল্প — মশলার কৌটা বনাম সিন্দুকের চাবি

রান্নাঘরে দু'রকম জিনিস থাকে। কিছু **মশলার কৌটা** — সবার সামনে তাকে রাখা যায় (log level, feature flag, public API URL)। আর কিছু **সিন্দুকের চাবি** — database password, JWT secret — যা লুকিয়ে রাখতেই হয়। দুটোকে একই ভাবে রাখা বিপজ্জনক: চাবি খোলা তাকে রাখলে চুরি হয়ে যাবে।

Environment variable হলো container-কে বাইরে থেকে জিনিস দেওয়ার উপায়। কিন্তু কোনটা কৌটা আর কোনটা চাবি — সেটা বুঝে আলাদা যত্ন নিতে হয়।

### কেন build arg দিয়ে secret দেওয়া বিপজ্জনক

Dockerfile-এ `ARG`/`ENV` দিয়ে secret দিলে সেটা image-এর layer আর history-তে স্থায়ীভাবে লেখা থাকে — যে কেউ image খুলে চাবিটা পড়ে ফেলতে পারে। এটা যেন রেসিপি কার্ডেই সিন্দুকের চাবি লিখে রাখা। তাই build-time secret লাগলে BuildKit-এর `--mount=type=secret` ব্যবহার করি, যা চাবিটা শুধু ওই মুহূর্তে ধার দেয়, image-এ রেখে দেয় না।

Config categories:

```txt
Public config
Runtime private config
Build-time config
Secret
```

Examples:

| Type | Example |
|---|---|
| Public | browser API base URL |
| Runtime config | log level, feature flag |
| Runtime secret | DB password, JWT secret |
| Build secret | private package registry token |

Compose `.env` দুইভাবে confuse হতে পারে:

```txt
1. Compose YAML interpolation
2. Container-এর environment
```

Example:

```env
POSTGRES_PASSWORD=local_secret
```

```yaml
services:
  db:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

`.env` value Compose file-এ interpolate হয়ে container environment-এ যায়।

Inspect resolved config:

```bash
docker compose config
docker compose config --environment
```

Warning:

```txt
docker compose config output-এ resolved secret দেখা যেতে পারে।
CI log/public screenshot-এ output share করার আগে careful হতে হবে।
```

Required variable:

```yaml
environment:
  JWT_SECRET: ${JWT_SECRET:?JWT_SECRET is required}
```

Default variable:

```yaml
environment:
  LOG_LEVEL: ${LOG_LEVEL:-info}
```

Build argument secret না:

```dockerfile
ARG PRIVATE_TOKEN
RUN some-command --token "$PRIVATE_TOKEN"
```

Build argument/image layer/history-তে sensitive data leak হতে পারে। Build-time secret লাগলে BuildKit secret mount use করবো:

```dockerfile
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN="$(cat /run/secrets/npm_token)" npm ci
```

Build:

```bash
docker build \
  --secret id=npm_token,src=.npm-token \
  -t private-frontend .
```

Compose secret example:

```yaml
services:
  backend:
    secrets:
      - jwt_secret

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

Container-এর ভিতরে:

```txt
/run/secrets/jwt_secret
```

Production recommendation:

```txt
Cloud secret manager/platform secret store
least privilege
secret rotation
separate dev/staging/prod values
logs-এ secret না লেখা
```

`.env` convenient, কিন্তু নিজে encrypted secret vault না।

> 🧠 **মনে রাখার ট্রিক:** **কৌটা খোলা তাকে, চাবি সিন্দুকে**। secret কখনো `ARG`/`ENV`/image layer-এ নয়; `.env` সুবিধাজনক কিন্তু vault নয়।

> ✅ **নিজেকে যাচাই করো:** কেউ বলল "private token-টা Dockerfile-এ `ARG` দিয়ে দাও, তাহলে build-এ কাজ করবে"। এতে কী সমস্যা?
> <details><summary>উত্তর দেখো</summary>
> `ARG` দিয়ে দেওয়া মান image-এর build history/layer-এ থেকে যেতে পারে, ফলে যে কেউ image inspect করে token-টা বের করে ফেলতে পারে — মানে secret ফাঁস। তার বদলে BuildKit secret mount (`RUN --mount=type=secret,...`) ব্যবহার করতে হবে, যা token-টা build-এর সময় সাময়িকভাবে দেয় কিন্তু চূড়ান্ত image-এ রাখে না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-18"></a>

## 18. PostgreSQL Persistence, Migration, এবং Backup

> 🎯 **এই section-এ বুঝব:** database-এর ডেটা কীভাবে টিকিয়ে রাখি, schema বদলালে (migration) কী করি, আর backup কেন volume দিয়ে হয় না।

### 🏦 আগে একটা গল্প — ব্যাংকের ভল্ট আর দলিল

Database-এর ডেটা তোমার app-এর সবচেয়ে মূল্যবান সম্পদ — টাকার মতো। named volume হলো সেই টাকা রাখার **ভল্ট** (external হার্ড-ডিস্ক, section ১২) — container ভেঙে গেলেও ভল্ট থাকে। **Migration** হলো ভল্টের নকশা বদলানো — নতুন খোপ (নতুন table/column) যোগ করা; এটা সাবধানে, ধাপে ধাপে, লিখিত পরিকল্পনায় করতে হয়। আর **backup** হলো ভল্টের দলিলের ফটোকপি আলাদা জায়গায় রাখা।

### কেন volume-ই যথেষ্ট নয় (backup আলাদা লাগে)

একটা ভুল ধারণা: "volume আছে মানে ডেটা নিরাপদ"। কিন্তু ভল্ট নিজেই যদি পুড়ে যায় (disk failure), বা তুমি ভুল করে `down -v` দাও, বা ডেটা corrupt হয় — volume তোমাকে বাঁচাবে না। তাই আসল নিরাপত্তা হলো নিয়মিত **backup** আলাদা জায়গায় রাখা (`pg_dump`), আর সেই backup থেকে restore একবার পরীক্ষা করা। Production-এ managed database service এসব ঝামেলা অনেকটাই সামলে দেয়।

PostgreSQL data:

```yaml
services:
  db:
    image: postgres:18-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Container recreate হলেও named volume থাকলে data থাকে।

Check:

```bash
docker compose down
docker compose up -d
```

Data সাধারণত থাকবে।

But:

```bash
docker compose down -v
```

Project volume remove করে data delete করতে পারে।

Migration:

```bash
docker compose exec backend uv run alembic upgrade head
```

Create migration:

```bash
docker compose exec backend \
  uv run alembic revision --autogenerate -m "create users table"
```

Recommended deployment flow:

```txt
1. database backup/snapshot policy check
2. new image pull
3. migration one-off job run
4. app containers update
5. health check
6. rollback plan ready
```

App startup-এর প্রতিটা replica থেকে migration run করা risky:

```txt
multiple containers একই migration একসাথে চালাতে পারে
long migration app startup block করতে পারে
failure/rollback harder হয়
```

Small local project-এ startup migration convenient হতে পারে, but production-এ dedicated migration step better।

Logical backup:

```bash
docker compose exec -T db \
  pg_dump -U app_user -d app_db > app_db_backup.sql
```

Restore:

```bash
docker compose exec -T db \
  psql -U app_user -d app_db < app_db_backup.sql
```

Backup command run করার আগে:

```txt
correct project/database verify
dump file safely store
restore test
retention policy
encryption/access control
```

Named volume backup-এর replacement না। Real production database-এর জন্য managed database service অনেক project-এ easier এবং safer:

```txt
automated backup
point-in-time recovery
monitoring
replication
patching support
```

> 🧠 **মনে রাখার ট্রিক:** **volume = ভল্ট, backup = দলিলের আলাদা ফটোকপি** — দুটো এক নয়। Migration = ভল্টের নকশা বদল, তাই আলাদা explicit ধাপে করো, প্রতিটা app-startup থেকে নয়।

> ✅ **নিজেকে যাচাই করো:** তোমার database volume-এ আছে, তাহলে আলাদা backup নেওয়ার দরকার কী?
> <details><summary>উত্তর দেখো</summary>
> volume ডেটাকে container মুছে গেলে বাঁচায়, কিন্তু disk নষ্ট হওয়া, ভুল করে `docker compose down -v` চালানো, বা ডেটা corrupt হওয়া থেকে বাঁচায় না। volume ব্যাকআপ নয়। তাই `pg_dump`-এর মতো আসল backup আলাদা, নিরাপদ জায়গায় রাখতে হয় — এবং restore করে test করে দেখতে হয় যে backup কাজ করে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-19"></a>

## 19. Healthcheck, depends_on, এবং Startup Readiness

> 🎯 **এই section-এ বুঝব:** container চালু হওয়া আর app আসলে কাজের জন্য তৈরি হওয়া — এই দুটো এক নয়, আর সঠিক ক্রম কীভাবে নিশ্চিত করি।

### 🍳 আগে একটা গল্প — চুলা জ্বলছে মানেই রান্না তৈরি নয়

চুলা জ্বেলে দিলেই তো খাবার তৈরি হয়ে যায় না — জল ফুটতে, ডাল সিদ্ধ হতে সময় লাগে। ঠিক তেমন, PostgreSQL-এর container "চালু" (running) হওয়া মানেই সে connection নিতে "তৈরি" (ready) নয়; ভেতরে database এখনো গোছাচ্ছে। এখন backend যদি চালু-হওয়া-মাত্র database-কে ডাকে, ডাল সিদ্ধ হওয়ার আগেই পরিবেশনের মতো — ব্যর্থ হবে।

### কেন depends_on যথেষ্ট নয়, healthcheck লাগে

সাধারণ `depends_on` শুধু বলে "db-কে আগে চালু করো" — মানে চুলা আগে জ্বালাও। কিন্তু ডাল সিদ্ধ হলো কিনা তা দেখে না। **Healthcheck** হলো চামচে তুলে চেখে দেখা — `pg_isready` দিয়ে জিজ্ঞেস করা "তুমি কি সত্যিই তৈরি?"। `condition: service_healthy` দিলে backend ততক্ষণ অপেক্ষা করে যতক্ষণ না db সত্যিই ready। তবু app-এ retry রাখা জরুরি, কারণ চালু হওয়ার পরও database কখনো restart/drop হতে পারে।

Container running মানেই app ready না।

```txt
PostgreSQL process start হয়েছে
কিন্তু database এখনো connection accept করতে ready না
```

Short `depends_on`:

```yaml
services:
  backend:
    depends_on:
      - db
```

এটা startup order দেয়, readiness guarantee করে না।

Healthcheck-based dependency:

```yaml
services:
  db:
    image: postgres:18-alpine
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}",
        ]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 10s

  backend:
    depends_on:
      db:
        condition: service_healthy
```

Double dollar:

```txt
$${POSTGRES_USER}
```

Compose interpolation delay করে, যাতে variable container-এর ভিতরে expand হয়।

Backend health endpoint:

```py
@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok"}
```

Better production checks:

```txt
/health/live  = process alive?
/health/ready = traffic নেওয়ার জন্য dependencies ready?
```

Do not make liveness check unnecessarily heavy:

```txt
প্রতিবার third-party API call
expensive database query
full RAG inference
```

Application retry still দরকার:

```txt
Dependency পরে restart হতে পারে
network connection drop হতে পারে
database failover হতে পারে
```

Healthcheck startup coordination help করে, runtime resilience replace করে না।

Status:

```bash
docker compose ps
docker inspect --format '{{json .State.Health}}' ai-dream-backend-1
```

Healthcheck debug:

```bash
docker compose exec backend \
  python -c "import urllib.request; print(urllib.request.urlopen('http://localhost:8000/api/v1/health').read())"
```

> 🧠 **মনে রাখার ট্রিক:** **চুলা জ্বলা ≠ রান্না তৈরি**। `depends_on` = চুলা আগে জ্বালাও; `healthcheck` = চেখে দেখা সত্যিই ready কিনা। তবু app-এ retry রাখো।

> ✅ **নিজেকে যাচাই করো:** শুধু `depends_on: [db]` দিলে কেন মাঝে মাঝে backend চালু হয়েই database connection error দেয়?
> <details><summary>উত্তর দেখো</summary>
> `depends_on` শুধু startup *ক্রম* নিশ্চিত করে (db আগে চালু হবে), কিন্তু db যে connection নেওয়ার জন্য *তৈরি* সেটা নিশ্চিত করে না। db container চালু হয়েছে অথচ ভেতরে PostgreSQL এখনো initialize করছে — এই ফাঁকে backend ডাকলে fail করে। সমাধান: db-তে healthcheck দিয়ে `depends_on: db: condition: service_healthy` ব্যবহার করা, আর app-এ retry রাখা।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-20"></a>

## 20. Development Workflow এবং Hot Reload

> 🎯 **এই section-এ বুঝব:** রোজকার development কেমন হয় — code বদলালেই সাথে সাথে app আপডেট (hot reload), আর dependency বদলালে কী করি।

### ✍️ আগে একটা গল্প — লাইভ পড়ে শোনানো

ভাবো তুমি একটা গল্প লিখছ, আর পাশে বসে বন্ধু প্রতিটা লাইন লেখামাত্র পড়ে শোনাচ্ছে। তুমি শব্দ বদলালে সে সাথে সাথে নতুন করে পড়ে। Hot reload ঠিক তেমন: bind mount (section ১২)-এর মাধ্যমে তোমার editor-এ save করা code সাথে সাথে container-এ পৌঁছায়, আর dev server (`--reload` / Next.js dev) তা টের পেয়ে নিজেকে refresh করে। বারবার image rebuild করতে হয় না।

### কেন code আর dependency আলাদাভাবে সামলাই

Code বদলানো = গল্পের লাইন বদলানো, bind mount সাথে সাথে দেখায়, কিছু করতে হয় না। কিন্তু dependency বদলানো (`uv add`, `npm install`) = নতুন বই কিনে আনা — এটা image-এর ভেতরে ঢোকে, তাই `docker compose build` দিয়ে image আবার বানাতে হয়। এই পার্থক্য না বুঝলে "module missing" error-এ আটকে যাবে।

Development goal:

```txt
source edit করলে app reload
dependency reproducible
database persistent
debug logs visible
production image-এর behaviour থেকে খুব বেশি drift না
```

Daily start:

```bash
docker compose up
```

Background:

```bash
docker compose up -d
docker compose logs -f frontend backend
```

Code change:

```txt
bind mount source container-এ update করে
FastAPI --reload process restart করে
Next.js dev server file change detect করে
```

Dependency change:

```bash
cd backend
uv add httpx
cd ..
docker compose build backend
docker compose up -d backend
```

Frontend:

```bash
cd frontend
npm install @tanstack/react-query
cd ..
docker compose build frontend
docker compose up -d frontend
```

If dependency named volume old থাকে:

```bash
docker compose down
docker volume rm ai-dream_frontend_node_modules
docker compose up --build
```

Volume remove data impact বুঝে command চালাতে হবে। `postgres_data` accidental remove করবো না।

Run tests:

```bash
docker compose run --rm backend uv run pytest
docker compose run --rm frontend npm test
```

Run formatter/linter:

```bash
docker compose run --rm backend uv run ruff check .
docker compose run --rm frontend npm run lint
```

File watching slow/not working:

```txt
bind mount path check
container working directory check
WSL filesystem location check
framework polling option enable
unnecessary huge folders mount না করা
```

Development vs production:

| Development | Production |
|---|---|
| bind mount | immutable image |
| hot reload | no reload |
| dev server | optimized runtime server |
| debug-friendly | minimal/secure |
| source available | only runtime artifacts |

Rule:

```txt
Development convenience production config-এ blindly copy করবো না।
Production container-এ source bind mount বা --reload রাখবো না।

> 🧠 **মনে রাখার ট্রিক:** **Code বদল = এমনিই দেখা যায়** (bind mount + reload)। **Dependency বদল = rebuild লাগে**। আর dev-এর সুবিধা (bind mount, reload) production-এ কখনো নয়।

> ✅ **নিজেকে যাচাই করো:** তুমি `npm install`/`uv add` দিয়ে নতুন package যোগ করলে, কিন্তু container-এ "module not found" আসছে যদিও code save হয়েছে। কেন?
> <details><summary>উত্তর দেখো</summary>
> নতুন dependency image-এর ভেতরে install হয়, bind mount-করা source-এ নয়। শুধু code save করলে dependency আসে না। container-কে নতুন package দিতে হলে `docker compose build <service>` দিয়ে image আবার বানিয়ে `up -d <service>` করতে হবে। (কখনো পুরনো `node_modules` volume থাকলে সেটাও মুছতে হতে পারে।)</details>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-21"></a>

## 21. Production Images: Multi-Stage, Small, Non-Root

> 🎯 **এই section-এ বুঝব:** production-এর জন্য image কেন ছোট, নিরাপদ, non-root হওয়া উচিত, আর multi-stage build কীভাবে তা করে দেয়।

### 🧳 আগে একটা গল্প — ভ্রমণের ব্যাগ গোছানো

বেড়াতে যাওয়ার সময় কি পুরো আলমারি সঙ্গে নাও? না — শুধু দরকারি জামাকাপড় একটা ছোট ব্যাগে ভরো। Development image হলো পুরো আলমারি (compiler, dev tool, source, test — সব)। কিন্তু production-এ শুধু চলার জন্য যা লাগে সেটুকুই নেওয়া উচিত।

**Multi-stage build** ঠিক এই গোছানোর কাজটা করে: এক ঘরে (builder stage) সব বের করে রান্না/বিল্ড করো, তারপর শুধু তৈরি খাবারটুকু (runtime output) আলাদা পরিষ্কার ছোট ব্যাগে (final stage) ভরো — আঁচড়, খোসা, বাসন সব আগের ঘরে ফেলে আসো।

### কেন ছোট আর non-root জরুরি

ছোট image = কম জায়গা, দ্রুত deploy, আর কম "attack surface" (চোরের ঢোকার কম দরজা)। আর `USER` দিয়ে non-root করা মানে container-এর process-কে সীমিত ক্ষমতা দেওয়া — কেউ ঢুকে পড়লেও পুরো বাড়ির মালিক হয়ে যেতে পারবে না। Production-এ নিরাপত্তা এখানে খুব দামি।

Production image goals:

```txt
small
repeatable
only runtime files
non-root process
no dev dependency
no hot reload
no source bind mount
clear startup command
```

Next.js standalone mode:

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

`frontend/Dockerfile.prod`:

```dockerfile
# syntax=docker/dockerfile:1

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
```

Multi-stage benefit:

```txt
deps/build tools builder stage-এ
final runner stage-এ শুধু runtime output
smaller attack surface
smaller image
```

FastAPI production example:

```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.13-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:0.9.0 /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY . .
RUN uv sync --frozen --no-dev

FROM python:3.13-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

RUN groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app --home-dir /app app

WORKDIR /app

COPY --from=builder --chown=app:app /app /app

USER app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Production compose idea:

```yaml
services:
  frontend:
    image: registry.example.com/ai-dream/frontend:${IMAGE_TAG}
    restart: unless-stopped

  backend:
    image: registry.example.com/ai-dream/backend:${IMAGE_TAG}
    restart: unless-stopped
```

Production build:

```bash
docker build -f frontend/Dockerfile.prod \
  -t ai-dream-frontend:1.0.0 frontend

docker build -f backend/Dockerfile.prod \
  -t ai-dream-backend:1.0.0 backend
```

Security rules:

```txt
trusted/minimal base image
tested version pin
regular rebuild for security updates
non-root USER
no secret baked into image
no unnecessary package/tool
read-only filesystem where practical
capabilities/privilege minimize
image vulnerability scan
```

Alpine সব app-এর জন্য automatically best না। Native dependency compatibility/debuggability issue হলে slim Debian-based image practical হতে পারে।

> 🧠 **মনে রাখার ট্রিক:** **শুধু দরকারি জিনিস ছোট ব্যাগে** — multi-stage দিয়ে build tool আগের stage-এ ফেলে এসো, final image-এ শুধু runtime। আর process চালাও **non-root** user দিয়ে।

> ✅ **নিজেকে যাচাই করো:** multi-stage build ব্যবহার করে final image ছোট হয় কীভাবে?
> <details><summary>উত্তর দেখো</summary>
> builder stage-এ compiler, dev dependency, source ইত্যাদি দিয়ে app বিল্ড করা হয় — এই stage ভারী। কিন্তু final (runner) stage একদম নতুন base থেকে শুরু হয় আর সেখানে `COPY --from=builder` দিয়ে শুধু চলার জন্য দরকারি output টুকু আনা হয়। ভারী build tool গুলো final image-এ যায় না, তাই সেটা ছোট, পরিষ্কার আর নিরাপদ থাকে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-22"></a>

## 22. Logs, Shell, Inspection, এবং Debugging

> 🎯 **এই section-এ বুঝব:** কিছু ভেঙে গেলে আতঙ্কিত না হয়ে ধাপে ধাপে কীভাবে খুঁজে বের করি কী হয়েছে — logs, shell, inspect।

### 🩺 আগে একটা গল্প — ডাক্তারের রোগ নির্ণয়

ভালো ডাক্তার রোগীকে দেখেই ওষুধ দেন না — আগে জিজ্ঞেস করেন, নাড়ি দেখেন, রিপোর্ট পড়েন, তারপর সিদ্ধান্ত নেন। Debugging ঠিক তেমন একটা রোগ নির্ণয়। container অসুস্থ? আতঙ্কিত হয়ে সব মুছে ফেলো না। বরং লক্ষণ পড়ো: `logs` (রোগী কী বলছে), `ps` (কে জীবিত/মৃত), `exec sh` (ভেতরে গিয়ে পরীক্ষা), `inspect` (বিস্তারিত রিপোর্ট)।

### কেন একটা নির্দিষ্ট ক্রমে দেখি

এলোমেলো অনুমান করলে আসল কারণ মিস হয়ে যায়। তাই একটা ক্রম: আগে `compose config` (নকশা ঠিক আছে?) → `ps` (কে চলছে?) → `logs` (কী error?) → health/DNS → তারপর app-specific test। এই ক্রমে গেলে বেশিরভাগ সমস্যা দ্রুত ধরা পড়ে, আর "connection refused", "port already in use"-এর মতো সাধারণ রোগগুলো চেনা সহজ হয়।

First debugging commands:

```bash
docker compose ps
docker compose logs --tail 100
docker compose logs -f backend
docker compose config
```

Running container shell:

```bash
docker compose exec backend sh
docker compose exec frontend sh
```

Environment check:

```bash
docker compose exec backend env
docker compose exec backend python --version
docker compose exec frontend node --version
```

Secret-containing full `env` output share/log করা যাবে না।

Network/DNS check:

```bash
docker compose exec backend getent hosts db
docker compose exec frontend getent hosts backend
```

App process:

```bash
docker compose top
docker stats
```

Inspect:

```bash
docker compose images
docker inspect ai-dream-backend-1
docker image inspect ai-dream-backend:dev
```

Common errors:

### Connection refused

Check:

```txt
target service running?
correct service name?
correct container port?
app 0.0.0.0-এ listen করছে?
dependency ready?
```

### Address already in use

Host port অন্য process/container use করছে।

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

Compose port change:

```yaml
ports:
  - "8001:8000"
```

### File change reload হয় না

```txt
bind mount correct?
working directory correct?
polling needed?
host filesystem performance issue?
```

### Module/package missing

```txt
lockfile changed কিন্তু image rebuild হয়নি
dependency volume old
wrong build context
.dockerignore required file exclude করেছে
```

### Database data নেই

```txt
wrong Compose project name?
new volume create হয়েছে?
down -v চালানো হয়েছিল?
database version/path mismatch?
```

Container exit code:

```bash
docker inspect \
  --format '{{.State.Status}} {{.State.ExitCode}} {{.State.Error}}' \
  ai-dream-backend-1
```

Best debugging order:

```txt
1. compose config
2. compose ps
3. service logs
4. health state
5. environment/service DNS
6. app-specific test
7. image/build cache
```

> 🧠 **মনে রাখার ট্রিক:** **আগে রোগ নির্ণয়, পরে ওষুধ**। ক্রম: `config → ps → logs → health → DNS → app test`। মুছে ফেলা সবসময় শেষ উপায়।

> ✅ **নিজেকে যাচাই করো:** frontend থেকে backend ডাকতে গিয়ে "connection refused" পাচ্ছ। প্রথমে কী কী দেখবে?
> <details><summary>উত্তর দেখো</summary>
> ধাপে ধাপে: (১) backend service কি সত্যিই চলছে — `docker compose ps`? (২) ঠিক service name ধরে ডাকছ তো (`backend`, `localhost` নয়)? (৩) ঠিক container port? (৪) app কি `0.0.0.0`-এ listen করছে, নাকি `127.0.0.1`-এ আটকে? (৫) backend কি ready (healthcheck)? এই রোগ নির্ণয়ের ক্রমেই কারণটা বেরিয়ে আসবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-23"></a>

## 23. Testing, CI, Tagging, এবং Registry

> 🎯 **এই section-এ বুঝব:** container-এ test চালানো, image-কে সঠিক নাম/version (tag) দেওয়া, আর গুদামে (registry) পাঠানো — অটোমেটিক pipeline-এ (CI) কীভাবে সব একসাথে হয়।

### 🏷️ আগে একটা গল্প — বেকারির প্যাকেজিং লাইন

বড় বেকারিতে কেক এমনি এমনি দোকানে যায় না। একটা লাইনে: কেক পরীক্ষা হয় (test), গায়ে ব্যাচ নম্বর/তারিখ লাগে (tag), তারপর গুদামে যায় (registry), সেখান থেকে দোকানে (deploy)। CI হলো সেই স্বয়ংক্রিয় প্যাকেজিং লাইন — প্রতিবার code push করলেই test → build → scan → tag → push নিজে নিজে চলে।

### কেন tag আর "একই image deploy" এত গুরুত্বপূর্ণ

প্রতিটা image-কে নির্দিষ্ট নাম দেওয়া (যেমন commit SHA `git-a1b2c3d`) মানে ঠিক কোন কেকটা কোন recipe থেকে বানানো তা চেনা যায়। আর সবচেয়ে বড় নিয়ম: **যে image টা test হয়েছে হুবহু সেটাই deploy করো** — production-এ আবার নতুন করে বিল্ড কোরো না। নাহলে test করা কেক আর দোকানের কেক আলাদা হয়ে যেতে পারে (artifact drift), আর "আমার মেশিনে চলছিল" সমস্যা নতুন রূপে ফিরে আসে।

Containerized test:

```bash
docker compose run --rm backend uv run pytest
docker compose run --rm frontend npm run lint
docker compose run --rm frontend npm run build
```

Production image build test:

```bash
docker build -f backend/Dockerfile.prod \
  -t ai-dream-backend:test backend

docker run --rm ai-dream-backend:test \
  python -c "import app.main"
```

Tag strategy:

```txt
ai-dream-backend:1.4.0
ai-dream-backend:git-a1b2c3d
ai-dream-backend:staging
```

Recommendation:

```txt
immutable commit SHA tag -> exact artifact identify
semantic version tag     -> release meaning
environment tag          -> convenient pointer, but mutable
```

Registry flow:

```bash
docker login registry.example.com

docker tag ai-dream-backend:1.0.0 \
  registry.example.com/ai-dream/backend:1.0.0

docker push registry.example.com/ai-dream/backend:1.0.0
```

Pull:

```bash
docker pull registry.example.com/ai-dream/backend:1.0.0
```

CI pipeline:

```txt
checkout
  -> lint/test
  -> production image build
  -> image scan
  -> tag with commit SHA
  -> push registry
  -> deploy exact tag
  -> health verification
```

Important:

```txt
একবার build করা tested image-টাই deploy করা ideal।
Staging এবং production-এ source থেকে আলাদা করে rebuild করলে artifact drift হতে পারে।
```

Build metadata labels:

```dockerfile
ARG VCS_REF
ARG APP_VERSION

LABEL org.opencontainers.image.revision=$VCS_REF \
      org.opencontainers.image.version=$APP_VERSION \
      org.opencontainers.image.source="https://example.com/ai-dream"
```

Build:

```bash
docker build \
  --build-arg VCS_REF=a1b2c3d \
  --build-arg APP_VERSION=1.0.0 \
  -t ai-dream-backend:1.0.0 \
  backend
```

`ARG` non-secret metadata/config-এর জন্য। Password/token-এর জন্য না।

Registry credential:

```txt
CI secret store-এ রাখবো
least privilege token use করবো
log-এ print করবো না
rotation/revocation plan রাখবো
```

> 🧠 **মনে রাখার ট্রিক:** **যা test হয়েছে হুবহু তাই deploy করো** — মাঝপথে rebuild নয়। commit SHA দিয়ে tag করলে ঠিক কোন কেক তা সবসময় চেনা যায়।

> ✅ **নিজেকে যাচাই করো:** CI-তে test pass করার পর, production-এ source থেকে আবার নতুন করে image build করলে সমস্যা কী?
> <details><summary>উত্তর দেখো</summary>
> নতুন করে build করলে base image update, dependency resolution, বা build environment একটু বদলে যেতে পারে — ফলে যে image test হয়েছিল আর যেটা production-এ চলছে সে দুটো হুবহু এক নাও হতে পারে (artifact drift)। ঠিক পদ্ধতি: একবার build করা, test-পাস image-কে tag করে registry-তে push করা, আর সেই একই tag deploy করা।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-24"></a>

## 24. Deployment, Scaling, এবং Docker-এর Boundary

> 🎯 **এই section-এ বুঝব:** app আসল server-এ কীভাবে যায়, কখন একাধিক copy (scale) দরকার, আর কোথায় Docker Compose-এর সীমা শেষ।

### 🍔 আগে একটা গল্প — এক দোকান থেকে চেইন রেস্টুরেন্ট

একটা ছোট খাবারের দোকান এক রাঁধুনি দিয়েই চলে (এক server, Compose)। কিন্তু ভিড় বাড়লে? একই রান্নাঘরে আরও কয়েকজন রাঁধুনি (backend replica) লাগাও — কিন্তু তখন দরজায় একজন ম্যানেজার (reverse proxy / load balancer) দরকার, যে ভিড় সামলে কাকে কোন রাঁধুনির কাছে পাঠাবে ঠিক করে। আর যদি অনেকগুলো শহরে শাখা খুলতে হয় (multi-host, auto-failover), তখন এক দোকানের ব্যবস্থাপনা আর যথেষ্ট নয় — পুরো চেইন সামলানোর সিস্টেম (Kubernetes/orchestrator) লাগে।

### কেন Docker সব সমস্যার সমাধান নয়

Docker চমৎকারভাবে app-কে প্যাকেজ ও চালায়, কিন্তু সে জাদুকর নয় (মনে আছে section ১?)। scale করার আগে app-কে stateless হতে হয়, session/file বাইরে রাখতে হয়, load balancer লাগে। আর "Docker ব্যবহার করছি" মানেই microservice দরকার নয় — একটা পরিষ্কার monolith-ও দিব্যি containerize করা যায়। দরকার হওয়ার আগে জটিলতা যোগ না করাই বুদ্ধিমানের কাজ।

Small deployment:

```txt
Cloud VM
  -> Docker Engine
  -> reverse proxy
  -> frontend container
  -> backend container
  -> optional Redis/worker
  -> preferably managed database
```

Reverse proxy responsibilities:

```txt
HTTPS/TLS
domain routing
request size/timeouts
compression
access logs
frontend/backend routing
```

Example public routing:

```txt
https://app.example.com      -> Next.js
https://app.example.com/api  -> FastAPI
```

Same-origin routing CORS complexity কমাতে পারে।

Scale backend locally:

```bash
docker compose up -d --scale backend=3
```

কিন্তু fixed host port থাকলে multiple replicas conflict করতে পারে। Real load balancing এবং service discovery দরকার।

Scale করার আগে:

```txt
app stateless?
session shared store-এ?
uploaded files object storage-এ?
database connection pool safe?
background job duplicate হবে না?
load balancer আছে?
health/readiness check আছে?
```

Docker Compose good for:

```txt
local development
integration test
single-host/simple deployment
reproducible service definition
```

Compose alone সবসময় enough না:

```txt
multi-host scheduling
automatic failover
advanced rolling deployment
large-scale autoscaling
cluster-level secret/config policy
complex service mesh
```

এই need এলে options:

```txt
managed container platform
Kubernetes
cloud-specific container service
Nomad/other orchestrator
```

Microservice decision:

```txt
Docker use করছি মানেই microservice দরকার না।
একটা clean monolith backend-ও containerize করা যায়।
```

Recommended growth path:

```txt
1. local Compose
2. CI-built production images
3. single environment deployment
4. managed database + backups
5. monitoring/logging
6. real scaling need এলে orchestration
```

> 🧠 **মনে রাখার ট্রিক:** **এক দোকান = Compose; চেইন রেস্টুরেন্ট = orchestrator**। scale করার আগে app **stateless** করো আর একটা load balancer/ম্যানেজার বসাও। দরকারের আগে জটিলতা নয়।

> ✅ **নিজেকে যাচাই করো:** `docker compose up -d --scale backend=3` দিলে ৩টা backend চলবে। এতে কী সমস্যা হতে পারে?
> <details><summary>উত্তর দেখো</summary>
> ৩টা replica যদি একই fixed host port (যেমন `8000:8000`) দখল করতে চায়, তারা conflict করবে — একটা গেট, তিন রাঁধুনি। সত্যিকারের scale করতে হলে একটা load balancer / reverse proxy লাগে যে requests গুলো replica-দের মধ্যে ভাগ করে দেয়, আর app-কে stateless হতে হয় (session/file শেয়ারড store-এ)। শুধু সংখ্যা বাড়ালেই scale হয় না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-25"></a>

## 25. Cleanup, Disk Usage, এবং Safe Reset

> 🎯 **এই section-এ বুঝব:** Docker কীভাবে disk ভরিয়ে ফেলে, কীভাবে নিরাপদে পরিষ্কার করি, আর কোন command ভুলেও চোখ বন্ধ করে চালানো যাবে না।

### 🧹 আগে একটা গল্প — ঘর পরিষ্কার বনাম ভুলে জরুরি জিনিস ফেলে দেওয়া

সময়ের সাথে Docker অনেক পুরনো image, বন্ধ container, build cache জমিয়ে ফেলে — ঠিক যেমন ঘরে জিনিসপত্র জমে। মাঝে মাঝে পরিষ্কার করা ভালো। কিন্তু বাড়ি পরিষ্কার করতে গিয়ে যদি চোখ বন্ধ করে সব ঝেঁটিয়ে ফেলো, তাহলে জরুরি দলিল (database volume) ভুলে ফেলে দিতে পারো। `prune` আর `down -v` এমনই ঝাড়ু — কাজের, কিন্তু সাবধানে।

### কেন cleanup কে অভ্যাস বানানো বিপজ্জনক

অনেকে bug দেখলেই সব মুছে reset মারে। কিন্তু এতে আসল কারণ (root cause) লুকিয়ে যায়, দরকারি cache মুছে build ধীর হয়, আর সবচেয়ে খারাপ — ডেটা হারায়। তাই মোছার আগে সবসময় জিজ্ঞেস করো: কোন object যাবে? database volume আছে? backup আছে? এটা local না production? ঠিক project তো?

Disk usage:

```bash
docker system df
docker system df -v
```

Stopped containers:

```bash
docker container prune
```

Unused images:

```bash
docker image prune
docker image prune -a
```

Unused build cache:

```bash
docker builder prune
```

Unused networks:

```bash
docker network prune
```

Unused volumes:

```bash
docker volume prune
```

Danger:

```txt
Unused volume-এ important database data থাকতে পারে।
Volume prune-এর আগে docker volume ls/inspect এবং project backup verify করবো।
```

Project stop:

```bash
docker compose down
```

Project reset but database keep:

```bash
docker compose down
docker compose build --no-cache frontend backend
docker compose up
```

Full local reset including project volumes:

```bash
docker compose down -v --remove-orphans
docker compose up --build
```

এই command PostgreSQL data delete করতে পারে।

Safer reset thinking:

```txt
কোন object remove হবে?
database volume আছে?
backup দরকার?
এটা local না production?
ঠিক Compose project selected?
```

Project name check:

```bash
docker compose ls
docker compose ps
```

Orphan containers:

```bash
docker compose down --remove-orphans
```

Do not use random cleanup command as daily habit:

```txt
cleanup symptom hide করতে পারে
useful cache delete করে build slow করতে পারে
data delete করতে পারে
root cause না বুঝে environment reset করলে bug repeat হবে
```

> 🧠 **মনে রাখার ট্রিক:** **ঝাড়ু মারার আগে দেখে নাও কী ফেলছ**। `prune`/`down -v` volume সহ ডেটা মুছতে পারে। cleanup রোজকার অভ্যাস নয়, শেষ উপায়।

> ✅ **নিজেকে যাচাই করো:** `docker volume prune` বা `docker compose down -v` চালানোর আগে কোন জিনিসটা অবশ্যই যাচাই করবে?
> <details><summary>উত্তর দেখো</summary>
> নিশ্চিত হতে হবে যে মুছে-যাওয়া volume-এ কোনো জরুরি ডেটা (বিশেষত `postgres_data`) নেই, আর থাকলে তার backup আছে। `docker volume ls`/`inspect` দিয়ে দেখে, ঠিক project কিনা যাচাই করে, তবেই চালাতে হবে। একবার volume মুছে গেলে database ডেটা ফেরানো যায় না (backup ছাড়া)।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-26"></a>

## 26. Development Rules, Checklist, এবং Summary

> 🎯 **এই section-এ বুঝব:** পুরো tutorial-এর শিক্ষাগুলো এক জায়গায় — একটা checklist ও summary যা বারবার ফিরে দেখা যায়।

### 🎓 আগে একটা কথা — এতদূর আসার জন্য অভিনন্দন

তুমি কেকের গল্প (Docker কী) থেকে শুরু করে ফ্ল্যাট (container), রেসিপি-ছাঁচ-কেক-গুদাম (Dockerfile→image→container→registry), ইন্টারকম (network), external হার্ড-ডিস্ক (volume), এক রিমোট (Compose) হয়ে চেইন রেস্টুরেন্ট (scaling) পর্যন্ত পুরো যাত্রা করেছ। এই section-টা সেই পুরো রান্নার বইয়ের শেষ পাতা — যেখানে সব নিয়ম এক নজরে টুকে রাখা।

### কেন এই checklist মূল্যবান

প্রতিটা নিয়মের পেছনে একটা গল্প আছে যা তুমি এখন জানো — তাই এগুলো আর শুকনো নিয়ম মনে হবে না, বরং "আচ্ছা, এই কারণেই" মনে হবে। ভুলে গেলে এখানে ফিরে এসো; প্রতিটা লাইন তোমাকে তার section-এর গল্পটা মনে করিয়ে দেবে।

Rules:

1. Image এবং container এক জিনিস ভাববো না।
2. Dockerfile-কে repeatable build recipe হিসেবে রাখবো।
3. Base image trusted source থেকে নেবো।
4. Runtime/base image version tested tag-এ pin করবো।
5. Dependency lockfile commit করবো।
6. Dependency files আগে copy করে build cache use করবো।
7. `.dockerignore` রাখবো।
8. Secret image বা Git repository-তে রাখবো না।
9. Build secret `ARG`/`ENV` দিয়ে pass করবো না।
10. Container process `0.0.0.0`-এ listen করাবো।
11. Container-to-container call-এ service name use করবো।
12. Container-এর ভিতর `localhost` সেই container নিজে—এটা মনে রাখবো।
13. Database data named volume বা managed database-এ রাখবো।
14. Volume-কে backup ভাববো না।
15. `docker compose down -v` বুঝে use করবো।
16. `depends_on` readiness guarantee করে না; healthcheck use করবো।
17. App-level retry এবং reconnect logic রাখবো।
18. Development-এ bind mount/hot reload রাখবো।
19. Production-এ immutable image এবং no reload রাখবো।
20. Production process non-root user হিসেবে run করবো।
21. Multi-stage build দিয়ে final image clean রাখবো।
22. Unnecessary package, port, privilege remove করবো।
23. Logs stdout/stderr-এ রাখবো।
24. CI-তে test, build, scan, tag, push করবো।
25. Exact tested image tag production-এ deploy করবো।
26. Database migration explicit step হিসেবে plan করবো।
27. Healthcheck এবং rollback verify করবো।
28. Docker use মানেই microservice দরকার—এমন ভাববো না।
29. Scaling need হওয়ার আগে unnecessary orchestration add করবো না।
30. Cleanup-এর আগে data impact check করবো।

Command memory:

```txt
docker build              -> Dockerfile থেকে image
docker run                -> image থেকে container
docker ps                 -> running containers
docker logs               -> container logs
docker exec               -> running container-এ command
docker image ls           -> local images
docker volume ls          -> Docker-managed volumes
docker network ls         -> Docker networks
docker compose up         -> Compose app start/create
docker compose down       -> Compose containers/network remove
docker compose config     -> resolved Compose validate
docker compose exec       -> running service-এ command
docker compose run --rm   -> one-off service command
```

Object memory:

```txt
Dockerfile -> build recipe
Image      -> immutable package
Container  -> running image instance
Registry   -> remote image store
Volume     -> persistent Docker-managed data
Bind mount -> host path connected to container
Network    -> container communication
Compose    -> multi-container application definition
```

Full-stack responsibility:

```txt
Next.js container    -> frontend UI/server runtime
FastAPI container    -> API/business/auth runtime
PostgreSQL container -> local database runtime
Named volume         -> local database persistence
Compose network      -> service-to-service communication
Reverse proxy        -> public HTTPS/routing
Registry             -> versioned image distribution
CI/CD                -> test/build/scan/push/deploy
```

Recommended learning project:

```txt
1. nginx container run
2. small FastAPI image build
3. PostgreSQL volume add
4. backend + database Compose
5. Next.js service add
6. hot reload setup
7. healthcheck add
8. production multi-stage images
9. CI image build/tag
10. simple server deploy
```

Official references:

- Docker Get Started: https://docs.docker.com/get-started/
- Docker Overview: https://docs.docker.com/get-started/docker-overview/
- Dockerfile Overview: https://docs.docker.com/build/concepts/dockerfile/
- Build Best Practices: https://docs.docker.com/build/building/best-practices/
- Multi-Stage Builds: https://docs.docker.com/build/building/multi-stage/
- Docker Compose: https://docs.docker.com/compose/
- Compose Networking: https://docs.docker.com/compose/how-tos/networking/
- Compose Startup Order: https://docs.docker.com/compose/how-tos/startup-order/
- Volumes: https://docs.docker.com/engine/storage/volumes/
- Build Secrets: https://docs.docker.com/build/building/secrets/

Final memory:

```txt
Docker শেখা মানে শুধু command মুখস্থ করা না।

App কীভাবে build হয়
কীভাবে run হয়
কোথায় data থাকে
service কীভাবে কথা বলে
config/secret কোথা থেকে আসে
failure হলে কীভাবে debug করি
production artifact কীভাবে safely deploy করি

এই full lifecycle বুঝাই real Docker skill।
```

> 🧠 **মনে রাখার ট্রিক:** Docker = শুধু command মুখস্থ নয় — **build → run → data → network → config → debug → deploy** এই পুরো lifecycle বোঝা। গল্পগুলো মনে রাখলে command আপনিই মনে থাকবে।

> ✅ **নিজেকে যাচাই করো:** কেউ যদি জিজ্ঞেস করে "Docker শেখা মানে কি সব command মুখস্থ করা?" — তুমি কী বলবে?
> <details><summary>উত্তর দেখো</summary>
> না। command গুলো শুধু হাতিয়ার। আসল skill হলো বোঝা — app কীভাবে build হয়, কীভাবে run হয়, ডেটা কোথায় টেকে, service-রা কীভাবে কথা বলে, config/secret কোথা থেকে আসে, ভাঙলে কীভাবে debug করি, আর tested artifact কীভাবে নিরাপদে deploy করি। এই পুরো lifecycle বুঝলে যেকোনো নতুন command বা tool সহজেই ধরে ফেলা যায়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)
