<script setup lang="ts">
import Card from './Card.vue'
import { BaseButton } from '../atoms'

export interface FormCardProps {
  title: string
  description?: string
  submitLabel: string
  cancelLabel?: string
  isSubmitting?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<FormCardProps>(), {
  description: '',
  cancelLabel: 'انصراف',
  isSubmitting: false,
  disabled: false,
})

const emit = defineEmits<{
  submit: []
  cancel: []
}>()

const handleSubmit = (e: Event) => {
  e.preventDefault()
  if (!props.isSubmitting && !props.disabled) {
    emit('submit')
  }
}

const handleCancel = () => {
  if (!props.isSubmitting && !props.disabled) {
    emit('cancel')
  }
}
</script>

<template>
  <Card variant="elevated" padding="none">
    <template #header>
      <div class="p-4 sm:p-6">
        <h2 class="text-xl sm:text-2xl font-bold text-foreground mb-2">{{ title }}</h2>
        <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
      </div>
    </template>

    <form @submit="handleSubmit">
      <div class="p-4 sm:p-6">
        <slot />
      </div>

      <div class="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-border-default">
        <BaseButton
          type="button"
          variant="outline"
          :disabled="isSubmitting || disabled"
          @click="handleCancel"
        >
          {{ cancelLabel }}
        </BaseButton>
        <BaseButton
          type="submit"
          variant="default"
          :loading="isSubmitting"
          :disabled="disabled"
          class="!text-white"
        >
          {{ submitLabel }}
        </BaseButton>
      </div>
    </form>
  </Card>
</template>
