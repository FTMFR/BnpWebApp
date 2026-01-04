<script setup lang="ts">
import { computed } from 'vue'

export interface BaseAvatarProps {
  src?: string
  alt?: string
  name?: string 
  size?: 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
}

const props = withDefaults(defineProps<BaseAvatarProps>(), {
  size: 'md',
  shape: 'circle',
})

const avatarClasses = computed(() => {
  const base =
    'inline-flex items-center justify-center font-semibold text-white bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden'

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  const shapes = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  }

  return `${base} ${sizes[props.size]} ${shapes[props.shape]}`
})

const initials = computed(() => {
  if (!props.name) return ''
  const trimmed = props.name.trim()
  // If name is already a single character, return it
  if (trimmed.length === 1) {
    return trimmed.toUpperCase()
  }
  // Otherwise, get first letter of first word and last letter of last word
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    const first = parts[0]?.[0] || ''
    const last = parts[parts.length - 1]?.[0] || ''
    return (first + last).toUpperCase()
  }
  return trimmed.substring(0, 1).toUpperCase()
})
</script>

<template>
  <div :class="avatarClasses">
    <img v-if="src" :src="src" :alt="alt || name" class="w-full h-full object-cover" />
    <span v-else-if="name">
      {{ initials }}
    </span>
    <slot v-else />
  </div>
</template>
