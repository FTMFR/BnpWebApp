<script setup lang="ts">
import { computed } from 'vue'
import ButtonLoader from './ButtonLoader.vue'

export interface BaseButtonProps {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'success'
    | 'accent'
    | 'primary'
    | 'danger'
    | 'warning'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'md'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<BaseButtonProps>(), {
  variant: 'default',
  size: 'default',
  disabled: false,
  loading: false,
  fullWidth: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] disabled:pointer-events-none disabled:opacity-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring [&_svg]:pointer-events-none [&_svg:not([class*="size-"])])]:size-4 shrink-0 [&_svg]:shrink-0'

  const variants: Record<string, string> = {
    default:
      'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
    destructive:
      'bg-destructive text-white hover:bg-destructive/90 hover:shadow-md hover:scale-[1.02] focus-visible:ring-destructive active:scale-[0.98]',
    outline:
      'border-2 border-border text-foreground hover:bg-secondary/50 dark:hover:bg-secondary/20 hover:border-primary/50 hover:scale-[1.01] shadow-none',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-muted hover:scale-[1.01] border-2 border-border shadow-none',
    ghost: 'shadow-none hover:bg-muted hover:text-foreground hover:scale-[1.01]',
    link: 'text-primary underline-offset-4 hover:underline shadow-none',
    success:
      'bg-success text-success-foreground hover:bg-success/90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
    accent:
      'bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
    primary: 'bg-primary text-white hover:bg-primary/90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
    danger:
      'bg-destructive text-white hover:bg-destructive/90 hover:shadow-md hover:scale-[1.02] focus-visible:ring-destructive active:scale-[0.98]',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
  }

  const sizes: Record<string, string> = {
    default: 'h-10 px-6 py-2 has-[>svg]:px-4',
    sm: 'h-9 rounded-md gap-1.5 px-4 has-[>svg]:px-3',
    lg: 'h-12 rounded-md px-8 has-[>svg]:px-6 text-base',
    icon: 'size-10 rounded-md',
    // Legacy support
    md: 'h-10 px-6 py-2 has-[>svg]:px-4',
  }

  const width = props.fullWidth ? 'w-full' : ''

  return `${base} ${variants[props.variant] || variants.default} ${sizes[props.size] || sizes.default} ${width}`
})

const handleClick = (event: MouseEvent, forcePrevent = false) => {
  if (props.type !== 'submit' || forcePrevent) {
    event.preventDefault()
  }

  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    to="#"
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="type === 'submit' ? handleClick : handleClick($event, true)"
  >
    <ButtonLoader v-if="loading" :size="size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'" />
    <slot />
  </button>
</template>
