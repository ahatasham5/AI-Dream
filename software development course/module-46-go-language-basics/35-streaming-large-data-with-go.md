# ৩৫. Streaming Large Data with Go

কল্পনা করো তোমাকে একটা ২ গিগাবাইটের ভিডিও ফাইল একজন ইউজারকে ডাউনলোড করতে দিতে হবে। যদি তুমি পুরো ফাইলটা আগে মেমোরিতে লোড করে, তারপর একসাথে পাঠাও — তাহলে সার্ভারের RAM দ্রুত শেষ হয়ে যাবে, বিশেষ করে যদি ১০০ জন ইউজার একসাথে ডাউনলোড করে। এটা অনেকটা একটা বালতি দিয়ে পুরো নদীর পানি একসাথে বহন করার চেষ্টা করার মতো — অসম্ভব। বাস্তবসম্মত পদ্ধতি হলো একটা পাইপ বসিয়ে দেয়া, যার মধ্য দিয়ে পানি অল্প অল্প করে অবিরাম প্রবাহিত হতে থাকে। প্রোগ্রামিং-এ এই "পাইপ"-এর ধারণাটাই হলো **streaming**, আর Go-তে এটা বাস্তবায়িত হয় `io.Reader` আর `io.Writer` ইন্টারফেস দিয়ে।

`io.Reader` মানে "যেখান থেকে ডাটা একটু একটু করে পড়া যায়" আর `io.Writer` মানে "যেখানে ডাটা একটু একটু করে লেখা যায়"। ফাইল, নেটওয়ার্ক কানেকশন, এমনকি HTTP রিকোয়েস্ট বডি — সবাই এই দুই ইন্টারফেস মেনে চলে, তাই একই কোড দিয়ে ভিন্ন ভিন্ন উৎস-গন্তব্য সামলানো যায়।

```go
func downloadHandler(w http.ResponseWriter, r *http.Request) {
    file, err := os.Open("large-video.mp4")
    if err != nil {
        http.Error(w, "file not found", http.StatusNotFound)
        return
    }
    defer file.Close()

    w.Header().Set("Content-Type", "video/mp4")
    io.Copy(w, file) // ফাইল থেকে সরাসরি রেসপন্সে স্ট্রিম হচ্ছে
}
```

লক্ষ্য করো, `io.Copy` পুরো ফাইলটা কখনোই একসাথে মেমোরিতে নেয় না — এটা ভেতরে ভেতরে একটা ছোট বাফার (ডিফল্ট ৩২ কিলোবাইট) ব্যবহার করে বারবার পড়ে আর লেখে, যতক্ষণ না পুরো ফাইল শেষ হয়। এই একই নীতি কাজ করে আপলোডের ক্ষেত্রেও — ক্লায়েন্ট থেকে আসা `r.Body` নিজেই একটা `io.Reader`, তাই পুরো রিকোয়েস্ট বডি মেমোরিতে না এনেই সরাসরি ডিস্কে লেখা যায়।

```go
func uploadHandler(w http.ResponseWriter, r *http.Request) {
    out, err := os.Create("uploaded-file.dat")
    if err != nil {
        http.Error(w, "server error", http.StatusInternalServerError)
        return
    }
    defer out.Close()

    written, err := io.Copy(out, r.Body)
    if err != nil {
        http.Error(w, "upload failed", http.StatusInternalServerError)
        return
    }
    fmt.Fprintf(w, "uploaded %d bytes", written)
}
```

আরেকটা গুরুত্বপূর্ণ টুল হলো `bufio` প্যাকেজ, যা লাইন-বাই-লাইন পড়ার সময় কাজে লাগে — যেমন একটা বিশাল লগ ফাইল থেকে একেকটা লাইন প্রসেস করা, পুরো ফাইল না পড়েই।

```go
scanner := bufio.NewScanner(file)
for scanner.Scan() {
    line := scanner.Text()
    processLine(line)
}
```

এই স্ট্রিমিং প্যাটার্নটা লেসন ২৬-২৭-এ শেখা HTTP handler-এর সাথে দারুণভাবে মেলে — কারণ `http.ResponseWriter` নিজেই একটা `io.Writer`, তাই স্ট্রিমিং কোনো বাড়তি লাইব্রেরি ছাড়াই স্বাভাবিকভাবেই কাজ করে। মূল শিক্ষা হলো — যখনই ডাটার আকার অজানা বা বিশাল হতে পারে, লোড-করে-তারপর-পাঠানোর বদলে সবসময় স্ট্রিম করার কথা ভাবা উচিত।

পরের লেসনে আমরা দেখবো, JSON ছাড়াও আর কী কী ফরম্যাটে (XML, YAML, CSV) ডাটা সিরিয়ালাইজ করা যায়, আর কখন কোনটা বেছে নেয়া উচিত।
