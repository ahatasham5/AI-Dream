#!/usr/bin/env python3
"""বাংলা audio-pack: map-এর প্রতিটা পড়ার অংশের (সংজ্ঞা, গল্প) জন্য একটা audio-ফাইল বানায়, আর পাতাকে জানাতে audio/manifest.js লেখে।

পাতা এই ফাইলগুলো পেলে সেগুলোই বাজায়; না পেলে browser-এর বাংলা voice (src/app.js, "বাংলা audio পড়া")।
ফাইলের নাম = লেখার key (src/js/reader.js), তাই লেখা বদলালে শুধু বদলানোগুলোই আবার বানাতে হয়; আগের ফাইল ফেলা হয় না, আবার চালালে বাকিটা।

ব্যবহার (course-এর root থেকে):
  python3 atlas/build.py                                    # আগে পাতা বানাও
  python3 atlas/audio_pack.py --dry-run                     # কত অক্ষর, কত সময়, কত জায়গা: কিছু খরচ হয় না
  AZURE_SPEECH_KEY=... python3 atlas/audio_pack.py --provider azure --region centralindia --yes

পয়সা-খরচের কাজ তাই `--yes` ছাড়া চলে না, আর `--max-chars` (ডিফল্ট ৬,০০,০০০) পেরোলে থামে। key কখনো ছাপা বা ফাইলে লেখা হয় না।
শুধু standard library; Azure REST অনুরোধের গঠন Microsoft-এর TTS REST API reference থেকে মিলিয়ে লেখা, কিন্তু আসল key দিয়ে চালানো হয়নি।"""
import argparse
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from xml.sax.saxutils import escape

HERE = Path(__file__).resolve().parent
SEGMENTS_JS = HERE / "tools" / "segments.js"
CHARS_PER_SEC = 14          # অনুমান, মাপা নয়: বাংলা ধীর-স্বাভাবিক গতিতে
BYTES_PER_SEC = 6000        # 48 kbit/s mp3


def collect(html: Path):
    """পাতার data থেকে পড়ার অংশ (একই লেখা একবারই), reader.js দিয়ে।"""
    out = subprocess.run(["node", str(SEGMENTS_JS), str(html)], capture_output=True, check=True)
    return json.loads(out.stdout.decode("utf-8"))


def summary(segments):
    chars = sum(len(s["speech"]) for s in segments)
    secs = chars / CHARS_PER_SEC
    return {"segments": len(segments), "chars": chars, "hours": secs / 3600, "mb": secs * BYTES_PER_SEC / 1e6}


def ssml(text, voice):
    lang = "-".join(voice.split("-")[:2])
    return f"<speak version='1.0' xml:lang='{lang}'><voice xml:lang='{lang}' name='{voice}'>{escape(text)}</voice></speak>"


def synth_azure(text, *, region, voice, fmt, key, retries=5):
    """Azure Speech REST: POST https://<region>.tts.speech.microsoft.com/cognitiveservices/v1 (SSML)।"""
    url = f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1"
    req = urllib.request.Request(url, data=ssml(text, voice).encode("utf-8"), method="POST", headers={
        "Ocp-Apim-Subscription-Key": key, "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": fmt, "User-Agent": "atlas-audio-pack"})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 502, 503) and attempt < retries - 1:
                time.sleep(2 ** attempt)           # ধীর হও, তারপর আবার
                continue
            raise RuntimeError(f"Azure TTS HTTP {e.code} (key বা region ঠিক আছে কি?)") from None
    raise RuntimeError("Azure TTS: বারবার ব্যর্থ")


def write_manifest(out: Path, segments, voice, ext):
    files = {s["key"]: f"{s['key']}.{ext}" for s in segments if (out / f"{s['key']}.{ext}").exists()}
    body = {"v": 1, "voice": voice, "files": files}
    (out / "manifest.js").write_text("window.ATLAS_AUDIO=" + json.dumps(body, ensure_ascii=False) + ";\n", encoding="utf-8")
    return len(files)


def pack(segments, out: Path, synth, *, voice="", ext="mp3", sleep=0.0, progress=None):
    """যে অংশের ফাইল নেই শুধু সেগুলো বানায় (আবার চালানো নিরাপদ); ফাইল আগে tmp-এ, তারপর নাম বদল, তাই অর্ধেক ফাইল থাকে না।"""
    out.mkdir(parents=True, exist_ok=True)
    made = skipped = 0
    for n, s in enumerate(segments, 1):
        target = out / f"{s['key']}.{ext}"
        if target.exists():
            skipped += 1
            continue
        data = synth(s["speech"])
        tmp = target.with_suffix(target.suffix + ".part")
        tmp.write_bytes(data)
        tmp.replace(target)
        made += 1
        if progress:
            progress(n, len(segments), made)
        if made % 25 == 0:
            write_manifest(out, segments, voice, ext)      # মাঝপথে থামলেও এ পর্যন্তটা কাজে লাগে
        if sleep:
            time.sleep(sleep)
    total = write_manifest(out, segments, voice, ext)
    return {"made": made, "skipped": skipped, "in_manifest": total}


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--html", default=str(HERE / "dist" / "index.html"), help="build-করা পাতা (ডিফল্ট atlas/dist/index.html)")
    ap.add_argument("--out", default="audio", help="audio folder (ডিফল্ট ./audio, পাতার পাশে রাখো)")
    ap.add_argument("--dry-run", action="store_true", help="শুধু হিসাব দেখাও, কিছু বানাও না, কিছু খরচ হয় না")
    ap.add_argument("--provider", choices=["azure"], help="কোন সেবা দিয়ে বানাবে")
    ap.add_argument("--region", help="Azure Speech resource-এর region, যেমন centralindia")
    ap.add_argument("--voice", default="bn-BD-NabanitaNeural", help="ডিফল্ট bn-BD-NabanitaNeural (নারী); পুরুষ: bn-BD-PradeepNeural")
    ap.add_argument("--format", default="audio-24khz-48kbitrate-mono-mp3")
    ap.add_argument("--limit", type=int, help="পরীক্ষার জন্য শুধু প্রথম N অংশ")
    ap.add_argument("--sleep", type=float, default=0.2, help="অনুরোধের মাঝে বিরতি (সেকেন্ড)")
    ap.add_argument("--max-chars", type=int, default=600_000, help="এর বেশি অক্ষর লাগলে থামে (বিল-ধাক্কা ঠেকাতে)")
    ap.add_argument("--yes", action="store_true", help="পয়সা-খরচের অনুরোধ সত্যিই পাঠাও")
    a = ap.parse_args(argv)

    html = Path(a.html)
    if not html.exists():
        sys.exit(f"পাতা নেই: {html}\nআগে চালাও: python3 atlas/build.py")
    segs = collect(html)
    if a.limit:
        segs = segs[: a.limit]
    s = summary(segs)
    print(f"পড়ার অংশ: {s['segments']}টা (একই লেখা একবার), মোট {s['chars']:,} অক্ষর")
    print(f"আনুমানিক: প্রায় {s['hours']:.1f} ঘণ্টা audio, প্রায় {s['mb']:.0f} MB (অনুমান: {CHARS_PER_SEC} অক্ষর/সেকেন্ড, 48 kbit/s; মাপা নয়)")
    out = Path(a.out)
    have = sum(1 for x in segs if (out / f"{x['key']}.mp3").exists())
    todo = [x for x in segs if not (out / f"{x['key']}.mp3").exists()]
    todo_chars = sum(len(x["speech"]) for x in todo)
    print(f"ফাইল আছে {have}টা; বাকি {len(todo)}টা, {todo_chars:,} অক্ষর")
    if a.dry_run or not a.provider:
        print("এটা শুধু হিসাব ছিল। বানাতে: --provider azure --region <region> --yes (key: AZURE_SPEECH_KEY)")
        return 0
    if todo_chars > a.max_chars:
        sys.exit(f"{todo_chars:,} অক্ষর --max-chars {a.max_chars:,}-এর বেশি: থামলাম। জেনেবুঝে চাইলে --max-chars বাড়াও।")
    key = os.environ.get("AZURE_SPEECH_KEY", "")
    if not key or not a.region:
        sys.exit("AZURE_SPEECH_KEY (environment-এ) আর --region লাগে। key কখনো command-এ লিখো না।")
    if not a.yes:
        sys.exit(f"{todo_chars:,} অক্ষরের জন্য Azure-এ অনুরোধ যাবে, যা বিল হতে পারে। নিশ্চিত হলে --yes দাও।")
    synth = lambda text: synth_azure(text, region=a.region, voice=a.voice, fmt=a.format, key=key)
    res = pack(segs, out, synth, voice=a.voice, sleep=a.sleep,
               progress=lambda n, t, m: print(f"\r  {n}/{t} (নতুন {m})", end="", flush=True))
    print(f"\nশেষ: নতুন {res['made']}টা, আগে ছিল {res['skipped']}টা, manifest-এ {res['in_manifest']}টা। audio/ folder পাতার পাশে রাখো।")
    return 0


if __name__ == "__main__":
    sys.exit(main())
