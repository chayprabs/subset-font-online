import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { init, subset } from "hb-subset-wasm";
import { fromSfnt, toSfnt } from "./format.js";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const samplePath = join(__dirname, "../../web/public/samples/Inter-Regular.woff2");

describe.skipIf(!process.env.RUN_ACCEPTANCE)("acceptance", () => {
  it("A1: Inter subsets to <= 40 KB for Hello text", async () => {
    const wasmPath = require.resolve("hb-subset-wasm/hb-subset.wasm");
    await init(readFileSync(wasmPath));
    const font = readFileSync(samplePath);
    const sfnt = await toSfnt(font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength));
    const result = await subset(sfnt, { text: "Hello  " });
    const woff2 = await fromSfnt(new Uint8Array(result), "woff2");
    expect(woff2.byteLength).toBeLessThanOrEqual(40 * 1024);
  });
});
