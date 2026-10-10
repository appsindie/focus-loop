# Focus Loop — ASO strategy and audit pack (v1, 2026-10-10)

Stage B output of `go-to-market/aso-keywords-and-copy.md`. Supersedes the Stage A
seed in this directory's README. Per-locale listing copy: `<locale>.md` files here
(19 locales = Tier 1 + Tier 2 set the app ships).

## Current listing audit (pre-change)

ASC app id 6818991496 exists as **"Your Focus Loop"** — no keyword in the name,
no subtitle, no keyword field set. On a Challenger-tier app that wastes the two
heaviest-indexed fields. Play listing not yet configured for v1.

| Field today | Problem |
| --- | --- |
| Name "Your Focus Loop" | Brand-only; "Your" wastes 5 chars and the word buys no search. Challenger apps need brand + head term. |
| Subtitle empty | 30 indexed characters unused |
| Keyword field empty | 100 indexed bytes unused |
| Single locale | Challenger flag: only 1–2 localizations |

## Keyword landscape (iTunes Search API, US + VN storefronts, 2026-10-10)

**US — head terms are locked by incumbents; persona and long-tail are open.**

| Term cluster | Leader(s) | Ratings | Our play |
| --- | --- | --- | --- |
| pomodoro timer / pomodoro app / focus timer | Focus Keeper (31.7k), Forest (49.5k), FocusPomo (7.9k), Pomodoro–Focus Timer (10.8k), Focus To-Do (14.7k) | high | Take the terms in name (heaviest weight), win on conversion not rank day 1 |
| adhd focus / adhd timer | Focus Friend (8.5k) then thin — Flora/Endel/Cat On Chair are adjacent not direct | med | Subtitle token — realistic top-5 within launch quarter |
| deep work timer | Top: 0–1841 ratings | **low** | Subtitle — top-5 achievable within weeks |
| concentration timer | Top: 4 ratings | **low** | Keyword field |
| break timer / break reminder | 13–4.5k | low | Keyword field + subtitle `breaks` |
| pomodoro timer widget | Tops are unrelated clocks (Flip Clock etc.) | low | Keyword field + caption — we ship the widget |
| study timer | Study Bunny 21.7k, Flora | med | Subtitle `study` — worth the token |
| tomato timer | Focus Keeper leads | med | Keyword field `tomato` |
| adhd (bare) | Finch 761k, Impulse 850k, Structured 167k | very high | Don't chase bare term; subtitle `adhd` catches the combos |
| time blocking | Structured 167k, TickTick 46k | high, wrong intent | Excluded — we're not a planner |
| forest alternative / focus to-do alternative | — | — | Excluded — competitor trademarks banned in keyword field |
| pomodoro live activity | Dead term (returns livestream apps) | — | Excluded |

**VN — one dominant, everything else thin.** Focus To-Do leads (13.5k) but
runners-up sit at 0–3k ratings. `hẹn giờ tập trung` top results have 0–644
ratings — a natively-localized vi listing can reach top-3 within the first
quarter. Vietnamese searches happen both with and without diacritics; the
keyword field carries the un-accented forms (cheaper in bytes).

## Field decisions (en-US; same structure every locale)

| Field | Value | Why |
| --- | --- | --- |
| Apple name | `Focus Loop: Pomodoro Timer` (26/30) | Brand + the two heaviest head terms in the heaviest-indexed field; matches incumbent pattern ("X — Pomodoro Timer") |
| Apple subtitle | `ADHD deep work & study breaks` (29/30) | Five new indexed tokens, zero overlap with name: `adhd`, `deep`, `work`, `study`, `breaks` — covers the four open clusters |
| Apple keywords | `tomato,concentration,productivity,flow,widget,reminder,habit,weekly,goal,interval,session,countdown` (99–100 B) | No repeats of name/subtitle tokens, no plurals-dupes, no competitor marks |
| Play title | same as name | Play's heaviest field too |
| Play short | `Pomodoro timer for ADHD minds — one-tap focus loops, weekly goals, no account` (76/80) | Benefit-first, carries `ADHD` + `weekly goals` + `no account` differentiator |
| Play long | Hook → mechanism → ADHD wedge → surfaces → features, ~1–2% natural density for pomodoro/focus timer/adhd/deep work/study timer | Play indexes full text |
| Promo text | launch hook, editable without new version | Cheap freshness signal |
| Localized names | Native head term where the loanword differs (`Focus Loop: 番茄钟`, `ポモドーロ`, `뽀모도로`, `Помодоро`, `โพโมโดโร`, `पोमोडोरो`, `بومودورو`); `Focus Loop: Pomodoro Timer` elsewhere | "Pomodoro" is the global loanword; CJK/Cyrillic markets search the native form |

**Excluded deliberately**: `time blocking`, `screen time`, `app blocker`,
`habit tracker` — wrong intent (planner / blocker categories), would convert
poorly and dilute relevance. Competitor names never enter metadata.

## Self-score vs Challenger rubric (upstream `aso.md`)

| Dimension | Weight | Score | Evidence |
| --- | --- | --- | --- |
| Title & subtitle | 20% | 9/10 | Brand + head term; 26/30 + 29/30; zero cross-field repetition; purpose instantly clear |
| Description | 15% | 8/10 | First line = positioning; hook→mechanism→wedge→surfaces→features→CTA; Play carries natural 1–2% term density; promo text used |
| Visual assets | 25% | pending | Frame plan below (8 frames, captions per locale in each file) — assets not yet rendered; captions score-ready, needs `render-store-frames.mjs` run on the submission build |
| Ratings & reviews | 20% | n/a pre-launch | Prompt-for-review moment exists in-app; can't score a listing that isn't live |
| Metadata & freshness | 10% | 9/10 | 19 locales; promo text gives a freshness lever post-launch |
| Conversion signals | 10% | 8/10 | Differentiated wedge (no-account, ADHD, weekly goals) stated in first 3 lines + captions |

**Weighted pre-launch score: ~86/100 on scorable dimensions** (visuals pending
render). The listing maximizes index coverage without a single risky claim —
no "free" in indexed fields, no superlatives, no competitor names, no
unsubstantiated claims (Apple 2.3.10-safe).

**Iteration notes**: v1 draft put `deep work` in the keyword field — moved to
subtitle where it indexes harder and frees 9 bytes for `interval,session`.
`pomodoro live activity` dropped after live search showed a dead term. `adhd`
kept as a subtitle token (catches `adhd focus`/`adhd timer`/`adhd app` combos)
instead of chasing the bare term owned by mental-health giants.

## Console cheat-sheet — en-US (repeat per locale from its file)

App Store Connect → app 6818991496 → version 1.0.0 listing:
- Name: `Focus Loop: Pomodoro Timer`
- Subtitle: `ADHD deep work & study breaks`
- Keywords: `tomato,concentration,productivity,flow,widget,reminder,habit,weekly,goal,interval,session,countdown`
- Promotional text / Description / What's New: copy blocks in `en-US.md`
- Add the 18 other localizations from their `<locale>.md` files (ASC locale codes: en-US, vi, es-MX for `es`, pt-BR, de-DE, fr-FR, it, ja, ko, zh-Hans, zh-Hant, ru, tr, id, th, pl, nl, ar-SA, hi)

Play Console → main store listing:
- App name: `Focus Loop: Pomodoro Timer`
- Short description + Full description from `en-US.md`; add custom store
  listings per locale (Play locale codes differ — `es` covers es-ES/es-419)

## Screenshot frame plan (unchanged from seed, captions finalized per locale)

8 frames per the seed order — Disc hero, loop, weekly goal, widgets, no-shame
behaviours, share card, themes/Plus, tablet optional. Captions live in each
locale file under `## Screenshot captions` in `render-store-frames.mjs` format
(tag | headline | sub-line). Captures must come from the submission build
(vc5 / iOS build 10) — Apple 2.3.3.

## Post-launch tracking

After v1 ships: `rank-snapshot.mjs --app-id 6818991496 --country us --locale en-US`
(and `vn/vi`) monthly → `docs/growth/aso/ranks.csv`. Success markers from Gate 0:
top-15 `pomodoro timer` US and top-5 `adhd focus app` US within 9 months;
secondary: top-5 `deep work timer` and top-3 `hẹn giờ tập trung` VN within
the first quarter — both realistic given the difficulty data above.
