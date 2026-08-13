# ৩৩. Using NoSQL Databases (MongoDB) in Go

লেসন ৩২-এ আমরা দেখেছি SQL ডাটাবেসে ডাটা থাকে সারি-কলামের কড়া নিয়মে সাজানো টেবিলে, ঠিক যেমন একটা অফিসের ফাইলিং ক্যাবিনেটে প্রতিটা ফর্ম একই ছকে পূরণ করতে হয়। কিন্তু সবসময় ডাটা এত সুশৃঙ্খল হয় না। ধরো তুমি একটা প্রোডাক্ট ক্যাটালগ বানাচ্ছো, যেখানে জুতার প্রোডাক্টে "সাইজ" আছে, কিন্তু বইয়ের প্রোডাক্টে "পৃষ্ঠাসংখ্যা" আছে — দুটো সম্পূর্ণ ভিন্ন গঠনের ডাটা একই কালেকশনে রাখতে হবে। এখানে টেবিল-কলামের কড়া কাঠামো বরং বাধা হয়ে দাঁড়ায়। এই নমনীয়তার জন্যই আছে **MongoDB**-এর মতো NoSQL ডাটাবেস, যেখানে ডাটা থাকে JSON-এর মতো নমনীয় **document** আকারে, টেবিলের বদলে।

Go থেকে MongoDB-এর সাথে কথা বলার জন্য অফিসিয়াল ড্রাইভার হলো `mongo-go-driver`। সংযোগ করার ধরনটা কিছুটা `database/sql`-এর মতোই — একটা client তৈরি করা হয়, যা পুরো অ্যাপ্লিকেশন জুড়ে পুনর্ব্যবহার করা হয়।

```go
import (
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "go.mongodb.org/mongo-driver/bson"
)

client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
if err != nil {
    log.Fatal(err)
}
collection := client.Database("shop").Collection("products")
```

ডাটা ঢোকানোর জন্য কোনো CREATE TABLE লাগে না — সরাসরি একটা struct-কে document হিসেবে insert করে দেয়া যায়।

```go
type Product struct {
    Name  string  `bson:"name"`
    Price float64 `bson:"price"`
    Tags  []string `bson:"tags,omitempty"`
}

product := Product{Name: "Running Shoes", Price: 2500, Tags: []string{"sports", "shoes"}}
_, err = collection.InsertOne(ctx, product)
```

এখানে `bson` tag ব্যবহার হয়েছে (লেসন ২৮-এর `json` tag আর লেসন ৩২-এর `db` tag-এর মতোই ধারণা, শুধু MongoDB internally BSON নামের একটা বাইনারি JSON-সদৃশ ফরম্যাট ব্যবহার করে বলে ভিন্ন নাম)। খুঁজে বের করার সময় ব্যবহার হয় `bson.M`, যা মূলত একটা key-value ফিল্টার তৈরি করে।

```go
var result Product
filter := bson.M{"name": "Running Shoes"}
err = collection.FindOne(ctx, filter).Decode(&result)

cursor, err := collection.Find(ctx, bson.M{"price": bson.M{"$gt": 1000}})
var products []Product
cursor.All(ctx, &products)
```

SQL আর NoSQL-এর মূল পার্থক্যটা শুধু সিনট্যাক্সে না, বরং **ডাটা মডেলিং-এর চিন্তায়**। SQL-এ তুমি আগে থেকে স্কিমা ঠিক করো আর সম্পর্কযুক্ত ডাটা আলাদা টেবিলে রেখে জয়েন করো (normalization)। MongoDB-তে প্রায়ই সম্পর্কিত ডাটা একই document-এর ভেতরে embed করে রাখা হয় (denormalization), যাতে একবারের কোয়েরিতেই সবকিছু পাওয়া যায় — দ্রুত পড়ার বিনিময়ে কিছুটা ডুপ্লিকেশন মেনে নেয়া হয়। কোনটা ব্যবহার করবে তা নির্ভর করে তোমার ডাটা কতটা সম্পর্কযুক্ত (relational) আর কতটা প্রায়ই পরিবর্তনশীল গঠনের (schema-flexible), তার উপর।

পরের লেসনে আমরা দেখবো, SQL-এর সাথে কাজ করার সময় hand-written কোয়েরির বদলে ORM ব্যবহার করলে কী সুবিধা-অসুবিধা হয় — GORM বনাম Ent।
