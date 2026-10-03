# Focus Loop — product design snapshot

- **Canvas**: https://claude.ai/artifact/353nThLC4HuEBSdmAZFuUd (pages "2 · Journeys", "3 · Phone · Light",
  "4 · Phone · Dark", "5 · Tablet")
- **Canvas version**: `1791071241-7cd3`
- **Synced**: 2026-10-03
- **Fidelity**: `design:hifi`
- **Sponsor decisions**: [`../DESIGN_REVIEW.md`](../DESIGN_REVIEW.md)
- **Rules per screen**: [`../DESIGN.md`](../DESIGN.md)
- **Brand (tokens, icons, app icon)**: [`../../brand/design/SNAPSHOT.md`](../../brand/design/SNAPSHOT.md)

`source/*.dc.html` is the design of record. `png/*.png` is a 2× render with the same file name. Do not edit this
folder by hand: change the canvas, then sync. Every build PR must name the canvas version it builds from.

## How the files fit together

- `P##-*.dc.html` — phone screen, 390 × 844 (Settings is 390 × 1540, scrolling). Each takes a `theme` prop
  (`light` | `dark`) and holds both palettes.
- `D##-*.dc.html` — the dark artboard for `P##`. It only imports `P##` with `theme="dark"`, so light and dark can
  never drift.
- `T##-*.dc.html` / `TD##-*.dc.html` — tablet, 1194 × 834 landscape (T06 is 834 × 1194 portrait), same pattern.
- `P07` and `D07` import `P06` with `display="numbers"`.
- `J-Map.dc.html` — journey map with screen codes.
- The `.dc.html` files need the canvas runtime (`support.js`, not in the repo) to render. Use the PNGs to view.

## Screens

| Id                     | Phone (light / dark)                    | Tablet (light / dark)            | Description                                                   | Interactive |
| ---------------------- | --------------------------------------- | -------------------------------- | ------------------------------------------------------------- | ----------- |
| `SCR-splash`           | `P01-Splash` / `D01-Splash`             | —                                | Splash mark and wordmark                                      | No          |
| `SCR-first-launch`     | `P02-FirstLaunch` / `D02-FirstLaunch`   | —                                | Choose Disc or Numbers; the tap starts the first 25 min       | No          |
| `SCR-notification-ask` | `P03-NotifAsk` / `D03-NotifAsk`         | —                                | Pre-prompt after the first session, before the OS dialog      | No          |
| `SCR-home`             | `P04-Home` / `D04-Home`                 | `T01-Home` / `TD01-Home`         | Today's loop, optional intention, parked thought, start       | No          |
| `SCR-home` (new week)  | `P05-HomeFresh` / `D05-HomeFresh`       | —                                | Empty state: new week, nothing parked                         | No          |
| `SCR-focus` (disc)     | `P06-Focus` / `D06-Focus`               | `T02-Focus` / `TD02-Focus`       | Running focus, Disc display                                   | **Yes**     |
| `SCR-focus` (numbers)  | `P07-FocusNumbers` / `D07-FocusNumbers` | `T06-FocusPortrait` / `TD06-…`   | Running focus, Numbers display                                | **Yes**     |
| `SCR-closeout`         | `P10-Closeout` / `D10-Closeout`         | —                                | How did it go? Finished / Moved forward / Got stuck           | No          |
| `SCR-break`            | `P11-Break` / `D11-Break`               | `T03-Break` / `TD03-Break`       | Full-screen break with off-screen suggestions                 | No          |
| `SCR-loop-complete`    | `P12-LoopDone` / `D12-LoopDone`         | —                                | Loop summary, long break, share                               | No          |
| `SCR-welcome-back`     | `P13-WelcomeBack` / `D13-WelcomeBack`   | —                                | Session ended while the app was killed                        | No          |
| `SCR-paywall`          | `P14-Paywall` / `D14-Paywall`           | —                                | Focus Loop Plus, yearly and lifetime                          | No          |
| `SCR-themes-sounds`    | `P15-Themes` / `D15-Themes`             | —                                | Disc colours, focus sounds, rewarded 24h trial card           | No          |
| `SCR-plus-welcome`     | `P16-PlusWelcome` / `D16-PlusWelcome`   | —                                | Purchase success                                              | No          |
| `SCR-week`             | `P17-Week` / `D17-Week`                 | `T04-Progress` / `TD04-Progress` | Days focused vs weekly goal, minutes, outcomes                | No          |
| `SCR-history`          | `P18-History` / `D18-History`           | `T04-Progress` / `TD04-Progress` | Sessions by day with notes and outcomes; 7 days free          | No          |
| `SCR-share`            | `P19-Share` / `D19-Share`               | —                                | Weekly card preview (9:16), style, privacy toggle             | No          |
| `SCR-settings`         | `P20-Settings` / `D20-Settings`         | `T05-Settings` / `TD05-Settings` | Display, appearance, timer, Plus, data, about, legal, version | No          |
| `SCR-rhythm`           | `P21-Rhythm` / `D21-Rhythm`             | —                                | Presets and fine-tune of focus / break / long break / rounds  | No          |
| `SCR-reminders`        | `P22-Reminders` / `D22-Reminders`       | —                                | Scheduled local reminders                                     | No          |

## Boards

| Kind     | Id                  | Source                                  | Description                                                            |
| -------- | ------------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| Sheet    | `SHT-later`         | `P08-Later` / `D08-Later`               | Park a thought without leaving focus                                   |
| Sheet    | `SHT-end-early`     | `P09-EndEarly` / `D09-EndEarly`         | Confirm ending early; partial session is saved                         |
| System   | `SYS-lock-screen`   | `P23-LockScreen` / `D23-LockScreen`     | Live Activity (disc and numbers) and the three notifications           |
| Widgets  | `WGT-home-and-lock` | `P24-Widgets` / `D24-Widgets`           | Small (idle, running), medium Next up, lock-screen circular and inline |
| States   | see screens         | `P05`, `P13`, `P15` toast, `P18` footer | Empty week, killed-app recovery, rewarded failure, free limit          |
| Journeys | `MAP-journeys`      | `J-Map`                                 | J1–J10 with screen codes                                               |

## Numbering and navigation

Screen codes: `P##` phone, `D##` its dark artboard, `T##` / `TD##` tablet. Numbers are stable; a removed screen keeps
its number retired.

| Journey                  | Flow                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| J1 First launch          | P01 → P02 → P06/P07 → P10 → P03 → OS permission → P11                                         |
| J2 Daily loop            | P04 → P06 → (P08) → P10 → P11 → ×4 → P12 → interstitial trigger (server decides) → long break |
| J3 End early             | P06 Pause → P09 → P10 (partial) or Keep going → P06                                           |
| J4 Start outside the app | Widget (P24) → P06, skipping Home · Live Activity (P23) · "Break time" notification → P11     |
| J5 Reminders             | P20 → P22 → notification 09:00 (P23) → P06                                                    |
| J6 Progress and sharing  | P04 → P17 ⇄ P18 · P19 → system share sheet                                                    |
| J7 Upgrade               | P12 (first loop only) → P14 → store purchase → P16                                            |
| J8 Rewarded trial        | P20 → P15 → rewarded video → unlocked 24h · load failure → toast "Try again"                  |
| J9 App killed by the OS  | P01 → still within time → P06 resumes · time passed → P13                                     |
| J10 Customise            | P20 → P21 · display, appearance, seconds · about, legal, version                              |

Tablet uses the same flow; Home and Week/History become two-column, Settings becomes master–detail.

## Changed in this sync

### `1791071241-7cd3` — 2026-10-03

- Journey map (J2): interstitial shown as a trigger point; frequency is server-side. `J-Map` source and PNG updated.
- All PNGs re-rendered: the previous export fell back to system fonts. Sources unchanged.

### `1791070597-62cf` — 2026-10-03

- First hi-fi export. Replaces the Pilot mockups (moved to `docs/product/mockups/pilot-v1/`, exploration only).
- New: loop with breaks, Disc / Numbers display, optional intention, "Later, not now", close-out outcomes, weekly
  goal instead of streak, Plus paywall, rewarded 24h trial, share card, Live Activity, widgets, reminders,
  killed-app recovery, tablet layouts, light and dark themes.
- Self-review fixes before export: Settings no longer clipped, disc edges anti-aliased, history / week / loop data
  made consistent, idle widget shows a full disc, share card outlined in dark, tablet Home schedule.
