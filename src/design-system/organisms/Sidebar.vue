<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, ref, inject, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../atoms/BaseButton.vue'
import BaseBadge from '../atoms/BaseBadge.vue'
import CustomLoader from '../atoms/CustomLoader.vue'
import BaseIcon from '../atoms/BaseIcon.vue'
import { useMenu } from '@/shared/composables/useMenu'
import SubMenuItem from './SubMenuItem.vue'

export interface MenuItem {
  id: string
  label: string
  icon?: string
  href?: string
  badge?: string
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  children?: MenuItem[]
}

export interface SidebarProps {
  menuItems?: MenuItem[]
  activeMenuItemId?: string
  variant?: 'sidebar' | 'sheet'
  logo?: {
    text: string
    subtext?: string
  }
}

const props = withDefaults(defineProps<SidebarProps>(), {
  activeMenuItemId: '',
  variant: 'sidebar',
})

const emit = defineEmits<{
  'update:activeMenuItemId': [id: string]
  'menu-item-click': [item: MenuItem]
}>()

const router = useRouter()

const { menuItems: apiMenuItems, fullMenuTree, isLoadingMenu } = useMenu()

const menuItems = computed<MenuItem[]>(() => {
  if (props.menuItems && props.menuItems.length > 0) {
    return props.menuItems
  }
  return Array.isArray(apiMenuItems.value) ? apiMenuItems.value : []
})

const isCollapsed = inject<Ref<boolean>>('isSidebarCollapsed', ref(false))

const expandedMenus = ref<string[]>([])

const activeMenu = computed({
  get: () => props.activeMenuItemId,
  set: (value) => emit('update:activeMenuItemId', value),
})

const closeMobileMenu = inject<(() => void) | undefined>('closeMobileMenu')

// Function to find menu item by route path in visible menu items
const findMenuItemByPath = (path: string, items: MenuItem[]): MenuItem | null => {
  for (const item of items) {
    if (item.href && path === item.href) {
      return item
    }
    if (item.children) {
      const found = findMenuItemByPath(path, item.children)
      if (found) return found
    }
  }
  return null
}

// Find closest visible parent in the full tree when navigating to a non-menu item
interface MenuItemWithMeta extends MenuItem {
  isMenu: boolean
  children?: MenuItemWithMeta[]
}

const findClosestVisibleParent = (
  path: string,
  items: MenuItemWithMeta[],
  parents: MenuItemWithMeta[] = []
): MenuItem | null => {
  for (const item of items) {
    if (item.href && path === item.href) {
      // Found the item - if it's not a menu, return closest visible parent
      if (!item.isMenu) {
        // Find the closest parent that is a menu item
        for (let i = parents.length - 1; i >= 0; i--) {
          if (parents[i].isMenu) {
            return parents[i]
          }
        }
      }
      return item
    }
    if (item.children) {
      const found = findClosestVisibleParent(path, item.children, [...parents, item])
      if (found) return found
    }
  }
  return null
}

// Watch route to set active menu on refresh or route change
watch(
  () => [router.currentRoute.value.path, menuItems.value, fullMenuTree.value] as const,
  ([path, items, fullTree]) => {
    if (items.length > 0) {
      // First try to find in visible menu items
      let matchedItem = findMenuItemByPath(path, items)
      
      // If not found in visible items, search full tree for closest visible parent
      if (!matchedItem && fullTree && fullTree.length > 0) {
        matchedItem = findClosestVisibleParent(path, fullTree)
      }
      
      if (matchedItem && activeMenu.value !== matchedItem.id) {
        activeMenu.value = matchedItem.id
      }
    }
  },
  { immediate: true },
)

// Watch for collapse changes to close expanded menus
watch(isCollapsed, (collapsed) => {
  if (collapsed) {
    expandedMenus.value = []
  }
})

// Function to update expanded menus based on active menu
const updateExpandedMenus = () => {
  if (!activeMenu.value || menuItems.value.length === 0) return

  const menusToExpand: string[] = []

  // Recursive helper to find all parents of the active menu
  const findParents = (items: MenuItem[], parents: string[] = []): boolean => {
    for (const item of items) {
      // Check if current item is active
      if (item.id === activeMenu.value) {
        menusToExpand.push(...parents)
        return true
      }
      // Check children recursively
      if (item.children && item.children.length > 0) {
        if (findParents(item.children, [...parents, item.id])) {
          return true
        }
      }
    }
    return false
  }

  findParents(menuItems.value)

  // Add found parents to expandedMenus
  menusToExpand.forEach((menuId) => {
    if (!expandedMenus.value.includes(menuId)) {
      expandedMenus.value.push(menuId)
    }
  })
}

// Watch for activeMenu changes to auto-expand parent menus
watch(
  () => activeMenu.value,
  () => {
    updateExpandedMenus()
  },
  { immediate: true },
)

// Watch for menuItems changes (when menu loads) to restore expanded state
watch(
  () => menuItems.value,
  () => {
    if (menuItems.value.length > 0) {
      updateExpandedMenus()
    }
  },
  { immediate: true, deep: true },
)

const convertIconNameToPascalCase = (iconName: string): string => {
  if (!iconName) return 'Circle'

  if (/^[A-Z]/.test(iconName)) {
    return iconName
  }

  return iconName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

const getMenuIcon = (item: MenuItem): string => {
  if (item.icon) {
    const pascalCaseName = convertIconNameToPascalCase(item.icon)
    return pascalCaseName
  }
  return 'Circle'
}

const handleMobileClose = () => {
  if (closeMobileMenu) {
    closeMobileMenu()
  }
}

const toggleSubmenu = (itemId: string) => {
  if (expandedMenus.value.includes(itemId)) {
    expandedMenus.value = expandedMenus.value.filter((id) => id !== itemId)
  } else {
    expandedMenus.value.push(itemId)
  }
}

// Update handleMenuItemClick to handle clicks from SubMenuItem
const handleMenuItemClick = (item: MenuItem) => {
  if (item.children && item.children.length > 0) {
    toggleSubmenu(item.id)
  } else {
    activeMenu.value = item.id
    emit('menu-item-click', item)
    if (item.href) {
      router.push(item.href)
    }
    if (closeMobileMenu) {
      closeMobileMenu()
    }
  }
}

const isMenuActive = (item: MenuItem): boolean => {
  if (activeMenu.value === item.id) return true
  if (item.children && item.children.length > 0) {
    return item.children.some((child) => child.id === activeMenu.value)
  }
  return false
}

const handleSubmenuItemClick = (item: MenuItem) => {
  activeMenu.value = item.id
  emit('menu-item-click', item)

  if (item.href) {
    router.push(item.href)
  }

  if (closeMobileMenu) {
    closeMobileMenu()
  }
}

const isActive = (item: MenuItem): boolean => {
  if (item.id === activeMenu.value) return true
  return item.children?.some(isActive) ?? false
}

const getBadgeVariant = (
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger',
): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary' => {
  if (variant === 'success') return 'success'
  if (variant === 'warning') return 'warning'
  if (variant === 'danger') return 'danger'
  if (variant === 'primary') return 'primary'
  return 'default'
}
</script>

<template>
  <aside
    :class="[
      'bg-card-background flex flex-col overflow-hidden box-border',
      variant === 'sheet'
        ? 'flex-1 min-h-0 border-t border-border-default'
        : [
            'border-l-2 border-border-default shadow-xl transition-all duration-300 fixed right-0 top-0 lg:top-[73px] bottom-0 z-fixed lg:z-50',
            isCollapsed ? 'w-[5.5rem]' : 'w-64',
          ],
    ]"
  >
    <!-- Mobile Close Button (sidebar mode only; sheet has its own close in wrapper) -->
    <div
      v-if="variant === 'sidebar'"
      class="flex items-center justify-end py-2 px-3 flex-shrink-0 border-b border-border-default/30 lg:hidden"
    >
      <BaseButton variant="ghost" size="sm" @click="handleMobileClose" aria-label="Close Menu">
        <BaseIcon name="X" :size="16" :stroke-width="2" />
      </BaseButton>
    </div>

    <div class="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
      <div v-if="isLoadingMenu" class="flex flex-col items-center justify-center gap-4 py-8">
        <CustomLoader size="md" />
        <p class="text-sm text-muted-foreground">در حال بارگذاری منوها...</p>
      </div>

      <nav v-else class="space-y-1">
        <template v-for="item in menuItems" :key="item.id">
          <div class="menu-item-wrapper">
            <!-- LEVEL 1 ITEM (Rendered Manually) -->
            <button
              @click="handleMenuItemClick(item)"
              class="group level-1-item"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-right',
                'hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 hover:shadow-md hover:scale-[1.01]',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/30',
                isActive(item)
                  ? 'bg-primary-500/15 border-r-4 border-primary-500 text-primary-700 dark:text-primary-300 font-semibold shadow-md'
                  : 'text-muted-foreground',
                variant === 'sidebar' && isCollapsed ? 'justify-center px-2' : '',
              ]"
            >
              <BaseIcon
                :name="getMenuIcon(item)"
                :size="20"
                :stroke-width="2"
                :icon-class="`flex-shrink-0 transition-colors duration-200 ${isActive(item) ? 'text-primary-500' : 'text-muted-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400'}`"
              />
              <template v-if="variant === 'sheet' || !isCollapsed">
                <span class="flex-1 text-sm font-semibold truncate">{{ item.label }}</span>
                <BaseBadge
                  v-if="item.badge"
                  :variant="getBadgeVariant(item.badgeVariant)"
                  size="sm"
                  class="flex-shrink-0"
                >
                  {{ item.badge }}
                </BaseBadge>
                <BaseIcon
                  v-if="item.children && item.children.length > 0"
                  :name="expandedMenus.includes(item.id) ? 'ChevronUp' : 'ChevronDown'"
                  :size="16"
                  :stroke-width="2"
                  icon-class="flex-shrink-0 transition-all text-muted-foreground group-hover:text-primary-700 dark:group-hover:text-gray-100"
                />
              </template>
            </button>

            <!-- LEVEL 2 & 3 (Recursive Component) -->
            <div
              v-if="
                item.children &&
                item.children.length > 0 &&
                expandedMenus.includes(item.id) &&
                (variant === 'sheet' || !isCollapsed)
              "
              class="submenu-container mt-1 mr-3 pr-2"
            >
              <SubMenuItem
                v-for="subItem in item.children"
                :key="subItem.id"
                :item="subItem"
                :active-menu-id="activeMenu"
                :expanded-menus="expandedMenus"
                :level="0"
                @toggle-menu="toggleSubmenu"
                @menu-item-click="handleMenuItemClick"
              />
            </div>
          </div>
        </template>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
.menu-item-wrapper {
  width: 100%;
  min-width: 0;
}

/* Level 1 items - main menu entries with enhanced hover/active states */
.level-1-item {
  position: relative;
}

/* Submenu container - simple indentation */
.submenu-container {
  position: relative;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
</style>
