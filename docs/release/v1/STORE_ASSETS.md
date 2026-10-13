# Store assets — v1

- Asset set: `store-assets/focus-loop/v1-ed073a8` ([published release](https://github.com/appsindie/focus-loop/releases/tag/store-assets/focus-loop/v1-ed073a8))
- Source tree: `main` at `ed073a8235dd8d39281ffc9a99ed2b784b2a8b0a`
- Captured build: iOS `ed073a8-sim` — Release simulator capture from this tree; b23 is not built yet and will be cut from the same tree, with `check-reuse` to run then. Android versionCode `10`.
- Flows: `.maestro/store/*.yaml` from `ed073a8`
- Theme: `docs/product/brand/store/` from `ed073a8`
- Screen-source pathspec: `apps/mobile/src/**,.maestro/store/**,docs/product/brand/store/**,docs/product/store_metadata/**,apps/mobile/app.json`
- Published screenshot layout: `fastlane/screenshots/<locale>/` for iOS; `fastlane/metadata/android/<locale>/images/{phoneScreenshots,sevenInchScreenshots,tenInchScreenshots}/` for Play
- Locale coverage: 20 ASC locales (19 metadata locales plus `es-MX`) and 20 Play locales (19 existing listing codes plus `es-419`); both Spanish aliases use the `es` render.
- Lanes run: `ios listing_assets` for ASC version 1.0 and `android listing_assets` for the Play internal listing on 2026-10-13. Screenshots only; no metadata, feature graphic, binary, submission, or production promotion.
- Readback: all screenshot sets and downloaded image dimensions/hashes are recorded in [`evidence/2026-10-13/store-screenshots-readback.json`](evidence/2026-10-13/store-screenshots-readback.json). Manifest SHA-256: `845348b7f085627bc4f8d445664f36b62ad13f1cc941cf2d3a6be03136153a87`.

| Platform | Device class   | Dimensions | Store locales         | Frames | Previews | Uploaded and read back              |
| -------- | -------------- | ---------- | --------------------- | ------ | -------- | ----------------------------------- |
| ios      | iPhone 6.9"    | 1290×2796  | 20 (es-MX uses `es`)  | 6 each | none     | `ios listing_assets` 2026-10-13     |
| ios      | iPad Pro 13"   | 2064×2752  | 20 (es-MX uses `es`)  | 6 each | none     | `ios listing_assets` 2026-10-13     |
| android  | phone          | 1080×1920  | 20 (es-419 uses `es`) | 6 each | none     | `android listing_assets` 2026-10-13 |
| android  | 7-inch tablet  | 1200×1920  | 20 (es-419 uses `es`) | 6 each | none     | `android listing_assets` 2026-10-13 |
| android  | 10-inch tablet | 1600×2560  | 20 (es-419 uses `es`) | 6 each | none     | `android listing_assets` 2026-10-13 |

Generated artwork: `featureGraphic.png` — hand-authored HTML/CSS banner (no generative model), `fastlane/metadata/android/*/images/featureGraphic.png` | `icon.png` — store icon derived from `apps/mobile/assets/icon.png` (1024→512).

Device coverage notes: Store screenshot coverage is complete for iPhone 6.9", iPad Pro 13", Play phone, and Play 7"/10" tablets; `EX-tablet-screenshots` was resolved on 2026-10-13. This does not close the separate tablet E2E exception (`EX-tablet-e2e`). iPad and iPhone captures use the Release simulator app from the `ed073a8` tree via `.maestro/store/`; only captions vary by locale, with `es-MX` and `es-419` rendered from Spanish metadata.
