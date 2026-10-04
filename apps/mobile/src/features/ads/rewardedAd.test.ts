import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { watchForReward } from "./rewardedAd";

// RNGMA is lazy-imported by the port, so a jest.mock factory intercepts the
// dynamic import and hands out a fake ad whose listeners we fire by hand.
type AdCb = () => void;
type Listeners = Record<string, AdCb[]>;

jest.mock("react-native-google-mobile-ads", () => {
  const listeners: Listeners = {};
  const ad = {
    addAdEventListener: jest.fn((type: string, cb: AdCb) => {
      (listeners[type] ??= []).push(cb);
      return jest.fn();
    }),
    load: jest.fn(),
    show: jest.fn(),
  };
  return {
    RewardedAd: { createForAdRequest: jest.fn(() => ad) },
    RewardedAdEventType: { LOADED: "rewarded_loaded", EARNED_REWARD: "rewarded_earned_reward" },
    AdEventType: { ERROR: "error", CLOSED: "closed", LOADED: "loaded", OPENED: "opened" },
    __ad: ad,
    __listeners: listeners,
  };
});

type MockedRngma = {
  RewardedAd: { createForAdRequest: jest.Mock };
  __ad: { addAdEventListener: jest.Mock; load: jest.Mock; show: jest.Mock };
  __listeners: Listeners;
};

// The jest.mock factory above replaces the module; the typed import returns it.
import * as rngmaModule from "react-native-google-mobile-ads";
const rngma = rngmaModule as unknown as MockedRngma;

function fire(type: string) {
  for (const cb of rngma.__listeners[type] ?? []) {
    cb();
  }
}

beforeEach(() => {
  for (const key of Object.keys(rngma.__listeners)) {
    delete rngma.__listeners[key];
  }
  rngma.__ad.addAdEventListener.mockClear();
  rngma.__ad.load.mockClear();
  rngma.__ad.show.mockClear().mockImplementation(() => Promise.resolve());
  rngma.RewardedAd.createForAdRequest.mockClear().mockImplementation(() => rngma.__ad);
});

describe("watchForReward (J8-R1)", () => {
  it("reports 'unavailable' when no unit id is configured (RR-14)", async () => {
    await expect(watchForReward(null)).resolves.toBe("unavailable");
    expect(rngma.__ad.load).not.toHaveBeenCalled();
  });

  it("earns the reward only when the reward event fires before close", async () => {
    const pending = watchForReward("unit-1");
    await Promise.resolve();
    fire("rewarded_loaded");
    fire("rewarded_earned_reward");
    fire("closed");
    await expect(pending).resolves.toBe("earned");
    expect(rngma.__ad.show).toHaveBeenCalledTimes(1);
  });

  it("reports 'closed' when the user bails without earning", async () => {
    const pending = watchForReward("unit-1");
    await Promise.resolve();
    fire("rewarded_loaded");
    fire("closed");
    await expect(pending).resolves.toBe("closed");
  });

  it("reports 'load-failed' on an ad error before load completes", async () => {
    const pending = watchForReward("unit-1");
    await Promise.resolve();
    fire("error");
    await expect(pending).resolves.toBe("load-failed");
  });

  it("reports 'show-failed' when presenting throws", async () => {
    rngma.__ad.show.mockImplementationOnce(() => {
      throw new Error("cannot present");
    });
    const pending = watchForReward("unit-1");
    await Promise.resolve();
    fire("rewarded_loaded");
    await expect(pending).resolves.toBe("show-failed");
  });

  it("bounds the wait — a silent no-fill resolves 'load-failed' after the timeout", async () => {
    const pending = watchForReward("unit-1");
    await Promise.resolve();
    jest.advanceTimersByTime(45_000);
    await expect(pending).resolves.toBe("load-failed");
  });

  it("treats a missing createForAdRequest as 'unavailable', not a crash", async () => {
    rngma.RewardedAd.createForAdRequest.mockImplementationOnce(() => {
      throw new Error("old RNGMA");
    });
    await expect(watchForReward("unit-1")).resolves.toBe("unavailable");
  });
});
