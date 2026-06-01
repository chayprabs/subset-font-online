import { fromSfnt, sha256Hex, toSfnt } from "./format.js";
import type { FontFormat, SubsetOpts, SubsetResult } from "./types.js";
import {
  codepointsFromPreset,
  codepointsFromText,
  LANGUAGE_PACKS,
  parseCodepointList,
  UNICODE_PRESETS,
} from "./unicode-presets.js";
import { inspect } from "./inspect.js";
import { getSupportedCodepoints, intersectCodepoints } from "./cmap.js";

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer;
}

export type HbSubsetFn = (
  font: Uint8Array,
  options: Record<string, unknown>,
) => Promise<Uint8Array>;

let hbSubsetImpl: HbSubsetFn | null = null;

export function registerHbSubset(fn: HbSubsetFn): void {
  hbSubsetImpl = fn;
}

async function hbSubset(font: Uint8Array, options: Record<string, unknown>): Promise<Uint8Array> {
  if (!hbSubsetImpl) {
    throw new Error("HarfBuzz subset WASM not registered. Call registerHbSubset from the web worker.");
  }
  return hbSubsetImpl(font, options);
}

function assertKnownPreset(name: string, context: string): void {
  if (!UNICODE_PRESETS[name]) {
    throw new Error(`Unknown ${context}: "${name}". Known presets: ${Object.keys(UNICODE_PRESETS).join(", ")}`);
  }
}

export function resolveCodepoints(opts: SubsetOpts): number[] {
  switch (opts.mode) {
    case "text":
      return codepointsFromText(opts.text ?? "");
    case "codepoints":
      return opts.codepoints ?? [];
    case "unicode-range": {
      const name = opts.unicodeRange ?? "";
      if (!name) throw new Error("No Unicode preset selected.");
      assertKnownPreset(name, "Unicode preset");
      return codepointsFromPreset(name);
    }
    case "language-pack": {
      const pack = opts.languagePack ?? "CJK Common";
      if (!LANGUAGE_PACKS[pack]) {
        throw new Error(
          `Unknown language pack: "${pack}". Known packs: ${Object.keys(LANGUAGE_PACKS).join(", ")}`,
        );
      }
      return codepointsFromPreset(LANGUAGE_PACKS[pack]);
    }
    case "glyph-ids":
      return [];
    default:
      return [];
  }
}

export async function subset(
  input: ArrayBuffer,
  opts: SubsetOpts,
): Promise<SubsetResult> {
  const outputFormat: FontFormat = opts.outputFormat ?? "woff2";
  if (outputFormat === "ttx") {
    throw new Error("TTX/XML export requires the optional worker; choose WOFF2, WOFF, TTF, or OTF.");
  }

  const before = await inspect(input);
  const sfnt = await toSfnt(input);
  const supported = await getSupportedCodepoints(input);

  const subsetOptions: Record<string, unknown> = {
    layoutFeatures: opts.dropLayoutFeatures ? [] : "*",
    noHinting: opts.dropHinting,
  };

  if (opts.mode === "text") {
    const text = opts.text?.trim();
    if (!text) throw new Error("Subset text is empty. Enter characters to keep in the font.");
    subsetOptions.text = text;
  } else if (opts.mode === "glyph-ids") {
    const ids = opts.glyphIds ?? [];
    if (!ids.length) throw new Error("No glyph IDs provided.");
    subsetOptions.glyphIds = ids;
  } else {
    let unicodes = resolveCodepoints(opts);
    if (opts.mode === "codepoints") {
      const cps = opts.codepoints ?? [];
      if (!cps.length) throw new Error("No valid codepoints provided.");
      unicodes = cps;
    }
    unicodes = intersectCodepoints(unicodes, supported);
    if (!unicodes.length) {
      throw new Error(
        "None of the requested codepoints are present in this font's cmap. Try a different preset or font.",
      );
    }
    subsetOptions.unicodes = unicodes;
  }

  const result = await hbSubset(sfnt, subsetOptions);
  const out = await fromSfnt(new Uint8Array(result), outputFormat);

  const after = await inspect(toArrayBuffer(out));
  return {
    data: out,
    format: outputFormat,
    sizeBytes: out.byteLength,
    sha256: await sha256Hex(out),
    removedGlyphs: Math.max(0, before.numGlyphs - after.numGlyphs),
    retainedGlyphs: after.numGlyphs,
  };
}

export async function subsetByCodepointString(
  input: ArrayBuffer,
  codepointInput: string,
  extra?: Partial<SubsetOpts>,
): Promise<SubsetResult> {
  return subset(input, {
    mode: "codepoints",
    codepoints: parseCodepointList(codepointInput),
    ...extra,
  });
}
