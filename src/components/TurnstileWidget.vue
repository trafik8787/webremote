<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  siteKey: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'auto',
  },
})

const emit = defineEmits(['verified', 'expired', 'error'])

const container = ref(null)
let widgetId = null
let scriptPromise = null

function loadTurnstileScript() {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }

  if (scriptPromise) {
    return scriptPromise
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-turnstile-script]')

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.turnstile), { once: true })
      existingScript.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.turnstileScript = 'true'
    script.onload = () => resolve(window.turnstile)
    script.onerror = reject
    document.head.appendChild(script)
  })

  return scriptPromise
}

async function renderWidget() {
  await nextTick()

  if (!container.value || !props.siteKey) {
    return
  }

  try {
    const turnstile = await loadTurnstileScript()

    if (widgetId !== null) {
      turnstile.remove(widgetId)
    }

    widgetId = turnstile.render(container.value, {
      sitekey: props.siteKey,
      language: props.language,
      theme: 'dark',
      size: 'flexible',
      action: 'contact',
      callback: token => emit('verified', token),
      'expired-callback': () => emit('expired'),
      'timeout-callback': () => emit('expired'),
      'error-callback': errorCode => {
        emit('error', errorCode)
        return true
      },
    })
  } catch (error) {
    console.error('Unable to load Cloudflare Turnstile', error)
    emit('error', 'script-load-failed')
  }
}

function reset() {
  if (window.turnstile && widgetId !== null) {
    window.turnstile.reset(widgetId)
  }
}

defineExpose({ reset })

onMounted(renderWidget)

watch(
  () => props.language,
  () => renderWidget(),
)

onBeforeUnmount(() => {
  if (window.turnstile && widgetId !== null) {
    window.turnstile.remove(widgetId)
  }
})
</script>

<template>
  <div ref="container" class="turnstile-widget" aria-label="Cloudflare security verification"></div>
</template>
