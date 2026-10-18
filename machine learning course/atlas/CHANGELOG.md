# Changelog — ML Learning Atlas

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
