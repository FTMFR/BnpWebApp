import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'

/**
 * API returns { UserId, UserName, Permissions: string[] }.
 * Normalize to string array (accept also raw array or { permissions: string[] }).
 */
function normalizePermissionsResponse(data: unknown): string[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if ('Permissions' in obj && Array.isArray(obj.Permissions)) return obj.Permissions as string[]
    if ('permissions' in obj && Array.isArray(obj.permissions)) return obj.permissions as string[]
  }
  return []
}

export const usePermissionsStore = defineStore('permission', () => {
  const permissions = ref<string[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const hasPermission = (perm: string): boolean => {
    if (!perm) return false
    const lower = perm.toLowerCase()
    return permissions.value.some((p) => p.toLowerCase() === lower)
  }

  const fetchPermissions = async (): Promise<void> => {
    if (isLoading.value || permissions.value.length > 0) return
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.get<unknown>(endpoints.permissions.myPermissions)
      permissions.value = normalizePermissionsResponse(response.data)
    } catch (e) {
      console.error('Failed to fetch permissions:', e)
      error.value = e instanceof Error ? e.message : 'خطا در دریافت دسترسی‌ها'
      permissions.value = []
    } finally {
      isLoading.value = false
    }
  }

  /** Force refetch (e.g. after permission change). Clears cache then fetches. */
  const refetchPermissions = async (): Promise<void> => {
    permissions.value = []
    isLoading.value = false
    error.value = null
    await fetchPermissions()
  }

  const clearPermissions = (): void => {
    permissions.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    permissions,
    isLoading,
    error,
    hasPermission,
    fetchPermissions,
    refetchPermissions,
    clearPermissions,
  }
})
