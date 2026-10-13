// UTC timestamp: 2026-10-13T07:50:25Z
// Exact command: node scripts/store-readback/play-read.mjs > docs/release/v1/evidence/2026-10-13/play-readback.json
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const packageName = "com.appsindie.focusloop";
const serviceAccountPath = process.env.PLAY_SA_PATH || "apps/mobile/serviceAccount.json";
const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve(serviceAccountPath), "utf8"),
);
const base64url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const header = base64url({ alg: "RS256", typ: "JWT" });
const payload = base64url({
  iss: serviceAccount.client_email,
  scope: "https://www.googleapis.com/auth/androidpublisher",
  aud: "https://oauth2.googleapis.com/token",
  iat: now,
  exp: now + 3600,
});
const signature = crypto
  .sign("sha256", Buffer.from(`${header}.${payload}`), serviceAccount.private_key)
  .toString("base64url");
const jwt = `${header}.${payload}.${signature}`;
const tokenResult = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  }),
});
const tokenBody = await tokenResult.json();
const accessToken = tokenBody.access_token;
const apiRoot = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}`;
const evidence = {
  utcTimestamp: new Date().toISOString(),
  exactCommand:
    "node scripts/store-readback/play-read.mjs > docs/release/v1/evidence/2026-10-13/play-readback.json",
};

const request = async (url, options = {}) => {
  const response = await fetch(url.startsWith("http") ? url : `${apiRoot}${url}`, {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  return response.ok
    ? { body }
    : {
        error: {
          status: response.status,
          statusText: response.statusText,
          body,
          verbatim: body?.error?.message || text,
        },
      };
};

const list = async (url, pageSizeParameter = "pageSize") => {
  const data = [];
  let next = url;
  let error;
  while (next) {
    const separator = next.includes("?") ? "&" : "?";
    const result = await request(`${next}${separator}${pageSizeParameter}=100`);
    if (result.error) {
      error = result.error;
      break;
    }
    const body = result.body || {};
    const records =
      body.data ||
      body.listings ||
      body.images ||
      body.subscriptions ||
      body.oneTimeProducts ||
      [];
    data.push(...records);
    next = body.nextPageToken
      ? `${url}${url.includes("?") ? "&" : "?"}pageToken=${encodeURIComponent(body.nextPageToken)}`
      : null;
  }
  return { data, ...(error ? { error } : {}) };
};

const playError = (error) =>
  error
    ? {
        status: error.status,
        statusText: error.statusText,
        verbatim: error.verbatim,
        body: error.body,
      }
    : undefined;

let editId;
let editError;
let editCleanup;
let listings = [];
let tracks;
let images = [];
let subscriptions;
let offers = [];
let oneTimeProducts;

try {
  const editResult = await request("/edits", {
    method: "POST",
    body: JSON.stringify({}),
  });
  editId = editResult.body?.id;
  editError = editResult.error;
  if (editId) {
    const listingResult = await request(`/edits/${editId}/listings`);
    const rawListings = listingResult.body?.listings || [];
    const listingRows = Array.isArray(rawListings)
      ? rawListings
      : Object.entries(rawListings).map(([language, listing]) => ({
          language,
          ...listing,
        }));
    listings = listingRows.map((listing) => ({
      language: listing.language,
      title: listing.title,
      shortDescription: listing.shortDescription,
      fullDescription: listing.fullDescription,
      video: listing.video,
    }));
    if (listingResult.error) listings.push({ error: playError(listingResult.error) });

    const trackResult = await request(`/edits/${editId}/tracks/internal`);
    tracks = trackResult.error
      ? playError(trackResult.error)
      : {
          versionCodes: trackResult.body?.releases?.flatMap(
            (release) => release.versionCodes || [],
          ),
          status: trackResult.body?.releases?.map((release) => release.status),
          releases: (trackResult.body?.releases || []).map((release) => ({
            versionCodes: release.versionCodes || [],
            status: release.status,
            releaseNotesLanguageCount: new Set(
              (release.releaseNotes || []).map((note) => note.language),
            ).size,
            releaseNotesLanguages: [
              ...new Set((release.releaseNotes || []).map((note) => note.language)),
            ],
          })),
          releaseNotesLanguageCount: new Set(
            (trackResult.body?.releases || []).flatMap((release) =>
              (release.releaseNotes || []).map((note) => note.language),
            ),
          ).size,
          releaseNotesLanguages: [
            ...new Set(
              (trackResult.body?.releases || []).flatMap((release) =>
                (release.releaseNotes || []).map((note) => note.language),
              ),
            ),
          ],
        };

    for (const listing of listings.filter((entry) => entry.language)) {
      const language = encodeURIComponent(listing.language);
      const counts = {};
      for (const imageType of ["phoneScreenshots", "featureGraphic", "icon"]) {
        const imageResult = await request(
          `/edits/${editId}/listings/${language}/${imageType}`,
        );
        counts[imageType] = imageResult.error
          ? { error: playError(imageResult.error) }
          : imageResult.body?.images?.length || 0;
      }
      images.push({ locale: listing.language, ...counts });
    }
  }

  const subscriptionResult = await list("/subscriptions");
  const products = subscriptionResult.data;
  subscriptions = subscriptionResult.error
    ? { error: playError(subscriptionResult.error), products: [] }
    : await Promise.all(
        products.map(async (product) => ({
          productId: product.productId,
          basePlans: (product.basePlans || []).map((plan) => ({
            basePlanId: plan.basePlanId,
            state: plan.state,
          })),
        })),
      );
  if (Array.isArray(subscriptions)) {
    for (const product of subscriptions) {
      for (const plan of product.basePlans) {
        if (plan.basePlanId !== "yearly") continue;
        const offerResult = await request(
          `/subscriptions/${encodeURIComponent(product.productId)}/basePlans/${encodeURIComponent(plan.basePlanId)}/offers`,
        );
        const offerDetails = offerResult.error
          ? { productId: product.productId, basePlanId: plan.basePlanId, error: playError(offerResult.error) }
          : {
              productId: product.productId,
              basePlanId: plan.basePlanId,
              offers: (offerResult.body?.subscriptionOffers || []).map((offer) => ({
                offerId: offer.offerId,
                state: offer.state,
              })),
            };
        offers.push(offerDetails);
        plan.offers = offerDetails.error ? { error: offerDetails.error } : offerDetails.offers;
      }
    }
  }

  const oneTimeResult = await list("/oneTimeProducts");
  oneTimeProducts = oneTimeResult.error
    ? { error: playError(oneTimeResult.error), products: [] }
    : oneTimeResult.data.map((product) => ({
        productId: product.productId,
        purchaseOptions: (product.purchaseOptions || []).map((option) => ({
          purchaseOptionId: option.purchaseOptionId,
          state: option.state,
        })),
      }));
} catch (error) {
  editError ||= {
    status: "SCRIPT_ERROR",
    statusText: error?.name,
    verbatim: error?.message || String(error),
  };
} finally {
  if (editId) {
    let deleted;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        deleted = await request(`/edits/${editId}`, { method: "DELETE" });
      } catch (error) {
        deleted = {
          error: {
            status: "SCRIPT_ERROR",
            statusText: error?.name,
            verbatim: error?.message || String(error),
          },
        };
      }
      if (!deleted.error) break;
    }
    editCleanup = deleted?.error
      ? { deleted: false, error: playError(deleted.error) }
      : { deleted: true, status: 204 };
  } else if (editError) {
    editCleanup = { deleted: false, reason: "No edit was created" };
  }
}

const output = {
  _evidence: evidence,
  listings,
  tracks,
  images,
  subscriptions,
  offers,
  oneTimeProducts,
  edit: {
    created: Boolean(editId),
    ...(editError ? { error: playError(editError) } : {}),
    cleanup: editCleanup || null,
  },
};
const serialized = JSON.stringify(output, null, 2)
  .replaceAll(jwt, "[REDACTED]")
  .replaceAll(accessToken || "", accessToken ? "[REDACTED]" : "")
  .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
  .replace(/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, "[REDACTED]");
process.stdout.write(`${serialized}\n`);
