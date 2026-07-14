<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  locale: { type: String, required: true },
  labels: { type: Object, required: true },
})
const emit = defineEmits(['navigate', 'change-locale'])
const open = ref(false)

const links = computed(() => [
  { id: 'home', label: props.labels.home },
  { id: 'about', label: props.labels.about },
  { id: 'stack', label: props.labels.stack },
  { id: 'projects', label: props.labels.projects },
  { id: 'contact', label: props.labels.contact },
])

function goTo(id) {
  open.value = false
  emit('navigate', id)
}
</script>

<template>
  <header class="site-header">
    <button class="brand" type="button" @click="goTo('home')" :aria-label="labels.home">
      <span class="brand-mark">VZ</span><span class="brand-text">Vitaliy Z.</span>
    </button>

    <div class="header-actions">
      <div class="language-switcher" aria-label="Language switcher">
        <button type="button" :class="{ active: locale === 'uk' }" @click="emit('change-locale', 'uk')">UA</button>
        <span>/</span>
        <button type="button" :class="{ active: locale === 'en' }" @click="emit('change-locale', 'en')">EN</button>
      </div>

      <nav class="desktop-nav" aria-label="Main navigation">
        <button v-for="link in links" :key="link.id" type="button" @click="goTo(link.id)">{{ link.label }}</button>
      </nav>

      <button class="menu-toggle" type="button" :class="{ active: open }" @click="open = !open" aria-label="Menu"><span></span><span></span></button>
    </div>

    <Transition name="menu-fade">
      <nav v-if="open" class="mobile-nav" aria-label="Mobile navigation">
        <button v-for="(link,index) in links" :key="link.id" type="button" @click="goTo(link.id)"><span>0{{ index + 1 }}</span>{{ link.label }}</button>
      </nav>
    </Transition>
  </header>
</template>
