Multi-LoRA Adapter Routing Architecture
Overview
এই project একটি PEFT-based Multi-LoRA Adapter Routing architecture-এর sample implementation।
মূল idea:
একটি Base Model
+
একাধিক LoRA Adapter
+
Router / Classifier
=
Domain অনুযায়ী dynamic model behavior

এই architecture-এ base model একবার load হয়। এরপর user input-এর topic/domain অনুযায়ী system সঠিক LoRA adapter select করে response generate করে।
Example:
Base Model
 ├── Bangla LoRA
 ├── Quran/Arabic LoRA
 └── Medical LoRA

User question যদি বাংলা general হয়, তাহলে Bangla LoRA ব্যবহার হবে।
User question যদি Quran/Arabic learning নিয়ে হয়, তাহলে Quran LoRA ব্যবহার হবে।
User question যদি medical topic নিয়ে হয়, তাহলে Medical LoRA ব্যবহার হবে।

Core Concept
Base Model কী?
Base model হলো মূল pretrained language model। যেমন:
Qwen/Qwen2.5-1.5B-Instruct
Mistral-7B
Llama
Gemma
Phi

Base model-এর ভিতরে already language understanding, generation ability, reasoning pattern ইত্যাদি থাকে।

LoRA Adapter কী?
LoRA adapter হলো base model-এর উপর ছোট learned weight adjustment।
Full model fine-tune করলে base model-এর সব/অনেক weight update হয়। কিন্তু LoRA-তে base model সাধারণত fixed থাকে, আর কিছু ছোট trainable matrix শেখে।
Mathematically:
Base weight = W
LoRA learned change = ΔW

Effective weight = W + ΔW

যদি Bangla LoRA active থাকে:
Effective model = Base Model + Bangla LoRA

যদি Quran LoRA active থাকে:
Effective model = Base Model + Quran LoRA

যদি Medical LoRA active থাকে:
Effective model = Base Model + Medical LoRA

LoRA adapter নিজে full model না। এটা base model-এর উপর ছোট domain-specific tuning।

Why Use Multi-LoRA Adapter Routing?
এই architecture useful যখন একই base model দিয়ে বিভিন্ন domain/task handle করতে হয়।
Example use cases:
General Bangla Assistant
Quran Learning Assistant
Arabic Vocabulary Assistant
Medical Information Assistant
Customer Support Assistant
Legal Document Assistant

প্রতিটা domain-এর জন্য আলাদা full model বানালে storage ও deployment cost বেড়ে যায়।
Multi-LoRA approach-এ:
Base model = ১টা
Adapters = অনেকগুলো ছোট file
Router = কোন adapter use হবে তা ঠিক করে


Architecture
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


Important Clarification
এই setup-এ সাধারণত base model ৩ বার load হয় না।
ভুল ধারণা:
Base + Bangla LoRA = ১টা full model
Base + Quran LoRA = ১টা full model
Base + Medical LoRA = ১টা full model

এটা তখনই হয় যখন আপনি প্রতিটা LoRA merge করে আলাদা full model বানান।
Adapter-based serving-এ structure এমন:
১টা Base Model
+
Bangla LoRA file
+
Quran LoRA file
+
Medical LoRA file

Runtime-এ selected adapter active হয়।

When to Keep Adapters Separate
Adapters আলাদা রাখা ভালো যখন:
- একই base model দিয়ে অনেক domain handle করতে হবে
- client-specific customization দরকার
- frequent update দরকার
- storage কম রাখতে হবে
- experiment দ্রুত করতে হবে
- rollback দরকার হতে পারে


When to Merge LoRA
LoRA merge করা ভালো যখন:
- একটাই stable production model দরকার
- adapter switching দরকার নেই
- latency কমাতে চান
- deployment simple রাখতে চান

Merge করলে:
Base Model + LoRA Adapter → New Full Fine-tuned Model

তখন adapter আলাদা করে load করার দরকার নেই। কিন্তু অনেক domain থাকলে merged model অনেকগুলো হয়ে storage বাড়তে পারে।

When to Use Distillation
Distillation useful যখন complex teacher setup থেকে ছোট clean model বানাতে চান।
Example:
Teacher:
Base 7B Model + Multiple LoRA Adapters

Student:
Small 1.5B / 3B model

Training phase-এ storage বেশি লাগতে পারে, কারণ teacher, student, data, checkpoints সব থাকে। কিন্তু final deployment-এ যদি শুধু student model রাখা হয়, তাহলে storage ও inference cost কমতে পারে।

Project Structure
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


Installation
1. Create virtual environment
python -m venv venv

Activate:
# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate


2. Install dependencies
pip install -r requirements.txt


requirements.txt
fastapi
uvicorn[standard]
torch
transformers
peft
accelerate
python-dotenv
pydantic


.env.example
BASE_MODEL_NAME=Qwen/Qwen2.5-1.5B-Instruct
DEFAULT_ADAPTER=bangla
DEVICE=auto


Adapter Registry
File: app/adapter_registry.py
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


Simple Router / Classifier
File: app/router.py
এই sample router rule-based। Production system-এ চাইলে ছোট classifier model, embedding similarity, অথবা LLM-based router use করা যায়।
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


Model Server
File: app/model_server.py
import os
import torch
from dotenv import load_dotenv
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

from app.adapter_registry import ADAPTER_REGISTRY, get_adapter

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
        Load the base model once.
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
        Load adapter only if it is not already loaded.
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


FastAPI App
File: app/main.py
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


Run Locally
uvicorn app.main:app --host 0.0.0.0 --port 8000

Open:
http://localhost:8000/docs


Test API
Bangla request
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "বাংলায় MLOps কী বুঝিয়ে বলো",
    "max_new_tokens": 200
  }'

Expected adapter:
bangla


Quran request
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "সূরা ফাতিহার শব্দার্থ বাংলায় শেখাও",
    "max_new_tokens": 200
  }'

Expected adapter:
quran


Medical request
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "জ্বর হলে কী কী লক্ষণ দেখা যায়?",
    "max_new_tokens": 200
  }'

Expected adapter:
medical


Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


Build Docker Image
docker build -t multi-lora-router .


Run Docker Container
docker run -p 8000:8000 --env-file .env multi-lora-router

Open:
http://localhost:8000/docs


Adapter Folder Example
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

Each adapter folder should contain trained LoRA adapter files.

How to Train Separate LoRA Adapters
Recommended clean approach:
Base Model + Bangla Dataset  → Bangla LoRA
Base Model + Quran Dataset   → Quran LoRA
Base Model + Medical Dataset → Medical LoRA

Avoid unnecessary chain training like:
Base → Bangla LoRA → Quran LoRA → Medical LoRA

Because it creates dependency between adapters and makes debugging/deployment harder.

Production Notes
1. Adapter Versioning
Use version names:
bangla-v1
bangla-v2
quran-v1
quran-v2
medical-v1

Keep metadata:
adapter_name
base_model
dataset_version
training_date
evaluation_score
status
path
owner


2. Adapter Status
Recommended status values:
experiment
staging
production
archived
deprecated

Only production or approved staging adapters should be served.

3. Router Improvement
The current router is rule-based. Better options:
- User-selected mode
- Small intent classifier
- Embedding similarity router
- LLM-based router
- Hybrid rule + classifier

For production, user-selected mode is often the most reliable.
Example:
Mode: General Bangla
Mode: Quran Learning
Mode: Medical Info


4. Safety
Medical, legal, finance, religious answer generation should include safety rules and disclaimers.
Example for medical:
This system provides general information only.
It is not a replacement for professional medical advice.
For emergency symptoms, contact a doctor immediately.


5. Monitoring
Monitor both API and ML behavior.
API monitoring:
latency
error rate
request count
GPU memory
CPU/RAM
timeout

ML monitoring:
adapter usage
bad responses
domain misrouting
user feedback
hallucination rate
data drift
quality score


6. Fallback Adapter
If router is unsure, use default adapter:
default_adapter = bangla

Or ask user:
আপনি কোন mode ব্যবহার করতে চান?
1. General Bangla
2. Quran Learning
3. Medical Info


7. When to Merge Adapters
Merge if:
- adapter is stable
- one domain is heavily used
- latency matters
- no need for adapter switching

Do not merge everything blindly.

8. When to Distill
Use distillation if:
- many adapters became hard to manage
- smaller model is needed
- inference cost is high
- production needs a clean single model

Final deployment may use only the distilled student model.

Summary
This architecture is called:
PEFT-based Multi-Adapter Serving
Multi-LoRA Adapter Routing
Adapter-based Inference Architecture
Router-based Adapter Selection

Main idea:
Base model একটাই।
বিভিন্ন কাজের জন্য আলাদা LoRA adapter থাকে।
Router/classifier input দেখে সঠিক adapter select করে।
Base model + selected adapter দিয়ে answer generate হয়।

This is useful for storage-efficient, domain-specific, scalable MLOps deployment.


