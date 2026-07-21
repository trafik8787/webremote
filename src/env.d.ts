/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly TURNSTILE_SITE_KEY?: string
  readonly CONTACT_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
