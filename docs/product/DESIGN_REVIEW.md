# Focus Loop — Design review log

Sponsor: justin.nguyen@appsindie.com · Canvas: https://claude.ai/artifact/353nThLC4HuEBSdmAZFuUd

Merging a `design-sync` PR is the sponsor's approval of that canvas version. Newest round on top.

## Open shaping points

| Id    | Point                                                                                                                                                                                                                       | Proposed default                                     | Owner   |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------- |
| OP-01 | Plus pricing (yearly, lifetime) and trial length. Screens show `[PRICE]`.                                                                                                                                                   | 7-day trial on yearly; prices from store experiments | Sponsor |
| OP-02 | Rewarded unlock is a **24-hour trial** in the design. Spec J6-R3 previously said the unlock persists. Spec updated to the design; confirm, or the design reverts to a permanent unlock.                                     | 24-hour trial                                        | Sponsor |
| OP-03 | Default of Settings → Show seconds. P07 shows seconds; P20 shows the toggle off.                                                                                                                                            | On (affects Numbers only)                            | Sponsor |
| OP-04 | Streak removed in favour of a weekly goal (any N of 7 days). Changes spec J1-R6 and J4. North-star tracking must switch to "days focused per week".                                                                         | Weekly goal 4 days                                   | Sponsor |
| OP-05 | ~~Interstitial frequency cap~~ — closed 2026-10-03: frequency and caps are server-side; the design only fixes trigger points (leaving Loop complete; leaving Close-out after the 2nd focus when the loop is not completed). | Closed                                               | Sponsor |
| OP-06 | App icon and palette change from Pilot green to ink + ember. Store assets and splash need regenerating.                                                                                                                     | Adopt                                                | Sponsor |
| OP-07 | Values set by design without data: weekly goal 4, review prompt after 3rd loop, history 7 days free.                                                                                                                        | Keep, revisit after 4 weeks of data                  | Growth  |

## Round 4 — 2026-10-03 · canvas `1791071241-7cd3` (this sync)

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
