// ESLint flat config — AppsIndie baseline.
// See .agents/skills/engineering/assets/verify/README.md.
//
// Plugins are registered explicitly rather than spread from each plugin's
// `configs.recommended`. Flat-config exports still vary between plugin major
// versions; explicit registration works across all of them and shows exactly
// which rules are on.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import security from "eslint-plugin-security";
import noUnsanitized from "eslint-plugin-no-unsanitized";
import sonarjs from "eslint-plugin-sonarjs";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      ".expo/**",
      "android/**",
      "ios/**",
      "**/*.generated.ts",
    ],
  },

  js.configs.recommended,

  // Type-aware rules. These are the ones that pay for themselves — they need
  // real type information, which is why `projectService` is on below.
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      import: importPlugin,
      "react-hooks": reactHooks,
      security,
      "no-unsanitized": noUnsanitized,
      sonarjs,
    },

    rules: {
      // --- React correctness -------------------------------------------------
      // exhaustive-deps is a *defect* detector in React Native, not a style
      // preference: a missing dep is a stale closure reading last render's
      // state. Warning-level here is why stale-state bugs reach review.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",

      // --- Async correctness -------------------------------------------------
      // The single highest-value pair on this list. A floating promise is a
      // silently swallowed failure; a misused one is an `if` on a Promise
      // object, which is always truthy.
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/require-await": "error",

      // --- Module structure --------------------------------------------------
      // tsc already reports unresolved imports, so `import/no-unresolved` is
      // not enabled — it duplicates the typecheck and needs resolver config.
      // Cycles are the thing tsc will not tell you about.
      "import/no-cycle": ["error", { maxDepth: Infinity }],
      "import/no-extraneous-dependencies": "error",

      // --- Security ----------------------------------------------------------
      "security/detect-child-process": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-non-literal-require": "error",
      "security/detect-non-literal-fs-filename": "error",
      "security/detect-unsafe-regex": "error",
      // Deliberately OFF. It flags nearly every `obj[key]` and its false-positive
      // rate is what drives teams to disable the whole plugin — losing the five
      // rules above, which do find real defects. Removing this one rule keeps
      // the rest credible.
      "security/detect-object-injection": "off",

      "no-unsanitized/method": "error",
      "no-unsanitized/property": "error",

      // --- Duplication -------------------------------------------------------
      // Team Rules bans copy-paste duplication and nothing enforced it. These
      // two need no threshold and no judgement: the code is identical or it is
      // not. Duplication is a defect rather than a smell because the copies
      // diverge — one gets the bug fix and the other does not.
      "sonarjs/no-identical-functions": "error",
      "sonarjs/no-duplicated-branches": "error",

      // Deliberately NOT enabled: sonarjs/cognitive-complexity and the max-depth
      // / max-lines-per-function family. The review criterion is "complexity not
      // justified by the requirement" — and a linter cannot see the requirement,
      // only the nesting. It would not replace the reviewer's judgement, it would
      // add a build failure the reviewer still has to adjudicate, on a threshold
      // nobody can defend (15 is fine, 16 is a build break?). Complexity stays
      // with the reviewer, where the requirement is visible.

      // --- Explicitness ------------------------------------------------------
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      // An unused variable prefixed `_` is intentional; anything else is a leftover.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // Tests assert on deliberately malformed input, so the unsafe-* family fires
  // constantly with no signal. Narrowed to test files only — never widened to src.
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Config files are not part of the typed program.
  {
    files: ["*.config.{js,mjs,ts}", "*.config.*.{js,mjs,ts}"],
    ...tseslint.configs.disableTypeChecked,
  },
);
