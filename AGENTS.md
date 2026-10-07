# Repository guidelines

## Project overview

Marketing site for gitau, the cross-platform Git desktop client. Astro renders
it to static HTML at build time; Cloudflare Workers serves the output as static
assets with no Worker script. The app itself lives in `sn0w12/gitau` and is a
Tauri 2 shell, so nothing here touches the desktop codebase.

## Key files

| Path                       | Purpose                                                          |
| -------------------------- | ---------------------------------------------------------------- |
| `src/styles/global.css`    | Design tokens and the `.carbon` utility, copied from the app     |
| `src/layouts/Layout.astro` | Document shell, fonts, and the pre-paint dark-mode script        |
| `src/pages/`               | Routes. `/` is the homepage, `/download` prerenders release data |
| `astro.config.mjs`         | `site` for canonical URLs, Tailwind via the Vite plugin          |
| `wrangler.jsonc`           | Static assets config, no `main`, so nothing runs per request     |

## Conventions

- oxfmt and oxlint, not ESLint or Prettier. Run `npm run format` before
  committing; `format:check` runs in CI.
- Tailwind v4 CSS-first. Theme tokens live in `global.css`, there is no
  `tailwind.config`.
- 4-space indent, double quotes, printWidth 80, sorted imports.
- Components are Astro files. Named exports only where a `.ts` module is
  needed, since Astro components have no meaningful default export.
- No custom font sizes or hardcoded colors in markup; use the token utilities
  (`bg-background`, `text-muted-foreground`) so dark mode keeps working.

## Token drift

`global.css` is a hand-maintained copy of the app's `src/styles.css`. It will
fall behind. When the app's tokens change, port them here in the same commit.
The site builds fine with stale tokens, so CI cannot catch this for you.

## Commands

```bash
npm install
npm run dev
npm run build

npm run format:check
npm run lint
npm run typecheck
```

## Anti-slop

Same rules as the app: no em dashes, straight quotes only, plain verbs, no
filler. A comment earns its place by explaining a non-obvious why.
