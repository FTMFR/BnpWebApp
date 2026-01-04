import type { Router } from 'vue-router'
import type { MenuItem } from '@/design-system'
import { normalizePath } from '@/shared/composables/useMenu'
import { useMenuStore } from '@/stores/menu'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { ApiMenuItem } from '@/shared/api/types'


/**
 * Recursively find menu item by path in menu tree
 */
function findMenuItemByPath(path: string, items: MenuItem[]): MenuItem | null {
  const normalizedPath = normalizePath(path)

  for (const item of items) {
    if (item.href) {
      const normalizedHref = normalizePath(item.href)
      if (normalizedHref === normalizedPath) {
        return item
      }
    }

    if (item.children && item.children.length > 0) {
      const found = findMenuItemByPath(path, item.children)
      if (found) return found
    }
  }

  return null
}

/**
 * Check if user has access to a route based on menu items
 */
function hasRouteAccess(routePath: string, menuItems: MenuItem[]): boolean {
  if (!routePath || menuItems.length === 0) {
    return false
  }

  const found = findMenuItemByPath(routePath, menuItems)
  return found !== null
}

/**
 * Convert API menu item to MenuItem (same logic as in useMenu.ts)
 */
function convertApiMenuItemToMenuItem(apiItem: ApiMenuItem): MenuItem | null {
  const children = apiItem.Children
    ? apiItem.Children.map(convertApiMenuItemToMenuItem).filter((item): item is MenuItem => item !== null)
    : []

  if (!apiItem.Path && children.length === 0) {
    return null
  }

  return {
    id: apiItem.PublicId,
    label: apiItem.Title,
    icon: apiItem.Icon || undefined,
    href: apiItem.Path ? normalizePath(apiItem.Path) : undefined,
    children: children.length > 0 ? children : undefined,
  }
}

/**
 * Fetch menu items directly from API (without using composable)
 */
async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    const response = await apiClient.get<ApiMenuItem[]>(endpoints.menu.myTree)
    return response.data
      .map(convertApiMenuItemToMenuItem)
      .filter((item): item is MenuItem => item !== null)
  } catch (error) {
    console.error('Failed to fetch menu items:', error)
    return []
  }
}

/**
 * Setup menu permission guard for routes
 * This guard runs after auth guard to check if route exists in user's menu
 */
export function setupMenuPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // Route های همیشه قابل دسترس (auth routes, MFA routes, dashboard)
    const publicRoutes = [
      '/login',
      '/forgot-password',
      '/dashboard',
    ]

    // اگر route در لیست public routes باشد، اجازه ورود
    if (publicRoutes.includes(to.path)) {
      next()
      return
    }

    // برای سایر route ها، چک کردن در منوهای کاربر
    try {
      const menuStore = useMenuStore()

      // اگر منوها در store موجود هستند، از آن‌ها استفاده کن
      let menuItems: MenuItem[] = menuStore.menuItems

      // اگر منوها در store نیستند، از API بگیر
      if (menuItems.length === 0) {
        menuItems = await fetchMenuItems()
        // ذخیره در store برای استفاده بعدی
        if (menuItems.length > 0) {
          menuStore.setMenuItems(menuItems)
        }
      }

      // چک کردن در منوهای داینامیک
      const hasAccess = hasRouteAccess(to.path, menuItems)

      if (hasAccess) {
        next()
      } else {
        // User doesn't have access to this route, redirect to dashboard with error message
        console.warn(
          `Access denied: Route '${to.path}' is not in user's menu items. Redirecting to dashboard.`
        )

        // Show toast notification
        const { useToastStore } = await import('@/stores/toast')
        const toastStore = useToastStore()
        toastStore.showToast('شما دسترسی لازم برای مشاهده این صفحه را ندارید', 'error', 5000)

        next({
          name: 'dashboard',
        })
      }
    } catch (error) {
      console.error('Error checking menu permission:', error)
      // On error, allow access but log the error (you might want to handle this differently)
      next()
    }
  })
}

