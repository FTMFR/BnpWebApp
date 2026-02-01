import { computed, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useMenuStore } from '@/stores/menu'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { MenuItem } from '@/design-system'
import type { ApiMenuItem } from '@/shared/api/types'

export function normalizePath(path: string): string {
  let normalized = path.startsWith('/api')
    ? path.slice(4)
    : path.startsWith('api/')
      ? path.slice(4)
      : path

  if (!normalized.startsWith("/")) {
    normalized = '/' + normalized
  }

  normalized = normalized.toLowerCase()
  return normalized

}

// Extended MenuItem that includes isMenu flag for internal tracking
export interface MenuItemWithMeta extends MenuItem {
  isMenu: boolean
  children?: MenuItemWithMeta[]
}

// Build full menu tree (including non-menu items) for path matching
function convertApiMenuItemToFullTree(apiItem: ApiMenuItem): MenuItemWithMeta {
  const children = apiItem.Children
    ? apiItem.Children.map(convertApiMenuItemToFullTree)
    : undefined

  return {
    id: apiItem.PublicId,
    label: apiItem.Title,
    icon: apiItem.Icon || undefined,
    href: normalizePath(apiItem.Path || '') || undefined,
    isMenu: apiItem.IsMenu,
    children: children && children.length > 0 ? children : undefined,
  }
}

function convertApiMenuItemToMenuItem(
  apiItem: ApiMenuItem
): { item: MenuItem | null; extractedChildren: MenuItem[] } {
  const processedChildren = apiItem.Children
    ? apiItem.Children.map(convertApiMenuItemToMenuItem)
    : []

  const children: MenuItem[] = []
  const extractedChildren: MenuItem[] = []

  for (const { item, extractedChildren: childExtracted } of processedChildren) {
    if (item !== null) {
      children.push(item)
    }
    extractedChildren.push(...childExtracted)
  }

  if (!apiItem.IsMenu) {
    return {
      item: null,
      extractedChildren: [...children, ...extractedChildren],
    }
  }

  if (!apiItem.Path && children.length === 0) {
    return {
      item: null,
      extractedChildren,
    }
  }

  const allChildren = [...children, ...extractedChildren]

  return {
    item: {
      id: apiItem.PublicId,
      label: apiItem.Title,
      icon: apiItem.Icon || undefined,
      href: normalizePath(apiItem.Path || '') || undefined,
      children: allChildren.length > 0 ? allChildren : undefined,
    },
    extractedChildren: [],
  }
}

export function useMenu() {
  const menuStore = useMenuStore()

  const menuQuery = useQuery({
    queryKey: ['menu', 'tree'],
    queryFn: async (): Promise<{ visibleItems: MenuItem[]; fullTree: MenuItemWithMeta[] }> => {
      const response = await apiClient.get<ApiMenuItem[]>(endpoints.menu.myTree)
      
      // Build full tree for path matching (includes non-menu items)
      const fullTree = response.data.map(convertApiMenuItemToFullTree)
      
      // Build visible menu items (excludes non-menu items)
      const processed = response.data.map(convertApiMenuItemToMenuItem)

      const menuItems: MenuItem[] = []
      const extractedChildren: MenuItem[] = []

      for (const { item, extractedChildren: extracted } of processed) {
        if (item !== null) {
          menuItems.push(item)
        }
        extractedChildren.push(...extracted)
      }

      return {
        visibleItems: [...menuItems, ...extractedChildren],
        fullTree,
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  watch(
    () => menuQuery.data.value,
    (data) => {
      if (data) {
        menuStore.setMenuItems(data.visibleItems)
        menuStore.setFullMenuTree(data.fullTree)
      }
    },
    { immediate: true }
  )

  return {
    menuItems: computed(() => menuStore.menuItems),
    fullMenuTree: computed(() => menuStore.fullMenuTree),
    activeMenuItemId: computed(() => menuStore.activeMenuItemId),
    setActiveMenuItem: menuStore.setActiveMenuItem,
    fetchMenu: menuQuery.refetch,
    isLoadingMenu: computed(() => menuQuery.isLoading.value),
    isError: computed(() => menuQuery.isError.value),
    error: computed(() => menuQuery.error.value),
  }
}

