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
    queryFn: async (): Promise<MenuItem[]> => {
      const response = await apiClient.get<ApiMenuItem[]>(endpoints.menu.myTree)
      const processed = response.data.map(convertApiMenuItemToMenuItem)

      const menuItems: MenuItem[] = []
      const extractedChildren: MenuItem[] = []

      for (const { item, extractedChildren: extracted } of processed) {
        if (item !== null) {
          menuItems.push(item)
        }
        extractedChildren.push(...extracted)
      }

      return [...menuItems, ...extractedChildren]
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  watch(
    () => menuQuery.data.value,
    (data) => {
      if (data) {
        menuStore.setMenuItems(data)
      }
    },
    { immediate: true }
  )

  return {
    menuItems: computed(() => menuStore.menuItems),
    activeMenuItemId: computed(() => menuStore.activeMenuItemId),
    setActiveMenuItem: menuStore.setActiveMenuItem,
    fetchMenu: menuQuery.refetch,
    isLoadingMenu: computed(() => menuQuery.isLoading.value),
    isError: computed(() => menuQuery.isError.value),
    error: computed(() => menuQuery.error.value),
  }
}

