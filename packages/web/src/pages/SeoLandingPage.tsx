import { Link } from "react-router-dom";

const COPY: Record<string, { title: string; desc: string }> = {
  "font-subset-online": {
    title: "Font Subset Online",
    desc: "Reduce web font payload by subsetting to the characters you actually use.",
  },
  "woff2-converter": {
    title: "WOFF2 Converter",
    desc: "Convert TTF, OTF, and WOFF fonts to WOFF2 in your browser.",
  },
  "variable-font-instance": {
    title: "Variable Font Instance",
    desc: "Bake a static font from variable axis values with HarfBuzz instancing.",
  },
  "ttf-to-woff2": {
    title: "TTF to WOFF2",
    desc: "Compress TrueType fonts to WOFF2 for faster web delivery.",
  },
  "font-glyph-coverage": {
    title: "Font Glyph Coverage",
    desc: "Inspect Unicode range coverage before you subset.",
  },
};

export default function SeoLandingPage({ slug }: { slug: string }) {
  const page = COPY[slug];
  return (
    <main className="main">
      <h1>{page?.title ?? slug}</h1>
      <p>{page?.desc}</p>
      <p>
        <Link to="/">Open FontOps →</Link>
      </p>
    </main>
  );
}
