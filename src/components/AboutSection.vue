<script setup>
defineProps({
  content: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section id="about" class="panel light-panel about-panel">
    <div class="panel-surface">
      <div class="panel-inner page-width section-grid">
        <div>
          <p class="section-number">{{ content.number }}</p>
          <h2>{{ content.title }}</h2>
        </div>

        <div class="about-copy">
          <p class="large-copy">{{ content.large }}</p>
          <p>{{ content.text }}</p>

          <div class="stats">
            <div><strong>10+</strong><span>{{ content.years }}</span></div>
            <div><strong>9+</strong><span>{{ content.expertise }}</span></div>
            <div><strong>5K</strong><span>{{ content.hours }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
