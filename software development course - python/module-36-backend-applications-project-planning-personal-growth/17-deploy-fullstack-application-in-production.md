# ৩৬.১৭ Deploy Fullstack Application in Production

আগের লেসনে আমরা Personal Growth Tracker-এর MVP নিজের কম্পিউটারে চালিয়ে দেখেছি। কিন্তু "নিজের কম্পিউটারে চলে" আর "সবার জন্য উপলব্ধ" — এই দুইয়ের মধ্যে বিস্তর ফারাক। এই লেসনে আমরা Module ৩৫.৬-এ শেখা deployment strategy-গুলো এই বাস্তব প্রজেক্টে প্রয়োগ করবো।

একটা fullstack অ্যাপ deploy করা মানে দুটো আলাদা জিনিস আলাদা জায়গায় বসানো — backend (FastAPI API) আর frontend (React build)। এটাকে একটা রেস্তোরাঁর সাথে তুলনা করা যায়: রান্নাঘর (backend) আর ডাইনিং এরিয়া (frontend) — দুটো আলাদা জায়গা, কিন্তু একসাথে কাজ করে একটা অভিজ্ঞতা তৈরি করতে।

```mermaid
flowchart TD
    subgraph "Frontend Hosting"
        F[React Build - Static Files] --> CDN[Vercel/Netlify CDN]
    end
    subgraph "Backend Hosting"
        B["FastAPI App - Gunicorn + Uvicorn workers"] --> Container[Docker Container]
        Container --> Server[Render/Railway/VPS]
        Server --> DB[(Managed PostgreSQL)]
    end
    User[ব্যবহারকারীর Browser] --> CDN
    CDN -->|API কল| Server
```

প্রথমে backend deploy করা যাক। environment variable দিয়ে সংবেদনশীল তথ্য আলাদা রাখা (Module ৩৫.২-এ শেখা নিরাপত্তা নীতির ধারাবাহিকতা):

```bash
# .env (গিটে কমিট হয় না)
DATABASE_URL=postgresql://user:pass@host:5432/growth_tracker
JWT_SECRET=xxxx
ENVIRONMENT=production
```

```python
# database.py — production-এ ডেটাবেজ সংযোগ, environment variable ব্যবহার করে
import os
from sqlalchemy import create_engine

engine = create_engine(
    os.environ["DATABASE_URL"],
    connect_args={"sslmode": "require"} if os.environ.get("ENVIRONMENT") == "production" else {},
)
```

FastAPI অ্যাপকে production-এ চালানোর জন্য শুধু `uvicorn main:app --reload` যথেষ্ট না — সেটা development server, একটাই process-এ চলে। Production-এ Gunicorn দিয়ে একাধিক Uvicorn worker চালানো হয়, যাতে একাধিক CPU core কাজে লাগে আর একটা worker ক্র্যাশ করলে বাকিগুলো চলতে থাকে:

```dockerfile
# Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["gunicorn", "main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

Render বা Railway-এর মতো প্ল্যাটফর্মে deploy করার প্রক্রিয়া সাধারণত এরকম: গিট রিপোজিটরি সংযুক্ত করা (এই Dockerfile-টা চিনে নিয়ে), environment variable সেট করা, আর start command নির্দিষ্ট করা — Module ৩৫.৬-এ শেখা recreate deployment-এর একটা managed ভার্সন, যেখানে প্ল্যাটফর্ম নিজে zero-downtime deploy সামলায়। একটা কমন ভুল — Gunicorn worker সংখ্যা যথেচ্ছভাবে বাড়িয়ে দেয়া; সাধারণ নিয়ম হলো `(2 × CPU core সংখ্যা) + 1`, তার বেশি worker রাখলে মেমোরি চাপ বাড়ে, throughput বাড়ে না।

Frontend-এর জন্য Vercel-এর মতো প্ল্যাটফর্ম React build-কে একটা CDN-এ ছড়িয়ে দেয়, যাতে পৃথিবীর যেকোনো জায়গা থেকে দ্রুত লোড হয়:

```bash
npm run build          # React build তৈরি করে
vercel deploy --prod   # CDN-এ পাঠায়
```

একটা গুরুত্বপূর্ণ বিষয় — frontend-কে জানাতে হবে backend কোথায় আছে, environment variable দিয়ে:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
```

এভাবে backend আর frontend আলাদা জায়গায় হলেও, environment variable-এর মাধ্যমে তারা একে অপরকে খুঁজে পায়। এখন অ্যাপ লাইভ, কিন্তু প্রতিবার নতুন ফিচার যোগ করলে কি আমাদের আবার হাতে করে এই পুরো প্রক্রিয়া করতে হবে? পরের লেসনে আমরা এটাকে স্বয়ংক্রিয় করবো, Module ৩৫.৭-এ শেখা CI/CD পাইপলাইনকে এই প্রজেক্টে বাস্তবায়ন করে।
