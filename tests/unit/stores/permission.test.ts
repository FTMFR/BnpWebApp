import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePermissionsStore } from '@/stores/permission'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'

vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('Permission Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('normalizePermissionsResponse (via fetchPermissions)', () => {
    it('should accept raw array from API', async () => {
      const perms = ['Users.Read', 'Groups.Read']
      vi.mocked(apiClient.get).mockResolvedValue({ data: perms } as any)

      const store = usePermissionsStore()
      await store.fetchPermissions()

      expect(store.permissions).toEqual(perms)
      expect(apiClient.get).toHaveBeenCalledWith(endpoints.permissions.myPermissions)
    })

    it('should accept object with Permissions (PascalCase)', async () => {
      const perms = ['Menus.Read', 'Menus.Update']
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { Permissions: perms },
      } as any)

      const store = usePermissionsStore()
      await store.fetchPermissions()

      expect(store.permissions).toEqual(perms)
    })

    it('should accept object with permissions (camelCase)', async () => {
      const perms = ['Permission.Read']
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { permissions: perms },
      } as any)

      const store = usePermissionsStore()
      await store.fetchPermissions()

      expect(store.permissions).toEqual(perms)
    })

    it('should return empty array for invalid or empty response', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: null } as any)

      const store = usePermissionsStore()
      await store.fetchPermissions()

      expect(store.permissions).toEqual([])
    })

    it('should return empty array for non-array Permissions', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { Permissions: 'not-an-array' },
      } as any)

      const store = usePermissionsStore()
      await store.fetchPermissions()

      expect(store.permissions).toEqual([])
    })
  })

  describe('hasPermission', () => {
    it('should return true when permission exists (exact match)', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: ['Users.Read'],
      } as any)

      const store = usePermissionsStore()
      await store.fetchPermissions()

      expect(store.hasPermission('Users.Read')).toBe(true)
    })

    it('should be case-insensitive', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: ['users.read'],
      } as any)

      const store = usePermissionsStore()
      await store.fetchPermissions()

      expect(store.hasPermission('Users.Read')).toBe(true)
      expect(store.hasPermission('USERS.READ')).toBe(true)
    })

    it('should return false for empty or missing permission string', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: ['Users.Read'],
      } as any)

      const store = usePermissionsStore()
      await store.fetchPermissions()

      expect(store.hasPermission('')).toBe(false)
      expect(store.hasPermission(null as any)).toBe(false)
    })

    it('should return false when permission is not in list', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: ['Users.Read'],
      } as any)

      const store = usePermissionsStore()
      await store.fetchPermissions()

      expect(store.hasPermission('Groups.Create')).toBe(false)
    })
  })

  describe('fetchPermissions', () => {
    it('should set loading state during fetch', async () => {
      let resolveFetch: (value: any) => void
      const fetchPromise = new Promise<any>((resolve) => {
        resolveFetch = resolve
      })
      vi.mocked(apiClient.get).mockReturnValue(fetchPromise)

      const store = usePermissionsStore()
      expect(store.isLoading).toBe(false)

      const fetchTask = store.fetchPermissions()
      expect(store.isLoading).toBe(true)

      resolveFetch!({ data: [] })
      await fetchTask

      expect(store.isLoading).toBe(false)
    })

    it('should not refetch if already loaded', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: ['A'] } as any)

      const store = usePermissionsStore()
      await store.fetchPermissions()
      expect(apiClient.get).toHaveBeenCalledTimes(1)

      await store.fetchPermissions()
      expect(apiClient.get).toHaveBeenCalledTimes(1)
    })

    it('should not refetch if already loading', async () => {
      let resolveFetch: (value: any) => void
      const fetchPromise = new Promise<any>((resolve) => {
        resolveFetch = resolve
      })
      vi.mocked(apiClient.get).mockReturnValue(fetchPromise)

      const store = usePermissionsStore()
      const p1 = store.fetchPermissions()
      const p2 = store.fetchPermissions()

      resolveFetch!({ data: [] })
      await Promise.all([p1, p2])

      expect(apiClient.get).toHaveBeenCalledTimes(1)
    })

    it('should set error and empty permissions on API failure', async () => {
      const err = new Error('Network error')
      vi.mocked(apiClient.get).mockRejectedValue(err)

      const store = usePermissionsStore()
      await store.fetchPermissions()

      expect(store.permissions).toEqual([])
      expect(store.error).toBe('Network error')
      expect(store.isLoading).toBe(false)
    })

    it('should set Persian error message for generic Error', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('fetch failed'))

      const store = usePermissionsStore()
      await store.fetchPermissions()

      expect(store.error).toBe('fetch failed')
    })
  })

  describe('clearPermissions', () => {
    it('should clear permissions, loading, and error', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: ['Users.Read'],
      } as any)

      const store = usePermissionsStore()
      await store.fetchPermissions()
      expect(store.permissions.length).toBeGreaterThan(0)

      store.clearPermissions()

      expect(store.permissions).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('should allow fetch after clear', async () => {
      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: ['A'] } as any)
        .mockResolvedValueOnce({ data: ['B', 'C'] } as any)

      const store = usePermissionsStore()
      await store.fetchPermissions()
      expect(store.permissions).toEqual(['A'])

      store.clearPermissions()
      await store.fetchPermissions()

      expect(store.permissions).toEqual(['B', 'C'])
    })
  })

  describe('refetchPermissions', () => {
    it('should clear then fetch again', async () => {
      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: ['First'] } as any)
        .mockResolvedValueOnce({ data: ['Second'] } as any)

      const store = usePermissionsStore()
      await store.fetchPermissions()
      expect(store.permissions).toEqual(['First'])

      await store.refetchPermissions()

      expect(store.permissions).toEqual(['Second'])
      expect(apiClient.get).toHaveBeenCalledTimes(2)
    })
  })
})
