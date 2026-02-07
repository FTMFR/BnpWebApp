import { ref } from 'vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import type { AuditLogItem, AuditLogResponse } from './auditLogTypes'

const DEFAULT_PAGE_SIZE = 20

export function useAuditLogFailed() {
  const toastStore = useToastStore()
  const failedPageNumber = ref(1)
  const failedPageSize = ref(DEFAULT_PAGE_SIZE)
  const failedItems = ref<AuditLogItem[]>([])
  const failedTotalCount = ref(0)
  const failedTotalPages = ref(0)
  const failedLoading = ref(false)
  const failedError = ref<string | null>(null)

  async function fetchFailedLogins() {
    failedLoading.value = true
    failedError.value = null
    try {
      const response = await apiClient.get<AuditLogResponse>(endpoints.auditLog.failedLogins, {
        params: { pageNumber: failedPageNumber.value, pageSize: failedPageSize.value },
      })
      failedItems.value = response.data.Items ?? []
      failedTotalCount.value = response.data.TotalCount ?? 0
      failedTotalPages.value = response.data.TotalPages ?? 1
    } catch (err) {
      console.error('Failed to fetch failed logins:', err)
      failedError.value = 'بارگذاری لاگ‌های ورود ناموفق ناموفق بود.'
      toastStore.showToast(failedError.value, 'error')
      failedItems.value = []
      failedTotalCount.value = 0
      failedTotalPages.value = 1
    } finally {
      failedLoading.value = false
    }
  }

  function onFailedPageChange(page: number) {
    failedPageNumber.value = page
  }

  return {
    failedPageNumber,
    failedPageSize,
    failedItems,
    failedTotalCount,
    failedTotalPages,
    failedLoading,
    failedError,
    fetchFailedLogins,
    onFailedPageChange,
  }
}
