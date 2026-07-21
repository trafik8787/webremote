<script setup>
import { onMounted, ref } from 'vue'

const loaded = ref(false)
const sceneSrc = ref()

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
})
</script>

<template>
  <div class="three-background" aria-hidden="true">
    <iframe
      :src="sceneSrc"
      title="WebRemote ocean background"
      tabindex="-1"
      @load="loaded = true"
    ></iframe>
    <div class="three-fallback" :class="{ hidden: loaded }">
      <span class="sun"></span>
      <span class="horizon"></span>
      <span class="water"></span>
    </div>
  </div>
</template>
