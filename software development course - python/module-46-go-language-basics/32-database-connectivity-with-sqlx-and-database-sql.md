# ৩২. Database Connectivity with sqlx and database/sql

এতদিন আমরা ডাটা নিয়ে কথা বলেছি নেটওয়ার্কের প্রেক্ষাপটে — JSON, WebSocket, gRPC। কিন্তু আসল প্রশ্ন হলো, এই ডাটা আসছে কোথা থেকে? বেশিরভাগ ক্ষেত্রে উত্তর — একটা ডাটাবেস থেকে। Go-এর standard library-তেই আছে `database/sql` নামের একটা প্যাকেজ, যা কোনো নির্দিষ্ট ডাটাবেসের সাথে সরাসরি বাঁধা না — এটা একটা সাধারণ **interface**, যার পেছনে Postgres, MySQL, SQLite যেকোনো ড্রাইভার বসানো যায়। এটা অনেকটা ইউনিভার্সাল চার্জারের মতো — পোর্টটা একই থাকে, শুধু ভেতরের অ্যাডাপ্টার বদলায়।

সংযোগ শুরু হয় `sql.Open` দিয়ে, যা আসলে সাথে সাথেই কানেকশন তৈরি করে না — বরং একটা **connection pool** (`sql.DB`) তৈরি করে, যা প্রয়োজনমতো কানেকশন খুলবে-বন্ধ করবে।

```go
import (
    "database/sql"
    _ "github.com/lib/pq" // Postgres ড্রাইভার
)

db, err := sql.Open("postgres", "host=localhost user=arman dbname=mydb sslmode=disable")
if err != nil {
    log.Fatal(err)
}
defer db.Close()

var name string
err = db.QueryRow("SELECT name FROM users WHERE id = $1", 1).Scan(&name)
```

লক্ষ্য করো `Scan` মেথডটা — প্রতিটা কলামের ভ্যালু ম্যানুয়ালি আলাদা ভ্যারিয়েবলে বসাতে হচ্ছে। একটা struct-এ একাধিক ফিল্ড থাকলে এই কাজ দ্রুত বিরক্তিকর হয়ে ওঠে, বিশেষ করে টেবিলে যদি ১০-১৫টা কলাম থাকে। এই ঘষামাজার কাজ কমানোর জন্যই এসেছে `sqlx` — এটা `database/sql`-কে পুরোপুরি প্রতিস্থাপন করে না, বরং এর উপরে একটা পাতলা সুবিধার আস্তরণ যোগ করে।

```go
import "github.com/jmoiron/sqlx"

type User struct {
    ID    int    `db:"id"`
    Name  string `db:"name"`
    Email string `db:"email"`
}

db, err := sqlx.Connect("postgres", "host=localhost user=arman dbname=mydb sslmode=disable")

var user User
err = db.Get(&user, "SELECT id, name, email FROM users WHERE id = $1", 1)

var users []User
err = db.Select(&users, "SELECT id, name, email FROM users WHERE age > $1", 18)
```

এখানে `db` struct tag গুলো (লেসন ২৮-এ দেখা `json` tag-এর মতোই ধারণা) sqlx-কে বলে দেয় কোন কলাম কোন ফিল্ডে বসবে, আর `Get`/`Select` মেথড পুরো row বা একাধিক row সরাসরি struct-এ ভরে দেয় — আলাদা `Scan` কল করা লাগে না।

INSERT বা UPDATE-এর মতো কাজে ব্যবহার হয় `Exec`, যা কতগুলো row পরিবর্তিত হলো তা জানায়:

```go
result, err := db.Exec("UPDATE users SET name = $1 WHERE id = $2", "নতুন নাম", 1)
rows, _ := result.RowsAffected()
```

`database/sql` তোমাকে পুরো নিয়ন্ত্রণ দেয় — ঠিক কোন SQL চলবে, তার উপর সম্পূর্ণ হাত থাকে, কিন্তু বয়লারপ্লেট বেশি। `sqlx` সেই নিয়ন্ত্রণ ধরে রেখেই বয়লারপ্লেট কমায়। পরের লেসনে আমরা দেখবো, টেবিল-কলামের বদলে যখন ডাটা ডকুমেন্ট আকারে থাকে, তখন MongoDB-এর সাথে Go কীভাবে কাজ করে।
