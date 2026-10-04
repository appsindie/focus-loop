import { describe, expect, it } from "@jest/globals";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { SUPPORTED_LOCALES } from "./index";

const LOCALES_DIR = join(__dirname, "locales");
const NATIVE_DIR = join(__dirname, "native");

const load = (locale: string): Record<string, string> =>
  JSON.parse(readFileSync(join(LOCALES_DIR, `${locale}.json`), "utf8")) as Record<string, string>;

const enKeys = Object.keys(load("en")).sort();

const placeholderVars = (text: string): string[] => (text.match(/\{[a-zA-Z]+\}/g) ?? []).sort();

describe("locale dictionaries", () => {
  it("ships one dictionary file per supported locale", () => {
    const files = readdirSync(LOCALES_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
    expect(files).toEqual([...SUPPORTED_LOCALES].sort());
  });

  it.each(SUPPORTED_LOCALES)("%s covers every English key", (locale) => {
    const dict = load(locale);
    expect(Object.keys(dict).sort()).toEqual(enKeys);
  });

  it.each(SUPPORTED_LOCALES)("%s preserves every {placeholder}", (locale) => {
    const dict = load(locale);
    for (const key of enKeys) {
      expect(placeholderVars(dict[key] ?? "")).toEqual(placeholderVars(key));
    }
  });

  it.each(SUPPORTED_LOCALES)("%s has a native InfoPlist strings file", (locale) => {
    const native = JSON.parse(
      readFileSync(join(NATIVE_DIR, `${locale}.strings.json`), "utf8"),
    ) as Record<string, string>;
    expect(native["CFBundleDisplayName"]).toBe("Focus Loop");
    expect(native["NSUserTrackingUsageDescription"]).toBeTruthy();
  });
});
