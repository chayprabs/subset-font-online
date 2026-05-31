import * as opentype from "opentype.js";
import { toSfnt } from "./format.js";

/** Codepoints present in the font cmap (for intersecting subset requests). */
export async function getSupportedCodepoints(input: ArrayBuffer): Promise<Set<number>> {
  const sfnt = await toSfnt(input);
  const buf = new Uint8Array(sfnt).buffer;
  const font = opentype.parse(buf);
  const set = new Set<number>();
  const glyphList = font.glyphs?.glyphs;
  if (glyphList) {
    const iter = Array.isArray(glyphList)
      ? glyphList
      : Object.values(glyphList as Record<string, { unicode?: number }>);
    for (const g of iter) {
      if (g?.unicode !== undefined) set.add(g.unicode);
    }
  }
  return set;
}

export function intersectCodepoints(requested: number[], supported: Set<number>): number[] {
  const out = requested.filter((cp) => supported.has(cp));
  return out.length ? out : [0x20];
}
