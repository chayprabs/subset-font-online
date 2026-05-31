import * as opentype from "opentype.js";
import { detectFormat, toSfnt } from "./format.js";
import type { FontInspect } from "./types.js";
import { UNICODE_PRESETS } from "./unicode-presets.js";

const TABLE_TAGS = [
  "cmap",
  "glyf",
  "head",
  "hhea",
  "hmtx",
  "name",
  "OS/2",
  "post",
  "GPOS",
  "GSUB",
  "fvar",
  "MVAR",
  "STAT",
];

const HINT_TABLES = ["prep", "fpgm", "cvt "];

export async function inspect(input: ArrayBuffer | File): Promise<FontInspect> {
  const buffer = input instanceof File ? await input.arrayBuffer() : input;
  const format = detectFormat(buffer);
  const sfnt = await toSfnt(buffer);
  const buf = new Uint8Array(sfnt).buffer;
  const font = opentype.parse(buf);
  const sizeBytes = buffer.byteLength;
  const numGlyphs = font.numGlyphs ?? 0;

  const tables: string[] = [];
  const raw = sfnt;
  const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
  const numTables = view.getUint16(4);
  for (let i = 0; i < numTables; i++) {
    const off = 12 + i * 16;
    tables.push(
      String.fromCharCode(
        raw[off],
        raw[off + 1],
        raw[off + 2],
        raw[off + 3],
      ),
    );
  }

  const supported = new Set<number>();
  if (font.glyphs?.glyphs) {
    for (const g of font.glyphs.glyphs) {
      if (g?.unicode !== undefined) supported.add(g.unicode);
    }
  }

  const unicodeRanges = Object.entries(UNICODE_PRESETS).map(([name, ranges]) => {
    let total = 0;
    let count = 0;
    for (const [start, end] of ranges) {
      for (let cp = start; cp <= end; cp++) {
        total++;
        if (supported.has(cp)) count++;
      }
    }
    return {
      name,
      codepoints: total,
      supported: count > total * 0.1,
    };
  });

  const names: FontInspect["names"] = [];
  const nameTable = (font.tables as { name?: { names: Record<string, { platformID: number; encodingID: number; languageID: number; nameID: number }> } }).name;
  if (nameTable?.names) {
    for (const [key, rec] of Object.entries(nameTable.names)) {
      names.push({
        platformId: rec.platformID,
        encodingId: rec.encodingID,
        languageId: rec.languageID,
        nameId: rec.nameID,
        value: String(key),
      });
    }
  }

  const hinting = HINT_TABLES.some((t) =>
    tables.some((x) => x.replace(/\0/g, "").trim() === t.trim()),
  );

  const features: string[] = [];
  const gsub = (font.tables as { gsub?: { features: { tag: string }[] } }).gsub;
  if (gsub?.features) {
    for (const f of gsub.features) features.push(f.tag);
  }

  const licenseHints: string[] = [];
  const licenseName = font.names?.license ?? font.names?.licenseDescription;
  if (licenseName) licenseHints.push(String(licenseName));
  if (font.names?.copyright) licenseHints.push(String(font.names.copyright));

  let variableAxes: FontInspect["variableAxes"];
  const fvar = (font.tables as { fvar?: { axes: Record<string, { minValue: number; defaultValue: number; maxValue: number }>; instances: { name: { en: string }; coordinates: Record<string, number> }[] } }).fvar;
  if (fvar?.axes) {
    variableAxes = Object.entries(fvar.axes).map(([tag, ax]) => ({
      tag,
      min: ax.minValue,
      default: ax.defaultValue,
      max: ax.maxValue,
      namedInstances: (fvar.instances ?? []).map((inst) => ({
        name: inst.name?.en ?? "Instance",
        values: inst.coordinates,
      })),
    }));
  }

  return {
    format,
    sizeBytes,
    numGlyphs,
    tables: TABLE_TAGS.filter((t) => tables.some((x) => x.replace(/\0/g, "") === t.replace(/\0/g, ""))),
    unicodeRanges,
    variableAxes,
    names,
    hinting,
    features,
    licenseHints,
  };
}
