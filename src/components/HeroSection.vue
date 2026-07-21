<script setup>
import ThreeBackground from './ThreeBackground.vue'

defineProps({
  content: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['navigate'])
</script>

<template>
  <section id="home" class="panel hero-panel">
    <div class="panel-surface hero-surface">
      <ThreeBackground />

      <div class="hero-content page-width">
        <p class="hero-kicker">{{ content.kicker }}</p>
        <h1>{{ content.title }}<span>{{ content.titleAccent }}</span></h1>
        <p class="hero-lead">{{ content.lead }}</p>

        <div class="hero-actions">
          <a class="button primary" href="#contact" @click.prevent="emit('navigate', 'contact')">
            {{ content.discuss }} <span>↘</span>
          </a>
          <a class="text-link" href="#projects" @click.prevent="emit('navigate', 'projects')">
            {{ content.projects }}
          </a>
        </div>
      </div>

      <div class="scroll-note"><span></span>{{ content.scroll }}</div>
    </div>
  </section>
</template>
