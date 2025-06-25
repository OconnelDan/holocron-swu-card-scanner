const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@screens': './src/screens',
      '@services': './src/services',
      '@utils': './src/utils',
      '@types': './src/types',
      '@navigation': './src/navigation',
      '@assets': './src/assets',
    },
  },
  transformer: {
    assetPlugins: ['react-native-svg-asset-plugin'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
