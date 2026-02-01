<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import BaseAvatar from '../atoms/BaseAvatar.vue'
import BaseIcon from '../atoms/BaseIcon.vue'
import BaseBadge from '../atoms/BaseBadge.vue'
import UserMenuDropdown from './UserMenuDropdown.vue'
import { useTheme } from '@/design-system/utilities/useTheme'
import { useNotifications } from '@/shared/composables/useNotifications'
import { useUserInfo, type UserInfo } from '@/shared/composables/useUserInfo'
import { RouterLink } from 'vue-router'

export interface HeaderProps {
  showSearch?: boolean
  showNotifications?: boolean
  showHelp?: boolean
  searchPlaceholder?: string
}

export type { UserInfo }

const props = withDefaults(defineProps<HeaderProps>(), {
  showSearch: true,
  showNotifications: true,
  showHelp: true,
  searchPlaceholder: 'جستجو در سیستم',
})

// Use props in template
const { showSearch, showNotifications, showHelp, searchPlaceholder } = props

// Get user info from composable
const { userInfo } = useUserInfo()

const logo = {
  text: 'نرم افزار ابری پاسارگاد',
  subtext: 'پنل مدیریت',
}

const emit = defineEmits<{
  search: [query: string]
  'user-menu-click': []
  'notification-click': []
  'help-click': []
  'menu-toggle': []
}>()

const showUserMenu = ref(false)

const searchQuery = ref('')

const fullName = computed(() => {
  return `${userInfo.value.firstName} ${userInfo.value.lastName}`
})

const avatarName = computed(() => {
  return userInfo.value.avatarName || fullName.value
})

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const { theme, toggleTheme } = useTheme()
const isDark = computed(() => theme.value === 'dark')
const { unreadCount } = useNotifications()

// Sidebar collapse toggle function (only for desktop)
const toggleSidebarCollapse = inject<(() => void) | undefined>('toggleSidebarCollapse')
</script>

<template>
  <header
    class="sticky top-0 z-sticky bg-card-background border-b-2 border-border-default shadow-lg w-full"
  >
    <div
      class="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 py-3 sm:py-4 w-full"
    >
      <!-- سمت راست: لوگو + دکمه toggle سایدبار (دسکتاپ) + جستجو -->
      <div class="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 flex-shrink-0">
        <!-- Desktop Sidebar Toggle Button -->
        <button
          v-if="toggleSidebarCollapse"
          @click="toggleSidebarCollapse"
          class="group hidden lg:flex w-9 h-9 rounded-lg bg-card-background border border-border-default flex items-center justify-center cursor-pointer transition-all hover:bg-primary-100 dark:hover:bg-primary-900/20 hover:border-primary-400 dark:hover:border-primary-700 flex-shrink-0"
          aria-label="Toggle Sidebar"
        >
          <BaseIcon
            name="Menu"
            :size="18"
            :stroke-width="2"
            icon-class="text-foreground group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors"
          />
        </button>

        <!-- Logo Section -->
        <RouterLink to="/dashboard" class="flex items-center gap-2 sm:gap-3 group !bg-transparent">
          <div
            class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <img src="/img/bnp-logo.png" alt="bnp-logo" class="w-full h-full object-cover" />
          </div>
          <div class="min-w-0 hidden sm:block">
            <h1 class="text-sm sm:text-base font-bold text-foreground truncate">
              {{ logo?.text || 'نرم‌افزار ابری' }}
            </h1>
            <p v-if="logo?.subtext" class="text-xs text-muted-foreground truncate">
              {{ logo.subtext }}
            </p>
          </div>
        </RouterLink>

        <!-- Search Box - با فاصله بیشتر از لوگو -->
        <div
          v-if="showSearch"
          class="relative w-48 sm:w-56 md:w-64 lg:w-72 hidden md:block flex-shrink-0 md:mr-2 lg:mr-4"
        >
          <BaseIcon
            name="Search"
            :size="16"
            :stroke-width="2"
            icon-class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-secondary pointer-events-none z-10"
          />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full pr-10 pl-4 py-2 bg-secondary/20 dark:bg-card-background dark:border-border-default border border-border-default/50 rounded-lg focus:bg-background dark:focus:bg-card-background focus:dark:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 placeholder:text-muted-foreground/60 dark:placeholder:text-muted-foreground/70 text-foreground dark:text-foreground"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <!-- سمت چپ: تم تاگل + اعلانات + پروفایل -->
      <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button
          @click="toggleTheme"
          class="group w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-card-background border border-border-default flex items-center justify-center cursor-pointer transition-all shadow-sm hover:bg-primary-100 dark:hover:bg-primary-900/20 hover:border-primary-400 dark:hover:border-primary-700 hover:scale-105"
          aria-label="Toggle Dark Mode"
        >
          <BaseIcon
            :name="isDark ? 'Sun' : 'Moon'"
            :size="18"
            :stroke-width="2"
            :icon-class="
              isDark
                ? 'text-warning-500 group-hover:text-warning-600 dark:group-hover:text-warning-400'
                : 'text-primary-500 group-hover:text-primary-700 dark:group-hover:text-primary-400'
            "
            class="sm:w-5 sm:h-5 transition-colors"
          />
        </button>

        <button
          v-if="showHelp"
          class="group hidden sm:flex p-2 hover:bg-primary-100 dark:hover:bg-gray-300/20 rounded-lg transition-colors"
          @click="emit('help-click')"
          aria-label="Help"
        >
          <BaseIcon
            name="HelpCircle"
            :size="18"
            :stroke-width="2"
            icon-class="text-muted-foreground group-hover:text-primary-700 dark:group-hover:text-gray-100 sm:w-5 sm:h-5 transition-colors"
          />
        </button>

        <button
          v-if="showNotifications"
          class="group relative p-2 hover:bg-primary-100 dark:hover:bg-gray-300/20 rounded-lg transition-colors"
          @click="emit('notification-click')"
          aria-label="Notifications"
        >
          <BaseIcon
            name="Bell"
            :size="18"
            :stroke-width="2"
            icon-class="text-muted-foreground group-hover:text-primary-700 dark:group-hover:text-gray-100 sm:w-5 sm:h-5 transition-colors"
          />
          <BaseBadge
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs p-0 !bg-danger-500 !text-white dark:!bg-danger-100 dark:!text-danger-700 leading-none"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </BaseBadge>
        </button>

        <UserMenuDropdown @close="showUserMenu = false">
          <template #default="{ isOpen }">
            <div
              class="group flex items-center gap-2 px-2 py-1 hover:bg-primary-100 dark:hover:bg-gray-300/20 rounded-lg transition-colors cursor-pointer"
              @click="emit('user-menu-click')"
            >
              <BaseIcon
                name="ChevronDown"
                :size="16"
                :stroke-width="2"
                :icon-class="[
                  'text-muted-foreground group-hover:text-primary-700 dark:group-hover:text-gray-100 transition-all',
                  isOpen ? 'rotate-180' : '',
                ]"
              />
              <div class="hidden lg:block text-right">
                <p class="text-sm font-semibold">{{ fullName }}</p>
                <p v-if="userInfo.email" class="text-xs text-muted-foreground">
                  {{ userInfo.email }}
                </p>
              </div>
              <BaseAvatar
                :src="userInfo.avatar"
                :name="avatarName"
                size="sm"
                class="sm:!w-9 sm:!h-9 md:!w-10 md:!h-10"
              />
            </div>
          </template>
        </UserMenuDropdown>
      </div>
    </div>
  </header>
</template>
