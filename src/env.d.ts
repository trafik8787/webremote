/// <reference types="vite/client" />

declare const __SCENE_VERSION__: string

interface ImportMetaEnv {
  readonly TURNSTILE_SITE_KEY?: string
  readonly CONTACT_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
