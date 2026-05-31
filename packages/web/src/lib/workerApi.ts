import type { QAReport } from "@fontops/core";

const base = () => import.meta.env.VITE_WORKER_URL ?? "";

export async function runWorkerQa(file: File, profile = "googlefonts"): Promise<QAReport> {
  const form = new FormData();
  form.append("file", file);
  form.append("profile", profile);
  const res = await fetch(`${base()}/v1/qa`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`QA failed: ${res.status}`);
  return res.json() as Promise<QAReport>;
}

export async function exportTtx(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${base()}/v1/ttx`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`TTX export failed: ${res.status}`);
  return res.text();
}

export interface ServerShapingItem {
  id: string;
  label: string;
  text: string;
  status: "PASS" | "FAIL" | "WARN" | "SKIP";
  message: string;
}

export async function runServerShaping(file: File): Promise<ServerShapingItem[]> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${base()}/v1/shaping`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Shaping check failed: ${res.status}`);
  return res.json() as Promise<ServerShapingItem[]>;
}
