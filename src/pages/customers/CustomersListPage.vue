<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { DashboardLayout } from '@/design-system/templates'
import type { UserInfo } from '@/design-system/organisms'
import { BaseSpinner } from '@/design-system/atoms'
import { useAuth } from '@/shared/composables/useAuth'
import type { AuthUser } from '@/stores/auth'
import { getAvatarInitial } from '@/shared/utils/user'

const { user, fetchUser, isLoadingUser } = useAuth()

// Fetch user info on mount
onMounted(() => {
  fetchUser()
})

// Convert AuthUser to UserInfo for DashboardLayout
const userInfo = computed<UserInfo>(() => {
  const currentUser = user.value as AuthUser | null
  if (!currentUser) {
    return {
      firstName: 'کاربر',
      lastName: 'سیستم',
      email: '',
      avatarName: 'ک',
    }
  }

  const avatarInitial = getAvatarInitial(currentUser.FirstName, currentUser.LastName)

  return {
    firstName: currentUser.FirstName,
    lastName: currentUser.LastName || '',
    email: currentUser.Email,
    avatarName: avatarInitial,
  }
})

const logo = {
  text: 'سیستم مدیریت وام',
  subtext: 'پنل مدیریت',
}

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
    :user-info="userInfo"
    :logo="logo"
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
