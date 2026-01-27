<script setup lang="ts">
import { computed } from 'vue'

export interface BaseInputProps {
  modelValue?: string | number // Added modelValue
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: boolean
  errorMessage?: string
  label?: string
  hint?: string
  size?: 'sm' | 'md' | 'lg'
}


const props = withDefaults(defineProps<BaseInputProps>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  error: false,
  size: 'md',

})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputClasses = computed(() => {
  const base =
    'w-full rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0'

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  }

  const states = props.error
    ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
    : 'border-border-default focus:border-primary-500 focus:ring-primary-500'

  const disabledState = props.disabled
    ? 'bg-secondary/50 cursor-not-allowed opacity-60'
    : 'bg-input-background'

  return `${base} ${sizes[props.size]} ${states} ${disabledState}`
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block mb-2 text-sm font-medium text-foreground">
      {{ label }}
      <span v-if="required" class="text-danger-500">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :class="inputClasses"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <p v-if="error && errorMessage" class="mt-1 text-sm text-danger-600">
      {{ errorMessage }}
    </p>
    <p v-else-if="hint" class="mt-1 text-sm text-muted-foreground">
      {{ hint }}
    </p>
  </div>
</template>
