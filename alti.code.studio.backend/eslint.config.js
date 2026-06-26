import js from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";
import security from "eslint-plugin-security";
import globals from "globals";

export default [
  // 1. ESLint recommended base rules
  js.configs.recommended,
  
  // 2. ESLint Security plugin recommended rules
  security.configs.recommended,
  
  // 3. Prettier configuration recommended rules
  prettier,
  
  // 4. Custom project rules and environment configurations
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2022,
      }
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    }
  }
];
