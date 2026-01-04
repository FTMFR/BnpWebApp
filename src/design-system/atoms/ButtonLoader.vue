<script setup lang="ts">
import { computed } from 'vue'

export interface ButtonLoaderProps {
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<ButtonLoaderProps>(), {
  size: 'md',
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }
  return sizes[props.size]
})
</script>

<template>
  <span class="mr-2 inline-block">
    <svg
      :class="[sizeClasses, 'animate-spin']"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </span>
</template>
