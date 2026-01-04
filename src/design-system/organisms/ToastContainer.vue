<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import BaseIcon from '../atoms/BaseIcon.vue'

const toastStore = useToastStore()

const getToastIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'CheckCircle'
    case 'error':
      return 'XCircle'
    case 'warning':
      return 'AlertTriangle'
    case 'info':
    default:
      return 'Info'
  }
}

const getToastColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-success-50 dark:bg-success-900/20 border-success-500 text-success-700 dark:text-success-300'
    case 'error':
      return 'bg-danger-50 dark:bg-danger-900/20 border-danger-500 text-danger-700 dark:text-danger-300'
    case 'warning':
      return 'bg-warning-50 dark:bg-warning-900/20 border-warning-500 text-warning-700 dark:text-warning-300'
    case 'info':
    default:
      return 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-300'
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-4 left-4 right-4 z-[9999] pointer-events-none flex flex-col gap-2 items-end"
      dir="rtl"
    >
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2 w-full max-w-md">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm',
            getToastColor(toast.type),
          ]"
        >
          <BaseIcon
            :name="getToastIcon(toast.type)"
            :size="20"
            :stroke-width="2"
            class="flex-shrink-0 mt-0.5"
          />
          <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
          <button
            @click="toastStore.removeToast(toast.id)"
            class="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
            aria-label="بستن"
          >
            <BaseIcon name="X" :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
