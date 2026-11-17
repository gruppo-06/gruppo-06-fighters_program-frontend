interface ImportMetaEnv {
  /** Address of the backend, e.g. `http://localhost:8080`. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
