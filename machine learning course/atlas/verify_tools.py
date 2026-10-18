#!/usr/bin/env python3
"""map.json-এর সব tool node-এর তথ্য (licence, archived, শেষ push) আবার GitHub/Hugging Face API থেকে মিলিয়ে দেখে।

tool-এর তথ্য সময়ের সঙ্গে পুরোনো হয় (repo archived হয়, licence বদলায়)। মাঝে মাঝে এটা চালাও।
কিছু লেখে না, শুধু অমিল জানায়। GitHub-এ লগইন-ছাড়া ঘণ্টায় ৬০টা অনুরোধ চলে।

  python3 atlas/verify_tools.py
"""
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
MAP = HERE / "data" / "map.json"


def _token():
    """GITHUB_TOKEN থাকলে সেটা; না থাকলে লগইন-করা `gh` থাকলে তার token (শুধু পড়ার অনুরোধে ব্যবহার)।"""
    if os.environ.get("GITHUB_TOKEN"):
        return os.environ["GITHUB_TOKEN"]
    try:
        out = subprocess.run(["gh", "auth", "token"], capture_output=True, text=True, timeout=10)
        return out.stdout.strip() if out.returncode == 0 else ""
    except Exception:  # noqa: BLE001
        return ""


TOKEN = None


def get(url):
    global TOKEN
    if TOKEN is None:
        TOKEN = _token()
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "ml-atlas-verify"}
    if TOKEN and "api.github.com" in url:
        headers["Authorization"] = "Bearer " + TOKEN
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=25) as r:
        return json.load(r)


def walk(n):
    yield n
    for c in n.get("children") or []:
        yield from walk(c)


def main():
    root = json.loads(MAP.read_text(encoding="utf-8"))
    tools = [n for n in walk(root) if n.get("kind") == "tool"]
    seen, bad = set(), 0
    for n in tools:
        t = n["tool"]
        repo = t["repo"]
        if repo in seen:
            continue
        seen.add(repo)
        try:
            m = re.match(r"https://github.com/([^/]+/[^/]+)", repo)
            if m:
                d = get("https://api.github.com/repos/" + m.group(1))
                lic = (d.get("license") or {}).get("spdx_id")
                arch, pushed = d["archived"], d["pushed_at"][:10]
                problems = []
                if bool(t.get("archived")) != arch:
                    problems.append(f"archived: map={t.get('archived')} এখন={arch}")
                if lic and lic != t["license"] and lic != "NOASSERTION":
                    problems.append(f"licence: map={t['license']} এখন={lic}")
                if not arch and d["pushed_at"][:4] < "2025":
                    problems.append(f"অনেকদিন আপডেট নেই: {pushed}")
            else:
                m = re.match(r"https://huggingface.co/([^/]+/[^/]+)", repo)
                if not m:
                    continue
                d = get("https://huggingface.co/api/models/" + m.group(1))
                problems = [] if "id" in d else ["model পাওয়া যায়নি"]
            print(("✗ " if problems else "✓ ") + n["name"] + ("  → " + "; ".join(problems) if problems else ""))
            bad += bool(problems)
        except urllib.error.HTTPError as e:
            if e.code == 403:
                print(f"\n⏸ GitHub-এর অনুরোধ-সীমা শেষ ({n['name']}-এ থামলাম)। ঘণ্টাখানেক পরে চালাও, "
                      "বা GITHUB_TOKEN=... দিয়ে চালালে সীমা অনেক বেশি।")
                sys.exit(2)
            print(f"? {n['name']}  → যাচাই করা যায়নি: {e}")
            bad += 1
        except Exception as e:  # noqa: BLE001
            print(f"? {n['name']}  → যাচাই করা যায়নি: {e}")
            bad += 1
    print(f"\n{len(seen)}টা অনন্য repo, {bad}টায় অমিল বা সমস্যা")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
