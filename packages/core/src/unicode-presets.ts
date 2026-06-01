/** Unicode block presets for subsetting (PRD F2.3 / F2.4). */
export const UNICODE_PRESETS: Record<string, [number, number][]> = {
  Latin: [[0x0000, 0x007f], [0x0080, 0x00ff]],
  "Latin Ext": [[0x0100, 0x017f], [0x0180, 0x024f]],
  Cyrillic: [[0x0400, 0x04ff], [0x0500, 0x052f]],
  Greek: [[0x0370, 0x03ff], [0x1f00, 0x1fff]],
  Vietnamese: [[0x0000, 0x007f], [0x0080, 0x00ff], [0x0100, 0x017f], [0x1ea0, 0x1eff]],
  Thai: [[0x0e00, 0x0e7f]],
  "CJK Common": [
    [0x3000, 0x303f],
    [0x3040, 0x309f],
    [0x30a0, 0x30ff],
    [0x4e00, 0x9fff],
    [0xff00, 0xffef],
  ],
};

export const LANGUAGE_PACKS: Record<string, string> = {
  "CJK Common": "CJK Common",
};

export function codepointsFromPreset(name: string): number[] {
  const ranges = UNICODE_PRESETS[name];
  if (!ranges) return [];
  const set = new Set<number>();
  for (const [start, end] of ranges) {
    for (let cp = start; cp <= end; cp++) set.add(cp);
  }
  return [...set];
}

export function parseCodepointList(input: string): number[] {
  const set = new Set<number>();
  const parts = input.split(/[\s,;]+/).filter(Boolean);
  const listUsesHex = parts.some((p) => {
    if (p.includes("-")) return true;
    const c = p.replace(/^U\+/i, "");
    return p.startsWith("0x") || /^U\+/i.test(p) || /[a-fA-F]/.test(c);
  });
  for (const part of parts) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((s) => parseInt(s.replace(/^U\+/i, ""), 16));
      if (!Number.isNaN(a) && !Number.isNaN(b)) {
        for (let cp = a; cp <= b; cp++) set.add(cp);
      }
    } else {
      const cleaned = part.replace(/^U\+/i, "");
      const radix =
        listUsesHex || part.startsWith("0x") || /^U\+/i.test(part) ? 16 : 10;
      const cp = parseInt(cleaned, radix);
      if (!Number.isNaN(cp)) set.add(cp);
    }
  }
  return [...set];
}

export function codepointsFromText(text: string): number[] {
  return [...new Set([...text].map((c) => c.codePointAt(0)!))];
}
