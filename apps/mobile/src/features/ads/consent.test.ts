import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  AdsConsentStatus,
} from "react-native-google-mobile-ads";
import { gatherAdsConsent, getAdsConsentInfo, showAdPrivacyOptions } from "./consent";

jest.mock("react-native-google-mobile-ads", () => ({
  AdsConsent: {
    gatherConsent: jest.fn(),
    getConsentInfo: jest.fn(),
    showPrivacyOptionsForm: jest.fn(),
  },
  AdsConsentPrivacyOptionsRequirementStatus: {
    REQUIRED: "REQUIRED",
    NOT_REQUIRED: "NOT_REQUIRED",
  },
  AdsConsentStatus: {
    OBTAINED: "OBTAINED",
    NOT_REQUIRED: "NOT_REQUIRED",
  },
}));

const gatherConsentMock = jest.spyOn(AdsConsent, "gatherConsent");
const getConsentInfoMock = jest.spyOn(AdsConsent, "getConsentInfo");
const showPrivacyOptionsFormMock = jest.spyOn(AdsConsent, "showPrivacyOptionsForm");

describe("ads consent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps a successful consent gathering result", async () => {
    gatherConsentMock.mockResolvedValue({
      status: AdsConsentStatus.OBTAINED,
      canRequestAds: true,
      privacyOptionsRequirementStatus: AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
      isConsentFormAvailable: true,
    });

    await expect(gatherAdsConsent()).resolves.toEqual({
      canRequestAds: true,
      privacyOptionsRequired: true,
    });
  });

  it("falls back to the stored consent state when gathering throws", async () => {
    gatherConsentMock.mockRejectedValue(new Error("unavailable"));
    getConsentInfoMock.mockResolvedValue({
      status: AdsConsentStatus.NOT_REQUIRED,
      canRequestAds: true,
      privacyOptionsRequirementStatus: AdsConsentPrivacyOptionsRequirementStatus.NOT_REQUIRED,
      isConsentFormAvailable: false,
    });

    await expect(gatherAdsConsent()).resolves.toEqual({
      canRequestAds: true,
      privacyOptionsRequired: false,
    });
  });

  it("never throws when consent information or the privacy form is unavailable", async () => {
    getConsentInfoMock.mockRejectedValue(new Error("unavailable"));
    showPrivacyOptionsFormMock.mockRejectedValue(new Error("unavailable"));

    await expect(getAdsConsentInfo()).resolves.toEqual({
      canRequestAds: false,
      privacyOptionsRequired: false,
    });
    await expect(showAdPrivacyOptions()).resolves.toBeUndefined();
  });
});
