import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { toSfnt, fromSfnt } from "./format.js";
import { inspect } from "./inspect.js";

const sample = join(dirname(fileURLToPath(import.meta.url)), "../../web/public/samples/Inter-Regular.woff2");

describe("format", () => {
  it("round-trips WOFF2 via SFNT", async () => {
    const font = readFileSync(sample);
    const sfnt = await toSfnt(font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength));
    const woff2 = await fromSfnt(sfnt, "woff2");
    const again = await toSfnt(
      woff2.buffer.slice(woff2.byteOffset, woff2.byteOffset + woff2.byteLength) as ArrayBuffer,
    );
    expect(again.byteLength).toBeGreaterThan(1000);
  });

  it("round-trips WOFF zlib encode/decode as parseable SFNT", async () => {
    const font = readFileSync(sample);
    const input = font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength) as ArrayBuffer;
    const before = await inspect(input);
    const woff = await fromSfnt(await toSfnt(input), "woff");
    const woffBuf = woff.buffer.slice(woff.byteOffset, woff.byteOffset + woff.byteLength) as ArrayBuffer;
    const woffMeta = await inspect(woffBuf);
    expect(woffMeta.format).toBe("woff");
    const decoded = await toSfnt(woffBuf);
    const afterBuf = decoded.buffer.slice(
      decoded.byteOffset,
      decoded.byteOffset + decoded.byteLength,
    ) as ArrayBuffer;
    const after = await inspect(afterBuf);
    expect(after.numGlyphs).toBe(before.numGlyphs);
    expect(after.tables.length).toBe(before.tables.length);
  });
});
