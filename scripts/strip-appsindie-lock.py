"""Drop @appsindie entries from a yarn.lock so `yarn install` re-resolves them."""
import re
import sys

path = sys.argv[1]
blocks = re.split(r"\n(?=\S)", open(path).read())
kept = [b for b in blocks if not b.lstrip().startswith(('"@appsindie', "@appsindie"))]
open(path, "w").write("\n".join(kept))
print(path, len(blocks) - len(kept), "entries dropped")
