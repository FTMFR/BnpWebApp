<script setup lang="ts">
import { computed } from 'vue'
import BaseInput from '../atoms/BaseInput.vue'
import BaseIcon from '../atoms/BaseIcon.vue'
import type { BaseInputProps } from '../atoms/BaseInput.vue'

export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'tel'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'select'
  | 'dropdown'
  | 'textarea'

export interface SelectOption {
  value: string
  label: string
}

export interface FormFieldProps extends Omit<BaseInputProps, 'label' | 'hint' | 'type'> {
  label?: string
  hint?: string
  required?: boolean
  type?: FieldType
  options?: SelectOption[]
  rows?: number
  maxLength?: number
}

const props = withDefaults(defineProps<FormFieldProps>(), {
  type: 'text',
  required: false,
  rows: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const isSimpleInput = computed(() => {
  return ['text', 'number', 'email', 'password', 'tel', 'date', 'time', 'datetime-local'].includes(
    props.type,
  )
})

const isSelect = computed(() => props.type === 'select')

const isDropdown = computed(() => props.type === 'dropdown')

const isTextarea = computed(() => props.type === 'textarea')

const baseInputType = computed(() => {
  if (['text', 'number', 'email', 'password'].includes(props.type || '')) {
    return props.type as 'text' | 'number' | 'email' | 'password'
  }
  return 'text'
})

const handleInputChange = (value: string | number) => {
  emit('update:modelValue', value)
}

const handleSelectChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full">
    <BaseInput
      v-if="isSimpleInput && ['text', 'number', 'email', 'password'].includes(type || '')"
      v-bind="props"
      :type="baseInputType"
      :label="label"
      :hint="hint"
      :required="required"
      :model-value="modelValue"
      @update:model-value="handleInputChange"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
    <div v-else-if="isSimpleInput" class="w-full">
      <label v-if="label" class="block mb-2 text-sm font-medium text-foreground">
        {{ label }}
        <span v-if="required" class="text-danger-500">*</span>
      </label>
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="[
          'w-full rounded-lg border-2 px-4 py-2.5 text-base transition-colors',
          'focus:outline-none',
          error
            ? 'border-danger-500 focus:border-danger-500'
            : 'border-border focus:border-primary-500',
          disabled ? 'bg-secondary/50 cursor-not-allowed opacity-60' : 'bg-input-background',
        ]"
        @input="handleInputChange(($event.target as HTMLInputElement).value)"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />
      <p v-if="error && errorMessage" class="mt-1 text-sm text-danger-600">
        {{ errorMessage }}
      </p>
      <p v-else-if="hint" class="mt-1 text-sm text-muted-foreground">
        {{ hint }}
      </p>
    </div>

    <div v-else-if="isSelect" class="w-full">
      <label v-if="label" class="block mb-2 text-sm font-medium text-foreground">
        {{ label }}
        <span v-if="required" class="text-danger-500">*</span>
      </label>
      <div class="relative">
        <select
          :value="modelValue"
          :disabled="disabled"
          :required="required"
          :class="[
            'w-full rounded-lg border-2 pl-4 pr-10 py-2.5 text-base transition-colors appearance-none',
            'focus:outline-none',
            error
              ? 'border-danger-500 focus:border-danger-500'
              : 'border-border focus:border-primary-500',
            disabled
              ? 'bg-secondary/50 cursor-not-allowed opacity-60'
              : 'bg-input-background cursor-pointer',
          ]"
          @change="handleSelectChange"
          @blur="emit('blur', $event)"
          @focus="emit('focus', $event)"
        >
          <option value="" disabled>{{ placeholder || 'انتخاب کنید' }}</option>
          <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <BaseIcon
          name="ChevronDown"
          :size="20"
          :stroke-width="2"
          icon-class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
      </div>
      <p v-if="error && errorMessage" class="mt-1 text-sm text-danger-600">
        {{ errorMessage }}
      </p>
      <p v-else-if="hint" class="mt-1 text-sm text-muted-foreground">
        {{ hint }}
      </p>
    </div>

    <div v-else-if="isDropdown" class="w-full">
      <label v-if="label" class="block mb-2 text-sm font-medium text-foreground">
        {{ label }}
        <span v-if="required" class="text-danger-500">*</span>
      </label>
      <div class="relative">
        <select
          :value="modelValue"
          :disabled="disabled"
          :required="required"
          :class="[
            'w-full rounded-lg border-2 pl-4 pr-10 py-2.5 text-base transition-colors appearance-none',
            'focus:outline-none',
            error
              ? 'border-danger-500 focus:border-danger-500'
              : 'border-border focus:border-primary-500',
            disabled
              ? 'bg-secondary/50 cursor-not-allowed opacity-60'
              : 'bg-input-background cursor-pointer',
          ]"
          @change="handleSelectChange"
          @blur="emit('blur', $event)"
          @focus="emit('focus', $event)"
        >
          <option value="" disabled>{{ placeholder || 'انتخاب کنید' }}</option>
          <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <BaseIcon
          name="ChevronDown"
          :size="20"
          :stroke-width="2"
          icon-class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
      </div>
      <p v-if="error && errorMessage" class="mt-1 text-sm text-danger-600">
        {{ errorMessage }}
      </p>
      <p v-else-if="hint" class="mt-1 text-sm text-muted-foreground">
        {{ hint }}
      </p>
    </div>

    <div v-else-if="isTextarea" class="w-full">
      <label v-if="label" class="block mb-2 text-sm font-medium text-foreground">
        {{ label }}
        <span v-if="required" class="text-danger-500">*</span>
      </label>
      <textarea
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :rows="rows"
        :maxlength="maxLength"
        :class="[
          'w-full rounded-lg border-2 px-4 py-2.5 text-base transition-colors resize-none',
          'focus:outline-none',
          error
            ? 'border-danger-500 focus:border-danger-500'
            : 'border-border focus:border-primary-500',
          disabled ? 'bg-secondary/50 cursor-not-allowed opacity-60' : 'bg-input-background',
        ]"
        @input="handleInputChange(($event.target as HTMLTextAreaElement).value)"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />
      <p v-if="error && errorMessage" class="mt-1 text-sm text-danger-600">
        {{ errorMessage }}
      </p>
      <p v-else-if="hint" class="mt-1 text-sm text-muted-foreground">
        {{ hint }}
      </p>
    </div>
  </div>
</template>
