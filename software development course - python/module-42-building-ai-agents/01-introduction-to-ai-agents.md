# ০১. Introduction to AI Agents

আগের মডিউলে আমরা দেখেছি কীভাবে আমাদের ব্যাকএন্ড বিভিন্ন থার্ড-পার্টি সার্ভিসকে "নির্দেশ" দিয়ে কাজ করাতে পারে — SendGrid-কে বললাম "এই ইমেইল পাঠাও", Stripe-কে বললাম "এই টাকা চার্জ করো"। এই প্রতিটা ক্ষেত্রে আমরা নিজেরাই ঠিক করে দিয়েছিলাম কী করতে হবে, কখন করতে হবে, কোন ক্রমে করতে হবে — কোডের প্রতিটা `if`, প্রতিটা লজিক আমরা নিজে হাতে লিখেছি। এবার আমরা এমন একটা সিস্টেমের কথা ভাবি, যেখানে "কী করতে হবে" আর "কীভাবে করতে হবে" — এই সিদ্ধান্তটা নিজে থেকেই নেওয়া হয়, একটা ভাষা-মডেলের (LLM) মাধ্যমে। এটাকেই বলে **AI Agent**।

একটা সাধারণ ব্যাকএন্ড ফাংশন আর একটা AI Agent-এর পার্থক্যটা একটা উদাহরণ দিয়ে বোঝা যাক। ধরো তুমি একটা কাস্টমার সাপোর্ট সিস্টেম বানাচ্ছো। ঐতিহ্যবাহী পদ্ধতিতে (Module 6-7-এ যা শিখেছি), তুমি হয়তো লিখবে:

```python
if "refund" in user_message:
    return handle_refund_request(user_id)
elif "order status" in user_message:
    return check_order_status(user_id)
else:
    return "দুঃখিত, বুঝতে পারিনি।"
```

এই কোডটার একটা স্পষ্ট সীমাবদ্ধতা আছে — ইউজার যদি লেখে "আমার টাকা ফেরত চাই কারণ পণ্যটা ভাঙা ছিলো", `.includes('refund')` হয়তো ধরতে পারবে না যদি সে বাংলায় লেখে বা ভিন্নভাবে লেখে। প্রতিটা সম্ভাব্য বাক্যের ধরন আগে থেকে অনুমান করে `if/else` লেখা বাস্তবে অসম্ভব। এখানেই একটা LLM (Large Language Model, যেমন GPT বা Claude) কাজে লাগে — এটা ভাষা বোঝে, উদ্দেশ্য অনুমান করতে পারে, এমনকি একাধিক ধাপে চিন্তা করতে পারে।

কিন্তু শুধু "LLM-কে প্রশ্ন করে উত্তর পাওয়া" — সেটা এজেন্ট নয়, সেটা একটা চ্যাটবট। **এজেন্ট হয়ে ওঠে তখনই, যখন LLM নিজে সিদ্ধান্ত নিতে পারে যে তার কোন টুল/ফাংশন ব্যবহার করা দরকার, এবং সেই টুল ব্যবহার করে বাস্তব world-এ কিছু একটা করে।** এটা অনেকটা একজন অভিজ্ঞ রিসেপশনিস্টের মতো — সে শুধু কথা বলে না, প্রয়োজনে ফোন তুলে অন্য বিভাগে ট্রান্সফার করে, ফাইল খুঁজে বের করে, সিদ্ধান্ত নেয় কোন কাজটা এখনই করা দরকার।

```mermaid
flowchart TD
    A[ইউজারের বার্তা] --> B[LLM চিন্তা করে]
    B --> C{কোনো টুল দরকার?}
    C -->|হ্যাঁ| D[টুল কল করে: checkOrderStatus, processRefund...]
    D --> E[টুলের ফলাফল LLM-এর কাছে ফিরে আসে]
    E --> B
    C -->|না, উত্তর জানা আছে| F[সরাসরি উত্তর দেয়]
```

এই ডায়াগ্রামের লুপটা লক্ষ্য করো — এটা একটা সরলরৈখিক প্রক্রিয়া না, বরং একটা চক্র। LLM চিন্তা করে, প্রয়োজনে একটা টুল ব্যবহার করে, ফলাফল দেখে আবার চিন্তা করে, দরকার হলে আরেকটা টুল ব্যবহার করে — যতক্ষণ না সে চূড়ান্ত উত্তরে পৌঁছায়। এই প্যাটার্নটার একটা প্রচলিত নাম আছে — **ReAct (Reasoning + Acting)**, যা নিয়ে আমরা পরের লেসনে আরও গভীরে যাবো।

Python ব্যাকএন্ড থেকে একটা LLM-কে কল করা কেমন দেখতে, সেটা আগে দেখে নিই — এই প্যাটার্নটা তোমার চেনা লাগবে, কারণ এটা প্রায় হুবহু আগের মডিউলে দেখা SendGrid/Twilio API কলের মতো:

```bash
pip install anthropic python-dotenv
```

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx
```

```python
# services/llm_service.py
import os
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()
client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])


async def ask_agent(user_message: str) -> str:
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": user_message}],
    )
    return response.content[0].text
```

লক্ষ্য করো — গঠনটা ঠিক আগের মডিউলে দেখা `sgMail.send()` বা `stripe.PaymentIntent.create()`-এর মতোই। `.env`-এ API Key, একটা ফাংশন, একটা SDK কল, একটা রেসপন্স। এই মিলটা ইচ্ছাকৃতভাবেই তুলে ধরছি, কারণ **একটা AI Agent আসলে ব্যাকএন্ডের দৃষ্টিকোণ থেকে আরেকটা থার্ড-পার্টি API-ই** — শুধু পার্থক্য হলো এই API-এর "আউটপুট" প্রায়ই একটা সিদ্ধান্ত হয় ("আমার মনে হয় তোমার `check_order_status` ফাংশনটা কল করা উচিত"), কোনো নির্দিষ্ট ডেটা না।

এখন একটা প্রশ্ন থাকতে পারে — এজেন্ট বানানোর জন্য কি সবসময় জটিল ফ্রেমওয়ার্ক দরকার? উত্তর হলো, না — মূল ধারণাটা আসলে সহজ, একটা লুপ:

```python
async def simple_agent_loop(user_message: str, tools: list) -> str | None:
    conversation = [{"role": "user", "content": user_message}]

    while True:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            tools=tools,
            messages=conversation,
        )

        if response.stop_reason != "tool_use":
            text_block = next((c for c in response.content if c.type == "text"), None)
            return text_block.text if text_block else None

        # LLM একটা টুল ব্যবহার করতে চাইছে — সেটা এক্সিকিউট করে ফলাফল ফিরিয়ে দাও
        tool_use = next(c for c in response.content if c.type == "tool_use")
        tool_result = await execute_tool(tool_use.name, tool_use.input)

        conversation.append({"role": "assistant", "content": response.content})
        conversation.append({
            "role": "user",
            "content": [
                {"type": "tool_result", "tool_use_id": tool_use.id, "content": tool_result}
            ],
        })
```

এই কোডটা এখনই পুরোপুরি বোঝার দরকার নেই — এটা শুধু দেখানোর জন্য যে একটা এজেন্টের কেন্দ্রে আছে একটা সাধারণ `while` লুপ, যা আমরা প্রোগ্রামিং শেখার একদম শুরু থেকে চিনি। এই "টুল" (`execute_tool`), মেমোরি (`conversation` লিস্ট), আর সিদ্ধান্ত-নেওয়ার (LLM কল) প্রতিটা অংশ নিয়ে আমরা এই মডিউলের পরের লেসনগুলোতে বিস্তারিত আলোচনা করবো।

একটা সাধারণ ভুল এখানেই হয় — অনেকে এই `while True` লুপে কোনো উচ্চসীমা (maximum iteration) না রেখে সরাসরি প্রোডাকশনে পাঠিয়ে দেয়। LLM যদি বারবার ভুল টুল বেছে নিতে থাকে বা টুলের ফলাফল বুঝতে না পারে, এই লুপ তাত্ত্বিকভাবে অসীম চলতে পারে — প্রতিটা চক্রে টাকা খরচ হতেই থাকবে, ইউজার অপেক্ষায় থাকবে। এই সমস্যাটা নিয়ে আমরা লেসন ০৪-এ (`maxIterations`-এর মতো একটা সেফটি প্যারামিটার দিয়ে) আরও বিস্তারিত আলোচনা করবো।

এই মডিউলটা তাই আগের সব মডিউলের একটা স্বাভাবিক সম্প্রসারণ — FastAPI দিয়ে API বানানো (Module 4), async/await দিয়ে নেটওয়ার্ক কল সামলানো (Module 5), থার্ড-পার্টি সার্ভিস ইন্টিগ্রেট করা (Module 41) — এই সব দক্ষতাই এখানে কাজে লাগবে, শুধু নতুন এক ধরনের "সার্ভিস" যুক্ত হচ্ছে যেটা নিজে চিন্তা করতে পারে।

পরের লেসনে আমরা আরও গভীরে যাবো — একটা এজেন্টের ভেতরের স্থাপত্য (architecture) ঠিক কেমন হয়, ReAct প্যাটার্ন কীভাবে কাজ করে, আর কীভাবে আমরা এই "চিন্তা-করো-কাজ-করো" লুপটা একটা প্রোডাকশন-গ্রেড কাঠামোয় সাজাবো।
