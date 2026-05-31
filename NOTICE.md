# Third-party notices

FontOps incorporates open-source components. This file summarizes major dependencies and their licenses. See each package’s repository for full license text.

## JavaScript / TypeScript (`packages/web`, `packages/core`)

| Component | License | Notes |
|-----------|---------|--------|
| React, React DOM | MIT | UI |
| Vite | MIT | Build |
| react-router-dom | MIT | Routing |
| opentype.js | MIT | Font parsing |
| woff2-encoder | MIT | WOFF2 compression |
| pako | MIT | WOFF zlib |
| hb-subset-wasm / HarfBuzz (WASM) | See upstream | Subsetting engine |
| lucide-react | ISC | Icons |
| jszip | MIT OR GPL-3.0 | Batch ZIP export |

## Python (`apps/worker`)

| Component | License | Notes |
|-----------|---------|--------|
| FastAPI | MIT | API framework |
| fontTools | MIT | Font I/O |
| opentype-sanitizer (OTS) | BSD-3-Clause | Sanitization |
| FontBakery (optional) | Apache-2.0 | QA checks |

## Trademarks

“FontOps” and related branding refer to this project. Third-party names (e.g. Inter, Noto, Google Fonts) are trademarks of their respective owners. Sample fonts in `packages/web/public/samples/` are used for demonstration; comply with each font’s license when redistributing.

## Your obligations

If you redistribute FontOps or offer it as a network service (especially with the AGPL worker), comply with MIT/AGPL obligations and preserve copyright notices. If you embed or ship third-party fonts, comply with **those** licenses separately.
