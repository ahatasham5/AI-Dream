# Multi-LoRA Adapter Routing Architecture

<a id="index"></a>

## Index

<!-- tutorial-index:start -->
- [সংক্ষিপ্ত পরিচিতি](#section-1)
- [Core Concept](#section-2)
  - [Base Model কী?](#section-3)
  - [LoRA Adapter কী?](#section-4)
- [কেন Multi-LoRA Adapter Routing ব্যবহার করা হয়?](#section-5)
- [Architecture](#section-6)
- [গুরুত্বপূর্ণ ব্যাখ্যা](#section-7)
- [কখন Adapter আলাদা রাখা ভালো?](#section-8)
- [কখন LoRA Merge করা ভালো?](#section-9)
- [কখন Distillation ব্যবহার করা হয়?](#section-10)
- [Project Structure](#section-11)
- [Installation](#section-12)
  - [1. Virtual environment তৈরি করুন](#section-13)
  - [2. Dependencies install করুন](#section-14)
- [requirements.txt](#section-15)
- [.env.example](#section-16)
- [Adapter Registry](#section-17)
- [Simple Router / Classifier](#section-18)
- [Model Server](#section-19)
- [FastAPI App](#section-20)
- [Locally Run করা](#section-21)
- [API Test](#section-22)
  - [Bangla request](#section-23)
  - [Quran request](#section-24)
  - [Medical request](#section-25)
- [Dockerfile](#section-26)
- [Docker Image Build করা](#section-27)
- [Docker Container Run করা](#section-28)
- [Adapter Folder Example](#section-29)
- [কীভাবে আলাদা LoRA Adapter train করা উচিত?](#section-30)
- [Production Notes](#section-31)
  - [1. Adapter Versioning](#section-32)
  - [2. Adapter Status](#section-33)
  - [3. Router Improvement](#section-34)
  - [4. Safety](#section-35)
  - [5. Monitoring](#section-36)
  - [6. Fallback Adapter](#section-37)
  - [7. কখন Adapter Merge করবেন?](#section-38)
  - [8. কখন Distillation করবেন?](#section-39)
- [Summary](#section-40)
<!-- tutorial-index:end -->

---

<a id="section-1"></a>

## সংক্ষিপ্ত পরিচিতি

এই repository একটি **PEFT-based Multi-LoRA Adapter Routing** architecture-এর sample implementation।

মূল ধারণা:

```text
একটি Base Model
+
একাধিক LoRA Adapter
+
Router / Classifier
=
Domain অনুযায়ী dynamic model behavior
```

এই architecture-এ base model একবার load হয়। এরপর user input-এর topic/domain অনুযায়ী system সঠিক LoRA adapter select করে response generate করে।

উদাহরণ:

```text
Base Model
 ├── Bangla LoRA
 ├── Quran/Arabic LoRA
 └── Medical LoRA
```

User question যদি general বাংলা হয়, তাহলে Bangla LoRA ব্যবহার হবে।  
User question যদি Quran/Arabic learning নিয়ে হয়, তাহলে Quran LoRA ব্যবহার হবে।  
User question যদি medical topic নিয়ে হয়, তাহলে Medical LoRA ব্যবহার হবে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-2"></a>

## Core Concept

<!-- tutorial-nav:back -->
[Back to Index](#index)

<a id="section-3"></a>

### Base Model কী?

Base model হলো মূল pretrained language model। যেমন:

```text
Qwen/Qwen2.5-1.5B-Instruct
Mistral-7B
Llama
Gemma
Phi
```

Base model-এর ভিতরে আগে থেকেই language understanding, text generation ability, reasoning pattern, grammar, knowledge representation ইত্যাদি থাকে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-4"></a>

### LoRA Adapter কী?

LoRA adapter হলো base model-এর উপর ছোট learned weight adjustment।

Full fine-tuning করলে base model-এর অনেক weight update হয়। কিন্তু LoRA-তে base model সাধারণত fixed থাকে, আর কিছু ছোট trainable matrix শেখে।

Mathematically:

```text
Base weight = W
LoRA learned change = ΔW

Effective weight = W + ΔW
```

যদি Bangla LoRA active থাকে:

```text
Effective model = Base Model + Bangla LoRA
```

যদি Quran LoRA active থাকে:

```text
Effective model = Base Model + Quran LoRA
```

যদি Medical LoRA active থাকে:

```text
Effective model = Base Model + Medical LoRA
```

LoRA adapter নিজে full model না। এটা base model-এর উপর ছোট domain-specific tuning।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-5"></a>

## কেন Multi-LoRA Adapter Routing ব্যবহার করা হয়?

এই architecture useful যখন একই base model দিয়ে বিভিন্ন domain/task handle করতে হয়।

Example use cases:

```text
General Bangla Assistant
Quran Learning Assistant
Arabic Vocabulary Assistant
Medical Information Assistant
Customer Support Assistant
Legal Document Assistant
```

প্রতিটা domain-এর জন্য আলাদা full model বানালে storage ও deployment cost বেড়ে যায়।

Multi-LoRA approach-এ:

```text
Base model = ১টা
Adapters = অনেকগুলো ছোট file
Router = কোন adapter use হবে তা ঠিক করে
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-6"></a>

## Architecture

```text
User Request
   ↓
FastAPI Backend
   ↓
Router / Classifier
   ↓
Adapter Registry
   ↓
Base Model + Selected LoRA Adapter
   ↓
Response
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-7"></a>

## গুরুত্বপূর্ণ ব্যাখ্যা

এই setup-এ সাধারণত base model ৩ বার load হয় না।

ভুল ধারণা:

```text
Base + Bangla LoRA = ১টা full model
Base + Quran LoRA = ১টা full model
Base + Medical LoRA = ১টা full model
```

এটা তখনই হয় যখন প্রতিটা LoRA merge করে আলাদা full model বানানো হয়।

Adapter-based serving-এ structure এমন:

```text
১টা Base Model
+
Bangla LoRA file
+
Quran LoRA file
+
Medical LoRA file
```

Runtime-এ selected adapter active হয়।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-8"></a>

## কখন Adapter আলাদা রাখা ভালো?

Adapters আলাদা রাখা ভালো যখন:

```text
- একই base model দিয়ে অনেক domain handle করতে হবে
- client-specific customization দরকার
- frequent update দরকার
- storage কম রাখতে হবে
- experiment দ্রুত করতে হবে
- rollback দরকার হতে পারে
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-9"></a>

## কখন LoRA Merge করা ভালো?

LoRA merge করা ভালো যখন:

```text
- একটাই stable production model দরকার
- adapter switching দরকার নেই
- latency কমাতে চান
- deployment simple রাখতে চান
```

Merge করলে:

```text
Base Model + LoRA Adapter → New Full Fine-tuned Model
```

তখন adapter আলাদা করে load করার দরকার নেই। কিন্তু অনেক domain থাকলে merged model অনেকগুলো হয়ে storage বাড়তে পারে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-10"></a>

## কখন Distillation ব্যবহার করা হয়?

Distillation useful যখন complex teacher setup থেকে ছোট clean model বানাতে চান।

Example:

```text
Teacher:
Base 7B Model + Multiple LoRA Adapters

Student:
Small 1.5B / 3B model
```

Training phase-এ storage বেশি লাগতে পারে, কারণ teacher, student, data, checkpoints সব থাকে। কিন্তু final deployment-এ যদি শুধু student model রাখা হয়, তাহলে storage ও inference cost কমতে পারে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-11"></a>

# Project Structure

```text
multi-lora-router/
│
├── app/
│   ├── main.py
│   ├── model_server.py
│   ├── router.py
│   └── adapter_registry.py
│
├── adapters/
│   ├── bangla/
│   ├── quran/
│   └── medical/
│
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-12"></a>

# Installation

<!-- tutorial-nav:back -->
[Back to Index](#index)

<a id="section-13"></a>

## 1. Virtual environment তৈরি করুন

```bash
python -m venv venv
```

Activate:

```bash
# Windows
venv\Scripts\activate
```

```bash
# Linux / macOS
source venv/bin/activate
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-14"></a>

## 2. Dependencies install করুন

```bash
pip install -r requirements.txt
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-15"></a>

# requirements.txt

```txt
fastapi
uvicorn[standard]
torch
transformers
peft
accelerate
python-dotenv
pydantic
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-16"></a>

# .env.example

```env
BASE_MODEL_NAME=Qwen/Qwen2.5-1.5B-Instruct
DEFAULT_ADAPTER=bangla
DEVICE=auto
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-17"></a>

# Adapter Registry

File: `app/adapter_registry.py`

```python
from dataclasses import dataclass


@dataclass
class AdapterInfo:
    name: str
    domain: str
    path: str
    status: str
    description: str


ADAPTER_REGISTRY = {
    "bangla": AdapterInfo(
        name="bangla",
        domain="general_bangla",
        path="./adapters/bangla",
        status="production",
        description="General Bangla assistant adapter"
    ),
    "quran": AdapterInfo(
        name="quran",
        domain="quran_arabic_learning",
        path="./adapters/quran",
        status="production",
        description="Quran, Arabic vocabulary, and Islamic learning adapter"
    ),
    "medical": AdapterInfo(
        name="medical",
        domain="medical_information",
        path="./adapters/medical",
        status="staging",
        description="Medical information adapter. Not for emergency diagnosis."
    ),
}


def get_adapter(adapter_name: str) -> AdapterInfo:
    adapter = ADAPTER_REGISTRY.get(adapter_name)

    if not adapter:
        raise ValueError(f"Adapter not found: {adapter_name}")

    if adapter.status not in ["production", "staging"]:
        raise ValueError(f"Adapter is not active: {adapter_name}")

    return adapter
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-18"></a>

# Simple Router / Classifier

File: `app/router.py`

এই sample router rule-based। Production system-এ চাইলে ছোট classifier model, embedding similarity, অথবা LLM-based router use করা যায়।

```python
def detect_adapter(user_input: str) -> str:
    """
    Simple rule-based adapter router.

    Production system-এ চাইলে এই অংশ replace করা যায়:
    - small text classifier
    - embedding similarity router
    - intent classification model
    - user-selected mode
    """

    text = user_input.lower()

    quran_keywords = [
        "quran", "কুরআন", "কোরআন", "সূরা", "সুরা",
        "আয়াত", "আয়াত", "তাফসির", "আরবি", "arabic"
    ]

    medical_keywords = [
        "জ্বর", "ব্যথা", "রোগ", "ডাক্তার", "medicine",
        "medical", "fever", "pain", "symptom", "treatment"
    ]

    bangla_keywords = [
        "বাংলা", "চিঠি", "লিখে", "ব্যাখ্যা", "অনুবাদ"
    ]

    if any(keyword in text for keyword in quran_keywords):
        return "quran"

    if any(keyword in text for keyword in medical_keywords):
        return "medical"

    if any(keyword in text for keyword in bangla_keywords):
        return "bangla"

    return "bangla"
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-19"></a>

# Model Server

File: `app/model_server.py`

```python
import os
import torch
from dotenv import load_dotenv
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

from app.adapter_registry import get_adapter

load_dotenv()


class MultiLoRAModelServer:
    def __init__(self):
        self.base_model_name = os.getenv(
            "BASE_MODEL_NAME",
            "Qwen/Qwen2.5-1.5B-Instruct"
        )

        self.default_adapter = os.getenv("DEFAULT_ADAPTER", "bangla")

        self.tokenizer = None
        self.model = None
        self.loaded_adapters = set()
        self.active_adapter = None

    def load_base_model(self):
        """
        Base model একবার load করা হয়।
        """

        self.tokenizer = AutoTokenizer.from_pretrained(
            self.base_model_name,
            trust_remote_code=True
        )

        base_model = AutoModelForCausalLM.from_pretrained(
            self.base_model_name,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto",
            trust_remote_code=True
        )

        default_adapter_info = get_adapter(self.default_adapter)

        self.model = PeftModel.from_pretrained(
            base_model,
            default_adapter_info.path,
            adapter_name=self.default_adapter
        )

        self.loaded_adapters.add(self.default_adapter)
        self.active_adapter = self.default_adapter
        self.model.eval()

    def load_adapter_if_needed(self, adapter_name: str):
        """
        Adapter আগে load না থাকলে load করা হয়।
        """

        if adapter_name in self.loaded_adapters:
            return

        adapter_info = get_adapter(adapter_name)

        self.model.load_adapter(
            adapter_info.path,
            adapter_name=adapter_name
        )

        self.loaded_adapters.add(adapter_name)

    def set_active_adapter(self, adapter_name: str):
        """
        Active LoRA adapter switch করা হয়।
        """

        self.load_adapter_if_needed(adapter_name)
        self.model.set_adapter(adapter_name)
        self.active_adapter = adapter_name

    def generate(self, prompt: str, adapter_name: str, max_new_tokens: int = 256):
        """
        Selected adapter ব্যবহার করে response generate করা হয়।
        """

        self.set_active_adapter(adapter_name)

        messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant. Answer clearly and safely."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

        if hasattr(self.tokenizer, "apply_chat_template"):
            input_text = self.tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True
            )
        else:
            input_text = prompt

        inputs = self.tokenizer(
            input_text,
            return_tensors="pt"
        ).to(self.model.device)

        with torch.no_grad():
            output = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=True,
                temperature=0.7,
                top_p=0.9
            )

        generated_text = self.tokenizer.decode(
            output[0],
            skip_special_tokens=True
        )

        return {
            "adapter_used": adapter_name,
            "response": generated_text
        }


model_server = MultiLoRAModelServer()
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-20"></a>

# FastAPI App

File: `app/main.py`

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.router import detect_adapter
from app.model_server import model_server


app = FastAPI(
    title="Multi-LoRA Adapter Routing API",
    description="Base model + multiple LoRA adapters + router/classifier",
    version="1.0.0"
)


class GenerateRequest(BaseModel):
    prompt: str
    adapter: str | None = None
    max_new_tokens: int = 256


class GenerateResponse(BaseModel):
    adapter_used: str
    response: str


@app.on_event("startup")
def startup_event():
    model_server.load_base_model()


@app.get("/")
def root():
    return {
        "message": "Multi-LoRA Adapter Routing API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "active_adapter": model_server.active_adapter,
        "loaded_adapters": list(model_server.loaded_adapters)
    }


@app.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):
    try:
        adapter_name = request.adapter or detect_adapter(request.prompt)

        result = model_server.generate(
            prompt=request.prompt,
            adapter_name=adapter_name,
            max_new_tokens=request.max_new_tokens
        )

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-21"></a>

# Locally Run করা

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Open:

```text
http://localhost:8000/docs
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-22"></a>

# API Test

<!-- tutorial-nav:back -->
[Back to Index](#index)

<a id="section-23"></a>

## Bangla request

```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "বাংলায় MLOps কী বুঝিয়ে বলো",
    "max_new_tokens": 200
  }'
```

Expected adapter:

```text
bangla
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-24"></a>

## Quran request

```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "সূরা ফাতিহার শব্দার্থ বাংলায় শেখাও",
    "max_new_tokens": 200
  }'
```

Expected adapter:

```text
quran
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-25"></a>

## Medical request

```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "জ্বর হলে কী কী লক্ষণ দেখা যায়?",
    "max_new_tokens": 200
  }'
```

Expected adapter:

```text
medical
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-26"></a>

# Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-27"></a>

# Docker Image Build করা

```bash
docker build -t multi-lora-router .
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-28"></a>

# Docker Container Run করা

```bash
docker run -p 8000:8000 --env-file .env multi-lora-router
```

Open:

```text
http://localhost:8000/docs
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-29"></a>

# Adapter Folder Example

```text
adapters/
├── bangla/
│   ├── adapter_config.json
│   └── adapter_model.safetensors
│
├── quran/
│   ├── adapter_config.json
│   └── adapter_model.safetensors
│
└── medical/
    ├── adapter_config.json
    └── adapter_model.safetensors
```

প্রতিটা adapter folder-এ trained LoRA adapter files থাকতে হবে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-30"></a>

# কীভাবে আলাদা LoRA Adapter train করা উচিত?

Recommended clean approach:

```text
Base Model + Bangla Dataset  → Bangla LoRA
Base Model + Quran Dataset   → Quran LoRA
Base Model + Medical Dataset → Medical LoRA
```

Unnecessary chain training avoid করা ভালো:

```text
Base → Bangla LoRA → Quran LoRA → Medical LoRA
```

কারণ এতে adapter dependency তৈরি হয়, debugging কঠিন হয়, deployment messy হয়।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-31"></a>

# Production Notes

<!-- tutorial-nav:back -->
[Back to Index](#index)

<a id="section-32"></a>

## 1. Adapter Versioning

Version name ব্যবহার করুন:

```text
bangla-v1
bangla-v2
quran-v1
quran-v2
medical-v1
```

Metadata রাখুন:

```text
adapter_name
base_model
dataset_version
training_date
evaluation_score
status
path
owner
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-33"></a>

## 2. Adapter Status

Recommended status values:

```text
experiment
staging
production
archived
deprecated
```

শুধু `production` বা approved `staging` adapters serve করা উচিত।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-34"></a>

## 3. Router Improvement

Current router rule-based। Better options:

```text
- User-selected mode
- Small intent classifier
- Embedding similarity router
- LLM-based router
- Hybrid rule + classifier
```

Production-এ অনেক সময় user-selected mode সবচেয়ে reliable।

Example:

```text
Mode: General Bangla
Mode: Quran Learning
Mode: Medical Info
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-35"></a>

## 4. Safety

Medical, legal, finance, religious answer generation-এর ক্ষেত্রে safety rules এবং disclaimer দরকার।

Medical example:

```text
এই system শুধুমাত্র general information দেয়।
এটি professional medical advice-এর replacement না।
Emergency symptom থাকলে দ্রুত doctor-এর সাথে যোগাযোগ করতে হবে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-36"></a>

## 5. Monitoring

API এবং ML behavior দুইটাই monitor করতে হবে।

API monitoring:

```text
latency
error rate
request count
GPU memory
CPU/RAM
timeout
```

ML monitoring:

```text
adapter usage
bad responses
domain misrouting
user feedback
hallucination rate
data drift
quality score
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-37"></a>

## 6. Fallback Adapter

Router unsure হলে default adapter use করুন:

```text
default_adapter = bangla
```

অথবা user-কে mode select করতে বলা যায়:

```text
আপনি কোন mode ব্যবহার করতে চান?
1. General Bangla
2. Quran Learning
3. Medical Info
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-38"></a>

## 7. কখন Adapter Merge করবেন?

Merge করা যায় যদি:

```text
- adapter stable হয়
- এক domain খুব বেশি use হয়
- latency গুরুত্বপূর্ণ হয়
- adapter switching দরকার না হয়
```

সব adapter অন্ধভাবে merge করা উচিত না।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-39"></a>

## 8. কখন Distillation করবেন?

Distillation ব্যবহার করা যায় যদি:

```text
- অনেক adapter manage করা কঠিন হয়ে যায়
- ছোট model দরকার হয়
- inference cost বেশি হয়
- production-এ clean single model দরকার হয়
```

Final deployment-এ শুধু distilled student model রাখা যেতে পারে।

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-40"></a>

# Summary

এই architecture-এর common নাম:

```text
PEFT-based Multi-Adapter Serving
Multi-LoRA Adapter Routing
Adapter-based Inference Architecture
Router-based Adapter Selection
```

Main idea:

```text
Base model একটাই।
বিভিন্ন কাজের জন্য আলাদা LoRA adapter থাকে।
Router/classifier input দেখে সঠিক adapter select করে।
Base model + selected adapter দিয়ে answer generate হয়।
```

এই approach storage-efficient, scalable, domain-specific MLOps deployment-এর জন্য useful।

<!-- tutorial-nav:back -->
[Back to Index](#index)
