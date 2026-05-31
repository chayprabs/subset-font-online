import { subset as hbSubset } from "hb-subset-wasm";
import { fromSfnt, sha256Hex, toSfnt } from "./format.js";
import type { SubsetResult } from "./types.js";
import { inspect } from "./inspect.js";

export async function instance(
  input: ArrayBuffer,
  axisValues: Record<string, number>,
  outputFormat: "woff2" | "ttf" | "woff" = "woff2",
): Promise<SubsetResult> {
  const before = await inspect(input);
  const sfnt = await toSfnt(input);

  const instancerOptions: Parameters<typeof hbSubset>[1] = {
    unicodes: [0x20],
    instancer: Object.entries(axisValues).map(([tag, value]) => ({
      tag,
      value,
    })),
    layoutFeatures: ["*"],
  };

  const result = await hbSubset(sfnt, instancerOptions);
  const out = await fromSfnt(new Uint8Array(result), outputFormat);
  const after = await inspect(out.buffer);

  return {
    data: out,
    format: outputFormat,
    sizeBytes: out.byteLength,
    sha256: await sha256Hex(out),
    removedGlyphs: Math.max(0, before.numGlyphs - after.numGlyphs),
    retainedGlyphs: after.numGlyphs,
  };
}
