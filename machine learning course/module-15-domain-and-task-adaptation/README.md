# Module 15 — SFT, Domain Adaptation ও Continued Pretraining

[কেন্দ্রীয় map](../01-learning-map.md) · [Course outline](../00-course-outline.md) · [Lecture লেখার নিয়ম](../00-writing-style-guide.md)

## Status

লেখা প্রস্তুত; শেখা নয়। আটটা lecture লেখা হয়েছে এবং তাদের সংখ্যার হিসাব Python দিয়ে মেলানো হয়েছে। এগুলো পড়া ও অনুশীলন করা বাকি। কোনো training code এই module-এ চালানো হয়নি; ব্যবহৃত Python code শুধু standard library-র ছোট হিসাব। Lecture 04 ও 07-এর "model" আসল neural network নয়, গোনা-ভিত্তিক একটা খেলনা model, যা শুধু ধারণা দেখানোর জন্য।

## Prerequisites

Training loop ও token prediction ([Module 10](../module-10-neural-network-training/README.md) এবং [Module 12-এর Lecture 04](../module-12-text-sequences-and-multimodal-models/lecture-04-next-token-and-cross-entropy.md)), আর train/validation/test split ([Module 05](../module-05-data-preparation-and-splits/README.md))। আগে শেখানো model আরও শেখানোর পরিচয় [Module 13-এর Lecture 01–02](../module-13-pretraining-finetuning-and-lora/lecture-02-finetuning-methods-map.md)-এ।

## Lecture ক্রম

| ক্রম | Lecture | এক লাইনে |
|---|---|---|
| 01 | [Pretraining-এর লক্ষ্য ও checkpoint](lecture-01-pretraining-objective-and-checkpoint.md) | Base model কী শিখেছে, checkpoint-এর ভেতরে কী থাকে, কেন সেখান থেকে শুরু |
| 02 | [SFT ও instruction tuning](lecture-02-sft-and-instruction-tuning.md) | Input-output জোড়া, loss mask, ছোট সংখ্যায় masked cross-entropy |
| 03 | [Domain adaptation ও data selection](lecture-03-domain-adaptation-and-data-selection.md) | ঘাটতি চিনে উপায় বাছা, data বাছাইয়ের পাঁচ প্রশ্ন |
| 04 | [Continued pretraining: DAPT ও TAPT](lecture-04-continued-pretraining-dapt-tapt.md) | Label-হীন text-এ next-token লক্ষ্যে আরও training; SFT-র সঙ্গে ক্রম |
| 05 | [Multi-task ও multilingual tuning](lecture-05-multitask-and-multilingual-tuning.md) | Data mixture-এর sampling probability ও α |
| 06 | [Correction dataset ও hard examples](lecture-06-correction-dataset-and-hard-examples.md) | ভুল output ও verified correction থেকে SFT জোড়া; hard example-এর ঝুঁকি |
| 07 | [Forgetting ও evaluation](lecture-07-forgetting-and-evaluation.md) | ভুলে যাওয়া, leakage ও মুখস্থ করা মাপার নিয়ম |
| 08 | [Adaptation experiment](lecture-08-adaptation-experiment.md) | Base, CPT, SFT ও retrieval-এর তুলনার নকশা |

## কোন ক্রমে পড়বে

এক পথেই পড়ো: **01 → 02 → 03 → 04 → 05 → 06 → 07 → 08**। প্রতিটা lecture আগেরটার ওপর দাঁড়িয়ে। শুধু ছোট একটা শাখা আছে: Lecture 05 বাদ দিয়ে 04 থেকে 06-এ গেলেও চলে, কারণ data mixture শুধু একাধিক কাজ বা ভাষা থাকলে লাগে।

এই module-এর পর: [Module 16 — Preference ও DPO](../module-16-preference-learning-and-dpo/README.md)।
