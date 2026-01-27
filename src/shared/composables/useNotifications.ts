import { ref, computed } from 'vue'
// TODO: Uncomment when API is ready
// import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
// import apiClient from '@/shared/api/client'
// import { endpoints } from '@/shared/api/endpoints'

export interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  createdAt: string
  link?: string
}

export function useNotifications() {
  // TODO: Uncomment when API is ready
  // const queryClient = useQueryClient()

  const notifications = ref<Notification[]>([])
  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  // TODO: Replace mock data with API call when endpoint is ready
  // Fetch notifications from API
  // const notificationsQuery = useQuery({
  //   queryKey: ['notifications'],
  //   queryFn: async (): Promise<Notification[]> => {
  //     try {
  //       const response = await apiClient.get<Notification[]>(endpoints.notifications.list)
  //       return response.data
  //     } catch (error) {
  //       console.error('Failed to fetch notifications:', error)
  //       return []
  //     }
  //   },
  //   refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  // })

  // TODO: Uncomment when API is ready
  // watch(
  //   () => notificationsQuery.data.value,
  //   (data) => {
  //     if (data) {
  //       notifications.value = data
  //     }
  //   },
  //   { immediate: true }
  // )

  // Mock data for now - will be replaced with API when ready
  notifications.value = [
    {
      id: 1,
      title: 'ورود ناموفق',
      message: 'تلاش برای ورود با نام کاربری "admin" ناموفق بود',
      type: 'warning',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      link: '/audit-log',
    },
    {
      id: 2,
      title: 'کاربر جدید ایجاد شد',
      message: 'کاربر "علی محمدی" با موفقیت ایجاد شد',
      type: 'success',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      link: '/api/users/list',
    },
    {
      id: 3,
      title: 'تغییر رمز عبور',
      message: 'رمز عبور شما با موفقیت تغییر یافت',
      type: 'info',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      id: 4,
      title: 'خطای سیستم',
      message: 'یک خطای غیرمنتظره در سیستم رخ داده است',
      type: 'error',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      link: '/audit-log',
    },
  ]

  // TODO: Uncomment when API is ready
  // Mark notification as read
  // const markAsReadMutation = useMutation({
  //   mutationFn: async (id: number) => {
  //     await apiClient.post(endpoints.notifications.markAsRead(id))
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['notifications'] })
  //   },
  // })

  const markAsRead = async (id: number) => {
    // TODO: Uncomment when API is ready
    // await markAsReadMutation.mutateAsync(id)

    // Mock implementation for now
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  // TODO: Uncomment when API is ready
  // Mark all notifications as read
  // const markAllAsReadMutation = useMutation({
  //   mutationFn: async () => {
  //     await apiClient.post(endpoints.notifications.markAllAsRead)
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['notifications'] })
  //   },
  // })

  const markAllAsRead = async () => {
    // TODO: Uncomment when API is ready
    // await markAllAsReadMutation.mutateAsync()

    // Mock implementation for now
    notifications.value.forEach((n) => {
      n.read = true
    })
  }

  // TODO: Uncomment when API is ready
  // Delete notification
  // const deleteNotificationMutation = useMutation({
  //   mutationFn: async (id: number) => {
  //     await apiClient.delete(endpoints.notifications.delete(id))
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['notifications'] })
  //   },
  // })

  const deleteNotification = async (id: number) => {
    // TODO: Uncomment when API is ready
    // await deleteNotificationMutation.mutateAsync(id)

    // Mock implementation for now
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  return {
    notifications: computed(() => notifications.value),
    unreadCount,
    isLoading: computed(() => false), // TODO: Change to notificationsQuery.isLoading.value when API is ready
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: async () => { }, // TODO: Change to notificationsQuery.refetch when API is ready
  }
}
