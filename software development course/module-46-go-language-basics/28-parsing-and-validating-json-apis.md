# ২৮. Parsing and Validating JSON APIs

লেসন ০৯-এ আমরা JSON নিয়ে প্রাথমিক পরিচয় করেছিলাম, আর লেসন ২৬-২৭-এ HTTP সার্ভার আর হ্যান্ডলার বানানো শিখেছি। এখন এই দুটোকে একসাথে জোড়া লাগানোর সময় — কারণ বাস্তব জীবনের কোনো API শুধু "রিকোয়েস্ট এলো, রেসপন্স দিলাম" এত সহজ না। ধরো তুমি একটা রেস্টুরেন্টের ওয়েটার, কাস্টমার অর্ডার লিখে পাঠালো একটা কাগজে। তুমি প্রথমে কাগজটা পড়বে (parsing), তারপর দেখবে অর্ডারটা আদৌ বৈধ কিনা — যেমন "৫০০ প্লেট বিরিয়ানি" লেখা থাকলে সেটা সন্দেহজনক (validation)। JSON API-তেও ঠিক এই দুই ধাপ লাগে।

Go-তে JSON parsing হয় **struct tags** দিয়ে। একটা struct-এর ফিল্ডের পাশে ব্যাকটিক দিয়ে লেখা হয় কোন JSON key-এর সাথে সেই ফিল্ড ম্যাপ হবে।

```go
type CreateUserRequest struct {
    Name  string `json:"name"`
    Email string `json:"email"`
    Age   int    `json:"age"`
}
```

কিন্তু শুধু parse করলেই কাজ শেষ না। কেউ যদি খালি Name পাঠায়, বা Age-এ ঋণাত্মক সংখ্যা দেয়, বা Email-এ "abc" লিখে পাঠায় — এগুলো syntax-ভাবে বৈধ JSON, কিন্তু business rule অনুযায়ী অবৈধ। এখানেই দরকার **validation**। ম্যানুয়ালি if-else দিয়ে চেক করা যায়, কিন্তু ফিল্ড বেশি হলে কোড অগোছালো হয়ে যায়। তাই বাস্তব প্রজেক্টে `go-playground/validator` নামের একটা জনপ্রিয় লাইব্রেরি ব্যবহার করা হয়, যেখানে struct tag-এর মধ্যেই নিয়ম লিখে দেয়া যায়।

```go
import "github.com/go-playground/validator/v10"

type CreateUserRequest struct {
    Name  string `json:"name" validate:"required,min=2"`
    Email string `json:"email" validate:"required,email"`
    Age   int    `json:"age" validate:"gte=0,lte=130"`
}

var validate = validator.New()

func createUserHandler(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid JSON body", http.StatusBadRequest)
        return
    }

    if err := validate.Struct(req); err != nil {
        http.Error(w, err.Error(), http.StatusUnprocessableEntity)
        return
    }

    // এখানে req নিশ্চিতভাবে বৈধ, ডাটাবেসে সেভ করার মতো প্রস্তুত
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(req)
}
```

লক্ষ্য করো, দুটো আলাদা স্তরের error হ্যান্ডলিং হলো — প্রথমে "এটা কি আদৌ পড়া যায়" (decode error), তারপর "এটা কি গ্রহণযোগ্য" (validation error)। এই আলাদা করাটা গুরুত্বপূর্ণ, কারণ ক্লায়েন্টকে সঠিক HTTP status code ফেরত দেয়া দরকার — ৪০০ (Bad Request) বনাম ৪২২ (Unprocessable Entity) এর পার্থক্য বাস্তব API ডিজাইনে গুরুত্বপূর্ণ একটা খুঁটিনাটি বিষয়।

এভাবে struct tags আর validator লাইব্রেরি মিলে একটা পরিষ্কার, পুনর্ব্যবহারযোগ্য নিয়ম তৈরি করে দেয়, যা প্রতিটা হ্যান্ডলারে বারবার একই কোড লেখা থেকে বাঁচায়।

পরের লেসনে আমরা দেখবো, যখন ক্লায়েন্ট আর সার্ভারকে একবারের রিকোয়েস্ট-রেসপন্সের বদলে ক্রমাগত কথা চালিয়ে যেতে হয়, তখন কী কাজে লাগে — WebSocket।
