module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  fakeTimers: { enableGlobally: true },
  // Binary assets (J8 focus-sound WAVs) resolve to a numeric module id at
  // bundle time; jest maps them to a fixed id instead.
  moduleNameMapper: { "\\.wav$": "<rootDir>/jest-asset-stub.js" },
};
