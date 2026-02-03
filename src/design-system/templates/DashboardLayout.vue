<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import { useRouter } from 'vue-router'
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

export interface SearchTarget {
  id: string
  label: string
  href: string
  icon?: string
}

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

const router = useRouter()
const {
  menuItems,
  fullMenuTree,
  activeMenuItemId: storeActiveMenuItemId,
  setActiveMenuItem,
  fetchMenu,
} = useMenu()

onMounted(() => {
  fetchMenu()
})

const commandOpen = ref(false)
const showMobileMenu = ref(false)
const showMobileSearch = ref(false)
const isSidebarCollapsed = ref(false)
const mobileSearchQuery = ref('')

/** Flatten menu tree into search targets (label, href, icon) for global search */
function flattenMenuToSearchTargets(
  items: Array<{ id: string; label: string; href?: string; icon?: string; children?: unknown[] }>,
  out: SearchTarget[] = [],
): SearchTarget[] {
  for (const item of items) {
    if (item.href) {
      out.push({
        id: item.id,
        label: item.label,
        href: item.href,
        icon: item.icon,
      })
    }
    if (item.children && Array.isArray(item.children)) {
      flattenMenuToSearchTargets(
        item.children as Array<{
          id: string
          label: string
          href?: string
          icon?: string
          children?: unknown[]
        }>,
        out,
      )
    }
  }
  return out
}

const staticSearchTargets: SearchTarget[] = [
  { id: '_dashboard', label: 'خانه', href: '/dashboard', icon: 'Home' },
  { id: '_profile', label: 'پروفایل', href: '/profile', icon: 'User' },
  { id: '_settings', label: 'تنظیمات', href: '/settings', icon: 'Settings' },
]

const allSearchTargets = computed<SearchTarget[]>(() => {
  const fromMenu = flattenMenuToSearchTargets(fullMenuTree.value || [])
  const seen = new Set(staticSearchTargets.map((s) => s.href))
  const fromMenuDeduped = fromMenu.filter((s) => {
    if (seen.has(s.href)) return false
    seen.add(s.href)
    return true
  })
  return [...staticSearchTargets, ...fromMenuDeduped]
})

const filteredSearchTargets = computed<SearchTarget[]>(() => {
  const q = mobileSearchQuery.value.trim()
  if (!q) return allSearchTargets.value
  const lower = q.toLowerCase()
  return allSearchTargets.value.filter((t) => t.label.toLowerCase().includes(lower))
})

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

const openMobileSearch = () => {
  showMobileSearch.value = true
  mobileSearchQuery.value = ''
}

const closeMobileSearch = () => {
  showMobileSearch.value = false
  mobileSearchQuery.value = ''
}

const onSearchTargetSelect = (target: SearchTarget) => {
  router.push(target.href)
  setActiveMenuItem(target.id)
  closeMobileSearch()
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
provide('closeMobileSearch', closeMobileSearch)
provide('isSidebarCollapsed', isSidebarCollapsed)
provide('toggleSidebarCollapse', toggleSidebarCollapse)
</script>

<template>
  <div class="flex flex-col h-screen min-h-0 overflow-hidden bg-background-primary relative">
    <header class="flex-shrink-0 w-full">
      <Header
        @search="emit('search', $event)"
        @user-menu-click="emit('user-menu-click')"
        @notification-click="handleNotificationClick"
        @help-click="handleHelpClick"
        @menu-toggle="toggleMobileMenu"
      />
    </header>

    <!-- Mobile: bottom sheet overlay (menu) -->
    <Transition name="sheet-overlay">
      <div
        v-if="showMobileMenu"
        class="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm"
        @click="closeMobileMenu"
      />
    </Transition>

    <!-- Mobile: search overlay -->
    <Transition name="sheet-overlay">
      <div
        v-if="showMobileSearch"
        class="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm"
        @click="closeMobileSearch"
      />
    </Transition>

    <!-- Mobile: search bottom sheet – search box at top, results below -->
    <Transition name="sheet-slide">
      <div
        v-if="showMobileSearch"
        class="mobile-search-sheet fixed bottom-0 left-0 right-0 z-50 md:hidden flex flex-col h-[75vh] max-h-[75vh] rounded-t-2xl overflow-hidden bg-card-background border border-b-0 border-border-default shadow-[0_-1px_0_0_var(--border-default),0_-24px_48px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_-1px_0_0_var(--border-default),0_-24px_48px_-12px_rgba(0,0,0,0.5)]"
        style="padding-bottom: env(safe-area-inset-bottom, 0)"
      >
        <div
          class="flex flex-col gap-3 py-3 px-4 flex-shrink-0 border-b border-border-default/80 bg-muted/30 dark:bg-muted/20"
        >
          <div class="flex items-center justify-between">
            <span class="text-base font-semibold text-foreground">جستجو در برنامه</span>
            <BaseButton
              variant="ghost"
              size="icon"
              class="rounded-xl -me-1"
              @click="closeMobileSearch"
              aria-label="بستن جستجو"
            >
              <BaseIcon name="X" :size="20" :stroke-width="2" />
            </BaseButton>
          </div>
          <div class="relative flex-shrink-0">
            <BaseIcon
              name="Search"
              :size="18"
              :stroke-width="2"
              icon-class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
            />
            <input
              v-model="mobileSearchQuery"
              type="text"
              placeholder="جستجو در کل برنامه..."
              class="w-full pr-10 pl-4 py-2.5 bg-background border border-border-default rounded-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-foreground placeholder:text-muted-foreground"
              autofocus
            />
          </div>
        </div>
        <div
          class="sheet-menu-scroll sheet-menu-scroll--pb flex-1 min-h-0 overflow-y-auto overscroll-contain"
        >
          <button
            v-for="target in filteredSearchTargets"
            :key="target.id"
            type="button"
            class="flex items-center gap-3 w-full px-4 py-3 text-right rounded-xl hover:bg-muted/60 dark:hover:bg-muted/40 active:bg-muted/80 transition-colors"
            @click="onSearchTargetSelect(target)"
          >
            <span
              class="flex w-9 h-9 rounded-lg items-center justify-center flex-shrink-0 bg-muted/50 dark:bg-muted/30"
            >
              <BaseIcon
                :name="target.icon || 'Circle'"
                :size="18"
                :stroke-width="2"
                icon-class="text-foreground"
              />
            </span>
            <span class="text-sm font-medium text-foreground">{{ target.label }}</span>
          </button>
          <p
            v-if="mobileSearchQuery.trim() && filteredSearchTargets.length === 0"
            class="px-4 py-6 text-sm text-muted-foreground text-center"
          >
            نتیجه‌ای یافت نشد.
          </p>
        </div>
      </div>
    </Transition>

    <!-- Mobile: menu bottom sheet (slide up from bottom) – full sidebar menu -->
    <Transition name="sheet-slide">
      <div
        v-if="showMobileMenu"
        class="mobile-menu-sheet fixed bottom-0 left-0 right-0 z-50 md:hidden flex flex-col h-[75vh] max-h-[75vh] rounded-t-2xl overflow-hidden bg-card-background border border-b-0 border-border-default shadow-[0_-1px_0_0_var(--border-default),0_-24px_48px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_-1px_0_0_var(--border-default),0_-24px_48px_-12px_rgba(0,0,0,0.5)]"
        style="padding-bottom: env(safe-area-inset-bottom, 0)"
      >
        <div
          class="flex items-center justify-between py-3 px-4 flex-shrink-0 border-b border-border-default/80 bg-muted/30 dark:bg-muted/20"
        >
          <span class="text-base font-semibold text-foreground">منو</span>
          <BaseButton
            variant="ghost"
            size="icon"
            class="rounded-xl -me-1"
            @click="closeMobileMenu"
            aria-label="بستن منو"
          >
            <BaseIcon name="X" :size="20" :stroke-width="2" />
          </BaseButton>
        </div>
        <div
          class="sheet-menu-scroll sheet-menu-scroll--pb flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col"
        >
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

    <!-- Desktop: sidebar (fixed right) – md and up, same as lg -->
    <Sidebar
      :menu-items="menuItems"
      :active-menu-item-id="activeMenu"
      :class="['hidden md:block']"
      @update:active-menu-item-id="
        (id: string) => {
          activeMenu = id
        }
      "
      @menu-item-click="handleMenuItemClick"
    />

    <!-- Mobile: bottom bar -->
    <MobileBottomBar
      class="md:hidden"
      :menu-open="showMobileMenu"
      :search-open="showMobileSearch"
      @open-menu="() => (showMobileMenu = true)"
      @open-search="openMobileSearch"
    />

    <main
      :class="[
        'flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 md:p-6 transition-all duration-300 md:pl-6 main-mobile-pb md:pb-6 main-content',
        isSidebarCollapsed ? 'md:pr-[7rem]' : 'md:pr-[18rem]',
      ]"
    >
      <div class="main-content-inner">
        <slot />
      </div>
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
/* Main content: extra bottom padding on mobile so forms are scrollable and bottom stays above the bottom bar */
@media (max-width: 767px) {
  .main-mobile-pb {
    padding-bottom: max(8rem, calc(5rem + env(safe-area-inset-bottom, 0px)));
  }
}

/* Main content area: scroll-y so long forms are reachable; bottom padding keeps form above bottom bar */
main {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Menu sheet: vertical scroll when content overflows */
.sheet-menu-scroll {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
/* Padding at bottom of menu list so last items are visible above the bottom bar */
.sheet-menu-scroll--pb {
  padding-bottom: max(8rem, calc(5rem + env(safe-area-inset-bottom, 0px)));
}

/* Mobile bottom sheet: slide up from bottom (bottom → top) */
.sheet-slide-enter-active,
.sheet-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateY(100%);
}
.sheet-slide-enter-to,
.sheet-slide-leave-from {
  transform: translateY(0);
}

/* Overlay fade */
.sheet-overlay-enter-active,
.sheet-overlay-leave-active {
  transition: opacity 0.25s ease-out;
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
