import { detectFormat, fromSfnt, sha256Hex, toSfnt } from "./format.js";
import type { ConvertResult, FontFormat } from "./types.js";

const EXT: Record<FontFormat, string> = {
  ttf: "ttf",
  otf: "otf",
  woff: "woff",
  woff2: "woff2",
  ttx: "ttx",
};

const FONT_EXT_RE = /\.(woff2|woff|ttf|otf|ttc)$/i;

function stripFontExtension(basename: string): string {
  return basename.replace(FONT_EXT_RE, "") || "font";
}

export async function convert(
  input: ArrayBuffer,
  target: FontFormat,
  basename = "font",
): Promise<ConvertResult> {
  detectFormat(input);
  const sfnt = await toSfnt(input);
  if (target === "ttx") {
    throw new Error("TTX/XML export requires the optional worker; choose TTF, OTF, WOFF, or WOFF2.");
  }
  const sig =
    sfnt.byteLength >= 4
      ? String.fromCharCode(sfnt[0], sfnt[1], sfnt[2], sfnt[3])
      : "";
  const isCff = sig === "OTTO";
  if (target === "otf" && !isCff) {
    throw new Error(
      "This font uses TrueType outlines. Choose TTF or WOFF2 — OTF requires CFF (OTTO) outlines.",
    );
  }
  if (target === "ttf" && isCff) {
    throw new Error("This font uses CFF outlines. Choose OTF for download.");
  }
  const data = await fromSfnt(sfnt, target);
  const base = stripFontExtension(basename);
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
