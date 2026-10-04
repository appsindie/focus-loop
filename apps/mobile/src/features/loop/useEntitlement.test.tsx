import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { useEntitlement } from "./useEntitlement";
import { grantPlus } from "./entitlement";

// CR-25: the hook reports "not loaded" until the first AsyncStorage read, then
// flips live on every entitlement write — so App can keep ads off in the gap.
beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("useEntitlement", () => {
  it("starts unloaded, resolves the stored entitlement, then re-reads on writes", async () => {
    await grantPlus(
      "com.appsindie.focusloop.plus.lifetime",
      null,
      new Date("2026-10-01T09:00:00Z"),
    );
    // awaiting renderHook flushes the first read — `loaded` starts false and is
    // already true by the time the hook is returned to the test.
    const { result } = await renderHook(() => useEntitlement());
    expect(result.current.loaded).toBe(true);
    expect(result.current.entitlement.isPlus).toBe(true);

    await act(async () => {
      await grantPlus(
        "com.appsindie.focusloop.plus.yearly",
        "2026-10-10T00:00:00.000Z",
        new Date(),
      );
      await Promise.resolve();
    });
    expect(result.current.entitlement.productId).toBe("com.appsindie.focusloop.plus.yearly");
    expect(result.current.entitlement.plusExpiresAt).toBe("2026-10-10T00:00:00.000Z");
  });
});
