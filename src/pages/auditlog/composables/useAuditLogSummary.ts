import { ref } from 'vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { AuditLogResponse } from './auditLogTypes'

export function useAuditLogSummary() {
  const summaryTodayCount = ref<number | null>(null)
  const summaryFailedCount = ref<number | null>(null)
  const summaryLoading = ref(true)

  async function fetchSummaryCounts() {
    summaryLoading.value = true
    try {
      const [todayRes, failedRes] = await Promise.all([
        apiClient.get<AuditLogResponse>(endpoints.auditLog.today, { params: { pageNumber: 1, pageSize: 1 } }),
        apiClient.get<AuditLogResponse>(endpoints.auditLog.failedLogins, { params: { pageNumber: 1, pageSize: 1 } }),
      ])
      summaryTodayCount.value = todayRes.data.TotalCount ?? 0
      summaryFailedCount.value = failedRes.data.TotalCount ?? 0
    } catch {
      summaryTodayCount.value = null
      summaryFailedCount.value = null
    } finally {
      summaryLoading.value = false
    }
  }

  return {
    summaryTodayCount,
    summaryFailedCount,
    summaryLoading,
    fetchSummaryCounts,
  }
}
