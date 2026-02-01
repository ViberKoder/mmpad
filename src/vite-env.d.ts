/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TONAPI_TOKEN?: string
  readonly VITE_TONFUN_API_ENDPOINT?: string
  readonly VITE_MASTER_ADDRESS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
