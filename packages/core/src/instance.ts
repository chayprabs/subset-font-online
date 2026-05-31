import { fromSfnt, sha256Hex, toSfnt } from "./format.js";
import type { SubsetResult } from "./types.js";
import { inspect } from "./inspect.js";

export type HbSubsetFn = (
  font: Uint8Array,
  options: Record<string, unknown>,
) => Promise<Uint8Array>;

let hbSubsetImpl: HbSubsetFn | null = null;

export function registerHbSubsetForInstance(fn: HbSubsetFn): void {
  hbSubsetImpl = fn;
}

export async function instance(
  input: ArrayBuffer,
  axisValues: Record<string, number>,
  outputFormat: "woff2" | "ttf" | "woff" = "woff2",
): Promise<SubsetResult> {
  if (!hbSubsetImpl) {
    throw new Error("HarfBuzz subset WASM not registered.");
  }
  const before = await inspect(input);
  const sfnt = await toSfnt(input);

  const variationAxes: Record<string, number> = { ...axisValues };

  const result = await hbSubsetImpl(sfnt, {
    text: " ",
    variationAxes,
    layoutFeatures: "*",
  });

  const out = await fromSfnt(new Uint8Array(result), outputFormat);
  const after = await inspect(
    out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer,
  );

  return {
    data: out,
    format: outputFormat,
    sizeBytes: out.byteLength,
    sha256: await sha256Hex(out),
    removedGlyphs: Math.max(0, before.numGlyphs - after.numGlyphs),
    retainedGlyphs: after.numGlyphs,
  };
}
