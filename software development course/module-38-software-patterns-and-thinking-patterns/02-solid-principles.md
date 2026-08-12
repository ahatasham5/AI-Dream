# ৩৮.২ SOLID Principles

আগের লেসনে আমরা OOP-এর চারটা স্তম্ভ শিখলাম। কিন্তু শুধু class আর inheritance ব্যবহার করলেই কোড ভালো হয়ে যায় না — খারাপভাবে ডিজাইন করা OOP কোড ঠিক ততটাই জটিল আর ভঙ্গুর হতে পারে যতটা কোনো কাঠামো ছাড়া কোড। SOLID পাঁচটা নীতি, যেগুলো OOP-কে সঠিকভাবে ব্যবহার করার একটা নির্দেশিকা দেয়।

ভাবো একটা সুইস আর্মি নাইফ, যেটাতে ছুরি, কাঁচি, স্ক্রু-ড্রাইভার একসাথে গুঁজে দেয়া — এটা "সব করে" কিন্তু কোনোটাই ভালো করে করে না, আর একটা অংশ ভাঙলে পুরো জিনিসটাই ব্যবহারের অযোগ্য হয়ে যায়। SOLID নীতিগুলো এই ধরনের "সব-এক" ডিজাইন এড়াতে শেখায়।

```mermaid
flowchart TD
    S["S - Single Responsibility<br/>একটা ক্লাসের একটাই কাজ থাকা উচিত"]
    O["O - Open/Closed<br/>এক্সটেনশনের জন্য খোলা, পরিবর্তনের জন্য বন্ধ"]
    L["L - Liskov Substitution<br/>Subclass, parent-এর জায়গায় বসাতে হলে ভাঙা যাবে না"]
    I["I - Interface Segregation<br/>বড় ইন্টারফেসের বদলে ছোট, নির্দিষ্ট ইন্টারফেস"]
    D["D - Dependency Inversion<br/>concrete class-এর বদলে abstraction-এর উপর নির্ভরতা"]
```

**Single Responsibility** ভাঙার উদাহরণ — TaskFlow API-তে একটা `Task` ক্লাস যদি নিজে ডেটাবেজে সংরক্ষণ করে, ইমেইলও পাঠায়, আর PDF রিপোর্টও বানায়, তাহলে এটা তিনটা ভিন্ন দায়িত্ব বহন করছে। সঠিক ডিজাইন:

```javascript
class Task { /* শুধু task-এর ডেটা ও নিজস্ব লজিক */ }
class TaskRepository { save(task) { /* ডেটাবেজে সংরক্ষণ */ } }
class TaskNotifier { notify(task) { /* ইমেইল পাঠানো */ } }
```

**Open/Closed** নীতি Module ৩৮.১-এর `Notification` উদাহরণে ইতিমধ্যে দেখা গেছে — নতুন ধরনের notification (যেমন `PushNotification`) যোগ করতে চাইলে `Notification` ক্লাস পরিবর্তন করতে হয় না, শুধু নতুন একটা subclass বানালেই হয়। কোড "এক্সটেনশনের জন্য খোলা" কিন্তু "পরিবর্তনের জন্য বন্ধ"।

**Dependency Inversion** একটা গুরুত্বপূর্ণ ব্যবহারিক প্যাটার্ন — সরাসরি একটা নির্দিষ্ট ডেটাবেজ ক্লাসের উপর নির্ভর না করে, একটা abstraction-এর উপর নির্ভর করা:

```javascript
class TaskService {
  constructor(repository) {  // কনক্রিট PostgresTaskRepository না, একটা abstraction
    this.repository = repository;
  }
  createTask(data) { return this.repository.save(data); }
}

// টেস্টের সময় সহজেই একটা fake repository বসানো যায়
const service = new TaskService(new InMemoryTaskRepository());
```

এই প্যাটার্নের সুবিধা সরাসরি Module ৩৬.১১-এ শেখা automated testing-এর সাথে যুক্ত — যদি `TaskService` সরাসরি PostgreSQL-এর উপর নির্ভর করতো, প্রতিটা টেস্টে আসল ডেটাবেজ লাগতো; abstraction ব্যবহার করলে টেস্টে একটা হালকা in-memory ভার্সন বসানো যায়।

SOLID নীতিগুলো একসাথে কোডকে নমনীয়, টেস্টযোগ্য, আর পরিবর্তনসহনশীল করে তোলে। কিন্তু বাস্তবে, সময়ের চাপে, এই নীতিগুলো প্রায়ই ভাঙা হয় — আর তখন যে সমস্যাগুলো দেখা দেয়, সেগুলোরই একটা নাম আছে। পরের লেসনে আমরা সেই "code smell" আর তার প্রতিকার refactoring নিয়ে আলোচনা করবো।
