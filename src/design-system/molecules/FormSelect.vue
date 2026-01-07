<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '../atoms/BaseIcon.vue'
import { BaseSpinner } from '../atoms'

export interface FormSelectOption {
  value: string
  label: string
}

export interface FormSelectProps {
  label: string
  modelValue: string
  options: FormSelectOption[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  errorMessage?: string
  isLoading?: boolean
}

const props = withDefaults(defineProps<FormSelectProps>(), {
  placeholder: 'انتخاب کنید',
  required: false,
  disabled: false,
  errorMessage: undefined,
  isLoading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
  'clear-error': []
}>()

const computedInputId = computed(() => {
  return `form-select-${Math.random().toString(36).substr(2, 9)}`
})

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
  if (props.errorMessage) {
    emit('clear-error')
  }
}

function handleBlur() {
  emit('blur')
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :for="computedInputId" class="text-sm font-medium text-foreground text-right">
      {{ label }}
      <span v-if="required" class="text-danger-500">*</span>
    </label>
    <div class="relative">
      <select
        :id="computedInputId"
        :value="modelValue"
        :disabled="disabled || isLoading"
        :required="required"
        :class="[
          'w-full h-12 px-4 pr-10 text-base bg-input-background border rounded-xl transition-all outline-none text-foreground box-border appearance-none cursor-pointer',
          errorMessage
            ? 'border-danger-500 focus:border-danger-500'
            : 'border-border-default focus:border-primary-500',
          disabled || isLoading
            ? 'bg-secondary/50 cursor-not-allowed opacity-60'
            : 'hover:border-primary-400',
        ]"
        @change="handleChange"
        @blur="handleBlur"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <div v-if="isLoading" class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <BaseSpinner size="sm" />
      </div>
      <BaseIcon
        v-else
        name="ChevronDown"
        :size="20"
        :stroke-width="2"
        icon-class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
    </div>
    <div
      v-if="errorMessage"
      :id="`${computedInputId}-error`"
      class="text-sm text-danger-500 mt-1 text-right"
      role="alert"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>
