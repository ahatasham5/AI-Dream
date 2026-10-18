# Lecture 06 — LoRA Config ও Parameter Count

> আগে যা জানা থাকলে ভালো: [LoRA-র A ও B](../module-13-pretraining-finetuning-and-lora/lecture-04-lora-matrix-pairs-and-effective-weights.md) আর [Shape ও parameter count](../module-09-model-architecture/lecture-07-shapes-and-parameter-count.md)। এই lecture শেষে পারবে: LoRA config (rank, target module) দেখে adapter-এর parameter গুনতে, আর বলতে version বদলালে সংখ্যা কেন বদলায়।
> তথ্যের উৎস: `ocr-benchmark/surya_finetune/train_lora.py` (`LoraConfig`), `ocr-benchmark/surya_finetune/lora_out_v19/final_lora_adapter/adapter_config.json` ও `adapter_model.safetensors`-এর header, `ocr-benchmark/docs/HISTORY_bn.md` (২ নং অংশের table), base model-এর `config.json` (Hugging Face cache)।

## সমস্যাটা কী?

HISTORY-তে লেখা: v19-এর trainable parameter 190,382,080। এই সংখ্যা কোথা থেকে এল? আর v3-তে ছিল 74,711,040, v4-এ 95,191,040। সংখ্যা মুখস্থ না করে config দেখে নিজে বের করতে পারলে দুটো লাভ: সংখ্যা বিশ্বাসযোগ্য হয়, আর কোনো config চুপচাপ ভুল হলে সংখ্যা মিলে না গিয়ে ধরা পড়ে।

## ধারণাটা সহজ ভাষায়

[Module 13](../module-13-pretraining-finetuning-and-lora/lecture-04-lora-matrix-pairs-and-effective-weights.md)-এর নিয়ম: একটা matrix-এর ইনপুট `d_in`, আউটপুট `d_out`, rank `r` হলে LoRA-র জোড়া A (`r × d_in`) আর B (`d_out × r`)। Parameter:

**`r × (d_in + d_out)`**

Project-এর config (`train_lora.py` আর `adapter_config.json`):

- `r = 256`, `lora_alpha = 512`, dropout 0.05। Scaling `alpha ÷ r = 2`।
- ছবি-অংশের জন্য আলাদা `rank_pattern` বসানো যায়; v19-এ সেখানেও 256।
- Target module নাম: ভাষা-অংশে `q_proj, k_proj, v_proj, o_proj, in_proj_qkv, out_proj, gate_proj, up_proj, down_proj`; ছবি-অংশে `qkv, proj, linear_fc1, linear_fc2`। PEFT নাম মিলিয়ে যে matrix পায়, সেখানেই adapter বসায়।

ভাষা-অংশের 6টা layer-এ `q, k, v, o` আছে, 18টায় `in_proj_qkv` ও `out_proj`, আর সব 24টায় MLP-র তিনটা। Adapter file দেখে নিশ্চিত হয়েছি: layer 0–23 ও vision block 0–11 সবখানে adapter আছে, মোট 366টা tensor। (নামের `proj` ছবির `patch_embed.proj`-এও মিলে গেছে, তাই সেখানেও adapter বসেছে।)

## ছোট একটা উদাহরণ

একটা matrix: `q_proj`, 1,024 থেকে 4,096। A: 256 × 1,024 = 262,144। B: 4,096 × 256 = 1,048,576। যোগ 1,310,720। মূল matrix 1,024 × 4,096 = 4,194,304। অর্থাৎ rank 256 হওয়ায় adapter এখানে মূল matrix-এর প্রায় ৩১% (31.25%)। সাধারণ উদাহরণের `r = 8`-এর চেয়ে এটা অনেক বড় adapter।

এভাবে সব matrix যোগ করলে:

| অংশ | হিসাব | Parameter |
|---|---|---|
| ভাষা: full-attention (q, k, v, o) | 2,883,584 × 6 layer | 17,301,504 |
| ভাষা: linear-attention (in_proj_qkv, out_proj) | 2,621,440 × 18 layer | 47,185,920 |
| ভাষা: MLP (gate, up, down) | 3,538,944 × 24 layer | 84,934,656 |
| **ভাষা মোট** | | **149,422,080** |
| ছবি: 12 block | 3,145,728 × 12 | 37,748,736 |
| ছবি: merger | | 2,621,440 |
| ছবি: patch_embed | | 589,824 |
| **ছবি মোট** | | **40,960,000** |
| **সব মিলে** | | **190,382,080** |

```python
def lora(d_in, d_out, r):
    return r * (d_in + d_out)            # A: r x d_in, B: d_out x r

r = 256
print(lora(1024, 4096, r), 1024 * 4096)   # q_proj-এর adapter বনাম মূল matrix

full_attn   = [(1024, 4096), (1024, 512), (1024, 512), (2048, 1024)]   # q, k, v, o
linear_attn = [(1024, 6144), (2048, 1024)]                             # in_proj_qkv, out_proj
mlp         = [(1024, 3584), (1024, 3584), (3584, 1024)]               # gate, up, down
vis_block   = [(768, 2304), (768, 768), (768, 3072), (3072, 768)]      # qkv, proj, fc1, fc2
vis_other   = [(3072, 3072), (3072, 1024), (1536, 768)]                # merger fc1, fc2, patch_embed

def total(mats, r):
    return sum(lora(i, o, r) for i, o in mats)

def adapter(r_lm, r_vis):
    lm = 6 * total(full_attn, r_lm) + 18 * total(linear_attn, r_lm) + 24 * total(mlp, r_lm)
    vis = (12 * total(vis_block, r_vis) + total(vis_other, r_vis)) if r_vis else 0
    return lm, vis

lm, vis = adapter(256, 256)
print(lm, vis, lm + vis)
# output:
# 1310720 4194304
# 149422080 40960000 190382080
```

Matrix-এর মাপ (1,024, 4,096, 3,584 ইত্যাদি) base model-এর `config.json` আর adapter-এর tensor shape থেকে নেওয়া।

**Adapter file থেকে সরাসরি গুনে মেলানো।** `.safetensors` file-এর শুরুতে একটা JSON header থাকে, তাতে প্রতিটা tensor-এর shape লেখা। শুধু সেই header পড়লেই হয়, 761 MB পুরো file পড়তে হয় না:

```python
import json, math, struct

# নিজের machine-এর পুরো path বসাও
path = "ocr-benchmark/surya_finetune/lora_out_v19/final_lora_adapter/adapter_model.safetensors"
with open(path, "rb") as f:
    n = struct.unpack("<Q", f.read(8))[0]       # প্রথম 8 byte: header-এর দৈর্ঘ্য
    header = json.loads(f.read(n))
header.pop("__metadata__", None)
print(len(header), sum(math.prod(t["shape"]) for t in header.values()))
# output:
# 366 190382080
```

366টা tensor, মোট 190,382,080: হাতের হিসাবের সঙ্গে হুবহু মিলেছে। প্রতিটা সংখ্যা 4 byte (fp32), তাই 190,382,080 × 4 = 761,528,320 byte, যা file-এর আকার 761,582,552 byte-এর প্রায় সমান (বাকিটা header)।

## Version বদলালে সংখ্যা কেন বদলায়

একই সূত্রে পুরনো সংখ্যাগুলোও বের হয়। শুধু rank আর target বদলে দিলেই হয়:

| Version | ভাষা-অংশের rank | ছবি-অংশের rank | Parameter |
|---|---|---|---|
| v3 | 128 | নেই (adapter নেই) | 74,711,040 |
| v4 | 128 | 128 | 95,191,040 |
| v6–v11 | 128 | 256 | 115,671,040 |
| v14–v19 | 256 | 256 | 190,382,080 |

প্রতিটা সংখ্যা HISTORY-র table-এর সঙ্গে মেলে। তিনটা শিক্ষা:

- v3 থেকে v4: নতুন data নয়, **ছবি-অংশে adapter বসানো** সংখ্যা বাড়িয়েছে।
- v14-এ ভাষা-অংশের **rank** 128 থেকে 256 হয়েছে। Parameter rank-এর সঙ্গে সরলরেখায় বাড়ে: rank 16 হলে একই জায়গায় 11,898,880, ঠিক 256-র 16 ভাগের এক ভাগ।
- একই config-এ আরও data দিলে সংখ্যা বদলায় না; শুধু matrix-এর মান বদলায়।

**সংখ্যা এখানে checksum।** HISTORY অনুযায়ী v12-এ training command-এ ছবি-অংশের rank-এর flag দিতে ভোলা হয়েছিল, তাই সেটা চুপচাপ ভাষা-অংশের 128-এ নেমে গিয়েছিল। কোনো error বা warning আসেনি। Adapter config আর parameter count (95,191,040, যা v4-এর সংখ্যা) পাশাপাশি রেখে দেখেই ধরা পড়ে। উপরের table অনুযায়ী 115,671,040 আশা করা হচ্ছিল।

## তিনটা সংখ্যা আলাদা রাখো

- **Base:** 665,701,440, frozen।
- **Trainable:** 190,382,080, শুধু adapter।
- **Total:** 856,083,520। এর 22.24% trainable।

Adapter merge করলে আলাদা branch থাকে না, মূল matrix-এর shape-ই থাকে ([Module 13, Lecture 09](../module-13-pretraining-finetuning-and-lora/lecture-09-merge-save-load.md))।

## আগের পাঠের ধারণা এখানে কোথায়

| ধারণা | আগের পাঠ | এই project-এ |
|---|---|---|
| Parameter count সূত্র | [Module 09, Lecture 07](../module-09-model-architecture/lecture-07-shapes-and-parameter-count.md) | `r × (d_in + d_out)` |
| Parameter বনাম hyperparameter | [Module 09, Lecture 02](../module-09-model-architecture/lecture-02-parameters-and-hyperparameters.md) | rank, alpha, dropout hyperparameter; A, B-র মান parameter |
| LoRA-র A ও B | [Module 13, Lecture 04](../module-13-pretraining-finetuning-and-lora/lecture-04-lora-matrix-pairs-and-effective-weights.md) | 366টা tensor = 183 জোড়া A, B |
| Rank, alpha, dropout | [Module 13, Lecture 07](../module-13-pretraining-finetuning-and-lora/lecture-07-lora-rank-alpha-init-dropout.md) | r = 256, alpha = 512, dropout 0.05 |
| Target বাছাই ও memory | [Module 13, Lecture 08](../module-13-pretraining-finetuning-and-lora/lecture-08-target-selection-gradient-and-memory.md) | Module-এর নাম ধরে 13টা নাম |

## মনে রাখার সারকথা

- একটা matrix-এর adapter parameter = `r × (d_in + d_out)`; সব target matrix যোগ করলে মোট।
- v19: ভাষা 149,422,080 + ছবি 40,960,000 = 190,382,080, adapter file-এর header থেকেও একই।
- Rank বা target বদলালে সংখ্যা বদলায়; data বদলালে নয়। সংখ্যা মিলিয়ে দেখলে চুপচাপ config-ভুল ধরা পড়ে।

## নিজে করো

১. `k_proj` 1,024 থেকে 512, rank 256: adapter parameter কত?
২. একই matrix-এ rank 128 হলে?
৩. v3-এ 74,711,040 কেন, v19-এর ভাষা-অংশ 149,422,080 হলে?

<details><summary>উত্তর</summary>

১. 256 × (1,024 + 512) = 256 × 1,536 = **393,216**।
২. 128 × 1,536 = **196,608**, অর্থাৎ অর্ধেক।
৩. v3-এ শুধু ভাষা-অংশে adapter ছিল, rank 128। Rank অর্ধেক মানে parameter অর্ধেক: 149,422,080 ÷ 2 = **74,711,040**।

</details>

## পরের পাঠ

Adapter-এর সংখ্যা জানা হলো। এবার দেখব model যা লেখে তা final লেখা হতে কোন কোন ধাপ পার হয়, আর ভুল কোথা থেকে আসে: [Lecture 07 — Output Formatting ও Error-এর উৎস](lecture-07-output-formatting-and-error-sources.md)।
