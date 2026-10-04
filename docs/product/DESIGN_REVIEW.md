# Focus Loop — Design review log

Sponsor: justin.nguyen@appsindie.com · Canvas: https://claude.ai/artifact/353nThLC4HuEBSdmAZFuUd

Merging a `design-sync` PR is the sponsor's approval of that canvas version. Newest round on top.

## Open shaping points

| Id    | Point                                                                                                                                                                                                                                                                                                                                              | Proposed default                    | Owner   |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------- |
| OP-01 | ~~Plus pricing (yearly, lifetime) and trial length~~ — closed 2026-10-03: sponsor confirmed ("chốt giá") **Yearly $19.99 with 7-day trial, Lifetime $49.99**. Spec J7-R2.                                                                                                                                                                          | Closed                              | Sponsor |
| OP-02 | ~~Rewarded unlock: 24-hour trial vs permanent~~ — closed 2026-10-03: sponsor confirmed **24-hour trial**; permanent unlock only via Plus. Spec J8-R2.                                                                                                                                                                                              | Closed                              | Sponsor |
| OP-03 | ~~Default of Settings → Show seconds~~ — closed 2026-10-03: sponsor confirmed ("chốt seconds") **default on**, affects Numbers display only. Spec J10-R2.                                                                                                                                                                                          | Closed                              | Sponsor |
| OP-04 | ~~Streak removed in favour of a weekly goal~~ — closed 2026-10-03: sponsor confirmed ("bỏ streak") **weekly goal, any 4 of 7 days**. North-star tracking = "days focused per week". Spec J2-R6, J6-R1.                                                                                                                                             | Closed                              | Sponsor |
| OP-05 | ~~Interstitial frequency cap~~ — closed 2026-10-03: frequency and caps are server-side; the design only fixes trigger points (leaving Loop complete; leaving Close-out after the 2nd focus when the loop is not completed). Sponsor 2026-10-03: "admod limit là do admob server config" → AdMob console configuration, no owned backend (ADR-003). | Closed                              | Sponsor |
| OP-06 | ~~App icon and palette change from Pilot green to ink + ember~~ — closed 2026-10-03: adopted by design sync; sponsor directed shaping to proceed on this canvas. Store assets and splash regenerate during the v1 build.                                                                                                                           | Closed                              | Sponsor |
| OP-07 | Values set by design without data: weekly goal 4, review prompt after 3rd loop, history 7 days free.                                                                                                                                                                                                                                               | Keep, revisit after 4 weeks of data | Growth  |

## Round 7 — 2026-10-04 · sponsor: single-version build, named v1

Sponsor direction (verbatim): _"dev het slices version nay, chua lên store nên v1 thôi"_ — develop all journeys in this version; since nothing has shipped to a store, the version is named **v1** (the pilot build never reached a store, so this is the first store version).

Applied across the corpus:

- The release-slice/fast-follow split (SR-02/SR-07) is superseded — all journeys J1–J10 ship together; the journey-dependency graph is the build-order guide inside the cycle.
- Version renamed v2 → v1 everywhere (spec, concept, ARC42, ADR-003); the cycle branch becomes `release/v1` and the shaping checkpoint PR is re-opened on it (PR #3 superseded, review history carried).
- Kill-criterion reading resolved: Gate 0's verbatim "Build takes >8 weeks" (6 build + 2 validation basis) is exceeded outright by the ~10–11 week v1 window — sponsor-accepted with the all-in-one call; the Gate 1 signature is an explicit waiver or re-baseline of the criterion, and the week-6 checkpoint guards the ~10–11 week plan as the overrun guard (see SR-09/SR-11 below).
- The ads-only-slice economics caveat is moot: Plus ships at launch, so the blended figure applies from day one.

Shaping review round 4 on the re-cut (verdict **APPROVE WITH CONCERNS**) found two accuracy issues in the figures the sponsor signs — both applied:

- SR-09 (major): the kill criterion was mis-quoted as "build + validation <= 8 weeks" and ARC42 still said 6+2. Now: Gate 0's criterion quoted verbatim ("Build takes >8 weeks"), the real window stated as ~8–9 build + ~2 validation (~10–11 weeks) consistently across concept + ARC42, and a **pre-agreed week-6 overrun checkpoint with a P1 de-scope order** recorded in the concept (tablet → share card → J8 → P23 → J5 → J10 extras; J7 Plus and P0 journeys never de-scope). A sponsor waiver/re-baseline at Gate 1 is the alternative — his call.
- SR-10 (minor): the re-model compared revenue with a contribution target without deducting Gate 0's $150/month fixed cost → restated as contribution: lower ~$1,490 (miss), base ~$2,100 (**~5% headroom**, not ~12%), upper ~$2,570.

Shaping review round 5 (verdict **APPROVE**): SR-11 applied — the checkpoint now names its reference window (the ~10–11 week plan, not the Gate 0 budget) and the breach is stated outright; SR-12 applied — PR base retargeted to `main` after PR #2 merged.

Items awaiting sponsor at Gate 1 signature: blended-ARPU guard-rail + Gate 0 economics re-check (contribution figures above) + an explicit **waiver or re-baseline of the 8-week kill criterion** (the week-6 checkpoint guards the accepted ~10–11 week plan).

## Round 6 — 2026-10-03 · shaping review on the v2 re-shape (PR #3)

Claude shaping reviewer, verdict **approve-with-concerns** (session `cse_011AtNqjcBM2w2Qnm7xWhZ75`): 3 Majors, 2 Minors — all applied in PR #3:

- SR-01 (major): monetisation moved (fewer triggers, Plus removes ads) with the Gate 0 basis unchanged → v2 re-model added to the concept: <= 1 trigger/active day, ad ARPU ~$0.10–0.15 hypothesis, Plus conversion ~2% of MAU hypothesis, blended ~$2,140/mo at 14,686 MAU. Ad-ARPU guard-rail re-baselined to **blended ARPU >= $0.15/MAU-month** — flagged for sponsor sign-off at Gate 1.
- SR-02 (major): all J1–J10 in one cycle before any market signal → v2 split into **release slice** (J1–J4, J9 + trigger points, weekly-goal surfaces) and **fast-follow** (J7 Plus, J8, J5 reminders, J6 share, J10, Live Activity, tablet) gated on the slice's retention signal. Alternative (single v2, <=8-week estimate + sponsor sign-off) flagged for the sponsor at Gate 1.
- SR-03 (major): weekly goal 4/7 (~17 days/month) vs Gate 0 "20 active days/month" → concept records the in-product goal as a motivational floor; the tracked metric stays >= 20 active days/month; OP-07 gains an instrumented check (share of actives at >= 5 days/week).
- SR-04 (minor): ADR-003 gaps → new-user grace owned client-side by the Ad Broker (install-age suppression; AdMob caps stay the outer limiter); entitlement re-verified on app start + expiry via store queries, so lapse/refund revokes Plus without user action.
- SR-05 (minor): RR-08 deadline silently changed → reverted to 2026-08-20; carried RR-* deadlines recorded as re-baselined at Phase 3 planning.

Round-2 re-review (verdict **approve-with-concerns** again): SR-03/04/05 resolved; two follow-up findings, both applied:

- SR-06 (major): the first re-model's own base case (~$0.146 blended, gross Plus figure) sat under its proposed $0.15 guard-rail, and the old ±20%-of-$0.23 guard-rail was still in the document → re-model rewritten net of the 30% store fee with lower/base/upper cases (~$1,640 / ~$2,250 / ~$2,720 per month at 14,686 MAU); the ad-only guard-rail is retired for **net blended contribution >= $0.15/MAU-month**; the thin margin and the ads-only slice are recorded as an explicit **Gate 0 re-check for the sponsor**, not smoothed over.
- SR-07 (major): the slice split lived only in the concept → spec journeys retagged Release slice / Fast-follow (with surface-level splits inside J4/J6, P23/P24, tablet), ARC42 transition path rewritten to match, `next_action` points at the slice-first build. The 8-week kill-criterion reading (per release window, ~7–9 weeks total) is stated and flagged for sign-off.

Round-3 re-review: verdict **APPROVE** — no Blockers, no Majors. The only remaining finding, SR-08 (minor: lock-screen widget sat in both slice and fast-follow buckets), was folded in directly — P24's data line now marks the lock-screen widget fast-follow alongside P23.

Items awaiting sponsor at Gate 1 signature: blended-ARPU guard-rail + Gate 0 economics re-check, the slice/fast-follow split vs single-version estimate, and the per-window kill-criterion reading. _(Superseded by round 7: sponsor chose the single version, named v1.)_

## Round 5 — 2026-10-03 · sponsor answers on the shaping re-pass

Sponsor replies to the open points (verbatim): _"chốt giá / chốt seconds / bỏ streak / admod limit là do admob server config"_ — recorded as:

- OP-01 closed: Yearly $19.99 (7-day trial) + Lifetime $49.99.
- OP-03 closed: Show seconds default on.
- OP-04 closed: streak removed; weekly goal any 4 of 7 days; north-star = days focused per week.
- OP-05 confirmed: "server-side" ad limits = AdMob console configuration, not an owned backend (ADR-003).
- OP-06 closed: ink + ember adopted via this canvas; store/splash regen is build scope.
- OP-07 stays open with its proposed default, owned by Growth.
- Spec corpus re-shaped on this canvas in the same cycle: `PRODUCT_SPEC_LIVE.md` v2.0 (journeys now match J-Map J1–J10), `PRODUCT_CONCEPT.md` v2.0, `ARC42_SYSTEM_LIVE.md` v2.

## Round 4 — 2026-10-03 · canvas `1791071241-7cd3` (this sync)

- Sponsor: rewarded ads unlock a 24-hour trial only, not a permanent unlock. OP-02 closed; no canvas change.

- Sponsor: ad limits are server-side; the design only needs correct trigger points per journey. DESIGN.md §5, spec J1-R4 and the journey map now name trigger points only. OP-05 closed.
- Export fix: PNGs re-rendered with the brand fonts.

## Round 3 — 2026-10-03 · canvas `1791070597-62cf`

- Full production set: brand (icon family, tokens, components), journey map J1–J10, 24 phone screens in light and
  dark, 6 tablet layouts in light and dark.
- Two display modes (Disc / Numbers) chosen on first launch, switchable on Focus; prototypes P06/P07 are interactive.
- Designer self-review (render of every artboard with the canvas runtime, 2× PNGs in `design/png/`):
  - Fixed: Settings content clipped; disc edge aliasing; history, week and loop data inconsistent; idle widget showed
    a running disc; Welcome back icon and copy; dark share card blended into background; tablet Home empty space;
    first-launch "25:00" read as "25.00"; oversized brand boards.
  - Checked: no overflow on any artboard, no runtime errors, interactions (toggle, pause, end-early sheet, keep going)
    work.
- Sponsor asked for: tablet, light/dark, icon, splash, legal links and version in Settings (added in round 2).

## Round 2 — 2026-10-03 · concept merge (exploration)

- Sponsor direction: "solve users' needs for growth and revenue, support both visual and text display".
- Merged A (loop + breaks), B (intention, "Later, not now", outcome close-out) and C (disc, Live Activity, widgets)
  into one design with monetisation placements.
- Sponsor comment on Settings: add legal links and app version → done.

## Round 1 — 2026-10-02 · UX audit and concepts (exploration)

- Audit of the Pilot build found 11 issues; the top ones: no break (no actual loop), static timer ring, one-tap
  Cancel without confirmation (spec J1-R5), interstitial covering the reward moment, widget (P0) not built.
- Three concepts explored; sponsor asked for a less generic visual direction, applied with the UI UX Pro Max
  skill (Swiss / minimal for timers, ember focus + green break, OLED dark, tabular figures).
- Boards kept in `mockups/exploration-2026-10/` (exploration only).
