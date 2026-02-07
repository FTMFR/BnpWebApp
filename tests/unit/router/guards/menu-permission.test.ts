import { describe, it, expect } from 'vitest'
import type { MenuItem } from '@/design-system'
import { findMenuItemByPath, hasRouteAccess } from '@/router/guards/menu-permission'

function item(id: string, href: string, children?: MenuItem[]): MenuItem {
  return { id, label: id, href, children }
}

describe('Menu Permission Guard (findMenuItemByPath, hasRouteAccess)', () => {
  const flatItems: MenuItem[] = [
    item('1', '/dashboard'),
    item('2', '/users/list'),
    item('3', '/grp/list'),
  ]

  const nestedItems: MenuItem[] = [
    item('1', '/dashboard'),
    item('2', '/users', [
      item('2a', '/users/list'),
      item('2b', '/users/create'),
    ]),
    item('3', '/grp/list'),
  ]

  describe('findMenuItemByPath', () => {
    it('should find item by exact path in flat list', () => {
      const found = findMenuItemByPath('/dashboard', flatItems)
      expect(found).not.toBeNull()
      expect(found!.id).toBe('1')
      expect(found!.href).toBe('/dashboard')
    })

    it('should find item when path has different case (normalized to lowercase)', () => {
      const found = findMenuItemByPath('/Dashboard', flatItems)
      expect(found).not.toBeNull()
      expect(found!.href).toBe('/dashboard')
    })

    it('should find nested item by path', () => {
      const found = findMenuItemByPath('/users/list', nestedItems)
      expect(found).not.toBeNull()
      expect(found!.id).toBe('2a')
      expect(found!.href).toBe('/users/list')
    })

    it('should find nested item at deeper level', () => {
      const deep: MenuItem[] = [
        item('a', '/menu', [
          item('b', '/menu/list', [
            item('c', '/menu/list/edit'),
          ]),
        ]),
      ]
      const found = findMenuItemByPath('/menu/list/edit', deep)
      expect(found).not.toBeNull()
      expect(found!.id).toBe('c')
    })

    it('should return null when path not in menu', () => {
      const found = findMenuItemByPath('/unknown', flatItems)
      expect(found).toBeNull()
    })

    it('should return null for empty items', () => {
      const found = findMenuItemByPath('/dashboard', [])
      expect(found).toBeNull()
    })

    it('should not match item without href', () => {
      const itemsWithNoHref: MenuItem[] = [
        { id: '1', label: 'Dashboard', href: undefined },
      ]
      const found = findMenuItemByPath('/dashboard', itemsWithNoHref)
      expect(found).toBeNull()
    })
  })

  describe('hasRouteAccess', () => {
    it('should return true when path exists in menu', () => {
      expect(hasRouteAccess('/dashboard', flatItems)).toBe(true)
      expect(hasRouteAccess('/users/list', flatItems)).toBe(true)
    })

    it('should return true when path exists in nested menu', () => {
      expect(hasRouteAccess('/users/list', nestedItems)).toBe(true)
      expect(hasRouteAccess('/users/create', nestedItems)).toBe(true)
    })

    it('should return false when path does not exist', () => {
      expect(hasRouteAccess('/unknown', flatItems)).toBe(false)
    })

    it('should return false for empty route path', () => {
      expect(hasRouteAccess('', flatItems)).toBe(false)
    })

    it('should return false for empty menu items', () => {
      expect(hasRouteAccess('/dashboard', [])).toBe(false)
    })
  })
})
