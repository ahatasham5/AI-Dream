# ০৩. LangChain Framework Integration

আগের লেসনে আমরা নিজের হাতে একটা এজেন্ট লুপ লিখেছিলাম — `while` লুপ, টুল স্কিমা, `execute_tool` ফাংশন। এই কোডটা কাজ করে, কিন্তু বাস্তব প্রোডাকশন প্রজেক্টে এজেন্ট আরও জটিল হয়ে ওঠে — একাধিক ধাপের মেমোরি ম্যানেজমেন্ট, একাধিক LLM প্রোভাইডার (OpenAI, Anthropic, Google) সুইচ করার সুবিধা, প্রম্পট টেমপ্লেট রিইউজ করা, স্ট্রিমিং রেসপন্স হ্যান্ডল করা — এই সবকিছু নিজে হাতে লেখা সময়সাপেক্ষ আর ভুল-প্রবণ। ঠিক এই কারণেই তৈরি হয়েছে **LangChain** — একটা ফ্রেমওয়ার্ক যা এজেন্ট বানানোর সাধারণ অংশগুলো (চেইন, মেমোরি, টুল, প্রম্পট) রেডিমেড উপাদান হিসেবে দেয়।

এটাকে FastAPI-এর সাথে তুলনা করলে সহজে বোঝা যায়। Module 7-এ আমরা শিখেছিলাম কেন raw `http.server`-এর বদলে FastAPI ব্যবহার করি — কারণ FastAPI রাউটিং, ডিপেন্ডেন্সি ইনজেকশন, এরর হ্যান্ডলিং-এর মতো পুনরাবৃত্তিমূলক কাজ আগে থেকেই সমাধান করে রেখেছে, আমাদের শুধু বিজনেস লজিকে মনোযোগ দিতে হয়। LangChain ঠিক একই ভূমিকা পালন করে এজেন্ট ডেভেলপমেন্টে — raw LLM API কলের বদলে একটা উচ্চ-স্তরের, রিইউজেবল কাঠামো দেয়।

```mermaid
flowchart LR
    A[Raw LLM SDK\nanthropic] -->|নিচু স্তর, নিজে সব ম্যানেজ করতে হয়| B[তোমার কোড]
    C[LangChain] -->|উচ্চ স্তর, রেডিমেড উপাদান| B
    C --- D[Prompt Templates]
    C --- E[Memory Modules]
    C --- F[Tool/Agent Executors]
    C --- G[Multiple LLM Providers]
```

ইনস্টলেশন দিয়ে শুরু করি:

```bash
pip install langchain langchain-anthropic python-dotenv
```

LangChain-এর সবচেয়ে মৌলিক ধারণা হলো **Prompt Template** — একটা রিইউজেবল প্রম্পট কাঠামো, যেখানে ভেরিয়েবল বসানো যায়। এটা অনেকটা আমরা Jinja2 বা অন্য টেমপ্লেটিং ইঞ্জিনে যেভাবে HTML-এ ভেরিয়েবল বসাই, তারই একটা প্রম্পট-সংস্করণ:

```python
# services/langchain_setup.py
import os
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

model = ChatAnthropic(
    api_key=os.environ["ANTHROPIC_API_KEY"],
    model="claude-sonnet-4-5",
    temperature=0.3,
)

prompt_template = ChatPromptTemplate.from_messages([
    ("system", "তুমি একটা ই-কমার্স কাস্টমার সাপোর্ট এজেন্ট। সংক্ষিপ্ত ও ভদ্রভাবে উত্তর দাও।"),
    ("human", "{user_message}"),
])


async def get_response(user_message: str) -> str:
    chain = prompt_template | model
    result = await chain.ainvoke({"user_message": user_message})
    return result.content
```

এখানে `temperature: 0.3` একটা নতুন প্যারামিটার লক্ষ্য করার মতো — এটা নিয়ন্ত্রণ করে LLM কতটা "সৃজনশীল" বা "সুনির্দিষ্ট" হবে। কাস্টমার সাপোর্টের মতো কাজে কম temperature (০-০.৩) ভালো, কারণ আমরা চাই সামঞ্জস্যপূর্ণ, পূর্বানুমানযোগ্য উত্তর, লেখালেখি/সৃজনশীল কাজে বেশি temperature (০.৭-১) ভালো লাগতে পারে।

`|` অপারেটরটা লক্ষ্য করো — এটা LangChain-এর একটা গুরুত্বপূর্ণ ধারণা, যাকে বলে **LCEL (LangChain Expression Language)**। এটা অনেকটা Unix পাইপ (`|`) এর মতো কাজ করে, অথবা Module 7-এ আমরা যেভাবে একাধিক FastAPI মিডলওয়্যার/ডিপেন্ডেন্সি চেইন করেছিলাম তার মতোই — একটা ধাপের আউটপুট পরের ধাপের ইনপুট হয়ে যায়। এই "pipe" প্যাটার্ন দিয়ে জটিল multi-step প্রসেসিং তৈরি করা সহজ হয়ে যায়।

এবার টুল-ব্যবহারকারী একটা এজেন্ট বানাই, যেখানে LangChain আমাদের আগের লেসনে হাতে-লেখা `while` লুপটা নিজেই সামলে নেয়:

```python
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
from langchain.agents import AgentExecutor, create_tool_calling_agent


class CheckOrderStatusInput(BaseModel):
    order_id: str = Field(description="অর্ডারের ইউনিক আইডি")


async def _check_order_status(order_id: str) -> str:
    status = await get_order_status_from_database(order_id)
    return str(status)


check_order_status_tool = StructuredTool.from_function(
    coroutine=_check_order_status,
    name="check_order_status",
    description="একটা অর্ডার আইডি দিয়ে অর্ডারের বর্তমান অবস্থা জানায়",
    args_schema=CheckOrderStatusInput,
)


async def run_agent(user_message: str) -> str:
    agent = create_tool_calling_agent(
        llm=model,
        tools=[check_order_status_tool],
        prompt=prompt_template,
    )

    executor = AgentExecutor(agent=agent, tools=[check_order_status_tool])

    result = await executor.ainvoke({"user_message": user_message})
    return result["output"]
```

এই কোডে দুটো নতুন জিনিস লক্ষ্য করার মতো। প্রথমত, `pydantic`-এর `BaseModel` — এটা টুলের ইনপুট স্কিমা ডিফাইন করতে ব্যবহৃত হয়, যা Module 13-এ আমরা টাইপ-সেফটির ধারণার মতোই, শুধু runtime-এ যাচাই করে (এই একই `pydantic` আমরা FastAPI-এর রিকোয়েস্ট ভ্যালিডেশনেও ব্যবহার করেছি — এটা কোনো নতুন লাইব্রেরি না)। দ্বিতীয়ত, `AgentExecutor` — এটাই আগের লেসনের সেই `while` লুপ যেটা আমরা হাতে লিখেছিলাম, LangChain এখানে সেটা রেডিমেড দিয়ে দিচ্ছে — LLM-কে কল করা, টুল দরকার হলে এক্সিকিউট করা, ফলাফল আবার পাঠানো, এই পুরো চক্রটা `executor.ainvoke()`-এর ভেতরেই ঘটে যায়।

```mermaid
sequenceDiagram
    participant App as FastAPI Route
    participant Executor as AgentExecutor
    participant LLM
    participant Tool as check_order_status_tool

    App->>Executor: ainvoke({ user_message })
    Executor->>LLM: প্রম্পট + টুল লিস্ট
    LLM-->>Executor: "check_order_status কল করো"
    Executor->>Tool: coroutine(order_id)
    Tool-->>Executor: অর্ডারের ডেটা
    Executor->>LLM: ফলাফলসহ আবার কল
    LLM-->>Executor: চূড়ান্ত টেক্সট উত্তর
    Executor-->>App: output
```

এবার এটাকে আমাদের চেনা FastAPI রাউটে বসাই:

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class SupportChatRequest(BaseModel):
    message: str


@router.post("/api/support-chat")
async def support_chat(payload: SupportChatRequest):
    try:
        reply = await run_agent(payload.message)
        return {"reply": reply}
    except Exception as error:
        logger.error("agent_error", error=str(error))
        raise HTTPException(status_code=502, detail="এজেন্ট এই মুহূর্তে সাড়া দিতে পারছে না")
```

লক্ষ্য করো — এই রাউটটা কাঠামোগতভাবে ঠিক আগের মডিউলের অন্য যেকোনো থার্ড-পার্টি ইন্টিগ্রেশন রাউটের মতোই দেখতে। `try/except`, `502` স্ট্যাটাস কোড বাইরের সার্ভিস ব্যর্থ হলে — এই প্যাটার্নগুলো এখানেও অবিকল প্রযোজ্য, কারণ শেষ পর্যন্ত LLM-ও একটা নেটওয়ার্ক-নির্ভর বাইরের সার্ভিস, যেটা মাঝে মাঝে ধীর হতে পারে বা ব্যর্থ হতে পারে।

LangChain দিয়ে আমরা একটা সাধারণ টুল-ব্যবহারকারী এজেন্ট বানিয়ে ফেললাম, কিন্তু এখনো এই এজেন্টটা "জেনারেল পারপাস" — যেকোনো প্রশ্নে সে যেকোনো টুল ব্যবহারের চেষ্টা করতে পারে। বাস্তব প্রোডাকশনে আমরা প্রায়ই চাই এমন এজেন্ট যেটা একটা নির্দিষ্ট, সংকীর্ণ কাজে বিশেষায়িত — যেমন শুধু রিফান্ড প্রসেস করা, বা শুধু ডেটা এন্ট্রি করা। পরের লেসনে আমরা দেখবো কীভাবে **টাস্ক-স্পেসিফিক এজেন্ট** ডিজাইন করতে হয়, যেগুলো একটা নির্দিষ্ট কাজে অনেক বেশি নির্ভরযোগ্য।
