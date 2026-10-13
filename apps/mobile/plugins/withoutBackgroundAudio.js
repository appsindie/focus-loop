const { withInfoPlist } = require("@expo/config-plugins");

module.exports = function withoutBackgroundAudio(config) {
  return withInfoPlist(config, (config) => {
    const modes = config.modResults.UIBackgroundModes;
    if (!Array.isArray(modes)) {
      return config;
    }

    const remainingModes = modes.filter((mode) => mode !== "audio");
    if (remainingModes.length === 0) {
      delete config.modResults.UIBackgroundModes;
    } else {
      config.modResults.UIBackgroundModes = remainingModes;
    }
    return config;
  });
};
