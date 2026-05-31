import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { toSfnt, fromSfnt } from "./format.js";

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
});
