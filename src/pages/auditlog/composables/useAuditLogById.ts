import { ref } from 'vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import type { AuditLogItem } from './auditLogTypes'

export function useAuditLogById() {
  const toastStore = useToastStore()
  const searchByIdInput = ref('')
  const byIdLoading = ref(false)
  const byIdError = ref<string | null>(null)
  const byIdResult = ref<AuditLogItem | null>(null)

  async function fetchById() {
    const id = searchByIdInput.value?.trim()
    if (!id) {
      toastStore.showToast('شناسه را وارد کنید.', 'warning')
      return
    }
    const numId = parseInt(id, 10)
    if (Number.isNaN(numId) || numId < 1) {
      toastStore.showToast('شناسه معتبر نیست.', 'warning')
      return
    }
    byIdLoading.value = true
    byIdError.value = null
    byIdResult.value = null
    try {
      const response = await apiClient.get(endpoints.auditLog.byId(numId))
      const data = response.data as Record<string, unknown>
      byIdResult.value = data as unknown as AuditLogItem
    } catch (err) {
      console.error('Failed to fetch audit log by id:', err)
      byIdError.value = 'لاگی با این شناسه یافت نشد.'
      toastStore.showToast(byIdError.value, 'error')
    } finally {
      byIdLoading.value = false
    }
  }

  function clearByIdSearch() {
    searchByIdInput.value = ''
    byIdError.value = null
    byIdResult.value = null
  }

  return {
    searchByIdInput,
    byIdLoading,
    byIdError,
    byIdResult,
    fetchById,
    clearByIdSearch,
  }
}
