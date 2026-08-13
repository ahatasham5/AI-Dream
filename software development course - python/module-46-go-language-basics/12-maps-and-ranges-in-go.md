# ১২. Maps and Ranges in Go

লেসন ১১-এ আমরা দেখেছিলাম slice কীভাবে ইনডেক্স দিয়ে ডেটা রাখে — ০, ১, ২... কিন্তু বাস্তব জীবনের অনেক ডেটাই ইনডেক্স দিয়ে নয়, নাম দিয়ে খোঁজা হয়। যেমন একটা ফোনবুক — তুমি "৩নং এন্ট্রি" বলে কাউকে খোঁজো না, নাম বলে খোঁজো। Go-তে এই ধরনের key-value পেয়ারিং-এর জন্য আছে **map**।

```go
ages := map[string]int{
    "Arman":  28,
    "Karim":  35,
    "Fatima": 22,
}

fmt.Println(ages["Karim"]) // 35
```

`map[string]int` মানে key হবে string, value হবে int। খালি map বানাতে চাইলে `make` ব্যবহার করা হয়:

```go
scores := make(map[string]int)
scores["Math"] = 90
```

এখন একটা গুরুত্বপূর্ণ প্রশ্ন — যদি এমন কোনো key খোঁজো যেটা map-এ নেই, তাহলে কী হয়? Go crash করে না, বরং সেই টাইপের **zero value** ফেরত দেয় (int-এর জন্য 0)। কিন্তু এতে একটা সমস্যা — তুমি বুঝবে কীভাবে যে key আসলেই নেই, নাকি key আছে কিন্তু ভ্যালুই আসলে 0? এখানে কাজে লাগে Go-এর বিখ্যাত **comma-ok idiom**:

```go
value, ok := scores["Physics"]
if !ok {
    fmt.Println("Physics নামে কোনো key নেই")
} else {
    fmt.Println("ভ্যালু:", value)
}
```

`ok` একটা বুলিয়ান — true হলে key আসলেই ছিলো, false হলে ছিলো না। এই প্যাটার্নটা Go-এর অনেক জায়গায় ফিরে ফিরে আসে (যেমন পরে error handling-এ, লেসন ১৮-এ আমরা `errors.As` নিয়ে কথা বলবো, সেখানেও একই ধাঁচের idiom দেখবে)।

key মুছে ফেলতে হলে `delete()` ব্যবহার করা হয়:

```go
delete(scores, "Math")
```

এবার আসি **range**-এ, যেটা দিয়ে slice, map, আর string — তিনটার মধ্য দিয়েই লুপ চালানো যায়, যদিও প্রতিটার আচরণ একটু আলাদা।

```go
// slice-এর উপর range
nums := []int{10, 20, 30}
for index, value := range nums {
    fmt.Println(index, value) // 0 10, 1 20, 2 30
}

// map-এর উপর range
for key, value := range ages {
    fmt.Println(key, value) // ক্রম নিশ্চিত নয়!
}

// string-এর উপর range
for i, char := range "গো" {
    fmt.Println(i, string(char)) // ইউনিকোড অক্ষর অনুযায়ী
}
```

একটা জিনিস মাথায় রাখা জরুরি — map-এর উপর range চালালে প্রতিবার একই ক্রমে key পাওয়ার নিশ্চয়তা নেই। Go ইচ্ছাকৃতভাবে এই ক্রমটা randomize করে রাখে, যাতে ডেভেলপাররা ভুল করে map-এর অর্ডারের উপর নির্ভর করে কোড না লেখে। যদি নির্দিষ্ট ক্রম দরকার হয়, key-গুলো আলাদা slice-এ নিয়ে সেটাকে sort করে নিতে হয়।

string-এর উপর range করলে সেটা byte-by-byte না গিয়ে **rune** (ইউনিকোড ক্যারেক্টার) অনুযায়ী চলে, যেটা বাংলার মতো ইউনিকোড-নির্ভর ভাষার জন্য গুরুত্বপূর্ণ — নইলে একটা বাংলা অক্ষর ভেঙে অর্থহীন byte হয়ে যেতে পারত।

পরের লেসনে আমরা দেখবো Go-তে ক্লিনআপ আর error-recovery-এর জন্য বিশেষ তিনটা কিওয়ার্ড — defer, panic, আর recover — কীভাবে কাজ করে।
