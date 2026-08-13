# ৩৫.৭ Frictionless Deployment Pipeline

আগের লেসনে আমরা শিখেছি কোন strategy দিয়ে (blue-green, rolling, canary) নতুন কোড ছাড়া উচিত। কিন্তু যদি প্রতিবার এই ধাপগুলো — টেস্ট চালানো, বিল্ড করা, সার্ভারে কপি করা, সুইচ করা — হাতে করে করতে হয়, তাহলে সেটা ধীর, ক্লান্তিকর, আর ভুলপ্রবণ। এই মডিউলের শেষ লেসনে আমরা দেখবো কীভাবে এই পুরো যাত্রাটা একটা "frictionless" (ঘর্ষণহীন) স্বয়ংক্রিয় পাইপলাইনে রূপান্তর করা যায় — যেটাকে বলা হয় CI/CD (Continuous Integration / Continuous Deployment)।

ভাবো একটা কারখানার অ্যাসেম্বলি লাইন। কাঁচামাল একদিকে ঢোকে, আর অন্যদিক থেকে সম্পূর্ণ প্রস্তুত পণ্য বের হয় — মাঝখানে প্রতিটা ধাপ (কাটা, জোড়া লাগানো, পরীক্ষা করা, প্যাকেজিং) স্বয়ংক্রিয়ভাবে ঘটে, কোনো মানুষ প্রতিটা ধাপে হাত না লাগিয়ে। একটা frictionless deployment pipeline ঠিক এভাবেই কাজ করে — একজন ডেভেলপার কোড push করে, আর বাকিটা পাইপলাইন নিজে সামলায়।

```mermaid
flowchart LR
    A[Developer: git push] --> B[CI: কোড checkout]
    B --> C[Automated Tests চালানো]
    C -->|Fail| Z[Developer-কে notify, deploy বন্ধ]
    C -->|Pass| D[Build/Bundle তৈরি]
    D --> E[Staging-এ Deploy]
    E --> F[Staging-এ Smoke Test]
    F -->|Pass| G[Production-এ Canary Deploy]
    G --> H[Monitoring দিয়ে যাচাই - Module 33]
    H -->|সব ঠিক| I[১০০% Traffic-এ Rollout]
    H -->|সমস্যা| J[Auto Rollback]
```

একটা সাধারণ GitHub Actions পাইপলাইন কেমন দেখতে হয় দেখি, যেটা FastAPI অ্যাপকে টেস্ট করে, একটা Docker image বানায়, আর তারপর deploy করে:

```yaml
name: Deploy Personal Growth Tracker
on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt -r requirements-dev.txt
      - run: pytest --maxfail=1          # Module 31-এ শেখা automated testing, CI-র required gate
      - name: Build Docker image
        run: docker build -t growth-tracker:${{ github.sha }} .
      - name: Deploy to production
        if: success()
        run: ./deploy.sh growth-tracker:${{ github.sha }}
```

লক্ষ্য করো — `pytest` fail করলে পরের ধাপগুলো (Docker build, deploy) আর চলে না। এটাই frictionless pipeline-এর মূল নিরাপত্তা: খারাপ কোড কখনো production পর্যন্ত পৌঁছাতে পারে না, কারণ পথে বাধা (automated gate) বসানো আছে।

> **প্রোডাকশন নুয়ান্স — pytest-কে "required gate" বানানো**: শুধু CI ফাইলে `pytest` লিখে রাখলেই যথেষ্ট না — GitHub repository-র branch protection settings-এ গিয়ে `main` branch-এর জন্য "require status checks to pass before merging" চালু করে, test job-টাকে required হিসেবে চিহ্নিত করতে হয়। এটা না করলে একজন ডেভেলপার টেস্ট fail হওয়া সত্ত্বেও জোর করে merge করে দিতে পারে, আর পুরো CI gate-টাই কার্যত ঐচ্ছিক (optional) হয়ে যায় — একটা সাধারণ ভুল যা টিমগুলো প্রায়ই করে, ভাবে যে CI ফাইলে স্টেপ থাকা মানেই সেটা বাধ্যতামূলক।

একটা সত্যিকারের frictionless পাইপলাইনে এই ধাপগুলো একসাথে কাজ করে:

- **Continuous Integration (CI)** — প্রতিটা push-এ স্বয়ংক্রিয়ভাবে `pytest` স্যুট চলা, যাতে সমস্যা দ্রুত ধরা পড়ে এবং deploy-এর আগেই আটকানো যায়।
- **Automated deployment** — টেস্ট পাস করলে নিজে থেকেই Docker image বিল্ড হয়ে staging আর production-এ যাওয়া, আগের লেসনের কোনো একটা strategy (canary বা rolling) ব্যবহার করে।
- **Monitoring-linked rollback** — Module ৩৩-এ শেখা alert threshold-গুলো যদি deploy-এর পরে trigger হয় (error rate বেড়ে গেছে), পাইপলাইন নিজে থেকেই আগের Docker image ভার্সনে ফিরে যায়, মানুষকে ঘুম থেকে না জাগিয়েই।

এখানেই "Advanced Topics" মডিউল শেষ হচ্ছে — এই সাতটা লেসনে আমরা ট্রাফিক সামলানো থেকে শুরু করে নিরাপত্তা, লোড টেস্টিং, ট্রাবলশুটিং, আর শেষে স্বয়ংক্রিয় ডেপ্লয়মেন্ট পর্যন্ত পুরো একটা প্রোডাকশন-রেডি সিস্টেমের ছবি সম্পূর্ণ করলাম। এখন সময় এসেছে এই সব জ্ঞান একটা বাস্তব প্রজেক্টে প্রয়োগ করার — পরের মডিউলে আমরা শুরু থেকে শেষ পর্যন্ত একটা সম্পূর্ণ অ্যাপ্লিকেশন, "Personal Growth Tracker" পরিকল্পনা আর তৈরি করবো।
