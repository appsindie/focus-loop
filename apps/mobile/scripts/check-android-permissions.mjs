#!/usr/bin/env node
// Merged-manifest permission audit vs android-permissions.json allowlist.
// models the real merge: app manifest (regenerated via expo prebuild) minus
// tools:node="remove" entries, plus every bundled library manifest. Drift in
// either direction fails — an allowlist edit IS the review surface.
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
if (unknown.length || stale.length) {
  if (unknown.length) {
    console.error("Permissions in merged manifest with no allowlist entry — justify or block:");
    unknown.forEach((p) => console.error(`  + ${p}`));
  }
  if (stale.length) {
    console.error("Allowlist entries no longer in the merged manifest:");
    stale.forEach((p) => console.error(`  - ${p}`));
  }
  process.exit(1);
}
console.log(`android-permissions: ${merged.size} permission(s) audited OK.`);
