const plugins =
  process.env.NODE_ENV !== 'development'
    ? {
        tailwindcss: {},
        'postcss-preset-env': {stage: 1},
        cssnano: {},
      }
    : {
        tailwindcss: {},
        'postcss-preset-env': {stage: 1},
      };

module.exports = {
  plugins,
};
