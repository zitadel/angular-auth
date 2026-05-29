module.exports = {
  ignore: ['commitlint.config.js', 'playground/**'],
  ignoreDependencies: [
    '@commitlint/config-conventional',
    '@semantic-release/.*?',
    // Referenced as a transform string in jest.config.mjs (available
    // transitively via jest); knip cannot trace the string reference.
    'babel-jest',
  ],
};
