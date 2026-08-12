# Module 33 — Monitoring And Alerting

Module 32-তে আমরা Winston দিয়ে logging শিখেছিলাম, এখন সেই লগগুলোই monitoring-এর কাঁচামাল হিসেবে ব্যবহৃত হবে। এই মডিউলে আমরা শিখবো কীভাবে একটা প্রোডাকশন অ্যাপ্লিকেশনের "স্বাস্থ্য" রিয়েল-টাইমে পর্যবেক্ষণ করা যায়, আর সমস্যা হলে সাথে সাথে জানার ব্যবস্থা করা যায় — যাতে ইউজারের অভিযোগের আগেই তুমি নিজে সমস্যাটা ধরতে পারো।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-real-time-monitoring-with-pm2.md](01-real-time-monitoring-with-pm2.md) | PM2 দিয়ে রিয়েল-টাইম প্রসেস মনিটরিং |
| 2 | [02-application-performance-monitoring-with-new-relic.md](02-application-performance-monitoring-with-new-relic.md) | New Relic দিয়ে APM ও transaction tracing |
| 3 | [03-metrics-collection-with-datadog.md](03-metrics-collection-with-datadog.md) | Datadog দিয়ে metrics সংগ্রহ ও বিশ্লেষণ |
| 4 | [04-setting-up-alert-thresholds-and-notifications.md](04-setting-up-alert-thresholds-and-notifications.md) | Alert threshold ও notification সেটআপ |

## এই মডিউল শেষে তুমি যা পারবে

- PM2 দিয়ে অ্যাপের CPU, মেমরি, uptime রিয়েল-টাইমে দেখতে পারবে
- New Relic-এর মতো APM টুল দিয়ে একটা request-এর ভেতরের যাত্রা ট্রেস করতে পারবে
- Datadog দিয়ে কাস্টম মেট্রিক (counter, histogram) তৈরি ও সংগ্রহ করতে পারবে
- Metric-এর উপর ভিত্তি করে alert threshold বসিয়ে Slack/PagerDuty-তে notification পাঠাতে পারবে
- বুঝবে কেন দুই স্তরের (warning/critical) থ্রেশহোল্ড আর alert fatigue এড়ানো গুরুত্বপূর্ণ

পরবর্তী মডিউল: **Module 34 — Production Debugging**
