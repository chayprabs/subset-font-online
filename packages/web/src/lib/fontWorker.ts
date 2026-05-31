import type { FontInspect, SubsetOpts, SubsetResult, ConvertResult } from "@fontops/core";

let jobId = 0;
let worker: Worker | null = null;

export type WorkerJob =
  | { type: "inspect"; buffer: ArrayBuffer }
  | { type: "subset"; buffer: ArrayBuffer; opts: SubsetOpts }
  | { type: "convert"; buffer: ArrayBuffer; target: "ttf" | "otf" | "woff" | "woff2"; basename?: string }
  | { type: "instance"; buffer: ArrayBuffer; axes: Record<string, number>; format?: "woff2" | "ttf" | "woff" };

export type WorkerRequest = WorkerJob & { id: number };

export type WorkerResponse =
  | { id: number; type: "inspect"; result: FontInspect }
  | { id: number; type: "subset"; result: SubsetResult }
  | { id: number; type: "convert"; result: ConvertResult }
  | { id: number; type: "instance"; result: SubsetResult }
  | { id: number; type: "error"; message: string };

const pending = new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("../workers/font.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.addEventListener("message", (ev: MessageEvent<WorkerResponse>) => {
      const data = ev.data;
      const job = pending.get(data.id);
      if (!job) return;
      pending.delete(data.id);
      if (data.type === "error") job.reject(new Error(data.message));
      else job.resolve(data);
    });
  }
  return worker;
}

export function runFontJob<T extends WorkerResponse>(
  req: WorkerJob,
  transfer?: Transferable[],
): Promise<T> {
  const id = ++jobId;
  return new Promise((resolve, reject) => {
    pending.set(id, {
      resolve: (v) => resolve(v as T),
      reject,
    });
    getWorker().postMessage({ ...req, id }, transfer ?? []);
  });
}

const MIME: Record<string, string> = {
  woff2: "font/woff2",
  woff: "font/woff",
  ttf: "font/ttf",
  otf: "font/otf",
};

export function downloadBytes(data: Uint8Array, filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "woff2";
  const blob = new Blob([new Uint8Array(data)], { type: MIME[ext] ?? "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
