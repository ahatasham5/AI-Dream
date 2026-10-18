#!/usr/bin/env python3
"""ml-mapping.html-এ হাতে যোগ করা node-গুলো data/map.json-এ মিলিয়ে নেয়।

নিয়ম:
  * শুধু যা map.json-এ নেই (পথ ধরে, নামের ক্রমে) সেটাই যোগ হয়; আগের কিছু বদলায় বা মোছে না।
  * দুই জায়গায় একই node-এর লেখা আলাদা হলে বদলায় না, শুধু জানায়।
  * পুরোনো শাখার নাম আর Training-এর আগের জায়গা নতুন কাঠামোর সঙ্গে মিলিয়ে নেয়।
  * HTML-এ যে ক্রমে ছিল, সেই ক্রমে বসায় (আগের ভাইয়ের ঠিক পরে)।
  * আবার চালালে দুবার বসায় না।

ব্যবহার:
  python3 atlas/merge_from_html.py            # dry-run: কী যোগ হবে দেখায়, কিছু লেখে না
  python3 atlas/merge_from_html.py --apply    # map.json-এ লেখে
  python3 atlas/merge_from_html.py --html অন্য.html
"""
import argparse
import copy
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
MAP = HERE / "data" / "map.json"

# পুরোনো HTML-এর শাখার নাম → map.json-এর নাম
RENAME = {
    "ভিত্তির শব্দ": "০. ভিত্তির শব্দ",
    "Model → ধরন → ভেতরের অংশ": "৩. Model — ধরন → ভেতরের অংশ",
}
TRAINING_WRAPPER = "Training-এর সাধারণ ভিত্তি"
SETTING_PREFIX = "২. Learning Setting"
TRAINING_NAME_PREFIX = "৪. Training"


def load_html_tree(path):
    for line in Path(path).read_text(encoding="utf-8").split("\n"):
        if re.match(r"\s*const data\s*=", line):
            return json.loads(re.sub(r"^\s*const data\s*=\s*", "", line).rstrip().rstrip(";"))
    sys.exit("`const data=` লাইন পাওয়া যায়নি: " + str(path))


def norm_path(path, branch_names):
    """HTML-এর পথ (নামের তালিকা) → map.json-এর পথ।"""
    p = list(path)
    if len(p) >= 2 and p[1] in RENAME:
        p[1] = RENAME[p[1]]
    # Training আগে Learning Setting-এর ভেতরে wrapper ছিল; এখন নিজেই শাখা
    if len(p) >= 3 and p[1].startswith(SETTING_PREFIX) and p[2] == TRAINING_WRAPPER:
        p = [p[0], branch_names["training"]] + p[3:]
    elif len(p) == 3 and p[1].startswith(SETTING_PREFIX) and p[2] == TRAINING_WRAPPER:
        p = [p[0], branch_names["training"]]
    return tuple(p)


def index_by_path(node, path=(), out=None):
    out = {} if out is None else out
    here = path + (node["name"],)
    out[here] = node
    for c in node.get("children") or []:
        index_by_path(c, here, out)
    return out


def strip_ids(node):
    node = copy.deepcopy(node)

    def clean(n):
        n.pop("id", None)
        for c in n.get("children") or []:
            clean(c)

    clean(node)
    return node


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--html", default=str(HERE.parent / "ml-mapping.html"))
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    mp = json.loads(MAP.read_text(encoding="utf-8"))
    html = load_html_tree(args.html)
    branch_names = {c["id"]: c["name"] for c in mp["children"]}
    target = index_by_path(mp)
    before = len(target)

    added, differing, orphan = [], [], []

    def visit(h_node, h_path):
        # html-এর node-এর map.json-এ সংশ্লিষ্ট পথ
        if h_path == (html["name"],) or len(h_path) == 1:
            tpath = (mp["name"],)
        else:
            tpath = norm_path(h_path, branch_names)
            tpath = (mp["name"],) + tpath[1:]
        # Training wrapper নিজে map.json-এ নেই; তার লেখা নতুন শাখায় আগেই গেছে
        if len(h_path) == 3 and h_path[2] == TRAINING_WRAPPER and h_path[1].startswith(SETTING_PREFIX):
            for c in h_node.get("children") or []:
                visit(c, h_path + (c["name"],))
            return
        if tpath in target:
            t = target[tpath]
            for k, v in h_node.items():
                if k in ("children", "id", "name"):  # name: শাখার নাম ইচ্ছে করে বদলানো হয়েছে
                    continue
                if k in t and t[k] != v:
                    differing.append((tpath, k))
            for c in h_node.get("children") or []:
                visit(c, h_path + (c["name"],))
            return
        parent_path = tpath[:-1]
        parent = target.get(parent_path)
        if parent is None:
            orphan.append(tpath)
            return
        kids = parent.setdefault("children", [])
        # HTML-এ আগের ভাই কে ছিল, তার ঠিক পরে বসাই
        siblings = []
        h_parent_children = None
        # h_parent_children খুঁজে বের করি
        cur = html
        for name in h_path[1:-1]:
            cur = next(c for c in cur["children"] if c["name"] == name)
        h_parent_children = cur["children"]
        idx_in_html = next(i for i, c in enumerate(h_parent_children) if c["name"] == h_node["name"])
        insert_at = 0
        for prev in reversed(h_parent_children[:idx_in_html]):
            j = next((i for i, k in enumerate(kids) if k["name"] == prev["name"]), None)
            if j is not None:
                insert_at = j + 1
                break
        new_node = strip_ids(h_node)
        kids.insert(insert_at, new_node)
        added.append(tpath)
        # নতুন node-এর ভেতরের সব node-ও একসঙ্গে বসেছে; target-এ নথিভুক্ত করি
        index_by_path(new_node, parent_path, target)

    for c in html.get("children") or []:
        visit(c, (html["name"], c["name"]))

    top_added = [p for p in added if len([a for a in added if a == p[:-1]]) == 0 or p[:-1] not in set(added)]
    total_new = len(index_by_path(mp)) - before
    print(f"node: {before} (map.json-এ আগে) → {before + total_new}; নতুন {total_new}টা node, {len(added)}টা জায়গায় বসছে (কিছু নিজের সন্তান নিয়ে)")
    for p in added:
        print("  + " + " › ".join(x.split(' — ')[0][:26] for x in p[-4:]))
    if differing:
        print(f"\nসতর্কতা: {len(differing)}টা node-এ HTML ও map.json-এর লেখা আলাদা (map.json রাখা হলো):")
        for p, k in differing[:20]:
            print(f"  ~ {' › '.join(x[:22] for x in p[-3:])}  [{k}]")
    if orphan:
        print(f"\nসতর্কতা: {len(orphan)}টার অভিভাবক map.json-এ নেই, বাদ গেছে:")
        for p in orphan[:10]:
            print("  ? " + " › ".join(x[:22] for x in p))
    if not added:
        print("\nনতুন কিছু নেই; map.json আগের মতোই।")
        return
    if not args.apply:
        print("\nএটা dry-run, কিছু লেখা হয়নি। লিখতে --apply দাও।")
        return
    # build.py-র ক্রমেই লিখি: id, name, ref, definition, বাকি, children
    def order(n):
        out = {k: n[k] for k in ("id", "name", "ref", "definition") if k in n}
        out.update({k: v for k, v in n.items() if k not in out and k != "children"})
        if n.get("children"):
            out["children"] = [order(c) for c in n["children"]]
        return out

    MAP.write_text(json.dumps(order(mp), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("\nmap.json-এ লেখা হয়েছে। এবার: python3 atlas/build.py")


if __name__ == "__main__":
    main()
