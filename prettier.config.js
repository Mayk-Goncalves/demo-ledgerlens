/** @type {import("prettier").Config} */
module.exports = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  endOfLine: "lf",

  plugins: ["@ianvs/prettier-plugin-sort-imports"],

  // Import sorting — grouped by: external → @/ alias → relative
  importOrder: ["<THIRD_PARTY_MODULES>", "", "^@/(.*)$", "", "^[./]"],
  importOrderParserPlugins: ["typescript", "jsx"],
  importOrderTypeScriptVersion: "5.9.2",
};
