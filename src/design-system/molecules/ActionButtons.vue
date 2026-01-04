<script setup lang="ts">
import { BaseButton, BaseIcon } from '../atoms'

export interface ActionButtonsProps {
  showView?: boolean
  showEdit?: boolean
  showDelete?: boolean
  viewLabel?: string
  editLabel?: string
  deleteLabel?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
}

const props = withDefaults(defineProps<ActionButtonsProps>(), {
  showView: true,
  showEdit: true,
  showDelete: true,
  viewLabel: 'مشاهده',
  editLabel: 'ویرایش',
  deleteLabel: 'حذف',
  size: 'sm',
  variant: 'ghost',
})

const emit = defineEmits<{
  view: []
  edit: []
  delete: []
}>()
</script>

<template>
  <div class="flex items-center justify-center gap-2">
    <BaseButton
      v-if="showView"
      :size="size"
      :variant="variant"
      class="text-primary-600 hover:bg-primary-50"
      @click="emit('view')"
      :aria-label="viewLabel"
    >
      <BaseIcon name="Eye" :size="16" />
    </BaseButton>
    <BaseButton
      v-if="showEdit"
      :size="size"
      :variant="variant"
      class="text-warning-600 hover:bg-warning-50"
      @click="emit('edit')"
      :aria-label="editLabel"
    >
      <BaseIcon name="Edit" :size="16" />
    </BaseButton>
    <BaseButton
      v-if="showDelete"
      :size="size"
      :variant="variant"
      class="text-danger-600 hover:bg-danger-50"
      @click="emit('delete')"
      :aria-label="deleteLabel"
    >
      <BaseIcon name="Trash" :size="16" />
    </BaseButton>
  </div>
</template>

