<template>
  <div class="flex flex-col gap-2">
    <label :for="computedInputId" class="text-sm font-medium text-foreground text-right">
      {{ label }}
    </label>
    <div class="relative flex items-center">
      <BaseIcon
        v-if="icon"
        :name="icon"
        :size="20"
        :stroke-width="2"
        icon-class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors z-10 group-focus-within:text-primary-500"
      />
      <input
        :id="computedInputId"
        :type="actualInputType"
        :placeholder="placeholder"
        :value="modelValue"
        :maxlength="maxlength"
        @input="handleInput"
        @blur="handleBlur"
        class="w-full max-w-full h-12 px-4 text-base bg-input-background border border-border-default rounded-xl transition-all outline-none text-foreground box-border text-center group"
        :class="{
          'pl-12': icon,
          'pr-12': type === 'password',
        }"
        :aria-describedby="errorMessage ? `${computedInputId}-error` : undefined"
        :aria-invalid="!!errorMessage"
        :required="required"
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseIcon from '../atoms/BaseIcon.vue'

interface Props {
  label: string
  modelValue: string
  type?: 'text' | 'password' | 'email' | 'tel' | 'number'
  placeholder?: string
  icon?: string
  required?: boolean
  autocomplete?: string
  errorMessage?: string
  inputId?: string
  maxlength?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  autocomplete: undefined,
  errorMessage: undefined,
  inputId: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
  'clear-error': []
}>()

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

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  if (props.errorMessage) {
    emit('clear-error')
  }
}

function handleBlur() {
  emit('blur')
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}
</script>
