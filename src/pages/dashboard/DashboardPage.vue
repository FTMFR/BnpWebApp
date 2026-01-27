<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { DashboardLayout, CommandPalette } from '@/design-system'
import { CustomLoader } from '@/design-system/atoms'
import { useAuth } from '@/shared/composables/useAuth'
import { useGlobalSearch } from '@/shared/composables/useGlobalSearch'
import { useUserInfo } from '@/shared/composables/useUserInfo'
import { getCurrentJalaliDate } from '@/shared/utils/utils'
export interface Menu {
  id: number
  publicId: string
  title: string
  path: string | null
  parentPublicId: string | null
  zamanInsert: string
  zamanLastEdit: string | null
}

export interface MenuFilters {
  title: string
  path: string
  parentPublicId: string
}


const { fetchUser, isLoadingUser } = useAuth()
const { searchItems } = useGlobalSearch()

const showCommandPalette = ref(false)
const { userInfo } = useUserInfo()
let commandPaletteHandler: ((event: KeyboardEvent) => void) | null = null

onMounted(() => {
  fetchUser()

  commandPaletteHandler = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault()
      showCommandPalette.value = true
    }
  }

  document.addEventListener('keydown', commandPaletteHandler)
})

onUnmounted(() => {
  if (commandPaletteHandler) {
    document.removeEventListener('keydown', commandPaletteHandler)
  }
})

const handleSearch = (query: string) => {
  if (query.trim()) {
    showCommandPalette.value = true
  }
}

const handleUserMenuClick = () => {
  // User menu is now handled by UserMenuDropdown in Header component
}

const handleNotificationClick = () => {
  // Handled by DashboardLayout
}

const handleHelpClick = () => {
  // Handled by DashboardLayout
}
</script>

<template>
  <div v-if="isLoadingUser" class="flex items-center justify-center min-h-screen">
    <CustomLoader size="lg" />
  </div>
  <DashboardLayout
    v-else
    @search="handleSearch"
    @user-menu-click="handleUserMenuClick"
    @notification-click="handleNotificationClick"
    @help-click="handleHelpClick"
  >
    <div class="space-y-4 sm:space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground mb-2">
            خوش آمدید، {{ userInfo.firstName }} {{ userInfo.lastName }} 👋
          </h1>
          <p class="text-muted-foreground mt-4">این خلاصه‌ای از فعالیت‌های امروز شماست</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="flex items-center gap-2 px-4 py-2 bg-white text-black border border-border rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors"
          >
            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>امروز: {{ getCurrentJalaliDate() }}</span>
          </button>
          <button
            class="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <span>درخواست وام جدید</span>
            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="bg-card-background border border-border-default rounded-xl mt-4 p-4 sm:p-6">
      <p class="text-sm sm:text-base text-muted-foreground">
        محتوای داشبورد در اینجا نمایش داده می‌شود
      </p>
    </div>

    <CommandPalette v-model="showCommandPalette" :items="searchItems" />
  </DashboardLayout>
</template>
