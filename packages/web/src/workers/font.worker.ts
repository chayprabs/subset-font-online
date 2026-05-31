import { init, subset as hbSubset } from "hb-subset-wasm";
import wasmUrl from "hb-subset-wasm/hb-subset.wasm?url";
import {
  inspect,
  subset,
  convert,
  instance,
  registerHbSubset,
  registerHbSubsetForInstance,
} from "@fontops/core";
import type { WorkerJob, WorkerResponse } from "../lib/fontWorker";

let ready: Promise<void> | null = null;

function ensureHb(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const res = await fetch(wasmUrl);
      await init(await res.arrayBuffer());
      const fn = (font: Uint8Array, options: Record<string, unknown>) =>
        hbSubset(font, options as Parameters<typeof hbSubset>[1]);
      registerHbSubset(fn);
      registerHbSubsetForInstance(fn);
    })();
  }
  return ready;
}

self.onmessage = async (ev: MessageEvent<WorkerJob & { id: number }>) => {
  const id = ev.data.id;
  try {
    await ensureHb();
    const msg = ev.data;
    let response: WorkerResponse;
    switch (msg.type) {
      case "inspect": {
        const result = await inspect(msg.buffer);
        response = { id, type: "inspect", result };
        break;
      }
      case "subset": {
        const result = await subset(msg.buffer, msg.opts);
        response = { id, type: "subset", result };
        break;
      }
      case "convert": {
        const result = await convert(msg.buffer, msg.target);
        response = { id, type: "convert", result };
        break;
      }
      case "instance": {
        const result = await instance(msg.buffer, msg.axes, msg.format ?? "woff2");
        response = { id, type: "instance", result };
        break;
      }
      default:
        throw new Error("Unknown worker request");
    }
    const transfer: Transferable[] = [];
    if ("result" in response && response.result && "data" in response.result) {
      const { data } = response.result as { data: Uint8Array };
      const copy = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      transfer.push(copy);
      (response.result as { data: Uint8Array }).data = new Uint8Array(copy);
    }
    (self as DedicatedWorkerGlobalScope).postMessage(response, transfer);
  } catch (e) {
    self.postMessage({
      id,
      type: "error",
      message: e instanceof Error ? e.message : String(e),
    });
  }
};
