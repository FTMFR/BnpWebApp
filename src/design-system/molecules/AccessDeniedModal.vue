<script setup lang="ts">
import { computed } from 'vue'
import Modal from '@/design-system/molecules/Modal.vue'
import BaseIcon from '@/design-system/atoms/BaseIcon.vue'
import BaseButton from '@/design-system/atoms/BaseButton.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    message?: string
  }>(),
  {
    title: 'عدم دسترسی',
    message:
      'شما دسترسی لازم برای این عملیات را ندارید. برای دسترسی به این بخش، با مدیر سیستم تماس بگیرید.',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const close = () => {
  visible.value = false
  emit('close')
}
</script>

<template>
  <Modal v-model="visible" :title="title" size="sm" :close-on-backdrop="true" @close="close">
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <div
          class="flex-shrink-0 w-10 h-10 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center"
        >
          <BaseIcon name="AlertCircle" :size="20" class="text-warning-600" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-foreground mb-1">
            {{ message }}
          </p>
          <p class="text-xs text-muted-foreground">
            برای دسترسی به این بخش، با مدیر سیستم تماس بگیرید.
          </p>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex items-center justify-end">
        <BaseButton variant="outline" @click="close"> بستن </BaseButton>
      </div>
    </template>
  </Modal>
</template>
