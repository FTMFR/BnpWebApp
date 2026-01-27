<script setup lang="ts">
import { computed } from 'vue'

export interface CustomLoaderProps {
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<CustomLoaderProps>(), {
  size: 'md',
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-[30px] h-[30px]',
    md: 'w-[50px] h-[50px]',
    lg: 'w-[70px] h-[70px]',
  }
  return sizes[props.size]
})
</script>

<template>
  <div :class="['base-preloader', sizeClasses]"></div>
</template>

<style scoped>
.base-preloader {
  --c: radial-gradient(farthest-side, var(--accent) 92%, #0000);
  background: 
    var(--c) 50%  0, 
    var(--c) 50%  100%, 
    var(--c) 100% 50%, 
    var(--c) 0    50%;
  background-size: 10px 10px;
  background-repeat: no-repeat;
  animation: preloader-rotate 1s infinite;
  position: relative;
}

.base-preloader::before {    
  content: "";
  position: absolute;
  inset: 0;
  margin: 3px;
  background: repeating-conic-gradient(#0000 0 35deg, var(--accent) 0 90deg);
  -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - 3px), #000 0);
  mask: radial-gradient(farthest-side, #0000 calc(100% - 3px), #000 0);
  border-radius: 50%;
}

@keyframes preloader-rotate { 
  100% { transform: rotate(.5turn); }
}
</style>

