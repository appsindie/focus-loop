#!/usr/bin/env bash
set -euo pipefail

if [ -n "${ANDROID_SERVICE_ACCOUNT_JSON:-}" ]; then
  if [ -f "$ANDROID_SERVICE_ACCOUNT_JSON" ]; then
    cp "$ANDROID_SERVICE_ACCOUNT_JSON" ./serviceAccount.json
  else
    printf '%s' "$ANDROID_SERVICE_ACCOUNT_JSON" > ./serviceAccount.json
  fi
fi

if [ -n "${IOS_STORE_CONNECT_P8:-}" ]; then
  if [ -f "$IOS_STORE_CONNECT_P8" ]; then
    cp "$IOS_STORE_CONNECT_P8" ./storeConnect.p8
  else
    printf '%s' "$IOS_STORE_CONNECT_P8" > ./storeConnect.p8
  fi
fi
