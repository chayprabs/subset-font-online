import { detectFormat, fromSfnt, sha256Hex, toSfnt } from "./format.js";
import type { ConvertResult, FontFormat } from "./types.js";

const EXT: Record<FontFormat, string> = {
  ttf: "ttf",
  otf: "otf",
  woff: "woff",
  woff2: "woff2",
  ttx: "ttx",
};

export async function convert(
  input: ArrayBuffer,
  target: FontFormat,
): Promise<ConvertResult> {
  const source = detectFormat(input);
  const sfnt = await toSfnt(input);
  if (target === "ttx") {
    throw new Error("TTX/XML export requires the optional worker; choose TTF, OTF, WOFF, or WOFF2.");
  }
  const data = await fromSfnt(sfnt, target);
  const base = source === "otf" ? "font" : "font";
  return {
    data,
    format: target,
    sizeBytes: data.byteLength,
    suggestedFilename: `${base}.${EXT[target]}`,
  };
}

export async function convertBatch(
  input: ArrayBuffer,
  targets: FontFormat[],
): Promise<ConvertResult[]> {
  return Promise.all(targets.map((t) => convert(input, t)));
}
