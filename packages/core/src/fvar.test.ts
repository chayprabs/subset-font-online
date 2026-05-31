import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { inspect } from "./inspect.js";

const interVar = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../web/public/samples/Inter-Variable.woff2",
);

describe.skipIf(!process.env.RUN_ACCEPTANCE)("fvar axes", () => {
  it("reads axis tags from Inter Variable", async () => {
    const font = readFileSync(interVar);
    const buf = font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength);
    const meta = await inspect(buf);
    expect(meta.variableAxes?.length).toBeGreaterThan(0);
    const tags = meta.variableAxes!.map((a) => a.tag);
    expect(tags.some((t) => t === "wght" || t.length === 4)).toBe(true);
    expect(tags).not.toContain("0");
    expect(tags).not.toContain("1");
  });
});
