# ০৩. Python Objects In Real Life

গত লেসনে আমরা `dict`-কে একটা ফোল্ডারের সাথে তুলনা করেছিলাম। এবার চলো আরেকটু বাস্তব একটা উদাহরণ নিই — একটা ই-কমার্স প্রোডাক্টকে আরেকটু বিস্তারিতভাবে দেখি।

বাস্তব জীবনে একটা প্রোডাক্টের অনেক বৈশিষ্ট্য থাকে — নাম, দাম, স্টকে কতগুলো আছে, কোন ক্যাটাগরির। আর কিছু আচরণও থাকে — যেমন দাম কমানো, স্টক আপডেট করা। Python-এ এই দুটোই একসাথে প্রকাশ করার জন্য **class** ব্যবহার হয় — বৈশিষ্ট্য (attribute) আর আচরণ (method)।

```python
class Product:
    def __init__(self, name: str, price: float, stock: int, category: str):
        self.name = name
        self.price = price
        self.stock = stock
        self.category = category

    def apply_discount(self, percentage: float) -> float:
        discount_amount = (self.price * percentage) / 100
        self.price = self.price - discount_amount
        return self.price

    def is_in_stock(self) -> bool:
        return self.stock > 0


product = Product("Wireless Mouse", 950, 40, "Electronics")

print(product.name)          # "Wireless Mouse"
product.apply_discount(10)   # দাম ১০% কমিয়ে দেবে
print(product.price)         # 855.0
print(product.is_in_stock()) # True
```

এখানে `apply_discount` আর `is_in_stock` হলো method — অর্থাৎ class-এর ভেতরে থাকা function। লক্ষ্য করো `self` শব্দটা — এটা বলে দিচ্ছে "এই object-টার নিজের ভেতরের `price` বা `stock`-এর কথা বলছি, অন্য কোনো ভ্যারিয়েবলের না।" `self` অনেকটা মানুষের কথা বলার সময় "আমার" শব্দটার মতো — একজন ওয়েটার যখন বলে "আমার টেবিলের অর্ডার", তখন সে তার নিজের দায়িত্বে থাকা টেবিলের কথা বলছে, অন্য ওয়েটারের টেবিলের কথা না। JavaScript-এর `this`-এর সাথে ধারণাটা এক, কিন্তু একটা গুরুত্বপূর্ণ পার্থক্য আছে — Python-এ `self` **explicit**, মানে প্রতিটা method-এর প্রথম প্যারামিটার হিসেবে নিজে হাতে লিখতে হয়, জাদুমন্ত্রের মতো নিজে থেকে চলে আসে না। এটা নতুনদের প্রায়ই ভুলে যাওয়ার একটা জায়গা — `def apply_discount(percentage):` লিখে `self` বাদ দিলে Python একটা `TypeError: apply_discount() takes 1 positional argument but 2 were given` ছুঁড়ে দেবে, কারণ method কল করার সময় Python নিজে থেকে `product.apply_discount(10)`-কে `Product.apply_discount(product, 10)`-এ রূপান্তর করে — অর্থাৎ instance-টাই স্বয়ংক্রিয়ভাবে প্রথম argument হিসেবে চলে যায়।

তবে সব প্রোজেক্টেই সবকিছুর জন্য class লাগে না। FastAPI-এর route handler-এর ভেতরে, বিশেষ করে যেখানে ডেটা শুধু বাইরে থেকে আসে আর জবাব হিসেবে ফেরত যায়, সাধারণত plain `dict` বা Pydantic model যথেষ্ট — behavior (method) দরকার না হলে class বানানোটাই বাড়তি জটিলতা। মনে করো Module 6-এ আমরা যে POST endpoint বানিয়েছিলাম, সেখানে request body থেকে যে ডেটা আসে, FastAPI সেটাকে সরাসরি Pydantic model-এ রূপান্তর করে দেয়।

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ProductIn(BaseModel):
    name: str
    price: float
    stock: int

@app.post("/products")
def create_product(new_product: ProductIn):
    print(new_product.name)
    return {"message": "Product created", "data": new_product}
```

এখানে `new_product` কোনো জাদু নয় — এটা ঠিক আগের `Product`-এর মতোই একটা structured object, শুধু এটা এসেছে ক্লায়েন্টের পাঠানো JSON থেকে, আর FastAPI নিজে থেকেই সেই JSON-কে যাচাই করে Pydantic model-এ রূপান্তরিত করে দিয়েছে।

```mermaid
flowchart LR
    Client[ক্লায়েন্ট থেকে JSON আসে] --> Parse["FastAPI Pydantic model দিয়ে পার্স ও validate করে"]
    Parse --> Body["new_product একটা Pydantic Object হয়ে যায়"]
    Body --> Use[তুমি .name, .price ইত্যাদি দিয়ে অ্যাক্সেস করো]
```

একটা সাধারণ ভুল এখানে হয় — একবার Pydantic model থেকে ডেটা পেয়ে গেলে, অনেকে সেটাকে সরাসরি database-এ পাঠানোর সময় বা অন্য function-এ পাস করার সময় ভাবে এটা এখনো একটা `dict`-এর মতো আচরণ করবে। বাস্তবে `new_product["name"]` লিখলে `TypeError: 'ProductIn' object is not subscriptable` আসবে — কারণ Pydantic model dict না, এটা একটা class instance। dict-এ রূপান্তর করতে চাইলে স্পষ্টভাবে `new_product.model_dump()` (Pydantic v2) বা পুরনো ভার্সনে `new_product.dict()` কল করতে হবে। এই ছোট পার্থক্যটা না জানলে, ডেটাবেজ লেয়ারে পাঠানোর সময় প্রায়ই একটা অদ্ভুত `AttributeError` বা `TypeError` দেখা যায়, যেটা সমাধান করতে নতুনরা অনেক সময় নষ্ট করে।

তাহলে দেখা যাচ্ছে, object (class instance) আর dict দুটোই থিওরির জিনিস না — এগুলোই সেই মৌলিক কাঠামো যার উপর দাঁড়িয়ে পুরো API ডেভেলপমেন্ট চলে। এখন প্রশ্ন আসে, একটা না, অনেকগুলো প্রোডাক্ট একসাথে থাকলে কী হবে? সেটার উত্তর খুঁজতেই পরের লেসনে আমরা list আর list of dicts/objects নিয়ে কথা বলবো।
