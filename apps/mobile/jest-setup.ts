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
  multiGet: jest.fn((keys: string[]) => Promise.resolve(keys.map((k) => [k, storage[k] ?? null]))),
  multiSet: jest.fn((pairs: [string, string][]) => {
    for (const [k, v] of pairs) {
      storage[k] = v;
    }
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys: string[]) => {
    for (const k of keys) {
      delete storage[k];
    }
    return Promise.resolve();
  }),
  mergeItem: jest.fn(() => Promise.resolve()),
  multiMerge: jest.fn(() => Promise.resolve()),
  flushGetRequests: jest.fn(() => undefined),
};

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 0 })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 0 })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve("mock-notification-id")),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
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
  },
}));
