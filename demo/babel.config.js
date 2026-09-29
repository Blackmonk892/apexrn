module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo auto-adds the worklets plugin; do not list it manually.
  return { presets: ['babel-preset-expo'] };
};
