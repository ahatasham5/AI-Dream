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
