# Store assets — v1

- Asset set: `store-assets/focus-loop/v1-ed073a8-r2` ([published release](https://github.com/appsindie/focus-loop/releases/tag/store-assets/focus-loop/v1-ed073a8-r2))
- Supersedes r1: its rounded screen corners clipped Android tablet status-bar glyphs; r2 removes the tablet status-bar strip.
- Capture source commit: `main` at `ed073a8235dd8d39281ffc9a99ed2b784b2a8b0a`
- Captured build: iOS `ed073a8-sim` — Release simulator capture from this tree; b23 is not built yet and will be cut from the same tree, with `check-reuse` to run then. Android versionCode `10`.
- Flows: `.maestro/store/*.yaml` from `ed073a8`
- Theme: `docs/product/brand/store/` from `ed073a8`
- Screen-source pathspec: `apps/mobile/src/**,.maestro/store/**,docs/product/brand/store/**,docs/product/store_metadata/**,apps/mobile/app.json`
- Published screenshot layout: `fastlane/screenshots/<locale>/` for iOS; `fastlane/metadata/android/<locale>/images/{phoneScreenshots,sevenInchScreenshots,tenInchScreenshots}/` for Play
- Locale coverage: 20 ASC locales (19 metadata locales plus `es-MX`) and 20 Play locales (19 existing listing codes plus `es-419`); both Spanish aliases use the `es` render.
- Lanes run: `android listing_assets` uploaded Play 7-inch and 10-inch screenshots on 2026-10-13. ASC and Play phone images were byte-identical to r1 and were not re-uploaded. Screenshots only; no metadata, feature graphic, binary, submission, or production promotion.
- Readback: Play's 60 slots / 360 downloaded images and the unchanged ASC sets are recorded in [`evidence/2026-10-13/store-screenshots-readback.json`](evidence/2026-10-13/store-screenshots-readback.json). Manifest SHA-256: `f7f8c1f2092cb599aaf00f3ae5bf2a8e87a9373f641da7df4c37d4b3e514be9d`.

| Platform | Device class   | Dimensions | Store locales         | Frames | Previews | Uploaded and read back                  |
| -------- | -------------- | ---------- | --------------------- | ------ | -------- | --------------------------------------- |
| ios      | iPhone 6.9"    | 1290×2796  | 20 (es-MX uses `es`)  | 6 each | none     | Byte-identical to r1; no re-upload      |
| ios      | iPad Pro 13"   | 2064×2752  | 20 (es-MX uses `es`)  | 6 each | none     | Byte-identical to r1; no re-upload      |
| android  | phone          | 1080×1920  | 20 (es-419 uses `es`) | 6 each | none     | Byte-identical to r1; no re-upload      |
| android  | 7-inch tablet  | 1200×1920  | 20 (es-419 uses `es`) | 6 each | none     | `android listing_assets` r2, 2026-10-13 |
| android  | 10-inch tablet | 1600×2560  | 20 (es-419 uses `es`) | 6 each | none     | `android listing_assets` r2, 2026-10-13 |

Generated artwork: `featureGraphic.png` — hand-authored HTML/CSS banner (no generative model), `fastlane/metadata/android/*/images/featureGraphic.png` | `icon.png` — store icon derived from `apps/mobile/assets/icon.png` (1024→512).

Device coverage notes: Store screenshot coverage is complete for iPhone 6.9", iPad Pro 13", Play phone, and Play 7"/10" tablets; `EX-tablet-screenshots` was resolved on 2026-10-13. This does not close the separate tablet E2E exception (`EX-tablet-e2e`). iPad and iPhone captures use the Release simulator app from the `ed073a8` tree via `.maestro/store/`; only captions vary by locale, with `es-MX` and `es-419` rendered from Spanish metadata.
