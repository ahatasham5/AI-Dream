"""audio-pack-এর test: নেটওয়ার্ক বা key ছাড়াই (নকল synthesizer দিয়ে)। চালানো: python3 -m unittest discover -s atlas/tests"""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HERE))
import audio_pack  # noqa: E402

SEGS = [
    {"key": "aaaaaaaaaaaaaaaa", "label": "সংজ্ঞা", "text": "এক", "speech": "এক"},
    {"key": "bbbbbbbbbbbbbbbb", "label": "ধারণা", "text": "দুই", "speech": "দুই"},
    {"key": "cccccccccccccccc", "label": "সমস্যা", "text": "তিন", "speech": "তিন"},
]


def manifest(out):
    body = (out / "manifest.js").read_text(encoding="utf-8")
    assert body.startswith("window.ATLAS_AUDIO=") and body.rstrip().endswith(";")
    return json.loads(body[len("window.ATLAS_AUDIO="):].rstrip().rstrip(";"))


class Pack(unittest.TestCase):
    def test_makes_files_and_manifest_and_resumes_without_repeating(self):
        calls = []
        def fake(text):
            calls.append(text)
            return b"ID3fake"
        with tempfile.TemporaryDirectory() as d:
            out = Path(d) / "audio"
            r = audio_pack.pack(SEGS, out, fake, voice="v")
            self.assertEqual((r["made"], r["skipped"], r["in_manifest"]), (3, 0, 3))
            m = manifest(out)
            self.assertEqual(m["voice"], "v")
            self.assertEqual(set(m["files"]), {s["key"] for s in SEGS})
            self.assertTrue(all((out / f).exists() for f in m["files"].values()))
            calls.clear()
            r2 = audio_pack.pack(SEGS, out, fake, voice="v")
            self.assertEqual((r2["made"], r2["skipped"], len(calls)), (0, 3, 0), "আবার চালালে নতুন করে কিছু বানায়নি")
            self.assertEqual(r2["in_manifest"], 3, "কিছু না বানালেও manifest ফাঁকা হয়নি")

    def test_partial_failure_leaves_no_half_file_and_resumes(self):
        n = {"i": 0}
        def flaky(text):
            n["i"] += 1
            if n["i"] == 2:
                raise RuntimeError("boom")
            return b"ID3ok"
        with tempfile.TemporaryDirectory() as d:
            out = Path(d)
            with self.assertRaises(RuntimeError):
                audio_pack.pack(SEGS, out, flaky)
            self.assertEqual(sorted(p.name for p in out.glob("*.part")), [], "অর্ধেক-লেখা ফাইল পড়ে আছে")
            self.assertEqual(sorted(p.name for p in out.glob("*.mp3")), ["aaaaaaaaaaaaaaaa.mp3"])
            r = audio_pack.pack(SEGS, out, lambda t: b"ID3ok")
            self.assertEqual((r["made"], r["skipped"], r["in_manifest"]), (2, 1, 3))

    def test_manifest_lists_only_files_that_exist(self):
        with tempfile.TemporaryDirectory() as d:
            out = Path(d)
            (out / "aaaaaaaaaaaaaaaa.mp3").write_bytes(b"x")
            self.assertEqual(audio_pack.write_manifest(out, SEGS, "v", "mp3"), 1)
            self.assertEqual(list(manifest(out)["files"]), ["aaaaaaaaaaaaaaaa"])


class Ssml(unittest.TestCase):
    def test_escapes_xml_and_uses_the_voice_locale(self):
        x = audio_pack.ssml("a < b & c > d", "bn-BD-NabanitaNeural")
        self.assertIn("a &lt; b &amp; c &gt; d", x)
        self.assertIn("xml:lang='bn-BD'", x)
        self.assertIn("name='bn-BD-NabanitaNeural'", x)


class RealData(unittest.TestCase):
    """পাতার আসল data থেকে node-এর reader.js দিয়ে অংশ আসে, আর key আর লেখা একই reader.js-এর।"""
    def test_collect_matches_the_page_logic(self):
        html = HERE / "dist" / "index.html"
        if not html.exists():
            self.skipTest("dist/index.html নেই (আগে build চালাও)")
        segs = audio_pack.collect(html)
        self.assertGreater(len(segs), 500)
        keys = [s["key"] for s in segs]
        self.assertEqual(len(keys), len(set(keys)), "একই key দুবার")
        self.assertTrue(all(len(k) == 16 for k in keys))
        self.assertTrue(all(s["speech"] and s["text"] for s in segs))
        r = subprocess.run(["node", "-e", "const R=require(process.argv[1]);process.stdout.write(R.key(process.argv[2]))",
                            str(HERE / "src" / "js" / "reader.js"), segs[0]["text"]], capture_output=True, check=True)
        self.assertEqual(r.stdout.decode(), segs[0]["key"])

    def test_dry_run_changes_nothing_and_needs_no_key(self):
        html = HERE / "dist" / "index.html"
        if not html.exists():
            self.skipTest("dist/index.html নেই")
        with tempfile.TemporaryDirectory() as d:
            rc = audio_pack.main(["--html", str(html), "--out", str(Path(d) / "a"), "--dry-run"])
            self.assertEqual(rc, 0)
            self.assertFalse((Path(d) / "a").exists(), "dry-run folder বানিয়েছে")

    def test_spending_is_blocked_without_yes_key_and_over_the_limit(self):
        html = HERE / "dist" / "index.html"
        if not html.exists():
            self.skipTest("dist/index.html নেই")
        import os
        old = os.environ.pop("AZURE_SPEECH_KEY", None)
        try:
            with tempfile.TemporaryDirectory() as d:
                base = ["--html", str(html), "--out", str(Path(d) / "a"), "--provider", "azure", "--region", "centralindia"]
                for extra in (["--max-chars", "10"], [], ["--yes"]):
                    with self.assertRaises(SystemExit):
                        audio_pack.main(base + extra)
                self.assertFalse((Path(d) / "a").exists(), "অনুমতি ছাড়া folder বা অনুরোধ হয়েছে")
        finally:
            if old is not None:
                os.environ["AZURE_SPEECH_KEY"] = old


if __name__ == "__main__":
    unittest.main()
