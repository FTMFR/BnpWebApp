<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { BaseIcon, BaseButton } from '../atoms'

export interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  backRoute?: string
  title?: string
  description?: string
  onBack?: () => void
  isSubmitting?: boolean
  disabled?: boolean
}

const router = useRouter()

function handleBack() {
  if (props.onBack) {
    props.onBack()
  } else if (props.backRoute) {
    router.push(props.backRoute)
  } else {
    router.back()
  }
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: 'default',
  padding: 'md',
  description: '',
  cancelLabel: 'انصراف',
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
  <div class="px-4 sm:px-6 py-4 sm:pb-6" :class="cardClasses">
    <div class="flex items-center justify-between mb-4" v-if="$slots.header">
      <div class="flex items-center gap-3">
        <BaseButton
          v-if="props.backRoute || props.onBack"
          variant="ghost"
          size="sm"
          @click="handleBack"
          class="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <BaseIcon name="ArrowRight" :size="16" />
          بازگشت
        </BaseButton>
        <div class="flex flex-col gap-2">
          <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            <slot name="title">{{ props.title }}</slot>
          </h1>
          <p v-if="description" class="text-sm text-muted-foreground">
            <slot name="title">{{ props.description }}</slot>
          </p>
        </div>
      </div>

      <slot name="header" />
    </div>
    <form >
      <div>
        <slot />
      </div>
    </form>
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-border-default">
      <slot name="footer" />
    </div>
  </div>
</template>
