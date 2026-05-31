/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORKER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "opentype.js";
declare module "pako";

declare module "hb-subset-wasm/hb-subset.wasm?url" {
  const url: string;
  export default url;
}
