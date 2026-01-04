<script setup lang="ts">
import { computed } from 'vue'

export interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: 'default',
  padding: 'md',
})

const cardClasses = computed(() => {
  const base = 'bg-card-background text-card-foreground rounded-xl'

  const variants = {
    default: 'shadow-sm',
    outlined: 'shadow-sm',
    elevated: 'shadow-lg',
  }

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return `${base} ${variants[props.variant]} ${paddings[props.padding]}`
})
</script>

<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="mb-4">
      <slot name="header" />
    </div>
    <div>
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      class="mt-4 pt-4 px-4 sm:px-6 pb-4 sm:pb-6 border-t border-border-default"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
