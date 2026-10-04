import { render, screen, waitFor } from "@testing-library/react-native";
import { describe, expect, it, jest } from "@jest/globals";
import { palette } from "../../../shared/theme";
import { PaywallScreen } from "./PaywallScreen";
import type { StoreProduct } from "../iapPort";

// CR-27: the default store must be referentially stable — the render asserts
// loadProducts is called exactly once through the no-prop path (the default
// argument is what used to mint a fresh store per render).
const PRODUCTS: StoreProduct[] = [
  {
    plan: "yearly",
    productId: "com.appsindie.focusloop.plus.yearly",
    title: "Plus Yearly",
    priceText: "$19.99",
  },
  {
    plan: "lifetime",
    productId: "com.appsindie.focusloop.plus.lifetime",
    title: "Plus Lifetime",
    priceText: "$49.99",
  },
];
const mockLoadProducts = jest.fn(() => Promise.resolve(PRODUCTS));

jest.mock("../iapPort", () => {
  const actual = jest.requireActual<typeof import("../iapPort")>("../iapPort");
  // Cached like the real singleton — a per-call fresh object would re-create
  // CR-27's unstable-dependency loop inside the test itself.
  let store: unknown = null;
  return {
    ...actual,
    getDefaultPlusStore: () =>
      (store ??= {
        loadProducts: () => mockLoadProducts(),
        purchase: () => Promise.resolve({ kind: "failed" as const }),
        restorePurchases: () => Promise.resolve([]),
      }),
  };
});

describe("PaywallScreen (P14)", () => {
  it("loads products exactly once and settles on ready without a store prop", async () => {
    await render(
      <PaywallScreen
        colors={palette.light}
        onClose={() => {}}
        onPurchased={() => {}}
        onRestored={() => {}}
      />,
    );
    await waitFor(() => expect(screen.getByText("Start free trial")).toBeTruthy());
    expect(mockLoadProducts).toHaveBeenCalledTimes(1);
    expect(screen.getByText("$19.99")).toBeTruthy();
    expect(screen.getByText("$49.99")).toBeTruthy();
  });
});
