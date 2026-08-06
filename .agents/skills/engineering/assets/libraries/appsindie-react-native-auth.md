# `@appsindie/react-native-auth` Integration Notes

## Purpose
Reusable authentication journeys built on top of Firebase auth and AppsIndie cores.

## Use when
- New app or feature needs standardized login/register/forgot-password/social-auth flows.
- Team wants shared auth UX with minimal feature-specific customization.

## Compatibility checkpoints
- Firebase auth SDK major version alignment.
- Navigation and state-management dependencies installed and compatible.
- Apple/Google sign-in dependencies and platform config readiness.

## Integration evidence
- Core auth scenarios verified (password, register, forgot password, social where in scope).
- Error and edge-state behavior validated (invalid credentials, network failure, lockout).
- Security trigger policy considered for any auth flow changes.
