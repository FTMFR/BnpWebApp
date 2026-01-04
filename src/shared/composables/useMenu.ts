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

function convertApiMenuItemToMenuItem(apiItem: ApiMenuItem): MenuItem | null {
  const children = apiItem.Children
    ? apiItem.Children.map(convertApiMenuItemToMenuItem).filter((item): item is MenuItem => item !== null)
    : []

  if (!apiItem.Path && children.length === 0) {
    return null
  }

  return {
    id: apiItem.PublicId,
    label: apiItem.Title,
    icon: apiItem.Icon || undefined,
    href: apiItem.Path ? normalizePath(apiItem.Path) : undefined,
    children: children.length > 0 ? children : undefined,
  }
}

export function useMenu() {
  const menuStore = useMenuStore()

  const menuQuery = useQuery({
    queryKey: ['menu', 'tree'],
    queryFn: async (): Promise<MenuItem[]> => {
      const response = await apiClient.get<ApiMenuItem[]>(endpoints.menu.myTree)
      return response.data
        .map(convertApiMenuItemToMenuItem)
        .filter((item): item is MenuItem => item !== null)
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
