export type FontFormat = "ttf" | "otf" | "woff" | "woff2" | "ttx";

export interface FontInspect {
  format: FontFormat;
  sizeBytes: number;
  numGlyphs: number;
  tables: string[];
  unicodeRanges: { name: string; codepoints: number; supported: boolean }[];
  variableAxes?: {
    tag: string;
    min: number;
    default: number;
    max: number;
    namedInstances: { name: string; values: Record<string, number> }[];
  }[];
  names: {
    platformId: number;
    encodingId: number;
    languageId: number;
    nameId: number;
    value: string;
  }[];
  hinting: boolean;
  features: string[];
  licenseHints: string[];
}

export interface SubsetOpts {
  mode: "text" | "codepoints" | "unicode-range" | "language-pack" | "glyph-ids";
  text?: string;
  codepoints?: number[];
  unicodeRange?: string;
  languagePack?: string;
  glyphIds?: number[];
  dropHinting?: boolean;
  dropLayoutFeatures?: boolean;
  outputFormat?: FontFormat;
}

export interface SubsetResult {
  data: Uint8Array;
  format: string;
  sizeBytes: number;
  sha256: string;
  removedGlyphs: number;
  retainedGlyphs: number;
}

export interface ConvertResult {
  data: Uint8Array;
  format: FontFormat;
  sizeBytes: number;
  suggestedFilename: string;
}

export interface QAReport {
  profile: string;
  checks: {
    id: string;
    status: "PASS" | "FAIL" | "WARN" | "SKIP";
    message: string;
  }[];
}
