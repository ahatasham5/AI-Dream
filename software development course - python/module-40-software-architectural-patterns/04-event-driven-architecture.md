# ৪০.৪ Event-Driven Architecture

Module ৪০.২-এ আমরা microservices দেখেছিলাম যেখানে সার্ভিসগুলো সরাসরি একে অপরকে HTTP কল করে (request-response)। কিন্তু এই সরাসরি যোগাযোগের একটা সমস্যা আছে — যদি `Task Service`-কে সরাসরি `Notification Service`, `Analytics Service`, আর ভবিষ্যতে আরও পাঁচটা সার্ভিস কল করতে হয়, `Task Service`-এর কোড এই সবগুলোর অস্তিত্ব সম্পর্কে জানতে হয়। **Event-driven architecture** এই "টাইট কাপলিং" সমস্যার সমাধান দেয়।

এটা ভাবা যায় একটা রেডিও স্টেশনের মতো — সম্প্রচারক (broadcaster) জানে না ঠিক কে কে শুনছে, সে শুধু সম্প্রচার করে। যে কেউ চাইলে "টিউন ইন" করতে পারে, নতুন শ্রোতা যোগ হলে সম্প্রচারকের কিছু বদলাতে হয় না।

```mermaid
flowchart TD
    Task["Task Service"] -->|"'task.completed' event প্রকাশ করলো"| Bus["Event Bus / Message Queue"]
    Bus --> Notif["Notification Service<br/>(শোনে, ইমেইল পাঠায়)"]
    Bus --> Analytics["Analytics Service<br/>(শোনে, পরিসংখ্যান আপডেট করে)"]
    Bus --> Achievement["Achievement Service<br/>(শোনে, badge দেয়)"]
```

TaskFlow API-তে একটা task সম্পন্ন হলে, সরাসরি প্রতিটা সার্ভিস কল করার বদলে, একটা event প্রকাশ করা:

```python
# event_bus.py — একটা সহজ asyncio-ভিত্তিক পাব-সাব বাস
from collections import defaultdict
import asyncio

class EventBus:
    def __init__(self):
        self._subscribers = defaultdict(list)

    def subscribe(self, event_name: str, handler):
        self._subscribers[event_name].append(handler)

    async def publish(self, event_name: str, data: dict):
        # প্রতিটা subscriber-কে স্বাধীনভাবে, একে অপরের জন্য অপেক্ষা না করিয়ে চালানো
        handlers = self._subscribers.get(event_name, [])
        await asyncio.gather(*(h(data) for h in handlers))

event_bus = EventBus()
```

```python
# Task Service (FastAPI route) — কে শুনছে জানার দরকার নেই
@app.post("/tasks/{task_id}/complete")
async def complete_task(task_id: str):
    task = await Task.update(task_id, completed=True)
    await event_bus.publish("task.completed", {"task_id": task.id, "user_id": task.user_id})
    return task
```

```python
# Notification Service — স্বাধীনভাবে event শোনে
async def send_completion_email(data: dict):
    await send_email(data["user_id"], "অভিনন্দন! একটা টাস্ক সম্পন্ন করেছো।")

# Achievement Service — একই event, সম্পূর্ণ ভিন্ন প্রতিক্রিয়া
async def award_badge_if_eligible(data: dict):
    await check_and_award_badge(data["user_id"])

event_bus.subscribe("task.completed", send_completion_email)
event_bus.subscribe("task.completed", award_badge_if_eligible)
```

বাস্তব প্রোডাকশনে এই in-process `EventBus`-এর বদলে সাধারণত RabbitMQ, Kafka, বা AWS SNS/SQS ব্যবহার করা হয় (নিচে উল্লেখ করা হচ্ছে), কারণ in-process bus শুধু একই process-এর ভেতরের সাবস্ক্রাইবারদের কাছে পৌঁছায় — আলাদা সার্ভিস, আলাদা সার্ভারে থাকা Notification Service এই সহজ dictionary-ভিত্তিক bus শুনতে পারবে না।

লক্ষ্য করো, `Task Service`-এর কোডে `Notification` বা `Achievement`-এর কোনো উল্লেখ নেই — এটাই **loose coupling**। ভবিষ্যতে একটা নতুন `SlackAlertService` যোগ করতে চাইলে, `Task Service`-এর একটা লাইনও বদলাতে হবে না, শুধু নতুন সার্ভিস `task.completed` event শুনতে শুরু করবে।

এই প্যাটার্ন বাস্তবায়নে ব্যবহৃত হয় message broker — RabbitMQ, Kafka, বা AWS SNS/SQS। মূল ধারণা — একটা producer event পাঠায়, একাধিক consumer স্বাধীনভাবে সেই event প্রক্রিয়া করে, একে অপরের অস্তিত্ব সম্পর্কে না জেনেই।

তবে এই স্বাধীনতার একটা মূল্য আছে — debugging কঠিন হয়ে যায় (একটা event কে কে শুনছে, ট্রেস করা কঠিন), আর "eventual consistency" মেনে নিতে হয় (event প্রসেস হতে কিছুটা দেরি হতে পারে, Module ৩৮.৪-এর CAP theorem-এর Availability-focused চিন্তার মতোই)।

এখন আমরা মৌলিক event-driven ধারণা বুঝেছি। কিন্তু ইভেন্ট-ভিত্তিক সিস্টেমে ডেটা পড়া (read) আর লেখা (write)-এর চাহিদা প্রায়ই খুব ভিন্ন হয় — পরের লেসনে আমরা এই সমস্যার সমাধান, CQRS প্যাটার্ন নিয়ে আলোচনা করবো।
