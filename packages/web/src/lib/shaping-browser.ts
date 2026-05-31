/** Browser shaping smoke tests (PRD F5.3). */

export const SHAPING_SAMPLES: { id: string; label: string; text: string }[] = [
  { id: "latin", label: "Latin", text: "Hello World 0123" },
  { id: "cyrillic", label: "Cyrillic", text: "Привет мир" },
  { id: "greek", label: "Greek", text: "Γειά σου κόσμε" },
  { id: "arabic", label: "Arabic", text: "مرحبا بالعالم" },
  { id: "thai", label: "Thai", text: "สวัสดีชาวโลก" },
  { id: "cjk", label: "CJK", text: "你好世界" },
];

export interface ShapingResult {
  id: string;
  label: string;
  text: string;
  width: number;
  status: "PASS" | "FAIL";
  message: string;
}

export async function runShapingSmokeTest(
  fontFamily: string,
  fontUrl: string,
): Promise<ShapingResult[]> {
  await loadFontFace(fontFamily, fontUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  const results: ShapingResult[] = [];
  for (const sample of SHAPING_SAMPLES) {
    ctx.font = `32px "${fontFamily}", sans-serif`;
    const w = ctx.measureText(sample.text).width;
    const pass = w > 0 && Number.isFinite(w);
    results.push({
      ...sample,
      width: w,
      status: pass ? "PASS" : "FAIL",
      message: pass ? `Rendered width ${w.toFixed(1)}px` : "Zero or invalid width",
    });
  }
  return results;
}

function loadFontFace(family: string, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const face = new FontFace(family, `url(${url})`);
    face
      .load()
      .then((loaded) => {
        document.fonts.add(loaded);
        resolve();
      })
      .catch(reject);
  });
}
