# FontOps — subset-font-online

Subset, convert and QA **TTF, OTF, WOFF and WOFF2** fonts online — glyph coverage,
variable-font instancing and WOFF2 output in the browser.

## Features

| Area | Capabilities |
|------|----------------|
| **Inspect** | Tables, Unicode coverage, naming, variable axes, named instances, hinting, license hints, raw JSON |
| **Subset** | Text, codepoints, Unicode presets, CJK language pack, glyph IDs; drop hinting/layout; live size estimate |
| **Convert** | TTF, OTF, WOFF, WOFF2; batch ZIP export; TTX via worker |
| **Instance** | Variable axis sliders, snap to named instances, bake static WOFF2 |
| **QA** | OTS, FontBakery (Google Fonts / universal), server cmap shaping (opt-in) |
| **Specimen** | Live preview, 8–96px grid, PNG/SVG export, browser shaping smoke test |

Processing runs in a **Web Worker** with HarfBuzz (`hb-subset-wasm`). Files stay in your browser unless you opt in to the QA worker.

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173

### Self-host (Docker)

```bash
docker compose up --build
```

- Web: http://localhost:5173  
- Worker API: http://localhost:8080 (proxied at `/v1/*` through nginx)

## Monorepo

```
packages/core/     @fontops/core — inspect, subset, convert, instance
packages/web/      Vite + React 19 SPA
apps/worker/       FastAPI — QA, TTX, shaping (AGPL-3.0)
```

## Acceptance criteria (PRD §20)

| ID | Test | Command |
|----|------|---------|
| A1 | Inter “Hello” subset ≤ 40 KB | `RUN_ACCEPTANCE=1 pnpm --filter @fontops/core test` |
| A2 | Variable instance wght=600 | same |
| A3 | WOFF2 round-trip | same |

## License

- **MIT** — `packages/core`, `packages/web`
- **AGPL-3.0** — `apps/worker`

## Links

- Maintainer: [@chayprabs](https://x.com/chayprabs) · [chaitanyaprabuddha.com](https://www.chaitanyaprabuddha.com)
- [Privacy](/privacy) · [Terms](/terms) (on deployed site)
