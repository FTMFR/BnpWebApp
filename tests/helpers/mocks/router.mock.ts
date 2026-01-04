import { vi } from 'vitest'
import type { Router } from 'vue-router'

/**
 * Creates a mock router for testing
 */
export function createMockRouter(): Router {
  const mockRouter = {
    push: vi.fn().mockResolvedValue(undefined),
    replace: vi.fn().mockResolvedValue(undefined),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: {
      value: {
        path: '/',
        name: 'home',
        params: {},
        query: {},
        meta: {},
        fullPath: '/',
        matched: [],
      },
    },
    options: {
      routes: [],
    },
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    beforeResolve: vi.fn(),
    onError: vi.fn(),
    isReady: vi.fn().mockResolvedValue(undefined),
    addRoute: vi.fn(),
    removeRoute: vi.fn(),
    hasRoute: vi.fn().mockReturnValue(false),
    getRoutes: vi.fn().mockReturnValue([]),
    resolve: vi.fn(),
  } as unknown as Router

  return mockRouter
}

/**
 * Helper to set current route in mock router
 */
export function setMockRoute(
  mockRouter: Router,
  route: {
    path?: string
    name?: string
    query?: Record<string, string>
    params?: Record<string, string>
  }
): void {
  Object.assign(mockRouter.currentRoute.value, {
    path: route.path || '/',
    name: route.name || 'home',
    query: route.query || {},
    params: route.params || {},
    fullPath: route.path || '/',
  })
}

