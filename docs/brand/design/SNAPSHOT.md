# Focus Loop brand — design snapshot

- **Canvas**: https://claude.ai/artifact/353nThLC4HuEBSdmAZFuUd (page "1 · Brand")
- **Canvas version**: `1791071241-7cd3`
- **Synced**: 2026-10-03
- **Fidelity**: `design:hifi`
- **Sponsor decisions**: [`docs/product/DESIGN_REVIEW.md`](../../product/DESIGN_REVIEW.md)

Shared by every app that uses the Focus Loop brand. Product screens live in
[`docs/product/design/`](../../product/design/SNAPSHOT.md).

`source/*.dc.html` is the design of record. `png/*.png` is a 2× render for people who cannot open the canvas. Do not
edit anything in this folder by hand: change the canvas, then sync.

## Files

| File                           | What it is                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| `tokens.json`                  | Role colour tokens (light and dark), fonts, type scale, spacing, radius, sizes, motion         |
| `icons.json`                   | 24px stroke icon set; each entry is the inner SVG                                              |
| `focus-loop-icon.svg`          | Master app icon, 1024 × 1024, default variant                                                  |
| `source/B-Icon.dc.html`        | App icon board: default, iOS Dark, iOS Tinted, Android adaptive and themed, small sizes, store |
| `source/B-Foundations.dc.html` | Token table light / dark, typography, spacing, radius, motion                                  |
| `source/B-Components.dc.html`  | Buttons, display toggle, disc, loop strip, rows, toast — light and dark side by side           |

## Boards

| Id                | Source                         | Description                           | Interactive |
| ----------------- | ------------------------------ | ------------------------------------- | ----------- |
| `BRD-app-icon`    | `source/B-Icon.dc.html`        | Icon variants and sizes               | No          |
| `BRD-foundations` | `source/B-Foundations.dc.html` | Tokens, type, spacing, radius, motion | No          |
| `BRD-components`  | `source/B-Components.dc.html`  | Core components in both themes        | No          |

## Icon variants

| Platform         | Background      | Ring                 | Wedge      |
| ---------------- | --------------- | -------------------- | ---------- |
| Default (stores) | `#141210`       | `#F6F3EE`            | `#FF6A2B`  |
| iOS Dark         | `#000000`       | `#3A3631`            | `#FF6A2B`  |
| iOS Tinted       | system          | white 45%            | white      |
| Android adaptive | `#141210` layer | `#F6F3EE`, safe 66dp | `#FF6A2B`  |
| Android themed   | system          | monochrome 45%       | monochrome |

The wedge is the remaining-time disc used in the app. At 60px and below the ring stroke thickens (72 → 84 units) so
it does not blur.

## Changed in this sync

### `1791071241-7cd3` — 2026-10-03

- Brand PNGs re-rendered with the correct fonts (previous export fell back to system fonts). Sources unchanged.

### `1791070597-62cf` — 2026-10-03

- First brand export: icon family, splash mark, tokens for light and dark, component sheet.
- Replaces the Pilot palette (`primary #2D5A27`, system fonts). Focus is now ember, break is green.
