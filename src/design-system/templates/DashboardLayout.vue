<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import Sidebar from '../organisms/Sidebar.vue'
import MobileBottomBar from '../organisms/MobileBottomBar.vue'
import Header from '../organisms/HeaderLayout.vue'
import CommandPalette from '../organisms/CommandPalette.vue'
import Modal from '../molecules/Modal.vue'
import HelpCenter from '../organisms/HelpCenter.vue'
import NotificationsPanel from '../organisms/NotificationsPanel.vue'
import SessionsModal from '../organisms/SessionsModal.vue'
import BaseButton from '../atoms/BaseButton.vue'
import BaseIcon from '../atoms/BaseIcon.vue'
import { useMenu } from '@/shared/composables/useMenu'
import { useSessionModalStore } from '@/stores/sessionModal'
import type { MenuItem } from '../organisms/Sidebar.vue'
import type { CommandItem } from '../organisms/CommandPalette.vue'

export interface DashboardLayoutProps {
  activeMenuItemId?: string
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

// Session modal
const sessionModalStore = useSessionModalStore()

const handleSessionModalContinue = () => {
  sessionModalStore.continueWithToken()
}

const handleRevokeSession = async (sessionPublicId: string) => {
  await sessionModalStore.revokeSession(sessionPublicId)
}

// Provide functions to child components
provide('closeMobileMenu', closeMobileMenu)
provide('isSidebarCollapsed', isSidebarCollapsed)
provide('toggleSidebarCollapse', toggleSidebarCollapse)
</script>

<template>
  <div class="min-h-screen bg-background-primary relative">
    <Header
      @search="emit('search', $event)"
      @user-menu-click="emit('user-menu-click')"
      @notification-click="handleNotificationClick"
      @help-click="handleHelpClick"
      @menu-toggle="toggleMobileMenu"
    />

    <!-- Mobile: bottom sheet overlay -->
    <Transition name="sheet-overlay">
      <div
        v-if="showMobileMenu"
        class="fixed inset-0 z-40 lg:hidden bg-black/40 backdrop-blur-sm"
        @click="closeMobileMenu"
      />
    </Transition>

    <!-- Mobile: menu bottom sheet (slide up from bottom) -->
    <Transition name="sheet">
      <div
        v-if="showMobileMenu"
        class="mobile-menu-sheet fixed bottom-0 left-0 right-0 z-50 lg:hidden max-h-[75vh] flex flex-col rounded-t-2xl overflow-hidden bg-card-background border border-b-0 border-border-default shadow-[0_-1px_0_0_var(--border-default),0_-24px_48px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_-1px_0_0_var(--border-default),0_-24px_48px_-12px_rgba(0,0,0,0.5)]"
        style="padding-bottom: env(safe-area-inset-bottom, 0)"
      >
        <div class="flex items-center justify-between py-3 px-4 flex-shrink-0 border-b border-border-default/80 bg-muted/30 dark:bg-muted/20">
          <span class="text-base font-semibold text-foreground">منو</span>
          <BaseButton variant="ghost" size="icon" class="rounded-xl -me-1" @click="closeMobileMenu" aria-label="بستن منو">
            <BaseIcon name="X" :size="20" :stroke-width="2" />
          </BaseButton>
        </div>
        <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <Sidebar
            variant="sheet"
            :menu-items="menuItems"
            :active-menu-item-id="activeMenu"
            @update:active-menu-item-id="
              (id: string) => {
                activeMenu = id
              }
            "
            @menu-item-click="handleMenuItemClick"
          />
        </div>
      </div>
    </Transition>

    <!-- Desktop: sidebar (fixed right) -->
    <Sidebar
      :menu-items="menuItems"
      :active-menu-item-id="activeMenu"
      :class="['hidden lg:block']"
      @update:active-menu-item-id="
        (id: string) => {
          activeMenu = id
        }
      "
      @menu-item-click="handleMenuItemClick"
    />

    <!-- Mobile: bottom bar -->
    <MobileBottomBar
      class="lg:hidden"
      :menu-open="showMobileMenu"
      @open-menu="() => (showMobileMenu = true)"
    />

    <main
      :class="[
        'flex-1 p-4 sm:p-5 md:p-6 transition-all duration-300 lg:pl-6 pb-20 lg:pb-6',
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

    <!-- Session Modal -->
    <SessionsModal
      v-model="sessionModalStore.showModal"
      :sessions="sessionModalStore.sessions"
      :sessions-info="sessionModalStore.sessionsInfo"
      :revoking-session-id="sessionModalStore.revokingSessionId"
      :show-continue="true"
      @continue="handleSessionModalContinue"
      @revoke-session="handleRevokeSession"
      @close="sessionModalStore.closeModal"
    />
  </div>
</template>

<style scoped>
/* Mobile bottom sheet: slide from bottom */
.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.25s ease-out;
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}
.sheet-enter-to,
.sheet-leave-from {
  transform: translateY(0);
}

/* Overlay fade */
.sheet-overlay-enter-active,
.sheet-overlay-leave-active {
  transition: opacity 0.2s ease-out;
}
.sheet-overlay-enter-from,
.sheet-overlay-leave-to {
  opacity: 0;
}
.sheet-overlay-enter-to,
.sheet-overlay-leave-from {
  opacity: 1;
}
</style>
