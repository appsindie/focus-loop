import * as Notifications from "expo-notifications";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { syncLiveSurface } from "./androidOngoingNotification";

// CR-17: the sticky notification outlives the JS process, so teardown cannot
// depend on an in-memory "was it mine" flag — every null sync must dismiss.
describe("syncLiveSurface teardown (CR-17)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("dismisses the live notification on a null sync even when none was shown in-process", async () => {
    await syncLiveSurface(null);
    expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith("focus-loop-live");
  });

  it("dismisses again after a shown-then-null cycle (idempotent)", async () => {
    await syncLiveSurface({
      kind: "focus",
      displayMode: "disc",
      remainingSeconds: 300,
      endsAtMs: Date.now() + 300_000,
      paused: false,
      currentFocusNumber: 1,
      totalFocusCount: 4,
    });
    await syncLiveSurface(null);
    await syncLiveSurface(null);
    expect(Notifications.dismissNotificationAsync).toHaveBeenCalledTimes(2);
  });
});
