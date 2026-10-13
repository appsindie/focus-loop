import { describe, expect, it } from "@jest/globals";
import { homeBannerPlacement } from "./layout";

describe("homeBannerPlacement", () => {
  it("places phone banners at the bottom in portrait", () => {
    expect(homeBannerPlacement(false, false)).toBe("bottom");
  });

  it("places phone banners at the bottom in landscape", () => {
    expect(homeBannerPlacement(false, true)).toBe("bottom");
  });

  it("places portrait tablet banners at the bottom", () => {
    expect(homeBannerPlacement(true, false)).toBe("bottom");
  });

  it("places landscape tablet banners in the column", () => {
    expect(homeBannerPlacement(true, true)).toBe("column");
  });
});
