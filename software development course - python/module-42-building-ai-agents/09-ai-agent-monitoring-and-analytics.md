# ০৯. AI Agent Monitoring & Analytics

আমাদের এজেন্ট প্রোডাকশনে লাইভ, কিন্তু একটা গুরুত্বপূর্ণ প্রশ্ন থেকে যায় — এটা আসলে কতটা ভালো কাজ করছে? সাধারণ সফটওয়্যারে এই প্রশ্নের উত্তর সহজ (এরর হলে এরর, না হলে ঠিক), কিন্তু AI এজেন্টের ক্ষেত্রে এটা জটিল — এজেন্ট টেকনিক্যালি "সফলভাবে" রেসপন্স দিতে পারে, কিন্তু উত্তরটা ভুল বা অপ্রাসঙ্গিক হতে পারে। Module 41-এ শেখা Sentry দিয়ে আমরা ক্র্যাশ ধরতে পারি, কিন্তু "এজেন্ট ভুল উত্তর দিয়েছে" এটা কোনো এরর স্ট্যাক ট্রেসে দেখা যাবে না। Module 32-এ শেখা `structlog`-ভিত্তিক structured logging এখানে ঠিক এই কাজেই লাগবে — প্রতিটা এজেন্ট ইন্টারঅ্যাকশনকে একটা JSON লগ এন্ট্রি হিসেবে রেকর্ড করে, যাতে পরে সেগুলো ফিল্টার করে, aggregate করে বিশ্লেষণ করা যায়।

এই সমস্যার সমাধানে এজেন্ট মনিটরিং তিনটা স্তরে ভাগ করে দেখা যায় — টেকনিক্যাল মেট্রিক্স, কোয়ালিটি মেট্রিক্স, আর বিজনেস মেট্রিক্স।

```mermaid
flowchart TD
    A[Technical Metrics] --> A1[রেসপন্স টাইম, এরর রেট, টোকেন খরচ]
    B[Quality Metrics] --> B1[টুল কল সঠিক হলো কিনা, উত্তর প্রাসঙ্গিক কিনা]
    C[Business Metrics] --> C1[এজেন্ট কতজন সমস্যা সমাধান করলো, escalation rate]
```

প্রতিটা এজেন্ট ইন্টারঅ্যাকশন লগ করা প্রথম ধাপ — শুধু ভুল হলে না, প্রতিটা কল:

```python
import time
import structlog

logger = structlog.get_logger(service="agent")


async def run_agent_with_logging(user_id: str, user_message: str):
    start_time = time.monotonic()

    try:
        result = await run_agent_with_memory(user_id, user_message)

        tools_used = [
            step["action"]["tool"] for step in result.get("intermediate_steps", [])
        ]
        logger.info(
            "agent_interaction",
            user_id=user_id,
            user_message=user_message,
            tools_used=tools_used,
            response_time_ms=(time.monotonic() - start_time) * 1000,
            success=True,
        )

        return result
    except Exception as error:
        logger.error(
            "agent_interaction",
            user_id=user_id,
            user_message=user_message,
            response_time_ms=(time.monotonic() - start_time) * 1000,
            success=False,
            error_message=str(error),
        )
        raise
```

এই লগ ডেটা থেকে গুরুত্বপূর্ণ প্যাটার্ন খুঁজে বের করা যায় — যেমন, একটা নির্দিষ্ট ধরনের প্রশ্নে এজেন্ট বারবার ভুল টুল বেছে নিচ্ছে কিনা, বা রেসপন্স টাইম হঠাৎ বেড়ে যাচ্ছে কিনা (হয়তো LLM প্রোভাইডারের সমস্যা)।

কোয়ালিটি মাপার একটা কার্যকর উপায় হলো **escalation rate** ট্র্যাক করা — Module 42-এর লেসন ০৬-এ শেখা মাল্টি-এজেন্ট সিস্টেমে, কত শতাংশ কথোপকথন মানুষ এজেন্টের কাছে এসকেলেট হচ্ছে তা মাপা। এই সংখ্যা হঠাৎ বেড়ে গেলে বোঝা যায় এজেন্ট নতুন কোনো ধরনের প্রশ্নে হিমশিম খাচ্ছে।

```python
escalation_rate = (escalated_count / total_conversations) * 100

if escalation_rate > 30:
    await notify_team("এজেন্ট escalation rate ৩০% ছাড়িয়ে গেছে — প্রম্পট/টুল পর্যালোচনা দরকার")
```

আরেকটা মূল্যবান কৌশল হলো নিয়মিতভাবে বাস্তব কথোপকথনের একটা নমুনা ম্যানুয়ালি পর্যালোচনা করা — সংখ্যা কখনো পুরো গল্প বলে না, একজন মানুষ নিজে ২০-৩০টা কথোপকথন পড়লে এমন সমস্যা ধরা পড়ে যা কোনো মেট্রিক্স ধরতে পারে না, যেমন এজেন্টের ভাষা কখনো কখনো অতিরিক্ত ফরম্যাল বা রূঢ় শোনাচ্ছে কিনা।

মনিটরিং আমাদের বলে দেয় এজেন্ট কেমন করছে, কিন্তু এই পুরো মডিউলে আমরা টুকরো টুকরো যা শিখেছি — আর্কিটেকচার, মেমোরি, মাল্টি-এজেন্ট, সেফটি, ডেপ্লয়মেন্ট, মনিটরিং — এই সবকিছু একসাথে জোড়া দিয়ে একটা সম্পূর্ণ, বাস্তব সিস্টেম বানানোই এখন বাকি কাজ। ঠিক সেটাই আমাদের এই মডিউলের শেষ, চূড়ান্ত প্রজেক্ট লেসনে করবো।
