<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseIcon from '../atoms/BaseIcon.vue'
import BaseButton from '../atoms/BaseButton.vue'
import BaseBadge from '../atoms/BaseBadge.vue'
import { useNotifications, type Notification } from '@/shared/composables/useNotifications'

const router = useRouter()
const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = useNotifications()

const unreadNotifications = computed(() =>
  notifications.value.filter((n) => !n.read)
)
const readNotifications = computed(() =>
  notifications.value.filter((n) => n.read)
)

const getTypeIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'CheckCircle'
    case 'warning':
      return 'AlertTriangle'
    case 'error':
      return 'XCircle'
    case 'info':
    default:
      return 'Info'
  }
}

const getTypeColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'text-success-500'
    case 'warning':
      return 'text-warning-500'
    case 'error':
      return 'text-danger-500'
    case 'info':
    default:
      return 'text-primary-500'
  }
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'همین الان'
  if (diffMins < 60) return `${diffMins} دقیقه پیش`
  if (diffHours < 24) return `${diffHours} ساعت پیش`
  if (diffDays < 7) return `${diffDays} روز پیش`
  return date.toLocaleDateString('fa-IR')
}

const handleNotificationClick = (notification: Notification) => {
  if (!notification.read) {
    markAsRead(notification.id)
  }
  if (notification.link) {
    router.push(notification.link)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between pb-4 border-b border-border-default">
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold">اعلان‌ها</h3>
        <BaseBadge v-if="unreadCount > 0" variant="danger" size="sm">
          {{ unreadCount }} خوانده نشده
        </BaseBadge>
      </div>
      <BaseButton
        v-if="unreadCount > 0"
        variant="ghost"
        size="sm"
        @click="markAllAsRead"
      >
        همه را خوانده شده علامت بزن
      </BaseButton>
    </div>

    <!-- Notifications List -->
    <div class="space-y-2 max-h-96 overflow-y-auto">
      <!-- Unread Notifications -->
      <div v-if="unreadNotifications.length > 0" class="space-y-2">
        <div
          v-for="notification in unreadNotifications"
          :key="notification.id"
          class="flex items-start gap-3 p-3 bg-primary-50 border border-primary-200 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors"
          @click="handleNotificationClick(notification)"
        >
          <BaseIcon
            :name="getTypeIcon(notification.type)"
            :size="20"
            :icon-class="getTypeColor(notification.type)"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 mb-1">
              <h4 class="font-medium text-sm">{{ notification.title }}</h4>
              <button
                class="p-1 hover:bg-danger-100 rounded transition-colors"
                @click.stop="deleteNotification(notification.id)"
              >
                <BaseIcon name="X" :size="14" icon-class="text-muted-foreground" />
              </button>
            </div>
            <p class="text-sm text-muted-foreground mb-1">{{ notification.message }}</p>
            <span class="text-xs text-muted-foreground">{{ formatTime(notification.createdAt) }}</span>
          </div>
          <div class="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0"></div>
        </div>
      </div>

      <!-- Read Notifications -->
      <div v-if="readNotifications.length > 0" class="space-y-2">
        <div
          v-for="notification in readNotifications"
          :key="notification.id"
          class="flex items-start gap-3 p-3 bg-card-background border border-border-default rounded-lg cursor-pointer hover:bg-secondary transition-colors"
          @click="handleNotificationClick(notification)"
        >
          <BaseIcon
            :name="getTypeIcon(notification.type)"
            :size="20"
            :icon-class="getTypeColor(notification.type)"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 mb-1">
              <h4 class="font-medium text-sm text-muted-foreground">{{ notification.title }}</h4>
              <button
                class="p-1 hover:bg-danger-100 rounded transition-colors"
                @click.stop="deleteNotification(notification.id)"
              >
                <BaseIcon name="X" :size="14" icon-class="text-muted-foreground" />
              </button>
            </div>
            <p class="text-sm text-muted-foreground mb-1">{{ notification.message }}</p>
            <span class="text-xs text-muted-foreground">{{ formatTime(notification.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="notifications.length === 0"
        class="text-center py-8 text-muted-foreground"
      >
        <BaseIcon name="Bell" :size="48" icon-class="text-muted-foreground mx-auto mb-2" />
        <p>اعلانی وجود ندارد</p>
      </div>
    </div>
  </div>
</template>

