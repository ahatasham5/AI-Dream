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


NODES = list(walk(MAP))
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


if __name__ == "__main__":
    unittest.main()
