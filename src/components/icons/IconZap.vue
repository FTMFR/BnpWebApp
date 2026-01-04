<template>
  <svg
    :width="size"
    :height="size"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    :stroke-width="strokeWidth"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    strokeWidth?: number
  }>(),
  {
    size: 24,
    strokeWidth: 2,
  },
)
</script>
