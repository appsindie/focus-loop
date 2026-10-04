# Focus Loop — Product Concept (v1.0 re-shape)

High-level concept for the I01 opportunity approved at Gate 0. Journey and screen detail lives in `PRODUCT_SPEC_LIVE.md`.

Sources:

- `docs/research/OPPORTUNITY_DECISION.json` (Gate 0 final decision, 2026-08-06)
- Stage 3 deep dive in `appsindie/portfolio-research/research/i01/`
- Design: hi-fi canvas `1791071241-7cd3` (synced 2026-10-03), `DESIGN.md` v2.1, `DESIGN_REVIEW.md`

## Positioning

**For adults with ADHD and knowledge workers whose phone keeps pulling them out of work, Focus Loop is the no-account Pomodoro app that starts a session in one tap and runs the whole focus–break loop — unlike gamified timers (Forest) or bloated hybrids (Focus To-Do).**

## North-star metrics

1. **D30 retention >= 42%** — the app must become a daily habit, not a one-off timer. This is the main lever for Month-9 MAU.
2. **Month-9 Net Monthly Contribution >= $2,000** — derived from 14,686 MAU and $0.2312 Ad ARPU under the Gate 0 model; re-modelled for v1 below (fewer triggers, Plus supplements ads).

Measured via:

- **Days focused per week** (any-N-of-7 weekly goal, default 4 — sponsor, 2026-10-03; replaces streak tracking). The in-product goal is a **motivational floor** (adjustable in J10); the tracked engagement metric stays **>= 20 active days/month (about 5 of 7)**, matching Gate 0 `validation_metrics`. Instrumented check under OP-07's 4-week revisit: share of actives reaching >= 5 days/week — if "Goal met" anchors users below it, revisit the default.
- session start / completion rate, widget-initiated share (target >= 10%),
- interstitial show rate at the two designed trigger points, rewarded completion rate, Plus trial starts and conversion.

Guard-rail:

- **Net blended contribution >= $0.15 / MAU-month by Month 6** — replaces the Gate 0 ad-only guard-rail (ad ARPU +/-20% of $0.23), which the v1 trigger-point design structurally under-shoots; re-baseline flagged for sponsor sign-off at Gate 1 (see re-model below).
- **"Build takes >8 weeks"** — verbatim Gate 0 kill criterion (basis: `build_weeks: 6` + `validation_weeks: 2`). The real v1 window is ~8–9 weeks build + ~2 weeks validation (~10–11 weeks); the sponsor accepted the all-in-one build 2026-10-04 — the week-6 overrun checkpoint + de-scope order is in §3.

Rule: every journey and every screen SHALL improve at least one north-star metric — otherwise it is cut.

### v1 monetisation re-model (shaping review SR-01)

Gate 0 modelled about 2 interstitials per active day at $0.2312 Ad ARPU. The v1 design yields **at most 1 trigger point per active day** (leaving P12 after a completed loop, or leaving P10 after the 2nd focus of an uncompleted loop; the first weekly P12 exit may show the paywall instead), and Plus removes all ads. Re-model — every figure below is a hypothesis until OP-07 produces data:

| Driver              | Assumption                                                                 | Effect                                                    |
| ------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------- |
| Interstitial volume | <= 1 trigger per active day (model assumed ~2); AdMob caps can cut further | Ad ARPU ~ $0.10–0.15 / MAU-month                          |
| Plus conversion     | ~2% of MAU buy Yearly $19.99 (no willingness-to-pay evidence yet)          | ~$0.023 / MAU-month net IAP revenue (after 30% store fee) |
| Ad loss to Plus     | Plus users (~2% of MAU) leave the ad pool                                  | ~-2% of ad ARPU                                           |
| Lifetime buyers     | Small one-off $49.99 tail; not modelled                                    | upside only                                               |

Plus revenue is **net of the 30% store commission** ($19.99/yr → ~$1.17/user-month; ~$1.42 at the 15% small-business tier).

| Case  | Ad ARPU | Plus conversion of MAU | Blended revenue / month   | Contribution (−$150 fixed) | vs $2,000          |
| ----- | ------- | ---------------------- | ------------------------- | -------------------------- | ------------------ |
| Lower | $0.10   | 1% (~147 subs)         | ~$1,469 + ~$171 = ~$1,640 | ~$1,490                    | miss               |
| Base  | $0.13   | 2% (~294 subs)         | ~$1,909 + ~$343 = ~$2,250 | ~$2,100                    | pass, ~5% headroom |
| Upper | $0.15   | 3% (~441 subs)         | ~$2,203 + ~$514 = ~$2,720 | ~$2,570                    | pass               |

The $150/month fixed operating cost Gate 0 deducted (`base_month9_net_monthly_contribution` = $3,395 − $150) is applied so the cases compare like-for-like with the $2,000 contribution target.

Two honest consequences:

- **Plus ships at launch** (single v1 — sponsor, 2026-10-03), so the blended figure applies from day one; there is no ads-only interim state.
- The **base case barely clears** the $2,000 contribution target (~5% headroom after the $150 fixed cost) and sits exactly at the $0.15 blended guard-rail; the lower case misses. The Gate 0 economic headroom the v1 model had is gone — halved triggers plus Plus pulling heavy users out of the ad pool.

**Gate 0 re-check — pending sponsor (explicit item at Gate 1 signature):** the v1 design trades ad impressions for retention surface. If the sponsor wants the Gate 0 margin back, the levers are AdMob cap values at build time, Plus pricing/positioning, or re-opening the Gate 0 target. This is recorded, not smoothed over: the ±20%-of-$0.23 ad-ARPU guard-rail is retired in favour of **net blended contribution** as the tracked figure.

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

| Phase                       | Goal                                                                                                | Content                                                                                                                                                        | Exit condition                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Pilot build (never shipped) | Proved core timer + ads compile                                                                     | Old J1 + widget + stats + rewarded unlock                                                                                                                      | Done; superseded by the canvas re-shape, never released to a store |
| v1 (this cycle)             | Prove the designed product earns its retention — the Gate 0 question, still unanswered by the pilot | All journeys J1–J10: loop + breaks, both displays, weekly goal, widgets + Live Activity, reminders, share card, Plus + rewarded trials, full customise, tablet | Gate 2 SIT; store release per Phase 3                              |
| Later                       | Expand value                                                                                        | Cross-device sync, advanced stats, coach/team, wearables                                                                                                       | Gate 4 review on v1 actuals                                        |

**Single-version build — sponsor decision 2026-10-03:** "dev het slices version nay, chua lên store nên v1 thôi" (develop all journeys in this version; nothing has shipped to a store, so it is named v1). The earlier release-slice/fast-follow split (shaping review SR-02) is superseded; the dependency graph in `PRODUCT_SPEC_LIVE.md` is the build-order guide inside the cycle.

Build estimate on the pilot Expo skeleton (timer/ads reused): **~8–9 weeks engineering + ~2 weeks validation → a ~10–11 week window.** Gate 0's verbatim kill criterion is _"Build takes >8 weeks"_ (basis: `build_weeks: 6` + `validation_weeks: 2` — an 8-week total). **The v1 window exceeds it outright** — ~10–11 weeks against an 8-week budget. The sponsor accepted the all-in-one build knowing the estimate; the Gate 1 signature therefore records an explicit **waiver or re-baseline of the 8-week criterion**, not a judgment call.

**Overrun checkpoint (pre-agreed, fires at build week 6, protecting the ~10–11 week plan — not the Gate 0 budget):** if the remaining J1–J10 scope does not fit the remaining window _of that plan_, P1 scope de-scopes in this order — tablet layouts (T01–T06) → J6 share card (P19; Week/History stay) → J8 rewarded trial → P23 Live Activity + lock-screen widget → J5 reminders → J10 non-essential customise. J7 Plus is never de-scoped — it carries the contribution case; P0 journeys (J1–J4, J9) are never de-scoped — they carry the retention question. A de-scoped item becomes the next cycle's first work. The checkpoint is the overrun guard on the accepted ~10–11 week plan; it is not an alternative to the Gate 1 waiver/re-baseline decision above.

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
