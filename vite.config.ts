import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    transformIndexHtml: {
      order: 'post',
      handler(html, context) {
        if (!context.bundle) return html

        for (const [bundleKey, output] of Object.entries(context.bundle)) {
          if (output.type !== 'asset' || !output.fileName.endsWith('.css')) continue

          const css = typeof output.source === 'string'
            ? output.source
            : new TextDecoder().decode(output.source)
          const stylesheet = new RegExp(
            `<link[^>]+href=["']/${output.fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`,
          )

          html = html.replace(stylesheet, `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`)
          delete context.bundle[bundleKey]
        }

        return html
      },
    },
  }
}

export default defineConfig({
  plugins: [vue(), inlineCss()],
  base: '/',
  envPrefix: ['VITE_', 'TURNSTILE_SITE_KEY', 'CONTACT_API_URL'],
})
