# ০৬. One to Many আর One to One নিয়ে আরও গভীরে

আগের লেসনে আমরা One-to-Many বাস্তবায়ন করেছি Foreign Key দিয়ে, আর Many-to-Many সমাধান করেছি junction table দিয়ে। এই লেসনে আমরা এই দুই ধরনের সম্পর্কের সূক্ষ্ম কিছু দিক নিয়ে আরও গভীরে যাবো, আর নতুন করে পরিচিত হবো **One to One** সম্পর্কের সাথে।

প্রথমে One-to-Many নিয়ে আরেকটু ভাবি। আমাদের বইয়ের দোকানে `authors` আর `books`-এর সম্পর্কও আসলে One-to-Many:

```sql
CREATE TABLE authors (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE books (
    id INT PRIMARY KEY,
    title VARCHAR(200),
    author_id INT,
    FOREIGN KEY (author_id) REFERENCES authors(id)
);
```

এখানে একটা গুরুত্বপূর্ণ প্রশ্ন — যদি একটা বইয়ের **দুইজন সহ-লেখক** থাকে (co-author), তাহলে কী হবে? তখন এই ডিজাইন আর কাজ করবে না, কারণ `author_id` কলামে একটা মাত্র মান রাখা যায়। এটা আসলে তখন Many-to-Many হয়ে যায় (একটা বই একাধিক লেখকের, একজন লেখক একাধিক বইয়ের), আর সমাধান হবে ঠিক আগের লেসনের মতো একটা junction table — `book_authors`। এই উদাহরণটা মনে রাখা ভালো, কারণ বাস্তব প্রজেক্টে প্রায়ই দেখা যায় যেটা প্রথমে One-to-Many মনে হয়, বাস্তবে সেটা আসলে Many-to-Many।

`FOREIGN KEY` নিয়ে আরেকটা গুরুত্বপূর্ণ বিষয় হলো — যখন কোনো `author` ডিলিট হয়ে যায়, তখন তার বইগুলোর কী হবে? SQL এখানে কয়েকটা নিয়ম দেয়:

```sql
CREATE TABLE books (
    id INT PRIMARY KEY,
    title VARCHAR(200),
    author_id INT,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);
```

`ON DELETE CASCADE` মানে — লেখক ডিলিট হলে তার সব বইও স্বয়ংক্রিয়ভাবে ডিলিট হয়ে যাবে। এর বিকল্প হলো `ON DELETE SET NULL` (বইগুলো থেকে যায়, কিন্তু `author_id` খালি হয়ে যায়), বা `ON DELETE RESTRICT` (যতক্ষণ বই আছে, ততক্ষণ লেখক ডিলিট করতেই দেবে না)। কোনটা ব্যবহার করবে, সেটা নির্ভর করে বাস্তব ব্যবসায়িক নিয়মের ওপর।

এখন আসি **One to One** সম্পর্কে। এটা তখন ব্যবহার হয় যখন দুটো entity-এর মধ্যে ঠিক একটা-একটা সম্পর্ক থাকে। ধরো আমাদের বইয়ের দোকানে প্রতিটা `author`-এর একটা `author_profile` আছে, যেখানে তার জীবনী, ছবি, সোশ্যাল মিডিয়া লিংকের মতো বাড়তি তথ্য থাকে। এই তথ্যগুলো `authors` টেবিলে না রেখে আলাদা টেবিলে রাখার একটা কারণ থাকতে পারে — এই তথ্যগুলো অনেক বড় (যেমন লম্বা জীবনী টেক্সট), আর প্রতিবার `authors` টেবিল থেকে সাধারণ তথ্য (শুধু নাম) আনতে গেলে এই ভারী তথ্য বহন করার দরকার নেই।

```sql
CREATE TABLE author_profiles (
    author_id INT PRIMARY KEY,
    biography TEXT,
    photo_url VARCHAR(255),
    website VARCHAR(255),
    FOREIGN KEY (author_id) REFERENCES authors(id)
);
```

লক্ষ করো, এখানে বড় পার্থক্যটা হলো — `author_profiles.author_id` নিজেই এই টেবিলের **Primary Key**, শুধু Foreign Key না। এর মানে একই `author_id` দিয়ে এই টেবিলে দ্বিতীয় কোনো সারি তৈরি করা সম্ভব না — একজন author-এর জন্য ঠিক একটাই profile থাকবে, এভাবেই One-to-One সম্পর্ক নিশ্চিত করা হয়।

```mermaid
erDiagram
    AUTHORS ||--|| AUTHOR_PROFILES : has
    AUTHORS ||--o{ BOOKS : writes
    AUTHORS {
        int id PK
        string name
    }
    AUTHOR_PROFILES {
        int author_id PK_FK
        string biography
        string photo_url
    }
    BOOKS {
        int id PK
        string title
        int author_id FK
    }
```

`erDiagram`-এ লক্ষ করো, `AUTHORS ||--|| AUTHOR_PROFILES` — দুই পাশেই `||` চিহ্ন, যেটা বোঝায় "ঠিক একটা"। আগের One-to-Many-তে `AUTHORS ||--o{ BOOKS` লেখা হয়েছিলো, যেখানে `o{` মানে "শূন্য অথবা অনেক"।

তিন ধরনের সম্পর্কের চিহ্নগুলো এভাবে মনে রাখা যায়:

| সম্পর্ক | চিহ্ন | অর্থ |
|---|---|---|
| One to One | `\|\|--\|\|` | ঠিক একটা — ঠিক একটা |
| One to Many | `\|\|--o{` | ঠিক একটা — শূন্য/অনেক |
| Many to Many | `}o--o{` | শূন্য/অনেক — শূন্য/অনেক |

এখন আমাদের হাতে relationship বাস্তবায়নের তিনটা প্যাটার্নই আছে — Foreign Key দিয়ে One-to-Many, junction table দিয়ে Many-to-Many, আর shared primary key দিয়ে One-to-One। পরের লেসনে আমরা দেখবো, একবার এই সম্পর্কগুলো তৈরি হয়ে গেলে, সেগুলো থেকে দরকারি তথ্য একসাথে বের করে আনার জন্য কেন `JOIN` আর subquery দরকার হয়।
