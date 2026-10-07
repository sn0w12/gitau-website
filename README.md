# gitau-website

Marketing site for [gitau](https://github.com/sn0w12/gitau), a cross-platform
Git desktop client. Astro, Tailwind v4, deployed to Cloudflare Workers static
assets.

## Commands

```bash
npm install
npm run dev            # local dev server
npm run build          # static build to dist/
npm run preview        # serve the built output

npm run format:check   # oxfmt --check
npm run lint           # oxlint
npm run typecheck      # astro check
```

## Design tokens

`src/styles/global.css` holds the color, radius, and font tokens, plus the
`.carbon` dot-lattice utility. The values are copied from the app's
`src/styles.css` so both surfaces look the same, which means **they drift by
default**: when the app's tokens change, copy them over here too.

Copied from the app's `src/styles.css`:

- the four `@fontsource` imports and the `dark` custom variant
- the `@theme inline` block (fonts, colors, radii, animations, easings)
- the `:root, .light` and `.dark` value blocks
- `--pattern-*` and `@utility carbon`

Deliberately not copied: `tw-animate-css` and `shadcn/tailwind.css` (the site
uses no component library), the `snap-hover`/`snap-active` variants, and
`html, body { overflow: hidden }`, which would break page scrolling.

## Deploy

`wrangler.jsonc` serves `dist/` as static assets with no Worker script, so
there is no per-request compute cost. `dist/install.sh` is written at build
time by `src/pages/install.sh.ts`, which downloads the script from
`sn0w12/gitau` on `master`. If that download fails, the build fails rather than
publishing a site without the script. `.github/workflows/deploy.yml` runs the
checks on every push, deploys `main`, and uploads a preview version for pull
requests.

Required repository secrets: `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID`.

The download page prerenders release data at build time. Because a build only
runs on push, cutting a release needs either a commit or a workflow dispatch
against `main` to refresh the version shown.
