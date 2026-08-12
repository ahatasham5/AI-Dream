# ০২. Example with Class: Polymorphism হাতে-কলমে

আগের লেসনে আমরা `Product`-এর তিনটা সাবক্লাস দিয়ে দেখেছি কীভাবে একই মেথড নাম ভিন্ন ভিন্ন আচরণ করতে পারে। এই লেসনে আমরা আরেকটা বাস্তবসম্মত উদাহরণ দিয়ে বিষয়টা আরও গভীরভাবে অনুশীলন করবো — একটা **আকৃতি (Shape) হিসাব করার সিস্টেম**, যেটা OOP শেখানোর সবচেয়ে ক্লাসিক উদাহরণগুলোর একটা, কারণ এখানে প্রতিটা আকৃতির "ক্ষেত্রফল বের করা" (calculateArea) সম্পূর্ণ আলাদা সূত্র মেনে চলে।

```ts
abstract class Shape {
  abstract calculateArea(): number;

  describe(): string {
    return `${this.constructor.name}-এর ক্ষেত্রফল: ${this.calculateArea().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super();
  }

  calculateArea(): number {
    return this.width * this.height;
  }
}

class Triangle extends Shape {
  constructor(private base: number, private height: number) {
    super();
  }

  calculateArea(): number {
    return (this.base * this.height) / 2;
  }
}
```

এখানে Module 13 Lesson 8-এর `abstract class` ধারণাটা আবার ব্যবহার করেছি। `Shape` নিজে থেকে `new Shape()` দিয়ে বানানো যাবে না — এটা শুধু একটা নিয়ম বেঁধে দিচ্ছে: "যে কেউ `Shape` হতে চাও, তোমাকে অবশ্যই `calculateArea()` বাস্তবায়ন করতে হবে।" এই নিয়মটাকেই বলা যায় polymorphism-এর "চুক্তি" — প্রতিটা সাবক্লাস নিজের মতো করে সূত্র বাস্তবায়ন করে, কিন্তু সবাই একই নামে (`calculateArea`) সাড়া দেয়।

এখন এই তিনটা ভিন্ন আকৃতিকে একসাথে ব্যবহার করি:

```ts
const shapes: Shape[] = [
  new Circle(5),
  new Rectangle(4, 6),
  new Triangle(3, 8),
];

let totalArea = 0;
for (const shape of shapes) {
  console.log(shape.describe());
  totalArea += shape.calculateArea();
}

console.log(`মোট ক্ষেত্রফল: ${totalArea.toFixed(2)}`);
```

আউটপুট হবে:

```
Circle-এর ক্ষেত্রফল: 78.54
Rectangle-এর ক্ষেত্রফল: 24.00
Triangle-এর ক্ষেত্রফল: 12.00
মোট ক্ষেত্রফল: 114.54
```

এখানে সবচেয়ে গুরুত্বপূর্ণ লাইনটা হলো `totalArea += shape.calculateArea()`। এই একটা লাইন কোনোভাবেই জানে না ভেতরে বৃত্ত না আয়তক্ষেত্র না ত্রিভুজ চলছে — সে শুধু বিশ্বাস করে প্রতিটা `Shape`-এর একটা `calculateArea()` মেথড থাকবে, যেটা একটা সংখ্যা ফেরত দেবে। এই বিশ্বাসটাই TypeScript নিশ্চিত করে দেয় কম্পাইল-টাইমে — `abstract calculateArea(): number` ঘোষণার মাধ্যমে।

```mermaid
sequenceDiagram
    participant Loop as for লুপ
    participant C as Circle
    participant R as Rectangle
    participant T as Triangle

    Loop->>C: calculateArea()
    C-->>Loop: 78.54 (π × r²)
    Loop->>R: calculateArea()
    R-->>Loop: 24.00 (width × height)
    Loop->>T: calculateArea()
    T-->>Loop: 12.00 (base × height / 2)
```

লক্ষ্য করো, `describe()` মেথডটা `Shape`-এর ভেতরেই লেখা, কোনো সাবক্লাসে override করা হয়নি — অথচ এটা নিজে থেকেই `this.calculateArea()` কল করে সঠিক ফলাফল পায়, কারণ যখন `circle.describe()` কল হয়, তখন `this` আসলে সেই `Circle` instance-টাকেই বোঝায়, তাই `this.calculateArea()` স্বয়ংক্রিয়ভাবে `Circle`-এর নিজস্ব সূত্র ব্যবহার করে, `Rectangle`-এর না। এটাকেই বলে **dynamic method dispatch** — মেথড কোনটা চলবে তা ঠিক হয় রানটাইমে, কোন instance কল করছে তার উপর ভিত্তি করে, লেখার সময় (compile-time) না।

এই প্যাটার্নটা এত শক্তিশালী কারণ এটা **if-else বা switch-case-এর বিকল্প** হিসেবে কাজ করে। polymorphism ছাড়া আমাদের লিখতে হতো:

```ts
function calculateArea(shape: any): number {
  if (shape.type === "circle") return Math.PI * shape.radius ** 2;
  else if (shape.type === "rectangle") return shape.width * shape.height;
  else if (shape.type === "triangle") return (shape.base * shape.height) / 2;
  // নতুন আকৃতি যোগ হলেই আরেকটা else-if লিখতে হবে, পুরনো ফাংশন পাল্টাতে হবে
}
```

এই পুরনো পদ্ধতিতে নতুন আকৃতি যোগ করতে হলে এই কেন্দ্রীয় ফাংশনটাই পাল্টাতে হয়, যেটা ঝুঁকিপূর্ণ — ভুল করে অন্য শর্ত নষ্ট হয়ে যেতে পারে। Polymorphism-এ নতুন আকৃতি মানেই শুধু একটা নতুন ক্লাস যোগ করা, পুরনো কোড স্পর্শ না করেই।

এখন আমরা দেখেছি polymorphism কীভাবে কোডকে সম্প্রসারণযোগ্য (extensible) করে তোলে। পরের লেসনে আমরা দেখবো বাস্তব ব্যাকএন্ড সিস্টেমে — যেমন পেমেন্ট গেটওয়ে বা নোটিফিকেশন সার্ভিসে — এই ধারণাটা কীভাবে `interface`-এর সাথে মিলে কাজ করে।
