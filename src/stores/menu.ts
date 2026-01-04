import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { MenuItem } from '@/design-system'

export const useMenuStore = defineStore('menu', () => {
  const menuItems = ref<MenuItem[]>([])
  const activeMenuItemId = ref<string>('')

  function setMenuItems(items: MenuItem[]) {
    menuItems.value = items
  }

  function setActiveMenuItem(id: string) {
    activeMenuItemId.value = id
  }

  function clearMenu() {
    menuItems.value = []
    activeMenuItemId.value = ''
  }

  return {
    menuItems,
    activeMenuItemId,
    setMenuItems,
    setActiveMenuItem,
    clearMenu,
  }
})

