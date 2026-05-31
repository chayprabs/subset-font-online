import { decompress as woff2Decompress, compress as woff2Compress } from "woff2-encoder";
import { inflate, deflate } from "pako";
import type { FontFormat } from "./types.js";

export function detectFormat(buffer: ArrayBuffer): FontFormat {
  const view = new DataView(buffer);
  if (buffer.byteLength < 4) throw new Error("File too small to be a font");
  const sig = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  );
  if (sig === "wOFF") return "woff";
  if (sig === "wOF2") return "woff2";
  if (sig === "OTTO") return "otf";
  if (sig === "true" || sig === "\0\x01\0\0") return "ttf";
  throw new Error(`Unsupported font signature: ${sig}`);
}

export async function toSfnt(buffer: ArrayBuffer): Promise<Uint8Array> {
  const format = detectFormat(buffer);
  if (format === "woff2") {
    return new Uint8Array(await woff2Decompress(new Uint8Array(buffer)));
  }
  if (format === "woff") {
    return decodeWoff(new Uint8Array(buffer));
  }
  return new Uint8Array(buffer);
}

export async function fromSfnt(
  sfnt: Uint8Array,
  target: FontFormat,
): Promise<Uint8Array> {
  if (target === "ttf" || target === "otf") return sfnt;
  if (target === "woff2") {
    return new Uint8Array(await woff2Compress(sfnt));
  }
  if (target === "woff") {
    return encodeWoff(sfnt);
  }
  throw new Error("TTX export requires the server worker endpoint /v1/ttx");
}

function decodeWoff(data: Uint8Array): Uint8Array {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (data.byteLength < 44) throw new Error("Invalid WOFF file");
  const numTables = view.getUint16(12);
  const totalSfntSize = view.getUint32(16);
  const out = new Uint8Array(totalSfntSize);
  const outView = new DataView(out.buffer);
  out.set(data.subarray(0, 12));
  outView.setUint32(8, numTables * 16 + 12);
  let sfntOffset = 12 + numTables * 16;
  for (let i = 0; i < numTables; i++) {
    const entry = 44 + i * 20;
    const tag = data.subarray(entry, entry + 4);
    const checksum = view.getUint32(entry + 4);
    const compLen = view.getUint32(entry + 8);
    const origLen = view.getUint32(entry + 12);
    const compOffset = view.getUint32(entry + 16);
    out.set(tag, 12 + i * 16);
    outView.setUint32(12 + i * 16 + 4, checksum);
    outView.setUint32(12 + i * 16 + 8, sfntOffset);
    outView.setUint32(12 + i * 16 + 12, origLen);
    const comp = data.subarray(compOffset, compOffset + compLen);
    const tableData =
      compLen < origLen ? inflate(comp) : comp.subarray(0, origLen);
    out.set(tableData.subarray(0, origLen), sfntOffset);
    sfntOffset += (origLen + 3) & ~3;
  }
  return out;
}

function encodeWoff(sfnt: Uint8Array): Uint8Array {
  const view = new DataView(sfnt.buffer, sfnt.byteOffset, sfnt.byteLength);
  const numTables = view.getUint16(4);
  const entries: {
    tag: Uint8Array;
    checksum: number;
    orig: Uint8Array;
    compressed: Uint8Array;
    compLen: number;
  }[] = [];

  for (let i = 0; i < numTables; i++) {
    const off = 12 + i * 16;
    const tag = sfnt.subarray(off, off + 4);
    const checksum = view.getUint32(off + 4);
    const offset = view.getUint32(off + 8);
    const length = view.getUint32(off + 12);
    const orig = sfnt.subarray(offset, offset + length);
    const compressed = deflate(orig);
    const useCompressed = compressed.length < orig.length;
    entries.push({
      tag,
      checksum,
      orig,
      compressed: useCompressed ? compressed : orig,
      compLen: useCompressed ? compressed.length : orig.length,
    });
  }

  const headerSize = 44 + numTables * 20;
  let totalSize = headerSize;
  for (const e of entries) totalSize += (e.compLen + 3) & ~3;

  const out = new Uint8Array(totalSize);
  const outView = new DataView(out.buffer);
  out.set(new TextEncoder().encode("wOFF"));
  outView.setUint32(4, sfnt.byteLength);
  outView.setUint16(12, numTables);
  outView.setUint32(16, sfnt.byteLength);

  let dataOffset = headerSize;
  let entryOffset = 44;
  for (const e of entries) {
    out.set(e.tag, entryOffset);
    outView.setUint32(entryOffset + 4, e.checksum);
    outView.setUint32(entryOffset + 8, e.compLen);
    outView.setUint32(entryOffset + 12, e.orig.length);
    outView.setUint32(entryOffset + 16, dataOffset);
    out.set(e.compressed.subarray(0, e.compLen), dataOffset);
    dataOffset += (e.compLen + 3) & ~3;
    entryOffset += 20;
  }
  return out;
}

export async function sha256Hex(data: Uint8Array): Promise<string> {
  const copy = data.slice();
  const hash = await crypto.subtle.digest("SHA-256", copy.buffer);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
