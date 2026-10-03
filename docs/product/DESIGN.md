# Focus Loop — Design rules

**Status**: v2.1 · `design:hifi` · built from canvas `1791071241-7cd3` (synced 2026-10-03). v2.1: ads defined as trigger points only. Previous: v2.0 (`1791070597-62cf`), v1 Pilot
(minimal, superseded).

The screens are in [`design/`](design/SNAPSHOT.md) and the tokens, icons and app icon in
[`../brand/design/`](../brand/design/SNAPSHOT.md). This file holds the rules a build must follow. Sponsor decisions
and open points are in [`DESIGN_REVIEW.md`](DESIGN_REVIEW.md).

## 1. Principles

1. **One tap to focus.** Cold start to running timer in at most 2 taps (P01 → P02 tap) on first launch, 1 tap from
   Home or a widget afterwards.
2. **The loop, not the session.** The unit is a loop: N × (focus + break) + long break. The app always shows where
   the user is in it.
3. **Two ways to see time.** Disc (see it) or Numbers (read it). The user picks on first launch and can switch on the
   Focus screen at any time. Every surface (Live Activity, widgets, tablet) follows the choice.
4. **Your words in serif.** Anything the user typed (intention, parked thoughts) is set in Newsreader. Everything the
   app says is Host Grotesk.
5. **No shame.** No streaks, no red failure states. Ended-early and "Got stuck" sessions still count.
6. **Ads only after value.** Never on Focus, Break, Close-out or any sheet. The design fixes where ads may trigger; the server decides whether they show. See §5.
7. **One primary action per screen**, at the bottom, in the thumb zone.

## 2. Foundations

Use `docs/brand/design/tokens.json`. Do not hard-code hex values in components; map them to theme roles.

- Appearance: Light, Dark, System (default System). Both themes ship together; no screen may exist in one only.
- `focus` is for fills only. Coloured text uses `focus-text` / `break` (light) or `break-text` (dark) so contrast stays
  ≥ 4.5:1.
- On dark, text on a `break` fill is `on-break` (#0B0A09), not white.
- `faint` is for text ≥ 24px only.
- Timer digits use tabular figures (`tnum`).
- Dynamic Type: all text scales; the timer is capped at 1.3×.
- Touch targets ≥ 44 × 44pt / 48 × 48dp, 8pt apart.

## 3. Components

| Component        | Rule                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Primary button   | 64 high, pill, `ink` fill. May carry a right-aligned duration in `primary-accent`. One per screen.                                      |
| Break button     | Primary button with `break` fill. Used only when the next step is a break.                                                              |
| Secondary button | 52–56 high, pill, 1.5px `ink` outline (or `rule` for low-emphasis).                                                                     |
| Text button      | `muted`, no border. Destructive or exit actions ("End early…", "Not now") are always text buttons, never filled red.                    |
| Display toggle   | Segmented control, two 52 × 44 segments: disc glyph and "12:34". Has `aria-pressed`/selected state and accessible names.                |
| Disc             | Conic fill: `focus` for remaining, `track` for elapsed, starting at 12 o'clock and shrinking clockwise. Anti-alias the edge (≥ 0.5°).   |
| Loop strip       | One segment per focus / break, width proportional to duration, 3px gap. Done = solid; current = fills with progress; pending = `track`. |
| List row         | 54 min height, hairline `rule` below, a 1.5px `ink` rule above the first row of a group.                                                |
| Sheet            | Bottom sheet, radius 24 top, `surface`, over `scrim`. Primary action first (top), then secondary, then text action.                     |
| Toast            | Inverted surface, 4 s, polite live region. Used for rewarded-ad failure.                                                                |

## 4. Screens

### P01 Splash

- Mark + wordmark only, `bg` of the active theme. No loading spinner.
- On relaunch with an active session: go straight to P06 if time remains, P13 if it ended (J9).

### P02 First launch — choose display

- Shown once. Two full-width cards: **See it** (disc) and **Read it** (numbers).
- Tapping a card saves the display choice **and** starts a 25-minute focus (no extra Start button).
- No account, no onboarding pages, no permission prompts here.

### P03 Notification pre-prompt

- Shown once, after the first completed focus, before the OS permission dialog (spec J3-R3).
- Lists exactly the three notification types the app sends. "Not now" never re-asks within 7 days.

### P04 / P05 Home

- Shows: date, "Focus N of M", loop strip with "Loop ends HH:MM", optional intention field, the most recent parked
  thought with a "use this" action, today and week summary, primary Start button with duration.
- Intention is optional; empty is fine. Placeholder: "What will you work on?"
- P05 (first day of a week): headline "A new week.", goal strip with any-N-days copy. Never shows zeros as failure.
- Banner ad 320 × 50 at the very bottom, free tier only.

### P06 / P07 Focus (Disc / Numbers)

- Header: "FOCUS N OF M" (`focus-text`), display toggle on the right.
- Intention in serif, 26px, under the header (omitted if empty).
- Disc mode: 280px disc + "about X min left" (rounded up). Numbers mode: minutes 200px, seconds 56px in `faint`,
  "minutes left · ends HH:MM". Disc never shows seconds. In Numbers, Settings → Show seconds controls the small
  seconds (default: open point OP-03 in `DESIGN_REVIEW.md`).
- Loop strip + "Next: 5 min break".
- "Later, not now…" opens SHT-later; the timer keeps running.
- Pause (secondary) / Resume; "End early…" (text) opens SHT-end-early. There is no one-tap cancel.
- Keep screen awake while running. No ads, banners or upsells.

### P08 SHT-later

- One text field ("What popped into your head?"), list of already-parked thoughts, Cancel / Park it.
- Parked thoughts appear on Home, in the Next-up widget and are offered at the next session.

### P09 SHT-end-early

- Pauses the timer while open. Shows minutes focused.
- Actions in order: **Keep going** (primary), **End and save N min** (secondary), **Discard this session** (text).
- Ending early records a partial session that counts toward the week.

### P10 Close-out

- Shown when a focus ends. Header "FOCUS N DONE · 25 MIN" and the intention.
- Single-choice outcome: Finished it / Moved it forward / Got stuck ("still counts"). Optional; skipping records no
  outcome.
- "Start breaks automatically" toggle; primary **Start break 5:00** (break button); text "Keep going, 10 more
  minutes".
- No ad on this screen.

### P11 Break

- Full-screen `break-bg`. Follows the display choice (disc in white, or numbers).
- Three off-screen suggestions. Actions: +5 min (secondary), **Focus N now** (primary, white).
- If auto-start is on, the next focus starts when the break ends, with a notification.

### P12 Loop complete

- Total focus minutes, full loop strip, one row per focus with intention and outcome, week-goal line.
- Primary **Long break 15:00**, secondary **Share my week**.
- First loop ever: show P14 when leaving this screen. Later loops: interstitial trigger when leaving (§5).

### P13 Welcome back

- When the app was killed and the session ended while closed. Confirms it was saved; no blame copy.
- Primary "How did it go?" → P10; secondary "Skip to break" → P11.

### P14 Paywall

- Close (×) always visible top right. Five benefits, plan picker (Yearly with 7-day trial, Lifetime), primary
  "Start free trial", trial terms, Restore / Terms / Privacy links.
- Prices come from the store; never hard-code.

### P15 Themes & sounds

- Disc colours as radio swatches; locked ones carry a lock badge and an accessible name ending "try with an ad".
- Choosing a locked item opens the trial card: "Try X for 24 hours" with **Watch video** and **Get Plus**.
- Rewarded video plays only after an explicit tap. Load failure → toast "Couldn't load the video. Try again".
- Plus-only sounds are labelled "Plus".

### P16 Welcome to Plus

- Confirms ads are gone, links to the three most valuable unlocks, primary "Back to my loop".

### P17 Week / P18 History

- Segmented Week | History.
- Week: "N of G days", "Goal met" when N ≥ G; bar per day; minutes / finished / moved forward; one plain-language
  insight. No streak counts anywhere.
- History: grouped by day, time · intention (or "No note") · outcome. Ended-early sessions say "Ended early".
- Free tier: last 7 days, then a footer "See all with Plus".

### P19 Share

- 9:16 card preview, three styles (Ink, Paper, Ember), "Show what I worked on" off by default (privacy).
- Card always carries the app name. "Share image" opens the system share sheet.

### P20 Settings (scrolls)

- Order: Show time as · Appearance · timer rows (Rhythm, Weekly goal, Start breaks automatically, Show seconds,
  Vibrate at the end, Themes & sounds, Reminders) · Plus card with Restore purchases · Your data (Export CSV, Delete
  all data…) · About (Privacy Policy, Terms of Use, Ad choices & tracking, Open-source licenses, Contact & feedback)
  · "Focus Loop · Version x.y.z (build n)".
- Changes save immediately. There is no Save button.
- "Delete all data…" asks for confirmation.

### P21 Rhythm / P22 Reminders

- Rhythm presets: Classic 25/5×4, Gentle start 15/5, Deep work 50/10×3, Custom. Steppers for focus, break, long
  break, rounds; the strip and "One loop = …" update live.
- Reminders: list of times with weekday chips and a toggle each; "Add a reminder"; optional one gentle evening note
  on goal days, off by default.

### P23 Live Activity and notifications

- Live Activity follows the display choice: disc + intention + "about X min", or big numbers + "Break at HH:MM".
  Pause action on the activity.
- Notifications: "Break time", "Back to it", "Time to focus" (reminder). No marketing notifications.

### P24 Widgets

- Small idle: full disc, "N/G days", **Focus 25** (starts a session, opens P06). Small running: "Focus N of M",
  minutes left, break time.
- Medium "Next up": most recent parked thought + Start.
- Lock screen: circular disc gauge; inline "N of G days".

### Tablet (T01–T06)

- 48 padding. Home and Week/History are two columns; Settings is master–detail (sections left, detail right).
- Focus landscape: 540px disc left, intention, time, strip, parked thoughts and controls right. Portrait Numbers:
  minutes at 380px.
- Banner ad on tablet is 320 × 50 in the right column, free tier only.

## 5. Ads and Plus

| Placement     | Rule                                                                                                                                                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Banner        | Home (phone and tablet) only, free tier only.                                                                                                                                                                                                |
| Interstitial  | Trigger points: leaving P12 Loop complete, and leaving P10 Close-out after the 2nd focus when the loop is not completed. Whether an ad is shown at a trigger (frequency, caps, new-user grace) is decided by the server, not the app design. |
| Rewarded      | Only from P15 on an explicit tap. Grants a 24-hour trial of one item.                                                                                                                                                                        |
| Paywall       | First time leaving P12; otherwise only from Settings or a locked item. Never before the first session.                                                                                                                                       |
| Review prompt | Store review API after the 3rd completed loop that contains at least one "Finished".                                                                                                                                                         |

## 6. Motion and accessibility

- Respect Reduce Motion: the disc updates once per minute; sheet and screen transitions use platform defaults.
- Light haptic at the end of focus and at the end of a break.
- Every icon-only button has an accessible name; the disc has `role=img` with "About X minutes left".
- Colour is never the only signal: outcomes are words, loop segments have a text summary.
- Contrast: all text ≥ 4.5:1 (≥ 3:1 at 24px+) in both themes.
