# ৩৬.২০ API Performance Optimization

আগের লেসনে আমরা সার্ভার পর্যবেক্ষণ করতে শুরু করলাম, আর ধরে নিলাম — Datadog-এ দেখা যাচ্ছে `/api/habits` endpoint-টা ব্যবহারকারী বাড়ার সাথে সাথে ধীর হয়ে যাচ্ছে। এই লেসনে আমরা Module ৩১-এ শেখা caching কৌশল এই বাস্তব সমস্যায় প্রয়োগ করবো।

মনে করো একটা লাইব্রেরি, যেখানে প্রতিবার একটা বই চাইলে লাইব্রেরিয়ানকে পুরো গুদামঘর খুঁজে বের করতে হয়। যদি জনপ্রিয় কিছু বই ডেস্কের পাশেই রাখা থাকে, বারবার গুদামঘরে যেতে হয় না। Redis cache ঠিক এই "ডেস্কের পাশে রাখা" জিনিসটা করে আমাদের ডেটার জন্য।

```mermaid
sequenceDiagram
    participant Client
    participant API as Habit API
    participant Redis
    participant DB as PostgreSQL

    Client->>API: GET /api/habits
    API->>Redis: cache আছে কি? (key: habits:userId)
    alt Cache Hit
        Redis-->>API: হ্যাঁ, এখানে ডেটা
        API-->>Client: দ্রুত response
    else Cache Miss
        Redis-->>API: না
        API->>DB: SELECT * FROM habits...
        DB-->>API: ডেটা
        API->>Redis: cache-এ সংরক্ষণ করলো (TTL সহ)
        API-->>Client: response
    end
```

কোডে বাস্তবায়ন:

```python
import json
import redis.asyncio as redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

@router.get("/", response_model=HabitListOut)
async def list_habits(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cache_key = f"habits:{user.id}"
    cached = await r.get(cache_key)
    if cached:
        return json.loads(cached)

    habits = db.query(Habit).filter(Habit.user_id == user.id).all()
    result = {"habits": [HabitOut.model_validate(h).model_dump(mode="json") for h in habits]}
    await r.setex(cache_key, 60, json.dumps(result))  # ৬০ সেকেন্ড cache
    return result

# habit তৈরি/আপডেট হলে cache invalidate করা জরুরি, নাহলে পুরনো ডেটা দেখাবে
@router.post("/", status_code=201, response_model=HabitOut)
async def create_habit(payload: HabitCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = Habit(user_id=user.id, title=payload.title, frequency=payload.frequency)
    db.add(habit)
    db.commit()
    db.refresh(habit)
    await r.delete(f"habits:{user.id}")  # cache পরিষ্কার
    return habit
```

লক্ষ্য করো cache invalidation-এর অংশটা — cache বসানো সহজ, কিন্তু ডেটা বদলালে পুরনো cache মুছে ফেলাটা ভুলে গেলে ব্যবহারকারী পুরনো তথ্য দেখতে থাকবে। এটাই ক্যাশিং-এর সবচেয়ে সাধারণ ভুল।

আরেকটা optimization — ডেটাবেজ query নিজেই দ্রুত করা, index যোগ করে:

```sql
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_completions_habit_id ON habit_completions(habit_id);
```

Module ৩১.৪-এ শেখা response time মাপার পদ্ধতি দিয়ে, optimize করার আগে আর পরে তুলনা করে দেখা উচিত আসলে উন্নতি হয়েছে কিনা — অনুমানের ভিত্তিতে না, মাপের ভিত্তিতে সিদ্ধান্ত নেয়া।

Performance ঠিক হলো, কিন্তু একটা প্রজেক্ট যত বড় হয়, ততই ভুল আর error-এর সম্ভাবনা বাড়ে। পরের লেসনে আমরা দেখবো কীভাবে fullstack অ্যাপ্লিকেশনে শক্তপোক্ত error handling বসানো যায়।
