// UTC timestamp: 2026-10-13T07:50:25Z
// Exact command: node scripts/store-readback/asc-read.mjs > docs/release/v1/evidence/2026-10-13/asc-readback.json
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const appId = "6818991496";
const keyPath = process.env.ASC_KEY_PATH || "apps/mobile/storeConnect.p8";
const keyId = "KHJLUQ98Z9";
const issuerId = "e08cafd8-a655-4267-b4e9-6834e11c7d31";
const root = "https://api.appstoreconnect.apple.com";
const evidence = {
  utcTimestamp: new Date().toISOString(),
  exactCommand:
    "node scripts/store-readback/asc-read.mjs > docs/release/v1/evidence/2026-10-13/asc-readback.json",
};

const base64url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const header = base64url({ alg: "ES256", kid: keyId, typ: "JWT" });
const payload = base64url({
  iss: issuerId,
  iat: now,
  exp: now + 600,
  aud: "appstoreconnect-v1",
});
const signature = crypto
  .sign("sha256", Buffer.from(`${header}.${payload}`), {
    key: fs.readFileSync(path.resolve(keyPath), "utf8"),
    dsaEncoding: "ieee-p1363",
  })
  .toString("base64url");
const token = `${header}.${payload}.${signature}`;

const get = async (url) => {
  const response = await fetch(url.startsWith("http") ? url : `${root}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!response.ok) {
    return {
      error: {
        status: response.status,
        statusText: response.statusText,
        body,
      },
    };
  }
  return { body };
};

const list = async (url) => {
  const data = [];
  let next = url;
  let error;
  while (next) {
    const result = await get(next);
    if (result.error) {
      error = result.error;
      break;
    }
    data.push(...(result.body?.data || []));
    next = result.body?.links?.next || null;
  }
  return { data, ...(error ? { error } : {}) };
};

const attrs = (record) => record?.attributes || {};
const relationshipId = (record, name) => record?.relationships?.[name]?.data?.id;

const appInfoResult = await get(
  `/v1/apps/${appId}/appInfos?include=primaryCategory,secondaryCategory&limit=200`,
);
const appInfos = appInfoResult.body?.data || [];
const categoryById = new Map(
  (appInfoResult.body?.included || []).map((item) => [item.id, attrs(item)]),
);
const appInfoDetails = await Promise.all(
  appInfos.map(async (info) => {
    const ageRatingId = relationshipId(info, "ageRatingDeclaration");
    const ageRating = ageRatingId
      ? await get(`/v1/ageRatingDeclarations/${ageRatingId}`)
      : await get(`/v1/appInfos/${info.id}/ageRatingDeclaration`);
    return {
      id: info.id,
      state: attrs(info).appStoreState,
      primaryCategoryId: relationshipId(info, "primaryCategory") || null,
      secondaryCategoryId: relationshipId(info, "secondaryCategory") || null,
      primaryCategory: categoryById.get(relationshipId(info, "primaryCategory")) || null,
      secondaryCategory: categoryById.get(relationshipId(info, "secondaryCategory")) || null,
      ageRatingDeclarationId: ageRatingId || null,
      ageRatingDeclaration: ageRating.body?.data?.attributes ?? ageRating.error ?? null,
    };
  }),
);

const versionResult = await list(`/v1/apps/${appId}/appStoreVersions?include=build&limit=200`);
const appVersionRecords = versionResult.data.filter((version) =>
  /^1\.0(?:\.|$)/.test(attrs(version).versionString || ""),
);
const versionDetails = await Promise.all(
  appVersionRecords.map(async (version) => {
    const buildId = relationshipId(version, "build");
    const build = buildId ? await get(`/v1/builds/${buildId}`) : null;
    const localizations = await list(
      `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=200`,
    );
    const localizationDetails = await Promise.all(
      localizations.data.map(async (localization) => {
        const sets = await list(
          `/v1/appStoreVersionLocalizations/${localization.id}/appScreenshotSets?limit=200`,
        );
        const screenshotSets = await Promise.all(
          sets.data.map(async (set) => {
            const screenshots = await list(
              `/v1/appScreenshotSets/${set.id}/appScreenshots?limit=200`,
            );
            return {
              displayType: attrs(set).screenshotDisplayType,
              screenshotCount: screenshots.data.length,
              ...(screenshots.error ? { error: screenshots.error } : {}),
            };
          }),
        );
        return {
          locale: attrs(localization).locale,
          screenshotSets,
          ...(sets.error ? { error: sets.error } : {}),
        };
      }),
    );
    return {
      versionString: attrs(version).versionString,
      appStoreState: attrs(version).appStoreState,
      buildId: buildId || null,
      build: build?.body?.data
        ? {
            version: attrs(build.body.data).version,
            processingState: attrs(build.body.data).processingState,
            usesNonExemptEncryption: attrs(build.body.data).usesNonExemptEncryption,
          }
        : build?.error ?? null,
      localizationCount: localizations.data.length,
      locales: localizationDetails,
      ...(localizations.error ? { localizationError: localizations.error } : {}),
    };
  }),
);

const builds = await list(`/v1/apps/${appId}/builds?limit=200`);
const build21 = builds.data
  .filter((build) => String(attrs(build).version) === "21")
  .map((build) => ({
    version: attrs(build).version,
    processingState: attrs(build).processingState,
    usesNonExemptEncryption: attrs(build).usesNonExemptEncryption,
  }));

const groups = await list(`/v1/apps/${appId}/subscriptionGroups?limit=200`);
const subscriptionGroups = await Promise.all(
  groups.data.map(async (group) => {
    const subscriptions = await list(
      `/v1/subscriptionGroups/${group.id}/subscriptions?limit=200`,
    );
    const details = await Promise.all(
      subscriptions.data.map(async (subscription) => {
        const [localizations, prices] = await Promise.all([
          list(`/v1/subscriptions/${subscription.id}/subscriptionLocalizations?limit=200`),
          list(`/v1/subscriptions/${subscription.id}/prices?limit=200`),
        ]);
        return {
          productId: attrs(subscription).productId,
          state: attrs(subscription).state,
          hasPrices: prices.data.length > 0,
          localizationCount: localizations.data.length,
          ...(localizations.error ? { localizationError: localizations.error } : {}),
          ...(prices.error ? { pricesError: prices.error } : {}),
        };
      }),
    );
    return {
      id: group.id,
      referenceName: attrs(group).referenceName,
      subscriptions: details,
      ...(subscriptions.error ? { error: subscriptions.error } : {}),
    };
  }),
);

const inAppPurchaseCandidates = [];
for (const url of [
  `/v1/apps/${appId}/inAppPurchasesV2?limit=200`,
  `/v1/apps/${appId}/inAppPurchases?limit=200`,
  `/v2/inAppPurchases?filter[app]=${appId}&limit=200`,
]) {
  const candidate = await list(url);
  inAppPurchaseCandidates.push({ url, ...candidate });
  if (candidate.data.length) break;
}
const inAppPurchases = inAppPurchaseCandidates.find((candidate) => candidate.data.length);
const inAppPurchaseDetails = await Promise.all(
  (inAppPurchases?.data || []).map(async (purchase) => {
    const localizations = await list(
      `/v2/inAppPurchases/${purchase.id}/inAppPurchaseLocalizations?limit=200`,
    );
    return {
      productId: attrs(purchase).productId,
      state: attrs(purchase).state,
      localizationCount: localizations.data.length,
      ...(localizations.error ? { localizationsError: localizations.error } : {}),
    };
  }),
);

const submissions = await list(`/v1/apps/${appId}/reviewSubmissions?limit=200`);
const reviewSubmissionDetails = await Promise.all(
  submissions.data.map(async (submission) => {
    const items = await list(`/v1/reviewSubmissions/${submission.id}/items?limit=200`);
    return {
      state: attrs(submission).state,
      submittedDate: attrs(submission).submittedDate,
      items: items.data.map((item) => ({
        state: attrs(item).state,
        itemType: attrs(item).itemType,
      })),
      ...(items.error ? { itemsError: items.error } : {}),
    };
  }),
);

const output = {
  _evidence: evidence,
  appInfos:
    appInfoResult.body?.data?.map((info, index) => appInfoDetails[index]) ??
    appInfoResult.error,
  appStoreVersions: versionDetails,
  appStoreVersionsReturned: appVersionRecords.length,
  ...(versionResult.error ? { appStoreVersionsError: versionResult.error } : {}),
  build21: builds.error ? builds.error : build21,
  subscriptionGroups: groups.error ? groups.error : subscriptionGroups,
  inAppPurchasesV2: inAppPurchases
    ? { source: inAppPurchases.url, products: inAppPurchaseDetails }
    : {
        errors: inAppPurchaseCandidates.map((candidate) => ({
          url: candidate.url,
          error: candidate.error,
        })),
      },
  reviewSubmissions: submissions.error ? submissions.error : reviewSubmissionDetails,
  rejectedHistory: reviewSubmissionDetails.filter((submission) =>
    /reject/i.test(JSON.stringify(submission)),
  ),
};

const serialized = JSON.stringify(output, null, 2)
  .replaceAll(token, "[REDACTED]")
  .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
  .replace(/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, "[REDACTED]");
process.stdout.write(`${serialized}\n`);
