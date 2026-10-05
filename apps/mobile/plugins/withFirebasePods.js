const { withPodfile } = require("expo/config-plugins");

// RNGMA needs `use_frameworks! :linkage => :static`, while react-native-firebase
// resolves the Firebase iOS SDK via Swift Package Manager by default — SPM
// static products embed one Firebase copy per pod and collide at link time.
// $RNFirebaseDisableSPM forces RNFB to resolve Firebase via CocoaPods, which
// links correctly under the static linkage RNGMA requires.
const FLAG = "$RNFirebaseDisableSPM = true";

function withFirebasePods(config) {
  return withPodfile(config, (config) => {
    if (config.modResults.contents.includes(FLAG)) {
      return config;
    }
    config.modResults.contents = `${FLAG}\n\n${config.modResults.contents}`;
    return config;
  });
}

module.exports = withFirebasePods;
