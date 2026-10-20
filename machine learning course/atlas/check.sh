#!/usr/bin/env bash
# এক কমান্ডে সব যাচাই:  bash atlas/check.sh        (course-এর root থেকে বা যেকোনো জায়গা থেকে)
#                         bash atlas/check.sh --online   (সঙ্গে tool-এর তথ্য GitHub/Hugging Face-এ মেলায়)
set -euo pipefail
cd "$(dirname "$0")/.."

echo "▶ ১. build (গঠন, নাম, kind, tool-তথ্য, কারণ-ক্ষেত্র যাচাইসহ)"
python3 atlas/build.py | tail -2

echo "▶ ২. data test (Python unittest)"
python3 -m unittest discover -s atlas/tests

echo "▶ ৩. বাছাই-engine test (Node, property-based)"
node --test atlas/tests/*.test.js | grep -E "^# (tests|pass|fail)"
node --test atlas/tests/*.test.js >/dev/null

if [ -f ml-mapping.html ]; then
  echo "▶ ৪. ml-mapping.html আপডেট আছে কি"
  python3 atlas/build.py --out .ml-mapping.check.html >/dev/null
  norm() { sed -E 's/তৈরি: [0-9-]+/তৈরি: X/' "$1"; }
  if diff -q <(norm ml-mapping.html) <(norm .ml-mapping.check.html) >/dev/null; then
    echo "   ঠিক আছে"
  else
    rm -f .ml-mapping.check.html
    echo "   ✗ ml-mapping.html পুরোনো। চালাও: python3 atlas/build.py --out ml-mapping.html" >&2
    exit 1
  fi
  rm -f .ml-mapping.check.html
fi

if [ "${1:-}" = "--online" ]; then
  echo "▶ ৫. tool-এর তথ্য আবার মেলানো (অনলাইন)"
  python3 atlas/verify_tools.py | tail -4
fi
echo "✓ সব ঠিক"
