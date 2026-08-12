# ২২.০৩. Factory Design Pattern

আগের লেসনে আমরা দেখেছিলাম Dependency Injection কীভাবে একটা ক্লাসকে তার dependency নিজে তৈরি করার দায়িত্ব থেকে মুক্তি দেয়। কিন্তু একটা প্রশ্ন তখনও অমীমাংসিত রয়ে গিয়েছিলো — dependency-টা যদি নিজে তৈরি করতে না হয়, তাহলে সেটা তৈরি হবে **কোথায়**, আর **কীভাবে** সিদ্ধান্ত হবে কোন নির্দিষ্ট ক্লাসের instance বানাতে হবে? এই প্রশ্নের একটা সুন্দর উত্তর হলো Factory Pattern।

চলো একটা বাস্তব সমস্যা দিয়ে শুরু করি। ধরো তুমি একটা ই-কমার্স সিস্টেম বানাচ্ছো (Module 8-এ আমরা যে e-commerce product API নিয়ে কাজ করেছিলাম, সেটার কথা মনে করো), আর তোমার সিস্টেমে একাধিক পেমেন্ট মেথড সাপোর্ট করতে হবে — Credit Card, bKash, PayPal। Module 14-এ আমরা শিখেছিলাম Interface আর Polymorphism দিয়ে কীভাবে একই নামের মেথড ভিন্ন ভিন্ন ক্লাসে ভিন্নভাবে কাজ করতে পারে। এখানেও আমরা একটা কমন interface বানাবো:

```typescript
interface PaymentMethod {
  pay(amount: number): void;
}

class CreditCardPayment implements PaymentMethod {
  pay(amount: number) {
    console.log(`Charging ৳${amount} to Credit Card`);
  }
}

class BkashPayment implements PaymentMethod {
  pay(amount: number) {
    console.log(`Charging ৳${amount} via bKash`);
  }
}

class PaypalPayment implements PaymentMethod {
  pay(amount: number) {
    console.log(`Charging ৳${amount} via PayPal`);
  }
}
```

এখন সমস্যাটা হলো — ইউজার যখন চেকআউট করে, সে একটা স্ট্রিং পাঠায় (যেমন `"bkash"`), আর আমাদের সেই স্ট্রিং দেখে ঠিক করতে হয় কোন ক্লাসের instance বানাবো। যদি আমরা এই সিদ্ধান্ত নেয়ার লজিকটা আমাদের কন্ট্রোলারের ভেতরে সরাসরি লিখে ফেলি, তাহলে কী হবে দেখা যাক:

```typescript
// খারাপ পদ্ধতি — কন্ট্রোলারের ভেতরেই সিদ্ধান্ত নেয়া হচ্ছে
function checkoutController(method: string, amount: number) {
  let payment: PaymentMethod;

  if (method === "credit_card") {
    payment = new CreditCardPayment();
  } else if (method === "bkash") {
    payment = new BkashPayment();
  } else if (method === "paypal") {
    payment = new PaypalPayment();
  } else {
    throw new Error("Unsupported payment method");
  }

  payment.pay(amount);
}
```

এই কোড কাজ করবে, কিন্তু এখানে দুইটা সমস্যা লুকিয়ে আছে। প্রথমত, এই `if-else` চেইনটা যদি আরও দশটা রুট বা ফাইলে দরকার হয় (যেমন রিফান্ড প্রসেসিং-এও পেমেন্ট মেথড অনুযায়ী সিদ্ধান্ত লাগবে), তাহলে এই একই কোড বারবার কপি-পেস্ট হবে। দ্বিতীয়ত, ভবিষ্যতে নতুন একটা পেমেন্ট মেথড (ধরো `Nagad`) যোগ করতে হলে, তোমাকে প্রতিটা জায়গায় গিয়ে এই `if-else` চেইন খুঁজে খুঁজে আপডেট করতে হবে — এটা ভুলের সম্ভাবনা বাড়ায়।

Factory Pattern এই সমস্যাটার সমাধান দেয় একটা সহজ নিয়মে — **"অবজেক্ট তৈরি করার সিদ্ধান্ত-নেয়ার লজিকটাকে একটা আলাদা, কেন্দ্রীভূত জায়গায় সরিয়ে নাও"**। এই কেন্দ্রীয় জায়গাটাকেই বলে **Factory**।

```typescript
class PaymentFactory {
  static create(method: string): PaymentMethod {
    switch (method) {
      case "credit_card":
        return new CreditCardPayment();
      case "bkash":
        return new BkashPayment();
      case "paypal":
        return new PaypalPayment();
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }
}

// এখন ব্যবহার একেবারে পরিষ্কার এবং সহজ
function checkoutController(method: string, amount: number) {
  const payment = PaymentFactory.create(method);
  payment.pay(amount);
}
```

এখন কন্ট্রোলার শুধু জানে "আমার একটা `PaymentMethod` দরকার, ঠিক কীভাবে সেটা তৈরি হয় সেটা আমার জানার দরকার নেই — `PaymentFactory`-কে জিজ্ঞেস করলেই হবে।" এটাই Factory Pattern-এর মূল কথা — অবজেক্ট তৈরির দায়িত্ব একটা নির্দিষ্ট, বিশেষায়িত ক্লাসের হাতে সঁপে দেয়া। নতুন `Nagad` payment method যোগ করতে হলে এখন তোমাকে শুধু `PaymentFactory`-এর ভেতরে একটা `case` যোগ করতে হবে — বাকি সব কোড অক্ষত থাকে।

ক্লাস ডায়াগ্রামে দেখলে সম্পর্কটা আরও স্পষ্ট হয়:

```mermaid
classDiagram
    class PaymentMethod {
        <<interface>>
        +pay(amount: number)
    }
    class CreditCardPayment {
        +pay(amount: number)
    }
    class BkashPayment {
        +pay(amount: number)
    }
    class PaypalPayment {
        +pay(amount: number)
    }
    class PaymentFactory {
        +create(method: string) PaymentMethod
    }

    PaymentMethod <|.. CreditCardPayment
    PaymentMethod <|.. BkashPayment
    PaymentMethod <|.. PaypalPayment
    PaymentFactory ..> PaymentMethod : creates
```

লক্ষ্য করো তীরের দিক — `PaymentFactory` জানে `PaymentMethod` interface সম্পর্কে, কিন্তু বাকি সিস্টেম শুধু জানে `PaymentFactory`-কে ডাকতে হয়। "কোন কংক্রিট ক্লাস তৈরি হচ্ছে" এই জ্ঞানটা একটা মাত্র জায়গায় বন্দী থাকে — এই নীতিকে সফটওয়্যার ডিজাইনের ভাষায় বলে **encapsulation of object creation**, আর এটা মূলত Module 13-এ শেখা encapsulation-এরই একটা প্রয়োগ, শুধু এবার এটা ডেটা লুকানোর বদলে "সিদ্ধান্ত-নেয়ার লজিক" লুকাচ্ছে।

Factory Pattern-এর সাথে আগের লেসনের Dependency Injection-এর সম্পর্কটাও গুরুত্বপূর্ণ বোঝা। DI বলে "dependency নিজে তৈরি কোরো না, বাইরে থেকে নাও"। কিন্তু কেউ তো একটা জায়গায় সেই dependency তৈরি করবেই — সেই "কেউ"টাই প্রায়শই একটা Factory। তাই বাস্তব সিস্টেমে DI আর Factory প্রায়ই একসাথে কাজ করে — Factory অবজেক্ট তৈরি করে, DI Container সেই তৈরি অবজেক্টটাকে সঠিক জায়গায় পৌঁছে দেয়। NestJS-এ (Module 23) আমরা দেখবো `@Injectable()` ক্লাসগুলো আসলে ফ্রেমওয়ার্কের অভ্যন্তরীণ Factory প্রক্রিয়ার মাধ্যমেই তৈরি হয়, প্রোগ্রামারকে `new` কীওয়ার্ড হাতে লিখতে হয় না।

একটা বাস্তব-জীবনের উপমা দিয়ে শেষ করা যাক। ধরো তুমি একটা গাড়ির শোরুমে গেছো। তুমি শোরুমের কর্মীকে বলো "আমার একটা SUV দরকার", তুমি জানতে চাও না ঠিক কোন কারখানায়, কোন মেশিনে, কোন প্রক্রিয়ায় গাড়িটা তৈরি হয়েছে। শোরুমের কর্মী (Factory) তোমার চাহিদা (parameter) শুনে সঠিক গাড়িটা (object) বের করে দেয়। তুমি শুধু ফলাফলটা নিয়ে চলে যাও — সৃষ্টি প্রক্রিয়ার জটিলতা তোমার কাছে সম্পূর্ণ আড়ালে থেকে যায়।

পরের লেসনে আমরা Behavioral pattern-এর জগতে যাবো, আর দেখবো Strategy Pattern কীভাবে "কোন অ্যালগরিদম দিয়ে কাজ করা হবে" — এই সিদ্ধান্তটা রানটাইমে, নমনীয়ভাবে পাল্টানোর সুযোগ দেয়।
