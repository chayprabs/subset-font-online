declare module "opentype.js" {
  export function parse(buffer: ArrayBuffer): {
    numGlyphs?: number;
    names?: Record<string, string>;
    glyphs?: { glyphs: { unicode?: number }[] };
    tables?: unknown;
  };
}
