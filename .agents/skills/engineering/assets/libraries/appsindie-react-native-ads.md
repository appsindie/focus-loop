# `@appsindie/react-native-ads` Integration Notes

## Purpose
Reusable ad components built on top of `react-native-google-mobile-ads` for common ad scenarios.

## Use when
- Build issue requires ad placements with standardized behavior.
- Team needs plug-and-play ad surfaces with minimal custom wiring.

## Compatibility checkpoints
- Expo SDK and React Native compatibility.
- `react-native-google-mobile-ads` major version alignment.
- Tracking/transparency requirements for target platform.

## Integration evidence
- Ad placement behavior verified in development/test environment.
- Consent and tracking flow documented for target region/policy.
- Failure/degraded ad states handled gracefully (no crash/blocking UI).
