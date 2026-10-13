#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(dirname(fileURLToPath(import.meta.url)));
const allowlist = JSON.parse(readFileSync(resolve(appDir, "android-permissions.json"), "utf8"));
const aabPath = process.argv[2];

if (!aabPath) {
  console.error("Usage: npm run verify:permissions:aab -- <path.aab>");
  process.exit(2);
}

const bundlePath = resolve(process.cwd(), aabPath);
if (!existsSync(bundlePath)) {
  console.error(`AAB not found: ${bundlePath}`);
  process.exit(2);
}

let manifest;
try {
  manifest = execFileSync(
    "bundletool",
    ["dump", "manifest", `--bundle=${bundlePath}`, "--module=base"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
} catch (error) {
  if (error.code === "ENOENT") {
    console.error("bundletool is required. Install it with: brew install bundletool");
  } else {
    console.error(
      `bundletool dump manifest failed: ${error.stderr?.toString().trim() || error.message}`,
    );
  }
  process.exit(2);
}

const permissions = new Set(
  [...manifest.matchAll(/<uses-permission(?:-sdk-23)?\b[^>]*android:name="([^"]+)"/g)].map(
    (match) => match[1],
  ),
);
const allowlisted = new Set(Object.keys(allowlist));
const unallowlisted = [...permissions].filter((permission) => !allowlisted.has(permission));
const absent = [...allowlisted].filter((permission) => !permissions.has(permission));

console.log(`AAB permissions: ${permissions.size}; allowlisted: ${allowlisted.size}.`);
if (unallowlisted.length > 0) {
  console.error("Permissions present in AAB but not allowlisted:");
  unallowlisted.forEach((permission) => console.error(`  + ${permission}`));
}
if (absent.length > 0) {
  console.error("Allowlisted permissions absent from AAB:");
  absent.forEach((permission) => console.error(`  - ${permission}`));
}
if (unallowlisted.length > 0 || absent.length > 0) {
  process.exit(1);
}
console.log("AAB permissions match android-permissions.json.");
