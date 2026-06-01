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
  if (!before.variableAxes?.length) {
    throw new Error("Font has no variation axes; upload a variable font for instancing.");
  }
  const sfnt = await toSfnt(input);

  const glyphIds = Array.from({ length: before.numGlyphs }, (_, i) => i);

  const clampedAxes: Record<string, number> = {};
  for (const ax of before.variableAxes) {
    const raw = axisValues[ax.tag] ?? ax.default;
    clampedAxes[ax.tag] = Math.min(ax.max, Math.max(ax.min, raw));
  }

  const result = await hbSubsetImpl(sfnt, {
    glyphIds,
    variationAxes: clampedAxes,
    layoutFeatures: "*",
  });

  const out = await fromSfnt(new Uint8Array(result), outputFormat);
  const afterBuf = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer;
  const after = await inspect(afterBuf);

  return {
    data: out,
    format: outputFormat,
    sizeBytes: out.byteLength,
    sha256: await sha256Hex(out),
    removedGlyphs: Math.max(0, before.numGlyphs - after.numGlyphs),
    retainedGlyphs: after.numGlyphs,
  };
}
