# সহজ শব্দকোষ

কোনো শব্দ আটকে গেলে এখানে দেখো। প্রতিটা শব্দের এক লাইনের সহজ মানে আর কোন lecture-এ বিস্তারিত আছে তার link দেওয়া আছে। শব্দগুলো বিষয় অনুযায়ী সাজানো, বর্ণানুক্রমে নয়, যাতে একসঙ্গে সম্পর্কিত শব্দ পাশাপাশি পড়া যায়।

[Course Outline](00-course-outline.md) · [Learning Map](01-learning-map.md) · [লেখার নিয়ম](00-writing-style-guide.md)

## ১. ML-এর একদম গোড়া

| শব্দ | সহজ মানে | বিস্তারিত |
|---|---|---|
| **Model** | একটা নিয়ম বা হিসাব, যা input নিয়ে output দেয়। | [Module 09-01](module-09-model-architecture/lecture-01-input-computation-output.md) |
| **Feature** | model-কে দেওয়া তথ্যের একেকটা অংশ (যেমন বাড়ির আকার)। | [Module 01-02](module-01-ml-fundamentals-and-math-basics/lecture-02-types-and-terminology.md) |
| **Label / Target** | সঠিক উত্তর, যেটা model-কে শেখার সময় দেখানো হয়। | [Module 01-03](module-01-ml-fundamentals-and-math-basics/lecture-03-how-supervised-learning-works.md) |
| **Training** | model-এর ভেতরের মান বদলে বদলে তাকে ঠিক উত্তরের কাছে আনা। | [Module 01-03](module-01-ml-fundamentals-and-math-basics/lecture-03-how-supervised-learning-works.md) |
| **Prediction / Inference** | শেখা শেষে নতুন input থেকে output বের করা। এতে সঠিক উত্তর লাগে না। | [Module 09-01](module-09-model-architecture/lecture-01-input-computation-output.md) |
| **Supervised / Unsupervised / Reinforcement** | সঠিক উত্তর দেখে শেখা / উত্তর ছাড়া নিজে দল খোঁজা / চেষ্টা করে পুরস্কার দেখে শেখা। | [Module 01-02](module-01-ml-fundamentals-and-math-basics/lecture-02-types-and-terminology.md) |
| **Parameter (weight, bias)** | model-এর ভেতরের যে মানগুলো training-এ শেখা হয়। | [Module 09-02](module-09-model-architecture/lecture-02-parameters-and-hyperparameters.md) |
| **Hyperparameter** | আমরা হাতে ঠিক করে দেওয়া সেটিং (যেমন learning rate), যা model নিজে শেখে না। | [Module 09-02](module-09-model-architecture/lecture-02-parameters-and-hyperparameters.md) |
| **Loss** | model কতটা ভুল করছে তার একটা সংখ্যা। কম হলে ভালো। | [Module 02-02](module-02-linear-regression/lecture-02-error-and-mean-squared-error.md) |
| **MSE** | ভুলগুলোকে বর্গ করে গড় করা loss (সংখ্যা predict করার কাজে)। | [Module 02-02](module-02-linear-regression/lecture-02-error-and-mean-squared-error.md) |
| **Gradient descent** | loss যেদিকে কমে সেদিকে parameter ছোট ছোট ধাপে সরানো। | [Module 02-03](module-02-linear-regression/lecture-03-gradient-descent-training.md) |
| **Learning rate** | প্রতি ধাপে parameter কতটা সরবে, তার মাপ। | [Module 10-05](module-10-neural-network-training/lecture-05-optimizer-and-learning-rate.md) |
| **Dot product** | দুই তালিকার সংখ্যা জোড়ায় জোড়ায় গুণ করে যোগ করা। | [Module 04-02](module-04-math-foundations-practice/lecture-02-dot-product-and-matrix-multiplication.md) |
| **Vector / Matrix / Shape** | সংখ্যার সারি / সংখ্যার ছক / তার মাপ (কয় সারি, কয় কলাম)। | [Module 04-01](module-04-math-foundations-practice/lecture-01-vectors-matrices-and-shapes.md) |

## ২. Classification ও ভুল মাপা

| শব্দ | সহজ মানে | বিস্তারিত |
|---|---|---|
| **Sigmoid** | যেকোনো সংখ্যাকে ০ আর ১-এর মাঝে এনে probability বানায়। | [Module 03-01](module-03-logistic-regression/lecture-01-sigmoid.md) |
| **Threshold** | কত probability-র উপরে "হ্যাঁ" বলব, সেই সীমা। | [Module 03-02](module-03-logistic-regression/lecture-02-logistic-model-and-decision-boundary.md) |
| **Decision boundary** | যে জায়গায় model "হ্যাঁ" থেকে "না"-তে বদলায়। | [Module 03-02](module-03-logistic-regression/lecture-02-logistic-model-and-decision-boundary.md) |
| **Log loss** | সঠিক class-কে model যে probability দিয়েছে তার `−ln`; আত্মবিশ্বাসী ভুলে বেশি শাস্তি। | [Module 03-03](module-03-logistic-regression/lecture-03-log-loss.md) |
| **Accuracy / Precision / Recall / F1** | মোট কত ঠিক / "হ্যাঁ" বলা গুলোর কতটা ঠিক / আসল "হ্যাঁ"-র কতটা ধরেছে / precision-recall-এর ভারসাম্য। | [Module 06-03](module-06-model-evaluation-and-baselines/lecture-03-classification-metrics.md) |
| **MAE / RMSE / R²** | গড় ভুল / বর্গমূল-গড়-ভুল / baseline-এর চেয়ে কতটা ভালো। | [Module 06-02](module-06-model-evaluation-and-baselines/lecture-02-regression-metrics.md) |
| **Baseline** | খুব সহজ একটা উত্তর (যেমন সব সময় গড় বলা), যার চেয়ে ভালো না হলে model-এর দাম নেই। | [Module 06-01](module-06-model-evaluation-and-baselines/lecture-01-baselines.md) |

## ৩. Data আর সৎ পরীক্ষা

| শব্দ | সহজ মানে | বিস্তারিত |
|---|---|---|
| **Train / Validation / Test** | শেখার data / বাছাইয়ের data / শেষ পরীক্ষার data (একবারই)। | [Module 05-03](module-05-data-preparation-and-splits/lecture-03-train-validation-test-split.md) |
| **Data leakage** | পরীক্ষার তথ্য আগে থেকেই model-এর কাছে চলে যাওয়া, ফলে ফল মিথ্যে ভালো দেখায়। | [Module 05-04](module-05-data-preparation-and-splits/lecture-04-data-leakage.md) |
| **One-hot / Scaling / Standardization** | category-কে ০-১ সারিতে ভাঙা / সংখ্যার পরিসর মেলানো / গড় ০ ও ছড়ানো ১ করা। | [Module 05-02](module-05-data-preparation-and-splits/lecture-02-encoding-and-scaling.md) |
| **Cross-validation** | data কয়েক ভাগে ভেঙে পালা করে পরীক্ষা করা। | [Module 06-05](module-06-model-evaluation-and-baselines/lecture-05-cross-validation-and-final-test.md) |
| **Underfitting / Overfitting** | model খুব সহজ বলে শেখেনি / training data মুখস্থ করে নতুন data-য় ভুল করছে। | [Module 07-01](module-07-generalization-and-overfitting/lecture-01-underfitting-and-overfitting.md) |
| **Regularization / Early stopping** | model-কে বেশি জটিল হতে না দেওয়া / validation খারাপ হওয়ার আগে training থামানো। | [Module 07-03](module-07-generalization-and-overfitting/lecture-03-regularization-and-early-stopping.md) |
| **Learning curve / Error analysis** | data বাড়ালে ফল কীভাবে বদলায় তার রেখা / কোন ধরনের ভুল হচ্ছে তা খুঁটিয়ে দেখা। | [Module 07-04](module-07-generalization-and-overfitting/lecture-04-learning-curves-and-error-analysis.md) |

## ৪. Neural network-এর গঠন ও শেখা

| শব্দ | সহজ মানে | বিস্তারিত |
|---|---|---|
| **Unit / Neuron** | weighted sum + bias করে একটা সংখ্যা (score) বানানো ছোট হিসাবের একক। | [Module 09-03](module-09-model-architecture/lecture-03-one-neuron.md) |
| **Activation (ReLU, sigmoid)** | score-কে বদলে দেওয়া ধাপ, যা network-এ "বাঁক" আনে। | [Module 09-04](module-09-model-architecture/lecture-04-activation.md) |
| **Layer / Hidden layer** | পাশাপাশি অনেক unit; মাঝের layer-কে hidden বলে। | [Module 09-05](module-09-model-architecture/lecture-05-hidden-layer.md) |
| **Forward pass** | input থেকে output পর্যন্ত পুরো হিসাব। | [Module 09-06](module-09-model-architecture/lecture-06-forward-pass.md) |
| **Architecture** | কোন layer কেমন করে সাজানো, তার নকশা (মান নয়)। | [Module 09-08](module-09-model-architecture/lecture-08-architecture-vs-training.md) |
| **Derivative / Gradient** | একটা মান সামান্য বদলালে ফল কতটা বদলায় / সব parameter-এর ওই হিসাব একসঙ্গে। | [Module 10-02](module-10-neural-network-training/lecture-02-derivative-to-gradient.md) |
| **Chain rule** | পরপর কয়েক ধাপের প্রভাব গুণ করে যোগ করার নিয়ম। | [Module 10-03](module-10-neural-network-training/lecture-03-chain-rule.md) |
| **Backpropagation** | loss থেকে পেছনের দিকে হেঁটে সব parameter-এর gradient বের করা। | [Module 10-04](module-10-neural-network-training/lecture-04-backpropagation.md) |
| **Optimizer (momentum, Adam)** | gradient দিয়ে parameter কীভাবে সরবে, তার কৌশল। | [Module 10-05](module-10-neural-network-training/lecture-05-optimizer-and-learning-rate.md) |
| **Batch / Step / Epoch** | একসঙ্গে ধরা উদাহরণ / একবার parameter বদল / সব data একবার দেখা। | [Module 10-06](module-10-neural-network-training/lecture-06-batch-step-and-epoch.md) |

## ৫. ছবি ও লেখা

| শব্দ | সহজ মানে | বিস্তারিত |
|---|---|---|
| **Pixel / Channel** | ছবির ক্ষুদ্রতম বিন্দুর সংখ্যা / রঙের স্তর (লাল, সবুজ, নীল)। | [Module 11-01](module-11-image-representation-and-vision/lecture-01-pixel-and-channel.md) |
| **Tensor** | যেকোনো মাপের সংখ্যার ছক (ছবির জন্য সাধারণত উচ্চতা × প্রস্থ × channel)। | [Module 11-02](module-11-image-representation-and-vision/lecture-02-image-shape-and-tensor.md) |
| **Convolution / Filter / Feature map** | ছোট জানালা ছবির উপর সরিয়ে প্যাটার্ন খোঁজা / ওই জানালা / তার ফল। | [Module 11-03](module-11-image-representation-and-vision/lecture-03-local-pattern-and-convolution.md) |
| **Patch embedding** | ছবি টুকরো করে প্রতি টুকরোকে একটা vector বানানো। | [Module 11-05](module-11-image-representation-and-vision/lecture-05-patches-and-patch-embedding.md) |
| **Encoder** | ছবি বা লেখাকে কাজের উপযোগী একটা representation-এ বদলানো অংশ। | [Module 11-06](module-11-image-representation-and-vision/lecture-06-encoder.md) |
| **Token / Tokenizer** | লেখার ছোট টুকরো / লেখাকে টুকরো করে id দেওয়ার নিয়ম। | [Module 12-01](module-12-text-sequences-and-multimodal-models/lecture-01-token-and-tokenizer.md) |
| **Embedding** | token id-কে শেখার মতো একটা vector বানানো (lookup table)। | [Module 12-02](module-12-text-sequences-and-multimodal-models/lecture-02-embedding.md) |
| **Logits / Softmax** | শেষ ধাপের কাঁচা score / score-কে probability-তে বদলানো। | [Module 12-03](module-12-text-sequences-and-multimodal-models/lecture-03-logits-and-softmax.md) |
| **Cross-entropy** | পরের token-এর জন্য সঠিক উত্তরকে model কত probability দিল, তার ভিত্তিতে ভুল মাপা। | [Module 12-04](module-12-text-sequences-and-multimodal-models/lecture-04-next-token-and-cross-entropy.md) |
| **Attention (query, key, value)** | কোন আগের token-এর দিকে কতটা নজর দেব, তার হিসাব। | [Module 12-05](module-12-text-sequences-and-multimodal-models/lecture-05-context-and-attention.md) |
| **Transformer block** | attention + feed-forward + residual + normalization-এর একটা এককে। | [Module 12-06](module-12-text-sequences-and-multimodal-models/lecture-06-transformer-block.md) |
| **Autoregressive** | একটা একটা করে token তৈরি করা, প্রতিটা আগেরগুলোর উপর ভিত্তি করে। | [Module 12-07](module-12-text-sequences-and-multimodal-models/lecture-07-autoregressive-decoder-and-stopping.md) |

## ৬. Fine-tuning ও LoRA

| শব্দ | সহজ মানে | বিস্তারিত |
|---|---|---|
| **Pretraining / Fine-tuning** | বিশাল data-য় আগে শেখানো / সেই model-কে নির্দিষ্ট কাজে আবার শেখানো। | [Module 13-01](module-13-pretraining-finetuning-and-lora/lecture-01-training-and-finetuning.md) |
| **PEFT** | model-এর খুব অল্প অংশ শিখিয়ে adapt করার পদ্ধতির পরিবার। | [Module 13-02](module-13-pretraining-finetuning-and-lora/lecture-02-finetuning-methods-map.md) |
| **LoRA (A, B, rank, alpha)** | মূল weight স্থির রেখে দুটো ছোট matrix (A, B) শিখে আলাদা পরিবর্তন যোগ করা। | [Module 13-04](module-13-pretraining-finetuning-and-lora/lecture-04-lora-matrix-pairs-and-effective-weights.md) |
| **Frozen** | যে parameter training-এ বদলায় না (কিন্তু হিসাবে অংশ নেয়)। | [Module 13-04](module-13-pretraining-finetuning-and-lora/lecture-04-lora-matrix-pairs-and-effective-weights.md) |
| **Quantization** | সংখ্যা কম bit-এ রেখে জায়গা বাঁচানো (সামান্য আনুমানিক)। | [Module 13-05](module-13-pretraining-finetuning-and-lora/lecture-05-quantization-and-qlora.md) |
| **QLoRA / NF4** | quantize করা মূল model-এর উপর LoRA শেখানো / 4-bit সংখ্যার এক বিশেষ ধরন। | [Module 13-10](module-13-pretraining-finetuning-and-lora/lecture-10-precision-nf4-and-qlora-practice.md) |
| **Merge** | শেখা LoRA পরিবর্তন মূল weight-এর সঙ্গে জুড়ে একটাই model বানানো। | [Module 13-09](module-13-pretraining-finetuning-and-lora/lecture-09-merge-save-load.md) |

## ৭. SFT, preference, RL, distillation

| শব্দ | সহজ মানে | বিস্তারিত |
|---|---|---|
| **SFT** | (প্রশ্ন, সঠিক উত্তর) জোড়া দেখিয়ে model-কে শেখানো। | [Module 15-02](module-15-domain-and-task-adaptation/lecture-02-sft-and-instruction-tuning.md) |
| **Loss mask** | লেখার কোন অংশের উপর loss ধরব আর কোনটা বাদ দেব, তার চিহ্ন। | [Module 15-02](module-15-domain-and-task-adaptation/lecture-02-sft-and-instruction-tuning.md) |
| **Continued pretraining (DAPT/TAPT)** | নির্দিষ্ট ক্ষেত্র বা কাজের লেখায় pretraining চালিয়ে যাওয়া। | [Module 15-04](module-15-domain-and-task-adaptation/lecture-04-continued-pretraining-dapt-tapt.md) |
| **Catastrophic forgetting** | নতুন কিছু শেখাতে গিয়ে পুরনো ক্ষমতা ভুলে যাওয়া। | [Module 15-07](module-15-domain-and-task-adaptation/lecture-07-forgetting-and-evaluation.md) |
| **Preference pair (chosen/rejected)** | একই প্রশ্নের দুই উত্তর, যার একটাকে মানুষ ভালো বলেছে। | [Module 16-01](module-16-preference-learning-and-dpo/lecture-01-preference-data.md) |
| **Policy / Reference model** | যে model শিখছে / তুলনার জন্য স্থির রাখা আগের কপি। | [Module 16-03](module-16-preference-learning-and-dpo/lecture-03-reference-model-and-policy.md) |
| **DPO** | preference pair থেকে সরাসরি শেখা, আলাদা reward model বা rollout ছাড়া। | [Module 16-04](module-16-preference-learning-and-dpo/lecture-04-dpo-objective-by-hand.md) |
| **Reward / Return** | একটা কাজের পুরস্কার-সংখ্যা / সময়ের সঙ্গে জমা হওয়া মোট পুরস্কার। | [Module 17-02](module-17-reinforcement-learning-and-feedback/lecture-02-agent-environment-state-action-reward.md) |
| **Q-learning / Policy gradient / PPO** | কাজের মূল্য শেখা / সরাসরি আচরণ-সম্ভাবনা বদলানো / বড় লাফ আটকে স্থিরভাবে শেখা। | [Module 17-04](module-17-reinforcement-learning-and-feedback/lecture-04-policy-value-and-q-learning.md) |
| **RLHF / RLAIF / RLVR** | মানুষের / AI-র / যাচাইযোগ্য নিয়মের feedback দিয়ে শেখানো। | [Module 17-09](module-17-reinforcement-learning-and-feedback/lecture-09-rlhf-and-reward-modeling.md) |
| **GRPO** | একই প্রশ্নের কয়েকটা উত্তরের reward গড়ের সঙ্গে তুলনা করে শেখা। | [Module 17-11](module-17-reinforcement-learning-and-feedback/lecture-11-rlvr-and-grpo.md) |
| **Reward hacking** | আসল উদ্দেশ্য বাদ দিয়ে reward-এর ফাঁক গলিয়ে বেশি নম্বর পাওয়া। | [Module 17-15](module-17-reinforcement-learning-and-feedback/lecture-15-reward-hacking-and-generalization.md) |
| **Distillation (teacher/student)** | বড় বা ভালো model-এর আচরণ থেকে আরেকটা model-কে শেখানো। | [Module 18-01](module-18-knowledge-distillation/lecture-01-teacher-and-student.md) |
| **Soft target / Temperature / KL** | teacher-এর নরম probability / softmax কতটা নরম হবে তার সেটিং / দুই probability-র পার্থক্য মাপা। | [Module 18-03](module-18-knowledge-distillation/lecture-03-logits-temperature-soft-targets.md) |

## ৮. OCR ও মূল্যায়ন

| শব্দ | সহজ মানে | বিস্তারিত |
|---|---|---|
| **OCR** | ছবির লেখা পড়ে text বানানো। | [Module 14-01](module-14-ocr-system-case-study/lecture-01-ocr-project-architecture-and-lora.md) |
| **CER / WER** | অক্ষরে / শব্দে কত শতাংশ ভুল। | [Module 14-08](module-14-ocr-system-case-study/lecture-08-cer-wer-and-version-comparison.md) |
