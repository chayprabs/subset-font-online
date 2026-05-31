/** Parse Google Fonts CSS URL and extract font file URLs (PRD F7). */
export function parseGoogleFontsCss(css: string): string[] {
  const urls: string[] = [];
  const re = /url\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    const raw = m[1].replace(/['"]/g, "").trim();
    if (raw.startsWith("http")) urls.push(raw);
  }
  return [...new Set(urls)];
}

export async function fetchGoogleFontsCss(cssUrl: string): Promise<string[]> {
  const res = await fetch(cssUrl);
  if (!res.ok) throw new Error(`Failed to fetch Google Fonts CSS: ${res.status}`);
  const css = await res.text();
  return parseGoogleFontsCss(css);
}
