import { computed } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { normalizePath } from './useMenu'
import type { MenuItem } from '@/design-system'
import { usePermissionsStore } from '@/stores/Permission'

/**
 * Recursively find menu item by path in menu tree
 */
function findMenuItemByPath(path: string, items: MenuItem[]): MenuItem | null {
  // const normalizedPath = normalizePath(path)

  for (const item of items) {
    if (item.href) {
      // const normalizedHref = normalizePath(item.href)
      // if (normalizedHref === normalizedPath) {
        return item
      // }
    }

    if (item.children && item.children.length > 0) {
      const found = findMenuItemByPath(path, item.children)
      if (found) return found
    }
  }

  return null
}

/**
 * Composable to check if user has access to a route
 */
export function useRouteAccess() {
  const permissionsStore = usePermissionsStore()

  const hasAccess = (requiredPermissions: string | string[]) => {
    const perms = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]

    // اگر استور خالی است، سعی کن دسترسی‌ها را بگیری
    if (permissionsStore.permissions.length === 0 && !permissionsStore.isLoading) {
       permissionsStore.fetchPermissions()
    }

    // بررسی دسترسی با نادیده گرفتن بزرگی و کوچکی حروف (Case Insensitive)
    const result = perms.every((perm) =>
      permissionsStore.permissions.some(storePerm =>
        storePerm.toLowerCase() === perm.toLowerCase()
      )
    )

    // لاگ برای دیباگ کردن (می‌توانید بعداً حذف کنید)
    console.log('Checking access for:', perms)
    console.log('User permissions:', permissionsStore.permissions)
    console.log('Result:', result)

    return result
  }

  const hasAnyAccess = (requiredPermissions: string[]) => {
    if (permissionsStore.permissions.length === 0 && !permissionsStore.isLoading) {
       permissionsStore.fetchPermissions()
    }
    return requiredPermissions.some((perm) => permissionsStore.hasPermission(perm))
  }

  return {
    hasAccess,
    hasAnyAccess,
  }
}
