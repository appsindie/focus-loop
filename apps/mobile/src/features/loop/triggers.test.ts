import { describe, expect, it } from "@jest/globals";
import { isCloseoutTriggerPoint } from "./triggers";
import { isWithinAdGrace, notifyInterstitialTrigger } from "../ads/adBroker";

describe("interstitial trigger points (§5)", () => {
  it("fires leaving P10 only from the 2nd completed focus and only mid-loop", () => {
    expect(isCloseoutTriggerPoint(1, false)).toBe(false);
    expect(isCloseoutTriggerPoint(2, false)).toBe(true);
    expect(isCloseoutTriggerPoint(3, false)).toBe(true);
    expect(isCloseoutTriggerPoint(2, true)).toBe(false); // completed loop → P12 path
  });
});

describe("new-user ad grace (ADR-003, client-side)", () => {
  const now = new Date("2026-10-03T12:00:00Z");

  it("suppresses triggers inside the 3-day window", () => {
    const install = "2026-10-02T12:00:00Z"; // 1 day old
    expect(isWithinAdGrace(install, now)).toBe(true);
    expect(notifyInterstitialTrigger("loop-done-leave", { firstInstallAt: install, now })).toBe(
      "suppressed-grace",
    );
  });

  it("lets triggers through after the window", () => {
    const install = "2026-09-29T12:00:00Z"; // 4 days old
    expect(isWithinAdGrace(install, now)).toBe(false);
    expect(
      notifyInterstitialTrigger("loop-done-leave", {
        firstInstallAt: install,
        show: () => {},
        now,
      }),
    ).toBe("queued");
  });

  it("invokes show only when the request clears the grace window", () => {
    let shown = 0;
    const show = () => {
      shown += 1;
    };
    notifyInterstitialTrigger("loop-done-leave", {
      firstInstallAt: "2026-10-02T12:00:00Z",
      show,
      now,
    });
    expect(shown).toBe(0);
    notifyInterstitialTrigger("loop-done-leave", {
      firstInstallAt: "2026-09-29T12:00:00Z",
      show,
      now,
    });
    expect(shown).toBe(1);
  });

  it("does not treat a missing or corrupt anchor as a fresh install", () => {
    expect(isWithinAdGrace(null, now)).toBe(false);
    expect(isWithinAdGrace("not-a-date", now)).toBe(false);
  });

  it("suppresses triggers for Plus before the grace check (J7-R3)", () => {
    let shown = 0;
    const result = notifyInterstitialTrigger("loop-done-leave", {
      firstInstallAt: "2026-09-29T12:00:00Z",
      hasAdsRemoval: true,
      show: () => {
        shown += 1;
      },
      now,
    });
    expect(result).toBe("suppressed-plus");
    expect(shown).toBe(0);
  });
});
