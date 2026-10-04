# Focus Loop — Product Concept (v2.0 re-shape)

High-level concept for the I01 opportunity approved at Gate 0. Journey and screen detail lives in `PRODUCT_SPEC_LIVE.md`.

Sources:

- `docs/research/OPPORTUNITY_DECISION.json` (Gate 0 final decision, 2026-08-06)
- Stage 3 deep dive in `appsindie/portfolio-research/research/i01/`
- Design: hi-fi canvas `1791071241-7cd3` (synced 2026-10-03), `DESIGN.md` v2.1, `DESIGN_REVIEW.md`

## Positioning

**For adults with ADHD and knowledge workers whose phone keeps pulling them out of work, Focus Loop is the no-account Pomodoro app that starts a session in one tap and runs the whole focus–break loop — unlike gamified timers (Forest) or bloated hybrids (Focus To-Do).**

## North-star metrics

1. **D30 retention >= 42%** — the app must become a daily habit, not a one-off timer. This is the main lever for Month-9 MAU.
2. **Month-9 Net Monthly Contribution >= $2,000** — derived from 14,686 MAU and $0.2312 Ad ARPU under the Gate 0 model; re-modelled for v2 below (fewer triggers, Plus supplements ads).

Measured via:

- **Days focused per week** (any-N-of-7 weekly goal, default 4 — sponsor, 2026-10-03; replaces streak tracking). The in-product goal is a **motivational floor** (adjustable in J10); the tracked engagement metric stays **>= 20 active days/month (about 5 of 7)**, matching Gate 0 `validation_metrics`. Instrumented check under OP-07's 4-week revisit: share of actives reaching >= 5 days/week — if "Goal met" anchors users below it, revisit the default.
- session start / completion rate, widget-initiated share (target >= 10%),
- interstitial show rate at the two designed trigger points, rewarded completion rate, Plus trial starts and conversion.

Guard-rail:

- **Net blended contribution >= $0.15 / MAU-month by Month 6** — replaces the Gate 0 ad-only guard-rail (ad ARPU +/-20% of $0.23), which the v2 trigger-point design structurally under-shoots; re-baseline flagged for sponsor sign-off at Gate 1 (see re-model below).
- **Build + validation <= 8 weeks** — hard roadmap constraint from Gate 0; applied per release window under the slice split (see §3).

Rule: every journey and every screen SHALL improve at least one north-star metric — otherwise it is cut.

### v2 monetisation re-model (shaping review SR-01)

Gate 0 modelled about 2 interstitials per active day at $0.2312 Ad ARPU. The v2 design yields **at most 1 trigger point per active day** (leaving P12 after a completed loop, or leaving P10 after the 2nd focus of an uncompleted loop; the first weekly P12 exit may show the paywall instead), and Plus removes all ads. Re-model — every figure below is a hypothesis until OP-07 produces data:

| Driver              | Assumption                                                                 | Effect                                                    |
| ------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------- |
| Interstitial volume | <= 1 trigger per active day (model assumed ~2); AdMob caps can cut further | Ad ARPU ~ $0.10–0.15 / MAU-month                          |
| Plus conversion     | ~2% of MAU buy Yearly $19.99 (no willingness-to-pay evidence yet)          | ~$0.023 / MAU-month net IAP revenue (after 30% store fee) |
| Ad loss to Plus     | Plus users (~2% of MAU) leave the ad pool                                  | ~-2% of ad ARPU                                           |
| Lifetime buyers     | Small one-off $49.99 tail; not modelled                                    | upside only                                               |

Plus revenue is **net of the 30% store commission** ($19.99/yr → ~$1.17/user-month; ~$1.42 at the 15% small-business tier).

| Case  | Ad ARPU | Plus conversion of MAU | Blended net / month       | Blended ARPU | vs $2,000           |
| ----- | ------- | ---------------------- | ------------------------- | ------------ | ------------------- |
| Lower | $0.10   | 1% (~147 subs)         | ~$1,469 + ~$171 = ~$1,640 | ~$0.11       | miss                |
| Base  | $0.13   | 2% (~294 subs)         | ~$1,909 + ~$343 = ~$2,250 | ~$0.15       | pass, ~12% headroom |
| Upper | $0.15   | 3% (~441 subs)         | ~$2,203 + ~$514 = ~$2,720 | ~$0.19       | pass                |

Two honest consequences:

- The **release slice earns ads only** — at $0.10–0.15 it can sit at or below the $0.15 kill line on day one, before Plus ships. That is acceptable only if the slice is treated as the retention experiment it is; the kill reading applies to the fast-follow product, not the bare slice.
- The **base case barely clears** both the $2,000 target and the $0.15 blended guard-rail; the lower case misses. The Gate 0 economic headroom the v1 model had is gone — halved triggers plus Plus pulling heavy users out of the ad pool.

**Gate 0 re-check — pending sponsor (explicit item at Gate 1 signature):** the v2 design trades ad impressions for retention surface. If the sponsor wants the Gate 0 margin back, the levers are AdMob cap values at build time, the fast-follow shipping early on slice signal, or re-opening the Gate 0 target. This is recorded, not smoothed over: the ±20%-of-$0.23 ad-ARPU guard-rail is retired in favour of **net blended contribution** as the tracked figure.

## 1. Channels — objective, pain/gain

| Channel                                          | Persona                                    | Why it exists                            | Pain today                                                                       | Expected gain                                                        |
| ------------------------------------------------ | ------------------------------------------ | ---------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| iOS + Android mobile app                         | Adults with ADHD, remote workers, students | One-tap Pomodoro loop without signup     | OS timers lack structure/progress; Forest feels childish; Focus To-Do is bloated | Friction-free focus ritual, weekly goal instead of punishing streaks |
| Home-screen / lock-screen widget + Live Activity | Same                                       | Launch a session without opening the app | Opening an app adds friction when already distracted                             | Time-to-timer of one tap; the loop stays visible                     |
| Shareable weekly focus card                      | Same                                       | Show progress on social / with a coach   | No easy way to share or celebrate focus honestly                                 | Organic word-of-mouth in ADHD/productivity communities               |

**Cut now** (not enough pain/gain for the early phases):

- Wearable timer (Apple Watch / Wear OS) — nice expansion, not needed for core loop.
- Cross-device sync — Plus expansion later.
- Team / coach dashboard — B2B expansion later.
- AI focus recommendations — on-device ML, not MVP.
- Account system — no-account is the wedge; Plus restores via store receipt.

## 2. Journeys -> screens (each screen relieves one pain)

### Mobile app (design journey map J1–J10)

| Journey                         | Screens                                                                                                    | Pain it relieves                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| J1 — First app open             | P01 Splash -> P02 Choose display -> P06/P07 Focus -> P10 Close-out -> P03 Notif ask -> P11 Break           | Onboarding kills a distracted user's intent; the first session must start before they wander |
| J2 — A daily loop               | P04 Home -> P06/P07 Focus -> P08 Later -> P10 Close-out -> P11 Break xN -> P12 Loop complete -> long break | One isolated timer is not a work rhythm                                                      |
| J3 — Stopping midway            | P06 Focus -> P09 End-early sheet -> P10 (partial)                                                          | Interruptions feel like failure; partial sessions still count                                |
| J4 — Start from outside the app | P24 Widget -> P06 Focus -> P23 Live Activity -> Break notification                                         | Opening the app is friction when already distracted                                          |
| J5 — Scheduled reminders        | P20 Settings -> P22 Reminders -> notification -> P06 Focus                                                 | User forgets a planned focus block                                                           |
| J6 — View progress and share    | P04 Home -> P17 Week -> P18 History / P19 Share -> share sheet                                             | Without feedback motivation fades; progress is also the growth loop                          |
| J7 — Upgrade to Plus            | P12 Loop complete -> P14 Paywall -> StoreKit/Play Billing -> P16 Welcome                                   | Ads/limits after value; revenue path for power users                                         |
| J8 — Try theme via rewarded ad  | P20 Settings -> P15 Themes -> rewarded video -> 24h unlock                                                 | Free users want personalisation without paying                                               |
| J9 — App killed by OS           | OS kill -> P01 -> P06 resume / P13 Welcome back                                                            | OS kills mid-session; recovery without blame                                                 |
| J10 — Customise                 | P20 Settings -> P21 Rhythm / Display / Theme / Data / About                                                | Rigid timer does not fit personal preference                                                 |
| _(cut)_                         | Onboarding tutorial / account creation                                                                     | No-account is a wedge; onboarding adds friction                                              |

## 3. Phases

| Phase                              | Goal                                                                                           | Content                                                                                                                   | Exit condition                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| v1 Pilot (built, superseded)       | Proved core timer + ads pass store review                                                      | Old J1 + widget + stats + rewarded unlock                                                                                 | Done; replaced by the v2.1 canvas re-shape                                |
| v2 release slice (this cycle)      | Prove the designed core loop earns its retention — the Gate 0 question, still unanswered by v1 | J1–J4 + J9: loop + breaks, both displays, weekly-goal surfaces (P04/P17/P18), ad trigger points, home-screen widget (P24) | Gate 2 SIT on the slice; store release per Phase 3                        |
| v2 fast-follow (same cycle, gated) | Monetisation + reach surfaces, released once the slice's retention signal lands                | J7 Plus, J8 rewarded trial, J5 reminders, J6 share card (P19), J10 full customise, P23 Live Activity, tablet T01–T06      | Ships when the slice shows D7/D30 tracking to Gate 0 `validation_metrics` |
| Later                              | Expand value                                                                                   | Cross-device sync, advanced stats, coach/team, wearables                                                                  | Gate 4 review on v2 actuals                                               |

Order is a dependency constraint: monetisation (J7/J8) ships only in the fast-follow, behind the release-slice signal. Build estimate: slice ~4–5 weeks on the v1 Expo skeleton (timer/ads reused); fast-follow ~3–4 weeks — ~7–9 weeks total inside one cycle. **Kill-criterion reading (flagged for sponsor sign-off at Gate 1):** Gate 0's "build <= 8 weeks" is applied per release window (slice, then fast-follow), not to the whole cycle; if the sponsor reads it as whole-cycle, the fast-follow becomes the next cycle. The slice/fast-follow split is shaping-review SR-02's recommended path; the alternative (single v2 with a sponsor-signed <=8-week estimate) is flagged for the sponsor at Gate 1.

## 4. Journey x persona map (priority)

| Journey                  | ADHD adult | Remote worker | Student | Priority |
| ------------------------ | ---------- | ------------- | ------- | -------- |
| J1 First open            | High       | High          | High    | P0       |
| J2 Daily loop            | High       | High          | High    | P0       |
| J3 Stop midway           | High       | High          | High    | P0       |
| J4 Widget/external start | High       | Medium        | High    | P0       |
| J9 OS-kill recovery      | High       | Medium        | High    | P0       |
| J5 Reminders             | High       | Medium        | High    | P1       |
| J6 Progress + share      | High       | Medium        | Medium  | P1       |
| J8 Rewarded theme trial  | Medium     | Low           | Medium  | P1       |
| J7 Plus upgrade          | Medium     | Medium        | Medium  | P1       |
| J10 Customise            | Medium     | Medium        | Medium  | P1       |

## 5. Acceptance criteria (business) & success metrics

| Journey | Acceptance criteria                                                               | Success metric                                                           |
| ------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| J1      | First session running in <= 2 taps from cold start                                | First-session start rate >= 80% of first opens                           |
| J2      | Full loop completes with break, close-out, honest log                             | Session completion >= 70%; interstitial shown at trigger only            |
| J3      | End early always confirms; partial counts toward week                             | Partial-save rate; no zero-tap cancel path                               |
| J4      | Widget starts session without opening Home                                        | Widget-initiated sessions >= 10% of total                                |
| J5      | Local recurring reminder fires and re-enters focus                                | Notification open rate >= 20%                                            |
| J6      | Week shows N of G goal; card shares via system sheet                              | Week-goal met rate; share of actives at >= 5 days/week; share-card usage |
| J7      | Paywall after first loop only; trial/yearly + lifetime purchasable and restorable | Trial start rate; Plus conversion                                        |
| J8      | Rewarded video grants exactly a 24h trial of one item                             | Rewarded completion >= 15% of offers shown                               |
| J9      | Killed session resumes or is honestly recovered                                   | Recovered-session rate                                                   |

## 6. Design & brand

- **Design fidelity: `design:hifi`** — approved Claude canvas snapshot is the design of record: `docs/product/design/` (screens) + `docs/brand/design/` (tokens, icons, app icon), canvas `1791071241-7cd3`.
- Brand: ink + ember palette (replaces Pilot green — sponsor, 2026-10-03); Host Grotesk UI / Newsreader for user words.
- Design decisions and sponsor answers: `DESIGN_REVIEW.md`. Open Pilot mockups moved to `docs/product/mockups/` (exploration only).
- Build PRs must cite the canvas version they build from; design changes are a canvas change + re-sync, never edits under `design/`.

## 7. Open questions

Carried + resolved items live in `PRODUCT_SPEC_LIVE.md` §Open questions and `DESIGN_REVIEW.md` §Open shaping points.
