<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, ref, inject, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../atoms/BaseButton.vue'
import BaseBadge from '../atoms/BaseBadge.vue'
import BaseSpinner from '../atoms/BaseSpinner.vue'
import BaseIcon from '../atoms/BaseIcon.vue'
import { useMenu } from '@/shared/composables/useMenu'

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
  logo?: {
    text: string
    subtext?: string
  }
}

const props = withDefaults(defineProps<SidebarProps>(), {
  activeMenuItemId: '',
})

const emit = defineEmits<{
  'update:activeMenuItemId': [id: string]
  'menu-item-click': [item: MenuItem]
}>()

const router = useRouter()

const { menuItems: apiMenuItems, isLoadingMenu } = useMenu()
const menuItems = computed(() => props.menuItems || apiMenuItems.value)

const isCollapsed = inject<Ref<boolean>>('isSidebarCollapsed', ref(false))

const expandedMenus = ref<string[]>([])

const activeMenu = computed({
  get: () => props.activeMenuItemId,
  set: (value) => emit('update:activeMenuItemId', value),
})

const closeMobileMenu = inject<(() => void) | undefined>('closeMobileMenu')

// Function to find menu item by route path
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

// Watch route to set active menu on refresh or route change
watch(
  () => [router.currentRoute.value.path, menuItems.value] as [string, MenuItem[]],
  ([path, items]) => {
    if (items.length > 0) {
      const matchedItem = findMenuItemByPath(path, items)
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

  // پیدا کردن منوی اصلی که این activeMenu یکی از child های آن است
  for (const menuItem of menuItems.value) {
    if (menuItem.children && menuItem.children.length > 0) {
      const hasActiveChild = menuItem.children.some((child) => child.id === activeMenu.value)
      if (hasActiveChild) {
        menusToExpand.push(menuItem.id)
      }
    }
  }

  // اضافه کردن منوهای لازم به expandedMenus (بدون حذف موارد موجود)
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

const isMenuActive = (item: MenuItem): boolean => {
  if (activeMenu.value === item.id) return true
  if (item.children && item.children.length > 0) {
    return item.children.some((child) => child.id === activeMenu.value)
  }
  return false
}

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
      'bg-card-background border-l-2 border-border-default shadow-xl flex flex-col transition-all duration-300 overflow-hidden box-border fixed right-0 top-0 lg:top-[73px] bottom-0 z-fixed lg:z-50',
      isCollapsed ? 'w-[5.5rem]' : 'w-64',
    ]"
  >
    <!-- Mobile Close Button -->
    <div
      class="flex items-center justify-end py-2 px-3 flex-shrink-0 border-b border-border-default/30 lg:hidden"
    >
      <BaseButton variant="ghost" size="sm" @click="handleMobileClose" aria-label="Close Menu">
        <BaseIcon name="X" :size="16" :stroke-width="2" />
      </BaseButton>
    </div>

    <div class="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
      <div v-if="isLoadingMenu" class="flex flex-col items-center justify-center gap-4 py-8">
        <BaseSpinner size="md" color="primary" />
        <p class="text-sm text-muted-foreground">در حال بارگذاری منوها...</p>
      </div>

      <nav v-else class="space-y-1">
        <template v-for="item in menuItems" :key="item.id">
          <div class="menu-item-wrapper">
            <button
              @click="handleMenuItemClick(item)"
              class="group"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-right',
                'hover:bg-primary-100 dark:hover:bg-gray-300/20 hover:text-primary-700 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                isMenuActive(item)
                  ? 'bg-primary-500/10 border-r-4 border-primary-500 text-foreground font-semibold'
                  : 'text-muted-foreground',
                isCollapsed ? 'justify-center px-2' : '',
              ]"
            >
              <BaseIcon
                :name="getMenuIcon(item)"
                :size="20"
                :stroke-width="2"
                :icon-class="`flex-shrink-0 transition-colors ${isMenuActive(item) ? 'text-primary-500 group-hover:text-primary-700 dark:group-hover:text-gray-100' : 'text-muted-foreground group-hover:text-primary-700 dark:group-hover:text-gray-100'}`"
              />

              <template v-if="!isCollapsed">
                <span class="flex-1 text-sm font-medium truncate">{{ item.label }}</span>
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

            <div
              v-if="
                item.children &&
                item.children.length > 0 &&
                expandedMenus.includes(item.id) &&
                !isCollapsed
              "
              class="mt-1 mr-4 space-y-1"
            >
              <button
                v-for="subItem in item.children"
                :key="subItem.id"
                @click="handleSubmenuItemClick(subItem)"
                class="group"
                :class="[
                  'w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all text-right text-sm',
                  'hover:bg-primary-100 dark:hover:bg-gray-300/20 hover:text-primary-700 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                  activeMenu === subItem.id
                    ? 'bg-primary-500/10 text-primary-500 font-semibold'
                    : 'text-muted-foreground',
                ]"
              >
                <BaseIcon
                  :name="getMenuIcon(subItem)"
                  :size="16"
                  :stroke-width="2"
                  :icon-class="`flex-shrink-0 transition-colors ${activeMenu === subItem.id ? 'text-primary-500 group-hover:text-primary-700 dark:group-hover:text-gray-100' : 'text-muted-foreground group-hover:text-primary-700 dark:group-hover:text-gray-100'}`"
                />
                <span class="flex-1 truncate">{{ subItem.label }}</span>
                <BaseBadge
                  v-if="subItem.badge"
                  :variant="getBadgeVariant(subItem.badgeVariant)"
                  size="sm"
                  class="flex-shrink-0"
                >
                  {{ subItem.badge }}
                </BaseBadge>
              </button>
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
</style>
