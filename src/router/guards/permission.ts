import type { Router } from 'vue-router'
import { usePermissionsStore } from '@/stores/permission'
import { useToastStore } from '@/stores/toast'

/**
 * Permission route guard.
 * Runs after auth guard.
 * - If meta.permissions is set: user must have ALL listed permissions.
 * - If meta.permissionsAny is set: user must have AT LEAST ONE of the listed permissions
 *   (use when backend may return different names for the same access, e.g. Menu.Read vs Menus.Read).
 */
export function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to, _, next) => {
    const permissions = to.meta.permissions as string[] | undefined
    const permissionsAny = to.meta.permissionsAny as string[] | undefined

    const checkAll = permissions && Array.isArray(permissions) && permissions.length > 0
    const checkAny = permissionsAny && Array.isArray(permissionsAny) && permissionsAny.length > 0

    if (!checkAll && !checkAny) {
      next()
      return
    }

    const permissionStore = usePermissionsStore()
    await permissionStore.fetchPermissions()

    let hasAccess: boolean
    if (checkAny) {
      hasAccess = permissionsAny!.some((p) => permissionStore.hasPermission(p))
    } else {
      hasAccess = permissions!.every((p) => permissionStore.hasPermission(p))
    }

    if (hasAccess) {
      next()
      return
    }

    const toastStore = useToastStore()
    toastStore.showToast('شما دسترسی لازم برای مشاهده این صفحه را ندارید', 'error', 5000)
    next({ name: 'dashboard' })
  })
}
