import { ref } from 'vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import type { AuditLogItem, AuditLogResponse } from './auditLogTypes'

const PAGE_SIZE = 20

export function useAuditLogToday() {
  const toastStore = useToastStore()
  const todayPageNumber = ref(1)
  const todayItems = ref<AuditLogItem[]>([])
  const todayTotalCount = ref(0)
  const todayTotalPages = ref(0)
  const todayLoading = ref(false)
  const todayError = ref<string | null>(null)

  async function fetchToday() {
    todayLoading.value = true
    todayError.value = null
    try {
      const response = await apiClient.get<AuditLogResponse>(endpoints.auditLog.today, {
        params: { pageNumber: todayPageNumber.value, pageSize: PAGE_SIZE },
      })
      todayItems.value = response.data.Items ?? []
      todayTotalCount.value = response.data.TotalCount ?? 0
      todayTotalPages.value = response.data.TotalPages ?? 1
    } catch (err) {
      console.error('Failed to fetch today logs:', err)
      todayError.value = 'بارگذاری لاگ‌های امروز ناموفق بود.'
      toastStore.showToast(todayError.value, 'error')
      todayItems.value = []
      todayTotalCount.value = 0
      todayTotalPages.value = 1
    } finally {
      todayLoading.value = false
    }
  }

  function onTodayPageChange(page: number) {
    todayPageNumber.value = page
  }

  return {
    todayPageNumber,
    todayItems,
    todayTotalCount,
    todayTotalPages,
    todayLoading,
    todayError,
    fetchToday,
    onTodayPageChange,
  }
}
