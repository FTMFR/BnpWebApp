<script setup lang="ts">
import { computed, ref } from 'vue'
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
  maxlength?: number
  icon?: string
  autocomplete?: string
  inputId?: string
}

const props = withDefaults(defineProps<FormFieldProps>(), {
  type: 'text',
  rows: 3,
  inputId: undefined,
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

const handleInputChange = (value: string | number) => {
  emit('update:modelValue', value)
}

const handleSelectChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}

const showPassword = ref(false)

const actualInputType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text'
  }
  return props.type
})

const computedInputId = computed(() => {
  return props.inputId || `form-input-${Math.random().toString(36).substr(2, 9)}`
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// function handleInput(event: Event) {
//   const target = event.target as HTMLInputElement
//   emit('update:modelValue', target.value)
//   if (props.errorMessage) {
//     emit('clear-error')
//   }
// }
</script>

<template>
  <div class="w-full">
    <div
      v-if="
        isSimpleInput &&
        ['text', 'number', 'email', 'password', 'tel', 'date', 'time', 'datetime-local'].includes(
          type || '',
        )
      "
      class="flex flex-col gap-2"
    >
      <label :for="computedInputId" class="text-sm font-medium text-foreground text-right">
        {{ label }}
        <span v-if="required" class="text-danger-500">*</span>
      </label>
      <div class="relative flex items-center">
        <BaseIcon
          v-if="icon"
          :name="icon"
          :size="20"
          :stroke-width="2"
          icon-class="absolute group-focus-within:text-primary left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors
          z-10 group-focus-within:text-primary-500"
        />
        <input
          @update:model-value="handleInputChange(($event.target as HTMLInputElement).value)"
          @blur="emit('blur', $event)"
          @focus="emit('focus', $event)"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :dir="type === 'password' ? 'ltr' : undefined"
          class="w-full max-w-full h-12 px-4 text-base bg-input-background border border-border-default rounded-xl transition-all outline-none text-foreground box-border focus-within:border-primary text-center group"
          :class="{
            'pl-12': icon,
            'pr-12': type === 'password',
          }"
          @input="handleInputChange(($event.target as HTMLInputElement).value)"
          :id="computedInputId"
          :type="actualInputType"
          :maxlength="maxlength"
          :aria-describedby="errorMessage ? `${computedInputId}-error` : undefined"
          :aria-invalid="!!errorMessage"
          :autocomplete="autocomplete"
        />
        <button
          v-if="type === 'password'"
          type="button"
          @click="togglePasswordVisibility"
          class="absolute right-3.5 top-0 bottom-0 flex items-center justify-center bg-transparent border-0 text-muted-foreground cursor-pointer p-0 transition-colors z-10 hover:text-foreground"
          :aria-label="showPassword ? 'مخفی کردن' : 'نمایش'"
          :aria-pressed="showPassword"
        >
          <BaseIcon :name="showPassword ? 'EyeOff' : 'Eye'" :size="20" :stroke-width="2" />
        </button>
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
