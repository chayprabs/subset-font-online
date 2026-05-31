import { useCallback, useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import type { FontInspect, SubsetResult } from "@fontops/core";
import { UNICODE_PRESETS } from "@fontops/core";
import { downloadBytes, formatBytes, runFontJob } from "../lib/fontWorker";

type Tab = "inspect" | "subset" | "convert" | "instance" | "qa" | "specimen";

const TABS: { id: Tab; label: string }[] = [
  { id: "inspect", label: "Inspect" },
  { id: "subset", label: "Subset" },
  { id: "convert", label: "Convert" },
  { id: "instance", label: "Instance" },
  { id: "qa", label: "QA" },
  { id: "specimen", label: "Specimen" },
];

const SAMPLES = [
  { name: "Inter (variable)", url: "/samples/Inter-Regular.woff2" },
];

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("subset");
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [inspectData, setInspectData] = useState<FontInspect | null>(null);
  const [subsetText, setSubsetText] = useState("Hello  ");
  const [codepoints, setCodepoints] = useState("48 65 6c 6c 6f");
  const [unicodePreset, setUnicodePreset] = useState("Latin");
  const [dropHinting, setDropHinting] = useState(false);
  const [dropLayout, setDropLayout] = useState(false);
  const [convertTarget, setConvertTarget] = useState<"woff2" | "woff" | "ttf" | "otf">("woff2");
  const [axisValues, setAxisValues] = useState<Record<string, number>>({ wght: 600 });
  const [subsetResult, setSubsetResult] = useState<SubsetResult | null>(null);
  const [specimenText, setSpecimenText] = useState("The quick brown fox jumps over the lazy dog.");
  const [fontUrl, setFontUrl] = useState("");
  const [googleCssUrl, setGoogleCssUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qaOptIn, setQaOptIn] = useState(false);
  const [qaReport, setQaReport] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadBuffer = useCallback(async (f: File) => {
    setError(null);
    setFile(f);
    const buf = await f.arrayBuffer();
    setBuffer(buf);
    setSubsetResult(null);
    setInspectData(null);
    try {
      setLoading(true);
      const res = await runFontJob<{ type: "inspect"; result: FontInspect }>(
        { type: "inspect", buffer: buf },
        [buf],
      );
      if (res.type === "inspect") {
        setInspectData(res.result);
      }
      if (res.type === "inspect" && res.result.variableAxes?.length) {
        const axes: Record<string, number> = {};
        for (const ax of res.result.variableAxes) {
          axes[ax.tag] = ax.default;
        }
        setAxisValues(axes);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) void loadBuffer(f);
    },
    [loadBuffer],
  );

  const runSubset = async (mode: "text" | "codepoints" | "unicode-range") => {
    if (!buffer) return;
    setLoading(true);
    setError(null);
    try {
      const buf = buffer.slice(0);
      const res = await runFontJob(
        {
          type: "subset",
          buffer: buf,
          opts: {
            mode,
            text: mode === "text" ? subsetText : undefined,
            codepoints:
              mode === "codepoints"
                ? codepoints.split(/[\s,]+/).map((s) => parseInt(s, 16)).filter((n) => !Number.isNaN(n))
                : undefined,
            unicodeRange: mode === "unicode-range" ? unicodePreset : undefined,
            dropHinting,
            dropLayoutFeatures: dropLayout,
            outputFormat: "woff2",
          },
        },
        [buf],
      );
      if (res.type === "subset") setSubsetResult(res.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const runConvert = async () => {
    if (!buffer) return;
    setLoading(true);
    setError(null);
    try {
      const buf = buffer.slice(0);
      const res = await runFontJob(
        { type: "convert", buffer: buf, target: convertTarget },
        [buf],
      );
      if (res.type === "convert") {
        downloadBytes(res.result.data, res.result.suggestedFilename);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const runInstance = async () => {
    if (!buffer) return;
    setLoading(true);
    setError(null);
    try {
      const buf = buffer.slice(0);
      const res = await runFontJob(
        { type: "instance", buffer: buf, axes: axisValues, format: "woff2" },
        [buf],
      );
      if (res.type === "instance") setSubsetResult(res.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const runQa = async () => {
    if (!file || !qaOptIn) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const base = import.meta.env.VITE_WORKER_URL ?? "";
      const res = await fetch(`${base}/v1/qa`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`QA worker returned ${res.status}`);
      const data = await res.json();
      setQaReport(JSON.stringify(data, null, 2));
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message} — start the worker with docker compose up or set VITE_WORKER_URL.`
          : String(e),
      );
    } finally {
      setLoading(false);
    }
  };

  const loadFromUrl = async () => {
    if (!fontUrl.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(fontUrl);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const buf = await res.arrayBuffer();
      const name = fontUrl.split("/").pop() ?? "font.woff2";
      await loadBuffer(new File([buf], name));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleFonts = async () => {
    if (!googleCssUrl.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { fetchGoogleFontsCss } = await import("@fontops/core");
      const urls = await fetchGoogleFontsCss(googleCssUrl);
      if (!urls.length) throw new Error("No font URLs found in CSS");
      const res = await fetch(urls[0]);
      const buf = await res.arrayBuffer();
      await loadBuffer(new File([buf], "google-font.woff2"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const savings =
    file && subsetResult
      ? `${formatBytes(file.size)} → ${formatBytes(subsetResult.sizeBytes)}`
      : null;

  return (
    <main className="main">
      <div
        className="dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("dragover");
        }}
        onDragLeave={(e) => e.currentTarget.classList.remove("dragover")}
        onDrop={(e) => {
          e.currentTarget.classList.remove("dragover");
          onDrop(e);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2,font/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void loadBuffer(f);
          }}
        />
        <Upload size={28} style={{ marginBottom: "0.5rem", opacity: 0.5 }} />
        <div>
          {file ? (
            <>
              <strong>{file.name}</strong> — {formatBytes(file.size)}
            </>
          ) : (
            "Drop a font file here or click to browse (TTF, OTF, WOFF, WOFF2)"
          )}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: "1rem" }}>
        <div className="field">
          <label htmlFor="font-url">Load from URL</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input id="font-url" value={fontUrl} onChange={(e) => setFontUrl(e.target.value)} placeholder="https://…/font.woff2" />
            <button type="button" className="btn btn-secondary" onClick={() => void loadFromUrl()} disabled={loading}>
              Load
            </button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="gfonts">Google Fonts CSS URL</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              id="gfonts"
              value={googleCssUrl}
              onChange={(e) => setGoogleCssUrl(e.target.value)}
              placeholder="https://fonts.googleapis.com/css2?…"
            />
            <button type="button" className="btn btn-secondary" onClick={() => void loadGoogleFonts()} disabled={loading}>
              Parse
            </button>
          </div>
        </div>
      </div>

      <div className="field">
        <label>Sample fonts</label>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {SAMPLES.map((s) => (
            <button
              key={s.name}
              type="button"
              className="btn btn-secondary"
              onClick={() => void fetch(s.url).then((r) => r.arrayBuffer()).then((b) => loadBuffer(new File([b], s.url.split("/").pop()!)))}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <nav className="tabs" aria-label="Tool sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {loading && (
        <div className="progress">
          <div className="progress-bar" style={{ width: "60%" }} />
        </div>
      )}
      {error && <p className="error">{error}</p>}

      <div className="panel">
        {tab === "inspect" && inspectData && (
          <>
            <p>
              <span className="badge">{inspectData.format.toUpperCase()}</span>{" "}
              {inspectData.numGlyphs} glyphs · {formatBytes(inspectData.sizeBytes)}
              {inspectData.hinting ? " · hinting" : ""}
            </p>
            <h3>Tables</h3>
            <p>{inspectData.tables.join(", ") || "—"}</p>
            <h3>Unicode ranges</h3>
            <table className="data">
              <thead>
                <tr>
                  <th>Range</th>
                  <th>Supported</th>
                </tr>
              </thead>
              <tbody>
                {inspectData.unicodeRanges.map((r) => (
                  <tr key={r.name}>
                    <td>{r.name}</td>
                    <td>{r.supported ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inspectData.variableAxes && (
              <>
                <h3>Variable axes</h3>
                <table className="data">
                  <thead>
                    <tr>
                      <th>Tag</th>
                      <th>Min</th>
                      <th>Default</th>
                      <th>Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectData.variableAxes.map((ax) => (
                      <tr key={ax.tag}>
                        <td>{ax.tag}</td>
                        <td>{ax.min}</td>
                        <td>{ax.default}</td>
                        <td>{ax.max}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {inspectData.licenseHints.length > 0 && (
              <>
                <h3>License hints</h3>
                <ul>
                  {inspectData.licenseHints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        {tab === "subset" && (
          <div className="subset-panes">
            <div>
              <div className="field">
                <label htmlFor="subset-text">Subset by text</label>
                <textarea id="subset-text" rows={3} value={subsetText} onChange={(e) => setSubsetText(e.target.value)} />
              </div>
              <button type="button" className="btn" disabled={!buffer || loading} onClick={() => void runSubset("text")}>
                {loading ? <Loader2 size={16} className="spin" /> : null}
                Subset by text
              </button>
              <div className="field" style={{ marginTop: "1rem" }}>
                <label htmlFor="cps">Codepoints (hex)</label>
                <input id="cps" value={codepoints} onChange={(e) => setCodepoints(e.target.value)} />
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!buffer || loading}
                onClick={() => void runSubset("codepoints")}
              >
                Subset by codepoints
              </button>
              <div className="field" style={{ marginTop: "1rem" }}>
                <label htmlFor="preset">Unicode range</label>
                <select id="preset" value={unicodePreset} onChange={(e) => setUnicodePreset(e.target.value)}>
                  {Object.keys(UNICODE_PRESETS).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!buffer || loading}
                onClick={() => void runSubset("unicode-range")}
              >
                Subset by range
              </button>
              <div style={{ marginTop: "1rem" }}>
                <label>
                  <input type="checkbox" checked={dropHinting} onChange={(e) => setDropHinting(e.target.checked)} /> Drop
                  hinting
                </label>
                <br />
                <label>
                  <input type="checkbox" checked={dropLayout} onChange={(e) => setDropLayout(e.target.checked)} /> Drop layout
                  features
                </label>
              </div>
            </div>
            <div>
              {savings && <p className="badge">{savings}</p>}
              {subsetResult && (
                <div className="result-box">
                  <p>
                    {subsetResult.retainedGlyphs} glyphs retained · {formatBytes(subsetResult.sizeBytes)}
                  </p>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => downloadBytes(subsetResult.data, `subset.${subsetResult.format}`)}
                  >
                    <Download size={16} /> Download {subsetResult.format.toUpperCase()}
                  </button>
                </div>
              )}
              {!buffer && <p className="error">Upload a font to begin subsetting.</p>}
            </div>
          </div>
        )}

        {tab === "convert" && (
          <>
            <div className="field">
              <label htmlFor="target">Output format</label>
              <select id="target" value={convertTarget} onChange={(e) => setConvertTarget(e.target.value as typeof convertTarget)}>
                <option value="woff2">WOFF2</option>
                <option value="woff">WOFF</option>
                <option value="ttf">TTF</option>
                <option value="otf">OTF</option>
              </select>
            </div>
            <button type="button" className="btn" disabled={!buffer || loading} onClick={() => void runConvert()}>
              Convert &amp; download
            </button>
          </>
        )}

        {tab === "instance" && inspectData?.variableAxes && (
          <>
            {inspectData.variableAxes.map((ax) => (
              <div className="field" key={ax.tag}>
                <label>
                  {ax.tag}: {axisValues[ax.tag] ?? ax.default}
                </label>
                <input
                  type="range"
                  min={ax.min}
                  max={ax.max}
                  step={(ax.max - ax.min) / 100}
                  value={axisValues[ax.tag] ?? ax.default}
                  onChange={(e) => setAxisValues({ ...axisValues, [ax.tag]: Number(e.target.value) })}
                />
                <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  Named:{" "}
                  {ax.namedInstances.map((n) => n.name).join(", ") || "—"}
                </div>
              </div>
            ))}
            <button type="button" className="btn" disabled={!buffer || loading} onClick={() => void runInstance()}>
              Bake static instance
            </button>
            {subsetResult && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginLeft: "0.5rem" }}
                onClick={() => downloadBytes(subsetResult.data, "instance.woff2")}
              >
                <Download size={16} /> Download
              </button>
            )}
          </>
        )}
        {tab === "instance" && !inspectData?.variableAxes && (
          <p>Upload a variable font to use axis instancing.</p>
        )}

        {tab === "qa" && (
          <>
            <p>
              FontBakery QA runs on the optional server worker. Your font is only sent when you opt in below.
            </p>
            <label>
              <input type="checkbox" checked={qaOptIn} onChange={(e) => setQaOptIn(e.target.checked)} /> I opt in to
              server-side QA (file uploaded temporarily)
            </label>
            <br />
            <button type="button" className="btn" style={{ marginTop: "0.75rem" }} disabled={!file || !qaOptIn || loading} onClick={() => void runQa()}>
              Run QA
            </button>
            {qaReport && <pre className="result-box">{qaReport}</pre>}
          </>
        )}

        {tab === "specimen" && (
          <>
            <div className="field">
              <label htmlFor="specimen">Preview text</label>
              <input id="specimen" value={specimenText} onChange={(e) => setSpecimenText(e.target.value)} />
            </div>
            {subsetResult && (
              <style>{`@font-face { font-family: 'SpecimenFont'; src: url(${URL.createObjectURL(new Blob([new Uint8Array(subsetResult.data)]))}); }`}</style>
            )}
            <div
              style={{
                fontFamily: subsetResult ? "SpecimenFont, sans-serif" : "inherit",
                fontSize: "1.25rem",
                padding: "1rem",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            >
              {specimenText}
            </div>
            <div className="specimen-grid">
              {[8, 12, 16, 24, 32, 48, 64, 96].map((px) => (
                <div key={px} className="specimen-cell" style={{ fontSize: px, fontFamily: subsetResult ? "SpecimenFont" : "inherit" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{px}px</div>
                  {specimenText.slice(0, 24)}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: "1rem" }}
              disabled={!subsetResult}
              onClick={() => {
                const canvas = document.createElement("canvas");
                canvas.width = 800;
                canvas.height = 200;
                const ctx = canvas.getContext("2d")!;
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, 800, 200);
                ctx.fillStyle = "#000";
                ctx.font = "48px SpecimenFont, sans-serif";
                ctx.fillText(specimenText, 20, 100);
                canvas.toBlob((b) => {
                  if (!b) return;
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(b);
                  a.download = "specimen.png";
                  a.click();
                });
              }}
            >
              Export PNG specimen
            </button>
          </>
        )}
      </div>
    </main>
  );
}
