declare module "opentype.js" {
  const opentype: {
    parse(buffer: ArrayBuffer): {
      numGlyphs?: number;
      names?: Record<string, string>;
      glyphs?: { glyphs: { unicode?: number }[] };
      tables?: unknown;
    };
  };
  export default opentype;
}
