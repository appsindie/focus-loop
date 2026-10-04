import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  defaultEntitlement,
  applyVerification,
  grantPlus,
  isItemUnlocked,
  isPlusActive,
  loadEntitlement,
  pruneExpiredTrials,
  startTrial,
} from "./entitlement";

describe("entitlement (ADR-003)", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("defaults to the free entitlement", async () => {
    expect(await loadEntitlement()).toEqual(defaultEntitlement());
  });

  it("grants Plus and revokes it when a re-check reports a lapse", async () => {
    const now = new Date("2026-10-03T10:00:00Z");
    let entitlement = await grantPlus("yearly", "2027-10-03T10:00:00.000Z", now);
    expect(entitlement.isPlus).toBe(true);
    expect(isItemUnlocked(entitlement, "theme:ember", now)).toBe(true);

    // Lapsed yearly → re-check revokes Plus without user action.
    entitlement = await applyVerification("not-plus", null, null, new Date("2027-11-01T10:00:00Z"));
    expect(entitlement.isPlus).toBe(false);
    expect(entitlement.lastVerifiedAt).toBe("2027-11-01T10:00:00.000Z");
    expect(entitlement.plusExpiresAt).toBe("2027-10-03T10:00:00.000Z"); // audit trail kept
  });

  it("expired Plus does not unlock items after the renewal grace (CR-02)", async () => {
    const now = new Date("2026-10-03T10:00:00Z");
    const entitlement = await grantPlus("yearly", "2026-10-10T10:00:00.000Z", now);
    // Within grace: still unlocked.
    const inGrace = new Date("2026-10-11T10:00:00Z");
    expect(isItemUnlocked(entitlement, "theme:ember", inGrace)).toBe(true);
    // Past expiry + 48h grace: locked again.
    const pastGrace = new Date("2026-10-14T10:00:00Z");
    expect(isItemUnlocked(entitlement, "theme:ember", pastGrace)).toBe(false);
  });

  it("an unknown verification result neither revokes nor extends Plus (CR-02)", async () => {
    const now = new Date("2026-10-03T10:00:00Z");
    await grantPlus("yearly", "2027-10-03T10:00:00.000Z", now);
    const entitlement = await applyVerification(
      "unknown",
      null,
      null,
      new Date("2026-10-04T10:00:00Z"),
    );
    expect(entitlement.isPlus).toBe(true);
    expect(entitlement.lastVerifiedAt).toBe(now.toISOString()); // unchanged
  });

  it("isPlusActive gates ads/history: lifetime open-ended, yearly until expiry + grace", async () => {
    const now = new Date("2026-10-03T10:00:00Z");
    expect(isPlusActive(defaultEntitlement(), now)).toBe(false);

    const lifetime = await grantPlus("lifetime", null, now);
    expect(isPlusActive(lifetime, new Date("2030-01-01T00:00:00Z"))).toBe(true);

    const yearly = await grantPlus("yearly", "2026-10-10T10:00:00.000Z", now);
    expect(isPlusActive(yearly, new Date("2026-10-11T10:00:00Z"))).toBe(true); // grace
    expect(isPlusActive(yearly, new Date("2026-10-14T10:00:00Z"))).toBe(false); // past grace
  });

  it("an ex-Plus user past grace still gets their live rewarded trial", async () => {
    const now = new Date("2026-10-03T10:00:00Z");
    await grantPlus("yearly", "2026-10-04T10:00:00.000Z", now);
    const entitlement = await startTrial("theme:ember", new Date("2026-10-08T10:00:00Z"));
    // Yearly lapsed past grace but the trial window is still open.
    expect(isPlusActive(entitlement, new Date("2026-10-08T10:00:00Z"))).toBe(false);
    expect(isItemUnlocked(entitlement, "theme:ember", new Date("2026-10-08T10:00:00Z"))).toBe(true);
  });

  it("a rewarded trial unlocks one item for exactly 24h (spec J8-R2)", async () => {
    const now = new Date("2026-10-03T10:00:00Z");
    const entitlement = await startTrial("theme:ember", now);
    expect(isItemUnlocked(entitlement, "theme:ember", now)).toBe(true);
    expect(isItemUnlocked(entitlement, "theme:other", now)).toBe(false);

    const after25h = new Date(now.getTime() + 25 * 3600 * 1000);
    expect(isItemUnlocked(entitlement, "theme:ember", after25h)).toBe(false);
    expect(pruneExpiredTrials(entitlement, after25h).trials).toHaveLength(0);
  });
});
