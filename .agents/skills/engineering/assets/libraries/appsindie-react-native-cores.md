# `@appsindie/react-native-cores` Integration Notes

## Purpose
Foundation UI kit for AppsIndie React Native apps. This is the first internal package to evaluate for shared UI requirements.

## Upstream UI foundation
- This package is based on React Native Elements:
  - [https://reactnativeelements.com/docs](https://reactnativeelements.com/docs)

## Use when
- New app requires a consistent design-system baseline.
- Feature work should reuse shared UI primitives instead of ad hoc components.

## Compatibility checkpoints
- Expo SDK version compatibility.
- React Native major version compatibility.
- Peer dependencies:
  - `@react-navigation/native`
  - `react-i18next`
  - `react-native-safe-area-context`
  - `react-native-vector-icons`

## Integration evidence
- Confirm theme and baseline components render in target app.
- Confirm navigation and safe-area integration.
- Confirm no peer dependency warnings at install time.
