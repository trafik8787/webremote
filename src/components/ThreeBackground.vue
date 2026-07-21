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
  loaded.value = true
  updateSceneActivity()
}

onMounted(() => {
  const loadScene = () => {
    const schedule = window.requestIdleCallback ?? ((callback) => window.setTimeout(callback, 1))
    schedule(() => {
      sceneSrc.value = '/three/scene.html'
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
})

onBeforeUnmount(() => {
  visibilityObserver?.disconnect()
  document.removeEventListener('visibilitychange', updateSceneActivity)
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
