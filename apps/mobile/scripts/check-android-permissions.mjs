#!/usr/bin/env node
// Source-manifest permission audit vs android-permissions.json. AAR-only
// permissions are checked against the built artifact by check-aab-permissions.mjs.
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(dirname(fileURLToPath(import.meta.url)));
const allowlistPath = join(appDir, "android-permissions.json");
const allowlist = JSON.parse(readFileSync(allowlistPath, "utf8"));

execSync("npx expo prebuild -p android --clean --no-install", {
  cwd: appDir,
  stdio: ["ignore", "ignore", "inherit"],
});

const PERM_RE = /uses-permission[^>]*android:name="([^"]+)"/g;
const REMOVED_RE = /uses-permission[^>]*android:name="([^"]+)"[^>]*tools:node="remove"/g;
const AAR_ONLY = new Set([
  "com.google.android.gms.permission.AD_ID",
  "android.permission.ACCESS_ADSERVICES_AD_ID",
  "android.permission.ACCESS_ADSERVICES_ATTRIBUTION",
  "android.permission.ACCESS_ADSERVICES_TOPICS",
  "com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE",
  "com.appsindie.focusloop.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION",
]);

const appManifest = readFileSync(join(appDir, "android/app/src/main/AndroidManifest.xml"), "utf8");
const removed = new Set([...appManifest.matchAll(REMOVED_RE)].map((m) => m[1]));
const appPerms = new Set(
  [...appManifest.matchAll(PERM_RE)].map((m) => m[1]).filter((p) => !removed.has(p)),
);

function* libManifests(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (entry === "android") {
        const main = join(p, "src/main/AndroidManifest.xml");
        if (existsSync(main)) yield main;
      } else if (!entry.startsWith(".")) {
        yield* libManifests(p);
      }
    }
  }
}

const libPerms = new Set();
for (const m of libManifests(join(appDir, "node_modules"))) {
  for (const match of readFileSync(m, "utf8").matchAll(PERM_RE)) {
    libPerms.add(match[1]);
  }
}

const merged = new Set([...appPerms, ...[...libPerms].filter((p) => !removed.has(p))]);
const expected = new Set(Object.keys(allowlist));
const drift = (a, b) => [...a].filter((p) => !b.has(p));

const unknown = drift(merged, expected);
const stale = drift(expected, merged);
const staleAarOnly = stale.filter((p) => AAR_ONLY.has(p));
const staleOther = stale.filter((p) => !AAR_ONLY.has(p));
if (unknown.length) {
  console.error("Permissions in source manifests with no allowlist entry — justify or block:");
  unknown.forEach((p) => console.error(`  + ${p}`));
  process.exit(1);
}
if (staleOther.length) {
  console.error("Allowlisted permissions absent from source manifests and not AAR-only:");
  staleOther.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}
console.log(`android-permissions: ${merged.size} source permission(s) audited OK.`);
if (staleAarOnly.length) {
  console.log(
    "Allowlisted permissions absent from source manifests (verified by verify:permissions:aab):",
  );
  staleAarOnly.forEach((p) => console.log(`  - ${p}`));
}
