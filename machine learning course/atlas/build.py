#!/usr/bin/env python3
"""data/map.json + data/lessons.json + src/* → dist/index.html (একটাই স্বয়ংসম্পূর্ণ file)।

ব্যবহার:
  python3 atlas/build.py                       # স্থানীয়: পাঠের link কোর্সের ফাইলে (../../module-...)
  python3 atlas/build.py --lesson-base URL     # publish: পাঠের link URL + path
  python3 atlas/build.py --no-lesson-links     # publish: পাঠ শুধু লেখা, link ছাড়া
  python3 atlas/build.py --out ml-mapping.html # অন্য জায়গায় লেখো (পাঠের link ওই ফাইলের জায়গা থেকে হিসাব হয়)

যাচাই করে: id অনন্য কি না, প্রতিটা node-এ name/definition আছে কি না,
lessons.json-এর প্রতিটা পাঠ-path সত্যিই আছে কি না, নামে ভুল আছে কি না।
কোনো node-এ id না থাকলে বানিয়ে map.json-এ লিখে রাখে (স্থির থাকে বলে deep link ভাঙে না)।
"""
import argparse
import copy
import datetime
import hashlib
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import quote

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent  # machine learning course/
DATA = HERE / "data" / "map.json"
LESSONS = HERE / "data" / "lessons.json"
STORIES = HERE / "data" / "stories.json"
HISTORY = HERE / "data" / "history.json"
PATH = HERE / "data" / "path.json"
PRACTICE = HERE / "data" / "practice.json"
SHARED = HERE / "data" / "shared.json"
GUIDANCE = HERE / "data" / "guidance.json"
ALIASES = HERE / "data" / "aliases.json"
PSEUDO = HERE / "data" / "pseudo.json"
RULES = HERE / "data" / "rules.json"
SRC = HERE / "src"
DIST = HERE / "dist"
MAX_LESSONS = 3


def walk(node, parent=None, depth=0):
    yield node, parent, depth
    for c in node.get("children") or []:
        yield from walk(c, node, depth + 1)


def fail(msg):
    sys.exit("ত্রুটি: " + msg)


def slug(name):
    return "-".join(p.lower() for p in re.findall(r"[A-Za-z0-9]+", name))


def ensure_ids(root):
    """id-হীন node থাকলে বানিয়ে বসায়; বদল হলে true ফেরত দেয়।"""
    used = {n["id"] for n, _, _ in walk(root) if n.get("id")}
    changed = False
    for node, parent, _ in walk(root):
        if node.get("id"):
            continue
        base = slug(node["name"]) or "n-" + hashlib.sha1(node["name"].encode()).hexdigest()[:6]
        cand, k = base, 2
        if cand in used and parent:
            cand = f"{parent['id']}--{base}"
        while cand in used:
            cand = f"{base}-{k}"
            k += 1
        node["id"] = cand
        used.add(cand)
        changed = True
        print(f"  নতুন id: {cand}  ({node['name']})")
    return changed


REF_FIELDS = ("definition", "mathDetail", "settingPurpose", "selection", "trainingDetail", "usageDetail", "insight", "profile")


def resolve_refs(root):
    """`"ref": "<id>"` থাকলে ওই node-এর লেখা (সংজ্ঞা, trainingDetail, insight…) ধার নেয়।
    নিজের যে field আছে সেটা বদলায় না; id, name, children, lessons কখনো ধার হয় না।
    এতে একই model একাধিক শাখায় এলে লেখা একবারই লিখতে হয়, কপি-কপি drift হয় না।"""
    import copy
    by_id = {n["id"]: n for n, _, _ in walk(root)}
    done, active = set(), []

    def fill(n):
        if n["id"] in done or "ref" not in n:
            return
        if n["id"] in active:
            fail("ref-এ চক্র: " + " → ".join(active + [n["id"]]))
        tgt = by_id.get(n["ref"])
        if not tgt:
            fail(f"ref পাওয়া যায়নি: {n['ref']} (node {n['id']})")
        active.append(n["id"])
        fill(tgt)
        active.pop()
        for f in REF_FIELDS:
            if f not in n and f in tgt:
                n[f] = copy.deepcopy(tgt[f])
        done.add(n["id"])

    count = 0
    for n, _, _ in walk(root):
        if "ref" in n:
            fill(n)
            count += 1
    return count


def write_json(path, obj):
    # id আর name আগে থাকুক, children সবার শেষে; পড়তে সুবিধা
    def order(n):
        out = {k: n[k] for k in ("id", "name", "ref", "definition") if k in n}
        out.update({k: v for k, v in n.items() if k not in out and k != "children"})
        if n.get("children"):
            out["children"] = [order(c) for c in n["children"]]
        return out

    path.write_text(json.dumps(order(obj), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def validate(root):
    seen = {}
    for node, _, _ in walk(root):
        for key in ("id", "name", "definition"):
            if not str(node.get(key, "")).strip():
                fail(f"node-এ {key} নেই: {node.get('name') or node.get('id')}")
        if node["id"] in seen:
            fail(f"id দুবার: {node['id']} ({seen[node['id']]} ও {node['name']})")
        seen[node["id"]] = node["name"]
        if "children" in node and not node["children"]:
            fail(f"খালি children: {node['id']}")
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", node["id"]):
            fail(f"id-তে অচেনা অক্ষর: {node['id']}")
        # ক্রমিক ধাপ: কোনো সন্তানে seq থাকলে সবার থাকতে হবে, আর ১, ২, ৩… ক্রমে
        kids = node.get("children") or []
        if any("seq" in c for c in kids):
            got = [c.get("seq") for c in kids]
            want = ["".join("০১২৩৪৫৬৭৮৯"[int(d)] for d in str(i)) for i in range(1, len(kids) + 1)]
            if got != want:
                fail(f"ধাপ-নম্বর ক্রমে নেই: {node['name']} → {got} (হওয়া উচিত {want})")


KINDS = {"step", "decision", "option", "tool", "stepref", "info"}


def attach_guidance(root):
    """option/tool-এ 'কেন বাছবে' (why), 'দাম/কখন এড়াবে' (tradeoff), ঐচ্ছিক 'কীভাবে' (how) বসায়।
    শূন্য-থেকে-train-এর নকল node (id-র শেষে -sc) আসল id-র তথ্য নেয়। tool-এ repo-র মালিক (owner)-ও বসে,
    যাতে একই ইকোসিস্টেমের ওপর নির্ভরতা চোখে পড়ে।"""
    spec = json.loads(GUIDANCE.read_text(encoding="utf-8"))["entries"]
    used = set()
    for node, _, _ in walk(root):
        if node.get("kind") not in ("option", "tool"):
            continue
        i = node["id"]
        key = i if i in spec else (i[:-3] if i.endswith("-sc") and i[:-3] in spec else None)
        if key:
            used.add(key)
            g = spec[key]
            for k in ("why", "tradeoff", "how"):
                if k in g:
                    node[k] = g[k]
            if g.get("when") and not node.get("when"):
                node["when"] = g["when"]
        if node.get("kind") == "tool":
            m = re.match(r"https://(github\.com|huggingface\.co)/([^/]+)/", node["tool"]["repo"])
            if m:
                node["tool"]["owner"] = m.group(2)
                node["tool"]["host"] = "github" if m.group(1) == "github.com" else "huggingface"
    unused = sorted(set(spec) - used)
    if unused:
        print(f"  সতর্কতা (গাইড): কোনো node-এ বসেনি → {unused[:6]}")
    return len(used)


def expand_includes(root):
    """`"include": "<কী>"` থাকলে data/shared.json-এর ওই উপগাছ (একবারই লেখা) সন্তান হিসেবে কপি হয়ে বসে।
    `"id_suffix"` প্রতিটা কপির id-তে জোড়া লাগে (খালি = মূল id), নইলে id দুবার পড়ত। নাম একই থাকে, তাই নাম-ধরা
    গল্প/পাঠ/ইতিহাস সব কপিতে একসাথে পৌঁছায়। শুধু memory-তে হয়; map.json বদলায় না।"""
    lib, n = None, 0
    def suffix(node, sfx):
        node["id"] += sfx
        for c in node.get("children") or []:
            suffix(c, sfx)
    for node, _, _ in list(walk(root)):
        key = node.pop("include", None)
        sfx = node.pop("id_suffix", "")
        if not key:
            continue
        if lib is None:
            lib = json.loads(SHARED.read_text(encoding="utf-8"))
        if key.startswith("_") or key not in lib:
            fail(f"include-এর উৎস shared.json-এ নেই: {key} (node {node['id']})")
        if node.get("children"):
            fail(f"include-node-এ নিজস্ব children থাকতে পারে না: {node['id']}")
        kids = copy.deepcopy(lib[key])
        for k in kids:
            suffix(k, sfx)
        node["children"] = kids
        n += 1
    return n


def prepare(root):
    """expand_includes + resolve_refs + attach_guidance: build ও test একই পথে root বানায়।"""
    expand_includes(root)
    refs = resolve_refs(root)
    attach_guidance(root)
    return refs


def validate_plan(root):
    """বাছাই-গাছের নিয়ম: kind চেনা, decision-এ pick, tool-এ যাচাই-করা তথ্য।
    tool-এর repo https না হলে বা licence/যাচাই-তারিখ না থাকলে build থামে।
    stepref-এর goto আর mode-option-এর steps সত্যিকারের step-node-এ পৌঁছাতে হবে।"""
    by_id = {n["id"]: n for n, _, _ in walk(root)}
    for node, _, _ in walk(root):
        if node.get("kind") == "stepref":
            t = by_id.get(node.get("goto"))
            if not t or t.get("kind") != "step":
                fail(f"stepref-এর goto কোনো step-এ যায় না: {node['name']} → {node.get('goto')}")
            if node.get("children"):
                fail(f"stepref-এর সন্তান থাকতে পারে না: {node['name']}")
        for sid in node.get("steps") or []:
            if by_id.get(sid, {}).get("kind") != "step":
                fail(f"mode-এর steps-এ step নয় এমন id: {node['name']} → {sid}")
    for node, parent, _ in walk(root):
        k = node.get("kind")
        if k is None:
            continue
        part = node.get("part")
        if part is not None:
            # option-এর ভেতরে তার নিজেরই অংশ: core = সাথে আসে (info), optional = আলাদা করে বাছা যায় (option)
            if part not in ("core", "optional"):
                fail(f"part core বা optional হতে হবে: {node['name']} ({node['id']})")
            if (part == "core") != (k == "info") or (part == "optional") != (k == "option"):
                fail(f"part:{part} শুধু {'info' if part == 'core' else 'option'}-এ চলে, এটা {k}: {node['id']}")
            if not parent or parent.get("kind") not in ("option", "tool"):
                fail(f"part-ওয়ালা node-এর parent option বা tool হতে হবে: {node['id']}")
        if k not in KINDS:
            fail(f"অচেনা kind '{k}': {node['name']}")
        kids = node.get("children") or []
        if k == "decision":
            if node.get("pick") not in ("one", "many"):
                fail(f"decision-এ pick (one/many) নেই: {node['name']}")
            if not kids:
                fail(f"decision-এ কোনো বিকল্প নেই: {node['name']}")
            if node.get("need") not in ("required", "optional"):
                fail(f"decision-এ need (required/optional) নেই: {node['name']} ({node['id']})")
            if not str(node.get("needWhy", "")).strip():
                fail(f"decision-এ needWhy (আবশ্যক বা ঐচ্ছিক কেন) নেই: {node['name']} ({node['id']})")
            dflt = node.get("defaultOption")
            if dflt is not None:
                if node["need"] != "optional" or node["pick"] != "one":
                    fail(f"defaultOption শুধু ঐচ্ছিক, একটা-বাছার decision-এ: {node['name']} ({node['id']})")
                if dflt not in [c["id"] for c in kids]:
                    fail(f"defaultOption এই decision-এর বিকল্প নয়: {node['id']} → {dflt}")
            if node.get("group") is not None and node["need"] != "required":
                fail(f"group শুধু আবশ্যক decision-এ: {node['name']} ({node['id']})")
            bad = [c["name"] for c in kids if c.get("kind") not in ("option", "tool")]
            if bad:
                fail(f"decision-এর সন্তান option/tool নয়: {node['name']} → {bad}")
        if k in ("option", "tool"):
            for f in ("when", "why", "tradeoff"):
                if not str(node.get(f, "")).strip():
                    fail(f"{k}-এ '{f}' (বাছার কারণ) নেই: {node['name']} ({node['id']})")
            ok = ("decision", "tool", "stepref", "info") if k == "option" else ("decision", "info")
            # option-এর সন্তান option হতে পারে শুধু তার ঐচ্ছিক অংশ (part: optional) হলে
            bad = [c["name"] for c in kids if c.get("kind") not in ok and not (k == "option" and c.get("kind") == "option" and c.get("part") == "optional")]
            if bad:
                fail(f"{k}-এর সন্তান {'/'.join(ok)} ছাড়া হতে পারে না: {node['name']} → {bad}")
        for u in [node.get("docs")] + [h.get("u") for h in node.get("how", [])]:
            if u and not str(u).startswith("https://"):
                fail(f"লিংক https নয়: {node['name']} → {u}")
        if k == "tool":
            t = node.get("tool") or {}
            if not str(t.get("repo", "")).startswith("https://"):
                fail(f"tool-এর repo https নয়: {node['name']}")
            for f in ("license", "checked", "src"):
                if not t.get(f):
                    fail(f"tool-এ '{f}' নেই: {node['name']}")


def find_file(token):
    """\"09/03\" → module-09-*/lecture-03-*.md; \"09/README\" → README.md; \"10/reference\" → reference*.md"""
    mod, _, what = token.partition("/")
    mods = sorted(ROOT.glob(f"module-{mod}-*"))
    if len(mods) != 1:
        fail(f"পাঠ '{token}': module-{mod} পাওয়া যায়নি")
    if what == "README":
        pat = "README.md"
    elif what.isdigit():
        pat = f"lecture-{what}-*.md"
    else:
        pat = f"{what}*.md"
    files = sorted(mods[0].glob(pat))
    if len(files) != 1:
        fail(f"পাঠ '{token}': {mods[0].name}/{pat} মিলল {len(files)}টা")
    return mod, what, files[0]


def lesson_info(token, args, cache={}):
    if token in cache:
        return cache[token]
    mod, what, path = find_file(token)
    h1 = next((ln[2:].strip() for ln in path.read_text(encoding="utf-8").splitlines() if ln.startswith("# ")), path.stem)
    title = re.sub(r"^(Lecture|Bridge|Reference|Module)\s*[\w-]*\s*[—–-]\s*", "", h1)
    label = f"M{mod} · " + ("সূচি" if what == "README" else f"L{what}" if what.isdigit() else "রেফারেন্স")
    rel = path.relative_to(ROOT).as_posix()
    if args.no_lesson_links:
        href = ""
    elif args.lesson_base:
        href = args.lesson_base.rstrip("/") + "/" + quote(rel)
    else:
        href = quote(os.path.relpath(path, args.out_dir).replace(os.sep, "/"), safe="/")
    cache[token] = {"k": label, "t": title, "h": href}
    return cache[token]


def attach_lessons(root, args):
    spec = json.loads(LESSONS.read_text(encoding="utf-8"))
    by_name, names_in_tree = {}, {n["name"] for n, _, _ in walk(root)}
    for rule in spec["rules"]:
        for name in rule["names"]:
            if name not in names_in_tree:
                print(f"  সতর্কতা: lessons.json-এর নাম মানচিত্রে নেই: {name!r}")
            by_name.setdefault(name, [])
            for t in rule["lessons"]:
                if t not in by_name[name]:
                    by_name[name].append(t)
    ids = {n["id"] for n, _, _ in walk(root)}
    for bid in spec["branches"]:
        if bid not in ids:
            fail(f"lessons.json-এ অচেনা শাখা-id: {bid}")
    count = 0
    for node, _, _ in walk(root):
        tokens = list(spec["branches"].get(node["id"], [])) + by_name.get(node["name"], [])
        if len(tokens) > MAX_LESSONS:
            print(f"  সতর্কতা: {node['name']!r}-এ {len(tokens)}টা পাঠ, প্রথম {MAX_LESSONS}টা রাখা হলো")
            tokens = tokens[:MAX_LESSONS]
        if tokens:
            node["lessons"] = [lesson_info(t, args) for t in tokens]
            count += 1
        else:
            node.pop("lessons", None)
    return count


BRANCH_PRIORITY = ["model", "training", "setting", "task", "basics", "evaluation", "application"]


PATH_OUT = []


def attach_stories(root):
    """গল্প (সমস্যা → ধারণা → তারপর), 'কোন ক্ষেত্রে কোনটা' আর যাচাই-করা ইতিহাস node-এ বসায়।
    নাম ধরে বসে (একই নামের সব node-এ); লিংকের নাম একাধিক জায়গায় থাকলে model > training > setting > task… ক্রমে সেরা জায়গাটা নেয়।"""
    from collections import defaultdict
    spec = json.loads(STORIES.read_text(encoding="utf-8"))
    hist = json.loads(HISTORY.read_text(encoding="utf-8"))
    nodes = [n for n, _, _ in walk(root)]
    by_name, by_id, branch_of = defaultdict(list), {n["id"]: n for n in nodes}, {}
    for n in nodes:
        by_name[n["name"]].append(n)
    for br in root["children"]:
        for n, _, _ in walk(br):
            branch_of[n["id"]] = br["id"]

    def canon(name):
        c = by_name.get(name)
        if not c:
            return None
        rank = lambda n: BRANCH_PRIORITY.index(branch_of[n["id"]]) if branch_of.get(n["id"]) in BRANCH_PRIORITY else 99
        return sorted(c, key=rank)[0]["id"]

    def link(name, extra):
        out = {"label": name, **extra}
        i = canon(name)
        if i:
            out["id"] = i
        return out

    def targets(entry, what):
        found = [by_id[i] for i in entry.get("ids", []) if i in by_id]
        for nm in entry.get("names", []):
            hit = by_name.get(nm, [])
            if not hit:
                print(f"  সতর্কতা ({what}): মানচিত্রে এই নাম নেই: {nm!r}")
            found += hit
        if not found:
            print(f"  সতর্কতা ({what}): কোনো node মেলেনি: {entry.get('names') or entry.get('ids')}")
        return found

    claimed, n_story = {}, 0
    for e in spec["entries"]:
        story = {"problem": e["story"]["problem"], "idea": e["story"]["idea"]}
        if e["story"].get("next"):
            story["next"] = []
            for x in e["story"]["next"]:
                if not canon(x["to"]):
                    print(f"  সতর্কতা: 'তারপর'-এর নাম মানচিত্রে নেই: {x['to']!r}")
                story["next"].append(link(x["to"], {"why": x["why"]}))
        choose = [link(c["pick"], {"when": c["when"], "why": c.get("why", "")}) for c in e.get("choose", [])]
        for n in targets(e, "গল্প"):
            if n["id"] in claimed:
                fail(f"একই node-এ দুটো গল্প: {n['name']} ({claimed[n['id']]} ও {e.get('names') or e.get('ids')})")
            claimed[n["id"]] = e.get("names") or e.get("ids")
            n["story"] = story
            if choose:
                n["choose"] = choose
            n_story += 1
    n_hist = 0
    for e in hist["entries"]:
        items = []
        for it in e["items"]:
            if not it["url"].startswith("https://"):
                fail(f"ইতিহাসের সূত্র https নয়: {it['year']} {it['url']}")
            items.append({"y": it["year"], "t": it["text"], "s": it["src"], "u": it["url"]})
        for n in targets(e, "ইতিহাস"):
            n["history"] = items
            n_hist += 1
    # গল্পের পথ: নাম → id; গল্প না থাকা node পথে রাখা চলবে না (কার্ডে দেখানোর কিছু থাকত না)
    chapters, seen = [], set()
    for ch in json.loads(PATH.read_text(encoding="utf-8"))["chapters"]:
        ids = []
        for nm in ch["steps"]:
            i = canon(nm)
            if not i:
                fail(f"গল্পের পথে মানচিত্রে নেই এমন নাম: {nm!r}")
            if "story" not in by_id[i]:
                fail(f"গল্পের পথের node-এ গল্প নেই: {nm!r}")
            if i in seen:
                fail(f"গল্পের পথে একই node দুবার: {nm!r}")
            seen.add(i)
            ids.append(i)
        chapters.append({"title": ch["title"], "intro": ch.get("intro", ""), "steps": ids})
    PATH_OUT.clear()
    PATH_OUT.extend(chapters)
    return n_story, n_hist


def attach_practice(root):
    """"বাস্তবে কী হয়" স্তর: scenario, যাচাই-করা facts (সূত্রসহ), অভিজ্ঞতা-ভিত্তিক typical/pitfalls।
    facts-এ https সূত্র থাকতেই হবে; না থাকলে build থামে (যাচাই-ছাড়া দাবি ঢুকতে দেওয়া হয় না)।"""
    from collections import defaultdict
    spec = json.loads(PRACTICE.read_text(encoding="utf-8"))
    nodes = [n for n, _, _ in walk(root)]
    by_name, by_id = defaultdict(list), {n["id"]: n for n in nodes}
    for n in nodes:
        by_name[n["name"]].append(n)
    claimed, count = {}, 0
    for e in spec["entries"]:
        pr = dict(e["practice"])
        for f in pr.get("facts", []):
            if not f.get("u", "").startswith("https://"):
                fail(f"বাস্তব-তথ্যের সূত্র https নয়: {f.get('t', '')[:40]}")
        found = [by_id[i] for i in e.get("ids", []) if i in by_id]
        for nm in e.get("names", []):
            if not by_name.get(nm):
                print(f"  সতর্কতা (বাস্তব): মানচিত্রে এই নাম নেই: {nm!r}")
            found += by_name.get(nm, [])
        if not found:
            print(f"  সতর্কতা (বাস্তব): কোনো node মেলেনি: {e.get('names') or e.get('ids')}")
        for n in found:
            if n["id"] in claimed:
                fail(f"একই node-এ দুটো বাস্তব-স্তর: {n['name']}")
            claimed[n["id"]] = 1
            n["practice"] = pr
            count += 1
    return count


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lesson-base")
    ap.add_argument("--no-lesson-links", action="store_true")
    ap.add_argument("--out", default=str(DIST / "index.html"))
    args = ap.parse_args()
    args.out = Path(args.out).resolve()
    args.out_dir = args.out.parent

    root = json.loads(DATA.read_text(encoding="utf-8"))
    if ensure_ids(root):
        write_json(DATA, root)
        print("  map.json-এ নতুন id লেখা হয়েছে")
    refs = prepare(root)
    validate(root)
    validate_plan(root)
    linked = attach_lessons(root, args)
    n_story, n_hist = attach_stories(root)
    n_prac = attach_practice(root)

    def compact(o):
        # </script> বন্ধ হয়ে যাওয়া ঠেকাতে
        return json.dumps(o, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

    aliases = json.loads(ALIASES.read_text(encoding="utf-8"))["aliases"]
    ids_now = {n["id"] for n, _, _ in walk(root)}
    for old, new in aliases.items():
        if new not in ids_now:
            fail(f"alias-এর লক্ষ্য নেই: {old} → {new}")
        if old in ids_now:
            fail(f"alias-এর পুরোনো id এখনও আছে (alias লাগে না): {old}")
    pseudo = json.loads(PSEUDO.read_text(encoding="utf-8"))
    base = lambda i: i[:-3] if i.endswith("-sc") else i
    known = {base(i) for i in ids_now} | ids_now
    for table in ("slots", "options"):
        for k in pseudo[table]:
            if k not in known:
                fail(f"pseudo.json-এর {table}-এ অজানা id: {k}")
    for mode, lines in pseudo["templates"].items():
        if mode not in ids_now:
            fail(f"pseudo-ছাঁচের mode নেই: {mode}")
        for ln in lines:
            for s_ in re.findall(r"\{\{(\w+)\}\}", ln):
                if s_ not in pseudo["labels"]:
                    fail(f"pseudo-ছাঁচে label-হীন slot: {s_}")
    rules = json.loads(RULES.read_text(encoding="utf-8"))
    for r in rules["rules"]:
        if r["kind"] not in ("conflict", "warn", "requires"):
            fail(f"নিয়মের kind অচেনা: {r['id']}")
        if not (r.get("src") and r.get("text")):
            fail(f"নিয়মে সূত্র বা লেখা নেই: {r['id']}")
        rule_ids = r["if"] + r.get("with", []) + r.get("anyOf", [])
        for i in rule_ids:
            if i not in ids_now:
                fail(f"নিয়ম '{r['id']}'-এ অজানা id: {i}")
        if r["kind"] == "requires" and not r.get("anyOf"):
            fail(f"requires-নিয়মে anyOf নেই: {r['id']}")
        if r["kind"] != "requires" and not r.get("with"):
            fail(f"{r['kind']}-নিয়মে with নেই: {r['id']}")
        if r.get("path") and not (ROOT / r["path"]).exists():
            fail(f"নিয়মের পাঠ-ফাইল নেই: {r['path']}")
    cfg = {"lessonLinks": not args.no_lesson_links, "path": PATH_OUT, "aliases": aliases, "pseudo": pseudo, "rules": rules}
    page = (SRC / "template.html").read_text(encoding="utf-8")
    for key, val in {
        "__CSS__": (SRC / "style.css").read_text(encoding="utf-8"),
        # DOM-মুক্ত module আগে (src/js/*.js, নামের ক্রমে), তারপর app.js
        "__JS__": "\n".join([p.read_text(encoding="utf-8") for p in sorted((SRC / "js").glob("*.js"))] + [(SRC / "app.js").read_text(encoding="utf-8")]),
        "__FAVICON__": (SRC / "favicon.txt").read_text(encoding="utf-8").strip(),
        "__BUILT__": datetime.date.today().isoformat(),
        "__CONFIG__": compact(cfg),
        "__DATA__": compact(root),  # সবার শেষে বসে, যাতে data-র ভেতরের লেখা অন্য placeholder-এর সঙ্গে না মেশে
    }.items():
        page = page.replace(key, val)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    out = args.out
    out.write_text(page, encoding="utf-8")

    nodes = [n for n, _, _ in walk(root)]
    shown = out.relative_to(ROOT) if ROOT in out.parents else out
    print(f"তৈরি: {shown}  ({out.stat().st_size // 1024} KB)")
    print(f"  node {len(nodes)}টা, শাখা {len(root['children'])}টা, ref-ধার {refs}টা, পাঠ-link {linked}টা, গল্প {n_story}টা, ইতিহাস {n_hist}টা, বাস্তব-স্তর {n_prac}টা node-এ")


if __name__ == "__main__":
    main()
