<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { DashboardLayout, CommandPalette } from '@/design-system'
import { BaseSpinner } from '@/design-system/atoms'
import { useAuth } from '@/shared/composables/useAuth'
import { useGlobalSearch } from '@/shared/composables/useGlobalSearch'
import type { AuthUser } from '@/stores/auth'

const { user, fetchUser, isLoadingUser } = useAuth()
const { searchItems } = useGlobalSearch()

const showCommandPalette = ref(false)

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

// Get user info for display in template
const userInfo = computed(() => {
  const currentUser = user.value as AuthUser | null
  if (!currentUser) {
    return {
      firstName: 'کاربر',
      lastName: 'سیستم',
    }
  }
  return {
    firstName: currentUser.FirstName,
    lastName: currentUser.LastName || '',
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
    <BaseSpinner size="lg" />
  </div>
  <DashboardLayout
    v-else
    @search="handleSearch"
    @user-menu-click="handleUserMenuClick"
    @notification-click="handleNotificationClick"
    @help-click="handleHelpClick"
  >
    <div class="space-y-4 sm:space-y-6">
      <div>
        <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
          خوش آمدید، {{ userInfo.firstName }} {{ userInfo.lastName }} 👋
        </h1>
        <p class="text-sm sm:text-base text-muted-foreground">
          این خلاصه‌ای از فعالیت‌های امروز شماست
        </p>
      </div>

      <div class="bg-card-background border border-border-default rounded-xl p-4 sm:p-6">
        <p class="text-sm sm:text-base text-muted-foreground">
          محتوای داشبورد در اینجا نمایش داده می‌شود
        </p>
      </div>
    </div>

    <CommandPalette v-model="showCommandPalette" :items="searchItems" />
  </DashboardLayout>
</template>
