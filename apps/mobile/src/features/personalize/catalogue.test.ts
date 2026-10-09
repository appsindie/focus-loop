import { describe, expect, it } from "@jest/globals";
import {
  CATALOGUE,
  DEFAULT_DISC_COLOR_ID,
  DEFAULT_FOCUS_SOUND_ID,
  DISC_COLORS,
  FOCUS_SOUNDS,
  catalogueItem,
  normalizeDiscColorId,
  normalizeFocusSoundId,
  shadeHex,
} from "./catalogue";

describe("catalogue (J8 / P15)", () => {
  it("keeps ids unique across both kinds", () => {
    const ids = CATALOGUE.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ships exactly one free default per kind", () => {
    expect(DISC_COLORS.filter((i) => i.tier === "free").map((i) => i.id)).toEqual([
      DEFAULT_DISC_COLOR_ID,
    ]);
    expect(FOCUS_SOUNDS.filter((i) => i.tier === "free").map((i) => i.id)).toEqual(
      expect.arrayContaining([DEFAULT_FOCUS_SOUND_ID, "white-noise", "brown-noise"]),
    );
  });

  it("marks every non-default disc colour as a 24h trial item (spec J8)", () => {
    for (const item of DISC_COLORS.filter((i) => i.id !== DEFAULT_DISC_COLOR_ID)) {
      expect(item.tier).toBe("trial");
    }
  });

  it("keeps ambient sounds Plus-only with no trial (spec J8-R4)", () => {
    expect(catalogueItem("rain-on-window")?.tier).toBe("plus");
    expect(catalogueItem("ocean-waves")?.tier).toBe("plus");
    expect(CATALOGUE.filter((i) => i.tier === "plus").map((i) => i.id)).toEqual([
      "rain-on-window",
      "ocean-waves",
    ]);
  });

  it("normalizes unknown or legacy ids to the free defaults", () => {
    expect(normalizeDiscColorId("gone")).toBe(DEFAULT_DISC_COLOR_ID);
    expect(normalizeDiscColorId(null)).toBe(DEFAULT_DISC_COLOR_ID);
    expect(normalizeDiscColorId("ocean")).toBe("ocean");
    expect(normalizeFocusSoundId("gone")).toBe(DEFAULT_FOCUS_SOUND_ID);
    expect(normalizeFocusSoundId("white-noise")).toBe("white-noise");
    // Kind-confused ids must not leak across: a sound id is not a disc colour.
    expect(normalizeDiscColorId("white-noise")).toBe(DEFAULT_DISC_COLOR_ID);
    expect(normalizeFocusSoundId("ocean")).toBe(DEFAULT_FOCUS_SOUND_ID);
  });

  it("darkens swatch hex for the focusText role", () => {
    // 0.85 lands Ember's #D9480F ≈ the canvas focusText (#B93C0A).
    expect(shadeHex("#D9480F", 0.85)).toBe("#b83d0d");
    expect(shadeHex("not-hex", 0.85)).toBe("not-hex");
  });
});
