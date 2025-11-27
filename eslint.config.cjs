// eslint.config.cjs

const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  {
    // Carpetas a ignorar
    ignores: ["dist/**", "build/**"],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parser: tsParser,
      // 👇 aquí declaramos los globals de Node / Lambda
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // Puedes dejarla activada, ya no se quejará de console/process/URL
      "no-undef": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
];
