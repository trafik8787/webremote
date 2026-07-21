<script setup>
import ProjectCard from './ProjectCard.vue'

defineProps({
  content: {
    type: Object,
    required: true,
  },
  projects: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section id="projects" class="panel projects-panel">
    <div class="panel-surface">
      <div class="panel-inner page-width">
        <div class="section-heading projects-heading">
          <p class="section-number">{{ content.number }}</p>
          <h2>{{ content.title }}</h2>
        </div>

        <div class="project-list">
          <ProjectCard
            v-for="project in projects"
            :key="project.number"
            v-bind="project"
            :eyebrow="content.eyebrow"
            :open-label="content.open"
          />
        </div>
      </div>
    </div>
  </section>
</template>
