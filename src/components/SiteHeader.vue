<script setup>
import { ref } from 'vue'

const props = defineProps({
  locale: {
    type: String,
    required: true,
  },
  labels: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['navigate', 'change-locale'])
const menuOpen = ref(false)

const items = [
  { id: 'home', key: 'home' },
  { id: 'about', key: 'about' },
  { id: 'stack', key: 'stack' },
  { id: 'projects', key: 'projects' },
  { id: 'contact', key: 'contact' },
]

function navigate(id) {
  menuOpen.value = false
  emit('navigate', id)
}

function changeLocale(value) {
  emit('change-locale', value)
}
</script>

<template>
  <header class="site-header">
    <button class="brand" type="button" aria-label="WebRemote home" @click="navigate('home')">
      <span class="brand-mark">WR</span>
      <span class="brand-text">WebRemote</span>
    </button>

    <nav class="desktop-nav" aria-label="Main navigation">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        @click="navigate(item.id)"
      >
        {{ labels[item.key] }}
      </button>
    </nav>

    <div class="header-actions">
      <div class="language-switcher" aria-label="Language switcher">
        <button
          type="button"
          :class="{ active: props.locale === 'uk' }"
          @click="changeLocale('uk')"
        >UA</button>
        <span>/</span>
        <button
          type="button"
          :class="{ active: props.locale === 'en' }"
          @click="changeLocale('en')"
        >EN</button>
      </div>

      <button
        class="menu-toggle"
        :class="{ active: menuOpen }"
        type="button"
        :aria-expanded="menuOpen"
        aria-label="Toggle menu"
        @click="menuOpen = !menuOpen"
      >
        <span></span>
        <span></span>
      </button>
    </div>

    <Transition name="menu-fade">
      <nav v-if="menuOpen" class="mobile-nav" aria-label="Mobile navigation">
        <button
          v-for="(item, index) in items"
          :key="item.id"
          type="button"
          @click="navigate(item.id)"
        >
          <span>0{{ index + 1 }}</span>
          {{ labels[item.key] }}
        </button>
      </nav>
    </Transition>
  </header>
</template>
