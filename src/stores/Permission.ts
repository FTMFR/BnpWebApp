import apiClient from "@/shared/api/client"
import { endpoints } from "@/shared/api/endpoints"
import { defineStore } from "pinia"
import { ref } from "vue"

export const usePermissionsStore = defineStore('permissions', () => {
  const permissions = ref<string[]>([])
  const isLoading = ref(false)

  async function fetchPermissions() {
    // Avoid fetching if we already have them
    if (permissions.value.length > 0) return

    isLoading.value = true
    try {
      const response = await apiClient.get(endpoints.permissions.myPermissions)
      if (response.data && response.data.Permissions) {
        permissions.value = response.data.Permissions
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    } finally {
      isLoading.value = false
    }
  }

  function hasPermission(requiredPermission: string): boolean {
    return permissions.value.includes(requiredPermission)
  }

  return {
    permissions,
    isLoading,
    fetchPermissions,
    hasPermission,
  }
})
