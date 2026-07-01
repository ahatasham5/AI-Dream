# Docker Tutorial for Next.js, FastAPI, and PostgreSQL

এই note-টা Docker শেখার জন্য। Example full-stack project হিসেবে ধরা হয়েছে **Next.js frontend**, **FastAPI backend**, এবং **PostgreSQL database**।

Main goal:

```txt
Docker কেন দরকার বুঝা
Image, container, Dockerfile, volume, network-এর relation বুঝা
একটা app containerize করা
Docker Compose দিয়ে frontend, backend, database একসাথে run করা
Development এবং production setup-এর difference বুঝা
Project বড় হলেও Docker configuration clean, secure, maintainable রাখা
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

একটা full-stack app run করতে সাধারণত অনেক dependency লাগে:

```txt
Next.js-এর জন্য Node.js
FastAPI-এর জন্য Python এবং Python packages
Database-এর জন্য PostgreSQL
Optional Redis, worker, vector DB
ঠিক environment variables
ঠিক runtime version
```

Docker ছাড়া common সমস্যা:

```txt
আমার machine-এ চলে, অন্য developer-এর machine-এ চলে না
Node/Python/PostgreSQL version mismatch
এক project-এর dependency আরেক project-এর সাথে conflict করে
নতুন developer-এর local setup করতে অনেক সময় লাগে
local, CI, এবং production environment আলাদা behave করে
```

Docker approach:

```txt
Frontend runtime + dependency -> frontend image
Backend runtime + dependency  -> backend image
PostgreSQL runtime            -> official database image

প্রতিটা image থেকে isolated container run
Compose দিয়ে সব container একসাথে manage
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
| Consistency | একই image local, CI, server-এ run করা যায় |
| Isolation | প্রতিটা service নিজের dependency নিয়ে চলে |
| Repeatability | config file থেকে environment আবার create করা যায় |
| Portability | compatible container runtime থাকলে image run করা যায় |
| Fast onboarding | পুরো stack এক command-এ start করা যায় |
| Clean host | host machine-এ সব database/runtime install করতে হয় না |

Docker কী করে না:

```txt
খারাপ code ভালো করে না
database backup automatically design করে না
secret management automatically secure করে না
production orchestration/monitoring-এর সব problem solve করে না
container image বানালেই app scalable হয়ে যায় না
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-2"></a>

## 02. Container vs Virtual Machine

Virtual Machine এবং container দুটোই isolation দেয়, কিন্তু level আলাদা।

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

| বিষয় | Container | Virtual Machine |
|---|---|---|
| কী package করে | app, runtime, libraries | full guest operating system |
| Kernel | host kernel share করে | নিজের guest kernel থাকে |
| Startup | সাধারণত দ্রুত | তুলনামূলক slow |
| Size | সাধারণত ছোট | সাধারণত বড় |
| Isolation | process/container level | machine/OS level |
| Common use | app/service packaging | full OS/environment isolation |

Container-কে lightweight VM বলা convenient, কিন্তু technically exact না।

```txt
VM = একটা complete machine-এর abstraction
Container = isolated process এবং filesystem-এর abstraction
```

Linux container Linux kernel-এর feature use করে। Windows/macOS-এ Docker Desktop সাধারণত managed Linux VM-এর ভিতরে Linux containers run করায়।

VM এবং Docker একসাথেও use হয়:

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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-3"></a>

## 03. Docker Architecture: Client, Engine, Registry

Docker use করার সময় কয়েকটা component একসাথে কাজ করে:

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
| Docker CLI | `docker ...` command নেয় |
| Docker daemon | build/run/stop/network/volume-এর real কাজ করে |
| Docker Desktop | desktop app, Engine, CLI, Compose integration দেয় |
| Docker Compose | multiple service declaratively manage করে |
| Registry | image push/pull করার remote storage |
| Docker Hub | default public registry |

Example:

```bash
docker run nginx:alpine
```

Behind the scenes:

```txt
1. CLI daemon-কে request পাঠায়
2. image local-এ না থাকলে registry থেকে pull হয়
3. image থেকে container create হয়
4. writable container layer add হয়
5. network attach হয়
6. image-এর default process start হয়
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

Old tutorials-এ পাওয়া যেতে পারে:

```bash
docker-compose up
```

এই tutorial-এ Compose V2-এর `docker compose` syntax use করা হবে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-4"></a>

## 04. Image, Container, Dockerfile, Registry Relation

এই চারটা word clear হলে Docker-এর half confusion চলে যায়।

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
new tag/digest দিয়ে identify করি
```

Container-এর writable layer temporary। Container remove হলে volume/bind mount-এ না থাকা change হারিয়ে যায়।

Image naming:

```txt
repository/name:tag

ai-dream/backend:1.0.0
ai-dream/backend:git-a1b2c3d
postgres:17-alpine
```

Important:

```txt
latest কোনো guarantee না যে image tested, newest, বা production-ready।
Production deploy-এ explicit version tag, এবং stronger reproducibility লাগলে digest pin করা ভালো।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-5"></a>

## 05. Installation এবং First Check

Windows/macOS beginner setup:

```txt
Docker Desktop install
Docker Desktop start
WSL2-based engine use করা, যদি Windows হয়
Terminal restart
```

Linux-এ দুইটা common option:

```txt
Docker Desktop
Docker Engine + Compose plugin
```

Installation command সময়ের সাথে এবং operating system অনুযায়ী change হতে পারে। তাই official installation page follow করতে হবে:

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
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-6"></a>

## 06. First Container এবং Essential Commands

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

সব image-এ `bash` থাকে না। Alpine/minimal image-এ অনেক সময় `sh` use করতে হয়।

Image commands:

```bash
docker image ls
docker pull nginx:alpine
docker image inspect nginx:alpine
docker image rm nginx:alpine
```

Run one-off command:

```bash
docker run --rm python:3.12-slim python --version
docker run --rm node:22-alpine node --version
```

Useful naming rule:

```txt
image = noun/package
container = running instance

docker image ls
docker container ls
```

Short aliases like `docker ps` common, কিন্তু full object-based commands docs/script-এ clearer হতে পারে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-7"></a>

## 07. Dockerfile Building Blocks: কোন instruction কেন

Basic Dockerfile:

```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.12-slim

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
| `ARG` | build-time input নেয় |
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
RUN = image build হওয়ার সময় চলে
CMD = container start হওয়ার সময় চলে
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-8"></a>

## 08. FastAPI Backend Dockerfile with uv

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

FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:0.8.0 /uv /uvx /bin/

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
Source code প্রায়ই change হয়
Dependency lockfile তুলনামূলক কম change হয়
আগে dependency layer build করলে source change-এর পরও install layer cache reuse হয়
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
Uvicorn container-এর ভিতরে 127.0.0.1-এ bind করলে host/container network থেকে পাওয়া যাবে না।
--host 0.0.0.0 use করতে হবে।
```

Version note:

```txt
Python এবং uv tag example হিসেবে দেওয়া।
নিজের project-এর tested version pin করবো।
Production reproducibility আরও strong করতে image digest pin করা যায়।
```

Development-এ reload:

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Production-এ `--reload` use করবো না।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-9"></a>

## 09. Next.js Frontend Dockerfile

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

FROM node:22-alpine

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
npm install-এর বদলে npm ci lockfile অনুযায়ী repeatable clean install করে।
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-10"></a>

## 10. Build Context, Layer Cache, এবং .dockerignore

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
build context ছোট হয়
build faster হয়
host dependency image-এ accidental copy হয় না
secret file image layer-এ যাওয়ার risk কমে
cache invalidation কম হয়
```

কিন্তু `.dockerignore` alone secret security guarantee না। Secret source tree-তে রাখা, ভুল stage-এ copy করা, বা build argument-এ দেওয়া dangerous হতে পারে।

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
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-11"></a>

## 11. Port Mapping, localhost, এবং 0.0.0.0

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

Production-এ app ছাড়া host/external client-এর database access দরকার না হলে DB port publish না করাই safer।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-12"></a>

## 12. Container Storage: Volume vs Bind Mount

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
  postgres:17-alpine
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
Cache/temp data       -> tmpfs বা disposable volume, use case অনুযায়ী
```

Database folder সরাসরি cross-OS bind mount করলে permission/performance সমস্যা হতে পারে। Local Docker database-এর জন্য named volume সাধারণত cleaner।

Important:

```txt
Named volume backup না।
Volume host disk failure, accidental deletion, corruption থেকে protect করে না।
Real backup আলাদা রাখতে হবে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-13"></a>

## 13. Docker Network এবং Service Name DNS

Compose defaultভাবে project-এর জন্য network create করে।

```yaml
services:
  backend:
    build: ./backend

  db:
    image: postgres:17-alpine
```

Compose network-এর ভিতরে:

```txt
backend service can call db:5432
db service name internal DNS name হিসেবে কাজ করে
manual container IP দরকার হয় না
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
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-14"></a>

## 14. Docker Compose: Multi-Container App

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
    image: postgres:17-alpine
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
stop = containers stop করে, objects রেখে দেয়
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-15"></a>

## 15. Full-Stack Project Structure

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
| `Dockerfile.prod` | optimized production image, যদি আলাদা file রাখা হয় |
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

Compose build.target দিয়ে stage select
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
Team-এর জন্য যেটা সবচেয়ে clear সেটাই use করবো।
এক file excessively complex হলে dev/prod Dockerfile আলাদা করা যায়।
Duplicate config বেড়ে গেলে multi-stage named targets better।
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-16"></a>

## 16. Complete Development Compose Setup

`compose.yaml`:

```yaml
name: ai-dream

services:
  db:
    image: postgres:17-alpine
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
Backend internal network দিয়ে db:5432 call করে।
Host DB tool দরকার হলে development override-এ 5432 publish করা যায়।
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-17"></a>

## 17. Environment Variables, Config, এবং Secrets

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

`.env` value Compose file-এ interpolate হয়ে container environment-এ যায়।

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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-18"></a>

## 18. PostgreSQL Persistence, Migration, এবং Backup

PostgreSQL data:

```yaml
services:
  db:
    image: postgres:17-alpine
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
failure/rollback harder হয়
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-19"></a>

## 19. Healthcheck, depends_on, এবং Startup Readiness

Container running মানেই app ready না।

```txt
PostgreSQL process start হয়েছে
কিন্তু database এখনো connection accept করতে ready না
```

Short `depends_on`:

```yaml
services:
  backend:
    depends_on:
      - db
```

এটা startup order দেয়, readiness guarantee করে না।

Healthcheck-based dependency:

```yaml
services:
  db:
    image: postgres:17-alpine
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

Compose interpolation delay করে, যাতে variable container-এর ভিতরে expand হয়।

Backend health endpoint:

```py
@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok"}
```

Better production checks:

```txt
/health/live  = process alive?
/health/ready = traffic নেওয়ার জন্য dependencies ready?
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-20"></a>

## 20. Development Workflow এবং Hot Reload

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
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-21"></a>

## 21. Production Images: Multi-Stage, Small, Non-Root

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

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
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

FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:0.8.0 /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY . .
RUN uv sync --frozen --no-dev

FROM python:3.12-slim AS runtime

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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-22"></a>

## 22. Logs, Shell, Inspection, এবং Debugging

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

### File change reload হয় না

```txt
bind mount correct?
working directory correct?
polling needed?
host filesystem performance issue?
```

### Module/package missing

```txt
lockfile changed কিন্তু image rebuild হয়নি
dependency volume old
wrong build context
.dockerignore required file exclude করেছে
```

### Database data নেই

```txt
wrong Compose project name?
new volume create হয়েছে?
down -v চালানো হয়েছিল?
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-23"></a>

## 23. Testing, CI, Tagging, এবং Registry

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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-24"></a>

## 24. Deployment, Scaling, এবং Docker-এর Boundary

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

Compose alone সবসময় enough না:

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
একটা clean monolith backend-ও containerize করা যায়।
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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-25"></a>

## 25. Cleanup, Disk Usage, এবং Safe Reset

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

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-26"></a>

## 26. Development Rules, Checklist, এবং Summary

Rules:

1. Image এবং container এক জিনিস ভাববো না।
2. Dockerfile-কে repeatable build recipe হিসেবে রাখবো।
3. Base image trusted source থেকে নেবো।
4. Runtime/base image version tested tag-এ pin করবো।
5. Dependency lockfile commit করবো।
6. Dependency files আগে copy করে build cache use করবো।
7. `.dockerignore` রাখবো।
8. Secret image বা Git repository-তে রাখবো না।
9. Build secret `ARG`/`ENV` দিয়ে pass করবো না।
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
21. Multi-stage build দিয়ে final image clean রাখবো।
22. Unnecessary package, port, privilege remove করবো।
23. Logs stdout/stderr-এ রাখবো।
24. CI-তে test, build, scan, tag, push করবো।
25. Exact tested image tag production-এ deploy করবো।
26. Database migration explicit step হিসেবে plan করবো।
27. Healthcheck এবং rollback verify করবো।
28. Docker use মানেই microservice দরকার—এমন ভাববো না।
29. Scaling need হওয়ার আগে unnecessary orchestration add করবো না।
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

App কীভাবে build হয়
কীভাবে run হয়
কোথায় data থাকে
service কীভাবে কথা বলে
config/secret কোথা থেকে আসে
failure হলে কীভাবে debug করি
production artifact কীভাবে safely deploy করি

এই full lifecycle বুঝাই real Docker skill।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)
