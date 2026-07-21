<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const loaded = ref(false)
const sceneSrc = ref()
const sceneFrame = ref()
const sceneContainer = ref()
let sceneVisible = true
let visibilityObserver

function updateSceneActivity() {
  sceneFrame.value?.contentWindow?.postMessage({
    type: 'webremote-scene-visibility',
    active: sceneVisible && !document.hidden,
  }, window.location.origin)
}

function handleSceneLoad() {
  updateSceneActivity()
}

function handleSceneMessage(event) {
  if (event.origin !== window.location.origin) return
  if (event.source !== sceneFrame.value?.contentWindow) return

  if (event.data?.type === 'webremote-scene-ready') {
    loaded.value = true
  } else if (event.data?.type === 'webremote-scene-error') {
    loaded.value = false
    sceneSrc.value = undefined
  }
}

onMounted(() => {
  const loadScene = () => {
    const schedule = window.requestIdleCallback ?? ((callback) => window.setTimeout(callback, 1))
    schedule(() => {
      sceneSrc.value = `/three/scene.html?v=${__SCENE_VERSION__}`
    })
  }

  if (document.readyState === 'complete') {
    loadScene()
  } else {
    window.addEventListener('load', loadScene, { once: true })
  }

  if ('IntersectionObserver' in window) {
    visibilityObserver = new IntersectionObserver(([entry]) => {
      sceneVisible = Boolean(entry?.isIntersecting)
      updateSceneActivity()
    }, { threshold: 0.01 })
    visibilityObserver.observe(sceneContainer.value)
  }

  document.addEventListener('visibilitychange', updateSceneActivity)
  window.addEventListener('message', handleSceneMessage)
})

onBeforeUnmount(() => {
  visibilityObserver?.disconnect()
  document.removeEventListener('visibilitychange', updateSceneActivity)
  window.removeEventListener('message', handleSceneMessage)
})
</script>

<template>
  <div ref="sceneContainer" class="three-background" aria-hidden="true">
    <iframe
      v-if="sceneSrc"
      ref="sceneFrame"
      :src="sceneSrc"
      title="WebRemote ocean background"
      tabindex="-1"
      @load="handleSceneLoad"
    ></iframe>
    <div class="three-fallback" :class="{ hidden: loaded }">
      <span class="sun"></span>
      <span class="horizon"></span>
      <span class="water"></span>
    </div>
  </div>
</template>
