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
  activeIndex: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <section id="stack" class="panel dark-panel stack-panel">
    <div class="panel-surface">
      <div class="panel-inner page-width">
        <div class="section-heading">
          <p class="section-number">{{ content.number }}</p>
          <h2>{{ content.title }}<br>{{ content.accent }}</h2>
        </div>

        <div class="stack-list">
          <article
            v-for="(item, index) in items"
            :key="item.title"
            class="stack-item"
            :class="{ active: activeIndex === index }"
          >
            <button
              class="stack-row stack-trigger"
              type="button"
              :aria-expanded="activeIndex === index"
              :aria-controls="`stack-description-${index}`"
              @click="emit('toggle', index)"
            >
              <span class="stack-index">0{{ index + 1 }}</span>
              <h3>{{ item.title }}</h3>
              <span class="stack-arrow" aria-hidden="true">+</span>
            </button>

            <div :id="`stack-description-${index}`" class="stack-description">
              <div class="stack-description-inner">
                <p>{{ item.description }}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
