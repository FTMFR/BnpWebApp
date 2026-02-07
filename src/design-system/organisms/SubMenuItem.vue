<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseIcon from '../atoms/BaseIcon.vue'
import BaseBadge from '../atoms/BaseBadge.vue'
import type { MenuItem } from './Sidebar.vue'

interface Props {
  item: MenuItem
  activeMenuId: string
  expandedMenus: string[] // List of IDs that are currently open
  level: number // 0 for Level 2, 1 for Level 3, etc.
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
})

const emit = defineEmits<{
  'toggle-menu': [id: string] // Tell parent to open/close this ID
  'menu-item-click': [item: MenuItem]
}>()

const router = useRouter()

// Check if this specific item is expanded
const isExpanded = computed(() => props.expandedMenus.includes(props.item.id))

const handleClick = () => {
  if (props.item.children && props.item.children.length > 0) {
    emit('toggle-menu', props.item.id)
  } else {
    emit('menu-item-click', props.item)
    if (props.item.href) {
      router.push(props.item.href)
    }
  }
}

const isActive = (item: MenuItem): boolean => {
  if (item.id === props.activeMenuId) return true
  return item.children?.some(isActive) ?? false
}

// Helper to match parent's logic
const getMenuIcon = (iconName?: string): string => {
  if (!iconName) return 'Circle'
  if (/^[A-Z]/.test(iconName)) return iconName
  return iconName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

// Level-based indentation
const indentClass = computed(() => {
  if (props.level === 0) return 'mr-2'
  if (props.level === 1) return 'mr-4'
  return 'mr-6'
})
</script>

<template>
  <div class="w-full">
    <!-- Item Button -->
    <button
      @click="handleClick"
      class="group w-full flex items-center gap-2 px-3 py-2 rounded-md transition-spring text-right text-sm hover:translate-x-0.5"
      :class="[
        'hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-white',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
        isActive(item)
          ? 'bg-primary-500/10 dark:bg-[var(--sidebar-active-background)] dark:text-[var(--sidebar-active-foreground)] dark:border dark:border-primary-500/50 text-primary-600 font-semibold'
          : 'text-muted-foreground',
      ]"
    >
      <BaseIcon
        :name="getMenuIcon(item.icon)"
        :size="16"
        :stroke-width="2"
        :icon-class="`flex-shrink-0 transition-colors ${isActive(item) ? 'text-primary-500 dark:text-[var(--sidebar-active-foreground)]' : 'text-muted-foreground group-hover:text-primary-700 dark:group-hover:text-white'}`"
      />
      <span class="flex-1 truncate">{{ item.label }}</span>

      <BaseBadge
        v-if="item.badge"
        :variant="
          item.badgeVariant === 'success'
            ? 'success'
            : item.badgeVariant === 'warning'
              ? 'warning'
              : item.badgeVariant === 'danger'
                ? 'danger'
                : item.badgeVariant === 'primary'
                  ? 'primary'
                  : 'default'
        "
        size="sm"
        class="flex-shrink-0"
      >
        {{ item.badge }}
      </BaseBadge>

      <!-- Chevron: Only show if children exist -->
      <BaseIcon
        v-if="item.children && item.children.length > 0"
        :name="isExpanded ? 'ChevronUp' : 'ChevronDown'"
        :size="14"
        :stroke-width="2"
        icon-class="flex-shrink-0 text-muted-foreground transition-transform"
      />
    </button>

    <!-- RECURSIVE CHILDREN -->
    <div
      v-if="item.children && item.children.length > 0 && isExpanded"
      :class="['mt-1 space-y-0.5', indentClass]"
    >
      <SubMenuItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :active-menu-id="activeMenuId"
        :expanded-menus="expandedMenus"
        :level="level + 1"
        @toggle-menu="$emit('toggle-menu', $event)"
        @menu-item-click="$emit('menu-item-click', $event)"
      />
    </div>
  </div>
</template>
