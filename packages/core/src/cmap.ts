import * as opentype from "opentype.js";
import { toSfnt } from "./format.js";

type GlyphLike = { unicode?: number; unicodes?: number[] };

function iterGlyphs(glyphList: unknown): GlyphLike[] {
  if (!glyphList) return [];
  if (Array.isArray(glyphList)) return glyphList as GlyphLike[];
  return Object.values(glyphList as Record<string, GlyphLike>);
}

/** All Unicode codepoints mapped in the font (primary + secondary cmap entries). */
export function collectCodepointsFromFont(font: opentype.Font): Set<number> {
  const set = new Set<number>();
  for (const g of iterGlyphs(font.glyphs?.glyphs)) {
    if (g.unicodes?.length) {
      for (const u of g.unicodes) set.add(u);
    } else if (g.unicode !== undefined) {
      set.add(g.unicode);
    }
  }
  return set;
}

/** Codepoints present in the font cmap (for intersecting subset requests). */
export async function getSupportedCodepoints(input: ArrayBuffer): Promise<Set<number>> {
  const sfnt = await toSfnt(input);
  const buf = new Uint8Array(sfnt).buffer;
  const font = opentype.parse(buf);
  return collectCodepointsFromFont(font);
}

export function intersectCodepoints(requested: number[], supported: Set<number>): number[] {
  return requested.filter((cp) => supported.has(cp));
}
