#!/usr/bin/env bash
# Create or update the AppsIndie label set on a repository.
#
#   scripts/bootstrap_labels.sh appsindie/focus-loop
#
# Labels are declared once in .github/labels.json. Do not hand-write
# `gh label create` lines -- a label that exists in one repo and not another is
# how Devin assignment silently fails.
#
# Idempotent: an existing label is updated to match the declaration.

set -euo pipefail

repo="${1:-}"
if [ -z "$repo" ]; then
  echo "Usage: $0 <owner/repo>" >&2
  exit 2
fi

here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
labels_file="$here/.github/labels.json"

if [ ! -f "$labels_file" ]; then
  echo "$0: cannot find $labels_file" >&2
  exit 2
fi

command -v gh >/dev/null || { echo "$0: gh CLI is required" >&2; exit 2; }

count=0
while IFS=$'\t' read -r name color description; do
  [ -n "$name" ] || continue
  if gh label create "$name" --repo "$repo" --color "$color" \
      --description "$description" 2>/dev/null; then
    echo "created  $name"
  else
    gh label edit "$name" --repo "$repo" --color "$color" \
      --description "$description" >/dev/null
    echo "updated  $name"
  fi
  count=$((count + 1))
done < <(
  python3 -c '
import json, sys
for label in json.load(open(sys.argv[1])):
    print("\t".join([label["name"], label["color"], label["description"]]))
' "$labels_file"
)

echo "$count labels applied to $repo"
