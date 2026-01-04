<template>
  <div ref="viewerContainer" class="stimulsoft-viewer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Stimulsoft } from 'stimulsoft-reports-js-vuejs';

const props = defineProps<{
  reportPath?: string;
  reportData?: unknown;
}>();

const viewerContainer = ref<HTMLElement | null>(null);
let viewer: unknown = null;

onMounted(() => {
  if (viewerContainer.value) {
    // Initialize Stimulsoft viewer
    // Implementation will depend on specific Stimulsoft API
    viewer = new Stimulsoft.Viewer.StiViewerOptions();
    // Add viewer initialization logic here
  }
});

onUnmounted(() => {
  // Cleanup viewer
  viewer = null;
});
</script>

<style scoped>
.stimulsoft-viewer {
  width: 100%;
  height: 100%;
}
</style>

