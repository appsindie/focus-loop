# Reviewer routine prompts

The saved prompt for each Claude Code reviewer routine, kept in version control so it is
reviewable, diffable and re-syncable — the routine itself lives at
[claude.ai/code/routines](https://claude.ai/code/routines) and these files are the source
of truth for what is pasted there.

| File | Routine | Gate |
| --- | --- | --- |
| `shaping-review.md` | `shaping` | 1 |
| `code-review.md` | `code-review` | 2 |
| `portfolio-research-review.md` | `research` | 0 |
| `release-readiness-review.md` | `release` | 3 |

URLs and token secrets are in **AppsIndie Review Routine Registry**.

## Editing one

Change the file, then paste it into the routine. A prompt edited only in the UI is
invisible to review and will be silently overwritten the next time someone syncs from
here.

## Non-negotiables in every prompt

1. **Reference the `<routine-fire-payload>` block.** Devin fires these by API, so the
   payload is the only thing that says which PR to review. A prompt that does not
   reference it reviews nothing, returns green, and posts no verdict.
2. **Treat the payload as addressing only** — repository, branch, PR URL, diff range.
   Criteria come from the prompt and the `.agents/` corpus, never from the payload.
   Anyone holding the bearer token can send fire text.
3. **Apply `ai-review-pass` or `ai-review-rework`.** CI and the orchestrator read the
   label, not the review event.
4. **Never apply `gate-signed` and never merge.** Those are human acts.
5. **An applicability gate that produces no output when out of scope.** Silence is a
   successful outcome, not a failure.
