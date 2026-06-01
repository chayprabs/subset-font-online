declare module "opentype.js" {
  export interface Font {
    numGlyphs?: number;
    names?: Record<string, string>;
    glyphs?: { glyphs: { unicode?: number; unicodes?: number[] }[] | Record<string, { unicode?: number; unicodes?: number[] }> };
    tables?: unknown;
  }

  export function parse(buffer: ArrayBuffer): Font;
}
