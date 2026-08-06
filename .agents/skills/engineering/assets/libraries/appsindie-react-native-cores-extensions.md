# `@appsindie/react-native-cores-extensions` Integration Notes

## Purpose
Domain-oriented extensions on top of cores, focused on number/currency/percentage rendering utilities and components.

## Use when
- User flows include financial values, KPI dashboards, or precision formatting requirements.
- Existing cores components need formatting-focused enhancements.

## Compatibility checkpoints
- `@appsindie/react-native-cores` compatibility and installed version.
- Expo localization and i18n behavior.
- Unit test expectations for formatting edge cases.

## Integration evidence
- Format outputs verified for target locales.
- Edge-case handling verified (null, zero, negative, high precision values).
- Snapshot or behavior tests updated for formatter-dependent components.
