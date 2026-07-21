<script setup>
defineProps({
  content: {
    type: Object,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section id="why" class="panel why-panel">
    <div class="panel-surface">
      <div class="panel-inner page-width">
        <div class="section-heading why-heading">
          <p class="section-number">{{ content.number }}</p>
          <h2>{{ content.title }}</h2>
        </div>

        <div class="why-grid">
          <article
            v-for="(item, index) in items"
            :key="item.number"
            class="why-card"
            :class="{ 'why-card-wide': index === items.length - 1 }"
          >
            <div class="why-card-top">
              <span class="why-number">{{ item.number }}</span>
              <span class="why-indicator" aria-hidden="true"></span>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
