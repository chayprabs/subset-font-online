import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import JSZip from "jszip";
import type { FontInspect, QAReport, SubsetResult } from "@fontops/core";
import { LANGUAGE_PACKS, UNICODE_PRESETS, parseCodepointList } from "@fontops/core";
import { runShapingSmokeTest } from "../lib/shaping-browser";
import { downloadBytes, formatBytes, runFontJob } from "../lib/fontWorker";
import { exportTtx, runServerShaping, runWorkerQa } from "../lib/workerApi";
import { useDebouncedEffect } from "../hooks/useDebouncedEffect";

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
  { name: "Inter", url: "/samples/Inter-Regular.woff2" },
  { name: "Inter Variable", url: "/samples/Inter-Variable.woff2" },
  { name: "Noto Sans", url: "/samples/NotoSans-Regular.woff2" },
  { name: "Source Code Pro", url: "/samples/SourceCodePro-Regular.woff2" },
];

const BATCH_FORMATS = ["woff2", "woff", "ttf"] as const;

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("subset");
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [inspectData, setInspectData] = useState<FontInspect | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [subsetText, setSubsetText] = useState("Hello  ");
  const [codepoints, setCodepoints] = useState("48 65 6c 6c 6f");
  const [glyphIds, setGlyphIds] = useState("0 1 2");
  const [unicodePreset, setUnicodePreset] = useState("Latin");
  const [languagePack, setLanguagePack] = useState("CJK Common");
  const [dropHinting, setDropHinting] = useState(false);
  const [dropLayout, setDropLayout] = useState(false);
  const [convertTarget, setConvertTarget] = useState<"woff2" | "woff" | "ttf" | "otf">("woff2");
  const [batchFormats, setBatchFormats] = useState<string[]>(["woff2", "woff", "ttf"]);
  const [axisValues, setAxisValues] = useState<Record<string, number>>({ wght: 600 });
  const [subsetResult, setSubsetResult] = useState<SubsetResult | null>(null);
  const [instanceResult, setInstanceResult] = useState<SubsetResult | null>(null);
  const [liveEstimate, setLiveEstimate] = useState<string | null>(null);
  const [specimenFontUrl, setSpecimenFontUrl] = useState<string | null>(null);
  const [specimenText, setSpecimenText] = useState("The quick brown fox jumps over the lazy dog.");
  const [fontUrl, setFontUrl] = useState("");
  const [googleCssUrl, setGoogleCssUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qaOptIn, setQaOptIn] = useState(false);
  const [qaProfile, setQaProfile] = useState("googlefonts");
  const [qaReport, setQaReport] = useState<QAReport | null>(null);
  const [shapingResults, setShapingResults] = useState<Awaited<ReturnType<typeof runShapingSmokeTest>> | null>(null);
  const [serverShaping, setServerShaping] = useState<Awaited<ReturnType<typeof runServerShaping>> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadBuffer = useCallback(async (f: File) => {
    setError(null);
    setFile(f);
    const buf = await f.arrayBuffer();
    setBuffer(buf);
    setSubsetResult(null);
    setInstanceResult(null);
    setLiveEstimate(null);
    setInspectData(null);
    setQaReport(null);
    setShapingResults(null);
    setServerShaping(null);
    try {
      setLoading(true);
      const inspectBuf = buf.slice(0);
      const res = await runFontJob<{ id: number; type: "inspect"; result: FontInspect }>(
        { type: "inspect", buffer: inspectBuf },
        [inspectBuf],
      );
      if (res.type === "inspect") {
        setInspectData(res.result);
        if (res.result.variableAxes?.length) {
          const axes: Record<string, number> = {};
          for (const ax of res.result.variableAxes) {
            axes[ax.tag] = ax.default;
          }
          setAxisValues(axes);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useDebouncedEffect(() => {
    if (!buffer || !subsetText.trim()) {
      setLiveEstimate(null);
      return;
    }
    void (async () => {
      try {
        const buf = buffer.slice(0);
        const res = await runFontJob<{ id: number; type: "subset"; result: SubsetResult }>(
          {
            type: "subset",
            buffer: buf,
            opts: {
              mode: "text",
              text: subsetText,
              dropHinting,
              dropLayoutFeatures: dropLayout,
              outputFormat: "woff2",
            },
          },
          [buf],
        );
        if (res.type === "subset" && file) {
          setLiveEstimate(
            `Live estimate: ${formatBytes(file.size)} → ${formatBytes(res.result.sizeBytes)}`,
          );
        }
      } catch {
        setLiveEstimate(null);
      }
    })();
  }, [subsetText, buffer, dropHinting, dropLayout, file], 450);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) void loadBuffer(f);
    },
    [loadBuffer],
  );

  const runSubset = async (
    mode: "text" | "codepoints" | "unicode-range" | "language-pack" | "glyph-ids",
  ) => {
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
            codepoints: mode === "codepoints" ? parseCodepointList(codepoints) : undefined,
            unicodeRange: mode === "unicode-range" ? unicodePreset : undefined,
            languagePack: mode === "language-pack" ? languagePack : undefined,
            glyphIds:
              mode === "glyph-ids"
                ? glyphIds.split(/[\s,]+/).map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n))
                : undefined,
            dropHinting,
            dropLayoutFeatures: dropLayout,
            outputFormat: "woff2",
          },
        },
        [buf],
      );
      if (res.type === "subset") setSubsetResult(res.result);
      else throw new Error(`Unexpected response: ${(res as { type: string }).type}`);
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
      } else throw new Error(`Unexpected response`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const runBatchConvert = async () => {
    if (!buffer) return;
    setLoading(true);
    setError(null);
    try {
      const zip = new JSZip();
      const base = (file?.name ?? "font").replace(/\.[^.]+$/, "");
      for (const fmt of batchFormats) {
        const buf = buffer.slice(0);
        const res = await runFontJob(
          { type: "convert", buffer: buf, target: fmt as "woff2" | "woff" | "ttf" },
          [buf],
        );
        if (res.type === "convert") {
          zip.file(`${base}.${fmt}`, res.result.data);
        }
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${base}-formats.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const runTtxExport = async () => {
    if (!file || !qaOptIn) {
      setError("TTX export uses the worker — opt in to server processing below.");
      return;
    }
    setLoading(true);
    try {
      const xml = await exportTtx(file);
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.[^.]+$/, "")}.ttx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const runInstance = async () => {
    if (!buffer || !inspectData?.variableAxes?.length) return;
    setLoading(true);
    setError(null);
    try {
      const buf = buffer.slice(0);
      const axes = Object.fromEntries(
        inspectData.variableAxes.map((ax) => [
          ax.tag,
          Math.min(ax.max, Math.max(ax.min, axisValues[ax.tag] ?? ax.default)),
        ]),
      );
      const res = await runFontJob(
        { type: "instance", buffer: buf, axes, format: "woff2" },
        [buf],
      );
      if (res.type === "instance") setInstanceResult(res.result);
      else throw new Error(`Unexpected response`);
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
      const report = await runWorkerQa(file, qaProfile);
      setQaReport(report);
      const shaping = await runServerShaping(file);
      setServerShaping(shaping);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const runBrowserShaping = async () => {
    if (!specimenFontUrl) return;
    setLoading(true);
    try {
      const results = await runShapingSmokeTest("SpecimenFont", specimenFontUrl);
      setShapingResults(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (url: string) => {
    void fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Sample fetch failed: ${r.status}`);
        return r.arrayBuffer();
      })
      .then((b) => loadBuffer(new File([b], url.split("/").pop()!)))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  };

  const loadFromUrl = async () => {
    if (!fontUrl.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(fontUrl);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const buf = await res.arrayBuffer();
      await loadBuffer(new File([buf], fontUrl.split("/").pop() ?? "font.woff2"));
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
      if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
      const buf = await res.arrayBuffer();
      await loadBuffer(new File([buf], "google-font.woff2"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem("fontops-history");
    setError(null);
    alert("Local history cleared.");
  };

  const previewFont = subsetResult ?? instanceResult;

  useEffect(() => {
    if (!previewFont) {
      setSpecimenFontUrl(null);
      return;
    }
    const url = URL.createObjectURL(new Blob([new Uint8Array(previewFont.data)]));
    setSpecimenFontUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [previewFont]);

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
            <input id="gfonts" value={googleCssUrl} onChange={(e) => setGoogleCssUrl(e.target.value)} placeholder="https://fonts.googleapis.com/css2?…" />
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
            <button key={s.name} type="button" className="btn btn-secondary" onClick={() => loadSample(s.url)} disabled={loading}>
              {s.name}
            </button>
          ))}
          <button type="button" className="btn btn-secondary" onClick={clearHistory}>
            Clear local history
          </button>
        </div>
      </div>

      <nav className="tabs" aria-label="Tool sections">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
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
        {tab === "inspect" && !buffer && <p>Upload a font to inspect tables and coverage.</p>}
        {tab === "inspect" && inspectData && (
          <>
            <label>
              <input type="checkbox" checked={showJson} onChange={(e) => setShowJson(e.target.checked)} /> Show raw JSON
            </label>
            {showJson ? (
              <pre className="result-box">{JSON.stringify(inspectData, null, 2)}</pre>
            ) : (
              <>
                <p>
                  <span className="badge">{inspectData.format.toUpperCase()}</span> {inspectData.numGlyphs} glyphs ·{" "}
                  {formatBytes(inspectData.sizeBytes)}
                  {inspectData.hinting ? " · hinting" : ""}
                </p>
                <h3>Tables</h3>
                <p>{inspectData.tables.join(", ") || "—"}</p>
                <h3>OpenType features</h3>
                <p>{inspectData.features.join(", ") || "—"}</p>
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
                {inspectData.names.length > 0 && (
                  <>
                    <h3>Naming records</h3>
                    <table className="data">
                      <thead>
                        <tr>
                          <th>Name ID</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inspectData.names.slice(0, 20).map((n, i) => (
                          <tr key={i}>
                            <td>{n.nameId}</td>
                            <td>{n.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
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
                {inspectData.namedInstances && inspectData.namedInstances.length > 0 && (
                  <>
                    <h3>Named instances</h3>
                    <ul>
                      {inspectData.namedInstances.map((inst) => (
                        <li key={inst.name}>
                          {inst.name}: {JSON.stringify(inst.values)}
                        </li>
                      ))}
                    </ul>
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
          </>
        )}

        {tab === "subset" && (
          <div className="subset-panes">
            <div>
              <div className="field">
                <label htmlFor="subset-text">Subset by text</label>
                <textarea id="subset-text" rows={3} value={subsetText} onChange={(e) => setSubsetText(e.target.value)} />
              </div>
              {liveEstimate && <p className="badge">{liveEstimate}</p>}
              <button type="button" className="btn" disabled={!buffer || loading} onClick={() => void runSubset("text")}>
                Subset by text
              </button>
              <div className="field" style={{ marginTop: "1rem" }}>
                <label htmlFor="cps">Codepoints (hex, ranges U+41-5A)</label>
                <input id="cps" value={codepoints} onChange={(e) => setCodepoints(e.target.value)} />
              </div>
              <button type="button" className="btn btn-secondary" disabled={!buffer || loading} onClick={() => void runSubset("codepoints")}>
                Subset by codepoints
              </button>
              <div className="field" style={{ marginTop: "1rem" }}>
                <label htmlFor="glyph-ids">Glyph IDs</label>
                <input id="glyph-ids" value={glyphIds} onChange={(e) => setGlyphIds(e.target.value)} />
              </div>
              <button type="button" className="btn btn-secondary" disabled={!buffer || loading} onClick={() => void runSubset("glyph-ids")}>
                Subset by glyph IDs
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
              <button type="button" className="btn btn-secondary" disabled={!buffer || loading} onClick={() => void runSubset("unicode-range")}>
                Subset by range
              </button>
              <div className="field" style={{ marginTop: "1rem" }}>
                <label htmlFor="lang-pack">Language pack</label>
                <select id="lang-pack" value={languagePack} onChange={(e) => setLanguagePack(e.target.value)}>
                  {Object.keys(LANGUAGE_PACKS).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" className="btn btn-secondary" disabled={!buffer || loading} onClick={() => void runSubset("language-pack")}>
                Subset CJK common pack
              </button>
              <div style={{ marginTop: "1rem" }}>
                <label>
                  <input type="checkbox" checked={dropHinting} onChange={(e) => setDropHinting(e.target.checked)} /> Drop hinting
                </label>
                <br />
                <label>
                  <input type="checkbox" checked={dropLayout} onChange={(e) => setDropLayout(e.target.checked)} /> Drop layout features
                </label>
              </div>
            </div>
            <div>
              {savings && <p className="badge">{savings}</p>}
              {subsetResult && (
                <div className="result-box">
                  <p>
                    {subsetResult.retainedGlyphs} glyphs · {formatBytes(subsetResult.sizeBytes)} · sha256{" "}
                    {subsetResult.sha256.slice(0, 12)}…
                  </p>
                  <button type="button" className="btn" onClick={() => downloadBytes(subsetResult.data, `subset.${subsetResult.format}`)}>
                    <Download size={16} /> Download {subsetResult.format.toUpperCase()}
                  </button>
                </div>
              )}
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
                <option value="otf">OTF (same tables)</option>
              </select>
            </div>
            <button type="button" className="btn" disabled={!buffer || loading} onClick={() => void runConvert()}>
              Convert &amp; download
            </button>
            <h3 style={{ marginTop: "1.25rem" }}>Batch export</h3>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {BATCH_FORMATS.map((fmt) => (
                <label key={fmt}>
                  <input
                    type="checkbox"
                    checked={batchFormats.includes(fmt)}
                    onChange={(e) => {
                      setBatchFormats((prev) =>
                        e.target.checked ? [...prev, fmt] : prev.filter((f) => f !== fmt),
                      );
                    }}
                  />{" "}
                  {fmt.toUpperCase()}
                </label>
              ))}
            </div>
            <button type="button" className="btn btn-secondary" style={{ marginTop: "0.5rem" }} disabled={!buffer || loading || !batchFormats.length} onClick={() => void runBatchConvert()}>
              Download ZIP (batch)
            </button>
            <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--muted)" }}>
              TTX/XML export runs on the optional worker (opt in under QA tab).
            </p>
            <button type="button" className="btn btn-secondary" disabled={!file || loading} onClick={() => void runTtxExport()}>
              Export TTX (worker)
            </button>
          </>
        )}

        {tab === "instance" && inspectData?.variableAxes && (
          <>
            {inspectData.namedInstances && inspectData.namedInstances.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <strong>Named instances:</strong>{" "}
                {inspectData.namedInstances.map((inst) => (
                  <button
                    key={inst.name}
                    type="button"
                    className="btn btn-secondary"
                    style={{ margin: "0.25rem" }}
                    onClick={() => setAxisValues({ ...inst.values })}
                  >
                    {inst.name}
                  </button>
                ))}
              </div>
            )}
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
              </div>
            ))}
            <button type="button" className="btn" disabled={!buffer || loading} onClick={() => void runInstance()}>
              Bake static instance (WOFF2)
            </button>
            {instanceResult && (
              <button type="button" className="btn btn-secondary" style={{ marginLeft: "0.5rem" }} onClick={() => downloadBytes(instanceResult.data, "instance.woff2")}>
                <Download size={16} /> Download
              </button>
            )}
          </>
        )}
        {tab === "instance" && !inspectData?.variableAxes && <p>Upload a variable font (e.g. Inter Variable sample).</p>}

        {tab === "qa" && (
          <>
            <p>Server processing is opt-in. Files are ephemeral and not logged.</p>
            <label>
              <input type="checkbox" checked={qaOptIn} onChange={(e) => setQaOptIn(e.target.checked)} /> Opt in to server-side QA / TTX
            </label>
            <div className="field" style={{ marginTop: "0.75rem" }}>
              <label htmlFor="profile">FontBakery profile</label>
              <select id="profile" value={qaProfile} onChange={(e) => setQaProfile(e.target.value)}>
                <option value="googlefonts">Google Fonts</option>
                <option value="universal">Universal</option>
              </select>
            </div>
            <button type="button" className="btn" style={{ marginTop: "0.5rem" }} disabled={!file || !qaOptIn || loading} onClick={() => void runQa()}>
              Run QA + cmap shaping
            </button>
            {qaReport && (
              <table className="data" style={{ marginTop: "1rem" }}>
                <thead>
                  <tr>
                    <th>Check</th>
                    <th>Status</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {qaReport.checks.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.status}</td>
                      <td>{c.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {serverShaping && (
              <>
                <h3>Server cmap shaping</h3>
                <table className="data">
                  <thead>
                    <tr>
                      <th>Script</th>
                      <th>Status</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serverShaping.map((s) => (
                      <tr key={s.id}>
                        <td>{s.label}</td>
                        <td>{s.status}</td>
                        <td>{s.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}

        {tab === "specimen" && (
          <>
            <div className="field">
              <label htmlFor="specimen">Preview text</label>
              <input id="specimen" value={specimenText} onChange={(e) => setSpecimenText(e.target.value)} />
            </div>
            {specimenFontUrl && <style>{`@font-face { font-family: 'SpecimenFont'; src: url('${specimenFontUrl}'); }`}</style>}
            <div style={{ fontFamily: specimenFontUrl ? "SpecimenFont, sans-serif" : "inherit", fontSize: "1.25rem", padding: "1rem", border: "1px solid var(--border)", borderRadius: 8 }}>
              {specimenText}
            </div>
            <div className="specimen-grid">
              {[8, 12, 16, 24, 32, 48, 64, 96].map((px) => (
                <div key={px} className="specimen-cell" style={{ fontSize: px, fontFamily: specimenFontUrl ? "SpecimenFont" : "inherit" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{px}px</div>
                  {specimenText.slice(0, 24)}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-secondary" disabled={!previewFont} onClick={() => void runBrowserShaping()}>
                Browser shaping smoke test
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!previewFont}
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
                    const url = URL.createObjectURL(b);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "specimen.png";
                    a.click();
                    URL.revokeObjectURL(url);
                  });
                }}
              >
                Export PNG
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!previewFont || !specimenFontUrl}
                onClick={() => {
                  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200"><text x="20" y="100" font-size="48" font-family="SpecimenFont">${specimenText.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text></svg>`;
                  const blob = new Blob([svg], { type: "image/svg+xml" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "specimen.svg";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export SVG
              </button>
            </div>
            {shapingResults && (
              <table className="data" style={{ marginTop: "1rem" }}>
                <thead>
                  <tr>
                    <th>Script</th>
                    <th>Status</th>
                    <th>Width</th>
                  </tr>
                </thead>
                <tbody>
                  {shapingResults.map((r) => (
                    <tr key={r.id}>
                      <td>{r.label}</td>
                      <td>{r.status}</td>
                      <td>{r.width.toFixed(1)}px</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </main>
  );
}
