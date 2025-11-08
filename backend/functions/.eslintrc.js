module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020, // ✅ allows arrow functions, async/await, etc.
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    // ✅ Keep logic linting, disable style complaints
    "object-curly-spacing": "off",
    "max-len": "off",
    "camelcase": "off",
    "no-unused-vars": "warn",
    "quotes": ["warn", "double"],
    "indent": "off",
    "comma-dangle": "off",
    "no-trailing-spaces": "off",
    "eol-last": "off",
    "padded-blocks": "off",
  },
};