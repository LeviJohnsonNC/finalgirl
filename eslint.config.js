import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["review", "dist", "playwright-report", "test-results", "src/integrations/**"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/*.test.{ts,tsx}", "src/components/ui/{select,dropdown-menu,context-menu}.tsx"],
    rules: {
      "no-restricted-syntax": ["error", {
        selector: "JSXOpeningElement[name.name='select']",
        message: "Use the shared Select, PlaySelect, or OutcomeSelect so the whole dropdown uses the app theme.",
      }, {
        selector: "JSXOpeningElement[name.name='datalist'], JSXOpeningElement[name.name='input'] > JSXAttribute[name.name='list']",
        message: "Use SuggestionInput for themed suggestions with free text.",
      }],
      "no-restricted-imports": ["error", {
        paths: ["select", "dropdown-menu", "context-menu"].map(name => ({
          name: `@radix-ui/react-${name}`,
          message: `Use @/components/ui/${name} for the shared menu theme.`,
        })),
      }],
    },
  },
);

