# ২৮.০৩. Cursor-based Pagination for Large Datasets

আগের লেসনের শেষে আমরা দেখেছি offset pagination-এর একটা বাস্তব সমস্যা আছে — গভীর পাতায় (deep pages) যাওয়ার সময় ডেটাবেজকে অনেক রেকর্ড "গুনে বাদ দিতে" হয়, যা ধীরগতির। আরেকটা সূক্ষ্ম সমস্যাও আছে — যদি ইউজার পাতা ২ দেখার সময় নতুন একটা প্রোডাক্ট যোগ হয়, তাহলে পাতা ৩-এ গিয়ে ইউজার একটা প্রোডাক্ট দুইবার দেখতে পারে, বা একটা মিস করতে পারে, কারণ "পজিশন" নম্বর দিয়ে হিসাব করা হচ্ছে, যেটা ডেটা বদলালে শিফট হয়ে যায়।

**Cursor-based Pagination** এই দুইটা সমস্যাই সমাধান করে। এর মূল ধারণা হলো — "কততম আইটেম" দিয়ে না গুনে, বরং "শেষ যে আইটেমটা দেখেছো, তার পরের আইটেমগুলো দাও" — এভাবে হিসাব করা। এই "শেষ দেখা আইটেম"-এর একটা ইউনিক, ক্রমবর্ধমান শনাক্তকারী (যেমন `id` বা `createdAt`) হলো cursor।

```sql
-- প্রথম পাতা
SELECT * FROM products
WHERE deleted_at IS NULL
ORDER BY id ASC
LIMIT 20;

-- পরের পাতা — cursor হলো আগের পাতার শেষ id (ধরো ১২৩৪৫৬৭)
SELECT * FROM products
WHERE deleted_at IS NULL AND id > 1234567
ORDER BY id ASC
LIMIT 20;
```

লক্ষ্য করো, এখানে `OFFSET` নেই — ডেটাবেজ সরাসরি `id > 1234567` শর্ত মেনে ইনডেক্স ব্যবহার করে সরাসরি সঠিক জায়গা থেকে পড়া শুরু করতে পারে (Module 21-এ B-Tree ইনডেক্স শেখার সময় এই "সরাসরি সঠিক জায়গায় লাফ দেয়া" ক্ষমতাটাই ইনডেক্সের আসল শক্তি হিসেবে দেখেছিলে)। তাই cursor pagination ডেটাসেট যত বড়ই হোক না কেন, পারফরম্যান্স প্রায় একই থাকে — পাতা ২ আর পাতা ২০,০০০ প্রায় সমান গতিতে লোড হয়।

Express-এ ইমপ্লিমেন্টেশন:

```typescript
// product/product.controller.ts
export const getProductsCursor = catchAsync(async (req, res) => {
  const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
  const cursor = req.query.cursor as string | undefined;

  const { rows: products } = await db.query(
    `SELECT * FROM products
     WHERE deleted_at IS NULL ${cursor ? 'AND id > $2' : ''}
     ORDER BY id ASC LIMIT $1`,
    cursor ? [limit, cursor] : [limit],
  );

  const nextCursor = products.length === limit ? products[products.length - 1].id : null;

  res.json(successResponse(products, { limit, nextCursor }));
});
```

ক্লায়েন্ট প্রথম রিকোয়েস্টে কোনো cursor পাঠাবে না, রেসপন্স থেকে `nextCursor` পাবে, পরের রিকোয়েস্টে সেটা `?cursor=<value>` হিসেবে পাঠাবে — এভাবেই এগিয়ে যাওয়া।

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server

    C->>S: GET /products?limit=20
    S-->>C: data: [...20 items], nextCursor: "id_20"
    C->>S: GET /products?limit=20&cursor=id_20
    S-->>C: data: [...পরের ২০টা], nextCursor: "id_40"
```

Cursor pagination-এর একটা সীমাবদ্ধতা হলো — এটা "পাতা ৫০-এ সরাসরি লাফ দাও" জাতীয় UI-এর জন্য উপযুক্ত না, কারণ প্রতিটা cursor শুধু তার ঠিক আগের পাতার উপর নির্ভরশীল, র‍্যান্ডম-অ্যাক্সেস করা যায় না। এই কারণে এটা মূলত ব্যবহার হয় "infinite scroll" ধরনের UI-তে (সোশ্যাল মিডিয়া ফিড, প্রোডাক্ট ফিড), যেখানে ইউজার শুধু নিচের দিকে স্ক্রল করতে থাকে, নির্দিষ্ট পাতা নম্বরে যাওয়ার দরকার হয় না। আর অ্যাডমিন ড্যাশবোর্ডের মতো জায়গায়, যেখানে পাতা নম্বর দেখানো দরকার, সেখানে আগের লেসনের offset pagination-ই বেশি মানানসই।

দুটো পদ্ধতিই এখন আমাদের হাতে আছে, আর কখন কোনটা ব্যবহার করতে হবে সেটাও পরিষ্কার। কিন্তু pagination একা যথেষ্ট না — বাস্তব ইউজার প্রায়ই চায় নির্দিষ্ট শর্ত অনুযায়ী ফিল্টার করা ডেটা (যেমন শুধু "Electronics" ক্যাটাগরির, ৫০০-১০০০ টাকার মধ্যে প্রোডাক্ট)। পরের এবং এই মডিউলের শেষ লেসনে আমরা একাধিক প্যারামিটার দিয়ে ফিল্টারিং শিখবো।
