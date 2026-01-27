<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

export interface DropdownItem {
  label: string
  value: string | number
  disabled?: boolean
  divider?: boolean
  href?: string
  iconName?: string
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
const menuStyles = ref<Record<string, string>>({})

// We keep this for basic fallback, but JS will override it
const placementClasses = computed(() => {
  // Removed left/right classes here to let JS handle the precise positioning
  const placements = {
    'bottom-start': 'top-full mt-1',
    'bottom-end': 'top-full mt-1',
    'top-start': 'bottom-full mb-1',
    'top-end': 'bottom-full mb-1',
  }
  return placements[props.placement]
})


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
const toggle = () => {
  if (props.trigger === 'click') {
    isOpen.value = !isOpen.value

    if (isOpen.value) {
      // Apply fixed position immediately so the menu breaks out of the table flow
      // This ensures it renders at full width immediately
      menuStyles.value = { position: 'fixed', visibility: 'hidden' }

      nextTick(() => {
        adjustPosition()
        // Make it visible after positioning is done
        if (menuStyles.value) {
           menuStyles.value.visibility = 'visible'
        }
      })
    } else {
      menuStyles.value = {}
    }
  }
}

// 2. Update adjustPosition to handle the visibility reset
const adjustPosition = () => {
  if (!dropdownMenuRef.value || !triggerRef.value || !isOpen.value) return

  requestAnimationFrame(() => {
    const menu = dropdownMenuRef.value!
    const trigger = triggerRef.value!

    const triggerRect = trigger.getBoundingClientRect()
    const viewportWidth = window.innerWidth

    // Reset styles to measure natural width
    // We keep position: fixed so it doesn't get squashed by the table
    menu.style.left = 'auto'
    menu.style.right = 'auto'
    menu.style.top = '0'
    menu.style.bottom = 'auto'
    menu.style.width = 'auto'
    menu.style.maxWidth = 'none'

    // Get the width NOW that it is fixed and full-sized
    const menuWidth = menu.getBoundingClientRect().width
    const menuHeight = menu.getBoundingClientRect().height

    // Calculate Vertical Position
    let top = 0
    if (props.placement.startsWith('bottom')) {
      top = triggerRect.bottom + window.scrollY + 4
    } else {
      top = triggerRect.top + window.scrollY - menuHeight - 4
    }

    // Calculate Horizontal Position
    let left: string | number = 'auto'
    let right: string | number = 'auto'
    const leftOffset = 10

    // Align Left + Offset
    left = triggerRect.left + window.scrollX + leftOffset

    // Boundary Check
    if (triggerRect.left + leftOffset + menuWidth > viewportWidth - 16) {
      left = 'auto'
      right = 16
    }

    // Apply Final Styles
    menuStyles.value = {
      position: 'fixed',
      top: `${top}px`,
      left: typeof left === 'number' ? `${left}px` : left,
      right: typeof right === 'number' ? `${right}px` : right,
      maxWidth: `${viewportWidth - 32}px`,
      zIndex: '50',
      visibility: 'visible' // Ensure it's visible
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
          // Removed 'absolute' here to rely on JS 'fixed' positioning
          // Removed 'left-0' and 'right-0' to prevent conflicts
          'dropdown-menu z-dropdown min-w-[200px] max-w-[calc(100vw-2rem)] sm:max-w-none bg-card-background border border-border-default rounded-lg overflow-hidden shadow-lg',
          placementClasses,
        ]"
        :style="menuStyles"
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
              'w-full hover:text-white text-right px-4 py-2 text-sm transition-colors',
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

/* Mobile styles override */
@media (max-width: 640px) {
  .dropdown-menu {
    max-width: calc(100vw - 2rem) !important;
    /* Ensure fixed positioning is respected on mobile */
    position: fixed !important;
    left: 1rem !important;
    right: auto !important;
  }
}
</style>
