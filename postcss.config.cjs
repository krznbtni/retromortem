module.exports = {
  plugins: {
    tailwindcss: {},
    'postcss-preset-env': {stage: 1},
    ...(process.env.NODE_ENV === 'development' ? {} : {cssnano: {}}),
  },
};
