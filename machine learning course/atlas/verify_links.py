#!/usr/bin/env python3
"""সব বাইরের https লিংক (tool-এর repo/docs, practice-এর সূত্র, how, ইতিহাস, নিয়মের সূত্র) জীবিত কি না দেখে।

  python3 atlas/verify_links.py          # মরা (404/410/DNS/timeout) থাকলে exit 1
  python3 atlas/verify_links.py --all    # 403/429-ও (bot-আটকানো) তালিকায় দেখায়

কিছু লেখে না। কিছু সাইট bot আটকায় (403/429): সেগুলো "অনিশ্চিত" বলে আলাদা দেখায়, ব্যর্থতা ধরে না।
"""
import json
import socket
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

DATA = Path(__file__).resolve().parent / "data"
UA = {"User-Agent": "Mozilla/5.0 (ml-atlas-link-check)"}


def walk(n):
    yield n
    for c in n.get("children") or []:
        yield from walk(c)


def collect():
    urls = {}
    def add(u, where):
        if u and str(u).startswith("https://"):
            urls.setdefault(u.split("#")[0], where)
    root = json.loads((DATA / "map.json").read_text(encoding="utf-8"))
    sys.path.insert(0, str(DATA.parent))
    import build
    build.expand_includes(root)   # shared.json-এর উপাদানের সূত্রও যাচাইয়ে ধরা পড়ুক
    for n in walk(root):
        add(n.get("docs"), n["name"])
        for h in n.get("how", []):
            add(h.get("u"), n["name"])
        if n.get("tool"):
            add(n["tool"].get("repo"), n["name"])
            add(n["tool"].get("docs"), n["name"])
    for e in json.loads((DATA / "guidance.json").read_text(encoding="utf-8"))["entries"].values():
        for h in e.get("how", []):
            add(h.get("u"), "guidance")
    for e in json.loads((DATA / "practice.json").read_text(encoding="utf-8"))["entries"]:
        for f in e["practice"].get("facts", []):
            add(f.get("u"), (e.get("names") or ["?"])[0])
    for e in json.loads((DATA / "history.json").read_text(encoding="utf-8"))["entries"]:
        for it in e["items"]:
            add(it.get("url"), (e.get("names") or ["?"])[0])
    for r in json.loads((DATA / "rules.json").read_text(encoding="utf-8"))["rules"]:
        add(r.get("url"), "rule " + r["id"])
    return urls


def check(u):
    for method in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(u, headers=UA, method=method)
            with urllib.request.urlopen(req, timeout=25) as r:
                return u, r.status, ""
        except urllib.error.HTTPError as e:
            if method == "HEAD" and e.code in (403, 405, 400, 501):
                continue   # কিছু সাইট HEAD মানে না; GET-এ আবার
            return u, e.code, str(e.reason)
        except (urllib.error.URLError, socket.timeout, TimeoutError) as e:
            if method == "HEAD":
                continue
            return u, 0, str(getattr(e, "reason", e))
        except Exception as e:  # noqa: BLE001
            return u, 0, str(e)
    return u, 0, "অজানা"


def main():
    urls = collect()
    show_all = "--all" in sys.argv
    with ThreadPoolExecutor(8) as ex:
        res = list(ex.map(check, urls))
    dead, unsure = [], []
    for u, code, why in res:
        if code in (403, 429):
            unsure.append((u, code))
        elif not (200 <= code < 400):
            dead.append((u, code, why))
    for u, code, why in dead:
        print(f"✗ {code or 'ERR'}  {u}   ({urls[u]}) {why}")
    if show_all:
        for u, code in unsure:
            print(f"? {code}  {u}   ({urls[u]})")
    print(f"\n{len(urls)}টা লিংক: {len(dead)} মরা, {len(unsure)} অনিশ্চিত (bot-আটকানো)")
    sys.exit(1 if dead else 0)


if __name__ == "__main__":
    main()
