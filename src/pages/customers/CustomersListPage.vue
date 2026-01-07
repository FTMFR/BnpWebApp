<script setup lang="ts">
import { onMounted } from 'vue'
import { DashboardLayout } from '@/design-system/templates'
import { BaseSpinner } from '@/design-system/atoms'
import { useAuth } from '@/shared/composables/useAuth'

const { fetchUser, isLoadingUser } = useAuth()

// Fetch user info on mount
onMounted(() => {
  fetchUser()
})

const handleSearch = (query: string) => {
  console.log('Global search:', query)
  // TODO: Implement global search
}

const handleUserMenuClick = () => {
  console.log('User menu clicked')
  // TODO: show user menu dropdown
}

const handleNotificationClick = () => {
  console.log('Notification clicked')
  // TODO: show notifications
}

const handleHelpClick = () => {
  console.log('Help clicked')
  // TODO: show help
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
    <div class="flex items-center justify-center min-h-[60vh] p-4 sm:p-6">
      <div class="text-center max-w-md">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-muted-foreground mb-2 sm:mb-3">
          صفحه غیرفعال
        </h2>
        <p class="text-sm sm:text-base text-muted-foreground">
          این صفحه در حال حاضر در دسترس نیست.
        </p>
      </div>
    </div>
  </DashboardLayout>
</template>
