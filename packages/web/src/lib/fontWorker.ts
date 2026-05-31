import type { FontInspect, SubsetOpts, SubsetResult, ConvertResult } from "@fontops/core";

export type WorkerRequest =
  | { type: "inspect"; buffer: ArrayBuffer }
  | { type: "subset"; buffer: ArrayBuffer; opts: SubsetOpts }
  | { type: "convert"; buffer: ArrayBuffer; target: "ttf" | "otf" | "woff" | "woff2" }
  | { type: "instance"; buffer: ArrayBuffer; axes: Record<string, number>; format?: "woff2" | "ttf" | "woff" };

export type WorkerResponse =
  | { type: "inspect"; result: FontInspect }
  | { type: "subset"; result: SubsetResult }
  | { type: "convert"; result: ConvertResult }
  | { type: "instance"; result: SubsetResult }
  | { type: "error"; message: string };

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("../workers/font.worker.ts", import.meta.url), {
      type: "module",
    });
  }
  return worker;
}

export function runFontJob<T extends WorkerResponse>(
  req: WorkerRequest,
  transfer?: Transferable[],
): Promise<T> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    const onMessage = (ev: MessageEvent<WorkerResponse>) => {
      w.removeEventListener("message", onMessage);
      if (ev.data.type === "error") reject(new Error(ev.data.message));
      else resolve(ev.data as T);
    };
    w.addEventListener("message", onMessage);
    w.postMessage(req, transfer ?? []);
  });
}

export function downloadBytes(data: Uint8Array, filename: string) {
  const blob = new Blob([new Uint8Array(data)], { type: "font/woff2" });
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
