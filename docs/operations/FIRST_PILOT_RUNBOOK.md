# First Pilot Runbook

How the first real product runs through the playbooks, end to end, with the two human gates.

## Preconditions

- The request and its decisions are captured in one thread (Slack or issue) that the run reports back to.
- A human sponsor (scope) and a designer (UI) are named — they own the shaping gate.
- The playbooks are available in `.agents/playbooks/`: `!shape_from_slack`, `!build_product`, `!release_product`, `!gtm_aso`, `!grow_product`.

## Branches and PRs

- One branch and one open PR per run by default: shaping artifacts, architecture and the slices that follow are pushed to it as separate commits, so review starts early and the human decides when to cut the PR.
- Devin never merges to `main` for a production-affecting change: the human merges after sign-off.
- Release tags are applied by the human after release sign-off.

## Step 1 — Shaping

Run `product-shaping.md`. Outputs: discovery notes, `PRODUCT_CONCEPT.md`, `PRODUCT_SPEC_LIVE.md`, `DESIGN.md`, mockups and journey boards, `DESIGN_REVIEW.md`.

Exit: scope signed by the sponsor, UI signed by the designer, open questions listed with working defaults. **Human gate.**

## Step 2 — Architecture

Run stage A of `product-build.md`. Outputs: `docs/architecture/ARC42_SYSTEM_LIVE.md` (external integrations, bounded contexts, context contracts, runtime shape) plus ADRs.

Exit: every journey in the Pilot phase can be traced to the contexts and integrations that implement it.

## Step 3 — Detailed design and QA plan

Run stages B and C. Outputs: per-capability designs, a sequence view per journey, and a QA plan with test cases derived from the journey acceptance criteria and failure modes.

Exit: the failure modes named in the spec each have a design path and a test case.

## Step 4 — Build slices

Run stage D in dependency order, UI-first, pushing each slice as its own commit with tests and CI green.

Exit: Pilot journeys implemented, QA smoke cases passing locally, living docs updated by the slices that changed them.

## Step 5 — Environments

Terraform for `sit` and `prod` ships with the slices that need it (`product-build.md` stage E); the apply happens in `product-release.md`. Exit: environments reproducible from Terraform, secrets wired, observability live.

## Step 6 — Release

Run `product-release.md`: SIT, readiness, **human gate**, progressive production rollout, post-release KPI review at day 7 and 14 recorded in `docs/release/POST_RELEASE_LEARNING.md`.

## Step 7 — Go-to-market

Run `go-to-market-and-aso.md` once the release is live.

## Go / no-go for the next cycle

Go when: no unresolved critical findings, smoke and regression passing (or formally deferred with an owner), north-star instrumentation emitting real data, and the escalations from the cycle are closed.

No-go when: a security blocker is open, a rollout threshold was breached without a resolved cause, or the north-star metric cannot be measured — a cycle that cannot be measured cannot be judged.
