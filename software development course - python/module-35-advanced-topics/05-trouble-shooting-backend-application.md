# ৩৫.৫ Trouble Shooting Backend Application

আগের লেসনে আমরা DevTools দিয়ে বুঝলাম কীভাবে বোঝা যায় সমস্যাটা frontend-এ, নাকি backend-এ। ধরো তদন্ত করে দেখা গেলো — না, request ঠিকমতো গিয়েছে, কিন্তু backend থেকে 500 error ফেরত এসেছে। এখন পালা backend ট্রাবলশুটিং-এর, যেখানে Module ৩২ (logging), Module ৩৩ (monitoring), আর Module ৩৪ (production debugging)-এ শেখা সব হাতিয়ার একসাথে কাজে লাগবে।

Backend ট্রাবলশুটিংকে একটা গোয়েন্দা তদন্তের মতো ভাবা যায় — একটা অপরাধ (error) ঘটেছে, আর তোমার কাছে আছে প্রমাণ জোগাড় করার তিনটা প্রধান উৎস: logs (সাক্ষীর জবানবন্দি), metrics (সিসিটিভি ফুটেজ), আর stack trace (অপরাধের দৃশ্যের ছবি)।

```mermaid
flowchart TD
    A[500 Error রিপোর্ট এলো] --> B[Module 32: Logs চেক করো - কোন request, কোন সময়]
    B --> C[Module 34: Stack Trace থেকে exact লাইন খুঁজো]
    C --> D[Module 33: Metrics দেখো - CPU/Memory/DB স্বাভাবিক ছিলো?]
    D --> E{কারণ পাওয়া গেলো?}
    E -->|হ্যাঁ| F[Fix করো, নতুন করে deploy]
    E -->|না| G[Module 34.3: Remote debugging দিয়ে live inspect]
    G --> C
```

প্রথম ধাপ, structured logs (Module ৩২.২) থেকে সেই নির্দিষ্ট request-এর trace খুঁজে বের করা — কোন user, কোন endpoint, কোন সময়, আর তার সাথে যুক্ত error message। Module ৩৪.১-এ আমরা যে correlation ID প্যাটার্ন শিখেছিলাম, ঠিক সেটাই এখানে কাজে লাগে:

```python
# Module 32-এ শেখা structured logging আর Module 34-এর correlation ID কাজে লাগছে এখানে
logger.error(
    "Failed to save habit",
    extra={
        "request_id": request.state.request_id,
        "user_id": getattr(request.state, "user_id", None),
        "route": request.url.path,
        "error": str(err),
        "stack": traceback.format_exc(),
    },
)
```

এই লগ থেকেই আমরা জানতে পারি ঠিক কোথায় error হয়েছে। দ্বিতীয় ধাপ, stack trace (Python-এ traceback) বিশ্লেষণ — Module ৩৪.৪-এ আমরা যেভাবে memory leak trace করেছিলাম, ঠিক একইভাবে traceback-এর প্রতিটা ফ্রেম পড়ে বুঝতে হয় কল-চেইন কোথা থেকে শুরু হয়ে কোথায় ভেঙেছে। একটা সাধারণ ভুল — নতুন developer-রা traceback-এর একদম নিচের লাইনটাই শুধু পড়ে (Python-এ traceback সবচেয়ে গভীর ফ্রেম শেষে দেখায়), কিন্তু আসল কারণ প্রায়ই কয়েক ফ্রেম উপরে, নিজের কোডের ভেতরে (কোনো third-party package-এর ভেতরে না) লুকিয়ে থাকে। যেমন `AttributeError: 'NoneType' object has no attribute 'title'` দেখলে প্রথম প্রশ্ন হওয়া উচিত — "কোন লাইনে আমার নিজের কোড একটা `None` value-কে ধরে নিয়েছিলো যে সেটা কখনো `None` হবে না?"

তৃতীয় ধাপ, metrics দেখে বোঝা এটা কি একটা বিচ্ছিন্ন ঘটনা, নাকি প্যাটার্ন। ধরো Datadog-এ (Module ৩৩.৩) দেখা গেলো ঠিক সেই সময় ডেটাবেজ কানেকশন পুল পুরো ভরে গিয়েছিলো:

```python
# SQLAlchemy engine-এর connection pool, সীমা বেঁধে দেয়া আছে যাতে বোঝা যায় সীমা কোথায়
from sqlalchemy import create_engine
from sqlalchemy import event

engine = create_engine(DATABASE_URL, pool_size=20, max_overflow=0, pool_timeout=30)

@event.listens_for(engine, "handle_error")
def handle_pool_error(exception_context):
    logger.error("Database pool error", extra={"error": str(exception_context.original_exception)})
```

এখন কারণ স্পষ্ট — একসাথে অনেক request আসায় কানেকশন পুল ফুরিয়ে গিয়েছিলো, নতুন request কানেকশন না পেয়ে টাইমআউট হয়ে 500 error দিয়েছে। এটা সরাসরি Module ৩৫.১-এ শেখা high-traffic সমস্যার সাথে যুক্ত — সমাধান হতে পারে pool size বাড়ানো, অথবা query optimize করা, অথবা caching বসানো (Module ৩১.৫)।

লক্ষ্য করার মতো বিষয় — একটা ভালো backend troubleshooting সবসময় logs, stack trace, আর metrics — এই তিনটাকে একসাথে ব্যবহার করে, কোনো একটা একা যথেষ্ট না। এখন সমস্যা খুঁজে বের করা আর ঠিক করা শিখেছি, কিন্তু সেই ফিক্সটা production-এ পৌঁছাবে কীভাবে? পরের লেসনে আমরা দেখবো বিভিন্ন deployment strategy, যেগুলো নিশ্চিত করে ফিক্স যাওয়ার সময় ব্যবহারকারীরা কোনো বিঘ্ন টের না পায়।
