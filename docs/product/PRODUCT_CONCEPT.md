# Focus Loop — Product Concept (v1 draft)

High-level concept for the I01 opportunity approved at Gate 0. Journey and screen detail lives in `PRODUCT_SPEC_LIVE.md`.

Sources:
- `docs/research/OPPORTUNITY_DECISION.json` (Gate 0 final decision, 2026-08-06)
- Stage 3 deep dive in `appsindie/portfolio-research/research/i01/`

## North-star metrics

1. **D30 retention >= 42%** — the app must become a daily habit, not a one-off timer. This is the main lever for Month-9 MAU.
2. **Month-9 Net Monthly Contribution >= $2,000** — derived from 14,686 MAU and $0.2312 Ad ARPU; the portfolio slot threshold.

Guard-rail:
- **Ad ARPU within +/-20% of $0.23 by Month 6** — if monetisation collapses, the economics do not support the slot even with good retention.
- **Build + validation <= 8 weeks** — hard roadmap constraint from Gate 0.

Rule: every journey and every screen SHALL improve at least one north-star metric — otherwise it is cut.

## 1. Channels — objective, pain/gain

| Channel | Persona | Why it exists | Pain today | Expected gain |
| --- | --- | --- | --- | --- |
| iOS + Android mobile app | Adults with ADHD, remote workers, students | One-tap Pomodoro timer without signup | OS timers lack streaks/stats; Forest feels childish; Focus To-Do is bloated | Friction-free focus ritual, daily return via widget + streak |
| Home-screen widget | Same | Launch a session without opening the app | Opening an app adds friction when already distracted | Reduces time-to-timer to one tap |
| Shareable focus-stat card | Same | Show progress on social / with coach | No easy way to share or celebrate focus streaks | Organic word-of-mouth in ADHD/productivity communities |

**Cut now** (not enough pain/gain for the early phases):
- Wearable timer (Apple Watch / Wear OS) — nice expansion, not needed for core loop.
- Cross-device sync — premium path later.
- Team / coach dashboard — B2B expansion later.
- AI focus recommendations — on-device ML, not MVP.

## 2. Journeys -> screens (each screen relieves one pain)

### Mobile app

| Journey | Screens | Pain it relieves |
| --- | --- | --- |
| J1 — Start a focus session | Home (setup) -> Timer running -> Break / complete -> Session summary | User wants to focus but is already distracted; app must get out of the way |
| J2 — Return via widget | Widget -> Timer running | Unlock phone, find app, navigate is too much friction |
| J3 — Stay consistent with reminders | Notification -> Home | User forgets to start a planned focus block |
| J4 — Track progress and streak | Stats tab | Without feedback, motivation drops after a few days |
| J5 — Customise the experience | Settings (sound, theme, default duration) | Rigid timer does not fit personal preference |
| J6 — Unlock theme/sound pack | Rewarded ad -> Theme applied | Free users want personalisation without paying |
| *(cut)* | Onboarding tutorial / account creation | No-account is a wedge; onboarding adds friction |

## 3. Phases

| Phase | Goal | Content | Exit condition |
| --- | --- | --- | --- |
| Pilot (build) | Prove the core loop works and the app passes store review | J1 + J2 widget + J3 stats + J6 rewarded unlock + basic ads | D1 retention >= 50%, session completion rate >= 70%, store live on both platforms |
| MVP | Prove monetisation and retention at scale | J4 full stats + J5 settings + J3 reminders + ASO | D7 >= 45%, D30 >= 42%, ad ARPU within +/-20% of $0.23 by Month 6 |
| MMP | Expand value for power users | Ad removal IAP, theme packs, sound packs, weekly reports | Premium attach rate > 2% or contribution-positive expansion |

Order is a dependency constraint: no MMP premium until MVP retention and ads are validated.

## 4. Journey x persona map (priority)

| Journey | ADHD adult | Remote worker | Student | Priority |
| --- | --- | --- | --- | --- |
| J1 Start focus session | High | High | High | P0 |
| J2 Widget launch | High | Medium | High | P0 |
| J3 Reminders | High | Medium | High | P1 |
| J4 Stats / streak | High | Medium | Medium | P1 |
| J5 Settings | Medium | Medium | Medium | P1 |
| J6 Unlock theme | Medium | Low | Medium | P2 |

## 5. Acceptance criteria (business) & success metrics

| Journey | Acceptance criteria | Success metric |
| --- | --- | --- |
| J1 | User can start a 25-minute session in <= 3 taps from cold start | Session start rate >= 80% of app opens |
| J1 | Session completes with break prompt and ad shown at natural breakpoint | Interstitial show rate >= 85% of completed sessions |
| J2 | Widget starts a session without launching full app | Widget-initiated sessions >= 10% of total sessions |
| J3 | User receives and taps local notification at scheduled focus time | Notification open rate >= 20% |
| J4 | User can view streak, total minutes, sessions today/week | 20 active days/month retained |
| J6 | Rewarded ad loads and unlocks theme | Rewarded completion rate >= 15% of offers shown |

## 6. Design & brand

- Design system / brand source: AppsIndie shared design tokens (to be formalised; start with the minimal, high-contrast ADHD-friendly palette: large tap targets, clear type, reduced motion by default).
- Design tool project: Figma — to be created for mobile screens and widget.
- Screens done / still missing: none done; widget, home, timer, break, stats, settings, rewarded unlock screens needed.

## 7. Open questions

1. Default timer duration: 25 min Pomodoro vs user-chosen? Working default: 25 min, customisable in settings.
2. Sound during focus: white noise, lo-fi, or silent? Working default: optional white-noise loop, off by default to avoid policy risk.
3. App-blocking default: on or opt-in? Working default: opt-in, requested at first focus session on Android only.
4. Ad network: AdMob first, or mediation with AppLovin? Working default: AdMob, evaluate mediation in Month 2.
5. ATT prompt timing: at first ad load or at first launch? Working default: first ad load, with pre-screen explaining value.
