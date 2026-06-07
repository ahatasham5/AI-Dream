# Multi-LoRA Adapter Routing Architecture

## Overview

This repository demonstrates a **PEFT-based Multi-LoRA Adapter Routing** architecture.

The core idea:

```text
One Base Model
+
Multiple LoRA Adapters
+
Router / Classifier
=
Domain-specific dynamic model behavior
```

In this architecture, the base model is loaded once. Based on the user input, the router/classifier selects the correct LoRA adapter and generates a response using:

```text
Base Model + Selected LoRA Adapter
```

Example:

```text
Base Model
 ├── Bangla LoRA
 ├── Quran / Arabic LoRA
 └── Medical LoRA
```

If the user asks a general Bangla question, the Bangla adapter is used.  
If the user asks about Quran or Arabic learning, the Quran adapter is used.  
If the user asks a medical information question, the Medical adapter is used.

---

## Core Concept

### What is a Base Model?

A base model is the main pretrained language model.

Examples:

```text
Qwen/Qwen2.5-1.5B-Instruct
Mistral-7B
Llama
Gemma
Phi
```

The base model already has general language understanding and text generation ability.

---

### What is a LoRA Adapter?

A LoRA adapter is a small learned weight adjustment on top of the base model.

In full fine-tuning, many or all weights of the base model may be updated. In LoRA fine-tuning, the base model usually stays fixed, and only small trainable matrices are learned.

Mathematically:

```text
Base weight = W
LoRA learned change = ΔW

Effective weight = W + ΔW
```

If the Bangla LoRA is active:

```text
Effective model = Base Model + Bangla LoRA
```

If the Quran LoRA is active:

```text
Effective model = Base Model + Quran LoRA
```

If the Medical LoRA is active:

```text
Effective model = Base Model + Medical LoRA
```

A LoRA adapter is not a full model. It is a small domain-specific adjustment that changes how the base model behaves during generation.

---

## Why Use Multi-LoRA Adapter Routing?

This architecture is useful when one base model needs to handle multiple domains, clients, languages, or tasks.

Example use cases:

```text
General Bangla Assistant
Quran Learning Assistant
Arabic Vocabulary Assistant
Medical Information Assistant
Customer Support Assistant
Legal Document Assistant
```

If every domain uses a separate full model, storage and deployment cost increase.

With Multi-LoRA routing:

```text
Base model = one full model
Adapters = many small files
Router = decides which adapter to use
```

---

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

---

## Important Clarification

In this setup, the base model is not necessarily loaded three times.

Wrong assumption:

```text
Base + Bangla LoRA = one full model
Base + Quran LoRA = one full model
Base + Medical LoRA = one full model
```

This only happens if each LoRA is merged into a separate standalone model.

In adapter-based serving, the structure is:

```text
One Base Model
+
Bangla LoRA file
+
Quran LoRA file
+
Medical LoRA file
```

At runtime, the selected adapter is activated based on the request.

---

## When to Keep Adapters Separate

Keep adapters separate when:

```text
- One base model needs to serve many domains
- Client-specific customization is needed
- Frequent updates are expected
- Storage should stay low
- Fast experimentation is needed
- Rollback should be easy
```

---

## When to Merge LoRA

LoRA merge is useful when:

```text
- One stable production model is needed
- Adapter switching is not needed
- Latency needs to be reduced
- Deployment should be simpler
```

Merge process:

```text
Base Model + LoRA Adapter → New Full Fine-tuned Model
```

After merging, the adapter does not need to be loaded separately.

However, if many domains are merged separately, storage will increase because each merged model becomes a full model.

---

## When to Use Distillation

Distillation is useful when a complex teacher setup needs to be compressed into a smaller clean model.

Example:

```text
Teacher:
Base 7B Model + Multiple LoRA Adapters

Student:
Small 1.5B / 3B model
```

During training, distillation may require more temporary storage because the teacher model, student model, generated data, and checkpoints may all exist.

But for final deployment, if only the student model is deployed, storage and inference cost can be reduced.

---

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

---

# Installation

## 1. Create virtual environment

```bash
python -m venv venv
```

Activate it:

```bash
# Windows
venv\Scripts\activate
```

```bash
# Linux / macOS
source venv/bin/activate
```

---

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

---

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

---

# .env.example

```env
BASE_MODEL_NAME=Qwen/Qwen2.5-1.5B-Instruct
DEFAULT_ADAPTER=bangla
DEVICE=auto
```

---

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
        description="General Bangla assistant adapter",
    ),
    "quran": AdapterInfo(
        name="quran",
        domain="quran_arabic_learning",
        path="./adapters/quran",
        status="production",
        description="Quran, Arabic vocabulary, and Islamic learning adapter",
    ),
    "medical": AdapterInfo(
        name="medical",
        domain="medical_information",
        path="./adapters/medical",
        status="staging",
        description="Medical information adapter. Not for emergency diagnosis.",
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

---

# Simple Router / Classifier

File: `app/router.py`

This sample router is rule-based. In production, this can be replaced with a small classifier model, embedding similarity router, user-selected mode, or LLM-based router.

```python
def detect_adapter(user_input: str) -> str:
    """
    Simple rule-based adapter router.

    In production, replace this with:
    - small text classifier
    - embedding similarity router
    - intent classification model
    - user-selected mode
    """

    text = user_input.lower()

    quran_keywords = [
        "quran", "কুরআন", "কোরআন", "সূরা", "সুরা",
        "আয়াত", "আয়াত", "তাফসির", "আরবি", "arabic",
    ]

    medical_keywords = [
        "জ্বর", "ব্যথা", "রোগ", "ডাক্তার", "medicine",
        "medical", "fever", "pain", "symptom", "treatment",
    ]

    bangla_keywords = [
        "বাংলা", "চিঠি", "লিখে", "ব্যাখ্যা", "অনুবাদ",
    ]

    if any(keyword in text for keyword in quran_keywords):
        return "quran"

    if any(keyword in text for keyword in medical_keywords):
        return "medical"

    if any(keyword in text for keyword in bangla_keywords):
        return "bangla"

    return "bangla"
```

---

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
            "Qwen/Qwen2.5-1.5B-Instruct",
        )

        self.default_adapter = os.getenv("DEFAULT_ADAPTER", "bangla")

        self.tokenizer = None
        self.model = None
        self.loaded_adapters = set()
        self.active_adapter = None

    def load_base_model(self):
        """
        Load the base model once.
        """

        self.tokenizer = AutoTokenizer.from_pretrained(
            self.base_model_name,
            trust_remote_code=True,
        )

        base_model = AutoModelForCausalLM.from_pretrained(
            self.base_model_name,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto",
            trust_remote_code=True,
        )

        default_adapter_info = get_adapter(self.default_adapter)

        self.model = PeftModel.from_pretrained(
            base_model,
            default_adapter_info.path,
            adapter_name=self.default_adapter,
        )

        self.loaded_adapters.add(self.default_adapter)
        self.active_adapter = self.default_adapter
        self.model.eval()

    def load_adapter_if_needed(self, adapter_name: str):
        """
        Load adapter only if it is not already loaded.
        """

        if adapter_name in self.loaded_adapters:
            return

        adapter_info = get_adapter(adapter_name)

        self.model.load_adapter(
            adapter_info.path,
            adapter_name=adapter_name,
        )

        self.loaded_adapters.add(adapter_name)

    def set_active_adapter(self, adapter_name: str):
        """
        Switch active LoRA adapter.
        """

        self.load_adapter_if_needed(adapter_name)
        self.model.set_adapter(adapter_name)
        self.active_adapter = adapter_name

    def generate(self, prompt: str, adapter_name: str, max_new_tokens: int = 256):
        """
        Generate response using selected adapter.
        """

        self.set_active_adapter(adapter_name)

        messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant. Answer clearly and safely.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ]

        if hasattr(self.tokenizer, "apply_chat_template"):
            input_text = self.tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True,
            )
        else:
            input_text = prompt

        inputs = self.tokenizer(
            input_text,
            return_tensors="pt",
        ).to(self.model.device)

        with torch.no_grad():
            output = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
            )

        generated_text = self.tokenizer.decode(
            output[0],
            skip_special_tokens=True,
        )

        return {
            "adapter_used": adapter_name,
            "response": generated_text,
        }


model_server = MultiLoRAModelServer()
```

---

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
    version="1.0.0",
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
        "message": "Multi-LoRA Adapter Routing API is running",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "active_adapter": model_server.active_adapter,
        "loaded_adapters": list(model_server.loaded_adapters),
    }


@app.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):
    try:
        adapter_name = request.adapter or detect_adapter(request.prompt)

        result = model_server.generate(
            prompt=request.prompt,
            adapter_name=adapter_name,
            max_new_tokens=request.max_new_tokens,
        )

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )
```

---

# Run Locally

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Open:

```text
http://localhost:8000/docs
```

---

# Test API

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

---

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

---

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

---

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

---

# Build Docker Image

```bash
docker build -t multi-lora-router .
```

---

# Run Docker Container

```bash
docker run -p 8000:8000 --env-file .env multi-lora-router
```

Open:

```text
http://localhost:8000/docs
```

---

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

Each adapter folder should contain trained LoRA adapter files.

---

# How to Train Separate LoRA Adapters

Recommended clean approach:

```text
Base Model + Bangla Dataset  → Bangla LoRA
Base Model + Quran Dataset   → Quran LoRA
Base Model + Medical Dataset → Medical LoRA
```

Avoid unnecessary chain training like:

```text
Base → Bangla LoRA → Quran LoRA → Medical LoRA
```

Chain training creates dependency between adapters and makes debugging, evaluation, and deployment harder.

---

# Production Notes

## 1. Adapter Versioning

Use version names:

```text
bangla-v1
bangla-v2
quran-v1
quran-v2
medical-v1
```

Keep metadata:

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

---

## 2. Adapter Status

Recommended status values:

```text
experiment
staging
production
archived
deprecated
```

Only `production` or approved `staging` adapters should be served.

---

## 3. Router Improvement

The current router is rule-based. Better options:

```text
- User-selected mode
- Small intent classifier
- Embedding similarity router
- LLM-based router
- Hybrid rule + classifier
```

For production, user-selected mode is often the most reliable.

Example:

```text
Mode: General Bangla
Mode: Quran Learning
Mode: Medical Info
```

---

## 4. Safety

Medical, legal, financial, and religious answer generation should include safety rules and review processes.

Example for medical:

```text
This system provides general information only.
It is not a replacement for professional medical advice.
For emergency symptoms, contact a doctor immediately.
```

---

## 5. Monitoring

Monitor both API behavior and ML behavior.

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
domain misrouting
bad responses
user feedback
hallucination rate
data drift
quality score
```

---

## 6. Fallback Adapter

If the router is unsure, use a default adapter:

```text
default_adapter = bangla
```

Or ask the user:

```text
Which mode do you want to use?
1. General Bangla
2. Quran Learning
3. Medical Info
```

---

## 7. When to Merge Adapters

Merge if:

```text
- the adapter is stable
- one domain is heavily used
- latency matters
- no adapter switching is needed
```

Do not merge everything blindly.

---

## 8. When to Distill

Use distillation if:

```text
- many adapters became hard to manage
- a smaller model is needed
- inference cost is high
- production needs a clean single model
```

Final deployment may use only the distilled student model.

---

# Common Names for This Architecture

This approach may be called:

```text
PEFT-based Multi-Adapter Serving
Multi-LoRA Adapter Routing
Adapter-based Inference Architecture
Router-based Adapter Selection
Multi-adapter Inference
```

A professional name:

```text
PEFT-based multi-adapter inference architecture with router-based adapter selection
```

---

# Summary

The main idea:

```text
Base model stays fixed.
Different LoRA adapters are stored separately.
A router/classifier checks the user input.
The correct adapter is selected.
Base model + selected adapter generates the answer.
```

This is useful for storage-efficient, domain-specific, scalable MLOps deployment.
