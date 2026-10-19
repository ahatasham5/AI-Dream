"""data-র test। চালানো: python3 -m unittest discover -s atlas/tests -v   (বাইরের library লাগে না)

build.py যা আটকায় (id অনন্য, seq-ক্রম, kind-নিয়ম, tool-তথ্য) তার পরেও এখানে ধরা হয়:
নাম-ধরা ফাইলের (গল্প, practice, ইতিহাস, পাঠ-নিয়ম, পথ) প্রতিটা নাম মানচিত্রে হুবহু আছে কি না,
আর প্রতিটা বাছাইযোগ্য বিকল্পে "কেন বাছবে" ও "দাম/কখন এড়াবে" আছে কি না।
"""
import json
import re
import sys
import unicodedata
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HERE))
import build  # noqa: E402

DATA = HERE / "data"
load = lambda f: json.loads((DATA / f).read_text(encoding="utf-8"))
MAP = load("map.json")


def walk(n):
    yield n
    for c in n.get("children") or []:
        yield from walk(c)


import copy as _copy
EXPANDED = _copy.deepcopy(MAP)
build.expand_includes(EXPANDED)   # include-node-গুলো ছড়ানো: অ্যাপ যে গাছ দেখে সেটাই test হয়
NODES = list(walk(EXPANDED))
NAMES = {n["name"] for n in NODES}
KNOWN_PLAIN_LINKS = {"MAE বা RMSE", "সীমা কমাও", "সীমা বাড়াও"}   # link-হীন সাধারণ লেখা হিসেবে ইচ্ছে করে রাখা


class Structure(unittest.TestCase):
    def test_build_validations_pass(self):
        import copy
        root = copy.deepcopy(MAP)
        build.prepare(root)
        build.validate(root)
        build.validate_plan(root)

    def test_every_leaf_in_plan_trees_is_selectable_or_info(self):
        """পথ-গাছে (Fine-tuning ও From-scratch) টাইপহীন বা অস্পষ্ট leaf থাকবে না।"""
        by_id = {n["id"]: n for n in NODES}
        for root_id in ("fine-tuning", "from-scratch-training", "planner"):
            for n in walk(by_id[root_id]):
                if n is by_id[root_id]:
                    continue
                self.assertIn(n.get("kind"), {"step", "decision", "option", "tool", "stepref", "info"}, f"kind নেই: {n['id']}")

    def test_decisions_have_pick_and_options(self):
        for n in NODES:
            if n.get("kind") == "decision":
                self.assertIn(n["pick"], ("one", "many"), n["id"])
                self.assertTrue(n["children"], n["id"])

    def test_mode_steps_are_real_steps_in_order(self):
        by_id = {n["id"]: n for n in NODES}
        for mode in ("mode-finetune", "mode-scratch"):
            steps = by_id[mode]["steps"]
            refs = [c["goto"] for c in by_id[mode]["children"]]
            self.assertEqual(steps, refs, f"{mode}: steps আর stepref-এর ক্রম আলাদা")
            for s in steps:
                self.assertEqual(by_id[s]["kind"], "step")


class NameKeyedFiles(unittest.TestCase):
    """নাম-ধরা ফাইলে হুবহু (NFC-সহ) মিল: ড়/য় ভাঙা-রূপ জাতীয় গোলমাল আগে একবার বাগ হয়েছিল।"""

    def _check(self, label, names):
        missing = sorted(n for n in names if n not in NAMES)
        self.assertEqual(missing, [], f"{label}: মানচিত্রে নেই → {missing[:5]}")
        # নোট: Bengali ড়/ঢ়/য় precomposed রূপে NFC-তে ভাঙে, তাই NFC দাবি করা হয় না; শুধু "মিশ্র রূপ" ধরা হয়
        nfc = {unicodedata.normalize("NFC", n) for n in NAMES}
        mixed = [n for n in names if n not in NAMES and unicodedata.normalize("NFC", n) in nfc]
        self.assertEqual(mixed, [], f"{label}: নামের মিশ্র Unicode-রূপ → {mixed[:3]}")

    def test_stories(self):
        names, ids = [], {n["id"] for n in NODES}
        for e in load("stories.json")["entries"]:
            names += e.get("names", [])
            for i in e.get("ids", []):
                self.assertIn(i, ids)
        self._check("stories", names)

    def test_story_links_resolve(self):
        bad = set()
        for e in load("stories.json")["entries"]:
            for x in e["story"].get("next", []):
                if x["to"] not in NAMES:
                    bad.add(x["to"])
            for x in e.get("choose", []):
                if x["pick"] not in NAMES:
                    bad.add(x["pick"])
        self.assertEqual(bad - KNOWN_PLAIN_LINKS, set(), "ভাঙা গল্প-link")

    def test_one_story_per_name_group(self):
        seen = {}
        for e in load("stories.json")["entries"]:
            for n in e.get("names", []):
                self.assertNotIn(n, seen, f"একই নামে দুটো গল্প: {n}")
                seen[n] = 1

    def test_practice_history_lessons_path(self):
        self._check("practice", [n for e in load("practice.json")["entries"] for n in e.get("names", [])])
        self._check("history", [n for e in load("history.json")["entries"] for n in e["names"]])
        self._check("lessons", [n for r in load("lessons.json")["rules"] for n in r["names"]])
        self._check("path", [n for ch in load("path.json")["chapters"] for n in ch["steps"]])

    def test_practice_facts_have_https_source(self):
        for e in load("practice.json")["entries"]:
            for f in e["practice"].get("facts", []):
                self.assertTrue(f["u"].startswith("https://"), f["t"][:40])


class PseudoSpec(unittest.TestCase):
    def test_every_template_slot_has_label_and_a_provider(self):
        spec = load("pseudo.json")
        provided = {v["slot"] for v in spec["slots"].values()}
        for o in spec["options"].values():
            if isinstance(o, dict):
                provided |= set(o)
        for mode, lines in spec["templates"].items():
            for ln in lines:
                for slot in re.findall(r"\{\{(\w+)\}\}", ln):
                    self.assertIn(slot, spec["labels"], f"{mode}: label নেই {slot}")
                    self.assertIn(slot, provided, f"{mode}: কেউ এই slot ভরে না: {slot}")
                m = re.match(r"^\s*[?!](\w+)\s", ln)
                if m:
                    self.assertIn(m.group(1), provided, f"{mode}: শর্ত-slot ভরার কেউ নেই {m.group(1)}")

    def test_every_decision_in_plan_trees_has_a_slot_or_is_structural(self):
        spec = load("pseudo.json")
        base = lambda i: i[:-3] if i.endswith("-sc") else i
        skipped = {"plan-mode"}
        missing = [n["id"] for n in NODES if n.get("kind") == "decision" and n["id"] not in skipped
                   and base(n["id"]) not in spec["slots"]
                   and not any(isinstance(spec["options"].get(base(c["id"])), dict) for c in n["children"])]
        self.assertEqual(missing, [], "pseudo-code-এ বসে না এমন সিদ্ধান্ত")


class Rules(unittest.TestCase):
    def test_rules_are_grounded_and_point_to_real_nodes(self):
        ids = {n["id"] for n in NODES}
        seen = set()
        for r in load("rules.json")["rules"]:
            self.assertNotIn(r["id"], seen); seen.add(r["id"])
            self.assertIn(r["kind"], {"conflict", "warn", "requires"})
            self.assertTrue(r["src"] and r["text"], r["id"])
            for i in r["if"] + r.get("with", []) + r.get("anyOf", []):
                self.assertIn(i, ids, f"{r['id']}: {i}")
            self.assertTrue(r.get("path") or r.get("url"), f"{r['id']}: সূত্রের পাঠ-ফাইল বা লিংক নেই")
            if r.get("path"):
                self.assertTrue((HERE.parent / r["path"]).exists(), r["path"])
            if r.get("url"):
                self.assertTrue(r["url"].startswith("https://"))

    def test_conflicts_never_contradict_pick_one(self):
        """একই pick:one সিদ্ধান্তের দুই ভাইয়ের মধ্যে conflict-নিয়ম বানানো অর্থহীন (আগেই আটকায়)।"""
        parent = {}
        for n in NODES:
            for c in n.get("children") or []:
                parent[c["id"]] = n
        for r in load("rules.json")["rules"]:
            if r["kind"] == "requires":
                continue
            for a in r["if"]:
                for b in r["with"]:
                    pa, pb = parent.get(a), parent.get(b)
                    same = pa is pb and pa and pa.get("kind") == "decision" and pa.get("pick") == "one"
                    self.assertFalse(same, f"{r['id']}: {a} ও {b} একই one-সিদ্ধান্তে")


class Jumps(unittest.TestCase):
    """jump = "এখানে নয়, ওখানে যাও" বোতাম: লক্ষ্য আছে, নিজের দিকে নয়, আর কেন যাবে তা লেখা।"""
    def test_jumps_point_to_real_other_nodes_and_explain(self):
        ids = {n["id"] for n in NODES}
        js = [n for n in NODES if n.get("jump")]
        self.assertGreaterEqual(len(js), 1)
        for n in js:
            j = n["jump"]
            self.assertIn(j["to"], ids, n["id"]); self.assertNotEqual(j["to"], n["id"])
            self.assertTrue(j["label"].strip() and j["why"].strip(), n["id"])

    def test_on_select_jumps_are_options(self):
        for n in NODES:
            if (n.get("jump") or {}).get("onSelect"):
                self.assertEqual(n.get("kind"), "option", n["id"])

    def test_scratch_need_offers_the_finetune_path(self):
        by = {n["id"]: n for n in NODES}
        self.assertEqual(by["opt-sc-pretrained-exists"]["jump"]["to"], "mode-finetune")
        self.assertTrue(by["mode-finetune"].get("steps"), "লক্ষ্য একটা পথের ধরন হওয়া উচিত")


class Relations(unittest.TestCase):
    """সম্পর্কের `basis: course` দাবি আসলেই কোর্সের lecture-গুলোর "আগে যা জানা থাকলে ভালো" লাইনে মেলে কি না,
    তা এখানে পাঠ-ফাইল ঘেঁটে যাচাই হয়; আমার বিচারের ওপর ছেড়ে দেওয়া হয় না।"""
    ROOT = HERE.parent

    def lecture_prereqs(self):
        def lid(rel):
            m = re.match(r"module-(\d\d)-[^/]+/(lecture|bridge)-(\d\d)", rel)
            return None if not m else (f"{m.group(1)}/{m.group(3)}" if m.group(2) == "lecture" else f"{m.group(1)}/b{m.group(3)}")
        pre = {}
        for f in self.ROOT.glob("module-*/*.md"):
            me = lid(f.relative_to(self.ROOT).as_posix())
            if not me:
                continue
            line = next((l for l in f.read_text(encoding="utf-8").split("\n")[:8] if "আগে যা জানা" in l), "")
            ps = []
            for href in re.findall(r"\]\(([^)#]+\.md)", line):
                t = (f.parent / href).resolve()
                try:
                    i = lid(t.relative_to(self.ROOT.resolve()).as_posix())
                except ValueError:
                    i = None
                if i:
                    ps.append(i)
            # "[Lecture 01–07](…01…)" একটা লিংকে একটা সীমা: ওই module-এর ০১ থেকে ০৭ সব
            for lo, hi, href in re.findall(r"\[Lecture\s*(\d\d)\s*[–-]\s*(\d\d)\]\(([^)#]+\.md)", line):
                try:
                    mod = lid((f.parent / href).resolve().relative_to(self.ROOT.resolve()).as_posix())[:2]
                except (ValueError, TypeError):
                    continue
                ps += [f"{mod}/{n:02d}" for n in range(int(lo), int(hi) + 1)]
            pre[me] = ps
        return pre

    def test_course_edges_follow_lecture_prerequisites(self):
        pre = self.lecture_prereqs()

        def closure(x):
            out, stack = set(), list(pre.get(x, []))
            while stack:
                y = stack.pop()
                if y not in out:
                    out.add(y)
                    stack += pre.get(y, [])
            return out
        les = {}
        for r in load("lessons.json")["rules"]:
            for n in r["names"]:
                les.setdefault(n, set()).update(r["lessons"])
        name = {n["id"]: n["name"] for n in NODES}
        bad = []
        for e in load("relations.json")["edges"]:
            if e["type"] != "needs" or e.get("basis") != "course":
                continue
            la, lb = les.get(name[e["from"]], set()), les.get(name[e["to"]], set())
            if not any(b in closure(a) for a in la for b in lb):
                bad.append(f"{e['from']} → {e['to']}  (পাঠ {sorted(la)} বনাম {sorted(lb)})")
        self.assertEqual(bad, [], "basis=course অথচ lecture-এর পূর্বশর্তে মেলে না:\n" + "\n".join(bad))

    def test_every_edge_has_a_basis(self):
        for e in load("relations.json")["edges"]:
            self.assertIn(e.get("basis"), ("course", "concept"), f"{e['from']} → {e['to']}")


class Aliases(unittest.TestCase):
    def test_aliases_point_to_existing_nodes_and_old_ids_are_gone(self):
        ids = {n["id"] for n in NODES}
        for old, new in load("aliases.json")["aliases"].items():
            self.assertIn(new, ids, f"alias-এর লক্ষ্য নেই: {old} → {new}")
            self.assertNotIn(old, ids, f"পুরোনো id এখনও আছে: {old}")


class OptionQuality(unittest.TestCase):
    """প্রতিটা বাছাইযোগ্য বিকল্পে বাছার কারণ লাগে: কখন, কেন, আর দাম।"""

    def test_options_and_tools_explain_choice(self):
        import copy
        root = copy.deepcopy(MAP)
        build.prepare(root)
        miss = []
        for n in walk(root):
            if n.get("kind") in ("option", "tool"):
                for f in ("when", "why", "tradeoff"):
                    if not str(n.get(f, "")).strip():
                        miss.append(f"{n['id']}:{f}")
        self.assertEqual(miss, [], f"{len(miss)}টা ক্ষেত্র ফাঁকা, যেমন {miss[:6]}")

    def test_guidance_has_no_dead_entries_and_https_links(self):
        g = load("guidance.json")["entries"]
        ids = {n["id"] for n in NODES}
        used = {i if i in g else i[:-3] for i in ids if i in g or (i.endswith("-sc") and i[:-3] in g)}
        self.assertEqual(sorted(set(g) - used), [], "কোনো node-এ না-বসা গাইড")
        for k, v in g.items():
            for h in v.get("how", []):
                self.assertTrue(h["u"].startswith("https://"), f"{k}: how-লিংক https নয়")

    def test_basis_is_known(self):
        for n in NODES:
            if n.get("kind") in ("option", "tool") and n.get("basis"):
                self.assertIn(n["basis"], {"course", "paper", "experience", "tool-doc"}, n["id"])

    def test_tool_facts(self):
        for n in NODES:
            if n.get("kind") == "tool":
                t = n["tool"]
                self.assertTrue(t["repo"].startswith("https://"))
                self.assertRegex(t["checked"], r"^[০-৯]{4}-[০-৯]{2}-[০-৯]{2}$", n["id"])
                self.assertIsInstance(t.get("archived", False), bool)


class Definitions(unittest.TestCase):
    """সংজ্ঞা শুধু "কী" বলবে: ফাঁকা নয়, ঠাসা নয়, আর কোর্স/মডিউলের লেবেল বা মানচিত্রের নিজের কথা নয়।"""
    BANNED = re.compile(r"কোর্সে আছে|Module\s*\d|Lecture|মডিউল|লেকচার|এই মানচিত্র")

    def own(self):
        # ref-ওয়ালা node অন্যের লেখা ধার নেয়; stepref শুধু "ধাপে যাও" বোতাম
        return [n for n in NODES if not n.get("ref") and n.get("kind") != "stepref"]

    def test_every_own_definition_is_present_and_bengali(self):
        for n in self.own():
            d = (n.get("definition") or "").strip()
            self.assertTrue(d, n["id"])
            self.assertTrue(re.search(r"[\u0980-\u09FF]", d), f"বাংলা নেই: {n['id']}")

    def test_definition_length_within_bounds(self):
        for n in self.own():
            self.assertTrue(60 <= len((n.get("definition") or "").strip()) <= 450,
                            f"{n['id']}: {len(n.get('definition') or '')} অক্ষর")

    def test_no_course_or_map_self_reference(self):
        for n in NODES:
            m = self.BANNED.search(n.get("definition") or "")
            self.assertIsNone(m, f"{n['id']}: নিষিদ্ধ লেখা '{m and m.group()}'")

    def test_copies_share_the_base_definition(self):
        """শূন্য-থেকে-train পথের নকল (-sc) ভিত্তি node-এর লেখাই দেখায়: একটাই সত্য-উৎস।"""
        by_id = {n["id"]: n for n in NODES}
        for n in NODES:
            base = by_id.get(n["id"][:-3]) if n["id"].endswith("-sc") else None
            if base and base.get("definition") and not n.get("ref"):
                self.assertEqual(n.get("definition"), base["definition"], n["id"])


class NeedAndDefaults(unittest.TestCase):
    """আবশ্যক/ঐচ্ছিক ও default: প্রতিটা decision-এ কারণসহ, শূন্য-থেকের নকলে মিল, আর ছাঁচের সাথে সামঞ্জস্য।"""
    DECISIONS = {n["id"]: n for n in NODES if n.get("kind") == "decision"}
    SPEC = load("pseudo.json")

    def test_every_decision_has_need_and_reason(self):
        for i, n in self.DECISIONS.items():
            self.assertIn(n.get("need"), ("required", "optional"), i)
            self.assertTrue(str(n.get("needWhy", "")).strip(), f"কারণ নেই: {i}")

    def test_sc_copies_match_their_base(self):
        """-sc নকল ও ভিত্তি decision-এ need, group ও default (সংশ্লিষ্ট -sc বিকল্প) এক।"""
        pairs = 0
        for i, n in self.DECISIONS.items():
            base = self.DECISIONS.get(i[:-3]) if i.endswith("-sc") else None
            if not base:
                continue
            pairs += 1
            self.assertEqual(n["need"], base["need"], i)
            self.assertEqual(n.get("group"), base.get("group"), i)
            self.assertEqual(n.get("defaultOption"), base["defaultOption"] + "-sc" if base.get("defaultOption") else None, i)
        self.assertGreater(pairs, 10)

    def test_groups_have_at_least_two_required_members(self):
        groups = {}
        for i, n in self.DECISIONS.items():
            if n.get("group"):
                groups.setdefault(n["group"], []).append(n)
        self.assertTrue(groups)
        for g, ms in groups.items():
            self.assertGreaterEqual(len(ms), 2, g)
            self.assertTrue(all(m["need"] == "required" for m in ms), g)

    def test_defaults_have_pseudo_text(self):
        """default বসাতে হলে তার pseudo-লেখা থাকতেই হবে, নইলে ডিফল্ট ফাঁকা বসবে।"""
        opts = self.SPEC["options"]
        for i, n in self.DECISIONS.items():
            d = n.get("defaultOption")
            if not d:
                continue
            key = d if d in opts else d[:-3] if d.endswith("-sc") else d
            self.assertIn(key, opts, f"{i} → {d}")
            self.assertIsInstance(opts[key], str, f"{i}: default বহু-slot বিকল্প হতে পারে না")

    def test_template_plain_slots_are_fed_by_required_or_default_decisions(self):
        """ছাঁচে `{{slot}}` সোজা লাইনে থাকলে তাকে খাওয়ানো কোনো decision আবশ্যক বা default-সহ হতে হবে;
        নইলে ঐচ্ছিক-অবাছা অবস্থায় লেখায় ‹? …› ফাঁকা চিহ্ন এসে পড়ত। ঐচ্ছিকের লাইন হবে `?slot`।"""
        feeds = {}
        for i, n in self.DECISIONS.items():
            info = self.SPEC["slots"].get(i) or self.SPEC["slots"].get(i[:-3] if i.endswith("-sc") else i)
            if info:
                feeds.setdefault(info["slot"], []).append(n)
        for mode, lines in self.SPEC["templates"].items():
            for ln in lines:
                if re.match(r"^\s*[?!]\w+\s", ln):
                    continue
                for slot in re.findall(r"\{\{(\w+)\}\}", ln):
                    ds = feeds.get(slot)
                    if not ds:
                        continue
                    self.assertTrue(any(d["need"] == "required" or d.get("defaultOption") for d in ds),
                                    f"{mode}: `{slot}` সোজা লাইনে, অথচ খাওয়ানো সব decision ঐচ্ছিক ও default-হীন")


class PageSource(unittest.TestCase):
    """সংঘর্ষ ঠেকাতে: একই id দুই element-এ, বা একই নামের function দুবার থাকলে পরেরটা আগেরটাকে চুপচাপ ঢেকে দেয়
    (breadcrumb-এ ঠিক এটাই ঘটেছিল: browser-এ ত্রুটি, অথচ build ও Node test পাস)।"""
    SRC = HERE / "src"

    def test_template_ids_are_unique(self):
        ids = re.findall(r'\sid="([^"]+)"', (self.SRC / "template.html").read_text(encoding="utf-8"))
        dup = sorted({i for i in ids if ids.count(i) > 1})
        self.assertEqual(dup, [], f"একই id একাধিক element-এ: {dup}")

    def test_no_function_declared_twice_in_a_script(self):
        scripts = [self.SRC / "app.js"] + sorted((self.SRC / "js").glob("*.js"))
        seen = {}
        for f in scripts:
            names = re.findall(r"^function\s+(\w+)", f.read_text(encoding="utf-8"), re.M)   # বাইরের স্তরের function (column 0)
            for n in names:
                self.assertNotIn(n, seen.get(f.name, set()), f"{f.name}: function {n} দুবার ঘোষিত")
                seen.setdefault(f.name, set()).add(n)

    def test_no_top_level_name_declared_twice_across_the_page_script(self):
        """পাতায় সব .js এক script-এ জোড়া লাগে (build.py), তাই বাইরের স্তরের const, let, class, function-এর নাম
        সব file মিলিয়ে একটাই হতে হবে। আগে শুধু একই file-এর function ধরা হতো; একটা const-এর দুবার ঘোষণায়
        পুরো পাতার script থেমে গিয়েছিল, অথচ build ও Node test পাস করেছিল।"""
        seen = {}
        for f in sorted((self.SRC / "js").glob("*.js")) + [self.SRC / "app.js"]:
            text = f.read_text(encoding="utf-8")
            names = re.findall(r"^(?:const|let|var|class|function\*?|async function)\s+(\w+)", text, re.M)
            for grp in re.findall(r"^(?:const|let|var)\s+\{([^}]*)\}", text, re.M):
                names += [x.split(":")[-1].strip().split("=")[0].strip() for x in grp.split(",") if x.strip()]
            for n in names:
                self.assertNotIn(n, seen, f"{n}: {seen.get(n)} ও {f.name}, দুই জায়গায় ঘোষিত")
                seen[n] = f.name

    def test_app_ids_used_exist_in_template(self):
        tpl = (self.SRC / "template.html").read_text(encoding="utf-8")
        ids = set(re.findall(r'\sid="([^"]+)"', tpl))
        app = (self.SRC / "app.js").read_text(encoding="utf-8")
        used = set(re.findall(r"getElementById\('([\w-]+)'\)", app)) | set(re.findall(r"\$\('#([\w-]+)'\)", app))
        # app.js নিজেই যে id-র element বানায় (toast ইত্যাদি) তা বাদ
        made = set(re.findall(r"\.id\s*=\s*'([\w-]+)'", app))
        missing = sorted(used - ids - made)
        self.assertEqual(missing, [], f"app.js যে id খোঁজে অথচ template-এ নেই: {missing}")


class Parts(unittest.TestCase):
    """পদ্ধতির নিজের অংশ: core = সাথে আসে (info, বাছা যায় না), optional = বাছা যায় (option, কারণসহ)।"""
    PARTS = [n for n in NODES if n.get("part")]

    def test_parts_have_valid_shape(self):
        by_parent = {}
        for n in NODES:
            for c in n.get("children") or []:
                by_parent[c["id"]] = n
        self.assertGreaterEqual(len(self.PARTS), 12)
        for n in self.PARTS:
            self.assertIn(n["part"], ("core", "optional"), n["id"])
            self.assertEqual(n["kind"], "info" if n["part"] == "core" else "option", n["id"])
            self.assertIn(by_parent[n["id"]].get("kind"), ("option", "tool"), f"{n['id']}: parent option/tool নয়")

    def test_optional_parts_explain_themselves(self):
        import copy
        root = copy.deepcopy(MAP)
        build.prepare(root)            # why/tradeoff build-সময়ে guidance থেকে বসে
        opt = [n for n in walk(root) if n.get("part") == "optional"]
        self.assertGreaterEqual(len(opt), 2)
        for n in opt:
            for f in ("when", "why", "tradeoff"):
                self.assertTrue(str(n.get(f, "")).strip(), f"{n['id']}: {f} নেই")

    def test_core_parts_are_never_the_only_thing_that_explains_a_choice(self):
        """core যার ভেতরে বসে, সেই parent-এর অন্তত একটা বাছার বিষয় (decision/option/tool) থাকতে হবে; নইলে শুধু ✓ চিহ্নের তালিকা।"""
        for p in {id(n): n for n in NODES for c in (n.get("children") or []) if c.get("part") == "core"}.values():
            self.assertTrue(any(c.get("kind") in ("decision", "option", "tool") for c in p["children"]), p["id"])


class CompareFlags(unittest.TestCase):
    """compare/peer পতাকার ভুল ব্যবহার build-এ আটকায়, যাতে তুলনা চুপচাপ ভেঙে না যায়।"""
    def check(self, mutate):
        import copy
        root = copy.deepcopy(MAP)
        mutate({n["id"]: n for n in walk(root)})
        build.prepare(root)
        with self.assertRaises(SystemExit):
            build.validate_plan(root)

    def test_unknown_compare_value_fails(self):
        self.check(lambda N: N["task"].update(compare="all"))

    def test_compare_needs_two_peers(self):
        def m(N):
            for c in N["task"]["children"][1:]:
                c["peer"] = False
        self.check(m)

    def test_peer_false_needs_alternatives_parent(self):
        self.check(lambda N: N["ft-cycle-loss"].update(peer=False))

    def test_peer_only_false(self):
        self.check(lambda N: N["semi-signal"].update(peer=True))


if __name__ == "__main__":
    unittest.main()


class SharedIncludes(unittest.TestCase):
    """Training-এর উপাদান shared.json-এ একবারই লেখা; তিন ধরনের ভেতরে কপি হয়ে বসে।"""
    SHARED = load("shared.json")["training-components"]
    GROUPS = {"from-scratch-training": ("sc-components", ""), "pretraining": ("pt-components", "-in-pt"), "fine-tuning": ("ft-components", "-in-ft")}

    def test_each_stage_has_all_components(self):
        by_id = {n["id"]: n for n in NODES}
        want = [c["name"] for c in self.SHARED]
        for stage, (gid, _) in self.GROUPS.items():
            g = by_id[gid]
            self.assertIn(g, by_id[stage]["children"], stage)
            self.assertEqual([c["name"] for c in g["children"]], want, stage)

    def test_copies_have_same_names_and_unique_ids(self):
        ids = [n["id"] for n in NODES]
        self.assertEqual(len(ids), len(set(ids)))
        by_id = {n["id"]: n for n in NODES}
        def names(n):
            return [n["name"]] + [x for c in n.get("children") or [] for x in names(c)]
        base = names(by_id["sc-components"])
        for gid in ("pt-components", "ft-components"):
            self.assertEqual(names(by_id[gid]), base, gid)

    def test_first_copy_keeps_original_ids(self):
        """গল্পের পথ, ref, alias মূল id ধরে আছে; সেগুলো from-scratch-এর কপিতে পৌঁছায়।"""
        by_id = {n["id"]: n for n in NODES}
        for c in self.SHARED:
            self.assertEqual(by_id[c["id"]]["name"], c["name"])
            self.assertIn(by_id[c["id"]], by_id["sc-components"]["children"])

    def test_components_are_info_and_not_selectable(self):
        for n in NODES:
            if n["id"].endswith("-in-pt") or n["id"].endswith("-in-ft"):
                self.assertEqual(n.get("kind"), "info", n["id"])

    def test_include_nodes_stay_out_of_output(self):
        for n in NODES:
            self.assertNotIn("include", n)
            self.assertNotIn("id_suffix", n)

    def test_training_branch_lists_three_ways_only(self):
        by_id = {n["id"]: n for n in NODES}
        self.assertEqual([c["id"] for c in by_id["training"]["children"]], ["from-scratch-training", "pretraining", "fine-tuning"])
