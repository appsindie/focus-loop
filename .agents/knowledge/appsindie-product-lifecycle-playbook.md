---
name: AppsIndie Product Lifecycle Playbook
id: note-8612989387f847f89941c56dc38984ba
author: user
scope: When working through the product lifecycle phases in any AppsIndie project
---

# AppsIndie Product Lifecycle Playbook (Global)

Take a product idea into users' hands, then decide whether it keeps its slot.

**This note is the phase sequence and the exit criteria.** It deliberately does *not*
restate how a phase is executed — that lives in exactly one place, the playbook for that
phase, and duplicating it here is how the two drift and agents start picking arbitrarily.

A phase starts only when the previous one's exit checklist is done and its gate is
signed. Between gates the factory advances itself; see **AppsIndie AI Software Factory**.

Architecture is part of **Shape** (high-level boundaries, integrations, runtime shape,
current/target/transition), not a separate build-only phase.

| Phase | Playbook | Skills | Gate at exit |
| --- | --- | --- | --- |
| 0 Research | `!research_opportunity` | `opportunity-research` | **Gate 0** Approve Opportunity |
| 1 Shape | `!shape_from_slack` | `product-shaping`, `product-design`, `architecture` | **Gate 1** Approve Product |
| 2 Build | `!build_product` | `engineering`, `qa`, `security` | **Gate 2** Approve SIT |
| 3 Release | `!release_product` | `release`, `production-readiness`, `expo-mobile-release-and-compliance` | **Gate 3** Approve Production |
| 4 Grow | `!grow_product`, `!gtm_aso` | `growth`, `go-to-market` | **Gate 4** Continue / Iterate / Sunset |

Standards live in **AppsIndie Team Rules**, **AppsIndie Security Trigger Policy**,
**AppsIndie PR Labeling and Reviewer Convention** and **AppsIndie AI Review Loop
Convention**. Portfolio slot rules are in **AppsIndie Portfolio Opportunity Policy**.
Branch and PR shape is in **AppsIndie Branching and Checkpoint Convention**.

---

## Phase 0 — Research

Decide whether an idea deserves a portfolio slot before any product repository exists.
Run `!research_opportunity` (Stage 1A → 1B → 2 → 3, one stage per run; Stage 3 one idea
per run). Stop at Gate 0 — do not bootstrap a product repo on `HOLD`, reviewer-`REJECT`,
or S3.13 `REJECT`.

### Exit checklist

- [ ] Stage 3 Final Decision JSON committed with Base-case economics from `scoring-output.json`
- [ ] Reviewer routine verdict recorded and `ai-review-pass` applied
- [ ] **Gate 0:** both signature boxes signed (verdict trustworthy + grant portfolio slot), or an explicit non-`VALIDATE NOW` recorded
- [ ] On `VALIDATE NOW` only, and only with an explicit human go-ahead: product repo created and JSON copied to `docs/research/OPPORTUNITY_DECISION.json`

## Phase 1 — Shape

Turn a Gate 0–approved opportunity (or a waived feature request) into a concept, a
journey/screen spec, a design set and a high-level architecture a build can start from.
Cut ruthlessly: a journey or screen that moves neither north-star metric does not enter
the spec. No traceability matrix and no per-task issue decomposition — journey
dependencies are enough.

### Exit checklist

- [ ] North-star metric(s) + guard-rail stated, with how each is measured
- [ ] Every channel has objective, persona, pain, gain
- [ ] Journey → screen map complete; every screen tied to a pain or gain
- [ ] Scope cuts listed explicitly, with why
- [ ] Every journey has value, entry, exit (success / alternate / failure), internal navigation, rules, variants and failure modes
- [ ] Every screen has intent, entry, data, one primary action, screen rules, design reference
- [ ] Every failure mode says what the user sees, who gets the exception, and the recovery action
- [ ] High-level architecture covers bounded contexts, integrations, runtime/deployment shape, current/target/transition views
- [ ] Open questions listed with working defaults
- [ ] **Validation gate:** `MARKET_RESEARCH_LIVE.md` (or equivalent) exists with a named owner, target date and pass/fail criteria; fieldwork completed before build on the Pilot path proceeds
- [ ] **Opportunity gate (new products):** `docs/research/OPPORTUNITY_DECISION.json` present, or an explicit PR waiver for a feature on an existing product
- [ ] **Gate 1:** sponsor signed scope; designer signed UI; `gate-signed` applied

## Phase 2 — Build

Take a signed-off shaping set to working, tested software: detailed design per bounded
context with a sequence view per journey, a QA plan whose cases are executable by hand,
then journey slices UI-first with north-star instrumentation in the slice. Infrastructure
ships in the same slice as the workload, Terraform only.

### Exit checklist

- [ ] Detailed design covers data ownership, invariants and failure paths; one sequence view per journey
- [ ] ADRs recorded for irreversible decisions, including the rejected options
- [ ] QA plan states scope, environments, criteria and executable cases
- [ ] All Pilot/MVP journeys implemented end to end
- [ ] Lint, typecheck, tests green; living docs current
- [ ] North-star events instrumented
- [ ] Security triggers evaluated per **AppsIndie Security Trigger Policy** and any required pass recorded
- [ ] **Gate 2:** a human tested SIT and applied `gate-signed`

## Phase 3 — Release

Get the built product through SIT into production. Stage 1 SIT, Stage 2 readiness
(machine-checked, output is an exception report), Stage 3 production with progressive
rollout. Mobile promotion to the store stays a human action even after Gate 3.

### Exit checklist

- [ ] SIT regression and failure-mode cases passed
- [ ] Every defect fixed or accepted with an owner and a date
- [ ] North-star events verified emitting from the deployed environment
- [ ] Changelog, store compliance and rollback plan ready; rollback rehearsed for *this* release
- [ ] SLOs and rollout halt thresholds defined; every SLO backed by a test-fired alert
- [ ] Readiness checks run; exception report produced
- [ ] **Gate 3:** human decided on the exception report and applied `gate-signed`
- [ ] Production rollout executed with thresholds honoured
- [ ] Release tagged, notes published, `docs/release/` updated
- [ ] Day 7 / day 14 growth review dates recorded in `FACTORY_STATE.json` `next_action`

## Phase 4 — Grow

Two separate jobs: make the product findable (`!gtm_aso`, positioning → keywords →
listing → creative → reviews → measure), and decide whether it earns its slot
(`!grow_product`). Shipping the binary, winning the install and deserving the slot are
three different things.

### Exit checklist

- [ ] Positioning sentence agreed and reused
- [ ] Keyword set per store/locale with baseline rank; listing copy native per locale
- [ ] Icon, screenshots and preview video follow the design system
- [ ] Review prompt placed at a success moment; reply routine assigned
- [ ] Conversion funnel measurable
- [ ] Day 7 and day 14 growth reviews written up — **including when the movement disappoints**
- [ ] Actuals compared against Gate 0 `validation_metrics`, `kill_criteria` and `economic_summary`, using the same contribution definitions, without re-baselining
- [ ] **Gate 4:** `CONTINUE` / `ITERATE` / `SUNSET` recommended and signed
- [ ] On `SUNSET`: slot released, sunset runbook followed, outcome and measured variance written to `backlog.md`
- [ ] On `ITERATE`: the named change enters Phase 1 shaping — it does not skip shaping
