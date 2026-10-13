import {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
} from "react-native-google-mobile-ads";

export interface ConsentState {
  canRequestAds: boolean;
  privacyOptionsRequired: boolean;
}

const NO_CONSENT: ConsentState = {
  canRequestAds: false,
  privacyOptionsRequired: false,
};

function toConsentState(info: {
  canRequestAds?: boolean;
  privacyOptionsRequirementStatus?: unknown;
}): ConsentState {
  return {
    canRequestAds: info.canRequestAds === true,
    privacyOptionsRequired:
      info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
  };
}

export async function getAdsConsentInfo(): Promise<ConsentState> {
  try {
    return toConsentState(await AdsConsent.getConsentInfo());
  } catch {
    return NO_CONSENT;
  }
}

export async function gatherAdsConsent(): Promise<ConsentState> {
  try {
    return toConsentState(await AdsConsent.gatherConsent());
  } catch {
    return getAdsConsentInfo();
  }
}

export async function showAdPrivacyOptions(): Promise<void> {
  try {
    await AdsConsent.showPrivacyOptionsForm();
  } catch {
    return;
  }
}
