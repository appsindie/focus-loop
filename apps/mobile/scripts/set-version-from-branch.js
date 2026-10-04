const fs = require("fs");
const path = require("path");

const APP_JSON_PATH = path.join(process.cwd(), "app.json");

function getBranch() {
  return (
    process.env.EAS_BUILD_GIT_REF ||
    process.env.GITHUB_REF_NAME ||
    process.env.CI_COMMIT_REF_NAME ||
    ""
  );
}

function parseVersion(branch) {
  const clean = branch.replace(/^refs\/(heads|tags)\//, "");
  const match = clean.match(/(?:release|releases|preview|sit)\/(?:(?:.*-))?(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

function main() {
  const branch = getBranch();
  if (!branch) {
    console.log("No branch reference found; leaving app.json version unchanged.");
    return;
  }

  const version = parseVersion(branch);
  if (!version) {
    console.log(
      `Branch "${branch}" does not match a release/preview/sit version pattern; leaving version unchanged.`,
    );
    return;
  }

  const appJson = JSON.parse(fs.readFileSync(APP_JSON_PATH, "utf8"));
  if (appJson.expo.version === version) {
    console.log(`app.json version is already ${version}.`);
    return;
  }

  appJson.expo.version = version;
  fs.writeFileSync(APP_JSON_PATH, JSON.stringify(appJson, null, 2) + "\n");
  console.log(`Set app.json version to ${version} from branch "${branch}".`);
}

main();
