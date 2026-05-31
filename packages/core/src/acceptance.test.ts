import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { init, subset } from "hb-subset-wasm";
import { fromSfnt } from "./format.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const samplePath = join(__dirname, "../../web/public/samples/Inter-Regular.woff2");

describe.skipIf(!process.env.RUN_ACCEPTANCE)("acceptance", () => {
  it("A1: Inter subsets to <= 40 KB for Hello text", async () => {
    const wasmPath = join(
      __dirname,
      "../../../node_modules/hb-subset-wasm/dist/hb-subset.wasm",
    );
    const { readFileSync: read } = await import("node:fs");
    await init(read(wasmPath));
    const font = readFileSync(samplePath);
    const sfnt = await fromSfnt(font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength));
    const result = await subset(sfnt, { text: "Hello  " });
    const woff2 = await fromSfnt(new Uint8Array(result), "woff2");
    expect(woff2.byteLength).toBeLessThanOrEqual(40 * 1024);
  });
});
