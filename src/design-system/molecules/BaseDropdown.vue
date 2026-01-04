<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

export interface DropdownItem {
  label: string
  value: string | number
  disabled?: boolean
  divider?: boolean
}

export interface DropdownProps {
  items: DropdownItem[]
  trigger?: 'click' | 'hover'
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
}

const props = withDefaults(defineProps<DropdownProps>(), {
  trigger: 'click',
  placement: 'bottom-start',
})

const emit = defineEmits<{
  select: [item: DropdownItem]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownMenuRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)

const placementClasses = computed(() => {
  const placements = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1',
  }
  return placements[props.placement]
})

const toggle = () => {
  if (props.trigger === 'click') {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      nextTick(() => {
        adjustPosition()
      })
    }
  }
}

const open = () => {
  if (props.trigger === 'hover') {
    isOpen.value = true
  }
}

const close = () => {
  isOpen.value = false
}

const handleSelect = (item: DropdownItem) => {
  if (!item.disabled && !item.divider) {
    emit('select', item)
    close()
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (
    props.trigger === 'click' &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node) &&
    dropdownMenuRef.value &&
    !dropdownMenuRef.value.contains(event.target as Node)
  ) {
    close()
  }
}

const handleMouseEnter = () => {
  if (props.trigger === 'hover') {
    open()
  }
}

const handleMouseLeave = () => {
  if (props.trigger === 'hover') {
    close()
  }
}

const adjustPosition = () => {
  if (!dropdownMenuRef.value || !triggerRef.value || !isOpen.value) return

  requestAnimationFrame(() => {
    const menu = dropdownMenuRef.value!
    const trigger = triggerRef.value!
    if (!menu || !trigger) return

    const viewportWidth = window.innerWidth
    const triggerRect = trigger.getBoundingClientRect()

    // Reset styles
    menu.style.left = ''
    menu.style.right = ''
    menu.style.maxWidth = ''

    // برای bottom-end و top-end (مثل منوی آواتار در هدر)
    if (props.placement === 'bottom-end' || props.placement === 'top-end') {
      // با bottom-end، dropdown از سمت راست trigger align می‌شود (right-0 relative to parent)
      // ابتدا بدون style اضافه اندازه بگیر
      const menuRect = menu.getBoundingClientRect()
      const menuWidth = menuRect.width

      // محاسبه موقعیت dropdown: از سمت راست trigger شروع می‌شود
      const dropdownLeftInViewport = triggerRect.right - menuWidth

      // بررسی اینکه آیا dropdown از سمت چپ viewport خارج می‌شود
      if (dropdownLeftInViewport < 16) {
        // dropdown را از لبه چپ viewport فاصله بده (absolute positioning)
        const parentRect = dropdownRef.value!.getBoundingClientRect()
        const leftPosition = 16 - parentRect.left // relative to parent
        menu.style.left = `${leftPosition}px`
        menu.style.right = 'auto'
        menu.style.maxWidth = `${viewportWidth - 32}px`
      }
    } else {
      // برای bottom-start و top-start
      const menuRect = menu.getBoundingClientRect()
      const menuWidth = menuRect.width

      if (triggerRect.left + menuWidth > viewportWidth - 16 || triggerRect.left < 16) {
        menu.style.left = '1rem'
        menu.style.right = 'auto'
        menu.style.maxWidth = `${viewportWidth - 32}px`
      }
    }
  })
}

onMounted(() => {
  if (props.trigger === 'click') {
    document.addEventListener('click', handleClickOutside)
  }
  window.addEventListener('resize', adjustPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', adjustPosition)
})
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative inline-block"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div ref="triggerRef" @click="toggle">
      <slot name="trigger" :is-open="isOpen" />
    </div>
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        ref="dropdownMenuRef"
        :class="[
          'dropdown-menu absolute z-dropdown min-w-[200px] max-w-[calc(100vw-2rem)] sm:max-w-none bg-card-background border border-border-default rounded-lg shadow-lg py-1',
          placementClasses,
          props.placement === 'bottom-end' ? 'dropdown-menu-bottom-end' : '',
          props.placement === 'top-end' ? 'dropdown-menu-top-end' : '',
        ]"
      >
        <template v-if="$slots.items">
          <slot name="items" :items="items" :select="handleSelect" />
        </template>
        <template v-else>
          <button
            v-for="(item, index) in items"
            :key="index"
            :disabled="item.disabled"
            :class="[
              'w-full text-right px-4 py-2 text-sm transition-colors',
              item.divider ? 'border-t border-border-default my-1' : '',
              item.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-secondary text-foreground',
            ]"
            @click="handleSelect(item)"
          >
            {{ item.label }}
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* برای موبایل: dropdown را از سمت چپ صفحه شروع کن */
@media (max-width: 640px) {
  .dropdown-menu {
    max-width: calc(100vw - 2rem) !important;
  }

  .dropdown-menu-bottom-end {
    left: 1rem !important;
    right: auto !important;
  }

  .dropdown-menu-top-end {
    left: 1rem !important;
    right: auto !important;
  }
}
</style>
