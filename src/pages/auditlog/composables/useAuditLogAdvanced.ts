import { ref } from 'vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import type { AuditLogItem, AuditLogResponse } from './auditLogTypes'

const DEFAULT_PAGE_SIZE = 20

export function useAuditLogAdvanced() {
  const toastStore = useToastStore()
  const advancedPageNumber = ref(1)
  const advancedPageSize = ref(DEFAULT_PAGE_SIZE)
  const advancedItems = ref<AuditLogItem[]>([])
  const advancedTotalCount = ref(0)
  const advancedTotalPages = ref(0)
  const advancedLoading = ref(false)
  const advancedError = ref<string | null>(null)
  const auditFilters = ref({
    FromDate: '',
    ToDate: '',
    EventType: '',
    UserName: '',
    IpAddress: '',
    IsSuccess: '' as '' | 'true' | 'false',
    EntityType: '',
  })
  const eventTypes = ref<string[]>([])
  const eventTypesLoading = ref(false)

  async function fetchAdvanced() {
    advancedLoading.value = true
    advancedError.value = null
    try {
      const params: Record<string, string | number | boolean> = {
        PageNumber: advancedPageNumber.value,
        PageSize: advancedPageSize.value,
      }
      const f = auditFilters.value
      if (f.FromDate) params.FromDate = f.FromDate
      if (f.ToDate) params.ToDate = f.ToDate
      if (f.EventType) params.EventType = f.EventType
      if (f.UserName) params.UserName = f.UserName
      if (f.IpAddress) params.IpAddress = f.IpAddress
      if (f.EntityType) params.EntityType = f.EntityType
      if (f.IsSuccess === 'true') params.IsSuccess = true
      if (f.IsSuccess === 'false') params.IsSuccess = false

      const response = await apiClient.get<AuditLogResponse>(endpoints.auditLog.list, { params })
      advancedItems.value = response.data.Items ?? []
      advancedTotalCount.value = response.data.TotalCount ?? 0
      advancedTotalPages.value = response.data.TotalPages ?? 1
    } catch (err) {
      console.error('Failed to fetch audit log (advanced):', err)
      advancedError.value = 'بارگذاری لاگ‌ها ناموفق بود.'
      toastStore.showToast(advancedError.value, 'error')
      advancedItems.value = []
      advancedTotalCount.value = 0
      advancedTotalPages.value = 1
    } finally {
      advancedLoading.value = false
    }
  }

  function applyFilters() {
    advancedPageNumber.value = 1
    fetchAdvanced()
  }

  function clearFilters() {
    auditFilters.value = {
      FromDate: '',
      ToDate: '',
      EventType: '',
      UserName: '',
      IpAddress: '',
      IsSuccess: '',
      EntityType: '',
    }
    advancedPageNumber.value = 1
    fetchAdvanced()
  }

  async function fetchEventTypes() {
    eventTypesLoading.value = true
    try {
      const response = await apiClient.get<string[] | { eventTypes?: string[] }>(endpoints.auditLog.eventTypes)
      const data = response.data
      if (Array.isArray(data)) {
        eventTypes.value = data
      } else if (data && typeof data === 'object' && Array.isArray((data as { eventTypes?: string[] }).eventTypes)) {
        eventTypes.value = (data as { eventTypes: string[] }).eventTypes
      } else {
        eventTypes.value = []
      }
    } catch {
      eventTypes.value = []
    } finally {
      eventTypesLoading.value = false
    }
  }

  function onAdvancedPageChange(page: number) {
    advancedPageNumber.value = page
  }

  return {
    advancedPageNumber,
    advancedPageSize,
    advancedItems,
    advancedTotalCount,
    advancedTotalPages,
    advancedLoading,
    advancedError,
    auditFilters,
    eventTypes,
    eventTypesLoading,
    fetchAdvanced,
    applyFilters,
    clearFilters,
    fetchEventTypes,
    onAdvancedPageChange,
  }
}
