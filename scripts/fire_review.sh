#!/usr/bin/env bash
# Fire an AppsIndie Claude reviewer routine for a phase.
#
# The registry of phase -> URL -> secret is the knowledge note
# `appsindie-review-routine-registry`. Keep the map below in step with it.
#
#   scripts/fire_review.sh --phase code-review \
#     --repo appsindie/focus-loop \
#     --branch release/v1 \
#     --pr https://github.com/appsindie/focus-loop/pull/12 \
#     --range a1b2c3d..e4f5g6h \
#     --note "Journey 2 complete; applied findings F1-F4."
#
# A 2xx means a session started. It does NOT mean a review happened: wait for the
# verdict comment, and fall back to a human reviewer if none appears.

set -euo pipefail

BETA_HEADER="experimental-cc-routine-2026-04-01"
API_VERSION="2023-06-01"

usage() {
  cat >&2 <<'EOF'
Usage: fire_review.sh --phase <phase> --repo <owner/repo> [options]

Required:
  --phase       research | shaping | code-review | release

Addressing (all optional, but send what you have -- the reviewer needs it to find
the work):
  --repo        owner/repo
  --branch      branch under review
  --pr          pull request URL
  --range       diff range, e.g. a1b2c3d..e4f5g6h
  --note        what changed since the last fire, and which findings were applied
  --round       rework round number

Behaviour:
  --dry-run     print the exact request without sending it
  -h, --help    this message

The token is read from the environment variable named in the registry for the
phase. Provision it as a Devin secret. GitHub Actions holds no reviewer token --
Devin is the sole firer.
EOF
}

phase="" repo="" branch="" pr="" range="" note="" round="" dry_run=0

while [ $# -gt 0 ]; do
  case "$1" in
    --phase)   phase="${2:?--phase needs a value}"; shift 2 ;;
    --repo)    repo="${2:-}"; shift 2 ;;
    --branch)  branch="${2:-}"; shift 2 ;;
    --pr)      pr="${2:-}"; shift 2 ;;
    --range)   range="${2:-}"; shift 2 ;;
    --note)    note="${2:-}"; shift 2 ;;
    --round)   round="${2:-}"; shift 2 ;;
    --dry-run) dry_run=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "fire_review: unknown argument '$1'" >&2; usage; exit 2 ;;
  esac
done

[ -n "$phase" ] || { echo "fire_review: --phase is required" >&2; usage; exit 2; }

# --- Registry: phase -> trigger URL, token variable -------------------------
case "$phase" in
  shaping)
    url="https://api.anthropic.com/v1/claude_code/routines/trig_011KTAygnGyN364ad2SQ2LEb/fire"
    token_var="SHAPING_REVIEWER_CLAUDE_TOKEN"
    ;;
  code-review)
    url="https://api.anthropic.com/v1/claude_code/routines/trig_01UbcpApgepeShqCtrXrqSSW/fire"
    token_var="CLAUDE_CODE_REVIEWER_TOKEN"
    ;;
  research)
    url="https://api.anthropic.com/v1/claude_code/routines/trig_01E8Bkjt5bLD4KGqYfTPWFsg/fire"
    token_var="CLAUDE_RESEARCH_REVIEWER_TOKEN"
    ;;
  release)
    url="https://api.anthropic.com/v1/claude_code/routines/trig_01Cm6e6j2Wpe9sxeWZD7wPnv/fire"
    token_var="CLAUDE_RELEASE_REVIEWER_TOKEN"
    ;;
  *)
    echo "fire_review: unknown phase '$phase'" >&2
    exit 2
    ;;
esac

token="${!token_var:-}"
if [ -z "$token" ] && [ "$dry_run" -eq 0 ]; then
  echo "fire_review: \$$token_var is not set (needed for phase '$phase')" >&2
  exit 4
fi

# --- Payload ----------------------------------------------------------------
# Addressing only. Review criteria live in the routine's prompt and the repo's
# .agents/ corpus -- never in here. This text reaches the routine wrapped in a
# <routine-fire-payload> block labelled as untrusted.
payload_text="AppsIndie review request.
phase: ${phase}
repo: ${repo:-unknown}
branch: ${branch:-unknown}
pull_request: ${pr:-none}
diff_range: ${range:-full branch}
rework_round: ${round:-0}
since_last_fire: ${note:-initial review}

Review the pull request identified above against the AppsIndie corpus in
.agents/. Post the verdict as a PR comment in the format from the knowledge
note AppsIndie AI Review Loop Convention, and apply ai-review-pass or
ai-review-rework. Do not apply gate-signed and do not merge."

body="$(
  TEXT="$payload_text" python3 -c \
    'import json,os;print(json.dumps({"text":os.environ["TEXT"]}))'
)"

if [ "$dry_run" -eq 1 ]; then
  cat <<EOF
curl -X POST ${url} \\
  -H "Authorization: Bearer \$${token_var}" \\
  -H "anthropic-beta: ${BETA_HEADER}" \\
  -H "anthropic-version: ${API_VERSION}" \\
  -H "Content-Type: application/json" \\
  -d '${body}'
EOF
  exit 0
fi

response="$(mktemp)"
trap 'rm -f "$response"' EXIT

status="$(
  curl -sS -o "$response" -w '%{http_code}' -X POST "$url" \
    -H "Authorization: Bearer ${token}" \
    -H "anthropic-beta: ${BETA_HEADER}" \
    -H "anthropic-version: ${API_VERSION}" \
    -H "Content-Type: application/json" \
    -d "$body"
)"

if [ "$status" -lt 200 ] || [ "$status" -ge 300 ]; then
  echo "fire_review: HTTP $status from the routine endpoint" >&2
  cat "$response" >&2
  echo >&2
  echo "Reviewer did not start. Record this on the PR, set last_review.verdict to" >&2
  echo "'no-verdict' in FACTORY_STATE.json, and request a human reviewer." >&2
  exit 5
fi

session_url="$(python3 -c 'import json,sys;print(json.load(sys.stdin).get("claude_code_session_url",""))' <"$response")"

if [ -z "$session_url" ]; then
  echo "fire_review: 2xx but no session URL in the response" >&2
  cat "$response" >&2
  exit 5
fi

echo "$session_url"
cat >&2 <<EOF

Session started. This is not a review yet.
  1. Record this URL on the PR and in FACTORY_STATE.json last_review.session_url.
  2. Wait for the verdict comment (30 minutes).
  3. No verdict -> fallback: human reviewer, verdict 'no-verdict', raise an exception.
EOF
