import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { init, subset } from "hb-subset-wasm";
import { fromSfnt, toSfnt } from "./format.js";
import { instance } from "./instance.js";
import type { HbSubsetFn } from "./subset-engine.js";
import { registerHbSubset } from "./subset-engine.js";
import { registerHbSubsetForInstance } from "./instance.js";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

async function initHb() {
  const wasmPath = require.resolve("hb-subset-wasm/hb-subset.wasm");
  await init(readFileSync(wasmPath));
  const fn: HbSubsetFn = (font, options) =>
    subset(font, options as Parameters<typeof subset>[1]);
  registerHbSubset(fn);
  registerHbSubsetForInstance(fn);
}

describe.skipIf(!process.env.RUN_ACCEPTANCE)("acceptance", () => {
  it("A1: Inter subsets to <= 40 KB for Hello text", async () => {
    await initHb();
    const samplePath = join(__dirname, "../../web/public/samples/Inter-Regular.woff2");
    const font = readFileSync(samplePath);
    const sfnt = await toSfnt(font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength));
    const result = await subset(sfnt, { text: "Hello  " });
    const woff2 = await fromSfnt(new Uint8Array(result), "woff2");
    expect(woff2.byteLength).toBeLessThanOrEqual(40 * 1024);
  });

  it("A2: variable instance at weight=600 produces valid font", async () => {
    await initHb();
    const samplePath = join(__dirname, "../../web/public/samples/Inter-Variable.woff2");
    const font = readFileSync(samplePath);
    const buf = font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength);
    const result = await instance(buf, { wght: 600 }, "woff2");
    expect(result.sizeBytes).toBeGreaterThan(1000);
    expect(result.retainedGlyphs).toBeGreaterThan(10);
  });

  it("A3: WOFF2 output is valid SFNT after decompress", async () => {
    await initHb();
    const samplePath = join(__dirname, "../../web/public/samples/Inter-Regular.woff2");
    const font = readFileSync(samplePath);
    const sfnt = await toSfnt(font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength));
    const result = await subset(sfnt, { text: "Hi" });
    const woff2 = await fromSfnt(new Uint8Array(result), "woff2");
    const roundTrip = await toSfnt(
      woff2.buffer.slice(woff2.byteOffset, woff2.byteOffset + woff2.byteLength) as ArrayBuffer,
    );
    expect(roundTrip.byteLength).toBeGreaterThan(500);
    expect(String.fromCharCode(roundTrip[0], roundTrip[1], roundTrip[2], roundTrip[3])).not.toBe("wOF2");
  });
});
