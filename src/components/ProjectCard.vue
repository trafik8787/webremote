<script setup>
defineProps({
  number: String,
  title: String,
  description: String,
  tags: Array,
  eyebrow: { type: String, default: 'Selected project' },
  openLabel: { type: String, default: 'Open project' },
  href: { type: String, default: '#' },
})
</script>

<template>
  <article class="project-card">
    <div class="project-index">{{ number }}</div>
    <div class="project-copy"><p class="eyebrow">{{ eyebrow }}</p><h3>{{ title }}</h3><p>{{ description }}</p><ul><li v-for="tag in tags" :key="tag">{{ tag }}</li></ul></div>
    <a :href="href" class="project-arrow" :aria-label="openLabel">↗</a>
  </article>
</template>
