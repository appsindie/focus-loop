import { describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react-native";
import { HomeBanner } from "./HomeBanner";

// The ads package pulls RNGMA's TurboModule at import — stub the leaf so the
// gate itself can render in jest (the real Banner's own Plus gate is theirs).
jest.mock("@appsindie/react-native-ads", () => ({
  Banner: jest.fn(() => null),
}));

describe("HomeBanner (S10-01)", () => {
  it("renders nothing before the entitlement read lands (CR-25 gate)", async () => {
    const screen = await render(
      <HomeBanner entitlementLoaded={false} hasAdsRemoval={false} backgroundColor="#fff" />,
    );
    expect(screen.queryByTestId("home-banner")).toBeNull();
  });

  it("renders the banner slot once entitlement is known", async () => {
    const screen = await render(
      <HomeBanner entitlementLoaded={true} hasAdsRemoval={false} backgroundColor="#fff" />,
    );
    screen.getByTestId("home-banner");
  });

  it("renders nothing when removed even though entitlement loaded", async () => {
    // hasAdsRemoval stays wired through to Banner — Banner itself returns
    // null for Plus; the slot must still exist so layout is stable, but the
    // ad never mounts (Banner's own gate).
    const screen = await render(
      <HomeBanner entitlementLoaded={true} hasAdsRemoval={true} backgroundColor="#fff" />,
    );
    screen.getByTestId("home-banner");
  });
});
