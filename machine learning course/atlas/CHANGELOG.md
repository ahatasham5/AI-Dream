# Changelog — ML Learning Atlas

## ২০২৬-১০-১৯ (১৯) — মূল ML ধারার সম্পর্ক: ৮৫টা node, ১০৪টা সম্পর্ক

### সমস্যা
সম্পর্ক শুধু Distillation আর architecture শাখায় ছিল; Training, network, Transformer, fine-tuning-এর মতো মূল ধারায় "আগে কী লাগে" ছিল না, তাই সেখানে পড়ার ক্রম বের হতো না।

### পরিবর্তন
- **৬৩টা নতুন `needs`:** Supervised Learning → Linear Regression → MSE → Gradient Descent; Sigmoid → Logistic Regression → Log loss; Unit → Activation → Layer → MLP → Architecture; Gradient Step → Derivative → Chain Rule → Backpropagation → Optimizer → Batch/Step/Epoch; SGD → Momentum → Adam → AdamW; Weight Decay, Gradient Clipping, Cosine ও WSD, Early Stopping, Hyperparameter খোঁজা; Token → Embedding → Softmax → Next-token → Attention → Transformer Block → Autoregressive; Pretraining → Fine-tuning → LoRA → QLoRA।
- **প্রতিটা সম্পর্কে `basis`:** `course` (কোর্সের নিজের lecture-পূর্বশর্ত সমর্থন করে, ৬৯টা) বা `concept` (সংজ্ঞা থেকে সরাসরি, ৩৫টা)। `build.py` এখন basis ছাড়া সম্পর্ক আটকায়। dialog-এ সম্পর্কের নামে hover করলে basis দেখায়।
- **`course`-দাবি আর আমার বিচারে নয়:** নতুন test `Relations` প্রতিটা `basis: course` সম্পর্কের জন্য lecture-ফাইল ঘেঁটে দেখে, তার lecture-এর "আগে যা জানা থাকলে ভালো" লাইনে (পরোক্ষভাবেও, `[Lecture 01–07]`-এর মতো সীমাসহ) অন্য node-এর lecture আছে কি না।
- **পথ ঠিকঠাক করা:** পড়ার ক্রম এখন সবখানে Supervised Learning → Linear Regression থেকে শুরু; Linear Attention সত্যিকারের Attention node-এ জোড়া; Transformer Block-এ আগে Layer, তারপর Attention।
- `Leakage` node-কে Module 05-এর "Data leakage" পাঠের সাথে জোড়া (আগে শুধু Module 15)।

### যাচাই
- `bash atlas/check.sh` পাস (৪৯টা data test, ৬৬টা Node test)।
- test প্রথমবারে আমার ৪টা `course`-দাবি ধরেছিল (Leakage পাঠ জোড়া ছিল না; "[Lecture 01–07]" সীমা পড়া হয়নি); দুটোই ঠিক করা।
- browser-এ AdamW খুলে: "আগে এগুলো লাগে: Adam, Weight Decay" আর ১২ ধাপের পড়ার ক্রম।

### সীমা
- মোট ১১২১ node-এর ৮৫টায় সম্পর্ক। Evaluation, Application, Learning Setting, classical model (tree, SVM, k-NN) এখনো বাকি।
- `concept`-সম্পর্ক (৩৫টা) সংজ্ঞা পড়ে আমার বিচারে, test এগুলো যাচাই করে না; তাই আলাদা চিহ্নে রাখা।
- Lecture-এর পূর্বশর্ত-লাইনই কোর্সের একমাত্র সূত্র: কোনো lecture নিজের পূর্বশর্ত ভুল লিখলে সম্পর্কও সেই ভুল পাবে।

## ২০২৬-১০-১৯ (১৮) — সম্পর্ক ও পড়ার ক্রম; Distillation পাঠক্রম গাছের ভেতরে

### সমস্যা
Tree শুধু "ভেতরের অংশ" আর "একই নাম আরও কোথায়" দেখাত; কোন node বুঝতে আগে কী লাগে, তা কোথাও ছিল না। Knowledge Distillation ছিল একটা পাতা, Module 18-এর আটটা পাঠ জোড়া ছিল না, আর "teacher থেকে student কীভাবে" সিদ্ধান্ত ছিল না। কোর্সের md নয়, tree-কেই tutorial হতে হবে।

### পরিবর্তন
- **নতুন `data/relations.json`:** `needs` (from-কে বুঝতে আগে to লাগে) আর `contrasts` (পাশাপাশি তুলনা)। প্রতিটায় কারণ। `build.py` আটকায়: অজানা id, নিজের দিকে, কারণ নেই, একই সম্পর্ক দুবার, আর `needs`-এ চক্র।
- **dialog-এ নতুন ঘর:** "আগে এগুলো লাগে", "এর ওপর এগুলো দাঁড়ায়", "তুলনা করো", আর "এটা বুঝতে পড়ার ক্রম (n ধাপ) →"।
- **পড়ার ক্রম (tour):** সব পূর্বশর্ত (পূর্বশর্তের পূর্বশর্তসহ) পূর্বশর্ত-আগে ক্রমে। ওপরে পট্টি: ধাপ i / n, আগের, পরের, "পড়া হয়েছে" চিহ্ন (এই browser-এ জমা), বন্ধ করো। কিছু বাছে বা মোছে না।
- **Distillation পাঠক্রম গাছের ভেতরে:** Knowledge Distillation-এর নিচে Module 18-এর ৮টা পাঠ ৮টা node (সংজ্ঞা, গল্প, পাঠ-link), আর ৪টা সিদ্ধান্ত: teacher-এর কতটুকু দেখতে পাও (লেখা, probability, ভেতরের vector), student-এর গঠন (একই/আলাদা, আলাদা হলে রূপান্তর শাখায় jump), কোন text-এ সংকেত (offline/on-policy), teacher-এর উত্তর কীভাবে বাছবে।
- **৩৭টা সম্পর্ক:** পাঠগুলোর পূর্বশর্ত (Module 18-এর README থেকে), architecture শাখার ধারা (Linear Attention → DeltaNet → Gated DeltaNet → Hybrid → রূপান্তর → খোলা প্রশ্ন), আর distillation বনাম quantization ও LoRA-র তুলনা।
- **গল্পের পথ:** নতুন অধ্যায় "১০. এক model থেকে আরেকটায়"; Knowledge Distillation, রূপান্তর ও খোলা প্রশ্ন অধ্যায় ৯ থেকে এখানে সরে এসেছে।

### বাগ ও পাহারা
- আমার কোডে `bn` নামটা আগে থেকেই ঘোষিত ছিল, ফলে পুরো পাতার script থেমে গিয়েছিল। build ও Node test পাস করেছিল, browser ধরেছে। এখন PageSource test সব file মিলিয়ে বাইরের স্তরের `const`, `let`, `class`, `function`-এর দুবার ঘোষণা ধরে (পুরোনো ভুল ফিরিয়ে এনে পরীক্ষা করা)।
- ক্রমের পট্টি node-এর id বসার আগেই আঁকা হতো বলে প্রথম ধাপেও "শেষ ধাপ" দেখাত; id সরাসরি পাঠিয়ে ঠিক।

### যাচাই
- `bash atlas/check.sh` পাস (৪৭টা data test, ৬৬টা Node test, নতুন `relations.test.js`)।
- browser-এ: শেষ পাঠ থেকে ক্রম শুরু করে ১৭ ধাপ হেঁটে দেখা (Softmax থেকে শেষ পাঠ), ১৬টা "পড়া হয়েছে" জমে, "আগের" ও "বন্ধ করো" কাজ করে।
- পড়ার ক্রম কোর্সের মূল পথ মানে: ০১ → ০২ → ০৩ → ০৪ → ০৬ → ০৭ → ০৫ → ০৮।

### সীমা
- সম্পর্ক এখন প্রায় ৩৭টা, পুরো map-এর তুলনায় সামান্য। বাকি map-এ সম্পর্ক বসানো আলাদা কাজ।
- Lecture-এর "মনে রাখার সারকথা" থেকে নেওয়া সংখ্যা আবার চালিয়ে মেলানো হয়নি (lecture নিজেই মেলানোর কথা বলে)।
- Tree-র সারিতে "পড়া হয়েছে" চিহ্ন এখনো নেই, শুধু dialog-এর পট্টিতে।
- "Weight Decay"-এর মতো আগের কিছু node-এর পূর্বশর্ত এখনো লেখা নেই।

## ২০২৬-১০-১৯ (১৭) — Hyperparameter ও model-আকার

### সমস্যা
গুনে দেখা গেল hyperparameter-এর অনেক জরুরি বিষয় map-এ ছিল না: batch size, weight decay-এর মান, gradient clipping, cosine ও WSD schedule, early stopping (শূন্য-থেকে পথে), hyperparameter খোঁজার পদ্ধতি; আর Block-stack-এ "model কত বড়" (layer, প্রস্থ, KV head) নেই। শূন্য-থেকে পথের learning rate-এ বিকল্প ছিল মাত্র একটা।

### পরিবর্তন
- **৭টা নতুন ধারণা-node** (তিন পথেই আসে): Batch size ও learning rate, Weight Decay, Gradient Clipping, Cosine Decay, Warmup–Stable–Decay, Early Stopping, Hyperparameter খোঁজা। প্রতিটায় সংজ্ঞা, হিসাবের ছোট উদাহরণ (যেখানে সূত্র আছে), গল্প, সাল, সূত্রসহ তথ্য।
- **বাছাইয়ে নতুন সিদ্ধান্ত (দুই পথেই, শূন্য-থেকের নকল `-sc`):** batch size, weight decay, gradient clipping, hyperparameter খোঁজার পদ্ধতি ও tool (Optuna); schedule-এ cosine ও WSD।
- **শুধু শূন্য-থেকে পথে:** "কখন থামবে?" (validation বনাম আগে-ঠিক-করা step), learning rate-এ "প্রকাশিত recipe থেকে শুরু"।
- **Block-stack-এর ভেতরে "model কত বড়":** layer ও প্রস্থ (Surya, Qwen3-8B, Qwen3-Next, Jamba-র আসল মাপসহ), KV head (GQA), আগে KV cache-এর হিসাব, আকার ও token সমান হারে (Chinchilla)।
- pseudo-code-এ নতুন লাইন; `lessons.json`-এ Batch size → 10/06, Early Stopping → 07/03, Hyperparameter খোঁজা → 07/05; গল্পের পথের অধ্যায় ৫-এ ৬টা নতুন ধাপ।

### যাচাই
- `bash atlas/check.sh` পাস (৪৬টা data test, ৫৮টা engine test); `verify_tools.py`: ৫২টা repo-তে অমিল নেই (Optuna-সহ)।
- দুই পথে বাছাই চালিয়ে দেখা: pseudo-code-এ নতুন লাইনগুলো বসে।
- প্রতিটা তথ্য arXiv, official docs, model card ও config.json থেকে আলাদা agent দিয়ে মেলানো; Surya-র মাপ আপনার local config থেকে।

### সীমা
- যা এখনো নেই: dropout-এর মান, mixed precision, learning-rate finder, epoch/step-সংখ্যা ঠিক করার নিয়ম, initialization-এর রকম (শুধু একটা বিকল্প)।
- Jamba-র প্রস্থ (৪০৯৬) paper-এ নেই, শুধু config-এ; Llama-3.2-1B-র মাপ mirror থেকে হওয়ায় নেওয়া হয়নি; KV cache-এর batch ও byte-এর গুণ আমার যোগ করা (সংজ্ঞায় "আমার হিসাব" লেখা)।
- Weight Decay কোর্সে কতটা আছে, তা আলাদা যাচাই হয়নি, তাই পাঠ-link দেওয়া হয়নি।

## ২০২৬-১০-১৯ (১৬) — নতুন node-এর গল্প, ইতিহাস আর গল্পের পথ

### সমস্যা
Architecture-এর পুনর্গঠনের পর গুনে দেখা গেল নতুন ২৩টা reference node-এর মধ্যে ১৭টায় গল্প (সমস্যা → ধারণা → পরে কী) ছিল না, Hybrid ও রূপান্তর শাখায় ইতিহাস ছিল না, আর পুরোনো গল্প (RWKV, RetNet, Linear Attention) কোনো নতুন node-এ পৌঁছাত না। গল্প ধরে হাঁটলে নতুন অংশে পৌঁছানো যেত না।

### পরিবর্তন
- **১৭টা নতুন গল্প** (Hybrid-এর ছক, ৫টা hybrid model, ৬টা রূপান্তর-পদ্ধতি, ৫টা খোলা প্রশ্ন); প্রতিটায় "পরে কী" লিংক। সংখ্যা আগে যাচাই-করা সূত্র থেকে।
- **পুরোনো গল্পে সামনের লিংক:** Transformer → বিকল্প পরিবার; Linear Attention, RWKV, RetNet → DeltaNet; Mamba-2 → Gated DeltaNet; Jamba → Hybrid-এর ছক।
- **দুটো তারিখ-ক্রম (history):** Hybrid (Griffin থেকে Kimi Linear) আর রূপান্তর (Mamba in the Llama থেকে Taylor-Calibrate)। খোলা প্রশ্নে সাল দেওয়া হয়নি, কারণ যাচাই-করা সাল নেই।
- **গল্পের পথে নতুন অধ্যায় "৯. Transformer-এর পরের architecture":** ১০টা ধাপ, attention-এর বিকল্প থেকে hybrid, রূপান্তর, আর খোলা প্রশ্ন পর্যন্ত।
- **বাছাই-গাছ থেকে গল্পে jump (৫টা):** Block-stack, Full attention, Linear attention, SSM, MoE থেকে তাদের গল্পে।

### যাচাই
- গল্পের "পরে কী" ধরে নতুন অধ্যায় থেকে নতুন ২৩টা node-এর সবগুলোতে পৌঁছানো যায় (প্রথমে ১৪টা পৌঁছাত, বাকি ৯টায় লিংক জুড়ে ঠিক করা)।
- `bash atlas/check.sh` পাস।

### সীমা
- `tool` node-এ (৭৫টা) গল্প নেই, `decision`-এ প্রায় নেই (৭৫টার ৪টা): এটা আগের নিয়ম, বদলাইনি। tool ও decision-এর ব্যাখ্যা `definition`, `needWhy`, `why`, `tradeoff`-এ।
- নতুন গল্পের ভাষা সহজ কি না আমার বিচারে, কেউ আলাদা করে পড়েনি।

## ২০২৬-১০-১৯ (১৫) — jump: "বাছলে" আসলে অন্য পথে যাওয়া

### সমস্যা
শূন্য-থেকে পথে "মানানসই আগে-শেখা model আছে → Fine-tune মোড বাছো" বিকল্পে "বাছো" চাপলে পথ শূন্য-থেকেই থাকত, শুধু আবশ্যক প্রশ্নটা "উত্তর হয়েছে" ধরা হতো আর pseudo-code-এ লেখা আসত `justify = … use the Fine-tune path`: পরস্পরবিরোধী।

### পরিবর্তন
- `jump.onSelect: true` হলে "বাছো" বোতাম বিকল্পটা বাছে না, সরাসরি ওই পথে যায় (আগের বাছাই থাকে, toast-এ "আগের পথে ফেরো")। তখন আলাদা "যাও" বোতাম দেখানো হয় না।
- `opt-sc-pretrained-exists`-এ চালু। `build.py` আটকায়: `onSelect` শুধু `option`-এ। নতুন test।

### যাচাই
- `bash atlas/check.sh` পাস। browser-এ বোতাম চেপে: মোড Fine-tune হয়, বিকল্পটা নিজে বাছা হয় না, "আগের পথে ফেরো" শূন্য-থেকে ফেরায়।

## ২০২৬-১০-১৯ (১৪) — jump: "এখানে নয়, ওখানে যাও" বোতাম

### সমস্যা
"মানানসই আগে-শেখা model আছে → Fine-tune মোড বাছো" লেখা থাকলেও সেখানে যাওয়ার বোতাম ছিল না; reference গাছ আর বাছাই-গাছের মধ্যেও সরাসরি যাতায়াত ছিল না।

### পরিবর্তন
- node-এ নতুন ঐচ্ছিক field `jump: {to, label, why}`। গাছের সারিতে "label →" বোতাম, dialog-এ কারণসহ একটা ঘর।
- লক্ষ্য পথের ধরন (mode) হলে mode বদলায় ও প্রথম অবাছা ধাপে নিয়ে যায়; আগের বাছাই মোছে না (engine-এ যাচাই করা), তবু toast-এ "আগের পথে ফেরো"। অন্য লক্ষ্যে শুধু সেখানে নিয়ে গিয়ে খোলে।
- ৬টা jump: শূন্য-থেকে → Fine-tune পথ; Knowledge Distillation ↔ রূপান্তর; Hybrid (reference) → বাছাই-গাছের token mixer; interleave → বাস্তব অনুপাত; parallel → Hymba।
- `build.py` আটকায়: লক্ষ্য নেই, নিজের দিকে, বা to/label/why ফাঁকা। নতুন data test `Jumps`।

### যাচাই
- `bash atlas/check.sh` পাস; ভুল jump দিলে build থামে (দুটো ক্ষেত্রে পরীক্ষা)।
- browser-এ: বোতাম দেখায়, click-এ mode বদলায়, বাছাই থাকে, "আগের পথে ফেরো" আগের mode ফেরায়; Hybrid থেকে token mixer-এর dialog খোলে।

## ২০২৬-১০-১৯ (১৩) — Architecture: কাঠামো, token mixer আর hybrid আলাদা

### সমস্যা
- "model-এর পরিবার" ছিল একটা-বাছো (MLP, CNN, RNN, Transformer, SSM), অথচ Qwen3-Next, Jamba, Surya OCR 2-র মতো model-এ একাধিক ধরনের layer মেশানো। Hybrid-এর কোনো ঘর ছিল না।
- Jamba ছিল শুধু SSM-এর নিচে; Gated DeltaNet কোথাও ছিল না; "(Transformer হলে)" শুধু নামে লেখা ছিল, কোনো নিয়ম এটা মানাত না।

### পরিবর্তন
- **বাছাই-গাছ (Training → From-scratch → Architecture বাছা):** `sc-family` এখন "কাঠামো" (MLP, CNN, RNN, Block-stack)। Block-stack-এর ভেতরে তিন সিদ্ধান্ত: token mixer (`sc-mixer`, একাধিক বাছা যায়; ২টা বাছলেই hybrid), layer সাজানোর ছক (`sc-layout`), channel mixer (`sc-ffn`: dense বা MoE)। প্রতিটা mixer-এর ভেতরে তার নিজের রূপ ও implementation।
- **"Transformer হলে" এখন গাছের গঠনেই:** অবস্থান-তথ্য, attention-এর দক্ষতা ও Transformer-এর implementation এখন Full attention বিকল্পের ভেতরে, তাই attention না বাছলে আসেই না। MLP বাছলে mixer-এর প্রশ্নও আসে না, block-stack বাছলে আবশ্যক হয়ে যায়।
- **id বদল (alias আছে):** `opt-sc-transformer` → `opt-sc-mix-attn`, `opt-sc-ssm` → `opt-sc-mix-ssm`।
- **নিয়ম (`rules.json`, ৬টা):** দুই ধরনের mixer বাছলে ছক আবশ্যক (জোড়া ধরে ৩টা requires); ছক "সব layer এক ধরন" হলে বিরোধ (৩টা conflict)। প্রতিটা বার্তায় কোন দুই mixer, তা লেখা।
- **Reference গাছ (Architecture-এর ধরন):** নতুন DeltaNet ও Gated DeltaNet (সূত্র, হিসাবের উদাহরণসহ); ৭. Hybrid (Jamba সরানো হয়েছে, SSM-এর নিচে ইঙ্গিত থাকল; Qwen3-Next ও Qwen3.5, MiniMax-01, Griffin, Hymba, Kimi Linear; ছকের ব্যাখ্যা); ৮. এক architecture থেকে আরেকটায় রূপান্তর (৬টা পদ্ধতি); ৯. খোলা প্রশ্ন (৫টা)। প্রতিটার সূত্র-যাচাই-করা তথ্য `practice.json`-এ, সাল `history.json`-এ।
- **নতুন tool:** flash-linear-attention (GitHub API থেকে মেলানো)।
- **test বদল:** Architecture-এর তুলনাযোগ্য ভাই ৬ → ৭ (নতুন ৮ ও ৯ বিকল্প নয়, তাই `peer: false`); engine test-এ `opt-sc-ssm` → `opt-sc-mix-ssm`।

### যাচাই
- `bash atlas/check.sh`: build, ৪৩টা data test, ৫৮টা engine test, ml-mapping.html হালনাগাদ, সব পাস।
- বাছাই-দৃশ্য engine-এ চালিয়ে দেখা: MLP-তে mixer আসে না; block-stack-এ mixer আবশ্যক; attention + SSM ছক ছাড়া হলে requires, uniform দিলে conflict; tool বাছলে পূর্বপুরুষ নিজে বাছা হয়।
- browser-এ খুলে: "কাঠামো" decision, ভাইদের তুলনা-ছক (Hybrid), আর "আমার পথ" panel-এ বাছা পথ ও সতর্কতা-সংখ্যা।
- সব তথ্য ২০২৬-১০-১৯-এ arXiv, model card ও config.json থেকে আলাদা agent দিয়ে মেলানো; Surya OCR 2-র ১৮ + ৬ layer আপনার local cache-এর config থেকে।

### সীমা
- Surya-র ১৮টা linear layer নির্দিষ্টভাবে Gated DeltaNet কি না config বলে না (শুধু `linear_attention`); নামটা Qwen3.5 পরিবারের card থেকে অনুমান, ঠিক সেভাবেই লেখা।
- RecurrentGemma-র layer ছক, Samba-র ঠিক ক্রম আর Qwen3-Next-এর blog-তারিখ যাচাই হয়নি, তাই বাদ।
- Cross-tokenizer distillation-এর কোনো paper পাওয়া যায়নি, তাই খোলা প্রশ্নে রাখা হয়নি।
- এই নতুন node-গুলোর কোর্সের পাঠ নেই (practice-এ "কোর্সে নেই" লেখা)।
- সংজ্ঞার সরলতা আমার বিচারে, স্বতন্ত্র যাচাইকারী ছাড়া।

## ২০২৬-১০-১৮ (১২) — তুলনা: নম্বর-ওয়ালা বিকল্পও, আর কেন নেই তা বলা

### সমস্যা
কিছু শাখায় "⇄ তুলনা" আসত না (hover-এও না)। ২১৭টা শাখার ২০টায় নেই, সবগুলোর সন্তানে ক্রমিক নম্বর। নিয়মটা ছিল "নম্বর মানেই ক্রমিক ধাপ, তুলনা অর্থহীন"। এটা মোটা: Task (Regression, Classification…), Learning Setting, Architecture-এর ধরন (MLP, CNN, RNN, Transformer…), Training-এর তিন ধরন, Transformer-এর কৌশল, SSM পরিবার আসলে বিকল্প, নম্বর শুধু তালিকার ক্রম।

### পরিবর্তন
- **data-ই বলে দেয়, নম্বর দেখে আন্দাজ নয়:** parent-এ `compare: "alternatives"` (১০টা: Task, Learning Setting, Architecture-এর ধরন, Transformer-এর কৌশল, SSM পরিবার, Training, Supervised/Semi-/Self-supervised/Unsupervised) আর মিশ্র তালিকার ক্রমিক শুরুর অংশে `peer: false` (১১টা: সংকেত, Model শেখা, Input, Target, SSM-এর ভিত্তি, HiPPO)। তুলনা এখন ২০৭ শাখায় (আগে ১৯৭)।
- **সত্যিই ক্রমিক ১০টায় তুলনা নেই, আর সেটা এখন বলা হয়:** hover-এ ডানে "বিকল্প নয়" (tooltip: ক্রমিক ধাপ বা আলাদা ধারণা)। Model শেখা (Prediction → Loss → Update), Input, Output, Fine-tuning, From-scratch, Evaluation, RL, Mamba, আর দুই মোড।
- `build.py` আকার আটকায়: `compare` শুধু "alternatives" ও ≥২ যোগ্য সন্তানসহ; `peer` শুধু false ও শুধু alternatives-parent-এর সন্তানে।

### সীমা
- কোনটা বিকল্প আর কোনটা ক্রমিক, তা সংজ্ঞা পড়ে আমার বিচারে (স্বতন্ত্র যাচাইকারী ছাড়া)। Evaluation (Train/Validation/Test data, Metrics, Generalization…) ও RL (পাঁচটা আলাদা অক্ষ) আমি বিকল্প-তালিকা ধরিনি; ভিন্নমত হলে `compare` বসালেই হবে।

### Test
- Node (compare, ২টা নতুন + ১টা হালনাগাদ): পতাকা-সহ/ছাড়া নিয়ম; আসল data-য় Task ৫, Architecture ৬, Training ৩, Supervised ৩, SSM ৫, আর Model শেখা/Input/Output ইত্যাদিতে ০। Python (`CompareFlags`, ৪টা): ভুল পতাকা build-এ আটকায়। browser: ১২টা শাখার বোতাম/লেখা, Model শেখা-য় hover, Task-এর তুলনা খোলে।

## ২০২৬-১০-১৮ (১১) — গাইড: বাকি আবশ্যক সিদ্ধান্ত

### সমস্যা
Fine-tune মোড বেছে ফেললেও "বাকি সিদ্ধান্ত" ০ দেখাত, কারণ গোনা হতো শুধু সেই ধাপের যেখানে অন্তত একটা বাছা আছে। অথচ মোডের সব ধাপ মিলিয়ে ১২টা আবশ্যক সিদ্ধান্ত বাকি।

### পরিবর্তন
- **মোডের সব ধাপ জুড়ে গণনা** (`engine.remaining`, `remainingByStep`, `optionalRemaining`)। group একবারই, ঐচ্ছিক ও default-সহ নয়। শর্তসাপেক্ষ সিদ্ধান্ত parent বাছার পর আসে, তাই সংখ্যা বাড়তে পারে (tooltip-এ বলা)।
- **sticky topbar-এ গাইড-pill** "১২টা আবশ্যক বাকি →": চাপলে বা `N` চাপলে `nextRequired` (ফোকাসের পরের অবাছা আবশ্যক, শেষে ঘুরে প্রথমে) খুলে দেখায়, breadcrumb সরে, সারি পালস করে। সব হলে "✓ আবশ্যক সব হয়েছে"। খোঁজার ঘরে `n` লিখলে গাইড চলে না।
- **ধাপের চিহ্নে আম্বার সংখ্যা**, আর গাছের ওপরের বার ও panel-এ গাইড-সারি ("চাইলে ঠিক করার: n টা ঐচ্ছিক" সহ)।

### Test
- Node (৩টা): মোড না বাছলে কিছু নেই; শুধু মোড বাছলে ১২ (আগের `pending()` ০ থাকে); উত্তরে কমে, group একটায় পূর্ণ, শর্তসাপেক্ষ parent-এর পর আসে; দুই মোডে সব বেছে ফেললে বাকি ০; `nextRequired` ঘোরে ও শেষে প্রথমে ফেরে।
- browser: গাইড ধরে ধরে ১২টা সিদ্ধান্ত (শর্তসাপেক্ষ checkpoint সহ) পূরণ করে "✓ সব আবশ্যক" পর্যন্ত; pill স্ক্রলে ওপরে আটকে থাকে; ধাপ-চিহ্নে ২, ৮, ১, ১; console error ০।

## ২০২৬-১০-১৮ (১০) — "সাথে আসে" আর ঐচ্ছিক অংশ, "পড়ে বোঝো"-র বদলে

### সমস্যা
SFT-র Input ও Target, শেখার চক্র ইত্যাদি SFT-র নিজেরই অংশ, অথচ "পড়ে বোঝো"-তে লুকোনো ছিল, যেন বাইরের ব্যাখ্যা।

### পরিবর্তন
- **`part: "core"` (১০টা node):** parent বাছলে গাছে নিজে থেকে `✓ সাথে আছে` (বাছা-রঙে), না বাছলে ম্লান "… বাছলে আসে"। SFT: Input ও Target, শেখার চক্র, Loss Mask। LoRA: forward pass ও scale, Rank, Alpha, শুরুর মান, Target modules। QLoRA: Quantization, NF4 ও block scale। সবার আগে দেখায়; বাছা যায় না, "বাছা"-র সংখ্যায় গোনাও হয় না। dialog-এও একই ব্যাখ্যা।
- **`part: "optional"` (২টা):** **Instruction Tuning** (SFT-র একটা ব্যবহার, আলাদা algorithm নয়) আর **LoRA Dropout** এখন আসল ঐচ্ছিক বিকল্প: `ঐচ্ছিক` চিহ্ন, `বাছো` বোতাম। বাছলে parent নিজে আসে, parent বাদ দিলে এটাও যায়। `when`/`why`/`tradeoff` সংজ্ঞা থেকে নেওয়া।
- **"পড়ে বোঝো" এখনো আছে** শুধু যেগুলো সত্যিই পড়ার ব্যাখ্যা (যেমন LoRA-র "Adapter save বনাম Merged save", "Merge ও Unmerge", "Frozen-এর ভেতর দিয়ে gradient")।
- `build.py` `part`-এর আকার যাচাই করে; option-এর সন্তান option চলে শুধু `part: optional` হলে।

### সীমা
- কোনটা core, কোনটা ঐচ্ছিক, কোনটা শুধু-পড়ার, তা প্রতিটা সংজ্ঞা পড়ে আমার বিচারে করা (স্বতন্ত্র যাচাইকারী ছাড়া)। বিচার-নির্ভর: Loss Mask (core; "কোথায় গুনবে" নিচের সিদ্ধান্ত), NF4 ও block scale (core)।
- ঐচ্ছিক অংশ বাছলে এখনো pseudo-code বদলায় না (Instruction Tuning, LoRA Dropout-র কোনো ছাঁচ-লাইন নেই)।

### Test
- Node (২টা): core বাছা যায় না ও গোনা হয় না; ঐচ্ছিক বাছলে parent আসে, parent বাদে অংশও যায়, সূত্র অক্ষত। Python (`Parts`, ৩টা): `part`-এর আকার, ঐচ্ছিকের কারণ-ক্ষেত্র, core-এর parent-এ বাছার বিষয় আছে।
- browser: SFT বাছার আগে/পরে/বাদে চিহ্ন বদলায়, সংখ্যা ঠিক, LoRA-তে তিন রকম একসাথে, dialog ঠিক; console error ০।

## ২০২৬-১০-১৮ (৯) — "বাছা"-র সংখ্যা: স্বাধীন সিদ্ধান্ত গোনা

### সমস্যা
একটা checkpoint (Qwen) বাছলে গোটানো সারিতে "✓ ২টা বাছা" দেখাত। কারণ নিচের কিছু বাছলে ওপরের বিকল্প (Vision-Language model) নিজে থেকে বাছা হয়, আর সংখ্যা সেটাকেও আলাদা গুনছিল।

### পরিবর্তন
- **স্বাধীন বাছাই** = বাছা node, যার নিচে আর কিছু বাছা নেই (`choiceIds`/`choices`/`count`)। একটা checkpoint বাছলে ১। একই decision-এ দুটো আলাদা বাছলে ২।
- এই সংখ্যাই চলে: গোটানো শাখার "✓ n টা বাছা", panel-এর শিরোনাম, "পথ" ট্যাবের সংখ্যা, "আমার পথ" বোতাম, ধাপের ✓ সংখ্যা, "সব মুছবে" নিশ্চিতকরণ, আর Markdown/সাধারণ-লেখা export-এর শিরোনাম ও তালিকা।
- পথ-তালিকা ও export-এ নিজে-আসা ওপরের বিকল্প আলাদা সারি নয় (পথ-রেখাতেই তা আছে)। Checkpoint বাদ দিলে model-ধরনই সিদ্ধান্ত হয়ে থাকে। JSON-এ সব node থাকে, প্রতিটায় `choice: true/false` সহ। pseudo-code, বিরোধ-নিয়ম ও share-link আগের মতো সব বাছা node দেখে।

### আলাদা ভুল ঠিক
- **পথ-তালিকার ✕ (বাদ দাও) বোতাম ভাঙা ছিল** (`removeWithDesc is not defined`)। শুরু থেকেই ছিল, আজ browser-এ চালিয়ে ধরা পড়ল। `plan.removeWithDesc` দিয়ে ঠিক। `app_source.test.js` এখন engine-এর function সরাসরি ডাকা আটকায়।

### Test
- Node: স্বাধীন সংখ্যা (ঠিক আপনার ঘটনা), এলোমেলো ৯০০০ ক্লিকে সূত্র (`choice ⇔ নিচে কিছু বাছা নেই`), গোটানো শাখার সংখ্যা, আর `app_source.test.js` (২টা)।

## ২০২৬-১০-১৮ (৮) — একটা-একটা খোলা, পথ-চেনা

### সমস্যা
সব node একে একে খুললে কোনটা কোন parent থেকে এসেছে বোঝা যেত না।

### পরিবর্তন
- **একটা-একটা খোলা (accordion):** একটা শাখা খুললে ভাইদের খোলাগুলো গোটে। খোঁজা, "বাকি সিদ্ধান্ত", "ধাপে যাও", বিকল্প বাছা (সন্তান নিজে খোলে), সবখানে একই নিয়ম। topbar-এ চালু/বন্ধ বোতাম (শুরুতে চালু, মনে থাকে); "সব খোলো" নিজে বন্ধ করে; খোঁজা চলতে কিছু গোটে না।
- **খোলা পথ হাইলাইট** (accent রেখা) আর **sticky breadcrumb** (প্রতিটা অংশ ক্লিকযোগ্য: ওই স্তরে ফেরা, নিচের সব গোটে; মোবাইলে আড়াআড়ি স্ক্রল)।
- **গোটানো শাখায় "✓ ২টা বাছা":** accordion গুটিয়ে দিলেও বাছাই লুকায় না।
- নতুন DOM-মুক্ত module `src/js/focus.js`: `siblingsToClose`, `planReveal`, `crumbs`, `pickedCounts`।

### Test
- Node (`focus.test.js`, ৫টা): শুধু খোলা শাখা-ভাই গোটে; পথের প্রতিটা স্তরে; এলোমেলো ৫০০০ খোলায় কোনো স্তরে দুই ভাই একসাথে খোলা থাকে না (৩ seed); breadcrumb গঠন-নাম বাদ, ক্রম ঠিক; `pickedCounts` ও `pickedUnder` এক। যুক্তি ভাঙলে test ব্যর্থ হয় (যাচাই করা)।
- Python (`PageSource`, ৩টা): template-এ id অনন্য, function দুবার ঘোষিত নয়, `app.js`-এর খোঁজা id template-এ আছে।
- browser-এ (Chromium) পুরো পথ চালানো: ১৯টা ধাপ পাস, console error ০; ৩৯০px-এ পাতা বেরোয় না।

### ভুল ধরা পড়ে
- প্রথম বাস্তবায়নে নতুন `renderCrumb` আর `id="crumb"` দুটোই dialog-এর পুরোনো breadcrumb-এর সাথে একই নাম ছিল: প্রতিটা ক্লিকে `Cannot read properties of undefined (reading 'trail')`। build ও Node test পাস করেছিল; ধরা পড়ল শুধু browser-এ চালিয়ে। নাম বদলানো হয়েছে (`renderFocusCrumb`, `focus-crumb`) আর `PageSource` test যোগ হয়েছে।

## ২০২৬-১০-১৮ (৭) — আবশ্যক/ঐচ্ছিক সিদ্ধান্ত, ডিফল্ট, "পড়ে বোঝো"

### পরিবর্তন
- **প্রতিটা সিদ্ধান্তে (৬৯টা) `need`:** ৩১টা আবশ্যক, ৩৮টা ঐচ্ছিক, প্রতিটার সাথে `needWhy` (কারণ, এক লাইনে)। গাছের সারিতে আর dialog-এ `আবশ্যক` / `ঐচ্ছিক` চিহ্ন, একটা/একাধিক চিহ্নের পাশে।
- **"বাকি সিদ্ধান্ত" শুধু আবশ্যক গোনে।** আগে সবই বাকি ধরা হতো, তাই tracking বা quantization-এর মতো ঐচ্ছিক জিনিসও বিরক্ত করত। ঐচ্ছিক এখন আলাদা "চাইলে ঠিক করো", আর পাশে "না বাছলে: …"।
- **ডিফল্ট (`defaultOption`), ৮টা decision:** SFT-র loss (শুধু উত্তরে), optimizer (AdamW), থামার নিয়ম (validation loss), একাধিক GPU (একটা), checkpoint নীতি (সেরা validation); শূন্য-থেকের নকলেও। না বাছলে pseudo-code-এ `‹সাধারণ মান›` চিহ্নে বসে, নিজে বাছলে চিহ্ন যায়। শুধু সেখানেই দেওয়া যেখানে বিকল্পের `when`-এ ডিফল্ট বলে প্রমাণ আছে।
- **`group`:** training চালানোর দুই উপায় ("সব-একসঙ্গে tool" আর "নিজে জুড়ে") একটাই চাহিদা; একটা বাছলে অন্যটা আর বাকি দেখায় না, অপূর্ণ থাকলে একটাই দেখায়।
- **"পড়ে বোঝো":** বিকল্পের পাশে মেশা ব্যাখ্যা-node (যেমন SFT-র Instruction Tuning, Loss Mask, Input ও Target, শেখার চক্র) এখন বিকল্পের নিচে আলাদা ভাঁজ-করা অংশে, "বাছতে হয় না, নিজে থেকেই আসে" লেখাসহ। খোঁজা, "সব খোলো" আর reveal-এ খোলে।
- **ছাঁচ (`pseudo.json`):** ঐচ্ছিক-ডিফল্ট-হীন slot (`engine`, `iterate`, `data_tool`) এখন `?`-লাইনে; অবাছা থাকলে ফাঁকা ‹? …› চিহ্নের বদলে লাইনটাই বাদ (data-র ক্ষেত্রে `load(your_dataset)`)।

### সীমা
- আবশ্যক/ঐচ্ছিকের তালিকা domain-বিচারে বানানো, স্বতন্ত্র যাচাইকারী ছাড়া; প্রতিটার কারণ `needWhy`-তে লেখা, ভুল লাগলে সেখানে বদলাও। বিচার-নির্ভর: `deploy-engine`, `eval-regress`, `hp-schedule`, `flash-impl`, `sc-norm`।

### Test
- Node (৬টা): বাকি-তালিকায় শুধু আবশ্যক, group, pseudo-র ডিফল্ট ও নিজে বাছলে চিহ্ন যাওয়া, SFT-র ডিফল্ট শুধু SFT বাছলে, `-sc`-তে ডিফল্ট, প্রতিটা `defaultOption` বৈধ।
- Python (`NeedAndDefaults`, ৫টা): প্রতিটা decision-এ need ও কারণ; `-sc` ভিত্তির সাথে মেলে; group-এ ≥২; default-এর pseudo-লেখা আছে; ছাঁচে সোজা-লাইনের slot-এ অন্তত একটা আবশ্যক বা default-সহ decision।

## ২০২৬-১০-১৮ (৬) — সব node-এর সংজ্ঞা নতুন করে লেখা

### পরিবর্তন
- **৮১৪টা node-এর `definition` নতুন করে লেখা:** আগে জিনিসটা কী সাধারণ কথায়, তারপর ছোট উদাহরণ; অচেনা শব্দ আগে ব্যাখ্যা; "কোর্সে আছে" বা মানচিত্রের নিজের কথা নেই। মাঝামাঝি দৈর্ঘ্য ৬১ → প্রায় ২৫৫ অক্ষর। শুধু `definition` বদলেছে (`map.json`-এ ৭৬৭, `shared.json`-এ ৪৭); গল্প, পাঠ, সূত্র, `kind`, id অক্ষত।
- বাদ ছিল: ৯৪টা তিন-ধরনের কপি আর ৫৬টা `ref`-ধার (মূল ঠিক হলে ঠিক হয়), ১৩টা "ধাপে যাও" বোতাম, ৩টা গোষ্ঠী, ৮টা আগের পালায় লেখা মাপকাঠি।
- **শূন্য-থেকে-train পথের নকল (`-sc`)** এখন ভিত্তি node-এর লেখাই দেখায়: একটাই সত্য-উৎস, দুই জায়গায় দুই রকম নয়।

- **হাতে চারটা সংশোধন (যাচাইয়ের পর আমার স্ক্যানে ধরা):** `Gradient ও Parameter Update` ও `Gradient Descent Update`-এ "gradient কোন দিকে গেলে loss কমে" ভুল (gradient বাড়ার দিক দেখায়, কমাতে উল্টো দিকে যেতে হয়); `Computational Graph`-এ "সামনে/পেছনে হেঁটে" রূপক; `Boosting`-এ "gradient বলে loss কোন দিকে কমে" ঢিলে। ভুলটা এসেছিল node-এর মূল গল্প ও insight-এর ভাষা থেকে। সেই গল্পের লেখা (`stories.json`) এই কাজে বদলানো হয়নি।

### কীভাবে যাচাই হয়েছে
- আগে Training-এর ৪৭ উপাদানে ছোট পরীক্ষা, হাতে পড়ে ও অঙ্ক মিলিয়ে; তারপর বাকিগুলো ১২ ভাগে।
- **প্রতিটা ভাগ আলাদা একজন যাচাইকারী আবার পড়েছে** (ভুল তথ্য, প্রসঙ্গের সাথে বিরোধ, অঙ্ক, অতি-দাবি, ফাঁপা লেখা)। ৮১৪টার মধ্যে ১৬১টা সংশোধিত হয়েছে। যেমন "প্রায় সব model-এ weighted sum চলে" (decision tree ও k-NN-এ নেই), "৩×৩ মানে ৯টা weight" (শুধু সাদা-কালোয়; রঙিনে ২৭), early stopping-এর উদাহরণে ভুল epoch।
- নিশ্চিত না হওয়া দাবি তুলে নিরাপদ সাধারণ কথা রাখা হয়েছে। প্রসঙ্গের অভাবে পাতলা থাকা: `tool-whisper-lib`, `tool-surya-ocr2`, `peft-which`। ৮১৪টার প্রতিটা এক ব্যক্তি পড়েনি; ভিত্তি হলো যান্ত্রিক যাচাই, স্বতন্ত্র যাচাইকারী আর নমুনা-পাঠ।

### Test
- `Definitions` (৪টা): প্রতিটা নিজের সংজ্ঞা ফাঁকা নয় ও বাংলা; দৈর্ঘ্য ৬০–৪৫০; "কোর্সে আছে"/Module/মানচিত্রের নিজের কথা নেই; `-sc` নকল ভিত্তির লেখাই নেয়।

## ২০২৬-১০-১৮ (৫) — তুলনা: কোন কয়টা, সূত্রের টীকা, পরিষ্কার সংজ্ঞা

### পরিবর্তন
- **তুলনার সংখ্যা ও বাছাই ব্যবহারকারীর হাতে:** শুরুর মান ৪; "একসাথে সর্বোচ্চ − ৪ +" (২ থেকে ৮, মনে থাকে)। ভরে গেলে নতুন chip চাপলে সবচেয়ে আগে বাছাটা সরে যায়; আগে হাতে বাদ দিতে হতো। নিয়ম pure ফাংশনে (`toggle`, `clampOrder`) ও test সহ। ৮টা বিকল্পের decision-এ আর ৪টায় আটকে থাকতে হয় না।
- **"তথ্যের ভিত্তি" সারি বাদ:** "কোর্সে আছে" পাঠকের কাজের তথ্য নয়; node-dialog থেকেও সরানো। শুধু আসল সূত্র/সতর্কতা (paper, tool-docs, "অভিজ্ঞতা-ভিত্তিক") টেবিলের শেষে টীকা হিসেবে।
- **মাপকাঠির ৮টা সংজ্ঞা নতুন করে লেখা** (Accuracy, Precision, Recall, F1, CER/WER, MSE/RMSE/MAE, Perplexity, BLEU/ROUGE): আগে জিনিসটা কী, তারপর ছোট উদাহরণ। প্রথম চারটা একই spam-filter গল্পে (২০টা mail: TP 8, FP 2, FN 4, TN 6), যাতে "ছোট হিসাব" সারির সংখ্যার সাথে হুবহু মেলে।
- মোবাইলে তুলনার ওপরের অংশ কমপ্যাক্ট: chip এক সারিতে স্ক্রল, টেবিল dialog-এর ৭৩% পায় (আগে ৪৯%)।

### পরিমাপ (বাকি কাজের জন্য)
- ৯৮৮টা node-এর ৬২৫টার সংজ্ঞা ৭০ অক্ষরের কম (মাঝামাঝি ৬১); তুলনায় আসে এমন ৭৭৬টার ৫০৯টা। এই কাজে শুধু ওই ৮টা ঠিক করা হয়েছে।

## ২০২৬-১০-১৮ (৪) — ভাই-শাখার তুলনা

### নতুন
- **তুলনা:** যেকোনো node-এর একই parent-এর ভাইদের (২ থেকে ৪টা) পাশাপাশি তুলনা। ২২৭টা parent-এ পাওয়া যায়। গাছের সারিতে "⇄ তুলনা" (hover/focus-এ) আর dialog-এ "ভাইদের সাথে তুলনা"। সারি নিজে তৈরি হয় (সংজ্ঞা, কখন/কেন/দাম, সূত্র, tool-এর তথ্য, ভেতরের গঠন, বাস্তবে…), ফাঁকা সারি বাদ; "শুধু ফারাক" ফিল্টার; কলাম থেকেই "পথে বাছো" ও "খোলো" (বন্ধ করলে তুলনায় ফেরে); শেয়ার-link `#cmp=…`। মোবাইলে sticky শিরোনাম ও প্রথম কলামসহ স্ক্রল।
- `src/js/compare.js` (DOM-মুক্ত যুক্তি) ও ৭টা Node test। `check.sh` এখন `tests/*.test.js` সব চালায়।

## ২০২৬-১০-১৮ (৩) — Training-এর উপাদান প্রতিটা ধরনের ভেতরে

### পরিবর্তন
- **Training শাখা:** আগে ১–১০ (Target … Learning Rate) বাইরে আলাদা পড়ে ছিল, আর ১১-তে তিন ধরন। এখন শাখার সরাসরি সন্তান শুধু তিন ধরন: From-scratch, Pretraining, Fine-tuning। প্রতিটার শেষে "Training-এর উপাদান" গোষ্ঠী; পড়তে পড়তে অন্য শাখায় যেতে হয় না।
- **`include` ব্যবস্থা** (`data/shared.json`, `build.expand_includes()`): উপাদানের লেখা একবারই, build-সময়ে তিন জায়গায় কপি; একটা ঠিক করলে সবখানে ঠিক (drift নেই)। node ৮৯২ → ৯৮৮। মূল id from-scratch-এর কপিতে, অন্য দুটো `-in-pt`, `-in-ft`।
- পুরোনো `#training-model` link `training`-এ যায় (alias)। "শূন্য থেকে, নাকি আগে শেখা model থেকে" গল্প Training-এর গল্পে মেলানো; বাস্তব-স্তর Training শাখায় সরানো।

### Test
- ৬টা নতুন test (`SharedIncludes`): তিন ধরনেই ১০টা উপাদান, নাম এক, id অনন্য, মূল id প্রথম কপিতে, কপি `info`, `include` চিহ্ন আউটপুটে নেই। test আর `verify_links.py` এখন ছড়ানো গাছ দেখে।

## ২০২৬-১০-১৮ (২) — বিরোধ-শনাক্ত ও লিংক-যাচাই

### নতুন
- **বিরোধ ও নির্ভরতা** (`data/rules.json`, `engine.issues()`): ১০টা নিয়ম, প্রতিটার সূত্র course-এর lecture বা paper। ডান-তালিকায় "সতর্কতা ও বিরোধ", pseudo-code ও Markdown-এও। test সহ।
- **`verify_links.py`:** সব বাইরের লিংক (১৩৫টা) জীবিত কি না; CI-তে সাপ্তাহিক।
- ছোট পর্দা (৩৭৫) যাচাই: তালিকা নিজে খোলে না, কোনো overflow নেই, ডায়ালগ ও pseudo-code আঁটে।

### সংশোধন
- বিকল্পের ঠিক নিচের tool (CER/WER → jiwer, merge → PEFT, paged optimizer → bitsandbytes) pseudo-code-এ আসত না; এখন `[tool: …]` হয়ে বিকল্পের লেখার সঙ্গে জোড়া।
- Gradient Descent-এর ইতিহাস-সূত্র (EMIS মূল সাইট ৫০৩ দিচ্ছিল) জীবিত mirror-এর PDF-এ সরানো; "October 18, 1847" PDF-এর লেখায় আবার মেলানো।

## ২০২৬-১০-১৮ — pseudo-code ও সার্বজনীনতা

### নতুন
- **Pseudo-code:** বাছা পথ থেকে framework-নিরপেক্ষ pseudo-code (Fine-tune ও শূন্য-থেকে-train দুই ছাঁচ)। অবাছা সিদ্ধান্ত `‹? …›` চিহ্নে। ডান-তালিকায় দেখা ও কপি। `data/pseudo.json`, `engine.pseudo()`।
- **সার্বজনীন বিকল্প (OCR-কেন্দ্রিকতা ঠেকাতে):** model-এর ধরনে ছবি-শ্রেণিবিন্যাস (ViT, ResNet-50) ও speech (Whisper small); data-format-এ ছবি+label, অডিও+transcript, ছক; মাপকাঠিতে MSE/RMSE/MAE, Perplexity, BLEU/ROUGE। সব tool Hugging Face API-তে মেলানো।
- **ছবি ও speech-এর training tool:** timm, torchvision, Whisper (সব GitHub API-তে মেলানো), যাতে tool-তালিকা শুধু LLM-মুখী না থাকে।
- **Test:** pseudo-র ১০টা নতুন test (সব সিদ্ধান্ত বাছলে কোনো অবাছা চিহ্ন থাকে না, -sc নকল, accumulation শাখা, সংকেত-ভেদে loss, ছাঁচ-চিহ্ন বাকি থাকে না) আর slot-মিলের data test।

### সংশোধন
- শূন্য-থেকে-train ছাঁচে 'implementation' সব architecture-এ অবাছা দেখাত (MLP/CNN/RNN-এ বাছার কিছু নেই); এখন ঐচ্ছিক লাইন।
- ছাঁচের ধাপ-শিরোনাম গাছের ধাপের সঙ্গে মেলানো।

## ২০২৬-১০-১৭ — production-grade ভিত্তি

### নতুন
- **বাছাই-গাছ ও "আমার পথ":** `kind` (step / decision / option / tool / info / stepref), `pick` (one / many)। Fine-tune ও শূন্য-থেকে-train দুই mode। ডান পাশে ক্রমানুযায়ী বাছাই, Markdown / JSON / লেখা / লিংক কপি।
- **বাছার কারণ বাধ্যতামূলক:** প্রতিটা option ও tool-এ `when`, `why` (কেন), `tradeoff` (দাম বা কখন এড়াবে), ঐচ্ছিক `how` (কীভাবে চালু করবে, সূত্রসহ)। `data/guidance.json`। না থাকলে build থামে।
- **tool-এর প্রমাণ-তথ্য:** repo, licence, archived, শেষ push, যাচাইয়ের তারিখ। `verify_tools.py` আবার মেলায়। tool-এ `owner` দেখায়; পথে Hugging Face-এর tool কয়টা তা জানায়।
- **বাছাই-যুক্তি আলাদা module** (`src/js/engine.js`, DOM-মুক্ত) আর Node test।
- **`check.sh`**, CI ফাইল, `aliases.json` (পুরোনো `#id` ও `#plan=` লিংক ভাঙে না)।
- **`info` কিনা স্পষ্ট:** গাছে "ব্যাখ্যা" চিপ; ডায়ালগে "এটা বাছার বিষয় নয়, কারণ…"।

### সংশোধন (অনুসন্ধানে ধরা পড়া)
- দুই স্তরে ধাপ ("ধাপের ভেতরে ধাপ"): ধারণা-গাছ আর সিদ্ধান্ত-গাছ এক হলো; নকল `opt-*` বাদ।
- `Hugging Face Hub` একা এক-বিকল্পের সিদ্ধান্ত ছিল; এখন "model-এর weight কোথা থেকে আনবে?" (Hub, নিজের checkpoint, ModelScope), আর Hub যে সেবা, tool নয় তা লেখা।
- Loss Mask শুধু ব্যাখ্যা হয়ে ছিল; এখন আসল সিদ্ধান্ত ("SFT-এ loss কোথায় গুনবে?")।
- ৭টা `many` সিদ্ধান্ত `one` হলো (ডিফল্ট একটা; একাধিক শুধু যেখানে সত্যিই জমা হয়)।
- গল্পের ২টা link-নামে Unicode-রূপের গরমিল (ড়/য়); test এখন মিশ্র রূপ ধরে।
- `pending` তালিকা info-মোড়কের ভেতরের সিদ্ধান্ত দেখত না; engine-এ ঠিক।
- ধাপে-যাওয়ার smooth scroll ভরসাযোগ্য ছিল না; সরাসরি scroll।
- ছোট পর্দায় তালিকা নিজে খুলে গাছ ঢেকে দিত; এখন খোলে না।
- `docs` ও `how` লিংক https কি না যাচাই হতো না; এখন build যাচাই করে।
- টাইপো ("ব্যবহার করেছি" → "করেছিল")।
