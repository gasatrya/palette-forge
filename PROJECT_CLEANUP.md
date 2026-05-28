# Project Cleanup Guide

This document explains step-by-step how to clean up this project based on the requested checklist.

---

## Step 1 — Check unused packages in `package.json`

1. Run dependency analysis:

```bash
npx depcheck
```

2. Review output carefully.
   - Tools like `depcheck` can produce false positives for config-based packages.
   - In this project, `autoprefixer`, `@tailwindcss/postcss`, and `rimraf` are used via config/scripts.

3. If you confirm a package is truly unused, remove it with:

```bash
pnpm remove <package-name>
```

4. If you want a single command based on the current `depcheck` output, use:

```bash
pnpm remove autoprefixer postcss @tailwindcss/postcss @types/react-dom prettier rimraf tailwindcss
```

> Recommended: remove packages one by one after manual verification.

---

## Step 2 — Check upgradable packages (`ncu -i`) with exclusions

Run:

```bash
npx npm-check-updates --reject @types/node,eslint,typescript
```

- This checks update candidates while excluding:
  - `@types/node`
  - `eslint`
  - `typescript`

If updates appear, apply them and install:

```bash
npx npm-check-updates -u --reject @types/node,eslint,typescript
pnpm install
```

---

## Step 3 — Ensure `rimraf` is installed and update `dev` script

1. Install `rimraf`:

```bash
pnpm add -D rimraf
```

2. In `package.json`, set:

```json
{
  "scripts": {
    "dev": "rimraf .next && next dev"
  }
}
```

This ensures stale `.next` build artifacts are removed before development starts.

---

## Step 4 — Update `next.config.ts`

Use this config:

```ts
import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
```

---

## Step 5 — Remove unnecessary files

Delete the following files:

- `README.md`
- `.env.example`
- `metadata.json`

Command:

```bash
rm README.md .env.example metadata.json
```

---

## Step 6 — Install Prettier, add script, and create config files

1. Install dependencies:

```bash
pnpm add -D prettier eslint-config-prettier
```

2. Add Prettier script in `package.json`:

```json
{
  "scripts": {
    "format": "prettier . --write"
  }
}
```

3. Create `.prettierignore`:

```txt
node_modules
.next
out
build
pnpm-lock.yaml
```

4. Create `prettier.config.mjs`:

```js
/** @type {import('prettier').Config} */
const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
};

export default config;
```

---

## Step 7 — Update `eslint.config.mjs`

Replace file content with:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  eslintConfigPrettier,
]);

export default eslintConfig;
```

---

## Final verification

After all steps, run:

```bash
pnpm install
pnpm format
pnpm lint
pnpm dev
```

If `format`, `lint`, and `dev` run correctly, cleanup is complete.
