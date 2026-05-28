# AGENTS.md

## Overview

Palette Forge is a Next.js app for generating, previewing, importing, exporting,
and storing color palettes. It uses TypeScript, React, Tailwind CSS v4, Zustand,
and Culori.

## Commands

Run from the repository root:

- `pnpm install` - install dependencies
- `pnpm dev` - start dev server
- `pnpm build` - build production app
- `pnpm start` - start production server
- `pnpm lint` - run ESLint
- `pnpm format` - format with Prettier
- `pnpm clean` - clean Next.js output

## Structure

- `app/` - Next.js App Router files and global styles
- `components/` - UI components
- `hooks/` - shared React hooks
- `lib/` - shared utilities and color logic
- `store/` - Zustand palette library state
- `types/` - shared TypeScript types

## Guidelines

- Use TypeScript and existing React component patterns.
- Prefer small, focused components and utilities.
- Follow Prettier config: double quotes, semicolons, trailing commas,
  `printWidth: 100`.
- Use Tailwind utilities consistently with the current UI.
- Prefer existing helpers such as `cn` from `lib/utils.ts`.
- Keep changes focused; do not rewrite unrelated code.
- Avoid new dependencies unless clearly needed.
- Keep browser-only APIs inside client components/effects.
- Be careful changing persisted palette state in `store/store.ts`; the storage key
  is `palette-forge-library`.

## Validation

No test script is currently configured. For code changes, run relevant checks:

- `pnpm lint`
- `pnpm build` for rendering, routing, type, or behavior changes

If validation cannot be run, explain why.

## Agent rules

- Read relevant files before editing.
- Do not overwrite user changes.
- Do not commit unless explicitly asked.
- Never hardcode secrets or credentials.
- Summarize changed files and validation performed.
