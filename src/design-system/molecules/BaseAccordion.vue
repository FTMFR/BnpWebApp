<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '../atoms/BaseIcon.vue'

export interface AccordionItem {
  id: string
  label: string
  disabled?: boolean
}

export interface AccordionProps {
  items: AccordionItem[]
  modelValue?: string
}

const props = withDefaults(defineProps<AccordionProps>(), {
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const openId = computed({
  get: () => props.modelValue ?? '',
  set: (value: string) => {
    emit('update:modelValue', value)
    emit('change', value)
  },
})

function toggle(item: AccordionItem) {
  if (item.disabled) return
  openId.value = openId.value === item.id ? '' : item.id
}

const isOpen = (id: string) => openId.value === id
</script>

<template>
  <div class="w-full min-w-0 divide-y divide-border-default border border-border-default rounded-xl overflow-hidden bg-card-background text-card-foreground">
    <div
      v-for="item in items"
      :key="item.id"
      class="min-w-0"
    >
      <button
        type="button"
        :disabled="item.disabled"
        class="flex w-full items-center justify-between gap-3 px-4 py-3 text-right text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50"
        :class="isOpen(item.id)
          ? 'bg-muted/50 text-foreground hover:bg-muted/60'
          : 'text-foreground hover:bg-muted/40'"
        :aria-expanded="isOpen(item.id)"
        :aria-controls="`accordion-content-${item.id}`"
        :id="`accordion-trigger-${item.id}`"
        @click="toggle(item)"
      >
        <span class="flex-1">{{ item.label }}</span>
        <BaseIcon
          :name="isOpen(item.id) ? 'ChevronUp' : 'ChevronDown'"
          :size="18"
          :stroke-width="2"
          class="flex-shrink-0 opacity-80"
        />
      </button>
      <div
        v-if="isOpen(item.id)"
        :id="`accordion-content-${item.id}`"
        role="region"
        :aria-labelledby="`accordion-trigger-${item.id}`"
        class="min-w-0 border-t border-border-default bg-background text-foreground"
      >
        <div class="px-4 py-3 min-[931px]:py-4 min-[931px]:py-6 overflow-x-auto min-w-0">
          <slot :name="item.id" :open-id="openId" />
        </div>
      </div>
    </div>
  </div>
</template>
