<script setup lang="ts">
import { computed } from 'vue'

export interface TabItem {
  id: string
  label: string
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  modelValue?: string
  variant?: 'default' | 'pills' | 'underline'
}

const props = withDefaults(defineProps<TabsProps>(), {
  variant: 'default',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const activeTab = computed({
  get: () => props.modelValue || props.items[0]?.id || '',
  set: (value: string) => {
    if (value) {
      emit('update:modelValue', value)
      emit('change', value)
    }
  },
})

const tabClasses = (item: TabItem) => {
  const base = 'px-4 py-2 text-sm font-medium transition-colors'
  const isActive = activeTab.value === item.id

  const variants = {
    default: isActive
      ? 'text-primary-600 border-b-2 border-primary-600'
      : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-border-default',
    pills: isActive
      ? 'bg-primary-500 text-white rounded-lg'
      : 'text-muted-foreground hover:bg-secondary rounded-lg',
    underline: isActive
      ? 'text-primary-600 border-b-2 border-primary-600'
      : 'text-muted-foreground hover:text-foreground',
  }

  const disabled = item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

  return `${base} ${variants[props.variant]} ${disabled}`
}
</script>

<template>
  <div class="w-full min-w-0">
    <div
      class="flex flex-nowrap overflow-x-auto border-b border-border-default scrollbar-thin pb-px -mb-px"
      :class="{ 'border-b-0': variant === 'pills', 'gap-2': variant === 'pills' }"
      role="tablist"
    >
      <button
        type="button"
        v-for="item in items"
        :key="item.id"
        :class="[tabClasses(item), 'whitespace-nowrap flex-shrink-0']"
        :disabled="item.disabled"
        role="tab"
        :aria-selected="activeTab === item.id"
        @click="activeTab = item.id"
      >
        {{ item.label }}
      </button>
    </div>
    <div class="mt-4 min-w-0">
      <slot :active-tab="activeTab" />
    </div>
  </div>
</template>
