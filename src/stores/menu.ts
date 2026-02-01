import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { MenuItem } from '@/design-system'
import type { MenuItemWithMeta } from '@/shared/composables/useMenu'

export const useMenuStore = defineStore('menu', () => {
  const menuItems = ref<MenuItem[]>([])
  const fullMenuTree = ref<MenuItemWithMeta[]>([])
  const activeMenuItemId = ref<string>('')

  function setMenuItems(items: MenuItem[]) {
    menuItems.value = items
  }

  function setFullMenuTree(items: MenuItemWithMeta[]) {
    fullMenuTree.value = items
  }

  function setActiveMenuItem(id: string) {
    activeMenuItemId.value = id
  }

  function clearMenu() {
    menuItems.value = []
    fullMenuTree.value = []
    activeMenuItemId.value = ''
  }

  return {
    menuItems,
    fullMenuTree,
    activeMenuItemId,
    setMenuItems,
    setFullMenuTree,
    setActiveMenuItem,
    clearMenu,
  }
})

