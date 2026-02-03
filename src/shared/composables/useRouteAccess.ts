import { usePermissionsStore } from '@/stores/permission'

/**
 * Composable for permission-based route and action access.
 * Expects permission names (e.g. 'Users.Read', 'Menu.Create'), not paths.
 */
export function useRouteAccess() {
  const permissionsStore = usePermissionsStore()

  /**
   * Check if user has all of the given permissions.
   * @param requiredPermissions - Single permission or array of permissions (e.g. 'Users.Read' or ['Users.Read', 'Users.Create'])
   */
  const hasAccess = (requiredPermissions: string | string[]): boolean => {
    const perms = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]
    if (perms.length === 0) return true

    if (permissionsStore.permissions.length === 0 && !permissionsStore.isLoading) {
      permissionsStore.fetchPermissions()
    }

    return perms.every((perm) =>
      permissionsStore.permissions.some(
        (storePerm) => storePerm.toLowerCase() === perm.toLowerCase()
      )
    )
  }

  /**
   * Check if user has at least one of the given permissions.
   */
  const hasAnyAccess = (requiredPermissions: string[]): boolean => {
    if (requiredPermissions.length === 0) return true
    if (permissionsStore.permissions.length === 0 && !permissionsStore.isLoading) {
      permissionsStore.fetchPermissions()
    }
    return requiredPermissions.some((perm) => permissionsStore.hasPermission(perm))
  }

  /**
   * Check if user has access to a route based on its meta.permissions.
   */
  const hasAccessToRoute = (route: { meta?: { permissions?: string[] } }): boolean => {
    const perms = route?.meta?.permissions
    if (!perms || !Array.isArray(perms) || perms.length === 0) return true
    return hasAccess(perms)
  }

  return {
    hasAccess,
    hasAnyAccess,
    hasAccessToRoute,
  }
}
