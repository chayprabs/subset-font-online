import { subset as hbSubset } from "hb-subset-wasm";
import { fromSfnt, sha256Hex, toSfnt } from "./format.js";
import type { FontFormat, SubsetOpts, SubsetResult } from "./types.js";
import {
  codepointsFromPreset,
  codepointsFromText,
  LANGUAGE_PACKS,
  parseCodepointList,
} from "./unicode-presets.js";
import { inspect } from "./inspect.js";

let hbReady: Promise<void> | null = null;

export async function ensureHbSubset(): Promise<void> {
  if (!hbReady) {
    hbReady = Promise.resolve();
  }
  await hbReady;
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
      return opts.glyphIds ?? [];
    default:
      return [];
  }
}

export async function subset(
  input: ArrayBuffer,
  opts: SubsetOpts,
): Promise<SubsetResult> {
  await ensureHbSubset();
  const before = await inspect(input);
  const sfnt = await toSfnt(input);
  let unicodes = resolveCodepoints(opts);

  if (opts.mode === "glyph-ids" && opts.glyphIds?.length) {
    unicodes = opts.glyphIds;
  }

  if (unicodes.length === 0) {
    unicodes = [0x20, 0x2e];
  }

  const subsetOptions: Parameters<typeof hbSubset>[1] = {
    unicodes,
    layoutFeatures: opts.dropLayoutFeatures ? [] : ["*"],
  };

  if (opts.dropHinting) {
    subsetOptions.dropTables = ["prep", "fpgm", "cvt ", "hdmx", "VDMX"];
  }

  const result = await hbSubset(sfnt, subsetOptions);
  const outputFormat: FontFormat = opts.outputFormat ?? "woff2";
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
