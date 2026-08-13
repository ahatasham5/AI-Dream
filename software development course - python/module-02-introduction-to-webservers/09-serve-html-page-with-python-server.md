# ০৯. How to Serve HTML Page with Python Server?

আমাদের নিজের বানানো সার্ভারটা এখন পর্যন্ত শুধু একটা প্লেইন টেক্সট বার্তা পাঠাচ্ছে — `self.wfile.write('হ্যালো...')`। কিন্তু আসল ওয়েবসাইট তো টেক্সট না, HTML পাতা দেখায় — হেডিং, প্যারাগ্রাফ, ছবি, বাটন। এই লেসনে আমরা আমাদের সার্ভারকে শেখাবো কীভাবে একটা প্রকৃত HTML ফাইল খুঁজে বের করে ব্রাউজারের কাছে পাঠাতে হয়।

প্রথমেই বুঝে নেয়া দরকার, ব্রাউজার কীভাবে জানে যে তুমি যে টেক্সট পাঠিয়েছো সেটা সাধারণ লেখা, নাকি HTML? উত্তর হলো, ব্রাউজারকে এটা বলে দিতে হয়, আর সেটা বলা হয় একটা বিশেষ তথ্যের মাধ্যমে, যাকে বলে **header** — বিশেষভাবে `Content-Type` header। আমরা আমাদের response-এ এই header যোগ করবো, বলবো "আমি যা পাঠাচ্ছি সেটা HTML, প্লেইন টেক্সট না।"

চলো প্রথমে একটা HTML ফাইল বানাই। একই ফোল্ডারে `index.html` নামে একটা ফাইল তৈরি করো:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>আমার প্রথম Python সাইট</title>
  </head>
  <body>
    <h1>স্বাগতম!</h1>
    <p>এই পাতাটা Python সার্ভার থেকে পাঠানো হয়েছে।</p>
  </body>
</html>
```

এখন `server.py` ফাইলটা বদলাই, যাতে এটা প্লেইন টেক্সটের বদলে এই HTML ফাইলটা পড়ে পাঠায়:

```python
from http.server import BaseHTTPRequestHandler, HTTPServer

class MyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            with open("index.html", "rb") as file:
                content = file.read()
        except OSError:
            self.send_response(500)
            self.end_headers()
            self.wfile.write("ফাইল পড়তে সমস্যা হয়েছে".encode("utf-8"))
            return

        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        self.wfile.write(content)

server = HTTPServer(("localhost", 3000), MyHandler)
print("সার্ভার চালু আছে port 3000-এ")
server.serve_forever()
```

সার্ভার রিস্টার্ট করো (আগেরটা `Ctrl+C` দিয়ে বন্ধ করে, আবার `python server.py` চালাও), তারপর ব্রাউজার রিফ্রেশ করো। এখন দেখবে "স্বাগতম!" লেখা বড় হেডিং হিসেবে দেখাচ্ছে — মানে ব্রাউজার এটাকে সত্যিকারের HTML হিসেবে চিনেছে, প্লেইন টেক্সট হিসেবে না।

এই নতুন কোডে যা যোগ হলো, লাইন ধরে বুঝি:

```python
with open("index.html", "rb") as file:
    content = file.read()
```
এটা `index.html` ফাইলটা **বাইনারি মোডে** (`"rb"` — read binary) খুলে পুরো কনটেন্ট পড়ে ফেলে। `with` ব্যবহার করার সুবিধা হলো — ফাইলটা পড়া শেষ হলে (বা এরর হলে) এটা স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যায়, আলাদা করে বন্ধ করার কোড লেখা লাগে না।

```python
except OSError:
    self.send_response(500)
    self.end_headers()
    self.wfile.write("ফাইল পড়তে সমস্যা হয়েছে".encode("utf-8"))
    return
```
যদি ফাইল পড়তে কোনো সমস্যা হয় (হয়তো ফাইলের নাম ভুল লিখেছো, বা ফাইলটা ডিলিট হয়ে গেছে), Python একটা `OSError` তোলে (raise করে), আমরা সেটা ধরে (`except`) একটা এরর জবাব পাঠাচ্ছি। `500` একটা **status code** — এটা বলে দেয় সার্ভারের নিজের দিক থেকে কিছু ভুল হয়েছে। (Status code নিয়ে বিস্তারিত আলোচনা আসবে Module 6-এ।)

```python
self.send_header("Content-Type", "text/html")
```
`200` মানে "সব ঠিক আছে, সফলভাবে জবাব পাঠানো হচ্ছে।" আর `send_header("Content-Type", "text/html")` লাইনটাই সেই header, যেটা ব্রাউজারকে বলছে "আমি যা পাঠাচ্ছি সেটা HTML হিসেবে পড়ো, প্লেইন টেক্সট হিসেবে না।"

```python
self.wfile.write(content)
```
এবার আমরা ফাইলের প্রকৃত কনটেন্টটা পাঠাচ্ছি, আগের মতো হার্ডকোড করা কোনো টেক্সট না। লক্ষ্য করো, এখানে আলাদাভাবে `.encode()` করা লাগেনি, কারণ ফাইলটা আমরা `"rb"` মোডে পড়েছি — মানে `content` ইতিমধ্যেই বাইট (bytes) আকারে আছে, `wfile.write()`-এর জন্য একদম উপযুক্ত।

এই মুহূর্তে আমাদের সার্ভারটা প্রায় একটা প্রকৃত ওয়েব সার্ভারের মতো আচরণ করছে — ডিস্ক থেকে ফাইল পড়ে, সঠিক তথ্যসহ (Content-Type) ব্রাউজারে পাঠাচ্ছে। কিন্তু এখনো একটা বড় সীমাবদ্ধতা আছে — তুমি যাই লিখো ঠিকানার বারে (`/`, `/about`, `/contact`), সবসময় একই `index.html` পাঠানো হবে, কারণ আমরা এখনো `self.path`-এ কোন পাতা চাওয়া হয়েছে সেটা পরীক্ষা করছি না। এই সীমাবদ্ধতা এখনই সমাধান করবো না — এটা Module 4-এ, যখন আমরা FastAPI দিয়ে **routing** শিখবো, তখন সমাধান হবে।

এখন সময় হয়েছে আমাদের ছোট্ট সার্ভারটাকে ইন্টারনেটে সবার জন্য প্রকাশ করার — শুধু localhost-এ নিজের কাছে না রেখে। সেটাই পরের লেসনের বিষয়: cloud আর deployment।
