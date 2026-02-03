<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'

export interface ModalProps {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

const props = withDefaults(defineProps<ModalProps>(), {
  size: 'md',
  closeOnBackdrop: true,
  closeOnEscape: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }
  return sizes[props.size]
})

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleBackdropClick = (event: MouseEvent) => {
  if (props.closeOnBackdrop && (event.target as HTMLElement).classList.contains('modal-backdrop')) {
    close()
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (props.closeOnEscape && event.key === 'Escape' && props.modelValue) {
    close()
  }
}

onMounted(() => {
  if (props.closeOnEscape) {
    document.addEventListener('keydown', handleEscape)
  }
  if (props.modelValue) {
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-modal flex items-center justify-center p-4 modal-backdrop bg-black/70 backdrop-blur-sm"
        @click="handleBackdropClick"
      >
        <div
          class="bg-card-background rounded-xl shadow-2xl w-full max-h-[min(90vh,calc(100vh-8rem))] flex flex-col min-w-0"
          :class="sizeClasses"
          @click.stop
        >
          <div
            v-if="title || $slots.header"
            class="flex items-center justify-between gap-3 p-4 sm:p-6 border-b border-border-default flex-shrink-0 min-w-0"
          >
            <div class="min-w-0 flex-1 flex items-center gap-2">
              <h2
                v-if="title"
                class="text-base sm:text-xl font-bold text-foreground line-clamp-2 break-words"
              >
                {{ title }}
              </h2>
              <slot name="header" />
            </div>
            <button
              class="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
              aria-label="بستن"
              @click="close"
            >
              <svg
                class="w-5 h-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div
            class="p-4 sm:p-6 overflow-y-auto overflow-x-hidden min-h-0 min-w-0 flex-1"
          >
            <slot />
          </div>
          <div
            v-if="$slots.footer"
            class="p-4 sm:p-6 border-t border-border-default flex-shrink-0"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.2s ease;

    .bg-card-background {
      transition:
        transform 0.2s ease,
        opacity 0.2s ease;
    }
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;

    .bg-card-background {
      transform: scale(0.95);
      opacity: 0;
    }
  }
}
</style>
