import { ref } from 'vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import type { AuditLogItem, AuditLogResponse } from './auditLogTypes'

const DEFAULT_SEARCH_PAGE_SIZE = 10
export const SEARCH_TERM_REQUIRED_MESSAGE = 'عبارت جستجو را وارد کنید.'

export function useAuditLogSearch() {
  const toastStore = useToastStore()
  const searchTerm = ref('')
  const searchTermError = ref<string | null>(null)
  const searchPageNumber = ref(1)
  const searchPageSize = ref(DEFAULT_SEARCH_PAGE_SIZE)
  const searchItems = ref<AuditLogItem[]>([])
  const searchTotalCount = ref(0)
  const searchTotalPages = ref(0)
  const searchLoading = ref(false)
  const searchError = ref<string | null>(null)

  function hasValidSearchTerm(): boolean {
    return !!searchTerm.value?.trim()
  }

  async function fetchSearch() {
    if (!hasValidSearchTerm()) return
    searchLoading.value = true
    searchError.value = null
    try {
      const params: Record<string, string | number> = {
        searchTerm: searchTerm.value!.trim(),
        pageNumber: searchPageNumber.value,
        pageSize: searchPageSize.value,
      }
      const response = await apiClient.get<AuditLogResponse>(endpoints.auditLog.search, { params })
      searchItems.value = response.data.Items ?? []
      searchTotalCount.value = response.data.TotalCount ?? 0
      searchTotalPages.value = response.data.TotalPages ?? 1
    } catch (err) {
      console.error('Failed to fetch audit log (search):', err)
      searchError.value = 'بارگذاری نتایج جستجو ناموفق بود.'
      toastStore.showToast(searchError.value, 'error')
      searchItems.value = []
      searchTotalCount.value = 0
      searchTotalPages.value = 1
    } finally {
      searchLoading.value = false
    }
  }

  function runSearch() {
    searchTermError.value = null
    if (!hasValidSearchTerm()) {
      searchTermError.value = SEARCH_TERM_REQUIRED_MESSAGE
      toastStore.showToast(SEARCH_TERM_REQUIRED_MESSAGE, 'warning')
      return
    }
    searchPageNumber.value = 1
    fetchSearch()
  }

  function onSearchPageChange(page: number) {
    searchPageNumber.value = page
  }

  return {
    searchTerm,
    searchTermError,
    searchPageNumber,
    searchPageSize,
    searchItems,
    searchTotalCount,
    searchTotalPages,
    searchLoading,
    searchError,
    fetchSearch,
    runSearch,
    hasValidSearchTerm,
    onSearchPageChange,
  }
}
