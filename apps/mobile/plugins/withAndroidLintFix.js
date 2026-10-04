const { withAppBuildGradle } = require("expo/config-plugins");

function withAndroidLintFix(config) {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;
    if (buildGradle.includes("disable 'ExtraTranslation'")) {
      return config;
    }

    config.modResults.contents = buildGradle.replace(
      /^android\s*\{/m,
      `android {\n    lintOptions {\n        disable 'ExtraTranslation'\n    }`,
    );

    return config;
  });
}

module.exports = withAndroidLintFix;
