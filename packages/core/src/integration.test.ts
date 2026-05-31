import { describe, expect, it, beforeAll } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { init, subset as hbSubsetWasm } from "hb-subset-wasm";
import { inspect, subset, registerHbSubset } from "./index.js";
import { detectFormat, fromSfnt, toSfnt } from "./format.js";
import type { HbSubsetFn } from "./subset-engine.js";
import { parseCodepointList } from "./unicode-presets.js";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const samplesDir = join(__dirname, "../../web/public/samples");

function magic(buf: Uint8Array): string {
  return String.fromCharCode(buf[0], buf[1], buf[2], buf[3]);
}

function assertValidOutput(data: Uint8Array, expectedFormat: "woff2" | "woff" | "ttf") {
  expect(data.byteLength).toBeGreaterThan(0);
  const sig = magic(data);
  if (expectedFormat === "woff2") expect(sig).toBe("wOF2");
  else if (expectedFormat === "woff") expect(sig).toBe("wOFF");
  else expect(["true", "\0\x01\0\0", "OTTO"].some((s) => sig === s || sig === "true")).toBe(true);
}

describe.skipIf(!process.env.RUN_ACCEPTANCE)("integration: samples inspect + subset", () => {
  beforeAll(async () => {
    const wasmPath = require.resolve("hb-subset-wasm/hb-subset.wasm");
    await init(readFileSync(wasmPath));
    const fn: HbSubsetFn = (font, options) =>
      hbSubsetWasm(font, options as Parameters<typeof hbSubsetWasm>[1]);
    registerHbSubset(fn);
  });

  const sampleFiles = readdirSync(samplesDir).filter((f) => /\.(woff2?|ttf|otf)$/i.test(f));

  for (const file of sampleFiles) {
    describe(file, () => {
      const path = join(samplesDir, file);
      let buffer: ArrayBuffer;

      beforeAll(() => {
        const font = readFileSync(path);
        buffer = font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength);
      });

      it("inspect: valid metadata", async () => {
        const meta = await inspect(buffer);
        expect(meta.numGlyphs).toBeGreaterThan(0);
        expect(meta.sizeBytes).toBeGreaterThan(0);
        expect(meta.format).toBe(detectFormat(buffer));
        expect(meta.tables.length).toBeGreaterThan(0);
      });

      it('subset by text "Hello"', async () => {
        const result = await subset(buffer, { mode: "text", text: "Hello", outputFormat: "woff2" });
        assertValidOutput(result.data, "woff2");
        expect(result.retainedGlyphs).toBeGreaterThan(0);
        expect(result.sizeBytes).toBeGreaterThan(0);
      });

      it('subset by codepoints "48 65 6c 6c 6f"', async () => {
        const cps = parseCodepointList("48 65 6c 6c 6f");
        const result = await subset(buffer, { mode: "codepoints", codepoints: cps, outputFormat: "woff2" });
        assertValidOutput(result.data, "woff2");
        expect(result.retainedGlyphs).toBeGreaterThan(0);
      });

      it("subset by Unicode preset Latin", async () => {
        const result = await subset(buffer, {
          mode: "unicode-range",
          unicodeRange: "Latin",
          outputFormat: "woff2",
        });
        assertValidOutput(result.data, "woff2");
        expect(result.retainedGlyphs).toBeGreaterThan(0);
      });

      it.fails("subset by language pack CJK Common (known: post-subset inspect cmap error)", async () => {
        const result = await subset(buffer, {
          mode: "language-pack",
          languagePack: "CJK Common",
          outputFormat: "woff2",
        });
        assertValidOutput(result.data, "woff2");
        expect(result.retainedGlyphs).toBeGreaterThan(0);
      });

      it.fails("subset by unicode-range CJK Common (same unicodes path)", async () => {
        const result = await subset(buffer, {
          mode: "unicode-range",
          unicodeRange: "CJK Common",
          outputFormat: "woff2",
        });
        assertValidOutput(result.data, "woff2");
        expect(result.retainedGlyphs).toBeGreaterThan(0);
      });

      it('subset by glyph IDs "0 1 2"', async () => {
        const result = await subset(buffer, { mode: "glyph-ids", glyphIds: [0, 1, 2], outputFormat: "woff2" });
        assertValidOutput(result.data, "woff2");
        expect(result.retainedGlyphs).toBeGreaterThan(0);
      });
    });
  }

  it("inspect/converts TTF and WOFF derived from WOFF2 sample", async () => {
    const woff2Path = join(samplesDir, "Inter-Regular.woff2");
    const font = readFileSync(woff2Path);
    const buf = font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength);
    const sfnt = await toSfnt(buf);

    const ttf = await fromSfnt(sfnt, "ttf");
    const ttfMeta = await inspect(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength));
    expect(ttfMeta.format).toBe("ttf");
    expect(ttfMeta.numGlyphs).toBeGreaterThan(0);

    const woff = await fromSfnt(sfnt, "woff");
    const woffMeta = await inspect(woff.buffer.slice(woff.byteOffset, woff.byteOffset + woff.byteLength));
    expect(woffMeta.format).toBe("woff");
    expect(woffMeta.numGlyphs).toBeGreaterThan(0);

    const ttfSubset = await subset(
      ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength) as ArrayBuffer,
      { mode: "text", text: "Hello", outputFormat: "ttf" },
    );
    assertValidOutput(ttfSubset.data, "ttf");
    expect(ttfSubset.retainedGlyphs).toBeGreaterThan(0);

    const woffSubset = await subset(
      woff.buffer.slice(woff.byteOffset, woff.byteOffset + woff.byteLength) as ArrayBuffer,
      { mode: "text", text: "Hello", outputFormat: "woff" },
    );
    assertValidOutput(woffSubset.data, "woff");
    expect(woffSubset.retainedGlyphs).toBeGreaterThan(0);
  });
});
