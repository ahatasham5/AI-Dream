# ২২.০২. Software Design Patterns - DI (Dependency Injection)

Module 13-তে আমরা Encapsulation শিখেছিলাম — একটা ক্লাস তার নিজের ডেটা আর লজিক নিজের ভেতরে গুটিয়ে রাখে। এটা খুবই দরকারি ধারণা, কিন্তু বাস্তব সিস্টেমে কোনো ক্লাস একা একা কাজ করে না। একটা `OrderService` ক্লাসের হয়তো `PaymentService`-এর দরকার হয়, `PaymentService`-এর দরকার হয় `NotificationService`-এর। এই "একটা ক্লাসের অন্য একটা ক্লাসের দরকার হওয়া"-কেই বলে **dependency** — নির্ভরতা। প্রশ্নটা হলো, এই নির্ভরতা তৈরি করার সবচেয়ে ভালো উপায় কী?

চলো প্রথমে "খারাপ" পদ্ধতিটা দেখি, কারণ সমস্যাটা অনুভব না করলে সমাধানের গুরুত্ব বোঝা যায় না।

```python
class NotificationService:
    def send(self, message: str) -> None:
        print(f"Sending notification: {message}")


class OrderService:
    def __init__(self):
        # OrderService নিজেই NotificationService তৈরি করছে
        self.notifier = NotificationService()

    def place_order(self, item: str) -> None:
        print(f"Order placed for {item}")
        self.notifier.send(f"Your order for {item} is confirmed")
```

উপর থেকে দেখলে এই কোডে কিছু ভুল মনে হবে না — কাজ তো করছেই। কিন্তু এখানে একটা সূক্ষ্ম কিন্তু ভয়ংকর সমস্যা লুকিয়ে আছে। `OrderService` ক্লাসটা শুধু তার নিজের কাজ (অর্ডার প্লেস করা) করছে না — সে নিজেই সিদ্ধান্ত নিচ্ছে কীভাবে `NotificationService` তৈরি হবে, ঠিক কোন কনস্ট্রাক্টর কল দিয়ে। ধরো, ভবিষ্যতে তুমি ইমেইল আর SMS দুই মাধ্যমেই নোটিফিকেশন পাঠাতে চাও, অথবা টেস্টিং-এর সময় আসল নোটিফিকেশন না পাঠিয়ে একটা "নকল" (mock) সার্ভিস ব্যবহার করতে চাও — তাহলে তোমাকে `OrderService`-এর ভেতরে ঢুকে কোড বদলাতে হবে। অথচ `OrderService`-এর আসল দায়িত্ব তো অর্ডার সামলানো, নোটিফিকেশন সার্ভিস কীভাবে তৈরি হবে সেটা নয়।

এই সমস্যাটার একটা রূপক দিয়ে বোঝা যাক। ধরো তুমি একটা রেস্টুরেন্টের শেফ। "Dependency তৈরি নিজে করা" মানে হলো শেফ নিজেই ক্ষেতে গিয়ে সবজি চাষ করা, নিজেই বাজারে গিয়ে মাছ কেনা, তারপর রান্না করা। এটা টেকনিক্যালি সম্ভব, কিন্তু ভয়াবহ অদক্ষ, আর শেফের আসল দক্ষতা (রান্না) থেকে তার মনোযোগ সরিয়ে দেয়। বাস্তবে কী হয়? একটা সাপ্লাই চেইন থাকে — কেউ একজন (বা একটা সিস্টেম) শেফের রান্নাঘরে প্রয়োজনীয় উপকরণ **পৌঁছে দেয়** (inject করে), শেফ শুধু সেগুলো ব্যবহার করে রান্না করে। শেফকে জানতে হয় না উপকরণ কোথা থেকে এলো, কীভাবে এলো।

এটাই **Dependency Injection (DI)**-এর মূল ধারণা — একটা ক্লাস তার নিজের dependency নিজে তৈরি করবে না, বরং বাইরে থেকে সেটা তাকে "সরবরাহ" (inject) করা হবে। একই কোড, DI প্রয়োগ করে লিখলে দেখতে এমন হবে:

```python
class NotificationService:
    def send(self, message: str) -> None:
        print(f"Sending notification: {message}")


class OrderService:
    # কনস্ট্রাক্টরের মাধ্যমে dependency গ্রহণ করা হচ্ছে, নিজে তৈরি করা হচ্ছে না
    def __init__(self, notifier: NotificationService):
        self.notifier = notifier

    def place_order(self, item: str) -> None:
        print(f"Order placed for {item}")
        self.notifier.send(f"Your order for {item} is confirmed")


# এখন OrderService ব্যবহার করার সময়, আমরা বাইরে থেকে dependency সরবরাহ করছি
notifier = NotificationService()
order_service = OrderService(notifier)
order_service.place_order("Laptop")
```

এখন `OrderService` জানেই না `NotificationService` কীভাবে তৈরি হয়েছে — সে শুধু জানে তার কাছে একটা এমন অবজেক্ট আছে যার `send()` মেথড আছে। এই সামান্য পরিবর্তনটা কিন্তু বিশাল প্রভাব ফেলে। এখন আমরা Module 14-এর Protocol ধারণা ব্যবহার করে এটাকে আরও শক্তিশালী করতে পারি:

```python
from typing import Protocol


class Notifier(Protocol):
    def send(self, message: str) -> None: ...


class EmailNotifier:  # Notifier থেকে ইনহেরিট করার দরকার নেই — শুধু send() মেথড থাকলেই চলবে
    def send(self, message: str) -> None:
        print(f"Email: {message}")


class SmsNotifier:
    def send(self, message: str) -> None:
        print(f"SMS: {message}")


class OrderService:
    def __init__(self, notifier: Notifier):
        self.notifier = notifier

    def place_order(self, item: str) -> None:
        print(f"Order placed for {item}")
        self.notifier.send(f"Your order for {item} is confirmed")


# একই OrderService, ভিন্ন ভিন্ন notifier দিয়ে চালানো যাচ্ছে
order_with_email = OrderService(EmailNotifier())
order_with_sms = OrderService(SmsNotifier())
```

লক্ষ্য করো, এখানে Module 14-এর Protocol আর Polymorphism, Dependency Injection-এর সাথে হাতে হাত ধরে কাজ করছে। `OrderService` শুধু `Notifier` নামের একটা "চুক্তি" (structural shape) চেনে, তার পেছনে আসলে `EmailNotifier` না `SmsNotifier` চলছে সেটা তার কাছে গুরুত্বহীন — আর মনে রাখো, এখানে `EmailNotifier`/`SmsNotifier`-কে `Notifier` থেকে explicit ইনহেরিট করতেও হয়নি, কারণ Python-এর Protocol duck-typed। এই কারণেই টেস্টিং এত সহজ হয়ে যায় — টেস্টের সময় আমরা একটা "ফেক" `Notifier` বানিয়ে দিতে পারি, যেটা আসলে কোনো মেসেজ পাঠায় না, শুধু রেকর্ড রাখে যে `send()` কল হয়েছিলো কিনা।

এই পুরো প্রবাহটাকে ডায়াগ্রামে দেখা যাক:

```mermaid
flowchart LR
    subgraph Without["DI ছাড়া"]
        OS1["OrderService"] -->|নিজেই তৈরি করে| NS1["NotificationService()"]
    end
    subgraph With["DI সহ"]
        Injector["বাইরের কেউ<br/>(Caller / Depends())"] -->|inject করে দেয়| OS2["OrderService"]
        OS2 -.ব্যবহার করে.-> Notifier["Notifier Protocol"]
    end
```

এখন স্বাভাবিক প্রশ্ন — ছোট প্রজেক্টে আমরা তো হাতে হাতেই (`OrderService(EmailNotifier())`) dependency সরবরাহ করে ফেললাম, এত কষ্ট করে dependency বানানোর দরকার কী? সমস্যাটা দেখা যায় যখন সিস্টেম বড় হয়। ধরো তোমার কাছে ৫০টা ক্লাস আছে, আর তাদের মধ্যে জটিল নির্ভরতার জাল আছে — `OrderService`-এর দরকার `PaymentService`, যার দরকার `Logger`, যার দরকার `ConfigService`। প্রতিটা ক্লাস ব্যবহারের আগে হাতে হাতে এই পুরো চেইন তৈরি করা বিরক্তিকর আর ভুলপ্রবণ হয়ে যায়। বেশ কিছু ফ্রেমওয়ার্ক (যেমন NestJS) এই সমস্যা সমাধানের জন্য একটা **DI Container** (বা Injector) বানিয়ে রাখে — একটা কেন্দ্রীয় ব্যবস্থা, যে জানে কোন ক্লাসের কোন dependency দরকার, আর প্রয়োজনের সময় সেটা স্বয়ংক্রিয়ভাবে তৈরি করে সরবরাহ করে দেয়।

এখানেই আমরা এই মডিউলের সবচেয়ে গুরুত্বপূর্ণ, আর একই সাথে সবচেয়ে ভুল-বোঝা-হওয়ার-সম্ভাবনাময় সংযোগ তৈরি করবো — Module 23-এ আমরা যে FastAPI-এর সার্ভিস লেয়ার শিখবো, সেখানে dependency injection হয় FastAPI-এর `Depends()` ফাংশন দিয়ে। কিন্তু এখানে একটা গুরুত্বপূর্ণ **দার্শনিক পার্থক্য (production nuance)** না বললে ভুল ধারণা তৈরি হবে। NestJS-এর মতো ফ্রেমওয়ার্কে DI একটা **গ্লোবাল, স্বয়ংক্রিয় কন্টেইনার**-এর উপর দাঁড়িয়ে — একটা ক্লাসের উপর `@Injectable()` বসিয়ে দিলে ফ্রেমওয়ার্ক নিজেই বুঝে নেয় কখন সেটার instance বানাতে হবে, কার কার কাছে সেটা পাঠাতে হবে; পুরো অ্যাপ্লিকেশনের dependency-গ্রাফ একটা কেন্দ্রীয় জায়গায় রেজিস্টার হয়ে থাকে। FastAPI-এ এমন কোনো কেন্দ্রীয়, গ্লোবাল কন্টেইনার **নেই** — `Depends()` আসলে একটা সাধারণ, explicit মেকানিজম যা প্রতিটা প্যারামিটারের জন্য আলাদাভাবে বলে দেয় "এই ফাংশনটা কল করো, তার রিটার্ন ভ্যালু এখানে বসিয়ে দাও।" কোনো গ্লোবাল রেজিস্ট্রি নেই, প্রতিটা রিকোয়েস্টে explicit ভাবে একটা ফাংশন কল-চেইন তৈরি হয় মাত্র। ছোট উদাহরণ দিয়ে দেখা যাক:

```python
from fastapi import Depends, FastAPI

app = FastAPI()


def get_notifier() -> Notifier:
    return EmailNotifier()


@app.post("/orders")
def place_order(item: str, notifier: Notifier = Depends(get_notifier)):
    notifier.send(f"Your order for {item} is confirmed")
    return {"status": "ok"}
```

লক্ষ্য করো — `notifier: Notifier = Depends(get_notifier)` লাইনটা NestJS-এর `constructor(private notifier: Notifier)`-এর মতো "ম্যাজিকভাবে" রেজলভ হয় না; আমরা explicit ভাবে বলে দিচ্ছি কোন ফাংশন (`get_notifier`) কল করে ভ্যালুটা বানাতে হবে। এই পার্থক্যটা মুখস্থ করার মতো ছোট বিষয় না — এটা দুই ফ্রেমওয়ার্কের দুই ভিন্ন দর্শন। NestJS বলে "framework, তুমি জেনে নাও কীভাবে সব বানাতে হয়, আমি শুধু ঘোষণা দিবো।" FastAPI বলে "আমি explicit ফাংশন-কলের চেইন ছাড়া কিছুই ম্যাজিক করবো না, তুমি নিজেই বলে দাও কীভাবে প্রতিটা টুকরো বানাতে হবে।" এই ধারণাটা Module 23-এ আমরা আরও গভীরে দেখবো।

Dependency Injection বোঝা মানে শুধু একটা প্যাটার্ন শেখা না — এটা একটা নতুন দৃষ্টিভঙ্গি অর্জন করা, যেখানে প্রতিটা ক্লাসকে তুমি প্রশ্ন করবে: "এটা কি নিজের কাজের বাইরের দায়িত্ব নিজের কাঁধে তুলে নিচ্ছে?" পরের লেসনে আমরা দেখবো এমনই আরেকটা creational pattern, Factory Pattern, যেটা dependency তৈরি করার প্রক্রিয়াটাকেই একটা সুশৃঙ্খল কাঠামোতে বেঁধে দেয়।
