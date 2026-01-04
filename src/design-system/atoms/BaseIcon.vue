<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { getIcon } from '@/shared/config/iconRegistry'

export interface BaseIconProps {
  name: string
  size?: number
  strokeWidth?: number
  iconClass?: string | string[]
}

const props = withDefaults(defineProps<BaseIconProps>(), {
  size: 20,
  strokeWidth: 2,
  iconClass: '',
})

const IconComponent = computed<Component>(() => {
  return getIcon(props.name)
})
</script>

<template>
  <component :is="IconComponent" :size="size" :stroke-width="strokeWidth" :class="iconClass" />
</template>
