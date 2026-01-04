<script setup lang="ts">
import { computed } from 'vue';

export interface BaseDividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<BaseDividerProps>(), {
  orientation: 'horizontal',
  spacing: 'md',
});

const dividerClasses = computed(() => {
  const base = 'border-border-default';
  
  const orientations = {
    horizontal: 'w-full border-t',
    vertical: 'h-full border-l',
  };
  
  const spacings = {
    none: '',
    sm: props.orientation === 'horizontal' ? 'my-2' : 'mx-2',
    md: props.orientation === 'horizontal' ? 'my-4' : 'mx-4',
    lg: props.orientation === 'horizontal' ? 'my-6' : 'mx-6',
  };
  
  return `${base} ${orientations[props.orientation]} ${spacings[props.spacing]}`;
});
</script>

<template>
  <div :class="dividerClasses" role="separator" />
</template>

