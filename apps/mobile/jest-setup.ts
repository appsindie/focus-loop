import { jest } from "@jest/globals";

const storage: Record<string, string> = {};

const mockAsyncStorage = {
  getItem: jest.fn((key: string) => Promise.resolve(storage[key] ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    storage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete storage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    for (const key of Object.keys(storage)) {
      delete storage[key];
    }
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(storage))),
  getMany: jest.fn((keys: string[]) =>
    Promise.resolve(Object.fromEntries(keys.map((k) => [k, storage[k] ?? null]))),
  ),
  setMany: jest.fn((entries: Record<string, string>) => {
    for (const [k, v] of Object.entries(entries)) {
      storage[k] = v;
    }
    return Promise.resolve();
  }),
  removeMany: jest.fn((keys: string[]) => {
    for (const k of keys) {
      delete storage[k];
    }
    return Promise.resolve();
  }),
};

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 0 })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 0 })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve("mock-notification-id")),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  dismissNotificationAsync: jest.fn(() => Promise.resolve()),
  dismissAllNotificationsAsync: jest.fn(() => Promise.resolve()),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve(null)),
  AndroidImportance: { LOW: 2, DEFAULT: 3, HIGH: 4 },
  PermissionStatus: {
    GRANTED: "granted",
    DENIED: "denied",
    UNDETERMINED: "undetermined",
  },
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: "timeInterval",
    DAILY: "daily",
    WEEKLY: "weekly",
    YEARLY: "yearly",
    DATE: "date",
  },
}));

jest.mock("expo-store-review", () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  requestReview: jest.fn(() => Promise.resolve()),
}));

// J8 focus sounds are best-effort — the port swallows the absent native
// module, and tests mock createAudioPlayer directly.
jest.mock("expo-audio", () => ({
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
    loop: false,
    volume: 1,
  })),
}));

// The IAP native module only exists in a dev-client build. The port layer is
// tested through an injected fake PlusStore instead, so every expo-iap export
// is an inert stub here.
jest.mock("expo-iap", () => ({
  initConnection: jest.fn(() => Promise.resolve()),
  endConnection: jest.fn(() => Promise.resolve()),
  fetchProducts: jest.fn(() => Promise.resolve([])),
  getAvailablePurchases: jest.fn(() => Promise.resolve([])),
  requestPurchase: jest.fn(() => Promise.resolve(null)),
  finishTransaction: jest.fn(() => Promise.resolve()),
  restorePurchases: jest.fn(() => Promise.resolve()),
  purchaseUpdatedListener: jest.fn(() => ({ remove: jest.fn() })),
  purchaseErrorListener: jest.fn(() => ({ remove: jest.fn() })),
  ErrorCode: { UserCancelled: "user-cancelled" },
}));
