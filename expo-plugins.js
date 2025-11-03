const { withIoniconsPlugin } = require('@expo/vector-icons/build/vendor/react-native-vector-icons');

module.exports = function withCustomVectorIcons(config) {
  return withIoniconsPlugin(config);
};