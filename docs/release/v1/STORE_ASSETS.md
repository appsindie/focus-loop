# Store assets — v1

- Asset set: `store-assets/focus-loop/v1` — captured for this build
- Captured build: ios 21 / android 7
- Flows: `.maestro/store/*.yaml` @ this PR's branch
- Theme: `docs/product/brand/store` @ this PR's branch
- Screen sources: `fastlane/screenshots/*/APP_IPHONE_69-*.jpg`, `fastlane/metadata/android/*/images/phoneScreenshots/*.jpg`, `fastlane/metadata/android/*/images/featureGraphic.png`, `fastlane/metadata/android/*/images/icon.png`
- Locales: all 19 listing locales (en-US, vi, ar-SA, de-DE, es-ES, fr-FR, hi, id, it, ja, ko, nl-NL, pl, pt-BR, ru, th, tr, zh-Hans, zh-Hant; Play mirrors under its own codes)
- Lanes run: `deliver --skip_metadata --skip_binary_upload --overwrite_screenshots` 2026-10-11; `supply --skip_upload_apk --skip_upload_aab --skip_upload_metadata --skip_upload_changelogs` 2026-10-11

| Platform | Device class | Locale | Frames | Previews | Uploaded (command, date) |
| --- | --- | --- | --- | --- | --- |
| ios | 6.9" (1290×2796) | 19 locales | 6 each | none | deliver 2026-10-11 |
| android | phone (1080×1920) | 19 locales | 6 each | none | supply 2026-10-11 |

Generated artwork: `featureGraphic.png` — hand-authored HTML/CSS banner (no generative model), `fastlane/metadata/android/*/images/featureGraphic.png` | `icon.png` — store icon derived from `apps/mobile/assets/icon.png` (1024→512).

Device coverage notes: iPhone-only app (`supportsTablet` not claimed), portrait-only — no iPad/tablet sets required. Frames captured on iOS simulator (iPhone 17, 1206×2622) from the submitted build via `.maestro/store/` flows; per-locale captures are identical app screens — only captions differ per locale, captured once in en-US and re-rendered with each locale's captions.
