<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import Sidebar from '../organisms/Sidebar.vue'
import Header from '../organisms/HeaderLayout.vue'
import CommandPalette from '../organisms/CommandPalette.vue'
import Modal from '../molecules/Modal.vue'
import HelpCenter from '../organisms/HelpCenter.vue'
import NotificationsPanel from '../organisms/NotificationsPanel.vue'
import { useMenu } from '@/shared/composables/useMenu'
import type { MenuItem } from '../organisms/Sidebar.vue'
import type { UserInfo } from '../organisms/HeaderLayout.vue'
import type { CommandItem } from '../organisms/CommandPalette.vue'

export interface DashboardLayoutProps {
  userInfo: UserInfo
  activeMenuItemId?: string
  logo?: {
    text: string
    subtext?: string
  }
  commandPaletteItems?: CommandItem[]
}

const props = defineProps<DashboardLayoutProps>()

const emit = defineEmits<{
  'update:activeMenuItemId': [id: string]
  'menu-item-click': [item: MenuItem]
  search: [query: string]
  'user-menu-click': []
  'notification-click': []
  'help-click': []
}>()

const {
  menuItems,
  activeMenuItemId: storeActiveMenuItemId,
  setActiveMenuItem,
  fetchMenu,
} = useMenu()

onMounted(() => {
  fetchMenu()
})

const commandOpen = ref(false)
const showMobileMenu = ref(false)
const isSidebarCollapsed = ref(false)

const activeMenu = computed({
  get: () => props.activeMenuItemId || storeActiveMenuItemId.value,
  set: (id: string) => {
    setActiveMenuItem(id)
    emit('update:activeMenuItemId', id)
  },
})

const handleMenuItemClick = (item: MenuItem) => {
  setActiveMenuItem(item.id)
  emit('menu-item-click', item)
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const toggleSidebarCollapse = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// Modal states
const showHelpModal = ref(false)
const showNotificationsModal = ref(false)

// Handle notification and help clicks
const handleNotificationClick = () => {
  showNotificationsModal.value = true
  emit('notification-click')
}

const handleHelpClick = () => {
  showHelpModal.value = true
  emit('help-click')
}

// Provide functions to child components
provide('closeMobileMenu', closeMobileMenu)
provide('isSidebarCollapsed', isSidebarCollapsed)
provide('toggleSidebarCollapse', toggleSidebarCollapse)
</script>

<template>
  <div class="min-h-screen bg-background-primary relative">
    <Header
      :user-info="userInfo"
      :logo="logo"
      @search="emit('search', $event)"
      @user-menu-click="emit('user-menu-click')"
      @notification-click="handleNotificationClick"
      @help-click="handleHelpClick"
      @menu-toggle="toggleMobileMenu"
    />

    <!-- Mobile Menu Overlay -->
    <div
      v-if="showMobileMenu"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="closeMobileMenu"
    ></div>

    <Sidebar
      :menu-items="menuItems"
      :active-menu-item-id="activeMenu"
      :class="['lg:block', showMobileMenu ? 'block' : 'hidden']"
      @update:active-menu-item-id="
        (id: string) => {
          activeMenu = id
        }
      "
      @menu-item-click="handleMenuItemClick"
    />

    <main
      :class="[
        'flex-1 p-4 sm:p-5 md:p-6 transition-all duration-300 lg:pl-6',
        isSidebarCollapsed ? 'lg:pr-[7rem]' : 'lg:pr-[18rem]',
      ]"
    >
      <slot />
    </main>

    <CommandPalette
      v-if="commandPaletteItems"
      v-model="commandOpen"
      :items="commandPaletteItems"
      @select="(item: CommandItem) => item.action()"
    />

    <!-- Global Modals -->
    <Modal v-model="showNotificationsModal" title="اعلان‌ها" size="md">
      <NotificationsPanel />
    </Modal>

    <Modal v-model="showHelpModal" title="مرکز راهنما" size="lg">
      <HelpCenter />
    </Modal>
  </div>
</template>
