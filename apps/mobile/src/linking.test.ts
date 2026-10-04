import { describe, expect, it } from "@jest/globals";
import { parseFocusLoopUrl } from "./linking";

describe("parseFocusLoopUrl", () => {
  it("parses widget and Live Activity intents", () => {
    expect(parseFocusLoopUrl("focusloop://start")).toBe("start");
    expect(parseFocusLoopUrl("focusloop://pause")).toBe("pause");
    expect(parseFocusLoopUrl("focusloop:///start")).toBe("start");
  });

  it("ignores unrelated URLs and empty input", () => {
    expect(parseFocusLoopUrl(null)).toBeNull();
    expect(parseFocusLoopUrl(undefined)).toBeNull();
    expect(parseFocusLoopUrl("")).toBeNull();
    expect(parseFocusLoopUrl("focusloop://settings")).toBeNull();
    expect(parseFocusLoopUrl("https://example.com/start")).toBeNull();
  });
});
