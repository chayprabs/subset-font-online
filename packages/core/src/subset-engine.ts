import { fromSfnt, sha256Hex, toSfnt } from "./format.js";
import type { FontFormat, SubsetOpts, SubsetResult } from "./types.js";
import {
  codepointsFromPreset,
  codepointsFromText,
  LANGUAGE_PACKS,
  parseCodepointList,
} from "./unicode-presets.js";
import { inspect } from "./inspect.js";

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

export function resolveCodepoints(opts: SubsetOpts): number[] {
  switch (opts.mode) {
    case "text":
      return codepointsFromText(opts.text ?? "");
    case "codepoints":
      return opts.codepoints ?? [];
    case "unicode-range":
      return opts.unicodeRange ? codepointsFromPreset(opts.unicodeRange) : [];
    case "language-pack": {
      const pack = opts.languagePack ?? "CJK Common";
      const preset = LANGUAGE_PACKS[pack] ?? pack;
      return codepointsFromPreset(preset);
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
  const before = await inspect(input);
  const sfnt = await toSfnt(input);

  const subsetOptions: Record<string, unknown> = {
    layoutFeatures: opts.dropLayoutFeatures ? undefined : "*",
    noHinting: opts.dropHinting,
  };

  if (opts.mode === "text") {
    subsetOptions.text = opts.text ?? "";
  } else if (opts.mode === "glyph-ids" && opts.glyphIds?.length) {
    subsetOptions.glyphIds = opts.glyphIds;
  } else {
    const unicodes = resolveCodepoints(opts);
    if (opts.mode === "codepoints" && opts.codepoints) {
      subsetOptions.unicodes = opts.codepoints;
    } else {
      subsetOptions.unicodes = unicodes.length ? unicodes : [0x20];
    }
  }

  const result = await hbSubset(sfnt, subsetOptions);
  const outputFormat: FontFormat = opts.outputFormat ?? "woff2";
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
