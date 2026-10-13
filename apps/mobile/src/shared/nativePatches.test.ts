import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "@jest/globals";

type MobilePackage = {
  expo?: {
    autolinking?: {
      android?: {
        buildFromSource?: string[];
      };
    };
  };
};

const mobileRoot = resolve(__dirname, "../..");
const patchesDirectory = join(mobileRoot, "patches");
const packageConfig = JSON.parse(
  readFileSync(join(mobileRoot, "package.json"), "utf8"),
) as MobilePackage;
const androidPatchedPackages = new Set<string>();
const androidPackagePath = /^\+\+\+ b\/node_modules\/((?:@[^/]+\/)?[^/]+)\/android(?:\/|$)/gm;

for (const fileName of readdirSync(patchesDirectory).filter((name) => name.endsWith(".patch"))) {
  const patch = readFileSync(join(patchesDirectory, fileName), "utf8");
  for (const [, packageName] of patch.matchAll(androidPackagePath)) {
    if (packageName) {
      androidPatchedPackages.add(packageName);
    }
  }
}

describe("Android native patches", () => {
  it("builds every patched Android package from source", () => {
    const buildFromSource = packageConfig.expo?.autolinking?.android?.buildFromSource ?? [];
    const missingPackages = [...androidPatchedPackages].filter(
      (packageName) => !buildFromSource.includes(packageName),
    );

    expect(androidPatchedPackages.size).toBeGreaterThan(0);
    expect(missingPackages).toEqual([]);
  });
});
