# FontOps — subset-font-online

Subset, convert and QA **TTF, OTF, WOFF and WOFF2** fonts online — glyph coverage,
variable-font instancing and WOFF2 output in the browser.

FontOps runs HarfBuzz subsetting in your browser via WebAssembly. Inspect tables,
subset by text or Unicode ranges, convert formats, bake variable-font instances, and
preview specimens — without uploading files unless you opt in to server-side QA.

## Features

- **Inspect** — tables, Unicode coverage, naming, variable axes, hinting, license hints
- **Subset** — by text, codepoints, Unicode presets (Latin, Cyrillic, CJK common, …)
- **Convert** — TTF, OTF, WOFF, WOFF2
- **Instance** — bake static fonts from variable axis values
- **Specimen** — live preview and PNG export
- **QA** (optional) — OTS + fontTools checks via self-hosted worker

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173

### Self-host with Docker

```bash
docker compose up --build
```

Web: http://localhost:5173 · Worker: http://localhost:8080

## Monorepo layout

```
packages/core/   # @fontops/core — inspect, subset, convert (hb-subset-wasm)
packages/web/    # Vite + React 19 SPA
apps/worker/     # FastAPI FontBakery/OTS QA (AGPL-3.0)
```

## License

- Browser packages (`packages/core`, `packages/web`): **MIT**
- Worker (`apps/worker`): **AGPL-3.0**

## Links

- [Privacy Policy](/privacy) (on deployed site)
- Maintainer: [@chayprabs](https://x.com/chayprabs) · [chaitanyaprabuddha.com](https://www.chaitanyaprabuddha.com)

## Topics

`font` `font-subset` `woff2` `ttf` `otf` `woff` `harfbuzz` `fonttools` `variable-fonts`
`font-instancing` `font-converter` `glyph-coverage` `font-qa` `online-tool`
