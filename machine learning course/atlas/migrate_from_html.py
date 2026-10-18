#!/usr/bin/env python3
"""একবারের migration: ../ml-mapping.html থেকে data বের করে data/map.json বানায়।

করে যা যা:
  1. HTML-এর `const data={...}` অংশ JSON হিসেবে পড়ে (HTML ফাইল বদলায় না)।
  2. শাখা সাজায়: ০ ভিত্তির শব্দ, ১ Task, ২ Learning Setting, ৩ Model, ৪ Training, ৫ Evaluation, ৬ Application।
     (আগে ৩ ও ৪ নম্বর ছিল না; Training ছিল Learning Setting-এর ভেতরে "Training-এর সাধারণ ভিত্তি" নামে।)
  3. প্রতিটা node-এ স্থির `id` বসায় (deep link ও পাঠের link-এর জন্য)।
  4. ml-mapping.html-এর favicon src/favicon.txt-এ রাখে।

আবার চালালে data/map.json নতুন করে লেখা হবে, তাই map.json হাতে বদলে থাকলে চালিও না।
"""
import hashlib
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC_HTML = HERE.parent / "ml-mapping.html"
OUT = HERE / "data" / "map.json"

BRANCH_IDS = {
    "ভিত্তির শব্দ": "basics",
    "১. Task": "task",
    "২. Learning Setting": "setting",
    "Model →": "model",
    "৫. Evaluation": "evaluation",
    "৬. Application": "application",
}


def load_tree():
    for line in SRC_HTML.read_text(encoding="utf-8").split("\n"):
        m = re.match(r"\s*const data\s*=\s*", line)
        if m:
            return json.loads(line[m.end():].rstrip().rstrip(";"))
    sys.exit("`const data=` লাইন পাওয়া যায়নি")


def find(node, name):
    if node["name"] == name:
        return node
    for c in node.get("children") or []:
        r = find(c, name)
        if r:
            return r
    return None


# শুধু-বাংলা নামের জন্য পড়ার যোগ্য ASCII id
BN_SLUG = {
    "গঠন ও হিসাব": "structure",
    "ধরন": "kinds",
    "প্রচলিত অতিরিক্ত অংশ": "common-extras",
    "প্রয়োজন অনুযায়ী সহায়ক অংশ": "helpers",
    "বিন্যাস অনুযায়ী": "arrangement",
    "সাধারণ গঠন": "general-structure",
}


def slug(name):
    if name in BN_SLUG:
        return BN_SLUG[name]
    parts = re.findall(r"[A-Za-z0-9]+", name)
    return "-".join(p.lower() for p in parts)


def restructure(root):
    by_prefix = {}
    for c in root["children"]:
        for prefix, bid in BRANCH_IDS.items():
            if c["name"].startswith(prefix):
                by_prefix[bid] = c
    assert len(by_prefix) == 6, sorted(by_prefix)

    setting = by_prefix["setting"]
    wrapper = find(setting, "Training-এর সাধারণ ভিত্তি")
    assert wrapper, "Training-এর সাধারণ ভিত্তি node নেই"
    setting["children"] = [c for c in setting["children"] if c is not wrapper]

    training = {
        "name": "৪. Training — Model কীভাবে শেখে?",
        "definition": (
            "Data বা feedback ব্যবহার করে model-এর আচরণ শেখানো বা উন্নত করার প্রক্রিয়া। "
            "Inference-এ output বের হয়, loss শেখার লক্ষ্য মাপে, update-এ parameters বদলায়: এই তিনটা আলাদা কাজ। "
            "সব model একই loss বা update algorithm ব্যবহার করে না।"
        ),
        "children": wrapper["children"],
    }
    if "insight" in wrapper:  # আগের node-এর insight হারাতে দিই না
        training["insight"] = wrapper["insight"]
    by_prefix["basics"]["name"] = "০. ভিত্তির শব্দ"
    by_prefix["model"]["name"] = "৩. Model — ধরন → ভেতরের অংশ"

    root["children"] = [
        by_prefix["basics"], by_prefix["task"], by_prefix["setting"],
        by_prefix["model"], training, by_prefix["evaluation"], by_prefix["application"],
    ]
    root["definition"] = (
        "ML-কে ছয়টা দিক থেকে দেখার মানচিত্র: কী কাজ (১), শেখার তথ্য কোথা থেকে আসে (২), "
        "কোন model ও তার ভেতরের অংশ (৩), কীভাবে শেখে (৪), কতটা কাজে লাগে (৫), কোথায় ব্যবহার করি (৬)। "
        "০-তে ভিত্তির শব্দ। একই component একাধিক model-এ থাকতে পারে।"
    )


def assign_ids(root):
    """প্রথমে branch id, তারপর বাকি node। একই নামের একাধিক node-এর সবাই প্রসঙ্গসহ id পায়।"""
    names = {}

    def count(n):
        names[n["name"]] = names.get(n["name"], 0) + 1
        for c in n.get("children") or []:
            count(c)

    count(root)
    branch_ids = ["basics", "task", "setting", "model", "training", "evaluation", "application"]
    branch_by_name = {c["name"]: bid for c, bid in zip(root["children"], branch_ids)}
    used = set(branch_ids) | {"ml"}  # শাখার id আগে থেকেই সংরক্ষিত

    def walk(n, parent_id):
        if n is root:
            nid = "ml"
        elif n["name"] in branch_by_name and parent_id == "ml":
            nid = branch_by_name[n["name"]]
        else:
            base = slug(n["name"]) or "n-" + hashlib.sha1(n["name"].encode()).hexdigest()[:6]
            nid = base
            if names[n["name"]] > 1 or base in used:  # একই নাম বা সংঘর্ষ হলে প্রসঙ্গসহ id
                nid = f"{parent_id}--{base}"
            k, cand = 2, nid
            while cand in used:
                cand = f"{nid}-{k}"
                k += 1
            nid = cand
        used.add(nid)
        n["id"] = nid
        for c in n.get("children") or []:
            walk(c, nid)

    walk(root, None)


def ordered(n):
    keys = ["id", "name", "definition"]
    out = {k: n[k] for k in keys}
    for k, v in n.items():
        if k not in keys and k != "children":
            out[k] = v
    if n.get("children"):
        out["children"] = [ordered(c) for c in n["children"]]
    return out


def main():
    # একবারের কাজ ছিল। map.json এখন আসল উৎস (হাতে-বাড়ানো সব নিয়ে); আবার চালালে তা মুছে নতুন করে লেখা হবে।
    if OUT.exists() and "--force" not in sys.argv:
        sys.exit("থামলাম: data/map.json আছে এবং এটাই এখন মূল উৎস। সত্যিই নতুন করে লিখতে চাইলে --force দাও (আগে git commit করে রাখো)।")
    html = SRC_HTML.read_text(encoding="utf-8")
    root = load_tree()
    restructure(root)
    assign_ids(root)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(ordered(root), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    fav = re.search(r'<link rel="icon"[^>]*href="([^"]+)"', html)
    (HERE / "src").mkdir(exist_ok=True)
    if fav:
        (HERE / "src" / "favicon.txt").write_text(fav.group(1), encoding="utf-8")
    print("লেখা হয়েছে:", OUT.relative_to(HERE.parent))


if __name__ == "__main__":
    main()
