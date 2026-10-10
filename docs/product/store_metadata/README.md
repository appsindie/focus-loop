# Focus Loop — GTM Stage A seed

Stage A (shaping) outputs for store listing work. Stage B turns this into `store_metadata/<locale>.md` listing copy and `docs/release/<v>/STORE_ASSETS.md` evidence before Gate 3.

- **Positioning sentence**: `../PRODUCT_CONCEPT.md` §Positioning — _"For adults with ADHD and knowledge workers whose phone keeps pulling them out of work, Focus Loop is the no-account Pomodoro app that starts a session in one tap and runs the whole focus–break loop — unlike gamified timers (Forest) or bloated hybrids (Focus To-Do)."_
- **Store frame theme**: `../brand/store/frame-template.html` (tokens from `docs/brand/design/tokens.json`, canvas `1791071241-7cd3`).

## Keyword seed (expand in Stage B — sources: OPPORTUNITY_DECISION.json, MARKET_RESEARCH_LIVE.md §5.1)

### Head terms

| Term           | Notes                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| pomodoro timer | Validation metric: top-15 rank within 9 months. US ~165k–200k searches/mo |
| adhd focus app | Validation metric: top-5 rank within 9 months; +40% YoY                   |
| focus timer    | Head supporting term                                                      |
| pomodoro app   | Variant                                                                   |

### Long-tail seeds — en-US

| Term                    | Intent it maps to           |
| ----------------------- | --------------------------- |
| pomodoro timer widget   | J4 widget start             |
| adhd timer app          | ADHD persona                |
| focus timer with breaks | J2 loop differentiator      |
| study timer pomodoro    | Student persona             |
| focus app no account    | no-account wedge            |
| pomodoro live activity  | iOS surface                 |
| break reminder timer    | J2/J5                       |
| forest alternative      | competitor displacement     |
| focus to-do alternative | competitor displacement     |
| ad blocker focus app    | app-blocking edge (Android) |

### Long-tail seeds — vi (Vietnamese, diacritics + no-diacritics variants per convention)

| Term                    | Variant                 |
| ----------------------- | ----------------------- |
| đồng hồ pomodoro        | dong ho pomodoro        |
| hẹn giờ tập trung       | hen gio tap trung       |
| ứng dụng tập trung adhd | ung dung tap trung adhd |
| pomodoro tiếng việt     | pomodoro tieng viet     |
| đếm giờ học             | dem gio hoc             |
| báo nghỉ giải lao       | bao nghi giai lao       |

> Stage B expands each seed via store autocomplete, scores popularity/difficulty/relevance per `aso-keywords-and-copy.md`, and keeps 15–30 relevant terms per locale mapped to one store field. Apple keyword field is 100 **bytes** — count vi/CJK with `wc -c`.

## Store frame plan (5–8 frames, order = priority; frames 1–3 carry the positioning)

| #   | Screen (spec)                    | Benefit caption (en seed)           | Purpose                               |
| --- | -------------------------------- | ----------------------------------- | ------------------------------------- |
| 1   | SCR-focus `P06-Focus` (Disc)     | "Focus starts in one tap"           | The promise — Disc display hero       |
| 2   | `P11-Break` + loop strip         | "Focus and breaks, one loop"        | The differentiator — not just a timer |
| 3   | SCR-week `P17-Week`              | "4 days a week. No broken streaks." | Honest progress — ADHD wedge          |
| 4   | `P24-Widgets` / `P23-LockScreen` | "Start from your home screen"       | Friction removal (J4)                 |
| 5   | `P08-Later` + `P10-Closeout`     | "Park it. End early. Still counts." | No-shame behaviours (J3)              |
| 6   | `P19-Share`                      | "Share your week"                   | Social proof / organic loop (J6)      |
| 7   | `P15-Themes` + `P14-Paywall`     | "Make it yours"                     | Personalisation + Plus (J7/J8)        |
| 8   | `T01-Home` (tablet, optional)    | "Same loop, bigger"                 | Tablet coverage                       |

Captions must fit `frame-template.html` at the longest locale; Vietnamese copy written natively in Stage B, never translated literally.

## Theme notes

- Dark ink canvas (`#141210`) with ember disc (`#D9480F` / `#FF6A2B`) — the app icon's own visual language, per B-Icon board.
- Host Grotesk for captions (UI voice); Newsreader only if a frame quotes a user-written intention.
- Both light and dark product screens may appear in frames; the frame chrome stays ink.

## Stage B outputs (2026-10-10)

- `ASO_STRATEGY.md` — landscape research, field decisions, self-score vs Challenger rubric, console cheat-sheet, rank-tracking plan.
- `<locale>.md` — 19 locale listing packs (Tier 1 + Tier 2): keyword table, Apple + Play fields, screenshot captions in `render-store-frames.mjs` format.
