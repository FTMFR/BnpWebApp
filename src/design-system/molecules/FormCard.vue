<script setup lang="ts">
import Card from './Card.vue'

export interface FormCardProps {
  title: string
  description?: string
  cancelLabel?: string
  isSubmitting?: boolean
  disabled?: boolean
  routeBack?: string
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

const handleSubmit = () => {
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
  <Card
    :back-route="routeBack"
    :title="title"
    :description="description"
    variant="elevated"
    padding="none"
  >
    <template #header></template>

    <form @submit.prevent="handleSubmit">
      <div class="pt-4 sm:p-6">
        <slot />
      </div>

      <div class="flex items-center justify-end gap-3 pt-4 sm:pt-6">
        <button type="button" class="hidden" @click="handleCancel" />
        <slot name="footer" />
      </div>
    </form>
  </Card>
</template>
