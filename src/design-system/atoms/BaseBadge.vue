<script setup lang="ts">
import { computed } from 'vue'

export interface BaseBadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

const props = withDefaults(defineProps<BaseBadgeProps>(), {
  variant: 'default',
  size: 'md',
  dot: false,
})

const badgeClasses = computed(() => {
  const base = 'inline-flex items-center font-semibold rounded-full'

  const variants = {
    default: 'bg-secondary-200 text-foreground',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    danger: 'bg-danger-100 text-danger-700',
    secondary: 'bg-secondary-300 text-foreground',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  return `${base} ${variants[props.variant]} ${sizes[props.size]}`
})

const dotClasses = computed(() => {
  const base = 'rounded-full'
  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }
  return `${base} ${sizes[props.size]}`
})
</script>

<template>
  <span :class="badgeClasses">
    <span v-if="dot" :class="[dotClasses, `bg-current mr-1`]" />
    <slot />
  </span>
</template>
