<script setup lang="ts">
import { onMounted } from 'vue'
import { DashboardLayout } from '@/design-system/templates'
import { CustomLoader } from '@/design-system/atoms'
import { useAuth } from '@/shared/composables/useAuth'

const { fetchUser, isLoadingUser } = useAuth()

// Fetch user info on mount
onMounted(() => {
  fetchUser()
})

const handleSearch = (_query: string) => {
  // TODO(UX): Implement global search
}

const handleUserMenuClick = () => {
  // TODO(UX): show user menu dropdown
}

const handleNotificationClick = () => {
  // TODO(UX): show notifications
}

const handleHelpClick = () => {
  // TODO(UX): show help
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
    <div class="flex items-center justify-center min-h-[60vh] p-4 sm:p-6 min-w-0 overflow-x-auto">
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
